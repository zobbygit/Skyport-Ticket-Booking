import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Search, Users } from "lucide-react";
import { api, apiErrorMessage } from "../../lib/api";
import Reveal from "../../components/Reveal";
import ErrorState from "../../components/ErrorState";

interface Passenger { id: string; full_name: string; email: string; phone?: string; is_active: boolean; created_at: string; }

export default function AdminPassengers() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const { data: passengers, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-passengers"],
    queryFn: async () => (await api.get<{ data: Passenger[] }>("/admin/passengers")).data.data,
  });

  const filtered = (passengers || []).filter(
    (p) => p.full_name.toLowerCase().includes(query.toLowerCase()) || p.email.toLowerCase().includes(query.toLowerCase())
  );

  async function toggleActive(id: string, isActive: boolean) {
    try {
      await api.patch(`/admin/passengers/${id}/active`, { isActive: !isActive });
      toast.success(!isActive ? "Passenger reactivated." : "Passenger suspended.");
      qc.invalidateQueries({ queryKey: ["admin-passengers"] });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Passengers</h1>
          <p className="mt-1 text-sm text-slate-400">{passengers?.length ?? 0} registered accounts</p>
        </div>
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input w-64 pl-9" placeholder="Search name or email..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {isError && <div className="mt-6"><ErrorState message="Couldn't load passengers." onRetry={() => refetch()} /></div>}

      {!isError && (
        <Reveal>
          <div className="card mt-6 overflow-x-auto">
            {isLoading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-6 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-10 text-slate-400">
                <Users size={26} /> No passengers match your search.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-slate-400">
                  <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Joined</th><th className="p-3">Status</th><th className="p-3"></th></tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-t transition hover:bg-black/[0.02] dark:hover:bg-white/[0.02]" style={{ borderColor: "rgb(var(--border))" }}>
                      <td className="p-3 font-semibold">{p.full_name}</td>
                      <td className="p-3 text-slate-400">{p.email}</td>
                      <td className="p-3">{format(new Date(p.created_at), "MMM d, yyyy")}</td>
                      <td className="p-3">
                        {p.is_active ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Active</span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">Suspended</span>
                        )}
                      </td>
                      <td className="p-3">
                        <button onClick={() => toggleActive(p.id, p.is_active)} className="btn-secondary !py-1 text-xs">
                          {p.is_active ? "Suspend" : "Reactivate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Reveal>
      )}
    </div>
  );
}