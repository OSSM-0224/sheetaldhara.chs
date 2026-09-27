import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../lib/api.ts';
import { Watchman } from '../../types.ts';
import { Shield, Plus, Edit2, Trash2, Search, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Card, CardContent } from '../../components/ui/card.tsx';
import { Badge } from '../../components/ui/badge.tsx';

export function AdminWatchmenPage() {
  const [watchmen, setWatchmen] = useState<Watchman[]>([]);
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadWatchmen = useCallback(async () => {
    const res = await apiRequest<{ watchmen: Watchman[] }>('/api/admin/watchmen');
    if (res.ok) {
      setWatchmen(res.data.watchmen || []);
      setLoadError(null);
    } else {
      // Previously this was console.error-only, so a failed request rendered as
      // an empty "no watchmen registered" table.
      setWatchmen([]);
      setLoadError(res.error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadWatchmen();
  }, [loadWatchmen]);

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

    const endpoint = editingId ? `/api/admin/watchmen/${editingId}` : '/api/admin/watchmen';
    const method = editingId ? 'PATCH' : 'POST';

    const res = await apiRequest<{ message?: string }>(endpoint, {
      method,
      body: JSON.stringify({
        full_name: formName.trim(),
        phone: formPhone.replace(/[^0-9]/g, ''),
        password: formPassword.trim() || undefined,
        status: editingId ? formStatus : undefined,
      }),
    });

    if (res.ok) {
      setIsModalOpen(false);
      await loadWatchmen();
    } else {
      setModalError(res.error);
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove the watchman account for ${name}? Note: Historical gate logs registered by this account will be preserved.`)) {
      return;
    }

    const res = await apiRequest<{ message?: string }>(`/api/admin/watchmen/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      await loadWatchmen();
    } else {
      window.alert(res.error);
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
              aria-label="Search watchmen"
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
          ) : loadError ? (
            <div className="p-12 text-center space-y-3">
              <div className="inline-flex items-center gap-2 text-sm text-[#B93826]">
                <AlertCircle className="w-4 h-4" />
                <span>{loadError}</span>
              </div>
              <div>
                <Button variant="outline" size="sm" onClick={loadWatchmen}>
                  Retry
                </Button>
              </div>
            </div>
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
                          type="button"
                          onClick={() => handleOpenEdit(w)}
                          className="p-1.5 rounded text-[#555555] hover:text-[#111111] hover:bg-[#EAE4D7] transition-colors"
                          title="Edit Watchman"
                          aria-label={`Edit watchman ${w.full_name}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(w.id, w.full_name)}
                          className="p-1.5 rounded text-[#B93826] hover:bg-[#FBEBEA] transition-colors"
                          title="Delete Account"
                          aria-label={`Delete account ${w.full_name}`}
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
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#666666] hover:text-[#111111]"
                aria-label="Close dialog"
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
                <label htmlFor="watchman-name" className="block text-xs font-bold uppercase text-[#555555] mb-1">
                  Guard Full Name
                </label>
                <input
                  id="watchman-name"
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Sanjay Yadav"
                  className="w-full px-3 py-2 rounded-lg border border-[#DDD5C5] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                />
              </div>

              <div>
                <label htmlFor="watchman-phone" className="block text-xs font-bold uppercase text-[#555555] mb-1">
                  Login Mobile Number (10 Digits)
                </label>
                <input
                  id="watchman-phone"
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="98200 00000"
                  className="w-full px-3 py-2 rounded-lg border border-[#DDD5C5] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                />
              </div>

              <div>
                <label htmlFor="watchman-password" className="block text-xs font-bold uppercase text-[#555555] mb-1">
                  {editingId ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input
                  id="watchman-password"
                  type="password"
                  required={!editingId}
                  minLength={8}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={editingId ? '••••••••' : 'Minimum 8 characters'}
                  className="w-full px-3 py-2 rounded-lg border border-[#DDD5C5] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                />
              </div>

              {editingId && (
                <div>
                  <label htmlFor="watchman-status" className="block text-xs font-bold uppercase text-[#555555] mb-1">
                    Account Status
                  </label>
                  <select
                    id="watchman-status"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
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
