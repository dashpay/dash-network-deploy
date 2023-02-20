const createRpcClientFromConfig = require('../../lib/test/createRpcClientFromConfig');
const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { inventory, network, variables } = getNetworkConfig();
const { getDocker, execCommand, getContainerId } = require('../../lib/test/docker');

const timeout = 15000; // set individual rpc client timeout

const allMasternodes = inventory.masternodes.hosts.concat(inventory.hp_masternodes.hosts);

const ansibleHosts = inventory.masternodes.hosts(
  inventory.wallet_nodes.hosts,
  inventory.miners.hosts,
  inventory.seed_nodes.hosts,
);

const allHosts = inventory.hp_masternodes.hosts.concat(ansibleHosts)

describe('Core', () => {
  const coreContainerIds = {};

  before('Collect masternodes container ids', async () => {
    await Promise.all(inventory.masternodes.hosts.map(async (hostName) => {
      const docker = getDocker(`http://${inventory.meta.hostvars[hostName].public_ip}`);

      coreContainerIds[hostName] = await getContainerId(docker, 'core');
    }));
  });

  describe('All nodes', () => {
    // Set up vars and functions to hold max height and mn responses
    const blockchainInfo = {};
    let maxBlockHeight = 0;

    const networkInfo = {};

    before('Collect blockchain and network info', async function func() {
      this.timeout(60000); // set mocha timeout

      await Promise.all(inventory.hp_masternodes.hosts.map(async (hostName) => {
        const docker = getDocker(`http://${inventory.meta.hostvars[hostName].public_ip}`);

        const blockchain = await execCommand(docker, coreContainerIds[hostName],
          ['dash-cli', 'getblockchaininfo']);

        if (maxBlockHeight < blockchain.blocks) {
          maxBlockHeight = blockchain.blocks;
        }

        blockchainInfo[hostName] = blockchain;
        networkInfo[hostName] = await execCommand(docker, coreContainerIds[hostName],
          ['dash-cli', 'getnetworkinfo']);
      }));

      await Promise.all(ansibleHosts.map(async (hostName) => {
        const client = createRpcClientFromConfig(hostName);

        client.setTimeout(timeout);

        const blockchainInfoResult = await client.getBlockchainInfo();

        if (maxBlockHeight < blockchainInfoResult.result.blocks) {
          maxBlockHeight = blockchainInfoResult.result.blocks;
        }

        blockchainInfo[hostName] = blockchainInfoResult.result;

        const networkInfoResult = await client.getNetworkInfo();

        networkInfo[hostName] = networkInfoResult.result;
      }));
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

    before('Collect masternode list info', async function func() {
      this.timeout(30000); // set mocha timeout
      const promises = [];

      await Promise.all(inventory.hp_masternodes.hosts.map(async (hostName) => {
        const docker = getDocker(`http://${inventory.meta.hostvars[hostName].public_ip}`);

        masternodeListInfo[hostName] = await execCommand(docker, coreContainerIds[hostName], ['dash-cli', 'masternode', 'list']);
      }));

      for (const hostName of ansibleHosts) {
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

    for (const hostName of allHosts) {
      describe(hostName, () => {
        it('should be in masternodes list with correct type', async () => {
          if (!masternodeListInfo[hostName]) {
            expect.fail(null, null, 'no masternode list info');
          }

          const nodeFromList = Object.values(masternodeListInfo[hostName])
            .find((node) => (
              inventory.meta.hostvars[hostName].public_ip === node.address.split(':')[0]
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
