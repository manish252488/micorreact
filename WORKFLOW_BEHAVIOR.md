# GitHub Workflow Behavior on Push

This document explains how `deploy.yml` and `deploy-separate.yml` work when you push code to GitHub.

## 🔄 Workflow Comparison

### `deploy.yml` - Single Unified Deployment

**Triggers:**
- ✅ Push to `main` or `master` branch (any file change)
- ✅ Manual trigger from GitHub Actions UI

**Behavior:**
- **Always runs** when you push to main/master
- Builds **all three** micro frontends (product, cart, host)
- Deploys everything together in one deployment
- Single job that does everything sequentially

**When to use:**
- Standard deployments
- When you want everything deployed together
- Simpler setup (one workflow)

---

### `deploy-separate.yml` - Conditional Separate Deployments

**Triggers:**
- ✅ Push to `main` or `master` branch
- ⚠️ **BUT only if** files changed in:
  - `packages/host/**`
  - `packages/product/**`
  - `packages/cart/**`
  - `.github/workflows/**`
- ✅ Manual trigger from GitHub Actions UI

**Behavior:**
- **Conditional execution** based on commit message
- Three separate jobs that can run independently
- Each job only runs if commit message contains specific tag

**When to use:**
- Independent deployments
- Deploy only what changed
- Faster deployments for single micro frontend updates

---

## 📊 What Happens on Push

### Scenario 1: Push to `main` branch

```
You push code to main branch
         ↓
┌─────────────────────────────────────┐
│  deploy.yml                         │
│  ✅ ALWAYS RUNS                     │
│  - Builds all 3 micro frontends    │
│  - Deploys everything together      │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  deploy-separate.yml                 │
│  ⚠️ CONDITIONAL                     │
│  - Checks file paths changed         │
│  - Checks commit message             │
│  - Runs jobs based on conditions     │
└─────────────────────────────────────┘
```

### Scenario 2: Both Workflows Run

If you push to `main` and files in `packages/**` changed:

1. **`deploy.yml`** runs immediately → Deploys everything
2. **`deploy-separate.yml`** also runs → But jobs are conditional

**Result:** Both workflows run, but `deploy-separate.yml` jobs may skip if commit message doesn't match.

---

## 🎯 `deploy-separate.yml` Job Conditions

Each job in `deploy-separate.yml` has conditions:

### Job: `deploy-product`
**Runs if:**
- Commit message contains `[deploy-product]` OR
- Commit message contains `[deploy-all]` OR
- Manually triggered

**Example:**
```bash
git commit -m "Update product feature [deploy-product]"
# ✅ deploy-product job runs
# ❌ deploy-cart job skips
# ❌ deploy-host job skips
```

### Job: `deploy-cart`
**Runs if:**
- Commit message contains `[deploy-cart]` OR
- Commit message contains `[deploy-all]` OR
- Manually triggered

**Example:**
```bash
git commit -m "Fix cart bug [deploy-cart]"
# ❌ deploy-product job skips
# ✅ deploy-cart job runs
# ❌ deploy-host job skips
```

### Job: `deploy-host`
**Runs if:**
- Commit message contains `[deploy-host]` OR
- Commit message contains `[deploy-all]` OR
- Manually triggered

**Example:**
```bash
git commit -m "Update host routing [deploy-host]"
# ❌ deploy-product job skips
# ❌ deploy-cart job skips
# ✅ deploy-host job runs
```

### Deploy All
```bash
git commit -m "Major update [deploy-all]"
# ✅ deploy-product job runs
# ✅ deploy-cart job runs
# ✅ deploy-host job runs
```

---

## 📝 Real-World Examples

### Example 1: Regular Push (No Tags)

```bash
git commit -m "Update README"
git push origin main
```

**What happens:**
- ✅ `deploy.yml` runs → Deploys everything
- ⚠️ `deploy-separate.yml` runs → But all 3 jobs **SKIP** (no tags in commit message)

**Result:** Only `deploy.yml` actually deploys.

---

### Example 2: Product Update Only

```bash
git commit -m "Add new product feature [deploy-product]"
git push origin main
```

