# Deployment Guide - micro.manish.online

This guide explains how to deploy the micro frontend architecture to Azure using GitHub Actions.

## 🏗️ Architecture Overview

```
micro.manish.online (Main Domain)
├── / (Host Application)
├── /product/* (Product Micro Frontend - from CDN)
└── /cart/* (Cart Micro Frontend - from CDN)

cdn.micro.manish.online (CDN)
├── /product/remoteEntry.js
└── /cart/remoteEntry.js
```

## 📋 Prerequisites

1. **Azure Account** with:
   - Azure Static Web Apps (for host)
   - Azure Blob Storage + CDN (for micro frontends)
   - Or Azure Static Web Apps for all (simpler)

2. **GitHub Repository** with:
   - GitHub Actions enabled
   - Secrets configured (see below)

3. **Domain Configuration**:
   - `micro.manish.online` → Azure Static Web App
   - `cdn.micro.manish.online` → Azure CDN (optional, can use same domain)

## 🔧 Setup Instructions

### Option 1: Azure Static Web Apps (Recommended - Simplest)

#### Step 1: Create Azure Static Web App

1. Go to Azure Portal → Create Resource → Static Web App
2. Configure:
   - **Name**: `micro-frontend-host`
   - **Region**: Choose closest to your users
   - **Source**: GitHub
   - **Repository**: Your GitHub repo
   - **Branch**: `main` or `master`
   - **Build Presets**: Custom
   - **App location**: `packages/host/dist`
   - **Output location**: (leave empty)

3. After creation, go to **Settings** → **Deployment token** and copy the token

#### Step 2: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

**Required:**
```
AZURE_STATIC_WEB_APPS_API_TOKEN = <deployment-token-from-azure>
AZURE_RESOURCE_GROUP = <your-resource-group-name>
```

**Optional (if using separate CDN):**
```
AZURE_CDN_PROFILE_NAME = <your-cdn-profile-name>
AZURE_CDN_ENDPOINT_NAME = <your-cdn-endpoint-name>
```

**Note:** Cache invalidation requires `AZURE_RESOURCE_GROUP`. CDN secrets are only needed if you're using Azure CDN separately from Static Web Apps.

#### Step 3: Update Domain

1. In Azure Static Web App → **Custom domains**
2. Add `micro.manish.online`
3. Follow DNS configuration instructions

#### Step 4: Deploy Micro Frontends to Same App

The workflow will deploy all micro frontends to the same Static Web App:

```
/ (host files)
/product/ (product files)
/cart/ (cart files)
```

### Option 2: Azure Blob Storage + CDN (For Separate Deployments)

#### Step 1: Create Storage Account

1. Azure Portal → Create Storage Account
2. Enable **Static website hosting**
3. Create containers: `product`, `cart`

#### Step 2: Create CDN Profile

1. Azure Portal → Create CDN Profile
2. Add endpoints pointing to your storage account
3. Configure custom domain: `cdn.micro.manish.online`

#### Step 3: Configure GitHub Secrets

```
AZURE_STORAGE_ACCOUNT = <your-storage-account-name>
AZURE_STORAGE_KEY = <your-storage-account-key>
AZURE_STATIC_WEB_APPS_API_TOKEN = <for-host-deployment>
AZURE_RESOURCE_GROUP = <your-resource-group-name>
AZURE_CDN_PROFILE_NAME = <your-cdn-profile-name> (optional)
AZURE_CDN_ENDPOINT_NAME = <your-cdn-endpoint-name> (optional)
```

## 🚀 Deployment Workflows

### Workflow 1: Single Deployment (`deploy.yml`)

Deploys everything together in one workflow.

**Trigger:**
- Push to `main`/`master` branch
- Manual trigger from GitHub Actions

**What it does:**
1. Builds all micro frontends with production URLs
2. Combines everything into `deployment/` folder
3. Deploys to Azure Static Web Apps

### Workflow 2: Separate Deployments (`deploy-separate.yml`)

Deploys each micro frontend independently.

**Trigger:**
- Commit message contains `[deploy-product]`
- Commit message contains `[deploy-cart]`
- Commit message contains `[deploy-host]`
- Commit message contains `[deploy-all]`
- Manual trigger

