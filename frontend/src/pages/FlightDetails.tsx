import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { MapPin, Plane, Clock, Armchair } from "lucide-react";
import { api, apiErrorMessage } from "../lib/api";
import { Flight } from "../types";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import Reveal from "../components/Reveal";
import { getSocket } from "../lib/socket";
import { useAuthStore } from "../store/authStore";

export default function FlightDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

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

  async function handleBook(cabinClass: string) {
    if (!isAuthenticated) {
      toast.error("Please log in to book a flight.");
      navigate("/login");
      return;
    }
    try {
      const res = await api.post<{ data: { id: string } }>("/bookings", {
        flightId: id,
        cabinClass,
      });
      const bookingId = res.data.data.id;
      toast.success("Seat reserved! Complete payment to confirm.");
      navigate(`/checkout/${bookingId}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not reserve seat."));
    }
  }

  if (isLoading || !flight) return <LoadingSpinner label="Loading flight..." />;

  return (
    <div className="mx-auto max-w-3xl">
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

          <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={15} className="text-slate-400" />
              <span>{flight.terminal ? `Terminal ${flight.terminal.code}` : "Terminal TBD"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Armchair size={15} className="text-slate-400" />
              <span>Gate {flight.gate?.code || "TBD"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={15} className="text-slate-400" />
              <span>{flight.boarding_time ? format(new Date(flight.boarding_time), "HH:mm") : "TBD"} boarding</span>
            </div>
            <div className="text-sm text-slate-400">{flight.aircraft || "Aircraft TBD"}</div>
          </div>

          <div className="border-t p-6" style={{ borderColor: "rgb(var(--border))" }}>
            <p className="mb-3 text-sm font-semibold text-slate-400">Select cabin class to book</p>
            <div className="flex flex-wrap gap-3">
              {(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => handleBook(c)}
                  className="card px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-md hover:ring-2 hover:ring-brand-500"
                >
                  <p className="text-xs font-semibold text-slate-400">{c.replace("_", " ")}</p>
                  <p className="text-lg font-bold text-brand-600">
                    ${(
                      Number(flight.base_price) *
                      (c === "PREMIUM_ECONOMY" ? 1.4 : c === "BUSINESS" ? 2.2 : c === "FIRST" ? 3.5 : 1)
                    ).toFixed(0)}
                  </p>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">
              {flight.seats_available} seat{flight.seats_available !== 1 ? "s" : ""} remaining · Secure checkout via Stripe
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}