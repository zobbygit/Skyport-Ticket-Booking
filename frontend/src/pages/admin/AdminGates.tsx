import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { DoorOpen } from "lucide-react";
import { api, apiErrorMessage } from "../../lib/api";
import { Airport, Gate, Terminal } from "../../types";
import Reveal from "../../components/Reveal";

const STATUS_DOT: Record<string, string> = {
  AVAILABLE: "bg-emerald-500",
  OCCUPIED: "bg-blue-500",
  MAINTENANCE: "bg-amber-500",
  CLOSED: "bg-red-500",
};

export default function AdminGates() {
  const qc = useQueryClient();
  const [airportId, setAirportId] = useState("");
  const [terminalId, setTerminalId] = useState("");

  const { data: airports } = useQuery({
    queryKey: ["airports"],
    queryFn: async () => (await api.get<{ data: Airport[] }>("/airports")).data.data,
  });

  const { data: terminals } = useQuery({
    queryKey: ["terminals", airportId],
    queryFn: async () => (await api.get<{ data: Terminal[] }>(`/airports/${airportId}/terminals`)).data.data,
    enabled: !!airportId,
  });

  const { data: gates } = useQuery({
    queryKey: ["gates", terminalId],
    queryFn: async () => (await api.get<{ data: Gate[] }>(`/gates/terminal/${terminalId}`)).data.data,
    enabled: !!terminalId,
  });

  async function updateStatus(gateId: string, status: string) {
    try {
      await api.patch(`/gates/${gateId}/status`, { status });
      toast.success("Gate status updated.");
      qc.invalidateQueries({ queryKey: ["gates", terminalId] });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Gates</h1>
      <p className="mt-1 text-sm text-slate-400">Select an airport and terminal to manage gate status.</p>

      <div className="mt-4 flex flex-wrap gap-3">
<select
  className="input w-64 bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
  value={airportId}
  onChange={(e) => {
    setAirportId(e.target.value);
    setTerminalId("");
  }}
>
  <option
    value=""
    className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
  >
    Select airport
  </option>

  {airports?.map((a) => (
    <option
      key={a.id}
      value={a.id}
      className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
    >
      {a.name}
    </option>
  ))}
</select>

<select
  className="input w-48 bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
  value={terminalId}
  onChange={(e) => setTerminalId(e.target.value)}
  disabled={!airportId}
>
  <option
    value=""
    className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
  >
    Select terminal
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


      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {gates?.map((g, i) => (
          <Reveal key={g.id} delay={i * 50}>
            <div className="card p-4 transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold">Gate {g.code}</p>
                <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[g.status] || "bg-slate-400"}`} />
              </div>
        <select
  className="input mt-3 !py-1.5 text-xs bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
  value={g.status}
  onChange={(e) => updateStatus(g.id, e.target.value)}
>
  {["AVAILABLE", "OCCUPIED", "MAINTENANCE", "CLOSED"].map((s) => (
    <option
      key={s}
      value={s}
      className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
    >
      {s}
    </option>
  ))}
</select>
            </div>
          </Reveal>
        ))}
        {terminalId && gates?.length === 0 && (
          <div className="card col-span-full flex flex-col items-center gap-2 p-10 text-slate-400">
            <DoorOpen size={26} /> No gates found for this terminal — add one from the Airports & Maps page.
          </div>
        )}
        {!terminalId && (
          <div className="card col-span-full flex flex-col items-center gap-2 p-10 text-slate-400">
            <DoorOpen size={26} /> Select an airport and terminal above to see its gates.
          </div>
        )}
      </div>
    </div>
  );
}