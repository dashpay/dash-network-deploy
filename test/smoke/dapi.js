const DAPIClient = require('@dashevo/dapi-client');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { variables, inventory } = getNetworkConfig();

describe('DAPI', () => {
  describe('All nodes', () => {
  // Set up vars and functions to hold DAPI responses
    const bestBlockHash = {};
    const status = {};
    const dataContract = {};
    const dataContractError = {};

    before('Collect blockhash, status and data contract info', function func() {
      this.timeout(60000); // set mocha timeout

      const promises = [];
      for (const hostName of inventory.masternodes.hosts) {
        const timeout = 15000; // set individual dapi client timeout
        const unknownContractId = Buffer.alloc(32).fill(1);

        const dapiClient = new DAPIClient({
          // eslint-disable-next-line no-underscore-dangle
          dapiAddresses: [`${inventory._meta.hostvars[hostName].public_ip}:${variables.dapi_port}`],
          timeout,
        });

        const requestBestBlockHash = dapiClient.core.getBestBlockHash()
          // eslint-disable-next-line no-loop-func
          .then((result) => {
            bestBlockHash[hostName] = result;
          });

        const requestStatus = dapiClient.core.getStatus()
          // eslint-disable-next-line no-loop-func
          .then((result) => {
            status[hostName] = result;
          });

        const requestDataContract = dapiClient.platform.getDataContract(unknownContractId)
          // eslint-disable-next-line no-loop-func
          .then((result) => {
            dataContract[hostName] = result;
          })
          .catch((e) => {
            dataContractError[hostName] = e;
          });

        promises.push(requestBestBlockHash, requestStatus, requestDataContract);
      }

      return Promise.all(promises).catch(() => Promise.resolve());
    });

    for (const hostName of inventory.masternodes.hosts) {
      describe(hostName, () => {
        it('should return data from Core', async () => {
          if (!bestBlockHash[hostName]) {
            expect.fail(null, null, 'no dapi info');
          }

          expect(bestBlockHash[hostName]).to.be.a('string');
          expect(bestBlockHash[hostName]).to.be.not.empty();
        });

        it('should return data from Core using gRPC', async () => {
          if (!bestBlockHash[hostName]) {
            expect.fail(null, null, 'no dapi info');
          }

          expect(status[hostName]).to.have.a.property('version');
          expect(status[hostName]).to.have.a.property('time');
          expect(status[hostName]).to.have.a.property('status');
          expect(status[hostName]).to.have.a.property('syncProgress');
          expect(status[hostName]).to.have.a.property('chain');
          expect(status[hostName]).to.have.a.property('masternode');
          expect(status[hostName]).to.have.a.property('network');
        });

        it('should return data from Platform', async () => {
          if (!dataContractError[hostName]) {
            expect.fail(null, null, 'no dapi error info');
          }

          expect(dataContract[hostName]).to.be.undefined();
          expect(dataContractError[hostName].code).to.be.equal(5);
        });
      });
    }
  });
});