**Examples:**
```bash
git commit -m "Update product feature [deploy-product]"
git commit -m "Fix cart bug [deploy-cart]"
git commit -m "Update all [deploy-all]"
```

## 📝 Environment Variables

### Production URLs

The workflows automatically set these:

**For Host:**
```bash
REMOTE_PRODUCT_URL=https://cdn.micro.manish.online/product/remoteEntry.js
REMOTE_CART_URL=https://cdn.micro.manish.online/cart/remoteEntry.js
```

**For Product & Cart:**
```bash
REMOTE_HOST_URL=https://micro.manish.online/host/remoteEntry.js
```

### Customizing URLs

Edit `.github/workflows/deploy.yml`:

```yaml
env:
  DOMAIN: micro.manish.online
  CDN_BASE_URL: https://cdn.micro.manish.online  # Change this
```

## 🔍 Verification

After deployment:

1. **Check Host**: https://micro.manish.online
2. **Check Product**: https://micro.manish.online/products
3. **Check Cart**: https://micro.manish.online/cart
4. **Check Remote Entries**:
   - https://micro.manish.online/product/remoteEntry.js
   - https://micro.manish.online/cart/remoteEntry.js
   - https://micro.manish.online/remoteEntry.js (host)
5. **Verify Cache Invalidation**: Check GitHub Actions logs to confirm cache was invalidated
6. **Test Fresh Load**: Hard refresh (Ctrl+Shift+R) to ensure latest version loads

## 🐛 Troubleshooting

### Issue: Remote modules not loading

**Solution:**
1. Check CORS headers in `azure-staticwebapp.config.json`
2. Verify remote URLs in browser Network tab
3. Ensure `remoteEntry.js` files are accessible

### Issue: 404 errors on routes

**Solution:**
1. Check `azure-staticwebapp.config.json` routing rules
2. Ensure `index.html` exists in each directory
3. Verify `navigationFallback` configuration

### Issue: Build fails

**Solution:**
1. Check GitHub Actions logs
2. Verify Node.js version matches (18.x)
3. Ensure all dependencies are installed
4. Check environment variables are set correctly

### Issue: Domain not working

**Solution:**
1. Verify DNS configuration
2. Check Azure Static Web App custom domain settings
3. Wait for DNS propagation (can take up to 48 hours)

## 📊 Monitoring

### Azure Static Web Apps Analytics

1. Go to Azure Portal → Your Static Web App
2. Navigate to **Monitoring** → **Metrics**
3. View:
   - Request count
   - Response times
   - Error rates

### GitHub Actions

1. Go to GitHub → Actions tab
2. View deployment history
3. Check logs for each deployment

## 🔄 Rollback

If something goes wrong:

1. **Quick Rollback**: Re-run previous successful workflow
2. **Manual Rollback**: 
   - Go to Azure Portal → Static Web App
   - Navigate to **Deployment history**
   - Redeploy previous version

## 🔐 Security Best Practices

1. **Never commit secrets** to repository
2. **Use GitHub Secrets** for all sensitive data
3. **Enable HTTPS only** in Azure Static Web Apps
4. **Set up custom domain** with SSL certificate
5. **Review deployment logs** regularly

## 🗑️ Cache Invalidation

Cache invalidation is **automatically handled** during deployment to ensure users get the latest version. See [CACHE_INVALIDATION.md](./CACHE_INVALIDATION.md) for details.

**What gets invalidated:**
- All `remoteEntry.js` files (critical for Module Federation)
- Main application bundles
- Static assets

**Required for cache invalidation:**
- `AZURE_RESOURCE_GROUP` secret must be set
- CDN secrets only needed if using separate Azure CDN

## 📚 Additional Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Module Federation Production Guide](https://webpack.js.org/concepts/module-federation/)
- [Cache Invalidation Guide](./CACHE_INVALIDATION.md)

## 🎯 Next Steps

1. Set up Azure resources
2. Configure GitHub secrets
3. Update domain DNS
4. Push to `main` branch to trigger deployment
5. Verify deployment at https://micro.manish.online

---

**Need Help?** Check the troubleshooting section or review the GitHub Actions logs.

