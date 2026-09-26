import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api.ts';
import { Watchman } from '../../types.ts';
import { Shield, Plus, Edit2, Trash2, Search, Phone, User, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.tsx';
import { Badge } from '../../components/ui/badge.tsx';

export function AdminWatchmenPage() {
  const [watchmen, setWatchmen] = useState<Watchman[]>([]);
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadWatchmen = async () => {
    try {
      const res = await apiFetch('/api/admin/watchmen');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load watchmen.');
      setWatchmen(data.watchmen || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWatchmen();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormName('');
    setFormPhone('');
    setFormPassword('');
    setFormStatus('active');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (w: Watchman) => {
    setEditingId(w.id);
    setFormName(w.full_name);
    setFormPhone(w.phone);
    setFormPassword('');
    setFormStatus(w.status || 'active');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setIsSubmitting(true);

    try {
      const endpoint = editingId ? `/api/admin/watchmen/${editingId}` : '/api/admin/watchmen';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify({
          full_name: formName.trim(),
          phone: formPhone.replace(/[^0-9]/g, ''),
          password: formPassword.trim() || undefined,
          status: editingId ? formStatus : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save watchman.');

      setIsModalOpen(false);
      await loadWatchmen();
    } catch (err: any) {
      setModalError(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove the watchman account for ${name}? Note: Historical gate logs registered by this account will be preserved.`)) {
      return;
    }

    try {
      const res = await apiFetch(`/api/admin/watchmen/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete account.');
      await loadWatchmen();
    } catch (err: any) {
      alert(err.message || 'Failed to delete account.');
    }
  };

  const filtered = watchmen.filter((w) => {
    const q = filter.toLowerCase();
    return w.full_name.toLowerCase().includes(q) || w.phone.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
            Security & Gate Watchmen
          </h1>
          <p className="text-sm text-[#666666]">
            Staff authorized to register outsider visitor and delivery vehicles at the society gates
          </p>
        </div>

        <Button onClick={handleOpenAdd} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          <span>Add Watchman Account</span>
        </Button>
      </div>

      {/* Table Card */}
      <Card>
        <div className="p-4 border-b border-[#DDD5C5] bg-[#FAF7F0] flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-[#888888] absolute left-3 top-3" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search watchman name or phone..."
              className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-lg border border-[#DDD5C5] bg-white focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
            />
          </div>

          <span className="text-xs font-semibold text-[#666666] shrink-0">
            {filtered.length} accounts
          </span>
        </div>

        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-[#666666]">Loading accounts...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#888888]">
              No watchman accounts registered yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#FAF7F0] border-b border-[#DDD5C5] text-xs font-bold text-[#555555] uppercase">
                  <th className="py-3 px-4 sm:px-6">Watchman Name</th>
                  <th className="py-3 px-4">Login Mobile</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE4D7]">
                {filtered.map((w) => {
                  const isActive = w.status === 'active';

                  return (
                    <tr key={w.id} className="hover:bg-[#FAF7F0]/50 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-[#111111]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#EAE4D7] text-[#2C5E3B] flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <span>{w.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-[#555555]">
                        {w.phone}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <Badge variant={isActive ? 'success' : 'danger'}>
                          {isActive ? 'Active Duty' : 'Deactivated'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#888888]">
                        {new Date(w.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(w)}
                          className="p-1.5 rounded text-[#555555] hover:text-[#111111] hover:bg-[#EAE4D7] transition-colors"
                          title="Edit Watchman"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(w.id, w.full_name)}
                          className="p-1.5 rounded text-[#B93826] hover:bg-[#FBEBEA] transition-colors"
                          title="Delete Account"
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
                {editingId ? 'Edit Watchman Account' : 'Create Watchman Account'}
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
                  Guard Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Sanjay Yadav"
                  className="w-full px-3 py-2 rounded-lg border border-[#DDD5C5] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#555555] mb-1">
                  Login Mobile Number (10 Digits)
                </label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="9820099001"
                  className="w-full px-3 py-2 rounded-lg border border-[#DDD5C5] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#555555] mb-1">
                  {editingId ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={editingId ? '••••••••' : 'Minimum 6 characters'}
                  className="w-full px-3 py-2 rounded-lg border border-[#DDD5C5] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                />
              </div>

              {editingId && (
                <div>
                  <label className="block text-xs font-bold uppercase text-[#555555] mb-1">
                    Account Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-[#DDD5C5] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  >
                    <option value="active">Active (Permitted to Log In)</option>
                    <option value="inactive">Deactivated (Block Access)</option>
                  </select>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#EAE4D7]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
