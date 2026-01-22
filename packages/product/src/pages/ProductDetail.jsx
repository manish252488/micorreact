import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "host/store";
import { utilsLoader } from "host/utils";
import "../App.css";

const products = [
  { 
    id: 1, 
    name: "Laptop", 
    price: 999, 
    description: "High-performance laptop with latest processor", 
    category: "Electronics",
    specs: "16GB RAM, 512GB SSD, Intel i7, 15.6 inch display",
    inStock: true,
    rating: 4.5
  },
  { 
    id: 2, 
    name: "Phone", 
    price: 699, 
    description: "Latest smartphone with advanced camera", 
    category: "Electronics",
    specs: "128GB storage, 6.1 inch display, 5G ready, 48MP camera",
    inStock: true,
    rating: 4.8
  },
  { 
    id: 3, 
    name: "Tablet", 
    price: 499, 
    description: "Portable tablet device for work and play", 
    category: "Electronics",
    specs: "10.2 inch display, 64GB storage, Wi-Fi, 10 hour battery",
    inStock: true,
    rating: 4.3
  },
  { 
    id: 4, 
    name: "Headphones", 
    price: 199, 
    description: "Wireless headphones with noise cancellation", 
    category: "Audio",
    specs: "Bluetooth 5.0, 30 hour battery, Active noise cancellation",
    inStock: true,
    rating: 4.6
  },
];

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [utils, setUtils] = useState(null);
  const cartItemCount = useSelector((state) => state.cart.itemCount);
  const product = products.find((p) => p.id === parseInt(id));

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

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart(product));
      if (utils) {
        utils.logger?.info(`Product added to cart from detail page: ${product.name}`);
        utils.eventEmitter?.emit('product-added', {
          product: product.name,
          price: product.price,
          source: 'product-detail',
        });
      }
      alert(`${product.name} added to cart!`);
    }
  };

  const formatCurrency = (amount) => {
    if (utils && utils.formatCurrency) {
      return utils.formatCurrency(amount);
    }
    // Fallback formatting
    return `$${amount.toFixed(2)}`;
  };

  if (!product) {
    return (
      <div className="product-app">
        <h1>Product Not Found</h1>
        <p>The product you're looking for doesn't exist.</p>
        <Link to="/" className="back-btn">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="product-app">
      <button onClick={() => navigate(-1)} className="back-btn">
        ← Back
      </button>
      
      <div className="product-detail">
        <div className="product-detail-image">
          <div className="product-image-placeholder">
            {product.name.charAt(0)}
          </div>
        </div>
        
        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <div className="product-rating">
            <span className="stars">{"★".repeat(Math.floor(product.rating))}</span>
            <span className="rating-text">({product.rating})</span>
          </div>
          <p className="product-category">{product.category}</p>
          <p className="cart-indicator">Cart Items: {cartItemCount}</p>
          
          <div className="product-price-large">{formatCurrency(product.price)}</div>
          
          <div className="product-specs">
            <h3>Specifications</h3>
            <p>{product.specs}</p>
          </div>
          
          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>
          
          <div className="product-availability">
            {product.inStock ? (
              <span className="in-stock">✓ In Stock</span>
            ) : (
              <span className="out-of-stock">✗ Out of Stock</span>
            )}
          </div>
          
          <div className="product-detail-actions">
            <button className="add-to-cart-btn-large" onClick={handleAddToCart}>
              Add to Cart
            </button>
            <button className="buy-now-btn" onClick={handleAddToCart}>
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;

