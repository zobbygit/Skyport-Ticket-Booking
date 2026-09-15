import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements, PaymentElement, useElements, useStripe,
} from "@stripe/react-stripe-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  BadgeCheck,
  ChevronRight,
  Lock,
  Luggage,
  Plane,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { api, apiErrorMessage } from "../lib/api";
import { Booking } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import { useCurrencyStore } from "../store/currencyStore";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface Addon { id: string; type: string; label: string; price_usd: number; }
interface AddonCatalogItem { type: string; label: string; price_usd: number; }

function CheckoutForm({
  booking,
  amount,
  addons,
}: {
  booking: Booking;
  amount: number;
  addons: Addon[];
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const { symbol, rate, currency } = useCurrencyStore();

  const addonsTotal = addons.reduce(
    (sum, a) => sum + Number(a.price_usd),
    0
  );

  // Stripe amount is in USD cents.
  const flightAmountUsd = amount / 100;
  const totalUsd = flightAmountUsd + addonsTotal;

  // Display-only conversion.
  const displayFlightAmount = flightAmountUsd * rate;
  const displayAddonsTotal = addonsTotal * rate;
  const displayTotal = totalUsd * rate;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Payment failed.");
      } else if (paymentIntent?.status === "succeeded") {
        toast.success("Payment confirmed! Booking is now confirmed.");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, "Payment failed."));
    } finally {
      setLoading(false);
    }
  }

  const f = booking.flight;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Booking summary */}
      <div className="card p-5 sm:p-6">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
          <Sparkles size={12} className="text-brand-600 dark:text-brand-400" />
          Booking summary
        </p>

        <div className="mt-4 flex items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/30">
            <Plane size={20} />
          </span>

          <div className="min-w-0">
            <p className="truncate font-bold">
              {f.flight_number} · {f.origin_airport?.iata_code} →{" "}
              {f.destination_airport?.iata_code}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {format(new Date(f.departure_time), "EEE, MMM d · HH:mm")}
            </p>
          </div>
        </div>

        {/* Meta chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {booking.cabin_class.replace("_", " ")}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {booking.passenger_count} pax
          </span>
        </div>

        {/* Line items */}
        <div className="mt-4 space-y-2 border-t border-dashed border-slate-200 pt-4 text-sm dark:border-slate-800">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Flights</span>
            <span className="tabular-nums">
              {symbol}
              {displayFlightAmount.toFixed(2)}
            </span>
          </div>

          {addons.map((a) => (
            <div
              key={a.id}
              className="flex justify-between text-slate-500 dark:text-slate-400"
            >
              <span>{a.label}</span>
              <span className="tabular-nums">
                {symbol}
                {(Number(a.price_usd) * rate).toFixed(2)}
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between border-t border-slate-200 pt-3 font-bold dark:border-slate-800">
            <span>Total</span>
            <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-lg tabular-nums text-transparent dark:from-brand-400 dark:to-indigo-400">
              {symbol}
              {displayTotal.toFixed(2)}
            </span>
          </div>
        </div>

        <p className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-100/80 px-2.5 py-1 text-[11px] text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
          <span className="h-1 w-1 rounded-full bg-brand-500" />
          Displayed in {currency}. Payment is processed in USD.
        </p>
      </div>

      {/* Stripe Elements */}
      <div className="card p-5 sm:p-6">
        <p className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400">
            <Lock size={13} />
          </span>
          Secure payment
          <span className="ml-auto text-[11px] font-normal text-slate-500 dark:text-slate-400">
            Encrypted via Stripe
          </span>
        </p>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
          <PaymentElement />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn-primary co-sheen group relative w-full overflow-hidden py-3.5 text-base transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-600/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        {loading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Processing…
          </span>
        ) : (
          <span className="inline-flex items-center justify-center gap-2">
            <BadgeCheck size={17} />
            Pay {symbol}
            {displayTotal.toFixed(2)}
          </span>
        )}
      </button>

      <div className="flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-500" />
          Secured by Stripe
        </span>
        <span className="h-3 w-px bg-slate-200 dark:bg-slate-800" />
        <span>SkyPort never stores card details</span>
      </div>
    </form>
  );
}

