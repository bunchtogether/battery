

const path = require('path');
const os = require('os');
const { babel } = require('@rollup/plugin-babel');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const nodePolyfills = require('rollup-plugin-polyfill-node');
const replace = require('@rollup/plugin-replace');

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
        pattern: 'tests/lib/worker.js', 
        watched: true, 
        served: true, 
        included: false,
        type: 'module'
      },
      { 
        pattern: 'tests/lib/worker-alt.js', 
        watched: true, 
        served: true, 
        included: false,
        type: 'module'
      },
    ],
    autoWatch: true,
    singleRun: !!process.env.SINGLE_RUN,
    failOnEmptyTestSuite: true,
    logLevel: config.LOG_INFO,
    frameworks: ['jasmine', 'jasmine-matchers', 'source-map-support'],
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
      require('karma-jasmine-html-reporter'), // eslint-disable-line
      require('karma-coverage') // eslint-disable-line
    ],
    reporters: ['spec', 'kjhtml', 'coverage'],
    coverageReporter: {
      dir: 'coverage',
      includeAllSources: true,
      reporters: [
        {'type': 'text'},
        {'type': 'html', subdir: 'html'},
        {'type': 'lcov', subdir: './'}
      ]
    },
    timeStatsReporter: {
      reportTimeStats: true,
      binSize: 1000,
      slowThreshold: 6000, 
      reportSlowestTests: true,
      showSlowTestRankNumber: false,
      longestTestsCount: 5,
      reportOnlyBeyondThreshold: false,
    },
    listenAddress: '0.0.0.0',
    hostname: 'localhost',
    port: 9888,
    retryLimit: 0,
    browserDisconnectTimeout: 10000,
    browserNoActivityTimeout: 150000,
    captureTimeout: 60000,
    client: {
      captureConsole: false,
      clearContext: false,
      runInParent: true,
    },
    rollupPreprocessor: {
      plugins: [
        babel({ babelHelpers: 'bundled' }),
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
        format: 'es',
        sourcemap: 'inline',
      },
    },
    proxies: {
      '/worker.js': 'http://localhost:9888/base/tests/lib/worker.js',
      '/worker-alt.js': 'http://localhost:9888/base/tests/lib/worker-alt.js',
    },
    preprocessors: {
      'karma.entry.js': ['rollup'],
      'tests/lib/worker.js': ['rollup'],
      'tests/lib/worker-alt.js': ['rollup'],
    },
  });
};
