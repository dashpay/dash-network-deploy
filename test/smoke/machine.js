const { client: jaysonClient } = require('jayson/promise');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { variables, inventory, network } = getNetworkConfig();

describe('Machine', () => {
  const masternodeStatusPromises = {};

  before(async () => {
    if (!variables.evo_services) {
      this.skip('Evolution services are not enabled');
      return;
    }

    for (const hostName of inventory.masternodes.hosts) {
      const machineClient = jaysonClient.http({
        // eslint-disable-next-line no-underscore-dangle
        host: inventory._meta.hostvars[hostName].public_ip,
        port: variables.tendermint_rpc_port,
      });

      masternodeStatusPromises[hostName] = machineClient.request('status', {});
    }
  });

  it('should propagates blocks', async function it() {
    if (!variables.evo_services) {
      this.skip('Evolution services are not enabled');

      return;
    }

    this.slow(inventory.masternodes.hosts.length * 2000);
    this.timeout(inventory.masternodes.hosts.length * 3000);

    const blockHashes = {};

    for (const hostName of inventory.masternodes.hosts) {
      const {
        result: {
          sync_info: {
            latest_block_height: blockHeight,
            latest_block_hash: blockHash,
          },
        },
      } = await masternodeStatusPromises[hostName];

      if (!blockHashes[blockHeight]) {
        blockHashes[blockHeight] = blockHash;
      }

      expect(blockHashes[blockHeight]).to.be.equal(blockHash);
    }

    const blocksCounts = Object.keys(blockHashes);
    expect(Math.max(...blocksCounts) - Math.min(...blocksCounts)).to.be.below(3);
  });

  for (const hostName of inventory.masternodes.hosts) {
    describe(hostName, () => {
      let machineClient;

      beforeEach(() => {
        machineClient = jaysonClient.http({
          // eslint-disable-next-line no-underscore-dangle
          host: inventory._meta.hostvars[hostName].public_ip,
          port: variables.tendermint_rpc_port,
        });
      });

      it('should be connected to the network', async function it() {
        if (!variables.evo_services) {
          this.skip('Evolution services are not enabled');

          return;
        }

        const { result: { node_info: nodeInfo }, error } = await masternodeStatusPromises[hostName];

        expect(error).to.be.undefined();

        expect(nodeInfo).to.deep.include({
          network: `dash-${network.name}`,
          moniker: hostName,
        });
      });

      it('should be interconnected with all masternodes', async function it() {
        if (!variables.evo_services) {
          this.skip('Evolution services are not enabled');

          return;
        }

        const { result, error } = await machineClient.request('net_info', {});

        expect(error).to.be.undefined();
        expect(result).to.include({
          listening: true,
          n_peers: (inventory.masternodes.hosts.length - 1).toString(),
        });
      });
    });
  }
});
