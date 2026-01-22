/// <reference types="cypress" />

describe('Micro Frontend Navigation', () => {
  beforeEach(() => {
    // Visit the host application
    cy.visit('/');
    // Wait for micro frontends to initialize
    cy.waitForMicroFrontend();
  });

  it('should load the home page', () => {
    cy.contains('Welcome to Micro Frontend Architecture');
    cy.contains('This is the Host/Shell application');
  });

  it('should navigate to products page', () => {
    cy.get('nav').contains('Products').click();
    cy.url().should('include', '/products');
    // Wait for ProductApp to load
    cy.wait(2000);
    cy.contains('Product', { timeout: 10000 }).should('be.visible');
  });

  it('should navigate to cart page', () => {
    cy.get('nav').contains('Cart').click();
    cy.url().should('include', '/cart');
    // Wait for CartApp to load
    cy.wait(2000);
    cy.contains('Cart', { timeout: 10000 }).should('be.visible');
  });

  it('should navigate back to home from products', () => {
    cy.get('nav').contains('Products').click();
    cy.url().should('include', '/products');
    cy.get('nav').contains('Home').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should navigate back to home from cart', () => {
    cy.get('nav').contains('Cart').click();
    cy.url().should('include', '/cart');
    cy.get('nav').contains('Home').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should have all navigation links visible', () => {
    cy.get('nav').should('be.visible');
    cy.get('nav').contains('Home');
    cy.get('nav').contains('Products');
    cy.get('nav').contains('Cart');
  });
});

