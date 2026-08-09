import React, { useState } from "react";
import { X, Star, ShoppingBag, ShieldCheck, Heart } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { useCurrencyStore } from "../store/useCurrencyStore";

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { formatPrice } = useCurrencyStore();
  const [selectedWeight, setSelectedWeight] = useState(product?.variants?.[0]?.weight || "500g");

  if (!product) return null;

  const isWishlisted = isInWishlist(product.id);

  const fallbackWeightOptions = [
    { label: "250g", multiplier: 0.55 },
    { label: "500g", multiplier: 1 },
    { label: "1 kg", multiplier: 1.9 },
  ];

  const weightOptions = product.variants?.length
    ? product.variants.map((variant) => ({ id: variant.id, label: variant.weight, price: Number(variant.price), mrp: variant.mrp == null ? null : Number(variant.mrp), stock: variant.stock }))
    : fallbackWeightOptions.map((option) => ({ ...option, price: Math.round(product.price * option.multiplier), mrp: null, stock: product.stock }));
  const currentVariant = weightOptions.find((option) => option.label === selectedWeight) || weightOptions[0];
  const currentPrice = currentVariant.price;
  const currentMultiplier = product.price ? currentPrice / product.price : 1;
  const imageUrl = product.images?.[0]?.url || product.imageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 text-gray-700 hover:bg-white shadow flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="md:w-1/2 bg-gray-50 relative min-h-[250px]">
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          {product.isOrganic && (
            <span className="absolute top-4 left-4 bg-[#2B4C3F] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 shadow">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" /> Organic
            </span>
          )}
        </div>

        {/* Details & Actions */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-500 text-xs font-bold mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span>
                {product.rating || "4.9"} ({product.reviewsCount || 128}{" "}
                reviews)
              </span>
            </div>

            <h2 className="text-2xl font-serif font-bold text-gray-900">
              {product.title}
            </h2>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              {product.description}
            </p>

            {/* Weight Options */}
            <div className="mt-5">
              <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wider">
                Select Packaging:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {weightOptions.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setSelectedWeight(opt.label)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      selectedWeight === opt.label
                        ? "border-[#2B4C3F] bg-[#2B4C3F] text-white"
                        : "border-gray-200 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Banner */}
            <div className="mt-5 p-3 bg-[#FAF8F5] rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">
                  Total Price
                </span>
                <span className="text-2xl font-extrabold text-gray-900">
                  {formatPrice(currentPrice)}
                </span>
                {currentVariant.mrp > currentPrice && <div className="text-xs text-gray-400 mt-1">MRP <span className="line-through">{formatPrice(currentVariant.mrp)}</span> <span className="text-emerald-700 font-bold ml-1">{Math.round((1 - currentPrice / currentVariant.mrp) * 100)}% off</span></div>}
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                In Stock & Ready to Ship
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => {
                addToCart(product, selectedWeight, currentMultiplier, currentVariant.id);
                onClose();
              }}
              className="flex-1 bg-[#2B4C3F] hover:bg-emerald-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow transition"
            >
              <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className={`p-3 rounded-xl border transition ${
                isWishlisted
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${isWishlisted ? "fill-red-600" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
