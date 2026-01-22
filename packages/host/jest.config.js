module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  moduleNameMapper: {
    '^host/store$': '<rootDir>/src/store/index.js',
    '^host/utils$': '<rootDir>/../shared-utils/src/index.js',
    '^product/ProductApp$': '<rootDir>/../product/src/App.jsx',
    '^cart/CartApp$': '<rootDir>/../cart/src/App.jsx',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/index.jsx',
  ],
  testMatch: [
    '<rootDir>/src/__tests__/**/*.test.js',
  ],
};

