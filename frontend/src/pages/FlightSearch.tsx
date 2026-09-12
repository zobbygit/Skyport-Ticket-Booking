import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRightLeft, CalendarDays, PlaneTakeoff, SearchX, SlidersHorizontal } from "lucide-react";
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

  return (
    <div>
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-indigo-800 p-6 text-white sm:p-8">
          <PlaneTakeoff className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 text-white/10" />
          <p className="relative flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-100">
            <SlidersHorizontal size={14} /> Refine your search
          </p>
          <h1 className="relative mt-1 text-2xl font-extrabold sm:text-3xl">
            {origin && destination ? `${origin} → ${destination}` : "Search results"}
          </h1>

          <div className="relative mt-5 grid gap-3 sm:grid-cols-4">
            <input placeholder="Origin (IATA)" defaultValue={origin} onBlur={(e) => update("origin", e.target.value.toUpperCase())} className="input text-slate-900 dark:text-white" />
            <div className="hidden items-center justify-center sm:flex">
              <ArrowRightLeft size={16} className="text-white/60" />
            </div>
            <input placeholder="Destination (IATA)" defaultValue={destination} onBlur={(e) => update("destination", e.target.value.toUpperCase())} className="input text-slate-900 dark:text-white sm:col-start-3" />
            <input type="date" defaultValue={date} onChange={(e) => update("date", e.target.value)} className="input text-slate-900 dark:text-white" />
          </div>
        </div>
      </Reveal>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <CalendarDays size={16} /> {isLoading ? "Searching..." : `${shown.length} flight${shown.length === 1 ? "" : "s"} found`}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <input
            type="number"
            placeholder="Max price"
            className="input w-32"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
          />
<select
  className="input w-40 bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
  value={sort}
  onChange={(e) => setSort(e.target.value as SortKey)}
>
  <option
    value="departure"
    className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
  >
    Sort: Departure
  </option>

  <option
    value="price"
    className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
  >
    Sort: Price
  </option>

  <option
    value="duration"
    className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
  >
    Sort: Duration
  </option>
</select>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-40 animate-pulse p-5">
              <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-6 h-8 w-full rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}

        {!isLoading && shown.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-2 py-16 text-slate-400">
            <SearchX size={32} />
            <p>No flights match your search. Try adjusting your filters.</p>
          </div>
        )}

        {shown.map((f, i) => (
          <Reveal key={f.id} delay={Math.min(i, 6) * 60}>
            <FlightCard flight={f} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}