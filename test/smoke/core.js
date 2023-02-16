const createRpcClientFromConfig = require('../../lib/test/createRpcClientFromConfig');
const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { inventory, network, variables } = getNetworkConfig();

const allMasternodes = inventory.masternodes.hosts.concat(inventory.hp_masternodes.hosts);

const allHosts = allMasternodes.concat(
  inventory.wallet_nodes.hosts,
  inventory.miners.hosts,
  inventory.seed_nodes.hosts,
);

describe('Core', () => {
  describe('All nodes', () => {
    // Set up vars and functions to hold max height and mn responses
    const blockchainInfo = {};
    let maxBlockHeight = 0;

    const networkInfo = {};

    before('Collect blockchain and network info', function func() {
      this.timeout(60000); // set mocha timeout

      const promises = [];
      for (const hostName of allHosts) {
        const timeout = 15000; // set individual rpc client timeout

        const client = createRpcClientFromConfig(hostName);

        client.setTimeout(timeout);

        const requestBlockchainInfoPromise = client.getBlockchainInfo()
          // eslint-disable-next-line no-loop-func
          .then(({ result }) => {
            if (maxBlockHeight < result.blocks) {
              maxBlockHeight = result.blocks;
            }
            blockchainInfo[hostName] = result;
          });

        const requestNetworkInfoPromise = client.getNetworkInfo()
          .then(({ result }) => {
            networkInfo[hostName] = result;
          });

        promises.push(requestBlockchainInfoPromise, requestNetworkInfoPromise);
      }

      return Promise.all(promises).catch(() => Promise.resolve());
    });

    for (const hostName of allHosts) {
      // eslint-disable-next-line no-loop-func
      describe(hostName, () => {
        it('should have correct network type', async () => {
          if (!blockchainInfo[hostName]) {
            expect.fail(null, null, 'no blockchain info');
          }

          const chainNames = {
            testnet: 'test',
            mainnet: 'main',
            devnet: network.name,
            regtest: 'regtest',
          };

          expect(blockchainInfo[hostName]).to.be.not.empty();
          expect(blockchainInfo[hostName].chain).to.equal(chainNames[network.type]);
          expect(networkInfo[hostName].networkactive).to.be.equal(true);

          if (network.type === 'devnet') {
            expect(networkInfo[hostName].subversion).to.have.string(`(${network.type}.${network.name})/`);
          }
        });

        it('should sync blocks', async () => {
          if (!blockchainInfo[hostName]) {
            expect.fail(null, null, 'no blockchain info');
          }

          expect(maxBlockHeight - blockchainInfo[hostName].blocks).to.be.below(3);
        });
      });
    }
  });

  describe('Masternodes', () => {
    const masternodeListInfo = {};

    before('Collect masternode list info', function func() {
      this.timeout(30000); // set mocha timeout

      const promises = [];
      for (const hostName of allMasternodes) {
        const timeout = 15000; // set individual rpc client timeout

        const client = createRpcClientFromConfig(hostName);

        client.setTimeout(timeout);

        const requestMasternodeListInfoPromise = client.masternodelist()
          .then(({ result }) => {
            masternodeListInfo[hostName] = result;
          });

        promises.push(requestMasternodeListInfoPromise);
      }

      return Promise.all(promises).catch(() => Promise.resolve());
    });

    for (const hostName of allMasternodes) {
      describe(hostName, () => {
        it('should be in masternodes list with correct type', async () => {
          if (!masternodeListInfo[hostName]) {
            expect.fail(null, null, 'no masternode list info');
          }

          const nodeFromList = Object.values(masternodeListInfo[hostName])
            .find((node) => (
            // eslint-disable-next-line no-underscore-dangle
              inventory._meta.hostvars[hostName].public_ip === node.address.split(':')[0]
            ));

          const masternodeType = hostName.startsWith('hp-') ? 'HighPerformance' : 'Regular';

          expect(nodeFromList, `${hostName} is not present in masternode list`).to.exist();
          expect(nodeFromList.type).to.be.equal(masternodeType);
          expect(nodeFromList.status).to.be.equal('ENABLED');
        });
      });
    }
  });

  describe('Miners', () => {
    for (const hostName of inventory.miners.hosts) {
      describe(hostName, () => {
        it('should mine blocks regularly', async () => {
          const targetBlockTime = variables.dashd_powtargetspacing || 156;
          const blockTimeLowerBound = targetBlockTime * 0.5;
          const blockTimeUpperBound = targetBlockTime * 1.5;
          const blockDelta = 10;

          // Connect and get current block count
          const coreClient = createRpcClientFromConfig(hostName);
          const { result: blockCount } = await coreClient.getBlockCount();

          // Get current and delta block timestamps
          const { result: currBlockHash } = await coreClient.getBlockHash(blockCount);
          const { result: prevBlockHash } = await coreClient.getBlockHash(blockCount - blockDelta);
          const { result: { time: currBlockTime } } = await coreClient.getBlock(currBlockHash);
          const { result: { time: prevBlockTime } } = await coreClient.getBlock(prevBlockHash);

          // Calculate mining stats
          const averageBlockTime = (currBlockTime - prevBlockTime) / blockDelta;
          const secondsSinceLastBlock = (new Date().getTime() - (currBlockTime * 1000)) / 1000;

          expect(averageBlockTime).to.be.within(blockTimeLowerBound, blockTimeUpperBound);
          expect(secondsSinceLastBlock).to.be.at.most(600);
        });
      });
    }
  });
});
