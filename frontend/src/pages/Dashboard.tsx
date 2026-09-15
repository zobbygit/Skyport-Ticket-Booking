import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format, formatDistanceToNowStrict } from "date-fns";
import toast from "react-hot-toast";
import {
  ArrowRight,
  CalendarCheck,
  CreditCard,
  Luggage,
  MapPinned,
  Plane,
  PlaneTakeoff,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  Timer,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { api, apiErrorMessage } from "../lib/api";
import { Booking } from "../types";
import StatusBadge from "../components/StatusBadge";
import Reveal from "../components/Reveal";
import { useAuthStore } from "../store/authStore";

type Tab = "upcoming" | "past";

const QUICK_ACTIONS = [
  { to: "/flights", label: "Search flights", caption: "Book a new trip", icon: Search },
  { to: "/baggage", label: "Track baggage", caption: "Live tag status", icon: Luggage },
  { to: "/airport-map", label: "Airport map", caption: "Terminal layouts", icon: MapPinned },
];

export default function Dashboard() {
  const qc = useQueryClient();
  const account = useAuthStore((s) => s.account);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [, forceTick] = useState(0);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => (await api.get<{ data: Booking[] }>("/bookings")).data.data,
  });

  // Re-render once a minute so the "next flight" countdown stays fresh.
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const { upcoming, past, nextFlight } = useMemo(() => {
    const now = Date.now();
    const upcoming: Booking[] = [];
    const past: Booking[] = [];
    (bookings || []).forEach((b) => {
      const isPast =
        new Date(b.flight.departure_time).getTime() < now ||
        b.status === "CANCELLED" ||
        b.status === "COMPLETED";
      (isPast ? past : upcoming).push(b);
    });
    upcoming.sort(
      (a, b) =>
        new Date(a.flight.departure_time).getTime() -
        new Date(b.flight.departure_time).getTime()
    );
    return { upcoming, past, nextFlight: upcoming[0] || null };
  }, [bookings]);

  const list = tab === "upcoming" ? upcoming : past;

  async function handleCheckIn(id: string) {
    try {
      await api.post(`/bookings/${id}/check-in`);
      toast.success("Checked in! Boarding pass ready.");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function handleCancel(id: string) {
    if (!confirm("Cancel this booking?")) return;
    try {
      await api.post(`/bookings/${id}/cancel`);
      toast.success("Booking cancelled.");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function handleRefund(id: string) {
    if (
      !confirm(
        "Request a refund? This will cancel your booking and refund your payment. Allow 5-10 business days."
      )
    )
      return;
    try {
      await api.post(`/payments/booking/${id}/refund`);
      toast.success("Refund initiated. Your booking has been cancelled.");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    } catch (err) {
      toast.error(
        apiErrorMessage(err, "Could not process refund. If you paid, contact support.")
      );
    }
  }

  const firstName = account?.full_name ? account.full_name.split(" ")[0] : "Traveler";

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-950 p-6 text-white shadow-xl shadow-brand-900/10 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-indigo-400/25 blur-3xl" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.09]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.9) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage:
                "radial-gradient(ellipse at center, black 35%, transparent 78%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center, black 35%, transparent 78%)",
            }}
          />
          <PlaneTakeoff className="db-float pointer-events-none absolute -right-8 -top-8 h-44 w-44 rotate-12 text-white/10" />

          <div className="relative">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-100">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
              </span>
              Welcome back
            </p>

            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              <span className="bg-gradient-to-r from-white via-brand-100 to-indigo-200 bg-clip-text text-transparent">
                {firstName}
              </span>
              , here's your trip overview
            </h1>

            <p className="mt-2 max-w-lg text-sm text-brand-100/90">
              Live gate updates, baggage tracking, and boarding passes — one dashboard.
            </p>

            {/* Stat tiles */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <StatTile
                value={upcoming.length}
                label="Upcoming trips"
                icon={<TrendingUp size={15} />}
              />
              <StatTile
                value={past.length}
                label="Past & cancelled"
                icon={<CalendarCheck size={15} />}
              />

              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                {nextFlight ? (
                  <>
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-100">
                      <span className="db-pulse h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      Departing in
                    </p>
                    <p className="mt-1 text-2xl font-extrabold tabular-nums">
                      {formatDistanceToNowStrict(new Date(nextFlight.flight.departure_time))}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-brand-100/90">
                      {nextFlight.flight.flight_number} · {nextFlight.flight.origin_airport?.iata_code} → {nextFlight.flight.destination_airport?.iata_code}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-100">
                      No trip planned
                    </p>
                    <p className="mt-1 text-lg font-extrabold">
                      Search flights to change that
                    </p>
                    <Link
                      to="/flights"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-white/90 hover:text-white"
                    >
                      Search flights <ArrowRight size={12} />
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Trust row */}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-[11px] text-brand-100/80">
              <span className="inline-flex items-center gap-1.5">
                <Zap size={12} /> Live updates
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={12} /> Encrypted payments
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={12} /> Real-time gates
              </span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ---------- Quick actions ---------- */}
      <Reveal delay={80}>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="group card flex items-center gap-3 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg dark:hover:border-brand-900/60"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/30 transition-transform duration-300 group-hover:scale-105">
                <a.icon size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {a.label}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {a.caption}
                </p>
              </div>
              <ArrowRight
                size={15}
                className="shrink-0 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand-600 dark:group-hover:text-brand-400"
              />
            </Link>
          ))}
        </div>
      </Reveal>

      {/* ---------- Next flight spotlight ---------- */}
      {nextFlight && (
        <Reveal delay={120}>
          <div className="card mt-6 overflow-hidden border-slate-200/70 dark:border-slate-800/70">
            <div className="h-0.5 w-full bg-gradient-to-r from-brand-500 via-indigo-500 to-brand-500" />

            <div
              className="flex items-center justify-between border-b px-4 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400"
              style={{ borderColor: "rgb(var(--border))" }}
            >
              <span className="inline-flex items-center gap-2">
                <span className="db-pulse h-1.5 w-1.5 rounded-full bg-brand-500" />
                Next up
              </span>
              <StatusBadge status={nextFlight.status} />
            </div>

            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/30">
                  <Ticket size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-lg font-bold tracking-tight">
                    {nextFlight.flight.origin_airport?.iata_code}
                    <span className="mx-2 text-slate-400">→</span>
                    {nextFlight.flight.destination_airport?.iata_code}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono rounded-md bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">
                      {nextFlight.flight.flight_number}
                    </span>
                    <span>·</span>
                    <span>
                      {format(new Date(nextFlight.flight.departure_time), "EEE, MMM d · HH:mm")}
                    </span>
                    <span>·</span>
                    <span>Ref {nextFlight.booking_reference}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {nextFlight.status === "CONFIRMED" && (
                  <button
                    onClick={() => handleCheckIn(nextFlight.id)}
                    className="btn-primary db-sheen group relative overflow-hidden text-sm"
                  >
                    Check in now
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>
                )}
                {nextFlight.status === "CHECKED_IN" && (
                  <Link
                    to={`/boarding-pass/${nextFlight.id}`}
                    className="btn-primary db-sheen group relative overflow-hidden text-sm"
                  >
                    <QrCode size={16} />
                    View boarding pass
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* ---------- Tabs ---------- */}
      <div className="mt-8 inline-flex rounded-2xl border border-slate-200/70 bg-slate-100/60 p-1 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/50">
        {(["upcoming", "past"] as Tab[]).map((t) => {
          const active = tab === t;
          const count = t === "upcoming" ? upcoming.length : past.length;
          const Icon = t === "upcoming" ? CalendarCheck : Timer;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                active
                  ? "bg-white text-brand-600 shadow-md shadow-black/5 dark:bg-slate-800 dark:text-brand-400"
                  : "text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
              }`}
            >
              <Icon size={14} />
              {t === "upcoming" ? "Upcoming" : "Past & cancelled"}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                  active
                    ? "bg-brand-600 text-white"
                    : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ---------- Booking list ---------- */}
      <div className="mt-6 space-y-4">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card relative h-28 overflow-hidden p-5">
              <div className="db-sheen pointer-events-none absolute inset-0 opacity-70" />
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-64 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="h-9 w-24 rounded-lg bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ))}

        {!isLoading && list.length === 0 && (
          <div className="relative flex flex-col items-center gap-3 overflow-hidden rounded-3xl border border-slate-200/70 bg-white/60 px-8 py-14 text-center backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/40">
            <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
            <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:ring-brand-900/40">
              <CalendarCheck size={24} />
            </span>

            {tab === "upcoming" ? (
              <>
                <h3 className="relative text-base font-bold text-slate-800 dark:text-slate-100">
                  No upcoming trips yet
                </h3>
                <p className="relative max-w-xs text-sm text-slate-500 dark:text-slate-400">
                  Book your next flight and it will appear here with live updates.
                </p>
                <Link
                  to="/flights"
                  className="btn-primary db-sheen group relative mt-2 inline-flex items-center gap-2 overflow-hidden text-sm"
                >
                  <Search size={15} />
                  Search flights
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </>
            ) : (
              <>
                <h3 className="relative text-base font-bold text-slate-800 dark:text-slate-100">
                  Nothing here yet
                </h3>
                <p className="relative max-w-xs text-sm text-slate-500 dark:text-slate-400">
                  Cancelled and completed trips will show up in this tab.
                </p>
              </>
            )}
          </div>
        )}

        {list.map((b, i) => (
          <Reveal key={b.id} delay={Math.min(i, 6) * 60}>
            <div className="group card relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg dark:hover:border-brand-900/60">
              {/* Left accent */}
              <span className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-brand-500/0 via-brand-500/60 to-brand-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/20 transition-transform duration-300 group-hover:scale-105">
                    <Ticket size={17} />
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold tracking-tight">
                        {b.flight.flight_number}
                      </p>
                      <span className="hidden text-slate-300 sm:inline dark:text-slate-600">·</span>
                      <p className="flex items-center gap-1.5 font-semibold tracking-tight">
                        {b.flight.origin_airport?.iata_code}
                        <Plane size={12} className="rotate-45 text-slate-400" />
                        {b.flight.destination_airport?.iata_code}
                      </p>
                      <StatusBadge status={b.status} />
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        {format(new Date(b.flight.departure_time), "EEE, MMM d · HH:mm")}
                      </span>
                      <span className="hidden h-3 w-px bg-slate-200 sm:block dark:bg-slate-800" />
                      <span className="font-mono rounded-md bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">
                        Ref {b.booking_reference}
                      </span>
                      <span className="hidden h-3 w-px bg-slate-200 sm:block dark:bg-slate-800" />
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">
                        {b.cabin_class.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  {b.status === "PENDING_PAYMENT" && (
                    <Link
                      to={`/checkout/${b.id}`}
                      className="btn-primary db-sheen group/btn relative inline-flex items-center gap-2 overflow-hidden text-sm"
                    >
                      <CreditCard size={15} />
                      Complete payment
                      <ArrowRight
                        size={13}
                        className="transition-transform group-hover/btn:translate-x-1"
                      />
                    </Link>
                  )}

                  {b.status === "CONFIRMED" && (
                    <>
                      <button
                        onClick={() => handleCheckIn(b.id)}
                        className="btn-secondary text-sm"
                      >
                        Check in
                      </button>
                      <button
                        onClick={() => handleRefund(b.id)}
                        className="btn-secondary text-sm text-red-500 transition hover:border-red-200 hover:bg-red-50 dark:hover:border-red-900/60 dark:hover:bg-red-950/20"
                        title="Request refund & cancel"
                      >
                        Refund
                      </button>
                    </>
                  )}

                  {b.status === "CHECKED_IN" && (
                    <Link
                      to={`/boarding-pass/${b.id}`}
                      className="btn-primary db-sheen relative inline-flex items-center gap-2 overflow-hidden text-sm"
                    >
                      <QrCode size={15} />
                      Boarding pass
                    </Link>
                  )}

                  {(b.status === "CONFIRMED" || b.status === "CHECKED_IN") && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      aria-label="Cancel booking"
                      className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-red-500 transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 dark:border-slate-800 dark:hover:border-red-900/60 dark:hover:bg-red-950/20"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Motion */}
      <style>{`
        @keyframes db-float {
          0%, 100% { transform: translateY(0) rotate(12deg); }
          50% { transform: translateY(-10px) rotate(15deg); }
        }
        @keyframes db-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,.5); }
          50% { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
        }
        @keyframes db-sheen {
          from { transform: translateX(-120%); }
          to { transform: translateX(220%); }
        }
        @keyframes db-fade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .db-float { animation: db-float 6s ease-in-out infinite; }
        .db-pulse { animation: db-pulse 2s ease-out infinite; }
        .db-fade { animation: db-fade .4s ease-out both; }

        .db-sheen::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            100deg,
            transparent 0%,
            rgba(255,255,255,.35) 45%,
            rgba(255,255,255,.55) 50%,
            rgba(255,255,255,.35) 55%,
            transparent 100%
          );
          transform: translateX(-120%);
          pointer-events: none;
        }
        .db-sheen:hover::after {
          animation: db-sheen .9s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .db-float, .db-pulse, .db-fade, .db-sheen::after {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function StatTile({
  value,
  label,
  icon,
}: {
  value: number | string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur transition hover:-translate-y-0.5">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-100">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums">{value}</p>
    </div>
  );
}