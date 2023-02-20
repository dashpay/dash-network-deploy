const Docker = require('dockerode');
const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { inventory } = getNetworkConfig();

const allMasternodes = inventory.masternodes.hosts.concat(inventory.hp_masternodes.hosts);

describe('Sentinel', () => {
  describe('All nodes', () => {
    // Set up vars and functions to hold Sentinel responses
    const listContainers = {};
    const getContainer = {};

    before('Collect container list info', function func() {
      this.timeout(120000); // set mocha timeout

      const promises = [];

      for (const hostName of allMasternodes) {
        const timeout = 15000; // set individual docker client timeout
        const docker = new Docker({
          host: `http://${inventory.meta.hostvars[hostName].public_ip}`,
          port: 2375,
          timeout,
        });

        const options = {
          filters: JSON.stringify({
            name: ['sentinel'],
          }),
        };

        const requestListContainers = docker.listContainers(options)
          .then((result) => {
            listContainers[hostName] = result;
          })
          .then(() => docker.getContainer(listContainers[hostName][0].Id).logs({
            stdout: true,
            stderr: true,
            follow: 0,
            since: (Math.floor(new Date() / 1000) - 300), // logs from last 5 mins
            timestamps: true,
          }))
          .then((result) => {
            getContainer[hostName] = result.toString();
          })
          .catch(console.error);

        promises.push(requestListContainers);
      }

      return Promise.all(promises).catch(console.error);
    });

    for (const hostName of allMasternodes) {
      // eslint-disable-next-line no-loop-func
      describe(hostName, () => {
        it('should be running without errors', async () => {
          expect(listContainers[hostName]).to.have.lengthOf(1);
          expect(listContainers[hostName][0].State).to.be.equal('running');
          expect(getContainer[hostName]).to.be.empty();
        });
      });
    }
  });
});
