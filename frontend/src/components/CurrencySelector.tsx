import { useEffect, useState } from "react";
import { ChevronDown, Coins } from "lucide-react";
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
      const res = await api.get<{
        data: {
          converted: number;
          symbol: string;
        };
      }>(
        `/pricing/convert?amount=1&from=USD&to=${code}`
      );

      setCurrency(
        code,
        res.data.data.symbol,
        res.data.data.converted
      );
    } catch (error) {
      console.error("Currency conversion failed:", error);
    }
  }

  const active = currencies.find((c) => c.code === currency);

  return (
    <label className="cs-fade group relative inline-flex cursor-pointer items-center">
      {/* Styled shell */}
      <span
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-brand-300 group-hover:text-brand-600 group-focus-within:border-brand-400 group-focus-within:ring-2 group-focus-within:ring-brand-500/25 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:group-hover:border-brand-700 dark:group-hover:text-brand-400 dark:group-focus-within:border-brand-600"
      >
        <Coins
          size={13}
          className="text-brand-500 transition-colors group-hover:text-brand-600 dark:text-brand-400 dark:group-hover:text-brand-300"
        />

        <span className="tabular-nums">
          {active ? (
            <>
              <span className="text-slate-500 dark:text-slate-400">
                {active.symbol}
              </span>
              <span className="ml-1 text-slate-800 dark:text-white">
                {active.code}
              </span>
            </>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">
              Currency
            </span>
          )}
        </span>

        <ChevronDown
          size={12}
          className="text-slate-500 transition-transform duration-300 group-focus-within:rotate-180 dark:text-slate-300"
        />
      </span>

      {/* Real <select>, visually hidden but fully interactive */}
      <select
        value={currency}
        onChange={(e) => handleChange(e.target.value)}
        aria-label="Select currency"
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-xl bg-transparent text-transparent opacity-0 outline-none"
      >
        {currencies.map((c) => (
          <option
            key={c.code}
            value={c.code}
            className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
          >
            {c.symbol} {c.code}
          </option>
        ))}
      </select>

      <style>{`
        @keyframes cs-fade {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cs-fade { animation: cs-fade .3s ease-out both; }

        @media (prefers-reduced-motion: reduce) {
          .cs-fade { animation: none !important; }
        }
      `}</style>
    </label>
  );
}