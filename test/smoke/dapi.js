const { client: jaysonClient } = require('jayson/promise');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');
const createRpcClientFromConfig = require('../../lib/test/createRpcClientFromConfig');

const { variables, inventory } = getNetworkConfig();


describe('DAPI', () => {
  for (const hostName of inventory.masternodes.hosts) {
    describe(hostName, () => {
      let dapiClient;
      let coreClient;

      beforeEach(() => {
        dapiClient = jaysonClient.http({
          // eslint-disable-next-line no-underscore-dangle
          host: inventory._meta.hostvars[hostName].public_ip,
          port: 3000,
        });
        coreClient = createRpcClientFromConfig(hostName);
      });

      it('should respond data from chain', async function it() {
        if (!variables.evo_services) {
          this.skip('Evolution services are not enabled');
          return;
        }

        this.slow(3000);

        const { result: blockHashFromDapi } = await dapiClient.request('getBlockHash', { height: 1 });
        const { result: blockHashFromCore } = await coreClient.getBlockHash(1);

        expect(blockHashFromDapi).to.be.equal(blockHashFromCore);
      });

      it('should respond data from insight', async function it() {
        if (!variables.evo_services) {
          this.skip('Evolution services are not enabled');
          return;
        }

        this.slow(1500);

        const { result } = await dapiClient.request('getBestBlockHeight', { blockHeight: 1 });

        expect(result).to.be.an('number');
        expect(result % 1).to.be.equal(0);
      });

      it('should respond data from drive', async function it() {
        if (!variables.evo_services) {
          this.skip('Evolution services are not enabled');
          return;
        }

        this.slow(3000);

        const { error } = await dapiClient.request('fetchContract', { contractId: 'fakeDapId' });

        // There are two expected codes:
        //   -32602 - Invalid contract ID
        //   100 - Initial sync in progress

        const message = `Invalid response from Drive: ${JSON.stringify(error)}`;

        expect(error.code).to.be.oneOf([-32602, 100], message);
      });
    });
  }
});
