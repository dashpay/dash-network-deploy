const grpc = require('grpc');
const { promisify } = require('util');

const DAPIClient = require('@dashevo/dapi-client');

const { Client: HealthCheckClient } = require('grpc-health-check/health');
const {
  HealthCheckRequest,
  HealthCheckResponse: { ServingStatus: healthCheckStatuses },
} = require('grpc-health-check/v1/health_pb');

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
        expect(result).to.have.a.property('sync_progress');
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

        const result = await dapiClient.platform.getDataContract(unknownContractId, {
          // eslint-disable-next-line no-underscore-dangle
          dapiAddresses: [`${inventory._meta.hostvars[hostName].public_ip}:${variables.dapi_grpc_port}`],
        });

        expect(result).to.be.null();
      });

      it('should respond data from TxFilterStream GRPC service', async () => {
        const healthClient = new HealthCheckClient(
          // eslint-disable-next-line no-underscore-dangle
          `${inventory._meta.hostvars[hostName].public_ip}:${variables.dapi_grpc_port}`,
          grpc.credentials.createInsecure(),
        );

        const checkHealth = promisify(healthClient.check).bind(healthClient);

        const request = new HealthCheckRequest();
        request.setService('HealthCheck');

        const response = await checkHealth(request);

        expect(response.getStatus()).to.equal(healthCheckStatuses.SERVING);
      });
    });
  }
});
