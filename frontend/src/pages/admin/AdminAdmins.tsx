import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Crown,
  KeyRound,
  Mail,
  Plane,
  Settings2,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { api, apiErrorMessage } from "../../lib/api";
import Reveal from "../../components/Reveal";
import ErrorState from "../../components/ErrorState";

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

const ROLE_META: Record<
  string,
  { icon: any; label: string; desc: string }
> = {
  FLIGHT_MANAGER: {
    icon: Plane,
    label: "Flight Manager",
    desc: "Flight schedules, gates, and status updates",
  },
  OPERATIONS_ADMIN: {
    icon: Settings2,
    label: "Operations Admin",
    desc: "Full operational access",
  },
  SUPER_ADMIN: {
    icon: Crown,
    label: "Super Admin",
    desc: "Unrestricted platform access",
  },
};

export default function AdminAdmins() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "FLIGHT_MANAGER",
  });

  const {
    data: admins,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admins-list"],
    queryFn: async () =>
      (await api.get<{ data: AdminUser[] }>("/admin/admins")).data.data,
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
      setForm({
        fullName: "",
        email: "",
        password: "",
        role: "FLIGHT_MANAGER",
      });
      qc.invalidateQueries({ queryKey: ["admins-list"] });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  const total = admins?.length ?? 0;
  const activeCount = (admins || []).filter((a) => a.is_active).length;
  const disabledCount = total - activeCount;
  const activeRole = ROLE_META[form.role] || ROLE_META.FLIGHT_MANAGER;

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
            Admin Console · Access control
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            <span className="bg-gradient-to-r from-red-500 to-indigo-600 bg-clip-text text-transparent dark:from-red-400 dark:to-indigo-400">
              Admin accounts
            </span>
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Staff with access to operations tools.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
            <ShieldCheck size={12} className="text-red-500 dark:text-red-400" />
            {total} staff
          </span>

   <button
  onClick={() => setOpen((v) => !v)}
  className={`
    aa-sheen group relative inline-flex items-center gap-2 overflow-hidden
    rounded-xl px-4 py-2.5 text-sm font-semibold shadow-md
    transition hover:-translate-y-0.5 hover:shadow-lg
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40
    ${
      open
        ? "border border-slate-200 bg-white text-slate-700 shadow-black/5 hover:border-red-300 hover:text-red-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-red-900/60 dark:hover:text-red-400"
        : "bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 text-white shadow-red-900/20 hover:shadow-red-900/30"
    }
  `}
>
  {open ? (
    <>
      <X size={15} className="transition-transform group-hover:rotate-90" />
      Close
    </>
  ) : (
    <>
      <UserPlus size={15} />
      New admin
    </>
  )}
</button>
        </div>
      </div>

      {/* ---------- Summary chips ---------- */}
      {!isLoading && total > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <SummaryChip
            icon={<ShieldCheck size={11} />}
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
            label="Disabled"
            value={disabledCount}
            tone="red"
          />
        </div>
      )}

      {/* ---------- Create form ---------- */}
      {open && (
        <Reveal>
          <form onSubmit={handleCreate} className="aa-fade card mt-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200/70 bg-gradient-to-r from-red-600/10 via-rose-600/10 to-indigo-600/10 px-5 py-3 dark:border-slate-800/70">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-red-500 to-indigo-600 text-white shadow-md shadow-red-600/20">
                  <UserPlus size={13} />
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  New admin account
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600 dark:bg-slate-800 dark:text-slate-300`}
              >
                <activeRole.icon size={10} />
                {activeRole.label}
              </span>
            </div>

            <div className="space-y-3 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="relative">
                  <UserRound
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  />
                  <input
                    required
                    placeholder="Full name"
                    className="input w-full pl-9"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                  />
                </div>

                <div className="relative">
                  <Mail
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email"
                    className="input w-full pl-9"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>

                <div className="relative">
                  <KeyRound
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  />
                  <input
                    required
                    type="password"
                    placeholder="Temporary password"
                    className="input w-full pl-9"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </div>

                <div className="relative">
                  <ShieldCheck
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  />
                  <select
                    className="input w-full bg-white pl-9 pr-8 text-slate-900 dark:bg-slate-900 dark:text-white"
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value })
                    }
                  >
                    <option
                      value="FLIGHT_MANAGER"
                      className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                    >
                      Flight Manager
                    </option>
                    <option
                      value="OPERATIONS_ADMIN"
                      className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                    >
                      Operations Admin
                    </option>
                    <option
                      value="SUPER_ADMIN"
                      className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                    >
                      Super Admin
                    </option>
                  </select>
                </div>
              </div>

              {/* Role description */}
              <div className="inline-flex items-start gap-2 rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2 text-xs text-slate-500 dark:border-slate-800/70 dark:bg-slate-950/40 dark:text-slate-400">
                <activeRole.icon
                  size={13}
                  className="mt-0.5 shrink-0 text-red-500 dark:text-red-400"
                />
                <p>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {activeRole.label}:
                  </span>{" "}
                  {activeRole.desc}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-slate-200/70 pt-3 dark:border-slate-800/70">
             <button
  className="
    aa-sheen group relative inline-flex items-center gap-2 overflow-hidden
    rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600
    px-4 py-2 text-sm font-semibold text-white
    shadow-md shadow-red-600/20
    transition
    hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-600/30
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40
    dark:shadow-red-900/30 dark:hover:shadow-red-900/40
  "
>
  <ShieldCheck size={14} />
  Create admin
</button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>

                <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <KeyRound size={11} />
                  Password stored securely
                </span>
              </div>
            </div>
          </form>
        </Reveal>
      )}

      {isError && (
        <div className="mt-6">
          <ErrorState
            message="Couldn't load admins."
            onRetry={() => refetch()}
          />
        </div>
      )}

      {/* ---------- Table ---------- */}
      {!isError && (
        <Reveal>
          <div className="card mt-6 overflow-hidden">
            {isLoading ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="aa-fade relative flex items-center gap-4 px-4 py-4"
                  >
                    <div className="aa-shimmer pointer-events-none absolute inset-0 opacity-70" />
                    <div className="relative h-10 w-10 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800" />
                    <div className="relative flex-1 space-y-2">
                      <div className="h-3.5 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="h-3 w-56 rounded bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <div className="relative h-6 w-24 rounded-full bg-slate-100 dark:bg-slate-800" />
                    <div className="relative h-7 w-20 rounded-lg bg-slate-100 dark:bg-slate-800" />
                  </div>
                ))}
              </div>
            ) : admins?.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-600/10 text-red-600 dark:text-red-400">
                  <ShieldCheck size={20} />
                </span>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  No admin accounts yet
                </p>
                <p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
                  Create the first staff account to grant access to operations tools.
                </p>
                <button
                  onClick={() => setOpen(true)}
                  className="aa-sheen group relative mt-1 inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-red-900/20 transition hover:-translate-y-0.5"
                >
                  <UserPlus size={14} />
                  Create first admin
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-slate-50/70 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins?.map((a) => {
                      const initials = a.full_name
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();

                      const roleMeta =
                        ROLE_META[a.role] || ROLE_META.FLIGHT_MANAGER;
                      const RoleIcon = roleMeta.icon;

                      return (
                        <tr
                          key={a.id}
                          className="group border-t border-slate-200 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/30"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-indigo-600 text-[11px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-950">
                                {initials}
                              </span>
                              <span className="truncate font-semibold text-slate-900 dark:text-white">
                                {a.full_name}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                              <Mail size={12} className="opacity-70" />
                              <span className="truncate">{a.email}</span>
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 ring-1 ring-red-200/70 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-900/50">
                              <RoleIcon size={11} />
                              {a.role.replaceAll("_", " ")}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            {a.is_active ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-700 ring-1 ring-emerald-200/70 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-900/50">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-700 ring-1 ring-red-200/70 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-900/50">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                Disabled
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => toggleActive(a.id, a.is_active)}
                              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition hover:-translate-y-0.5 ${
                                a.is_active
                                  ? "border-red-200 bg-red-50/60 text-red-600 hover:border-red-300 hover:bg-red-50 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-400 dark:hover:border-red-800/80 dark:hover:bg-red-950/40"
                                  : "border-emerald-200 bg-emerald-50/60 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:border-emerald-800/80 dark:hover:bg-emerald-900/40"
                              }`}
                            >
                              {a.is_active ? (
                                <>
                                  <ShieldOff size={12} />
                                  Disable
                                </>
                              ) : (
                                <>
                                  <ShieldCheck size={12} />
                                  Enable
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
  @keyframes aa-fade {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes aa-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes aa-sheen {
    from { transform: translateX(-120%); }
    to { transform: translateX(220%); }
  }

  .aa-fade { animation: aa-fade .35s ease-out both; }

  /* Shimmer — used ONLY on skeleton loaders */
  .aa-shimmer {
    background: linear-gradient(
      100deg,
      transparent 20%,
      rgba(148,163,184,.22) 45%,
      rgba(148,163,184,.35) 50%,
      rgba(148,163,184,.22) 55%,
      transparent 80%
    );
    background-size: 200% 100%;
    animation: aa-shimmer 1.6s linear infinite;
  }

  /* Sheen — used ONLY on buttons. Does NOT set background, so Tailwind
     gradients on the same element are preserved. */
  .aa-sheen::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      100deg,
      transparent 0%,
      rgba(255,255,255,.22) 45%,
      rgba(255,255,255,.34) 50%,
      rgba(255,255,255,.22) 55%,
      transparent 100%
    );
    transform: translateX(-120%);
    pointer-events: none;
  }
  .aa-sheen:hover::after { animation: aa-sheen .9s ease-out; }

  @media (prefers-reduced-motion: reduce) {
    .aa-fade, .aa-shimmer, .aa-sheen::after { animation: none !important; }
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