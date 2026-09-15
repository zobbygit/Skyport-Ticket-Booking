import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Plane,
  PlaneTakeoff,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
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
    <div className="mx-auto mt-2 grid min-h-[75vh] max-w-4xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-xl shadow-black/5 dark:border-slate-800/70 dark:bg-slate-900 sm:grid-cols-2">
      {/* ---------- Brand panel ---------- */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-950 p-10 text-white sm:flex">
        {/* Aurora glows */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-6 h-48 w-48 rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />

        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.9) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage:
              "radial-gradient(ellipse at center, black 35%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 35%, transparent 75%)",
          }}
        />

        <PlaneTakeoff className="login-float pointer-events-none absolute -right-10 -top-10 h-48 w-48 text-white/10" />

        <Link
          to="/"
          className="group relative flex items-center gap-2 text-lg font-extrabold tracking-tight"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-105">
            <Plane size={18} />
          </span>
          SkyPort
        </Link>

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
            </span>
            Real-time travel
          </span>

          <h2 className="mt-4 text-2xl font-extrabold leading-snug">
            Your whole trip,
            <br />
            <span className="bg-gradient-to-r from-white via-brand-100 to-indigo-200 bg-clip-text text-transparent">
              one calm dashboard.
            </span>
          </h2>

          <p className="mt-3 text-sm text-brand-100/90">
            Live gate updates, baggage tracking, and boarding passes — all in one place.
          </p>

          {/* Feature ticker */}
          <div className="mt-6 h-5 overflow-hidden">
            <div className="login-ticker space-y-5 text-xs font-medium text-brand-100/80">
              <p className="flex items-center gap-2">
                <Sparkles size={12} /> Gate changes pushed the instant they happen
              </p>
              <p className="flex items-center gap-2">
                <Sparkles size={12} /> Baggage location on your wrist, not a board
              </p>
              <p className="flex items-center gap-2">
                <Sparkles size={12} /> Boarding pass ready before you reach the gate
              </p>
            </div>
          </div>

          {/* Mini stats */}
          <div className="mt-8 flex items-center gap-4 text-[11px] text-brand-100/80">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              99.2% on-time alerts
            </span>
            <span className="h-3.5 w-px bg-white/20" />
            <span>180+ airports</span>
          </div>
        </div>

        <p className="relative text-xs text-brand-200/80">
          © {new Date().getFullYear()} SkyPort Airport Services
        </p>
      </div>

      {/* ---------- Form panel ---------- */}
      <div className="card login-fade-up flex flex-col justify-center !rounded-none border-0 p-8 sm:p-10">
        <div className="mb-8 sm:hidden">
          <span className="login-pulse mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
            <Plane size={20} />
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Log in to SkyPort
        </h1>

        <div className="mt-1 min-h-[20px] overflow-hidden">
          <p className="login-typing whitespace-nowrap border-r-2 border-brand-500 pr-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your bookings and track flights in real time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors peer-focus:text-brand-500 dark:text-slate-500"
              />
              <input
                className="input peer pl-9 transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
                type="email"
                required
                placeholder="Enter your Email Id"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                className="input pl-9 pr-11 transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition-all duration-200 hover:scale-110 hover:text-brand-600 dark:hover:text-brand-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            className="btn-primary login-sheen group relative w-full overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-600/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
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

        {/* Divider */}
        <div className="mt-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          or
          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
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
      </div>

      {/* Motion */}
      <style>{`
        @keyframes login-typing {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes login-caret {
          50% { border-color: transparent; }
        }
        @keyframes login-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        @keyframes login-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes login-ticker {
          0%, 28% { transform: translateY(0); }
          33%, 61% { transform: translateY(-20px); }
          66%, 94% { transform: translateY(-40px); }
          100% { transform: translateY(-60px); }
        }
        @keyframes login-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,.45); }
          50% { box-shadow: 0 0 0 12px rgba(99,102,241,0); }
        }
        @keyframes login-sheen {
          from { transform: translateX(-120%); }
          to { transform: translateX(220%); }
        }

        .login-typing {
          display: inline-block;
          animation:
            login-typing 2.4s steps(55, end) 0.2s both,
            login-caret 0.9s step-end 2.6s 3;
          border-right-color: rgb(var(--brand));
        }

        .login-float { animation: login-float 6s ease-in-out infinite; }
        .login-fade-up { animation: login-fade-up 0.5s ease-out both; }
        .login-ticker { animation: login-ticker 9s ease-in-out infinite; }
        .login-pulse { animation: login-pulse 2.4s ease-out infinite; }

        .login-sheen::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            100deg,
            transparent 0%,
            rgba(255,255,255,.35) 45%,
            rgba(255,255,255,.55) 50%,
            rgba(255,255,255,.35) 55%,
            transparent 100%
          );
          transform: translateX(-120%);
          pointer-events: none;
        }
        .login-sheen:hover::after {
          animation: login-sheen 0.9s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .login-typing,
          .login-float,
          .login-fade-up,
          .login-ticker,
          .login-pulse,
          .login-sheen::after {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}