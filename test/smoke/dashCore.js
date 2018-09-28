const RpcClient = require('@dashevo/dashd-rpc/promise');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const networkConfig = getNetworkConfig();


describe('All nodes', () => {
  let nodeNames = networkConfig.inventory.masternodes.hosts;
  nodeNames = nodeNames.concat(networkConfig.inventory['wallet-nodes'].hosts);
  // TODO miner rpc call stuck. why?
  nodeNames = nodeNames.concat(networkConfig.inventory["miners"].hosts);
  nodeNames = nodeNames.concat(networkConfig.inventory['full-nodes'].hosts);
  nodeNames.forEach((nodeName) => {
    describe(nodeName, () => {
      const config = {
        protocol: 'http',
        user: networkConfig.variables.dashd_rpc_user,
        pass: networkConfig.variables.dashd_rpc_password,
        host: networkConfig.inventory._meta.hostvars[nodeName].public_ip,
        port: networkConfig.variables.dashd_rpc_port,
      };
      const rpc = new RpcClient(config);

      it('should have correct network type', async () => {
        const { result: { networkactive, subversion } } = await rpc.getNetworkInfo();
        expect(networkactive).to.be.equal(true);
        expect(subversion).to.have.string(`(${networkConfig.network.type}=${networkConfig.network.name})/`);
      });
    });
  });

  // The number of blocks should be almost the same (-3/+3) and block hash of particular
  // block height should be the same. Using `blocks`
  // and `bestblockhash` from `GetBlockChainInfo`.
  // Verify it on masternodes, wallet-nodes, full-nodes, miners
  it('should have correct blockhash and blocks count', async () => {
    const blockHashes = {};
    for (let i = 0; i < nodeNames.length; i++) {
      const config = {
        protocol: 'http',
        user: networkConfig.variables.dashd_rpc_user,
        pass: networkConfig.variables.dashd_rpc_password,
        host: networkConfig.inventory._meta.hostvars[nodeNames[i]].public_ip,
        port: networkConfig.variables.dashd_rpc_port,
      };
      const rpc = new RpcClient(config);
      const { result: { blocks, bestblockhash } } = await rpc.getBlockchainInfo();
      if (!blockHashes[blocks]) {
        blockHashes[blocks] = bestblockhash;
      }
      expect(blockHashes[blocks]).to.be.equal(bestblockhash);
    }
    const blocksCounts = Object.keys(blockHashes);
    expect(Math.max(...blocksCounts)
      - Math.min(...blocksCounts)).to.be.below(3);
  });
});

describe('Masternodes', () => {
  networkConfig.inventory.masternodes.hosts.forEach((nodeName) => {
    describe(nodeName, () => {
      const config = {
        protocol: 'http',
        user: networkConfig.variables.dashd_rpc_user,
        pass: networkConfig.variables.dashd_rpc_password,
        host: networkConfig.inventory._meta.hostvars[nodeName].public_ip,
        port: networkConfig.variables.dashd_rpc_port,
      };
      const rpc = new RpcClient(config);
      // masternode status
      it('should masternodes be enabled', async () => {
        const masternodelist = await rpc.masternodelist();
        const idNodes = Object.keys(masternodelist.result);
        const masterIps = [];
        for (let i = 0; i < idNodes.length; i++) {
          masterIps.push(masternodelist.result[idNodes[i]].address.split(':')[0]);
          expect(masternodelist.result[idNodes[i]].status).to.be.equal('ENABLED');
        }
        const masterIpsInv = [];
        for (const nName of networkConfig.inventory.masternodes.hosts) {
          masterIpsInv.push(networkConfig.inventory._meta.hostvars[nName].public_ip);
        }
        expect(masterIps.sort()).to.deep.equal(masterIpsInv.sort());
      });
    });
  });

  describe('Miners', () => {
    // waitfornewblock
    it('should mine blocks', async function () {
      const config = {
        protocol: 'http',
        user: networkConfig.variables.dashd_rpc_user,
        pass: networkConfig.variables.dashd_rpc_password,
        host: networkConfig.inventory._meta.hostvars[
          networkConfig.inventory.masternodes.hosts[0]].public_ip,
        port: networkConfig.variables.dashd_rpc_port,
      };
      const rpc = new RpcClient(config);
      this.timeout(160000);
      const { result } = await rpc.getBlockCount();
      const { result: { height } } = await rpc.waitForNewBlock();
      expect(result + 1).to.be.equal(height);
    });
  });
});
