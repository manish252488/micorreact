# URL Behavior in Micro Frontends - Development vs Production

## 🔍 Why the URL Stays at Port 3000

### Current Architecture (Development)

When you run all three services:
- **Host Application**: `http://localhost:3000` (Main entry point)
- **Product Micro Frontend**: `http://localhost:3001` (Remote module)
- **Cart Micro Frontend**: `http://localhost:3002` (Remote module)

**The URL stays at `localhost:3000` because:**

1. **Host-Managed Routing**: The host application (port 3000) manages all routing using React Router
2. **Remote Modules, Not Separate Apps**: Product and Cart are loaded as **remote components** into the host, not as separate applications
3. **Client-Side Routing**: When you click "Products" or "Cart", React Router changes the URL path (e.g., `/products`, `/cart`) but stays on the same origin (port 3000)

### How It Works

```
User navigates to: http://localhost:3000/products
                    ↓
Host App (port 3000) loads ProductApp component
                    ↓
ProductApp is fetched from port 3001 via Module Federation
                    ↓
ProductApp renders INSIDE the host application
                    ↓
URL remains: http://localhost:3000/products (not 3001!)
```

The ports 3001 and 3002 are only used for:
- **Development servers** to serve the remote entry files
- **Module Federation** to fetch JavaScript bundles at runtime
- **NOT for direct user navigation**

---

## 🚀 Production URL Behavior

### Option 1: Single Domain (Recommended)

**Architecture:**
```
https://myapp.com (Host)
├── /products → Loads ProductApp from CDN
├── /cart → Loads CartApp from CDN
└── / → Home page
```

**Webpack Configuration (Using Environment Variables):**
```javascript
// packages/host/webpack.config.js
const getRemoteUrl = (name, defaultPort) => {
  const envVar = process.env[`REMOTE_${name.toUpperCase()}_URL`];
  if (envVar) {
    return `${name}@${envVar}`;
  }
  // Development fallback
  return `${name}@http://localhost:${defaultPort}/remoteEntry.js`;
};

remotes: {
  product: getRemoteUrl("product", 3001),
  cart: getRemoteUrl("cart", 3002),
}
```

**Environment Variables (.env files):**

**For Host Application:**
```bash
# .env.development (default, optional)
REMOTE_PRODUCT_URL=http://localhost:3001/remoteEntry.js
REMOTE_CART_URL=http://localhost:3002/remoteEntry.js

# .env.production
REMOTE_PRODUCT_URL=https://cdn.myapp.com/product/remoteEntry.js
REMOTE_CART_URL=https://cdn.myapp.com/cart/remoteEntry.js
```

**For Product & Cart Micro Frontends:**
```bash
# .env.development (default, optional)
REMOTE_HOST_URL=http://localhost:3000/remoteEntry.js

# .env.production
REMOTE_HOST_URL=https://cdn.myapp.com/host/remoteEntry.js
```

**Note:** Product and Cart need `REMOTE_HOST_URL` to consume `host/store` and `host/utils` modules.

**Benefits:**
- ✅ Single domain for users
- ✅ No CORS issues
- ✅ Better SEO
- ✅ Simpler deployment

**Deployment:**
1. Build each micro frontend separately
2. Deploy to CDN (e.g., AWS CloudFront, Cloudflare)
3. Host application references CDN URLs
4. Users only see: `https://myapp.com/products`, `https://myapp.com/cart`

---

### Option 2: Reverse Proxy / Load Balancer

**Architecture:**
```
https://myapp.com (Reverse Proxy)
├── Routes /products/* → Product Service (internal)
├── Routes /cart/* → Cart Service (internal)
└── Routes /* → Host Service (internal)
```

**Example with Nginx:**
```nginx
server {
    listen 443 ssl;
    server_name myapp.com;

    # Host application
    location / {
        proxy_pass http://host-service:3000;
    }

    # Product micro frontend
    location /products {
        proxy_pass http://product-service:3001;
    }

    # Cart micro frontend
    location /cart {
        proxy_pass http://cart-service:3002;
    }
}
```

**Benefits:**
- ✅ Single domain
- ✅ Can route based on URL patterns
- ✅ Load balancing capabilities

---

### Option 3: Subdomain Routing (Less Common)

**Architecture:**
```
https://app.myapp.com (Host)
https://products.myapp.com (Product - standalone)
https://cart.myapp.com (Cart - standalone)
```

**When to Use:**
- Each micro frontend is truly independent
- Different teams own different subdomains
- Need complete isolation

**Challenges:**
- ❌ CORS configuration needed
- ❌ Shared state management more complex
- ❌ More complex deployment

---

## 📋 Production Deployment Checklist

### 1. Update Webpack Configs for Production (Using Environment Variables)

```javascript
// packages/host/webpack.config.js
const getRemoteUrl = (name, defaultPort) => {
  const envVar = process.env[`REMOTE_${name.toUpperCase()}_URL`];
  if (envVar) {
    return `${name}@${envVar}`;
  }
  // Development fallback
  return `${name}@http://localhost:${defaultPort}/remoteEntry.js`;
};

