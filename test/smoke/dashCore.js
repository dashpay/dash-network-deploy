const RpcClient = require('@dashevo/dashd-rpc/promise');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const networkConfig = getNetworkConfig();


describe('All nodes', () => {
  let nodeNames = networkConfig.inventory.masternodes.hosts;
  nodeNames = nodeNames.concat(networkConfig.inventory['wallet-nodes'].hosts);
  // TODO miner rpc call stuck. why?
  // nodeNames = nodeNames.concat(networkConfig.inventory['miners'].hosts);
  nodeNames = nodeNames.concat(networkConfig.inventory['full-nodes'].hosts);
  nodeNames.forEach((nodeName) => {
    describe(nodeName, () => {
      const config = {
        protocol: 'http',
        user: 'dashrpc',
        pass: 'password',
        host: networkConfig.inventory._meta.hostvars[nodeName].public_ip,
        port: 20002,
      };
      const rpc = new RpcClient(config);

      it('should have correct network type', async () => {
        const networkInfo = await rpc.getNetworkInfo();
        expect(networkInfo.error).to.be.equal(null);
        expect(networkInfo.result.networkactive).to.be.equal(true);
        expect(networkInfo.result.subversion).to.have.string(`(${networkConfig.network.type}=${networkConfig.network.name})/`);
      });
    });
  });

  // The number of blocks should be almost the same (-3/+3) and block hash of particular
  // block height should be the same. Using `blocks`
  // and `bestblockhash` from `GetBlockChainInfo`.
  // Verify it on masternodes, wallet-nodes, full-nodes, miners
  it('should have correct blockhash and blocks count', async () => {
    const blockCounts = [];
    const blockhashes = {};
    let blockchainInfo;
    for (let i = 0; i < nodeNames.length; i++) {
      const config = {
        protocol: 'http',
        user: 'dashrpc',
        pass: 'password',
        host: networkConfig.inventory._meta.hostvars[nodeNames[i]].public_ip,
        port: 20002,
      };
      const rpc = new RpcClient(config);
      const blockCount = await rpc.getBlockCount();
      blockchainInfo = await rpc.getBlockchainInfo();
      blockCounts.push(blockCount.result);
      if (!blockhashes[blockchainInfo.result.blocks]) {
        blockhashes[blockchainInfo.result.blocks] = blockchainInfo.result.bestblockhash;
      }
    }
    expect(blockhashes[blockchainInfo.result.blocks]).to.be.equal(
      blockchainInfo.result.bestblockhash,
    );
    expect(Math.max(...blockCounts) - Math.min(...blockCounts)).to.be.below(3);
  });
});

describe('Masternodes', () => {
  networkConfig.inventory.masternodes.hosts.forEach((nodeName) => {
    describe(nodeName, () => {
      const config = {
        protocol: 'http',
        user: 'dashrpc',
        pass: 'password',
        host: networkConfig.inventory._meta.hostvars[nodeName].public_ip,
        port: 20002,
      };
      const rpc = new RpcClient(config);
      // masternode status
      it('should masternodes be enabled', async () => {
        const masternodelist = await rpc.masternodelist();
        console.log(masternodelist);
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
        user: 'dashrpc',
        pass: 'password',
        host: networkConfig.inventory._meta.hostvars[
          networkConfig.inventory.masternodes.hosts[0]].public_ip,
        port: 20002,
      };
      const rpc = new RpcClient(config);
      this.timeout(160000);
      const blockCount = await rpc.getBlockCount();
      let newBlock = -1;
      while (newBlock.result !== (blockCount.result + 1)) {
        newBlock = await rpc.getBlockCount();
      }
    });
  });
});
