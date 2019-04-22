const fetch = require('node-fetch');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { inventory, variables } = getNetworkConfig();

describe('Insight API', () => {
  for (const hostName of inventory.masternodes.hosts) {
    describe(hostName, () => {
      it('should return block', async function it() {
        this.slow(1500);

        // eslint-disable-next-line no-underscore-dangle
        const url = `http://${inventory._meta.hostvars[hostName].public_ip}:${variables.insight_port}`
          + '/insight-api/blocks?limit=1';

        const response = await fetch(url);
        const { blocks } = await response.json();

        expect(blocks).to.have.lengthOf(1);
      });
    });
  }
});
