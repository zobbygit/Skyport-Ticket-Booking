import { useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Check, Luggage, Search, ShieldAlert, TriangleAlert } from "lucide-react";
import { api, apiErrorMessage } from "../lib/api";
import { Baggage as BaggageType, BaggageStatus } from "../types";
import StatusBadge from "../components/StatusBadge";
import Reveal from "../components/Reveal";

const TIMELINE: BaggageStatus[] = ["CHECKED_IN", "LOADED", "IN_TRANSIT", "ARRIVED", "AT_BAGGAGE_CLAIM", "READY_FOR_COLLECTION"];

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
      <Reveal>
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30">
            <Luggage size={24} />
          </span>
          <h1 className="mt-4 text-3xl font-extrabold">Track your baggage</h1>
          <p className="mt-1 text-sm text-slate-400">Enter your baggage tag reference to see its live status.</p>
        </div>

        <form onSubmit={handleSearch} className="mx-auto mt-6 flex max-w-md gap-2">
          <input className="input" placeholder="e.g. SKAB1234" value={tag} onChange={(e) => setTag(e.target.value)} />
          <button className="btn-primary shrink-0" disabled={loading}><Search size={16} /> Track</button>
        </form>
      </Reveal>

      {bag && (
        <Reveal>
          <div className="card mt-6 p-6">
            <div className="flex items-center justify-between">
              <p className="font-mono text-lg font-bold">{bag.tag_reference}</p>
              <StatusBadge status={bag.status} />
            </div>

            {!isProblem && currentStep >= 0 && (
              <div className="mt-6 flex items-center">
                {TIMELINE.map((step, i) => (
                  <div key={step} className="flex flex-1 items-center last:flex-none">
                    <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold transition ${i <= currentStep ? "bg-brand-600 text-white" : "border text-slate-400"}`} style={i <= currentStep ? {} : { borderColor: "rgb(var(--border))" }}>
                      {i < currentStep ? <Check size={14} /> : i + 1}
                    </div>
                    {i < TIMELINE.length - 1 && (
                      <div className={`h-0.5 flex-1 transition ${i < currentStep ? "bg-brand-600" : ""}`} style={i < currentStep ? {} : { backgroundColor: "rgb(var(--border))" }} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {isProblem && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30">
                <ShieldAlert size={16} /> This bag needs attention — our baggage services team has been notified.
              </div>
            )}

            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-400">Last scan</dt><dd>{bag.last_scan_location || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Updated</dt><dd>{format(new Date(bag.last_scan_at), "MMM d, HH:mm")}</dd></div>
              {bag.belt && <div className="flex justify-between"><dt className="text-slate-400">Belt</dt><dd>{bag.belt}</dd></div>}
            </dl>

            <button onClick={() => setReportOpen((v) => !v)} className="btn-secondary mt-5 text-sm text-red-500">
              <TriangleAlert size={16} /> Report missing or damaged
            </button>

            {reportOpen && (
              <div className="mt-4 space-y-2">
                <textarea className="input" rows={3} placeholder="Describe the issue..." value={description} onChange={(e) => setDescription(e.target.value)} />
                <button onClick={handleReport} className="btn-primary w-full text-sm">Submit report</button>
              </div>
            )}
          </div>
        </Reveal>
      )}

      {/* Baggage policy reference */}
      <div className="mt-14">
        <Reveal>
          <h2 className="text-xl font-bold">Baggage policies</h2>
          <p className="mt-1 text-sm text-slate-400">The essentials, in plain language.</p>
        </Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {POLICIES.map((p, i) => (
            <Reveal key={p.title} delay={i * 60}>
              <div className="card h-full p-5 transition hover:-translate-y-1 hover:shadow-md">
                <p className="font-semibold">{p.title}</p>
                <p className="mt-1 text-sm text-slate-400">{p.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}