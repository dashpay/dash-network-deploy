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

        const tendermintClient = jaysonClient.http({
          // eslint-disable-next-line no-underscore-dangle
          host: inventory._meta.hostvars[hostName].public_ip,
          port: variables.tendermint_rpc_port,
        });

        const { result, error } = await tendermintClient.request('net_info', {});

        expect(error).to.be.undefined();
        expect(result).to.have.property('listening', true);
        expect(result).to.have.property('n_peers');

        const peersNumber = parseInt(result.n_peers, 10);

        expect(peersNumber).to.be.at.least(inventory.masternodes.hosts.length - 1);
      });
    });
  }

  describe('All masternodes', () => {
    it('should propagates blocks', async function it() {
      if (!variables.evo_services) {
        this.skip('Evolution services are not enabled');

        return;
      }

      this.slow(inventory.masternodes.hosts.length * 2000);
      this.timeout(inventory.masternodes.hosts.length * 3000);

      const blockHashes = {};

      for (const hostName of inventory.masternodes.hosts) {
        if (!masternodeStatuses[hostName]) {
          expect.fail(`can't connect to ${hostName}`);
        }

        const {
          result: {
            sync_info: {
              latest_block_height: blockHeight,
              latest_block_hash: blockHash,
            },
          },
        } = masternodeStatuses[hostName];

        if (!blockHashes[blockHeight]) {
          blockHashes[blockHeight] = blockHash;
        }

        expect(blockHashes[blockHeight]).to.be.equal(blockHash);
      }

      const blocksCounts = Object.keys(blockHashes);
      expect(Math.max(...blocksCounts) - Math.min(...blocksCounts)).to.be.below(3);
    });
  });
});
