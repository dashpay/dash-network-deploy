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
          dns: false,
          tls: false,
          http2: false,
          zlib: false,
          fs: false,
          path: false,
          net: false,
          os: false,
          http: false,
          https: false,
          assert: require.resolve('assert/'),
          string_decoder: require.resolve('string_decoder/'),
          stream: require.resolve('stream-browserify'),
          crypto: require.resolve('crypto-browserify'),
          buffer: require.resolve('buffer/'),
          events: require.resolve('events/'),
          url: require.resolve('url/'),
          util: require.resolve('util/'),
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
      'karma-chrome-launcher',
      'karma-webpack',
    ],
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['chromeWithoutSecurity'],
    customLaunchers: {
      chromeWithoutSecurity: {
        base: 'ChromeHeadless',
        flags: ['--ignore-certificate-errors'],
        displayName: 'Chrome w/o security',
      },
    },
    singleRun: false,
    concurrency: Infinity,
  });
};