export default function Checkout() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const qc = useQueryClient();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const { symbol, rate, currency } = useCurrencyStore();
  const [showCatalog, setShowCatalog] = useState(false);

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => (await api.get<{ data: Booking }>(`/bookings/${bookingId}`)).data.data,
    enabled: !!bookingId,
  });

  const { data: catalog } = useQuery({
    queryKey: ["addons-catalog"],
    queryFn: async () => (await api.get<{ data: AddonCatalogItem[] }>("/addons/catalog")).data.data,
  });

  const { data: addons, refetch: refetchAddons } = useQuery({
    queryKey: ["addons", bookingId],
    queryFn: async () => (await api.get<{ data: Addon[] }>(`/addons/booking/${bookingId}`)).data.data,
    enabled: !!bookingId,
  });

  useEffect(() => {
    if (!bookingId) return;
    api.post<{ data: { clientSecret: string; amount: number; currency: string } }>(
      `/payments/booking/${bookingId}/intent`
    ).then((res) => {
      setClientSecret(res.data.data.clientSecret);
      setAmount(res.data.data.amount);
    }).catch((err) => toast.error(apiErrorMessage(err, "Could not initiate payment.")));
  }, [bookingId]);

  async function addAddon(type: string) {
    try {
      await api.post(`/addons/booking/${bookingId}`, { type });
      refetchAddons();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function removeAddon(id: string) {
    try {
      await api.delete(`/addons/${id}`);
      refetchAddons();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  if (isLoading || !booking) return <LoadingSpinner label="Loading checkout..." />;
  if (!clientSecret) return <LoadingSpinner label="Preparing payment..." />;

  const appearance = {
    theme: (document.documentElement.classList.contains("dark") ? "night" : "stripe") as "night" | "stripe",
  };

  return (
    <div className="mx-auto max-w-lg">
      {/* Header */}
      <div className="mb-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <Lock size={12} />
          Secure checkout
        </span>

        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          Complete{" "}
          <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400">
            your booking
          </span>
        </h1>

        <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="h-1 w-1 rounded-full bg-brand-500" />
          Seat reserved · Complete payment to confirm
        </p>

        {/* Progress strip */}
        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-700 dark:text-emerald-400">
            <BadgeCheck size={12} /> Select
          </span>
          <ChevronRight size={12} className="text-slate-400" />
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
              showCatalog
                ? "bg-brand-500/10 text-brand-700 dark:text-brand-400"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            Extras
          </span>
          <ChevronRight size={12} className="text-slate-400" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-2.5 py-1 text-white shadow-sm shadow-brand-600/30">
            <Lock size={12} /> Pay
          </span>
        </div>
      </div>

      {/* Add-ons */}
      <div className="card mb-5 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400">
              <Luggage size={14} />
            </span>
            <p className="font-semibold tracking-tight">Extras & add-ons</p>
            {addons && addons.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {addons.length}
              </span>
            )}
          </div>

          <button
            onClick={() => setShowCatalog((v) => !v)}
            className="btn-secondary group inline-flex items-center gap-1.5 text-sm"
          >
            {showCatalog ? (
              <>
                <X size={14} className="transition-transform group-hover:rotate-90" />
                Close
              </>
            ) : (
              <>
                <Plus size={14} className="transition-transform group-hover:rotate-90" />
                Add extras
              </>
            )}
          </button>
        </div>

        {addons && addons.length > 0 && (
          <div className="mb-3 space-y-2">
            {addons.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2.5 text-sm dark:border-slate-800/80 dark:bg-slate-950/40"
              >
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {a.label}
                  </span>
                </span>

                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-white px-2 py-1 text-xs font-semibold tabular-nums text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800">
                    {symbol}
                    {(Number(a.price_usd) * rate).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeAddon(a.id)}
                    aria-label={`Remove ${a.label}`}
                    className="grid h-7 w-7 place-items-center rounded-full border border-red-200 text-red-500 transition hover:-translate-y-0.5 hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/30"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCatalog && (
          <div className="co-fade grid gap-2 sm:grid-cols-2">
            {catalog?.map((item) => (
              <button
                key={item.type}
                onClick={() => { addAddon(item.type); setShowCatalog(false); }}
                className="group card flex flex-col items-start gap-1.5 p-3 text-left text-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md dark:hover:border-brand-900/60"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400">
                    <Plus size={12} className="transition-transform group-hover:rotate-90" />
                  </span>
                  {item.label}
                </span>
                <span className="ml-8 text-xs font-bold tabular-nums text-brand-600 dark:text-brand-400">
                  +{symbol}
                  {(Number(item.price_usd) * rate).toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        )}

        {(!addons || addons.length === 0) && !showCatalog && (
          <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/30">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400">
              <Luggage size={14} />
            </span>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No extras added yet. Add baggage, lounge access, priority boarding, and more.
            </p>
          </div>
        )}
      </div>

      <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
        <CheckoutForm
          booking={booking}
          amount={amount}
          addons={addons || []}
        />
      </Elements>

      {/* Motion */}
      <style>{`
        @keyframes co-fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes co-sheen {
          from { transform: translateX(-120%); }
          to { transform: translateX(220%); }
        }

        .co-fade { animation: co-fade .35s ease-out both; }

        .co-sheen::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            100deg,
            transparent 0%,
            rgba(255,255,255,.35) 45%,
            rgba(255,255,255,.55) 50%,
            rgba(255,255,255,.35) 55%,
            transparent 100%
          );
          transform: translateX(-120%);
          pointer-events: none;
        }
        .co-sheen:hover::after {
          animation: co-sheen .9s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .co-fade, .co-sheen::after { animation: none !important; }
        }
      `}</style>
    </div>
  );
}