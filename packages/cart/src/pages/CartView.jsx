import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateQuantity, removeFromCart, clearCart } from "host/store";
import { formatCurrency, calculateTotal, logger, eventEmitter, storage } from "host/utils";
import "../App.css";

function CartView() {
  const dispatch = useDispatch();
  const [utils, setUtils] = useState(null);
  const cartItems = useSelector((state) => state.cart.items);
  const cartTotal = useSelector((state) => state.cart.total);

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

  // Listen to product-added events from other micro frontends
  useEffect(() => {
    if (!utils) return;

    const handleProductAdded = (data) => {
      utils.logger?.info('Product added event received:', data);
      // Could update UI or show notification
    };

    utils.eventEmitter?.on('product-added', handleProductAdded);

    // Save cart to localStorage using shared utility
    utils.storage?.set('cart', cartItems);

    return () => {
      utils.eventEmitter?.off('product-added', handleProductAdded);
    };
  }, [cartItems, utils]);

  const formatCurrency = (amount) => {
    if (utils && utils.formatCurrency) {
      return utils.formatCurrency(amount);
    }
    return `$${amount.toFixed(2)}`;
  };

  const calculateTotal = (amount, taxRate = 0.1) => {
    if (utils && utils.calculateTotal) {
      return utils.calculateTotal(amount, taxRate);
    }
    return amount * (1 + taxRate);
  };

  const tax = calculateTotal(cartTotal, 0.1) - cartTotal;
  const totalWithTax = calculateTotal(cartTotal, 0.1);

  const handleUpdateQuantity = (id, change) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      const newQuantity = Math.max(0, item.quantity + change);
      if (newQuantity === 0) {
        dispatch(removeFromCart(id));
      } else {
        dispatch(updateQuantity(id, newQuantity));
      }
    }
  };

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
  };

  return (
    <div className="cart-app">
      <h1>Shopping Cart</h1>
      <p className="subtitle">Review your items before checkout</p>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <Link to="/" className="shop-now-btn">Continue Shopping</Link>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p className="item-price">${item.price}</p>
                </div>
                <div className="quantity-controls">
                  <button onClick={() => handleUpdateQuantity(item.id, -1)}>-</button>
                  <span className="quantity">{item.quantity}</span>
                  <button onClick={() => handleUpdateQuantity(item.id, 1)}>+</button>
                </div>
                <div className="item-total">
                  {formatCurrency(item.price * item.quantity)}
                </div>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (10%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>{formatCurrency(totalWithTax)}</span>
            </div>
            <Link to="/checkout" className="checkout-btn">
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default CartView;

