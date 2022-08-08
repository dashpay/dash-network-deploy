const net = require('net');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { inventory } = getNetworkConfig();

async function sendEcho(ip) {
  const echoRequestBytes = Buffer.from('0e12050a03010203', 'hex');
  console.log(echoRequestBytes.toString('hex'));

  return new Promise((resolve, reject) => {
    const client = net.connect(26658, ip);

    client.on('connect', () => {
      console.log('in connect statement');
      client.write(echoRequestBytes);
    });

    client.on('data', () => {
      console.log('in data statement');
      // console.log(data);
      client.destroy();

      resolve();
    });

    client.on('error', () => {
      console.log('in error statement');
      reject(new Error('Error!'));
    });

    setTimeout(() => {
      reject(new Error('Can\'t connect to ABCI port: timeout.'));
    }, 2000);
  });
}

describe('Drive', () => {
  describe('seed-1', () => {
    it('should listen for ABCI connection', async () => {
      // eslint-disable-next-line no-underscore-dangle
      await sendEcho(inventory._meta.hostvars['seed-1'].public_ip);
    });
  });

  for (const hostName of inventory.masternodes.hosts) {
    describe(hostName, () => {
      it('should listen for ABCI connection', async () => {
        // eslint-disable-next-line no-underscore-dangle
        await sendEcho(inventory._meta.hostvars[hostName].public_ip);
      });
    });
  }
});
