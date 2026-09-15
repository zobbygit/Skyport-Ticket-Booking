import { useState, useEffect, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Luggage,
  MapPinned,
  Menu,
  Plane,
  User,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import ThemeToggle from "./ThemeToggle";
import CurrencySelector from "./CurrencySelector";
import { useAuthStore } from "../store/authStore";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";
import { useQuery } from "@tanstack/react-query";

const NAV_LINKS = [
  { to: "/flights", label: "Flights", icon: Plane },
  { to: "/airport-map", label: "Airport Map", icon: MapPinned },
  { to: "/baggage", label: "Baggage", icon: Luggage },
];

export default function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Scroll-aware condensation (visual only)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch unread count + subscribe to socket events
  useEffect(() => {
    if (!isAuthenticated) {
      setUnread(0);
      return;
    }

    let cancelled = false;

    api
      .get<{ data: { count: number } }>("/notifications/unread-count")
      .then((r) => {
        if (!cancelled) setUnread(r.data.data.count);
      })
      .catch(() => {
        /* non-fatal — badge just stays at 0 */
      });

    const socket = getSocket();
    const onNew = () => setUnread((n) => n + 1);

    socket.on("notification:new", onNew);

    return () => {
      cancelled = true;
      socket.off("notification:new", onNew);
    };
  }, [isAuthenticated]);

  // Close mobile menu on route change (extra safety) + Esc key
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast.success("You've been logged out.");
      setMobileOpen(false);
      navigate("/");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  }, [logout, navigate]);

  const markRead = useCallback(() => {
    if (unread === 0) return;
    setUnread(0);
    // best-effort server sync; fire-and-forget
    api.post("/notifications/mark-all-read").catch(() => {});
  }, [unread]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link group relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-300 ${
      isActive
        ? "nav-link-active bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-600/30"
        : "text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
    }`;

const { data: profile } = useQuery
({
  queryKey: ["profile"],
  queryFn: async () => (await api.get<{ data: { avatar_url?: string | null; full_name?: string } }>("/users/me")).data.data,
  enabled: isAuthenticated,
  staleTime: 5 * 60_000,
});

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-mobile-item group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-600/30"
        : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/60"
    }`;

  const iconBtn =
    "nav-ring relative grid h-9 w-9 place-items-center rounded-xl border border-slate-200/70 bg-white/60 text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:text-brand-600 dark:border-slate-800/70 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:text-brand-400";

  return (
    <header className="sticky top-0 z-50">
      <div
        className={`border-b backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 ${
          scrolled ? "shadow-md shadow-black/5 dark:shadow-black/20" : ""
        }`}
        style={{
          borderColor: "rgb(var(--border))",
          backgroundColor: "rgb(var(--bg) / 0.7)",
        }}
      >
        {/* Shimmer hairline */}
        <div className="nav-shimmer h-[2px] w-full" />

        <div
          className={`mx-auto flex max-w-6xl items-center justify-between px-4 transition-all duration-300 ${
            scrolled ? "py-2" : "py-3"
          }`}
        >
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-2 text-lg font-extrabold tracking-tight"
            onClick={() => setMobileOpen(false)}
          >
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/30 ring-1 ring-brand-500/20 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110">
              <Plane size={18} />
              <span className="absolute inset-0 -z-10 rounded-xl bg-brand-500 opacity-0 blur-md transition group-hover:opacity-60" />
            </span>
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent transition-colors dark:from-white dark:to-slate-300">
              SkyPort
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 rounded-full border border-slate-200/70 bg-slate-100/60 p-1 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-900/50 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                <link.icon
                  size={14}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <NavLink to="/dashboard" className={linkClass}>
                <LayoutDashboard
                  size={14}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
                Dashboard
              </NavLink>
            )}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <div className="hidden sm:block">
              <CurrencySelector />
            </div>

            {isAuthenticated ? (
              <>
                <Link
                  to="/notifications"
                  onClick={markRead}
                  className={`${iconBtn} hidden sm:grid`}
                  aria-label={
                    unread > 0
                      ? `Notifications (${unread} unread)`
                      : "Notifications"
                  }
                >
                  <Bell
                    size={18}
                    className={unread > 0 ? "nav-bell-swing" : ""}
                  />
                  {unread > 0 && (
                    <span className="nav-badge-pulse absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Link>
            <Link
  to="/profile"
  className={`${iconBtn} hidden overflow-hidden !p-0 sm:grid`}
  aria-label="Profile"
  title={profile?.full_name || "Profile"}
>
  {profile?.avatar_url ? (
    <img
      src={profile.avatar_url}
      alt={profile.full_name || "Profile"}
      className="h-full w-full rounded-xl object-cover"
    />
  ) : (
    <User size={18} />
  )}
</Link>
                <button
                  onClick={handleLogout}
                  className={`${iconBtn} hidden hover:!border-red-200 hover:!text-red-500 dark:hover:!border-red-900/60 dark:hover:!text-red-400 sm:grid`}
                  aria-label="Log out"
                >
                  <LogOut
                    size={18}
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                </button>
              </>
            ) : (
              <div className="hidden items-center gap-1.5 rounded-2xl border border-slate-200/70 bg-white/60 p-1 dark:border-slate-800/70 dark:bg-slate-900/40 sm:flex">
                <Link
                  to="/login"
                  className="btn-secondary !px-3 !py-1.5 text-sm transition hover:-translate-y-0.5"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="btn-primary !px-3 !py-1.5 text-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-600/30"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="nav-ring grid h-10 w-10 place-items-center rounded-xl border border-slate-200/70 bg-white/60 transition hover:-translate-y-0.5 dark:border-slate-800/70 dark:bg-slate-900/40 md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <span className="relative block h-5 w-5">
                <Menu
                  size={20}
                  className={`absolute inset-0 transition-all duration-300 ${
                    mobileOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
                  }`}
                />
                <X
                  size={20}
                  className={`absolute inset-0 transition-all duration-300 ${
                    mobileOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`overflow-hidden border-t transition-all duration-300 md:hidden ${
            mobileOpen
              ? "max-h-[36rem] opacity-100"
              : "pointer-events-none max-h-0 opacity-0"
          }`}
          style={{ borderColor: "rgb(var(--border))" }}
          aria-hidden={!mobileOpen}
        >
          <nav className="flex flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={mobileLinkClass}
              >
                <link.icon size={16} />
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <NavLink
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className={mobileLinkClass}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </NavLink>
            )}

            <div
              className="my-2 border-t"
              style={{ borderColor: "rgb(var(--border))" }}
            />

            {isAuthenticated ? (
              <>
                <Link
                  to="/notifications"
                  onClick={() => {
                    markRead();
                    setMobileOpen(false);
                  }}
                  className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/60"
                >
                  <Bell size={16} />
                  Notifications
                  {unread > 0 && (
                    <span className="nav-badge-pulse ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Link>
          <Link
  to="/profile"
  onClick={() => setMobileOpen(false)}
  className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/60"
>
  {profile?.avatar_url ? (
    <img
      src={profile.avatar_url}
      alt={profile.full_name || "Profile"}
      className="h-4 w-4 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-800"
    />
  ) : (
    <User size={16} />
  )}
  Profile
</Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-1 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary flex-1 justify-center text-sm"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary flex-1 justify-center text-sm"
                >
                  Sign up
                </Link>
              </div>
            )}

            <div
              className="mt-2 flex items-center justify-center gap-4 border-t pt-3 sm:hidden"
              style={{ borderColor: "rgb(var(--border))" }}
            >
              <ThemeToggle />
              <CurrencySelector />
            </div>
          </nav>
        </div>
      </div>

      {/* Motion */}
      <style>{`
        @keyframes nav-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes nav-bell-swing {
          0%, 70%, 100% { transform: rotate(0deg); }
          75% { transform: rotate(-12deg); }
          80% { transform: rotate(10deg); }
          85% { transform: rotate(-8deg); }
          90% { transform: rotate(6deg); }
        }
        @keyframes nav-badge-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,.55); }
          50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
        }
        @keyframes nav-ring {
          from { opacity: .55; transform: scale(.85); }
          to { opacity: 0; transform: scale(1.25); }
        }

        .nav-shimmer {
          background: linear-gradient(
            90deg,
            rgba(99,102,241,.15) 0%,
            rgba(99,102,241,.85) 25%,
            rgba(139,92,246,.85) 50%,
            rgba(99,102,241,.85) 75%,
            rgba(99,102,241,.15) 100%
          );
          background-size: 200% 100%;
          animation: nav-shimmer 6s linear infinite;
        }

        .nav-ring::before {
          content: "";
          position: absolute;
          inset: -4px;
          border-radius: inherit;
          box-shadow: 0 0 0 2px rgb(var(--brand) / .35);
          opacity: 0;
          pointer-events: none;
        }
        .nav-ring:hover::before {
          animation: nav-ring .7s ease-out;
        }

        .nav-bell-swing { animation: nav-bell-swing 2.4s ease-in-out infinite; }
        .nav-badge-pulse { animation: nav-badge-pulse 2s ease-out infinite; }

        .nav-link:not(.nav-link-active)::after {
          content: "";
          position: absolute;
          left: 12px;
          right: 12px;
          bottom: 4px;
          height: 1.5px;
          border-radius: 2px;
          background: linear-gradient(90deg, transparent, rgb(var(--brand)), transparent);
          transform: scaleX(0);
          transform-origin: center;
          transition: transform .3s ease;
        }
        .nav-link:not(.nav-link-active):hover::after {
          transform: scaleX(1);
        }

        @media (prefers-reduced-motion: reduce) {
          .nav-shimmer,
          .nav-bell-swing,
          .nav-badge-pulse,
          .nav-ring::before,
          .nav-link::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </header>
  );
}