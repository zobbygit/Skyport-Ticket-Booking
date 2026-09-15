import { create } from "zustand";

interface CurrencyState {
  currency: string;
  symbol: string;
  rate: number;
  setCurrency: (code: string, symbol: string, rate: number) => void;
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  currency: localStorage.getItem("skyport_currency") || "USD",
  symbol: localStorage.getItem("skyport_symbol") || "$",
  rate: Number(localStorage.getItem("skyport_rate")) || 1,

  setCurrency: (currency, symbol, rate) => {
    localStorage.setItem("skyport_currency", currency);
    localStorage.setItem("skyport_symbol", symbol);
    localStorage.setItem("skyport_rate", String(rate));

    set({
      currency,
      symbol,
      rate,
    });
  },
}));