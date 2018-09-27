const Docker = require('dockerode');
const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const networkConfig = getNetworkConfig();

describe('Sentinel', () => {
  networkConfig.inventory.masternodes.hosts.forEach((nodeName) => {
    describe(nodeName, () => {
      it('should be running without errors', async () => {
        const dockerode = new Docker({
          host: `http://${networkConfig.inventory._meta.hostvars[nodeName].public_ip}`,
          port: 2375,
        });
        const opts = { filters: '{"name": ["mn_sentinel_sentinel"]}' };
        const containers = await dockerode.listContainers(opts);
        expect(containers).to.have.lengthOf(1);
        expect(containers[0].State).to.be.equal('running'); // container is running
        const containerId = containers[0].Id;
        const stream = await dockerode.getContainer(containerId).logs(
          {
            stdout: true,
            stderr: true,
            follow: 0,
            since: (Math.floor(new Date() / 1000) - 300), // logs from last 5 mins
            timestamps: true,
          },
        );
        expect(stream).to.be.undefined();
      });
    });
  });
});
