import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ShieldCheck, UserPlus } from "lucide-react";
import { api, apiErrorMessage } from "../../lib/api";
import Reveal from "../../components/Reveal";
import ErrorState from "../../components/ErrorState";

interface AdminUser { id: string; full_name: string; email: string; role: string; is_active: boolean; }

export default function AdminAdmins() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "FLIGHT_MANAGER" });

  const { data: admins, isLoading, isError, refetch } = useQuery({
    queryKey: ["admins-list"],
    queryFn: async () => (await api.get<{ data: AdminUser[] }>("/admin/admins")).data.data,
  });

  async function toggleActive(id: string, isActive: boolean) {
    try {
      await api.patch(`/admin/admins/${id}/active`, { isActive: !isActive });
      toast.success(isActive ? "Admin disabled." : "Admin re-enabled.");
      qc.invalidateQueries({ queryKey: ["admins-list"] });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/admin/admins", form);
      toast.success("Admin created.");
      setOpen(false);
      setForm({ fullName: "", email: "", password: "", role: "FLIGHT_MANAGER" });
      qc.invalidateQueries({ queryKey: ["admins-list"] });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin accounts</h1>
          <p className="mt-1 text-sm text-slate-400">Staff with access to operations tools.</p>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="btn-primary text-sm"><UserPlus size={16} /> New admin</button>
      </div>

      {open && (
        <Reveal>
          <form onSubmit={handleCreate} className="card mt-4 grid gap-3 p-5 sm:grid-cols-2">
            <input required placeholder="Full name" className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <input required type="email" placeholder="Email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input required type="password" placeholder="Temporary password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="FLIGHT_MANAGER">Flight Manager</option>
              <option value="OPERATIONS_ADMIN">Operations Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            <div className="sm:col-span-2 flex gap-2">
              <button className="btn-primary text-sm">Create admin</button>
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </form>
        </Reveal>
      )}

      {isError && <div className="mt-6"><ErrorState message="Couldn't load admins." onRetry={() => refetch()} /></div>}

      {!isError && (
        <Reveal>
          <div className="card mt-6 overflow-x-auto">
            {isLoading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-6 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />)}
              </div>
            ) : admins?.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-10 text-slate-400"><ShieldCheck size={26} /> No admin accounts yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-slate-400"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
                <tbody>
                  {admins?.map((a) => (
                    <tr key={a.id} className="border-t transition hover:bg-black/[0.02] dark:hover:bg-white/[0.02]" style={{ borderColor: "rgb(var(--border))" }}>
                      <td className="p-3 font-semibold">{a.full_name}</td>
                      <td className="p-3 text-slate-400">{a.email}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                          {a.role.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="p-3">{a.is_active ? <span className="text-emerald-600">Active</span> : <span className="text-red-500">Disabled</span>}</td>
                      <td className="p-3"><button onClick={() => toggleActive(a.id, a.is_active)} className="btn-secondary !py-1 text-xs">{a.is_active ? "Disable" : "Enable"}</button></td>
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