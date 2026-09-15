import { useCurrencyStore } from "../store/currencyStore";

export function usePrice() {
  const { symbol, rate, currency } = useCurrencyStore();

  function format(usdAmount: number): string {
    const converted = usdAmount * rate;
    return `${symbol}${converted.toFixed(converted >= 100 ? 0 : 2)}`;
  }

  return { format, symbol, rate, currency };
}