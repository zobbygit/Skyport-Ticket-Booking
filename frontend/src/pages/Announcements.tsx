import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCheck,
  Clock,
  Info,
  Megaphone,
  Sparkles,
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
    ring: string;
    dot: string;
    accent: string;
    label: string;
  }
> = {
  INFO: {
    icon: Info,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/30",
    ring: "ring-blue-200/70 dark:ring-blue-900/50",
    dot: "bg-blue-500",
    accent: "from-blue-500 to-indigo-500",
    label: "Information",
  },
  WARNING: {
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/30",
    ring: "ring-amber-200/70 dark:ring-amber-900/50",
    dot: "bg-amber-500",
    accent: "from-amber-500 to-orange-500",
    label: "Warning",
  },
  CRITICAL: {
    icon: Megaphone,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-900/30",
    ring: "ring-rose-200/70 dark:ring-rose-900/50",
    dot: "bg-rose-500",
    accent: "from-rose-500 to-red-500",
    label: "Critical",
  },
};

export default function Announcements() {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () =>
      (await api.get<{ data: Announcement[] }>("/announcements")).data.data,
  });

  const total = announcements?.length ?? 0;

  return (
    <div className="mx-auto max-w-3xl">
      {/* ---------- Header ---------- */}
      <Reveal>
        <div className="pt-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30">
                <Megaphone size={20} />
                <span className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-brand-500 opacity-30 blur-lg" />
              </span>

              <div>
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" />
                  </span>
                  SkyPort Updates
                </p>

                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400">
                    Announcements
                  </span>
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Important updates and messages from SkyPort.
                </p>
              </div>
            </div>

            {!isLoading && total > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
                <Sparkles size={12} className="text-brand-600 dark:text-brand-400" />
                {total} update{total === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>
      </Reveal>

      {/* ---------- List ---------- */}
      <div className="mt-6 space-y-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="an-fade card relative h-28 overflow-hidden p-5"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="an-shimmer pointer-events-none absolute inset-0 opacity-70" />

              <div className="relative flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800" />

                <div className="flex-1 space-y-3">
                  <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          ))}

        {!isLoading && total === 0 && (
          <div className="relative flex flex-col items-center gap-3 overflow-hidden rounded-3xl border border-slate-200/70 bg-white/60 px-8 py-14 text-center backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/40">
            <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />

            <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:ring-brand-900/40">
              <Megaphone size={24} />
            </span>

            <h3 className="relative text-base font-bold text-slate-800 dark:text-slate-100">
              No announcements
            </h3>

            <p className="relative max-w-xs text-sm text-slate-500 dark:text-slate-400">
              There are no new announcements at the moment.
            </p>

            <span className="relative mt-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/70 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300">
              <CheckCheck size={11} />
              You're all caught up
            </span>
          </div>
        )}

        {announcements?.map((announcement, index) => {
          const style =
            SEVERITY_STYLE[announcement.severity] || SEVERITY_STYLE.INFO;

          const Icon = style.icon;

          return (
            <Reveal key={announcement.id} delay={Math.min(index, 6) * 50}>
              <div
                className="an-fade group card relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg dark:hover:border-brand-900/60"
                style={{ animationDelay: `${Math.min(index, 6) * 30}ms` }}
              >
                {/* Left accent by severity */}
                <span
                  className={`pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b ${style.accent}`}
                />

                <div className="flex items-start gap-4">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105 ${style.bg} ${style.color} ${style.ring}`}
                  >
                    <Icon size={17} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2 className="truncate font-bold text-slate-900 dark:text-white">
                        {announcement.title}
                      </h2>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ring-1 ${style.bg} ${style.color} ${style.ring}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                        {style.label}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
                      {announcement.message}
                    </p>

                    <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                      <Clock size={11} className="opacity-70" />
                      {formatDistanceToNow(new Date(announcement.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Motion */}
      <style>{`
        @keyframes an-fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes an-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .an-fade { animation: an-fade .35s ease-out both; }

        .an-shimmer {
          background: linear-gradient(
            100deg,
            transparent 20%,
            rgba(148,163,184,.22) 45%,
            rgba(148,163,184,.35) 50%,
            rgba(148,163,184,.22) 55%,
            transparent 80%
          );
          background-size: 200% 100%;
          animation: an-shimmer 1.6s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .an-fade, .an-shimmer { animation: none !important; }
        }
      `}</style>
    </div>
  );
}