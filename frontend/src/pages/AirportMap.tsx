import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { api } from "../lib/api";
import { Airport } from "../types";
import Reveal from "../components/Reveal";
import {
  Coffee, DoorOpen, Globe2, Info, Luggage, MapPinned, ShieldCheck,
  ShoppingBag, TicketCheck, Train, Wine,
} from "lucide-react";

interface MapPoint {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
}

const ICONS: Record<string, any> = {
  GATE: DoorOpen, CHECKIN: TicketCheck, SECURITY: ShieldCheck, BAGGAGE_BELT: Luggage,
  LOUNGE: Wine, RESTAURANT: Coffee, SHOP: ShoppingBag, RESTROOM: Info,
  PARKING: Info, INFO_DESK: Info, TRANSPORT: Train,
};

const COLORS: Record<string, string> = {
  GATE: "#2563eb", CHECKIN: "#059669", SECURITY: "#d97706", BAGGAGE_BELT: "#7c3aed",
  LOUNGE: "#db2777", RESTAURANT: "#ea580c", SHOP: "#0891b2", RESTROOM: "#64748b",
  PARKING: "#64748b", INFO_DESK: "#2563eb", TRANSPORT: "#16a34a",
};

// Custom divIcon avoids Leaflet's classic "marker icon 404s under Vite" bug —
// no external PNG assets needed at all.
function airportPin() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:34px;height:34px;border-radius:9999px 9999px 0 9999px;
      background:#2563eb;transform:rotate(45deg);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 10px rgba(37,99,235,0.45);border:2px solid white;
    "></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -30],
  });
}

export default function AirportMap() {
  const [airportId, setAirportId] = useState<string>("");
  const [selected, setSelected] = useState<MapPoint | null>(null);

  const { data: airports } = useQuery({
    queryKey: ["airports"],
    queryFn: async () => (await api.get<{ data: Airport[] }>("/airports")).data.data,
  });

  const { data: points, isLoading } = useQuery({
    queryKey: ["map-points", airportId],
    queryFn: async () => (await api.get<{ data: MapPoint[] }>(`/airports/${airportId}/map-points`)).data.data,
    enabled: !!airportId,
  });

  const activeAirport = airports?.find((a) => a.id === airportId);

  return (
    <div>
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-indigo-800 p-6 text-white sm:p-8">
          <MapPinned className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 text-white/10" />
          <p className="relative flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-100">
            <MapPinned size={14} /> Terminal navigation
          </p>
          <h1 className="relative mt-1 text-2xl font-extrabold sm:text-3xl">Interactive airport map</h1>


          
<select
  className="input relative mt-5 max-w-xs bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
  value={airportId}
  onChange={(e) => {
    setAirportId(e.target.value);
    setSelected(null);
  }}
>
  <option
    value=""
    className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
  >
    Select an airport
  </option>

  {airports?.map((a) => (
    <option
      key={a.id}
      value={a.id}
      className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
    >
      {a.name} ({a.iata_code})
    </option>
  ))}
</select>





        </div>
      </Reveal>

      {!airportId && (
        <div className="mt-16 flex flex-col items-center gap-2 text-center text-slate-400">
          <MapPinned size={28} />
          <p>Choose an airport above to explore its terminal map.</p>
        </div>
      )}

      {airportId && activeAirport?.latitude && activeAirport?.longitude && (
        <Reveal>
          <div className="mt-6">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-400">
              <Globe2 size={16} /> Where {activeAirport.iata_code} is in the world
            </p>
            <div className="card overflow-hidden" style={{ height: 300 }}>
              <MapContainer
                key={activeAirport.id}
                center={[activeAirport.latitude, activeAirport.longitude]}
                zoom={11}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[activeAirport.latitude, activeAirport.longitude]} icon={airportPin()}>
                  <Popup>
                    <strong>{activeAirport.name}</strong><br />
                    {activeAirport.city}, {activeAirport.country}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </Reveal>
      )}

      {airportId && isLoading && (
        <div className="card mt-6 aspect-[4/3] animate-pulse" />
      )}

      {airportId && points && (
        <div className="mt-6">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-400">
            <MapPinned size={16} /> Terminal layout
          </p>
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Reveal>
              <div className="card relative aspect-[4/3] overflow-hidden p-4">
                <svg viewBox="0 0 30 50" className="h-full w-full">
                  <defs>
                    <pattern id="grid" width="2" height="2" patternUnits="userSpaceOnUse">
                      <path d="M 2 0 L 0 0 0 2" fill="none" stroke="rgb(var(--border))" strokeWidth="0.06" />
                    </pattern>
                  </defs>
                  <rect x="0" y="0" width="30" height="50" fill="url(#grid)" />
                  <rect x="0" y="0" width="30" height="50" fill="none" stroke="rgb(var(--border))" strokeWidth="0.25" rx="1" />

                  {points.map((p) => {
                    const isActive = selected?.id === p.id;
                    return (
                      <g key={p.id} transform={`translate(${p.x}, ${p.y})`} onClick={() => setSelected(p)} className="cursor-pointer">
                        {isActive && <circle r="2.4" fill={COLORS[p.type] || "#2563eb"} opacity="0.15" />}
                        <circle r={isActive ? "1.7" : "1.3"} fill={COLORS[p.type] || "#94a3b8"} stroke="white" strokeWidth="0.15" className="transition-all" />
                      </g>
                    );
                  })}
                </svg>
              </div>
            </Reveal>

            <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
              {points.map((p, i) => {
                const Icon = ICONS[p.type] || Info;
                const isActive = selected?.id === p.id;
                return (
                  <Reveal key={p.id} delay={Math.min(i, 8) * 40}>
                    <button
                      onClick={() => setSelected(p)}
                      className={`card flex w-full items-center gap-3 p-3 text-left text-sm transition ${isActive ? "ring-2 ring-brand-500" : "hover:-translate-y-0.5 hover:shadow-md"}`}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: `${COLORS[p.type] || "#94a3b8"}1a`, color: COLORS[p.type] || "#94a3b8" }}>
                        <Icon size={16} />
                      </span>
                      <div>
                        <p className="font-semibold">{p.label}</p>
                        <p className="text-xs text-slate-400">{p.type.replaceAll("_", " ")}</p>
                      </div>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}