const SSH = require('simple-ssh');
const fs = require('fs');
const utils = require('../testUtils');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const networkConfig = getNetworkConfig();


describe('Faucet', () => {
  networkConfig.inventory.masternodes.hosts.forEach((nodeName) => {
    it('should respond positive balance via insight and cli',
      async () => {
        const response = await utils.requestWrapper(`http://${networkConfig.inventory._meta.hostvars[nodeName].public_ip}:3001/insight-api-dash/addr/${networkConfig.variables.faucet_address}`);
        const body = JSON.parse(response.body);
        expect(body.balance).to.be.an('number');

        const ssh = new SSH({
          host: networkConfig.inventory._meta.hostvars['dashd-wallet-1'].public_ip,
          // pty: false,
          user: 'ubuntu',
          key: fs.readFileSync(`${process.env.SSH_PRIVATE_KEY}`),
        });
        const cli = await utils.echoP(ssh, `sudo -i dash-cli getaddressbalance '{"addresses": ["${networkConfig.variables.faucet_address}"]}'`);
        expect(Math.floor(body.balance * 100000000)).to.be.equal(JSON.parse(cli.replace(/\n$/, '')).balance);
      });
  });
});
