module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.test.[tj]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: { '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { module: 'commonjs' } }] },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup-tests.cjs'],
};
