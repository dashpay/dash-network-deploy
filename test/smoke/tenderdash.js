const { client: jaysonClient } = require('jayson/promise');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');
const { createDocker, execCommand, getContainerId } = require('../../lib/test/docker');

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

describe('Tenderdash', () => {
  const tenderdashStatuses = {};
  const errors = {};

  const blockHashes = {};

  describe('HP and seed nodes', () => {
    before('Collect tenderdash info', function collect() {
      if (variables.dashmate_platform_enable === false) {
        this.skip('platform is disabled for this network');
      }

      const promises = [];

      for (const hostName of ansibleHosts) {
        const requestTendermintStatusPromise = requestTendermint(
          // eslint-disable-next-line no-underscore-dangle
          inventory._meta.hostvars[hostName].public_ip,
          variables.tendermint_rpc_port,
          'status',
        ).then((result) => {
          if (!tenderdashStatuses[hostName]) {
            tenderdashStatuses[hostName] = {};
          }

          tenderdashStatuses[hostName] = {
            network: result.node_info.network,
            moniker: result.node_info.moniker,
            lastBlockHeight: result.sync_info.latest_block_height,
            lastBlockHash: result.sync_info.latest_block_hash,
            ...tenderdashStatuses[hostName],
          };
        }).catch((error) => {
          errors[hostName] = error;
        });

        const requestTendermintNetInfoPromise = requestTendermint(
          // eslint-disable-next-line no-underscore-dangle
          inventory._meta.hostvars[hostName].public_ip,
          variables.tendermint_rpc_port,
          'net_info',
        ).then((result) => {
          if (!tenderdashStatuses[hostName]) {
            tenderdashStatuses[hostName] = {};
          }

          tenderdashStatuses[hostName] = {
            peers: result.n_peers,
            listening: result.listening,
            ...tenderdashStatuses[hostName],
          };
        }).catch((error) => {
          errors[hostName] = error;
        });

        promises.push(requestTendermintStatusPromise, requestTendermintNetInfoPromise);
      }

      const dashmatePromises = dashmateHosts.map(async (hostName) => {
        const docker = createDocker(inventory.meta.hostvars[hostName].public_ip);

        let containerId;
        try {
          containerId = await getContainerId(docker, 'dashmate_helper');
        } catch (e) {
          errors[hostName] = e;

          throw e;
        }

        try {
          const result = await execCommand(docker, containerId,
            ['yarn', 'workspace', 'dashmate', 'dashmate', 'status', 'platform', '--format=json']);

          tenderdashStatuses[hostName] = result.tenderdash;
        } catch (e) {
          errors[hostName] = e;

          throw e;
        }
      });

      return Promise.all(promises.concat(dashmatePromises)).catch(() => Promise.resolve());
    });

    before('Evaluate block hashes', () => {
      for (const hostName of ansibleHosts.concat(dashmateHosts)) {
        if (!tenderdashStatuses[hostName]) {
          // eslint-disable-next-line no-continue
          continue;
        }

        const {
          tenderdash: {
            lastBlockHeight: blockHeight,
            lastBlockHash: blockHash,
          },
        } = tenderdashStatuses[hostName];

        if (!blockHashes[blockHeight]) {
          blockHashes[blockHeight] = blockHash;
        }
      }
    });

    for (const hostName of dashmateHosts.concat(ansibleHosts)) {
      // eslint-disable-next-line no-loop-func
      describe(hostName, () => {
        it('should be connected to the network', () => {
          if (errors[hostName]) {
            expect.fail(errors[hostName]);
          }

          if (!tenderdashStatuses[hostName]) {
            expect.fail('can\'t get tenderdash status');
          }

          let networkName = `dash-${network.name}`;
          if (variables.tenderdash_chain_id !== undefined) {
            networkName = `dash-${variables.tenderdash_chain_id}`;
          }

          expect(tenderdashStatuses[hostName].network).to.be.equal(networkName);
          expect(tenderdashStatuses[hostName].moniker).to.be.equal(hostName);
        });

        it('should be connected to peers', () => {
          if (errors[hostName]) {
            expect.fail(errors[hostName]);
          }

          if (!tenderdashStatuses[hostName]) {
            expect.fail('can\'t get tenderdash status');
          }

          expect(tenderdashStatuses[hostName]).to.have.property('listening', true);
          expect(tenderdashStatuses[hostName]).to.have.property('peers');
          expect(tenderdashStatuses[hostName].peers).to.be.greaterThan(0);
        });

        it('should sync blocks', () => {
          if (errors[hostName]) {
            expect.fail(errors[hostName]);
          }

          if (!tenderdashStatuses[hostName]) {
            expect.fail('can\'t get tenderdash status');
          }

          const {
            lastBlockHash: blockHash,
            lastBlockHeight: blockHeight,
          } = tenderdashStatuses[hostName];

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
