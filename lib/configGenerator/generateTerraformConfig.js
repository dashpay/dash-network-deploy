const fs = require('fs').promises;

async function generateTerraformConfig(
  network,
  networkName,
  masternodesAmdCount,
  masternodesArmCount,
  hpMasternodesAmdCount,
  hpMasternodesArmCount,
) {
  const config = {
    miner_count: 1,
    logs_count: 1,
    mixer_count: 0,
    load_test_count: 0,
    metrics_count: 0,
    masternode_amd_count: masternodesAmdCount,
    masternode_arm_count: masternodesArmCount,
    hp_masternode_amd_count: hpMasternodesAmdCount,
    hp_masternode_arm_count: hpMasternodesArmCount,
    main_domain: '""',
    main_host_arch: '"arm64"',
    create_eip: false,
  };

  let data = '# See all available options in `terraform/aws/variables.tf` file.\n';

  for (const [key, value] of Object.entries(config)) {
    data += `\n${key} = ${value}\n`;
  }

  await fs.writeFile(`networks/${networkName}.tfvars`, data);
}

module.exports = generateTerraformConfig;
