const Docker = require('dockerode');
const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { inventory } = getNetworkConfig();

describe('Sentinel', () => {
  describe('All nodes', () => {
    // Set up vars and functions to hold Sentinel responses
    const listContainers = {};
    const getContainer = {};

    before('Collect container list info', function func() {
      this.timeout(120000); // set mocha timeout

      const promises = [];

      function requestLogsStream(docker, hostName) {
        return docker.getContainer(listContainers[hostName][0].Id).logs({
          stdout: true,
          stderr: true,
          follow: 0,
          since: (Math.floor(new Date() / 1000) - 300), // logs from last 5 mins
          timestamps: true,
        });
      }

      for (const hostName of inventory.masternodes.hosts) {
        const timeout = 15000; // set individual docker client timeout
        const docker = new Docker({
          // eslint-disable-next-line no-underscore-dangle
          host: `http://${inventory._meta.hostvars[hostName].public_ip}`,
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
          .then(() => requestLogsStream(docker, hostName))
          .then((result) => {
            getContainer[hostName] = result.toString();
          })
          .catch(() => {});

        promises.push(requestListContainers);
      }

      return Promise.all(promises).catch(() => Promise.resolve());
    });

    for (const hostName of inventory.masternodes.hosts) {
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
