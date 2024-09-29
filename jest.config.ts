/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [ '**/src/*.ts' ],

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    "json",
    "text",
    "lcov",
    "clover",
    "json-summary"
  ],

  extensionsToTreatAsEsm: ['.ts', '.tsx'], // Treat TypeScript files as ES modules
  
  // A set of global variables that need to be available in all test environments
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  
  // An array of file extensions your modules use
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '^./metric.js$': '<rootDir>/test/__mocks__/metric.js',
    '^./api_access.js$': '<rootDir>/test/__mocks__/api_access.js',
    '^./logger.js$': '<rootDir>/test/__mocks__/logger.js',
    '^@src/(.*)$': '<rootDir>/src/$1',
  },

  // A preset that is used as a base for Jest's configuration
  //preset: 'ts-jest/presets/default-esm',
  
  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/test'],

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  //setupFilesAfterEnv: [ '<rootDir>/test/setupJest.ts' ],

  // The test environment that will be used for testing
  testEnvironment: 'node',
  
  // This option allows use of a custom test runner
  //testRunner: "jest-circus/runner",

  // This tells Jest to use ts-jest for TS files
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
    }], // For TypeScript files
    '^.+\\.js$': 'babel-jest', // For JS files using ES module syntax
  },
  
  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    '/node_modules/(?!(@octokit/rest | @octokit/core)/)', // Tell Jest to transform @octokit/rest
  ],
  
  // The glob patterns Jest uses to detect test files
  // testMatch: ['**/*.test.ts'],

  // The regexp pattern or array of patterns that Jest uses to detect test files
  testRegex: ['/test/.*\\.(test|spec)?\\.(ts|tsx)$'],

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // All imported modules in your tests should be mocked automatically
  // automock: false,

  // Stop running tests after `n` failures
  // bail: 0,

  // The directory where Jest should store its cached dependency information
  // cacheDirectory: "/private/var/folders/y2/55p3rv3945d36y48yf8glbdh0000gn/T/jest_dx",
  
  // An array of regexp pattern strings used to skip coverage collection
  // coveragePathIgnorePatterns: [
  //   "/node_modules/"
  // ],
  
  // An object that configures minimum threshold enforcement for coverage results
  // coverageThreshold: undefined,

  // A path to a custom dependency extractor
  // dependencyExtractor: undefined,
  
  
  // Make calling deprecated APIs throw helpful error messages
  // errorOnDeprecated: false,

  // The default configuration for fake timers
  // fakeTimers: {
  //   "enableGlobally": false
  // },

  // Force coverage collection from ignored files using an array of glob patterns
  // forceCoverageMatch: [],

  // A path to a module which exports an async function that is triggered once before all test suites
  // globalSetup: undefined,

  // A path to a module which exports an async function that is triggered once after all test suites
  // globalTeardown: undefined,

  // The maximum amount of workers used to run your tests. Can be specified as % or a number. E.g. maxWorkers: 10% will use 10% of your CPU amount + 1 as the maximum worker number. maxWorkers: 2 will use a maximum of 2 workers.
  // maxWorkers: "50%",

  // An array of directory names to be searched recursively up from the requiring module's location
  // moduleDirectories: [
  //   "node_modules"
  // ],

  // An array of regexp pattern strings, matched against all module paths before considered 'visible' to the module loader
  // modulePathIgnorePatterns: [],

  // Activates notifications for test results
  // notify: false,

  // An enum that specifies notification mode. Requires { notify: true }
  // notifyMode: "failure-change",

  // Run tests from one or more projects
  // projects: undefined,

  // Use this configuration option to add custom reporters to Jest
  // reporters: undefined,

  // Automatically reset mock state before every test
  // resetMocks: false,

  // Reset the module registry before running each individual test
  // resetModules: false,

  // A path to a custom resolver
  // resolver: undefined,

  // Automatically restore mock state and implementation before every test
  // restoreMocks: false,

  // The root directory that Jest should scan for tests and modules within
  // rootDir: undefined,

  // Allows you to use a custom runner instead of Jest's default test runner
  // runner: "jest-runner",

  // The paths to modules that run some code to configure or set up the testing environment before each test
  // setupFiles: ['./test/setup.js'],

  // The number of seconds after which a test is considered as slow and reported as such in the results.
  // slowTestThreshold: 5,

  // A list of paths to snapshot serializer modules Jest should use for snapshot testing
  // snapshotSerializers: [],

  // Options that will be passed to the testEnvironment
  // testEnvironmentOptions: {},
  
  // Adds a location field to test results
  // testLocationInResults: false,

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  // testPathIgnorePatterns: [
  //   "/node_modules/"
  // ],

  // This option allows the use of a custom results processor
  // testResultsProcessor: undefined,

  // A map from regular expressions to paths to transformers
  // transform: undefined,

  // An array of regexp pattern strings that are matched against all modules before the module loader will automatically return a mock for them
  // unmockedModulePathPatterns: undefined,
};