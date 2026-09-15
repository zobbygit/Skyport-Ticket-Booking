import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { api } from "../lib/api";
import { Airport } from "../types";
import Reveal from "../components/Reveal";
import WeatherWidget from "../components/WeatherWidget";
import {
  Coffee,
  Compass,
  DoorOpen,
  Globe2,
  Info,
  Layers,
  Luggage,
  MapPinned,
  MousePointerClick,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TicketCheck,
  Train,
  Wine,
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
      {/* ---------- Hero ---------- */}
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-950 p-6 text-white shadow-xl shadow-brand-900/10 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-6 h-48 w-48 rounded-full bg-indigo-400/25 blur-3xl" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.09] dark:opacity-[0.08]"
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
          <MapPinned className="am-float pointer-events-none absolute -right-6 -top-6 h-32 w-32 text-white/10" />

          <div className="relative">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-100">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
              </span>
              <MapPinned size={13} /> Terminal navigation
            </p>

            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Interactive{" "}
              <span className="bg-gradient-to-r from-white via-brand-100 to-indigo-200 bg-clip-text text-transparent">
                airport map
              </span>
            </h1>

            <p className="mt-2 max-w-lg text-sm text-brand-100/90">
              Explore terminals, gates, lounges, and services at airports around the world.
            </p>

            {/* Selector card */}
            <div className="relative mt-5 max-w-md rounded-2xl border border-white/60 bg-white/95 p-3 shadow-2xl shadow-black/20 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/90">
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Choose an airport
              </label>
              <div className="relative">
                <Globe2
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                />
                <select
                  className="input w-full bg-white pl-9 text-slate-900 dark:bg-slate-900 dark:text-white"
                  value={airportId}
                  onChange={(e) => { setAirportId(e.target.value); setSelected(null); }}
                >
                  <option value="" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                    Select an airport
                  </option>
                  {airports?.map((a) => (
                    <option key={a.id} value={a.id} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                      {a.name} ({a.iata_code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ---------- Empty state ---------- */}
      {!airportId && (
        <Reveal delay={80}>
          <div className="relative mx-auto mt-10 flex max-w-md flex-col items-center gap-3 overflow-hidden rounded-3xl border border-slate-200/70 bg-white/60 px-8 py-14 text-center backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/40">
            <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
            <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:ring-brand-900/40">
              <Compass size={24} />
            </span>
            <h3 className="relative text-base font-bold text-slate-800 dark:text-slate-100">
              Pick an airport to begin
            </h3>
            <p className="relative max-w-xs text-sm text-slate-500 dark:text-slate-400">
              Select from the dropdown above to explore its location, live weather, and terminal layout.
            </p>
            <span className="relative inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <MousePointerClick size={12} />
              100+ airports available
            </span>
          </div>
        </Reveal>
      )}

      {/* ---------- World location ---------- */}
      {airportId && activeAirport?.latitude && activeAirport?.longitude && (
        <Reveal>
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400">
                <Globe2 size={15} />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Location
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Where {activeAirport.iata_code} is in the world
                </p>
              </div>
            </div>

            <div className="card relative overflow-hidden p-0" style={{ height: 320 }}>
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

              {/* Corner chip */}
              <div className="pointer-events-none absolute bottom-3 left-3 z-[400] inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/90 dark:text-slate-200 dark:ring-slate-800">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Live map · OpenStreetMap
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                <Sparkles size={11} className="text-brand-600 dark:text-brand-400" />
                Live conditions
              </p>
              <WeatherWidget city={activeAirport.city} iata={activeAirport.iata_code} />
            </div>
          </div>
        </Reveal>
      )}

      {/* ---------- Loading ---------- */}
      {airportId && isLoading && (
        <div className="card relative mt-6 aspect-[4/3] overflow-hidden">
          <div className="am-sheen pointer-events-none absolute inset-0 opacity-70" />
        </div>
      )}

      {/* ---------- Terminal layout ---------- */}
      {airportId && points && (
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400">
              <Layers size={15} />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Terminal layout
              </p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {points.length} point{points.length === 1 ? "" : "s"} across this terminal
              </p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
            <Reveal>
              <div className="card relative aspect-[4/3] overflow-hidden p-4">
                {/* Corner chips */}
                <div className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/90 dark:text-slate-300 dark:ring-slate-800">
                  <Layers size={11} />
                  Terminal map
                </div>
                <div className="pointer-events-none absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/90 dark:text-slate-300 dark:ring-slate-800">
                  <MousePointerClick size={11} />
                  Click a pin
                </div>

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
                    const color = COLORS[p.type] || "#2563eb";
                    return (
                      <g
                        key={p.id}
                        transform={`translate(${p.x}, ${p.y})`}
                        onClick={() => setSelected(p)}
                        className="cursor-pointer"
                      >
                        {isActive && (
                          <>
                            <circle r="2.4" fill={color} opacity="0.15" />
                            <circle
                              r="1.9"
                              fill="none"
                              stroke={color}
                              strokeWidth="0.12"
                              className="am-pin-pulse"
                              style={{ transformOrigin: "center" }}
                            />
                          </>
                        )}
                        <circle
                          r={isActive ? "1.7" : "1.3"}
                          fill={color}
                          stroke="white"
                          strokeWidth="0.15"
                          className="transition-all duration-200"
                        />
                        {isActive && (
                          <g transform="translate(2.2, -1.4)">
                            <rect
                              x="0"
                              y="-0.9"
                              width={Math.max(2.5, p.label.length * 0.6 + 0.6)}
                              height="1.9"
                              rx="0.5"
                              fill={color}
                              opacity="0.95"
                            />
                            <text
                              x="0.35"
                              y="0.4"
                              fontSize="1.05"
                              fill="white"
                              fontWeight="600"
                            >
                              {p.label}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="relative">
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-4 bg-gradient-to-b from-[rgb(var(--bg))] to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-4 bg-gradient-to-t from-[rgb(var(--bg))] to-transparent" />

                <div className="max-h-[520px] space-y-2 overflow-y-auto px-0.5 pr-1">
                  {points.map((p, i) => {
                    const Icon = ICONS[p.type] || Info;
                    const isActive = selected?.id === p.id;
                    const color = COLORS[p.type] || "#94a3b8";
                    return (
                      <Reveal key={p.id} delay={Math.min(i, 8) * 40}>
                        <button
                          onClick={() => setSelected(p)}
                          className={`group card flex w-full items-center gap-3 p-3 text-left text-sm transition-all duration-200 ${
                            isActive
                              ? "border-brand-300 bg-brand-50/40 ring-2 ring-brand-500/40 dark:border-brand-900/60 dark:bg-brand-900/10"
                              : "hover:-translate-y-0.5 hover:shadow-md"
                          }`}
                        >
                          <span
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1"
                            style={{
                              backgroundColor: `${color}1a`,
                              color,
                              // @ts-ignore - CSS var via inline style
                              "--tw-ring-color": `${color}40`,
                            } as React.CSSProperties}
                          >
                            <Icon size={16} />
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-slate-800 dark:text-slate-100">
                              {p.label}
                            </p>
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                              {p.type.replaceAll("_", " ")}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {p.x},{p.y}
                          </span>

                          {isActive && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                          )}
                        </button>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      )}

      {/* Motion */}
      <style>{`
        @keyframes am-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        @keyframes am-sheen {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes am-pin-pulse {
          0% { opacity: .7; transform: scale(1); }
          100% { opacity: 0; transform: scale(2.2); }
        }

        .am-float { animation: am-float 6s ease-in-out infinite; }

        .am-sheen {
          background: linear-gradient(
            100deg,
            transparent 20%,
            rgba(148,163,184,.22) 45%,
            rgba(148,163,184,.35) 50%,
            rgba(148,163,184,.22) 55%,
            transparent 80%
          );
          background-size: 200% 100%;
          animation: am-sheen 1.6s linear infinite;
        }

        .am-pin-pulse {
          transform-box: fill-box;
          animation: am-pin-pulse 1.6s ease-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .am-float, .am-sheen, .am-pin-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}