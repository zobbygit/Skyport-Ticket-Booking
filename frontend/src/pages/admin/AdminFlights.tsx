import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { api, apiErrorMessage } from "../../lib/api";
import { Airport, Flight, FlightStatus, Gate, Terminal } from "../../types";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorState from "../../components/ErrorState";

const STATUSES: FlightStatus[] = ["SCHEDULED", "CHECK_IN_OPEN", "BOARDING", "GATE_CHANGED", "DELAYED", "DEPARTED", "LANDED", "CANCELLED"];

const emptyForm = {
  flightNumber: "", airline: "", aircraft: "",
  originAirportId: "", destinationAirportId: "",
  departureTime: "", arrivalTime: "", boardingTime: "",
  terminalId: "", gateId: "", basePrice: "150", seatsAvailable: "150",
};

export default function AdminFlights() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: flights, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-flights", query],
    queryFn: async () => (await api.get<{ data: Flight[] }>(`/flights${query ? `?airline=${query}` : ""}`)).data.data,
  });


  const { data: airports } = useQuery({
    queryKey: ["airports"],
    queryFn: async () => (await api.get<{ data: Airport[] }>("/airports")).data.data,
  });

  const { data: terminals } = useQuery({
    queryKey: ["terminals", form.originAirportId],
    queryFn: async () => (await api.get<{ data: Terminal[] }>(`/airports/${form.originAirportId}/terminals`)).data.data,
    enabled: !!form.originAirportId,
  });

  const { data: gates } = useQuery({
    queryKey: ["gates", form.terminalId],
    queryFn: async () => (await api.get<{ data: Gate[] }>(`/gates/terminal/${form.terminalId}`)).data.data,
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
        boarding_time: form.boardingTime ? new Date(form.boardingTime).toISOString() : null,
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
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <h1 className="text-2xl font-bold">Flights</h1>

  <div className="flex w-full gap-2 sm:w-auto">
    <input
      className="input min-w-0 flex-1 sm:w-56 sm:flex-none"
      placeholder="Filter by airline..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />

    <button
      onClick={() => setFormOpen((v) => !v)}
      className="btn-primary shrink-0 text-sm"
    >
      <Plus size={16} />
      <span className="hidden sm:inline">New flight</span>
      <span className="sm:hidden">New</span>
    </button>
  </div>
</div>

      {formOpen && (
        <form onSubmit={handleCreate} className="card mt-4 grid gap-3 p-4 sm:grid-cols-3">
          <input required placeholder="Flight number (e.g. SK404)" className="input" value={form.flightNumber} onChange={(e) => setForm({ ...form, flightNumber: e.target.value })} />
          <input required placeholder="Airline" className="input" value={form.airline} onChange={(e) => setForm({ ...form, airline: e.target.value })} />
          <input placeholder="Aircraft (optional)" className="input" value={form.aircraft} onChange={(e) => setForm({ ...form, aircraft: e.target.value })} />

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


          <div />

          <label className="text-xs text-slate-400">
            Departure
            <input required type="datetime-local" className="input mt-1" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} />
          </label>
          <label className="text-xs text-slate-400">
            Arrival
            <input required type="datetime-local" className="input mt-1" value={form.arrivalTime} onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })} />
          </label>
          <label className="text-xs text-slate-400">
            Boarding (optional)
            <input type="datetime-local" className="input mt-1" value={form.boardingTime} onChange={(e) => setForm({ ...form, boardingTime: e.target.value })} />
          </label>

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

          <div />

          <input required type="number" min="0" step="1" placeholder="Base price (USD)" className="input" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
          <input required type="number" min="1" step="1" placeholder="Seats available" className="input" value={form.seatsAvailable} onChange={(e) => setForm({ ...form, seatsAvailable: e.target.value })} />
          <div className="flex gap-2">
            <button className="btn-primary text-sm">Create flight</button>
            <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="card mt-6 overflow-x-auto">
        {isError ? (
          <ErrorState message="Couldn't load flights." onRetry={() => refetch()} />
        ) : isLoading ? <LoadingSpinner /> : (
         <table className="w-full min-w-[760px] text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="p-3">Flight</th><th className="p-3">Route</th><th className="p-3">Departure</th>
                <th className="p-3">Gate</th><th className="p-3">Status</th><th className="p-3">Update</th>
              </tr>
            </thead>
            <tbody>
              {flights?.map((f) => (
                <tr key={f.id} className="border-t" style={{ borderColor: "rgb(var(--border))" }}>
                  <td className="p-3 font-semibold">{f.flight_number}</td>
                  <td className="p-3">{f.origin_airport.iata_code} → {f.destination_airport.iata_code}</td>
                  <td className="p-3">{format(new Date(f.departure_time), "MMM d, HH:mm")}</td>
                  <td className="p-3">{f.gate?.code || "—"}</td>
                  <td className="p-3"><StatusBadge status={f.status} /></td>
                  <td className="p-3">
              <select
  className="input !py-1.5 text-xs bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}