import { useEffect, useState } from "react";
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Thermometer,
  Eye,
  Droplets,
  Radio,
  Sparkles,
} from "lucide-react";

interface Weather {
  temp_c: number;
  condition: string;
  icon: string;
  wind_kph: number;
  humidity: number;
  visibility_km: number;
  feels_like_c: number;
}

interface WeatherWidgetProps {
  city: string;
  iata: string;
}

function WeatherIcon({ condition }: { condition: string }) {
  const lower = condition.toLowerCase();

  if (lower.includes("rain") || lower.includes("drizzle")) {
    return <CloudRain size={26} className="text-sky-400" />;
  }

  if (lower.includes("cloud") || lower.includes("overcast")) {
    return <Cloud size={26} className="text-slate-400" />;
  }

  if (lower.includes("sunny") || lower.includes("clear")) {
    return <Sun size={26} className="text-amber-400" />;
  }

  return <Cloud size={26} className="text-slate-400" />;
}

function iconTone(condition: string) {
  const lower = condition.toLowerCase();
  if (lower.includes("rain") || lower.includes("drizzle")) {
    return "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-900/30 dark:text-sky-400 dark:ring-sky-900/40";
  }
  if (lower.includes("sunny") || lower.includes("clear")) {
    return "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-900/40";
  }
  return "bg-slate-50 text-slate-500 ring-slate-100 dark:bg-slate-900/40 dark:text-slate-400 dark:ring-slate-800/60";
}

export default function WeatherWidget({ city, iata }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!city) return;

    setLoading(true);
    setError(false);
    setWeather(null);

    fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Weather request failed");
        }
        return response.json();
      })
      .then((data) => {
        if (!data) {
          throw new Error("Invalid weather response");
        }

        setWeather({
          temp_c: data.temp_c,
          condition: data.condition,
          icon: data.icon,
          wind_kph: data.wind_kph,
          humidity: data.humidity,
          visibility_km: data.visibility_km,
          feels_like_c: data.feels_like_c,
        });
      })
      .catch(() => {
        setError(true);
        setWeather(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [city]);

  if (loading) {
    return (
      <div className="card relative h-32 overflow-hidden p-4">
        <div className="wf-sheen pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative flex h-full items-center gap-4">
          <div className="h-14 w-14 shrink-0 rounded-2xl bg-slate-100 dark:bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-6 w-20 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="hidden grid-cols-2 gap-2 sm:grid">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-7 w-20 rounded-lg bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return null;
  }

  return (
    <div className="card wf-fade relative overflow-hidden p-4 sm:p-5">
      {/* Corner glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl dark:bg-brand-500/15" />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400">
            <Thermometer size={15} className="wf-float" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Live conditions
            </p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Weather at {iata} — {city}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
          <span className="wf-pulse h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Live
        </span>
      </div>

      {/* Body */}
      <div className="relative mt-4 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
        {/* Temp tile */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/60 p-3 dark:border-slate-800/70 dark:bg-slate-950/40">
          <span
            className={`grid h-12 w-12 place-items-center rounded-xl ring-1 ${iconTone(
              weather.condition
            )}`}
          >
            <WeatherIcon condition={weather.condition} />
          </span>

          <div>
            <p className="text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              {Math.round(weather.temp_c)}
              <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400">
                °C
              </span>
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {weather.condition}
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MetricTile
            icon={<Thermometer size={12} />}
            label="Feels"
            value={`${Math.round(weather.feels_like_c)}°C`}
          />
          <MetricTile
            icon={<Wind size={12} />}
            label="Wind"
            value={`${Math.round(weather.wind_kph)} km/h`}
          />
          <MetricTile
            icon={<Droplets size={12} />}
            label="Humidity"
            value={`${weather.humidity}%`}
          />
          <MetricTile
            icon={<Eye size={12} />}
            label="Visibility"
            value={`${weather.visibility_km} km`}
          />
        </div>
      </div>

      {/* Motion */}
      <style>{`
        @keyframes wf-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes wf-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,.55); }
          50% { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
        }
        @keyframes wf-sheen {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes wf-fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .wf-float { animation: wf-float 3s ease-in-out infinite; }
        .wf-pulse { animation: wf-pulse 2s ease-out infinite; }
        .wf-fade { animation: wf-fade .4s ease-out both; }

        .wf-sheen {
          background: linear-gradient(
            100deg,
            transparent 20%,
            rgba(148,163,184,.22) 45%,
            rgba(148,163,184,.35) 50%,
            rgba(148,163,184,.22) 55%,
            transparent 80%
          );
          background-size: 200% 100%;
          animation: wf-sheen 1.6s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .wf-float, .wf-pulse, .wf-fade, .wf-sheen { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

function MetricTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white/60 px-2.5 py-2 transition hover:-translate-y-0.5 hover:border-brand-200 dark:border-slate-800/70 dark:bg-slate-900/40 dark:hover:border-brand-900/60">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}