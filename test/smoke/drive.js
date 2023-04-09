const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { inventory, variables } = getNetworkConfig();

const { createDocker, execCommand, getContainerId } = require('../../lib/test/docker');

describe('Drive', () => {
  describe('HP masternodes', () => {
    const statusInfo = {};
    const statusError = {};

    before('Collect echo info from Drive', async function before() {
      if (variables.dashmate_platform_enable === false) {
        this.skip('platform is disabled for this network');
      }

      const statusPromises = inventory.hp_masternodes.hosts.map(async (hostName) => {
        const docker = createDocker(`http://${inventory.meta.hostvars[hostName].public_ip}`);

        let containerId;
        try {
          containerId = await getContainerId(docker, 'dashmate_helper');
        } catch (e) {
          statusError[hostName] = e;
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
              '{"jsonrpc":"2.0","id":"id","method":"status platform","params":{"format":"json"}}',
              'localhost:9000',
            ],
          );

          if (error) {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error(error.message);
          }

          statusInfo[hostName] = result;
        } catch (e) {
          statusError[hostName] = e;
        }
      });

      return Promise.all(statusPromises).catch(() => Promise.resolve());
    });

    for (const hostName of inventory.hp_masternodes.hosts) {
      describe(hostName, () => {
        it('drive status should be running and responding', () => {
          if (statusError[hostName]) {
            expect.fail(statusError[hostName]);
          }

          const { drive } = statusInfo[hostName];

          expect(drive.dockerStatus).to.be.equal('running');
          expect(drive.serviceStatus).to.be.equal('up');
        });
      });
    }
  });
});
