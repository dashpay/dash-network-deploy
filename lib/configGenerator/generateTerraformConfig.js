const fs = require('fs').promises;

async function generateTerraformConfig(network, networkName, masternodesCount) {
  const config = {
    miner_count: 1,
    logs_count: 1,
    masternode_count: masternodesCount,
    main_domain: '""',
  };

  let data = '# See all available options in `terraform/aws/variables.tf` file.\n';

  for (const [key, value] of Object.entries(config)) {
    data += `\n${key} = ${value}\n`;
  }

  await fs.mkdir(`networks/${networkName}`, { recursive: true }, (err) => {
    if (err) { throw err; }
  });

  await fs.writeFile(`networks/${networkName}/${networkName}.tfvars`, data);
}

module.exports = generateTerraformConfig;
