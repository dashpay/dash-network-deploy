const { expect, use } = require('chai');
const assertArrays = require('chai-arrays');
const dirtyChai = require('dirty-chai');
const chaiAsPromised = require('chai-as-promised');

const {
  waitForConnection: waitForVpnConnection,
  shutdown: shutdownVpnClient,
} = require('./openVpn');

use(chaiAsPromised);
use(dirtyChai);
use(assertArrays);

process.env.NODE_ENV = 'test';

before(waitForVpnConnection);

after(shutdownVpnClient);

global.expect = expect;
