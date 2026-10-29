import { createContext, useEffect, useState, useCallback } from 'react';
import * as authService from '../services/authService';

const TOKEN_KEY = 'uzhiro_token';

// localStorage can throw (private mode, blocked site data) - never let that crash the app.
function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(value) {
  try {
    if (value) localStorage.setItem(TOKEN_KEY, value);
    else writeToken(null);
  } catch {
    /* storage unavailable - session lasts for this tab only */
  }
}

export const AuthContext = createContext(null);

/**
 * Holds the authenticated user + JWT for the whole app. Token is kept in
 * localStorage (simple, adequate for this prototype) and validated against
 * GET /api/auth/me on load so a stale/expired token doesn't silently leave
 * the UI in a logged-in-looking state.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Set when a saved session couldn't be checked because the server was unreachable.
  const [sessionError, setSessionError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await authService.getMe(token);
        if (!cancelled) {
          setUser(data.user);
          setSessionError('');
        }
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401) {
          // Token is invalid/expired: drop it.
          writeToken(null);
          setToken(null);
          setUser(null);
        } else {
          // Server unreachable / restarting: keep the token so a temporary
          // outage doesn't log the user out. Protected pages will show the
          // network error and work again once the server is back.
          console.error('[auth] Could not restore session:', err);
          setSessionError(err.message || 'Unable to reach the server.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, [token, attempt]);

  // Re-check the saved session (e.g. after the server comes back).
  const retrySession = useCallback(() => {
    setLoading(true);
    setAttempt((n) => n + 1);
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    writeToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const registerUser = useCallback(async (payload) => {
    const data = await authService.register(payload);
    writeToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setSessionError('');
    writeToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user),
    loading,
    sessionError: user ? '' : sessionError,
    retrySession,
    login,
    register: registerUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
