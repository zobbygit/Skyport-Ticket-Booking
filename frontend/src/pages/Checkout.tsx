import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements, PaymentElement, useElements, useStripe,
} from "@stripe/react-stripe-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Lock, Plane, Plus, ShieldCheck, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { api, apiErrorMessage } from "../lib/api";
import { Booking } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface Addon { id: string; type: string; label: string; price_usd: number; }
interface AddonCatalogItem { type: string; label: string; price_usd: number; }

function CheckoutForm({
  booking, amount, currency, addons,
}: { booking: Booking; amount: number; currency: string; addons: Addon[] }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const addonsTotal = addons.reduce((s, a) => s + Number(a.price_usd), 0);
  const total = amount + Math.round(addonsTotal * 100);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({ elements, redirect: "if_required" });
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
      <div className="card p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Booking summary</p>
        <div className="mt-3 flex items-center gap-4">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30">
            <Plane size={20} />
          </span>
          <div>
            <p className="font-bold">{f.flight_number} · {f.origin_airport?.iata_code} → {f.destination_airport?.iata_code}</p>
            <p className="text-sm text-slate-400">
              {format(new Date(f.departure_time), "EEE, MMM d · HH:mm")} · {booking.cabin_class.replace("_", " ")} · {booking.passenger_count} pax
            </p>
          </div>
        </div>
        <div className="mt-3 border-t pt-3 space-y-1 text-sm" style={{ borderColor: "rgb(var(--border))" }}>
          <div className="flex justify-between"><span className="text-slate-400">Flights</span><span>${(amount / 100).toFixed(2)}</span></div>
          {addons.map((a) => (
            <div key={a.id} className="flex justify-between text-slate-400"><span>{a.label}</span><span>${Number(a.price_usd).toFixed(2)}</span></div>
          ))}
          <div className="flex justify-between border-t pt-2 font-bold text-brand-600" style={{ borderColor: "rgb(var(--border))" }}>
            <span>Total</span><span>{currency.toUpperCase()} ${(total / 100).toFixed(2)}</span>
          </div>
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
        {loading ? "Processing..." : `Pay ${currency.toUpperCase()} $${(total / 100).toFixed(2)}`}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck size={14} /> Secured by Stripe. SkyPort never stores card details.
      </div>
    </form>
  );
}

export default function Checkout() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const qc = useQueryClient();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("usd");
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
      setCurrency(res.data.data.currency);
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
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Complete your booking</h1>
        <p className="mt-1 text-sm text-slate-400">Seat reserved · Complete payment to confirm.</p>
      </div>

      {/* Add-ons */}
      <div className="card mb-5 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold">Extras & add-ons</p>
          <button onClick={() => setShowCatalog((v) => !v)} className="btn-secondary text-sm"><Plus size={14} /> Add extras</button>
        </div>

        {addons && addons.length > 0 && (
          <div className="space-y-2 mb-3">
            {addons.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "rgb(var(--border))" }}>
                <span>{a.label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">${Number(a.price_usd).toFixed(2)}</span>
                  <button onClick={() => removeAddon(a.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCatalog && (
          <div className="grid gap-2 sm:grid-cols-2">
            {catalog?.map((item) => (
              <button
                key={item.type}
                onClick={() => { addAddon(item.type); setShowCatalog(false); }}
                className="card flex flex-col items-start p-3 text-left hover:-translate-y-0.5 hover:shadow-md transition text-sm"
              >
                <span className="font-semibold">{item.label}</span>
                <span className="text-brand-600 font-bold">+${item.price_usd}</span>
              </button>
            ))}
          </div>
        )}

        {(!addons || addons.length === 0) && !showCatalog && (
          <p className="text-sm text-slate-400">No extras added yet. Click "Add extras" to include baggage, lounge access, and more.</p>
        )}
      </div>

      <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
        <CheckoutForm booking={booking} amount={amount} currency={currency} addons={addons || []} />
      </Elements>
    </div>
  );
}