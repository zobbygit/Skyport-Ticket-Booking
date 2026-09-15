import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { MapPin, Plane, Clock, Armchair, Plus, Minus, User } from "lucide-react";
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

export default function FlightDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [selectedCabin, setSelectedCabin] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<PassengerForm[]>([emptyPassenger()]);
  const [booking, setBooking] = useState(false);

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

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Reveal>
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-r from-brand-600 to-indigo-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <Plane size={18} /> {flight.flight_number} · {flight.airline}
              </div>
              <StatusBadge status={flight.status} />
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-4xl font-extrabold">{flight.origin_airport.iata_code}</p>
                <p className="text-sm text-brand-100">{flight.origin_airport.city}</p>
                <p className="mt-1 text-sm">{format(new Date(flight.departure_time), "EEE, MMM d · HH:mm")}</p>
              </div>
              <Plane className="rotate-90 text-white/30" size={32} />
              <div className="text-right">
                <p className="text-4xl font-extrabold">{flight.destination_airport.iata_code}</p>
                <p className="text-sm text-brand-100">{flight.destination_airport.city}</p>
                <p className="mt-1 text-sm">{format(new Date(flight.arrival_time), "EEE, MMM d · HH:mm")}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4 text-sm">
            <div className="flex items-center gap-2"><MapPin size={15} className="text-slate-400" />{flight.terminal ? `Terminal ${flight.terminal.code}` : "TBD"}</div>
            <div className="flex items-center gap-2"><Armchair size={15} className="text-slate-400" />Gate {flight.gate?.code || "TBD"}</div>
            <div className="flex items-center gap-2"><Clock size={15} className="text-slate-400" />{flight.boarding_time ? format(new Date(flight.boarding_time), "HH:mm") : "TBD"} boarding</div>
            <div className="text-slate-400">{flight.aircraft || "Aircraft TBD"}</div>
          </div>
        </div>
      </Reveal>

      {/* Cabin selection */}
      <Reveal delay={60}>
        <div className="card p-5">
          <p className="mb-3 font-semibold">Select cabin class</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(CABIN_MULTIPLIERS).map(([cabin, mult]) => (
              <button
                key={cabin}
                onClick={() => setSelectedCabin(cabin)}
                className={`rounded-xl border p-3 text-left transition hover:-translate-y-0.5 ${selectedCabin === cabin ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30 ring-2 ring-brand-500" : ""}`}
                style={selectedCabin === cabin ? {} : { borderColor: "rgb(var(--border))" }}
              >
                <p className="text-xs font-semibold text-slate-400">{cabin.replace("_", " ")}</p>
                <p className="text-lg font-bold text-brand-600">${(Number(flight.base_price) * mult).toFixed(0)}</p>
                <p className="text-xs text-slate-400">per person</p>
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Passengers */}
      <Reveal delay={100}>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold">Passengers ({passengers.length})</p>
            <button onClick={addPassenger} className="btn-secondary text-sm"><Plus size={14} /> Add passenger</button>
          </div>

          <div className="space-y-4">
            {passengers.map((p, i) => (
              <div key={i} className="rounded-xl border p-4" style={{ borderColor: "rgb(var(--border))" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <User size={14} className="text-brand-600" /> Passenger {i + 1}
                    {i === 0 && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">Primary</span>}
                  </p>
                  {i > 0 && (
                    <button onClick={() => removePassenger(i)} className="text-red-500 hover:text-red-600">
                      <Minus size={16} />
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="label">Full name *</label>
                    <input className="input" placeholder="As on passport" value={p.fullName} onChange={(e) => updatePassenger(i, "fullName", e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Passport number</label>
                    <input className="input" placeholder="Optional" value={p.passportNumber} onChange={(e) => updatePassenger(i, "passportNumber", e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Date of birth</label>
                    <input className="input" type="date" value={p.dateOfBirth} onChange={(e) => updatePassenger(i, "dateOfBirth", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Book button */}
      <Reveal delay={140}>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-slate-400">{passengers.length} passenger{passengers.length > 1 ? "s" : ""} · {selectedCabin?.replace("_", " ") || "No cabin selected"}</p>
              {totalPrice && <p className="text-2xl font-extrabold text-brand-600">Total: ${totalPrice.toFixed(0)}</p>}
            </div>
            <button onClick={handleBook} disabled={!selectedCabin || booking} className="btn-primary px-6 py-3 text-base hover:shadow-lg hover:shadow-brand-600/30 disabled:opacity-50">
              {booking ? "Reserving..." : `Book ${passengers.length > 1 ? `${passengers.length} seats` : "now"} →`}
            </button>
          </div>
          <p className="text-xs text-slate-400">{flight.seats_available} seats remaining · Secure checkout via Stripe</p>
        </div>
      </Reveal>
    </div>
  );
}