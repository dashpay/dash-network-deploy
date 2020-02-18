const webpack = require('webpack');

const getNetworkConfig = require('./lib/test/getNetworkConfig');

const { inventory, variables } = getNetworkConfig();

module.exports = (config) => {
  config.set({
    client: {
      testVariables: {
        inventory,
        variables,
      },
    },
  });
  config.set({
    frameworks: ['mocha', 'chai'],
    files: [
      'lib/test/karma/loader.js',
    ],
    preprocessors: {
      'lib/test/karma/loader.js': ['webpack'],
    },
    webpack: {
      mode: 'development',
      optimization: {
        minimize: false,
      },
      plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
      ],
    },
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['FirefoxHeadless'],
    singleRun: false,
    concurrency: Infinity,
    customLaunchers: {
      FirefoxHeadless: {
        base: 'Firefox',
        flags: ['-headless'],
      },
    },
  });
};
