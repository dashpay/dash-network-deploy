const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const networkConfig = getNetworkConfig();

const utils = require('../testUtils');

describe('Insight', () => {
  networkConfig.inventory.masternodes.hosts.forEach((nodeName) => {
    it('should return block',
      async () => {
        const response = await utils.requestWrapper(`http://${networkConfig.inventory._meta.hostvars[nodeName].public_ip}:3001/insight-api-dash/blocks?limit=1`);// .then(function(response){
        const body = JSON.parse(response.body);
        expect(body.blocks.length).to.be.equal(1);
      });
  });

  networkConfig.inventory.masternodes.hosts.forEach((nodeName) => {
    it('should return master node list', async () => {
      const response = await utils.requestWrapper(`http://${networkConfig.inventory._meta.hostvars[nodeName].public_ip}:3001/insight-api-dash/masternodes/list`);
      const body = JSON.parse(response.body);
      expect(body.length).to.be.equal(networkConfig.inventory.masternodes.hosts.length);
    });
  });
});