**What happens:**
- ✅ `deploy.yml` runs → Deploys everything (including product)
- ✅ `deploy-separate.yml` runs → Only `deploy-product` job runs

**Result:** Product gets deployed twice (once from each workflow). This is redundant but safe.

---

### Example 3: Only Documentation Changed

```bash
git commit -m "Update documentation"
git push origin main
```

**What happens:**
- ✅ `deploy.yml` runs → Deploys everything (even though only docs changed)
- ⚠️ `deploy-separate.yml` **DOESN'T RUN** (no files in `packages/**` changed)

**Result:** Only `deploy.yml` runs.

---

## ⚙️ Recommended Setup

### Option 1: Use Only `deploy.yml` (Simplest)

**Disable `deploy-separate.yml`:**
- Delete or rename the file
- Use `deploy.yml` for all deployments

**Pros:**
- Simple, predictable
- Always deploys everything together
- No need to remember commit message tags

**Cons:**
- Deploys everything even if only one micro frontend changed
- Slightly slower (builds all 3)

---

### Option 2: Use Only `deploy-separate.yml` (Most Flexible)

**Disable `deploy.yml`:**
- Delete or rename the file
- Use commit message tags to control deployments

**Pros:**
- Deploy only what changed
- Faster deployments
- More control

**Cons:**
- Must remember to add tags to commit messages
- More complex

---

### Option 3: Use Both (Current Setup)

**Keep both workflows:**
- `deploy.yml` as fallback (always deploys)
- `deploy-separate.yml` for selective deployments

**Pros:**
- Flexibility to choose deployment method
- Fallback ensures deployment always happens

**Cons:**
- Can cause duplicate deployments
- More complex to understand

---

## 🔧 How to Control Which Workflow Runs

### Disable `deploy.yml` for Specific Pushes

Add this to the top of `deploy.yml`:

```yaml
on:
  push:
    branches:
      - main
      - master
    paths-ignore:
      - '**.md'
      - '.github/**'
```

This makes it skip on documentation-only changes.

### Disable `deploy-separate.yml` Completely

Delete or rename `.github/workflows/deploy-separate.yml`

### Make `deploy-separate.yml` Always Run Jobs

Remove the `if` conditions from each job:

```yaml
# Remove this line:
if: contains(github.event.head_commit.message, '[deploy-product]') || ...

# Jobs will always run when workflow is triggered
```

---

## 📋 Summary Table

| Action | `deploy.yml` | `deploy-separate.yml` |
|--------|--------------|----------------------|
| **Push to main** | ✅ Always runs | ⚠️ Runs if paths match |
| **Manual trigger** | ✅ Runs | ✅ Runs |
| **Builds all** | ✅ Yes | ❌ Only selected |
| **Commit tags needed** | ❌ No | ✅ Yes (for selective) |
| **Deployment target** | Static Web Apps | Blob Storage + Static Web Apps |

---

## 🎯 Best Practice Recommendation

**For most cases, use only `deploy.yml`:**

1. Simpler to understand
2. Always deploys everything (consistent state)
3. No need to remember commit message tags
4. Works well for micro frontends that should stay in sync

**Use `deploy-separate.yml` only if:**
- You have very large micro frontends
- You need to deploy independently frequently
- Different teams own different micro frontends
- You want faster deployments for single changes

---

## 🚀 Quick Reference

**Always deploy everything:**
```bash
git push origin main
# deploy.yml runs automatically
```

**Deploy only product:**
```bash
git commit -m "Product update [deploy-product]"
git push origin main
# deploy-separate.yml runs deploy-product job
```

**Deploy only cart:**
```bash
git commit -m "Cart fix [deploy-cart]"
git push origin main
# deploy-separate.yml runs deploy-cart job
```

**Deploy only host:**
```bash
git commit -m "Host routing [deploy-host]"
git push origin main
# deploy-separate.yml runs deploy-host job
```

**Deploy all separately:**
```bash
git commit -m "Major update [deploy-all]"
git push origin main
# deploy-separate.yml runs all 3 jobs
```

