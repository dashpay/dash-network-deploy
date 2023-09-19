const RpcClientPromise = require('@dashevo/dashd-rpc/promise');
const RpcClient = require('@dashevo/dashd-rpc');
const getNetworkConfig = require('./getNetworkConfig');

const { inventory, variables } = getNetworkConfig();

/**
 * @param {string} hostName
 * @return {RpcClientPromise}
 */
function createRpcClientFromConfig(hostName) {
  const options = {
    protocol: 'http',
    user: variables.dashd_rpc_user,
    pass: variables.dashd_rpc_password,
    host: inventory.meta.hostvars[hostName].public_ip,
    port: variables.dashd_rpc_port,
  };

  RpcClient.config.logger = 'none';

  return new RpcClientPromise(options);
}

module.exports = createRpcClientFromConfig;
