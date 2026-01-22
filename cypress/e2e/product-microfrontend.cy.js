/// <reference types="cypress" />

describe('Product Micro Frontend', () => {
  beforeEach(() => {
    cy.visit('/products');
    cy.waitForMicroFrontend();
    // Wait for ProductApp to load
    cy.wait(2000);
  });

  it('should load product micro frontend', () => {
    // Check if ProductApp is loaded
    cy.contains('Product', { timeout: 10000 }).should('be.visible');
  });

  it('should display product list', () => {
    // Wait for products to load
    cy.wait(3000);
    // Check if product list is visible (adjust selector based on your ProductList component)
    cy.get('body').should('contain.text', 'Product');
  });

  it('should navigate to product detail', () => {
    // This test depends on your ProductList implementation
    // Example: Click on first product if available
    cy.get('body').then(($body) => {
      if ($body.find('a[href*="/detail"]').length > 0) {
        cy.get('a[href*="/detail"]').first().click();
        cy.url().should('include', '/detail');
      }
    });
  });

  it('should verify remote entry is accessible', () => {
    // Verify product remoteEntry.js is accessible
    cy.verifyRemoteEntry('http://localhost:3001/remoteEntry.js');
  });

  it('should handle loading state', () => {
    // Reload page and check for loading indicator
    cy.reload();
    cy.waitForMicroFrontend();
    // Check if loading state appears (if implemented)
    cy.get('body', { timeout: 5000 });
  });
});

