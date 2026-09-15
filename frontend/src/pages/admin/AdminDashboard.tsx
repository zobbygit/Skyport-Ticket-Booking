import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  Bell,
  ClipboardList,
  Compass,
  Megaphone,
  Plane,
  ScrollText,
  ShieldCheck,
  Ticket,
  TriangleAlert,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import Reveal from "../../components/Reveal";
import ErrorState from "../../components/ErrorState";

interface Stats {
  flightsToday: number;
  bookingsToday: number;
  activePassengers: number;
  delayedFlights: number;
}

const QUICK_LINKS = [
  { to: "/admin/flights", label: "Manage flights", icon: Plane },
  { to: "/admin/airports", label: "Airports & maps", icon: Compass },
  { to: "/admin/announcements", label: "Post announcement", icon: Megaphone },
  { to: "/admin/audit-log", label: "View audit log", icon: ScrollText },
];

export default function AdminDashboard() {
  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () =>
      (await api.get<{ data: Stats }>("/admin/stats")).data.data,
  });

  const cards = [
    {
      label: "Flights today",
      value: stats?.flightsToday,
      icon: Plane,
      accent: "from-brand-500 to-indigo-600",
      to: "/admin/flights",
    },
    {
      label: "Bookings today",
      value: stats?.bookingsToday,
      icon: Ticket,
      accent: "from-emerald-500 to-teal-600",
      to: "/admin/passengers",
    },
    {
      label: "Active passengers",
      value: stats?.activePassengers,
      icon: Users,
      accent: "from-violet-500 to-purple-600",
      to: "/admin/passengers",
    },
    {
      label: "Delayed flights",
      value: stats?.delayedFlights,
      icon: TriangleAlert,
      accent: "from-amber-500 to-orange-600",
      to: "/admin/flights",
    },
  ];

  return (
    <div>
      {/* ---------- Header ---------- */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-500 dark:text-red-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
            </span>
            Admin Console
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Operations{" "}
            <span className="bg-gradient-to-r from-red-500 to-indigo-600 bg-clip-text text-transparent dark:from-red-400 dark:to-indigo-400">
              overview
            </span>
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            A live snapshot of what's happening across the network today.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
          <Activity size={12} className="text-red-500 dark:text-red-400" />
          Live data
        </span>
      </div>

      {isError && (
        <div className="mt-6">
          <ErrorState
            message="Couldn't load dashboard stats."
            onRetry={() => refetch()}
          />
        </div>
      )}

      {!isError && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="card relative h-36 overflow-hidden p-5"
              >
                <div className="adash-sheen pointer-events-none absolute inset-0 opacity-70" />
                <div className="relative space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
                  <div className="h-7 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-28 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}

          {!isLoading &&
            cards.map((c, i) => (
              <Reveal key={c.label} delay={i * 60}>
                <Link
                  to={c.to}
                  className="adash-fade group card relative block overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl hover:shadow-red-900/5 dark:hover:border-red-900/60"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Corner glow */}
                  <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-red-500/5 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-red-500/10" />

                  <div className="relative flex items-start justify-between">
                    <span
                      className={`relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${c.accent} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
                    >
                      <c.icon size={18} />
                      <span className="pointer-events-none absolute inset-0 -z-10 rounded-xl opacity-40 blur-md" style={{ background: "inherit" }} />
                    </span>

                    <ArrowRight
                      size={15}
                      className="translate-x-1 text-slate-300 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-red-500 group-hover:opacity-100 dark:text-slate-700 dark:group-hover:text-red-400"
                    />
                  </div>

                  <p className="relative mt-4 text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
                    {c.value ?? "—"}
                  </p>

                  <p className="relative text-sm font-medium text-slate-500 dark:text-slate-400">
                    {c.label}
                  </p>

                  {/* Bottom accent */}
                  <span
                    className={`pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r ${c.accent} opacity-60`}
                  />
                </Link>
              </Reveal>
            ))}
        </div>
      )}

      {/* ---------- Quick links ---------- */}
      <Reveal delay={240}>
        <div className="card mt-8 overflow-hidden p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-red-500 to-indigo-600 text-white shadow-md shadow-red-600/20">
              <ShieldCheck size={14} />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Jump to
              </p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Quick links
              </p>
            </div>
          </div>

          <div className="my-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-800" />

          <div className="flex flex-wrap gap-2">
            {QUICK_LINKS.map((q) => (
              <Link
                key={q.to}
                to={q.to}
                className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3.5 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50/60 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:border-red-900/60 dark:hover:bg-red-950/20 dark:hover:text-red-400"
              >
                <q.icon size={14} className="text-slate-400 transition-colors group-hover:text-red-500 dark:text-slate-500 dark:group-hover:text-red-400" />
                {q.label}
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Motion */}
      <style>{`
        @keyframes adash-sheen {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes adash-fade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .adash-fade { animation: adash-fade .4s ease-out both; }

        .adash-sheen {
          background: linear-gradient(
            100deg,
            transparent 20%,
            rgba(148,163,184,.22) 45%,
            rgba(148,163,184,.35) 50%,
            rgba(148,163,184,.22) 55%,
            transparent 80%
          );
          background-size: 200% 100%;
          animation: adash-sheen 1.6s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .adash-fade, .adash-sheen { animation: none !important; }
        }
      `}</style>
    </div>
  );
}