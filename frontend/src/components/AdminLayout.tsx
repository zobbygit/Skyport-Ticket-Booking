import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  BarChart2,
  Bell,
  Building2,
  ChevronRight,
  DoorOpen,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Plane,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import ThemeToggle from "./ThemeToggle";
import { useAuthStore } from "../store/authStore";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/admin/flights", label: "Flights", icon: Plane },
  { to: "/admin/airports", label: "Airports & Maps", icon: Building2 },
  { to: "/admin/gates", label: "Gates", icon: DoorOpen },
  { to: "/admin/passengers", label: "Passengers", icon: Users },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/admins", label: "Admins", icon: ShieldCheck },
  { to: "/admin/audit-log", label: "Audit log", icon: ScrollText },
];

// Presentational grouping only — the underlying NAV array is unchanged.
const GROUPS: { title: string; items: typeof NAV }[] = [
  {
    title: "Overview",
    items: NAV.filter((n) =>
      ["/admin", "/admin/analytics"].includes(n.to)
    ),
  },
  {
    title: "Operations",
    items: NAV.filter(
      (n) => !["/admin", "/admin/analytics"].includes(n.to)
    ),
  },
];

export default function AdminLayout() {
  const { account, logout } = useAuthStore();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    api
      .get<{ data: { count: number } }>("/notifications/admin/unread-count")
      .then((r) => setUnread(r.data.data.count))
      .catch(() => {});
    const socket = getSocket();
    const onNew = (n: any) => {
      setUnread((c) => c + 1);
      toast(n.title, { icon: "🔔" });
    };
    socket.on("admin:notification:new", onNew);
    return () => {
      socket.off("admin:notification:new", onNew);
    };
  }, []);

  const initials = (account?.full_name || account?.email || "A")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative grid min-h-screen grid-cols-1 bg-slate-50 dark:bg-slate-950 md:grid-cols-[260px_1fr]">
      {/* Backdrop grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(var(--border)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--border)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at top left, black 20%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at top left, black 20%, transparent 70%)",
        }}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="adl-fade fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ---------- Sidebar ---------- */}
      <aside
        className={`
          adl-slide fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r
          bg-white p-4 dark:bg-slate-950
          md:static md:z-auto md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ borderColor: "rgb(var(--border))" }}
      >
        {/* Top accent */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-red-500 via-rose-500 to-indigo-600 opacity-80" />

        {/* Header */}
        <div className="mb-6 flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-red-500 via-rose-500 to-indigo-600 text-white shadow-md shadow-red-600/30 ring-1 ring-white/10">
              <ShieldCheck size={16} />
              <span className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-red-500 opacity-40 blur-md" />
            </span>

            <div className="leading-tight">
              <p className="text-sm font-extrabold tracking-tight">
                SkyPort
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-500 dark:text-red-400">
                Admin
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white md:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-4 overflow-y-auto pr-1">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                {group.title}
              </p>

              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `adl-link group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 text-white shadow-md shadow-red-900/20"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-white/60" />
                        )}
                        <item.icon
                          size={16}
                          className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                        />
                        <span className="truncate">{item.label}</span>
                        <ChevronRight
                          size={13}
                          className={`ml-auto shrink-0 transition-all duration-200 ${
                            isActive
                              ? "translate-x-0 opacity-90"
                              : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-70"
                          }`}
                        />
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Profile block */}
        <div
          className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50/60 p-2.5 dark:border-slate-800/70 dark:bg-slate-900/40"
        >
          <div className="flex items-center gap-2.5">
            <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-indigo-600 text-xs font-bold text-white ring-2 ring-white dark:ring-slate-950">
              {initials}
              <span className="adl-ring absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-950" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                {account?.full_name || account?.email}
              </p>
              <p className="truncate text-[10px] font-medium uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                {account?.role?.replaceAll("_", " ") || "Admin"}
              </p>
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-1.5 border-t border-slate-200/70 pt-2 text-[10px] text-slate-500 dark:border-slate-800/70 dark:text-slate-400">
            <Sparkles size={10} className="text-red-500 dark:text-red-400" />
            Signed in · Restricted
          </div>
        </div>
      </aside>

      {/* ---------- Main ---------- */}
      <div className="relative flex min-h-screen flex-col md:ml-0">
        {/* Header */}
        <header
          className="sticky top-0 z-30 border-b bg-white/70 backdrop-blur-xl backdrop-saturate-150 dark:bg-slate-950/70"
          style={{ borderColor: "rgb(var(--border))" }}
        >
          {/* Bottom accent */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

          <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-4 md:px-6">
            {/* Left */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="shrink-0 rounded-xl border border-slate-200 bg-white/70 p-2 text-slate-600 transition hover:-translate-y-0.5 hover:border-red-300 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-red-800 dark:hover:text-red-400 md:hidden"
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>

              <div className="min-w-0">
                <p className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-red-500 dark:text-red-400 sm:block">
                  Admin Console
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                  Signed in as{" "}
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {account?.email}
                  </span>
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <span className="hidden items-center gap-1.5 rounded-full border border-red-200/70 bg-red-50/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-red-600 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300 lg:inline-flex">
                <ShieldCheck size={11} />
                Admin
              </span>

              <ThemeToggle />

              <button
       onClick={() => navigate("/admin/notifications")}
                className="relative grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white/70 text-slate-600 transition hover:-translate-y-0.5 hover:border-red-300 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-red-800 dark:hover:text-red-400"
                title="Admin notifications"
                aria-label={
                  unread > 0
                    ? `Admin notifications (${unread} unread)`
                    : "Admin notifications"
                }
              >
                <Bell
                  size={16}
                  className={unread > 0 ? "adl-pulse" : ""}
                />

                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>

              <button
                onClick={async () => {
                  await logout();
                  toast.success("Signed out.");
                  navigate("/admin/login");
                }}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-2.5 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                title="Sign out"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="relative flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Motion */}
      <style>{`
        @keyframes adl-pulse {
          0%, 100% { transform: rotate(0deg); }
          30% { transform: rotate(-10deg); }
          60% { transform: rotate(10deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes adl-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,.55); }
          50% { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
        }
        @keyframes adl-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes adl-slide {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .adl-pulse { animation: adl-pulse 1.6s ease-in-out infinite; transform-origin: 50% 20%; }
        .adl-ring { animation: adl-ring 2s ease-out infinite; }
        .adl-fade { animation: adl-fade .2s ease-out both; }
        .adl-slide { transition: transform .25s cubic-bezier(.2,.8,.2,1); }

        @media (max-width: 767px) {
          .adl-slide { animation: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .adl-pulse, .adl-ring, .adl-fade { animation: none !important; }
        }
      `}</style>
    </div>
  );
}