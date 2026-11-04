import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Bike,
  Car,
  Check,
  Home,
  Search,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { cn, formatPlate } from '../../lib/utils.ts';

type DemoVehicle = {
  id: string;
  plate: string;
  type: 'CAR' | 'BIKE';
  source: 'resident' | 'visitor';
  owner: string;
  place: string;
  placeLabel: string;
  model: string;
  parking?: string;
  note?: string;
};

const SAMPLE_REGISTRY: DemoVehicle[] = [
  {
    id: 'priya-honda',
    plate: 'MH02AB4821',
    type: 'CAR',
    source: 'resident',
    owner: 'Priya Nair',
    place: 'B-304',
    placeLabel: 'Flat',
    model: 'Honda City',
    parking: 'P-24',
  },
  {
    id: 'amitabh-enfield',
    plate: 'MH12CD4821',
    type: 'BIKE',
    source: 'resident',
    owner: 'Amitabh Sen',
    place: 'C-702',
    placeLabel: 'Flat',
    model: 'Royal Enfield Classic 350',
    note: 'Two-wheeler common parking',
  },
  {
    id: 'sneha-creta',
    plate: 'MH01EF9090',
    type: 'CAR',
    source: 'resident',
    owner: 'Sneha Kulkarni',
    place: 'A-502',
    placeLabel: 'Flat',
    model: 'Hyundai Creta',
  },
  {
    id: 'sneha-ather',
    plate: 'MH47XY9090',
    type: 'BIKE',
    source: 'resident',
    owner: 'Sneha Kulkarni',
    place: 'A-502',
    placeLabel: 'Flat',
    model: 'Ather 450X',
    note: 'Two-wheeler common parking',
  },
  {
    id: 'vikram-nexon',
    plate: 'MH04JK1100',
    type: 'CAR',
    source: 'resident',
    owner: 'Vikram Malhotra',
    place: 'D-201',
    placeLabel: 'Flat',
    model: 'Tata Nexon EV',
  },
  {
    id: 'fast-track',
    plate: 'MH03QW5566',
    type: 'CAR',
    source: 'visitor',
    owner: 'Fast Track Logistics',
    place: 'Delivery',
    placeLabel: 'Visiting',
    model: 'Delivery vehicle',
    note: 'Logged at Gate 1',
  },
  {
    id: 'rohan-visitor',
    plate: 'MH14ZZ7788',
    type: 'BIKE',
    source: 'visitor',
    owner: 'Rohan Sharma',
    place: 'Flat D-201',
    placeLabel: 'Visiting',
    model: 'Visitor bike',
    note: 'Logged at Gate 1',
  },
];

const EXAMPLES = ['4821', '9090', 'MH03QW5566'];

