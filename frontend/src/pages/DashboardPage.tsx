import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../lib/i18n.tsx';
import { apiFetch } from '../lib/api.ts';
import { SearchResultItem, SearchResponse } from '../types.ts';
import { OwnerCard } from '../components/OwnerCard.tsx';
import { formatPlate } from '../lib/utils.ts';
import {
  Search,
  X,
  Car,
  Bike,
  HelpCircle,
  AlertTriangle,
  Info,
  ShieldCheck,
  Building,
} from 'lucide-react';

export function DashboardPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<SearchResultItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const executeSearch = async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResult(null);
      setSelectedVehicle(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      const data: SearchResponse = await res.json();

      if (!res.ok) {
        throw new Error((data as any).error || 'Failed to search registry.');
      }

      setSearchResult(data);

      if (data.matches.length === 1) {
        setSelectedVehicle(data.matches[0]);
      } else {
        setSelectedVehicle(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred during search.');
      setSearchResult(null);
      setSelectedVehicle(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      setSearchParams({ q: query.trim() });
      executeSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    setSearchParams({});
    setSearchResult(null);
    setSelectedVehicle(null);
    setError(null);
    inputRef.current?.focus();
  };

  // Perform search if q parameter is present on initial load
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      executeSearch(q);
    }
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Search Header Banner */}
      <div className="text-center max-w-2xl mx-auto pt-2 sm:pt-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
          {t.appTitle}
        </h1>
        <p className="text-sm text-[#666666] mt-1.5">{t.tagline}</p>
      </div>

      {/* Main Search Input Form */}
      <div className="max-w-2xl mx-auto">
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center bg-white rounded-2xl border-2 border-[#2C5E3B] shadow-sm p-1.5 focus-within:ring-4 focus-within:ring-[#2C5E3B]/10 transition-all"
        >
          <div className="pl-3.5 pr-2 text-[#2C5E3B]">
            <Search className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            placeholder={t.searchPlaceholder}
            className="w-full py-3 px-2 text-base sm:text-lg font-mono font-medium text-[#111111] placeholder:text-[#888888] placeholder:font-sans focus:outline-none uppercase tracking-wider"
            autoFocus
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-[#888888] hover:text-[#111111] rounded-lg transition-colors"
              title={t.clearBtn}
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="bg-[#2C5E3B] hover:bg-[#234A2F] text-white font-bold px-5 sm:px-7 py-3 rounded-xl shadow-xs transition-colors text-sm sm:text-base disabled:opacity-50 shrink-0 ml-1"
          >
            {isSearching ? t.searching : t.searchBtn}
          </button>
        </form>

        {/* Quick Example Chips */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-[#666666]">
          <span className="font-semibold text-[#888888]">Quick Try:</span>
          <button
            type="button"
            onClick={() => {
              setQuery('4821');
              setSearchParams({ q: '4821' });
              executeSearch('4821');
            }}
            className="px-2.5 py-1 bg-white hover:bg-[#EAE4D7] rounded-md border border-[#DDD5C5] font-mono text-[#111111] transition-colors"
          >
            4821 (Disambiguate)
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery('9090');
              setSearchParams({ q: '9090' });
              executeSearch('9090');
            }}
            className="px-2.5 py-1 bg-white hover:bg-[#EAE4D7] rounded-md border border-[#DDD5C5] font-mono text-[#111111] transition-colors"
          >
            9090 (Ather & Creta)
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery('MH14ZZ7788');
              setSearchParams({ q: 'MH14ZZ7788' });
              executeSearch('MH14ZZ7788');
            }}
            className="px-2.5 py-1 bg-white hover:bg-[#EAE4D7] rounded-md border border-[#DDD5C5] font-mono text-[#111111] transition-colors"
          >
            MH14ZZ7788 (Visitor Bike)
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-[#FBEBEA] border border-[#F2C1BD] text-[#B93826] text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Results Area */}
      {searchResult && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Matches Count Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#DDD5C5]">
            <p className="text-sm font-semibold text-[#555555]">
              <span className="text-[#2C5E3B] font-bold">{searchResult.matches.length}</span>{' '}
              {t.matchesFound}
            </p>
            <span className="text-xs text-[#888888] uppercase tracking-wider font-mono">
              Query: {searchResult.normalizedQuery}
            </span>
          </div>

          {/* No matches state */}
          {searchResult.matches.length === 0 && (
            <div className="bg-white rounded-2xl border border-[#DDD5C5] p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F0] border border-[#DDD5C5] flex items-center justify-center mx-auto text-[#888888]">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#111111]">
                {t.noMatches} &ldquo;{query}&rdquo;
              </h3>
              <p className="text-sm text-[#666666] max-w-md mx-auto">
                {t.noMatchesHelp}
              </p>
            </div>
          )}

          {/* Multiple matches disambiguation list */}
          {searchResult.matches.length > 1 && (
            <div className="bg-[#FAF7F0] p-4 sm:p-5 rounded-xl border border-[#DDD5C5] space-y-3">
              <div className="flex items-center gap-2 text-[#111111] font-semibold text-sm">
                <Info className="w-4 h-4 text-[#2C5E3B]" />
                <span>{t.selectVehicle}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {searchResult.matches.map((match) => {
                  const isCurrent = selectedVehicle?.id === match.id;
                  const isCar = match.vehicle_type === 'CAR';
                  const isBike = match.vehicle_type === 'BIKE';

                  return (
                    <button
                      key={match.id}
                      type="button"
                      onClick={() => setSelectedVehicle(match)}
                      className={`text-left p-3 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                        isCurrent
                          ? 'bg-[#2C5E3B] text-white border-[#2C5E3B] shadow-xs'
                          : 'bg-white hover:bg-[#EAE4D7] text-[#111111] border-[#DDD5C5]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div
                          className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? 'bg-white/20 text-white'
                              : 'bg-[#FAF7F0] text-[#2C5E3B]'
                          }`}
                        >
                          {isCar && <Car className="w-4 h-4" />}
                          {isBike && <Bike className="w-4 h-4" />}
                          {!isCar && !isBike && <HelpCircle className="w-4 h-4" />}
                        </div>
                        <div className="truncate">
                          <p className="font-mono font-bold text-sm tracking-wide">
                            {formatPlate(match.normalized_plate)}
                          </p>
                          <p
                            className={`text-xs truncate ${
                              isCurrent ? 'text-white/80' : 'text-[#666666]'
                            }`}
                          >
                            {match.source === 'resident'
                              ? `Flat ${match.owner_room} • ${match.owner_name}`
                              : `Visitor • ${match.owner_name || 'Outsider'}`}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs font-semibold shrink-0">
                        {match.source === 'resident' ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              isCurrent
                                ? 'bg-white/20 text-white'
                                : 'bg-[#EBF3ED] text-[#2C5E3B]'
                            }`}
                          >
                            Resident
                          </span>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              isCurrent
                                ? 'bg-white/20 text-white'
                                : 'bg-[#FFF4E5] text-[#B95D00]'
                            }`}
                          >
                            Visitor
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Vehicle Card view */}
          {selectedVehicle && (
            <div className="pt-2 animate-fadeIn">
              <OwnerCard item={selectedVehicle} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
