import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRightLeft, BadgeCheck, BellRing, ChevronDown, Globe2, Luggage, MapPinned,
  Plane,
  PlaneTakeoff, Quote, Radar, Search, ShieldCheck, Sparkles, Star, TrendingUp,
} from "lucide-react";
import { api } from "../lib/api";
import { Airport } from "../types";
import Reveal from "../components/Reveal";

const GRADIENTS = [
  "from-brand-500 to-indigo-600",
  "from-fuchsia-500 to-brand-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-rose-600",
  "from-sky-500 to-brand-700",
  "from-violet-500 to-purple-700",
];

const STATS = [
  { value: "2.4M+", label: "Passengers served" },
  { value: "180+", label: "Destinations tracked" },
  { value: "99.2%", label: "On-time notification accuracy" },
  { value: "24/7", label: "Live gate & baggage updates" },
];

const WHY_SKYPORT = [
  { icon: BellRing, title: "Real-time gate & status updates", desc: "Get instant push notifications the moment your gate, terminal, or flight status changes — no refreshing, no guessing." },
  { icon: MapPinned, title: "Interactive airport maps", desc: "Find gates, lounges, restrooms, and baggage belts laid out clearly, terminal by terminal." },
  { icon: Luggage, title: "Live baggage tracking", desc: "Follow your bag from check-in to the carousel with your tag reference, and file a report in one tap if something's off." },
  { icon: ShieldCheck, title: "Secure by design", desc: "Separate passenger and staff sessions, role-based admin access, and encrypted credentials end to end." },
  { icon: Radar, title: "Built on live data", desc: "Every gate change, delay, and status update streams over WebSockets the instant operations staff confirm it." },
  { icon: Sparkles, title: "One place for the whole trip", desc: "Search, book, check in, track baggage, and board — without juggling five different apps." },
];

const TESTIMONIALS = [
  { name: "Amara Chen", route: "JFK → LHR", quote: "The gate change notification hit my phone before the airport announcement even played. Genuinely useful.", rating: 5 },
  { name: "Diego Fernández", route: "LAX → JFK", quote: "Baggage tracking actually told me which belt before I got off the walkway. Small thing, huge relief.", rating: 5 },
  { name: "Priya Nair", route: "LHR → LAX", quote: "Checked in from the taxi, had my boarding pass ready before I hit the terminal doors.", rating: 4 },
  { name: "Tomasz Kowalski", route: "JFK → LAX", quote: "The airport map saved me from wandering Terminal 4 looking for a charging spot.", rating: 5 },
  { name: "Yuki Tanaka", route: "LAX → LHR", quote: "Clean, fast, no clutter. Exactly what a travel app should feel like.", rating: 4 },
  { name: "Amara Chen", route: "JFK → LHR", quote: "The gate change notification hit my phone before the airport announcement even played. Genuinely useful.", rating: 5 },
  { name: "Diego Fernández", route: "LAX → JFK", quote: "Baggage tracking actually told me which belt before I got off the walkway. Small thing, huge relief.", rating: 5 },
  { name: "Priya Nair", route: "LHR → LAX", quote: "Checked in from the taxi, had my boarding pass ready before I hit the terminal doors.", rating: 4 },
  { name: "Tomasz Kowalski", route: "JFK → LAX", quote: "The airport map saved me from wandering Terminal 4 looking for a charging spot.", rating: 5 },
  { name: "Yuki Tanaka", route: "LAX → LHR", quote: "Clean, fast, no clutter. Exactly what a travel app should feel like.", rating: 4 },
  { name: "Fatima Al-Rashid", route: "DXB → JFK", quote: "Layover was tight and it walked me gate to gate with real walking times. Made my connection with minutes to spare.", rating: 5 },
  { name: "Liam O'Connor", route: "LHR → DUB", quote: "Delay hit at 6am and it had rebooked options in front of me before I'd finished my coffee.", rating: 5 },
  { name: "Sofia Rossi", route: "JFK → FCO", quote: "Loved that it flagged my terminal change the night before. No panic at check-in.", rating: 4 },
  { name: "Kwame Mensah", route: "LAX → ACC", quote: "Immigration wait times were spot on, so I timed my arrival perfectly. No more guessing.", rating: 5 },
  { name: "Ingrid Larsen", route: "CPH → LHR", quote: "Simple, reliable, and it never once spammed me with stuff I didn't ask for. Rare these days.", rating: 4 },
];

