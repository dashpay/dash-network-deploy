const RpcClient = require('@dashevo/dashd-rpc/promise');
const SSH = require('simple-ssh');
const fs = require('fs');
const utils = require('../testUtils');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const networkConfig = getNetworkConfig();

const config = {
  protocol: 'http',
  user: 'dashrpc',
  pass: 'password',
  host: networkConfig.inventory._meta.hostvars['masternode-1'].public_ip,
  port: 20002,
};

const rpc = new RpcClient(config);

describe('DashCore', () => {
  describe('All nodes', () => {
    it('should have correct network type/subversion from `getNetworkInfo`', async () => {
      const blockHash = await rpc.getNetworkInfo();
      const masternodelist = await rpc.masternodelist();
      const version = masternodelist.result[Object.keys(masternodelist.result)[0]].daemonversion;
      expect(blockHash.error).to.be.equal(null);
      expect(blockHash.result.networkactive).to.be.equal(true);
      expect(blockHash.result.subversion).to.be.equal(`/Dash Core:${version}(${networkConfig.network.type}=${networkConfig.network.name})/`);
    });


    // The number of blocks should be almost the same (-3/+3) and block hash of particular
    // block height should be the same. Using `blocks` and `bestblockhash` from `GetBlockChainInfo`.
    networkConfig.inventory.masternodes.hosts.forEach((nodeName) => {
      it('should have correct blockhash and blocks count', async () => {
        const bestBlockHash = await rpc.getBestBlockHash();
        const blockCount = await rpc.getBlockCount();
        const ssh = new SSH({
          host: networkConfig.inventory._meta.hostvars[nodeName].public_ip,
          user: 'ubuntu',
          key: fs.readFileSync(`${process.env.SSH_PRIVATE_KEY}`),
        });
        const getblockchaininfo = JSON.parse(await utils.echoP(ssh, 'sudo -i dash-cli getblockchaininfo'));
        expect(bestBlockHash.result).to.be.equal(getblockchaininfo.bestblockhash);
        expect(blockCount.result).to.be.equal(getblockchaininfo.blocks);
      });
    });
  });

  describe('Masternodes', () => {
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
      for (const nodeName of networkConfig.inventory.masternodes.hosts) {
        masterIpsInv.push(networkConfig.inventory._meta.hostvars[nodeName].public_ip);
      }
      expect(masterIps.sort()).to.deep.equal(masterIpsInv.sort());
    });
  });
  describe('Miners', () => {
    // waitfornewblock
    it('should mine blocks', async function () {
      this.timeout(150000);
      const blockCount = await rpc.getBlockCount();
      let newBlock = -1;
      while (newBlock.result !== (blockCount.result + 1)) {
        newBlock = await rpc.getBlockCount();
      }
    });
  });
});
