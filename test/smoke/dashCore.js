describe('DashCore', () => {
  describe('All nodes', () => {
    // `subversion` from `getNetworkInfo` response.
    it('should have correct network type');

    // The number of blocks should be almost the same (-3/+3) and block hash of particular
    // block height should be the same. Using `blocks` and `bestblockhash` from `GetBlockChainInfo`.
    it('should propagate blocks');
  });
  describe('Masternodes', () => {
    // masternode status
    it('should be masternodes');
  });
  describe('Miners', () => {
    // waitfornewblock
    it('should mine blocks');
  });
});
