const vpnManager = require('node-openvpn');

// Sorry guys for this shit.
// Please say thank you to Luigi Poole (node-openvpn author).
// Here we go...

let vpn;

async function waitForConnection() {
  vpn = await vpnManager.connect({
    host: process.env.OPENVPN_MANAGMENT_HOST,
    port: process.env.OPENVPN_MANAGMENT_PORT,
    timeout: 1500,
  });

  return new Promise((resolve, reject) => {
    // Waiting for 'connected' state
    vpn.on('state-change', (state) => {
      const [, name, status] = state;
      if (name === 'CONNECTED' && status === 'SUCCESS') {
        resolve();
      }
    });

    // Handle errors
    vpn.on('error', reject);
    vpn.on('close', reject);
    vpn.on('end', reject);

    // Check current state
    vpnManager.cmd('state').then((stateString) => {
      if (stateString.includes('CONNECTED,SUCCESS')) {
        resolve();
      }
    });
  });
}

async function shutdown() {
  // Send SIGTERM to VPN Client
  vpnManager.disconnect();

  function getPromiseFromEvent(item, event) {
    return new Promise((resolve) => {
      const listener = () => {
        item.removeEventListener(event, listener);
        resolve();
      };
      console.log('in promise thing');
      item.addEventListener(event, listener);
    });
  }

  // Close telnet connection to VPN client
  if (vpn) {
    console.log('events are');
    console.log(Object.keys(vpn._events));
    // await new Promise((r) => setTimeout(r, 1000));
    console.log('done waiting');
    await getPromiseFromEvent(vpn, 'disconnected');
    vpn.on('disconnected', () => {
      console.log('destroying after disconnect');
      vpnManager.destroy();
    });
  } else {
    console.log('destroying without vpn.on');
    vpnManager.destroy();
  }
}

// Prevent the hang of the Node process
process.on('uncaughtException', shutdown);
process.on('unhandledRejection', shutdown);
process.on('exit', shutdown);

module.exports = {
  waitForConnection,
  shutdown,
};