const FAQS = [
  { q: "Do I need to download an app to use SkyPort?", a: "No — SkyPort runs entirely in your browser. Search, book, check in, and track baggage from any device without installing anything." },
  { q: "How fast are gate change notifications?", a: "Gate and status changes stream to your dashboard the instant airport operations staff confirm them — typically under a second, well ahead of overhead announcements." },
  { q: "Can I track baggage without an account?", a: "Yes — baggage tracking by tag reference is open to anyone at /baggage. You only need an account to book flights and save your trip history." },
  { q: "What happens if my flight is delayed after I check in?", a: "You'll get a real-time notification and an updated boarding pass automatically — no need to refresh or re-check in." },
  { q: "How does SkyPort handle my data?", a: "Passenger and staff accounts use separate, isolated sessions with role-based access on the admin side, and all credentials are hashed — never stored in plain text." },
];

export default function Home() {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { data: airports } = useQuery({
    queryKey: ["airports"],
    queryFn: async () => (await api.get<{ data: Airport[] }>("/airports")).data.data,
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (origin) params.set("origin", origin);
    if (destination) params.set("destination", destination);
    if (date) params.set("date", date);
    navigate(`/flights?${params.toString()}`);
  }

  return (
    <div className="overflow-x-hidden">
      {/* ---------- HERO ---------- */}
      <section className="relative -mx-4 overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-950 px-4 py-20 text-white sm:mx-0 sm:rounded-[2rem] sm:py-28">
        {/* Aurora glows */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />

        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.9) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
            maskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          }}
        />

        <PlaneTakeoff className="pointer-events-none absolute right-10 top-16 hidden h-24 w-24 rotate-12 text-white/10 sm:block" />
        <Globe2 className="pointer-events-none absolute left-8 bottom-10 hidden h-20 w-20 text-white/10 sm:block" />

        <Reveal className="relative mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
            </span>
            Real-time airport intelligence
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Fly smarter,
            <span className="block bg-gradient-to-r from-white via-brand-100 to-indigo-200 bg-clip-text text-transparent">
              every step of the way
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm text-brand-100/90 sm:text-base">
            Search flights, track gates in real time, and manage your whole trip from one place.
          </p>
        </Reveal>

        <Reveal delay={150} className="relative mx-auto mt-10 max-w-3xl">
          <form
            onSubmit={handleSearch}
            className="grid gap-3 rounded-2xl border border-white/60 bg-white/95 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/90 sm:grid-cols-[1fr_auto_1fr_1fr_auto] sm:p-4"
          >
            <div className="relative">
              <PlaneTakeoff
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="input w-full bg-white pl-9 text-slate-900 dark:bg-slate-900 dark:text-white"
              >
                <option value="" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                  From
                </option>
                {airports?.map((a) => (
                  <option key={a.id} value={a.iata_code} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                    {a.city} ({a.iata_code})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="hidden place-items-center rounded-xl border border-slate-200 bg-slate-50 transition hover:rotate-180 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-brand-700 dark:hover:bg-brand-900/40 sm:grid"
              onClick={() => { const o = origin; setOrigin(destination); setDestination(o); }}
              aria-label="Swap origin and destination"
            >
              <ArrowRightLeft size={16} className="text-slate-500 dark:text-slate-400" />
            </button>

            <div className="relative">
              <Plane
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="input w-full bg-white pl-9 text-slate-900 dark:bg-slate-900 dark:text-white"
              >
                <option value="" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                  To
                </option>
                {airports?.map((a) => (
                  <option key={a.id} value={a.iata_code} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                    {a.city} ({a.iata_code})
                  </option>
                ))}
              </select>
            </div>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
            />

            <button
              type="submit"
              className="btn-primary group inline-flex items-center justify-center gap-2 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-600/40"
            >
              <Search size={18} className="transition-transform group-hover:scale-110" />
              Search
            </button>
          </form>
        </Reveal>
      </section>

      {/* ---------- STATS ---------- */}
      <Reveal>
        <section className="mx-auto -mt-10 grid max-w-5xl grid-cols-2 gap-3 px-2 sm:grid-cols-4 sm:gap-4 sm:px-0">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="card group relative overflow-hidden p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <p className="text-2xl font-extrabold tracking-tight tabular-nums text-brand-600 dark:text-brand-400 sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
                {s.label}
              </p>
            </div>
          ))}
        </section>
      </Reveal>

      {/* ---------- POPULAR DESTINATIONS ---------- */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-600 dark:border-brand-900/60 dark:bg-brand-900/20 dark:text-brand-400">
              <Globe2 size={12} />
              Explore
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Popular destinations
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-slate-500 dark:text-slate-400">
              Hand-picked routes our travelers are booking most this season.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(airports || Array.from({ length: 6 })).slice(0, 6).map((a: any, i) => (
            <Reveal key={a?.id || i} delay={i * 60}>
              <button
                onClick={() => navigate(a ? `/flights?destination=${a.iata_code}` : "/flights")}
                className={`group relative h-48 w-full overflow-hidden rounded-2xl bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} p-5 text-left text-white shadow-lg shadow-black/10 ring-1 ring-white/10 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:ring-white/30`}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <PlaneTakeoff className="absolute -right-4 -top-4 h-24 w-24 text-white/15 transition duration-500 group-hover:rotate-12 group-hover:scale-110" />

                <div className="relative flex h-full flex-col justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70">
                      {a?.country || "Loading"}
                    </p>
                    <p className="mt-1 text-2xl font-extrabold tracking-tight">
                      {a?.city || "…"}
                    </p>
                    <p className="mt-1 text-sm text-white/80">{a?.name || ""}</p>
                  </div>

                  <div className="flex items-end justify-between">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur ring-1 ring-white/20">
                      {a?.iata_code || ""}
                    </span>
                    <span className="translate-x-2 text-xs font-semibold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                      Book →
                    </span>
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- WHY SKYPORT ---------- */}
      <section id="why" className="mx-auto mt-28 max-w-6xl scroll-mt-24 px-4 sm:px-6">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-600 dark:border-brand-900/60 dark:bg-brand-900/20 dark:text-brand-400">
              <Sparkles size={13} />
              Why SkyPort
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Everything you need, nothing you don't
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
              One connected airport experience designed around the moments that matter most to travelers.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_SKYPORT.map((f, i) => (
            <Reveal key={f.title} delay={i * 70}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/5 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-brand-900/70">
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand-500/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition-all duration-300 group-hover:scale-105 group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-900/30 dark:text-brand-400 dark:ring-brand-900/40 dark:group-hover:bg-brand-600 dark:group-hover:text-white">
                      <f.icon size={21} />
                    </span>
                    <span className="text-xs font-semibold tabular-nums text-slate-300 transition-colors group-hover:text-brand-500 dark:text-slate-700">
                      0{i + 1}
                    </span>
                  </div>

                  <h3 className="mt-6 text-base font-bold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{f.desc}</p>

                  <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-brand-600 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 dark:text-brand-400">
                    <button onClick={() => navigate("/flights")}>
                      <span>Explore</span>
                      <span className="ml-1">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={300}>
          <div className="mt-8 overflow-hidden rounded-2xl border border-brand-100 bg-brand-50/70 px-6 py-5 dark:border-brand-900/40 dark:bg-brand-900/10 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-brand-700 dark:text-brand-400">
                  One place for the whole trip
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Search, book, check in, track your baggage, and stay informed without jumping between different airport tools.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
                </span>
                Connected experience
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- ABOUT ---------- */}
      <section id="about" className="mx-auto mt-28 max-w-6xl scroll-mt-24 px-4 sm:px-6">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-600 dark:border-slate-800 dark:bg-brand-500/10 dark:text-brand-400">
              <Plane size={13} />
              About SkyPort
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Built to make every airport journey clearer
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
              SkyPort brings flight booking, live airport information, baggage tracking, check-in, and boarding together in one connected experience.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {/* Card 1 */}
          <Reveal>
            <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-600/10 text-brand-600 ring-1 ring-brand-500/10 dark:text-brand-400">
                    <BadgeCheck size={24} />
                  </div>
                  <span className="rounded-full bg-brand-600/10 px-2.5 py-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                    The idea
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold tracking-tight">
                  Travelers shouldn't have to guess
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                  SkyPort is an airport services platform built around one simple idea: important travel information should reach you when it changes. Gates, delays, boarding, baggage, and flight status are brought into one connected experience.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {["Flights", "Gates", "Baggage", "Boarding"].map((item) => (
                    <span
                      key={item}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Card 2 */}
          <Reveal delay={100}>
            <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700">
              <div className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-600/10 text-brand-600 ring-1 ring-brand-500/10 dark:text-brand-400">
                    <Sparkles size={24} />
                  </div>
                  <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    Technology
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold tracking-tight">
                  Real-time airport technology
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                  Under the hood, SkyPort pairs a React frontend with a real-time Node/Express API. Socket.IO powers live flight and baggage updates, while role-based administration gives operations staff control over flights, gates, and airports.
                </p>

                <div className="mt-6 flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Real-time updates
                  </span>
                  <span className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
                  <span>Socket.IO</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Card 3 */}
          <Reveal delay={150}>
            <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700">
              <div className="absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-600/10 text-brand-600 ring-1 ring-brand-500/10 dark:text-brand-400">
                    <ShieldCheck size={24} />
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Operations
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold tracking-tight">
                  Built for travelers and airport teams
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                  Passengers get a simple journey from booking to boarding, while operations staff can manage the information behind that journey. Role-based access keeps passenger and administrative experiences separated.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                    <p className="text-xs text-slate-400">Passenger</p>
                    <p className="mt-1 text-sm font-semibold">Simple journey</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                    <p className="text-xs text-slate-400">Operations</p>
                    <p className="mt-1 text-sm font-semibold">Full control</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Card 4 */}
          <Reveal delay={200}>
            <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700">
              <div className="absolute -right-16 -bottom-16 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-600/10 text-brand-600 ring-1 ring-brand-500/10 dark:text-brand-400">
                    <Sparkles size={24} />
                  </div>
                  <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                    Smart boarding
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold tracking-tight">
                  From booking to boarding pass
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                  SkyPort connects the journey after a flight is booked. Travelers can check in, receive a smart boarding pass, follow their flight, keep track of baggage, and access the information they need before reaching the gate.
                </p>

                <div className="mt-6 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-brand-500 to-brand-600" />
                  </div>
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                    Connected
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- TESTIMONIALS ---------- */}
      <section className="mt-24 overflow-hidden">
        <Reveal>
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
            Passenger stories
          </p>
          <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            Loved by travelers on the move
          </h2>
        </Reveal>

        <div className="relative mt-12">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[rgb(var(--background))] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[rgb(var(--background))] to-transparent" />

          <div className="testimonial-marquee group">
            <div className="testimonial-track flex w-max gap-5 px-4">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, index) => (
                <article
                  key={`${t.name}-${index}`}
                  className="card relative flex w-[300px] shrink-0 flex-col overflow-hidden p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl sm:w-[360px]"
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl" />

                  <div className="relative flex items-start justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600/10 text-brand-600 dark:text-brand-400">
                      <Quote size={20} />
                    </div>
                    <div className="flex gap-0.5 rounded-lg bg-amber-400/10 px-2 py-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={
                            i < t.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300 dark:text-slate-700"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <p className="relative mt-6 text-[15px] leading-7 text-slate-600 dark:text-slate-300">
                    “{t.quote}”
                  </p>

                  <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white ring-2 ring-white dark:ring-slate-900">
                      {t.name
                        .split(" ")
                        .map((name) => name[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{t.route}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          .testimonial-marquee {
            overflow: hidden;
            width: 100%;
          }
          .testimonial-track {
            animation: testimonial-scroll 90s linear infinite;
          }
          .testimonial-marquee:hover .testimonial-track {
            animation-play-state: paused;
          }
          @media (prefers-reduced-motion: reduce) {
            .testimonial-track {
              animation: none;
            }
          }
          @keyframes testimonial-scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="mx-auto mt-24 max-w-3xl scroll-mt-24 px-4 sm:px-6">
        <Reveal>
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
            FAQ
          </p>
          <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            Questions, answered
          </h2>
        </Reveal>

        <div className="mt-10 space-y-3">
          {FAQS.map((item, i) => (
            <Reveal key={item.q} delay={i * 50}>
              <div
                className={`card overflow-hidden transition-colors duration-300 ${
                  openFaq === i
                    ? "border-brand-200 bg-brand-50/40 dark:border-brand-900/60 dark:bg-brand-900/10"
                    : ""
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold"
                >
                  {item.q}
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-slate-400 transition-transform duration-300 ${
                      openFaq === i ? "rotate-180 text-brand-600 dark:text-brand-400" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    openFaq === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <p className="overflow-hidden px-5 pb-5 text-sm text-slate-500 dark:text-slate-400">
                    {item.a}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <Reveal>
        <section className="relative mx-auto mt-24 max-w-5xl overflow-hidden rounded-3xl border border-brand-500/20 bg-gradient-to-br from-brand-700 via-brand-700 to-indigo-950 px-6 py-16 text-center text-white shadow-2xl shadow-brand-900/20 sm:px-10 sm:py-20">
          <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-20 h-72 w-72 rounded-full bg-indigo-400/25 blur-3xl" />

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
            }}
          />

          <PlaneTakeoff className="pointer-events-none absolute -right-10 bottom-[-30px] h-56 w-56 rotate-[-12deg] text-white/[0.06] sm:h-72 sm:w-72" />

          <div className="relative mx-auto max-w-2xl">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.8)]" />
              Your journey starts here
            </div>

            <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready for a smoother trip?
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-brand-100 sm:text-base">
              Search live flights, book in minutes, and stay informed with real-time updates from takeoff to baggage claim.
            </p>

            <button
              onClick={() => navigate("/flights")}
              className="group relative mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-brand-700 shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <Search size={18} className="transition-transform duration-300 group-hover:scale-110" />
              Search flights now
              <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
          </div>
        </section>
      </Reveal>
    </div>
  );
}