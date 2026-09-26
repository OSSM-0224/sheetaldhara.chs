import React, { useState, useEffect } from 'react';
import { OutsiderVehicle } from '../types.ts';
import { apiFetch } from '../lib/api.ts';
import { useLanguage } from '../lib/i18n.tsx';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import { Input } from './ui/input.tsx';
import { Card, CardContent } from './ui/card.tsx';
import { Alert, AlertDescription } from './ui/alert.tsx';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './ui/table.tsx';
import {
  Shield,
  Phone,
  Clock,
  LogOut,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Car,
  Bike,
  HelpCircle,
  FileText,
} from 'lucide-react';

export const AdminOutsiderVehiclesView: React.FC = () => {
  const { t } = useLanguage();
  const [vehicles, setVehicles] = useState<OutsiderVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'inside' | 'exited'>('all');
  const [exitingId, setExitingId] = useState<string | null>(null);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/admin/outsider-vehicles');
      if (!res.ok) throw new Error('Failed to load outsider vehicles');
      const data = await res.json();
      setVehicles(data);
    } catch (err: any) {
      setError(err.message || 'Error loading outsider vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleMarkExited = async (id: string, plate: string) => {
    if (!window.confirm(`Mark vehicle ${plate} as exited?`)) return;

    setExitingId(id);
    try {
      const res = await apiFetch(`/api/admin/outsider-vehicles/${id}/exit`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Failed to mark exit');
      setSuccessMsg(`Vehicle ${plate} marked as exited.`);
      fetchVehicles();
    } catch (err: any) {
      setError(err.message || 'Failed to update vehicle');
    } finally {
      setExitingId(null);
    }
  };

  // Stats calculation
  const totalCount = vehicles.length;
  const insideCount = vehicles.filter((v) => v.status === 'inside').length;
  const exitedCount = vehicles.filter((v) => v.status === 'exited').length;

  const filtered = vehicles.filter((v) => {
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      v.plate_number.toLowerCase().includes(q) ||
      v.normalized_plate.toLowerCase().includes(q) ||
      v.owner_phone.includes(q) ||
      (v.owner_name && v.owner_name.toLowerCase().includes(q)) ||
      (v.notes && v.notes.toLowerCase().includes(q)) ||
      (v.watchman_name && v.watchman_name.toLowerCase().includes(q))
    );
  });

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'CAR':
        return <Car className="w-4 h-4 shrink-0 text-foreground" />;
      case 'BIKE':
        return <Bike className="w-4 h-4 shrink-0 text-foreground" />;
      default:
        return <HelpCircle className="w-4 h-4 shrink-0 text-foreground" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <Badge variant="outline" className="mb-2 bg-amber-500/10 text-amber-900 border-amber-300 font-mono text-[11px]">
            {t.adminOutsidersBadge}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {t.adminOutsidersTitle}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
            {t.adminOutsidersSubtitle}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchVehicles}
          disabled={loading}
          className="min-h-[44px] cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {t.refresh}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-2 border-border shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                {t.adminOutsidersStatTotal}
              </p>
              <p className="text-2xl sm:text-3xl font-black font-mono mt-1 text-foreground">
                {totalCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-accent border border-border flex items-center justify-center">
              <Shield className="w-5 h-5 text-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-border shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] bg-emerald-50/50">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-emerald-900">
                {t.adminOutsidersStatInside}
              </p>
              <p className="text-2xl sm:text-3xl font-black font-mono mt-1 text-emerald-800">
                {insideCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center">
              <Car className="w-5 h-5 text-emerald-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-border shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                {t.adminOutsidersStatExited}
              </p>
              <p className="text-2xl sm:text-3xl font-black font-mono mt-1 text-foreground">
                {exitedCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-accent border border-border flex items-center justify-center">
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {successMsg && (
        <Alert className="bg-emerald-50 text-emerald-900 border-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <AlertDescription className="text-xs sm:text-sm font-medium">
            {successMsg}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.adminOutsidersSearchPlaceholder}
            className="pl-9 text-xs sm:text-sm min-h-[44px]"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
            className="min-h-[40px] text-xs font-semibold"
          >
            {t.adminOutsidersFilterAll} ({totalCount})
          </Button>
          <Button
            variant={statusFilter === 'inside' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('inside')}
            className="min-h-[40px] text-xs font-semibold"
          >
            {t.adminOutsidersFilterInside} ({insideCount})
          </Button>
          <Button
            variant={statusFilter === 'exited' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('exited')}
            className="min-h-[40px] text-xs font-semibold"
          >
            {t.adminOutsidersFilterExited} ({exitedCount})
          </Button>
        </div>
      </div>

      {/* Table / List */}
      <Card className="shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] border-2 border-border overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">{t.loading}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-foreground">{t.adminOutsidersEmpty}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold text-xs uppercase">Vehicle Plate</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Driver / Owner</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Visiting Note</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Status</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Entry Time</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Logged By</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => {
                    const isInside = item.status === 'inside';
                    return (
                      <TableRow key={item.id} id={`admin-outsider-row-${item.id}`}>
                        <TableCell className="font-mono font-bold text-sm text-foreground">
                          <div className="flex items-center gap-2">
                            {getVehicleIcon(item.vehicle_type)}
                            <span>{item.normalized_plate}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-foreground">
                              {item.owner_name || 'Visitor / Delivery'}
                            </p>
                            <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <a href={`tel:${item.owner_phone}`} className="hover:underline font-bold text-foreground">
                                {item.owner_phone}
                              </a>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          {item.notes ? (
                            <p className="text-xs text-muted-foreground truncate" title={item.notes}>
                              <FileText className="w-3 h-3 inline mr-1 text-muted-foreground" />
                              {item.notes}
                            </p>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={isInside ? 'default' : 'secondary'}
                            className={isInside ? 'bg-emerald-600 text-white text-[11px]' : 'text-[11px]'}
                          >
                            {isInside ? t.watchmanStatusInside : t.watchmanStatusExited}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(item.entry_time).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-muted-foreground">
                          {item.watchman_name || 'Gate Security'}
                        </TableCell>
                        <TableCell className="text-right">
                          {isInside ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkExited(item.id, item.normalized_plate)}
                              disabled={exitingId === item.id}
                              className="min-h-[36px] text-xs font-bold border-amber-600/40 text-amber-800 hover:bg-amber-50 cursor-pointer"
                            >
                              {exitingId === item.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                              ) : (
                                <LogOut className="w-3 h-3 mr-1" />
                              )}
                              Mark Exit
                            </Button>
                          ) : (
                            <span className="text-[11px] text-muted-foreground font-mono">
                              Exited
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
