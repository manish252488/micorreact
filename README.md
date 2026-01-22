# React Micro Frontend Architecture

A complete implementation of a React Micro Frontend architecture using **Webpack Module Federation**. This project demonstrates how to build scalable, independently deployable frontend applications.

## 📋 Table of Contents

- [What are Micro Frontends?](#what-are-micro-frontends)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Step-by-Step Setup](#step-by-step-setup)
- [Running the Application](#running-the-application)
- [How It Works](#how-it-works)
- [Key Concepts](#key-concepts)
- [Interview Questions & Answers](#interview-questions--answers)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## 🎯 What are Micro Frontends?

Micro Frontends is an architectural pattern where a frontend application is composed of smaller, independent applications that can be developed, tested, and deployed separately. Each micro frontend is owned by a different team and can use different technologies, frameworks, or libraries.

### Benefits:
- **Independent Deployment**: Deploy features without affecting other parts
- **Team Autonomy**: Different teams can work on different micro frontends
- **Technology Diversity**: Use different frameworks for different micro frontends
- **Scalability**: Scale teams and applications independently
- **Faster Development**: Smaller codebases are easier to understand and maintain

---

## 🏗️ Architecture Overview

This project implements a **Host-Container** pattern using Webpack Module Federation:

```
┌─────────────────────────────────────────┐
│         Host Application                │
│         (Port 3000)                     │
│  ┌──────────────────────────────────┐  │
│  │  Routes & Navigation             │  │
│  └──────────────────────────────────┘  │
│           │              │              │
│           ▼              ▼              │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   Product    │  │     Cart     │   │
│  │  Micro App   │  │  Micro App   │   │
│  │  (Port 3001) │  │  (Port 3002) │   │
│  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────┘
```

### Components:

1. **Host Application** (`packages/host`)
   - Shell/Container application
   - Manages routing and navigation
   - Loads remote micro frontends dynamically
   - Port: 3000

2. **Product Micro Frontend** (`packages/product`)
   - Displays product listings
   - Exposes `ProductApp` component
   - Port: 3001

3. **Cart Micro Frontend** (`packages/cart`)
   - Manages shopping cart
   - Exposes `CartApp` component
   - Port: 3002

---

## 📁 Project Structure

```
micorreact/
├── package.json                 # Root workspace configuration
├── .gitignore
├── README.md
└── packages/
    ├── host/                    # Host/Shell application
    │   ├── package.json
    │   ├── webpack.config.js    # Module Federation consumer
    │   ├── public/
    │   │   └── index.html
    │   └── src/
    │       ├── index.jsx
    │       ├── App.jsx
    │       └── App.css
    │
    ├── product/                 # Product micro frontend
    │   ├── package.json
    │   ├── webpack.config.js    # Module Federation provider
    │   ├── public/
    │   │   └── index.html
    │   └── src/
    │       ├── index.jsx
    │       ├── App.jsx
    │       └── App.css
    │
    └── cart/                    # Cart micro frontend
        ├── package.json
        ├── webpack.config.js    # Module Federation provider
        ├── public/
        │   └── index.html
        └── src/
            ├── index.jsx
            ├── App.jsx
            └── App.css
```

---

## 🛠️ Technologies Used

- **React 18.2.0** - UI library
- **Webpack 5** - Module bundler
- **Module Federation** - Micro frontend integration
- **React Router** - Client-side routing
- **Babel** - JavaScript compiler
- **npm workspaces** - Monorepo management

---

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
# Install all dependencies for all packages
npm install
```

This will install dependencies for:
- Root workspace
- Host application
- Product micro frontend
- Cart micro frontend

### Step 2: Start Development Servers

You have two options:

#### Option A: Start All Services Together
```bash
npm run start:all
```

#### Option B: Start Services Individually (in separate terminals)

Terminal 1 - Start Product Micro Frontend:
```bash
npm run start:product
# Runs on http://localhost:3001
```

Terminal 2 - Start Cart Micro Frontend:
```bash
npm run start:cart
# Runs on http://localhost:3002
```

Terminal 3 - Start Host Application:
```bash
npm run start:host
# Runs on http://localhost:3000
```

**Important**: Always start the remote micro frontends (product, cart) before starting the host application.

### Step 3: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see:
- Home page with navigation
- Products page (loaded from port 3001)
- Cart page (loaded from port 3002)

---

## 🔧 How It Works

### Module Federation Configuration

#### 1. Remote Applications (Product & Cart)

Each remote application exposes components via Module Federation:

```javascript
// packages/product/webpack.config.js
new ModuleFederationPlugin({
  name: "product",
  filename: "remoteEntry.js",  // Entry point file
  exposes: {
    "./ProductApp": "./src/App",  // Expose ProductApp component
  },
  shared: {
    react: { singleton: true },
    "react-dom": { singleton: true },
  },
})
```

**Key Points:**
- `name`: Unique identifier for the remote
- `filename`: The file that will be loaded by the host
- `exposes`: Components/modules to expose
- `shared`: Dependencies shared between host and remotes

#### 2. Host Application

The host consumes remote applications:

```javascript
// packages/host/webpack.config.js
new ModuleFederationPlugin({
  name: "host",
  remotes: {
    product: "product@http://localhost:3001/remoteEntry.js",
    cart: "cart@http://localhost:3002/remoteEntry.js",
  },
  shared: {
    react: { singleton: true },
    "react-dom": { singleton: true },
  },
})
```

**Key Points:**
- `remotes`: URLs to remote entry files
- `shared`: Ensures single instance of React across all apps

#### 3. Dynamic Import in Host

```javascript
// packages/host/src/App.jsx
const ProductApp = React.lazy(() => import("product/ProductApp"));
const CartApp = React.lazy(() => import("cart/CartApp"));
```

The host uses React's `lazy()` to dynamically load remote components.

---

## 🎓 Key Concepts

### 1. **Singleton Shared Dependencies**
```javascript
shared: {
  react: { singleton: true }
}
```
Ensures only one instance of React is loaded, preventing version conflicts.

### 2. **Remote Entry File**
- Generated by Webpack Module Federation
- Contains metadata about exposed modules
- Loaded dynamically at runtime

### 3. **Independent Deployment**
- Each micro frontend can be deployed separately
- Host application loads the latest version of remotes
- No need to rebuild host when remotes change

### 4. **Runtime Integration**
- Components are loaded at runtime, not build time
- Enables true independent deployment
- Supports A/B testing and gradual rollouts

---

## 💼 Interview Questions & Answers

### 1. **What is a Micro Frontend?**

**Answer:**
A Micro Frontend is an architectural pattern where a frontend application is decomposed into smaller, independently deployable applications. Each micro frontend is owned by a different team and can be developed, tested, and deployed separately. It's inspired by microservices architecture but applied to the frontend.

**Key Characteristics:**
- Independent development and deployment
- Technology agnostic (can use different frameworks)
- Team autonomy
- Runtime composition

---

### 2. **What are the different approaches to implement Micro Frontends?**

**Answer:**

1. **Build-time Integration**
   - Micro frontends are combined at build time
   - Example: npm packages
   - ❌ Requires rebuilding host when remotes change

2. **Server-side Integration**
   - Server composes HTML from multiple sources
   - Example: Server-Side Includes (SSI)
   - ✅ Good for SEO, ❌ Less flexible

3. **Runtime Integration (Module Federation)**
   - Components loaded at runtime via JavaScript
   - Example: Webpack Module Federation
   - ✅ True independent deployment, ✅ Most flexible

4. **iframe Integration**
   - Each micro frontend in separate iframe
   - ✅ Complete isolation, ❌ Communication challenges

5. **Web Components**
   - Using Custom Elements API
   - ✅ Framework agnostic, ❌ Limited browser support

---

### 3. **What is Webpack Module Federation?**

**Answer:**
Module Federation is a feature in Webpack 5 that allows a JavaScript application to dynamically load code from another application at runtime. It enables:

- **Sharing code** between applications
- **Exposing modules** from one application to others
- **Consuming remote modules** in the host application
- **Runtime integration** without build-time dependencies

**Key Benefits:**
- No need to rebuild host when remotes change
- Shared dependencies (React, etc.) loaded once
- True micro frontend architecture

---

### 4. **How does Module Federation work under the hood?**

**Answer:**

1. **Build Phase:**
   - Webpack generates a `remoteEntry.js` file
   - Contains metadata about exposed modules
   - Creates a container with shared dependencies

2. **Runtime Phase:**
   - Host application loads `remoteEntry.js` from remote
   - Remote container initializes
   - Host requests specific modules from remote
   - Shared dependencies are resolved (singleton pattern)

3. **Module Loading:**
   ```javascript
   import("product/ProductApp")
   // Webpack intercepts this and:
   // 1. Loads remoteEntry.js
   // 2. Initializes remote container
   // 3. Returns the requested module
   ```

---

### 5. **What is the difference between `exposes` and `remotes` in Module Federation?**

**Answer:**

- **`exposes`**: Used in **remote applications** to define what modules/components they want to share with other applications.
  ```javascript
  exposes: {
    "./ProductApp": "./src/App"
  }
  ```

- **`remotes`**: Used in **host applications** to define which remote applications they want to consume.
  ```javascript
  remotes: {
    product: "product@http://localhost:3001/remoteEntry.js"
  }
  ```

**Analogy:**
- `exposes` = "I'm offering these modules"
- `remotes` = "I want to use modules from these remotes"

---

### 6. **What is the `shared` configuration in Module Federation?**

**Answer:**
The `shared` configuration defines dependencies that should be shared between the host and remote applications. This prevents loading multiple versions of the same library.

```javascript
shared: {
  react: {
    singleton: true,        // Only one instance
    requiredVersion: "^18.2.0"  // Version requirement
  }
}
```

**Benefits:**
- Reduces bundle size
- Prevents version conflicts
- Ensures consistent behavior

**Options:**
- `singleton: true` - Only one instance allowed
- `requiredVersion` - Version requirement
- `eager: true` - Load immediately, not lazy

---

### 7. **How do you handle routing in Micro Frontends?**

**Answer:**

**Approach 1: Host-Managed Routing (Used in this project)**
- Host application manages all routes
- Each route loads a different micro frontend
- Simple and centralized

**Approach 2: Distributed Routing**
- Each micro frontend manages its own routes
- Host acts as a router that delegates to remotes
- More complex but more autonomous

**Approach 3: URL-Based Routing**
- Route based on URL patterns
- Each micro frontend handles specific paths
- Good for large applications

---

### 8. **How do Micro Frontends communicate with each other?**

**Answer:**

1. **Props (Parent-Child)**
   - Host passes data to remotes via props
   - Simple but limited

2. **Custom Events**
   ```javascript
   window.dispatchEvent(new CustomEvent('cart-updated', { detail: items }));
   ```

3. **Shared State Management**
   - Redux, Zustand, or Context API
   - Shared store accessible by all micro frontends

4. **Query Parameters / URL State**
   - Pass data via URL
   - Good for deep linking

5. **PostMessage API**
   - For cross-origin communication
   - Used with iframe approach

---

### 9. **What are the challenges of Micro Frontends?**

**Answer:**

1. **Bundle Size**
   - Multiple applications = larger total size
   - **Solution**: Shared dependencies, code splitting

2. **Version Conflicts**
   - Different versions of same library
   - **Solution**: Shared dependencies with versioning

3. **Styling Conflicts**
   - CSS from different apps can conflict
   - **Solution**: CSS Modules, Scoped CSS, CSS-in-JS

4. **Testing Complexity**
   - Testing integration between apps
   - **Solution**: Integration tests, E2E tests

5. **Development Experience**
   - Running multiple apps locally
   - **Solution**: Docker, npm workspaces, dev tools

6. **Performance**
   - Multiple network requests
   - **Solution**: CDN, caching, lazy loading

---

### 10. **How do you handle authentication in Micro Frontends?**

**Answer:**

1. **Shared Authentication Service**
   - Single auth service used by all micro frontends
   - JWT tokens stored in localStorage/cookies
   - Each app validates tokens independently

2. **Host-Managed Auth**
   - Host handles authentication
   - Passes auth state to remotes via props/context

3. **OAuth / SSO**
   - Centralized authentication
   - All apps redirect to same auth provider

4. **Token Sharing**
   - Store tokens in shared location
   - All apps read from same source

---

### 11. **How do you handle state management across Micro Frontends?**

**Answer:**

1. **Independent State**
   - Each micro frontend manages its own state
   - Simple but no shared state

2. **Shared Store (Redux/Zustand)**
   - Single store accessible by all apps
   - Requires careful state design

3. **Event-Based Communication**
   - Micro frontends communicate via events
   - Decoupled but harder to debug

4. **URL as State**
   - State stored in URL/query params
   - Good for shareable state

---

### 12. **What is the difference between Micro Frontends and Monorepo?**

**Answer:**

| Micro Frontends | Monorepo |
|----------------|----------|
| Runtime integration | Build-time integration |
| Independent deployment | Single deployment |
| Different teams/ownership | Shared codebase |
| Can use different tech stacks | Usually same tech stack |
| True microservices pattern | Code organization pattern |

**They can be combined:**
- Monorepo for code organization
- Module Federation for runtime integration

---

### 13. **How do you test Micro Frontends?**

**Answer:**

1. **Unit Tests**
   - Test each micro frontend independently
   - Standard React testing (Jest, React Testing Library)

2. **Integration Tests**
   - Test host + remote integration
   - Mock remote entry files

3. **E2E Tests**
   - Test complete user flows
   - Cypress, Playwright

4. **Contract Testing**
   - Test exposed APIs/contracts
   - Ensure remotes don't break host

---

### 14. **How do you deploy Micro Frontends?**

**Answer:**

**Independent Deployment:**
1. Build each micro frontend separately
2. Deploy to CDN or static hosting
3. Host application loads from deployed URLs
4. No need to rebuild host when remotes change

**Deployment Strategies:**
- **Blue-Green**: Deploy new version alongside old
- **Canary**: Gradual rollout to users
- **Feature Flags**: Enable/disable features

**Example:**
```javascript
remotes: {
  product: process.env.PROD 
    ? "product@https://cdn.example.com/product/remoteEntry.js"
    : "product@http://localhost:3001/remoteEntry.js"
}
```

---

### 15. **What are the alternatives to Module Federation?**

**Answer:**

1. **Single-SPA**
   - Framework-agnostic router
   - Loads different frameworks per route

2. **SystemJS**
   - Dynamic module loader
   - Works with any module format

3. **Piral**
   - Micro frontend framework
   - Built on Module Federation

4. **qiankun**
   - Alibaba's micro frontend solution
   - Based on Single-SPA

5. **Federated Modules (Vite)**
   - Vite's implementation of Module Federation

---

## ✅ Best Practices

### 1. **Shared Dependencies**
- Always share React, React-DOM as singletons
- Share common utilities and libraries
- Version your shared dependencies carefully

### 2. **Error Boundaries**
- Wrap remote components in Error Boundaries
- Handle loading failures gracefully

### 3. **Loading States**
- Show loading indicators while remotes load
- Handle network failures

### 4. **Version Management**
- Use semantic versioning for remotes
- Implement version checking in host

### 5. **Styling**
- Use CSS Modules or Scoped CSS
- Avoid global styles that conflict
- Consider CSS-in-JS solutions

### 6. **Performance**
- Lazy load remote components
- Implement code splitting
- Use CDN for remote entry files

### 7. **Development**
- Use npm workspaces or similar for monorepo
- Document exposed APIs
- Maintain consistent coding standards

---

## 🐛 Troubleshooting

### Issue: Remote not loading

**Solutions:**
1. Ensure remote is running before host
2. Check CORS settings
3. Verify remoteEntry.js is accessible
4. Check browser console for errors

### Issue: Version conflicts

**Solutions:**
1. Ensure shared dependencies match versions
2. Use `singleton: true` for critical dependencies
3. Check `requiredVersion` in shared config

### Issue: Styling conflicts

**Solutions:**
1. Use CSS Modules
2. Add unique prefixes to CSS classes
3. Use CSS-in-JS libraries

### Issue: Build errors

**Solutions:**
1. Clear node_modules and reinstall
2. Check Node.js version (>=16)
3. Verify webpack version (5.x)

---

## 📚 Additional Resources

- [Webpack Module Federation Documentation](https://webpack.js.org/concepts/module-federation/)
- [Micro Frontends by Martin Fowler](https://martinfowler.com/articles/micro-frontends.html)
- [Module Federation Examples](https://github.com/module-federation/module-federation-examples)

---

## 🎯 Summary

This project demonstrates a production-ready Micro Frontend architecture using Webpack Module Federation. Key takeaways:

1. **Independent Development**: Each micro frontend can be developed separately
2. **Runtime Integration**: Components loaded at runtime, not build time
3. **Shared Dependencies**: React and other libs shared to prevent duplication
4. **Scalable Architecture**: Easy to add new micro frontends
5. **Team Autonomy**: Different teams can own different micro frontends

---

## 📝 License

This project is for educational purposes.

---

**Happy Coding! 🚀**

