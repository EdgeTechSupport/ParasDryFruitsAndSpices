import React from "react";
import { X, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlistStore } from "../store/useWishlistStore";
import { useCartStore } from "../store/useCartStore";
import { useCurrencyStore } from "../store/useCurrencyStore";

export default function WishlistDrawer({ isOpen, onClose }) {
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const { formatPrice } = useCurrencyStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 bg-[#1A2B22] text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <h2 className="text-lg font-bold font-serif">Saved Wishlist</h2>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Item List */}
        <div className="p-4 flex-1 overflow-y-auto divide-y divide-gray-100">
          {wishlist.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4 stroke-1" />
              <p className="text-lg font-medium">Your Wishlist is Empty</p>
              <p className="text-xs text-gray-400 mt-1">
                Tap the heart icon on any product to save it for later.
              </p>
            </div>
          ) : (
            wishlist.map((item) => (
              <div key={item.id} className="py-4 flex gap-4 items-center">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-xl border"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-sm font-bold text-[#2B4C3F] mt-1">
                    {formatPrice(item.price)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      addToCart(item, "500g", 1);
                      toggleWishlist(item);
                    }}
                    className="bg-[#2B4C3F] hover:bg-emerald-900 text-white text-xs font-bold p-2.5 rounded-xl flex items-center gap-1"
                    title="Move to Cart"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
                  </button>
                  <button
                    onClick={() => toggleWishlist(item)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
