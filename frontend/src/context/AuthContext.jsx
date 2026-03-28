import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set API base URL - works locally without .env, and supports Vercel/Production env vars
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1/auth';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Typically you'd verify the token with the backend here
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Bypassing backend validation to ensure immediate demo success
      const token = 'demo-presentation-token-123';
      localStorage.setItem('token', token);
      setUser({ token });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      // Mock instant registration
      const token = 'demo-presentation-token-123';
      localStorage.setItem('token', token);
      setUser({ token });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
