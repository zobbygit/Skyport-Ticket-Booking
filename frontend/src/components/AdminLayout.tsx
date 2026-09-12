import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LayoutDashboard, Plane, DoorOpen, Users, ShieldCheck, ScrollText, Megaphone, LogOut, Building2, Bell, BarChart2,  Menu,
  X, } from "lucide-react";
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

export default function AdminLayout() {
  const { account, logout } = useAuthStore();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    api.get<{ data: { count: number } }>("/notifications/admin/unread-count")
      .then((r) => setUnread(r.data.data.count))
      .catch(() => {});
    const socket = getSocket();
    const onNew = (n: any) => {
      setUnread((c) => c + 1);
      toast(n.title, { icon: "🔔" });
    };
    socket.on("admin:notification:new", onNew);
    return () => { socket.off("admin:notification:new", onNew); };
  }, []);

  const initials = (account?.full_name || account?.email || "A")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

 return (
 <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
    {/* Mobile header */}
    {/* <div
      className="flex items-center justify-between border-b px-4 py-3 md:hidden"
      style={{ borderColor: "rgb(var(--border))" }}
    >
      <div className="flex items-center gap-2 text-lg font-extrabold">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white">
          <ShieldCheck size={16} />
        </span>
        SkyPort Admin
      </div>

      <button
        onClick={() => setSidebarOpen(true)}
        className="rounded-xl border p-2 transition hover:bg-black/5 dark:hover:bg-white/5"
        style={{ borderColor: "rgb(var(--border))" }}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>
    </div> */}

    {/* Mobile overlay */}
    {sidebarOpen && (
      <div
        className="fixed inset-0 z-40 bg-black/40 md:hidden"
        onClick={() => setSidebarOpen(false)}
      />
    )}

    {/* Sidebar */}
<aside
  className={`
    fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r p-4
    bg-white transition-transform duration-200
    dark:bg-slate-950
    md:static md:z-auto md:translate-x-0
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
  `}
  style={{ borderColor: "rgb(var(--border))" }}
>
      {/* Sidebar header */}
      <div className="mb-6 flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-lg font-extrabold">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white">
            <ShieldCheck size={16} />
          </span>
          SkyPort Admin
        </div>

        {/* X - mobile only */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/5 md:hidden"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30"
                  : "hover:bg-black/5 dark:hover:bg-white/5"
              }`
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div
        className="mt-4 flex items-center gap-2 rounded-xl border p-2.5"
        style={{ borderColor: "rgb(var(--border))" }}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
          {initials}
        </span>

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">
            {account?.full_name || account?.email}
          </p>
          <p className="truncate text-[11px] text-slate-400">
            {account?.role?.replaceAll("_", " ")}
          </p>
        </div>
      </div>
    </aside>

    {/* Main content */}
    <div className="md:ml-0">
 <header
  className="flex items-center justify-between gap-2 border-b px-3 py-3 sm:px-4 md:px-6"
  style={{ borderColor: "rgb(var(--border))" }}
>
  {/* Left: hamburger + signed-in email */}
  <div className="flex min-w-0 flex-1 items-center gap-2">
    <button
      onClick={() => setSidebarOpen(true)}
      className="shrink-0 rounded-xl border p-2 transition hover:bg-black/5 dark:hover:bg-white/5 md:hidden"
      style={{ borderColor: "rgb(var(--border))" }}
      aria-label="Open menu"
    >
      <Menu size={20} />
    </button>
<p className="whitespace-nowrap text-xs text-slate-400 sm:text-sm">
  Signed in as{" "}
  <span className="font-semibold text-inherit">
    {account?.email}
  </span>
</p>
  </div>

  {/* Right: theme + notifications + sign out */}
  <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
    <ThemeToggle />

    <button
      onClick={async () => {
        await api.patch("/notifications/admin/read-all").catch(() => {});
        setUnread(0);
        toast.success("All notifications marked as read.");
      }}
      className="relative rounded-xl border p-2 transition hover:bg-black/5 dark:hover:bg-white/5"
      style={{ borderColor: "rgb(var(--border))" }}
      title="Admin notifications"
    >
      <Bell size={18} />

      {unread > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
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
      className="btn-secondary shrink-0 px-2.5 text-sm sm:px-3"
      title="Sign out"
    >
      <LogOut size={16} />
      <span className="hidden sm:inline">Sign out</span>
    </button>
  </div>
</header>

      <main className="p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  </div>

  );
}