const { client: jaysonClient } = require('jayson/promise');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { variables, inventory } = getNetworkConfig();

const wait = require('../wait');

describe('Drive', () => {
  for (const hostName of inventory.masternodes.hosts) {
    describe(hostName, () => {
      let driveClient;

      beforeEach(() => {
        driveClient = jaysonClient.http({
          // eslint-disable-next-line no-underscore-dangle
          host: inventory._meta.hostvars[hostName].public_ip,
          port: 6000,
        });
      });

      it('should respond current sync status', async function it() {
        if (!variables.evo_services) {
          this.skip('Evolution services are not enabled');
          return;
        }

        const timeout = 1000;
        const attempts = 90;
 
        this.timeout((attempts + 10) * timeout);
        this.slow((attempts + 10) * timeout);

        for (let i = 0; i <= attempts; i++) {
          const { result: info, error } = await driveClient.request('getSyncInfo', {});

          if (error) {
              expect.fail(error.message);
          }

          if (info.status === 'synced') {
            return;
          }

          await wait(timeout);
        }

        expect.fail('drive is not synced');
      });
    });
  }
});
