import { useQuery } from "@tanstack/react-query";
import { Plane, Ticket, Users, TriangleAlert, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import Reveal from "../../components/Reveal";
import ErrorState from "../../components/ErrorState";

interface Stats { flightsToday: number; bookingsToday: number; activePassengers: number; delayedFlights: number; }

export default function AdminDashboard() {
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get<{ data: Stats }>("/admin/stats")).data.data,
  });

  const cards = [
    { label: "Flights today", value: stats?.flightsToday, icon: Plane, accent: "from-brand-500 to-indigo-600", to: "/admin/flights" },
    { label: "Bookings today", value: stats?.bookingsToday, icon: Ticket, accent: "from-emerald-500 to-teal-600", to: "/admin/passengers" },
    { label: "Active passengers", value: stats?.activePassengers, icon: Users, accent: "from-violet-500 to-purple-600", to: "/admin/passengers" },
    { label: "Delayed flights", value: stats?.delayedFlights, icon: TriangleAlert, accent: "from-amber-500 to-orange-600", to: "/admin/flights" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Operations overview</h1>
      <p className="mt-1 text-sm text-slate-400">A live snapshot of what's happening across the network today.</p>

      {isError && <div className="mt-6"><ErrorState message="Couldn't load dashboard stats." onRetry={() => refetch()} /></div>}

      {!isError && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card h-32 animate-pulse p-5" />
            ))}

          {!isLoading &&
            cards.map((c, i) => (
              <Reveal key={c.label} delay={i * 60}>
                <Link to={c.to} className="card group relative block overflow-hidden p-5 transition hover:-translate-y-1 hover:shadow-lg">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${c.accent} text-white shadow-md transition group-hover:scale-110`}>
                    <c.icon size={18} />
                  </span>
                  <p className="mt-4 text-3xl font-extrabold">{c.value ?? "—"}</p>
                  <p className="text-sm text-slate-400">{c.label}</p>
                  <ArrowRight size={14} className="absolute right-4 top-4 text-slate-300 opacity-0 transition group-hover:opacity-100" />
                </Link>
              </Reveal>
            ))}
        </div>
      )}

      <Reveal delay={240}>
        <div className="card mt-8 p-6">
          <p className="font-semibold">Quick links</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link to="/admin/flights" className="btn-secondary">Manage flights</Link>
            <Link to="/admin/airports" className="btn-secondary">Manage airports & maps</Link>
            <Link to="/admin/announcements" className="btn-secondary">Post an announcement</Link>
            <Link to="/admin/audit-log" className="btn-secondary">View audit log</Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}