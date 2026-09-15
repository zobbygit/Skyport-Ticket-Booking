import { useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import {
  Check,
  ClipboardCopy,
  Clock,
  Info,
  Luggage,
  MapPin,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  TriangleAlert,
  X,
} from "lucide-react";
import { api, apiErrorMessage } from "../lib/api";
import { Baggage as BaggageType, BaggageStatus } from "../types";
import StatusBadge from "../components/StatusBadge";
import Reveal from "../components/Reveal";

const TIMELINE: BaggageStatus[] = ["CHECKED_IN", "LOADED", "IN_TRANSIT", "ARRIVED", "AT_BAGGAGE_CLAIM", "READY_FOR_COLLECTION"];

const STEP_LABEL: Record<string, string> = {
  CHECKED_IN: "Checked in",
  LOADED: "Loaded",
  IN_TRANSIT: "In transit",
  ARRIVED: "Arrived",
  AT_BAGGAGE_CLAIM: "At claim",
  READY_FOR_COLLECTION: "Ready",
};

const POLICIES = [
  { title: "Carry-on allowance", detail: "1 personal item + 1 carry-on, max 8kg combined, fits the overhead bin sizer at the gate." },
  { title: "Checked baggage", detail: "Economy: 1 bag up to 23kg. Business & First: 2 bags up to 32kg each, included in fare." },
  { title: "Excess & overweight fees", detail: "Extra or overweight bags are charged at check-in — ask staff for the current rate for your route." },
  { title: "Restricted items", detail: "Power banks, lithium batteries, and sharp objects must go in carry-on, not checked baggage." },
  { title: "Delayed or lost baggage", detail: "File a report right here with your tag reference within 24 hours of arrival for fastest resolution." },
  { title: "Fragile & special items", detail: "Musical instruments, sports gear, and fragile items can be checked with special handling at the counter." },
];

export default function Baggage() {
  const [tag, setTag] = useState("");
  const [bag, setBag] = useState<BaggageType | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [description, setDescription] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!tag.trim()) return;
    setLoading(true);
    setBag(null);
    try {
      const res = await api.get<{ data: BaggageType }>(`/baggage/track/${tag.trim()}`);
      setBag(res.data.data);
    } catch (err) {
      toast.error(apiErrorMessage(err, "No baggage found with that tag."));
    } finally {
      setLoading(false);
    }
  }

  async function handleReport() {
    if (!bag || !description.trim()) return;
    try {
      await api.post(`/baggage/${bag.id}/report`, { description });
      toast.success("Report filed. Our team will follow up.");
      setReportOpen(false);
      setDescription("");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  const isProblem = bag?.status === "LOST" || bag?.status === "DELAYED";
  const currentStep = bag ? TIMELINE.indexOf(bag.status) : -1;

  return (
    <div className="mx-auto max-w-3xl">
      {/* ---------- Header ---------- */}
      <Reveal>
        <div className="text-center pt-5">
          <span className="relative mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30">
            <Luggage size={26} />
            <span className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-brand-500 opacity-40 blur-xl" />
          </span>

          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Live baggage tracking
          </p>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Track{" "}
            <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400">
              your baggage
            </span>
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Enter your baggage tag reference to see its live status.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mx-auto mt-6 max-w-md">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/70 p-2 shadow-sm backdrop-blur transition focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-500/15 dark:border-slate-800/70 dark:bg-slate-900/40 dark:focus-within:border-brand-700">
            <div className="relative flex-1">
              <Tag
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                className="input w-full border-0 bg-transparent pl-9 focus:ring-0"
                placeholder="e.g. SKAB1234"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
            </div>

            <button
              className="btn-primary bg-sheen relative shrink-0 overflow-hidden disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Tracking…
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Search size={16} />
                  Track
                </span>
              )}
            </button>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>No tag handy?</span>
            <button
              type="button"
              onClick={() => setTag("SKAB1234")}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-brand-700 dark:hover:text-brand-400"
            >
              SKAB1234
            </button>
          </div>
        </form>
      </Reveal>

      {/* ---------- Result ---------- */}
      {bag && (
        <Reveal>
          <div className="bg-fade card mt-6 overflow-hidden border-slate-200/70 p-6 dark:border-slate-800/70">
            {/* Header row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-sm font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100">
                  <Tag size={13} className="text-slate-400 dark:text-slate-500" />
                  {bag.tag_reference}
                </span>
              </div>

              <StatusBadge status={bag.status} />
            </div>

            {/* Timeline */}
            {!isProblem && currentStep >= 0 && (
              <div className="mt-7 -mx-1 overflow-x-auto pb-2">
                <div className="flex min-w-[560px] items-start px-1">
                  {TIMELINE.map((step, i) => {
                    const done = i < currentStep;
                    const active = i === currentStep;
                    return (
                      <div key={step} className="flex flex-1 items-start last:flex-none">
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-all duration-300 ${
                              done
                                ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/30"
                                : active
                                ? "bg-brand-600 text-white shadow-md shadow-brand-600/40 ring-4 ring-brand-500/20"
                                : "border border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500"
                            }`}
                          >
                            {done ? <Check size={14} /> : i + 1}
                            {active && (
                              <span className="bg-pulse pointer-events-none absolute inset-0 rounded-full" />
                            )}
                          </div>
                          <span
                            className={`whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.08em] ${
                              done || active
                                ? "text-brand-600 dark:text-brand-400"
                                : "text-slate-400 dark:text-slate-500"
                            }`}
                          >
                            {STEP_LABEL[step] || step.replaceAll("_", " ")}
                          </span>
                        </div>

                        {i < TIMELINE.length - 1 && (
                          <div className="mt-4 h-0.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-800">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500 ${
                                i < currentStep ? "w-full" : "w-0"
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Problem alert */}
            {isProblem && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200/70 bg-red-50/70 p-4 text-sm dark:border-red-900/50 dark:bg-red-950/20">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                  <ShieldAlert size={16} />
                </span>
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-300">
                    This bag needs attention
                  </p>
                  <p className="mt-0.5 text-red-600/90 dark:text-red-400/90">
                    Our baggage services team has been notified. File a report below for fastest resolution.
                  </p>
                </div>
              </div>
            )}

            {/* Details */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <DetailTile
                icon={<MapPin size={14} />}
                label="Last scan"
                value={bag.last_scan_location || "—"}
              />
              <DetailTile
                icon={<Clock size={14} />}
                label="Updated"
                value={format(new Date(bag.last_scan_at), "MMM d, HH:mm")}
              />
              <DetailTile
                icon={<Luggage size={14} />}
                label="Belt"
                value={bag.belt || "—"}
              />
            </div>

            {/* Report toggle */}
            <button
              onClick={() => setReportOpen((v) => !v)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-200/70 bg-red-50/60 px-3.5 py-2 text-sm font-semibold text-red-600 transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-400 dark:hover:border-red-800/80 dark:hover:bg-red-950/40"
            >
              {reportOpen ? <X size={15} /> : <TriangleAlert size={15} />}
              {reportOpen ? "Cancel report" : "Report missing or damaged"}
            </button>

            {/* Report panel */}
            {reportOpen && (
              <div className="bg-fade mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800/80 dark:bg-slate-950/40">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  <Sparkles size={12} className="text-brand-600 dark:text-brand-400" />
                  Describe the issue
                </p>
                <textarea
                  className="input w-full"
                  rows={3}
                  placeholder="Tell us what happened — where you last saw the bag, when, and any damage details."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {description.trim().length} characters
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setReportOpen(false); setDescription(""); }}
                      className="btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReport}
                      disabled={!description.trim()}
                      className="btn-primary text-sm transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Submit report
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Reveal>
      )}

      {/* ---------- Policies ---------- */}
      <div className="mt-14">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600/10 text-brand-600 dark:text-brand-400">
              <ShieldCheck size={16} />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Baggage policies</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                The essentials, in plain language.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {POLICIES.map((p, i) => (
            <Reveal key={p.title} delay={i * 60}>
              <div className="group card relative h-full overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg dark:hover:border-brand-900/60">
                <span className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="flex items-start justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400">
                    <Info size={16} />
                  </span>
                  <span className="text-[11px] font-semibold tabular-nums text-slate-300 transition-colors group-hover:text-brand-500 dark:text-slate-700">
                    0{i + 1}
                  </span>
                </div>

                <p className="mt-4 font-semibold tracking-tight">{p.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {p.detail}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Motion */}
      <style>{`
        @keyframes bg-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,.45); }
          50% { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
        }
        @keyframes bg-sheen {
          from { transform: translateX(-120%); }
          to { transform: translateX(220%); }
        }
        @keyframes bg-fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .bg-pulse { animation: bg-pulse 2s ease-out infinite; }
        .bg-fade { animation: bg-fade .3s ease-out both; }

        .bg-sheen::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            100deg,
            transparent 0%,
            rgba(255,255,255,.35) 45%,
            rgba(255,255,255,.55) 50%,
            rgba(255,255,255,.35) 55%,
            transparent 100%
          );
          transform: translateX(-120%);
          pointer-events: none;
        }
        .bg-sheen:hover::after {
          animation: bg-sheen .9s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .bg-pulse, .bg-fade, .bg-sheen::after {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function DetailTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2.5 dark:border-slate-800/70 dark:bg-slate-950/40">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
          {value}
        </p>
      </div>
    </div>
  );
}