
import { useEffect, useState } from "react";
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Thermometer,
  Eye,
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
    return (
      <CloudRain
        size={28}
        className="text-blue-400"
      />
    );
  }

  if (
    lower.includes("cloud") ||
    lower.includes("overcast")
  ) {
    return (
      <Cloud
        size={28}
        className="text-slate-400"
      />
    );
  }

  if (
    lower.includes("sunny") ||
    lower.includes("clear")
  ) {
    return (
      <Sun
        size={28}
        className="text-amber-400"
      />
    );
  }

  return (
    <Cloud
      size={28}
      className="text-slate-400"
    />
  );
}

export default function WeatherWidget({
  city,
  iata,
}: WeatherWidgetProps) {
  const [weather, setWeather] =
    useState<Weather | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(false);

  useEffect(() => {
    if (!city) return;

    setLoading(true);
    setError(false);
    setWeather(null);

    fetch(
      `/api/weather?city=${encodeURIComponent(city)}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Weather request failed"
          );
        }

        return response.json();
      })
      .then((data) => {
        if (!data) {
          throw new Error(
            "Invalid weather response"
          );
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
      <div className="card h-24 animate-pulse p-4" />
    );
  }

  if (error || !weather) {
    return null;
  }

  return (
    <div className="card p-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-400">
        <Thermometer size={14} />
        Weather at {iata} — {city}
      </p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <WeatherIcon
            condition={weather.condition}
          />

          <div>
            <p className="text-3xl font-extrabold">
              {Math.round(weather.temp_c)}°C
            </p>

            <p className="text-sm text-slate-400">
              {weather.condition}
            </p>
          </div>
        </div>

        <div className="ml-auto grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Thermometer size={12} />
            Feels{" "}
            {Math.round(weather.feels_like_c)}°C
          </div>

          <div className="flex items-center gap-1">
            <Wind size={12} />
            {Math.round(weather.wind_kph)} km/h
          </div>

          <div className="flex items-center gap-1">
            <Cloud size={12} />
            {weather.humidity}% humidity
          </div>

          <div className="flex items-center gap-1">
            <Eye size={12} />
            {weather.visibility_km} km vis.
          </div>
        </div>
      </div>
    </div>
  );
}
