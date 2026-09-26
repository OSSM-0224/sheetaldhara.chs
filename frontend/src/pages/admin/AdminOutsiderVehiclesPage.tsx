import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api.ts';
import { OutsiderVehicle } from '../../types.ts';
import { formatPlate } from '../../lib/utils.ts';
import { Clock, Search, Phone, Car, Bike, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card.tsx';
import { Badge } from '../../components/ui/badge.tsx';
import { Button } from '../../components/ui/button.tsx';

export function AdminOutsiderVehiclesPage() {
  const [vehicles, setVehicles] = useState<OutsiderVehicle[]>([]);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'inside' | 'exited'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadOutsiders = async () => {
    try {
      const res = await apiFetch('/api/admin/outsider-vehicles');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load outsider records.');
      setVehicles(data.vehicles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOutsiders();
  }, []);

  const handleMarkExit = async (id: string) => {
    try {
      const res = await apiFetch(`/api/admin/outsider-vehicles/${id}/exit`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to mark exit.');
      await loadOutsiders();
    } catch (err: any) {
      alert(err.message || 'Operation failed.');
    }
  };

  const filtered = vehicles.filter((v) => {
    const q = filter.toLowerCase();
    const matchQuery =
      v.plate.toLowerCase().includes(q) ||
      v.owner_phone.includes(q) ||
      (v.owner_name && v.owner_name.toLowerCase().includes(q)) ||
      (v.note && v.note.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const insideCount = vehicles.filter((v) => v.status === 'inside').length;

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
            Visitor & Outsider Gate Log
          </h1>
          <p className="text-sm text-[#666666]">
            All guest, delivery, and service vehicles logged by security at society gates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FFF4E5] text-[#B95D00] border border-[#FFE0B2]">
            <Clock className="w-3.5 h-3.5" />
            <span>{insideCount} currently inside</span>
          </span>
        </div>
      </div>

      {/* Table Card */}
      <Card>
        <div className="p-4 border-b border-[#DDD5C5] bg-[#FAF7F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-[#888888] absolute left-3 top-3" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search plate, phone, visitor name..."
              className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-lg border border-[#DDD5C5] bg-white focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#888888]">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1 text-xs rounded-lg border border-[#DDD5C5] bg-white text-[#111111] focus:outline-none"
            >
              <option value="all">All Statuses ({vehicles.length})</option>
              <option value="inside">Inside Premises ({insideCount})</option>
              <option value="exited">Exited ({vehicles.length - insideCount})</option>
            </select>
          </div>
        </div>

        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-[#666666]">Loading outsider records...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#888888]">
              No outsider entries match your filter.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#FAF7F0] border-b border-[#DDD5C5] text-xs font-bold text-[#555555] uppercase">
                  <th className="py-3 px-4 sm:px-6">Plate</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Driver Contact</th>
                  <th className="py-3 px-4">Purpose / Flat</th>
                  <th className="py-3 px-4">Entry / Exit Times</th>
                  <th className="py-3 px-4">Logged By</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE4D7]">
                {filtered.map((v) => {
                  const isInside = v.status === 'inside';
                  const isCar = v.vehicle_type === 'CAR';
                  const isBike = v.vehicle_type === 'BIKE';

                  return (
                    <tr key={v.id} className="hover:bg-[#FAF7F0]/50 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-[#111111] whitespace-nowrap">
                        <span className="bg-white border-2 border-[#111111] px-2 py-0.5 rounded text-xs">
                          {formatPlate(v.plate)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-[#555555]">
                        <div className="flex items-center gap-1.5">
                          {isCar && <Car className="w-3.5 h-3.5 text-[#2C5E3B]" />}
                          {isBike && <Bike className="w-3.5 h-3.5 text-[#2C5E3B]" />}
                          {!isCar && !isBike && <HelpCircle className="w-3.5 h-3.5 text-[#2C5E3B]" />}
                          <span>{v.vehicle_type}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Phone className="w-3 h-3 text-[#888888]" />
                          <a href={`tel:${v.owner_phone}`} className="font-mono hover:underline font-bold text-[#111111]">
                            {v.owner_phone}
                          </a>
                        </div>
                        {v.owner_name && (
                          <span className="text-xs text-[#666666] block mt-0.5">
                            {v.owner_name}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#555555]">
                        {v.note || <span className="text-[#AAAAAA]">None specified</span>}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-[#666666]">
                        <div>In: {new Date(v.added_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                        {v.exited_at && (
                          <div className="text-[#2C5E3B]">
                            Out: {new Date(v.exited_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#666666]">
                        {v.added_by_watchman_name || 'Gate Guard'}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        {isInside ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleMarkExit(v.id)}
                            className="text-xs py-1 h-8"
                          >
                            Mark Exited
                          </Button>
                        ) : (
                          <span className="text-xs text-[#2C5E3B] font-semibold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Exited
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
