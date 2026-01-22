/**
 * Redux Store Configuration
 * This store is shared across all micro frontends via Module Federation
 */

import { createStore, combineReducers } from 'redux';
import cartReducer from './reducers/cartReducer';
import userReducer from './reducers/userReducer';

// Combine all reducers
const rootReducer = combineReducers({
  cart: cartReducer,
  user: userReducer,
});

// Create the store
const store = createStore(
  rootReducer,
  // Enable Redux DevTools Extension
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;

// Export action creators for use in micro frontends
export * from './actions/cartActions';
export * from './actions/userActions';

