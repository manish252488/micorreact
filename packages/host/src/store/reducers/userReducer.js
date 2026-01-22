/**
 * User Reducer
 * Manages user state that can be shared across micro frontends
 */

import { SET_USER, UPDATE_USER_PREFERENCES, LOGOUT } from '../actions/userActions';

const initialState = {
  user: null,
  preferences: {
    theme: 'light',
    currency: 'USD',
    language: 'en',
  },
  isAuthenticated: false,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };

    case UPDATE_USER_PREFERENCES:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
        },
      };

    case LOGOUT:
      return initialState;

    default:
      return state;
  }
};

export default userReducer;

