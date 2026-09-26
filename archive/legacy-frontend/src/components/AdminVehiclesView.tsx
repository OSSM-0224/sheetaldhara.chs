import React, { useState, useEffect } from 'react';
import { Vehicle, Resident, VehicleType } from '../types.ts';
import { apiFetch } from '../lib/api.ts';
import { useLanguage } from '../lib/i18n.tsx';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';
import { Card, CardContent } from './ui/card.tsx';
import { Alert, AlertDescription } from './ui/alert.tsx';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './ui/table.tsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog.tsx';
import {
  Car,
  Bike,
  HelpCircle,
  Trash2,
  Edit2,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const AdminVehiclesView: React.FC = () => {
  const { t } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal state for Add/Edit Vehicle
  const [showModal, setShowModal] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('CAR');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [parkingNumber, setParkingNumber] = useState('');
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vehRes, resRes] = await Promise.all([
        apiFetch('/api/admin/vehicles'),
        apiFetch('/api/admin/residents'),
      ]);

      const vehData = await vehRes.json();
      const resData = await resRes.json();

      if (!vehRes.ok) throw new Error(vehData.error || 'Failed to fetch vehicles');
      setVehicles(vehData.vehicles || []);
      setResidents(resData.residents || []);
    } catch (err: any) {
      setError(err.message || 'Error loading vehicles data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenAdd = () => {
    setEditingVehicleId(null);
    setSelectedResidentId(residents[0]?.id || '');
    setVehicleType('CAR');
    setBrand('');
    setModel('');
    setPlate('');
    setParkingNumber('');
    setModalError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicleId(v.id);
    setSelectedResidentId(v.resident_id);
    setVehicleType(v.vehicle_type);
    setBrand(v.brand || '');
    setModel(v.model || '');
    setPlate(v.normalized_plate);
    setParkingNumber(v.parking_number || '');
    setModalError(null);
    setShowModal(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalSaving(true);

    const isEdit = !!editingVehicleId;
    const url = isEdit
      ? `/api/admin/vehicles/${editingVehicleId}`
      : '/api/admin/vehicles';
    const method = isEdit ? 'PATCH' : 'POST';

    try {
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resident_id: selectedResidentId,
          vehicle_type: vehicleType,
          brand,
          model,
          plate,
          parking_number: vehicleType === 'BIKE' ? '' : parkingNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save vehicle');

      setShowModal(false);
      setSuccessMsg(
        isEdit
          ? `Vehicle ${plate.toUpperCase()} updated successfully.`
          : `Vehicle ${plate.toUpperCase()} added to society registry.`
      );
      setTimeout(() => setSuccessMsg(null), 4000);
      await fetchVehicles();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save vehicle');
    } finally {
      setModalSaving(false);
    }
  };

  const handleRemove = async (id: string, plate: string) => {
    if (!window.confirm(`${t.adminVehiclesConfirmDelete}\n[${plate}]`)) {
      return;
    }

    try {
      const res = await apiFetch(`/api/admin/vehicles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove vehicle');

      setSuccessMsg(`Vehicle ${plate} deleted from society registry.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      await fetchVehicles();
    } catch (err: any) {
      setError(err.message || 'Error removing vehicle');
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    return (
      v.normalized_plate.toLowerCase().includes(q) ||
      v.last_four_digits.includes(q) ||
      (v.owner_name && v.owner_name.toLowerCase().includes(q)) ||
      (v.owner_room && v.owner_room.toLowerCase().includes(q)) ||
      (v.brand && v.brand.toLowerCase().includes(q)) ||
      (v.model && v.model.toLowerCase().includes(q))
    );
  });

  const carCount = vehicles.filter((v) => v.vehicle_type === 'CAR').length;
  const bikeCount = vehicles.filter((v) => v.vehicle_type === 'BIKE').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <Badge variant="outline" className="mb-2">
            {t.adminVehiclesBadge}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t.adminVehiclesTitle}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t.adminVehiclesSubtitle}
          </p>
        </div>

        <Button
          id="btn-admin-add-vehicle"
          onClick={handleOpenAdd}
          className="font-bold shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.adminVehiclesAddBtn}
        </Button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <span className="text-xs text-muted-foreground block font-medium">
            {t.adminVehiclesStatTotal}
          </span>
          <span className="text-xl sm:text-2xl font-black text-foreground">
            {vehicles.length}
          </span>
        </Card>
        <Card className="p-3 text-center">
          <span className="text-xs text-muted-foreground block font-medium">
            {t.adminVehiclesStatCars}
          </span>
          <span className="text-xl sm:text-2xl font-black text-primary">
            {carCount}
          </span>
        </Card>
        <Card className="p-3 text-center">
          <span className="text-xs text-muted-foreground block font-medium">
            {t.adminVehiclesStatBikes}
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600">
            {bikeCount}
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

      {/* Filter Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          id="input-filter-vehicles"
          type="text"
          placeholder={t.adminVehiclesSearchPlaceholder}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-9 bg-card text-xs sm:text-sm"
        />
      </div>

      {/* Desktop Vehicles Table (Hidden on Mobile) */}
      <Card className="hidden md:block overflow-hidden shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold text-xs">{t.adminVehiclesTablePlate}</TableHead>
              <TableHead className="font-bold text-xs">{t.adminVehiclesTableType}</TableHead>
              <TableHead className="font-bold text-xs">{t.adminVehiclesTableDetails}</TableHead>
              <TableHead className="font-bold text-xs">{t.adminVehiclesTableOwner}</TableHead>
              <TableHead className="font-bold text-xs">{t.adminVehiclesTableParking}</TableHead>
              <TableHead className="font-bold text-xs text-right">{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                  {t.loading}
                </TableCell>
              </TableRow>
            ) : filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                  {t.adminVehiclesEmpty}
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((v) => {
                const isCar = v.vehicle_type === 'CAR';
                const isBike = v.vehicle_type === 'BIKE';

                return (
                  <TableRow key={v.id} id={`admin-vehicle-row-${v.id}`}>
                    <TableCell className="font-mono font-bold text-xs sm:text-sm">
                      {v.normalized_plate}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={isCar ? 'default' : 'secondary'}
                        className="text-[10px] uppercase font-bold flex items-center gap-1 w-fit"
                      >
                        {isCar ? <Car className="w-3 h-3" /> : isBike ? <Bike className="w-3 h-3" /> : null}
                        {v.vehicle_type}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {v.brand || ''} {v.model || ''}
                    </TableCell>

                    <TableCell>
                      <div className="text-xs">
                        <span className="font-bold text-foreground block">
                          {v.owner_name}
                        </span>
                        <span className="text-muted-foreground">
                          Flat {v.owner_room} • {v.owner_phone}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {isBike ? (
                        <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300 bg-emerald-50">
                          {t.bikeNoParkingSlot}
                        </Badge>
                      ) : (
                        <span className="font-mono text-xs font-semibold">
                          {v.parking_number || t.ownerNone}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          id={`btn-edit-veh-${v.id}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(v)}
                          className="h-8 w-8 p-0"
                          title={t.edit}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          id={`btn-del-veh-${v.id}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(v.id, v.normalized_plate)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title={t.delete}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Vehicles Card List (Hidden on Desktop) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            {t.loading}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <Card className="p-6 text-center border-dashed">
            <Car className="w-8 h-8 mx-auto text-muted-foreground mb-2 opacity-50" />
            <p className="text-xs text-muted-foreground">{t.adminVehiclesEmpty}</p>
          </Card>
        ) : (
          filteredVehicles.map((v) => {
            const isCar = v.vehicle_type === 'CAR';
            const isBike = v.vehicle_type === 'BIKE';

            return (
              <Card
                key={v.id}
                id={`admin-vehicle-card-${v.id}`}
                className="p-4 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] space-y-3"
              >
                {/* Card Header: Plate Number & Type Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="inline-block px-2.5 py-1 rounded bg-[#FAFAF8] border-2 border-[#1A1A1A] text-foreground font-mono font-black text-sm tracking-wider shadow-2xs">
                      {v.normalized_plate}
                    </div>
                    <Badge
                      variant={isCar ? 'default' : 'secondary'}
                      className="text-[10px] uppercase font-bold flex items-center gap-1"
                    >
                      {isCar ? <Car className="w-3 h-3" /> : isBike ? <Bike className="w-3 h-3" /> : null}
                      {v.vehicle_type}
                    </Badge>
                  </div>
                </div>

                {/* Vehicle Make/Model and Flat Info */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/60">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      {t.adminVehiclesTableOwner}
                    </span>
                    <span className="font-bold text-foreground block truncate">
                      {v.owner_name}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      Flat {v.owner_room}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      {isCar ? t.adminVehiclesParkingLabel : 'Parking'}
                    </span>
                    {isBike ? (
                      <span className="text-emerald-700 font-semibold text-[11px] block">
                        {t.bikeNoParkingSlot}
                      </span>
                    ) : (
                      <span className="font-mono font-bold text-foreground block">
                        {v.parking_number || t.ownerNone}
                      </span>
                    )}
                    {(v.brand || v.model) && (
                      <span className="text-muted-foreground text-[11px] block truncate">
                        {v.brand} {v.model}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mobile Action Buttons: 44px touch targets */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                  <Button
                    id={`btn-edit-veh-mob-${v.id}`}
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(v)}
                    className="min-h-[44px] text-xs font-bold px-3 w-full"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    {t.edit}
                  </Button>
                  <Button
                    id={`btn-del-veh-mob-${v.id}`}
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(v.id, v.normalized_plate)}
                    className="min-h-[44px] text-xs font-bold px-3 w-full text-destructive border-destructive/40 hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    {t.delete}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal: Add/Edit Vehicle */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingVehicleId ? t.adminVehiclesModalEditTitle : t.adminVehiclesModalAddTitle}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t.adminVehiclesModalSubtitle}
            </DialogDescription>
          </DialogHeader>

          {modalError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <AlertDescription className="text-xs font-medium">{modalError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSaveVehicle} className="space-y-4 py-2">
            {/* Resident Select */}
            <div className="space-y-1.5">
              <Label htmlFor="select-resident" className="text-xs font-medium">
                {t.adminVehiclesSelectResident}
              </Label>
              <select
                id="select-resident"
                value={selectedResidentId}
                onChange={(e) => setSelectedResidentId(e.target.value)}
                className="w-full h-10 px-3 py-2 text-xs rounded-md border border-input bg-background font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    Flat {r.room_number} — {r.full_name} ({r.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">{t.adminVehiclesTypeLabel}</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-admin-modal-type-car"
                  onClick={() => setVehicleType('CAR')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded border text-xs font-bold transition-colors ${
                    vehicleType === 'CAR'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  {t.adminVehiclesTypeCar}
                </button>
                <button
                  type="button"
                  id="btn-admin-modal-type-bike"
                  onClick={() => setVehicleType('BIKE')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded border text-xs font-bold transition-colors ${
                    vehicleType === 'BIKE'
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-border bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  <Bike className="w-4 h-4" />
                  {t.adminVehiclesTypeBike}
                </button>
              </div>
            </div>

            {/* Plate Number */}
            <div className="space-y-1.5">
              <Label htmlFor="input-admin-veh-plate" className="text-xs font-medium">
                {t.adminVehiclesPlateLabel}
              </Label>
              <Input
                id="input-admin-veh-plate"
                placeholder={t.adminVehiclesPlatePlaceholder}
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                className="font-mono uppercase font-bold"
                required
              />
            </div>

            {/* Brand & Model */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="input-admin-veh-brand" className="text-xs font-medium">
                  {t.adminVehiclesBrandLabel}
                </Label>
                <Input
                  id="input-admin-veh-brand"
                  placeholder={t.adminVehiclesBrandPlaceholder}
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="input-admin-veh-model" className="text-xs font-medium">
                  {t.adminVehiclesModelLabel}
                </Label>
                <Input
                  id="input-admin-veh-model"
                  placeholder={t.adminVehiclesModelPlaceholder}
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>
            </div>

            {/* Parking Slot (Cars Only) */}
            {vehicleType === 'CAR' ? (
              <div className="space-y-1.5">
                <Label htmlFor="input-admin-veh-parking" className="text-xs font-medium">
                  {t.adminVehiclesParkingLabel}
                </Label>
                <Input
                  id="input-admin-veh-parking"
                  placeholder={t.adminVehiclesParkingPlaceholder}
                  value={parkingNumber}
                  onChange={(e) => setParkingNumber(e.target.value)}
                  className="font-mono uppercase"
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
                onClick={() => setShowModal(false)}
                className="min-h-[44px] w-full sm:w-auto"
              >
                {t.cancel}
              </Button>
              <Button
                type="submit"
                id="btn-submit-admin-veh"
                disabled={modalSaving}
                className="font-bold min-h-[44px] w-full sm:w-auto"
              >
                {modalSaving ? t.loading : t.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
