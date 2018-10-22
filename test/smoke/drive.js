const { client: jaysonClient } = require('jayson/promise');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { variables, inventory } = getNetworkConfig();

const wait = require('..//wait');

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

        this.timeout(100000);
        this.slow(100000);

        const time = Date.now() + 90000;
        while (time > Date.now()) {
          const { result: info } = await driveClient.request('getSyncInfo', {});
          if (info.status === 'synced') {
            expect(info).to.have.property('lastSyncedBlockHeight');
            return;
          }
          await wait(1000);
        }
        expect.fail('drive not synced');
      });
    });
  }
});
