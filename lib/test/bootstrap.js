const { expect, use } = require('chai');
const dirtyChai = require('dirty-chai');
const chaiAsPromised = require('chai-as-promised');

const {
  waitForConnection: waitForVpnConnection,
  shutdown: shutdownVpnClient,
} = require('./openVpn');

use(chaiAsPromised);
use(dirtyChai);

process.env.NODE_ENV = 'test';

before(waitForVpnConnection);

after(shutdownVpnClient);

global.expect = expect;
