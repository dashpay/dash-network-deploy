const getNetworkConfig = require('../../lib/test/getNetworkConfig');
const { createDocker, execCommand, getContainerId } = require('../../lib/test/docker');

const { variables, inventory, network } = getNetworkConfig();

const dashmateHosts = inventory.hp_masternodes.hosts;

describe.only('Tenderdash', () => {
  const tenderdashStatuses = {};
  const errors = {};

  describe('HP and seed nodes', () => {
    before('Collect tenderdash info', function collect() {
      if (variables.dashmate_platform_enable === false) {
        this.skip('platform is disabled for this network');
      }

      const promises = dashmateHosts.map(async (hostName) => {
        const docker = createDocker(inventory.meta.hostvars[hostName].public_ip);

        let containerId;
        try {
          containerId = await getContainerId(docker, 'dashmate_helper');
        } catch (e) {
          errors[hostName] = e;
        }

        if (!containerId) {
          return;
        }

        try {
          const { result, error } = await execCommand(
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

      return Promise.all(promises).catch(() => Promise.resolve());
    });

    for (const hostName of dashmateHosts) {
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

          expect(latestBlockTime.getTime()).to.be.closeTo(Date.now(), 30 * 60 * 1000);
        });
      });
    }
  });
});
