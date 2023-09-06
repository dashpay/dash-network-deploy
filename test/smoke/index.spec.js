/* eslint-disable global-require */
describe('Smoke', () => {
  require('./core');
  require('./drive');
  require('./tenderdash');
  require('./dapi');
  require('./faucet');
  require('./insight');
  require('./elastic');
  require('./quorum');
});
