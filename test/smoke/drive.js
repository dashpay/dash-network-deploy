const net = require('net');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { inventory } = getNetworkConfig();

const { getDocker, execCommand, getContainerId } = require('../../lib/test/docker');

const seedHosts = inventory.seed_nodes.hosts;
const masternodeHosts = inventory.masternodes.hosts;

describe('Drive', () => {
  describe('All nodes', () => {
    const echoInfo = {};
    const statusInfo = {};

    before('Collect echo info from Drive', async () => {
      const promises = [];

      for (const hostName of seedHosts) {
        const requestEchoPromise = sendEcho(inventory.meta.hostvars[hostName].public_ip)
          .then(() => {
            echoInfo[hostName] = true;
          })
          .catch((e) => {
            echoInfo[hostName] = e;
          });

        promises.push(requestEchoPromise);
      }

      const statusPromises = inventory.hp_masternodes.hosts.map(async (hostName) => {
        const docker = await getDocker(`http://${inventory.meta.hostvars[hostName].public_ip}`);
        const containerIp = await getContainerId(docker, 'dashmate_helper');

        statusInfo[hostName] = await execCommand(docker, containerIp,
          ['yarn', 'workspace', 'dashmate', 'dashmate', 'status', 'platform', '--format=json']);
      });

      return Promise.all([...promises, ...statusPromises]).catch(console.error);
    });

    for (const hostName of seedHosts) {
      describe(hostName, () => {
        it('should listen for ABCI connection', () => {
          if (echoInfo[hostName] !== true) {
            expect.fail(echoInfo[hostName]);
          }
        });
      });
    }

    for (const hostName of masternodeHosts) {
      describe(hostName, () => {
        it('drive status should be green', () => {
          const { drive } = statusInfo[hostName];

          expect(drive.dockerStatus).to.be.equal('running');
          expect(drive.serviceStatus).to.be.equal('up');
        });
      });
    }
  });
});
