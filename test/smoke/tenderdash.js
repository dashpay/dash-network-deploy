const getNetworkConfig = require('../../lib/test/getNetworkConfig');
const {
  createDocker,
  execJSONDockerCommand,
  execDockerCommand,
  getContainerId,
} = require('../../lib/test/docker');
const fetchPrometheusMetrics = require('../../lib/test/fetchPrometheusMetrics');

const { variables, inventory, network } = getNetworkConfig();

const evoMasternodes = inventory.hp_masternodes?.hosts ?? [];
const seedNodes = inventory.seed_nodes?.hosts ?? [];

describe('Tenderdash', () => {
  const errors = {};

  describe('Evo masternodes', () => {
    const currentTimeStrings = {};
    const tenderdashStatuses = {};

    before('Collect tenderdash info', function collect() {
      if (variables.dashmate_platform_enable === false) {
        this.skip('platform is disabled for this network');
      }

      this.timeout(40000); // set mocha timeout

      const promises = evoMasternodes
        .filter((hostName) => inventory.meta.hostvars[hostName])
        .map(async (hostName) => {
          try {
            const docker = createDocker(inventory.meta.hostvars[hostName].public_ip, {
              timeout: this.timeout() - 5000,
            });

            const containerId = await getContainerId(docker, 'dashmate_helper');

            currentTimeStrings[hostName] = await execDockerCommand(
              docker,
              containerId,
              ['date'],
            );

            const { result, error } = await execJSONDockerCommand(
              docker,
              containerId,
              [
                'curl',
                '--silent',
                '-X',
                'POST',
                '-H',
                'Content-Type: application/json',
                '-d',
                '{"jsonrpc":"2.0","id":"id","method":"status platform","params": {"format": "json"}}',
                'localhost:9000',
              ],
            );

            if (error) {
              // noinspection ExceptionCaughtLocallyJS
              throw new Error(error.message);
            }

            const status = JSON.parse(result);

            tenderdashStatuses[hostName] = status.tenderdash;
          } catch (e) {
            errors[hostName] = e;
          }
        });

      return Promise.all(promises);
    });

    for (const hostName of evoMasternodes) {
      // eslint-disable-next-line no-loop-func
      describe(hostName, () => {
        it('should be connected to the network', () => {
          if (errors[hostName]) {
            expect.fail(errors[hostName]);
          }

          if (!tenderdashStatuses[hostName]) {
            expect.fail('can\'t get tenderdash status');
          }

          let networkName = `dash-${network.name}`;
          if (variables.tenderdash_chain_id !== undefined) {
            networkName = `dash-${variables.tenderdash_chain_id}`;
          }

          expect(tenderdashStatuses[hostName].network).to.be.equal(networkName);
          expect(tenderdashStatuses[hostName].moniker).to.be.equal(hostName);
        });

        it('should be connected to peers', () => {
          if (errors[hostName]) {
            expect.fail(errors[hostName]);
          }

          if (!tenderdashStatuses[hostName]) {
            expect.fail('can\'t get tenderdash status');
          }

          expect(tenderdashStatuses[hostName]).to.have.property('listening', true);
          expect(tenderdashStatuses[hostName]).to.have.property('peers');
          expect(tenderdashStatuses[hostName].peers).to.be.greaterThan(0);
        });

        it('should sync blocks', () => {
          if (errors[hostName]) {
            expect.fail(errors[hostName]);
          }

          if (!tenderdashStatuses[hostName]) {
            expect.fail('can\'t get tenderdash status');
          }

          const latestBlockTime = new Date(tenderdashStatuses[hostName].latestBlockTime);

          const currentDate = new Date(currentTimeStrings[hostName]);
          const emptyBlockWindow = new Date(currentDate);
          emptyBlockWindow.setMinutes(currentDate.getMinutes() - 5);

          expect(latestBlockTime).to.be.within(emptyBlockWindow, currentDate);
        });
      });
    }
  });

  describe('Seed nodes', () => {
    const tenderdashMetrics = {};

    before('Collect tenderdash metrics', function collect() {
      if (variables.dashmate_platform_enable === false) {
        this.skip('platform is disabled for this network');
      }

      this.timeout(40000); // set mocha timeout

      const promises = seedNodes
        .filter((hostName) => inventory.meta.hostvars[hostName])
        .map(async (hostName) => {
          try {
            const host = inventory.meta.hostvars[hostName].public_ip;
            const port = 36660;
            const url = `http://${host}:${port}/metrics`;

            tenderdashMetrics[hostName] = await fetchPrometheusMetrics(url);
          } catch (e) {
            errors[hostName] = e;
          }
        });

      return Promise.all(promises);
    });

    for (const hostName of seedNodes) {
      // eslint-disable-next-line no-loop-func
      describe(hostName, () => {
        it('should be connected to the network', () => {
          if (errors[hostName]) {
            expect.fail(errors[hostName]);
          }

          if (!tenderdashMetrics[hostName]) {
            expect.fail('can\'t get tenderdash metrics');
          }

          const p2pMetrics = tenderdashMetrics.find((m) => m.name === 'drive_tenderdash_p2p_peers_connected');
          const chainId = p2pMetrics?.metrics[0]?.labels?.chain_id;

          if (!chainId) {
            expect.fail('can\'t get chain id from p2p metric');
          }

          let networkName = `dash-${network.name}`;
          if (variables.tenderdash_chain_id !== undefined) {
            networkName = `dash-${variables.tenderdash_chain_id}`;
          }

          expect(chainId).to.be.equal(networkName);
        });

        it('should be connected to peers', () => {
          if (errors[hostName]) {
            expect.fail(errors[hostName]);
          }

          if (!tenderdashMetrics[hostName]) {
            expect.fail('can\'t get tenderdash metrics');
          }

          const p2pMetrics = tenderdashMetrics.find((m) => m.name === 'drive_tenderdash_p2p_peers_connected');
          const value = p2pMetrics?.metrics[0]?.value;

          if (!value) {
            expect.fail('can\'t get number of peers from p2p metric');
          }

          expect(value).to.be.greaterThan(0);
        });
      });
    }
  });
});
