import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import "./App.css";

// Lazy load remote components
const ProductApp = React.lazy(() => import("product/ProductApp"));
const CartApp = React.lazy(() => import("cart/CartApp"));
const CommunicationExamples = React.lazy(() => import("./pages/CommunicationExamples"));
const UtilsExample = React.lazy(() => import("./pages/UtilsExample"));

function Home() {
  return (
    <div className="home">
      <h1>Welcome to Micro Frontend Architecture</h1>
      <p>This is the Host/Shell application</p>
      <nav>
        <Link to="/products">Products</Link> | <Link to="/cart">Cart</Link>
      </nav>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="app">
          <header className="app-header">
            <h1>Micro Frontend Host Application</h1>
            <nav>
            <Link to="/">Home</Link> | <Link to="/products">Products</Link> |{" "}
            <Link to="/cart">Cart</Link> | <Link to="/communication">Communication</Link> |{" "}
            <Link to="/utils">Shared Utils</Link>
            </nav>
          </header>
          <main className="app-main">
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products/*" element={<ProductApp />} />
              <Route path="/cart/*" element={<CartApp />} />
              <Route path="/communication" element={<CommunicationExamples />} />
              <Route path="/utils" element={<UtilsExample />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;

