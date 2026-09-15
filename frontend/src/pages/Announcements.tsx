import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Clock,
  Info,
  Megaphone,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { api } from "../lib/api";
import Reveal from "../components/Reveal";

interface Announcement {
  id: string;
  title: string;
  message: string;
  severity: string;
  created_at: string;
}

const SEVERITY_STYLE: Record<
  string,
  {
    icon: any;
    color: string;
    bg: string;
    label: string;
  }
> = {
  INFO: {
    icon: Info,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/30",
    label: "Information",
  },
  WARNING: {
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/30",
    label: "Warning",
  },
  CRITICAL: {
    icon: Megaphone,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/30",
    label: "Critical",
  },
};

export default function Announcements() {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () =>
      (
        await api.get<{ data: Announcement[] }>(
          "/announcements"
        )
      ).data.data,
  });

  return (
    <div className="mx-auto max-w-3xl">
      <Reveal>
        <div className="pt-5">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-indigo-600 text-white shadow-lg shadow-red-600/20">
              <Megaphone size={20} />
            </span>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-500 dark:text-red-400">
                SkyPort Updates
              </p>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Announcements
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Important updates and messages from SkyPort.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-6 space-y-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="card h-28 animate-pulse p-5"
            >
              <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-3 h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
              <div className="mt-2 h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}

        {!isLoading && announcements?.length === 0 && (
          <div className="card flex flex-col items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <Megaphone size={24} />
            </span>

            <h3 className="mt-4 font-bold">
              No announcements
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              There are no new announcements at the moment.
            </p>
          </div>
        )}

        {announcements?.map((announcement, index) => {
          const style =
            SEVERITY_STYLE[announcement.severity] ||
            SEVERITY_STYLE.INFO;

          const Icon = style.icon;

          return (
            <Reveal
              key={announcement.id}
              delay={Math.min(index, 6) * 50}
            >
              <div className="card relative overflow-hidden p-5">
                <div className="flex items-start gap-4">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${style.bg} ${style.color}`}
                  >
                    <Icon size={17} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2 className="font-bold text-slate-900 dark:text-white">
                        {announcement.title}
                      </h2>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${style.bg} ${style.color}`}
                      >
                        {style.label}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {announcement.message}
                    </p>

                    <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                      <Clock size={11} />
                      {formatDistanceToNow(
                        new Date(announcement.created_at),
                        { addSuffix: true }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}