import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { Megaphone } from "lucide-react";
import { api, apiErrorMessage } from "../../lib/api";
import Reveal from "../../components/Reveal";
import ErrorState from "../../components/ErrorState";

interface Announcement { id: string; title: string; message: string; severity: string; created_at: string; }

const SEVERITY_STYLE: Record<string, string> = {
  INFO: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  WARNING: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export default function AdminAnnouncements() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", message: "", severity: "INFO" });

  const { data: announcements, isLoading, isError, refetch } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => (await api.get<{ data: Announcement[] }>("/announcements")).data.data,
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/announcements", form);
      toast.success("Announcement published.");
      setForm({ title: "", message: "", severity: "INFO" });
      qc.invalidateQueries({ queryKey: ["announcements"] });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Announcements</h1>
      <p className="mt-1 text-sm text-slate-400">Broadcast a message to passengers at an airport, or system-wide.</p>

      <Reveal>
        <form onSubmit={handleCreate} className="card mt-5 grid gap-3 p-5">
          <input required placeholder="Title" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea required placeholder="Message" rows={3} className="input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <div className="flex flex-wrap items-center gap-3">
      <select
  className="input w-40 bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
  value={form.severity}
  onChange={(e) => setForm({ ...form, severity: e.target.value })}
>
  <option
    value="INFO"
    className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
  >
    Info
  </option>

  <option
    value="WARNING"
    className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
  >
    Warning
  </option>

  <option
    value="CRITICAL"
    className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
  >
    Critical
  </option>
</select>
            <button className="btn-primary text-sm"><Megaphone size={16} /> Publish</button>
          </div>
        </form>
      </Reveal>

      {isError && <div className="mt-6"><ErrorState message="Couldn't load announcements." onRetry={() => refetch()} /></div>}

      {!isError && (
        <div className="mt-6 space-y-2">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-20 animate-pulse p-4" />)}

          {!isLoading && announcements?.length === 0 && (
            <div className="card flex flex-col items-center gap-2 p-10 text-slate-400"><Megaphone size={26} /> No announcements yet.</div>
          )}

          {announcements?.map((a, i) => (
            <Reveal key={a.id} delay={Math.min(i, 6) * 50}>
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{a.title}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${SEVERITY_STYLE[a.severity] || SEVERITY_STYLE.INFO}`}>{a.severity}</span>
                </div>
                <p className="mt-1 text-sm text-slate-400">{a.message}</p>
                <p className="mt-2 text-xs text-slate-400">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</p>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}