import React, { useState, useEffect } from 'react';
import { Watchman } from '../types.ts';
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
  Shield,
  Plus,
  Trash2,
  Edit2,
  Phone,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UserCheck,
  UserX,
} from 'lucide-react';

export const AdminWatchmenView: React.FC = () => {
  const { t } = useLanguage();
  const [watchmen, setWatchmen] = useState<Watchman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingWatchmanId, setEditingWatchmanId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchWatchmen = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/admin/watchmen');
      if (!res.ok) throw new Error('Failed to fetch watchmen');
      const data = await res.json();
      setWatchmen(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching watchmen accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchmen();
  }, []);

  const openAddModal = () => {
    setEditingWatchmanId(null);
    setName('');
    setPhone('');
    setPassword('');
    setStatus('active');
    setModalError(null);
    setShowModal(true);
  };

  const openEditModal = (w: Watchman) => {
    setEditingWatchmanId(w.id);
    setName(w.name);
    setPhone(w.phone);
    setPassword(''); // leave blank unless changing
    setStatus(w.status);
    setModalError(null);
    setShowModal(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!name.trim() || !phone.trim()) {
      setModalError('Name and phone number are required.');
      return;
    }

    if (!editingWatchmanId && !password.trim()) {
      setModalError('Password is required for new watchman account.');
      return;
    }

    setModalSaving(true);
    try {
      if (editingWatchmanId) {
        // Update
        const payload: any = {
          name: name.trim(),
          phone: phone.trim(),
          status,
        };
        if (password.trim()) {
          payload.password = password.trim();
        }

        const res = await apiFetch(`/api/admin/watchmen/${editingWatchmanId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update watchman');

        setSuccessMsg(`Watchman "${name}" updated successfully.`);
      } else {
        // Create
        const res = await apiFetch('/api/admin/watchmen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            password: password.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create watchman');

        setSuccessMsg(`Watchman "${name}" created successfully.`);
      }

      setShowModal(false);
      fetchWatchmen();
    } catch (err: any) {
      setModalError(err.message || 'Save failed');
    } finally {
      setModalSaving(false);
    }
  };

  const handleDelete = async (id: string, watchmanName: string) => {
    if (!window.confirm(`${t.adminWatchmenConfirmDelete} (${watchmanName})`)) {
      return;
    }

    try {
      const res = await apiFetch(`/api/admin/watchmen/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
      setSuccessMsg(`Watchman "${watchmanName}" deleted.`);
      fetchWatchmen();
    } catch (err: any) {
      setError(err.message || 'Error deleting watchman');
    }
  };

  const filtered = watchmen.filter((w) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return w.name.toLowerCase().includes(q) || w.phone.includes(q);
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <Badge variant="outline" className="mb-2 bg-amber-500/10 text-amber-900 border-amber-300 font-mono text-[11px]">
            {t.adminWatchmenBadge}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {t.adminWatchmenTitle}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
            {t.adminWatchmenSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWatchmen}
            disabled={loading}
            className="min-h-[44px]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t.refresh}
          </Button>

          <Button
            id="btn-add-watchman"
            onClick={openAddModal}
            className="min-h-[44px] bg-amber-600 hover:bg-amber-700 text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.adminWatchmenAddBtn}
          </Button>
        </div>
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

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search watchmen by name or phone..."
            className="pl-9 text-xs sm:text-sm min-h-[44px]"
          />
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
              <p className="text-sm font-semibold text-foreground">{t.adminWatchmenEmpty}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold text-xs uppercase">Guard Name</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Phone Number</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Status</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Created Date</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((guard) => (
                    <TableRow key={guard.id} id={`watchman-row-${guard.id}`}>
                      <TableCell className="font-bold text-sm text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-900 flex items-center justify-center font-bold text-xs">
                            {guard.name[0]?.toUpperCase() || 'W'}
                          </div>
                          <span>{guard.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                          <a href={`tel:${guard.phone}`} className="hover:underline">
                            {guard.phone}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={guard.status === 'active' ? 'default' : 'secondary'}
                          className={guard.status === 'active' ? 'bg-emerald-600 text-white' : ''}
                        >
                          {guard.status === 'active' ? (
                            <UserCheck className="w-3 h-3 mr-1 inline" />
                          ) : (
                            <UserX className="w-3 h-3 mr-1 inline" />
                          )}
                          {guard.status === 'active'
                            ? t.adminWatchmenStatusActive
                            : t.adminWatchmenStatusInactive}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {new Date(guard.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(guard)}
                            className="h-8 w-8 p-0 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(guard.id, guard.name)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive/80 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Dialog for Add / Edit Watchman */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingWatchmanId ? t.adminWatchmenModalEditTitle : t.adminWatchmenModalAddTitle}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t.adminWatchmenModalSubtitle}
            </DialogDescription>
          </DialogHeader>

          {modalError && (
            <Alert variant="destructive" className="my-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <AlertDescription className="text-xs">{modalError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSaveModal} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="input-modal-guard-name" className="text-xs font-bold uppercase">
                Guard Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="input-modal-guard-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sanjay Yadav"
                className="min-h-[44px]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="input-modal-guard-phone" className="text-xs font-bold uppercase">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="input-modal-guard-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="pl-9 font-mono min-h-[44px]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="input-modal-guard-pass" className="text-xs font-bold uppercase">
                Password {editingWatchmanId && <span className="text-muted-foreground text-[10px] lowercase">(leave blank to keep unchanged)</span>} {!editingWatchmanId && <span className="text-destructive">*</span>}
              </Label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="input-modal-guard-pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingWatchmanId ? 'Enter new password or leave blank' : 'Set initial password'}
                  className="pl-9 min-h-[44px]"
                  required={!editingWatchmanId}
                />
              </div>
            </div>

            {editingWatchmanId && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase">Status</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={status === 'active' ? 'default' : 'outline'}
                    onClick={() => setStatus('active')}
                    className="min-h-[44px] text-xs font-bold"
                  >
                    Active
                  </Button>
                  <Button
                    type="button"
                    variant={status === 'inactive' ? 'destructive' : 'outline'}
                    onClick={() => setStatus('inactive')}
                    className="min-h-[44px] text-xs font-bold"
                  >
                    Inactive
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter className="pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={modalSaving}
                className="min-h-[44px]"
              >
                {t.cancel}
              </Button>
              <Button
                type="submit"
                disabled={modalSaving}
                className="min-h-[44px] font-bold bg-amber-600 hover:bg-amber-700 text-white"
              >
                {modalSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                    {t.loading}
                  </>
                ) : (
                  t.save
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
