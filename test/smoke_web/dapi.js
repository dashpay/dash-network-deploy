/* eslint-disable no-loop-func */
const DAPIClient = require('@dashevo/dapi-client');

// eslint-disable-next-line no-undef
const { config: { testVariables: { inventory, variables } } } = __karma__;

describe('DAPI', () => {
  for (const hostName of inventory.masternodes.hosts) {
    describe(hostName, () => {
      let dapiClient;

      before(() => {
        dapiClient = new DAPIClient();
        dapiClient.getGrpcUrl = function getGrpcUrl() {
          // eslint-disable-next-line no-underscore-dangle
          return `${inventory._meta.hostvars[hostName].public_ip}:${variables.dapi_port}`;
        };
      });

      it('should respond with a block for a selected height', async () => {
        const result = await dapiClient.getBlockByHeight(1);

        // TODO: check the result
      });
    });
  }
});
