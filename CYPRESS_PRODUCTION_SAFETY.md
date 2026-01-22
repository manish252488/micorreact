# Cypress Production Safety Guide

## 🛡️ Overview

Cypress is **strictly prohibited** from running in production environments. Multiple safeguards are implemented to ensure this never happens.

## 🔒 Safety Mechanisms

### 1. Pre-Script Environment Check (`scripts/check-cypress-env.js`)

**Location:** Runs before every Cypress command

**Checks:**
- ✅ `NODE_ENV !== 'production'`
- ✅ Not in production CI/CD pipeline
- ✅ Base URL is not a production domain
- ✅ Not running during build process

**Action:** Exits with error code 1 if any check fails

### 2. Cypress Configuration Check (`cypress.config.js`)

**Location:** Inside `setupNodeEvents` hook

**Checks:**
- ✅ `NODE_ENV !== 'production'`
- ✅ Base URL doesn't contain production domains

**Action:** Throws error if production detected

### 3. NPM Script Protection (`package.json`)

**All Cypress scripts include:**
```json
"precypress:open": "node scripts/check-cypress-env.js",
"precypress:run": "node scripts/check-cypress-env.js"
```

**Action:** Prevents Cypress from starting if production detected

### 4. Build Exclusion (`.npmignore`)

**Excludes from npm packages:**
- `cypress/` directory
- `cypress.config.js`
- `scripts/check-cypress-env.js`

**Action:** Prevents Cypress from being included in production builds

### 5. Deployment Workflow Protection (`.github/workflows/deploy.yml`)

**Actions:**
- Explicitly removes Cypress from deployment artifacts
- Never runs Cypress during production deployments
- Ensures only production dependencies are included

### 6. Git Ignore (`.gitignore`)

**Excludes:**
- `cypress/videos/`
- `cypress/screenshots/`
- `.cypress/`

**Action:** Prevents accidental commits of test artifacts

## 🚫 What Happens If You Try to Run in Production

### Attempt 1: Set NODE_ENV=production
```bash
NODE_ENV=production npm run cypress:run
```

**Result:**
```
❌ ERROR: Cypress cannot run in production environment!
   NODE_ENV is set to "production"
   Cypress is only for development and testing.
```

### Attempt 2: Use Production URL
```bash
CYPRESS_BASE_URL=https://micro.manish.online npm run cypress:run
```

**Result:**
```
❌ ERROR: Cypress cannot run against production domains!
   Current baseUrl: https://micro.manish.online
   Production domains detected: micro.manish.online, cdn.micro.manish.online
   Please use localhost for testing.
```

### Attempt 3: Run During Build
```bash
npm run build && npm run cypress:run
```

**Result:**
```
❌ ERROR: Cypress cannot run during build process!
   Detected build command: build
```

## ✅ Safe Usage

### Development (✅ Allowed)
```bash
# Default - safe
npm run cypress:open

# Explicitly set development
NODE_ENV=development npm run cypress:run

# Use localhost
CYPRESS_BASE_URL=http://localhost:3000 npm run cypress:run
```

### Testing/CI (✅ Allowed)
```bash
# In test environment
NODE_ENV=test npm run cypress:run

# In development branch CI
# (Only if not main/master)
```

## 📋 Checklist for Production Deployment

Before deploying to production, verify:

- [ ] Cypress is in `devDependencies` only (not `dependencies`)
- [ ] `.npmignore` excludes Cypress files
- [ ] Deployment workflow removes Cypress from artifacts
- [ ] No Cypress commands in production build scripts
- [ ] Environment variables don't include Cypress config

## 🔍 Verification Commands

### Check if Cypress is in dependencies
```bash
npm list cypress
# Should show in devDependencies only
```

### Verify Cypress is excluded from build
```bash
npm pack --dry-run
# Check that cypress/ is not in the package
```

### Test safety checks
```bash
# Should fail
NODE_ENV=production npm run cypress:run

# Should pass
NODE_ENV=development npm run cypress:run
```

## 🚨 Emergency: If Cypress Runs in Production

If Cypress somehow runs in production:

1. **Immediately stop the process**
2. **Check logs** for what triggered it
3. **Review** all safety mechanisms
4. **Update** safeguards if needed
5. **Document** the incident

## 📚 Related Documentation

- [CYPRESS_GUIDE.md](./CYPRESS_GUIDE.md) - Complete Cypress usage guide
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Production deployment guide

---

**Remember: Cypress is for development and testing ONLY. Never in production! 🛡️**

