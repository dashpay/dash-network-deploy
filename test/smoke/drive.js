const net = require('net');

const getNetworkConfig = require('../../lib/test/getNetworkConfig');

const { inventory } = getNetworkConfig();

async function sendEcho(ip) {
  const echoRequestBytes = Buffer.from('0a0a080a0668656c6c6f21', 'hex');

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
  describe('All nodes', () => {
    const echoInfo = {};

    before('Collect echo info from Drive', () => {
      const promises = [];

      for (const hostName of inventory.hp_masternodes.hosts) {
        // eslint-disable-next-line no-underscore-dangle
        const requestEchoPromise = sendEcho(inventory._meta.hostvars[hostName].public_ip)
          .then(() => {
            echoInfo[hostName] = true;
          })
          .catch((e) => {
            echoInfo[hostName] = e;
          });

        promises.push(requestEchoPromise);
      }

      return Promise.all(promises).catch(() => Promise.resolve());
    });

    for (const hostName of allHosts) {
      describe(hostName, () => {
        it('should listen for ABCI connection', () => {
          if (echoInfo[hostName] !== true) {
            expect.fail(echoInfo[hostName]);
          }
        });
      });
    }
  });
});
