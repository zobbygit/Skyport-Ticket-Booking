import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import {
  Activity,
  BarChart3,
  DollarSign,
  MapPinned,
  Plane,
  PieChart as PieIcon,
  TrendingUp,
  Users,
} from "lucide-react";
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

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid rgb(var(--border))",
  background: "rgb(var(--card))",
  color: "rgb(var(--fg))",
  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
  fontSize: 12,
  padding: "8px 12px",
} as const;

export default function AdminAnalytics() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () =>
      (await api.get<{ data: Analytics }>("/admin/analytics")).data.data,
  });

  if (isLoading) return <LoadingSpinner label="Loading analytics..." />;
  if (isError || !data)
    return (
      <ErrorState
        message="Could not load analytics."
        onRetry={() => refetch()}
      />
    );

  const {
    summary,
    bookingsPerDay,
    revenuePerDay,
    flightStatusBreakdown,
    topRoutes,
  } = data;

  const summaryCards = [
    {
      label: "Bookings this week",
      value: summary.bookings_week,
      icon: Plane,
      color: "from-brand-500 to-indigo-600",
    },
    {
      label: "Revenue this week",
      value: `$${Number(summary.revenue_week).toFixed(0)}`,
      icon: DollarSign,
      color: "from-emerald-500 to-teal-600",
    },
    {
      label: "New passengers this week",
      value: summary.new_passengers_week,
      icon: Users,
      color: "from-violet-500 to-purple-600",
    },
    {
      label: "Flights delayed right now",
      value: summary.delayed_now,
      icon: TrendingUp,
      color: "from-amber-500 to-orange-600",
    },
  ];

  // Merge bookings + revenue by date for the combined chart
  const combined = bookingsPerDay.map((d) => ({
    date: format(parseISO(d.date), "MMM d"),
    bookings: d.bookings,
    revenue: Number(
      revenuePerDay.find((r) => r.date === d.date)?.revenue || 0
    ),
  }));

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
            Admin Console
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            <span className="bg-gradient-to-r from-red-500 to-indigo-600 bg-clip-text text-transparent dark:from-red-400 dark:to-indigo-400">
              Analytics
            </span>
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Last 30 days · live data
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
          <Activity size={12} className="text-red-500 dark:text-red-400" />
          Live data
        </span>
      </div>

      {/* ---------- Summary cards ---------- */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((c, i) => (
          <Reveal key={c.label} delay={i * 60}>
            <div
              className="aana-fade card group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl hover:shadow-red-900/5 dark:hover:border-red-900/60"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-red-500/5 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-red-500/10" />

              <div className="relative flex items-start justify-between">
                <span
                  className={`relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${c.color} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
                >
                  <c.icon size={18} />
                  <span className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-red-500 opacity-30 blur-md" />
                </span>

                <BarChart3
                  size={15}
                  className="text-slate-300 transition-colors group-hover:text-red-500 dark:text-slate-700 dark:group-hover:text-red-400"
                />
              </div>

              <p className="relative mt-4 text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
                {c.value ?? "—"}
              </p>

              <p className="relative text-sm font-medium text-slate-500 dark:text-slate-400">
                {c.label}
              </p>

              <span
                className={`pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r ${c.color} opacity-60`}
              />
            </div>
          </Reveal>
        ))}
      </div>

      {/* ---------- Bookings over time ---------- */}
      <Reveal delay={120}>
        <div className="card mt-6 overflow-hidden p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-md shadow-brand-600/20">
                <TrendingUp size={14} />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Trend
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Bookings &amp; revenue — last 30 days
                </p>
              </div>
            </div>

            <span className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 sm:inline-flex">
              30d
            </span>
          </div>

          {combined.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-950/30">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600/10 text-brand-600 dark:text-brand-400">
                <TrendingUp size={20} />
              </span>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                No booking data yet
              </p>
              <p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
                Bookings and revenue will appear here once passengers start paying.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={combined}>
                <defs>
                  <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.15)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="fill-slate-500 dark:fill-slate-400"
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="fill-slate-500 dark:fill-slate-400"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                  className="fill-slate-500 dark:fill-slate-400"
                />

                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ color: "rgb(var(--fg))", fontWeight: 600 }}
                  formatter={(value: any, name: string) => [
                    name === "revenue" ? `$${value}` : value,
                    name === "revenue" ? "Revenue" : "Bookings",
                  ]}
                />

                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />

                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="bookings"
                  stroke="#2563eb"
                  fill="url(#bookingGrad)"
                  strokeWidth={2}
                  dot={false}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  fill="url(#revenueGrad)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* ---------- Flight status breakdown ---------- */}
        <Reveal delay={160}>
          <div className="card overflow-hidden p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-md shadow-brand-600/20">
                <PieIcon size={14} />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Today
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Flights by status
                </p>
              </div>
            </div>

            {flightStatusBreakdown.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-950/30">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600/10 text-brand-600 dark:text-brand-400">
                  <Plane size={20} />
                </span>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  No flights scheduled today
                </p>
                <p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
                  Status breakdown will appear here once flights are on the board.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="h-[180px] w-full sm:w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={flightStatusBreakdown}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        innerRadius={42}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {flightStatusBreakdown.map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={STATUS_COLORS[entry.status] || "#94a3b8"}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(v, name) => [
                          v,
                          String(name).replaceAll("_", " "),
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full flex-1 space-y-1.5 sm:w-auto">
                  {flightStatusBreakdown.map((s) => (
                    <div
                      key={s.status}
                      className="flex items-center justify-between rounded-lg px-2 py-1 text-sm transition-colors hover:bg-slate-100/60 dark:hover:bg-slate-800/50"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900"
                          style={{
                            backgroundColor:
                              STATUS_COLORS[s.status] || "#94a3b8",
                          }}
                        />
                        <span className="text-slate-600 dark:text-slate-300">
                          {s.status.replaceAll("_", " ")}
                        </span>
                      </div>
                      <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                        {s.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {/* ---------- Top routes ---------- */}
        <Reveal delay={200}>
          <div className="card overflow-hidden p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-md shadow-brand-600/20">
                <MapPinned size={14} />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Rankings
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Top routes by bookings
                </p>
              </div>
            </div>

            {topRoutes.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-950/30">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600/10 text-brand-600 dark:text-brand-400">
                  <MapPinned size={20} />
                </span>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  No route data yet
                </p>
                <p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
                  Routes will be ranked here as bookings come in.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={topRoutes.map((r) => ({
                    route: `${r.origin}→${r.destination}`,
                    bookings: r.bookings,
                  }))}
                  layout="vertical"
                  margin={{ left: 8, right: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,163,184,0.15)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    className="fill-slate-500 dark:fill-slate-400"
                  />
                  <YAxis
                    type="category"
                    dataKey="route"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={72}
                    className="fill-slate-500 dark:fill-slate-400"
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="bookings" radius={[0, 6, 6, 0]}>
                    {topRoutes.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Reveal>
      </div>

      {/* Motion */}
      <style>{`
        @keyframes aana-fade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .aana-fade { animation: aana-fade .4s ease-out both; }

        @media (prefers-reduced-motion: reduce) {
          .aana-fade { animation: none !important; }
        }
      `}</style>
    </div>
  );
}