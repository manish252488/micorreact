import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { storeLoader } from "host/utils";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import "./App.css";

function ProductNavigation() {
  const location = useLocation();
  const isDetailPage = location.pathname.includes("/detail");
  
  return (
    <nav className="product-nav">
      <Link 
        to="/" 
        className={!isDetailPage ? "active" : ""}
      >
        Product List
      </Link>
      {isDetailPage && (
        <>
          <span className="nav-separator">→</span>
          <span className="nav-current">Product Detail</span>
        </>
      )}
    </nav>
  );
}

function App() {
  const [store, setStore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadStore = async () => {
      try {
        setIsLoading(true);
        const loadedStore = await storeLoader.loadStore();
        if (mounted) {
          setStore(loadedStore);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load store:', err);
        if (mounted) {
          setError(err.message);
          // Use fallback store
          const fallbackStore = storeLoader.getStore();
          if (fallbackStore) {
            setStore(fallbackStore);
          }
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadStore();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="product-app-wrapper">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading store...</p>
          {error && (
            <p style={{ color: 'orange' }}>
              ⚠️ Host store not available, using fallback mode
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="product-app-wrapper">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Unable to Load Store</h2>
          <p>Please ensure the host application is running.</p>
          <p style={{ color: 'red' }}>Error: {error || 'Store not available'}</p>
        </div>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="product-app-wrapper">
          {error && (
            <div style={{ 
              background: '#fff3cd', 
              padding: '0.5rem', 
              textAlign: 'center',
              borderBottom: '1px solid #ffc107'
            }}>
              ⚠️ Running in fallback mode - Host store not available
            </div>
          )}
          <ProductNavigation />
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/detail/:id" element={<ProductDetail />} />
          </Routes>
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
