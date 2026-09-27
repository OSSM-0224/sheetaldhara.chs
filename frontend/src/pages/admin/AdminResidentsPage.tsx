import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api.ts';
import { Resident } from '../../types.ts';
import { Users, Plus, Edit2, Trash2, Search, Home, Phone, Car, AlertCircle, X } from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.tsx';

export function AdminResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadResidents = async () => {
    try {
      const res = await apiFetch('/api/admin/residents');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch residents.');
      setResidents(data.residents || []);
    } catch (err: any) {
      setError(err.message || 'Error loading residents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResidents();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormName('');
    setFormRoom('');
    setFormPhone('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (resident: Resident) => {
    setEditingId(resident.id);
    setFormName(resident.full_name);
    setFormRoom(resident.room_number);
    setFormPhone(resident.phone);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setIsSubmitting(true);

    try {
      const endpoint = editingId ? `/api/admin/residents/${editingId}` : '/api/admin/residents';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify({
          full_name: formName.trim(),
          room_number: formRoom.trim().toUpperCase(),
          phone: formPhone.replace(/[^0-9]/g, ''),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Operation failed.');

      setIsModalOpen(false);
      await loadResidents();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save resident.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete resident ${name}? All registered vehicles for this resident will also be deleted.`)) {
      return;
    }

    try {
      const res = await apiFetch(`/api/admin/residents/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete resident.');
      await loadResidents();
    } catch (err: any) {
      alert(err.message || 'Failed to delete resident.');
    }
  };

  const filtered = residents.filter((r) => {
    const q = filter.toLowerCase();
    return (
      r.full_name.toLowerCase().includes(q) ||
      r.room_number.toLowerCase().includes(q) ||
      r.phone.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
            Society Residents Directory
          </h1>
          <p className="text-sm text-[#666666]">
            Manage flat owners and members authorized for passwordless portal sign-in
          </p>
        </div>

        <Button onClick={handleOpenAdd} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          <span>Add Resident</span>
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
              placeholder="Search by name, flat, or phone..."
              className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-lg border border-[#DDD5C5] bg-white focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
            />
          </div>

          <span className="text-xs font-semibold text-[#666666] shrink-0">
            {filtered.length} residents
          </span>
        </div>

        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-[#666666]">Loading residents...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#888888]">
              No residents found matching your filter.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#FAF7F0] border-b border-[#DDD5C5] text-xs font-bold text-[#555555] uppercase">
                  <th className="py-3 px-4 sm:px-6">Flat / Room</th>
                  <th className="py-3 px-4">Resident Name</th>
                  <th className="py-3 px-4">Registered Phone</th>
                  <th className="py-3 px-4">Vehicles</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE4D7]">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FAF7F0]/50 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-[#111111]">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-[#2C5E3B]" />
                        <span>{r.room_number}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#111111]">
                      {r.full_name}
                    </td>
                    <td className="py-3.5 px-4 text-[#555555] font-mono text-xs">
                      {r.phone}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="inline-flex items-center gap-1 bg-[#EAE4D7] px-2 py-0.5 rounded text-[#111111] font-semibold">
                        <Car className="w-3 h-3 text-[#2C5E3B]" />
                        {r.vehicles?.length || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="p-1.5 rounded text-[#555555] hover:text-[#111111] hover:bg-[#EAE4D7] transition-colors"
                        title="Edit Resident"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id, r.full_name)}
                        className="p-1.5 rounded text-[#B93826] hover:bg-[#FBEBEA] transition-colors"
                        title="Delete Resident"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#DDD5C5] shadow-xl max-w-md w-full overflow-hidden animate-scaleIn">
            <div className="bg-[#FAF7F0] border-b border-[#DDD5C5] p-5 flex items-center justify-between">
              <h3 className="font-bold text-base text-[#111111]">
                {editingId ? 'Edit Resident Profile' : 'Add New Resident'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#666666] hover:text-[#111111]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {modalError && (
                <div className="p-3 rounded-lg bg-[#FBEBEA] border border-[#F2C1BD] text-[#B93826] text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-[#555555] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Ramesh Kulkarni"
                  className="w-full px-3 py-2 rounded-lg border border-[#DDD5C5] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#555555] mb-1">
                  Flat / Room Number
                </label>
                <input
                  type="text"
                  required
                  value={formRoom}
                  onChange={(e) => setFormRoom(e.target.value)}
                  placeholder="e.g. B-304"
                  className="w-full px-3 py-2 rounded-lg border border-[#DDD5C5] text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#555555] mb-1">
                  Registered Mobile Phone (10 Digits)
                </label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="98200 00000"
                  className="w-full px-3 py-2 rounded-lg border border-[#DDD5C5] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                />
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
                  {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Resident'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
