import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { api, apiErrorMessage } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";

export default function AdminLogin() {
  const navigate = useNavigate();
  const setAccount = useAuthStore((s) => s.setAccount);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/admin/login", { email, password });
      setAccount(res.data.data.account, { admin: true, token: res.data.data.accessToken });
      toast.success("Welcome back.");
      navigate("/admin");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not log in."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-lg shadow-black/40 ring-1 ring-white/10">
            <ShieldCheck size={24} />
          </span>
          <h1 className="mt-4 text-2xl font-bold">Staff sign in</h1>
          <p className="text-sm text-slate-400">SkyPort operations &amp; administration.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-400">Email</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:ring-2 focus:ring-brand-500"
              type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-400">Password</label>
            <div className="relative">
              <Lock size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-11 text-sm text-white outline-none transition focus:ring-2 focus:ring-brand-500"
                type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button className="w-full rounded-xl bg-brand-600 py-2.5 font-semibold text-white transition hover:bg-brand-500 hover:-translate-y-0.5 disabled:opacity-50" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">Restricted access — SkyPort staff only.</p>
      </div>
    </div>
  );
}