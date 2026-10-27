import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('mealmate_token'));
  const [loading, setLoading] = useState(true);

  // Validate existing token and retrieve user details on initial app load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('mealmate_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.getMe();
        if (response && response.user) {
          setUser(response.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed or token expired:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    if (response && response.token && response.user) {
      localStorage.setItem('mealmate_token', response.token);
      setToken(response.token);
      setUser(response.user);
      return response.user;
    }
    throw new Error(response.message || 'Login failed');
  };

  const register = async (name, email, password, confirmPassword) => {
    const response = await authAPI.register({ name, email, password, confirmPassword });
    if (response && response.token && response.user) {
      localStorage.setItem('mealmate_token', response.token);
      setToken(response.token);
      setUser(response.user);
      return response.user;
    }
    throw new Error(response.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('mealmate_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (name) => {
    const response = await authAPI.updateProfile({ name });
    if (response && response.user) {
      setUser(response.user);
      return response.user;
    }
    throw new Error(response.message || 'Failed to update profile');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
