/**
 * Host Loader Utility
 * Safely loads host resources with fallbacks and retry logic
 * 
 * This handles the case where micro frontends load before the host application
 */

/**
 * Check if host module is available
 */
export const isHostAvailable = (moduleName) => {
  try {
    // Check if webpack container is available
    if (typeof window !== 'undefined' && window.__webpack_require__) {
      const container = window.__webpack_require__.cache;
      return container && container[moduleName];
    }
    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Safely import host module with retry logic
 */
export const safeImportHostModule = async (modulePath, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      // Use dynamic import with webpack magic comment for Module Federation
      // This allows webpack to properly handle remote module imports
      let module;
      if (modulePath === 'host/store') {
        module = await import(/* webpackChunkName: "host-store" */ 'host/store');
      } else if (modulePath === 'host/utils') {
        module = await import(/* webpackChunkName: "host-utils" */ 'host/utils');
      } else {
        // Fallback for other module paths (with warning suppression)
        module = await import(/* webpackMode: "lazy" */ modulePath);
      }
      return { success: true, module, error: null };
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed to load ${modulePath}:`, error.message);
      
      if (i < retries - 1) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        return { success: false, module: null, error: error.message };
      }
    }
  }
};

/**
 * Create a safe store loader with fallback
 */
export const createSafeStoreLoader = () => {
  let store = null;
  let storePromise = null;
  let fallbackStore = null;

  // Create a minimal fallback store
  const createFallbackStore = () => {
    if (fallbackStore) return fallbackStore;

    const createStore = (reducer, initialState = {}) => {
      let state = initialState;
      const listeners = [];

      return {
        getState: () => state,
        dispatch: (action) => {
          try {
            state = reducer(state, action);
            listeners.forEach(listener => listener());
            return action;
          } catch (error) {
            console.error('Fallback store dispatch error:', error);
            return action;
          }
        },
        subscribe: (listener) => {
          listeners.push(listener);
          return () => {
            const index = listeners.indexOf(listener);
            if (index > -1) listeners.splice(index, 1);
          };
        },
        replaceReducer: () => {},
      };
    };

    const fallbackReducer = (state = { cart: { items: [], total: 0, itemCount: 0 }, user: { user: null, preferences: {}, isAuthenticated: false } }, action) => {
      // Minimal reducer for fallback
      if (action.type === 'ADD_TO_CART') {
        const existingItem = state.cart.items.find(item => item.id === action.payload.id);
        const newItems = existingItem
          ? state.cart.items.map(item =>
              item.id === action.payload.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...state.cart.items, { ...action.payload, quantity: 1 }];
        
        const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return {
          ...state,
          cart: {
            items: newItems,
            total,
            itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
          },
        };
      }
      return state;
    };

    fallbackStore = createStore(fallbackReducer);
    return fallbackStore;
  };

  const loadStore = async () => {
    if (store) return store;
    if (storePromise) return storePromise;

    storePromise = (async () => {
      try {
        const result = await safeImportHostModule('host/store', 3, 1000);
        if (result.success && result.module && result.module.default) {
          store = result.module.default;
          console.info('✅ Host store loaded successfully');
          return store;
        } else {
          console.warn('⚠️ Host store not available, using fallback store');
          return createFallbackStore();
        }
      } catch (error) {
        console.error('❌ Failed to load host store:', error);
        return createFallbackStore();
      } finally {
        storePromise = null;
      }
    })();

    return storePromise;
  };

  return {
    loadStore,
    getStore: () => store,
    isStoreLoaded: () => store !== null,
  };
};

/**
 * Create a safe utils loader with fallback
 */
export const createSafeUtilsLoader = () => {
  let utils = null;
  let utilsPromise = null;

  // Fallback utilities (minimal implementations)
  const fallbackUtils = {
    formatCurrency: (amount, currency = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    },
    formatDate: (date) => {
      return new Date(date).toLocaleDateString();
    },
    logger: {
      info: (...args) => console.log('[INFO]', ...args),
      error: (...args) => console.error('[ERROR]', ...args),
      warn: (...args) => console.warn('[WARN]', ...args),
      debug: (...args) => console.log('[DEBUG]', ...args),
    },
    eventEmitter: {
      on: () => {},
      off: () => {},
      emit: () => {},
      once: () => {},
    },
    storage: {
      get: (key, defaultValue = null) => {
        try {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : defaultValue;
        } catch {
          return defaultValue;
        }
      },
      set: (key, value) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch {
          return false;
        }
      },
      remove: (key) => {
        try {
          localStorage.removeItem(key);
          return true;
        } catch {
          return false;
        }
      },
    },
  };

  const loadUtils = async () => {
    if (utils) return utils;
    if (utilsPromise) return utilsPromise;

    utilsPromise = (async () => {
      try {
        const result = await safeImportHostModule('host/utils', 3, 1000);
        if (result.success && result.module) {
          utils = result.module.default || result.module;
          console.info('✅ Host utils loaded successfully');
          return utils;
        } else {
          console.warn('⚠️ Host utils not available, using fallback utils');
          return fallbackUtils;
        }
      } catch (error) {
        console.error('❌ Failed to load host utils:', error);
        return fallbackUtils;
      } finally {
        utilsPromise = null;
      }
    })();

    return utilsPromise;
  };

  return {
    loadUtils,
    getUtils: () => utils,
    isUtilsLoaded: () => utils !== null,
  };
};

// Export singleton instances
export const storeLoader = createSafeStoreLoader();
export const utilsLoader = createSafeUtilsLoader();

