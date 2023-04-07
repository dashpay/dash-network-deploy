const { client: jaysonClient } = require('jayson/promise');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');
const { createDocker, execCommand, getContainerId } = require('../../lib/test/docker');

const { variables, inventory, network } = getNetworkConfig();

const dashmateHosts = inventory.hp_masternodes.hosts;

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

      const dashmatePromises = dashmateHosts.map(async (hostName) => {
        const docker = createDocker(inventory.meta.hostvars[hostName].public_ip);

        let containerId;
        try {
          containerId = await getContainerId(docker, 'dashmate_helper');
        } catch (e) {
          errors[hostName] = e;
        }

        if (!containerId) {
          return;
        }

        try {
          statusInfo[hostName] = await execCommand(docker, containerId,
            ['curl',
              '--silent',
              '-X',
              'POST',
              '-H',
              'Content-Type: application/json',
              '-d',
              '{"jsonrpc":"2.0","id":"id","method":"status platform","params": {"format": "json"}}',
              'localhost:9000']);

          tenderdashStatuses[hostName] = result.tenderdash;
        } catch (e) {
          errors[hostName] = e;
        }
      });

      return Promise.all(promises.concat(dashmatePromises)).catch(() => Promise.resolve());
    });

    before('Evaluate block hashes', () => {
      for (const hostName of dashmateHosts) {
        if (!tenderdashStatuses[hostName]) {
          // eslint-disable-next-line no-continue
          continue;
        }

        const {
          lastBlockHeight: blockHeight,
          lastBlockHash: blockHash,
        } = tenderdashStatuses[hostName];

        if (!blockHashes[blockHeight]) {
          blockHashes[blockHeight] = blockHash;
        }
      }
    });

    for (const hostName of dashmateHosts) {
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
