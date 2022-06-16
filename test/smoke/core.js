const createRpcClientFromConfig = require('../../lib/test/createRpcClientFromConfig');
const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { inventory, network } = getNetworkConfig();

const allHosts = inventory.masternodes.hosts.concat(
  inventory.wallet_nodes.hosts,
  inventory.miners.hosts,
  inventory.seed_nodes.hosts,
);

describe.only('Core', () => {
  describe('All nodes', () => {
    const blockchainInfo = {};
    let maxBlockHeight = 0;

    describe('Collect blockchain info', () => {
      for (const hostName of allHosts) {
        // eslint-disable-next-line no-loop-func
        it(`Connect to Core on ${hostName}`, async function itFunction() {
          this.slow(2000);
          this.timeout(15000);

          const client = createRpcClientFromConfig(hostName);

          const { result } = await client.getBlockchainInfo();

          if (maxBlockHeight < result.blocks) {
            maxBlockHeight = result.blocks;
          }

          blockchainInfo[hostName] = result;
        });
      }
    });

    describe('Test', () => {
      for (const hostName of allHosts) {
        // eslint-disable-next-line no-loop-func
        describe(hostName, () => {
          let dashdClient;

          before(function beforeFunction() {
            if (!blockchainInfo[hostName]) {
              this.skip('no blockchain info');
            }

            dashdClient = createRpcClientFromConfig(hostName);
          });

          it('should have correct network type', async function it() {
            this.slow(2000);

            const { result: { networkactive, subversion } } = await dashdClient.getNetworkInfo();

            const chainNames = {
              testnet: 'test',
              mainnet: 'main',
              devnet: network.name,
              regtest: 'regtest',
            };

            expect(blockchainInfo[hostName]).to.be.not.empty();
            expect(blockchainInfo[hostName].chain).to.equal(chainNames[network.type]);
            expect(networkactive).to.be.equal(true);

            if (network.type === 'devnet') {
              expect(subversion).to.have.string(`(${network.type}.${network.name})/`);
            }
          });

          it('should sync blocks', async () => {
            expect(maxBlockHeight - blockchainInfo[hostName].blocks).to.be.below(3);
          });
        });
      }
    });
  });

  describe('Masternodes', () => {
    for (const hostName of inventory.masternodes.hosts) {
      describe(hostName, () => {
        let coreClient;

        beforeEach(() => {
          coreClient = createRpcClientFromConfig(hostName);
        });

        it('should be in masternodes list', async function it() {
          this.slow(2000);

          const { result: masternodes } = await coreClient.masternodelist();

          const nodeFromList = Object.values(masternodes).find((node) => (
            // eslint-disable-next-line no-underscore-dangle
            inventory._meta.hostvars[hostName].public_ip === node.address.split(':')[0]
          ));

          expect(nodeFromList, `${hostName} is not present in masternode list`).to.exist();

          expect(nodeFromList.status).to.be.equal('ENABLED');
        });
      });
    }
  });

  describe('Miners', () => {
    for (const hostName of inventory.miners.hosts) {
      describe(hostName, () => {
        it('should mine blocks', async function it() {
          if (network.type === 'mainnet') {
            this.skip('Miners are disabled for mainnet');
            return;
          }

          this.timeout(240000);
          this.slow(160000);

          const coreClient = createRpcClientFromConfig(hostName);

          const { result: previousHeight } = await coreClient.getBlockCount();

          const { result: { height } } = await coreClient.waitForNewBlock(230000);

          expect(height).to.be.above(previousHeight, 'no new blocks');
        });
      });
    }
  });
});
