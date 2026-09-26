import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api.ts';
import { SearchLogItem } from '../../types.ts';
import { formatPlate } from '../../lib/utils.ts';
import { FileText, RotateCcw, Search, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.tsx';
import { Button } from '../../components/ui/button.tsx';

export function AdminLogsPage() {
  const [logs, setLogs] = useState<SearchLogItem[]>([]);
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const loadLogs = async () => {
    try {
      const res = await apiFetch('/api/admin/search-logs');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch logs.');
      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleResetSeed = async () => {
    if (!window.confirm('Are you sure you want to reset all data back to the default society seed? This will restore Ramesh Sharma, Priya Nair, Sanjay Yadav, and all initial vehicle records.')) {
      return;
    }

    setIsResetting(true);
    setResetMessage(null);

    try {
      const res = await apiFetch('/api/admin/reset-seed', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed.');
      setResetMessage(data.message || 'Database restored to initial seed.');
      await loadLogs();
    } catch (err: any) {
      alert(err.message || 'Failed to reset.');
    } finally {
      setIsResetting(false);
    }
  };

  const filtered = logs.filter((l) => {
    const q = filter.toLowerCase();
    return (
      l.search_query.toLowerCase().includes(q) ||
      (l.searcher_name && l.searcher_name.toLowerCase().includes(q)) ||
      (l.searcher_room && l.searcher_room.toLowerCase().includes(q)) ||
      (l.matched_plate && l.matched_plate.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
            Security & Search Audit Trail
          </h1>
          <p className="text-sm text-[#666666]">
            Immutable log of all plate search queries performed by residents and security
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={handleResetSeed}
          disabled={isResetting}
          className="gap-2 shrink-0 border-[#DDD5C5]"
        >
          <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Resetting...' : 'Reset Demo Seed Data'}</span>
        </Button>
      </div>

      {resetMessage && (
        <div className="p-4 rounded-xl bg-[#EBF3ED] border border-[#C3DCB9] text-[#2C5E3B] text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Table Card */}
      <Card>
        <div className="p-4 border-b border-[#DDD5C5] bg-[#FAF7F0] flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-[#888888] absolute left-3 top-3" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search by query, resident, or matched plate..."
              className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-lg border border-[#DDD5C5] bg-white focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
            />
          </div>

          <span className="text-xs font-semibold text-[#666666] shrink-0">
            {filtered.length} search queries logged
          </span>
        </div>

        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-[#666666]">Loading search audit trail...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#888888]">
              No search logs recorded yet. Search queries will appear here in real-time.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#FAF7F0] border-b border-[#DDD5C5] text-xs font-bold text-[#555555] uppercase">
                  <th className="py-3 px-4 sm:px-6">Timestamp</th>
                  <th className="py-3 px-4">Searched Query</th>
                  <th className="py-3 px-4">Queried By (Flat)</th>
                  <th className="py-3 px-4 sm:px-6">Matched Vehicle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE4D7]">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF7F0]/50 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 text-xs text-[#666666] font-mono whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#111111]">
                      <span className="bg-[#EAE4D7] px-2 py-0.5 rounded text-xs">
                        {log.search_query}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-xs text-[#111111] block">
                        {log.searcher_name || 'Resident'}
                      </span>
                      <span className="text-[11px] text-[#666666]">
                        {log.searcher_room ? `Room ${log.searcher_room}` : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      {log.matched_plate ? (
                        <span className="font-mono text-xs font-bold text-[#2C5E3B] bg-[#EBF3ED] px-2 py-0.5 rounded border border-[#C3DCB9]">
                          {formatPlate(log.matched_plate)}
                        </span>
                      ) : (
                        <span className="text-xs text-[#888888]">No match</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
