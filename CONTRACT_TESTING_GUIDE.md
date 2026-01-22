# Contract Testing Guide for Micro Frontends

## 📋 What is Contract Testing?

**Contract Testing** is a testing approach that verifies the agreements (contracts) between different services or applications. In micro frontend architecture, contract testing ensures that:

1. **Exposed APIs remain stable** - Micro frontends don't break when remotes are updated
2. **Shared dependencies are compatible** - All apps use compatible versions
3. **Module Federation contracts are maintained** - Exposed modules match expected interfaces
4. **Integration points work correctly** - Host and remotes integrate seamlessly

---

## 🎯 Why Contract Testing is Important

### Problem Without Contract Testing:
- ❌ Remote updates break the host application
- ❌ Version mismatches cause runtime errors
- ❌ Breaking changes go undetected until production
- ❌ Integration failures are discovered late

### Solution With Contract Testing:
- ✅ Catch breaking changes before deployment
- ✅ Ensure backward compatibility
- ✅ Verify shared dependencies work correctly
- ✅ Document expected interfaces

---

## 📁 Contract Test Structure

```
packages/host/src/__tests__/contracts/
├── productContract.test.js    # Product MF contract tests
├── cartContract.test.js       # Cart MF contract tests
├── storeContract.test.js      # Redux store contract tests
├── utilsContract.test.js      # Shared utilities contract tests
└── integrationContract.test.js # Integration contract tests
```

---

## 🔍 Types of Contract Tests

### 1. **Module Federation Contract Tests**

Tests that verify:
- Remote modules are correctly exposed
- Remote entry files are accessible
- Module structure matches expectations

**Example:**
```javascript
test('ProductApp should be exposed as a React component', () => {
  expect(ProductApp).toBeDefined();
  expect(ProductApp.default).toBeDefined();
  expect(typeof ProductApp.default).toBe('function');
});
```

**Interview Question:** *"How do you ensure that a micro frontend update doesn't break the host?"*

**Answer:** We use contract testing to verify that:
- The exposed module structure remains the same
- The component interface is compatible
- Shared dependencies are compatible
- The remote entry file is accessible

---

### 2. **Component Interface Contract Tests**

Tests that verify:
- Components render without errors
- Props are handled correctly
- Components integrate with shared resources

**Example:**
```javascript
test('ProductApp should render without crashing', () => {
  expect(() => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductApp.default />
        </BrowserRouter>
      </Provider>
    );
  }).not.toThrow();
});
```

**Interview Question:** *"How do you test that micro frontends work with shared state?"*

**Answer:** We test that:
- Components can access the shared Redux store
- Components can dispatch actions
- State changes are reflected correctly
- Components handle store updates gracefully

---

### 3. **Redux Store Contract Tests**

Tests that verify:
- Store structure remains consistent
- Actions maintain their contract
- State shape doesn't change unexpectedly

**Example:**
```javascript
test('Store should have cart reducer', () => {
  const state = store.getState();
  expect(state).toHaveProperty('cart');
  expect(state.cart).toHaveProperty('items');
  expect(state.cart).toHaveProperty('total');
});
```

**Interview Question:** *"How do you prevent breaking changes in shared state?"*

**Answer:** We use contract tests to:
- Verify store structure matches expected shape
- Test that actions maintain their interface
- Ensure state calculations remain correct
- Validate that new changes are backward compatible

---

### 4. **Shared Utilities Contract Tests**

Tests that verify:
- Utility functions maintain their API
- Functions work as expected
- Utilities are accessible from all micro frontends

**Example:**
```javascript
test('formatCurrency should exist and work correctly', () => {
  expect(utils.formatCurrency).toBeDefined();
  const result = utils.formatCurrency(1234.56);
  expect(result).toContain('$');
});
```

**Interview Question:** *"How do you ensure shared utilities don't break when updated?"*

**Answer:** Contract tests verify:
- Function signatures remain the same
- Return types are consistent
- Functions handle edge cases correctly
- Utilities are exportable from host

---

### 5. **Integration Contract Tests**

Tests that verify:
- Multiple micro frontends work together
- Shared resources are accessible
- Integration points function correctly

