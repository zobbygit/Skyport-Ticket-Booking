import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  BellRing,
  CheckCheck,
  Clock,
  Inbox,
  Info,
  Plane,
  Sparkles,
  Ticket,
  TriangleAlert,
} from "lucide-react";
import { api } from "../../lib/api";
import Reveal from "../../components/Reveal";
import { getSocket } from "../../lib/socket";
import toast from "react-hot-toast";

interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_booking_id?: string | null;
}

const TYPE_CONFIG: Record<
  string,
  {
    icon: any;
    color: string;
    bg: string;
    ring: string;
    label: string;
  }
> = {
  BOOKING_CONFIRMED: {
    icon: Ticket,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    ring: "ring-emerald-200/70 dark:ring-emerald-900/50",
    label: "Booking confirmed",
  },

  BOARDING_PASS: {
    icon: Plane,
    color: "text-brand-600 dark:text-brand-400",
    bg: "bg-brand-50 dark:bg-brand-900/30",
    ring: "ring-brand-200/70 dark:ring-brand-900/50",
    label: "Boarding pass",
  },

  BOOKING_CANCELLED: {
    icon: TriangleAlert,
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/30",
    ring: "ring-red-200/70 dark:ring-red-900/50",
    label: "Cancellation",
  },

  FLIGHT_UPDATE: {
    icon: Plane,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/30",
    ring: "ring-amber-200/70 dark:ring-amber-900/50",
    label: "Flight update",
  },

  GATE_CHANGE: {
    icon: AlertCircle,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/30",
    ring: "ring-orange-200/70 dark:ring-orange-900/50",
    label: "Gate change",
  },

  GENERAL: {
    icon: Info,
    color: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800",
    ring: "ring-slate-200/70 dark:ring-slate-800",
    label: "General",
  },
};

