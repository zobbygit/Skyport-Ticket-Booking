import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format, formatDistanceToNowStrict } from "date-fns";
import toast from "react-hot-toast";
import {
  CalendarCheck, Luggage, MapPinned, PlaneTakeoff, QrCode,
  Search, Ticket, Timer, X,
} from "lucide-react";
import { api, apiErrorMessage } from "../lib/api";
import { Booking } from "../types";
import StatusBadge from "../components/StatusBadge";
import Reveal from "../components/Reveal";
import { useAuthStore } from "../store/authStore";

type Tab = "upcoming" | "past";

const QUICK_ACTIONS = [
  { to: "/flights", label: "Search flights", icon: Search },
  { to: "/baggage", label: "Track baggage", icon: Luggage },
  { to: "/airport-map", label: "Airport map", icon: MapPinned },
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
      const isPast = new Date(b.flight.departure_time).getTime() < now || b.status === "CANCELLED" || b.status === "COMPLETED";
      (isPast ? past : upcoming).push(b);
    });
    upcoming.sort((a, b) => new Date(a.flight.departure_time).getTime() - new Date(b.flight.departure_time).getTime());
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
    if (!confirm("Request a refund? This will cancel your booking and refund your payment. Allow 5-10 business days.")) return;
    try {
      await api.post(`/payments/booking/${id}/refund`);
      toast.success("Refund initiated. Your booking has been cancelled.");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not process refund. If you paid, contact support."));
    }
  }

  return (
    <div>
      {/* Hero */}
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 p-6 text-white sm:p-8">
          <PlaneTakeoff className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 text-white/10" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

          <p className="relative text-sm font-semibold uppercase tracking-wide text-brand-100">Welcome back</p>
          <h1 className="relative mt-1 text-2xl font-extrabold sm:text-3xl">
            {account?.full_name ? account.full_name.split(" ")[0] : "Traveler"}, here's your trip overview
          </h1>

          <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-extrabold">{upcoming.length}</p>
              <p className="text-sm text-brand-100">Upcoming trips</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-extrabold">{past.length}</p>
              <p className="text-sm text-brand-100">Past / cancelled</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              {nextFlight ? (
                <>
                  <p className="flex items-center gap-1.5 text-lg font-extrabold">
                    <Timer size={16} /> {formatDistanceToNowStrict(new Date(nextFlight.flight.departure_time))}
                  </p>
                  <p className="text-sm text-brand-100">Until {nextFlight.flight.flight_number} departs</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-extrabold">No trip planned</p>
                  <p className="text-sm text-brand-100">Search flights to change that</p>
                </>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Quick actions */}
      <Reveal delay={80}>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="card flex flex-col items-center gap-2 p-4 text-center transition hover:-translate-y-1 hover:shadow-md sm:flex-row sm:justify-center sm:gap-2"
            >
              <a.icon size={18} className="text-brand-600" />
              <span className="text-xs font-semibold sm:text-sm">{a.label}</span>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* Next flight spotlight */}
      {nextFlight && (
        <Reveal delay={120}>
          <div className="card mt-6 overflow-hidden">
            <div className="flex items-center justify-between border-b p-4 text-sm font-semibold text-slate-400" style={{ borderColor: "rgb(var(--border))" }}>
              <span>Next up</span>
              <StatusBadge status={nextFlight.status} />
            </div>
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/30">
                  <Ticket size={20} />
                </span>
                <div>
                  <p className="text-lg font-bold">
                    {nextFlight.flight.origin_airport?.iata_code} → {nextFlight.flight.destination_airport?.iata_code}
                  </p>
                  <p className="text-sm text-slate-400">
                    {nextFlight.flight.flight_number} · {format(new Date(nextFlight.flight.departure_time), "EEE, MMM d · HH:mm")} · Ref {nextFlight.booking_reference}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {nextFlight.status === "CONFIRMED" && (
                  <button onClick={() => handleCheckIn(nextFlight.id)} className="btn-primary text-sm">Check in now</button>
                )}
                {nextFlight.status === "CHECKED_IN" && (
                  <Link to={`/boarding-pass/${nextFlight.id}`} className="btn-primary text-sm"><QrCode size={16} /> View boarding pass</Link>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* Tabs */}
      <div className="mt-8 flex gap-2">
        {(["upcoming", "past"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === t ? "bg-brand-600 text-white shadow-md shadow-brand-600/30" : "border hover:bg-black/5 dark:hover:bg-white/5"}`}
            style={tab === t ? {} : { borderColor: "rgb(var(--border))" }}
          >
            {t === "upcoming" ? `Upcoming (${upcoming.length})` : `Past & cancelled (${past.length})`}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-24 animate-pulse p-5">
              <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}

        {!isLoading && list.length === 0 && (
          <div className="card flex flex-col items-center gap-3 p-10 text-center text-slate-400">
            <CalendarCheck size={28} />
            {tab === "upcoming" ? (
              <p>No upcoming trips yet. <Link to="/flights" className="font-semibold text-brand-600">Search flights</Link> to book your next one.</p>
            ) : (
              <p>Nothing here yet — cancelled and completed trips will show up in this tab.</p>
            )}
          </div>
        )}

        {list.map((b, i) => (
          <Reveal key={b.id} delay={Math.min(i, 6) * 60}>
            <div className="card group flex flex-col justify-between gap-4 p-5 transition hover:shadow-md sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:scale-105 dark:bg-brand-900/30">
                  <Ticket size={18} />
                </span>
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold">{b.flight.flight_number} · {b.flight.origin_airport?.iata_code} → {b.flight.destination_airport?.iata_code}</p>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    {format(new Date(b.flight.departure_time), "EEE, MMM d · HH:mm")} · Ref {b.booking_reference} · {b.cabin_class.replace("_", " ")}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 sm:shrink-0">
                {b.status === "PENDING_PAYMENT" && (
                  <Link to={`/checkout/${b.id}`} className="btn-primary text-sm">
                    💳 Complete payment
                  </Link>
                )}
                {b.status === "CONFIRMED" && (
                  <>
                    <button onClick={() => handleCheckIn(b.id)} className="btn-secondary text-sm">Check in</button>
                    <button
                      onClick={() => handleRefund(b.id)}
                      className="btn-secondary text-sm text-red-500"
                      title="Request refund & cancel"
                    >
                      Refund
                    </button>
                  </>
                )}
                {b.status === "CHECKED_IN" && (
                  <Link to={`/boarding-pass/${b.id}`} className="btn-primary text-sm"><QrCode size={16} /> Boarding pass</Link>
                )}
                {(b.status === "CONFIRMED" || b.status === "CHECKED_IN") && (
                  <button onClick={() => handleCancel(b.id)} className="rounded-xl border p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30" style={{ borderColor: "rgb(var(--border))" }}>
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}