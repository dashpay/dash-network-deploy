const { client: jaysonClient } = require('jayson/promise');
const RpcClient = require('@dashevo/dashd-rpc/promise');
const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const networkConfig = getNetworkConfig();

describe('DAPI', () => {
  networkConfig.inventory.masternodes.hosts.forEach((nodeName) => {
    describe(nodeName, () => {
      const dapiClient = jaysonClient.http({
        host: networkConfig.inventory._meta.hostvars[nodeName].public_ip,
        port: 3000,
      });
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
        const { result } = await dapiClient.request('getBlockHash', { height: 1 });
        const blockHashRpc = await rpc.getBlockHash(1);
        expect(result).to.be.equal(blockHashRpc.result);
      });

      // getBestBlockHeight
      it('should respond data from insight', async () => {
        const { result } = await dapiClient.request('getBestBlockHeight', { blockHeight: 1 });
        expect(result).to.be.an('number');
        expect(result % 1).to.be.equal(0);
      });

      // getBalance from dapi
      it('should respond getBalance from drive', async () => {
        const { result } = await dapiClient.request('getBalance',
          { address: `${networkConfig.variables.faucet_address}` });
        expect(result).to.be.an('number');
        expect(result % 1).to.be.equal(0);
      });

      // fetchDapContract any dapiId and type
      xit('should respond fetchDapContract', async () => {
        // TODO fetchDapContract not implemented in dashdrve
        const { result } = await dapiClient.request('fetchDapContract', { dapId: "fakeDapId" });
        expect(result).to.be.an('json');
      });
    });
  });
});
