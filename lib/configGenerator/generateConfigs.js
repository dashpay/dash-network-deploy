const generateAnsibleConfig = require('./generateAnsibleConfig');
const generateTerraformConfig = require('./generateTerraformConfig');

const args = process.argv.slice(2);

async function generateConfigs(network, masternodesCount, fileName) {
  await Promise.all([
    generateAnsibleConfig(network, masternodesCount, fileName),
    generateTerraformConfig(masternodesCount, fileName),
  ]);
}

(async () => {
  await generateConfigs(...args);
})();
