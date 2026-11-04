import React, { useState } from 'react';
import {
  ClipboardCheck,
  Home,
  KeyRound,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

type Role = {
  id: string;
  label: string;
  kicker: string;
  headline: string;
  body: string;
  scope: string;
  points: Array<{
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
};

const ROLES: Role[] = [
  {
    id: 'resident',
    label: 'Resident',
    kicker: 'For flat members',
    headline: 'Find the owner. Make the call.',
    body: 'Search a full plate or the last four digits. See the flat, vehicle, and parking bay before you dial.',
    scope: 'Search registry / Call owners / View own vehicles',
    points: [
      {
        title: 'Passwordless',
        description: 'Flat number plus registered phone. No new password to remember.',
        icon: KeyRound,
      },
      {
        title: 'My vehicles',
        description: 'Every car and bike registered under your flat, in one place.',
        icon: Home,
      },
      {
        title: 'One-tap contact',
        description: 'Call the right owner without opening the society group chat.',
        icon: Users,
      },
    ],
  },
  {
    id: 'watchman',
    label: 'Watchman',
    kicker: 'For the gate',
    headline: 'Log the visitor. Keep the gate moving.',
    body: 'Register outsider vehicles, record the visiting flat, and mark exits without ever opening the resident roster.',
    scope: 'Visitor entry / Exit logging / No resident roster',
    points: [
      {
        title: 'Plate-first entry',
        description: 'One short form for the plate, driver, purpose, and gate.',
        icon: Search,
      },
      {
        title: 'Gate-only log',
        description: 'See the vehicles you logged and mark them out at the gate.',
        icon: ClipboardCheck,
      },
      {
        title: 'Scoped access',
        description: 'Visitor records stay separate from resident vehicles and flats.',
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: 'committee',
    label: 'Committee',
    kicker: 'For the admin desk',
    headline: 'Keep the registry honest.',
    body: 'Manage residents, vehicles, and guard accounts, with a timestamped record of every plate lookup.',
    scope: 'Resident registry / Vehicle registry / Search audit',
    points: [
      {
        title: 'Registry control',
        description: 'Add, update, or remove residents, vehicles, and watchman accounts.',
        icon: ClipboardCheck,
      },
      {
        title: 'Audit trail',
        description: 'See who searched which plate, when, and what matched.',
        icon: Search,
      },
      {
        title: 'Guarded resets',
        description: 'Demo reset needs explicit confirmation and preserves the audit log.',
        icon: ShieldCheck,
      },
    ],
  },
];

const ROLE_ICONS = [Home, ShieldCheck, ClipboardCheck];

export function RoleSwitch() {
  const [activeId, setActiveId] = useState(ROLES[0].id);
  const activeIndex = ROLES.findIndex((role) => role.id === activeId);
  const active = ROLES[activeIndex];

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (index + 1) % ROLES.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (index - 1 + ROLES.length) % ROLES.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = ROLES.length - 1;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    setActiveId(ROLES[nextIndex].id);
    document.getElementById(`role-tab-${ROLES[nextIndex].id}`)?.focus();
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-[#173B28] text-[#F5F1E8] shadow-[0_35px_90px_-60px_rgba(23,59,40,0.9)]">
      <div className="grid grid-cols-1 lg:grid-cols-[0.72fr_1.28fr]">
        <div
          role="tablist"
          aria-label="Choose a society role"
          aria-orientation="vertical"
          className="grid grid-cols-3 border-b border-white/12 lg:flex lg:flex-col lg:border-b-0 lg:border-r"
        >
          {ROLES.map((role, index) => {
            const Icon = ROLE_ICONS[index];
            const isActive = role.id === activeId;

            return (
              <button
                key={role.id}
                type="button"
                role="tab"
                id={`role-tab-${role.id}`}
                aria-selected={isActive}
                aria-controls={`role-panel-${role.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveId(role.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={cn(
                  'flex min-h-[76px] w-full flex-col items-center justify-center gap-1 border-white/10 px-3 py-4 text-center transition-colors lg:min-h-[112px] lg:flex-1 lg:items-start lg:justify-center lg:px-7 lg:py-6 lg:text-left',
                  index < ROLES.length - 1
                    ? 'border-r lg:border-b lg:border-r-0'
                    : '',
                  isActive
                    ? 'bg-[#F5F1E8] text-[#173B28]'
                    : 'text-[#F5F1E8]/60 hover:bg-white/5 hover:text-[#F5F1E8]'
                )}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-bold sm:text-sm">{role.label}</span>
                </span>
                <span
                  className={cn(
                    'hidden pl-[26px] text-[10px] font-medium leading-tight lg:block',
                    isActive ? 'text-[#6A6860]' : 'text-white/35'
                  )}
                >
                  {role.kicker}
                </span>
              </button>
            );
          })}
        </div>

        <div
          key={active.id}
          role="tabpanel"
          id={`role-panel-${active.id}`}
          aria-labelledby={`role-tab-${active.id}`}
          className="min-w-0 animate-fadeIn p-6 sm:p-9 lg:p-12"
        >
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#B8D0B4]">
            {active.kicker}
          </p>
          <h3 className="mt-4 max-w-[18ch] text-balance text-3xl font-extrabold leading-[1.02] tracking-[-0.035em] text-[#F8F3E7] sm:text-4xl">
            {active.headline}
          </h3>
          <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-[#D6E1D0]">
            {active.body}
          </p>

          <div className="mt-8 grid gap-x-8 gap-y-5 border-t border-white/12 pt-6 sm:grid-cols-2">
            {active.points.map((point) => {
              const Icon = point.icon;
              return (
                <div key={point.title} className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-[#C3D9BC]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#F8F3E7]">
                      {point.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#B8C9B2]">
                      {point.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-8 font-mono text-[10px] font-medium tracking-[0.08em] text-[#A5BC9F]">
            {active.scope}
          </p>
        </div>
      </div>
    </div>
  );
}
