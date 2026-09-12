import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Plane, PlaneTakeoff, Sparkles } from "lucide-react";
import { api, apiErrorMessage } from "../lib/api";
import { useAuthStore } from "../store/authStore";

function passwordStrength(pw: string): 0 | 1 | 2 | 3 {
  if (pw.length < 8) return 0; // not yet ratable — too short to submit anyway
  let score = 0;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  if (score <= 1) return 1; // Weak
  if (score <= 2) return 2; // Strong
  return 3; // Excellent
}

const STRENGTH_LABEL = ["Too short", "Weak", "Strong", "Excellent"];
const STRENGTH_COLOR = ["bg-slate-300 dark:bg-slate-700", "bg-red-500", "bg-yellow-500", "bg-emerald-500"];
const STRENGTH_TEXT = ["text-slate-400", "text-red-500", "text-yellow-600", "text-emerald-600"];

export default function Register() {
  const navigate = useNavigate();
  const setAccount = useAuthStore((s) => s.setAccount);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(form.password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      setAccount(res.data.data.account, { admin: false, token: res.data.data.accessToken });
      toast.success("Account created — welcome to SkyPort!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create account."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-2 grid min-h-[75vh] max-w-4xl overflow-hidden rounded-3xl shadow-xl shadow-black/5 sm:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 p-10 text-white sm:flex">
        <PlaneTakeoff className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 text-white/10" />
        <div className="pointer-events-none absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

        <Link to="/" className="relative flex items-center gap-2 text-lg font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15"><Plane size={18} /></span>
          SkyPort
        </Link>



        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            <Sparkles size={12} /> Join in seconds
          </span>
          <h2 className="mt-4 text-2xl font-extrabold leading-snug">Book, check in, and<br />board — all here.</h2>
          <p className="mt-3 text-sm text-brand-100">Create an account to save your trips and get real-time flight updates.</p>
        </div>

        <p className="relative text-xs text-brand-200">© {new Date().getFullYear()} SkyPort Airport Services</p>
      </div>



<div className="card flex flex-col justify-center !rounded-none p-8 sm:p-10">
  <div className="mb-8 sm:hidden">
    <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
      <Plane size={20} />
    </span>
  </div>

  <h1 className="text-2xl font-bold tracking-tight">
    Create your account
  </h1>

  <div className="mt-1 min-h-[20px] overflow-hidden">
    <p className="animate-[typing_2.5s_steps(45)_1] whitespace-nowrap border-r-2 border-brand-500 pr-1 text-sm text-slate-500 dark:text-slate-400">
      Book flights and get real-time updates.
    </p>
  </div>

  <form onSubmit={handleSubmit} className="mt-8 space-y-4">
    <div>
      <label className="label">Full name</label>
      <input
        className="input transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
        required
        placeholder="Enter your full name"
        autoFocus
        value={form.fullName}
        onChange={(e) =>
          setForm({ ...form, fullName: e.target.value })
        }
      />
    </div>

    <div>
      <label className="label">Email</label>
      <input
        className="input transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
        type="email"
        required
        placeholder="Enter your Email Id"
        value={form.email}
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
      />
    </div>

    <div>
      <label className="label">Phone (optional)</label>
      <input
        className="input transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
        value={form.phone}
        placeholder="Enter your Phone Number"
        onChange={(e) =>
          setForm({ ...form, phone: e.target.value })
        }
      />
    </div>

    <div>
      <label className="label">Password</label>

      <div className="relative">
        <input
          className="input pr-11 transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          placeholder="Choose a Strong Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {form.password.length > 0 && (
        <div className="mt-2">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((level) => (
              <div
                key={level}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  strength >= level
                    ? STRENGTH_COLOR[strength]
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>

          <div className="mt-1 flex items-center justify-between">
            <p
              className={`text-xs font-semibold ${STRENGTH_TEXT[strength]}`}
            >
              {STRENGTH_LABEL[strength]}
            </p>

            <span className="text-[10px] text-slate-400">
              {form.password.length}/8+
            </span>
          </div>
        </div>
      )}
    </div>

    <button
      className="btn-primary w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-600/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={loading}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Creating account...
        </span>
      ) : (
        <span className="inline-flex items-center justify-center gap-2">
          Sign up
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </span>
      )}
    </button>
  </form>

  <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
    Already have an account?{" "}
    <Link
      to="/login"
      className="font-semibold text-brand-600 transition hover:underline dark:text-brand-400"
    >
      Log in
    </Link>
  </p>

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