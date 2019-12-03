const Docker = require('dockerode');
const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { inventory } = getNetworkConfig();

describe.skip('Sentinel', () => {
  for (const hostName of inventory.masternodes.hosts) {
    describe(hostName, () => {
      it('should be running without errors', async function it() {
        this.slow(2000);

        const docker = new Docker({
          // eslint-disable-next-line no-underscore-dangle
          host: `http://${inventory._meta.hostvars[hostName].public_ip}`,
          port: 2375,
        });

        const options = {
          filters: JSON.stringify({
            name: ['sentinel'],
          }),
        };

        const containers = await docker.listContainers(options);

        expect(containers).to.have.lengthOf(1);
        expect(containers[0].State).to.be.equal('running');

        const stream = await docker.getContainer(containers[0].Id).logs({
          stdout: true,
          stderr: true,
          follow: 0,
          since: (Math.floor(new Date() / 1000) - 300), // logs from last 5 mins
          timestamps: true,
        });

        expect(stream).to.be.empty();
      });
    });
  }
});
