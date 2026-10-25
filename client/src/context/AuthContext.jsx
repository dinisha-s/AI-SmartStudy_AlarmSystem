import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check logged-in user on app launch
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await api.get('/auth/me/');
          setUser(res.data);
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login/', { email, password });
      const { access, refresh } = res.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // Fetch user profile details
      const userRes = await api.get('/auth/me/');
      setUser(userRes.data);
      return userRes.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Invalid email or password.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const res = await api.post('/auth/register/', userData);
      const { user: newUser, access, refresh } = res.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(newUser);
      return newUser;
    } catch (err) {
      const data = err.response?.data;
      let errorMsg = 'Registration failed.';
      if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        if (firstKey) {
          const val = data[firstKey];
          errorMsg = Array.isArray(val) ? `${firstKey}: ${val[0]}` : (typeof val === 'string' ? val : errorMsg);
        }
      }
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
