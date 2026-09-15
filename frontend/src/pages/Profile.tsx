import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  BadgeCheck,
  Camera,
  CreditCard,
  Hash,
  ImageIcon,
  Lock,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { api, apiErrorMessage } from "../lib/api";
import { Account } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Profile() {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get<{ data: Account }>("/users/me")).data.data,
  });
  const [form, setForm] = useState({ fullName: "", phone: "" });
  const [saving, setSaving] = useState(false);

  if (isLoading || !profile) return <LoadingSpinner label="Loading profile..." />;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/users/me", {
        fullName: form.fullName || profile!.full_name,
        phone: form.phone || profile!.phone,
      });
      toast.success("Profile updated.");
      qc.invalidateQueries({ queryKey: ["profile"] });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append("avatar", file);
    try {
      await api.post("/users/me/avatar", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Avatar updated.");
      qc.invalidateQueries({ queryKey: ["profile"] });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not upload avatar."));
    }
  }

  const firstName = profile.full_name
    ? profile.full_name.split(" ")[0]
    : "Traveler";

  const hasChanges = form.fullName !== "" || form.phone !== "";

  return (
    <div className="mx-auto max-w-lg space-y-5">
      {/* ---------- Profile header ---------- */}
      <div className="pf-fade relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-950 p-6 text-white shadow-xl shadow-brand-900/10 sm:p-7">
        <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-indigo-400/25 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.9) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage:
              "radial-gradient(ellipse at center, black 35%, transparent 78%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 35%, transparent 78%)",
          }}
        />
        <UserRound className="pf-float pointer-events-none absolute -right-4 -top-4 h-28 w-28 text-white/10" />

        <div className="relative">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-100">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
            </span>
            Passenger profile
          </p>

          <div className="mt-4 flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-white/15 ring-4 ring-white/20 backdrop-blur">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound size={34} />
                )}
              </div>
              <span className="pf-pulse absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full bg-emerald-400 ring-2 ring-brand-700" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">
                <span className="bg-gradient-to-r from-white via-brand-100 to-indigo-200 bg-clip-text text-transparent">
                  {firstName}
                </span>
              </h1>
              <p className="mt-0.5 truncate text-sm text-brand-100/90">
                {profile.email}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur">
                  <BadgeCheck size={11} />
                  Verified email
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur">
                  <ShieldCheck size={11} />
                  Passenger
                </span>
              </div>
            </div>
          </div>

          {/* Avatar upload */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <label className="group inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15">
              <Camera size={14} />
              Change photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatar}
              />
            </label>

            <span className="inline-flex items-center gap-1.5 text-[11px] text-brand-100/80">
              <ImageIcon size={11} />
              JPG or PNG · Max 2 MB
            </span>
          </div>
        </div>
      </div>

      {/* ---------- Form ---------- */}
      <form
        onSubmit={handleSave}
        className="pf-fade card p-5 sm:p-6"
        style={{ animationDelay: "60ms" }}
      >
        <div className="mb-5 flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400">
            <Sparkles size={15} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Account details
            </p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Edit your information
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <div className="relative">
              <UserRound
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                className="input pl-9 transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
                placeholder={profile.full_name}
                defaultValue={profile.full_name}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                className="input pl-9 pr-9 cursor-not-allowed opacity-60"
                value={profile.email}
                disabled
              />
              <Lock
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              Email cannot be changed from here.
            </p>
          </div>

          <div>
            <label className="label">Phone</label>
            <div className="relative">
              <Phone
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                className="input pl-9 transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
                inputMode="tel"
                placeholder={profile.phone || "Add a phone number"}
                defaultValue={profile.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <button
            className="btn-primary pf-sheen group relative flex-1 overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-600/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            disabled={saving}
          >
            {saving ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving…
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                <Save size={15} />
                Save changes
              </span>
            )}
          </button>

          {hasChanges && (
            <button
              type="button"
              onClick={() => setForm({ fullName: "", phone: "" })}
              className="btn-secondary text-sm"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {/* ---------- Account meta ---------- */}
      <div
        className="pf-fade card p-5 sm:p-6"
        style={{ animationDelay: "120ms" }}
      >
        <div className="mb-4 flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400">
            <ShieldCheck size={15} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Security
            </p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Account overview
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MetaTile
            icon={<Hash size={14} />}
            label="Account ID"
            value={profile.id ? `#${String(profile.id).slice(0, 8)}` : "—"}
            mono
          />
          <MetaTile
            icon={<CreditCard size={14} />}
            label="Plan"
            value="Passenger"
          />
          <MetaTile
            icon={<BadgeCheck size={14} />}
            label="Status"
            value="Active"
            tone="emerald"
          />
        </div>
      </div>

      {/* Motion */}
      <style>{`
        @keyframes pf-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        @keyframes pf-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,.55); }
          50% { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
        }
        @keyframes pf-sheen {
          from { transform: translateX(-120%); }
          to { transform: translateX(220%); }
        }
        @keyframes pf-fade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .pf-float { animation: pf-float 6s ease-in-out infinite; }
        .pf-pulse { animation: pf-pulse 2s ease-out infinite; }
        .pf-fade { animation: pf-fade .4s ease-out both; }

        .pf-sheen::after {
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
        .pf-sheen:hover::after {
          animation: pf-sheen .9s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .pf-float, .pf-pulse, .pf-fade, .pf-sheen::after {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function MetaTile({
  icon,
  label,
  value,
  tone = "slate",
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "slate" | "emerald";
  mono?: boolean;
}) {
  const toneCls =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-900/50"
      : "bg-slate-50 text-slate-700 ring-slate-200/70 dark:bg-slate-950/40 dark:text-slate-200 dark:ring-slate-800/70";

  return (
    <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1 ${toneCls}`}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/70 text-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] opacity-70">
          {label}
        </p>
        <p
          className={`truncate text-sm font-semibold ${
            mono ? "font-mono tracking-tight" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}