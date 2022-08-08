const { client: jaysonClient } = require('jayson/promise');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { variables, inventory, network } = getNetworkConfig();

describe('Tendermint', () => {
  const masternodeStatus = {};
  const masternodeStatusError = {};
  const masternodeStatusNodeInfo = {};
  const masternodeStatusNetworkName = {};

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
        });

        const requestTendermintStatusPromise = tendermintClient.request('status', {})
          .then((response) => {
            masternodeStatus[hostName] = response;

            const { result: { node_info: nodeInfo }, error } = response;
            masternodeStatusError[hostName] = error;
            masternodeStatusNodeInfo[hostName] = nodeInfo;

            let networkName = `dash-${network.name}`;
            if (network.type === 'devnet' && variables.tenderdash_chain_id !== undefined) {
              networkName = `dash-${variables.tenderdash_chain_id}`;
            }

            masternodeStatusNetworkName[hostName] = networkName;
          })
          .catch((e) => {
            // eslint-disable-next-line no-console
            console.log(e);
          });

        const requestTendermintNetInfoPromise = tendermintClient.request('net_info', {})
          // eslint-disable-next-line no-loop-func
          .then(({ result, error }) => {
            masternodeNetInfo[hostName] = result;
            masternodeNetInfoError[hostName] = error;
          })
          .catch((e) => {
            // eslint-disable-next-line no-console
            console.log(e);
          });

        promises.push(requestTendermintStatusPromise, requestTendermintNetInfoPromise);
      }

      return Promise.all(promises).catch(() => Promise.resolve());
    });

    before('Evaluate block hashes', () => {
      for (const hostName of inventory.masternodes.hosts) {
        if (!masternodeStatus[hostName]) {
          // eslint-disable-next-line no-continue
          continue;
        }

        const {
          result: {
            sync_info: {
              latest_block_height: blockHeight,
              latest_block_hash: blockHash,
            },
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
          if (!masternodeStatus[hostName]) {
            expect.fail(null, null, 'no tenderdash status info');
          }

          expect(masternodeStatusError[hostName]).to.be.undefined();
          expect(masternodeStatusNodeInfo[hostName]).to.deep.include({
            network: masternodeStatusNetworkName[hostName],
            moniker: hostName,
          });
        });

        it('should be connected to peers', () => {
          if (!masternodeNetInfo[hostName]) {
            expect.fail(null, null, 'no tenderdash net info');
          }
          expect(masternodeNetInfoError[hostName]).to.be.undefined();
          expect(masternodeNetInfo[hostName]).to.have.property('listening', true);
          expect(masternodeNetInfo[hostName]).to.have.property('n_peers');
          expect(parseInt(masternodeNetInfo[hostName].n_peers, 10)).to.be.greaterThan(0);
        });

        it('should sync blocks', () => {
          if (!masternodeNetInfo[hostName]) {
            expect.fail(null, null, 'no tenderdash status info');
          }
          const {
            result: {
              sync_info: {
                latest_block_height: blockHeight,
                latest_block_hash: blockHash,
              },
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
