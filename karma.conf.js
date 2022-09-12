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
      mocha: {
        timeout: 15000, // set timeout for mocha when running karma browser tests
      },
    },
  });
  config.set({
    frameworks: ['mocha', 'chai', 'webpack'],
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
      resolve: {
        fallback: {
          fs: false,
          crypto: require.resolve('crypto-browserify'),
          stream: require.resolve('stream-browserify'),
          path: false,
        },
      },
      plugins: [
        new webpack.ProvidePlugin({
          process: 'process/browser',
        }),
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
    },
    plugins: [
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-chai',
      'karma-firefox-launcher',
      'karma-webpack',
    ],
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
