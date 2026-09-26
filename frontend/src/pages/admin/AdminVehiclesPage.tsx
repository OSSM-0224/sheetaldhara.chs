import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api.ts';
import { Vehicle, Resident, VehicleType } from '../../types.ts';
import { formatPlate } from '../../lib/utils.ts';
import { Car, Bike, HelpCircle, Plus, Edit2, Trash2, Search, AlertCircle, X, Shield } from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.tsx';

export function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formResidentId, setFormResidentId] = useState('');
  const [formType, setFormType] = useState<VehicleType>('CAR');
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formColor, setFormColor] = useState('');
  const [formPlate, setFormPlate] = useState('');
  const [formSlot, setFormSlot] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [vRes, rRes] = await Promise.all([
        apiFetch('/api/admin/vehicles'),
        apiFetch('/api/admin/residents'),
      ]);
      const vData = await vRes.json();
      const rData = await rRes.json();
      setVehicles(vData.vehicles || []);
      setResidents(rData.residents || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormResidentId(residents[0]?.id || '');
    setFormType('CAR');
    setFormBrand('');
    setFormModel('');
    setFormColor('');
    setFormPlate('');
    setFormSlot('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingId(v.id);
    setFormResidentId(v.resident_id);
    setFormType(v.vehicle_type);
    setFormBrand(v.brand || '');
    setFormModel(v.model || '');
    setFormColor(v.color || '');
    setFormPlate(v.normalized_plate);
    setFormSlot(v.parking_number || '');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setIsSubmitting(true);

    try {
      const endpoint = editingId ? `/api/admin/vehicles/${editingId}` : '/api/admin/vehicles';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify({
          resident_id: formResidentId,
          vehicle_type: formType,
          brand: formBrand.trim(),
          model: formModel.trim(),
          color: formColor.trim(),
          plate: formPlate.trim(),
          parking_number: formType === 'BIKE' ? '' : formSlot.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save vehicle.');

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setModalError(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, plate: string) => {
    if (!window.confirm(`Are you sure you want to delete vehicle ${plate} from the society registry?`)) {
      return;
    }

    try {
      const res = await apiFetch(`/api/admin/vehicles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete vehicle.');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete vehicle.');
    }
  };

  const filtered = vehicles.filter((v) => {
    const q = filter.toLowerCase();
    return (
      v.normalized_plate.toLowerCase().includes(q) ||
      (v.owner_name && v.owner_name.toLowerCase().includes(q)) ||
      (v.owner_room && v.owner_room.toLowerCase().includes(q)) ||
      (v.brand && v.brand.toLowerCase().includes(q)) ||
      (v.model && v.model.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
            Registered Vehicles Registry
          </h1>
          <p className="text-sm text-[#666666]">
            Official vehicles assigned to society flats and designated parking bays
          </p>
        </div>

        <Button onClick={handleOpenAdd} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          <span>Register Vehicle</span>
        </Button>
      </div>

      {/* Filter and Table Card */}
      <Card>
        <div className="p-4 border-b border-[#DDD5C5] bg-[#FAF7F0] flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-[#888888] absolute left-3 top-3" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search plate, flat, owner, model..."
              className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-lg border border-[#DDD5C5] bg-white focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
            />
          </div>

          <span className="text-xs font-semibold text-[#666666] shrink-0">
            {filtered.length} vehicles registered
          </span>
        </div>

        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-[#666666]">Loading vehicle registry...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#888888]">
              No registered vehicles found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#FAF7F0] border-b border-[#DDD5C5] text-xs font-bold text-[#555555] uppercase">
                  <th className="py-3 px-4 sm:px-6">Number Plate</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Brand / Model</th>
                  <th className="py-3 px-4">Owner (Flat)</th>
                  <th className="py-3 px-4">Slot</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE4D7]">
                {filtered.map((v) => {
                  const isCar = v.vehicle_type === 'CAR';
                  const isBike = v.vehicle_type === 'BIKE';

                  return (
                    <tr key={v.id} className="hover:bg-[#FAF7F0]/50 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-[#111111] whitespace-nowrap">
                        <span className="bg-white border-2 border-[#111111] px-2 py-0.5 rounded text-xs">
                          {formatPlate(v.normalized_plate)}
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
                      <td className="py-3.5 px-4 text-sm font-semibold text-[#111111]">
                        {v.brand || ''} {v.model || ''}
                        {v.color && (
                          <span className="text-xs text-[#888888] font-normal block">
                            {v.color}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#111111] block">
                          Flat {v.owner_room || 'N/A'}
                        </span>
                        <span className="text-xs text-[#666666]">
                          {v.owner_name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {isBike ? (
                          <span className="text-[#888888]">Common</span>
                        ) : v.parking_number ? (
                          <span className="font-mono font-bold bg-[#EBF3ED] text-[#2C5E3B] px-2 py-0.5 rounded border border-[#C3DCB9]">
                            {v.parking_number}
                          </span>
                        ) : (
                          <span className="text-[#888888]">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="p-1.5 rounded text-[#555555] hover:text-[#111111] hover:bg-[#EAE4D7] transition-colors"
                          title="Edit Vehicle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id, v.normalized_plate)}
                          className="p-1.5 rounded text-[#B93826] hover:bg-[#FBEBEA] transition-colors"
                          title="Delete Vehicle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#DDD5C5] shadow-xl max-w-md w-full overflow-hidden animate-scaleIn">
            <div className="bg-[#FAF7F0] border-b border-[#DDD5C5] p-5 flex items-center justify-between">
              <h3 className="font-bold text-base text-[#111111]">
                {editingId ? 'Edit Vehicle Details' : 'Register New Vehicle'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#666666] hover:text-[#111111]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              {modalError && (
                <div className="p-3 rounded-lg bg-[#FBEBEA] border border-[#F2C1BD] text-[#B93826] text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-[#555555] mb-1">
                  Assigned Resident
                </label>
                <select
                  required
                  value={formResidentId}
                  onChange={(e) => setFormResidentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#DDD5C5] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                >
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      Flat {r.room_number} — {r.full_name} ({r.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#555555] mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as VehicleType)}
                    className="w-full px-3 py-2 rounded-lg border border-[#DDD5C5] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  >
                    <option value="CAR">Car</option>
                    <option value="BIKE">Two-Wheeler / Bike</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#555555] mb-1">
                    Number Plate
                  </label>
                  <input
                    type="text"
                    required
                    value={formPlate}
                    onChange={(e) => setFormPlate(e.target.value.toUpperCase())}
                    placeholder="e.g. MH02AB4821"
                    className="w-full px-3 py-2 rounded-lg border border-[#DDD5C5] text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#555555] mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="e.g. Honda / Royal Enfield"
                    className="w-full px-3 py-2 rounded-lg border border-[#DDD5C5] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#555555] mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    placeholder="e.g. City / Classic 350"
                    className="w-full px-3 py-2 rounded-lg border border-[#DDD5C5] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#555555] mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    placeholder="e.g. White / Silver"
                    className="w-full px-3 py-2 rounded-lg border border-[#DDD5C5] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  />
                </div>

                {formType !== 'BIKE' && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#555555] mb-1">
                      Parking Bay Slot
                    </label>
                    <input
                      type="text"
                      value={formSlot}
                      onChange={(e) => setFormSlot(e.target.value.toUpperCase())}
                      placeholder="e.g. P-24"
                      className="w-full px-3 py-2 rounded-lg border border-[#DDD5C5] text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#EAE4D7]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Register Vehicle'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
