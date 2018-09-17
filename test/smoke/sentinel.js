const SSH = require('simple-ssh');
const fs = require('fs');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const networkConfig = getNetworkConfig();

const utils = require('../testUtils');

describe('Sentinel', () => {
  networkConfig.inventory.masternodes.hosts.forEach((nodeName) => {
    it('should be running without errors', async () => {
      const ssh = new SSH({
        host: networkConfig.inventory._meta.hostvars[nodeName].public_ip,
        user: 'ubuntu',
        key: fs.readFileSync(`${process.env.PRIVATE_KEY_PATH}`.replace('~', `${process.env.HOME}`)),
      });
      const logs = await utils.echo(ssh, 'sudo docker logs --timestamps --since 5m `sudo docker ps -a -q --filter="name=mn_sentinel_sentinel"`');
      expect(logs.length).to.be.equal(0);
    });
  });
});
