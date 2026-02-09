/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/lib', '<rootDir>/apps'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      isolatedModules: true,  // Faster compilation
    }],
  },
  cache: false,  // Disable Jest cache completely
  collectCoverageFrom: [
    'lib/**/*.{js,ts}',
    '!lib/**/*.d.ts',
    '!lib/types/**',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
};
