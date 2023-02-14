/* eslint-disable no-console */

const generateAnsibleConfig = require('../lib/configGenerator/generateAnsibleConfig');
const generateTerraformConfig = require('../lib/configGenerator/generateTerraformConfig');

async function main() {
  const [network, networkName, masternodesAmdCount, masternodesArmCount, seedsCount] = process.argv.slice(2);

  const masternodesCount = parseInt(masternodesArmCount) + parseInt(masternodesAmdCount);

  if (masternodesCount > 0 && (seedsCount === undefined || seedsCount > 0)) {
    await generateAnsibleConfig(network, networkName, masternodesCount, seedsCount);
    await generateTerraformConfig(network, networkName, masternodesAmdCount, masternodesArmCount);
  } else {
    console.error('seeds_count and total masternodes_count must both be positive integers');
  }
}

main().catch(console.error);
