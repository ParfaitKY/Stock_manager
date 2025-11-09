import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-handle auth errors: clear token and reload to Login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data || {};
    // Déconnecte sur 401 ET sur 422 typiques JWT (Flask-JWT-Extended renvoie { msg: ... })
    if (status === 401 || (status === 422 && data?.msg)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      // Notifier l'application pour basculer en mode login sans reload
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('auth:invalid'));
      }
    }
    // Sur 400/422 de validation (sans clé msg), montrer un toast avec le message du backend
    if ((status === 400 || status === 422) && !data?.msg && typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      const msg = data?.message || 'Erreur de validation';
      window.dispatchEvent(new CustomEvent('toast:show', { detail: { type: 'error', message: msg, duration: 4500 } }));
    }
    return Promise.reject(error);
  }
);
