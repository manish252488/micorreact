# Cypress E2E Testing Guide

This guide explains how to use Cypress for end-to-end testing of the micro frontend architecture.

## ⚠️ IMPORTANT: Production Safety

**Cypress is configured to NEVER run in production environments.** Multiple safeguards are in place:

1. **Environment checks** - Prevents running when `NODE_ENV=production`
2. **URL validation** - Blocks production domains
3. **CI/CD protection** - Prevents running in production deployments
4. **Build exclusion** - Cypress is excluded from production builds

If you attempt to run Cypress in production, it will exit with an error.

## 📋 Overview

Cypress is configured to test the entire micro frontend application, including:
- Host application navigation
- Product micro frontend integration
- Cart micro frontend integration
- Module Federation remote loading
- Cross-micro-frontend communication

## 🚀 Quick Start

### Prerequisites

1. **Ensure you're in development mode:**
   ```bash
   # Verify NODE_ENV is not set to production
   echo $NODE_ENV  # Should be empty or 'development'
   ```

2. All micro frontends must be running:
   ```bash
   npm run start:all
   ```

3. Wait for all servers to start (usually 10-15 seconds)

### Running Tests

**⚠️ Note:** All Cypress commands automatically check the environment and will fail if run in production.

**Open Cypress Test Runner (Interactive):**
```bash
npm run cypress:open
```

**Run Tests Headless (CI/CD):**
```bash
npm run cypress:run
```

**Run Tests with Auto-start (Starts servers automatically):**
```bash
npm run test:e2e
```

## 📁 Test Structure

```
cypress/
├── e2e/                          # E2E test files
│   ├── navigation.cy.js          # Navigation tests
│   ├── product-microfrontend.cy.js  # Product MF tests
│   ├── cart-microfrontend.cy.js     # Cart MF tests
│   ├── module-federation.cy.js      # Module Federation tests
│   └── communication.cy.js          # Communication tests
├── fixtures/                     # Test data
│   └── example.json
├── support/                      # Support files
│   ├── commands.js               # Custom commands
│   └── e2e.js                    # E2E support
└── videos/                       # Test videos (gitignored)
└── screenshots/                  # Test screenshots (gitignored)
```

## 🧪 Test Suites

### 1. Navigation Tests (`navigation.cy.js`)

Tests basic navigation between micro frontends:
- Home page loading
- Navigation to products
- Navigation to cart
- Navigation back to home
- All navigation links visible

### 2. Product Micro Frontend Tests (`product-microfrontend.cy.js`)

Tests Product micro frontend functionality:
- ProductApp loading
- Product list display
- Product detail navigation
- Remote entry accessibility
- Loading states

### 3. Cart Micro Frontend Tests (`cart-microfrontend.cy.js`)

Tests Cart micro frontend functionality:
- CartApp loading
- Empty cart display
- Checkout navigation
- Remote entry accessibility
- Cart operations

### 4. Module Federation Tests (`module-federation.cy.js`)

Tests Module Federation integration:
- Remote entry files accessibility
- Remote module loading
- Error handling
- React instance sharing

### 5. Communication Tests (`communication.cy.js`)

Tests cross-micro-frontend communication:
- Shared store access
- Event-based communication
- Shared utilities

## 🛠️ Custom Commands

### `waitForMicroFrontend(timeout)`

Waits for Module Federation to initialize:

```javascript
cy.waitForMicroFrontend(10000); // 10 second timeout
```

### `waitForRemoteModule(moduleName, timeout)`

Waits for a specific remote module to load:

```javascript
cy.waitForRemoteModule('product/ProductApp', 10000);
```

### `verifyRemoteEntry(url)`

Verifies a remote entry file is accessible:

```javascript
cy.verifyRemoteEntry('http://localhost:3001/remoteEntry.js');
```

### `shouldBeVisible(options)`

Checks if element is visible with retry:

```javascript
cy.get('[data-testid="element"]').shouldBeVisible({ timeout: 10000 });
```

## 📝 Writing Tests

### Basic Test Structure

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForMicroFrontend();
  });

  it('should do something', () => {
    // Test implementation
  });
});
```

### Testing Remote Module Loading

```javascript
it('should load product micro frontend', () => {
  cy.visit('/products');
  cy.waitForMicroFrontend();
  cy.wait(2000); // Wait for remote to load
  cy.contains('Product', { timeout: 10000 }).should('be.visible');
});
```

### Testing Navigation

```javascript
it('should navigate between micro frontends', () => {
  cy.get('nav').contains('Products').click();
  cy.url().should('include', '/products');
  
  cy.get('nav').contains('Cart').click();
  cy.url().should('include', '/cart');
});
```

### Testing Remote Entry Files

```javascript
it('should have accessible remote entries', () => {
  cy.verifyRemoteEntry('http://localhost:3000/remoteEntry.js');
  cy.verifyRemoteEntry('http://localhost:3001/remoteEntry.js');
  cy.verifyRemoteEntry('http://localhost:3002/remoteEntry.js');
});
```

## ⚙️ Configuration

### Cypress Config (`cypress.config.js`)

Key settings:
- **baseUrl**: `http://localhost:3000` (host application)
- **viewportWidth**: 1280px
- **viewportHeight**: 720px
- **defaultCommandTimeout**: 10 seconds
- **pageLoadTimeout**: 30 seconds (for remote modules)

