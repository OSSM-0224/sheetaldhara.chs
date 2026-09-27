import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { useLanguage } from '../lib/i18n.tsx';
import { apiFetch } from '../lib/api.ts';
import { Building2, Lock, Phone, Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import { LanguageSelector } from '../components/LanguageSelector.tsx';

export function AdminLoginPage() {
  const { role, login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Already signed in as admin, or into another role: send them where they belong.
  if (role === 'ADMIN') return <Navigate to="/admin/residents" replace />;
  if (role === 'RESIDENT') return <Navigate to="/dashboard" replace />;
  if (role === 'WATCHMAN') return <Navigate to="/watchman" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await apiFetch('/api/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({
          phone: phone.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      login(data);
      navigate('/admin/residents');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid administrator credentials.');
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

      {/* Login Card */}
      <div className="max-w-md w-full mx-auto my-8 bg-white rounded-2xl border border-[#DDD5C5] shadow-md overflow-hidden">
        <div className="bg-[#FAF7F0] border-b border-[#DDD5C5] p-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#2C5E3B]/10 text-[#2C5E3B] flex items-center justify-center mx-auto mb-3">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-extrabold text-[#111111]">{t.adminLoginTitle}</h1>
          <p className="text-xs text-[#666666] mt-1">{t.adminLoginRestricted}</p>
        </div>

        <div className="p-6">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-[#FBEBEA] border border-[#F2C1BD] text-[#B93826] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#555555] mb-1.5">
                {t.phoneInputLabel}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#888888] absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  autoComplete="username"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit phone number"
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

          <div className="mt-5 pt-4 border-t border-[#EAE4D7] text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2C5E3B] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t.backToPortalLogin}
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
