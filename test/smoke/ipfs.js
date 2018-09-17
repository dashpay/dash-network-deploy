const ipfsAPI = require('ipfs-api');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const networkConfig = getNetworkConfig();

describe('IPFS', () => {
  // swarm peers
  networkConfig.inventory.masternodes.hosts.forEach((nodeName) => {
    it(nodeName, async () => {
      const ipfs = ipfsAPI(networkConfig.inventory._meta.hostvars[nodeName].public_ip, '5001', { protocol: 'http' });
      const peers = await ipfs.swarm.peers();
      expect(peers.length).to.be.equal(networkConfig.inventory.masternodes.hosts.length - 1);
    });
  });
});
