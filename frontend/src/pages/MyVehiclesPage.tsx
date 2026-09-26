import React, { useState, useEffect } from 'react';
import { useLanguage } from '../lib/i18n.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import { apiFetch } from '../lib/api.ts';
import { Vehicle } from '../types.ts';
import { formatPlate } from '../lib/utils.ts';
import { Car, Bike, HelpCircle, ShieldCheck, Home, Info, PlusCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.tsx';

export function MyVehiclesPage() {
  const { t } = useLanguage();
  const { resident } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMyVehicles() {
      try {
        const res = await apiFetch('/api/my-vehicles');
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch your registered vehicles.');
        }
        setVehicles(data.vehicles || []);
      } catch (err: any) {
        setError(err.message || 'Error loading vehicles.');
      } finally {
        setIsLoading(false);
      }
    }
    loadMyVehicles();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-[#DDD5C5] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#2C5E3B] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>{t.residentBadge}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#111111] mt-1">
            {t.myVehiclesTitle}
          </h1>
          <p className="text-sm text-[#666666] mt-0.5">{t.myVehiclesSub}</p>
        </div>

        {resident && (
          <div className="bg-[#FAF7F0] px-4 py-2.5 rounded-xl border border-[#DDD5C5] flex items-center gap-3 self-start sm:self-auto">
            <div className="w-9 h-9 rounded-lg bg-[#EAE4D7] flex items-center justify-center text-[#2C5E3B]">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#888888] uppercase">Registered Flat</p>
              <p className="text-base font-bold text-[#111111]">{resident.room_number}</p>
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-[#DDD5C5] border-t-[#2C5E3B] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#666666]">{t.loading}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-[#FBEBEA] border border-[#F2C1BD] text-[#B93826] text-sm">
          {error}
        </div>
      )}

      {/* Vehicles List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {vehicles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#DDD5C5] p-8 text-center space-y-3">
              <Car className="w-12 h-12 text-[#888888] mx-auto opacity-50" />
              <h3 className="text-base font-bold text-[#111111]">{t.noMyVehicles}</h3>
              <p className="text-sm text-[#666666] max-w-md mx-auto">
                {t.contactAdminToRegister}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicles.map((v) => {
                const isCar = v.vehicle_type === 'CAR';
                const isBike = v.vehicle_type === 'BIKE';

                return (
                  <Card key={v.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="bg-[#FAF7F0] border-b border-[#DDD5C5] pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white border border-[#DDD5C5] flex items-center justify-center text-[#2C5E3B]">
                            {isCar && <Car className="w-4 h-4" />}
                            {isBike && <Bike className="w-4 h-4" />}
                            {!isCar && !isBike && <HelpCircle className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-[#888888] uppercase">
                              {isCar ? t.car : isBike ? t.bike : t.other}
                            </span>
                            <h3 className="font-bold text-base text-[#111111] leading-none mt-0.5">
                              {v.brand || 'Vehicle'} {v.model || ''}
                            </h3>
                          </div>
                        </div>

                        {/* Number Plate badge */}
                        <div className="bg-white border-2 border-[#111111] px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wider text-[#111111]">
                          {formatPlate(v.normalized_plate)}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {v.color && (
                          <div className="bg-[#FAF7F0] p-2.5 rounded-lg border border-[#EAE4D7]">
                            <span className="text-[#888888] block">Color</span>
                            <span className="font-bold text-[#111111]">{v.color}</span>
                          </div>
                        )}

                        <div className="bg-[#FAF7F0] p-2.5 rounded-lg border border-[#EAE4D7]">
                          <span className="text-[#888888] block">Last 4 Digits</span>
                          <span className="font-mono font-bold text-[#111111]">{v.last_four_digits}</span>
                        </div>
                      </div>

                      {/* Parking slot indicator */}
                      {isBike ? (
                        <div className="p-2.5 bg-[#FAF7F0] rounded-lg border border-[#DDD5C5] text-xs text-[#666666] flex items-start gap-2">
                          <Info className="w-4 h-4 text-[#2C5E3B] shrink-0 mt-0.5" />
                          <span>{t.commonBikeParking}</span>
                        </div>
                      ) : v.parking_number ? (
                        <div className="p-2.5 bg-[#EBF3ED] rounded-lg border border-[#C3DCB9] text-xs text-[#2C5E3B] flex items-center justify-between">
                          <span className="font-medium">{t.designatedParking}</span>
                          <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-[#C3DCB9]">
                            {v.parking_number}
                          </span>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-[#FAF7F0] rounded-lg border border-[#DDD5C5] text-xs text-[#666666]">
                          {t.commonOtherParking}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Notice to contact admin */}
          <div className="mt-6 p-4 rounded-xl bg-[#FAF7F0] border border-[#DDD5C5] flex items-start gap-3 text-xs text-[#666666]">
            <Info className="w-4 h-4 text-[#2C5E3B] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#111111] mb-0.5">Need to add, update, or remove a vehicle?</p>
              <p>{t.contactAdminToRegister}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
