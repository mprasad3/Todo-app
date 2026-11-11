const TOKEN_KEY = 'todo_session_token';
const USER_KEY = 'todo_session_user';
const ONBOARDED_KEY = 'todo_onboarded';

export const storage = {
  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
  getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setUser(user) {
    try {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_KEY);
    } catch {}
  },
  hasOnboarded() {
    try {
      return localStorage.getItem(ONBOARDED_KEY) === '1';
    } catch {
      return false;
    }
  },
  setOnboarded(value) {
    try {
      if (value) localStorage.setItem(ONBOARDED_KEY, '1');
      else localStorage.removeItem(ONBOARDED_KEY);
    } catch {}
  },
  clearSession() {
    this.setToken(null);
    this.setUser(null);
  },
};