module.exports = merge(common, {
  plugins: [
    new ModuleFederationPlugin({
      name: "host",
      remotes: {
        product: getRemoteUrl("product", 3001),
        cart: getRemoteUrl("cart", 3002),
      },
      // ... rest of config
    }),
  ],
});
```

**Create environment files:**

**Host Application (.env files):**
```bash
# .env.development
REMOTE_PRODUCT_URL=http://localhost:3001/remoteEntry.js
REMOTE_CART_URL=http://localhost:3002/remoteEntry.js

# .env.production
REMOTE_PRODUCT_URL=https://cdn.example.com/product/remoteEntry.js
REMOTE_CART_URL=https://cdn.example.com/cart/remoteEntry.js
```

**Product & Cart Applications (.env files):**
```bash
# .env.development
REMOTE_HOST_URL=http://localhost:3000/remoteEntry.js

# .env.production
REMOTE_HOST_URL=https://cdn.example.com/host/remoteEntry.js
```

### 2. Build Scripts

```json
// package.json
{
  "scripts": {
    "build:host": "NODE_ENV=production cd packages/host && npm run build",
    "build:product": "NODE_ENV=production cd packages/product && npm run build",
    "build:cart": "NODE_ENV=production cd packages/cart && npm run build",
    "build:all": "npm run build:product && npm run build:cart && npm run build:host"
  }
}
```

### 3. Deployment Steps

1. **Build each micro frontend:**
   ```bash
   npm run build:product  # Creates dist/ with remoteEntry.js
   npm run build:cart     # Creates dist/ with remoteEntry.js
   npm run build:host     # Creates dist/ with host app
   ```

2. **Deploy to CDN/Static Hosting:**
   - Upload `packages/product/dist/*` → `https://cdn.example.com/product/`
   - Upload `packages/cart/dist/*` → `https://cdn.example.com/cart/`
   - Upload `packages/host/dist/*` → Main hosting (e.g., S3, Netlify, Vercel)

3. **Update Remote URLs:**
   - Ensure webpack config points to production CDN URLs
   - Rebuild host if needed (or use environment variables)

### 4. Environment Variables (Recommended - Already Implemented)

The webpack config now uses environment variables automatically:

```javascript
// webpack.config.js
const getRemoteUrl = (name, defaultPort) => {
  const envVar = process.env[`REMOTE_${name.toUpperCase()}_URL`];
  if (envVar) {
    return `${name}@${envVar}`;
  }
  return `${name}@http://localhost:${defaultPort}/remoteEntry.js`;
};
```

**Usage:**
- Set `REMOTE_PRODUCT_URL` and `REMOTE_CART_URL` environment variables
- No hardcoded URLs in the code
- Works with any CI/CD pipeline
- Supports multiple environments (dev, staging, prod)

---

## 🔄 URL Routing Behavior

### Development
```
http://localhost:3000/              → Home (Host)
http://localhost:3000/products      → ProductApp (loaded from 3001)
http://localhost:3000/products/detail/123 → ProductDetail (inside ProductApp)
http://localhost:3000/cart           → CartApp (loaded from 3002)
http://localhost:3000/cart/checkout → Checkout (inside CartApp)
```

### Production (Single Domain)
```
https://myapp.com/              → Home (Host)
https://myapp.com/products      → ProductApp (loaded from CDN)
https://myapp.com/products/detail/123 → ProductDetail
https://myapp.com/cart          → CartApp (loaded from CDN)
https://myapp.com/cart/checkout → Checkout
```

**Key Point:** The URL structure stays the same! Only the origin changes from `localhost:3000` to `myapp.com`.

---

## 🎯 Best Practices for Production

### 1. **Use Environment Variables**
```javascript
// .env.production
REACT_APP_PRODUCT_URL=https://cdn.example.com/product
REACT_APP_CART_URL=https://cdn.example.com/cart
```

### 2. **Version Your Remote Entry Files**
```javascript
// Include version in filename for cache busting
filename: `remoteEntry.${process.env.APP_VERSION || 'latest'}.js`
```

### 3. **Error Handling for Failed Remote Loads**
```javascript
const ProductApp = React.lazy(() => 
  import("product/ProductApp").catch(() => ({
    default: () => <div>Product service unavailable</div>
  }))
);
```

### 4. **CDN Configuration**
- Enable CORS headers
- Set proper cache headers
- Use HTTPS
- Consider using a CDN with edge locations

### 5. **Monitoring**
- Monitor remote entry file load times
- Track failed remote loads
- Alert on version mismatches

---

## 📊 Summary

| Aspect | Development | Production |
|--------|------------|-----------|
| **Host URL** | `localhost:3000` | `myapp.com` |
| **Product URL** | Loaded from `localhost:3001` | Loaded from CDN |
| **Cart URL** | Loaded from `localhost:3002` | Loaded from CDN |
| **User Sees** | `localhost:3000/products` | `myapp.com/products` |
| **Remote Entry** | `localhost:3001/remoteEntry.js` | `cdn.example.com/product/remoteEntry.js` |
| **Routing** | Client-side (React Router) | Client-side (React Router) |
| **Navigation** | Stays on same origin | Stays on same origin |

**The key takeaway:** In both development and production, users navigate within a single application (the host). The micro frontends are loaded as remote modules, not as separate applications with different URLs.

