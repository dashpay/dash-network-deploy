const getNetworkConfig = require('../../lib/test/getNetworkConfig');
const { getDocker, execCommand, getContainerId } = require('../../lib/test/docker');

const { variables, inventory, network } = getNetworkConfig();

describe('Tendermint', () => {
  const blockHashes = {};

  describe('All nodes', () => {
    const statusInfo = {};

    before('Collect tenderdash info', async () => {
      const promises = inventory.masternodes.hosts.map(async (hostName) => {
        const docker = getDocker(inventory._meta.hostvars[hostName].public_ip);
        const containerId = await getContainerId(docker, 'dashmate_helper');

        statusInfo[hostName] = await execCommand(docker, containerId,
          ['yarn', 'workspace', 'dashmate', 'dashmate', 'status', 'platform', '--format=json']);
      });

      return Promise.all(promises).catch(console.error);
    });

    before('Evaluate block hashes', () => {
      for (const hostName of inventory.masternodes.hosts) {
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

    for (const hostName of inventory.masternodes.hosts) {
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

          expect(status.tenderdash.network).to.be.equal(networkName)
          expect(status.tenderdash.moniker).to.be.equal(hostName)
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
