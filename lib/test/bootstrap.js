/* eslint-disable no-console */

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

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);
process.on('SIGINT', async () => {
  await shutdownVpnClient();
  process.exit(1);
});

global.expect = expect;
