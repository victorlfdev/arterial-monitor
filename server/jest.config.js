const { defaults } = require('jest-config');

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/**/*.test.js'],
  verbose: true,
  clearMocks: true,
  resetMocks: false,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  transform: {},
};
