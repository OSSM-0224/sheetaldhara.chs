import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../lib/api.ts';
import { useLanguage } from '../../lib/i18n.tsx';
import { SearchLogItem } from '../../types.ts';
import { formatPlate } from '../../lib/utils.ts';
import { RotateCcw, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card.tsx';
import { Button } from '../../components/ui/button.tsx';

const ROLE_LABEL: Record<SearchLogItem['searched_by_type'], 'roleResident' | 'roleAdmin' | 'roleWatchman'> = {
  resident: 'roleResident',
  admin: 'roleAdmin',
  watchman: 'roleWatchman',
};

export function AdminLogsPage() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<SearchLogItem[]>([]);
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetWarning, setResetWarning] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setLoadError(null);
    const res = await apiRequest<{ logs: SearchLogItem[] }>('/api/admin/search-logs');
    if (res.ok) {
      setLogs(res.data.logs || []);
    } else {
      // Surface the failure instead of falling through to the empty state, which
      // made a 503 ("Database not connected") look identical to "no data yet".
      setLogs([]);
      setLoadError(res.error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleResetSeed = async () => {
    const confirmed = window.confirm(
      'This deletes ALL residents, vehicles, watchman accounts and gate logs, then restores the original demo dataset.\n\n' +
        'The search audit trail is preserved. Any watchman account you created will be removed and replaced by the seeded demo guard.\n\n' +
        'Continue?'
    );
    if (!confirmed) return;

    setIsResetting(true);
    setResetMessage(null);
    setResetWarning(null);

    const res = await apiRequest<{ message: string; warning?: string }>(
      '/api/admin/reset-seed',
      { method: 'POST', body: JSON.stringify({ confirm: 'RESET' }) }
    );

    if (res.ok) {
      setResetMessage(res.data.message);
      setResetWarning(res.data.warning ?? null);
      await loadLogs();
    } else {
      setResetMessage(res.error);
    }

    setIsResetting(false);
  };

  const filtered = logs.filter((l) => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    return (
      l.search_query.toLowerCase().includes(q) ||
      (l.searcher_name?.toLowerCase().includes(q) ?? false) ||
      (l.searcher_room?.toLowerCase().includes(q) ?? false) ||
      (l.matched_plate?.toLowerCase().includes(q) ?? false) ||
      l.searched_by_type.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">{t.auditTitle}</h1>
          <p className="text-sm text-[#666666]">{t.auditSub}</p>
        </div>

        <Button
          variant="secondary"
          onClick={handleResetSeed}
          disabled={isResetting}
          className="gap-2 shrink-0 border-[#DDD5C5]"
        >
          <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? t.resettingBtn : t.resetSeedBtn}</span>
        </Button>
      </div>

      {resetMessage && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-start gap-2 ${
            resetWarning
              ? 'bg-[#FFF4E5] border-[#FFE0B2] text-[#B95D00]'
              : 'bg-[#EBF3ED] border-[#C3DCB9] text-[#2C5E3B]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span>{resetMessage}</span>
            {resetWarning && <p className="mt-1 font-medium">{resetWarning}</p>}
          </div>
        </div>
      )}

      <Card>
        <div className="p-4 border-b border-[#DDD5C5] bg-[#FAF7F0] flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-[#888888] absolute left-3 top-3" />
            <input
              type="text"
              aria-label={t.auditFilterPlaceholder}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t.auditFilterPlaceholder}
              className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-lg border border-[#DDD5C5] bg-white focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
            />
          </div>

          <span className="text-xs font-semibold text-[#666666] shrink-0">
            {filtered.length} {t.auditCountSuffix}
          </span>
        </div>

        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-[#666666]">{t.loadingLogs}</div>
          ) : loadError ? (
            <div className="p-12 text-center space-y-3">
              <div className="inline-flex items-center gap-2 text-sm text-[#B93826]">
                <AlertCircle className="w-4 h-4" />
                <span>{loadError}</span>
              </div>
              <div>
                <Button variant="outline" size="sm" onClick={loadLogs}>
                  {t.retryBtn}
                </Button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#888888]">{t.noLogs}</div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#FAF7F0] border-b border-[#DDD5C5] text-xs font-bold text-[#555555] uppercase">
                  <th className="py-3 px-4 sm:px-6">{t.colTimestamp}</th>
                  <th className="py-3 px-4">{t.colQuery}</th>
                  <th className="py-3 px-4">{t.colQueriedBy}</th>
                  <th className="py-3 px-4">{t.colMatched}</th>
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
                      <span className="bg-[#EAE4D7] px-2 py-0.5 rounded text-xs">{log.search_query}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-xs text-[#111111] block">
                        {log.searcher_name || t[ROLE_LABEL[log.searched_by_type]]}
                      </span>
                      <span className="text-[11px] text-[#666666]">
                        {log.searcher_room ? `${t.roomPrefix} ${log.searcher_room}` : t[ROLE_LABEL[log.searched_by_type]]}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      {log.matched_plate ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-[#2C5E3B] bg-[#EBF3ED] px-2 py-0.5 rounded border border-[#C3DCB9]">
                            {formatPlate(log.matched_plate)}
                          </span>
                          {log.match_count > 1 && (
                            <span className="text-[11px] text-[#666666]">
                              +{log.match_count - 1} {t.matchCountSuffix}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[#888888]">{t.noMatch}</span>
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
