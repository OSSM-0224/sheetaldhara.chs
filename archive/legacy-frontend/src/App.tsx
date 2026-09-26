import React, { useState, useEffect } from 'react';
import { User, Resident, Watchman, PageView } from './types.ts';
import { apiFetch } from './lib/api.ts';
import { LanguageProvider, useLanguage } from './lib/i18n.tsx';
import { Navbar } from './components/Navbar.tsx';
import { AuthView } from './components/AuthView.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { MyVehiclesView } from './components/MyVehiclesView.tsx';
import { AdminResidentsView } from './components/AdminResidentsView.tsx';
import { AdminVehiclesView } from './components/AdminVehiclesView.tsx';
import { AdminLogsView } from './components/AdminLogsView.tsx';
import { WatchmanDashboardView } from './components/WatchmanDashboardView.tsx';
import { AdminWatchmenView } from './components/AdminWatchmenView.tsx';
import { AdminOutsiderVehiclesView } from './components/AdminOutsiderVehiclesView.tsx';

function AppContent() {
  const { t } = useLanguage();
  const [role, setRole] = useState<'ADMIN' | 'RESIDENT' | 'WATCHMAN' | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [resident, setResident] = useState<Resident | null>(null);
  const [watchman, setWatchman] = useState<Watchman | null>(null);
  const [currentView, setCurrentView] = useState<PageView>('LOGIN');
  const [initializing, setInitializing] = useState(true);

  // Check existing session on load via JWT in HTTP-only cookie or local storage token
  const checkSession = async () => {
    try {
      const res = await apiFetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setRole(data.role);
        setUser(data.user || null);
        setResident(data.resident || null);
        setWatchman(data.watchman || null);

        if (data.role === 'ADMIN') {
          setCurrentView((prev) =>
            [
              'ADMIN_RESIDENTS',
              'ADMIN_VEHICLES',
              'ADMIN_OUTSIDERS',
              'ADMIN_WATCHMEN',
              'ADMIN_LOGS',
              'DASHBOARD',
            ].includes(prev)
              ? prev
              : 'ADMIN_RESIDENTS'
          );
        } else if (data.role === 'WATCHMAN') {
          setCurrentView('WATCHMAN_GATE');
        } else {
          setCurrentView((prev) =>
            ['DASHBOARD', 'MY_VEHICLES'].includes(prev) ? prev : 'DASHBOARD'
          );
        }
      } else {
        setRole(null);
        setUser(null);
        setResident(null);
        setWatchman(null);
        setCurrentView('LOGIN');
      }
    } catch (err) {
      console.error('Session check error:', err);
      setRole(null);
      setUser(null);
      setResident(null);
      setWatchman(null);
      setCurrentView('LOGIN');
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleAuthSuccess = (session: {
    role: 'ADMIN' | 'RESIDENT' | 'WATCHMAN';
    user?: User;
    resident?: Resident;
    watchman?: Watchman;
  }) => {
    setRole(session.role);
    setUser(session.user || null);
    setResident(session.resident || null);
    setWatchman(session.watchman || null);

    if (session.role === 'ADMIN') {
      setCurrentView('ADMIN_RESIDENTS');
    } else if (session.role === 'WATCHMAN') {
      setCurrentView('WATCHMAN_GATE');
    } else {
      setCurrentView('DASHBOARD');
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('society_token');
      localStorage.removeItem('society_user_id');
      localStorage.removeItem('society_resident_id');
      localStorage.removeItem('society_watchman_id');
      setRole(null);
      setUser(null);
      setResident(null);
      setWatchman(null);
      setCurrentView('LOGIN');
    }
  };

  // Quick switch test helpers for easy evaluation
  const handleQuickSwitchResident = async (room: string, phone: string) => {
    try {
      const res = await apiFetch('/api/auth/resident-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_number: room, phone }),
      });
      const data = await res.json();
      if (res.ok) {
        handleAuthSuccess({
          role: 'RESIDENT',
          resident: data.resident,
        });
      }
    } catch (err) {
      console.error('Quick switch resident error:', err);
    }
  };

  const handleQuickSwitchAdmin = async () => {
    try {
      const res = await apiFetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '9820011223', password: 'admin123' }),
      });
      const data = await res.json();
      if (res.ok) {
        handleAuthSuccess({
          role: 'ADMIN',
          user: data.user,
        });
      }
    } catch (err) {
      console.error('Quick switch admin error:', err);
    }
  };

  const handleQuickSwitchWatchman = async () => {
    try {
      const res = await apiFetch('/api/auth/watchman-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '9820055667', password: 'watchman123' }),
      });
      const data = await res.json();
      if (res.ok) {
        handleAuthSuccess({
          role: 'WATCHMAN',
          watchman: data.watchman,
        });
      }
    } catch (err) {
      console.error('Quick switch watchman error:', err);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded border-2 border-[#1A1A1A] bg-[#111111] text-[#F5F1E8] flex items-center justify-center font-bold text-sm mb-3">
          SD
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#111111]">
          {t.loading}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#111111] flex flex-col">
      <Navbar
        role={role}
        user={user}
        resident={resident}
        watchman={watchman}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onLogout={handleLogout}
      />

      {/* Quick Switch Bar for Evaluation */}
      {role && (
        <div className="bg-[#FAF8F3] border-b border-[#1A1A1A] py-1.5 px-3 sm:px-4 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="inline-block w-2 h-2 rounded-full bg-[#1E5E3A] animate-pulse"></span>
              <span className="font-mono text-[10px] sm:text-[11px] font-bold text-[#111111] whitespace-nowrap">
                Demo Switch:
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] shrink-0">
              <button
                id="switcher-priya"
                onClick={() => handleQuickSwitchResident('B-304', '9820022334')}
                className={`px-2.5 py-1 rounded-[6px] border-2 text-[10px] font-bold uppercase tracking-wider transition-colors min-h-[32px] whitespace-nowrap cursor-pointer ${
                  role === 'RESIDENT' && resident?.room_number === 'B-304'
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-white border-[#1A1A1A] text-[#111111] hover:bg-[#FAF8F3]'
                }`}
              >
                Priya (B-304)
              </button>
              <button
                id="switcher-amitabh"
                onClick={() => handleQuickSwitchResident('C-702', '9820033445')}
                className={`px-2.5 py-1 rounded-[6px] border-2 text-[10px] font-bold uppercase tracking-wider transition-colors min-h-[32px] whitespace-nowrap cursor-pointer ${
                  role === 'RESIDENT' && resident?.room_number === 'C-702'
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-white border-[#1A1A1A] text-[#111111] hover:bg-[#FAF8F3]'
                }`}
              >
                Amitabh (C-702)
              </button>
              <button
                id="switcher-admin"
                onClick={handleQuickSwitchAdmin}
                className={`px-2.5 py-1 rounded-[6px] border-2 text-[10px] font-bold uppercase tracking-wider transition-colors min-h-[32px] whitespace-nowrap cursor-pointer ${
                  role === 'ADMIN'
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-white border-[#1A1A1A] text-[#111111] hover:bg-[#FAF8F3]'
                }`}
              >
                Ramesh (Admin)
              </button>
              <button
                id="switcher-watchman"
                onClick={handleQuickSwitchWatchman}
                className={`px-2.5 py-1 rounded-[6px] border-2 text-[10px] font-bold uppercase tracking-wider transition-colors min-h-[32px] whitespace-nowrap cursor-pointer ${
                  role === 'WATCHMAN'
                    ? 'bg-amber-700 text-white border-amber-800'
                    : 'bg-amber-50 border-amber-800 text-amber-900 hover:bg-amber-100'
                }`}
              >
                Sanjay (Watchman)
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 pb-12">
        {!role || currentView === 'LOGIN' ? (
          <AuthView onAuthSuccess={handleAuthSuccess} />
        ) : currentView === 'WATCHMAN_GATE' ? (
          <WatchmanDashboardView />
        ) : currentView === 'ADMIN_WATCHMEN' ? (
          <AdminWatchmenView />
        ) : currentView === 'ADMIN_OUTSIDERS' ? (
          <AdminOutsiderVehiclesView />
        ) : currentView === 'DASHBOARD' ? (
          <DashboardView />
        ) : currentView === 'MY_VEHICLES' ? (
          <MyVehiclesView />
        ) : currentView === 'ADMIN_RESIDENTS' ? (
          <AdminResidentsView />
        ) : currentView === 'ADMIN_VEHICLES' ? (
          <AdminVehiclesView />
        ) : currentView === 'ADMIN_LOGS' ? (
          <AdminLogsView />
        ) : (
          <DashboardView />
        )}
      </main>

      <footer className="w-full border-t border-[#1A1A1A] bg-[#FAF8F3] py-4 text-center text-xs text-[#6B6862]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-bold text-[#111111]">{t.footerSociety}</span>
          <span className="font-mono text-[11px]">{t.footerTagline}</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
