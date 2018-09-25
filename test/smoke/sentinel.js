const Docker = require('dockerode');
const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const networkConfig = getNetworkConfig();

describe('Sentinel', () => {
  networkConfig.inventory.masternodes.hosts.forEach((nodeName) => {
    it(`should be running without errors ${nodeName}`, async () => {
      const dockerode = new Docker({
        host: `http://${networkConfig.inventory._meta.hostvars[nodeName].public_ip}`,
        port: 2375,
      });
      const opts = { filters: '{"name": ["mn_sentinel_sentinel"]}' };
      const containers = await dockerode.listContainers(opts);
      expect(containers.length).to.be.equal(1);
      expect(containers[0].State).to.be.equal('running'); // container is running
      const containerId = containers[0].Id;
      await dockerode.getContainer(containerId)
        .logs({
          stdout: true,
          stderr: true,
          follow: 0,
          since: (Math.floor(new Date() / 1000) - 300), // logs from last 5 mins
          timestamps: true,
        })
        .then((error, stream) => {
          expect(error).to.be.equal('');
          expect(stream).to.be.equal(undefined);
        });
    });
  });
});
