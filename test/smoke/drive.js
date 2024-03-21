const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { inventory, variables } = getNetworkConfig();

const { createDocker, execJSONDockerCommand, getContainerId } = require('../../lib/test/docker');

const evoNodes = inventory?.hp_masternodes?.hosts || [];

describe('Drive', () => {
  describe('Evo masternodes', () => {
    const statusInfo = {};
    const statusError = {};

    before('Collect echo info from Drive', async function before() {
      if (variables.dashmate_platform_enable === false) {
        this.skip('platform is disabled for this network');
      }

      this.timeout(40000); // set mocha timeout

      const statusPromises = evoNodes
        .filter((hostName) => inventory.meta.hostvars[hostName])
        .map(async (hostName) => {
          try {
            const docker = createDocker(`http://${inventory.meta.hostvars[hostName].public_ip}`, {
              timeout: this.timeout() - 5000,
            });

            const containerId = await getContainerId(docker, 'dashmate_helper');

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
                '{"jsonrpc":"2.0","id":"id","method":"status platform","params":{"format":"json"}}',
                'localhost:9000',
              ],
            );

            if (error) {
              // noinspection ExceptionCaughtLocallyJS
              throw new Error(error.message);
            }

            statusInfo[hostName] = JSON.parse(result);
          } catch (e) {
            statusError[hostName] = e;
          }
        });

      return Promise.all(statusPromises);
    });

    for (const hostName of evoNodes) {
      describe(hostName, () => {
        it('drive status should be running and responding', () => {
          if (statusError[hostName]) {
            expect.fail(statusError[hostName]);
          }

          if (!statusInfo[hostName]) {
            expect.fail('no status info');
          }

          const { drive } = statusInfo[hostName];

          expect(drive.dockerStatus).to.be.equal('running');
          expect(drive.serviceStatus).to.be.equal('up');
        });
      });
    }
  });
});
