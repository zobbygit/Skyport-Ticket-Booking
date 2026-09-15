import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  Clock,
  Info,
  Megaphone,
  MessageSquare,
  Send,
  Sparkles,
    Trash2,
  Type,
} from "lucide-react";
import { api, apiErrorMessage } from "../../lib/api";
import Reveal from "../../components/Reveal";
import ErrorState from "../../components/ErrorState";

interface Announcement {
  id: string;
  title: string;
  message: string;
  severity: string;
  created_at: string;
}

const SEVERITY_STYLE: Record<
  string,
  { pill: string; dot: string; icon: any; accent: string }
> = {
  INFO: {
    pill: "bg-blue-50 text-blue-700 ring-blue-200/70 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-900/50",
    dot: "bg-blue-500",
    icon: Info,
    accent: "from-blue-500 to-indigo-500",
  },
  WARNING: {
    pill: "bg-amber-50 text-amber-700 ring-amber-200/70 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-900/50",
    dot: "bg-amber-500",
    icon: AlertTriangle,
    accent: "from-amber-500 to-orange-500",
  },
  CRITICAL: {
    pill: "bg-red-50 text-red-700 ring-red-200/70 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-900/50",
    dot: "bg-red-500",
    icon: Megaphone,
    accent: "from-red-500 to-rose-500",
  },
};

const SEVERITY_OPTIONS = ["INFO", "WARNING", "CRITICAL"];

