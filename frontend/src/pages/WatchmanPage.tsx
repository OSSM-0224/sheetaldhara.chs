import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../lib/i18n.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import { apiRequest } from '../lib/api.ts';
import { OutsiderVehicle, VehicleType } from '../types.ts';
import { formatPlate } from '../lib/utils.ts';
import {
  ShieldCheck,
  PlusCircle,
  Car,
  Bike,
  HelpCircle,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.tsx';
import { Badge } from '../components/ui/badge.tsx';

export function WatchmanPage() {
  const { t } = useLanguage();
  const { watchman } = useAuth();

  // Registration form states
  const [plate, setPlate] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('BIKE');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [note, setNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Entries list state
  const [myEntries, setMyEntries] = useState<OutsiderVehicle[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [entriesError, setEntriesError] = useState<string | null>(null);

  // Load entries logged by this watchman
  const loadEntries = useCallback(async () => {
    const res = await apiRequest<{ vehicles: OutsiderVehicle[] }>('/api/watchman/my-entries');
    if (res.ok) {
      setMyEntries(res.data.vehicles || []);
      setEntriesError(null);
    } else {
      // Silently swallowed before, leaving the guard staring at a permanently
      // empty "entries" list with no indication the request failed.
      setMyEntries([]);
      setEntriesError(res.error);
    }
    setIsLoadingEntries(false);
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const cleanPlate = plate.trim().toUpperCase();
    const cleanPhone = ownerPhone.replace(/[^0-9]/g, '');

    if (!cleanPlate || cleanPlate.length < 4) {
      setFormError('Please enter a valid registration plate number (at least 4 characters).');
      return;
    }

    if (cleanPhone.length !== 10) {
      setFormError('Please enter a 10-digit mobile phone number.');
      return;
    }

    setIsSubmitting(true);

    const res = await apiRequest<{ message?: string }>('/api/watchman/outsider-vehicles', {
      method: 'POST',
      body: JSON.stringify({
        plate: cleanPlate,
        vehicle_type: vehicleType,
        owner_phone: cleanPhone,
        owner_name: ownerName.trim() || undefined,
        note: note.trim() || undefined,
      }),
    });

    if (res.ok) {
      setSuccessMessage(`Vehicle ${cleanPlate} registered successfully!`);
      // Reset form
      setPlate('');
      setOwnerPhone('');
      setOwnerName('');
      setNote('');
      setVehicleType('BIKE');

      // Refresh entries
      await loadEntries();
    } else {
      setFormError(res.error);
    }

    setIsSubmitting(false);
  };

  const handleMarkExit = async (id: string) => {
    const res = await apiRequest<{ message?: string }>(`/api/watchman/outsider-vehicles/${id}/exit`, {
      method: 'PATCH',
    });

    if (res.ok) {
      await loadEntries();
    } else {
      window.alert(res.error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Guard Banner */}
      <div className="bg-white rounded-2xl border border-[#DDD5C5] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#2C5E3B] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Gate 1 Duty Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] mt-1">
            {t.watchmanPortalTitle}
          </h1>
          <p className="text-sm text-[#666666] mt-0.5">{t.watchmanPortalSub}</p>
        </div>

        <div className="bg-[#FAF7F0] px-4 py-2.5 rounded-xl border border-[#DDD5C5] flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#2C5E3B] animate-pulse" />
          <div>
            <p className="text-[11px] font-bold text-[#888888] uppercase">On Duty</p>
            <p className="text-sm font-bold text-[#111111]">
              {watchman?.full_name || 'Gate Watchman'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Entry Form (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="shadow-sm border-[#DDD5C5]">
            <CardHeader className="bg-[#FAF7F0] border-b border-[#DDD5C5] pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#2C5E3B]" />
                <span>{t.logVisitorVehicle}</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5">
              {formError && (
                <div className="mb-4 p-3 rounded-lg bg-[#FBEBEA] border border-[#F2C1BD] text-[#B93826] text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 rounded-lg bg-[#EBF3ED] border border-[#C3DCB9] text-[#2C5E3B] text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-3.5">
                {/* Plate input */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[#555555] mb-1">
                    {t.plateInputLabel} <span className="text-[#B93826]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    placeholder={t.plateInputPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#DDD5C5] text-sm font-mono font-bold tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  />
                </div>

                {/* Vehicle Type radio buttons */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[#555555] mb-1">
                    {t.vehicleType}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setVehicleType('BIKE')}
                      className={`py-2 px-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        vehicleType === 'BIKE'
                          ? 'bg-[#2C5E3B] text-white border-[#2C5E3B]'
                          : 'bg-[#FAF7F0] text-[#444444] border-[#DDD5C5] hover:bg-[#EAE4D7]'
                      }`}
                    >
                      <Bike className="w-3.5 h-3.5" />
                      <span>Bike</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVehicleType('CAR')}
                      className={`py-2 px-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        vehicleType === 'CAR'
                          ? 'bg-[#2C5E3B] text-white border-[#2C5E3B]'
                          : 'bg-[#FAF7F0] text-[#444444] border-[#DDD5C5] hover:bg-[#EAE4D7]'
                      }`}
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>Car</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVehicleType('OTHER')}
                      className={`py-2 px-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        vehicleType === 'OTHER'
                          ? 'bg-[#2C5E3B] text-white border-[#2C5E3B]'
                          : 'bg-[#FAF7F0] text-[#444444] border-[#DDD5C5] hover:bg-[#EAE4D7]'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Other</span>
                    </button>
                  </div>
                </div>

                {/* Owner phone */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[#555555] mb-1">
                    {t.driverPhoneLabel} <span className="text-[#B93826]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#888888] absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder={t.driverPhonePlaceholder}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-[#DDD5C5] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                    />
                  </div>
                </div>

                {/* Owner Name */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[#555555] mb-1">
                    {t.driverNameLabel}
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder={t.driverNamePlaceholder}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#DDD5C5] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  />
                </div>

                {/* Purpose / Flat */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[#555555] mb-1">
                    {t.purposeLabel}
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t.purposePlaceholder}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#DDD5C5] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 bg-[#2C5E3B] hover:bg-[#234A2F] text-white font-bold py-3 px-4 rounded-lg shadow-sm transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registering...' : t.submitVisitorEntry}</span>
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Today's Gate Entries List (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="shadow-sm border-[#DDD5C5]">
            <CardHeader className="bg-[#FAF7F0] border-b border-[#DDD5C5] pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2C5E3B]" />
                <span>{t.todaysEntries}</span>
              </CardTitle>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EAE4D7] text-[#444444]">
                {myEntries.length} total
              </span>
            </CardHeader>

            <CardContent className="p-4 sm:p-5">
              {isLoadingEntries ? (
                <div className="py-12 text-center text-xs text-[#888888]">
                  Loading logged entries...
                </div>
              ) : entriesError ? (
                <div className="py-12 text-center text-xs space-y-3">
                  <div className="inline-flex items-center gap-2 text-[#B93826]">
                    <AlertCircle className="w-4 h-4" />
                    <span>{entriesError}</span>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={loadEntries}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[#DDD5C5] bg-white hover:bg-[#FAF7F0] transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : myEntries.length === 0 ? (
                <div className="py-12 text-center text-[#888888] space-y-2">
                  <Clock className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-sm font-semibold">No visitor entries logged yet today.</p>
                  <p className="text-xs">Use the form on the left when a visitor or delivery parks.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myEntries.map((entry) => {
                    const isInside = entry.status === 'inside';
                    const isCar = entry.vehicle_type === 'CAR';
                    const isBike = entry.vehicle_type === 'BIKE';

                    return (
                      <div
                        key={entry.id}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isInside
                            ? 'bg-white border-[#DDD5C5] shadow-xs'
                            : 'bg-[#FAF7F0] border-[#EAE4D7] opacity-75'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isInside ? 'bg-[#FAF7F0] text-[#2C5E3B]' : 'bg-[#EAE4D7] text-[#888888]'
                            }`}
                          >
                            {isCar && <Car className="w-5 h-5" />}
                            {isBike && <Bike className="w-5 h-5" />}
                            {!isCar && !isBike && <HelpCircle className="w-5 h-5" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm tracking-wide text-[#111111]">
                                {formatPlate(entry.plate)}
                              </span>
                              <Badge
                                variant={isInside ? 'danger' : 'outline'}
                                className="text-[10px] px-2 py-0"
                              >
                                {isInside ? t.statusInside : t.statusExited}
                              </Badge>
                            </div>

                            <div className="text-xs text-[#666666] flex flex-wrap items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-[#888888]" />
                                <a href={`tel:${entry.owner_phone}`} className="hover:underline font-medium">
                                  {entry.owner_phone}
                                </a>
                              </span>
                              {entry.owner_name && (
                                <span>• {entry.owner_name}</span>
                              )}
                              {entry.note && (
                                <span className="text-[#B95D00] font-medium">({entry.note})</span>
                              )}
                            </div>

                            <p className="text-[11px] text-[#888888] mt-0.5">
                              In: {new Date(entry.added_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {entry.exited_at && ` • Out: ${new Date(entry.exited_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {isInside ? (
                            <button
                              type="button"
                              onClick={() => handleMarkExit(entry.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#2C5E3B] hover:bg-[#234A2F] shadow-xs transition-colors"
                            >
                              {t.markExited}
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-[#888888] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#2C5E3B]" />
                              Exited
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
