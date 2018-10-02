const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { variables } = getNetworkConfig();

describe('Drive', () => {
  if (!variables.evo_services) {
    this.skip('Evolution services are not enabled');
  }

  // getSyncStatus
  it('should respond current sync status');
});
