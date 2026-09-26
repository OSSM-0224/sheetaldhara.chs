import React, { useState, useEffect } from 'react';
import { OutsiderVehicle, VehicleType } from '../types.ts';
import { apiFetch } from '../lib/api.ts';
import { useLanguage } from '../lib/i18n.tsx';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';
import { Badge } from './ui/badge.tsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card.tsx';
import { Alert, AlertDescription } from './ui/alert.tsx';
import {
  Shield,
  Car,
  Bike,
  Plus,
  Phone,
  Clock,
  LogOut,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Check,
} from 'lucide-react';

export const WatchmanDashboardView: React.FC = () => {
  const { t } = useLanguage();

  // Form states
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('CAR');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [notes, setNotes] = useState('');

  // UI / submission states
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Entries list states
  const [entries, setEntries] = useState<OutsiderVehicle[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [exitingId, setExitingId] = useState<string | null>(null);

  const fetchEntries = async () => {
    setLoadingEntries(true);
    try {
      const res = await apiFetch('/api/watchman/entries');
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error('Failed to load watchman entries', err);
    } finally {
      setLoadingEntries(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!plateNumber.trim()) {
      setFormError('Plate number is required.');
      return;
    }
    if (!ownerPhone.trim()) {
      setFormError('Owner / driver phone number is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/watchman/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plate_number: plateNumber.trim(),
          vehicle_type: vehicleType,
          owner_phone: ownerPhone.trim(),
          owner_name: ownerName.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register outsider vehicle');
      }

      setFormSuccess(t.watchmanEntrySuccess);
      // Reset form
      setPlateNumber('');
      setOwnerPhone('');
      setOwnerName('');
      setNotes('');
      // Refresh entries
      fetchEntries();
    } catch (err: any) {
      setFormError(err.message || 'Error registering vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkExited = async (id: string) => {
    if (!window.confirm(t.watchmanConfirmExit)) return;

    setExitingId(id);
    try {
      const res = await apiFetch(`/api/watchman/entries/${id}/exit`, {
        method: 'PATCH',
      });
      if (res.ok) {
        fetchEntries();
      }
    } catch (err) {
      console.error('Failed to mark vehicle as exited', err);
    } finally {
      setExitingId(null);
    }
  };

  const filteredEntries = entries.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.plate_number.toLowerCase().includes(q) ||
      item.normalized_plate.toLowerCase().includes(q) ||
      item.owner_phone.includes(q) ||
      (item.owner_name && item.owner_name.toLowerCase().includes(q)) ||
      (item.notes && item.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Top Banner */}
      <div className="border-b border-border pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge variant="outline" className="mb-2 bg-amber-500/10 text-amber-900 border-amber-300 font-mono text-[11px]">
              {t.watchmanConsoleBadge}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {t.watchmanConsoleTitle}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
              {t.watchmanConsoleSubtitle}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchEntries}
            disabled={loadingEntries}
            className="min-h-[44px] cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingEntries ? 'animate-spin' : ''}`} />
            {t.refresh}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Quick Entry Form */}
        <div className="lg:col-span-5">
          <Card className="shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] border-2 border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-amber-500/20 text-amber-800 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">{t.watchmanFormTitle}</CardTitle>
                  <CardDescription className="text-xs">{t.watchmanFormSubtitle}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {formError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <AlertDescription className="text-xs font-medium">{formError}</AlertDescription>
                </Alert>
              )}

              {formSuccess && (
                <Alert className="mb-4 bg-emerald-50 text-emerald-900 border-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <AlertDescription className="text-xs font-medium">{formSuccess}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Number Plate Input */}
                <div className="space-y-1.5">
                  <Label htmlFor="input-watchman-plate" className="text-xs font-bold uppercase tracking-wider">
                    {t.watchmanPlateLabel} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="input-watchman-plate"
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                    placeholder={t.watchmanPlatePlaceholder}
                    className="font-mono text-lg uppercase font-bold min-h-[48px] tracking-wide"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Enter full plate or last 4 digits (e.g. MH04AX4821 or 4821)
                  </p>
                </div>

                {/* Vehicle Type Radio/Buttons */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    {t.watchmanVehicleTypeLabel}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={vehicleType === 'CAR' ? 'default' : 'outline'}
                      onClick={() => setVehicleType('CAR')}
                      className="min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-semibold"
                    >
                      <Car className="w-4 h-4" />
                      {t.adminVehiclesTypeCar.split(' ')[0]}
                    </Button>
                    <Button
                      type="button"
                      variant={vehicleType === 'BIKE' ? 'default' : 'outline'}
                      onClick={() => setVehicleType('BIKE')}
                      className="min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-semibold"
                    >
                      <Bike className="w-4 h-4" />
                      {t.adminVehiclesTypeBike.split(' ')[0]}
                    </Button>
                    <Button
                      type="button"
                      variant={vehicleType === 'OTHER' ? 'default' : 'outline'}
                      onClick={() => setVehicleType('OTHER')}
                      className="min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-semibold"
                    >
                      <Shield className="w-4 h-4" />
                      {t.adminVehiclesTypeOther.split(' ')[0]}
                    </Button>
                  </div>
                </div>

                {/* Phone Number Input */}
                <div className="space-y-1.5">
                  <Label htmlFor="input-watchman-phone" className="text-xs font-bold uppercase tracking-wider">
                    {t.watchmanOwnerPhoneLabel} <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="input-watchman-phone"
                      type="tel"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder={t.watchmanOwnerPhonePlaceholder}
                      className="pl-9 font-mono min-h-[44px]"
                      required
                    />
                  </div>
                </div>

                {/* Owner Name (Optional) */}
                <div className="space-y-1.5">
                  <Label htmlFor="input-watchman-name" className="text-xs font-medium">
                    {t.watchmanOwnerNameLabel}
                  </Label>
                  <div className="relative">
                    <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="input-watchman-name"
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder={t.watchmanOwnerNamePlaceholder}
                      className="pl-9 min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Purpose / Flat Note (Optional) */}
                <div className="space-y-1.5">
                  <Label htmlFor="input-watchman-notes" className="text-xs font-medium">
                    {t.watchmanNoteLabel}
                  </Label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="input-watchman-notes"
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t.watchmanNotePlaceholder}
                      className="pl-9 min-h-[44px]"
                    />
                  </div>
                </div>

                <Button
                  id="btn-submit-watchman-entry"
                  type="submit"
                  disabled={submitting}
                  className="w-full min-h-[48px] font-bold text-sm bg-amber-600 hover:bg-amber-700 text-white mt-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      {t.watchmanSubmitting}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      {t.watchmanSubmitBtn}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Logged Entries & Search */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-lg border-2 border-border shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">
            <div>
              <h2 className="text-base font-bold text-foreground">{t.watchmanEntriesTitle}</h2>
              <p className="text-xs text-muted-foreground">{t.watchmanEntriesSubtitle}</p>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.watchmanSearchEntriesPlaceholder}
                className="pl-9 text-xs h-9 min-h-[36px]"
              />
            </div>
          </div>

          {/* List of Entries */}
          {loadingEntries ? (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground mb-2" />
              <p className="text-xs font-semibold text-muted-foreground">{t.loading}</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <Card className="text-center p-8 border border-border">
              <CardContent className="p-0 space-y-2">
                <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center">
                  <Shield className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-bold text-foreground">{t.watchmanNoEntriesTitle}</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {t.watchmanNoEntriesDesc}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry) => {
                const isInside = entry.status === 'inside';
                return (
                  <div
                    key={entry.id}
                    id={`outsider-entry-${entry.id}`}
                    className="p-4 rounded-lg border-2 border-border bg-card shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-black text-lg text-foreground tracking-tight">
                          {entry.normalized_plate}
                        </span>
                        <Badge
                          variant={isInside ? 'default' : 'secondary'}
                          className={
                            isInside
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white text-[11px]'
                              : 'text-[11px]'
                          }
                        >
                          {isInside ? t.watchmanStatusInside : t.watchmanStatusExited}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {entry.vehicle_type}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1 font-mono font-semibold text-foreground">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                          <a href={`tel:${entry.owner_phone}`} className="hover:underline">
                            {entry.owner_phone}
                          </a>
                        </div>
                        {entry.owner_name && (
                          <span className="truncate">👤 {entry.owner_name}</span>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {new Date(entry.entry_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      {entry.notes && (
                        <p className="text-xs bg-muted/50 p-1.5 rounded text-foreground font-medium truncate max-w-md">
                          📝 {entry.notes}
                        </p>
                      )}
                    </div>

                    {/* Action: Mark Exited */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                      {isInside ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkExited(entry.id)}
                          disabled={exitingId === entry.id}
                          className="min-h-[40px] text-xs font-bold border-amber-600/40 text-amber-800 hover:bg-amber-50 cursor-pointer"
                        >
                          {exitingId === entry.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
                          ) : (
                            <LogOut className="w-3.5 h-3.5 mr-1" />
                          )}
                          {t.watchmanMarkExitedBtn}
                        </Button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-muted-foreground" />
                          {entry.exit_time
                            ? `Exited ${new Date(entry.exit_time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}`
                            : 'Exited'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
