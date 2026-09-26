import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Resident, Watchman, UserRole } from '../types.ts';
import { apiFetch } from './api.ts';

interface AuthSessionData {
  role: UserRole;
  user?: User;
  resident?: Resident;
  watchman?: Watchman;
  token?: string;
}

interface AuthContextType {
  role: UserRole | null;
  user: User | null;
  resident: Resident | null;
  watchman: Watchman | null;
  isLoading: boolean;
  login: (data: AuthSessionData) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [resident, setResident] = useState<Resident | null>(null);
  const [watchman, setWatchman] = useState<Watchman | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkSession = useCallback(async () => {
    try {
      const res = await apiFetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setRole(data.role || null);
        setUser(data.user || null);
        setResident(data.resident || null);
        setWatchman(data.watchman || null);
      } else {
        setRole(null);
        setUser(null);
        setResident(null);
        setWatchman(null);
      }
    } catch (err) {
      console.error('Session check failed:', err);
      setRole(null);
      setUser(null);
      setResident(null);
      setWatchman(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = (data: AuthSessionData) => {
    setRole(data.role);
    setUser(data.user || null);
    setResident(data.resident || null);
    setWatchman(data.watchman || null);
    if (data.token) {
      localStorage.setItem('society_token', data.token);
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('society_token');
      setRole(null);
      setUser(null);
      setResident(null);
      setWatchman(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        resident,
        watchman,
        isLoading,
        login,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