**Example:**
```javascript
test('Product and Cart should share the same Redux store', () => {
  // Add item from Product perspective
  store.dispatch(addToCart({ id: 1, name: 'Product Item', price: 100 }));
  
  // Verify Cart can see it
  const state = store.getState();
  expect(state.cart.items).toHaveLength(1);
});
```

**Interview Question:** *"How do you test the integration between micro frontends?"*

**Answer:** Integration contract tests verify:
- Micro frontends can access shared resources
- State changes in one app reflect in others
- Routing works across apps
- Shared utilities work consistently

---

## 🚀 Running Contract Tests

### Run All Contract Tests:
```bash
cd packages/host
npm test -- contracts
```

### Run Specific Contract Test:
```bash
npm test -- productContract.test.js
```

### Run with Coverage:
```bash
npm test -- --coverage contracts
```

---

## 📊 Test Cases Explained for Interviews

### Case 1: Module Exposure Contract
**What it tests:** Verifies that micro frontends expose modules correctly

**Why it's important:** If a remote changes how it exposes modules, the host will break

**Interview Answer:**
> "We test that ProductApp is exposed as a default export from 'product/ProductApp'. This ensures that when the Product team updates their code, they don't accidentally change the export structure, which would break the host application."

---

### Case 2: Redux Store Structure Contract
**What it tests:** Verifies the store has the expected structure

**Why it's important:** If store structure changes, all micro frontends break

**Interview Answer:**
> "We test that the store always has 'cart' and 'user' reducers with specific properties. This contract ensures that when we add new features to the store, we don't break existing micro frontends that depend on the current structure."

---

### Case 3: Action Interface Contract
**What it tests:** Verifies actions maintain their interface

**Why it's important:** If action structure changes, components using them break

**Interview Answer:**
> "We test that addToCart action always has 'type' and 'payload' properties. This ensures backward compatibility - even if we add new features, existing code continues to work."

---

### Case 4: Shared Dependencies Contract
**What it tests:** Verifies all apps use compatible dependency versions

**Why it's important:** Version mismatches cause runtime errors

**Interview Answer:**
> "We test that all micro frontends use the same React instance. This is critical because React requires a single instance across the application. Contract tests catch version mismatches before they reach production."

---

### Case 5: Integration Contract
**What it tests:** Verifies micro frontends work together

**Why it's important:** Ensures the entire system functions correctly

**Interview Answer:**
> "We test that when Product adds an item to the cart, Cart can see it. This integration test ensures that the shared Redux store works correctly across micro frontends and that state synchronization happens as expected."

---

## 🎓 Key Interview Points

### 1. **What is Contract Testing?**
Contract testing verifies the agreements between services. In micro frontends, it ensures that exposed APIs, shared resources, and integration points remain stable.

### 2. **Why is it Important?**
- Prevents breaking changes from reaching production
- Ensures backward compatibility
- Documents expected interfaces
- Catches integration issues early

### 3. **What Do You Test?**
- Module Federation contracts (exposed modules)
- Component interfaces (props, rendering)
- Redux store structure and actions
- Shared utilities API
- Integration between micro frontends

### 4. **How Do You Implement It?**
- Write tests that verify expected interfaces
- Test that modules are accessible
- Verify shared resources work correctly
- Test integration between components
- Run tests in CI/CD pipeline

### 5. **When Do Tests Fail?**
- Remote changes export structure
- Store structure changes unexpectedly
- Action interfaces are modified
- Shared utilities API changes
- Integration points break

---

## 📝 Best Practices

1. **Test Public APIs Only** - Don't test internal implementation
2. **Keep Tests Simple** - Focus on contracts, not behavior
3. **Run in CI/CD** - Catch breaking changes automatically
4. **Document Contracts** - Make expected interfaces clear
5. **Version Contracts** - Test compatibility across versions

---

## 🔄 Continuous Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/contract-tests.yml
name: Contract Tests
on: [push, pull_request]
jobs:
  contract-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test -- contracts
```

---

## 📚 Summary

Contract testing in micro frontends ensures:
- ✅ Stability of exposed APIs
- ✅ Compatibility of shared resources
- ✅ Correct integration between apps
- ✅ Early detection of breaking changes
- ✅ Documentation of expected interfaces

This makes micro frontend architecture more reliable and maintainable! 🚀

