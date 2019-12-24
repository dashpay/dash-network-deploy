const fs = require('fs').promises;
const path = require('path');

const { PrivateKey } = require('@dashevo/dashcore-lib');

// const blsSignatures = require('bls-signatures')();

const YAML = require('json-to-pretty-yaml');

async function generateAnsibleConfig(network, masternodesCount, fileName) {
  const config = {};

  // Faucet
  const faucetPrivateKey = new PrivateKey();

  config.faucet_address = faucetPrivateKey.toAddress(network).toString();
  config.faucet_privkey = faucetPrivateKey.toString();

  // Spork
  const sporkPrivateKey = new PrivateKey();

  config.dashd_sporkaddr = sporkPrivateKey.toAddress().toString();
  config.dashd_sporkkey = sporkPrivateKey.toString();

  config.masternodes = {};

  // const BlsPrivateKey = await blsSignatures;

  for (let i = 1; i <= masternodesCount; i++) {
    const ownerPrivateKey = new PrivateKey();
    const collateralPrivateKey = new PrivateKey();
    const operatorPrivateKey = 'some key';// new BlsPrivateKey();
    const operatorPublicKey = 'some public'; // operatorPrivateKey.getPublicKey();

    config.masternodes[`masternode-${i}`] = {
      owner: {
        address: ownerPrivateKey.toAddress(network).toString(),
        private_key: ownerPrivateKey.toString(),
      },
      collateral: {
        address: collateralPrivateKey.toAddress(network).toString(),
        private_key: collateralPrivateKey.toString(),
      },
      operator: {
        public_key: Buffer.from(/*operatorPublicKey.serialize()*/'11').toString('hex'),
        private_key: Buffer.from(/*operatorPrivateKey.serialize()*/ '22').toString('hex'),
      },
    };

    // operatorPublicKey.delete();
    // operatorPrivateKey.delete();
  }

  const data = YAML.stringify(config);

  await fs.writeFile(path.resolve(__dirname, '../../networks/', `${fileName}.yml`), data);
}

module.exports = generateAnsibleConfig;
