import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "host/store";
import { utilsLoader } from "host/utils";
import "../App.css";

const products = [
  { id: 1, name: "Laptop", price: 999, description: "High-performance laptop", category: "Electronics" },
  { id: 2, name: "Phone", price: 699, description: "Latest smartphone", category: "Electronics" },
  { id: 3, name: "Tablet", price: 499, description: "Portable tablet device", category: "Electronics" },
  { id: 4, name: "Headphones", price: 199, description: "Wireless headphones", category: "Audio" },
];

function ProductList() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [utils, setUtils] = useState(null);
  const dispatch = useDispatch();
  const cartItemCount = useSelector((state) => state.cart.itemCount);

  // Load utils safely
  useEffect(() => {
    const loadUtils = async () => {
      try {
        const loadedUtils = await utilsLoader.loadUtils();
        setUtils(loadedUtils);
      } catch (err) {
        console.error('Failed to load utils:', err);
        setUtils(utilsLoader.getUtils());
      }
    };
    loadUtils();
  }, []);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    
    // Use shared utilities if available
    if (utils) {
      utils.logger?.info(`Product added to cart: ${product.name}`);
      utils.eventEmitter?.emit('product-added', {
        product: product.name,
        price: product.price,
        timestamp: new Date().toISOString(),
      });
    }
    
    alert(`${product.name} added to cart!`);
  };

  const formatCurrency = (amount) => {
    if (utils && utils.formatCurrency) {
      return utils.formatCurrency(amount);
    }
    // Fallback formatting
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="product-app">
      <h1>Product Catalog</h1>
      <p className="subtitle">
        Browse our collection of products | Cart Items: {cartItemCount}
      </p>
      
      <div className="products-grid">
        {products.map((product) => (
          <div
            key={product.id}
            className="product-card"
            onClick={() => setSelectedProduct(product)}
          >
            <h3>{product.name}</h3>
            {/* Using shared formatCurrency utility */}
            <p className="price">{formatCurrency(product.price)}</p>
            <p className="description">{product.description}</p>
            <div className="product-actions">
              <Link to={`/detail/${product.id}`} className="view-detail-btn">
                View Details
              </Link>
              <button 
                className="add-to-cart-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setSelectedProduct(null)}>
              &times;
            </span>
            <h2>{selectedProduct.name}</h2>
            <p>Price: {formatCurrency(selectedProduct.price)}</p>
            <p>{selectedProduct.description}</p>
            <Link 
              to={`/detail/${selectedProduct.id}`}
              className="view-detail-btn"
              onClick={() => setSelectedProduct(null)}
            >
              View Full Details
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;
