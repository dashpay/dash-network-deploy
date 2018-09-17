const RpcClient = require('@dashevo/dashd-rpc/promise');
const fs = require('fs');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const networkConfig = getNetworkConfig();


describe('All nodes', () => {
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
  it('should have correct blockhash and blocks count', async () => {
    const hosts = networkConfig.inventory.masternodes.hosts;
    let blockCounts = [];
    for (let i = 0; i < hosts.length; i++) {
      const config = {
        protocol: 'http',
        user: 'dashrpc',
        pass: 'password',
        host: networkConfig.inventory._meta.hostvars[hosts[i]].public_ip,
        port: 20002,
      };
      const rpc = new RpcClient(config);

      const bestBlockHash = await rpc.getBestBlockHash();
      const blockCount = await rpc.getBlockCount();
      const blockchainInfo = await  rpc.getBlockchainInfo();
      expect(bestBlockHash.result)
        .to
        .be
        .equal(blockchainInfo.result.bestblockhash);
      expect(blockCount.result)
        .to
        .be
        .equal(blockchainInfo.result.blocks);
      blockCounts.push(blockCount.result);
    }
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
      it('should bmasternodes be enabled', async () => {
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
        user: 'dashrpc',
        pass: 'password',
        host: networkConfig.inventory._meta.hostvars[networkConfig.inventory.masternodes.hosts[0]].public_ip,
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
