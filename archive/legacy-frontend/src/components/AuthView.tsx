import React, { useState } from 'react';
import { User, Resident, Watchman } from '../types.ts';
import { apiFetch } from '../lib/api.ts';
import { useLanguage } from '../lib/i18n.tsx';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';
import { Badge } from './ui/badge.tsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card.tsx';
import { Alert, AlertDescription } from './ui/alert.tsx';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs.tsx';
import { ArrowRight, Lock, Phone, Home, ShieldCheck, AlertCircle, KeyRound, UserCheck, Shield } from 'lucide-react';

interface AuthViewProps {
  onAuthSuccess: (session: {
    role: 'ADMIN' | 'RESIDENT' | 'WATCHMAN';
    user?: User;
    resident?: Resident;
    watchman?: Watchman;
  }) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'resident' | 'admin' | 'watchman'>('resident');

  // Resident Sign-In Fields
  const [roomNumber, setRoomNumber] = useState('');
  const [residentPhone, setResidentPhone] = useState('');

  // Admin Login Fields
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Watchman Login Fields
  const [watchmanPhone, setWatchmanPhone] = useState('');
  const [watchmanPassword, setWatchmanPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!roomNumber.trim() || !residentPhone.trim()) {
      setError(t.authFlatNumber + ' & ' + t.authMobile + ' are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/resident-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_number: roomNumber.trim(),
          phone: residentPhone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "We couldn't find this room/phone combination. Please contact your society admin."
        );
      }

      if (data.token) {
        localStorage.setItem('society_token', data.token);
      }
      if (data.resident?.id) {
        localStorage.setItem('society_resident_id', data.resident.id);
      }