export default function AdminNotifications() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () =>
      (await api.get<{ data: AdminNotification[] }>("/notifications/admin"))
        .data.data,
  });

  useEffect(() => {
    const socket = getSocket();

    const onNew = (n: AdminNotification) => {
      qc.invalidateQueries({
        queryKey: ["admin-notifications"],
      });

      qc.invalidateQueries({
        queryKey: ["notifications-admin-unread"],
      });

      const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.GENERAL;
      const Icon = cfg.icon;

      toast.custom(
        (t) => (
          <div
            className={`card flex cursor-pointer items-start gap-3 p-4 shadow-xl transition ${
              t.visible ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => {
              toast.dismiss(t.id);
              navigate("/admin/notifications");
            }}
          >
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 ${cfg.bg} ${cfg.color} ${cfg.ring}`}
            >
              <Icon size={16} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{n.title}</p>

              <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                {n.message}
              </p>

              <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-red-600 dark:text-red-400">
                View <ArrowRight size={10} />
              </p>
            </div>
          </div>
        ),
        { duration: 5000 }
      );
    };

    socket.on("notification:new", onNew);

    return () => {
      socket.off("notification:new", onNew);
    };
  }, [qc, navigate]);

  async function markRead(id: string) {
    try {
      await api.patch(`/notifications/admin/${id}/read`);

      qc.invalidateQueries({
        queryKey: ["admin-notifications"],
      });

      qc.invalidateQueries({
        queryKey: ["notifications-admin-unread"],
      });
    } catch {
      toast.error("Failed to mark notification as read.");
    }
  }

  async function markAllRead() {
    try {
      await api.patch("/notifications/admin/read-all");

      qc.invalidateQueries({
        queryKey: ["admin-notifications"],
      });

      qc.invalidateQueries({
        queryKey: ["notifications-admin-unread"],
      });

      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Failed to mark notifications as read.");
    }
  }

  function handleClick(n: AdminNotification) {
    if (!n.is_read) {
      void markRead(n.id);
    }

    if (n.related_booking_id) {
      navigate(`/admin/bookings/${n.related_booking_id}`);
    }
  }

  const unread = notifications?.filter((n) => !n.is_read).length || 0;

  const total = notifications?.length || 0;

  const todayCount =
    notifications?.filter(
      (n) =>
        new Date(n.created_at).toDateString() === new Date().toDateString()
    ).length || 0;

  return (
    <div className="mx-auto max-w-3xl">
      {/* ---------- Header ---------- */}
      <Reveal>
        <div className="flex flex-wrap items-start justify-between gap-4 pt-5">
          <div className="flex items-start gap-3">
            <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-indigo-600 text-white shadow-lg shadow-red-600/30">
              <Bell size={20} />

              {unread > 0 && (
                <span className="nt-pulse absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-950" />
              )}
            </span>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">
                Admin Inbox
              </p>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Admin{" "}
                <span className="bg-gradient-to-r from-red-500 to-indigo-600 bg-clip-text text-transparent dark:from-red-400 dark:to-indigo-400">
                  Notifications
                </span>
              </h1>

              <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                {unread > 0 ? (
                  <>
                    <span className="nt-pulse h-1.5 w-1.5 rounded-full bg-red-500" />

                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {unread}
                    </span>

                    unread
                  </>
                ) : (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    All caught up
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={markAllRead}
            disabled={unread === 0}
            className="btn-secondary inline-flex items-center gap-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={15} />
            Mark all read
          </button>
        </div>
      </Reveal>

      {/* ---------- Summary ---------- */}
      {!isLoading && total > 0 && (
        <Reveal delay={60}>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <SummaryChip
              icon={<Inbox size={12} />}
              label="All"
              value={total}
              tone="slate"
            />

            <SummaryChip
              icon={<BellRing size={12} />}
              label="Unread"
              value={unread}
              tone="brand"
              highlight={unread > 0}
            />

            <SummaryChip
              icon={<Clock size={12} />}
              label="Today"
              value={todayCount}
              tone="emerald"
            />
          </div>
        </Reveal>
      )}

      {/* ---------- Notification list ---------- */}
      <div className="mt-6 space-y-2">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="card relative flex h-24 items-start gap-4 overflow-hidden p-4"
            >
              {/* was nt-sheen → now nt-shimmer */}
              <div className="nt-shimmer pointer-events-none absolute inset-0 opacity-70" />

              <div className="relative h-10 w-10 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800" />

              <div className="relative flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-64 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-2.5 w-20 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ))}

        {!isLoading && total === 0 && (
          <div className="relative flex flex-col items-center gap-3 overflow-hidden rounded-3xl border border-slate-200/70 bg-white/60 px-8 py-14 text-center backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/40">
            <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-red-500/10 blur-3xl" />

            <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-900/40">
              <Bell size={24} />
            </span>

            <h3 className="relative text-base font-bold text-slate-800 dark:text-slate-100">
              No admin notifications yet
            </h3>

            <p className="relative max-w-xs text-sm text-slate-500 dark:text-slate-400">
              Admin activity and system notifications will appear here.
            </p>

            <Link
              to="/admin"
              className="nt-sheen group relative mt-2 inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-red-600/20 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 dark:shadow-red-900/30 dark:hover:shadow-red-900/40"
            >
              <Sparkles size={15} />
              Admin Dashboard
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        )}

        {notifications?.map((n, i) => {
          const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.GENERAL;

          const Icon = cfg.icon;
          const unreadItem = !n.is_read;

          return (
            <Reveal key={n.id} delay={Math.min(i, 8) * 40}>
              <button
                onClick={() => handleClick(n)}
                className={`group card nt-fade relative flex w-full items-start gap-4 overflow-hidden p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg dark:hover:border-red-900/60 ${
                  unreadItem
                    ? "border-red-200/70 bg-red-50/40 ring-1 ring-red-500/20 dark:border-red-900/60 dark:bg-red-950/10"
                    : "bg-white/60 opacity-90 dark:bg-slate-900/40"
                }`}
              >
                {unreadItem && (
                  <span className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-red-500/40 via-red-500 to-red-500/40" />
                )}

                <span
                  className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105 ${cfg.bg} ${cfg.color} ${cfg.ring}`}
                >
                  {unreadItem ? <BellRing size={17} /> : <Icon size={17} />}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`truncate text-sm ${
                        unreadItem
                          ? "font-semibold text-slate-900 dark:text-white"
                          : "font-medium text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {n.title}
                    </p>

                    {unreadItem && (
                      <span className="nt-pulse mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                    )}
                  </div>

                  <p className="mt-0.5 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                    {n.message}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold ${cfg.bg} ${cfg.color}`}
                    >
                      <Icon size={11} />
                      {cfg.label}
                    </span>

                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Clock size={11} />
                      {formatDistanceToNow(new Date(n.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>

                <ArrowRight
                  size={15}
                  className="mt-3 shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-red-500 dark:text-slate-700 dark:group-hover:text-red-400"
                />
              </button>
            </Reveal>
          );
        })}
      </div>

      {/* Motion */}
      <style>{`
        @keyframes nt-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,.55); }
          50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        }
        @keyframes nt-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes nt-fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes nt-sheen {
          from { transform: translateX(-120%); }
          to { transform: translateX(220%); }
        }

        .nt-pulse { animation: nt-pulse 2s ease-out infinite; }
        .nt-fade { animation: nt-fade .35s ease-out both; }

        /* Shimmer — skeletons only. */
        .nt-shimmer {
          background: linear-gradient(
            100deg,
            transparent 20%,
            rgba(148,163,184,.22) 45%,
            rgba(148,163,184,.35) 50%,
            rgba(148,163,184,.22) 55%,
            transparent 80%
          );
          background-size: 200% 100%;
          animation: nt-shimmer 1.6s linear infinite;
        }

        /* Sheen — buttons only. Does NOT set background, so Tailwind
           gradients on the same element are preserved in both themes. */
        .nt-sheen::after {
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
        .nt-sheen:hover::after { animation: nt-sheen .9s ease-out; }

        @media (prefers-reduced-motion: reduce) {
          .nt-pulse, .nt-fade, .nt-shimmer, .nt-sheen::after {
            animation: none !important;
          }
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
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "slate" | "brand" | "emerald";
  highlight?: boolean;
}) {
  const toneCls =
    tone === "brand"
      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300"
      : tone === "emerald"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300"
      : "border-slate-200 bg-white/70 text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${toneCls} ${
        highlight ? "shadow-sm shadow-red-600/10" : ""
      }`}
    >
      {icon}
      {label}
      <span className="tabular-nums">{value}</span>
    </span>
  );
}