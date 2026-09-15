import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";
import {
  CalendarDays,
  ChevronDown,
  Compass,
  DoorOpen,
  DollarSign,
  Hash,
  MapPinned,
  Plane,
  Plus,
  Search,
  Sparkles,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { api, apiErrorMessage } from "../../lib/api";
import { Airport, Flight, FlightStatus, Gate, Terminal } from "../../types";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorState from "../../components/ErrorState";

const STATUSES: FlightStatus[] = [
  "SCHEDULED",
  "CHECK_IN_OPEN",
  "BOARDING",
  "GATE_CHANGED",
  "DELAYED",
  "DEPARTED",
  "LANDED",
  "CANCELLED",
];

const emptyForm = {
  flightNumber: "",
  airline: "",
  aircraft: "",
  originAirportId: "",
  destinationAirportId: "",
  departureTime: "",
  arrivalTime: "",
  boardingTime: "",
  terminalId: "",
  gateId: "",
  basePrice: "150",
  seatsAvailable: "150",
};

export default function AdminFlights() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const {
    data: flights,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-flights", query],
    queryFn: async () =>
      (
        await api.get<{ data: Flight[] }>(
          `/flights${query ? `?airline=${query}` : ""}`
        )
      ).data.data,
  });

  const { data: airports } = useQuery({
    queryKey: ["airports"],
    queryFn: async () =>
      (await api.get<{ data: Airport[] }>("/airports")).data.data,
  });

  const { data: terminals } = useQuery({
    queryKey: ["terminals", form.originAirportId],
    queryFn: async () =>
      (
        await api.get<{ data: Terminal[] }>(
          `/airports/${form.originAirportId}/terminals`
        )
      ).data.data,
    enabled: !!form.originAirportId,
  });

  const { data: gates } = useQuery({
    queryKey: ["gates", form.terminalId],
    queryFn: async () =>
      (
        await api.get<{ data: Gate[] }>(`/gates/terminal/${form.terminalId}`)
      ).data.data,
    enabled: !!form.terminalId,
  });

  async function updateStatus(id: string, status: string) {
    try {
      await api.patch(`/flights/${id}/status`, { status });
      toast.success("Flight status updated.");
      qc.invalidateQueries({ queryKey: ["admin-flights"] });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (form.originAirportId === form.destinationAirportId) {
      toast.error("Origin and destination must be different airports.");
      return;
    }
    try {
      await api.post("/flights", {
        flight_number: form.flightNumber.toUpperCase(),
        airline: form.airline,
        aircraft: form.aircraft || null,
        origin_airport_id: form.originAirportId,
        destination_airport_id: form.destinationAirportId,
        departure_time: new Date(form.departureTime).toISOString(),
        arrival_time: new Date(form.arrivalTime).toISOString(),
        boarding_time: form.boardingTime
          ? new Date(form.boardingTime).toISOString()
          : null,
        terminal_id: form.terminalId || null,
        gate_id: form.gateId || null,
        base_price: Number(form.basePrice),
        seats_available: Number(form.seatsAvailable),
      });
      toast.success("Flight created.");
      setForm(emptyForm);
      setFormOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-flights"] });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create flight."));
    }
  }

  return (
    <div>
      {/* ---------- Header ---------- */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-500 dark:text-red-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
            </span>
            Admin Console · Fleet operations
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            <span className="bg-gradient-to-r from-red-500 to-indigo-600 bg-clip-text text-transparent dark:from-red-400 dark:to-indigo-400">
              Flights
            </span>
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage schedules, gates, and status updates.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
          <Sparkles size={12} className="text-red-500 dark:text-red-400" />
          {flights?.length ?? "…"} flight{flights?.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* ---------- Toolbar ---------- */}
      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/40 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-1.5 sm:max-w-sm">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              className="input w-full pl-9"
              placeholder="Filter by airline…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {query && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Filtering by airline: <span className="font-semibold">{query}</span>
            </p>
          )}
        </div>

        <button
          onClick={() => setFormOpen((v) => !v)}
          className={`afl-sheen group relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-900/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-900/30 ${
            formOpen
              ? "bg-slate-800 dark:bg-slate-700"
              : "bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600"
          }`}
        >
          {formOpen ? (
            <>
              <X size={15} className="transition-transform group-hover:rotate-90" />
              Close
            </>
          ) : (
            <>
              <Plus size={15} className="transition-transform group-hover:rotate-90" />
              <span className="hidden sm:inline">New flight</span>
              <span className="sm:hidden">New</span>
            </>
          )}
        </button>
      </div>

      {/* ---------- Create form ---------- */}
      {formOpen && (
        <form
          onSubmit={handleCreate}
          className="afl-fade card mt-4 overflow-hidden"
        >
          {/* Form header */}
          <div className="relative flex items-center justify-between border-b border-slate-200/70 bg-gradient-to-r from-red-600/10 via-rose-600/10 to-indigo-600/10 px-4 py-3 dark:border-slate-800/70">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-red-500 to-indigo-600 text-white shadow-md shadow-red-600/20">
                <Plane size={13} />
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-700 dark:text-slate-200">
                New flight
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Close form"
            >
              <X size={15} />
            </button>
          </div>

          <div className="space-y-6 p-4 sm:p-5">
            {/* Flight details */}
            <Section icon={<Ticket size={13} />} title="Flight details">
              <input
                required
                placeholder="Flight number (e.g. SK404)"
                className="input"
                value={form.flightNumber}
                onChange={(e) =>
                  setForm({ ...form, flightNumber: e.target.value })
                }
              />
              <input
                required
                placeholder="Airline"
                className="input"
                value={form.airline}
                onChange={(e) => setForm({ ...form, airline: e.target.value })}
              />
              <input
                placeholder="Aircraft (optional)"
                className="input"
                value={form.aircraft}
                onChange={(e) =>
                  setForm({ ...form, aircraft: e.target.value })
                }
              />
            </Section>

            {/* Route */}
            <Section icon={<MapPinned size={13} />} title="Route">
              <select
                required
                className="input bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                value={form.originAirportId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    originAirportId: e.target.value,
                    terminalId: "",
                    gateId: "",
                  })
                }
              >
                <option
                  value=""
                  className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                >
                  Origin airport
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

              <select
                required
                className="input bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                value={form.destinationAirportId}
                onChange={(e) =>
                  setForm({ ...form, destinationAirportId: e.target.value })
                }
              >
                <option
                  value=""
                  className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                >
                  Destination airport
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
            </Section>

            {/* Timing */}
            <Section icon={<CalendarDays size={13} />} title="Timing">
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Departure
                <input
                  required
                  type="datetime-local"
                  className="input mt-1"
                  value={form.departureTime}
                  onChange={(e) =>
                    setForm({ ...form, departureTime: e.target.value })
                  }
                />
              </label>

              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Arrival
                <input
                  required
                  type="datetime-local"
                  className="input mt-1"
                  value={form.arrivalTime}
                  onChange={(e) =>
                    setForm({ ...form, arrivalTime: e.target.value })
                  }
                />
              </label>

              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Boarding (optional)
                <input
                  type="datetime-local"
                  className="input mt-1"
                  value={form.boardingTime}
                  onChange={(e) =>
                    setForm({ ...form, boardingTime: e.target.value })
                  }
                />
              </label>
            </Section>

            {/* Terminal & gate */}
            <Section icon={<DoorOpen size={13} />} title="Terminal & gate">
              <select
                className="input bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                value={form.terminalId}
                onChange={(e) =>
                  setForm({ ...form, terminalId: e.target.value, gateId: "" })
                }
                disabled={!form.originAirportId}
              >
                <option
                  value=""
                  className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                >
                  Terminal (optional, at origin)
                </option>
                {terminals?.map((t) => (
                  <option
                    key={t.id}
                    value={t.id}
                    className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                  >
                    {t.name}
                  </option>
                ))}
              </select>

              <select
                className="input bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                value={form.gateId}
                onChange={(e) => setForm({ ...form, gateId: e.target.value })}
                disabled={!form.terminalId}
              >
                <option
                  value=""
                  className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                >
                  Gate (optional)
                </option>
                {gates?.map((g) => (
                  <option
                    key={g.id}
                    value={g.id}
                    className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                  >
                    {g.code}
                  </option>
                ))}
              </select>

              <div className="hidden sm:block" />
            </Section>

            {/* Pricing */}
            <Section icon={<DollarSign size={13} />} title="Pricing & seats">
              <div className="relative">
                <DollarSign
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                />
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Base price (USD)"
                  className="input pl-8"
                  value={form.basePrice}
                  onChange={(e) =>
                    setForm({ ...form, basePrice: e.target.value })
                  }
                />
              </div>

              <div className="relative">
                <Users
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                />
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Seats available"
                  className="input pl-8"
                  value={form.seatsAvailable}
                  onChange={(e) =>
                    setForm({ ...form, seatsAvailable: e.target.value })
                  }
                />
              </div>
            </Section>
          </div>

          {/* Form footer */}
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200/70 bg-slate-50/60 px-4 py-3 dark:border-slate-800/70 dark:bg-slate-950/40">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button className="afl-sheen group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-red-900/20 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-900/30">
              <Plus size={14} />
              Create flight
            </button>
          </div>
        </form>
      )}

      {/* ---------- Table ---------- */}
      <div className="card mt-6 overflow-hidden">
        {isError ? (
          <ErrorState
            message="Couldn't load flights."
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50/70 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
                <tr>
                  <th className="px-3 py-3">Flight</th>
                  <th className="px-3 py-3">Route</th>
                  <th className="px-3 py-3">Departure</th>
                  <th className="px-3 py-3">Gate</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Update</th>
                </tr>
              </thead>

              <tbody>
                {flights?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-0">
                      <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-600/10 text-red-600 dark:text-red-400">
                          <Plane size={20} />
                        </span>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          No flights {query ? "match your filter" : "yet"}
                        </p>
                        <p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
                          {query
                            ? "Try a different airline name, or clear the filter."
                            : "Create your first flight to get started."}
                        </p>
                        {!query && (
                          <button
                            onClick={() => setFormOpen(true)}
                            className="afl-sheen group relative mt-2 inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-red-900/20 transition hover:-translate-y-0.5"
                          >
                            <Plus size={14} />
                            Create flight
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}

                {flights?.map((f) => (
                  <tr
                    key={f.id}
                    className="afl-row group border-t border-slate-200 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/30"
                  >
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                        <Hash size={10} className="opacity-60" />
                        {f.flight_number}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums dark:bg-slate-800">
                          {f.origin_airport.iata_code}
                        </span>
                        <Plane
                          size={11}
                          className="rotate-45 text-slate-400 dark:text-slate-500"
                        />
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums dark:bg-slate-800">
                          {f.destination_airport.iata_code}
                        </span>
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <CalendarDays size={12} className="opacity-60" />
                        {format(new Date(f.departure_time), "MMM d, HH:mm")}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      {f.gate?.code ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                          <DoorOpen size={11} />
                          {f.gate.code}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">—</span>
                      )}
                    </td>

                    <td className="px-3 py-3">
                      <StatusBadge status={f.status} />
                    </td>

                    <td className="px-3 py-3">
                      <div className="relative inline-block">
                        <select
                          className="input !py-1.5 !pr-8 text-xs bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                          defaultValue=""
                          onChange={(e) =>
                            e.target.value && updateStatus(f.id, e.target.value)
                          }
                        >
                          <option
                            value=""
                            disabled
                            className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                          >
                            Set status...
                          </option>
                          {STATUSES.map((s) => (
                            <option
                              key={s}
                              value={s}
                              className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                            >
                              {s.replaceAll("_", " ")}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={12}
                          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Motion */}
      <style>{`
        @keyframes afl-fade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes afl-sheen {
          from { transform: translateX(-120%); }
          to { transform: translateX(220%); }
        }

        .afl-fade { animation: afl-fade .35s ease-out both; }

        .afl-sheen::after {
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
        .afl-sheen:hover::after { animation: afl-sheen .9s ease-out; }

        @media (prefers-reduced-motion: reduce) {
          .afl-fade, .afl-sheen::after { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        <span className="grid h-5 w-5 place-items-center rounded-md bg-red-600/10 text-red-600 dark:text-red-400">
          {icon}
        </span>
        {title}
      </p>
      <div className="grid gap-3 sm:grid-cols-3">{children}</div>
    </div>
  );
}