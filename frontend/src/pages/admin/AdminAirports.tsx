import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  BadgeCheck,
  Building2,
  Compass,
  DoorOpen,
  Globe2,
  Hash,
  Info,
  MapPin,
  Plane,
  Plus,
  Sparkles,
  StepForward,
} from "lucide-react";
import { api, apiErrorMessage } from "../../lib/api";
import { Airport, Terminal, Gate } from "../../types";
import Reveal from "../../components/Reveal";
import ErrorState from "../../components/ErrorState";

const MAP_POINT_TYPES = [
  "GATE",
  "CHECKIN",
  "SECURITY",
  "BAGGAGE_BELT",
  "LOUNGE",
  "RESTAURANT",
  "SHOP",
  "RESTROOM",
  "PARKING",
  "INFO_DESK",
  "TRANSPORT",
];

const emptyAirportForm = {
  iataCode: "",
  name: "",
  city: "",
  country: "",
  timezone: "UTC",
  latitude: "",
  longitude: "",
};

interface MapPoint {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
}

export default function AdminAirports() {
  const qc = useQueryClient();

  const [airportForm, setAirportForm] = useState(emptyAirportForm);
  const [selectedAirportId, setSelectedAirportId] = useState("");
  const [terminalForm, setTerminalForm] = useState({ code: "", name: "" });
  const [selectedTerminalId, setSelectedTerminalId] = useState("");
  const [gateCode, setGateCode] = useState("");
  const [mapPointForm, setMapPointForm] = useState({
    type: "GATE",
    label: "",
    x: "10",
    y: "10",
  });

  const {
    data: airports,
    isLoading: airportsLoading,
    isError: airportsError,
    refetch: refetchAirports,
  } = useQuery({
    queryKey: ["airports"],
    queryFn: async () =>
      (await api.get<{ data: Airport[] }>("/airports")).data.data,
  });

  const { data: terminals } = useQuery({
    queryKey: ["terminals", selectedAirportId],
    queryFn: async () =>
      (
        await api.get<{ data: Terminal[] }>(
          `/airports/${selectedAirportId}/terminals`
        )
      ).data.data,
    enabled: !!selectedAirportId,
  });

  const { data: gates } = useQuery({
    queryKey: ["gates", selectedTerminalId],
    queryFn: async () =>
      (
        await api.get<{ data: Gate[] }>(`/gates/terminal/${selectedTerminalId}`)
      ).data.data,
    enabled: !!selectedTerminalId,
  });

  const { data: mapPoints } = useQuery({
    queryKey: ["map-points", selectedAirportId],
    queryFn: async () =>
      (
        await api.get<{ data: MapPoint[] }>(
          `/airports/${selectedAirportId}/map-points`
        )
      ).data.data,
    enabled: !!selectedAirportId,
  });

  const selectedAirport = airports?.find((a) => a.id === selectedAirportId);

  async function createAirport(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/airports", {
        ...airportForm,
        latitude: airportForm.latitude ? Number(airportForm.latitude) : undefined,
        longitude: airportForm.longitude
          ? Number(airportForm.longitude)
          : undefined,
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
      const res = await api.post(
        `/airports/${selectedAirportId}/terminals`,
        terminalForm
      );
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

  const stepsDone = {
    1: !!selectedAirportId,
    2: !!selectedTerminalId,
    3: (gates?.length ?? 0) > 0,
    4: (mapPoints?.length ?? 0) > 0,
  };

  return (
    <div className="space-y-6">
      {/* ---------- Header ---------- */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-500 dark:text-red-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
            </span>
            Admin Console · Infrastructure
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Airports, terminals &amp;{" "}
            <span className="bg-gradient-to-r from-red-500 to-indigo-600 bg-clip-text text-transparent dark:from-red-400 dark:to-indigo-400">
              maps
            </span>
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Build out an airport from the ground up — airport → terminal → gate → map point.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
          <Building2 size={12} className="text-red-500 dark:text-red-400" />
          {airports?.length ?? "…"} airport{airports?.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* ---------- Stepper banner ---------- */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/60 p-3 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/40">
        {[
          { n: 1, label: "Airport" },
          { n: 2, label: "Terminal" },
          { n: 3, label: "Gate" },
          { n: 4, label: "Map point" },
        ].map((s, i) => {
          const done = stepsDone[s.n as 1 | 2 | 3 | 4];
          return (
            <div key={s.n} className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  done
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {done ? <BadgeCheck size={11} /> : <span className="tabular-nums">{s.n}</span>}
                {s.label}
              </span>
              {i < 3 && <StepForward size={11} className="text-slate-300 dark:text-slate-700" />}
            </div>
          );
        })}
      </div>

      {/* ---------- Step 1: Create airport ---------- */}
      <Reveal>
        <form onSubmit={createAirport} className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/70 bg-gradient-to-r from-red-600/10 via-rose-600/10 to-indigo-600/10 px-5 py-3 dark:border-slate-800/70">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-red-500 to-indigo-600 text-[11px] font-bold text-white shadow-md shadow-red-600/20">
                1
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                New airport
              </p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Step 1 of 4
            </span>
          </div>

          <div className="p-5">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <Field icon={<Hash size={13} />} label="IATA code">
                <input
                  required
                  placeholder="e.g. ORD"
                  maxLength={3}
                  className="input uppercase"
                  value={airportForm.iataCode}
                  onChange={(e) =>
                    setAirportForm({ ...airportForm, iataCode: e.target.value })
                  }
                />
              </Field>
              <Field icon={<Building2 size={13} />} label="Name">
                <input
                  required
                  placeholder="O'Hare International"
                  className="input"
                  value={airportForm.name}
                  onChange={(e) =>
                    setAirportForm({ ...airportForm, name: e.target.value })
                  }
                />
              </Field>
              <Field icon={<MapPin size={13} />} label="City">
                <input
                  required
                  placeholder="Chicago"
                  className="input"
                  value={airportForm.city}
                  onChange={(e) =>
                    setAirportForm({ ...airportForm, city: e.target.value })
                  }
                />
              </Field>
              <Field icon={<Globe2 size={13} />} label="Country">
                <input
                  required
                  placeholder="United States"
                  className="input"
                  value={airportForm.country}
                  onChange={(e) =>
                    setAirportForm({ ...airportForm, country: e.target.value })
                  }
                />
              </Field>
              <Field icon={<Info size={13} />} label="Timezone">
                <input
                  placeholder="UTC"
                  className="input"
                  value={airportForm.timezone}
                  onChange={(e) =>
                    setAirportForm({ ...airportForm, timezone: e.target.value })
                  }
                />
              </Field>

              <Field icon={<Compass size={13} />} label="Latitude">
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 41.9742"
                  className="input"
                  value={airportForm.latitude}
                  onChange={(e) =>
                    setAirportForm({ ...airportForm, latitude: e.target.value })
                  }
                />
              </Field>
              <Field icon={<Compass size={13} />} label="Longitude">
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. -87.9073"
                  className="input"
                  value={airportForm.longitude}
                  onChange={(e) =>
                    setAirportForm({ ...airportForm, longitude: e.target.value })
                  }
                />
              </Field>
            </div>

            <div className="mt-3 inline-flex items-start gap-2 rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2 text-xs text-slate-500 dark:border-slate-800/70 dark:bg-slate-950/40 dark:text-slate-400">
              <Info size={13} className="mt-0.5 shrink-0 text-red-500 dark:text-red-400" />
              <p>
                Latitude/longitude are optional but required for the airport to
                appear on the passenger-facing world map.
              </p>
            </div>

            <button className="aap-sheen group relative mt-4 inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-900/20 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-900/30">
              <Plus size={14} className="transition-transform group-hover:rotate-90" />
              Create airport
            </button>
          </div>
        </form>
      </Reveal>

      {/* ---------- Existing airports ---------- */}
      {airportsError ? (
        <ErrorState
          message="Couldn't load airports."
          onRetry={() => refetchAirports()}
        />
      ) : (
        <Reveal delay={60}>
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-red-600/10 text-red-600 dark:text-red-400">
                <Sparkles size={12} />
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Active fleet · Manage an existing airport
              </p>
            </div>

            {airportsLoading ? (
              <div className="flex flex-wrap gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="aap-fade card relative h-16 w-48 overflow-hidden"
                  >
                    <div className="aap-sheen pointer-events-none absolute inset-0 opacity-70" />
                  </div>
                ))}
              </div>
            ) : airports?.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center dark:border-slate-800 dark:bg-slate-950/30">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-600/10 text-red-600 dark:text-red-400">
                  <Plane size={20} />
                </span>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  No airports yet
                </p>
                <p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
                  Create one above to start building out terminals, gates, and maps.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {airports?.map((a) => {
                  const active = selectedAirportId === a.id;
                  return (
                    <button
                      key={a.id}
                      onClick={() => {
                        setSelectedAirportId(a.id);
                        setSelectedTerminalId("");
                      }}
                      className={`group card relative inline-flex items-center gap-2 px-3.5 py-2.5 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                        active
                          ? "border-red-300 bg-red-50/60 ring-2 ring-red-500/30 dark:border-red-900/60 dark:bg-red-950/20"
                          : ""
                      }`}
                    >
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                        {a.iata_code}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {a.city}
                      </span>

                      {!a.latitude && (
                        <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-900/50">
                          no coords
                        </span>
                      )}

                      {active && (
                        <BadgeCheck
                          size={14}
                          className="ml-0.5 text-red-500 dark:text-red-400"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Reveal>
      )}

      {selectedAirport && (
        <Reveal delay={100}>
          <div className="relative overflow-hidden rounded-2xl border border-red-200/60 bg-white/70 p-4 text-sm backdrop-blur dark:border-red-900/40 dark:bg-slate-900/50">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-500/10 blur-3xl dark:bg-red-500/15" />
            <div className="relative flex flex-wrap items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-red-500 to-indigo-600 text-white shadow-md shadow-red-600/20">
                <Building2 size={16} />
              </span>
              <p className="text-slate-700 dark:text-slate-200">
                Now managing{" "}
                <strong className="text-slate-900 dark:text-white">
                  {selectedAirport.name}
                </strong>{" "}
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  ({selectedAirport.iata_code})
                </span>{" "}
                — select a terminal below, or add one.
              </p>
            </div>
          </div>
        </Reveal>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ---------- Step 2: Create terminal ---------- */}
        <Reveal delay={120}>
          <form onSubmit={createTerminal} className="card flex h-full flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200/70 bg-gradient-to-r from-red-600/10 via-rose-600/10 to-indigo-600/10 px-5 py-3 dark:border-slate-800/70">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-red-500 to-indigo-600 text-[11px] font-bold text-white shadow-md shadow-red-600/20">
                  2
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  New terminal
                </p>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Step 2 of 4
              </span>
            </div>

            <div className="flex-1 p-5">
              {!selectedAirportId && (
                <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-amber-200/70 bg-amber-50/70 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-300">
                  <Info size={12} />
                  Select an airport above first.
                </div>
              )}

              {terminals && terminals.length > 0 && (
                <div className="mb-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    Existing terminals
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {terminals.map((t) => {
                      const active = selectedTerminalId === t.id;
                      return (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => setSelectedTerminalId(t.id)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            active
                              ? "border-red-300 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300"
                              : "border-slate-200 text-slate-600 hover:border-red-200 hover:text-red-600 dark:border-slate-800 dark:text-slate-300 dark:hover:border-red-900/60 dark:hover:text-red-400"
                          }`}
                        >
                          {t.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  placeholder="Code (e.g. T1)"
                  className="input"
                  value={terminalForm.code}
                  onChange={(e) =>
                    setTerminalForm({ ...terminalForm, code: e.target.value })
                  }
                />
                <input
                  required
                  placeholder="Name"
                  className="input"
                  value={terminalForm.name}
                  onChange={(e) =>
                    setTerminalForm({ ...terminalForm, name: e.target.value })
                  }
                />
              </div>

              <button
                className="btn-secondary mt-4 text-sm"
                disabled={!selectedAirportId}
              >
                <Plus size={14} /> Add terminal
              </button>
            </div>
          </form>
        </Reveal>

        {/* ---------- Step 3: Create gate ---------- */}
        <Reveal delay={160}>
          <form onSubmit={createGate} className="card flex h-full flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200/70 bg-gradient-to-r from-red-600/10 via-rose-600/10 to-indigo-600/10 px-5 py-3 dark:border-slate-800/70">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-red-500 to-indigo-600 text-[11px] font-bold text-white shadow-md shadow-red-600/20">
                  3
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  New gate
                </p>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Step 3 of 4
              </span>
            </div>

            <div className="flex-1 p-5">
              {!selectedTerminalId && (
                <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-amber-200/70 bg-amber-50/70 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-300">
                  <Info size={12} />
                  Select a terminal above first.
                </div>
              )}

              <div className="flex gap-3">
                <input
                  required
                  placeholder="Gate code (e.g. A12)"
                  className="input"
                  value={gateCode}
                  onChange={(e) => setGateCode(e.target.value)}
                />
                <button
                  className="btn-secondary shrink-0 text-sm"
                  disabled={!selectedTerminalId}
                >
                  <Plus size={14} /> Add gate
                </button>
              </div>

              {gates && gates.length > 0 && (
                <div className="mt-4 rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 dark:border-slate-800/70 dark:bg-slate-950/40">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    Existing gates in this terminal
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {gates.map((g) => (
                      <span
                        key={g.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                      >
                        <DoorOpen size={11} className="opacity-70" />
                        {g.code}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>
        </Reveal>
      </div>

      {/* ---------- Step 4: Create map point ---------- */}
      <Reveal delay={200}>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <form onSubmit={createMapPoint} className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200/70 bg-gradient-to-r from-red-600/10 via-rose-600/10 to-indigo-600/10 px-5 py-3 dark:border-slate-800/70">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-red-500 to-indigo-600 text-[11px] font-bold text-white shadow-md shadow-red-600/20">
                  4
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  New map point
                </p>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Step 4 of 4
              </span>
            </div>

            <div className="p-5">
              {!selectedAirportId && (
                <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-amber-200/70 bg-amber-50/70 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-300">
                  <Info size={12} />
                  Select an airport above first.
                </div>
              )}

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

                <input
                  required
                  placeholder="Label"
                  className="input"
                  value={mapPointForm.label}
                  onChange={(e) =>
                    setMapPointForm({ ...mapPointForm, label: e.target.value })
                  }
                />

                <input
                  required
                  type="number"
                  placeholder="X (0-30)"
                  className="input"
                  value={mapPointForm.x}
                  onChange={(e) =>
                    setMapPointForm({ ...mapPointForm, x: e.target.value })
                  }
                />

                <input
                  required
                  type="number"
                  placeholder="Y (0-50)"
                  className="input"
                  value={mapPointForm.y}
                  onChange={(e) =>
                    setMapPointForm({ ...mapPointForm, y: e.target.value })
                  }
                />
              </div>

              <div className="mt-3 inline-flex items-start gap-2 rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2 text-xs text-slate-500 dark:border-slate-800/70 dark:bg-slate-950/40 dark:text-slate-400">
                <MapPin size={13} className="mt-0.5 shrink-0 text-red-500 dark:text-red-400" />
                <p>
                  Coordinates plot on the same 30×50 grid passengers see on the Airport Map page.
                  {selectedTerminalId
                    ? " Attached to the selected terminal."
                    : " No terminal selected — point will be airport-wide."}
                </p>
              </div>

              <button
                className="aap-sheen group relative mt-4 inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-900/20 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-900/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                disabled={!selectedAirportId}
              >
                <Plus size={14} className="transition-transform group-hover:rotate-90" />
                Add map point
              </button>
            </div>
          </form>

          {/* Live preview */}
          <div className="card flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200/70 bg-gradient-to-r from-red-600/10 via-rose-600/10 to-indigo-600/10 px-5 py-3 dark:border-slate-800/70">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-red-500 to-indigo-600 text-white shadow-md shadow-red-600/20">
                  <Building2 size={13} />
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Live preview
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {mapPoints?.length ?? 0} pins
              </span>
            </div>

            <div className="relative flex-1 p-4">
              {!selectedAirportId ? (
                <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-2 text-center">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-600/10 text-red-600 dark:text-red-400">
                    <Compass size={20} />
                  </span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    No airport selected
                  </p>
                  <p className="max-w-[220px] text-xs text-slate-500 dark:text-slate-400">
                    Select an airport to preview its map and pin layout.
                  </p>
                </div>
              ) : (
                <div className="h-full min-h-[220px] rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 dark:border-slate-800/70 dark:bg-slate-950/40">
                  <svg viewBox="0 0 30 50" className="h-full w-full">
                    <defs>
                      <pattern
                        id="adminMapGrid"
                        width="2"
                        height="2"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 2 0 L 0 0 0 2"
                          fill="none"
                          stroke="rgb(var(--border))"
                          strokeWidth="0.06"
                        />
                      </pattern>
                    </defs>

                    <rect x="0" y="0" width="30" height="50" fill="url(#adminMapGrid)" />
                    <rect
                      x="0"
                      y="0"
                      width="30"
                      height="50"
                      fill="none"
                      stroke="rgb(var(--border))"
                      strokeWidth="0.25"
                      rx="1"
                    />

                    {mapPoints?.map((p) => (
                      <circle
                        key={p.id}
                        cx={p.x}
                        cy={p.y}
                        r="1.3"
                        fill="#dc2626"
                        stroke="white"
                        strokeWidth="0.15"
                      />
                    ))}
                  </svg>
                </div>
              )}
            </div>

            {selectedAirportId && (
              <div className="border-t border-slate-200/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:border-slate-800/70 dark:text-slate-400">
                Pins = map points · 30 × 50 grid
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* Motion */}
      <style>{`
        @keyframes aap-fade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes aap-sheen {
          from { transform: translateX(-120%); }
          to { transform: translateX(220%); }
        }
        @keyframes aap-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,.55); }
          50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        }

        .aap-fade { animation: aap-fade .35s ease-out both; }

        .aap-sheen::after {
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
        .aap-sheen:hover::after { animation: aap-sheen .9s ease-out; }

        @media (prefers-reduced-motion: reduce) {
          .aap-fade, .aap-sheen::after { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        <span className="text-red-500 dark:text-red-400">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  );
}