import React, { useState } from 'react';
import { User, Resident, Watchman, PageView } from '../types.ts';
import { useLanguage } from '../lib/i18n.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import {
  Search,
  Car,
  ShieldCheck,
  FileText,
  LogOut,
  Users,
  Menu,
  X,
  Shield,
  ClipboardList,
} from 'lucide-react';

interface NavbarProps {
  role: 'ADMIN' | 'RESIDENT' | 'WATCHMAN' | null;
  user: User | null;
  resident: Resident | null;
  watchman?: Watchman | null;
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  role,
  user,
  resident,
  watchman,
  currentView,
  onNavigate,
  onLogout,
}) => {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = role === 'ADMIN';
  const isResident = role === 'RESIDENT';
  const isWatchman = role === 'WATCHMAN';

  const initials = isResident && resident?.full_name
    ? resident.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : isWatchman && watchman?.name
    ? watchman.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : isAdmin
    ? 'AD'
    : 'SD';

  const handleMobileNavigate = (view: PageView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const handleMobileLogout = () => {
    setMobileMenuOpen(false);
    onLogout();
  };

  return (
    <header className="w-full bg-[#FAF8F3] border-b-2 border-border sticky top-0 z-40 shadow-xs">
      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 min-h-[56px] sm:min-h-[64px] flex items-center justify-between gap-2">
        {/* Brand / Society Name */}
        <div
          id="nav-brand"
          onClick={() => {
            if (isWatchman) onNavigate('WATCHMAN_GATE');
            else if (role) onNavigate('DASHBOARD');
          }}
          className="cursor-pointer select-none flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 max-w-[220px] sm:max-w-none"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-border rounded-[8px] flex items-center justify-center font-black text-base sm:text-lg bg-card text-foreground shrink-0 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            S
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-black uppercase tracking-tight text-xs sm:text-base lg:text-lg text-foreground truncate leading-tight">
              {t.societyName}
            </span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-bold tracking-wider uppercase truncate leading-tight mt-0.5">
              {isAdmin ? 'Admin Console' : isWatchman ? 'Gate Security Console' : t.residentPortal}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links (>= 1024px) */}
        {role && (
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-sm font-medium">
            {!isWatchman && (
              <Button
                id="nav-search-btn"
                variant={currentView === 'DASHBOARD' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('DASHBOARD')}
                className={`min-h-[40px] px-3 font-bold ${
                  currentView === 'DASHBOARD' ? 'shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Search className="w-4 h-4 mr-1.5" />
                <span>{t.navSearch}</span>
              </Button>
            )}

            {isWatchman && (
              <Button
                id="nav-watchman-gate-btn"
                variant={currentView === 'WATCHMAN_GATE' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('WATCHMAN_GATE')}
                className={`min-h-[40px] px-3 font-bold ${
                  currentView === 'WATCHMAN_GATE'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Shield className="w-4 h-4 mr-1.5" />
                <span>{t.navWatchmanGate}</span>
              </Button>
            )}

            {isResident && (
              <Button
                id="nav-my-vehicles-btn"
                variant={currentView === 'MY_VEHICLES' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('MY_VEHICLES')}
                className={`min-h-[40px] px-3 font-bold ${
                  currentView === 'MY_VEHICLES' ? 'shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Car className="w-4 h-4 mr-1.5" />
                <span>{t.navMyVehicles}</span>
              </Button>
            )}

            {isAdmin && (
              <>
                <Button
                  id="nav-admin-residents-btn"
                  variant={currentView === 'ADMIN_RESIDENTS' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('ADMIN_RESIDENTS')}
                  className={`min-h-[40px] px-2.5 xl:px-3 font-bold ${
                    currentView === 'ADMIN_RESIDENTS' ? 'shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Users className="w-4 h-4 mr-1" />
                  <span>{t.navResidents}</span>
                </Button>

                <Button
                  id="nav-admin-vehicles-btn"
                  variant={currentView === 'ADMIN_VEHICLES' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('ADMIN_VEHICLES')}
                  className={`min-h-[40px] px-2.5 xl:px-3 font-bold ${
                    currentView === 'ADMIN_VEHICLES' ? 'shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Car className="w-4 h-4 mr-1" />
                  <span>{t.navAllVehicles}</span>
                </Button>

                <Button
                  id="nav-admin-outsiders-btn"
                  variant={currentView === 'ADMIN_OUTSIDERS' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('ADMIN_OUTSIDERS')}
                  className={`min-h-[40px] px-2.5 xl:px-3 font-bold ${
                    currentView === 'ADMIN_OUTSIDERS' ? 'shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <ClipboardList className="w-4 h-4 mr-1" />
                  <span>{t.navOutsiders}</span>
                </Button>

                <Button
                  id="nav-admin-watchmen-btn"
                  variant={currentView === 'ADMIN_WATCHMEN' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('ADMIN_WATCHMEN')}
                  className={`min-h-[40px] px-2.5 xl:px-3 font-bold ${
                    currentView === 'ADMIN_WATCHMEN' ? 'shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  <span>{t.navWatchmen}</span>
                </Button>

                <Button
                  id="nav-admin-logs-btn"
                  variant={currentView === 'ADMIN_LOGS' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('ADMIN_LOGS')}
                  className={`min-h-[40px] px-2.5 xl:px-3 font-bold ${
                    currentView === 'ADMIN_LOGS' ? 'shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  <span>{t.navAuditLogs}</span>
                </Button>
              </>
            )}
          </nav>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* On Mobile & Tablet: Ultra-compact dropdown trigger */}
          <div className="lg:hidden">
            <LanguageSelector variant="dropdown" />
          </div>

          {/* On Desktop: Full Segmented Pill Switcher */}
          <div className="hidden lg:block">
            <LanguageSelector variant="segmented" />
          </div>

          {/* User Profile / Logout on Desktop */}
          {role ? (
            <div className="hidden lg:flex items-center gap-2.5 pl-2 border-l border-border/60">
              <div id="user-badge" className="text-right pr-1 max-w-[170px]">
                <div className="text-xs font-black text-foreground leading-tight truncate">
                  {isAdmin
                    ? 'Society Admin'
                    : isWatchman
                    ? watchman?.name || 'Gate Watchman'
                    : resident?.full_name}
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center justify-end gap-1 mt-0.5">
                  {isAdmin ? (
                    <Badge variant="default" className="text-[9px] px-1.5 py-0 font-mono">
                      ADMIN
                    </Badge>
                  ) : isWatchman ? (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-mono bg-amber-100 text-amber-900 border-amber-300">
                      GATE GUARD
                    </Badge>
                  ) : (
                    <>
                      <span className="font-mono text-[10px] font-bold">Flat {resident?.room_number}</span>
                      <Badge variant="secondary" className="text-[9px] px-1 py-0">
                        RESIDENT
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              <div
                className={`w-9 h-9 rounded-full border-2 border-border flex items-center justify-center font-black text-xs uppercase tracking-wider text-foreground shrink-0 shadow-xs ${
                  isWatchman ? 'bg-amber-100 text-amber-900' : 'bg-card'
                }`}
                title={
                  isAdmin
                    ? 'Administrator'
                    : isWatchman
                    ? `Watchman ${watchman?.name}`
                    : `${resident?.full_name} (${resident?.room_number})`
                }
              >
                {initials}
              </div>

              <Button
                id="btn-logout"
                variant="outline"
                size="sm"
                onClick={onLogout}
                title={t.logout}
                className="min-h-[40px] px-3 font-bold text-xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                <span>{t.logout}</span>
              </Button>
            </div>
          ) : (
            <Badge variant="outline" className="hidden lg:inline-flex font-mono text-[11px] bg-card">
              {t.residentPortal}
            </Badge>
          )}

          {/* Mobile Menu Hamburger Button (< 1024px, role active) */}
          {role && (
            <button
              id="btn-mobile-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden min-h-[44px] min-w-[44px] p-2 rounded-[6px] border-2 border-border bg-card hover:bg-muted text-foreground flex items-center justify-center transition-colors shadow-2xs cursor-pointer ml-0.5"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer Dropdown (< 1024px) */}
      {role && mobileMenuOpen && (
        <div
          id="mobile-menu-drawer"
          className="lg:hidden border-t-2 border-border bg-[#FAF8F3] px-4 py-4 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-150"
        >
          {/* User Profile Card in Drawer */}
          <div className="p-3 rounded-[8px] border-2 border-border bg-card flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-full border-2 border-border flex items-center justify-center font-black text-sm shrink-0 ${
                  isWatchman ? 'bg-amber-600 text-white' : 'bg-[#111111] text-white'
                }`}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <span className="font-black text-sm text-foreground block truncate">
                  {isAdmin
                    ? 'Ramesh Sharma (Admin)'
                    : isWatchman
                    ? watchman?.name || 'Gate Watchman'
                    : resident?.full_name}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  {isAdmin ? (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0 font-mono">
                      ADMINISTRATOR
                    </Badge>
                  ) : isWatchman ? (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono bg-amber-100 text-amber-900 border-amber-300">
                      GATE GUARD
                    </Badge>
                  ) : (
                    <>
                      <span className="font-mono text-xs font-bold text-foreground">
                        Flat {resident?.room_number}
                      </span>
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                        RESIDENT
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleMobileLogout}
              className="min-h-[44px] text-xs font-bold shrink-0 text-destructive border-destructive/40 hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-1" />
              {t.logout}
            </Button>
          </div>

          {/* Navigation Links in Mobile Drawer */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block px-1">
              Menu Navigation
            </span>

            {!isWatchman && (
              <button
                id="mobile-drawer-search"
                type="button"
                onClick={() => handleMobileNavigate('DASHBOARD')}
                className={`w-full min-h-[48px] px-3.5 rounded-[8px] border-2 text-left font-bold text-sm flex items-center justify-between transition-colors ${
                  currentView === 'DASHBOARD'
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-card text-foreground border-border hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4" />
                  <span>{t.navSearch}</span>
                </div>
                {currentView === 'DASHBOARD' && <span className="text-xs opacity-75">• Active</span>}
              </button>
            )}

            {isWatchman && (
              <button
                id="mobile-drawer-watchman-gate"
                type="button"
                onClick={() => handleMobileNavigate('WATCHMAN_GATE')}
                className={`w-full min-h-[48px] px-3.5 rounded-[8px] border-2 text-left font-bold text-sm flex items-center justify-between transition-colors ${
                  currentView === 'WATCHMAN_GATE'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                    : 'bg-card text-foreground border-border hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4" />
                  <span>{t.navWatchmanGate}</span>
                </div>
                {currentView === 'WATCHMAN_GATE' && <span className="text-xs opacity-75">• Active</span>}
              </button>
            )}

            {isResident && (
              <button
                id="mobile-drawer-my-vehicles"
                type="button"
                onClick={() => handleMobileNavigate('MY_VEHICLES')}
                className={`w-full min-h-[48px] px-3.5 rounded-[8px] border-2 text-left font-bold text-sm flex items-center justify-between transition-colors ${
                  currentView === 'MY_VEHICLES'
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-card text-foreground border-border hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Car className="w-4 h-4" />
                  <span>{t.navMyVehicles}</span>
                </div>
                {currentView === 'MY_VEHICLES' && <span className="text-xs opacity-75">• Active</span>}
              </button>
            )}

            {isAdmin && (
              <>
                <button
                  id="mobile-drawer-residents"
                  type="button"
                  onClick={() => handleMobileNavigate('ADMIN_RESIDENTS')}
                  className={`w-full min-h-[48px] px-3.5 rounded-[8px] border-2 text-left font-bold text-sm flex items-center justify-between transition-colors ${
                    currentView === 'ADMIN_RESIDENTS'
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card text-foreground border-border hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4" />
                    <span>{t.navResidents}</span>
                  </div>
                  {currentView === 'ADMIN_RESIDENTS' && <span className="text-xs opacity-75">• Active</span>}
                </button>

                <button
                  id="mobile-drawer-vehicles"
                  type="button"
                  onClick={() => handleMobileNavigate('ADMIN_VEHICLES')}
                  className={`w-full min-h-[48px] px-3.5 rounded-[8px] border-2 text-left font-bold text-sm flex items-center justify-between transition-colors ${
                    currentView === 'ADMIN_VEHICLES'
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card text-foreground border-border hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Car className="w-4 h-4" />
                    <span>{t.navAllVehicles}</span>
                  </div>
                  {currentView === 'ADMIN_VEHICLES' && <span className="text-xs opacity-75">• Active</span>}
                </button>

                <button
                  id="mobile-drawer-outsiders"
                  type="button"
                  onClick={() => handleMobileNavigate('ADMIN_OUTSIDERS')}
                  className={`w-full min-h-[48px] px-3.5 rounded-[8px] border-2 text-left font-bold text-sm flex items-center justify-between transition-colors ${
                    currentView === 'ADMIN_OUTSIDERS'
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card text-foreground border-border hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ClipboardList className="w-4 h-4" />
                    <span>{t.navOutsiders}</span>
                  </div>
                  {currentView === 'ADMIN_OUTSIDERS' && <span className="text-xs opacity-75">• Active</span>}
                </button>

                <button
                  id="mobile-drawer-watchmen"
                  type="button"
                  onClick={() => handleMobileNavigate('ADMIN_WATCHMEN')}
                  className={`w-full min-h-[48px] px-3.5 rounded-[8px] border-2 text-left font-bold text-sm flex items-center justify-between transition-colors ${
                    currentView === 'ADMIN_WATCHMEN'
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card text-foreground border-border hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4" />
                    <span>{t.navWatchmen}</span>
                  </div>
                  {currentView === 'ADMIN_WATCHMEN' && <span className="text-xs opacity-75">• Active</span>}
                </button>

                <button
                  id="mobile-drawer-logs"
                  type="button"
                  onClick={() => handleMobileNavigate('ADMIN_LOGS')}
                  className={`w-full min-h-[48px] px-3.5 rounded-[8px] border-2 text-left font-bold text-sm flex items-center justify-between transition-colors ${
                    currentView === 'ADMIN_LOGS'
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card text-foreground border-border hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4" />
                    <span>{t.navAuditLogs}</span>
                  </div>
                  {currentView === 'ADMIN_LOGS' && <span className="text-xs opacity-75">• Active</span>}
                </button>
              </>
            )}
          </div>

          {/* Language Switcher in Drawer */}
          <div className="pt-2 border-t border-border/60">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block px-1 mb-2">
              Select App Language
            </span>
            <div className="w-full flex justify-center">
              <LanguageSelector variant="segmented" className="w-full justify-center py-1" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

