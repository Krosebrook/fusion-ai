import { useState, useEffect, createContext, useContext } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setError(null);
    } catch (err) {
      setUser(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (redirectUrl) => {
    await base44.auth.logout(redirectUrl);
    setUser(null);
  };

  const login = (nextUrl) => {
    base44.auth.redirectToLogin(nextUrl);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, checkAuth, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useRequireAuth(requiredRole) {
  const { user, loading } = useAuth();

  if (!loading && !user) {
    base44.auth.redirectToLogin(window.location.pathname);
    return { authorized: false, loading: true };
  }

  if (!loading && requiredRole && user?.role !== requiredRole) {
    return { authorized: false, loading: false, user };
  }

  return { authorized: true, loading, user };
}