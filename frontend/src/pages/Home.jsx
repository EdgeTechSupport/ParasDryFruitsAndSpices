import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import CartDrawer from "../components/CartDrawer";
import ProductCard from "../components/ProductCard";
import WishlistDrawer from "../components/WishlistDrawer";
import BulkOrderModal from "../components/BulkOrderModal";
import HamperBuilderModal from "../components/HamperBuilderModal";
import FilterBar from "../components/FilterBar";
import {
  Truck,
  Award,
  ShieldCheck,
  RefreshCw,
  LayoutGrid,
  Nut,
  Flame,
  Gift,
  Check,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Home({ openAuthModal, openAdminDashboard }) {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isHamperModalOpen, setIsHamperModalOpen] = useState(false);

  const [sortBy, setSortBy] = useState("featured");
  const [showOrganicOnly, setShowOrganicOnly] = useState(false);
  const categories = useMemo(() => [
    { id: "all", name: "All Products", icon: LayoutGrid },
    ...Array.from(new Set(products.map((product) => product.category).filter(Boolean))).map((category) => ({
      id: category,
      name: category.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" "),
      icon: category === "spices" ? Flame : category === "combos" ? Gift : Nut,
    })),
  ], [products]);

  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products`);

        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setProducts([]);
      }
    };

    fetchLiveProducts();
  }, []);

  const processedProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      const matchesCategory =
        activeCategory === "all" || p.category === activeCategory;

      const matchesSearch = p.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesOrganic = showOrganicOnly ? p.isOrganic === true : true;

      return matchesCategory && matchesSearch && matchesOrganic;
    });

    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return filtered;
  }, [products, activeCategory, searchQuery, showOrganicOnly, sortBy]);

  const activeCategoryName =
    categories.find((category) => category.id === activeCategory)?.name ||
    "All Products";

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F3]">
      <Navbar
        onSearch={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        openAuthModal={openAuthModal}
        openAdminDashboard={openAdminDashboard}
        openWishlist={() => setIsWishlistOpen(true)}
        openBulkModal={() => setIsBulkModalOpen(true)}
        openHamperModal={() => setIsHamperModalOpen(true)}
      />

      <CartDrawer />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />

      <BulkOrderModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />

      <HamperBuilderModal
        isOpen={isHamperModalOpen}
        onClose={() => setIsHamperModalOpen(false)}
        products={products}
      />

      {/* ========================================================= */}
      {/* HERO SECTION                                              */}
      {/* ========================================================= */}
      <section className="bg-gradient-to-r from-[#14231B] via-[#1A2B22] to-slate-900 text-white py-12 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left Column: Brand & Copy */}
          <div className="space-y-4">
            <span className="inline-block text-[#D4AF37] font-semibold uppercase tracking-widest text-xs bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-sm">
              Authentic Direct Sourced
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight text-slate-100">
              World’s Finest Spices <br />
              <span className="text-[#D4AF37]">& Fresh Dry Fruits</span>
            </h1>

            <p className="text-gray-300 text-base md:text-lg max-w-lg leading-relaxed">
              Handpicked premium grade nuts and whole aromatic spices. Delivered
              globally with farm-fresh quality guarantee.
            </p>
          </div>

          {/* Right Column: High-Res 2D Display */}
          <div className="relative flex justify-center items-center">
            {/* Decorative ambient background glow behind the image */}
            <div className="absolute w-72 h-72 bg-[#D4AF37]/15 rounded-full blur-3xl -z-0 pointer-events-none" />

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white/5 p-3 border border-white/10 shadow-2xl backdrop-blur-md group transition-all duration-500 hover:border-[#D4AF37]/30">
              <div className="overflow-hidden rounded-xl bg-[#0F1A14]">
                <img
                  src="../../public/parashero.png" /* <<< REPLACE WITH YOUR IMAGE FILE PATH (e.g., from public folder) */
                  alt="Paras Dry Fruits and Spices Showcase"
                  className="w-full h-[360px] object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* TRUST BADGES                                              */}
      {/* ========================================================= */}
      <section className="bg-white border-y border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <Truck className="w-6 h-6 text-[#D4AF37] mb-1" />

            <span className="font-semibold text-sm text-gray-900">
              Pan-India & Global Shipping
            </span>

            <span className="text-xs text-gray-400">
              Fast & Safe Express Delivery
            </span>
          </div>

          <div className="flex flex-col items-center">
            <Award className="w-6 h-6 text-[#D4AF37] mb-1" />

            <span className="font-semibold text-sm text-gray-900">
              100% Export Grade
            </span>

            <span className="text-xs text-gray-400">
              Direct From Kashmir & Organic Farms
            </span>
          </div>

          <div className="flex flex-col items-center">
            <ShieldCheck className="w-6 h-6 text-[#D4AF37] mb-1" />

            <span className="font-semibold text-sm text-gray-900">
              Hassle-Free WhatsApp Checkout
            </span>

            <span className="text-xs text-gray-400">
              Direct Personal Confirmation
            </span>
          </div>

          <div className="flex flex-col items-center">
            <RefreshCw className="w-6 h-6 text-[#D4AF37] mb-1" />

            <span className="font-semibold text-sm text-gray-900">
              Quality Guarantee
            </span>

            <span className="text-xs text-gray-400">
              Pure, Fresh & Unadulterated
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* CATALOG AREA                                              */}
      {/* ========================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        {/* Mobile Categories */}
        <div className="lg:hidden mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-serif font-bold text-gray-900">
                Shop By Category
              </h3>

              <span className="text-xs text-gray-400">
                {processedProducts.length} products
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${
                      isActive
                        ? "bg-[#2B4C3F] text-white border-[#2B4C3F]"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#2B4C3F] hover:text-[#2B4C3F]"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-[#D4AF37]" : ""}`}
                    />

                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ===================================================== */}
          {/* LEFT CATEGORY SIDEBAR                                */}
          {/* ===================================================== */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-5 border-b border-gray-100 bg-[#FBFAF6]">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37]">
                    Explore
                  </p>

                  <h3 className="text-xl font-serif font-bold text-gray-900 mt-1">
                    Shop By Category
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">
                    Find your favorite products
                  </p>
                </div>

                <div className="p-3">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isActive = activeCategory === category.id;

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition mb-1 last:mb-0 ${
                          isActive
                            ? "bg-[#2B4C3F] text-white shadow-sm"
                            : "text-gray-600 hover:bg-emerald-50 hover:text-[#2B4C3F]"
                        }`}
                      >
                        <span
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            isActive ? "bg-white/10" : "bg-gray-100"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 ${
                              isActive ? "text-[#D4AF37]" : "text-gray-500"
                            }`}
                          />
                        </span>

                        <span className="flex-1 text-left">
                          {category.name}
                        </span>

                        {isActive && (
                          <Check className="w-4 h-4 text-[#D4AF37]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Small promotional card */}
              <div className="mt-5 bg-[#1A2B22] rounded-2xl p-5 text-white overflow-hidden relative">
                <div className="relative z-10">
                  <p className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-bold">
                    Premium Quality
                  </p>

                  <h4 className="font-serif font-bold text-lg mt-1">
                    From Kashmir to Your Home
                  </h4>

                  <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                    Carefully sourced premium dry fruits and authentic spices.
                  </p>
                </div>

                <div className="absolute -right-6 -bottom-8 w-24 h-24 rounded-full border border-[#D4AF37]/20" />
                <div className="absolute -right-2 -bottom-4 w-14 h-14 rounded-full border border-[#D4AF37]/20" />
              </div>
            </div>
          </aside>

          {/* ===================================================== */}
          {/* RIGHT PRODUCT CONTENT                                 */}
          {/* ===================================================== */}
          <section className="flex-1 min-w-0">
            {/* Heading */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
                  Our Collection
                </p>

                <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mt-1">
                  {activeCategoryName}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Showing {processedProducts.length}{" "}
                  {processedProducts.length === 1 ? "item" : "items"}
                </p>
              </div>

              {searchQuery && (
                <div className="text-xs text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1.5">
                  Search:{" "}
                  <span className="font-semibold text-gray-900">
                    "{searchQuery}"
                  </span>
                </div>
              )}
            </div>

            {/* Filter Bar */}
            <FilterBar
              sortBy={sortBy}
              setSortBy={setSortBy}
              showOrganicOnly={showOrganicOnly}
              setShowOrganicOnly={setShowOrganicOnly}
            />

            {/* Products */}
            {processedProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LayoutGrid className="w-6 h-6 text-gray-400" />
                </div>

                <h3 className="font-serif font-bold text-gray-900 text-lg">
                  No Products Found
                </h3>

                <p className="text-gray-500 font-medium text-sm mt-1">
                  No products match your search or filter.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory("all");
                    setSearchQuery("");
                    setShowOrganicOnly(false);
                    setSortBy("featured");
                  }}
                  className="mt-5 bg-[#2B4C3F] hover:bg-emerald-800 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {processedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ========================================================= */}
      {/* REVIEWS                                                   */}
      {/* ========================================================= */}

      {/* ========================================================= */}
      {/* FOOTER                                                    */}
      {/* ========================================================= */}
      <footer className="bg-[#1A2B22] text-white py-10 border-t border-emerald-900 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-gray-400">
          <p>© 2026 Paras Dry Fruits & Spices. All rights reserved.</p>

          <p className="mt-1">
            Delivering authentic taste across India and worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
