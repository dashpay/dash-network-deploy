const { client: jaysonClient } = require('jayson/promise');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { variables, inventory } = getNetworkConfig();

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

        this.slow(1000);

        const { result: info } = await driveClient.request('getSyncInfo', {});

        expect(info).to.have.property('lastSyncedBlockHeight');
      });
    });
  }
});
