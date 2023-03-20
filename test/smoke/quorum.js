const createRpcClientFromConfig = require('../../lib/test/createRpcClientFromConfig');
const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { inventory, network, variables } = getNetworkConfig();

const allHosts = inventory.masternodes.hosts.concat(
  inventory.wallet_nodes.hosts,
  inventory.miners.hosts,
  inventory.seed_nodes.hosts,
);

const quorumCheckTypes = {
  testnet: {
    name: 'llmq_100_67',
    type: 4,
    dkgInterval: 24,
  },
  mainnet: {
    name: 'llmq_400_60',
    type: 2,
    dkgInterval: 288,
  },
  devnet: {
    name: 'llmq_devnet',
    type: 101,
    dkgInterval: 24,
  },
  regtest: {
    name: 'llmq_test',
    type: 100,
    dkgInterval: 24,
  },
};

describe('Quorums', () => {
  describe('All nodes', () => {
    // Set up vars to hold mn responses
    const blockCount = {};
    const bestChainLock = {};
    const quorumList = {};
    const blockchainInfo = {};
    const firstQuorumInfo = {};
    const rawMemPool = {};
    let instantsendTestTxid = '';

    before('Collect chain lock and quorum list', () => {
      // this.timeout(60000); // set mocha timeout

      const promises = [];
      for (const hostName of allHosts) {
        const timeout = 15000; // set individual rpc client timeout

        const client = createRpcClientFromConfig(hostName);

        client.setTimeout(timeout);

        const requestBlockCountPromise = client.getBlockCount()
          // eslint-disable-next-line no-loop-func
          .then(({ result }) => {
            blockCount[hostName] = result;
          });

        const requestBestChainLockPromise = client.getBestChainLock()
          .then(({ result }) => {
            bestChainLock[hostName] = result;
          });

        const requestQuorumListPromise = client.quorum('list')
          .then(({ result }) => {
            quorumList[hostName] = result;
          });

        const requestBlockchainInfoPromise = client.getBlockchainInfo()
          .then(({ result }) => {
            blockchainInfo[hostName] = result;
          });

        promises.push(
          requestBlockCountPromise,
          requestBestChainLockPromise,
          requestQuorumListPromise,
          requestBlockchainInfoPromise,
        );
      }

      return Promise.all(promises).catch(() => Promise.resolve());
    });

    before('Collect quorum info', () => {
      const promises = [];
      for (const hostName of allHosts) {
        const timeout = 15000; // set individual rpc client timeout

        const client = createRpcClientFromConfig(hostName);

        client.setTimeout(timeout);

        if (quorumList[hostName][quorumCheckTypes[network.type].name].length > 0) {
          const requestFirstQuorumInfo = client.quorum(
            'info',
            quorumCheckTypes[network.type].type,
            quorumList[hostName][quorumCheckTypes[network.type].name][0],
          )
            // eslint-disable-next-line no-loop-func
            .then(({ result }) => {
              firstQuorumInfo[hostName] = result;
            });

          promises.push(requestFirstQuorumInfo);
        }
      }

      return Promise.all(promises).catch(() => Promise.resolve());
    });

    before('Send a transaction', () => {
      const promises = [];
      const timeout = 15000; // set individual rpc client timeout

      const client = createRpcClientFromConfig(inventory.wallet_nodes.hosts[0]);

      client.setTimeout(timeout);

      const requestGetBalance = client.sendToAddress(variables.faucet_address, 0.1, { wallet: 'dashd-wallet-1-faucet' })
        .then(({ result }) => {
          instantsendTestTxid = result;
        });

      promises.push(requestGetBalance);

      return Promise.all(promises).catch(() => Promise.resolve());
    });

    before('Collect instantsend info', async () => {
      // Wait two seconds here before checking for IS locks
      // TODO: implement this.slow() and await IS ZMQ message to mark test response speed yellow/red
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const promises = [];
      for (const hostName of allHosts) {
        const timeout = 15000; // set individual rpc client timeout

        const client = createRpcClientFromConfig(hostName);

        client.setTimeout(timeout);

        const requestGetRawMemPool = client.getRawMemPool(true)
        // eslint-disable-next-line no-loop-func
          .then(({ result }) => {
            rawMemPool[hostName] = result;
          });

        promises.push(requestGetRawMemPool);
      }

      return Promise.all(promises).catch(() => Promise.resolve());
    });

    for (const hostName of allHosts) {
      // eslint-disable-next-line no-loop-func
      describe(hostName, () => {
        it('should see quorums of the correct type', () => {
          expect(quorumList[hostName][quorumCheckTypes[network.type].name]).to.not.be.empty();
        });

        it('should see chainlocks at the chain tip', () => {
          expect(blockCount[hostName]).to.equal(bestChainLock[hostName].height);
        });

        it('should see the first quorum was created recently', () => {
          expect(blockCount[hostName] - firstQuorumInfo[hostName].height)
            .to.be.lessThanOrEqual(quorumCheckTypes[network.type].dkgInterval * 1.5);
        });

        it('should see an instantsend lock', () => {
          expect(rawMemPool[hostName][instantsendTestTxid].instantlock).to.equal('true');
        });
      });
    }
  });
});
