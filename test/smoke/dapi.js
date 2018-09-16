const DAPIClient = require('@dashevo/dapi-client');
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
      // getBlockHash height:1
      it('should respond data from chain', async () => {
        const blockHash = await dapi.getBlockHash(1);
        // const response = await utils.requestWrapper(`http://${networkConfig.inventory._meta.hostvars[nodeName].public_ip}:3001/insight-api-dash/block-index/1`);
        const resp = await fetch(`http://${networkConfig.inventory._meta.hostvars[nodeName].public_ip}:3001/insight-api-dash/block-index/1`)
          .then(res => res.text());
        const blockHashInsight = JSON.parse(resp).blockHash;
        expect(blockHash).to.be.an('string');
        expect(blockHash).to.be.equal(blockHashInsight);
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
