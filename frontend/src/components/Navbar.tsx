import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu, Plane, PlaneTakeoff, User, X } from "lucide-react";
import toast from "react-hot-toast";
import ThemeToggle from "./ThemeToggle";
import { useAuthStore } from "../store/authStore";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";

const NAV_LINKS = [
  { to: "/flights", label: "Flights" },
  { to: "/airport-map", label: "Airport Map" },
  { to: "/baggage", label: "Baggage" },
];

export default function Navbar() {
  const { account, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get<{ data: { count: number } }>("/notifications/unread-count")
      .then((r) => setUnread(r.data.data.count))
      .catch(() => {});
    const socket = getSocket();
    const onNew = () => setUnread((n) => n + 1);
    socket.on("notification:new", onNew);
    return () => { socket.off("notification:new", onNew); };
  }, [isAuthenticated]);

  async function handleLogout() {
    await logout();
    toast.success("You've been logged out.");
    setMobileOpen(false);
    navigate("/");
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-300 ${
      isActive
        ? "bg-brand-600/10 text-brand-600"
        : "text-inherit hover:bg-black/5 hover:text-brand-600 dark:hover:bg-white/5"
    }`;

  return (
    <header className="sticky top-0 z-50">
      <div
        className="border-b backdrop-blur-xl transition-colors"
        style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--bg) / 0.75)" }}
      >
        <div className="h-[2px] w-full bg-gradient-to-r from-brand-500 via-indigo-500 to-brand-500 opacity-70" />

        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="group flex items-center gap-2 text-lg font-extrabold" onClick={() => setMobileOpen(false)}>
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/30 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110">
              <Plane size={18} />
              <span className="absolute inset-0 -z-10 rounded-xl bg-brand-500 opacity-0 blur-md transition group-hover:opacity-60" />
            </span>
            SkyPort
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border p-1 md:flex" style={{ borderColor: "rgb(var(--border))" }}>
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block"><ThemeToggle /></div>
            {isAuthenticated ? (
              <>
                <Link to="/notifications" className="relative hidden rounded-xl border p-2 transition hover:-translate-y-0.5 hover:bg-black/5 dark:hover:bg-white/5 sm:grid place-items-center" style={{ borderColor: "rgb(var(--border))" }} onClick={() => setUnread(0)}>
                  <Bell size={18} />
                  {unread > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="hidden rounded-xl border p-2 transition hover:-translate-y-0.5 hover:bg-black/5 dark:hover:bg-white/5 sm:grid place-items-center" style={{ borderColor: "rgb(var(--border))" }}>
                  <User size={18} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden rounded-xl border p-2 transition hover:-translate-y-0.5 hover:bg-black/5 dark:hover:bg-white/5 sm:grid place-items-center"
                  style={{ borderColor: "rgb(var(--border))" }}
                  aria-label="Log out"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <div className="hidden gap-2 sm:flex">
                <Link to="/login" className="btn-secondary !px-3 !py-2 text-sm transition hover:-translate-y-0.5">Log in</Link>
                <Link to="/register" className="btn-primary !px-3 !py-2 text-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-600/30">Sign up</Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-xl border transition md:hidden"
              style={{ borderColor: "rgb(var(--border))" }}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <span className="relative block h-5 w-5">
                <Menu size={20} className={`absolute inset-0 transition-all duration-300 ${mobileOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`} />
                <X size={20} className={`absolute inset-0 transition-all duration-300 ${mobileOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`} />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`overflow-hidden border-t transition-[max-height,opacity] duration-300 md:hidden ${mobileOpen ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0"}`}
          style={{ borderColor: "rgb(var(--border))" }}
        >
          <nav className="flex flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-brand-600 text-white" : "hover:bg-black/5 dark:hover:bg-white/5"}`}
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <NavLink to="/dashboard" onClick={() => setMobileOpen(false)} className={({ isActive }) => `rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-brand-600 text-white" : "hover:bg-black/5 dark:hover:bg-white/5"}`}>
                Dashboard
              </NavLink>
            )}

            <div className="my-2 border-t" style={{ borderColor: "rgb(var(--border))" }} />

            {isAuthenticated ? (
              <>
                <Link to="/notifications" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-black/5 dark:hover:bg-white/5"><Bell size={16} /> Notifications</Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-black/5 dark:hover:bg-white/5"><User size={16} /> Profile</Link>
                <button onClick={handleLogout} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"><LogOut size={16} /> Log out</button>
              </>
            ) : (
              <div className="flex gap-2 px-1 pt-1">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 justify-center text-sm">Log in</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 justify-center text-sm">Sign up</Link>
              </div>
            )}
            <div className="flex justify-center pt-2 sm:hidden"><ThemeToggle /></div>
          </nav>
        </div>
      </div>
    </header>
  );
}