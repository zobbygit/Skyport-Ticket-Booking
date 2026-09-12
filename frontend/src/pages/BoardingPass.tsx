import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { Plane, Printer, ShieldCheck } from "lucide-react";
import { api } from "../lib/api";
import { Booking } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuthStore } from "../store/authStore";

export default function BoardingPass() {
  const { id } = useParams();
  const account = useAuthStore((s) => s.account);

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: async () => (await api.get<{ data: Booking }>(`/bookings/${id}`)).data.data,
    enabled: !!id,
  });

  if (isLoading || !booking) return <LoadingSpinner label="Loading your boarding pass..." />;
  const f = booking.flight;

  const qrPayload = JSON.stringify({
    ref: booking.booking_reference,
    flight: f.flight_number,
    seat: booking.seat || "TBD",
    date: f.departure_time,
  });

  return (
    <div className="mx-auto max-w-2xl animate-[fadeInUp_0.5s_ease-out]">
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="mb-6 text-center no-print">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
          <ShieldCheck size={22} />
        </span>
        <h1 className="mt-3 text-2xl font-bold">You're checked in</h1>
        <p className="text-sm text-slate-400">Save this pass, screenshot it, or print it for the gate.</p>
      </div>

      {/* Ticket */}
      <div className="relative flex flex-col overflow-hidden rounded-3xl shadow-xl shadow-black/10 sm:flex-row">
        {/* Main stub */}
        <div className="relative flex-1 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-6 text-white sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

          <div className="relative flex items-center justify-between">
            <span className="flex items-center gap-2 text-lg font-extrabold tracking-tight"><Plane size={20} /> SkyPort</span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
              {booking.cabin_class.replace("_", " ")}
            </span>
          </div>

          <div className="relative mt-8 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-brand-100">From</p>
              {/* <p className="text-4xl font-black">{f.origin_airport.iata_code}</p> */}
              <p className="text-sm text-brand-100">{f.origin_airport.city}</p>
            </div>
            <div className="flex flex-1 flex-col items-center px-4">
              <Plane size={18} className="rotate-90 text-brand-200" />
              <div className="mt-1 h-px w-full border-t border-dashed border-white/30" />
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-brand-100">To</p>
              <p className="text-4xl font-black">{f.destination_airport.iata_code}</p>
              <p className="text-sm text-brand-100">{f.destination_airport.city}</p>
            </div>
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-5 text-sm sm:grid-cols-4">
            <Field label="Passenger" value={account?.full_name || "Guest passenger"} />
            <Field label="Flight" value={f.flight_number} />
            <Field label="Date" value={format(new Date(f.departure_time), "MMM d, yyyy")} />
            <Field label="Boarding" value={f.boarding_time ? format(new Date(f.boarding_time), "HH:mm") : "TBD"} />
            <Field label="Gate" value={f.gate?.code || "TBD"} />
            <Field label="Terminal" value={f.terminal?.code || "TBD"} />
            <Field label="Seat" value={booking.seat || "Assigned at gate"} />
            <Field label="Group" value={booking.boarding_group || "—"} />
          </div>
        </div>

        {/* Perforated divider */}
        <div className="relative hidden w-0 sm:block">
          <div className="absolute -left-3 top-0 h-6 w-6 -translate-y-1/2 rounded-full" style={{ backgroundColor: "rgb(var(--bg))" }} />
          <div className="absolute -left-3 bottom-0 h-6 w-6 translate-y-1/2 rounded-full" style={{ backgroundColor: "rgb(var(--bg))" }} />
          <div className="h-full border-l-2 border-dashed border-white/40" />
        </div>

        {/* QR stub */}
        <div className="card flex flex-row items-center justify-between gap-4 !rounded-none p-6 sm:w-56 sm:flex-col sm:justify-center sm:!rounded-r-3xl">
          <div className="rounded-xl bg-white p-2 shadow-inner">
            <QRCodeSVG value={qrPayload} size={112} />
          </div>
          <div className="text-right sm:text-center">
            <p className="text-xs text-slate-400">Reference</p>
            <p className="font-mono text-lg font-bold tracking-widest">{booking.booking_reference}</p>
          </div>
        </div>
      </div>

      <button onClick={() => window.print()} className="btn-secondary mt-6 w-full no-print">
        <Printer size={16} /> Print boarding pass
      </button>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-brand-200">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}