import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRightLeft,
  CalendarDays,
  Filter,
  Plane,
  PlaneTakeoff,
  RotateCcw,
  SearchX,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { api } from "../lib/api";
import { Flight } from "../types";
import FlightCard from "../components/FlightCard";
import Reveal from "../components/Reveal";

type SortKey = "departure" | "price" | "duration";

export default function FlightSearch() {
  const [params, setParams] = useSearchParams();
  const origin = params.get("origin") || "";
  const destination = params.get("destination") || "";
  const date = params.get("date") || "";
  const [sort, setSort] = useState<SortKey>("departure");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const { data: flights, isLoading } = useQuery({
    queryKey: ["flights", origin, destination, date],
    queryFn: async () => {
      const query = new URLSearchParams();
      if (origin) query.set("origin", origin);
      if (destination) query.set("destination", destination);
      if (date) query.set("date", date);
      return (await api.get<{ data: Flight[] }>(`/flights?${query.toString()}`)).data.data;
    },
  });

  const shown = useMemo(() => {
    let list = flights || [];
    if (maxPrice !== "") list = list.filter((f) => Number(f.base_price) <= maxPrice);
    return [...list].sort((a, b) => {
      if (sort === "price") return Number(a.base_price) - Number(b.base_price);
      if (sort === "duration") {
        const da = new Date(a.arrival_time).getTime() - new Date(a.departure_time).getTime();
        const db = new Date(b.arrival_time).getTime() - new Date(b.departure_time).getTime();
        return da - db;
      }
      return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
    });
  }, [flights, sort, maxPrice]);

  function update(key: string, value: string) {
    setParams((p) => {
      if (value) p.set(key, value); else p.delete(key);
      return p;
    });
  }

  const hasFilters = maxPrice !== "";

  return (
    <div>
      {/* ---------- Search header ---------- */}
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-950 p-6 text-white shadow-xl shadow-brand-900/10 sm:p-8">
          {/* Aurora glows */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-6 h-48 w-48 rounded-full bg-indigo-400/25 blur-3xl" />

          {/* Grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.09] dark:opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.9) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage:
                "radial-gradient(ellipse at center, black 35%, transparent 78%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center, black 35%, transparent 78%)",
            }}
          />

          <PlaneTakeoff className="fs-float pointer-events-none absolute -right-6 -top-6 h-32 w-32 text-white/10" />

          <div className="relative">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-100">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
              </span>
              <SlidersHorizontal size={13} /> Refine your search
            </p>

            <h1 className="mt-2 flex flex-wrap items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {origin && destination ? (
                <>
                  <span className="rounded-xl bg-white/10 px-3 py-1 ring-1 ring-white/15 backdrop-blur">
                    {origin}
                  </span>
                  <ArrowRightLeft size={18} className="text-brand-100/80" />
                  <span className="rounded-xl bg-white/10 px-3 py-1 ring-1 ring-white/15 backdrop-blur">
                    {destination}
                  </span>
                </>
              ) : (
                "Search results"
              )}
            </h1>

            {date && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-brand-100/80">
                <CalendarDays size={12} /> {date}
              </p>
            )}

            {/* Search fields */}
            <div className="relative mt-5 grid gap-3 rounded-2xl border border-white/60 bg-white/95 p-3 shadow-2xl shadow-black/20 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/90 sm:grid-cols-[1fr_auto_1fr_1fr]">
              <div className="relative">
                <PlaneTakeoff
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                />
                <input
                  placeholder="Origin (IATA)"
                  defaultValue={origin}
                  onBlur={(e) => update("origin", e.target.value.toUpperCase())}
                  className="input w-full pl-9 text-slate-900 dark:text-white"
                />
              </div>

              <div className="hidden items-center justify-center sm:flex">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:rotate-180 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-brand-700 dark:hover:bg-brand-900/40 dark:hover:text-brand-400">
                  <ArrowRightLeft size={15} />
                </span>
              </div>

              <div className="relative">
                <Plane
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                />
                <input
                  placeholder="Destination (IATA)"
                  defaultValue={destination}
                  onBlur={(e) => update("destination", e.target.value.toUpperCase())}
                  className="input w-full pl-9 text-slate-900 dark:text-white"
                />
              </div>

              <div className="relative">
                <CalendarDays
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                />
                <input
                  type="date"
                  defaultValue={date}
                  onChange={(e) => update("date", e.target.value)}
                  className="input w-full pl-9 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ---------- Toolbar ---------- */}
      <Reveal delay={60}>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/60 px-4 py-3 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/40">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            {isLoading ? (
              <>
                <span className="fs-spin h-3.5 w-3.5 rounded-full border-2 border-brand-500 border-t-transparent" />
                <span>Searching flights…</span>
              </>
            ) : (
              <>
                <Sparkles size={15} className="text-brand-600 dark:text-brand-400" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {shown.length}
                </span>
                <span>
                  flight{shown.length === 1 ? "" : "s"} found
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="relative">
              <Filter
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                type="number"
                placeholder="Max price"
                className="input w-32 pl-8"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
              />
            </div>

            <select
              className="input w-40 bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="departure" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                Sort: Departure
              </option>
              <option value="price" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                Sort: Price
              </option>
              <option value="duration" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                Sort: Duration
              </option>
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={() => setMaxPrice("")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:text-brand-400"
              >
                <RotateCcw size={13} />
                Clear
              </button>
            )}
          </div>
        </div>
      </Reveal>

      {/* ---------- Results ---------- */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="card relative h-44 overflow-hidden p-5"
            >
              <div className="fs-shimmer pointer-events-none absolute inset-0 opacity-60" />
              <div className="relative">
                <div className="h-3.5 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-6 w-14 rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-1 flex-1 rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-6 w-14 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <div className="h-4 w-20 rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-6 w-16 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            </div>
          ))}

        {!isLoading && shown.length === 0 && (
          <div className="col-span-full">
            <div className="relative mx-auto flex max-w-md flex-col items-center gap-3 overflow-hidden rounded-3xl border border-slate-200/70 bg-white/60 px-8 py-14 text-center backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/40">
              <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
              <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:ring-brand-900/40">
                <SearchX size={24} />
              </span>
              <h3 className="relative text-base font-bold text-slate-800 dark:text-slate-100">
                No flights match your search
              </h3>
              <p className="relative max-w-xs text-sm text-slate-500 dark:text-slate-400">
                {hasFilters
                  ? "Try widening your price range or clearing filters."
                  : "Try different dates or another route."}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => setMaxPrice("")}
                  className="relative mt-2 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-brand-700 dark:hover:text-brand-400"
                >
                  <RotateCcw size={13} />
                  Reset filters
                </button>
              )}
            </div>
          </div>
        )}

        {shown.map((f, i) => (
          <Reveal key={f.id} delay={Math.min(i, 6) * 60}>
            <FlightCard flight={f} />
          </Reveal>
        ))}
      </div>

      {/* Motion */}
      <style>{`
        @keyframes fs-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        @keyframes fs-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fs-spin {
          to { transform: rotate(360deg); }
        }

        .fs-float { animation: fs-float 6s ease-in-out infinite; }
        .fs-spin { animation: fs-spin .7s linear infinite; }

        .fs-shimmer {
          background: linear-gradient(
            100deg,
            transparent 20%,
            rgba(148,163,184,.22) 45%,
            rgba(148,163,184,.35) 50%,
            rgba(148,163,184,.22) 55%,
            transparent 80%
          );
          background-size: 200% 100%;
          animation: fs-shimmer 1.6s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .fs-float,
          .fs-spin,
          .fs-shimmer {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}