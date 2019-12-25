const fs = require('fs').promises;

const { PrivateKey } = require('@dashevo/dashcore-lib');

const blsSignatures = require('bls-signatures');

const yaml = require('js-yaml');

const crypto = require('crypto');

const bs58 = require('bs58');

async function generateAnsibleConfig(network, networkName, masternodesCount) {
  const config = {};

  if (network === 'devnet') {
    // eslint-disable-next-line no-param-reassign
    network = 'testnet';
  }

  // Faucet
  const faucetPrivateKey = new PrivateKey();

  config.faucet_address = faucetPrivateKey.toAddress(network).toString();
  config.faucet_privkey = bs58.encode(faucetPrivateKey.toBuffer());

  // Spork
  const sporkPrivateKey = new PrivateKey();

  config.dashd_sporkaddr = sporkPrivateKey.toAddress(network).toString();
  config.dashd_sporkkey = bs58.encode(sporkPrivateKey.toBuffer());

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
        private_key: bs58.encode(ownerPrivateKey.toBuffer()),
      },
      collateral: {
        address: collateralPrivateKey.toAddress(network).toString(),
        private_key: bs58.encode(collateralPrivateKey.toBuffer()),
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
