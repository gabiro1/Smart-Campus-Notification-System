export default {
  rootDir: '..',
  transform: {},
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  moduleNameMapper: {
    '.*/config/firebaseAdmin\\.js$': '<rootDir>/tests/__mocks__/firebaseAdmin.js',
    '.*/config/firebaseAdmin': '<rootDir>/tests/__mocks__/firebaseAdmin.js',
  },
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
};
