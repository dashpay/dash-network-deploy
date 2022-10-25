/* eslint-disable no-console */

const generateAnsibleConfig = require('../lib/configGenerator/generateAnsibleConfig');
const generateTerraformConfig = require('../lib/configGenerator/generateTerraformConfig');

async function main() {
  const [network, networkName, masternodesCount, seedsCount] = process.argv.slice(2);

  if (masternodesCount > 0 && (seedsCount === undefined || seedsCount > 0)) {
    await generateAnsibleConfig(network, networkName, masternodesCount, seedsCount);
    await generateTerraformConfig(network, networkName, masternodesCount);
  } else {
    console.error('masternodes_count and seeds_count must be positive integers');
  }
}

main().catch(console.error);
