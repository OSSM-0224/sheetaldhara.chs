import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.ts';
import { useLanguage, Language } from '../../lib/i18n.tsx';
import {
  X,
  Building2,
  Search,
  Car,
  Shield,
  Users,
  Clock,
  FileText,
  LogOut,
  ShieldCheck,
  User,
  Globe,
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function MobileDrawer({ isOpen, onClose, onLogout }: MobileDrawerProps) {
  const { role, resident, watchman } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  // Handle body scroll lock & escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px]',
      isActive
        ? 'bg-[#2C5E3B] text-white shadow-xs'
        : 'text-[#333333] hover:text-[#111111] hover:bg-[#EAE4D7] active:bg-[#DDD5C5]'
    );

  const langOptions: { id: Language; label: string; sub: string }[] = [
    { id: 'en', label: 'English', sub: 'EN' },
    { id: 'hi', label: 'हिंदी', sub: 'HI' },
    { id: 'mr', label: 'मराठी', sub: 'MR' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        className="relative w-full max-w-[320px] xs:max-w-xs bg-[#FAF7F0] h-full shadow-2xl flex flex-col justify-between z-10 border-l border-[#DDD5C5] animate-in slide-in-from-right duration-250 ease-out overflow-y-auto"
      >
        <div className="p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#DDD5C5]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#2C5E3B] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-sm text-[#111111] block truncate">
                  {t.societyName}
                </span>
                <span className="text-[10px] text-[#666666] block truncate">
                  {t.societySub}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] p-2 rounded-lg text-[#666666] hover:text-[#111111] hover:bg-[#EAE4D7] active:bg-[#DDD5C5] transition-colors flex items-center justify-center focus:outline-hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info badge */}
          {role && (
            <div className="my-3.5 p-3 rounded-xl bg-[#EAE4D7] border border-[#DDD5C5]">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#2C5E3B]/10 text-[#2C5E3B]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2C5E3B]" />
                  {role === 'RESIDENT'
                    ? 'Resident'
                    : role === 'ADMIN'
                    ? 'Administrator'
                    : 'Gate Watchman'}
                </span>
                <span className="text-[10px] text-[#777777] font-medium">Active</span>
              </div>
              <p className="text-sm font-bold text-[#111111] truncate">
                {role === 'RESIDENT' && resident
                  ? resident.full_name
                  : role === 'ADMIN'
                  ? 'Ramesh Sharma'
                  : watchman?.full_name || 'Gate Watchman'}
              </p>
              {role === 'RESIDENT' && resident && (
                <p className="text-xs text-[#555555] font-medium mt-0.5">
                  Flat: <span className="font-bold text-[#111111]">{resident.room_number}</span> • Mob: {resident.phone}
                </p>
              )}
            </div>
          )}

          {/* In-drawer Language Switcher */}
          <div className="mb-4 p-2.5 rounded-xl bg-white border border-[#DDD5C5]/80">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#555555] mb-2 px-1">
              <Globe className="w-3.5 h-3.5 text-[#2C5E3B]" />
              <span>Language / भाषा / भाषा</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {langOptions.map((opt) => {
                const active = language === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLanguage(opt.id)}
                    className={cn(
                      'min-h-[38px] py-1.5 px-2 rounded-lg text-xs font-semibold transition-all select-none flex flex-col items-center justify-center text-center',
                      active
                        ? 'bg-[#2C5E3B] text-white shadow-xs font-bold'
                        : 'bg-[#FAF7F0] text-[#555555] hover:bg-[#EAE4D7] hover:text-[#111111]'
                    )}
                  >
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Navigation Links */}
          <div className="mb-2">
            <p className="px-1 text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1.5">
              Menu
            </p>
            <nav className="space-y-1">
              {role === 'RESIDENT' && (
                <>
                  <NavLink to="/dashboard" onClick={onClose} className={navLinkClass}>
                    <Search className="w-4 h-4 shrink-0 text-[#2C5E3B]" />
                    <span>{t.navSearch}</span>
                  </NavLink>
                  <NavLink to="/my-vehicles" onClick={onClose} className={navLinkClass}>
                    <Car className="w-4 h-4 shrink-0 text-[#2C5E3B]" />
                    <span>{t.navMyVehicles}</span>
                  </NavLink>
                </>
              )}

              {role === 'WATCHMAN' && (
                <NavLink to="/watchman" onClick={onClose} className={navLinkClass}>
                  <ShieldCheck className="w-4 h-4 shrink-0 text-[#2C5E3B]" />
                  <span>{t.navGate}</span>
                </NavLink>
              )}

              {role === 'ADMIN' && (
                <>
                  <NavLink to="/dashboard" onClick={onClose} className={navLinkClass}>
                    <Search className="w-4 h-4 shrink-0 text-[#2C5E3B]" />
                    <span>{t.navSearch}</span>
                  </NavLink>
                  <NavLink to="/admin/residents" onClick={onClose} className={navLinkClass}>
                    <Users className="w-4 h-4 shrink-0 text-[#2C5E3B]" />
                    <span>{t.navAdminResidents}</span>
                  </NavLink>
                  <NavLink to="/admin/vehicles" onClick={onClose} className={navLinkClass}>
                    <Car className="w-4 h-4 shrink-0 text-[#2C5E3B]" />
                    <span>{t.navAdminVehicles}</span>
                  </NavLink>
                  <NavLink to="/admin/watchmen" onClick={onClose} className={navLinkClass}>
                    <Shield className="w-4 h-4 shrink-0 text-[#2C5E3B]" />
                    <span>{t.navAdminWatchmen}</span>
                  </NavLink>
                  <NavLink to="/admin/outsider-vehicles" onClick={onClose} className={navLinkClass}>
                    <Clock className="w-4 h-4 shrink-0 text-[#2C5E3B]" />
                    <span>{t.navAdminOutsiders}</span>
                  </NavLink>
                  <NavLink to="/admin/logs" onClick={onClose} className={navLinkClass}>
                    <FileText className="w-4 h-4 shrink-0 text-[#2C5E3B]" />
                    <span>{t.navAdminLogs}</span>
                  </NavLink>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Bottom logout */}
        <div className="p-4 border-t border-[#DDD5C5] bg-[#FAF7F0] shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-[#B93826] bg-[#FBEBEA] hover:bg-[#F8DEDC] active:bg-[#F2C1BD] border border-[#F2C1BD] transition-colors shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logout}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
