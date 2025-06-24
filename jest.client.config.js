/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  displayName: 'client',
  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The test environment that will be used for testing client-side components
  testEnvironment: 'jsdom',

  // The root directory that Jest should scan for tests and modules within.
  // Since this config is at the project root, paths will be relative to it.
  rootDir: '.',

  // A list of paths to directories that Jest should use to search for files in
  // This is effectively covered by testMatch and modulePaths.
  // roots: ['<rootDir>/client/src'],

  // The glob patterns Jest uses to detect test files for the client
  testMatch: [
    '<rootDir>/client/src/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/client/src/**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ['<rootDir>/config/jest/setupTests.ts'], // For @testing-library/jest-dom etc.

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    // Handle CSS imports (e.g., if you import CSS files in Components)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/config/jest/fileMock.js',
    // Path Aliases for client code
    '^@/shared/(.*)$': '<rootDir>/shared/$1', // If client code imports from shared
    '^@/(.*)$': '<rootDir>/client/src/$1',    // Main alias for client/src
    // Fix for ESM imports of .js files if TypeScript compiles to .js extensions in imports
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  
  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '<rootDir>/server/', // Explicitly ignore server tests
    '<rootDir>/shared/', // Explicitly ignore shared tests if they have their own config
  ],

  // Use this preset to support ESM and TypeScript
  preset: 'ts-jest/presets/default-esm',

  transform: {
    '^.+\\.m?[tj]sx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json', // Use root tsconfig.json
      },
    ],
  },
  
  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: ['/node_modules/', '\\.pnp\\.[^\\/]+$'],

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: '<rootDir>/coverage/client', // Separate coverage directory for client

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    '<rootDir>/client/src/**/*.{ts,tsx}',
    '!<rootDir>/client/src/**/*.d.ts',
    '!<rootDir>/client/src/**/*.test.{ts,tsx}',
    '!<rootDir>/client/src/**/__tests__/**',
    '!<rootDir>/client/src/main.tsx', // Exclude entry point
    // Exclude other specific files if necessary, e.g., Storybook stories, test utils not in __tests__
  ],

  // The coverage provider to use for Jest
  coverageProvider: 'v8',

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ['json', 'text', 'lcov', 'clover', 'html'],

  // An object that configures minimum threshold enforcement for coverage results
  coverageThreshold: {
    global: { // Thresholds specific to client code
      branches: 60, // Adjusted slightly lower for initial setup
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};
