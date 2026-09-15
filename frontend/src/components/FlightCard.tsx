import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Plane } from "lucide-react";

import { Flight } from "../types";
import StatusBadge from "./StatusBadge";
import { useCurrencyStore } from "../store/currencyStore";

export default function FlightCard({ flight }: { flight: Flight }) {
  const { symbol, rate } = useCurrencyStore();

  const convertedPrice = Number(flight.base_price) * rate;

  return (
    <Link
      to={`/flights/${flight.id}`}
      className="card block p-5 transition hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-brand-600">
          <Plane size={16} /> {flight.flight_number} · {flight.airline}
        </div>

        <StatusBadge status={flight.status} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">
            {flight.origin_airport.iata_code}
          </p>

          <p className="text-xs text-slate-400">
            {format(new Date(flight.departure_time), "MMM d, HH:mm")}
          </p>
        </div>

        <div
          className="mx-4 flex-1 border-t border-dashed"
          style={{ borderColor: "rgb(var(--border))" }}
        />

        <div className="text-right">
          <p className="text-2xl font-bold">
            {flight.destination_airport.iata_code}
          </p>

          <p className="text-xs text-slate-400">
            {format(new Date(flight.arrival_time), "MMM d, HH:mm")}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
        <span>
          {flight.terminal
            ? `Terminal ${flight.terminal.code}`
            : "Terminal TBD"}{" "}
          {flight.gate ? `· Gate ${flight.gate.code}` : ""}
        </span>

        <span className="font-semibold text-slate-600 dark:text-slate-300">
          {symbol}
          {convertedPrice.toFixed(0)}
        </span>
      </div>
    </Link>
  );
}