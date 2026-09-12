import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Building2, DoorOpen, Globe2, MapPin, Plane, Plus } from "lucide-react";
import { api, apiErrorMessage } from "../../lib/api";
import { Airport, Terminal, Gate } from "../../types";
import Reveal from "../../components/Reveal";
import ErrorState from "../../components/ErrorState";

const MAP_POINT_TYPES = [
  "GATE", "CHECKIN", "SECURITY", "BAGGAGE_BELT", "LOUNGE",
  "RESTAURANT", "SHOP", "RESTROOM", "PARKING", "INFO_DESK", "TRANSPORT",
];

const emptyAirportForm = { iataCode: "", name: "", city: "", country: "", timezone: "UTC", latitude: "", longitude: "" };

interface MapPoint { id: string; type: string; label: string; x: number; y: number; }

export default function AdminAirports() {
  const qc = useQueryClient();

  const [airportForm, setAirportForm] = useState(emptyAirportForm);
  const [selectedAirportId, setSelectedAirportId] = useState("");
  const [terminalForm, setTerminalForm] = useState({ code: "", name: "" });
  const [selectedTerminalId, setSelectedTerminalId] = useState("");
  const [gateCode, setGateCode] = useState("");
  const [mapPointForm, setMapPointForm] = useState({ type: "GATE", label: "", x: "10", y: "10" });

  const { data: airports, isLoading: airportsLoading, isError: airportsError, refetch: refetchAirports } = useQuery({
    queryKey: ["airports"],
    queryFn: async () => (await api.get<{ data: Airport[] }>("/airports")).data.data,
  });

  const { data: terminals } = useQuery({
    queryKey: ["terminals", selectedAirportId],
    queryFn: async () => (await api.get<{ data: Terminal[] }>(`/airports/${selectedAirportId}/terminals`)).data.data,
    enabled: !!selectedAirportId,
  });

  const { data: gates } = useQuery({
    queryKey: ["gates", selectedTerminalId],
    queryFn: async () => (await api.get<{ data: Gate[] }>(`/gates/terminal/${selectedTerminalId}`)).data.data,
    enabled: !!selectedTerminalId,
  });

  const { data: mapPoints } = useQuery({
    queryKey: ["map-points", selectedAirportId],
    queryFn: async () => (await api.get<{ data: MapPoint[] }>(`/airports/${selectedAirportId}/map-points`)).data.data,
    enabled: !!selectedAirportId,
  });

  const selectedAirport = airports?.find((a) => a.id === selectedAirportId);

  async function createAirport(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/airports", {
        ...airportForm,
        latitude: airportForm.latitude ? Number(airportForm.latitude) : undefined,
        longitude: airportForm.longitude ? Number(airportForm.longitude) : undefined,
      });
      toast.success("Airport created.");
      setAirportForm(emptyAirportForm);
      qc.invalidateQueries({ queryKey: ["airports"] });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function createTerminal(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAirportId) return toast.error("Select an airport first.");
    try {
      const res = await api.post(`/airports/${selectedAirportId}/terminals`, terminalForm);
      toast.success("Terminal created.");
      setTerminalForm({ code: "", name: "" });
      setSelectedTerminalId(res.data.data.id);
      qc.invalidateQueries({ queryKey: ["terminals", selectedAirportId] });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function createGate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTerminalId) return toast.error("Select a terminal first.");
    try {
      await api.post(`/gates/terminal/${selectedTerminalId}`, { code: gateCode });
      toast.success("Gate created.");
      setGateCode("");
      qc.invalidateQueries({ queryKey: ["gates", selectedTerminalId] });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function createMapPoint(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAirportId) return toast.error("Select an airport first.");
    try {
      await api.post(`/airports/${selectedAirportId}/map-points`, {
        terminalId: selectedTerminalId || undefined,
        type: mapPointForm.type,
        label: mapPointForm.label,
        x: Number(mapPointForm.x),
        y: Number(mapPointForm.y),
      });
      toast.success("Map point added.");
      setMapPointForm({ type: "GATE", label: "", x: "10", y: "10" });
      qc.invalidateQueries({ queryKey: ["map-points", selectedAirportId] });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Airports, terminals &amp; maps</h1>
        <p className="mt-1 text-sm text-slate-400">Build out an airport from the ground up — airport → terminal → gate → map point.</p>
      </div>

      {/* Step 1: Create airport */}
      <Reveal>
        <form onSubmit={createAirport} className="card p-5">
          <p className="mb-3 flex items-center gap-2 font-semibold">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">1</span>
            New airport
          </p>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <input required placeholder="IATA (e.g. ORD)" maxLength={3} className="input uppercase" value={airportForm.iataCode} onChange={(e) => setAirportForm({ ...airportForm, iataCode: e.target.value })} />
            <input required placeholder="Name" className="input" value={airportForm.name} onChange={(e) => setAirportForm({ ...airportForm, name: e.target.value })} />
            <input required placeholder="City" className="input" value={airportForm.city} onChange={(e) => setAirportForm({ ...airportForm, city: e.target.value })} />
            <input required placeholder="Country" className="input" value={airportForm.country} onChange={(e) => setAirportForm({ ...airportForm, country: e.target.value })} />
            <input placeholder="Timezone" className="input" value={airportForm.timezone} onChange={(e) => setAirportForm({ ...airportForm, timezone: e.target.value })} />
            <input type="number" step="any" placeholder="Latitude (e.g. 41.9742)" className="input" value={airportForm.latitude} onChange={(e) => setAirportForm({ ...airportForm, latitude: e.target.value })} />
            <input type="number" step="any" placeholder="Longitude (e.g. -87.9073)" className="input" value={airportForm.longitude} onChange={(e) => setAirportForm({ ...airportForm, longitude: e.target.value })} />
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <Globe2 size={12} /> Latitude/longitude are optional but required for the airport to appear on the passenger-facing world map.
          </p>
          <button className="btn-primary mt-3 text-sm"><Plus size={16} /> Create airport</button>
        </form>
      </Reveal>

      {/* Existing airports */}
      {airportsError ? (
        <ErrorState message="Couldn't load airports." onRetry={() => refetchAirports()} />
      ) : (
        <Reveal delay={60}>
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-400">Manage an existing airport</p>
            {airportsLoading ? (
              <div className="flex gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-16 w-48 animate-pulse" />)}</div>
            ) : airports?.length === 0 ? (
              <div className="card flex flex-col items-center gap-2 p-8 text-slate-400"><Plane size={24} /> No airports yet — create one above.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {airports?.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => { setSelectedAirportId(a.id); setSelectedTerminalId(""); }}
                    className={`card flex items-center gap-2 px-4 py-2.5 text-sm transition hover:-translate-y-0.5 hover:shadow-md ${selectedAirportId === a.id ? "ring-2 ring-brand-500" : ""}`}
                  >
                    <span className="font-bold text-brand-600">{a.iata_code}</span>
                    <span className="text-slate-400">{a.city}</span>
                    {!a.latitude && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">no coords</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      )}

      {selectedAirport && (
        <Reveal delay={100}>
          <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-800 p-4 text-sm text-white">
            Now managing <strong>{selectedAirport.name}</strong> ({selectedAirport.iata_code}) — select a terminal below, or add one.
          </div>
        </Reveal>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Step 2: Create terminal */}
        <Reveal delay={120}>
          <form onSubmit={createTerminal} className="card h-full p-5">
            <p className="mb-3 flex items-center gap-2 font-semibold">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">2</span>
              New terminal
            </p>
            {!selectedAirportId && <p className="mb-3 text-xs text-amber-600">Select an airport above first.</p>}
            {terminals && terminals.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {terminals.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setSelectedTerminalId(t.id)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${selectedTerminalId === t.id ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30" : ""}`}
                    style={selectedTerminalId === t.id ? {} : { borderColor: "rgb(var(--border))" }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <input required placeholder="Code (e.g. T1)" className="input" value={terminalForm.code} onChange={(e) => setTerminalForm({ ...terminalForm, code: e.target.value })} />
              <input required placeholder="Name" className="input" value={terminalForm.name} onChange={(e) => setTerminalForm({ ...terminalForm, name: e.target.value })} />
            </div>
            <button className="btn-secondary mt-3 text-sm" disabled={!selectedAirportId}><Plus size={16} /> Add terminal</button>
          </form>
        </Reveal>

        {/* Step 3: Create gate */}
        <Reveal delay={160}>
          <form onSubmit={createGate} className="card h-full p-5">
            <p className="mb-3 flex items-center gap-2 font-semibold">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">3</span>
              New gate
            </p>
            {!selectedTerminalId && <p className="mb-3 text-xs text-amber-600">Select a terminal above first.</p>}
            <div className="flex gap-3">
              <input required placeholder="Gate code (e.g. A12)" className="input" value={gateCode} onChange={(e) => setGateCode(e.target.value)} />
              <button className="btn-secondary shrink-0 text-sm" disabled={!selectedTerminalId}><Plus size={16} /> Add gate</button>
            </div>
            {gates && gates.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <p className="w-full text-xs text-slate-400">Existing gates in this terminal:</p>
                {gates.map((g) => (
                  <span key={g.id} className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs" style={{ borderColor: "rgb(var(--border))" }}>
                    <DoorOpen size={11} /> {g.code}
                  </span>
                ))}
              </div>
            )}
          </form>
        </Reveal>
      </div>

      {/* Step 4: Create map point */}
      <Reveal delay={200}>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <form onSubmit={createMapPoint} className="card p-5">
            <p className="mb-3 flex items-center gap-2 font-semibold">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">4</span>
              New map point
            </p>
            {!selectedAirportId && <p className="mb-3 text-xs text-amber-600">Select an airport above first.</p>}
            <div className="grid gap-3 sm:grid-cols-2">
            <select
  className="input bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
  value={mapPointForm.type}
  onChange={(e) =>
    setMapPointForm({ ...mapPointForm, type: e.target.value })
  }
>
  {MAP_POINT_TYPES.map((t) => (
    <option
      key={t}
      value={t}
      className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
    >
      {t.replaceAll("_", " ")}
    </option>
  ))}
</select>
              <input required placeholder="Label" className="input" value={mapPointForm.label} onChange={(e) => setMapPointForm({ ...mapPointForm, label: e.target.value })} />
              <input required type="number" placeholder="X (0-30)" className="input" value={mapPointForm.x} onChange={(e) => setMapPointForm({ ...mapPointForm, x: e.target.value })} />
              <input required type="number" placeholder="Y (0-50)" className="input" value={mapPointForm.y} onChange={(e) => setMapPointForm({ ...mapPointForm, y: e.target.value })} />
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin size={12} /> Coordinates plot on the same 30×50 grid passengers see on the Airport Map page.
              {selectedTerminalId ? " Attached to the selected terminal." : " No terminal selected — point will be airport-wide."}
            </p>
            <button className="btn-primary mt-3 text-sm" disabled={!selectedAirportId}><Plus size={16} /> Add map point</button>
          </form>

          {/* Live preview */}
          <div className="card p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-400"><Building2 size={14} /> Live preview</p>
            {!selectedAirportId ? (
              <div className="flex h-full min-h-[180px] items-center justify-center text-sm text-slate-400">Select an airport to preview its map</div>
            ) : (
              <svg viewBox="0 0 30 50" className="h-full w-full">
                <rect x="0" y="0" width="30" height="50" fill="none" stroke="rgb(var(--border))" strokeWidth="0.3" rx="1" />
                {mapPoints?.map((p) => (
                  <circle key={p.id} cx={p.x} cy={p.y} r="1.3" fill="#2563eb" stroke="white" strokeWidth="0.15" />
                ))}
              </svg>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
}