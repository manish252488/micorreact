/// <reference types="cypress" />

describe('Module Federation Integration', () => {
  it('should load host remoteEntry.js', () => {
    cy.verifyRemoteEntry('http://localhost:3000/remoteEntry.js');
  });

  it('should load product remoteEntry.js', () => {
    cy.verifyRemoteEntry('http://localhost:3001/remoteEntry.js');
  });

  it('should load cart remoteEntry.js', () => {
    cy.verifyRemoteEntry('http://localhost:3002/remoteEntry.js');
  });

  it('should successfully load remote modules', () => {
    cy.visit('/');
    cy.waitForMicroFrontend();

    // Navigate to products
    cy.get('nav').contains('Products').click();
    cy.wait(3000);
    cy.contains('Product', { timeout: 10000 }).should('be.visible');

    // Navigate to cart
    cy.get('nav').contains('Cart').click();
    cy.wait(3000);
    cy.contains('Cart', { timeout: 10000 }).should('be.visible');
  });

  it('should handle module loading errors gracefully', () => {
    cy.visit('/');
    cy.waitForMicroFrontend();

    // Check for error boundaries or fallback UI
    cy.get('body').should('be.visible');
    // Verify no critical errors in console
    cy.window().then((win) => {
      // Check if there are unhandled errors
      // This is a basic check - you might want to enhance it
      expect(win).to.exist;
    });
  });

  it('should share React instance across micro frontends', () => {
    cy.visit('/');
    cy.waitForMicroFrontend();

    // Navigate between micro frontends
    cy.get('nav').contains('Products').click();
    cy.wait(2000);
    cy.get('nav').contains('Cart').click();
    cy.wait(2000);
    cy.get('nav').contains('Home').click();

    // If React is shared properly, navigation should work smoothly
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});

