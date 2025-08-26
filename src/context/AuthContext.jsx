// src/context/AuthContext.js
import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Mock login
  const login = async ({ email, password }) => {
    setLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const mockUser = { email }; // simulate user object
          setUser(mockUser);
          resolve(mockUser);
        } else {
          reject(new Error('Invalid credentials'));
        }
        setLoading(false);
      }, 500); // simulate network delay
    });
  };

  // Mock register
  const register = async ({ username, email, password }) => {
    setLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username && email && password) {
          const mockUser = { username, email };
          setUser(mockUser);
          resolve(mockUser);
        } else {
          reject(new Error('Missing information'));
        }
        setLoading(false);
      }, 500);
    });
  };

  // Mock logout
  const logout = () => {
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
