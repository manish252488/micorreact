#!/usr/bin/env node

/**
 * Safety check to prevent Cypress from running in production
 */

const isProduction = process.env.NODE_ENV === 'production';
const isProductionCI = process.env.CI === 'true' && 
                       (process.env.GITHUB_REF === 'refs/heads/main' || 
                        process.env.GITHUB_REF === 'refs/heads/master');
const baseUrl = process.env.CYPRESS_BASE_URL || process.env.CYPRESS_baseUrl || 'http://localhost:3000';
const productionDomains = [
  'micro.manish.online',
  'cdn.micro.manish.online',
  'https://micro.manish.online',
  'https://cdn.micro.manish.online'
];

// Check for production environment
if (isProduction) {
  console.error('❌ ERROR: Cypress cannot run in production environment!');
  console.error('   NODE_ENV is set to "production"');
  console.error('   Cypress is only for development and testing.');
  process.exit(1);
}

// Check for production CI
if (isProductionCI) {
  console.error('❌ ERROR: Cypress cannot run in production CI/CD pipeline!');
  console.error('   Detected production branch deployment');
  console.error('   Cypress should only run in development or test environments.');
  process.exit(1);
}

// Check for production URLs
if (productionDomains.some(domain => baseUrl.includes(domain))) {
  console.error('❌ ERROR: Cypress cannot run against production domains!');
  console.error('   Current baseUrl:', baseUrl);
  console.error('   Production domains detected:', productionDomains.join(', '));
  console.error('   Please use localhost for testing.');
  process.exit(1);
}

// Check if running in production build context
if (process.env.npm_lifecycle_event && process.env.npm_lifecycle_event.includes('build')) {
  console.error('❌ ERROR: Cypress cannot run during build process!');
  console.error('   Detected build command:', process.env.npm_lifecycle_event);
  process.exit(1);
}

// All checks passed
console.log('✅ Cypress environment check passed');
console.log('   Environment: Development');
console.log('   Base URL:', baseUrl);

