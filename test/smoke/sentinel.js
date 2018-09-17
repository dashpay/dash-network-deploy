const SSH = require('simple-ssh');
const fs = require('fs');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const networkConfig = getNetworkConfig();

const utils = require('../testUtils');

describe('Sentinel', () => {
  networkConfig.inventory.masternodes.hosts.forEach((nodeName) => {
    it('should be running without errors', (done) => {
      const ssh = new SSH({
        host: networkConfig.inventory._meta.hostvars[nodeName].public_ip,
        user: 'ubuntu',
        key: fs.readFileSync(`${process.env.PRIVATE_KEY_PATH}`.replace('~', `${process.env.HOME}`)),
      });

      utils.echo(ssh, 'sudo docker logs --timestamps --since 5m `sudo docker ps -a -q --filter="name=mn_sentinel_sentinel"`', (err, data) => {
        if (err) {
          // handle potential err
          console.error(err.stack);
          done(new Error('Was not able to execute remote command successfully'));
        } else {
          console.log(data);
          if (data.length === 0) {
            done();
          } else {
            done(new Error('No errors expected'));
          }
        }
      });
    });
  });
});
