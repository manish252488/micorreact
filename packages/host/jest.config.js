module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  moduleNameMapper: {
    '^host/store$': '<rootDir>/src/store/index.js',
    '^host/utils$': '<rootDir>/../shared-utils/src/index.js',
    '^product/ProductApp$': '<rootDir>/../product/src/App.jsx',
    '^cart/CartApp$': '<rootDir>/../cart/src/App.jsx',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react|react-dom|react-router-dom|@testing-library|redux|react-redux)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/index.jsx',
  ],
  testMatch: [
    '<rootDir>/src/__tests__/**/*.test.js',
  ],
  moduleFileExtensions: ['js', 'jsx', 'json'],
};

