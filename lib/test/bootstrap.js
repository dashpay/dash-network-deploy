const { expect, use } = require('chai');
const dirtyChai = require('dirty-chai');
const chaiAsPromised = require('chai-as-promised');

use(chaiAsPromised);
use(dirtyChai);

process.env.NODE_ENV = 'test';

global.expect = expect;
