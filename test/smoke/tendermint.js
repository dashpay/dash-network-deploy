const { client: jaysonClient } = require('jayson/promise');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { variables, inventory, network } = getNetworkConfig();

describe('Tendermint', () => {
  const masternodeStatuses = {};

  for (const hostName of inventory.masternodes.hosts) {
    describe(hostName, () => {
      it('should be connected to the network', async function it() {
        if (!variables.evo_services) {
          this.skip('Evolution services are not enabled');

          return;
        }

        const tendermintClient = jaysonClient.http({
          // eslint-disable-next-line no-underscore-dangle
          host: inventory._meta.hostvars[hostName].public_ip,
          port: variables.tendermint_rpc_port,
        });

        const response = await tendermintClient.request('status', {});

        masternodeStatuses[hostName] = response;

        const { result: { node_info: nodeInfo }, error } = response;

        expect(error).to.be.undefined();

        let networkName = `dash-${network.name}`;
        if (network.type === 'devnet' && variables.dash_devnet_version !== 1) {
          networkName += `-${variables.dash_devnet_version}`;
        }

        expect(nodeInfo).to.deep.include({
          network: networkName,
          moniker: hostName,
        });
      });

      it('should be connected to peers', async function it() {
        if (!variables.evo_services) {
          this.skip('Evolution services are not enabled');

          return;
        }

        const tendermintClient = jaysonClient.http({
          // eslint-disable-next-line no-underscore-dangle
          host: inventory._meta.hostvars[hostName].public_ip,
          port: variables.tendermint_rpc_port,
        });

        const { result, error } = await tendermintClient.request('net_info', {});

        expect(error).to.be.undefined();
        expect(result).to.have.property('listening', true);
        expect(result).to.have.property('n_peers');
        expect(parseInt(result.n_peers, 10)).to.be.greaterThan(0);
      });

      it('should sync blocks', async function it() {
        if (!variables.evo_services) {
          this.skip('Evolution services are not enabled');

          return;
        }

        if (!masternodeStatuses[hostName]) {
          expect.fail('can\'t connect to node');
        }

        const blockHashes = {};

        for (const host of inventory.masternodes.hosts) {
          if (!masternodeStatuses[host]) {
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
          } = masternodeStatuses[host];

          if (!blockHashes[blockHeight]) {
            blockHashes[blockHeight] = blockHash;
          }
        }

        const {
          result: {
            sync_info: {
              latest_block_height: blockHeight,
              latest_block_hash: blockHash,
            },
          },
        } = masternodeStatuses[hostName];

        expect(blockHashes[blockHeight]).to.be.equal(blockHash);

        const blocksCounts = Object.keys(blockHashes).map(c => parseInt(c, 10));
        const maxBlocksCount = Math.max(...blocksCounts);

        const blocksCountDiff = maxBlocksCount - blockHeight;

        if (blocksCountDiff > 3) {
          expect.fail(`${blocksCountDiff} blocks behind`);
        }
      });
    });
  }
});
