const fetch = require('node-fetch');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { inventory } = getNetworkConfig();

describe('Faucet', () => {
  for (const hostName of inventory.web.hosts) {
    describe(hostName, () => {
      it('should respond positive balance', async () => {
        const response = await fetch(`http://${inventory.meta.hostvars[hostName].public_ip}/`);
        const faucetBalance = await response.text();

        const regex = 'Faucet balance: ([0-9,.]+)';
        const [, balanceString] = faucetBalance.match(regex);

        const balance = parseFloat(balanceString.replace(/,/g, ''));

        expect(balance).to.be.an('number').above(0);
      });
    });
  }
});
