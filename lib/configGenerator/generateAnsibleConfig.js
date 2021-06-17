const fs = require('fs').promises;

const { PrivateKey } = require('@dashevo/dashcore-lib');

const { PrivateKey: BlsPrivateKey } = require('bls-signatures');

const yaml = require('js-yaml');

const crypto = require('crypto');

async function generateAnsibleConfig(network, networkName, masternodesCount, seedsCount) {
  const config = {};

  // Set vars here!!
  config.evo_services = true;
  config.drive_image = 'dashpay/drive';
  config.dapi_image = 'dashpay/dapi';
  config.dapi_envoy_image = 'envoyproxy/envoy';
  config.dashd_evo_image = 'dashpay/dashd';
  config.tendermint_image = 'dashpay/tenderdash';
  config.tenderdash_chain_id = networkName;
  config.platform_dpns_contract_id = '';
  config.platform_dpns_contract_block_height = '';
  config.platform_dpns_top_level_domain_identity = '';
  config.platform_dashpay_contract_id = '';
  config.platform_dashpay_contract_block_height = '';
  config.platform_dashpay_top_level_domain_identity = '';
  config.platform_feature_flags_contract_id = '';
  config.platform_feature_flags_contract_block_height = '';
  config.platform_feature_flags_top_level_identity = '';

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

  // Elastic keys
  config.elastic_password = crypto.randomBytes(32).toString('base64').slice(0, 32);
  config.kibana_encryptionkey = crypto.randomBytes(32).toString('base64').slice(0, 32);

  // Genesis date
  config.genesis_time = new Date().toISOString();

  config.platform_initial_core_chain_locked_height = 2100;

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
