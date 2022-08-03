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
      console.log('collecting container info');
      const promises = [];
      for (const hostName of inventory.masternodes.hosts) {
        const timeout = 15000; // set individual docker client timeout
        // eslint-disable-next-line no-underscore-dangle
        console.log(`creating client for ${inventory._meta.hostvars[hostName].public_ip}`);
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
            console.log(`result received for ${hostName}`);
            listContainers[hostName] = result;
          })
          .catch((e) => {
            console.log(e);
          });

        promises.push(requestListContainers);
      }

      return Promise.all(promises).catch(() => Promise.resolve());
    });

    // before('Collect sentinel container info', function func() {
    //   this.timeout(60000);
    //   console.log('collecting logs info');

    //   const promises = [];
    //   for (const hostName of inventory.masternodes.hosts) {
    //     const docker = new Docker({
    //       // eslint-disable-next-line no-underscore-dangle
    //       host: `http://${inventory._meta.hostvars[hostName].public_ip}`,
    //       port: 2375,
    //     });
    //     console.log(`getting logs for ${docker.getContainer(listContainers[hostName][0].Id).id}`);
    //     const requestLogsStream = docker.getContainer(listContainers[hostName][0].Id).logs({
    //       stdout: true,
    //       stderr: true,
    //       follow: 0,
    //       since: (Math.floor(new Date() / 1000) - 300), // logs from last 5 mins
    //       timestamps: true,
    //     })
    //       .then((result) => {
    //         console.log(`logs received for ${hostName}`);
    //         getContainer[hostName] = result;
    //       });

    //     promises.push(requestLogsStream);
    //   }

    //   return Promise.all(promises).catch(() => Promise.resolve());
    // });

    for (const hostName of inventory.masternodes.hosts) {
      // eslint-disable-next-line no-loop-func
      describe(hostName, () => {
        it('should be running without errors', async () => {
          expect(listContainers[hostName]).to.have.lengthOf(1);
          expect(listContainers[hostName][0].State).to.be.equal('running');
          // console.log(getContainer[hostName].toString('utf8'));
          // expect(getContainer[hostName]).to.be.empty();
        });
      });
    }
  });
});
