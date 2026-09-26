import React, { useState } from 'react';
import { Vehicle } from '../types.ts';
import { useLanguage } from '../lib/i18n.tsx';
import { Card, CardContent } from './ui/card.tsx';
import { Badge } from './ui/badge.tsx';
import { Button } from './ui/button.tsx';
import { Separator } from './ui/separator.tsx';
import { Label } from './ui/label.tsx';
import { Phone, Copy, Check, Car, Bike, HelpCircle, ArrowLeft, Clock, Shield, FileText } from 'lucide-react';

interface OwnerCardProps {
  vehicle: Vehicle & {
    source?: 'resident' | 'outsider';
    entry_time?: string;
    exit_time?: string;
    status?: 'inside' | 'exited';
    notes?: string;
    watchman_name?: string;
  };
  onBack?: () => void;
}

export const OwnerCard: React.FC<OwnerCardProps> = ({ vehicle, onBack }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (vehicle.owner_phone) {
      navigator.clipboard.writeText(vehicle.owner_phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isOutsider = vehicle.source === 'outsider';

  const getVehicleIcon = () => {
    switch (vehicle.vehicle_type) {
      case 'CAR':
        return <Car className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />;
      case 'BIKE':
        return <Bike className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />;
      default:
        return <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />;
    }
  };

  const vehicleSubtitle = isOutsider
    ? `${t.ownerOutsiderBadge} • ${
        vehicle.vehicle_type === 'CAR'
          ? t.adminVehiclesTypeCar.split(' ')[0]
          : vehicle.vehicle_type === 'BIKE'
          ? t.adminVehiclesTypeBike.split(' ')[0]
          : vehicle.vehicle_type
      }`
    : [
        [vehicle.brand, vehicle.model].filter(Boolean).join(' '),
        vehicle.color ? `(${vehicle.color})` : null,
        vehicle.vehicle_type === 'CAR'
          ? t.adminVehiclesTypeCar.split(' ')[0]
          : vehicle.vehicle_type === 'BIKE'
          ? t.adminVehiclesTypeBike.split(' ')[0]
          : vehicle.vehicle_type,
      ]
        .filter(Boolean)
        .join(' • ');

  return (
    <Card className="w-full max-w-md shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] transition-all">
      <CardContent className="p-5 sm:p-7 md:p-8">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-1.5 px-0 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.ownerBackBtn}</span>
          </Button>
        )}

        {/* Top Header: Plate & Vehicle Icon Box */}
        <div className="flex justify-between items-start mb-5 sm:mb-6 gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <Badge variant={isOutsider ? 'warning' : 'default'}>
                {isOutsider ? t.ownerOutsiderBadge : t.ownerMatchBadge}
              </Badge>
              {isOutsider && vehicle.status && (
                <Badge
                  variant={vehicle.status === 'inside' ? 'default' : 'secondary'}
                  className={vehicle.status === 'inside' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                >
                  {vehicle.status === 'inside' ? t.watchmanStatusInside : t.watchmanStatusExited}
                </Badge>
              )}
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-foreground font-mono break-all">
              {vehicle.normalized_plate}
            </h3>
            <p className="text-muted-foreground font-medium text-xs sm:text-sm mt-0.5 truncate">
              {vehicleSubtitle || (isOutsider ? t.ownerOutsiderBadge : t.ownerRegisteredVehicle)}
            </p>
          </div>

          <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-border rounded-lg flex items-center justify-center bg-accent shrink-0">
            {getVehicleIcon()}
          </div>
        </div>

        {/* Body Details */}
        <div className="space-y-4 sm:space-y-5">
          <Separator />

          <div>
            <Label className="mb-1 block">{t.ownerNameLabel}</Label>
            <p className="text-lg sm:text-xl font-bold text-foreground break-words">
              {vehicle.owner_name || (isOutsider ? 'Guest / Driver' : '—')}
            </p>
          </div>

          {isOutsider ? (
            // Outsider specific details
            <>
              {vehicle.notes && (
                <div>
                  <Label className="mb-1 block flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    {t.ownerVisitingPurpose}
                  </Label>
                  <p className="text-sm sm:text-base font-semibold text-foreground bg-muted/40 p-2 rounded border border-border">
                    {vehicle.notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                {vehicle.entry_time && (
                  <div>
                    <Label className="mb-1 block text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {t.ownerEntryTime}
                    </Label>
                    <p className="font-mono text-muted-foreground">
                      {new Date(vehicle.entry_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                )}

                {vehicle.watchman_name && (
                  <div>
                    <Label className="mb-1 block text-[11px] flex items-center gap-1">
                      <Shield className="w-3 h-3 text-muted-foreground" />
                      {t.ownerLoggedBy}
                    </Label>
                    <p className="font-medium text-foreground truncate">
                      {vehicle.watchman_name}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : vehicle.vehicle_type === 'BIKE' ? (
            <div>
              <Label className="mb-1 block">{t.ownerRoomLabel}</Label>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {t.flat} {vehicle.owner_room}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block">{t.ownerRoomLabel}</Label>
                <p className="text-lg sm:text-xl font-bold text-foreground">
                  {t.flat} {vehicle.owner_room}
                </p>
              </div>

              <div>
                <Label className="mb-1 block">{t.ownerParkingLabel}</Label>
                <p className="text-lg sm:text-xl font-bold underline underline-offset-4 text-foreground truncate">
                  {vehicle.parking_number || t.ownerNone}
                </p>
              </div>
            </div>
          )}

          {vehicle.owner_phone && (
            <div>
              <Label className="mb-1 block">{t.ownerContactLabel}</Label>
              <p className="text-base sm:text-lg font-mono font-bold text-foreground">
                {vehicle.owner_phone}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 sm:pt-3 flex flex-col gap-2.5">
            {vehicle.owner_phone && (
              <Button asChild size="lg" className="w-full">
                <a id="btn-call-owner" href={`tel:${vehicle.owner_phone}`}>
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{t.ownerCallBtn}</span>
                </a>
              </Button>
            )}

            <Button
              id="btn-copy-phone"
              type="button"
              variant="outline"
              size="lg"
              onClick={handleCopy}
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#1E5E3A] shrink-0" />
                  <span className="text-[#1E5E3A]">{t.ownerCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 shrink-0" />
                  <span>{t.ownerCopyBtn}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

