const createRpcClientFromConfig = require('../../lib/test/createRpcClientFromConfig');
const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { inventory, network } = getNetworkConfig();

const allHosts = inventory.masternodes.hosts.concat(
  inventory['wallet-nodes'].hosts,
  inventory.miners.hosts,
  inventory['full-nodes'].hosts,
);

describe('DashCore', () => {
  describe('All nodes', () => {
    for (const hostName of allHosts) {
      describe(hostName, () => {
        let dashdClient;

        beforeEach(() => {
          dashdClient = createRpcClientFromConfig(hostName);
        });

        it('should have correct network type', async () => {
          const { result: { networkactive, subversion } } = await dashdClient.getNetworkInfo();

          expect(networkactive).to.be.equal(true);
          expect(subversion).to.have.string(`(${network.type}=${network.name})/`);
        });
      });
    }

    it('should propagate blocks', async function it() {
      this.timeout(20000);

      const blockHashes = {};

      for (const hostName of allHosts) {
        const dashdClient = createRpcClientFromConfig(hostName);
        const { result: { blocks, bestblockhash } } = await dashdClient.getBlockchainInfo();

        if (!blockHashes[blocks]) {
          blockHashes[blocks] = bestblockhash;
        }

        expect(blockHashes[blocks]).to.be.equal(bestblockhash);
      }

      const blocksCounts = Object.keys(blockHashes);
      expect(Math.max(...blocksCounts) - Math.min(...blocksCounts)).to.be.below(3);
    });
  });

  describe('Masternodes', () => {
    for (const hostName of inventory.masternodes.hosts) {
      describe(hostName, () => {
        let coreClient;

        beforeEach(() => {
          coreClient = createRpcClientFromConfig(hostName);
        });

        it('should masternodes be enabled', async () => {
          const { result: masternodes } = await coreClient.masternodelist();

          const nodeIps = Object.values(masternodes).map((node) => {
            expect(node.status).to.be.equal('ENABLED');
            return node.address.split(':')[0];
          });

          // eslint-disable-next-line arrow-body-style
          const nodeIdsFromInventory = inventory.masternodes.hosts.map((host) => {
            // eslint-disable-next-line no-underscore-dangle
            return inventory._meta.hostvars[host].public_ip;
          });

          expect(nodeIps.sort()).to.deep.equal(nodeIdsFromInventory.sort());
        });
      });
    }
  });

  describe('Miners', () => {
    if (network.type === 'mainnet') {
      this.skip('Miners are disabled for mainnet');
    }

    for (const hostName of inventory.miners.hosts) {
      describe(hostName, () => {
        it('should mine blocks', async function it() {
          this.timeout(160000);

          const coreClient = createRpcClientFromConfig(hostName);

          const { result: previousHeight } = await coreClient.getBlockCount();

          const { result: { height } } = await coreClient.waitForNewBlock(150000);

          expect(height).to.be.above(previousHeight, 'no new blocks');
        });
      });
    }
  });
});
