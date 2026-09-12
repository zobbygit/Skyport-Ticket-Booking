import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Bell, BellRing, CheckCheck, Plane, Ticket, TriangleAlert, AlertCircle, Info,
} from "lucide-react";
import { api } from "../lib/api";
import { NotificationItem } from "../types";
import Reveal from "../components/Reveal";
import { getSocket } from "../lib/socket";
import toast from "react-hot-toast";

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  BOOKING_CONFIRMED:  { icon: Ticket,       color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
  BOARDING_PASS:      { icon: Plane,        color: "text-brand-600",   bg: "bg-brand-50 dark:bg-brand-900/30" },
  BOOKING_CANCELLED:  { icon: TriangleAlert, color: "text-red-500",    bg: "bg-red-50 dark:bg-red-900/30" },
  FLIGHT_UPDATE:      { icon: Plane,        color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-900/30" },
  GATE_CHANGE:        { icon: AlertCircle,  color: "text-orange-600",  bg: "bg-orange-50 dark:bg-orange-900/30" },
  GENERAL:            { icon: Info,         color: "text-slate-500",   bg: "bg-slate-100 dark:bg-slate-800" },
};

export default function Notifications() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get<{ data: NotificationItem[] }>("/notifications")).data.data,
  });

  useEffect(() => {
    const socket = getSocket();
    const onNew = (n: NotificationItem) => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread"] });
      toast.custom((t) => (
        <div
          className={`card flex cursor-pointer items-start gap-3 p-4 shadow-xl transition ${t.visible ? "opacity-100" : "opacity-0"}`}
          onClick={() => { toast.dismiss(t.id); navigate("/notifications"); }}
        >
          <Bell size={18} className="mt-0.5 shrink-0 text-brand-600" />
          <div>
            <p className="text-sm font-semibold">{n.title}</p>
            <p className="text-xs text-slate-400">{n.message}</p>
          </div>
        </div>
      ), { duration: 5000 });
    };
    socket.on("notification:new", onNew);
    return () => { socket.off("notification:new", onNew); };
  }, [qc, navigate]);

  async function markRead(id: string) {
    await api.patch(`/notifications/${id}/read`);
    qc.invalidateQueries({ queryKey: ["notifications"] });
    qc.invalidateQueries({ queryKey: ["notifications-unread"] });
  }

  async function markAllRead() {
    await api.patch("/notifications/read-all");
    qc.invalidateQueries({ queryKey: ["notifications"] });
    qc.invalidateQueries({ queryKey: ["notifications-unread"] });
  }

//   function handleClick(n: NotificationItem) {
//     if (!n.is_read) markRead(n.id);
// if (n.type === "BOARDING_PASS" && n.related_booking_id) {
//   navigate(`/boarding-pass/${n.related_booking_id}`);
// }
//   }
function handleClick(n: NotificationItem) {
  if (!n.is_read) markRead(n.id);

  if (n.type === "BOOKING_CONFIRMED") {
    navigate("/dashboard");
    return;
  }

  if (n.type === "BOARDING_PASS" && n.related_booking_id) {
    navigate(`/boarding-pass/${n.related_booking_id}`);
    return;
  }
}

  const unread = notifications?.filter((n) => !n.is_read).length || 0;

  return (
    <div className="mx-auto max-w-2xl">
      <Reveal>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="mt-1 text-sm text-slate-400">
              {unread > 0 ? `${unread} unread` : "All caught up"}
            </p>
          </div>
          <button onClick={markAllRead} className="btn-secondary text-sm">
            <CheckCheck size={16} /> Mark all read
          </button>
        </div>
      </Reveal>

      <div className="mt-6 space-y-2">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-20 animate-pulse p-4" />
          ))}

        {!isLoading && notifications?.length === 0 && (
          <div className="card flex flex-col items-center gap-3 p-12 text-center text-slate-400">
            <Bell size={28} />
            <p>No notifications yet.</p>
            <p className="text-xs">You'll get notified here when you book flights, check in, and get gate updates.</p>
          </div>
        )}

        {notifications?.map((n, i) => {
          const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.GENERAL;
          const Icon = cfg.icon;
          return (
            <Reveal key={n.id} delay={Math.min(i, 8) * 40}>
              <button
                onClick={() => handleClick(n)}
                className={`card flex w-full items-start gap-4 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${!n.is_read ? "ring-1 ring-brand-500/50" : "opacity-80"}`}
              >
                <span className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${cfg.bg} ${cfg.color}`}>
                  {n.is_read ? <Icon size={18} /> : <BellRing size={18} />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!n.is_read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                    {!n.is_read && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-400">{n.message}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
              </button>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}