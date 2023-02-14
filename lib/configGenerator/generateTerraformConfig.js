const fs = require('fs').promises;

async function generateTerraformConfig(network, networkName, masternodesAmdCount, masternodesArmCount) {
  const config = {
    miner_count: 1,
    logs_count: 1,
    masternode_amd_count: masternodesAmdCount,
    masternode_arm_count: masternodesArmCount,
    main_domain: '""',
    main_host_arch: '"arm64"',
  };

  let data = '# See all available options in `terraform/aws/variables.tf` file.\n';

  for (const [key, value] of Object.entries(config)) {
    data += `\n${key} = ${value}\n`;
  }

  await fs.writeFile(`networks/${networkName}.tfvars`, data);
}

module.exports = generateTerraformConfig;
