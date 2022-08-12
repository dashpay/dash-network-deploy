const { client: jaysonClient } = require('jayson/promise');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { variables, inventory, network } = getNetworkConfig();

describe('Tendermint', () => {
  const masternodeStatus = {};
  const masternodeStatusError = {};

  const masternodeNetInfo = {};
  const masternodeNetInfoError = {};

  const blockHashes = {};

  describe('All nodes', () => {
    before('Collect tenderdash info', () => {
      const promises = [];
      for (const hostName of inventory.masternodes.hosts) {
        const tendermintClient = jaysonClient.http({
          // eslint-disable-next-line no-underscore-dangle
          host: inventory._meta.hostvars[hostName].public_ip,
          port: variables.tendermint_rpc_port,
          // TODO: add timeout https://github.com/tedeh/jayson
        });

        const requestTendermintStatusPromise = tendermintClient.request('status', {})
          .then(({ result, error }) => {
            masternodeStatus[hostName] = result;
            masternodeStatusError[hostName] = error;
          })
          .catch((e) => {
            masternodeStatusError[hostName] = e;
          });

        const requestTendermintNetInfoPromise = tendermintClient.request('net_info', {})
          // eslint-disable-next-line no-loop-func
          .then(({ result, error }) => {
            masternodeNetInfo[hostName] = result;
            masternodeNetInfoError[hostName] = error;
          })
          .catch((e) => {
            // eslint-disable-next-line no-console
            masternodeNetInfoError[hostName] = e;
          });

        promises.push(requestTendermintStatusPromise, requestTendermintNetInfoPromise);
      }

      return Promise.all(promises).catch(() => Promise.resolve());
    });

    before('Evaluate block hashes', () => {
      for (const hostName of inventory.masternodes.hosts) {
        if (masternodeStatusError[hostName]) {
          // eslint-disable-next-line no-continue
          continue;
        }

        const {
          sync_info: {
            latest_block_height: blockHeight,
            latest_block_hash: blockHash,
          },
        } = masternodeStatus[hostName];

        if (!blockHashes[blockHeight]) {
          blockHashes[blockHeight] = blockHash;
        }
      }
    });

    for (const hostName of inventory.masternodes.hosts) {
      describe(hostName, () => {
        it('should be connected to the network', () => {
          if (masternodeStatusError[hostName]) {
            expect.fail(masternodeStatusError[hostName]);
          }

          let networkName = `dash-${network.name}`;
          if (network.type === 'devnet' && variables.tenderdash_chain_id !== undefined) {
            networkName = `dash-${variables.tenderdash_chain_id}`;
          }

          const { node_info: nodeInfo } = masternodeStatus[hostName];

          expect(nodeInfo).to.deep.include({
            network: networkName,
            moniker: hostName,
          });
        });

        it('should be connected to peers', () => {
          if (masternodeNetInfoError[hostName]) {
            expect.fail(masternodeNetInfoError[hostName]);
          }

          expect(masternodeNetInfo[hostName]).to.have.property('listening', true);
          expect(masternodeNetInfo[hostName]).to.have.property('n_peers');
          expect(parseInt(masternodeNetInfo[hostName].n_peers, 10)).to.be.greaterThan(0);
        });

        it('should sync blocks', () => {
          if (masternodeStatusError[hostName]) {
            expect.fail(masternodeStatusError[hostName]);
          }

          const {
            sync_info: {
              latest_block_height: blockHeight,
              latest_block_hash: blockHash,
            },
          } = masternodeStatus[hostName];

          expect(blockHashes[blockHeight]).to.be.equal(blockHash);

          const blocksCounts = Object.keys(blockHashes).map((c) => parseInt(c, 10));
          const maxBlocksCount = Math.max(...blocksCounts);

          const blocksCountDiff = maxBlocksCount - blockHeight;

          if (blocksCountDiff > 3) {
            expect.fail(`${blocksCountDiff} blocks behind`);
          }
        });
      });
    }
  });
});
