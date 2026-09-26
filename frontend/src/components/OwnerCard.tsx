import React, { useState } from 'react';
import { SearchResultItem } from '../types.ts';
import { useLanguage } from '../lib/i18n.tsx';
import { formatPlate } from '../lib/utils.ts';
import {
  Phone,
  Copy,
  Check,
  Car,
  Bike,
  HelpCircle,
  Home,
  User,
  Clock,
  ShieldCheck,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Badge } from './ui/badge.tsx';

interface OwnerCardProps {
  item: SearchResultItem;
}

export function OwnerCard({ item }: OwnerCardProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const isResident = item.source === 'resident';
  const isBike = item.vehicle_type === 'BIKE';
  const isCar = item.vehicle_type === 'CAR';

  const formattedPlate = formatPlate(item.normalized_plate || item.plate_raw || '');

  const handleCopyPhone = () => {
    if (!item.owner_phone) return;
    navigator.clipboard.writeText(item.owner_phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white rounded-xl border border-[#DDD5C5] shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Top Banner / Number Plate Header */}
      <div className="bg-[#FAF7F0] border-b border-[#DDD5C5] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Authentic Indian Number Plate styling */}
          <div className="flex items-stretch border-2 border-[#111111] rounded-md overflow-hidden bg-white shadow-xs">
            <div className="bg-[#003399] text-white flex flex-col items-center justify-center px-1.5 py-0.5 text-[9px] font-bold tracking-tighter">
              <span>IND</span>
              <div className="w-1.5 h-1.5 rounded-full border border-white mt-0.5" />
            </div>
            <div className="px-3 py-1 font-mono font-bold text-lg sm:text-xl tracking-wider text-[#111111] uppercase select-all">
              {formattedPlate}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#666666]">
            {isCar && <Car className="w-4 h-4 text-[#2C5E3B]" />}
            {isBike && <Bike className="w-4 h-4 text-[#2C5E3B]" />}
            {!isCar && !isBike && <HelpCircle className="w-4 h-4 text-[#2C5E3B]" />}
            <span className="font-medium">
              {isCar ? t.car : isBike ? t.bike : t.other}
            </span>
          </div>
        </div>

        {/* Source Badge */}
        <div>
          {isResident ? (
            <Badge variant="resident" className="gap-1.5 px-3 py-1 text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t.residentBadge}
            </Badge>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="visitor" className="gap-1.5 px-3 py-1 text-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                {t.visitorBadge}
              </Badge>
              {item.status && (
                <Badge
                  variant={item.status === 'inside' ? 'danger' : 'outline'}
                  className="text-xs px-2.5 py-1"
                >
                  {item.status === 'inside' ? t.statusInside : t.statusExited}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Details Body */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Flat and Owner Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Flat / Room */}
          {isResident ? (
            <div className="bg-[#FAF7F0] p-3.5 rounded-lg border border-[#EAE4D7] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#EAE4D7] flex items-center justify-center text-[#2C5E3B] shrink-0">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#888888] uppercase tracking-wider">
                  {t.flatRoom}
                </p>
                <p className="text-xl font-bold text-[#111111]">{item.owner_room}</p>
              </div>
            </div>
          ) : (
            <div className="bg-[#FAF7F0] p-3.5 rounded-lg border border-[#EAE4D7] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#EAE4D7] flex items-center justify-center text-[#B95D00] shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#888888] uppercase tracking-wider">
                  {t.entryTime}
                </p>
                <p className="text-sm font-bold text-[#111111]">
                  {item.added_at ? new Date(item.added_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </p>
              </div>
            </div>
          )}

          {/* Owner Name */}
          <div className="bg-[#FAF7F0] p-3.5 rounded-lg border border-[#EAE4D7] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EAE4D7] flex items-center justify-center text-[#2C5E3B] shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-[#888888] uppercase tracking-wider">
                {t.ownerContact}
              </p>
              <p className="text-base font-bold text-[#111111] truncate">
                {item.owner_name || (isResident ? 'Society Member' : 'Visitor Driver')}
              </p>
            </div>
          </div>
        </div>

        {/* Brand & Model or Note */}
        {(item.brand || item.model || item.color || item.note) && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-[#555555] bg-white p-3 rounded-lg border border-[#EAE4D7]">
            <Info className="w-4 h-4 text-[#888888] shrink-0" />
            {item.brand && <span className="font-semibold text-[#111111]">{item.brand}</span>}
            {item.model && <span>{item.model}</span>}
            {item.color && <span className="text-xs bg-[#FAF7F0] px-2 py-0.5 rounded border border-[#DDD5C5] text-[#666666]">{item.color}</span>}
            {item.note && (
              <span className="text-xs text-[#B95D00] bg-[#FFF4E5] px-2 py-1 rounded border border-[#FFE0B2] font-medium">
                Note: {item.note}
              </span>
            )}
          </div>
        )}

        {/* Parking Allocation Section */}
        {isResident && (
          <div className="pt-1">
            {isBike ? (
              <div className="p-3 bg-[#FAF7F0] rounded-lg border border-[#DDD5C5] text-xs text-[#666666] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#2C5E3B] shrink-0 mt-0.5" />
                <span>{t.commonBikeParking}</span>
              </div>
            ) : item.parking_number ? (
              <div className="p-3 bg-[#EBF3ED] rounded-lg border border-[#C3DCB9] text-xs text-[#2C5E3B] flex items-center justify-between">
                <span className="font-medium">{t.designatedParking}</span>
                <span className="font-mono font-bold text-sm bg-white px-2.5 py-1 rounded border border-[#C3DCB9]">
                  {item.parking_number}
                </span>
              </div>
            ) : (
              <div className="p-3 bg-[#FAF7F0] rounded-lg border border-[#DDD5C5] text-xs text-[#666666]">
                {t.commonOtherParking}
              </div>
            )}
          </div>
        )}

        {/* Contact Actions (Call & Copy) */}
        {item.owner_phone && (
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <a
              href={`tel:${item.owner_phone}`}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#2C5E3B] hover:bg-[#234A2F] text-white font-bold py-3 px-4 rounded-lg shadow-sm transition-colors text-sm active:scale-[0.99]"
            >
              <Phone className="w-4 h-4" />
              <span>{t.callOwner}: {item.owner_phone}</span>
            </a>

            <button
              type="button"
              onClick={handleCopyPhone}
              className="inline-flex items-center justify-center gap-2 bg-[#EAE4D7] hover:bg-[#E0D8C8] text-[#111111] font-semibold py-3 px-4 rounded-lg border border-[#DDD5C5] transition-colors text-sm shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#2C5E3B]" />
                  <span className="text-[#2C5E3B]">{t.numberCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#666666]" />
                  <span>{t.copyNumber}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
