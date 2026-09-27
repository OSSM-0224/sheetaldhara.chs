import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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

  // Incremented on every login() as well as every checkSession() call. A response
  // whose generation is stale is discarded instead of overwriting newer state.
  //
  // Without this, a user who submits credentials before the mount-time
  // /api/auth/me resolves has that pre-login request (sent with no cookie) come
  // back 401 *after* login() succeeded, and its setRole(null) silently signs the
  // fresh session straight back out.
  const sessionGeneration = useRef(0);

  const applySession = useCallback((data: AuthSessionData | null) => {
    if (data) {
      setRole(data.role ?? null);
      setUser(data.user || null);
      setResident(data.resident || null);
      setWatchman(data.watchman || null);
    } else {
      setRole(null);
      setUser(null);
      setResident(null);
      setWatchman(null);
    }
  }, []);

  const checkSession = useCallback(async () => {
    const generation = ++sessionGeneration.current;

    try {
      const res = await apiFetch('/api/auth/me');
      if (generation !== sessionGeneration.current) return;

      if (res.ok) {
        const data = await res.json();
        if (generation !== sessionGeneration.current) return;
        applySession({
          role: data.role,
          user: data.user,
          resident: data.resident,
          watchman: data.watchman,
        });
      } else {
        applySession(null);
      }
    } catch (err) {
      if (generation !== sessionGeneration.current) return;
      console.error('Session check failed:', err);
      applySession(null);
    } finally {
      if (generation === sessionGeneration.current) {
        setIsLoading(false);
      }
    }
  }, [applySession]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(
    (data: AuthSessionData) => {
      // Bump the generation so any in-flight checkSession() is now stale and can
      // no longer clobber this session.
      sessionGeneration.current += 1;
      applySession(data);
      if (data.token) {
        localStorage.setItem('society_token', data.token);
      }
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    sessionGeneration.current += 1;
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('society_token');
      applySession(null);
    }
  }, [applySession]);

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
