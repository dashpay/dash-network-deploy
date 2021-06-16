const fs = require('fs').promises;

async function generateTerraformConfig(network, networkName, masternodesCount) {
  const config = {
    node_count: 1,
    miner_count: 1,
    masternode_count: masternodesCount,
    main_domain: '"networks.dash.org"',
  };

  let data = '# See all available options in `terraform/aws/variables.tf` file.\n';

  for (const [key, value] of Object.entries(config)) {
    data += `\n${key} = ${value}\n`;
  }

  await fs.writeFile(`networks/${networkName}.tfvars`, data);
}

module.exports = generateTerraformConfig;
