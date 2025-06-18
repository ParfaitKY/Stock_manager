/**
 * Authentication utilities
 */

// Hard-coded credentials (as per requirements)
const VALID_EMAIL = 'test@gmail.com';
const VALID_PASSWORD = '123';
const AUTH_TOKEN_KEY = 'stockManagerAuthToken';

/**
 * Authenticate user with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {boolean} Authentication success
 */
export const authenticate = (email, password) => {
  if (email === VALID_EMAIL && password === VALID_PASSWORD) {
    // Create a simple token (in a real app, this would be a JWT or similar)
    const token = btoa(`${email}:${Date.now()}`);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return true;
  }
  return false;
};

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Log out the current user
 */
export const logout = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};