/**
 * Cart Reducer
 * Manages cart state across all micro frontends
 */

import {
  ADD_TO_CART,
  REMOVE_FROM_CART,
  UPDATE_QUANTITY,
  CLEAR_CART,
  SET_CART_ITEMS,
} from '../actions/cartActions';

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
};

const calculateTotals = (items) => {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { itemCount, total };
};

const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TO_CART: {
      const product = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);
      
      let newItems;
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.items, { ...product, quantity: 1 }];
      }
      
      const { itemCount, total } = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        itemCount,
        total,
      };
    }

    case REMOVE_FROM_CART: {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const { itemCount, total } = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        itemCount,
        total,
      };
    }

    case UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;
      const newItems = state.items
        .map(item =>
          item.id === productId
            ? { ...item, quantity: Math.max(0, quantity) }
            : item
        )
        .filter(item => item.quantity > 0);
      
      const { itemCount, total } = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        itemCount,
        total,
      };
    }

    case CLEAR_CART:
      return initialState;

    case SET_CART_ITEMS: {
      const { itemCount, total } = calculateTotals(action.payload);
      return {
        ...state,
        items: action.payload,
        itemCount,
        total,
      };
    }

    default:
      return state;
  }
};

export default cartReducer;

