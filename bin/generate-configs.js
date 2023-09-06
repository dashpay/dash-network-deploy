/* eslint-disable no-console */

const generateAnsibleConfig = require('../lib/configGenerator/generateAnsibleConfig');
const generateTerraformConfig = require('../lib/configGenerator/generateTerraformConfig');

async function main() {
  const [
    network,
    networkName,
    masternodesAmdCount,
    masternodesArmCount,
    hpMasternodesAmdCount,
    hpMasternodesArmCount,
    seedsCount,
    mixerCount,
  ] = process.argv.slice(2);

  const masternodesCount = parseInt(masternodesAmdCount, 10)
    + parseInt(masternodesArmCount, 10);

  const hpMasternodesCount = parseInt(hpMasternodesAmdCount, 10)
    + parseInt(hpMasternodesArmCount, 10);

  if (masternodesCount + hpMasternodesCount > 0 && (seedsCount === undefined || seedsCount > 0)) {
    await generateAnsibleConfig(
      network,
      networkName,
      masternodesCount,
      hpMasternodesCount,
      seedsCount,
      mixerCount,
    );
    await generateTerraformConfig(
      network,
      networkName,
      masternodesAmdCount,
      masternodesArmCount,
      hpMasternodesAmdCount,
      hpMasternodesArmCount,
      mixerCount,
    );
  } else {
    console.error('seeds_count and total masternodes_count must both be positive integers');
  }
}

main().catch(console.error);
