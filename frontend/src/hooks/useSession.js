import { useCallback, useEffect, useState } from 'react';
import { setUnauthorizedHandler } from '../services/httpClient.js';
import { sessionService } from '../services/sessionService.js';
import { storage } from '../utils/storage.js';

export function useSession() {
  const [user, setUser] = useState(() => storage.getUser());
  const [token, setToken] = useState(() => storage.getToken());
  const [isBootstrapping, setIsBootstrapping] = useState(() => Boolean(storage.getToken()));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const clearLocalAuth = useCallback(() => {
    storage.clearSession();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearLocalAuth);
    return () => setUnauthorizedHandler(null);
  }, [clearLocalAuth]);

  useEffect(() => {
    let active = true;
    async function verifySession() {
      if (!token) {
        setIsBootstrapping(false);
        return;
      }
      try {
        const res = await sessionService.getCurrent();
        if (!active) return;
        if (res?.user) {
          storage.setUser(res.user);
          setUser(res.user);
        }
      } catch (err) {
        if (!active) return;
        if (err.status === 0) {
          setError(err.message);
        }
      } finally {
        if (active) setIsBootstrapping(false);
      }
    }
    verifySession();
    return () => {
      active = false;
    };
  }, [token]);

  const login = useCallback(async (username) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await sessionService.login(username.trim());
      storage.setToken(res.token);
      storage.setUser(res.user);
      storage.setOnboarded(true);
      setToken(res.token);
      setUser(res.user);
      return res;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsSubmitting(true);
    try {
      if (storage.getToken()) {
        await sessionService.logout();
      }
    } catch {} finally {
      clearLocalAuth();
      setIsSubmitting(false);
    }
  }, [clearLocalAuth]);

  return {
    user,
    isAuthenticated: Boolean(token && user),
    isBootstrapping,
    isSubmitting,
    error,
    setError,
    login,
    logout,
  };
}
