import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Building2,
  Clock,
  Download,
  Eye,
  FileJson,
  FileText,
  List,
  LogIn,
  Plane,
  QrCode,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserPlus,
  X,
} from "lucide-react";
import { api, apiErrorMessage } from "../../lib/api";
import Reveal from "../../components/Reveal";
import ErrorState from "../../components/ErrorState";
import { toast } from "react-hot-toast";

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
  PASSENGER_LOGIN: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  PASSENGER_REGISTER: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  ADMIN_LOGIN: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  BOOKING_CREATED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  BOOKING_CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  BOARDING_PASS_GENERATED: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  FLIGHT_CREATED: "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
  FLIGHT_STATUS_CHANGED: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  FLIGHT_GATE_CHANGED: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  AIRPORT_CREATED: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  TERMINAL_CREATED: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  CREATE_ADMIN: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  DEACTIVATE_ADMIN: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  SUSPEND_PASSENGER: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  REACTIVATE_ADMIN: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  REACTIVATE_PASSENGER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

const ACTOR_BADGE: Record<string, string> = {
  admin: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  user: "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300",
  system: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

const ACTION_FILTERS = [
  { label: "All", value: "", icon: List },
  { label: "Logins", value: "LOGIN", icon: LogIn },
  { label: "Registrations", value: "REGISTER", icon: UserPlus },
  { label: "Bookings", value: "BOOKING", icon: Ticket },
  { label: "Boarding passes", value: "BOARDING", icon: QrCode },
  { label: "Flights", value: "FLIGHT", icon: Plane },
  { label: "Airports", value: "AIRPORT", icon: Building2 },
  { label: "Admins", value: "ADMIN", icon: ShieldCheck },
];

export default function AdminAuditLog() {
  const [actionFilter, setActionFilter] = useState("");

  const {
    data: logs,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["audit-logs", actionFilter],
    queryFn: async () => {
      const q = actionFilter ? `?action=${actionFilter}` : "";
      return (await api.get<{ data: AuditLog[] }>(`/admin/audit-logs${q}`)).data
        .data;
    },
  });

  const handleExportJson = async () => {
    try {
      const response = await api.get("/admin/audit-logs/export/json");

      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "skyport-audit.json";
      link.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not export audit log."));
    }
  };

  const handleExportPdf = async () => {
    try {
      const response = await api.get("/admin/audit-logs/export/pdf", {
        responseType: "blob",
      });

      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");

      link.href = url;
      link.download = "skyport-audit.pdf";
      link.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not export audit log."));
    }
  };

  const total = logs?.length ?? 0;
  const adminActions = (logs || []).filter((l) => l.actor_type === "admin").length;
  const userActions = (logs || []).filter((l) => l.actor_type === "user").length;
  const activeFilter = ACTION_FILTERS.find((f) => f.value === actionFilter);

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
            Admin Console · Compliance
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            <span className="bg-gradient-to-r from-red-500 to-indigo-600 bg-clip-text text-transparent dark:from-red-400 dark:to-indigo-400">
              Audit log
            </span>
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Every action — logins, bookings, flights, airports, admin changes.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
          <Sparkles size={12} className="text-red-500 dark:text-red-400" />
          {total} event{total === 1 ? "" : "s"}
        </span>
      </div>

      {/* ---------- Summary chips ---------- */}
      {!isLoading && total > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <SummaryChip
            icon={<List size={11} />}
            label="Total"
            value={total}
            tone="slate"
          />
          <SummaryChip
            icon={<ShieldCheck size={11} />}
            label="Admin actions"
            value={adminActions}
            tone="brand"
          />
          <SummaryChip
            icon={<UserPlus size={11} />}
            label="Passenger actions"
            value={userActions}
            tone="emerald"
          />
        </div>
      )}

      {/* ---------- Export toolbar ---------- */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/40">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          Export current view
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50/60 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-red-900/60 dark:hover:bg-red-950/20 dark:hover:text-red-400"
          >
            <FileJson size={14} />
            Export JSON
          </button>

          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50/60 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-red-900/60 dark:hover:bg-red-950/20 dark:hover:text-red-400"
          >
            <FileText size={14} />
            Export PDF
          </button>
        </div>
      </div>

      {/* ---------- Filter pills ---------- */}
      <Reveal>
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {ACTION_FILTERS.map((f) => {
              const active = actionFilter === f.value;
              const Icon = f.icon;
              return (
                <button
                  key={f.value}
                  onClick={() => setActionFilter(f.value)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                    active
                      ? "bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 text-white shadow-md shadow-red-900/20"
                      : "border border-slate-200 bg-white/70 text-slate-600 hover:border-red-300 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-red-900/60 dark:hover:text-red-400"
                  }`}
                >
                  <Icon size={11} />
                  {f.label}
                </button>
              );
            })}

            {actionFilter && (
              <button
                type="button"
                onClick={() => setActionFilter("")}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-slate-300 bg-transparent px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:-translate-y-0.5 hover:border-red-300 hover:text-red-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-red-900/60 dark:hover:text-red-400"
              >
                <X size={11} />
                Clear filter
              </button>
            )}
          </div>

          {activeFilter && activeFilter.value && (
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              Showing: <span className="font-semibold">{activeFilter.label}</span> · {total} matching
            </p>
          )}
        </div>
      </Reveal>

      {isError && (
        <div className="mt-6">
          <ErrorState
            message="Couldn't load the audit log."
            onRetry={() => refetch()}
          />
        </div>
      )}

      {/* ---------- Table ---------- */}
      {!isError && (
        <Reveal>
          <div className="card mt-4 overflow-hidden">
            {isLoading ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aal-fade relative flex items-center gap-4 px-4 py-4"
                  >
                    <div className="aal-sheen pointer-events-none absolute inset-0 opacity-70" />
                    <div className="relative h-3 w-24 shrink-0 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="relative h-9 w-9 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800" />
                    <div className="relative flex-1 space-y-2">
                      <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="h-2.5 w-56 rounded bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <div className="relative h-6 w-24 rounded-full bg-slate-100 dark:bg-slate-800" />
                    <div className="relative h-6 w-28 rounded-full bg-slate-100 dark:bg-slate-800" />
                  </div>
                ))}
              </div>
            ) : logs?.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-600/10 text-red-600 dark:text-red-400">
                  <ScrollText size={20} />
                </span>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {actionFilter ? "No matching events" : "No actions recorded yet"}
                </p>
                <p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
                  {actionFilter
                    ? "Try a different filter or clear it to see all events."
                    : "Actions appear here once you log in, register, book flights, etc."}
                </p>
                {actionFilter && (
                  <button
                    onClick={() => setActionFilter("")}
                    className="mt-1 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-red-300 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-red-900/60 dark:hover:text-red-400"
                  >
                    <X size={12} />
                    Clear filter
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-slate-50/70 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">When</th>
                      <th className="px-4 py-3">Actor</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Entity</th>
                      <th className="px-4 py-3">Details</th>
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

                      const initials = actorName
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();

                      return (
                        <tr
                          key={l.id}
                          className="group border-t border-slate-200 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/30"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                              <Clock size={12} className="opacity-60" />
                              <span className="tabular-nums">
                                {format(new Date(l.created_at), "MMM d, HH:mm:ss")}
                              </span>
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-indigo-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
                                {initials}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                                  {actorName}
                                </p>
                                {actorEmail && (
                                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                    {actorEmail}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] capitalize ring-1 ring-inset ${
                                ACTOR_BADGE[l.actor_type] || ACTOR_BADGE.system
                              }`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                              {l.actor_type}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ring-1 ring-inset ${
                                ACTION_COLOR[l.action] ||
                                "bg-slate-100 text-slate-600 ring-slate-200/70 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
                              }`}
                            >
                              {l.action.replaceAll("_", " ")}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                              {l.entity_type}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex max-w-[240px] items-center gap-1.5">
                              <span
                                className="truncate text-xs text-slate-500 dark:text-slate-400"
                                title={details}
                              >
                                {details || "—"}
                              </span>
                              {details && details.length > 40 && (
                                <Eye
                                  size={11}
                                  className="shrink-0 text-slate-400 dark:text-slate-500"
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Reveal>
      )}

      {/* Motion */}
      <style>{`
        @keyframes aal-fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes aal-sheen {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .aal-fade { animation: aal-fade .35s ease-out both; }

        .aal-sheen {
          background: linear-gradient(
            100deg,
            transparent 20%,
            rgba(148,163,184,.22) 45%,
            rgba(148,163,184,.35) 50%,
            rgba(148,163,184,.22) 55%,
            transparent 80%
          );
          background-size: 200% 100%;
          animation: aal-sheen 1.6s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .aal-fade, .aal-sheen { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

function SummaryChip({
  icon,
  label,
  value,
  tone = "slate",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "slate" | "brand" | "emerald";
}) {
  const toneCls =
    tone === "brand"
      ? "border-red-200 bg-red-50/60 text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300"
      : tone === "emerald"
      ? "border-emerald-200 bg-emerald-50/60 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300"
      : "border-slate-200 bg-white/70 text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${toneCls}`}
    >
      {icon}
      {label}
      <span className="tabular-nums">{value}</span>
    </span>
  );
}