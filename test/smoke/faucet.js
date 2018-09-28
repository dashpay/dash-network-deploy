const fetch = require('node-fetch');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const networkConfig = getNetworkConfig();

describe('Faucet', () => {
  networkConfig.inventory.web.hosts.forEach((nodeName) => {
    describe(nodeName, () => {
      it('should respond positive balance',
        async () => {
          const response = await fetch(`http://${networkConfig.inventory._meta.hostvars[nodeName].public_ip}/`);
          const faucetBalance = await response.text();
          const regex = 'Faucet balance: ([0-9,.]+)';
          const result = faucetBalance.match(regex);
          expect(parseFloat(result[1].replace(/,/g, ''))).to.be.an('number').above(0);
        });
    });
  });
});
