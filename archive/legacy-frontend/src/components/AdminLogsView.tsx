import React, { useState, useEffect } from 'react';
import { SearchLogItem } from '../types.ts';
import { apiFetch } from '../lib/api.ts';
import { useLanguage } from '../lib/i18n.tsx';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import { Card, CardContent } from './ui/card.tsx';
import { Alert, AlertDescription } from './ui/alert.tsx';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './ui/table.tsx';
import { FileText, RefreshCw, AlertCircle, RotateCcw, Check } from 'lucide-react';

export const AdminLogsView: React.FC = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<SearchLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/admin/search-logs');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch search logs');
      setLogs(data.logs || []);
    } catch (err: any) {
      setError(err.message || 'Error loading logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleResetSeed = async () => {
    if (!window.confirm(t.adminLogsResetConfirm)) {
      return;
    }

    try {
      const res = await apiFetch('/api/admin/reset-seed', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset seed');
      setResetMsg(t.adminLogsResetSuccess);
      fetchLogs();
      setTimeout(() => setResetMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Error resetting seed');
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ', ' + d.toLocaleDateString();
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Badge variant="default" className="mb-1.5">
            {t.adminLogsBadge}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter text-foreground">
            {t.adminLogsTitle} ({logs.length})
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t.adminLogsSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleResetSeed}
            title={t.adminLogsResetSeed}
            className="min-h-[44px] flex-1 sm:flex-initial text-xs font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>{t.adminLogsResetSeed}</span>
          </Button>

          <Button
            variant="outline"
            onClick={fetchLogs}
            className="min-h-[44px] flex-1 sm:flex-initial text-xs font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            <span>{t.refresh}</span>
          </Button>
        </div>
      </div>

      {resetMsg && (
        <Alert variant="success" className="mb-4">
          <Check className="h-4 w-4" />
          <AlertDescription>{resetMsg}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Logs Table (Desktop) & Cards (Mobile) */}
      {loading ? (
        <Card className="text-center py-12">
          <CardContent className="p-0">
            <p className="text-xs font-bold uppercase tracking-widest text-foreground">{t.loading}</p>
          </CardContent>
        </Card>
      ) : logs.length === 0 ? (
        <Card className="p-6 sm:p-8 text-center shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <CardContent className="p-0">
            <FileText className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-bold text-foreground">{t.adminLogsEmptyTitle}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t.adminLogsEmptyDesc}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden sm:block overflow-hidden shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.adminLogsTableTime}</TableHead>
                    <TableHead>{t.adminLogsTableUser}</TableHead>
                    <TableHead>{t.adminLogsTableFlat}</TableHead>
                    <TableHead>{t.adminLogsTableQuery}</TableHead>
                    <TableHead>{t.adminLogsTableMatched}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell className="font-bold text-foreground whitespace-nowrap">
                        {log.searcher_name}
                      </TableCell>
                      <TableCell className="font-mono font-bold whitespace-nowrap">
                        {t.flat} {log.searcher_room}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="secondary" className="font-mono font-bold">
                          {log.search_query}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono whitespace-nowrap">
                        {log.matched_plate ? (
                          <span className="font-bold text-[#1E5E3A]">
                            {log.matched_plate}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">
                            Multiple / No match
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-2.5">
            {logs.map((log) => (
              <Card key={log.id} className="p-3.5 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="font-mono font-bold text-xs px-2 py-0.5">
                    Query: {log.search_query}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {formatDate(log.created_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
                  <div className="min-w-0">
                    <span className="font-bold text-foreground block truncate">
                      {log.searcher_name}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      {t.flat} {log.searcher_room}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                      Result
                    </span>
                    {log.matched_plate ? (
                      <span className="font-mono font-bold text-[#1E5E3A] text-xs">
                        {log.matched_plate}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic text-[11px]">
                        No direct match
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
