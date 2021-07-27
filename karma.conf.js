
// const makeWebpackConfig = require('./webpack.base.babel')
const path = require('path');
const os = require('os');
const { babel } = require('@rollup/plugin-babel');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const nodePolyfills = require('rollup-plugin-polyfill-node');
const replace = require('@rollup/plugin-replace');
const alias = require('@rollup/plugin-alias');
const { flowPlugin } = require('@bunchtogether/vite-plugin-flow');

const proj = (filePath) => path.resolve(__dirname, filePath);

module.exports = function (config) {
  config.set({
    basePath: '',
    exclude: [],
    files: [
      {
        pattern: 'karma.entry.js',
        watched: true,
        served: true,
        included: true,
        type: 'module',
      },
      {
        pattern: 'src/**/*',
        watched: true,
        served: false,
        included: false,
        type: 'module',
      },
      {
        pattern: 'tests/files/**/*',
        watched: false,
        served: true,
        included: false,
      },
      { 
        pattern: 'tests/lib/worker.js', 
        watched: true, 
        served: true, 
        included: false,
        type: 'module'
      },
      /* parameters:
          watched: if autoWatch is true all files that have watched set to true will be watched for changes
          served: should the files be served by Karma's webserver?
          included: should the files be included in the browser using <script> tag?
          nocache: should the files be served from disk on each request by Karma's webserver? */
      /* assets:
          {pattern: '*.html', watched:true, served:true, included:false}
          {pattern: 'images/*', watched:false, served:true, included:false} */
    ],

    // executes the tests whenever one of the watched files changes
    autoWatch: true,
    // if true, Karma will run tests and then exit browser
    singleRun: false,
    // if true, Karma fails on running empty test-suites
    failOnEmptyTestSuite: true,
    // reduce the kind of information passed to the bash
    logLevel: config.LOG_INFO, // config.LOG_DISABLE, config.LOG_ERROR, config.LOG_INFO, config.LOG_DEBUG

    // list of frameworks you want to use, only jasmine is installed automatically
    frameworks: ['jasmine', 'jasmine-matchers', 'source-map-support'],
    // list of browsers to launch and capture
    browsers: ['ChromeServiceWorker'],

    customHeaders: [{
      match: '.*.html',
      name: 'Service-Worker-Allowed',
      value: '/',
    }],

    customLaunchers: {
      ChromeServiceWorker: {
        base: 'Chrome',
        flags: ['--disable-web-security', '--disable-site-isolation-trials', '--auto-open-devtools-for-tabs', '--enable-features=NetworkService', '--no-sandbox', '--disable-dev-shm-usage'],
      },
    },

    plugins: [
      require('karma-chrome-launcher'), // eslint-disable-line
      require('karma-jasmine'), // eslint-disable-line,
      require('karma-jasmine-matchers'), // eslint-disable-line,
      require('karma-source-map-support'), // eslint-disable-line
      require('karma-spec-reporter'), // eslint-disable-line
      require('karma-rollup-preprocessor'), // eslint-disable-line
      require('karma-jasmine-html-reporter') // eslint-disable-line
    ],

    // list of reporters to use
    reporters: ['spec', 'kjhtml'],

    timeStatsReporter: {
      reportTimeStats: true, // Print Time Stats (histogram)
      binSize: 1000, // Bin size for histogram (in milliseconds)
      slowThreshold: 6000, // The threshold for what is considered a slow test (in milliseconds).
      // This is also the max value for last bin histogram
      // Note that this will automatically be rounded up to be evenly divisible by binSize
      reportSlowestTests: true, // Print top slowest tests
      showSlowTestRankNumber: false, // Displays rank number next to slow tests, e.g. `1) Slow Test`
      longestTestsCount: 5, // Number of top slowest tests to list
      // Set to `Infinity` to show all slow tests. Useful in combination with `reportOnlyBeyondThreshold` as `true`
      reportOnlyBeyondThreshold: false, // Only report tests that are slower than threshold
    },

    // address that the server will listen on, '0.0.0.0' is default
    listenAddress: '0.0.0.0',
    // hostname to be used when capturing browsers, 'localhost' is default
    hostname: 'localhost',
    // the port where the web server will be listening, 9876 is default
    port: 9876,
    // when a browser crashes, karma will try to relaunch, 2 is default
    retryLimit: 0,
    // how long does Karma wait for a browser to reconnect, 2000 is default
    browserDisconnectTimeout: 10000,
    // how long will Karma wait for a message from a browser before disconnecting from it, 10000 is default

    browserNoActivityTimeout: 150000,

    // timeout for capturing a browser, 60000 is default
    captureTimeout: 60000,

    client: {
      //     // capture all console output and pipe it to the terminal, true is default
      captureConsole: false,
      //     // if true, Karma clears the context window upon the completion of running the tests, true is default
      clearContext: false,
      //     // run the tests on the same window as the client, without using iframe or a new window, false is default
      runInParent: true,
      //     // true: runs the tests inside an iFrame; false: runs the tests in a new window, true is default
      //     useIframe: false,
      //      jasmine: {
      //        // tells jasmine to run specs in semi random order, false is default
      //        random: false,
      //        defaultTimeoutInterval: 30000,
      //      },
    },
    rollupPreprocessor: {
      /**
       * This is just a normal Rollup config object,
       * except that `input` is handled for you.
       */
      plugins: [
        babel({ babelHelpers: 'bundled' }),
        commonjs({
          dynamicRequireTargets: [
            // include using a glob pattern (either a string or an array of strings)
            'node_modules/hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js',
          ],
        }),
        alias({
          entries: {
            lib: proj('app/lib'),
            utils: proj('app/utils'),
            'shared-redux': proj('app/vendor/bunch-redux/src/vendor/shared-redux'),
            'bunch-redux': proj('app/vendor/bunch-redux'),
            'isomorphic-ws': proj('app/lib/websocket-shim'),
          },
        }),
        nodePolyfills(),
        nodeResolve({
          preferBuiltins: true,
        }),
        replace({
          preventAssignment: true,
          values: {
            __DEV__: 'true',
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
          },
        }),
      ],
      output: {
        format: 'es', // Helps prevent naming collisions.
        sourcemap: 'inline', // Sensible for testing.
      },
    },
    proxies: {
      '/worker.js': 'http://localhost:9876/base/tests/lib/worker.js',
    },
    preprocessors: {
      // add webpack as preprocessor to support require() in test-suites .js files
      'karma.entry.js': ['rollup'],
      'tests/lib/worker.js': ['rollup'],
    },
  });
};
