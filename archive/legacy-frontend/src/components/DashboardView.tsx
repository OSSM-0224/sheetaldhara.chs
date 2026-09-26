import React, { useState, useEffect } from 'react';
import { Vehicle, SearchResponse } from '../types.ts';
import { apiFetch } from '../lib/api.ts';
import { useLanguage } from '../lib/i18n.tsx';
import { OwnerCard } from './OwnerCard.tsx';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import { Badge } from './ui/badge.tsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card.tsx';
import { Alert, AlertDescription } from './ui/alert.tsx';
import { Label } from './ui/label.tsx';
import { Separator } from './ui/separator.tsx';
import { Search, X, AlertCircle, Car, Bike, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface DashboardViewProps {
  onSearchError?: (msg: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = () => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Allow ESC to clear input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const executeSearch = async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setSearchResponse(null);
      setSelectedVehicle(null);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedVehicle(null);
    setHasSearched(true);

    try {
      const res = await apiFetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setSearchResponse(data);

      // If exactly 1 match -> show owner card directly
      if (data.matches && data.matches.length === 1) {
        setSelectedVehicle(data.matches[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleChipClick = (sample: string) => {
    setQuery(sample);
    executeSearch(sample);
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResponse(null);
    setSelectedVehicle(null);
    setError(null);
    setHasSearched(false);
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'CAR':
        return <Car className="w-4 h-4 shrink-0" />;
      case 'BIKE':
        return <Bike className="w-4 h-4 shrink-0" />;
      default:
        return <HelpCircle className="w-4 h-4 shrink-0" />;
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-7.5rem)] border-b border-border">
        {/* Left Section: Search Input, Filters & Multiple Matches List */}
        <section className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-border p-4 sm:p-6 lg:p-8 flex flex-col gap-5 sm:gap-6 bg-background">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1.5 tracking-tighter text-foreground">
              {t.searchHeading}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
              {t.searchSubtitle}
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleFormSubmit} className="relative space-y-2">
            <Label htmlFor="input-plate-search">
              {t.searchLabel}
            </Label>
            <div className="relative">
              <Input
                id="input-plate-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                autoComplete="off"
                className="w-full h-14 text-lg sm:text-2xl font-bold font-mono placeholder:font-sans placeholder:text-xs sm:placeholder:text-sm pr-10"
              />

              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-4 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Clear"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="font-mono text-[10px] sm:text-[11px] text-muted-foreground">
                {t.searchHint}
              </span>
              <Button
                id="btn-submit-search"
                type="submit"
                size="default"
                className="min-h-[44px] px-4 font-bold text-xs sm:text-sm"
                disabled={loading || !query.trim()}
              >
                {loading ? t.searchBtnLoading : t.searchBtn}
              </Button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Quick Examples Card */}
          <Card className="shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <CardContent className="p-3.5 sm:p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5">
                {t.quickExamples}
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleChipClick('4821')}
                  className="h-8 font-mono"
                >
                  4821 <span className="font-sans font-normal text-[10px] text-muted-foreground">(2)</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleChipClick('9090')}
                  className="h-8 font-mono"
                >
                  9090 <span className="font-sans font-normal text-[10px] text-muted-foreground">(Bike/Car)</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleChipClick('1100')}
                  className="h-8 font-mono"
                >
                  1100 <span className="font-sans font-normal text-[10px] text-muted-foreground">(Nexon)</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleChipClick('MH02AB4821')}
                  className="h-8 font-mono"
                >
                  MH02AB4821
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Multiple Matches List (when duplicate last 4 digits match) */}
          {!loading && searchResponse && searchResponse.matches && searchResponse.matches.length > 1 && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {searchResponse.matches.length} {t.matchesFound}
                </h2>
                <Badge variant="warning">
                  {t.selectModelBelow}
                </Badge>
              </div>

              <div className="space-y-2.5">
                {searchResponse.matches.map((veh) => {
                  const isSelected = selectedVehicle?.id === veh.id;
                  const label = [veh.brand, veh.model].filter(Boolean).join(' ') || veh.vehicle_type;

                  return (
                    <div
                      key={veh.id}
                      id={`vehicle-match-${veh.id}`}
                      onClick={() => setSelectedVehicle(veh)}
                      className={`group cursor-pointer border-2 p-3.5 sm:p-4 rounded-[8px] flex justify-between items-center gap-3 transition-all min-h-[56px] ${
                        isSelected
                          ? 'bg-card border-border ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]'
                          : 'bg-secondary hover:bg-card border-border opacity-95 hover:opacity-100'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-base sm:text-lg font-mono text-foreground truncate flex items-center gap-1.5">
                          <span>{veh.masked_plate || veh.normalized_plate}</span>
                          {(veh as any).source === 'outsider' && (
                            <Badge variant="warning" className="text-[10px] py-0 px-1 font-sans">
                              {t.ownerOutsiderBadge}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase flex items-center gap-1.5 mt-0.5 font-medium truncate">
                          {getVehicleIcon(veh.vehicle_type)}
                          <span className="truncate">
                            {veh.color ? `${veh.color} ` : ''}
                            {label}
                          </span>
                          {veh.vehicle_type !== 'BIKE' && veh.parking_number && (
                            <span className="font-mono font-bold text-foreground shrink-0">
                              • {veh.parking_number}
                            </span>
                          )}
                          {(veh as any).notes && (
                            <span className="font-sans normal-case text-muted-foreground truncate">
                              • {(veh as any).notes}
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`w-8 h-8 border border-border rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isSelected ? 'bg-primary text-primary-foreground' : 'group-hover:bg-primary group-hover:text-primary-foreground'
                        }`}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Zero Matches in Left Column */}
          {!loading && hasSearched && searchResponse && searchResponse.matches.length === 0 && (
            <Card className="text-center p-5 sm:p-6 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
              <CardContent className="p-0">
                <Badge variant="outline" className="mb-2">
                  {t.societyName}
                </Badge>
                <h3 className="text-base font-bold text-foreground">
                  {t.zeroMatchesTitle} &ldquo;{query.trim()}&rdquo;
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.zeroMatchesDesc}
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Right Section: Focal Display (OwnerCard or Guidance) */}
        <section className="lg:col-span-7 bg-secondary p-4 sm:p-8 lg:p-12 flex items-center justify-center min-h-[380px]">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-2 border-border border-t-transparent animate-spin rounded-full mx-auto mb-3" />
              <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                {t.loading}
              </p>
            </div>
          ) : selectedVehicle ? (
            <OwnerCard
              vehicle={selectedVehicle}
              onBack={
                searchResponse && searchResponse.matches.length > 1
                  ? () => setSelectedVehicle(null)
                  : undefined
              }
            />
          ) : searchResponse && searchResponse.matches.length > 1 ? (
            <Card className="w-full max-w-md text-center shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <CardContent className="p-6 sm:p-8">
                <div className="w-12 h-12 border-2 border-border rounded-full bg-accent mx-auto flex items-center justify-center font-bold text-base mb-3 font-mono">
                  {searchResponse.matches.length}
                </div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  {t.selectOneOfVehicles}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {t.selectOneOfVehiclesDesc}
                </p>
              </CardContent>
            </Card>
          ) : (
            /* Default Minimal Welcome Box */
            <Card className="w-full max-w-md shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-5">
                  <Badge variant="default">
                    {t.welcomeCardBadge}
                  </Badge>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-border rounded-lg flex items-center justify-center bg-accent">
                    <ShieldCheck className="w-5 h-5 text-foreground" />
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-1.5">
                  {t.welcomeCardTitle}
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                  {t.welcomeCardDesc}
                </p>

                <Separator className="my-4" />

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold">{t.welcomePrivacy}</span>
                    <span className="font-bold text-[#1E5E3A]">{t.welcomePrivacyVal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold">{t.welcomeDuplicate}</span>
                    <span className="font-bold text-foreground">{t.welcomeDuplicateVal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold">{t.welcomeInstantDial}</span>
                    <span className="font-bold text-foreground">{t.welcomeInstantDialVal}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
};
