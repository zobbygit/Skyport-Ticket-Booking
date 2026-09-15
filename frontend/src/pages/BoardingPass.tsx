import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import {
  CalendarDays,
  CreditCard,
  DoorOpen,
  Hash,
  Plane,
  Printer,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Ticket,
  User,
  Users,
  UsersRound,
} from "lucide-react";
import { api } from "../lib/api";
import { Booking } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

interface Passenger {
  id: string;
  full_name: string;
  boarding_group?: string;
  seat?: string;
}

export default function BoardingPass() {
  const { id } = useParams();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: async () =>
      (
        await api.get<{ data: Booking & { passengers?: Passenger[] } }>(
          `/bookings/${id}`
        )
      ).data.data,
    enabled: !!id,
  });

  if (isLoading || !booking)
    return <LoadingSpinner label="Loading your boarding pass..." />;

  const f = booking.flight;
  const passengers: Passenger[] = (booking as any).passengers?.length
    ? (booking as any).passengers
    : [
        {
          id: "primary",
          full_name: "Primary Passenger",
          boarding_group: (booking as any).boarding_group,
          seat: (booking as any).seat,
        },
      ];

  return (
    <div className="mx-auto max-w-2xl">
      <style>{`
        @keyframes bp-fade {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bp-float {
          0%, 100% { transform: translateY(0) rotate(12deg); }
          50% { transform: translateY(-8px) rotate(15deg); }
        }
        @keyframes bp-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,.5); }
          50% { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
        }
        @keyframes bp-sheen {
          from { transform: translateX(-120%); }
          to { transform: translateX(220%); }
        }

        .bp-fade { animation: bp-fade .5s ease-out both; }
        .bp-float { animation: bp-float 6s ease-in-out infinite; }
        .bp-pulse { animation: bp-pulse 2s ease-out infinite; }

        .bp-sheen::after {
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
        .bp-sheen:hover::after {
          animation: bp-sheen .9s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .bp-fade, .bp-float, .bp-pulse, .bp-sheen::after {
            animation: none !important;
          }
        }

        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .bp-fade { animation: none !important; }
          .boarding-pass {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            break-inside: avoid;
          }
          @page { margin: 12mm; }
        }
      `}</style>

      {/* ---------- Header (no print) ---------- */}
      <div className="no-print mb-8 pt-5 text-center">
        <span className="relative mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30">
          <ShieldCheck size={24} />
          <span className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-brand-500 opacity-40 blur-xl" />
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-950" />
        </span>

        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          {passengers.length > 1
            ? `${passengers.length} passes ready`
            : "Boarding pass ready"}
        </p>

        <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {passengers.length > 1 ? (
            <>
              {passengers.length} boarding{" "}
              <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400">
                passes
              </span>
            </>
          ) : (
            <>
              You're{" "}
              <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400">
                checked in
              </span>
            </>
          )}
        </h1>

        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
          Save · Screenshot · Print for the gate.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-emerald-500" />
            Verified by SkyPort
          </span>
          <span className="h-3 w-px bg-slate-200 dark:bg-slate-800" />
          <span className="inline-flex items-center gap-1.5">
            <ScanLine size={12} />
            Scan at gate
          </span>
          <span className="h-3 w-px bg-slate-200 dark:bg-slate-800" />
          <span className="inline-flex items-center gap-1.5">
            <Sparkles size={12} className="text-brand-500" />
            Dynamic QR
          </span>
        </div>
      </div>

      {/* ---------- Passes ---------- */}
      {passengers.map((passenger, idx) => {
        const qrPayload = JSON.stringify({
          ref: booking.booking_reference,
          flight: f.flight_number,
          passenger: passenger.full_name,
          seat: passenger.seat || "TBD",
        });

        return (
          <div
            key={passenger.id}
            className={`boarding-pass bp-fade relative flex flex-col overflow-hidden rounded-3xl shadow-xl shadow-black/10 ring-1 ring-slate-200/60 dark:ring-slate-800/60 sm:flex-row ${
              idx > 0 ? "mt-6" : ""
            }`}
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            {/* ---------- Main stub ---------- */}
            <div className="relative flex-1 overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-950 p-6 text-white sm:p-8">
              {/* Aurora + grid */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-16 left-6 h-44 w-44 rounded-full bg-indigo-400/20 blur-3xl" />
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.9) 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                  maskImage:
                    "radial-gradient(ellipse at center, black 35%, transparent 78%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse at center, black 35%, transparent 78%)",
                }}
              />
              <Plane className="bp-float pointer-events-none absolute -right-6 -top-6 h-24 w-24 text-white/10" />

              {/* Top row */}
              <div className="relative flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-lg font-extrabold tracking-tight">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20">
                    <Plane size={16} />
                  </span>
                  SkyPort
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] backdrop-blur">
                  <Ticket size={11} />
                  {booking.cabin_class.replace("_", " ")}
                </span>
              </div>

              {/* Passenger index chip */}
              {passengers.length > 1 && (
                <div className="relative mt-4 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                  <Users size={13} />
                  Passenger {idx + 1} of {passengers.length}
                </div>
              )}

              {/* Route block */}
              <div className="relative mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-100">
                    From
                  </p>
                  <p className="mt-1 text-4xl font-black tracking-tight tabular-nums sm:text-5xl">
                    {f.origin_airport.iata_code}
                  </p>
                  <p className="mt-0.5 text-xs text-brand-100/90">
                    {f.origin_airport.city}
                  </p>
                  <p className="mt-2 text-[11px] text-brand-100/80">
                    {format(new Date(f.departure_time), "HH:mm")}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-1 px-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                  <div className="h-px w-16 border-t border-dashed border-white/40 sm:w-24" />
                  <Plane size={14} className="text-white/70" />
                  <div className="h-px w-16 border-t border-dashed border-white/40 sm:w-24" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-100">
                    To
                  </p>
                  <p className="mt-1 text-4xl font-black tracking-tight tabular-nums sm:text-5xl">
                    {f.destination_airport.iata_code}
                  </p>
                  <p className="mt-0.5 text-xs text-brand-100/90">
                    {f.destination_airport.city}
                  </p>
                  <p className="mt-2 text-[11px] text-brand-100/80">
                    {format(new Date(f.arrival_time), "HH:mm")}
                  </p>
                </div>
              </div>

              {/* Field grid */}
              <div className="relative mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field icon={<User size={12} />} label="Passenger" value={passenger.full_name} />
                <Field icon={<Plane size={12} />} label="Flight" value={f.flight_number} />
                <Field
                  icon={<CalendarDays size={12} />}
                  label="Date"
                  value={format(new Date(f.departure_time), "MMM d, yyyy")}
                />
                <Field
                  icon={<Hash size={12} />}
                  label="Boarding"
                  value={
                    f.boarding_time
                      ? format(new Date(f.boarding_time), "HH:mm")
                      : "TBD"
                  }
                />
                <Field icon={<DoorOpen size={12} />} label="Gate" value={f.gate?.code || "TBD"} />
                <Field
                  icon={<CreditCard size={12} />}
                  label="Terminal"
                  value={f.terminal?.code || "TBD"}
                />
                <Field
                  icon={<Ticket size={12} />}
                  label="Seat"
                  value={passenger.seat || "Assigned at gate"}
                />
                <Field
                  icon={<UsersRound size={12} />}
                  label="Group"
                  value={passenger.boarding_group || "—"}
                />
              </div>

              {/* Bottom status strip */}
              <div className="relative mt-6 flex items-center justify-between border-t border-white/15 pt-4 text-[11px]">
                <span className="inline-flex items-center gap-1.5 font-semibold text-brand-100">
                  <span className="bp-pulse h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Proceed to gate
                </span>
                <span className="font-mono tracking-[0.25em] text-white/60">
                  |||| ||| ||||| |||
                </span>
              </div>
            </div>

            {/* ---------- Perforated divider ---------- */}
            <div className="relative hidden w-0 sm:block">
              <div
                className="absolute -left-3 top-0 h-6 w-6 -translate-y-1/2 rounded-full"
                style={{ backgroundColor: "rgb(var(--bg))" }}
              />
              <div
                className="absolute -left-3 bottom-0 h-6 w-6 translate-y-1/2 rounded-full"
                style={{ backgroundColor: "rgb(var(--bg))" }}
              />
              <div className="h-full border-l-2 border-dashed border-white/40" />
            </div>

            {/* ---------- QR stub ---------- */}
            <div className="card relative flex flex-row items-center justify-between gap-4 !rounded-none border-0 p-6 ring-1 ring-slate-200/60 dark:ring-slate-800/60 sm:w-60 sm:flex-col sm:justify-center sm:!rounded-r-3xl">
              {/* QR tile */}
              <div className="relative">
                <div className="rounded-2xl bg-white p-2.5 shadow-inner ring-1 ring-slate-200">
                  <QRCodeSVG value={qrPayload} size={108} />
                </div>
                <span className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
                  Scan at gate
                </span>
              </div>

              <div className="flex-1 text-right sm:flex-none sm:text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Reference
                </p>
                <p className="mt-1 inline-block rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-lg font-bold tracking-[0.2em] text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                  {booking.booking_reference}
                </p>

                <p className="mt-3 inline-flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                  <ShieldCheck size={11} className="text-emerald-500" />
                  SkyPort · Boarding pass
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* ---------- Print CTA ---------- */}
      <button
        onClick={() => window.print()}
        className="btn-primary bp-sheen group relative mt-6 inline-flex w-full items-center justify-center gap-2 overflow-hidden py-3.5 text-base transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-600/30 no-print"
      >
        <Printer size={16} />
        Print {passengers.length > 1 ? "all boarding passes" : "boarding pass"}
      </button>

      <p className="no-print mt-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
        Powered by SkyPort · Secure checkout
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 backdrop-blur">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-100">
        {icon}
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
    </div>
  );
}