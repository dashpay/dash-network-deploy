const DAPIClient = require('@dashevo/dapi-client');
const RpcClient = require('@dashevo/dashd-rpc/promise');
const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const networkConfig = getNetworkConfig();

const fetch = require('node-fetch');

describe('DAPI', () => {
  networkConfig.inventory.masternodes.hosts.forEach((nodeName) => {
    describe(`DAPI ${nodeName}`, () => {
      const options = {
        debug: false,
        verbose: false,
        errors: false,
        warnings: false,
        seeds: [{ ip: networkConfig.inventory._meta.hostvars[nodeName].public_ip }],
      };
      const dapi = new DAPIClient(options, 3000);
      const config = {
        protocol: 'http',
        user: 'dashrpc',
        pass: 'password',
        host: networkConfig.inventory._meta.hostvars[nodeName].public_ip,
        port: 20002,
      };
      const rpc = new RpcClient(config);
      // getBlockHash height:1
      it('should respond data from chain', async () => {
        const blockHash = await dapi.getBlockHash(1);
        const blockHashRpc = await rpc.getBlockHash(1);
        expect(blockHash).to.be.an('string');
        expect(blockHash).to.be.equal(blockHashRpc.result);
      });

      // getBestBlockHeight
      it('should respond data from insight', async () => {
        const blockHeight = await dapi.getBestBlockHeight(1);
        expect(blockHeight).to.be.an('number');
        expect(blockHeight % 1).to.be.equal(0);
      });

      // fetchDapObjects any dapiId and type
      it('should respond data from drive', async () => {
        const balance = await dapi.getBalance(`${networkConfig.variables.faucet_address}`);
        expect(balance).to.be.an('number');
        expect(balance % 1).to.be.equal(0);
      });
    });
  });
});