      onAuthSuccess({
        role: 'RESIDENT',
        resident: data.resident,
      });
    } catch (err: any) {
      setError(
        err.message ||
          "We couldn't find this room/phone combination. Please contact your society admin."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!adminPhone.trim() || !adminPassword.trim()) {
      setError('Please provide administrator phone and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: adminPhone.trim(),
          password: adminPassword.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid admin credentials');
      }

      if (data.token) {
        localStorage.setItem('society_token', data.token);
      }
      if (data.user?.id) {
        localStorage.setItem('society_user_id', data.user.id);
      }

      onAuthSuccess({
        role: 'ADMIN',
        user: data.user,
      });
    } catch (err: any) {
      setError(err.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchmanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!watchmanPhone.trim() || !watchmanPassword.trim()) {
      setError('Please provide watchman phone number and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/watchman-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: watchmanPhone.trim(),
          password: watchmanPassword.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid watchman credentials.');
      }

      if (data.token) {
        localStorage.setItem('society_token', data.token);
      }
      if (data.watchman?.id) {
        localStorage.setItem('society_watchman_id', data.watchman.id);
      }

      onAuthSuccess({
        role: 'WATCHMAN',
        watchman: data.watchman,
      });
    } catch (err: any) {
      setError(err.message || 'Invalid watchman phone or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillResidentDemo = (room: string, phone: string) => {
    setTab('resident');
    setRoomNumber(room);
    setResidentPhone(phone);
    setError(null);
  };

  const fillAdminDemo = () => {
    setTab('admin');
    setAdminPhone('9820011223');
    setAdminPassword('admin123');
    setError(null);
  };

  const fillWatchmanDemo = () => {
    setTab('watchman');
    setWatchmanPhone('9820099001');
    setWatchmanPassword('watchman123');
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-center items-center px-4 py-6 sm:py-12">
      <div className="w-full max-w-md">
        {/* Header Title with proper spacing */}
        <div className="text-center mb-5 sm:mb-8 pt-2 sm:pt-4">
          <Badge variant="outline" className="mb-2.5 bg-white font-mono text-[11px] shadow-xs">
            {t.authPortalBadge}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {t.authTitle}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto leading-relaxed">
            {t.authSubtitle}
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
          <CardHeader className="pb-4">
            <Tabs
              value={tab}
              onValueChange={(v) => {
                setTab(v as 'resident' | 'admin' | 'watchman');
                setError(null);
              }}
            >
              <TabsList className="grid grid-cols-3 w-full mb-3">
                <TabsTrigger id="tab-resident-signin" value="resident" className="text-[11px] sm:text-xs font-semibold px-1">
                  <UserCheck className="w-3.5 h-3.5 mr-1 shrink-0" />
                  <span className="truncate">{t.authTabResident}</span>
                </TabsTrigger>
                <TabsTrigger id="tab-watchman-login" value="watchman" className="text-[11px] sm:text-xs font-semibold px-1">
                  <Shield className="w-3.5 h-3.5 mr-1 shrink-0 text-amber-600" />
                  <span className="truncate">{t.authTabWatchman}</span>
                </TabsTrigger>
                <TabsTrigger id="tab-admin-login" value="admin" className="text-[11px] sm:text-xs font-semibold px-1">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 shrink-0" />
                  <span className="truncate">{t.authTabAdmin}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <CardTitle className="text-lg sm:text-xl font-bold">
              {tab === 'resident'
                ? t.authResidentTitle
                : tab === 'watchman'
                ? t.authWatchmanTitle
                : t.authAdminTitle}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {tab === 'resident'
                ? t.authResidentSubtitle
                : tab === 'watchman'
                ? t.authWatchmanSubtitle
                : t.authAdminSubtitle}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <AlertDescription className="text-xs sm:text-sm font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {tab === 'resident' && (
              // RESIDENT SIGN IN (Room Number + Phone Number, NO password)
              <form onSubmit={handleResidentSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="input-room-number" className="text-xs sm:text-sm font-medium">
                    {t.authFlatNumber}
                  </Label>
                  <div className="relative">
                    <Home className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="input-room-number"
                      type="text"
                      placeholder={t.authFlatPlaceholder}
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="pl-9 font-medium uppercase min-h-[44px]"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Matches exact flat code e.g. B-304 or B304
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="input-phone-number" className="text-xs sm:text-sm font-medium">
                    {t.authMobile}
                  </Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="input-phone-number"
                      type="tel"
                      placeholder={t.authMobilePlaceholder}
                      value={residentPhone}
                      onChange={(e) => setResidentPhone(e.target.value)}
                      className="pl-9 font-mono min-h-[44px]"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Registered mobile number with society management
                  </p>
                </div>

                <Button
                  id="btn-resident-signin"
                  type="submit"
                  className="w-full mt-2 font-bold min-h-[44px]"
                  disabled={loading}
                >
                  {loading ? t.loading : t.authBtnResidentSignIn}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <div className="pt-3 border-t border-border/60">
                  <p className="text-[11px] text-muted-foreground text-center mb-2 font-medium">
                    {t.authResidentDemoHint}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      id="btn-demo-priya"
                      onClick={() => fillResidentDemo('B-304', '9820022334')}
                      className="text-left p-2 rounded border border-border bg-muted/40 hover:bg-muted text-[11px] transition-colors min-h-[44px] flex flex-col justify-center cursor-pointer"
                    >
                      <span className="font-semibold block text-foreground truncate">B-304 • Priya</span>
                      <span className="text-muted-foreground font-mono truncate">9820022334</span>
                    </button>
                    <button
                      type="button"
                      id="btn-demo-amitabh"
                      onClick={() => fillResidentDemo('C-702', '9820033445')}
                      className="text-left p-2 rounded border border-border bg-muted/40 hover:bg-muted text-[11px] transition-colors min-h-[44px] flex flex-col justify-center cursor-pointer"
                    >
                      <span className="font-semibold block text-foreground truncate">C-702 • Amitabh</span>
                      <span className="text-muted-foreground font-mono truncate">9820033445</span>
                    </button>
                    <button
                      type="button"
                      id="btn-demo-sneha"
                      onClick={() => fillResidentDemo('A-502', '9820044556')}
                      className="text-left p-2 rounded border border-border bg-muted/40 hover:bg-muted text-[11px] transition-colors min-h-[44px] flex flex-col justify-center cursor-pointer"
                    >
                      <span className="font-semibold block text-foreground truncate">A-502 • Sneha</span>
                      <span className="text-muted-foreground font-mono truncate">9820044556</span>
                    </button>
                    <button
                      type="button"
                      id="btn-demo-om"
                      onClick={() => fillResidentDemo('G-201', '7506380156')}
                      className="text-left p-2 rounded border border-border bg-muted/40 hover:bg-muted text-[11px] transition-colors min-h-[44px] flex flex-col justify-center cursor-pointer"
                    >
                      <span className="font-semibold block text-foreground truncate">G-201 • Om</span>
                      <span className="text-muted-foreground font-mono truncate">7506380156</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {tab === 'watchman' && (
              // WATCHMAN LOGIN (Phone + Password for Gate Security)
              <form onSubmit={handleWatchmanSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="input-watchman-phone" className="text-xs sm:text-sm font-medium">
                    {t.authMobile}
                  </Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="input-watchman-phone"
                      type="tel"
                      placeholder="9820099001"
                      value={watchmanPhone}
                      onChange={(e) => setWatchmanPhone(e.target.value)}
                      className="pl-9 font-mono min-h-[44px]"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Assigned watchman contact number
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="input-watchman-password" className="text-xs sm:text-sm font-medium">
                    {t.authPassword}
                  </Label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="input-watchman-password"
                      type="password"
                      placeholder={t.authPasswordPlaceholder}
                      value={watchmanPassword}
                      onChange={(e) => setWatchmanPassword(e.target.value)}
                      className="pl-9 min-h-[44px]"
                      required
                    />
                  </div>
                </div>

                <Button
                  id="btn-watchman-login"
                  type="submit"
                  className="w-full mt-2 font-bold min-h-[44px] bg-amber-600 hover:bg-amber-700 text-white"
                  disabled={loading}
                >
                  {loading ? t.loading : t.authBtnWatchmanLogin}
                  <Shield className="w-4 h-4 ml-2" />
                </Button>

                <div className="pt-3 border-t border-border/60">
                  <p className="text-[11px] text-muted-foreground text-center mb-2 font-medium">
                    {t.authWatchmanDemoHint}
                  </p>
                  <button
                    type="button"
                    id="btn-demo-watchman"
                    onClick={fillWatchmanDemo}
                    className="w-full text-left p-2.5 rounded border border-border bg-amber-500/10 hover:bg-amber-500/20 text-xs transition-colors flex items-center justify-between min-h-[44px] cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-foreground">Sanjay Yadav (Gate Guard)</span>
                      <span className="text-muted-foreground block font-mono text-[11px]">
                        Phone: 9820099001 • Pass: watchman123
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-900">
                      Gate Security
                    </Badge>
                  </button>
                </div>
              </form>
            )}

            {tab === 'admin' && (
              // ADMIN LOGIN (Phone + Password)
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="input-admin-phone" className="text-xs sm:text-sm font-medium">
                    {t.authMobile}
                  </Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="input-admin-phone"
                      type="tel"
                      placeholder="9820011223"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      className="pl-9 font-mono min-h-[44px]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="input-admin-password" className="text-xs sm:text-sm font-medium">
                    {t.authPassword}
                  </Label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="input-admin-password"
                      type="password"
                      placeholder={t.authPasswordPlaceholder}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="pl-9 min-h-[44px]"
                      required
                    />
                  </div>
                </div>

                <Button
                  id="btn-admin-login"
                  type="submit"
                  className="w-full mt-2 font-bold min-h-[44px]"
                  disabled={loading}
                >
                  {loading ? t.loading : t.authBtnAdminLogin}
                  <Lock className="w-4 h-4 ml-2" />
                </Button>

                <div className="pt-3 border-t border-border/60">
                  <p className="text-[11px] text-muted-foreground text-center mb-2 font-medium">
                    {t.authAdminDemoHint}
                  </p>
                  <button
                    type="button"
                    id="btn-demo-admin"
                    onClick={fillAdminDemo}
                    className="w-full text-left p-2.5 rounded border border-border bg-muted/40 hover:bg-muted text-xs transition-colors flex items-center justify-between min-h-[44px] cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-foreground">Ramesh Sharma (Admin)</span>
                      <span className="text-muted-foreground block font-mono text-[11px]">
                        Phone: 9820011223 • Pass: admin123
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      Default Admin
                    </Badge>
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footnote note */}
        <p className="text-center text-[11px] text-muted-foreground mt-4">
          {t.authContactAdmin}
        </p>
      </div>
    </div>
  );
};

