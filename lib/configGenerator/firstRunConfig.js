const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const { PrivateKey } = require('@dashevo/dashcore-lib');

async function generateDashAddress(network) {
  const privateKey = new PrivateKey(undefined, network);

  return {
    address: privateKey.toAddress(network).toString(),
    private_key: privateKey.toWIF(),
  };
}

function parseTfvarsToJSON(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const result = {};

  lines.forEach((line) => {
    // Ignore empty lines and comments
    if (!line || line.trim().startsWith('#')) {
      return;
    }

    // Split line by '=', trimming whitespace and handling quotes
    const [key, value] = line.split('=').map((part) => part.trim().replace(/^"(.*)"$/, '$1'));

    // Convert to appropriate data type and add to result object
    result[key] = Number.isNaN(Number(value)) ? value : Number(value);
  });

  return result;
}

async function firstRunConfig(
  network,
  networkName,
) {
  // Load files
  const tfvarsFilePath = path.join('networks/', `${networkName}.tfvars`);
  const ymlFilePath = path.join('networks/', `${networkName}.yml`);

  const yamlFile = fs.readFileSync(ymlFilePath, 'utf8');
  const ansibleYml = yaml.load(yamlFile);
  const tfjson = parseTfvarsToJSON(tfvarsFilePath);

  // Count the mixers, dynamically add/remove if needed
  const mixerCountJson = tfjson.mixer_count;
  if (!ansibleYml.mixers) {
    ansibleYml.mixers = {};
  }
  let mixerCountYml = Object.keys(ansibleYml.mixers).length;

  // Count the load testing nodes...
  const LTCountJson = tfjson.load_test_count || 0;
  if (!ansibleYml.load_testers) {
    ansibleYml.load_testers = {};
  }
  let LTCountYml = Object.keys(ansibleYml.load_testers).length;

  const mixYml = Object(ansibleYml.mixers);
  const LTYml = Object(ansibleYml.load_testers);

  // Ensure we have the right amount of mixers in the yml
  while (mixerCountJson > mixerCountYml) {
    const nextMixerNumber = mixerCountYml + 1;
    const mixerKey = `mixer-${nextMixerNumber}`;

    mixYml[mixerKey] = { owner: await generateDashAddress(network) };
    mixerCountYml = Object.keys(mixYml).length;
  }

  while (mixerCountYml > mixerCountJson) {
    const lastMixerNumber = mixerCountYml;
    const mixerKey = `mixer-${lastMixerNumber}`;

    // Delete the extra entry from the mixYml object
    delete mixYml[mixerKey];

    // Update the mixerCountYml to reflect the deletion
    mixerCountYml = Object.keys(mixYml).length;

    // Safety check to prevent infinite loop
    if (mixerCountYml >= lastMixerNumber) {
      throw new Error('Deletion did not reduce count, infinite loop detected');
    }
  }

  // And the load testers...
  while (LTCountJson > LTCountYml) {
    const nextLTNumber = LTCountYml + 1;
    const LTKey = `load-test-${nextLTNumber}`;

    LTYml[LTKey] = { owner: await generateDashAddress(network) };
    LTCountYml = Object.keys(LTYml).length;
  }

  // Delete extra load testers if LTCountJson is less than LTCountYml
  while (LTCountYml > LTCountJson) {
    const lastLTNumber = LTCountYml;
    const LTKey = `load-test-${lastLTNumber}`;

    delete LTYml[LTKey];
    LTCountYml = Object.keys(LTYml).length;
  }

  ansibleYml.mixers = mixYml;
  ansibleYml.load_testers = LTYml;

  // Write the new file...
  const newYaml = yaml.dump(ansibleYml, {
    lineWidth: -1,
    noRefs: true,
  });

  fs.writeFileSync(ymlFilePath, newYaml, 'utf8');
  // Note: Updated ${networkName}.yml
  // - mixers: ${Object.keys(ansibleYml.mixers).length}
  // - load_testers: ${Object.keys(ansibleYml.load_testers).length}
}

module.exports = firstRunConfig;
