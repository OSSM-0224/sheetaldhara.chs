import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types.ts';
import { apiFetch } from '../lib/api.ts';
import { useLanguage } from '../lib/i18n.tsx';
import { Badge } from './ui/badge.tsx';
import { Card, CardContent } from './ui/card.tsx';
import { Alert, AlertDescription } from './ui/alert.tsx';
import { Car, Bike, HelpCircle, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

export const MyVehiclesView: React.FC = () => {
  const { t } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/my-vehicles');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch registered vehicles');
      setVehicles(data.vehicles || []);
    } catch (err: any) {
      setError(err.message || 'Error loading vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* View Header */}
      <div className="border-b border-border pb-4">
        <Badge variant="outline" className="mb-2">
          {t.myVehiclesBadge}
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {t.myVehiclesTitle}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {t.myVehiclesSubtitle}
        </p>
      </div>

      {/* Admin Managed Notice Banner */}
      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs sm:text-sm leading-relaxed">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-amber-950 mb-0.5">Admin-Managed Society Registry</span>
          <span>{t.myVehiclesReadOnlyNotice}</span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Vehicles List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-muted-foreground font-medium">
          {t.loading}
        </div>
      ) : vehicles.length === 0 ? (
        <Card className="border-dashed p-8 text-center bg-card">
          <Car className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            {t.myVehiclesEmptyTitle}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
            {t.myVehiclesEmptyDesc}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v) => {
            const isCar = v.vehicle_type === 'CAR';
            const isBike = v.vehicle_type === 'BIKE';

            return (
              <Card
                key={v.id}
                id={`vehicle-card-${v.id}`}
                className="hover:border-foreground/40 transition-colors shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] overflow-hidden"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded border border-border bg-muted/60">
                        {isCar ? (
                          <Car className="w-5 h-5 text-primary" />
                        ) : isBike ? (
                          <Bike className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <HelpCircle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <span className="font-mono text-base sm:text-lg font-black tracking-wider block text-foreground">
                          {v.normalized_plate}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {v.brand || ''} {v.model || ''}
                        </span>
                      </div>
                    </div>

                    <Badge variant={isCar ? 'default' : 'secondary'} className="text-[10px] uppercase font-bold">
                      {isCar
                        ? t.adminVehiclesTypeCar
                        : isBike
                        ? t.adminVehiclesTypeBike
                        : t.adminVehiclesTypeOther}
                    </Badge>
                  </div>

                  <div className="pt-3 border-t border-border/60 text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t.ownerParkingLabel}:</span>
                      {isBike ? (
                        <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300 bg-emerald-50">
                          {t.bikeNoParkingSlot}
                        </Badge>
                      ) : (
                        <span className="font-semibold text-foreground">
                          {v.parking_number || t.ownerNone}
                        </span>
                      )}
                    </div>

                    {isBike && (
                      <p className="text-[11px] text-muted-foreground italic pt-1">
                        {t.myVehiclesBikeParkingNotice}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
