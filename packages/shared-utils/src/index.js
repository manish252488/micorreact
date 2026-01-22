/**
 * Shared Utilities for Micro Frontends
 * This module exports common utility functions that can be used across all micro frontends
 */

// Import host loader utilities first to ensure they're available
import { 
  storeLoader, 
  utilsLoader, 
  createSafeStoreLoader, 
  createSafeUtilsLoader,
  safeImportHostModule,
  isHostAvailable 
} from './hostLoader';

// Re-export host loader utilities
export { 
  storeLoader, 
  utilsLoader, 
  createSafeStoreLoader, 
  createSafeUtilsLoader,
  safeImportHostModule,
  isHostAvailable 
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Format date
export const formatDate = (date, format = 'short') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    time: { hour: '2-digit', minute: '2-digit' },
  };
  return new Intl.DateTimeFormat('en-US', options[format] || options.short).format(dateObj);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Local storage helpers
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage: ${error}`);
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage: ${error}`);
      return false;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage: ${error}`);
      return false;
    }
  },
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error(`Error clearing localStorage: ${error}`);
      return false;
    }
  },
};

// API helper
export const apiCall = async (url, options = {}) => {
  try {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API call error:', error);
    return { success: false, error: error.message };
  }
};

// Validation helpers
export const validators = {
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  phone: (phone) => {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
  },
  required: (value) => {
    return value !== null && value !== undefined && value !== '';
  },
  minLength: (value, min) => {
    return value && value.length >= min;
  },
  maxLength: (value, max) => {
    return value && value.length <= max;
  },
  number: (value) => {
    return !isNaN(value) && !isNaN(parseFloat(value));
  },
};

// Logger utility
export const logger = {
  info: (message, ...args) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  error: (message, ...args) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  warn: (message, ...args) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
};

// Event emitter for cross-micro-frontend communication
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  once(event, callback) {
    const wrapper = (data) => {
      callback(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}

export const eventEmitter = new EventEmitter();

// Calculate tax
export const calculateTax = (amount, taxRate = 0.1) => {
  return amount * taxRate;
};

// Calculate total with tax
export const calculateTotal = (amount, taxRate = 0.1) => {
  return amount + calculateTax(amount, taxRate);
};

// Generate unique ID
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// Truncate string
export const truncate = (str, length = 50, suffix = '...') => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length) + suffix;
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

// Sleep/delay function
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry function
export const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);
      return retry(fn, retries - 1, delay);
    }
    throw error;
  }
};

// Default export with all utilities
export default {
  formatCurrency,
  formatDate,
  debounce,
  throttle,
  storage,
  apiCall,
  validators,
  logger,
  eventEmitter,
  calculateTax,
  calculateTotal,
  generateId,
  deepClone,
  isEmpty,
  truncate,
  capitalize,
  formatPhoneNumber,
  sleep,
  retry,
  storeLoader,
  utilsLoader,
};
