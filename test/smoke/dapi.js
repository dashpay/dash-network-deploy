const DAPIClient = require('@dashevo/dapi-client');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { variables, inventory } = getNetworkConfig();

describe('DAPI', () => {
  for (const hostName of inventory.masternodes.hosts) {
    describe(hostName, () => {
      let dapiClient;

      beforeEach(() => {
        dapiClient = new DAPIClient();
      });

      it('should respond data from Core', async function it() {
        if (!variables.evo_services) {
          this.skip('Evolution services are not enabled');
          return;
        }

        this.slow(3000);

        const blockHashFromDapi = await dapiClient.core.getBestBlockHash({
          // eslint-disable-next-line no-underscore-dangle
          dapiAddresses: [`${inventory._meta.hostvars[hostName].public_ip}:${variables.dapi_port}`],
        });

        expect(blockHashFromDapi).to.be.a('string');
        expect(blockHashFromDapi).to.be.not.empty();
      });

      it('should respond data from Core using GRPC', async function it() {
        if (!variables.evo_services) {
          this.skip('Evolution services are not enabled');
          return;
        }

        this.slow(3000);

        const result = await dapiClient.core.getStatus({
          // eslint-disable-next-line no-underscore-dangle
          dapiAddresses: [`${inventory._meta.hostvars[hostName].public_ip}:${variables.dapi_grpc_port}`],
        });

        expect(result).to.have.a.property('version');
        expect(result).to.have.a.property('time');
        expect(result).to.have.a.property('status');
        expect(result).to.have.a.property('syncProgress');
        expect(result).to.have.a.property('chain');
        expect(result).to.have.a.property('masternode');
        expect(result).to.have.a.property('network');
      });

      it('should respond data from Platform', async function it() {
        if (!variables.evo_services) {
          this.skip('Evolution services are not enabled');
          return;
        }

        this.slow(3000);

        const unknownContractId = Buffer.alloc(32).fill(1);

        try {
          await dapiClient.platform.getDataContract(unknownContractId, {
            // eslint-disable-next-line no-underscore-dangle
            dapiAddresses: [`${inventory._meta.hostvars[hostName].public_ip}:${variables.dapi_grpc_port}`],
          });

          expect.fail('should respond not found');
        } catch (e) {
          // NOT_FOUND
          expect(e.code).to.be.equal(5);
        }
      });
    });
  }
});
