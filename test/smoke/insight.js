const fetch = require('node-fetch');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { inventory, variables } = getNetworkConfig();

describe('Insight', () => {
  for (const hostName of inventory.web.hosts) {
    describe(hostName, () => {
      const insightUrl = `http://${inventory.meta.hostvars[hostName].public_ip}`
                          + `:${variables.insight_port}`;

      it('should respond UI', async () => {
        const response = await fetch(`${insightUrl}/insight`);

        expect(response.status).to.be.equal(200);
      });

      it('should return block via API', async function it() {
        this.slow(1500);

        const response = await fetch(`${insightUrl}/insight-api/blocks?limit=1`);
        const { blocks } = await response.json();

        expect(blocks).to.have.lengthOf(1);
      });
    });
  }
});
