import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [token, setToken] = useState(() => authService.getStoredToken());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = authService.getStoredToken();
      if (storedToken) {
        setToken(storedToken);
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          // If token verification failed or backend returned null, keep stored user or clear
          const localUser = authService.getStoredUser();
          if (localUser) {
            setUser(localUser);
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen for unauthorized 401 events dispatched by API client
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      setError('Session expired. Please log in again.');
    };

    window.addEventListener('lmpc:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('lmpc:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (identifier, password) => {
    setError(null);
    try {
      const result = await authService.login(identifier, password);
      setUser(result.user);
      setToken(result.token);
      return result;
    } catch (err) {
      const msg = err.message || 'Authentication failed. Please check your credentials.';
      setError(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
      setError(null);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    isLoading,
    error,
    login,
    logout,
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
