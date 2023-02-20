const { client: jaysonClient } = require('jayson/promise');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');
const { getDocker, execCommand, getContainerId } = require('../../lib/test/docker');

const { variables, inventory, network } = getNetworkConfig();

const ansibleHosts = inventory.seed_nodes.hosts;
const dashmateHosts = inventory.hp_masternodes.hosts;

function requestTendermint(host, port, path) {
  const tendermintClient = jaysonClient.http({
    host,
    port,
  });

  return new Promise((resolve, reject) => {
    tendermintClient.on('http error', (error) => {
      reject(error);
    });

    const timeout = setTimeout(() => {
      reject(new Error(`timeout connecting to ${host}:${port}`));
    }, 10000); // 10s timeout

    tendermintClient.on('http response', () => {
      clearTimeout(timeout);
    });

    tendermintClient.request(path, {})
      .then(({ result, error }) => {
        if (error) {
          reject(new Error(error));

          return;
        }

        resolve(result);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

describe('Tendermint', () => {
  const masternodeStatus = {};
  const masternodeStatusError = {};

  const masternodeNetInfo = {};
  const masternodeNetInfoError = {};

  const blockHashes = {};

  describe('All nodes', () => {
    const statusInfo = {};

    before('Collect tenderdash info', () => {
      const promises = [];

      for (const hostName of ansibleHosts) {
        const requestTendermintStatusPromise = requestTendermint(
          // eslint-disable-next-line no-underscore-dangle
          inventory._meta.hostvars[hostName].public_ip,
          variables.tendermint_rpc_port,
          'status',
        ).then((result) => {
          masternodeStatus[hostName] = result;
        }).catch((error) => {
          masternodeStatusError[hostName] = error;
        });

        const requestTendermintNetInfoPromise = requestTendermint(
          // eslint-disable-next-line no-underscore-dangle
          inventory._meta.hostvars[hostName].public_ip,
          variables.tendermint_rpc_port,
          'net_info',
        ).then((result) => {
          masternodeNetInfo[hostName] = result;
        }).catch((error) => {
          masternodeNetInfoError[hostName] = error;
        });

        promises.push(requestTendermintStatusPromise, requestTendermintNetInfoPromise);
      }

      const dashmatePromises = dashmateHosts.map(async (hostName) => {
        const docker = getDocker(inventory.meta.hostvars[hostName].public_ip);
        const containerId = await getContainerId(docker, 'dashmate_helper');

        statusInfo[hostName] = await execCommand(docker, containerId,
          ['yarn', 'workspace', 'dashmate', 'dashmate', 'status', 'platform', '--format=json']);
      });

      return Promise.all(promises.concat(dashmatePromises)).catch(console.error);
    });

    before('Evaluate block hashes', () => {
      for (const hostName of ansibleHosts) {
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

      for (const hostName of dashmateHosts) {
        const status = statusInfo[hostName];

        if (!status) {
          // eslint-disable-next-line no-continue
          continue;
        }

        const { tenderdash } = status;
        const { lastBlockHeight: blockHeight, lastBlockHash: blockHash } = tenderdash;

        if (!blockHashes[blockHeight]) {
          blockHashes[blockHeight] = blockHash;
        }
      }
    });

    for (const hostName of ansibleHosts) {
      describe(hostName, () => {
        it('should be connected to the network', () => {
          if (masternodeStatusError[hostName]) {
            expect.fail(masternodeStatusError[hostName]);
          }

          let networkName = `dash-${network.name}`;
          if (variables.tenderdash_chain_id !== undefined) {
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

    for (const hostName of dashmateHosts) {
      describe(hostName, () => {
        it('should be connected to the network', () => {
          const status = statusInfo[hostName];

          if (!status) {
            expect.fail(`No status info for node on ${hostName}`);
          }

          let networkName = `dash-${network.name}`;
          if (variables.tenderdash_chain_id !== undefined) {
            networkName = `dash-${variables.tenderdash_chain_id}`;
          }

          expect(status.tenderdash.network).to.be.equal(networkName);
          expect(status.tenderdash.moniker).to.be.equal(hostName);
        });

        it('should be connected to peers', () => {
          const status = statusInfo[hostName];

          if (!status) {
            expect.fail(`No status info for node on ${hostName}`);
          }

          expect(status.tenderdash).to.have.property('listening', true);
          expect(status.tenderdash).to.have.property('peers');
          expect(status.tenderdash.peers).to.be.greaterThan(0);
        });

        it('should sync blocks', () => {
          const status = statusInfo[hostName];

          if (!status) {
            expect.fail(`No status info for node on ${hostName}`);
          }

          const { lastBlockHash: blockHash, lastBlockHeight: blockHeight } = status.tenderdash;

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
