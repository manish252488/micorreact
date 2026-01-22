# GitHub Actions Workflows

## Available Workflows

### 1. `deploy.yml` - Single Deployment
Deploys all micro frontends together to Azure Static Web Apps.

**When it runs:**
- Push to `main` or `master` branch
- Manual trigger from GitHub Actions UI

**What it does:**
1. Builds product, cart, and host with production URLs
2. Combines all builds into a single deployment folder
3. Deploys to Azure Static Web Apps

### 2. `deploy-separate.yml` - Independent Deployments
Allows deploying each micro frontend independently.

**When it runs:**
- Commit message contains `[deploy-product]`, `[deploy-cart]`, `[deploy-host]`, or `[deploy-all]`
- Manual trigger from GitHub Actions UI

**Use cases:**
- Deploy only product when product changes
- Deploy only cart when cart changes
- Deploy all when needed

## Setup

1. **Create Azure Static Web App** (see DEPLOYMENT_GUIDE.md)
2. **Add GitHub Secret**: `AZURE_STATIC_WEB_APPS_API_TOKEN`
3. **Push to main branch** to trigger deployment

## Environment Variables

Workflows automatically set:
- `DOMAIN`: micro.manish.online
- `CDN_BASE_URL`: https://cdn.micro.manish.online

To change, edit the `env` section in workflow files.

