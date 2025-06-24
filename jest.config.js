/**
 * Root Jest config — **server-only**.
 *
 * The repo now uses **split configuration** to avoid the OOM issues we saw
 * when Jest tried to walk the entire monorepo in one process:
 *
 *   • jest.config.js           →  server tests (this file)
 *   • jest.client.config.js    →  client / React component tests
 *
 * CI will run them independently (`jest -c jest.client.config.js` etc.).
 */
export default {
  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // --- Coverage ---
  collectCoverage: true,
  coverageDirectory: 'coverage/server',
  collectCoverageFrom: [
    '<rootDir>/server/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.test.{ts,tsx}',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!<rootDir>/server/index.ts',
    '!<rootDir>/dist/**',
  ],

  // The coverage provider to use for Jest
  coverageProvider: 'v8',

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ['json', 'text', 'lcov', 'clover', 'html'],

  // An object that configures minimum threshold enforcement for coverage results
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    // Handle CSS imports (e.g., if you import CSS files in Components)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/config/jest/fileMock.js', // This file needs to be created
    // Path Aliases - Order is important!
    // Specific alias for @/shared to ensure server/shared imports work as written
    '^@/shared/(.*)$': '<rootDir>/shared/$1',
    // General alias for @/ based on tsconfig.json (primarily for client-side code)
    '^@/(.*)$': '<rootDir>/client/src/$1',
    // Fix for ESM imports of .js files if TypeScript compiles to .js extensions in imports
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // The root directory that Jest should scan for tests and modules within
  rootDir: '.',

  // A list of paths to directories that Jest should use to search for files in
  // roots: ['<rootDir>/client/src', '<rootDir>/server', '<rootDir>/shared'], // Alternative to projects if not using different environments

  // The paths to modules that run some code to configure or set up the testing environment before each test
  // setupFiles: [], // If any global setup is needed before test framework

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  // setupFilesAfterEnv: ['<rootDir>/config/jest/setupTests.ts'], // Moved to client project

  // A list of paths to snapshot serializer modules Jest should use for snapshot testing
  // snapshotSerializers: [],

  // All server tests run in Node environment
  testEnvironment: 'node',

  // Options that will be passed to the testEnvironment
  // testEnvironmentOptions: {},

  // The glob patterns Jest uses to detect test files
  // testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'], // Defined per project

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '<rootDir>/client/'],

  // This option allows use of a custom transformer without breaking line mapping logic
  // transform: {}, // Defined per project or globally below

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: ['/node_modules/', '\\.pnp\\.[^\\/]+$'],

  // Indicates whether each test should be run in a separate process
  // watchman: true,

  // An array of regexp pattern strings that are matched against all modules before access, matched modules are targeted for transformation
  // unmockedModulePathPatterns: [],

  // Use this preset to support ESM and TypeScript
  preset: 'ts-jest/presets/default-esm',

  transform: {
    '^.+\\.m?[tj]sx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json', // Use root tsconfig to avoid missing per-folder files
      },
    ],
  },

  // Only run server tests; client & shared have their own configs
  testMatch: [
    '<rootDir>/server/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/server/**/?(*.)+(spec|test).[jt]s?(x)',
  ],
};
