const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { inventory, variables } = getNetworkConfig();

const { getDocker, execCommand, getContainerId } = require('../../lib/test/docker');

describe('Drive', () => {
  describe('HP masternodes', () => {
    const statusInfo = {};
    const statusError = {};

    before('Collect echo info from Drive', async function before() {
      if (variables.dashmate_platform_enable === false) {
        this.skip('platform is disabled for this network');
      }

      const statusPromises = inventory.hp_masternodes.hosts.map(async (hostName) => {
        let docker;
        try {
          docker = await getDocker(`http://${inventory.meta.hostvars[hostName].public_ip}`);
        } catch (e) {
          statusError[hostName] = e;

          throw e;
        }

        let containerId;
        try {
          containerId = await getContainerId(docker, 'dashmate_helper');
        } catch (e) {
          statusError[hostName] = e;

          throw e;
        }

        try {
          statusInfo[hostName] = await execCommand(docker, containerId,
            ['yarn', 'workspace', 'dashmate', 'dashmate', 'status', 'platform', '--format=json']);
        } catch (e) {
          statusError[hostName] = e;

          throw e;
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
