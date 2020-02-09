const grpc = require('grpc');
const { promisify } = require('util');

const DAPIClient = require('@dashevo/dapi-client');

const { Client: HealthCheckClient } = require('grpc-health-check/health');
const {
  HealthCheckRequest,
  HealthCheckResponse: { ServingStatus: healthCheckStatuses },
} = require('grpc-health-check/v1/health_pb');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');
const createRpcClientFromConfig = require('../../lib/test/createRpcClientFromConfig');

const { variables, inventory } = getNetworkConfig();

describe.only('DAPI', () => {
  for (const hostName of inventory.masternodes.hosts) {
    describe(hostName, () => {
      let dapiClient;
      let coreClient;

      beforeEach(() => {
        dapiClient = new DAPIClient();
        dapiClient.getGrpcUrl = function getGrpcUrl() {
          // eslint-disable-next-line no-underscore-dangle
          return `${inventory._meta.hostvars[hostName].public_ip}:${variables.dapi_port}`;
        };

        coreClient = createRpcClientFromConfig(hostName);
      });

      it('should respond data from Core', async function it() {
        if (!variables.evo_services) {
          this.skip('Evolution services are not enabled');
          return;
        }

        this.slow(3000);

        const blockHashFromDapi = await dapiClient.getBestBlockHash();
        const { result: blockHashFromCore } = await coreClient.getBlockHash(1);

        expect(blockHashFromDapi).to.be.equal(blockHashFromCore);
      });

      it('should respond data from Platform', async function it() {
        if (!variables.evo_services) {
          this.skip('Evolution services are not enabled');
          return;
        }

        this.slow(3000);

        const dataContract = await dapiClient.getDataContract('unknownContractId');

        expect(dataContract).to.not.exist();
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
