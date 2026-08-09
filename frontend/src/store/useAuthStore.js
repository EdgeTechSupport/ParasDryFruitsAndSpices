import { create } from "zustand";
import { useCartStore } from "./useCartStore";
import { useWishlistStore } from "./useWishlistStore";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("paras_user")) || null,
  token: localStorage.getItem("paras_token") || null,

  setAuth: (user, token) => {
    localStorage.setItem("paras_user", JSON.stringify(user));
    localStorage.setItem("paras_token", token);
    set({ user, token });

    if (user?.id) {
      useCartStore.getState().loadUserCart(user.id);
      useWishlistStore.getState().loadUserWishlist(user.id);
    }
  },

  logout: () => {
    localStorage.removeItem("paras_user");
    localStorage.removeItem("paras_token");
    set({ user: null, token: null });

    useCartStore.getState().loadUserCart(null);
    useWishlistStore.getState().loadUserWishlist(null);
  },
}));
