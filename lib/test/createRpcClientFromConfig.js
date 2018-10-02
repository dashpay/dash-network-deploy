const RpcClient = require('@dashevo/dashd-rpc/promise');
const getNetworkConfig = require('./getNetworkConfig');

const { inventory, variables } = getNetworkConfig();

/**
 * @param {string} hostName
 * @return {RpcClient}
 */
function createRpcClientFromConfig(hostName) {
  const options = {
    protocol: 'http',
    user: variables.dashd_rpc_user,
    pass: variables.dashd_rpc_password,
    // eslint-disable-next-line no-underscore-dangle
    host: inventory._meta.hostvars[hostName].public_ip,
    port: variables.dashd_rpc_port,
  };

  return new RpcClient(options);
}

module.exports = createRpcClientFromConfig;
