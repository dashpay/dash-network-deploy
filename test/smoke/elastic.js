const fetch = require('node-fetch');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { inventory, variables } = getNetworkConfig();

describe('Elastic', () => {
  for (const hostName of inventory.logs_nodes.hosts) {
    describe(hostName, () => {
      const logsUrl = `http://${inventory.meta.hostvars[hostName].public_ip}`;
      const elasticPort = 9200;
      const kibanaPort = 5601;

      const elasticHeaders = {
        headers: {
          Authorization: `Basic ${Buffer.from(`${variables.elastic_username}:${variables.elastic_password}`, 'binary').toString('base64')}`,
        },
      };

      it('should respond on API port', async () => {
        const response = await fetch(`${logsUrl}:${elasticPort}/_cluster/health`, elasticHeaders);
        const responseJson = await response.json();

        expect(response.status).to.be.equal(200);
        expect(responseJson.status).to.be.equal('green');
      });

      it('should respond on web port', async () => {
        const response = await fetch(`${logsUrl}:${kibanaPort}`);

        expect(response.status).to.be.equal(200);
      });
    });
  }
});
