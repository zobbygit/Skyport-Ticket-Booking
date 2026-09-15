import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Building2,
  ChevronDown,
  DoorOpen,
  Layers,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { api, apiErrorMessage } from "../../lib/api";
import { Airport, Gate, Terminal } from "../../types";
import Reveal from "../../components/Reveal";

const STATUS_DOT: Record<string, string> = {
  AVAILABLE: "bg-emerald-500",
  OCCUPIED: "bg-blue-500",
  MAINTENANCE: "bg-amber-500",
  CLOSED: "bg-red-500",
};

const STATUS_PILL: Record<
  string,
  { label: string; cls: string; accent: string }
> = {
  AVAILABLE: {
    label: "Available",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-900/50",
    accent: "from-emerald-500 to-teal-500",
  },
  OCCUPIED: {
    label: "Occupied",
    cls: "bg-blue-50 text-blue-700 ring-blue-200/70 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-900/50",
    accent: "from-blue-500 to-indigo-500",
  },
  MAINTENANCE: {
    label: "Maintenance",
    cls: "bg-amber-50 text-amber-700 ring-amber-200/70 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-900/50",
    accent: "from-amber-500 to-orange-500",
  },
  CLOSED: {
    label: "Closed",
    cls: "bg-red-50 text-red-700 ring-red-200/70 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-900/50",
    accent: "from-red-500 to-rose-500",
  },
};

const STATUSES = ["AVAILABLE", "OCCUPIED", "MAINTENANCE", "CLOSED"];

export default function AdminGates() {
  const qc = useQueryClient();
  const [airportId, setAirportId] = useState("");
  const [terminalId, setTerminalId] = useState("");

  const { data: airports } = useQuery({
    queryKey: ["airports"],
    queryFn: async () =>
      (await api.get<{ data: Airport[] }>("/airports")).data.data,
  });

  const { data: terminals } = useQuery({
    queryKey: ["terminals", airportId],
    queryFn: async () =>
      (
        await api.get<{ data: Terminal[] }>(
          `/airports/${airportId}/terminals`
        )
      ).data.data,
    enabled: !!airportId,
  });

  const { data: gates, isLoading: gatesLoading } = useQuery({
    queryKey: ["gates", terminalId],
    queryFn: async () =>
      (await api.get<{ data: Gate[] }>(`/gates/terminal/${terminalId}`)).data
        .data,
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

  const canReset = !!airportId || !!terminalId;

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
            Admin Console · Gate control
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            <span className="bg-gradient-to-r from-red-500 to-indigo-600 bg-clip-text text-transparent dark:from-red-400 dark:to-indigo-400">
              Gates
            </span>
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Select an airport and terminal to manage gate status.
          </p>
        </div>

        {terminalId && (
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
            <Sparkles size={12} className="text-red-500 dark:text-red-400" />
            {gates?.length ?? "…"} gate{gates?.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {/* ---------- Selector ---------- */}
      <div className="mt-5 rounded-2xl border border-slate-200/70 bg-white/70 p-4 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/40">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-red-500 to-indigo-600 text-white shadow-md shadow-red-600/20">
              <DoorOpen size={13} />
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Filter by airport and terminal
            </p>
          </div>

          {canReset && (
            <button
              type="button"
              onClick={() => {
                setAirportId("");
                setTerminalId("");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:border-red-300 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-red-900/60 dark:hover:text-red-400"
            >
              <RotateCcw size={11} />
              Reset
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <Building2
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <select
              className="input w-full bg-white pl-9 text-slate-900 dark:bg-slate-900 dark:text-white"
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
          </div>

          <div className="relative">
            <Layers
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <select
              className="input w-full bg-white pl-9 text-slate-900 dark:bg-slate-900 dark:text-white"
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
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-200/70 pt-3 text-[11px] dark:border-slate-800/70">
          {STATUSES.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400"
            >
              <span
                className={`h-2 w-2 rounded-full ring-2 ring-white dark:ring-slate-950 ${
                  STATUS_DOT[s] || "bg-slate-400"
                }`}
              />
              {STATUS_PILL[s]?.label || s}
            </span>
          ))}
        </div>
      </div>

      {/* ---------- Gates grid ---------- */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {terminalId && gatesLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aga-fade card relative h-40 overflow-hidden p-4"
            >
              <div className="aga-sheen pointer-events-none absolute inset-0 opacity-70" />
              <div className="relative space-y-3">
                <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-7 w-20 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-9 w-full rounded-lg bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ))}

        {!gatesLoading &&
          gates?.map((g, i) => {
            const pill = STATUS_PILL[g.status] || STATUS_PILL.AVAILABLE;
            return (
              <Reveal key={g.id} delay={i * 50}>
                <div
                  className="aga-fade group card relative overflow-hidden p-4 transition-all duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl hover:shadow-red-900/5 dark:hover:border-red-900/60"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {/* Corner glow */}
                  <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-red-500/5 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-red-500/10" />

                  <div className="relative flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                        Gate
                      </p>
                      <p className="mt-0.5 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-lg font-bold text-slate-900 dark:bg-slate-800 dark:text-white">
                        {g.code}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ring-1 ${pill.cls}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          STATUS_DOT[g.status] || "bg-slate-400"
                        }`}
                      />
                      {pill.label}
                    </span>
                  </div>

                  <div className="relative mt-4">
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                      Update status
                    </label>
                    <div className="relative">
                      <select
                        className="input w-full !py-1.5 !pr-8 text-xs bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                        value={g.status}
                        onChange={(e) => updateStatus(g.id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option
                            key={s}
                            value={s}
                            className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                          >
                            {s}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={12}
                        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                      />
                    </div>
                  </div>

                  <span
                    className={`pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r ${pill.accent} opacity-60`}
                  />
                </div>
              </Reveal>
            );
          })}

        {!gatesLoading && terminalId && gates?.length === 0 && (
          <div className="col-span-full">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-950/30">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-600/10 text-red-600 dark:text-red-400">
                <DoorOpen size={20} />
              </span>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                No gates in this terminal
              </p>
              <p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
                Add gates for this terminal from the Airports &amp; Maps page.
              </p>
              <Link
                to="/admin/airports"
                className="mt-1 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-red-300 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-red-900/60 dark:hover:text-red-400"
              >
                Go to Airports &amp; Maps
              </Link>
            </div>
          </div>
        )}

        {!terminalId && (
          <div className="col-span-full">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-950/30">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-600/10 text-red-600 dark:text-red-400">
                <DoorOpen size={20} />
              </span>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Select a terminal to view gates
              </p>
              <p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
                Pick an airport and terminal above to see and manage its gates.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Motion */}
      <style>{`
        @keyframes aga-fade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes aga-sheen {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .aga-fade { animation: aga-fade .35s ease-out both; }

        .aga-sheen {
          background: linear-gradient(
            100deg,
            transparent 20%,
            rgba(148,163,184,.22) 45%,
            rgba(148,163,184,.35) 50%,
            rgba(148,163,184,.22) 55%,
            transparent 80%
          );
          background-size: 200% 100%;
          animation: aga-sheen 1.6s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .aga-fade, .aga-sheen { animation: none !important; }
        }
      `}</style>
    </div>
  );
}