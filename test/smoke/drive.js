const net = require('net');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { variables, inventory } = getNetworkConfig();

async function sendEcho(ip) {
  const echoRequestBytes = Buffer.from('0e12050a03010203', 'hex');

  return new Promise((resolve, reject) => {
    const client = net.connect(26658, ip);

    client.on('connect', () => {
      client.write(echoRequestBytes);
    });

    client.on('data', () => {
      client.destroy();

      resolve();
    });

    client.on('error', reject);

    setTimeout(() => {
      reject(new Error('Can\'t connect to ABCI port: timeout.'));
    }, 2000);
  });
}

describe('Drive', () => {
  describe('seed-1', () => {
    it('should listen for ABCI connection', async function it() {
      if (!variables.evo_services) {
        this.skip('Evolution services are not enabled');

        return;
      }

      // eslint-disable-next-line no-underscore-dangle
      await sendEcho(inventory._meta.hostvars['seed-1'].public_ip);
    });
  });

  for (const hostName of inventory.masternodes.hosts) {
    describe(hostName, () => {
      it('should listen for ABCI connection', async function it() {
        if (!variables.evo_services) {
          this.skip('Evolution services are not enabled');

          return;
        }

        // eslint-disable-next-line no-underscore-dangle
        await sendEcho(inventory._meta.hostvars[hostName].public_ip);
      });
    });
  }
});
