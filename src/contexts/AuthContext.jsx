/**
 * Global Authentication Context - Simplified & Robust
 * Manages user authentication state, tokens, and API communication
 */
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:8000/api';

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Failed to parse user:', err);
        localStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Register new user
   */
  const register = async (username, email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔵 Attempting registration...', { username, email, url: `${API_BASE_URL}/register` });
      
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      console.log('🔵 Response status:', response.status);

      const data = await response.json();
      console.log('🔵 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }

      // Save tokens and user
      if (data.access) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setUser(data.user);
        setIsAuthenticated(true);
        console.log('✅ Registration successful!', data.user);
      }

      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('❌ Registration error:', err);
      const errorMessage = err.message === 'Failed to fetch' 
        ? 'Cannot connect to server. Backend is not running on http://localhost:8000'
        : err.message;
      
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  };

  /**
   * Login user
   */
  const login = async (username, password) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔵 Attempting login...', { username, url: `${API_BASE_URL}/login` });
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('🔵 Response status:', response.status);

      const data = await response.json();
      console.log('🔵 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Login failed');
      }

      // Save tokens and user
      if (data.access) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setUser(data.user);
        setIsAuthenticated(true);
        console.log('✅ Login successful!', data.user);
      }

      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('❌ Login error:', err);
      const errorMessage = err.message === 'Failed to fetch' 
        ? 'Cannot connect to server. Backend is not running on http://localhost:8000'
        : err.message;
      
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear everything regardless of API response
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  };

  /**
   * Fetch user profile
   */
  const fetchProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    }
  };

  /**
   * Refresh access token
   */
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/token/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.access;
        localStorage.setItem('access_token', newToken);
        return newToken;
      }
    } catch (err) {
      console.error('Token refresh error:', err);
      logout();
    }
    return null;
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
    fetchProfile,
    refreshAccessToken,
    setError,
    setUser,
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
