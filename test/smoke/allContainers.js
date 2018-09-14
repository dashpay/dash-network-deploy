const SSH = require('simple-ssh');
const fs = require('fs');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const networkConfig = getNetworkConfig();

const utils = require('../testUtils');

describe('Sentinel', () => {
  (networkConfig.inventory['faucet-wallet'].hosts
    .concat(networkConfig.inventory['full-nodes'].hosts)
    .concat(networkConfig.inventory['masternode-wallet'].hosts)
    .concat(networkConfig.inventory.masternodes.hosts)
    .concat(networkConfig.inventory.miners.hosts)
    .concat(networkConfig.inventory['seed-node'].hosts)
    .concat(networkConfig.inventory['wallet-nodes'].hosts)
    .concat(networkConfig.inventory.web.hosts))
    .forEach((nodeName) => {
    // Container should be running and the log should be empty
      it('should be running without errors', (done) => {
        console.log('verify containers on', networkConfig.inventory._meta.hostvars[nodeName].public_ip);
        const ssh = new SSH({
          host: networkConfig.inventory._meta.hostvars[nodeName].public_ip,
          user: 'ubuntu',
          key: fs
            .readFileSync(`${process.env.SSH_PRIVATE_KEY}`),
        // '/Users/andrei/.ssh/evo-app-deploy.rsa'),
        // SSH_PRIVATE_KEY
        });

        utils.echo(ssh, 'sudo docker ps --all --filter status=created --filter status=restarting '
        + '--filter status=removing --filter status=paused --filter status=exited '
        + '--filter status=dead', (err, data) => {
          if (err) {
          // handle potential err
            console.error(err.stack);
            done(new Error('Was not able to execute remote command successfully'));
          } else {
            console.log(data);
            if (data.trim()
              .split(/\r?\n/).length === 1) {
              done();
            } else {
              done(new Error('Some containers are in invalid state'));
            }
          }
        });
      });
    });
});
