# Quick Deployment Guide

## 🚀 Fast Setup (5 minutes)

### Step 1: Create Azure Static Web App

```bash
# Using Azure CLI (or use Azure Portal)
az staticwebapp create \
  --name micro-frontend-host \
  --resource-group your-resource-group \
  --location "East US 2" \
  --sku Free
```

### Step 2: Get Deployment Token

1. Go to Azure Portal → Your Static Web App
2. Settings → Deployment token
3. Copy the token

### Step 3: Add GitHub Secret

1. Go to GitHub → Your Repository → Settings
2. Secrets and variables → Actions
3. New repository secret
4. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
5. Value: (paste token from Step 2)

### Step 4: Configure Domain (Optional)

1. Azure Portal → Static Web App → Custom domains
2. Add `micro.manish.online`
3. Update DNS records as instructed

### Step 5: Deploy

```bash
git add .
git commit -m "Setup deployment"
git push origin main
```

That's it! GitHub Actions will automatically:
- Build all micro frontends
- Deploy to Azure
- Make it available at your domain

## 📍 URLs After Deployment

- **Host**: https://micro.manish.online
- **Products**: https://micro.manish.online/products
- **Cart**: https://micro.manish.online/cart

## 🔍 Verify Deployment

1. Check GitHub Actions tab for deployment status
2. Visit https://micro.manish.online
3. Test navigation to /products and /cart

## 🐛 Common Issues

**Deployment fails?**
- Check GitHub Actions logs
- Verify `AZURE_STATIC_WEB_APPS_API_TOKEN` secret is set
- Ensure Azure Static Web App exists

**404 errors?**
- Check `azure-staticwebapp.config.json` exists
- Verify routing rules are correct

**Remote modules not loading?**
- Check browser console for errors
- Verify `remoteEntry.js` files are accessible
- Check CORS configuration

## 📚 Full Documentation

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

