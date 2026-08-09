import React, { useState } from "react";
import {
  Star,
  ShoppingBag,
  ShieldCheck,
  Heart,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { useCurrencyStore } from "../store/useCurrencyStore";
import ProductModal from "./ProductModal";

export default function ProductCard({ product }) {
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { formatPrice } = useCurrencyStore();

  const [selectedWeight, setSelectedWeight] = useState(
    product.variants?.[0]?.weight || "500g",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const isWishlisted = isInWishlist(product.id);

  const fallbackWeightOptions = [
    { label: "250g", multiplier: 0.55 },
    { label: "500g", multiplier: 1 },
    { label: "1 kg", multiplier: 1.9 },
  ];

  const weightOptions = product.variants?.length
    ? product.variants.map((variant) => ({
        id: variant.id,
        label: variant.weight,
        price: Number(variant.price),
        mrp: variant.mrp == null ? null : Number(variant.mrp),
        stock: variant.stock,
      }))
    : fallbackWeightOptions.map((option) => ({
        ...option,
        price: Math.round(product.price * option.multiplier),
        mrp: null,
        stock: product.stock,
      }));

  const currentVariant =
    weightOptions.find((option) => option.label === selectedWeight) ||
    weightOptions[0];

  const currentPrice = currentVariant.price;
  const currentMultiplier = product.price ? currentPrice / product.price : 1;

  // Use all uploaded images, with old imageUrl as fallback.
  const images =
    product.images?.length > 0
      ? product.images.map((image) => image.url)
      : product.imageUrl
        ? [product.imageUrl]
        : [];

  const nextImage = (e) => {
    e.stopPropagation();

    setCurrentImage((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
  };

  const previousImage = (e) => {
    e.stopPropagation();

    setCurrentImage((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  };

  return (
    <>
      <ProductModal
        product={isModalOpen ? product : null}
        onClose={() => setIsModalOpen(false)}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
        <div>
          {/* IMAGE */}
          <div className="relative overflow-hidden aspect-square bg-gray-50">
            {images.length > 0 ? (
              <img
                src={images[currentImage]}
                alt={`${product.title} - image ${currentImage + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                No image
              </div>
            )}

            {/* Organic badge */}
            {product.isOrganic && (
              <span className="absolute top-3 left-3 bg-[#2B4C3F] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                Organic
              </span>
            )}

            {/* Previous image */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={previousImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-700 hover:bg-white z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Next image */}
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-700 hover:bg-white z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Image counter */}
                <span className="absolute bottom-3 right-3 bg-black/65 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                  {currentImage + 1}/{images.length}
                </span>

                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImage(index);
                      }}
                      className={`w-1.5 h-1.5 rounded-full transition ${
                        index === currentImage
                          ? "bg-white scale-125"
                          : "bg-white/60"
                      }`}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Quick actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`p-2 rounded-full shadow transition ${
                  isWishlisted
                    ? "bg-red-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${isWishlisted ? "fill-white" : ""}`}
                />
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="p-2 bg-white text-gray-700 hover:bg-gray-100 rounded-full shadow transition"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* DETAILS */}
          <div className="p-4">
            <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold mb-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating || "4.9"}</span>
            </div>

            <h3
              onClick={() => setIsModalOpen(true)}
              className="font-semibold text-gray-900 text-base line-clamp-1 cursor-pointer hover:text-[#2B4C3F]"
            >
              {product.title}
            </h3>

            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {product.description}
            </p>

            {/* WEIGHTS */}
            <div className="mt-3">
              <span className="text-[11px] font-semibold text-gray-400 uppercase block mb-1.5">
                Pack Weight:
              </span>

              <div className="flex gap-2">
                {weightOptions.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSelectedWeight(opt.label)}
                    className={`flex-1 py-1 text-xs font-medium rounded-lg border transition ${
                      selectedWeight === opt.label
                        ? "border-[#2B4C3F] bg-[#2B4C3F] text-white"
                        : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PRICE */}
        <div className="p-4 pt-0 flex items-center justify-between border-t border-gray-50 mt-2">
          <div>
            <span className="text-xs text-gray-400 block">Price</span>

            <span className="text-lg font-bold text-gray-900">
              {formatPrice(currentPrice)}
            </span>

            {currentVariant.mrp > currentPrice && (
              <div className="text-xs text-gray-400">
                <span className="line-through">
                  MRP {formatPrice(currentVariant.mrp)}
                </span>{" "}
                <span className="text-emerald-700 font-bold">
                  {Math.round((1 - currentPrice / currentVariant.mrp) * 100)}%
                  off
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              addToCart(
                product,
                selectedWeight,
                currentMultiplier,
                currentVariant.id,
              )
            }
            className="bg-[#2B4C3F] hover:bg-emerald-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow transition"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </>
  );
}
