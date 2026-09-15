import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";

// Supported currencies with approximate exchange rates from USD
// In production swap fetch() call for a live rates API (e.g. open.er-api.com — free tier)
const BASE_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.5, AED: 3.67,
  CAD: 1.36, AUD: 1.53, SGD: 1.34, JPY: 149.5, CHF: 0.89,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹", AED: "د.إ",
  CAD: "CA$", AUD: "A$", SGD: "S$", JPY: "¥", CHF: "Fr",
};

export const pricingController = {
  convert: asyncHandler(async (req: Request, res: Response) => {
    const { amount, from = "USD", to = "USD" } = req.query;
    const amountNum = Number(amount);
    if (isNaN(amountNum)) return res.status(400).json({ success: false, message: "amount must be a number." });

    const fromRate = BASE_RATES[String(from).toUpperCase()] || 1;
    const toRate = BASE_RATES[String(to).toUpperCase()] || 1;
    const converted = (amountNum / fromRate) * toRate;

    res.json({
      success: true,
      data: {
        from: String(from).toUpperCase(),
        to: String(to).toUpperCase(),
        original: amountNum,
        converted: Math.round(converted * 100) / 100,
        symbol: CURRENCY_SYMBOLS[String(to).toUpperCase()] || String(to).toUpperCase(),
      },
    });
  }),

  currencies: asyncHandler(async (_req: Request, res: Response) => {
    const list = Object.entries(BASE_RATES).map(([code]) => ({
      code,
      symbol: CURRENCY_SYMBOLS[code] || code,
    }));
    res.json({ success: true, data: list });
  }),
};