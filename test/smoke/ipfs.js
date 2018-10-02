const IpfsAPI = require('ipfs-api');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { variables, inventory } = getNetworkConfig();

describe('IPFS', () => {
  if (!variables.evo_services) {
    this.skip('Evolution services are not enabled');
  }

  for (const hostName of inventory.masternodes.hosts) {
    describe(hostName, () => {
      let ipfsApi;

      beforeEach(() => {
        // eslint-disable-next-line no-underscore-dangle
        ipfsApi = new IpfsAPI(inventory._meta.hostvars[hostName].public_ip, '5001', { protocol: 'http' });
      });

      it('should be interconnected', async () => {
        const peers = await ipfsApi.swarm.peers();

        expect(peers).to.have.lengthOf(inventory.masternodes.hosts.length - 1);
      });
    });
  }
});
