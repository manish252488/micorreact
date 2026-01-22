import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addToCart, setUser } from "../store";
import "./CommunicationExamples.css";

/**
 * Communication Examples Page
 * Demonstrates all 4 types of micro frontend communication:
 * 1. Props Passing
 * 2. Custom Browser Events
 * 3. Shared Backend APIs (simulated)
 * 4. Redux State Management (Lightweight State Sync)
 */

// Example 1: Props Passing Component
function PropsExample({ user, theme, onThemeChange }) {
  return (
    <div className="example-card">
      <h3>1. Props Passing</h3>
      <p>Data passed from parent (Host) to child (Micro Frontend)</p>
      <div className="example-content">
        <p><strong>User:</strong> {user?.name || "Guest"}</p>
        <p><strong>Theme:</strong> {theme}</p>
        <button onClick={() => onThemeChange(theme === "light" ? "dark" : "light")}>
          Toggle Theme
        </button>
      </div>
    </div>
  );
}

// Example 2: Custom Browser Events
function BrowserEventsExample() {
  const [eventLog, setEventLog] = useState([]);

  useEffect(() => {
    const handleCustomEvent = (event) => {
      setEventLog(prev => [...prev, {
        type: event.type,
        data: event.detail,
        timestamp: new Date().toLocaleTimeString(),
      }]);
    };

    // Listen for custom events
    window.addEventListener("product-added", handleCustomEvent);
    window.addEventListener("cart-updated", handleCustomEvent);
    window.addEventListener("user-action", handleCustomEvent);

    return () => {
      window.removeEventListener("product-added", handleCustomEvent);
      window.removeEventListener("cart-updated", handleCustomEvent);
      window.removeEventListener("user-action", handleCustomEvent);
    };
  }, []);

  const dispatchEvent = (eventName, data) => {
    const event = new CustomEvent(eventName, { detail: data });
    window.dispatchEvent(event);
  };

  return (
    <div className="example-card">
      <h3>2. Custom Browser Events</h3>
      <p>Micro frontends communicate via window events</p>
      <div className="example-content">
        <div className="event-buttons">
          <button onClick={() => dispatchEvent("product-added", { product: "Laptop", price: 999 })}>
            Dispatch Product Added
          </button>
          <button onClick={() => dispatchEvent("cart-updated", { itemCount: 5 })}>
            Dispatch Cart Updated
          </button>
          <button onClick={() => dispatchEvent("user-action", { action: "login" })}>
            Dispatch User Action
          </button>
        </div>
        <div className="event-log">
          <h4>Event Log:</h4>
          {eventLog.length === 0 ? (
            <p className="no-events">No events yet. Click buttons above to dispatch events.</p>
          ) : (
            <ul>
              {eventLog.slice(-5).reverse().map((log, index) => (
                <li key={index}>
                  <strong>{log.timestamp}</strong> - {log.type}: {JSON.stringify(log.data)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// Example 3: Shared Backend APIs (Simulated)
function ApiExample() {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async (endpoint) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockData = {
        "/api/products": { products: ["Laptop", "Phone", "Tablet"] },
        "/api/user": { name: "John Doe", email: "john@example.com" },
        "/api/cart": { items: 3, total: 1997 },
      };
      setApiData(mockData[endpoint] || { message: "Data fetched" });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="example-card">
      <h3>3. Shared Backend APIs</h3>
      <p>All micro frontends call the same backend APIs</p>
      <div className="example-content">
        <div className="api-buttons">
          <button onClick={() => fetchData("/api/products")} disabled={loading}>
            Fetch Products
          </button>
          <button onClick={() => fetchData("/api/user")} disabled={loading}>
            Fetch User
          </button>
          <button onClick={() => fetchData("/api/cart")} disabled={loading}>
            Fetch Cart
          </button>
        </div>
        {loading && <p>Loading...</p>}
        {apiData && (
          <div className="api-response">
            <pre>{JSON.stringify(apiData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

// Example 4: Redux State Management
function ReduxExample() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const cartTotal = useSelector((state) => state.cart.total);
  const user = useSelector((state) => state.user.user);

  const handleAddProduct = () => {
    const product = {
      id: Date.now(),
      name: `Product ${cartItems.length + 1}`,
      price: Math.floor(Math.random() * 500) + 100,
    };
    dispatch(addToCart(product));
  };

  const handleSetUser = () => {
    dispatch(setUser({
      name: "Jane Doe",
      email: "jane@example.com",
    }));
  };

  return (
    <div className="example-card">
      <h3>4. Redux State Management</h3>
      <p>Shared state managed via Redux store</p>
      <div className="example-content">
        <div className="redux-actions">
          <button onClick={handleAddProduct}>Add Random Product to Cart</button>
          <button onClick={handleSetUser}>Set User</button>
        </div>
        <div className="redux-state">
          <div>
            <h4>Cart State:</h4>
            <p>Items: {cartItems.length}</p>
            <p>Total: ${cartTotal.toFixed(2)}</p>
            <ul>
              {cartItems.map((item) => (
                <li key={item.id}>{item.name} - ${item.price}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>User State:</h4>
            <p>{user ? `${user.name} (${user.email})` : "No user set"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
function CommunicationExamples() {
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState({ name: "Guest User" });

  return (
    <div className="communication-examples">
      <h1>Micro Frontend Communication Examples</h1>
      <p className="intro">
        This page demonstrates all 4 types of communication patterns between micro frontends.
      </p>

      <div className="examples-grid">
        <PropsExample 
          user={user} 
          theme={theme} 
          onThemeChange={setTheme}
        />
        <BrowserEventsExample />
        <ApiExample />
        <ReduxExample />
      </div>

      <div className="summary">
        <h2>Summary</h2>
        <ul>
          <li><strong>Props Passing:</strong> Parent passes data to child components</li>
          <li><strong>Custom Events:</strong> Components communicate via window events</li>
          <li><strong>Shared APIs:</strong> All micro frontends use the same backend</li>
          <li><strong>Redux Store:</strong> Centralized state management shared across all apps</li>
        </ul>
      </div>
    </div>
  );
}

export default CommunicationExamples;

