// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Wait for micro frontends to load
Cypress.Commands.add('waitForMicroFrontend', (timeout = 10000) => {
  cy.window().then((win) => {
    // Wait for remoteEntry.js to be loaded
    return new Cypress.Promise((resolve) => {
      const checkInterval = 100;
      const maxAttempts = timeout / checkInterval;
      let attempts = 0;

      const checkLoaded = () => {
        attempts++;
        // Check if Module Federation is ready
        if (win.__webpack_require__ || attempts >= maxAttempts) {
          resolve();
        } else {
          setTimeout(checkLoaded, checkInterval);
        }
      };

      checkLoaded();
    });
  });
});

// Custom command to wait for remote modules
Cypress.Commands.add('waitForRemoteModule', (moduleName, timeout = 10000) => {
  cy.window().then((win) => {
    return new Cypress.Promise((resolve, reject) => {
      const checkInterval = 100;
      const maxAttempts = timeout / checkInterval;
      let attempts = 0;

      const checkModule = () => {
        attempts++;
        try {
          // Try to access the module
          if (win.__webpack_require__?.cache?.[moduleName] || attempts >= maxAttempts) {
            resolve();
          } else {
            setTimeout(checkModule, checkInterval);
          }
        } catch (error) {
          if (attempts >= maxAttempts) {
            reject(new Error(`Module ${moduleName} failed to load`));
          } else {
            setTimeout(checkModule, checkInterval);
          }
        }
      };

      checkModule();
    });
  });
});

// Custom command to verify remote entry is accessible
Cypress.Commands.add('verifyRemoteEntry', (url) => {
  cy.request({
    url,
    method: 'GET',
    failOnStatusCode: true,
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.not.be.empty;
  });
});

// Custom command to check if element is visible with retry
Cypress.Commands.add('shouldBeVisible', { prevSubject: 'element' }, (subject, options = {}) => {
  const { timeout = 10000 } = options;
  cy.wrap(subject, { timeout }).should('be.visible');
});

// Hide fetch/XHR requests from command log
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

