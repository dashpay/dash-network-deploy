const fs = require('fs').promises;
const path = require('path');

async function generateTerraformConfig(masternodesCount, fileName) {
  const config = {
    node_count: 1,
    miner_count: 1,
    masternode_count: masternodesCount,
  };

  let data = '# See all available options in `terraform/aws/variables.tf` file.\n';

  for (const [key, value] of Object.entries(config)) {
    data += `\n${key} = ${value}\n`;
  }

  await fs.writeFile(path.resolve(__dirname, '../../networks/', `${fileName}.tfvars`), data);
}

module.exports = generateTerraformConfig;
