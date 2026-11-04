import React, { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Building2,
  Car,
  ClipboardCheck,
  KeyRound,
  Languages,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth.ts";
import { PlateLookupDemo } from "../components/landing/PlateLookupDemo.tsx";
import { RoleSwitch } from "../components/landing/RoleSwitch.tsx";

const SocietyScene = lazy(
  () => import("../components/landing/SocietyScene.tsx"),
);

class SceneBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("The 3D gate view could not start.", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function SceneSkeleton() {
  return (
    <div
      className="flex h-full w-full flex-col justify-between bg-[#163525] p-5"
      role="status"
      aria-label="Loading the interactive gate view"
    >
      <div className="flex items-center justify-between">
        <div className="h-2.5 w-20 animate-pulse rounded bg-white/10" />
        <div className="h-2.5 w-24 animate-pulse rounded bg-white/10" />
      </div>
      <div className="mx-auto flex flex-col items-center">
        <div className="flex overflow-hidden rounded-md border border-white/20 bg-white/5">
          <span className="flex w-6 items-center justify-center bg-white/10 py-3 text-[6px] font-bold text-white/30">
            IND
          </span>
          <span className="px-4 py-3 font-mono text-base font-bold tracking-[0.22em] text-white/20">
            ? ? ? ?
          </span>
        </div>
        <div className="mt-4 h-2 w-28 animate-pulse rounded bg-white/10" />
      </div>
      <div className="h-2.5 w-40 animate-pulse rounded bg-white/10" />
      <span className="sr-only">Loading the interactive gate view.</span>
    </div>
  );
}

function SceneFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#163525] px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-[#D9E7D2]">
        <Building2 className="h-6 w-6" />
      </div>
      <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
        Gate view
      </p>
      <p className="mt-2 max-w-[24ch] text-sm font-semibold text-[#F5F1E8]">
        The interactive model needs WebGL in this browser.
      </p>
      <p className="mt-2 max-w-[30ch] text-xs leading-relaxed text-white/55">
        The rest of the page and the sample lookup below are still available.
      </p>
    </div>
  );
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

const proofPoints = [
  {
    title: "Last four digits",
    detail: "Full plate or suffix",
    icon: Search,
  },
  {
    title: "Cars and bikes",
    detail: "Resident and visitor records",
    icon: Car,
  },
  {
    title: "Every lookup logged",
    detail: "Query, person, plate, time",
    icon: ShieldCheck,
  },
  {
    title: "Three languages",
    detail: "English, हिंदी, मराठी",
    icon: Languages,
  },
];

const securityPoints = [
  {
    title: "Role separation",
    description:
      "Watchmen see gate visitors. They never open the resident roster or vehicle registry.",
    icon: ShieldCheck,
  },
  {
    title: "Attributed lookups",
    description:
      "Every search records the query, the resident, the matched plate, and the timestamp.",
    icon: ClipboardCheck,
  },
  {
    title: "Session control",
    description:
      "Signed httpOnly cookies, 30-day sessions, and rate limits on sensitive routes.",
    icon: LockKeyhole,
  },
  {
    title: "No resident passwords",
    description:
      "Flat number plus registered phone. Fewer credentials to lose at the gate.",
    icon: KeyRound,
  },
  {
    title: "Guarded resets",
    description:
      "The demo reset needs explicit confirmation and leaves the search audit trail intact.",
    icon: RefreshCw,
  },
];

export function LandingPage() {
  const { role } = useAuth();
  const reduceMotion = useReducedMotion();

  const portalPath =
    role === "WATCHMAN"
      ? "/watchman"
      : role === "ADMIN"
        ? "/admin/residents"
        : role === "RESIDENT"
          ? "/dashboard"
          : "/login";

  return (
    <div
      id="top"
      className="min-h-[100dvh] overflow-x-hidden bg-[#F5F1E8] text-[#111111]"
    >
      <header className="sticky top-0 z-40 border-b border-[#DDD5C5]/80 bg-[#F5F1E8]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2.5"
            aria-label="SHEETALDHARA CHS home"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2C5E3B] text-white">
              <Building2 className="h-4 w-4" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[12px] font-extrabold tracking-[-0.01em] text-[#111111] sm:text-sm">
                SHEETALDHARA
              </span>
              <span className="block font-mono text-[9px] font-medium tracking-[0.14em] text-[#6A6860]">
                CHS MUMBAI
              </span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label="Landing page sections"
          >
            <a
              href="#lookup"
              className="text-xs font-semibold text-[#55554E] transition-colors hover:text-[#2C5E3B]"
            >
              Sample lookup
            </a>
            <a
              href="#roles"
              className="text-xs font-semibold text-[#55554E] transition-colors hover:text-[#2C5E3B]"
            >
              Three roles
            </a>
            <a
              href="#security"
              className="text-xs font-semibold text-[#55554E] transition-colors hover:text-[#2C5E3B]"
            >
              Security
            </a>
          </nav>

          <Link
            to={portalPath}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#2C5E3B] px-3.5 py-2.5 text-[11px] font-bold text-white transition-colors hover:bg-[#234A2F] active:translate-y-px sm:px-4 sm:text-xs"
          >
            <span className="whitespace-nowrap">Enter the portal</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto min-h-screen max-w-[1400px] px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:px-12 lg:pb-20 lg:pt-16">
          <div className="grid min-h-full items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="max-w-[11ch] text-[clamp(2.75rem,8.4vw,5.8rem)] font-extrabold leading-[0.92] tracking-[-0.055em] text-[#111111]">
                Every plate{" "}
                <span className="block text-[#2C5E3B]">has a person.</span>
              </h1>

              <p className="mt-6 max-w-[41ch] text-base leading-relaxed text-[#55554E] sm:text-lg">
                Search the last four digits, find the resident, clear the
                driveway. One registry for the whole society.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to={portalPath}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#2C5E3B] px-5 text-sm font-bold text-white transition-colors hover:bg-[#234A2F] active:translate-y-px"
                >
                  <span className="whitespace-nowrap">Enter the portal</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#lookup"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#BEB6A6] bg-transparent px-5 text-sm font-bold text-[#33332F] transition-colors hover:border-[#2C5E3B] hover:bg-[#EAE4D7] active:translate-y-px"
                >
                  <Search className="h-4 w-4 text-[#2C5E3B]" />
                  <span className="whitespace-nowrap">Try a lookup</span>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: reduceMotion ? 0 : 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative"
            >
              <div className="overflow-hidden rounded-2xl border border-[#2C5E3B]/25 bg-[#163525] shadow-[0_40px_100px_-60px_rgba(23,59,40,0.9)]">
                <div className="relative h-[clamp(400px,52vw,560px)]">
                  <Suspense fallback={<SceneSkeleton />}>
                    <SceneBoundary fallback={<SceneFallback />}>
                      <SocietyScene />
                    </SceneBoundary>
                  </Suspense>
                  <div
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_85%_at_68%_12%,transparent_42%,rgba(7,21,13,0.42)_100%)]"
                    aria-hidden="true"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-[#10291C] px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">
                      Sample match
                    </p>
                    <p className="mt-1 truncate font-mono text-xs font-semibold text-white/90">
                      MH 02 AB 4821
                      <span className="text-white/[0.45]"> / Flat B-304</span>
                    </p>
                  </div>
                  <p className="hidden shrink-0 text-[10px] font-medium text-white/[0.45] sm:block">
                    Drag to look around
                  </p>
                  <p className="shrink-0 text-[10px] font-medium text-white/[0.45] sm:hidden">
                    Tap the car
                  </p>
                </div>
                <p className="sr-only">
                  Sample record: Priya Nair, Flat B-304, Honda City, parking
                  slot P-24. Use the sample lookup below to search more plate
                  records.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          aria-label="Product capabilities"
          className="border-y border-[#DDD5C5] bg-[#FAF6EE]"
        >
          <ul className="mx-auto grid max-w-[1400px] grid-cols-2 divide-y divide-[#DDD5C5] px-5 sm:px-8 lg:grid-cols-4 lg:divide-y-0 lg:divide-x lg:px-12">
            {proofPoints.map((point) => {
              const Icon = point.icon;
              return (
                <li
                  key={point.title}
                  className="flex items-start gap-3 py-5 lg:px-7 lg:py-6 lg:first:pl-0 lg:last:pr-0"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#2C5E3B]" />
                  <span>
                    <span className="block text-xs font-bold text-[#22221F]">
                      {point.title}
                    </span>
                    <span className="mt-1 block text-[11px] leading-relaxed text-[#77756D]">
                      {point.detail}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          id="lookup"
          className="scroll-mt-24 border-b border-[#DDD5C5] bg-[#EFE9DC] py-20 sm:py-24 lg:py-28"
        >
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
            <Reveal className="max-w-2xl">
              <h2 className="text-balance text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.045em] text-[#111111]">
                Four digits. One owner.
              </h2>
              <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-[#55554E] sm:text-base">
                Search the sample registry the same way a resident would at Gate
                1. No sign-in is needed for this preview.
              </p>
            </Reveal>

            <Reveal className="mt-10 lg:mt-12" delay={0.08}>
              <PlateLookupDemo />
            </Reveal>
          </div>
        </section>

        <section id="roles" className="scroll-mt-24 py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
            <Reveal className="max-w-2xl">
              <h2 className="text-balance text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.045em] text-[#111111]">
                One gate.{" "}
                <span className="block sm:inline">Three clear roles.</span>
              </h2>
              <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-[#55554E] sm:text-base">
                Residents find owners. Watchmen log visitors. The committee
                keeps the registry true.
              </p>
            </Reveal>

            <Reveal className="mt-10 lg:mt-12" delay={0.08}>
              <RoleSwitch />
            </Reveal>
          </div>
        </section>

        <section
          id="security"
          className="scroll-mt-24 border-t border-[#DDD5C5] bg-[#F8F3E9] py-20 sm:py-24 lg:py-28"
        >
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <Reveal>
                <h2 className="max-w-[16ch] text-balance text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.045em] text-[#111111]">
                  Security is the floor, not a feature.
                </h2>
                <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-[#55554E] sm:text-base">
                  The useful part is what each role cannot see.
                </p>
              </Reveal>

              <Reveal delay={0.06}>
                <ul className="divide-y divide-[#DDD5C5]">
                  {securityPoints.map((point) => {
                    const Icon = point.icon;
                    return (
                      <li
                        key={point.title}
                        className="flex gap-4 py-5 first:pt-0 last:pb-0"
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#D3CAB8] bg-[#F5F1E8] text-[#2C5E3B]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="grid gap-1 sm:grid-cols-[0.8fr_1.2fr] sm:gap-6">
                          <h3 className="text-sm font-bold text-[#22221F]">
                            {point.title}
                          </h3>
                          <p className="text-xs leading-relaxed text-[#66645C] sm:text-[13px]">
                            {point.description}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <Reveal className="mx-auto max-w-[1400px]">
            <div className="flex flex-col items-center rounded-2xl border border-[#CBD7C5] bg-[#E8EFE3] px-6 py-14 text-center sm:px-10 sm:py-16">
              <div className="flex overflow-hidden rounded-md border-2 border-[#111111] bg-white shadow-[0_18px_40px_-30px_rgba(17,17,17,0.55)]">
                <span className="flex w-8 flex-col items-center justify-center bg-[#003399] py-1 text-white">
                  <span className="text-[7px] font-bold leading-none">IND</span>
                  <span className="mt-1 h-1.5 w-1.5 rounded-full border border-white" />
                </span>
                <span className="px-4 py-2 font-mono text-sm font-bold tracking-[0.16em] text-[#111111] sm:px-5 sm:py-2.5 sm:text-base">
                  MH 02 AB 4821
                </span>
              </div>

              <h2 className="mt-7 max-w-[14ch] text-balance text-[clamp(2rem,4.4vw,3.7rem)] font-extrabold leading-[1.01] tracking-[-0.05em] text-[#111111]">
                Bring the registry to your gate.
              </h2>
              <p className="mt-4 max-w-[44ch] text-sm leading-relaxed text-[#55554E] sm:text-base">
                Residents, watchmen, and the committee, working from the same
                record.
              </p>
              <Link
                to={portalPath}
                className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#2C5E3B] px-5 text-sm font-bold text-white transition-colors hover:bg-[#234A2F] active:translate-y-px"
              >
                <span className="whitespace-nowrap">Enter the portal</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-[#DDD5C5] bg-[#F5F1E8]">
        <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2C5E3B] text-white">
                  <Building2 className="h-4 w-4" />
                </span>
                <span className="text-xs font-extrabold tracking-tight text-[#111111]">
                  SHEETALDHARA CHS
                </span>
              </div>
              <p className="mt-3 max-w-[34ch] text-xs leading-relaxed text-[#77756D]">
                Vehicle lookup and gate management for a co-operative housing
                society in Mumbai.
              </p>
              <p className="mt-3 text-[11px] text-[#8A877E]">
                Available in English, हिंदी, and मराठी.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-3 text-xs font-semibold sm:justify-end">
              <Link
                to="/login"
                className="text-[#55554E] transition-colors hover:text-[#2C5E3B]"
              >
                Resident and watchman portal
              </Link>
              <Link
                to="/admin/login"
                className="text-[#55554E] transition-colors hover:text-[#2C5E3B]"
              >
                Administrator
              </Link>
              <a
                href="#top"
                className="text-[#55554E] transition-colors hover:text-[#2C5E3B]"
              >
                Back to top
              </a>
            </div>
          </div>

          <div className="mt-8 border-t border-[#DDD5C5] pt-5 text-[11px] text-[#8A877E]">
            <p>
              © {new Date().getFullYear()} SHEETALDHARA Co-operative Housing
              Society Ltd., Mumbai.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
