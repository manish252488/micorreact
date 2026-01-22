/**
 * Jest Setup for Contract Tests
 * 
 * This file sets up the testing environment for contract tests.
 */

// Mock fetch for remote entry tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    headers: {
      get: () => 'application/javascript',
    },
  })
);

// Setup React Testing Library
require('@testing-library/jest-dom');

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

