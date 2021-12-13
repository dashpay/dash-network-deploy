const fs = require('fs').promises;

async function generateTerraformConfig(network, networkName, masternodesCount) {
  const config = {
    miner_count: 1,
    logs_count: 1,
    masternode_count: masternodesCount,
    main_domain: '""',
    metrics_enabled: false,
    logs_node_instance_type: '""',
    logs_node_disk_size: '""',
  };

  let data = '# See all available options in `terraform/aws/variables.tf` file.\n';

  for (const [key, value] of Object.entries(config)) {
    data += `\n${key} = ${value}\n`;
  }

  await fs.writeFile(`networks/${networkName}.tfvars`, data);
}

module.exports = generateTerraformConfig;
