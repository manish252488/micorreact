/**
 * Redux Actions for User Management
 * Example of shared state that can be accessed by all micro frontends
 */

export const SET_USER = 'SET_USER';
export const UPDATE_USER_PREFERENCES = 'UPDATE_USER_PREFERENCES';
export const LOGOUT = 'LOGOUT';

export const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

export const updateUserPreferences = (preferences) => ({
  type: UPDATE_USER_PREFERENCES,
  payload: preferences,
});

export const logout = () => ({
  type: LOGOUT,
});

