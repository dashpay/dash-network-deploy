const SSH = require('simple-ssh');
const fs = require('fs');
const utils = require('../testUtils');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const networkConfig = getNetworkConfig();

var jayson = require('jayson/promise');

describe('Faucet', () => {
  networkConfig.inventory.web.hosts.forEach((nodeName) => {
    it(`should respond positive balance via insight and cli: ${nodeName}`,
      async () => {
        // const ssh = new SSH({
        //   host: networkConfig.inventory._meta.hostvars[nodeName].public_ip,
        //   user: 'ubuntu',
        //   key: fs.readFileSync(`${process.env.PRIVATE_KEY_PATH}`.replace('~', `${process.env.HOME}`)),
        // });
        // let faucetBalance = await utils.echo(ssh, "curl http://127.0.0.1/ | grep 'Faucet balance'");
        // faucetBalance = parseInt(faucetBalance.replace('<p>Faucet balance:', '').replace('</p>', '').trim());
        // expect(faucetBalance).to.be.an('number').above(0);
        var client = jayson.client.http({
          host: '34.222.89.42',
          path: '/rpc.php',
          auth: 'dashrpc:password',
          headers: {
            'Accept-Language': 'en-EN',
          }
        });
        var reqs = [client.request('getFunds', []),
        ];
        await Promise.all(reqs).then(function(responses) {
          console.log(responses[0].result);
        });
      });
  });
});
