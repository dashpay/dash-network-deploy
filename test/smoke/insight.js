const fetch = require('node-fetch');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { inventory } = getNetworkConfig();

describe('Insight', () => {
  for (const hostName of inventory.masternodes.hosts) {
    describe(hostName, () => {
      it('should return block',
        async () => {
          // eslint-disable-next-line no-underscore-dangle
          const url = `http://${inventory._meta.hostvars[hostName].public_ip}:3001`
                    + '/insight-api-dash/blocks?limit=1';

          const response = await fetch(url);
          const { blocks } = await response.json();

          expect(blocks).to.have.lengthOf(1);
        });
    });
  }
});
