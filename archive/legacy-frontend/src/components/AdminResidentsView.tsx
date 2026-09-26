import React, { useState, useEffect } from 'react';
import { Resident, Vehicle, VehicleType } from '../types.ts';
import { apiFetch } from '../lib/api.ts';
import { useLanguage } from '../lib/i18n.tsx';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';
import { Badge } from './ui/badge.tsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card.tsx';
import { Alert, AlertDescription } from './ui/alert.tsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog.tsx';
import {
  Users,
  UserPlus,
  Car,
  Bike,
  Plus,
  Edit2,
  Trash2,
  Search,
  Phone,
  Home,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const AdminResidentsView: React.FC = () => {
  const { t } = useLanguage();
  const [residents, setResidents] = useState<(Resident & { vehicles?: Vehicle[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Resident Modal State
  const [showResidentModal, setShowResidentModal] = useState(false);
  const [editingResidentId, setEditingResidentId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [savingResident, setSavingResident] = useState(false);
  const [residentModalError, setResidentModalError] = useState<string | null>(null);

  // Quick Add Vehicle Modal State (for a selected resident)
  const [vehicleModalResident, setVehicleModalResident] = useState<Resident | null>(null);
  const [vehType, setVehType] = useState<VehicleType>('CAR');
  const [vehBrand, setVehBrand] = useState('');
  const [vehModel, setVehModel] = useState('');
  const [vehPlate, setVehPlate] = useState('');
  const [vehParking, setVehParking] = useState('');
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [vehicleModalError, setVehicleModalError] = useState<string | null>(null);

  const fetchResidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/admin/residents');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch residents');
      setResidents(data.residents || []);
    } catch (err: any) {
      setError(err.message || 'Error loading society residents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  // --- Resident Actions ---
  const handleOpenAddResident = () => {
    setEditingResidentId(null);
    setFullName('');
    setRoomNumber('');
    setPhone('');
    setResidentModalError(null);
    setShowResidentModal(true);
  };

  const handleOpenEditResident = (r: Resident) => {
    setEditingResidentId(r.id);
    setFullName(r.full_name);
    setRoomNumber(r.room_number);
    setPhone(r.phone);
    setResidentModalError(null);
    setShowResidentModal(true);
  };

  const handleSaveResident = async (e: React.FormEvent) => {
    e.preventDefault();
    setResidentModalError(null);
    setSavingResident(true);

    const isEdit = !!editingResidentId;
    const url = isEdit ? `/api/admin/residents/${editingResidentId}` : '/api/admin/residents';
    const method = isEdit ? 'PATCH' : 'POST';

    try {
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          room_number: roomNumber,
          phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save resident');

      setShowResidentModal(false);
      setSuccessMsg(
        isEdit ? `Resident ${fullName} updated successfully.` : `Resident ${fullName} added to society register.`
      );
      setTimeout(() => setSuccessMsg(null), 4000);
      await fetchResidents();
    } catch (err: any) {
      setResidentModalError(err.message || 'Failed to save resident');
    } finally {
      setSavingResident(false);
    }
  };

  const handleDeleteResident = async (resident: Resident) => {
    if (!window.confirm(t.adminDeleteResidentConfirm)) return;

    try {
      const res = await apiFetch(`/api/admin/residents/${resident.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete resident');

      setSuccessMsg(`Resident ${resident.full_name} and linked vehicles deleted.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      await fetchResidents();
    } catch (err: any) {
      setError(err.message || 'Error deleting resident');
    }
  };

  // --- Quick Add Vehicle Actions ---
  const handleOpenAddVehicle = (r: Resident) => {
    setVehicleModalResident(r);
    setVehType('CAR');
    setVehBrand('');
    setVehModel('');
    setVehPlate('');
    setVehParking('');
    setVehicleModalError(null);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleModalResident) return;

    setVehicleModalError(null);
    setSavingVehicle(true);

    try {
      const res = await apiFetch('/api/admin/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resident_id: vehicleModalResident.id,
          vehicle_type: vehType,
          brand: vehBrand,
          model: vehModel,
          plate: vehPlate,
          parking_number: vehType === 'BIKE' ? '' : vehParking,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register vehicle');

      setVehicleModalResident(null);
      setSuccessMsg(`Vehicle ${vehPlate.toUpperCase()} registered to ${vehicleModalResident.full_name}.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      await fetchResidents();
    } catch (err: any) {
      setVehicleModalError(err.message || 'Failed to register vehicle');
    } finally {
      setSavingVehicle(false);
    }
  };

  // Filtering
  const filteredResidents = residents.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesName = r.full_name.toLowerCase().includes(q);
    const matchesRoom = r.room_number.toLowerCase().includes(q);
    const matchesPhone = r.phone.includes(q);
    const matchesPlate = (r.vehicles || []).some((v) =>
      v.normalized_plate.toLowerCase().includes(q)
    );
    return matchesName || matchesRoom || matchesPhone || matchesPlate;
  });

  const totalVehicles = residents.reduce((acc, r) => acc + (r.vehicles?.length || 0), 0);
  const activeFlatsCount = new Set(residents.map((r) => r.room_number)).size;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <Badge variant="outline" className="mb-2">
            {t.adminResidentsBadge}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t.adminResidentsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t.adminResidentsSubtitle}
          </p>
        </div>

        <Button
          id="btn-add-resident"
          onClick={handleOpenAddResident}
          className="font-bold shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {t.adminBtnAddResident}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 sm:p-4 text-center">
          <span className="text-xs text-muted-foreground block font-medium">
            {t.adminStatResidents}
          </span>
          <span className="text-xl sm:text-2xl font-black text-foreground">
            {residents.length}
          </span>
        </Card>
        <Card className="p-3 sm:p-4 text-center">
          <span className="text-xs text-muted-foreground block font-medium">
            {t.adminStatVehicles}
          </span>
          <span className="text-xl sm:text-2xl font-black text-foreground">
            {totalVehicles}
          </span>
        </Card>
        <Card className="p-3 sm:p-4 text-center">
          <span className="text-xs text-muted-foreground block font-medium">
            {t.adminStatFlats}
          </span>
          <span className="text-xl sm:text-2xl font-black text-foreground">
            {activeFlatsCount}
          </span>
        </Card>
      </div>

      {/* Notifications */}
      {successMsg && (
        <Alert className="bg-emerald-50 border-emerald-300 text-emerald-900">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
          <AlertDescription className="text-xs sm:text-sm font-medium">{successMsg}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          id="input-search-residents"
          type="text"
          placeholder={t.adminResidentsSearchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-card text-xs sm:text-sm"
        />
      </div>

      {/* Residents Grid (1 col mobile, 2 cols tablet, 3 cols desktop) */}
      {loading ? (
        <div className="text-center py-12 text-sm text-muted-foreground font-medium">
          {t.loading}
        </div>
      ) : filteredResidents.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <Users className="w-10 h-10 mx-auto text-muted-foreground mb-2 opacity-50" />
          <p className="text-sm font-semibold text-foreground">No residents found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search filter or click &quot;Add New Resident&quot; above.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredResidents.map((r) => (
            <Card
              key={r.id}
              id={`resident-card-${r.id}`}
              className="p-4 sm:p-5 hover:border-foreground/60 transition-all shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between h-full bg-card rounded-[8px] border-2 border-border"
            >
              {/* Card Header: Flat Badge + Resident Info + Desktop Actions */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Rectangular Framed Doorplate Flat Badge (Never clips B-304, C-702, etc.) */}
                    <div className="px-2.5 py-1.5 rounded-[6px] border-2 border-[#1A1A1A] bg-[#111111] text-white shrink-0 flex flex-col items-center justify-center min-w-[3.6rem] shadow-xs select-none">
                      <span className="text-[8px] uppercase tracking-widest text-[#B5B0A4] font-black leading-none">
                        {t.flat}
                      </span>
                      <span className="text-xs sm:text-sm font-black font-mono tracking-tight text-white leading-tight mt-0.5 whitespace-nowrap">
                        {r.room_number}
                      </span>
                    </div>

                    {/* Resident Name & Contact Details (Ellipsis truncate to avoid breaking card frame) */}
                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-black text-sm sm:text-base text-foreground tracking-tight truncate leading-snug"
                        title={r.full_name}
                      >
                        {r.full_name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <a
                          href={`tel:${r.phone}`}
                          className="flex items-center gap-1 font-mono font-semibold text-foreground/80 hover:text-foreground hover:underline transition-colors truncate"
                          title={`Call ${r.full_name}`}
                        >
                          <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{r.phone}</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Inline Actions (Icon Buttons) */}
                  <div className="hidden md:flex items-center gap-1 shrink-0">
                    <Button
                      id={`btn-add-veh-${r.id}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenAddVehicle(r)}
                      className="h-8 w-8 p-0 text-primary hover:bg-muted"
                      title={t.adminAddVehicleBtn}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      id={`btn-edit-resident-${r.id}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditResident(r)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                      title={t.adminBtnEditResident}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      id={`btn-delete-resident-${r.id}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteResident(r)}
                      className="h-8 w-8 p-0 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                      title={t.adminBtnDeleteResident}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Assigned Vehicles Box inside Card Frame */}
                <div className="pt-2.5 border-t border-border/50">
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Car className="w-3 h-3" />
                      {t.adminResidentVehiclesCount}: {r.vehicles?.length || 0}
                    </span>
                  </div>

                  {r.vehicles && r.vehicles.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {r.vehicles.map((v) => (
                        <div
                          key={v.id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-[4px] bg-muted/70 border border-border text-[11px] font-mono font-bold text-foreground shadow-2xs max-w-full truncate"
                          title={`${v.normalized_plate} - ${v.brand || ''} ${v.model || ''}`}
                        >
                          {v.vehicle_type === 'CAR' ? (
                            <Car className="w-3 h-3 text-primary shrink-0" />
                          ) : (
                            <Bike className="w-3 h-3 text-emerald-600 shrink-0" />
                          )}
                          <span className="truncate">{v.normalized_plate}</span>
                          {v.vehicle_type === 'CAR' && v.parking_number && (
                            <span className="text-[9px] px-1 py-0 rounded border border-border bg-card font-mono text-muted-foreground shrink-0 ml-0.5">
                              #{v.parking_number}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-muted-foreground italic py-1 flex items-center justify-between">
                      <span>No vehicles registered</span>
                      <button
                        type="button"
                        onClick={() => handleOpenAddVehicle(r)}
                        className="text-[10px] font-bold text-foreground underline underline-offset-2 hover:opacity-80"
                      >
                        + Add Vehicle
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Action Buttons: Full-width row with min 44px tap targets */}
              <div className="md:hidden mt-3 pt-2.5 border-t border-border/50 grid grid-cols-3 gap-1.5">
                <Button
                  id={`btn-add-veh-mob-${r.id}`}
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenAddVehicle(r)}
                  className="text-xs min-h-[44px] font-bold px-1 rounded-[6px] border-border"
                >
                  <Plus className="w-3.5 h-3.5 mr-0.5 text-primary" />
                  Vehicle
                </Button>
                <Button
                  id={`btn-edit-resident-mob-${r.id}`}
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEditResident(r)}
                  className="text-xs min-h-[44px] font-medium px-1 rounded-[6px] border-border"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-0.5" />
                  Edit
                </Button>
                <Button
                  id={`btn-delete-resident-mob-${r.id}`}
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteResident(r)}
                  className="text-xs min-h-[44px] font-medium px-1 rounded-[6px] text-destructive border-destructive/40 hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-0.5" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Add/Edit Resident */}
      <Dialog open={showResidentModal} onOpenChange={setShowResidentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingResidentId ? t.adminModalEditResident : t.adminModalAddResident}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t.adminModalResidentSubtitle}
            </DialogDescription>
          </DialogHeader>

          {residentModalError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <AlertDescription className="text-xs font-medium">
                {residentModalError}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSaveResident} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="resident-name" className="text-xs font-medium">
                {t.adminFieldFullName}
              </Label>
              <Input
                id="resident-name"
                placeholder={t.adminFieldFullNamePlaceholder}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="resident-room" className="text-xs font-medium">
                  {t.adminFieldRoomNumber}
                </Label>
                <Input
                  id="resident-room"
                  placeholder={t.adminFieldRoomPlaceholder}
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="uppercase font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="resident-phone" className="text-xs font-medium">
                  {t.adminFieldPhone}
                </Label>
                <Input
                  id="resident-phone"
                  type="tel"
                  placeholder={t.adminFieldPhonePlaceholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="font-mono"
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowResidentModal(false)}
                className="min-h-[44px] w-full sm:w-auto"
              >
                {t.cancel}
              </Button>
              <Button
                type="submit"
                id="btn-save-resident"
                disabled={savingResident}
                className="font-bold min-h-[44px] w-full sm:w-auto"
              >
                {savingResident ? t.loading : t.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Quick Register Vehicle for Resident */}
      <Dialog
        open={!!vehicleModalResident}
        onOpenChange={(open) => !open && setVehicleModalResident(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Register Vehicle for {vehicleModalResident?.full_name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Flat {vehicleModalResident?.room_number} • Direct Admin Registration
            </DialogDescription>
          </DialogHeader>

          {vehicleModalError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <AlertDescription className="text-xs font-medium">
                {vehicleModalError}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSaveVehicle} className="space-y-4 py-2">
            {/* Vehicle Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">{t.adminVehiclesTypeLabel}</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-type-car"
                  onClick={() => setVehType('CAR')}
                  className={`flex items-center justify-center gap-2 p-2.5 min-h-[44px] rounded border text-xs font-bold transition-colors ${
                    vehType === 'CAR'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  {t.adminVehiclesTypeCar}
                </button>
                <button
                  type="button"
                  id="btn-type-bike"
                  onClick={() => setVehType('BIKE')}
                  className={`flex items-center justify-center gap-2 p-2.5 min-h-[44px] rounded border text-xs font-bold transition-colors ${
                    vehType === 'BIKE'
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-border bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  <Bike className="w-4 h-4" />
                  {t.adminVehiclesTypeBike}
                </button>
              </div>
            </div>

            {/* Number Plate */}
            <div className="space-y-1.5">
              <Label htmlFor="veh-plate" className="text-xs font-medium">
                {t.adminVehiclesPlateLabel}
              </Label>
              <Input
                id="veh-plate"
                placeholder={t.adminVehiclesPlatePlaceholder}
                value={vehPlate}
                onChange={(e) => setVehPlate(e.target.value)}
                className="font-mono uppercase font-bold min-h-[44px]"
                required
              />
            </div>

            {/* Brand & Model */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="veh-brand" className="text-xs font-medium">
                  {t.adminVehiclesBrandLabel}
                </Label>
                <Input
                  id="veh-brand"
                  placeholder={t.adminVehiclesBrandPlaceholder}
                  value={vehBrand}
                  onChange={(e) => setVehBrand(e.target.value)}
                  className="min-h-[44px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="veh-model" className="text-xs font-medium">
                  {t.adminVehiclesModelLabel}
                </Label>
                <Input
                  id="veh-model"
                  placeholder={t.adminVehiclesModelPlaceholder}
                  value={vehModel}
                  onChange={(e) => setVehModel(e.target.value)}
                  className="min-h-[44px]"
                />
              </div>
            </div>

            {/* Parking Slot (Only for CAR, not for BIKE) */}
            {vehType === 'CAR' ? (
              <div className="space-y-1.5">
                <Label htmlFor="veh-parking" className="text-xs font-medium">
                  {t.adminVehiclesParkingLabel}
                </Label>
                <Input
                  id="veh-parking"
                  placeholder={t.adminVehiclesParkingPlaceholder}
                  value={vehParking}
                  onChange={(e) => setVehParking(e.target.value)}
                  className="font-mono uppercase min-h-[44px]"
                />
              </div>
            ) : (
              <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <Bike className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bikes do not have assigned parking slots and may be parked anywhere in open areas.</span>
              </div>
            )}

            <DialogFooter className="pt-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVehicleModalResident(null)}
                className="min-h-[44px] w-full sm:w-auto"
              >
                {t.cancel}
              </Button>
              <Button
                type="submit"
                id="btn-save-vehicle"
                disabled={savingVehicle}
                className="font-bold min-h-[44px] w-full sm:w-auto"
              >
                {savingVehicle ? t.loading : t.adminVehiclesAddBtn}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
