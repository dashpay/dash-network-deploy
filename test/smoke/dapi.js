const DAPIClient = require('@dashevo/dapi-client');
const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const networkConfig = getNetworkConfig();

networkConfig.inventory.masternodes.hosts.forEach((nodeName) => {
  const options = {
    debug: false,
    verbose: false,
    errors: false,
    warnings: false,
    seeds: [{ ip: networkConfig.inventory._meta.hostvars[nodeName].public_ip }],
  };
  describe(`DAPI ${nodeName}`, () => {
    // getBlockHash height:1
    it('should respond data from chain', async () => {
      const dapi = new DAPIClient(options, 3000);
      const blockHash = await dapi.getBlockHash(1);
      expect(blockHash).to.be.an('string');
    });

    // getBestBlockHeight
    it('should respond data from insight', async () => {
      const dapi = new DAPIClient(options, 3000);
      const blockHeight = await dapi.getBestBlockHeight(1);
      expect(blockHeight).to.be.an('number');
      expect(blockHeight % 1).to.be.equal(0);
    });

    // fetchDapObjects any dapiId and type
    it('should respond data from drive', async () => {
      const dapi = new DAPIClient(options, 3000);
      const balance = await dapi.getBalance(`${networkConfig.variables.faucet_address}`);
      expect(balance).to.be.an('number');
      expect(balance % 1).to.be.equal(0);
    });
  });
});
