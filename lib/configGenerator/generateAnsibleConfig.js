const fs = require('fs').promises;

const { PrivateKey } = require('@dashevo/dashcore-lib');

const blsSignatures = require('bls-signatures');

const yaml = require('js-yaml');

const crypto = require('crypto');

async function generateAnsibleConfig(network, networkName, masternodesCount) {
  const config = {};

  if (network === 'devnet') {
    // eslint-disable-next-line no-param-reassign
    network = 'testnet';
  }

  // Faucet
  const faucetPrivateKey = new PrivateKey();

  config.faucet_address = faucetPrivateKey.toAddress(network).toString();
  config.faucet_privkey = faucetPrivateKey.toString();

  // Spork
  const sporkPrivateKey = new PrivateKey();

  config.dashd_sporkaddr = sporkPrivateKey.toAddress().toString();
  config.dashd_sporkkey = sporkPrivateKey.toString();

  config.masternodes = {};

  const { PrivateKey: BlsPrivateKey } = await blsSignatures;

  for (let i = 1; i <= masternodesCount; i++) {
    const ownerPrivateKey = new PrivateKey();
    const collateralPrivateKey = new PrivateKey();

    const randomBytes = new Uint8Array(crypto.randomBytes(256));
    const operatorPrivateKey = BlsPrivateKey.fromBytes(randomBytes, true);
    const operatorPublicKey = operatorPrivateKey.getPublicKey();

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
        public_key: Buffer.from(operatorPublicKey.serialize()).toString('hex'),
        private_key: Buffer.from(operatorPrivateKey.serialize()).toString('hex'),
      },
    };

    operatorPublicKey.delete();
    operatorPrivateKey.delete();
  }

  const data = yaml.safeDump(config);

  await fs.writeFile(`${networkName}.yml`, data);
}

module.exports = generateAnsibleConfig;
