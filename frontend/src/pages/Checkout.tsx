import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Lock, Plane, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { api, apiErrorMessage } from "../lib/api";
import { Booking } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

// ─── Inner form (must be inside <Elements>) ────────────────────────────────
function CheckoutForm({ booking, amount, currency }: { booking: Booking; amount: number; currency: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
        toast.error(error.message || "Payment failed. Please try again.");
      } else if (paymentIntent?.status === "succeeded") {
        toast.success("Payment confirmed! Your booking is now confirmed.");
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Booking summary */}
      <div className="card p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Booking summary</p>
        <div className="mt-3 flex items-center gap-4">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30">
            <Plane size={20} />
          </span>
          <div>
            <p className="font-bold">{f.flight_number} · {f.origin_airport?.iata_code} → {f.destination_airport?.iata_code}</p>
            <p className="text-sm text-slate-400">
              {format(new Date(f.departure_time), "EEE, MMM d · HH:mm")} · {booking.cabin_class.replace("_", " ")}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm" style={{ borderColor: "rgb(var(--border))" }}>
          <span className="text-slate-400">Ref: {booking.booking_reference}</span>
          <span className="text-xl font-extrabold text-brand-600">
            {currency.toUpperCase()} {(amount / 100).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Stripe Elements */}
      <div className="card p-5">
        <p className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Lock size={14} className="text-slate-400" /> Secure payment
        </p>
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn-primary w-full py-3 text-base transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-600/30 disabled:opacity-50"
      >
        {loading ? "Processing..." : `Pay ${currency.toUpperCase()} ${(amount / 100).toFixed(2)}`}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck size={14} /> Payments are processed securely by Stripe. SkyPort never stores your card details.
      </div>
    </form>
  );
}

// ─── Outer page (fetches PaymentIntent, wraps with <Elements>) ─────────────
export default function Checkout() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("usd");

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () =>
      (await api.get<{ data: Booking }>(`/bookings/${bookingId}`)).data.data,
    enabled: !!bookingId,
  });

  useEffect(() => {
    if (!bookingId) return;
    api
      .post<{ data: { clientSecret: string; amount: number; currency: string } }>(
        `/payments/booking/${bookingId}/intent`
      )
      .then((res) => {
        setClientSecret(res.data.data.clientSecret);
        setAmount(res.data.data.amount);
        setCurrency(res.data.data.currency);
      })
      .catch((err) => {
        toast.error(apiErrorMessage(err, "Could not initiate payment."));
      });
  }, [bookingId]);

  if (isLoading || !booking) return <LoadingSpinner label="Loading checkout..." />;
  if (!clientSecret) return <LoadingSpinner label="Preparing payment..." />;

  const appearance = {
    theme: document.documentElement.classList.contains("dark") ? "night" : "stripe" as const,
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Complete your booking</h1>
        <p className="mt-1 text-sm text-slate-400">Your seat is reserved for 15 minutes. Complete payment to confirm.</p>
      </div>
      <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
        <CheckoutForm booking={booking} amount={amount} currency={currency} />
      </Elements>
    </div>
  );
}