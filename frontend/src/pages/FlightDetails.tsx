import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useCurrencyStore } from "../store/currencyStore";
import toast from "react-hot-toast";
import {
  Armchair,
  BadgeCheck,
  Check,
  Clock,
  Lock,
  MapPin,
  Minus,
  Plane,
  Plus,
  User,
} from "lucide-react";
import { api, apiErrorMessage } from "../lib/api";
import { Flight } from "../types";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import Reveal from "../components/Reveal";
import { getSocket } from "../lib/socket";
import { useAuthStore } from "../store/authStore";

interface PassengerForm {
  fullName: string;
  passportNumber: string;
  dateOfBirth: string;
}

const emptyPassenger = (): PassengerForm => ({ fullName: "", passportNumber: "", dateOfBirth: "" });

const CABIN_MULTIPLIERS: Record<string, number> = {
  ECONOMY: 1,
  PREMIUM_ECONOMY: 1.4,
  BUSINESS: 2.2,
  FIRST: 3.5,
};

const CABIN_DESCRIPTOR: Record<string, string> = {
  ECONOMY: "Standard seat",
  PREMIUM_ECONOMY: "Extra legroom",
  BUSINESS: "Lie-flat seat",
  FIRST: "Private suite",
};

export default function FlightDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [selectedCabin, setSelectedCabin] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<PassengerForm[]>([emptyPassenger()]);
  const [booking, setBooking] = useState(false);
  const { symbol, rate } = useCurrencyStore();

  const { data: flight, isLoading } = useQuery({
    queryKey: ["flight", id],
    queryFn: async () => (await api.get<{ data: Flight }>(`/flights/${id}`)).data.data,
    enabled: !!id,
  });

  useEffect(() => {
    if (!id) return;
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    socket.emit("subscribe:flight", id);
    const onUpdate = (updated: Flight) => {
      if (updated.id === id) {
        qc.setQueryData(["flight", id], updated);
        toast(`Flight ${updated.flight_number} updated: ${updated.status.replaceAll("_", " ")}`, { icon: "🛫" });
      }
    };
    socket.on("flight:updated", onUpdate);
    return () => {
      socket.emit("unsubscribe:flight", id);
      socket.off("flight:updated", onUpdate);
    };
  }, [id, qc]);

  function addPassenger() {
    if (passengers.length >= 9) return toast.error("Maximum 9 passengers per booking.");
    setPassengers([...passengers, emptyPassenger()]);
  }

  function removePassenger(i: number) {
    if (passengers.length === 1) return;
    setPassengers(passengers.filter((_, idx) => idx !== i));
  }

  function updatePassenger(i: number, field: keyof PassengerForm, value: string) {
    setPassengers(passengers.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  }

  async function handleBook() {
    if (!isAuthenticated) { toast.error("Please log in to book."); navigate("/login"); return; }
    if (!selectedCabin) { toast.error("Select a cabin class first."); return; }
    if (passengers.some((p) => !p.fullName.trim())) {
      toast.error("Please enter full name for every passenger.");
      return;
    }
    setBooking(true);
    try {
      const res = await api.post<{ data: { id: string } }>("/bookings", {
        flightId: id,
        cabinClass: selectedCabin,
        passengers: passengers.map((p) => ({
          fullName: p.fullName,
          passportNumber: p.passportNumber || undefined,
          dateOfBirth: p.dateOfBirth || undefined,
        })),
      });
      toast.success(`${passengers.length} seat${passengers.length > 1 ? "s" : ""} reserved! Complete payment to confirm.`);
      navigate(`/checkout/${res.data.data.id}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not reserve seats."));
    } finally {
      setBooking(false);
    }
  }

  if (isLoading || !flight) return <LoadingSpinner label="Loading flight..." />;

  const totalPrice = selectedCabin
    ? Number(flight.base_price) * CABIN_MULTIPLIERS[selectedCabin] * passengers.length
    : null;

  const seats = flight.seats_available ?? 0;
  const seatTone =
    seats > 20
      ? "bg-emerald-500"
      : seats > 5
      ? "bg-amber-500"
      : "bg-red-500";
  const seatLabel =
    seats > 20 ? "Good availability" : seats > 5 ? "Filling up fast" : "Almost gone";

  const status = (flight.status ?? "").toString().toUpperCase();
  const isLive = status !== "CANCELLED" && status !== "ARRIVED";


  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* ---------- Flight hero ---------- */}
      <Reveal>
        <div className="card overflow-hidden border-slate-200/70 dark:border-slate-800/70">
          <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-950 p-6 text-white sm:p-7">
            {/* Aurora + grid */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-6 h-48 w-48 rounded-full bg-indigo-400/25 blur-3xl" />
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
            <Plane className="fd-float pointer-events-none absolute -right-6 -top-6 h-28 w-28 rotate-12 text-white/10" />

            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-semibold backdrop-blur">
                <Plane size={15} />
                {flight.flight_number}
                <span className="h-3 w-px bg-white/25" />
                <span className="text-brand-100/90">{flight.airline}</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2 py-1 backdrop-blur">
                {isLive && (
                  <span className="relative ml-1 flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  </span>
                )}
                <StatusBadge status={flight.status} />
              </div>
            </div>

            {/* Route block */}
            <div className="relative mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div>
                <p className="text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl">
                  {flight.origin_airport.iata_code}
                </p>
                <p className="mt-1 text-sm text-brand-100/90">
                  {flight.origin_airport.city}
                </p>
                <p className="mt-2 text-xs text-brand-100/80">
                  {format(new Date(flight.departure_time), "EEE, MMM d · HH:mm")}
                </p>
              </div>

              <div className="flex flex-col items-center gap-1.5 px-1">
                <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                <span className="fd-path h-px w-16 bg-gradient-to-r from-white/30 via-white/70 to-white/30 sm:w-24" />
                <Plane size={14} className="text-white/70" />
                <span className="fd-path h-px w-16 bg-gradient-to-r from-white/30 via-white/70 to-white/30 sm:w-24" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
              </div>

              <div className="text-right">
                <p className="text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl">
                  {flight.destination_airport.iata_code}
                </p>
                <p className="mt-1 text-sm text-brand-100/90">
                  {flight.destination_airport.city}
                </p>
                <p className="mt-2 text-xs text-brand-100/80">
                  {format(new Date(flight.arrival_time), "EEE, MMM d · HH:mm")}
                </p>
              </div>
            </div>
          </div>

          {/* Info strip */}
          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
            <InfoTile
              icon={<MapPin size={15} />}
              label="Terminal"
              value={flight.terminal ? flight.terminal.code : "TBD"}
            />
            <InfoTile
              icon={<Armchair size={15} />}
              label="Gate"
              value={flight.gate?.code || "TBD"}
            />
            <InfoTile
              icon={<Clock size={15} />}
              label="Boarding"
              value={
                flight.boarding_time
                  ? format(new Date(flight.boarding_time), "HH:mm")
                  : "TBD"
              }
            />
            <InfoTile
              icon={<Plane size={15} />}
              label="Aircraft"
              value={flight.aircraft || "TBD"}
            />
          </div>
        </div>
      </Reveal>

      {/* ---------- Cabin selection ---------- */}
      <Reveal delay={60}>
        <div className="card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold tracking-tight">Select cabin class</p>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Prices per person
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(CABIN_MULTIPLIERS).map(([cabin, mult]) => {
              const selected = selectedCabin === cabin;
              return (
                <button
                  key={cabin}
                  onClick={() => setSelectedCabin(cabin)}
                  className={`group relative overflow-hidden rounded-xl border p-3.5 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                    selected
                      ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/40 dark:border-brand-500 dark:bg-brand-900/30"
                      : "border-slate-200 bg-white hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-brand-900/60"
                  }`}
                >
                  {selected && (
                    <span className="absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full bg-brand-600 text-white">
                      <Check size={11} />
                    </span>
                  )}

                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    {cabin.replace("_", " ")}
                  </p>
                  <p className="mt-1 text-lg font-extrabold tabular-nums text-brand-600 dark:text-brand-400">
           {symbol}{(Number(flight.base_price) * mult * rate).toFixed(0)}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {CABIN_DESCRIPTOR[cabin]}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* ---------- Passengers ---------- */}
      <Reveal delay={100}>
        <div className="card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="font-semibold tracking-tight">Passengers</p>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {passengers.length}
              </span>
            </div>

            <button onClick={addPassenger} className="btn-secondary text-sm">
              <Plus size={14} /> Add passenger
            </button>
          </div>

          <div className="space-y-4">
            {passengers.map((p, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800/80 dark:bg-slate-950/40"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400">
                      <User size={13} />
                    </span>
                    Passenger {i + 1}
                    {i === 0 && (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                        Primary
                      </span>
                    )}
                  </p>

                  {i > 0 && (
                    <button
                      onClick={() => removePassenger(i)}
                      aria-label={`Remove passenger ${i + 1}`}
                      className="grid h-7 w-7 place-items-center rounded-full border border-red-200 text-red-500 transition hover:-translate-y-0.5 hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/30"
                    >
                      <Minus size={14} />
                    </button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="label">Full name *</label>
                    <input
                      className="input"
                      placeholder="As on passport"
                      value={p.fullName}
                      onChange={(e) => updatePassenger(i, "fullName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Passport number</label>
                    <input
                      className="input"
                      placeholder="Optional"
                      value={p.passportNumber}
                      onChange={(e) => updatePassenger(i, "passportNumber", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Date of birth</label>
                    <input
                      className="input"
                      type="date"
                      value={p.dateOfBirth}
                      onChange={(e) => updatePassenger(i, "dateOfBirth", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ---------- Booking summary ---------- */}
      <Reveal delay={140}>
        <div className="card overflow-hidden border-slate-200/70 dark:border-slate-800/70">
          <div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {passengers.length} passenger{passengers.length > 1 ? "s" : ""}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    selectedCabin
                      ? "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {selectedCabin?.replace("_", " ") || "No cabin selected"}
                </span>
              </div>

              {totalPrice ? (
                <p className="mt-3 text-3xl font-extrabold tracking-tight tabular-nums">
                  <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400">
              {symbol}{(totalPrice * rate).toFixed(0)}
                  </span>
                  <span className="ml-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    total
                  </span>
                </p>
              ) : (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  Pick a cabin class to see your total.
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${seatTone}`} />
                  {seats} seat{seats === 1 ? "" : "s"} remaining · {seatLabel}
                </span>
                <span className="hidden h-3.5 w-px bg-slate-200 dark:bg-slate-800 sm:block" />
                <span className="inline-flex items-center gap-1.5">
                  <Lock size={12} />
                  Secure checkout via Stripe
                </span>
              </div>
            </div>

            <button
              onClick={handleBook}
              disabled={!selectedCabin || booking}
              className="btn-primary fd-sheen group relative inline-flex items-center justify-center gap-2 overflow-hidden px-6 py-3.5 text-base transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-600/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {booking ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Reserving…
                </>
              ) : (
                <>
                  <BadgeCheck size={18} />
                  Book {passengers.length > 1 ? `${passengers.length} seats` : "now"}
                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </Reveal>

      {/* Motion */}
      <style>{`
        @keyframes fd-float {
          0%, 100% { transform: translateY(0) rotate(12deg); }
          50% { transform: translateY(-10px) rotate(15deg); }
        }
        @keyframes fd-path {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes fd-sheen {
          from { transform: translateX(-120%); }
          to { transform: translateX(220%); }
        }

        .fd-float { animation: fd-float 6s ease-in-out infinite; }

        .fd-path {
          background-size: 200% 100%;
          animation: fd-path 3s linear infinite;
        }

        .fd-sheen::after {
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
        .fd-sheen:hover::after {
          animation: fd-sheen .9s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .fd-float, .fd-path, .fd-sheen::after {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2.5 dark:border-slate-800/70 dark:bg-slate-950/40">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
          {value}
        </p>
      </div>
    </div>
  );
}