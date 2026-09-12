import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Plane, PlaneTakeoff, ShieldCheck, Sparkles } from "lucide-react";
import { api, apiErrorMessage } from "../lib/api";
import { useAuthStore } from "../store/authStore";

export default function Login() {
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
      const res = await api.post("/auth/login", { email, password });
      setAccount(res.data.data.account, { admin: false, token: res.data.data.accessToken });
      toast.success(`Welcome back${res.data.data.account.full_name ? `, ${res.data.data.account.full_name.split(" ")[0]}` : ""}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not log in. Check your email and password."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-2 grid min-h-[75vh] max-w-4xl overflow-hidden rounded-3xl shadow-xl shadow-black/5 sm:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 p-10 text-white sm:flex">
        <PlaneTakeoff className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 text-white/10" />
        <div className="pointer-events-none absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

        <Link to="/" className="relative flex items-center gap-2 text-lg font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15"><Plane size={18} /></span>
          SkyPort
        </Link>

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            <Sparkles size={12} /> Real-time travel
          </span>
          <h2 className="mt-4 text-2xl font-extrabold leading-snug">Your whole trip,<br />one calm dashboard.</h2>
          <p className="mt-3 text-sm text-brand-100">Live gate updates, baggage tracking, and boarding passes — all in one place.</p>
        </div>

        <p className="relative text-xs text-brand-200">© {new Date().getFullYear()} SkyPort Airport Services</p>
      </div>




{/* Form panel */}
<div className="card flex flex-col justify-center !rounded-none p-8 sm:p-10">
  <div className="mb-8 sm:hidden">
    <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
      <Plane size={20} />
    </span>
  </div>

  <h1 className="text-2xl font-bold tracking-tight">
    Log in to SkyPort
  </h1>

  <div className="mt-1 min-h-[20px] overflow-hidden">
    <p className="animate-[typing_2.5s_steps(55)_1] whitespace-nowrap border-r-2 border-brand-500 pr-1 text-sm text-slate-500 dark:text-slate-400">
      Manage your bookings and track flights in real time.
    </p>
  </div>

  <form onSubmit={handleSubmit} className="mt-8 space-y-4">
    <div>
      <label className="label">Email</label>

      <input
        className="input transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
        type="email"
        required
        placeholder="Enter your Email Id"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </div>

    <div>
      <label className="label">Password</label>

      <div className="relative">
        <input
          className="input pr-11 transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
          type={showPassword ? "text" : "password"}
          required
          placeholder="Enter your Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>

    <button
      className="btn-primary w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-600/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={loading}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Logging in...
        </span>
      ) : (
        <span className="inline-flex items-center justify-center gap-2">
          Log in
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </span>
      )}
    </button>
  </form>

  <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
    No account?{" "}
    <Link
      to="/register"
      className="font-semibold text-brand-600 transition hover:underline dark:text-brand-400"
    >
      Sign up
    </Link>
  </p>

  <Link
    to="/admin/login"
    className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400 transition-colors hover:text-red-500 dark:hover:text-red-400"
  >
    <ShieldCheck size={13} />
    Staff member? Admin login
  </Link>

  <style>{`
    @keyframes typing {
      from {
        width: 0;
      }
      to {
        width: 100%;
      }
    }
  `}</style>
</div>



    </div>
  );
}