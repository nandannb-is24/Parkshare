import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Logout handler - clears persisted tokens and in-memory state
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  // Restore authenticated session from backend on initial mount
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (isMounted && res.data.success) {
          setUser(res.data.user);
          setToken(storedToken);
        }
      } catch (err) {
        // Token is invalid, expired, or user was deleted
        localStorage.removeItem('token');
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    restoreSession();

    // Listen for unauthorized 401 events dispatched by Axios interceptor
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('parkshare:unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('parkshare:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  // Login action
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.data.success) {
        const receivedToken = res.data.token;
        const receivedUser = res.data.user;

        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);

        return { success: true, user: receivedUser };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Unable to connect to the server. Please try again.';
      return { success: false, message };
    }
  };

  // Register action - never sends or accepts a role parameter from the client
  const register = async ({ name, email, password, flatNumber }) => {
    try {
      const res = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        flatNumber: flatNumber.trim(),
      });

      if (res.data.success) {
        const receivedToken = res.data.token;
        const receivedUser = res.data.user;

        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);

        return { success: true, user: receivedUser };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Unable to complete registration. Please try again.';
      return { success: false, message };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === 'admin',
    isResident: user?.role === 'resident',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

