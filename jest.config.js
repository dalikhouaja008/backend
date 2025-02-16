module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest'
    },
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.module.ts',
      '!src/main.ts',
      '!src/**/*.d.ts'
    ],
    coverageDirectory: './coverage',
    testEnvironment: 'node',
    roots: ['<rootDir>/src/'],
    moduleNameMapper: {
      '^src/(.*)$': '<rootDir>/src/$1'
    }
  };