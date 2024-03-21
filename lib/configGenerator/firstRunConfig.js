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

async function addMixer(mixer) {
    mixer = { owner: await generateDashAddress() };
    return mixer;
}

function parseTfvarsToJSON(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);
    const result = {};

    lines.forEach(line => {
        // Ignore empty lines and comments
        if (!line || line.trim().startsWith('#')) return;

        // Split line by '=', trimming whitespace and handling quotes
        const [key, value] = line.split('=').map(part => part.trim().replace(/^"(.*)"$/, '$1'));

        // Convert to appropriate data type and add to result object
        result[key] = isNaN(Number(value)) ? value : Number(value);
    });

    return result;
}

async function firstRunConfig(
    network,
    networkName,
  ) {

    //Load files
    const tfvarsFilePath = path.join("networks/", networkName + ".tfvars");
    const ymlFilePath = path.join("networks/", networkName + ".yml");
    const yamlFile = fs.readFileSync(ymlFilePath, 'utf8');
    var ansibleYml = yaml.load(yamlFile);
    const tfjson = parseTfvarsToJSON(tfvarsFilePath);

    //Count the mixers, dynamically add/remove if needed
    const mixerCountJson = tfjson.mixer_count;
    var mixerCountYml = Object.keys(ansibleYml.mixers).length;

    //Count the load testing nodes...
    const LTCountJson = tfjson.load_test_count;
    var LTCountYml = Object.keys(ansibleYml.load_testers).length;

    var mixYml = Object(ansibleYml.mixers);
    var LTYml = Object(ansibleYml.load_testers);

    //Ensure we have the right amount of mixers in the yml
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
    }

    //And the load testers...
    while (LTCountJson > LTCountYml) {
        const nextLTNumber = LTCountYml + 1;
        const LTKey = `load-tester-${nextLTNumber}`;

        LTYml[LTKey] = { owner: await generateDashAddress(network) };
        LTCountYml = Object.keys(LTYml).length;
    }

    // Delete extra load testers if LTCountJson is less than LTCountYml
    while (LTCountYml > LTCountJson) {
        const lastLTNumber = LTCountYml;
        const LTKey = `load-tester-${lastLTNumber}`;

        delete LTYml[LTKey];
        LTCountYml = Object.keys(LTYml).length;
}


    ansibleYml.mixers = mixYml;
    ansibleYml.load_testers = LTYml;

    // Write the new file...
    const newYaml = yaml.dump(ansibleYml);
    fs.writeFile(ymlFilePath, newYaml, 'utf8', (err) => {
        if (err) {
            console.log('Error writing file:', err);
        } else {
            console.log('Successfully wrote updated YAML to', ymlFilePath);
        }
    });

  }

module.exports = firstRunConfig;
