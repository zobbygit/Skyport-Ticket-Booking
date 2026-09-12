import { useQuery } from "@tanstack/react-query";
import {
  Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import { DollarSign, Plane, TrendingUp, Users } from "lucide-react";
import { api } from "../../lib/api";
import Reveal from "../../components/Reveal";
import ErrorState from "../../components/ErrorState";
import LoadingSpinner from "../../components/LoadingSpinner";

interface Analytics {
  bookingsPerDay: { date: string; bookings: number }[];
  revenuePerDay: { date: string; revenue: number }[];
  flightStatusBreakdown: { status: string; count: number }[];
  topRoutes: { origin: string; destination: string; bookings: number }[];
  summary: {
    new_passengers_week: number;
    bookings_week: number;
    revenue_week: number;
    delayed_now: number;
    cancelled_today: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "#94a3b8",
  CHECK_IN_OPEN: "#3b82f6",
  BOARDING: "#10b981",
  GATE_CHANGED: "#f59e0b",
  DELAYED: "#f97316",
  DEPARTED: "#6366f1",
  LANDED: "#14b8a6",
  CANCELLED: "#ef4444",
};

const CHART_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#6366f1", "#ef4444"];

export default function AdminAnalytics() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => (await api.get<{ data: Analytics }>("/admin/analytics")).data.data,
  });

  if (isLoading) return <LoadingSpinner label="Loading analytics..." />;
  if (isError || !data) return <ErrorState message="Could not load analytics." onRetry={() => refetch()} />;

  const { summary, bookingsPerDay, revenuePerDay, flightStatusBreakdown, topRoutes } = data;

  const summaryCards = [
    { label: "Bookings this week", value: summary.bookings_week, icon: Plane, color: "from-brand-500 to-indigo-600" },
    { label: "Revenue this week", value: `$${Number(summary.revenue_week).toFixed(0)}`, icon: DollarSign, color: "from-emerald-500 to-teal-600" },
    { label: "New passengers this week", value: summary.new_passengers_week, icon: Users, color: "from-violet-500 to-purple-600" },
    { label: "Flights delayed right now", value: summary.delayed_now, icon: TrendingUp, color: "from-amber-500 to-orange-600" },
  ];

  // Merge bookings + revenue by date for the combined chart
  const combined = bookingsPerDay.map((d) => ({
    date: format(parseISO(d.date), "MMM d"),
    bookings: d.bookings,
    revenue: Number(revenuePerDay.find((r) => r.date === d.date)?.revenue || 0),
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold">Analytics</h1>
      <p className="mt-1 text-sm text-slate-400">Last 30 days · live data</p>

      {/* Summary cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((c, i) => (
          <Reveal key={c.label} delay={i * 60}>
            <div className="card p-5">
              <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${c.color} text-white shadow-md`}>
                <c.icon size={18} />
              </span>
              <p className="mt-4 text-3xl font-extrabold">{c.value}</p>
              <p className="text-sm text-slate-400">{c.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Bookings over time */}
      <Reveal delay={120}>
        <div className="card mt-6 p-5">
          <p className="mb-4 font-semibold">Bookings & revenue — last 30 days</p>
          {combined.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No booking data yet — bookings will appear here once passengers start paying.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={combined}>
                <defs>
                  <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}
                  formatter={(value: any, name: string) => [name === "revenue" ? `$${value}` : value, name === "revenue" ? "Revenue" : "Bookings"]}
                />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="bookings" stroke="#2563eb" fill="url(#bookingGrad)" strokeWidth={2} dot={false} />
                <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revenueGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Flight status breakdown */}
        <Reveal delay={160}>
          <div className="card p-5">
            <p className="mb-4 font-semibold">Today's flights by status</p>
            {flightStatusBreakdown.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No flights scheduled today.</p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={flightStatusBreakdown} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                      {flightStatusBreakdown.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#94a3b8"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, name) => [v, String(name).replaceAll("_", " ")]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {flightStatusBreakdown.map((s) => (
                    <div key={s.status} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.status] || "#94a3b8" }} />
                        <span className="text-slate-400">{s.status.replaceAll("_", " ")}</span>
                      </div>
                      <span className="font-semibold">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {/* Top routes */}
        <Reveal delay={200}>
          <div className="card p-5">
            <p className="mb-4 font-semibold">Top routes by bookings</p>
            {topRoutes.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No route data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={topRoutes.map((r) => ({ route: `${r.origin}→${r.destination}`, bookings: r.bookings }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis type="category" dataKey="route" tick={{ fontSize: 11 }} tickLine={false} width={72} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }} />
                  <Bar dataKey="bookings" radius={[0, 6, 6, 0]}>
                    {topRoutes.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}