const { defineConfig } = require('cypress');

// Safety checks are handled by scripts/check-cypress-env.js
// This file will still validate but the main check happens in the script

const baseUrl = process.env.CYPRESS_BASE_URL || 'http://localhost:3000';

module.exports = defineConfig({
  e2e: {
    baseUrl: baseUrl,
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    setupNodeEvents(on, config) {
      // Final safety check in setup (redundant but extra safety)
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Cypress cannot run in production environment');
      }
      // Check for production URLs
      const baseUrl = config.baseUrl || 'http://localhost:3000';
      const productionDomains = ['micro.manish.online', 'cdn.micro.manish.online'];
      if (productionDomains.some(domain => baseUrl.includes(domain))) {
        throw new Error(`Cypress cannot run against production domain: ${baseUrl}`);
      }
      // implement node event listeners here
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
  },
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
  },
});

