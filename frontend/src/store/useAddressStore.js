import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAddressStore = create()(
  persist(
    (set) => ({
      address: {
        street: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
      },
      setAddress: (newAddress) => set({ address: newAddress }),
      clearAddress: () =>
        set({
          address: {
            street: "",
            city: "",
            state: "",
            pincode: "",
            landmark: "",
          },
        }),
    }),
    { name: "paras-address-storage" },
  ),
);