function normaliseQuery(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function VehicleIcon({
  type,
  className,
}: {
  type: DemoVehicle['type'];
  className?: string;
}) {
  return type === 'BIKE' ? (
    <Bike className={className} />
  ) : (
    <Car className={className} />
  );
}

function SearchSkeleton() {
  return (
    <div
      className="space-y-3"
      role="status"
      aria-label="Searching the sample registry"
    >
      {[0, 1].map((item) => (
        <div
          key={item}
          className="rounded-xl border border-[#DDD5C5] bg-[#FBF8F1] p-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-[#E5DDCE]" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-28 animate-pulse rounded bg-[#E5DDCE]" />
              <div className="h-2.5 w-40 animate-pulse rounded bg-[#ECE5D8]" />
            </div>
            <div className="h-5 w-14 animate-pulse rounded bg-[#E5DDCE]" />
          </div>
        </div>
      ))}
      <span className="sr-only">Searching the sample registry.</span>
    </div>
  );
}

export function PlateLookupDemo() {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<DemoVehicle[]>([]);
  const [selected, setSelected] = useState<DemoVehicle | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const runSearch = (rawValue: string) => {
    if (timer.current) clearTimeout(timer.current);

    const normalised = normaliseQuery(rawValue);

    if (normalised.length < 4) {
      setError('Enter a full plate or at least the last 4 characters.');
      setMatches([]);
      setSelected(null);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    setError('');
    setIsSearching(true);
    setHasSearched(false);

    timer.current = setTimeout(() => {
      const found = SAMPLE_REGISTRY.filter((vehicle) =>
        vehicle.plate.endsWith(normalised)
      );

      setMatches(found);
      setSelected(found.length === 1 ? found[0] : null);
      setHasSearched(true);
      setIsSearching(false);
    }, 380);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runSearch(query);
  };

  const handleExample = (plate: string) => {
    setQuery(plate);
    runSearch(plate);
  };

  const handleClear = () => {
    if (timer.current) clearTimeout(timer.current);
    setQuery('');
    setMatches([]);
    setSelected(null);
    setError('');
    setHasSearched(false);
    setIsSearching(false);
  };

  const resultLabel =
    matches.length === 1 ? '1 vehicle in the sample registry' : `${matches.length} vehicles in the sample registry`;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#D8D0BF] bg-[#FBF8F1] shadow-[0_30px_80px_-55px_rgba(44,94,59,0.55)]">
      <div className="grid grid-cols-1 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="flex min-w-0 flex-col border-b border-[#E5DDCE] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#2C5E3B]">
                Sample registry
              </p>
              <h3 className="mt-2 text-balance text-xl font-extrabold tracking-tight text-[#111111]">
                Search the way a resident would.
              </h3>
            </div>
            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E6EFE3] text-[#2C5E3B] sm:flex">
              <Search className="h-5 w-5" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 min-w-0">
            <label
              htmlFor="demo-plate"
              className="mb-2 block text-xs font-bold text-[#44443E]"
            >
              Vehicle plate
            </label>
            <div className="flex min-w-0 items-stretch overflow-hidden rounded-xl border-2 border-[#111111] bg-white transition-shadow focus-within:ring-4 focus-within:ring-[#2C5E3B]/15">
              <div className="flex w-9 shrink-0 flex-col items-center justify-center bg-[#003399] py-1 text-white">
                <span className="text-[8px] font-bold leading-none">IND</span>
                <span className="mt-1 h-1.5 w-1.5 rounded-full border border-white" />
              </div>
              <input
                id="demo-plate"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value.toUpperCase())}
                placeholder="MH02AB4821 or 4821"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                aria-describedby={error ? 'demo-plate-error' : 'demo-plate-help'}
                className="min-w-0 flex-1 bg-white px-3 py-2.5 font-mono text-sm font-bold uppercase tracking-[0.12em] text-[#111111] outline-none placeholder:font-sans placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-[#77756D]"
              />
              {query ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="m-1 flex w-8 shrink-0 items-center justify-center rounded-lg text-[#77756D] transition-colors hover:bg-[#F1ECE0] hover:text-[#111111]"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
              <button
                type="submit"
                disabled={isSearching}
                className="m-1 flex shrink-0 items-center gap-1.5 rounded-lg bg-[#2C5E3B] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#234A2F] active:translate-y-px disabled:opacity-60 sm:px-4"
              >
                <span className="hidden sm:inline">Find owner</span>
                <span className="sm:hidden">Find</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {error ? (
              <p
                id="demo-plate-error"
                className="mt-2 text-xs font-medium text-[#A63D2B]"
              >
                {error}
              </p>
            ) : (
              <p id="demo-plate-help" className="mt-2 text-xs text-[#6A6860]">
                A full plate or the last 4 characters will work. No sign-in
                needed for this preview.
              </p>
            )}

            <div className="mt-6">
              <p className="text-xs font-semibold text-[#55554E]">
                Try a number
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {EXAMPLES.map((example, index) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => handleExample(example)}
                    className="group inline-flex items-center gap-2 rounded-md border border-[#D8D0BF] bg-white px-2.5 py-1.5 font-mono text-[11px] font-semibold text-[#33332F] transition-colors hover:border-[#2C5E3B] hover:bg-[#F1F6EE] active:translate-y-px"
                  >
                    <span>{example}</span>
                    <span className="font-sans text-[10px] font-normal text-[#77756D]">
                      {index === 0
                        ? 'two matches'
                        : index === 1
                          ? 'car and bike'
                          : 'visitor'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </form>

          <div className="mt-8 flex flex-1 flex-col justify-end">
            <div className="flex items-start gap-2.5 border-t border-[#E5DDCE] pt-4 text-[11px] leading-relaxed text-[#77756D]">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2C5E3B]" />
              <p>
                Demo data only. Contact numbers are hidden in this public preview.
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-[360px] min-w-0 bg-[#F1ECE0] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="shrink-0 whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#6F6D64]">
              Registry result
            </p>
            {hasSearched && !error ? (
              <span className="shrink-0 text-[10px] font-medium text-[#66645C] sm:text-[11px]">
                {matches.length > 0 ? resultLabel : 'No matches'}
              </span>
            ) : null}
          </div>

          <div className="mt-5" aria-live="polite">
            {isSearching ? <SearchSkeleton /> : null}

            {!isSearching && !hasSearched && !error ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
                <div className="flex overflow-hidden rounded-md border-2 border-[#BEB5A4] bg-[#FBF8F1] opacity-75">
                  <span className="flex w-7 items-center justify-center bg-[#DCE4EA] py-1 text-[7px] font-bold text-[#4E5C68]">
                    IND
                  </span>
                  <span className="px-4 py-2 font-mono text-lg font-bold tracking-[0.18em] text-[#8C877B]">
                    ? ? ? ?
                  </span>
                </div>
                <p className="mt-5 max-w-[26ch] text-sm font-semibold text-[#44443E]">
                  The registry is ready when you are.
                </p>
                <p className="mt-1 max-w-[32ch] text-xs leading-relaxed text-[#77756D]">
                  Try 4821 to see how two owners with the same last four digits
                  are kept apart.
                </p>
              </div>
            ) : null}

            {!isSearching && error ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-[#C9C0AF] px-6 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D8D0BF] bg-[#FBF8F1] text-[#8C877B]">
                  <Search className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-bold text-[#33332F]">
                  Give the registry a little more to go on.
                </p>
                <p className="mt-1 max-w-[30ch] text-xs leading-relaxed text-[#77756D]">
                  Use the full plate or the last four characters.
                </p>
              </div>
            ) : null}

            {!isSearching && hasSearched && matches.length === 0 ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-[#C9C0AF] px-6 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D8D0BF] bg-[#FBF8F1] text-[#8C877B]">
                  <Search className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-bold text-[#33332F]">
                  Nothing matches in this sample registry.
                </p>
                <p className="mt-1 max-w-[33ch] text-xs leading-relaxed text-[#77756D]">
                  Check the plate, or try one of the numbers on the left.
                </p>
              </div>
            ) : null}

            {!isSearching && hasSearched && matches.length > 0 ? (
              <div>
                {matches.length > 1 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[#66645C]">
                      Which vehicle did you mean?
                    </p>
                    {matches.map((vehicle) => {
                      const active = selected?.id === vehicle.id;

                      return (
                        <button
                          key={vehicle.id}
                          type="button"
                          onClick={() => setSelected(vehicle)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors active:translate-y-px',
                            active
                              ? 'border-[#2C5E3B] bg-[#E6EFE3]'
                              : 'border-[#D8D0BF] bg-[#FBF8F1] hover:border-[#B8C9B2] hover:bg-white'
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                              active
                                ? 'bg-[#2C5E3B] text-white'
                                : 'bg-[#EAE4D7] text-[#2C5E3B]'
                            )}
                          >
                            <VehicleIcon
                              type={vehicle.type}
                              className="h-4 w-4"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-mono text-sm font-bold tracking-wide text-[#111111]">
                              {formatPlate(vehicle.plate)}
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] text-[#66645C]">
                              {vehicle.owner} / Flat {vehicle.place} /{' '}
                              {vehicle.model}
                            </span>
                          </span>
                          {active ? (
                            <Check className="h-4 w-4 shrink-0 text-[#2C5E3B]" />
                          ) : (
                            <ArrowRight className="h-4 w-4 shrink-0 text-[#8C877B]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {selected ? (
                  <div
                    key={selected.id}
                    className={cn(
                      'animate-fadeIn rounded-xl border border-[#D8D0BF] bg-[#FBF8F1] p-4 sm:p-5',
                      matches.length > 1 ? 'mt-4' : ''
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E5DDCE] pb-4">
                      <div>
                        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#77756D]">
                          Matched plate
                        </p>
                        <p className="mt-1 font-mono text-lg font-bold tracking-[0.12em] text-[#111111]">
                          {formatPlate(selected.plate)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide',
                          selected.source === 'resident'
                            ? 'border-[#C7D9C1] bg-[#E6EFE3] text-[#2C5E3B]'
                            : 'border-[#D8D0BF] bg-[#F1ECE0] text-[#55554E]'
                        )}
                      >
                        {selected.source === 'resident' ? (
                          <ShieldCheck className="h-3 w-3" />
                        ) : (
                          <Car className="h-3 w-3" />
                        )}
                        {selected.source === 'resident' ? 'Resident' : 'Visitor'}
                      </span>
                    </div>

                    <dl className="grid gap-4 pt-4 sm:grid-cols-2">
                      <div className="flex items-start gap-2.5">
                        <User className="mt-0.5 h-4 w-4 shrink-0 text-[#2C5E3B]" />
                        <div>
                          <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#77756D]">
                            Owner
                          </dt>
                          <dd className="mt-0.5 text-sm font-bold text-[#111111]">
                            {selected.owner}
                          </dd>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Home className="mt-0.5 h-4 w-4 shrink-0 text-[#2C5E3B]" />
                        <div>
                          <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#77756D]">
                            {selected.placeLabel}
                          </dt>
                          <dd className="mt-0.5 text-sm font-bold text-[#111111]">
                            {selected.place}
                          </dd>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <VehicleIcon
                          type={selected.type}
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#2C5E3B]"
                        />
                        <div>
                          <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#77756D]">
                            Vehicle
                          </dt>
                          <dd className="mt-0.5 text-sm font-bold text-[#111111]">
                            {selected.model}
                          </dd>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2C5E3B]" />
                        <div>
                          <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#77756D]">
                            {selected.parking ? 'Parking slot' : 'Registry note'}
                          </dt>
                          <dd className="mt-0.5 text-sm font-bold text-[#111111]">
                            {selected.parking || selected.note || 'Society record'}
                          </dd>
                        </div>
                      </div>
                    </dl>

                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#EAE4D7] px-3 py-2 text-[11px] text-[#55554E]">
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#2C5E3B]" />
                      <span>
                        This lookup would be written to the search audit trail.
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
