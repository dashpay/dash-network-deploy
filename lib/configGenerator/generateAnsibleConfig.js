const fs = require('fs').promises;

const { PrivateKey } = require('@dashevo/dashcore-lib');
const { Wallet } = require('@dashevo/wallet-lib');

const BlsSignatures = require('@dashevo/bls');

const yaml = require('js-yaml');

const crypto = require('crypto');

/**
 * Get identity HDPrivateKey for network
 *
 * @typedef {generateHDPrivateKeys}
 *
 * @param {string} network
 *
 * @returns {Promise<HDPrivateKey>}
 */
async function generateHDPrivateKeys(network) {
  const wallet = new Wallet({ network, offlineMode: true });
  const account = await wallet.getAccount();

  const derivedMasterPrivateKey = account.identities.getIdentityHDKeyByIndex(0, 0);
  const derivedSecondPrivateKey = account.identities.getIdentityHDKeyByIndex(0, 1);
  const hdPrivateKey = wallet.exportWallet('HDPrivateKey');

  await wallet.disconnect();

  return {
    hdPrivateKey,
    derivedMasterPrivateKey,
    derivedSecondPrivateKey,
  };
}

async function generateAnsibleConfig(
  network,
  networkName,
  masternodesCount,
  hpMasternodesCount,
  seedsCount,
) {
  const config = {};

  // Set vars here!!
  config.evo_services = true;
  config.drive_image = 'dashpay/drive';
  config.dapi_image = 'dashpay/dapi';
  config.dapi_envoy_image = 'dashpay/envoy';
  config.dashd_image = 'dashpay/dashd';
  config.tendermint_image = 'dashpay/tenderdash';
  config.dashmate_version = '0.24.0-dev.23';
  config.tenderdash_chain_id = networkName;

  const {
    hdPrivateKey: dpnsHDPrivateKey,
    derivedMasterPrivateKey: dpnsDerivedMasterPK,
    derivedSecondPrivateKey: dpnsDerivedSecondPK,
  } = await generateHDPrivateKeys(network);
  const {
    hdPrivateKey: dashpayHDPrivateKey,
    derivedMasterPrivateKey: dashpayDerivedMasterPK,
    derivedSecondPrivateKey: dashpayDerivedSecondPK,
  } = await generateHDPrivateKeys(network);
  const {
    hdPrivateKey: featureFlagsHDPrivateKey,
    derivedMasterPrivateKey: featureFlagsDerivedMasterPK,
    derivedSecondPrivateKey: featureFlagsDerivedSecondPK,
  } = await generateHDPrivateKeys(network);
  const {
    hdPrivateKey: mnRewardSharesHDPrivateKey,
    derivedMasterPrivateKey: mnRewardSharesDerivedMasterPK,
    derivedSecondPrivateKey: mnRewardSharesDerivedSecondPK,
  } = await generateHDPrivateKeys(network);
  const {
    hdPrivateKey: withdrawalsHDPrivateKey,
    derivedMasterPrivateKey: withdrawalsDerivedMasterPK,
    derivedSecondPrivateKey: withdrawalsDerivedSecondPK,
  } = await generateHDPrivateKeys(network);

  const validatorSetLLMQTypes = {
    devnet: 101,
    testnet: 6,
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
  config.kibana_password = crypto.randomBytes(32).toString('base64').slice(0, 32);
  config.kibana_encryptionkey = crypto.randomBytes(32).toString('base64').slice(0, 32);

  // Governance proposals
  config.governance_proposal_count = 2;

  // HD private keys
  config.dpns_hd_private_key = dpnsHDPrivateKey.toString();
  config.dpns_hd_master_public_key = dpnsDerivedMasterPK.privateKey.toPublicKey().toString();
  config.dpns_hd_second_public_key = dpnsDerivedSecondPK.privateKey.toPublicKey().toString();

  config.dashpay_hd_private_key = dashpayHDPrivateKey.toString();
  config.dashpay_hd_master_public_key = dashpayDerivedMasterPK.privateKey.toPublicKey().toString();
  config.dashpay_hd_second_public_key = dashpayDerivedSecondPK.privateKey.toPublicKey().toString();

  config.feature_flags_hd_private_key = featureFlagsHDPrivateKey
    .toString();
  config.feature_flags_hd_master_public_key = featureFlagsDerivedMasterPK
    .privateKey.toPublicKey().toString();
  config.feature_flags_hd_second_public_key = featureFlagsDerivedSecondPK
    .privateKey.toPublicKey().toString();

  config.mn_reward_shares_hd_private_key = mnRewardSharesHDPrivateKey
    .toString();
  config.mn_reward_shares_hd_master_public_key = mnRewardSharesDerivedMasterPK
    .privateKey.toPublicKey().toString();
  config.mn_reward_shares_hd_second_public_key = mnRewardSharesDerivedSecondPK
    .privateKey.toPublicKey().toString();

  config.withdrawals_hd_private_key = withdrawalsHDPrivateKey
    .toString();
  config.withdrawals_hd_master_public_key = withdrawalsDerivedMasterPK
    .privateKey.toPublicKey().toString();
  config.withdrawals_hd_second_public_key = withdrawalsDerivedSecondPK
    .privateKey.toPublicKey().toString();

  // Dashd
  config.dashd_debug = 0;
  config.dashd_network_logging = 0;
  config.dashd_minimumdifficultyblocks = 4032;

  config.drive_log_stdout_level = 'debug';
  config.drive_log_json_file_level = 'debug';
  config.drive_log_pretty_file_level = 'debug';
  config.tenderdash_log_level = 'debug';

  // Genesis date
  config.genesis_time = new Date().toISOString();

  config.platform_initial_core_chain_locked_height = 4100;

  config.smoke_test_st_execution_interval = 15000;

  const blsSignatures = await BlsSignatures();

  // Generate owner, collateral and operator keys
  async function generateDip3Keys() {
    const ownerPrivateKey = new PrivateKey(undefined, network);
    const collateralPrivateKey = new PrivateKey(undefined, network);

    const { BasicSchemeMPL } = blsSignatures;

    const randomBytes = new Uint8Array(crypto.randomBytes(256));
    const operatorPrivateKey = BasicSchemeMPL.keyGen(randomBytes);
    const operatorPublicKey = BasicSchemeMPL.skToG1(operatorPrivateKey);

    return {
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
  }

  // Masternode keys
  config.masternodes = {};

  for (let i = 1; i <= masternodesCount; i++) {
    config.masternodes[`masternode-${i}`] = await generateDip3Keys(network);
  }

  // HP masternode keys
  config.hp_masternodes = {};

  for (let i = 1; i <= hpMasternodesCount; i++) {
    config.hp_masternodes[`hp-masternode-${i}`] = await generateDip3Keys(network);
  }

  // Tenderdash keys

  function generateTenderdashNodeKeys() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
      privateKeyEncoding: { format: 'der', type: 'pkcs8' },
      publicKeyEncoding: { format: 'der', type: 'spki' },
    });

    // Strip static metadata from keys so they are 32 bytes and
    // concatenate to 64 byte Tenderdash cached key
    const cachedKey = Buffer.concat([privateKey.slice(16), publicKey.slice(12)]);

    // Derive ID from key
    const publicKeyHash = crypto.createHash('sha256')
      .update(publicKey.slice(12))
      .digest('hex');

    const id = publicKeyHash.slice(0, 40);
    // eslint-disable-next-line camelcase
    const cachedKeyString = cachedKey.toString('base64');

    return { id, cachedKeyString };
  }

  config.seed_nodes = {};

  for (let i = 1; i <= hpMasternodesCount; i++) {
    config.hp_masternodes[`hp-masternode-${i}`].node_key = generateTenderdashNodeKeys();
  }

  for (let i = 1; i <= seedsCount; i++) {
    config.seed_nodes[`seed-${i}`] = {};
    config.seed_nodes[`seed-${i}`].node_key = generateTenderdashNodeKeys();
  }

  const data = yaml.dump(config);

  await fs.writeFile(`networks/${networkName}.yml`, `---\n\n${data}`);
}

module.exports = generateAnsibleConfig;