### Environment Variables

You can override settings via environment variables:

```bash
CYPRESS_BASE_URL=http://localhost:3000 cypress run
```

## 🐛 Troubleshooting

### Issue: Tests fail with "Remote not loading"

**Solutions:**
1. Ensure all servers are running: `npm run start:all`
2. Wait longer for servers to start (increase wait time)
3. Check if ports 3000, 3001, 3002 are available
4. Verify remoteEntry.js files are accessible

### Issue: Timeout errors

**Solutions:**
1. Increase timeout in test: `cy.wait(5000)`
2. Increase `defaultCommandTimeout` in config
3. Check network tab for failed requests
4. Verify CORS is configured correctly

### Issue: Elements not found

**Solutions:**
1. Wait for micro frontend to load: `cy.waitForMicroFrontend()`
2. Increase timeout: `{ timeout: 10000 }`
3. Check if element selectors are correct
4. Verify element is actually rendered

### Issue: Module Federation errors

**Solutions:**
1. Check browser console for errors
2. Verify all remoteEntry.js files are accessible
3. Check shared dependencies configuration
4. Ensure React versions match

## 🎯 Best Practices

### 1. Always Wait for Micro Frontends

```javascript
beforeEach(() => {
  cy.visit('/');
  cy.waitForMicroFrontend(); // Always wait first
  cy.wait(2000); // Additional wait for remotes
});
```

### 2. Use Appropriate Timeouts

```javascript
// For remote module loading
cy.contains('Product', { timeout: 10000 }).should('be.visible');

// For navigation
cy.url({ timeout: 5000 }).should('include', '/products');
```

### 3. Test Remote Entry Accessibility

```javascript
it('should have accessible remotes', () => {
  cy.verifyRemoteEntry('http://localhost:3001/remoteEntry.js');
});
```

### 4. Test Error Handling

```javascript
it('should handle loading errors', () => {
  // Test error boundaries and fallback UI
});
```

### 5. Keep Tests Independent

Each test should be able to run independently:
- Use `beforeEach` for setup
- Don't rely on test execution order
- Clean up state between tests

## 🔄 CI/CD Integration

### GitHub Actions Example (Development/Testing Only)

**⚠️ IMPORTANT:** Only run Cypress in development/test environments, never in production deployments.

```yaml
# Example: Run Cypress only in development branch
- name: Run E2E Tests
  if: github.ref != 'refs/heads/main'
  run: |
    npm run start:all &
    sleep 15
    NODE_ENV=development npm run cypress:run
    pkill -f 'webpack serve'
```

### Production Deployment Safety

The deployment workflows (`deploy.yml`) automatically:
- Exclude Cypress from production builds
- Remove Cypress files from deployment artifacts
- Never run Cypress during production deployments

### Environment-Specific Tests

```javascript
// Test production URLs
const baseUrl = Cypress.env('BASE_URL') || 'http://localhost:3000';
cy.visit(baseUrl);
```

## 📊 Test Reports

Cypress generates:
- **Videos**: `cypress/videos/` (for failed tests)
- **Screenshots**: `cypress/screenshots/` (on failures)
- **JSON Reports**: Can be configured for CI/CD

## 🚀 Next Steps

1. **Add More Tests**: Expand test coverage for your specific features
2. **Add Visual Testing**: Use Cypress Visual Testing for UI regression
3. **Add API Testing**: Test backend integration
4. **Add Performance Testing**: Measure load times
5. **Add Accessibility Testing**: Use `cypress-axe` plugin

## 🛡️ Production Safety Features

### Automatic Checks

Cypress includes multiple safety checks:

1. **Environment Variable Check:**
   - Blocks if `NODE_ENV=production`
   - Blocks in production CI/CD pipelines

2. **URL Validation:**
   - Prevents running against production domains
   - Only allows `localhost` for testing

3. **Build Process Protection:**
   - Excluded from production builds
   - Removed from deployment artifacts

4. **Pre-script Hooks:**
   - Runs safety checks before any Cypress command
   - Exits immediately if production detected

### Manual Verification

To verify Cypress won't run in production:

```bash
# This should fail
NODE_ENV=production npm run cypress:run

# This should work
NODE_ENV=development npm run cypress:run
```

## 📚 Additional Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Module Federation Testing](https://webpack.js.org/concepts/module-federation/)

---

**Happy Testing! 🧪**

**Remember: Cypress is for development and testing only - never in production!**

