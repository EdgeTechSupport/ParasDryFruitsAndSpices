import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useOrderHistoryStore = create()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (userId, cartItems, totalAmount, id) => {
        const newOrder = {
          id: id || `PARAS-${Date.now().toString().slice(-6)}`,
          userId: userId || "guest",
          date: new Date().toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          items: cartItems,
          totalAmount,
          status: "PENDING_WHATSAPP",
        };

        set({ orders: [newOrder, ...get().orders] });
        return newOrder.id;
      },

      getUserOrders: (userId) => {
        return get().orders.filter((o) => o.userId === userId);
      },
    }),
    { name: "paras-order-history-storage" },
  ),
);
