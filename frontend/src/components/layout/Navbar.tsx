import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.ts';
import { useLanguage } from '../../lib/i18n.tsx';
import { LanguageSelector } from '../LanguageSelector.tsx';
import { MobileDrawer } from './MobileDrawer.tsx';
import {
  Building2,
  Search,
  Car,
  Shield,
  Users,
  KeyRound,
  FileText,
  LogOut,
  Menu,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export function Navbar() {
  const { role, user, resident, watchman, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#2C5E3B] text-white'
        : 'text-[#444444] hover:text-[#111111] hover:bg-[#EAE4D7]'
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#DDD5C5] shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">
            {/* Logo & Society Brand */}
            <div className="flex items-center min-w-0 flex-1 sm:flex-initial mr-2 sm:mr-4">
              <button
                type="button"
                onClick={() => {
                  if (role === 'WATCHMAN') navigate('/watchman');
                  else if (role === 'ADMIN') navigate('/admin/residents');
                  else navigate('/dashboard');
                }}
                className="flex items-center gap-2 sm:gap-2.5 text-left group focus:outline-hidden min-w-0"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#2C5E3B] text-white flex items-center justify-center shadow-xs group-hover:bg-[#234A2F] transition-colors shrink-0">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="leading-tight min-w-0">
                  <span className="font-extrabold text-sm sm:text-base lg:text-lg tracking-tight text-[#111111] truncate block">
                    {t.societyName}
                  </span>
                  <span className="text-[11px] text-[#666666] hidden sm:block truncate">
                    {t.societySub}
                  </span>
                </div>
              </button>
            </div>

            {/* Role-specific Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {role === 'RESIDENT' && (
                <>
                  <NavLink to="/dashboard" className={navLinkClass}>
                    <Search className="w-4 h-4" />
                    <span>{t.navSearch}</span>
                  </NavLink>
                  <NavLink to="/my-vehicles" className={navLinkClass}>
                    <Car className="w-4 h-4" />
                    <span>{t.navMyVehicles}</span>
                  </NavLink>
                </>
              )}

              {role === 'WATCHMAN' && (
                <NavLink to="/watchman" className={navLinkClass}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.navGate}</span>
                </NavLink>
              )}

              {role === 'ADMIN' && (
                <>
                  <NavLink to="/dashboard" className={navLinkClass}>
                    <Search className="w-4 h-4" />
                    <span>{t.navSearch}</span>
                  </NavLink>
                  <NavLink to="/admin/residents" className={navLinkClass}>
                    <Users className="w-4 h-4" />
                    <span>{t.navAdminResidents}</span>
                  </NavLink>
                  <NavLink to="/admin/vehicles" className={navLinkClass}>
                    <Car className="w-4 h-4" />
                    <span>{t.navAdminVehicles}</span>
                  </NavLink>
                  <NavLink to="/admin/watchmen" className={navLinkClass}>
                    <Shield className="w-4 h-4" />
                    <span>{t.navAdminWatchmen}</span>
                  </NavLink>
                  <NavLink to="/admin/outsider-vehicles" className={navLinkClass}>
                    <Clock className="w-4 h-4" />
                    <span>{t.navAdminOutsiders}</span>
                  </NavLink>
                  <NavLink to="/admin/logs" className={navLinkClass}>
                    <FileText className="w-4 h-4" />
                    <span>{t.navAdminLogs}</span>
                  </NavLink>
                </>
              )}
            </nav>

            {/* Right Utilities (Lang + Account badge + Logout + Mobile Hamburger) */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Hidden below md: the mobile drawer already has a full language switcher.
                  Wrapped in a div (rather than a `hidden` class on LanguageSelector)
                  to avoid a conflict between the `hidden` and `inline-flex`
                  display utilities. LoginPage renders its own selector. */}
              <div className="hidden md:block">
                <LanguageSelector />
              </div>

              {/* User identity badge (desktop) */}
              {role && (
                <div className="hidden lg:flex items-center gap-2 bg-[#EAE4D7] px-3 py-1.5 rounded-lg border border-[#DDD5C5] text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#2C5E3B]" />
                  <span className="font-semibold text-[#111111]">
                    {role === 'RESIDENT' && resident
                      ? `${resident.full_name} (${resident.room_number})`
                      : role === 'ADMIN'
                      ? `Admin (${user?.full_name || 'Administrator'})`
                      : watchman?.full_name || 'Gate Watchman'}
                  </span>
                </div>
              )}

              {/* Logout button (desktop/tablet) */}
              {role && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#B93826] bg-[#FBEBEA] hover:bg-[#F8DEDC] border border-[#F2C1BD] transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t.logout}</span>
                </button>
              )}

              {/* Mobile Hamburger Toggle */}
              {role && (
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="md:hidden min-w-[44px] min-h-[44px] p-2 rounded-lg text-[#111111] hover:bg-[#EAE4D7] active:bg-[#DDD5C5] transition-colors flex items-center justify-center focus:outline-hidden"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Rendered outside <header> on purpose: the header's `backdrop-blur-md`
          establishes a containing block for fixed-position descendants, which
          clamped the drawer to the navbar's height instead of the viewport. */}
      <MobileDrawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />
    </>
  );
}
