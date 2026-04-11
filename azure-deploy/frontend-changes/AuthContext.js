// ─── AZURE VERSION: AuthContext.js ───
// This replaces /app/frontend/src/context/AuthContext.js
// Key change: Uses relative '/api' URL instead of REACT_APP_BACKEND_URL

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/auth/me', { withCredentials: true });
      setUser(data);
    } catch {
      setUser(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
    setUser(data);
    return data;
  };

  const logout = async () => {
    await axios.post('/api/auth/logout', {}, { withCredentials: true });
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, checking, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
