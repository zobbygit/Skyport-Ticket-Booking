import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";
import {
  CalendarDays,
  Mail,
  Search,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { api, apiErrorMessage } from "../../lib/api";
import Reveal from "../../components/Reveal";
import ErrorState from "../../components/ErrorState";

interface Passenger {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminPassengers() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");

  const {
    data: passengers,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-passengers"],
    queryFn: async () =>
      (await api.get<{ data: Passenger[] }>("/admin/passengers")).data.data,
  });

  const filtered = (passengers || []).filter(
    (p) =>
      p.full_name.toLowerCase().includes(query.toLowerCase()) ||
      p.email.toLowerCase().includes(query.toLowerCase())
  );

  async function toggleActive(id: string, isActive: boolean) {
    try {
      await api.patch(`/admin/passengers/${id}/active`, {
        isActive: !isActive,
      });
      toast.success(
        !isActive ? "Passenger reactivated." : "Passenger suspended."
      );
      qc.invalidateQueries({ queryKey: ["admin-passengers"] });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  const total = passengers?.length ?? 0;
  const activeCount = (passengers || []).filter((p) => p.is_active).length;
  const suspendedCount = total - activeCount;

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
            Admin Console · User management
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            <span className="bg-gradient-to-r from-red-500 to-indigo-600 bg-clip-text text-transparent dark:from-red-400 dark:to-indigo-400">
              Passengers
            </span>
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {total} registered account{total === 1 ? "" : "s"}
            {query && (
              <>
                {" "}
                · <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {filtered.length}
                </span>{" "}
                matching
              </>
            )}
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-1.5 sm:w-auto">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              className="input w-full pl-9 pr-9 sm:w-64"
              placeholder="Search name or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Summary chips ---------- */}
      {!isLoading && total > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <SummaryChip
            icon={<Users size={11} />}
            label="Total"
            value={total}
            tone="slate"
          />
          <SummaryChip
            icon={<ShieldCheck size={11} />}
            label="Active"
            value={activeCount}
            tone="emerald"
          />
          <SummaryChip
            icon={<ShieldOff size={11} />}
            label="Suspended"
            value={suspendedCount}
            tone="red"
          />
        </div>
      )}

      {isError && (
        <div className="mt-6">
          <ErrorState
            message="Couldn't load passengers."
            onRetry={() => refetch()}
          />
        </div>
      )}

      {!isError && (
        <Reveal>
          <div className="card mt-6 overflow-hidden">
            {isLoading ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="ap-fade relative flex items-center gap-4 px-4 py-4"
                  >
                    <div className="ap-sheen pointer-events-none absolute inset-0 opacity-70" />
                    <div className="relative h-10 w-10 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800" />
                    <div className="relative flex-1 space-y-2">
                      <div className="h-3.5 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="h-3 w-56 rounded bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <div className="relative h-6 w-20 rounded-full bg-slate-100 dark:bg-slate-800" />
                    <div className="relative h-7 w-20 rounded-lg bg-slate-100 dark:bg-slate-800" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-600/10 text-red-600 dark:text-red-400">
                  <Users size={20} />
                </span>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {query ? "No matching passengers" : "No passengers yet"}
                </p>
                <p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
                  {query
                    ? `Nothing matched "${query}". Try a different name or email.`
                    : "Passenger accounts will appear here as they register."}
                </p>
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="mt-1 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-red-300 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-red-900/60 dark:hover:text-red-400"
                  >
                    <X size={12} />
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-slate-50/70 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Passenger</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Joined</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => {
                      const initials = p.full_name
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();

                      return (
                        <tr
                          key={p.id}
                          className="group border-t border-slate-200 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/30"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-indigo-600 text-[11px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-950">
                                {initials}
                              </span>
                              <span className="truncate font-semibold text-slate-900 dark:text-white">
                                {p.full_name}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                              <Mail size={12} className="opacity-70" />
                              <span className="truncate">{p.email}</span>
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                              <CalendarDays size={12} className="opacity-70" />
                              <span className="tabular-nums">
                                {format(new Date(p.created_at), "MMM d, yyyy")}
                              </span>
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            {p.is_active ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-700 ring-1 ring-emerald-200/70 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-900/50">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-700 ring-1 ring-red-200/70 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-900/50">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                Suspended
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => toggleActive(p.id, p.is_active)}
                              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition hover:-translate-y-0.5 ${
                                p.is_active
                                  ? "border-red-200 bg-red-50/60 text-red-600 hover:border-red-300 hover:bg-red-50 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-400 dark:hover:border-red-800/80 dark:hover:bg-red-950/40"
                                  : "border-emerald-200 bg-emerald-50/60 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:border-emerald-800/80 dark:hover:bg-emerald-900/40"
                              }`}
                            >
                              {p.is_active ? (
                                <>
                                  <ShieldOff size={12} />
                                  Suspend
                                </>
                              ) : (
                                <>
                                  <ShieldCheck size={12} />
                                  Reactivate
                                </>
                              )}
                            </button>
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
        @keyframes ap-fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ap-sheen {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .ap-fade { animation: ap-fade .35s ease-out both; }

        .ap-sheen {
          background: linear-gradient(
            100deg,
            transparent 20%,
            rgba(148,163,184,.22) 45%,
            rgba(148,163,184,.35) 50%,
            rgba(148,163,184,.22) 55%,
            transparent 80%
          );
          background-size: 200% 100%;
          animation: ap-sheen 1.6s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .ap-fade, .ap-sheen { animation: none !important; }
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
  tone?: "slate" | "emerald" | "red";
}) {
  const toneCls =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50/60 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300"
      : tone === "red"
      ? "border-red-200 bg-red-50/60 text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300"
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