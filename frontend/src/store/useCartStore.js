import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  cart: [],
  isCartOpen: false,
  discountCode: "",
  discountPercent: 0,
  currentUserId: null,

  loadUserCart: (userId) => {
    if (!userId) {
      set({ cart: [], currentUserId: null });
      return;
    }
    const savedCart = localStorage.getItem(`paras-cart-${userId}`);
    set({
      cart: savedCart ? JSON.parse(savedCart) : [],
      currentUserId: userId,
    });
  },

  saveToStorage: (newCart) => {
    const userId = get().currentUserId;
    if (userId) {
      localStorage.setItem(`paras-cart-${userId}`, JSON.stringify(newCart));
    }
  },

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  addToCart: (product, selectedWeight = "500g", priceMultiplier = 1, selectedVariantId = null) => {
    const cart = get().cart;
    const cartItemId = `${product.id}-${selectedWeight}`;
    const calculatedPrice = product.price * priceMultiplier;

    const existing = cart.find((item) => item.cartItemId === cartItemId);
    let updatedCart;

    if (existing) {
      updatedCart = cart.map((item) =>
        item.cartItemId === cartItemId ? { ...item, qty: item.qty + 1 } : item,
      );
    } else {
      updatedCart = [
        ...cart,
        {
          ...product,
          cartItemId,
          selectedWeight,
          selectedVariantId,
          calculatedPrice,
          qty: 1,
        },
      ];
    }

    set({ cart: updatedCart, isCartOpen: true });
    get().saveToStorage(updatedCart);
  },

  updateQuantity: (cartItemId, newQty) => {
    if (newQty <= 0) {
      get().removeFromCart(cartItemId);
      return;
    }
    const updatedCart = get().cart.map((item) =>
      item.cartItemId === cartItemId ? { ...item, qty: newQty } : item,
    );
    set({ cart: updatedCart });
    get().saveToStorage(updatedCart);
  },

  removeFromCart: (cartItemId) => {
    const updatedCart = get().cart.filter(
      (item) => item.cartItemId !== cartItemId,
    );
    set({ cart: updatedCart });
    get().saveToStorage(updatedCart);
  },

  clearCart: () => {
    const userId = get().currentUserId;
    if (userId) {
      localStorage.removeItem(`paras-cart-${userId}`);
    }
    set({ cart: [], discountCode: "", discountPercent: 0 });
  },

  applyDiscount: (code, discount) => set({ discountCode: code, discountPercent: discount }),

  removeDiscount: () => set({ discountCode: "", discountPercent: 0 }),

  getSubtotal: () =>
    get().cart.reduce(
      (total, item) => total + item.calculatedPrice * item.qty,
      0,
    ),

  getDiscountAmount: () => {
    const subtotal = get().getSubtotal();
    return Math.round((subtotal * get().discountPercent) / 100);
  },

  getTotalAmount: () => get().getSubtotal() - get().getDiscountAmount(),
}));