export default function AdminAnnouncements() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    message: "",
    severity: "INFO",
  });

  const {
    data: announcements,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () =>
      (await api.get<{ data: Announcement[] }>("/announcements")).data.data,
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/announcements", form);
      toast.success("Announcement published.");
      setForm({ title: "", message: "", severity: "INFO" });
      qc.invalidateQueries({ queryKey: ["announcements"] });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

async function handleDelete(id: string) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this announcement?"
  );

  if (!confirmed) return;

  try {
    await api.delete(`/announcements/${id}`);

    toast.success("Announcement deleted.");

    qc.invalidateQueries({
      queryKey: ["announcements"],
    });
  } catch (err) {
    toast.error(apiErrorMessage(err));
  }
}

  const canPublish = form.title.trim().length > 0 && form.message.trim().length > 0;
  const activeSeverity = SEVERITY_STYLE[form.severity] || SEVERITY_STYLE.INFO;

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
            Admin Console · Broadcast
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            <span className="bg-gradient-to-r from-red-500 to-indigo-600 bg-clip-text text-transparent dark:from-red-400 dark:to-indigo-400">
              Announcements
            </span>
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Broadcast a message to passengers at an airport, or system-wide.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
          <Sparkles size={12} className="text-red-500 dark:text-red-400" />
          {announcements?.length ?? "…"} live
        </span>
      </div>

      {/* ---------- Composer ---------- */}
      <Reveal>
        <form onSubmit={handleCreate} className="card mt-5 overflow-hidden">
          {/* Composer header */}
          <div className="flex items-center justify-between border-b border-slate-200/70 bg-gradient-to-r from-red-600/10 via-rose-600/10 to-indigo-600/10 px-5 py-3 dark:border-slate-800/70">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-red-500 to-indigo-600 text-white shadow-md shadow-red-600/20">
                <Megaphone size={13} />
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Compose announcement
              </p>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ring-1 ${activeSeverity.pill}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${activeSeverity.dot}`} />
              {form.severity}
            </span>
          </div>

          <div className="space-y-3 p-5">
            <div className="relative">
              <Type
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                required
                placeholder="Title — e.g. Gate change at T2"
                className="input w-full pl-9"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="relative">
              <MessageSquare
                size={14}
                className="pointer-events-none absolute left-3 top-3 text-slate-400 dark:text-slate-500"
              />
              <textarea
                required
                placeholder="Write the message passengers will see…"
                rows={4}
                className="input w-full pl-9"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              <span className="pointer-events-none absolute bottom-2.5 right-3 text-[10px] font-medium tabular-nums text-slate-400 dark:text-slate-500">
                {form.message.length} chars
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  className="input w-44 bg-white pl-3 pr-8 text-slate-900 dark:bg-slate-900 dark:text-white"
                  value={form.severity}
                  onChange={(e) =>
                    setForm({ ...form, severity: e.target.value })
                  }
                >
                  {SEVERITY_OPTIONS.map((s) => (
                    <option
                      key={s}
                      value={s}
                      className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                    >
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

       <button
  disabled={!canPublish}
  className="
    group relative inline-flex items-center gap-2 overflow-hidden rounded-xl
    bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600
    px-4 py-2.5 text-sm font-semibold text-white
    shadow-md shadow-red-900/20
    transition
    hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-900/30
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40
    disabled:cursor-not-allowed
    disabled:bg-none
    disabled:bg-slate-100
    disabled:text-slate-400
    disabled:shadow-none
    disabled:hover:translate-y-0
    disabled:hover:shadow-none
    dark:disabled:bg-slate-800
    dark:disabled:text-slate-500
  "
>
  <Send
    size={14}
    className="transition-transform group-hover:translate-x-0.5"
  />
  Publish
</button>

              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Announcements appear to passengers immediately.
              </span>
            </div>
          </div>
        </form>
      </Reveal>

      {isError && (
        <div className="mt-6">
          <ErrorState
            message="Couldn't load announcements."
            onRetry={() => refetch()}
          />
        </div>
      )}

      {/* ---------- List ---------- */}
      {!isError && (
        <div className="mt-6 space-y-2">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="aan-fade card relative h-24 overflow-hidden p-4"
              >
                <div className="aan-sheen pointer-events-none absolute inset-0 opacity-70" />
                <div className="relative flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-3 w-64 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-2.5 w-20 rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>
              </div>
            ))}

          {!isLoading && announcements?.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-950/30">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-600/10 text-red-600 dark:text-red-400">
                <Megaphone size={20} />
              </span>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                No announcements yet
              </p>
              <p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
                Use the composer above to broadcast your first message to passengers.
              </p>
            </div>
          )}

          {announcements?.map((a, i) => {
            const style = SEVERITY_STYLE[a.severity] || SEVERITY_STYLE.INFO;
            const Icon = style.icon;
            return (
              <Reveal key={a.id} delay={Math.min(i, 6) * 50}>
                <div
                  className="aan-fade group card relative overflow-hidden p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg dark:hover:border-red-900/60"
                  style={{ animationDelay: `${Math.min(i, 6) * 30}ms` }}
                >
                  {/* Left accent */}
                  <span
                    className={`pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b ${style.accent}`}
                  />

                  <div className="flex items-start gap-4">
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${style.pill}`}
                    >
                      <Icon size={16} />
                    </span>

                    <div className="min-w-0 flex-1">
  <div className="flex flex-wrap items-start justify-between gap-2">
  <p className="truncate font-semibold text-slate-900 dark:text-white">
    {a.title}
  </p>

  <div className="flex items-center gap-2">
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ring-1 ${style.pill}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
      />
      {a.severity}
    </span>

    <button
      type="button"
      onClick={() => handleDelete(a.id)}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
      title="Delete announcement"
      aria-label={`Delete announcement: ${a.title}`}
    >
      <Trash2 size={15} />
    </button>
  </div>
</div>

                      <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {a.message}
                      </p>

                      <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
                        <Clock size={11} />
                        {formatDistanceToNow(new Date(a.created_at), {
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
      )}

      {/* Motion */}
      <style>{`
        @keyframes aan-fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes aan-sheen {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .aan-fade { animation: aan-fade .35s ease-out both; }

        .aan-sheen {
          background: linear-gradient(
            100deg,
            transparent 20%,
            rgba(148,163,184,.22) 45%,
            rgba(148,163,184,.35) 50%,
            rgba(148,163,184,.22) 55%,
            transparent 80%
          );
          background-size: 200% 100%;
          animation: aan-sheen 1.6s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .aan-fade, .aan-sheen { animation: none !important; }
        }
      `}</style>
    </div>
  );
}