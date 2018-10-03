const IpfsAPI = require('ipfs-api');
const multiaddr = require('multiaddr');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { variables, inventory } = getNetworkConfig();

describe('IPFS', () => {
  const allPeers = new Set();
  for (const hostName of inventory.masternodes.hosts) {
    describe(hostName, () => {
      let ipfsApi;

      beforeEach(() => {
        // eslint-disable-next-line no-underscore-dangle
        ipfsApi = new IpfsAPI(inventory._meta.hostvars[hostName].public_ip, '5001', { protocol: 'http' });
      });

      it('should be interconnected', async function it() {
        if (!variables.evo_services) {
          this.skip('Evolution services are not enabled');
          return;
        }

        this.slow(1500);

        const peers = await ipfsApi.swarm.peers();
        for (const peer of peers) {
          const ip = multiaddr(peer.addr).nodeAddress().address;
          allPeers.add(ip);
        }
        expect(peers.length).to.be.above(1, 'no peers for node');
      });
    });
  }
  describe('IPFS peers', () => {
    it('should all masternodes be in peers', async function it() {
      if (!variables.evo_services) {
        this.skip('Evolution services are not enabled');
        return;
      }

      const masterNodes = [];
      for (const hostName of inventory.masternodes.hosts) {
        // eslint-disable-next-line no-underscore-dangle
        masterNodes.push(inventory._meta.hostvars[hostName].private_ip);
      }
      expect(Array.from(allPeers).sort()).to.deep.equal(masterNodes.sort());
    });
  });
});
