import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    sessionStorage.clear();
    localStorage.clear();
  }, []);

  // Server-side session verification on startup — 100% TAB ISOLATED
  useEffect(() => {
    // Clean up any old or lingering localStorage credentials from Edge/Chrome
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('session_time');

    const verifySession = async () => {
      try {
        // Read strictly from THIS TAB's sessionStorage
        const activeToken = sessionStorage.getItem('token');
        const activeUser = sessionStorage.getItem('user');

        if (!activeToken || !activeUser) {
          logout();
          setLoading(false);
          return;
        }

        // Validate token strictly with backend
        const res = await API.get('/auth/me', {
          headers: { Authorization: `Bearer ${activeToken}` },
        });

        if (res.data?.user) {
          setUser(res.data.user);
          setToken(activeToken);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed on server. Logging out...', err?.response?.data || err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [logout]);

  // Inactivity timeout: 30 minutes of idle time automatically logs out
  useEffect(() => {
    if (!user) return;

    let timeoutId;
    const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.warn('Session expired due to 30 minutes of inactivity.');
        logout();
        window.location.href = '/login?inactivity=true';
      }, INACTIVITY_LIMIT_MS);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [user, logout]);

  const login = async (email, password) => {
    // Clear any previous session or local storage
    localStorage.clear();
    sessionStorage.clear();

    const res = await API.post('/auth/login', { email, password });
    const { user: userData, token: authToken } = res.data;

    setUser(userData);
    setToken(authToken);

    // Store EXCLUSIVELY in this tab's sessionStorage
    sessionStorage.setItem('token', authToken);
    sessionStorage.setItem('user', JSON.stringify(userData));

    return userData;
  };

  const signup = async (data) => {
    localStorage.clear();
    sessionStorage.clear();

    const res = await API.post('/auth/signup', data);
    const { user: userData, token: authToken } = res.data;

    setUser(userData);
    setToken(authToken);

    // Store EXCLUSIVELY in this tab's sessionStorage
    sessionStorage.setItem('token', authToken);
    sessionStorage.setItem('user', JSON.stringify(userData));

    return userData;
  };

  const updatePassword = async (currentPassword, newPassword) => {
    await API.put('/auth/password', { currentPassword, newPassword });
  };

  const updateUserProfile = (updatedUserData) => {
    setUser((prev) => ({ ...prev, ...updatedUserData }));
    const merged = { ...(user || {}), ...updatedUserData };
    sessionStorage.setItem('user', JSON.stringify(merged));
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, updatePassword, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
