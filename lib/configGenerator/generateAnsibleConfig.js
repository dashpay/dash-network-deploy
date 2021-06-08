const fs = require('fs').promises;

const { PrivateKey } = require('@dashevo/dashcore-lib');

const { PrivateKey: BlsPrivateKey } = require('bls-signatures');

const yaml = require('js-yaml');

const crypto = require('crypto');

async function generateAnsibleConfig(network, networkName, masternodesCount) {
  const config = {};

  const validatorSetLLMQTypes = {
    devnet: 101,
    testnet: 4,
    mainnet: 4,
    regtest: 100,
  };

  config.platform_drive_validator_set_llmq_type = validatorSetLLMQTypes[network];

  if (network === 'devnet') {
    // eslint-disable-next-line no-param-reassign
    network = 'testnet';
  }

  // Faucet
  const faucetPrivateKey = new PrivateKey(undefined, network);

  config.faucet_address = faucetPrivateKey.toAddress(network).toString();
  config.faucet_privkey = faucetPrivateKey.toWIF();

  // Spork
  const sporkPrivateKey = new PrivateKey(undefined, network);

  config.dashd_sporkaddr = sporkPrivateKey.toAddress(network).toString();
  config.dashd_sporkkey = sporkPrivateKey.toWIF();

  config.masternodes = {};

  for (let i = 1; i <= masternodesCount; i++) {
    const ownerPrivateKey = new PrivateKey(undefined, network);
    const collateralPrivateKey = new PrivateKey(undefined, network);

    const randomBytes = new Uint8Array(crypto.randomBytes(256));
    const operatorPrivateKey = BlsPrivateKey.fromBytes(randomBytes, true);
    const operatorPublicKey = operatorPrivateKey.getPublicKey();

    config.masternodes[`masternode-${i}`] = {
      owner: {
        address: ownerPrivateKey.toAddress(network).toString(),
        private_key: ownerPrivateKey.toWIF(),
      },
      collateral: {
        address: collateralPrivateKey.toAddress(network).toString(),
        private_key: collateralPrivateKey.toWIF(),
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

  await fs.writeFile(`networks/${networkName}.yml`, `---\n\n${data}`);
}

module.exports = generateAnsibleConfig;
