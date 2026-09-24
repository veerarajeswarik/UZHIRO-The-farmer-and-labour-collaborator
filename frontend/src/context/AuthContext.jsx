import { createContext, useEffect, useState, useCallback } from 'react';
import * as authService from '../services/authService';

const TOKEN_KEY = 'uzhiro_token';

export const AuthContext = createContext(null);

/**
 * Holds the authenticated user + JWT for the whole app. Token is kept in
 * localStorage (simple, adequate for this prototype) and validated against
 * GET /api/auth/me on load so a stale/expired token doesn't silently leave
 * the UI in a logged-in-looking state.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await authService.getMe(token);
        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const registerUser = useCallback(async (payload) => {
    const data = await authService.register(payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user),
    loading,
    login,
    register: registerUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
