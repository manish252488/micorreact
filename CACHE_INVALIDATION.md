# Cache Invalidation Guide

## Overview

Cache invalidation is automatically handled in the deployment workflows to ensure users always get the latest version of your micro frontends, especially critical for `remoteEntry.js` files.

## How It Works

### 1. Automatic Cache Invalidation

The deployment workflows automatically invalidate caches after deployment:

**Main Deployment (`deploy.yml`):**
- Invalidates Azure CDN cache (if configured)
- Invalidates Azure Static Web Apps cache
- Purges critical paths: `/*`, `/product/*`, `/cart/*`, and all `remoteEntry.js` files

**Separate Deployments (`deploy-separate.yml`):**
- Invalidates cache for the specific micro frontend being deployed
- Product deployment → purges `/product/*` and `/product/remoteEntry.js`
- Cart deployment → purges `/cart/*` and `/cart/remoteEntry.js`
- Host deployment → purges `/*` and `/remoteEntry.js`

### 2. Cache Control Headers

The `azure-staticwebapp.config.json` includes cache control headers:

```json
"Cache-Control": "public, max-age=3600, must-revalidate"
```

This means:
- Files are cached for 1 hour (3600 seconds)
- `must-revalidate` ensures browsers check for updates after cache expires

### 3. Build Versioning

Each deployment generates a unique build version (timestamp) that can be used for cache busting if needed.

## Required GitHub Secrets

For cache invalidation to work, add these secrets (optional if not using CDN):

```
AZURE_RESOURCE_GROUP = your-resource-group-name
AZURE_CDN_PROFILE_NAME = your-cdn-profile-name (optional)
AZURE_CDN_ENDPOINT_NAME = your-cdn-endpoint-name (optional)
```

**Note:** If you're only using Azure Static Web Apps (no separate CDN), you only need:
- `AZURE_STATIC_WEB_APPS_API_TOKEN`
- `AZURE_RESOURCE_GROUP`

## Manual Cache Invalidation

If you need to manually invalidate cache:

### Using Azure CLI

```bash
# Invalidate CDN cache
az cdn endpoint purge \
  --resource-group your-resource-group \
  --profile-name your-cdn-profile \
  --name your-cdn-endpoint \
  --content-paths "/*" "/product/*" "/cart/*"

# Invalidate Static Web App cache
az staticwebapp update \
  --name your-static-web-app-name \
  --resource-group your-resource-group
```

### Using Azure Portal

1. **CDN Cache:**
   - Go to Azure Portal → CDN Profile → Endpoint
   - Click "Purge"
   - Enter paths: `/*`, `/product/*`, `/cart/*`
   - Click "Purge"

2. **Static Web App:**
   - Go to Azure Portal → Static Web App
   - Navigate to "Deployment history"
   - Redeploy a previous deployment

## Cache Strategy

### Critical Files (Always Invalidate)

These files are always invalidated on deployment:
- `remoteEntry.js` (all locations)
- `main.js` (main bundles)
- `index.html` (entry points)

### Static Assets (Cached Longer)

These can be cached longer:
- Images, fonts, CSS (unless changed)
- Already handled by webpack's content hashing

## Troubleshooting

### Issue: Users seeing old version

**Solutions:**
1. Check if cache invalidation step ran in GitHub Actions logs
2. Manually invalidate cache using Azure CLI or Portal
3. Verify `AZURE_RESOURCE_GROUP` secret is set correctly
4. Check CDN configuration if using separate CDN

### Issue: Cache invalidation failing

**Solutions:**
1. Verify Azure CLI authentication in workflow
2. Check resource group name is correct
3. Ensure CDN profile/endpoint names are correct (if using CDN)
4. Review GitHub Actions logs for specific errors

### Issue: Too frequent cache invalidation

**Solutions:**
1. Adjust `max-age` in `azure-staticwebapp.config.json`
2. Use content hashing (webpack already does this)
3. Only invalidate on actual deployments

## Best Practices

1. **Always invalidate on deployment** - The workflows handle this automatically
2. **Use content hashing** - Webpack already adds hashes to filenames (e.g., `main.abc123.js`)
3. **Cache static assets longer** - Images, fonts can be cached for days/weeks
4. **Invalidate critical files** - Always invalidate `remoteEntry.js` files
5. **Monitor cache hit rates** - Use Azure metrics to optimize cache settings

## Testing Cache Invalidation

After deployment:

1. **Check deployment logs** - Verify cache invalidation step completed
2. **Test in browser** - Hard refresh (Ctrl+Shift+R) to bypass cache
3. **Check Network tab** - Verify files are being fetched, not served from cache
4. **Verify version** - Check that `remoteEntry.js` has latest timestamp

## Additional Resources

- [Azure CDN Cache Purge](https://docs.microsoft.com/azure/cdn/cdn-purge-endpoint)
- [Azure Static Web Apps Configuration](https://docs.microsoft.com/azure/static-web-apps/configuration)
- [Webpack Content Hashing](https://webpack.js.org/guides/caching/)

