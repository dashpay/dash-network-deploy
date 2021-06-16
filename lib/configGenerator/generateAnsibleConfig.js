const fs = require('fs').promises;

const { PrivateKey } = require('@dashevo/dashcore-lib');

const { PrivateKey: BlsPrivateKey } = require('bls-signatures');

const yaml = require('js-yaml');

const crypto = require('crypto');

async function generateAnsibleConfig(network, networkName, masternodesCount, seedsCount) {
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

  // Genesis date
  config.genesis_time = new Date().toISOString();

  // Masternode keys
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

  // Tenderdash keys

  function generateTenderdashNodeKeys() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
      privateKeyEncoding: { format: 'der', type: 'pkcs8' },
      publicKeyEncoding: { format: 'der', type: 'spki' },
    });

    // Strip static metadata from keys so they are 32 bytes and
    // concatenate to 64 byte Tenderdash cached key
    // Is this safe in memory or do I need to consider these cases?
    // https://stackoverflow.com/a/54646864/1661847
    // https://nodejs.org/api/buffer.html#buffer_buf_byteoffset
    const cachedKey = Buffer.concat([privateKey.slice(16), publicKey.slice(12)]);

    // Derive ID from key
    const publicKeyHash = crypto.createHash('sha256')
      .update(publicKey.slice(12))
      .digest('hex');

    const id = publicKeyHash.slice(0, 40);
    // eslint-disable-next-line camelcase
    const private_key = cachedKey.toString('base64');

    return { id, private_key };
  }

  config.seed_nodes = {};

  for (let i = 1; i <= masternodesCount; i++) {
    config.masternodes[`masternode-${i}`].node_key = generateTenderdashNodeKeys();
  }

  for (let i = 1; i <= seedsCount; i++) {
    config.seed_nodes[`seed-${i}`] = {};
    config.seed_nodes[`seed-${i}`].node_key = generateTenderdashNodeKeys();
  }

  const data = yaml.safeDump(config);

  await fs.writeFile(`networks/${networkName}.yml`, `---\n\n${data}`);
}

module.exports = generateAnsibleConfig;
