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

      it('should respond via JSON RPC', async function it() {
        if (!variables.evo_services) {
          this.skip('Evolution services are not enabled');
          return;
        }

        const { error } = await driveClient.request('fetchContract', { contractId: 'wrong' });

        expect(error.code).to.equal(-32602);
      });
    });
  }
});
