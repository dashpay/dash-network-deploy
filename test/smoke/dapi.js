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

        dapiClient.MNDiscovery.getRandomMasternode = async function getRandomMasternode() {
          return {
            // eslint-disable-next-line no-underscore-dangle
            service: `${inventory._meta.hostvars[hostName].public_ip}:${variables.dapi_port}`,
          };
        };

        const blockHashFromDapi = await dapiClient.getBestBlockHash();

        expect(blockHashFromDapi).to.be.a('string');
        expect(blockHashFromDapi).to.be.not.empty();
      });

      it('should respond data from Platform', async function it() {
        if (!variables.evo_services) {
          this.skip('Evolution services are not enabled');
          return;
        }

        this.slow(3000);

        dapiClient.getGrpcUrl = function getGrpcUrl() {
          // eslint-disable-next-line no-underscore-dangle
          return `${inventory._meta.hostvars[hostName].public_ip}:${variables.dapi_grpc_port}`;
        };

        try {
          await dapiClient.getDataContract('unknownContractId');

          expect.fail('Contract not found error is not thrown');
        } catch (e) {
          expect(e.message).to.equal('3 INVALID_ARGUMENT: Invalid argument: Contract not found');
        }
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
