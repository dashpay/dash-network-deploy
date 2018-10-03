const IpfsAPI = require('ipfs-api');
const multiaddr = require('multiaddr');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { variables, inventory } = getNetworkConfig();

describe('IPFS', () => {
  it('all nodes should be interconnected', async function it() {
    if (!variables.evo_services) {
      this.skip('Evolution services are not enabled');
      return;
    }

    const masterNodeHostNames = inventory.masternodes.hosts;

    this.slow(masterNodeHostNames.length * 1500);
    this.timeout(masterNodeHostNames.length * 2500);

    // eslint-disable-next-line arrow-body-style
    const masterNodeHosts = masterNodeHostNames.map((hostName) => {
      // eslint-disable-next-line no-underscore-dangle
      return inventory._meta.hostvars[hostName].public_ip;
    });

    const allPeers = new Set();
    for (const masterNodeHost of masterNodeHosts) {
      const ipfsApi = new IpfsAPI(masterNodeHost, '5001', { protocol: 'http' });

      const peers = await ipfsApi.swarm.peers();

      expect(peers.length).to.be.above(1, `IPFS node ${masterNodeHost} is not connected`);

      for (const peer of peers) {
        const { address } = multiaddr(peer.addr).nodeAddress();
        allPeers.add(address);
      }
    }

    expect(Array.from(allPeers).sort()).to.deep.equal(masterNodeHosts.sort());
  });
});
