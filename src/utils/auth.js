import { api } from './api';

const AUTH_TOKEN_KEY = 'authToken';
const USER_KEY = 'currentUser';

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
};

export const register = async (email, password) => {
  const { data } = await api.post('/auth/register', { email, password });
  localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getCurrentUser = async () => {
  try {
    // Toujours valider le token côté serveur
    const { data } = await api.get('/auth/me');
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  } catch (e) {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
