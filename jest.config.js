module.exports = {
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.spec.ts',
      '!src/**/*.e2e-spec.ts',
      '!src/main.ts',
      '!src/**/*.module.ts'
    ],
    coveragePathIgnorePatterns: [
      'node_modules',
      'test-config',
      'interfaces',
      'jestGlobalMocks.ts',
      '.module.ts',
      '.mock.ts'
    ],
    // Add configuration for finding related tests
    testMatch: ['**/*.spec.ts'],
    moduleNameMapper: {
      '^src/(.*)$': '<rootDir>/src/$1'
    }
  };