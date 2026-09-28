import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { useLanguage } from '../lib/i18n.tsx';
import { apiRequest } from '../lib/api.ts';
import { Building2, User, Lock, Phone, Home, Shield, ShieldCheck, AlertCircle } from 'lucide-react';
import { LanguageSelector } from '../components/LanguageSelector.tsx';

export function LoginPage() {
  const { role, login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'resident' | 'watchman'>('resident');

  // Form states
  const [residentRoom, setResidentRoom] = useState('');
  const [residentPhone, setResidentPhone] = useState('');

  const [watchmanPhone, setWatchmanPhone] = useState('');
  const [watchmanPassword, setWatchmanPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already logged in, redirect immediately
  if (role === 'RESIDENT') return <Navigate to="/dashboard" replace />;
  if (role === 'WATCHMAN') return <Navigate to="/watchman" replace />;

  const handleResidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await apiRequest('/api/auth/resident-signin', {
        method: 'POST',
        body: JSON.stringify({
          room_number: residentRoom.trim(),
          phone: residentPhone.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error(res.error || 'Sign-in failed.');
      }

      login(res.data);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchmanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await apiRequest('/api/auth/watchman-login', {
        method: 'POST',
        body: JSON.stringify({
          phone: watchmanPhone.trim(),
          password: watchmanPassword,
        }),
      });

      if (!res.ok) {
        throw new Error(res.error || 'Watchman login failed.');
      }

      login(res.data);
      navigate('/watchman');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid watchman phone or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#2C5E3B] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="font-extrabold text-xs sm:text-sm tracking-tight text-[#111111] truncate">
            {t.societyName}
          </span>
        </div>
        <div className="shrink-0">
          <LanguageSelector />
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-8 bg-white rounded-2xl border border-[#DDD5C5] shadow-md overflow-hidden">
        {/* Card Title */}
        <div className="bg-[#FAF7F0] border-b border-[#DDD5C5] p-6 text-center">
          <h1 className="text-xl font-extrabold text-[#111111]">{t.loginTitle}</h1>
          <p className="text-xs text-[#666666] mt-1">{t.societySub}</p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b border-[#DDD5C5] bg-[#FAF7F0] p-1.5 gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('resident');
              setErrorMessage('');
            }}
            className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition-all select-none ${
              activeTab === 'resident'
                ? 'bg-white text-[#2C5E3B] shadow-xs font-bold'
                : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.residentLoginTab}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('watchman');
              setErrorMessage('');
            }}
            className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition-all select-none ${
              activeTab === 'watchman'
                ? 'bg-white text-[#2C5E3B] shadow-xs font-bold'
                : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.watchmanLoginTab}</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-[#FBEBEA] border border-[#F2C1BD] text-[#B93826] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Resident Form */}
          {activeTab === 'resident' && (
            <form onSubmit={handleResidentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555555] mb-1.5">
                  {t.flatInputLabel}
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 text-[#888888] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={residentRoom}
                    onChange={(e) => setResidentRoom(e.target.value)}
                    placeholder={t.flatInputPlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#DDD5C5] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5E3B] uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555555] mb-1.5">
                  {t.phoneInputLabel}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#888888] absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={residentPhone}
                    onChange={(e) => setResidentPhone(e.target.value)}
                    placeholder={t.phoneInputPlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#DDD5C5] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  />
                </div>
                <p className="text-[11px] text-[#888888] mt-1">
                  Passwordless authentication for registered society flat members.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-[#2C5E3B] hover:bg-[#234A2F] text-white font-bold py-3 px-4 rounded-lg shadow-sm transition-colors text-sm disabled:opacity-50"
              >
                {isLoading ? t.loggingIn : t.signInBtn}
              </button>

              {/* Demo Pre-fill Chips */}
              <div className="pt-4 border-t border-[#EAE4D7] mt-4">
                <p className="text-[11px] font-semibold text-[#888888] mb-2">QUICK DEMO RESIDENTS:</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setResidentRoom('B-304');
                      setResidentPhone('9820022334');
                    }}
                    className="text-xs bg-[#FAF7F0] hover:bg-[#EAE4D7] px-2.5 py-1 rounded border border-[#DDD5C5] text-[#333333]"
                  >
                    Priya Nair (B-304)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResidentRoom('A-502');
                      setResidentPhone('9820044556');
                    }}
                    className="text-xs bg-[#FAF7F0] hover:bg-[#EAE4D7] px-2.5 py-1 rounded border border-[#DDD5C5] text-[#333333]"
                  >
                    Sneha (A-502)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResidentRoom('D-201');
                      setResidentPhone('9820055667');
                    }}
                    className="text-xs bg-[#FAF7F0] hover:bg-[#EAE4D7] px-2.5 py-1 rounded border border-[#DDD5C5] text-[#333333]"
                  >
                    Vikram (D-201)
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Watchman Form */}
          {activeTab === 'watchman' && (
            <form onSubmit={handleWatchmanSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555555] mb-1.5">
                  {t.phoneInputLabel}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#888888] absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={watchmanPhone}
                    onChange={(e) => setWatchmanPhone(e.target.value)}
                    placeholder={t.phoneInputPlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#DDD5C5] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555555] mb-1.5">
                  {t.passwordInputLabel}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={watchmanPassword}
                    onChange={(e) => setWatchmanPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#DDD5C5] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-[#2C5E3B] hover:bg-[#234A2F] text-white font-bold py-3 px-4 rounded-lg shadow-sm transition-colors text-sm disabled:opacity-50"
              >
                {isLoading ? t.loggingIn : t.signInBtn}
              </button>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-[#EAE4D7] text-center">
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#666666] hover:text-[#2C5E3B] hover:underline"
            >
              <Shield className="w-3.5 h-3.5" />
              {t.adminLoginTab}
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-[#888888]">
        {t.footerSociety}
      </div>
    </div>
  );
}
