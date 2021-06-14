/* eslint-disable no-console */

const generateAnsibleConfig = require('../lib/configGenerator/generateAnsibleConfig');
const generateTerraformConfig = require('../lib/configGenerator/generateTerraformConfig');

async function main() {
  const [network, networkName, masternodesCount, seedsCount] = process.argv.slice(2);

  await generateAnsibleConfig(network, networkName, masternodesCount, seedsCount);
  await generateTerraformConfig(network, networkName, masternodesCount);
}

main().catch(console.error);
