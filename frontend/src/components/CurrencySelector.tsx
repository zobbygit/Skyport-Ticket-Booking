import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useCurrencyStore } from "../store/currencyStore";

interface Currency { code: string; symbol: string; }

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrencyStore();
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  useEffect(() => {
    api.get<{ data: Currency[] }>("/pricing/currencies")
      .then((r) => setCurrencies(r.data.data))
      .catch(() => {});
  }, []);

  async function handleChange(code: string) {
    const cur = currencies.find((c) => c.code === code);
    if (!cur) return;
    try {
      const res = await api.get<{ data: { converted: number; symbol: string } }>(
        `/pricing/convert?amount=1&from=USD&to=${code}`
      );
      setCurrency(code, res.data.data.symbol, res.data.data.converted);
    } catch {
      setCurrency(code, cur.symbol, 1);
    }
  }

  return (
    <select
      value={currency}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-xl border bg-transparent px-2 py-1.5 text-xs font-semibold outline-none transition hover:bg-black/5 dark:hover:bg-white/5"
      style={{ borderColor: "rgb(var(--border))" }}
    >
      {currencies.map((c) => (
        <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
      ))}
    </select>
  );
}