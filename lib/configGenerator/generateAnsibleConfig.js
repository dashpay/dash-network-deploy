const { PrivateKey } = require('@dashevo/dashcore-lib');

const blsSignatures = require('bls-signatures')();

async function generateAnsibleConfig(network, masternodesCount, file) {
  const config = {};

  // Faucet
  const faucetPrivateKey = new PrivateKey();

  config.faucet_address = faucetPrivateKey.toAddress(network);
  config.faucet_privkey = faucetPrivateKey.toString();

  // Spork
  const sporkPrivateKey = new PrivateKey();

  config.dashd_sporkaddr = sporkPrivateKey.toAddress();
  config.dashd_sporkkey = sporkPrivateKey.toString();

  config.masternodes = {};

  const BlsPrivateKey = await blsSignatures;

  for (let i = 1; i <= masternodesCount; i++) {
    const ownerPrivateKey = new PrivateKey();
    const collateralPrivateKey = new PrivateKey();
    const operatorPrivateKey = new BlsPrivateKey();
    const operatorPublicKey = operatorPrivateKey.getPublicKey();

    config.masternodes[`masternode-${masternodesCount}`] = {
      owner: {
        address: ownerPrivateKey.toAddress(network),
        private_key: ownerPrivateKey.toString(),
      },
      collateral: {
        address: collateralPrivateKey.toAddress(network),
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

  // TODO: save as YAML to file
}

module.exports = generateAnsibleConfig;
