const readYamlFiles = require('./readYamlFiles');

let config;

/**
 * Get network information
 *
 * @return {{ network:string, networkName: string,
 *            devnetName: string, inventory: object,
 *            variables: object}}
 */
module.exports = function getNetworkConfig() {
  if (config) {
    return config;
  }

  const variables = readYamlFiles(
    `${__dirname}/../../${process.env.ANSIBLE_GROUP_VARS_PATH}`,
    `${__dirname}/../../${process.env.ANSIBLE_CONFIG_PATH}`,
  );

  config = {
    network: process.env.NETWORK,
    networkName: process.env.NETWORK_NAME,
    devnetName: process.env.NETWORK_DEVNET_NAME,
    inventory: JSON.parse(process.env.ANSIBLE_INVENTORY),
    variables,
  };

  return config;
};
