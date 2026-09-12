import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, FileJson, FileText, ScrollText } from "lucide-react";
import { api } from "../../lib/api";
import Reveal from "../../components/Reveal";
import ErrorState from "../../components/ErrorState";

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  actor_type: string;
  created_at: string;
  metadata: Record<string, any>;
  actor_admin?: { full_name: string; email: string };
  actor_user?: { full_name: string; email: string };
}

const ACTION_COLOR: Record<string, string> = {
  PASSENGER_LOGIN:       "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  PASSENGER_REGISTER:    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  ADMIN_LOGIN:           "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  BOOKING_CREATED:       "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  BOOKING_CANCELLED:     "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  BOARDING_PASS_GENERATED:"bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  FLIGHT_CREATED:        "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
  FLIGHT_STATUS_CHANGED: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  FLIGHT_GATE_CHANGED:   "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  AIRPORT_CREATED:       "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  TERMINAL_CREATED:      "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  CREATE_ADMIN:          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  DEACTIVATE_ADMIN:      "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  SUSPEND_PASSENGER:     "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  REACTIVATE_ADMIN:      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  REACTIVATE_PASSENGER:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

const ACTOR_BADGE: Record<string, string> = {
  admin:  "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  user:   "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300",
  system: "bg-slate-100 text-slate-400",
};

const ACTION_FILTERS = [
  { label: "All", value: "" },
  { label: "Logins", value: "LOGIN" },
  { label: "Registrations", value: "REGISTER" },
  { label: "Bookings", value: "BOOKING" },
  { label: "Boarding passes", value: "BOARDING" },
  { label: "Flights", value: "FLIGHT" },
  { label: "Airports", value: "AIRPORT" },
  { label: "Admins", value: "ADMIN" },
];

export default function AdminAuditLog() {
  const [actionFilter, setActionFilter] = useState("");

  const { data: logs, isLoading, isError, refetch } = useQuery({
    queryKey: ["audit-logs", actionFilter],
    queryFn: async () => {
      const q = actionFilter ? `?action=${actionFilter}` : "";
      return (await api.get<{ data: AuditLog[] }>(`/admin/audit-logs${q}`)).data.data;
    },
  });

  function exportJson() {
    const q = actionFilter ? `?action=${actionFilter}` : "";
    window.open(`${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/admin/audit-logs/export/json${q}`, "_blank");
  }

  function exportPdf() {
    const q = actionFilter ? `?action=${actionFilter}` : "";
    window.open(`${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/admin/audit-logs/export/pdf${q}`, "_blank");
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Audit log</h1>
          <p className="mt-1 text-sm text-slate-400">Every action — logins, bookings, flights, airports, admin changes.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportJson} className="btn-secondary text-sm">
            <FileJson size={16} /> Export JSON
          </button>
          <button onClick={exportPdf} className="btn-secondary text-sm">
            <FileText size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Action filter pills */}
      <Reveal>
        <div className="mt-4 flex flex-wrap gap-2">
          {ACTION_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActionFilter(f.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                actionFilter === f.value
                  ? "bg-brand-600 text-white shadow-sm"
                  : "border hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              style={actionFilter === f.value ? {} : { borderColor: "rgb(var(--border))" }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Reveal>

      {isError && <div className="mt-6"><ErrorState message="Couldn't load the audit log." onRetry={() => refetch()} /></div>}

      {!isError && (
        <Reveal>
          <div className="card mt-4 overflow-x-auto">
            {isLoading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-5 animate-pulse rounded" style={{ width: `${60 + (i % 3) * 15}%`, backgroundColor: "rgb(var(--border))" }} />
                ))}
              </div>
            ) : logs?.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-12 text-slate-400">
                <ScrollText size={28} />
                <p>No actions recorded yet.</p>
                <p className="text-xs text-slate-300">Actions appear here once you log in, register, book flights, etc.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b text-left text-slate-400" style={{ borderColor: "rgb(var(--border))" }}>
                  <tr>
                    <th className="p-3">When</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Entity</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs?.map((l) => {
                    const actorName =
                      l.actor_admin?.full_name ||
                      l.actor_user?.full_name ||
                      "System";
                    const actorEmail =
                      l.actor_admin?.email || l.actor_user?.email || "";
                    const details = Object.entries(l.metadata || {})
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" · ");

                    return (
                      <tr
                        key={l.id}
                        className="border-t transition hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                        style={{ borderColor: "rgb(var(--border))" }}
                      >
                        <td className="p-3 text-slate-400 whitespace-nowrap">
                          {format(new Date(l.created_at), "MMM d, HH:mm:ss")}
                        </td>
                        <td className="p-3">
                          <p className="font-medium">{actorName}</p>
                          {actorEmail && <p className="text-xs text-slate-400">{actorEmail}</p>}
                        </td>
                        <td className="p-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${ACTOR_BADGE[l.actor_type] || ACTOR_BADGE.system}`}>
                            {l.actor_type}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${ACTION_COLOR[l.action] || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                            {l.action.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{l.entity_type}</td>
                        <td className="p-3 max-w-[220px] truncate text-xs text-slate-400" title={details}>{details || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Reveal>
      )}
    </div>
  );
}