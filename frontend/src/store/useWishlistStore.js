import { create } from "zustand";

export const useWishlistStore = create((set, get) => ({
  wishlist: [],
  currentUserId: null,

  loadUserWishlist: (userId) => {
    if (!userId) {
      set({ wishlist: [], currentUserId: null });
      return;
    }
    const savedWishlist = localStorage.getItem(`paras-wishlist-${userId}`);
    set({
      wishlist: savedWishlist ? JSON.parse(savedWishlist) : [],
      currentUserId: userId,
    });
  },

  toggleWishlist: (product) => {
    const wishlist = get().wishlist;
    const exists = wishlist.some((item) => item.id === product.id);
    let updatedWishlist;

    if (exists) {
      updatedWishlist = wishlist.filter((item) => item.id !== product.id);
    } else {
      updatedWishlist = [...wishlist, product];
    }

    set({ wishlist: updatedWishlist });

    const userId = get().currentUserId;
    if (userId) {
      localStorage.setItem(
        `paras-wishlist-${userId}`,
        JSON.stringify(updatedWishlist),
      );
    }
  },

  isInWishlist: (productId) => {
    return get().wishlist.some((item) => item.id === productId);
  },
}));
