const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const networkConfig = getNetworkConfig();

const fetch = require('node-fetch');

describe('Insight', () => {
  networkConfig.inventory.masternodes.hosts.forEach((nodeName) => {
    describe(nodeName, () => {
      it('should return block',
        async () => {
          const response = await fetch(`http://${networkConfig.inventory._meta.hostvars[nodeName].public_ip}:3001/insight-api-dash/blocks?limit=1`);
          const { blocks } = await response.json();
          expect(blocks).to.have.lengthOf(1);
        });

      it('should return master node list', async () => {
        const response = await fetch(`http://${networkConfig.inventory._meta.hostvars[nodeName].public_ip}:3001/insight-api-dash/masternodes/list`);
        const body = await response.json();
        expect(body).to.have.lengthOf(networkConfig.inventory.masternodes.hosts.length);
      });
    });
  });
});
