import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight,
  BadgeCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCog,
} from "lucide-react";
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Aurora backdrop — red + indigo */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-red-500/15 blur-3xl dark:bg-red-500/20" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl dark:bg-indigo-500/20" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/10 blur-3xl dark:bg-rose-500/15" />

      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(var(--border)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--border)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 25%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 25%, transparent 75%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Restricted badge */}
        <div className="mb-8 text-center">
          <div className="relative mx-auto grid h-16 w-16 place-items-center">
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-indigo-600 opacity-40 blur-xl" />
            <span className="ad-float absolute -inset-3 rounded-3xl border border-dashed border-red-500/25" />
            <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-indigo-600 text-white shadow-lg shadow-red-600/30 ring-1 ring-white/10">
              <ShieldCheck size={24} />
              <span className="ad-pulse absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-slate-50 dark:ring-slate-950" />
            </span>
          </div>

          <p className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-red-200/70 bg-red-50/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-600 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300">
            <ShieldAlert size={11} />
            Restricted area
          </p>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight">
            Staff{" "}
            <span className="bg-gradient-to-r from-red-500 to-indigo-600 bg-clip-text text-transparent dark:from-red-400 dark:to-indigo-400">
              sign in
            </span>
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            SkyPort operations &amp; administration.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="ad-fade relative overflow-hidden rounded-2xl border border-red-200/60 bg-white/90 p-6 shadow-2xl shadow-red-900/5 backdrop-blur-xl dark:border-red-900/40 dark:bg-slate-950/70 dark:shadow-black/40"
        >
          {/* Corner glow inside the card */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-500/10 blur-3xl dark:bg-red-500/15" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/15" />

          {/* Card header strip */}
          <div className="relative mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-red-500 to-indigo-600 text-white">
                <UserCog size={13} />
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-600 dark:text-slate-300">
                Admin access
              </p>
            </div>

            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300">
              <Lock size={10} />
              Encrypted
            </span>
          </div>

          <div className="relative space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-400">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-500/25 dark:border-slate-800 dark:bg-slate-900/60 dark:text-white dark:focus:border-red-700"
                  type="email"
                  required
                  autoFocus
                  placeholder="you@skypoart.staff"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-400">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-11 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-500/25 dark:border-slate-800 dark:bg-slate-900/60 dark:text-white dark:focus:border-red-700"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition hover:scale-110 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button
            disabled={loading}
            className="ad-sheen group relative mt-5 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-900/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-900/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Signing in…
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={15} />
                Sign in
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            )}
          </button>
        </form>

        {/* Footer trust + passenger login redirect */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500 dark:text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Lock size={11} className="text-red-500" />
            Session audited
          </span>
          <span className="h-3 w-px bg-slate-200 dark:bg-slate-800" />
          <span className="inline-flex items-center gap-1.5">
            <BadgeCheck size={11} className="text-indigo-500" />
            Encrypted
          </span>
          <span className="h-3 w-px bg-slate-200 dark:bg-slate-800" />
          <Link
            to="/login"
            className="inline-flex items-center gap-1 font-semibold text-slate-600 transition hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
          >
            Passenger login
            <ArrowRight size={11} />
          </Link>
        </div>

        <p className="mt-4 text-center text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-600">
          Restricted access · SkyPort staff only
        </p>
      </div>

      {/* Motion */}
      <style>{`
        @keyframes ad-float {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes ad-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(251,191,36,.55); }
          50% { box-shadow: 0 0 0 8px rgba(251,191,36,0); }
        }
        @keyframes ad-sheen {
          from { transform: translateX(-120%); }
          to { transform: translateX(220%); }
        }
        @keyframes ad-fade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ad-float { animation: ad-float 5s ease-in-out infinite; }
        .ad-pulse { animation: ad-pulse 2.4s ease-out infinite; }
        .ad-fade { animation: ad-fade .4s cubic-bezier(.2,.8,.2,1) both; }

        .ad-sheen::after {
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
        .ad-sheen:hover::after {
          animation: ad-sheen .9s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .ad-float, .ad-pulse, .ad-fade, .ad-sheen::after { animation: none !important; }
        }
      `}</style>
    </div>
  );
}