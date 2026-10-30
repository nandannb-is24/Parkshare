import axios from 'axios';

// Central Axios instance using the configured environment URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Automatically attach JWT Bearer token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Centralized error and 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token upon authentication failure
      localStorage.removeItem('token');
      // Dispatch a custom event so any active auth listener can cleanly log out
      window.dispatchEvent(new Event('parkshare:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;

