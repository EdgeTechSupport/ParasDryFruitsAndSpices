import { create } from "zustand";

export const useCurrencyStore = create((set, get) => ({
  currency: "INR",

  rates: {
    INR: { symbol: "₹", rate: 1 },
    USD: { symbol: "$", rate: 0.012 },
    AED: { symbol: "AED ", rate: 0.044 },
  },

  setCurrency: (currency) => set({ currency }),

  formatPrice: (amountInINR) => {
    const { currency, rates } = get();
    const current = rates[currency] || rates.INR;
    const converted = Math.round(amountInINR * current.rate);
    return `${current.symbol}${converted.toLocaleString()}`;
  },
}));
