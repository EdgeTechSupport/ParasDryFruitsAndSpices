import React, { useEffect, useRef, useState } from "react";
import {
  ShoppingBag,
  User,
  Search,
  Leaf,
  ShieldCheck,
  LogOut,
  Heart,
  PackageCheck,
  Gift,
  Globe,
} from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { useCurrencyStore } from "../store/useCurrencyStore";

export default function Navbar({
  onSearch,
  setActiveCategory,
  openAuthModal,
  openAdminDashboard,
  openWishlist,
  openBulkModal,
  openHamperModal,
}) {
  const { cart, toggleCart } = useCartStore();
  const { user, logout } = useAuthStore();
  const { wishlist } = useWishlistStore();
  const { currency, setCurrency } = useCurrencyStore();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown if user logs out or changes
  useEffect(() => {
    if (!user) {
      setUserDropdownOpen(false);
    }
  }, [user]);

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
  };

  const handleAdminDashboard = () => {
    setUserDropdownOpen(false);
    openAdminDashboard();
  };

  return (
    <header className="bg-[#1B3026] text-white sticky top-0 z-40 shadow-md">
      {/* Top Banner */}
      <div className="bg-[#D4AF37] text-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between text-xs">
          <div className="font-bold truncate">
            ✨ World-Class Kashmiri Saffron & Organic Dry Fruits
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <button
              type="button"
              onClick={openHamperModal}
              className="hover:underline flex items-center gap-1 font-extrabold"
            >
              <Gift className="w-3.5 h-3.5" />
              Gift Hamper Builder
            </button>

            <span>|</span>

            <button
              type="button"
              onClick={openBulkModal}
              className="hover:underline flex items-center gap-1 font-extrabold"
            >
              <PackageCheck className="w-3.5 h-3.5" />
              Bulk & Corporate Orders
            </button>

            <span>|</span>

            {/* Currency Switcher */}
            <div className="flex items-center gap-1 bg-slate-900/10 px-2 py-0.5 rounded">
              <Globe className="w-3 h-3" />

              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                aria-label="Select currency"
                className="bg-transparent text-xs font-bold text-slate-950 focus:outline-none cursor-pointer"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="AED">AED (AED)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Header with Full Title on Mobile and Desktop */}
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          aria-label="Go to all products"
          className="flex items-center gap-2 text-left shrink-0"
        >
          <Leaf className="w-6 h-6 sm:w-7 sm:h-7 text-[#D4AF37] shrink-0" />

          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
            <span className="text-lg sm:text-2xl font-serif font-bold text-[#D4AF37] leading-tight">
              Paras
            </span>
            <span className="text-white text-[11px] sm:text-base font-sans font-medium leading-tight">
              Dry Fruits & Spices
            </span>
          </div>
        </button>

        {/* Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-6 relative">
          <input
            type="text"
            placeholder="Search almonds, saffron, cardamom..."
            aria-label="Search products"
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-white/10 text-white placeholder-gray-300 pl-10 pr-4 py-2 rounded-full text-sm border border-white/20 focus:outline-none focus:border-[#D4AF37]"
          />

          <Search className="w-4 h-4 text-gray-300 absolute left-3.5 top-2.5 pointer-events-none" />
        </div>

        {/* Actions Container with Enhanced Touch Separation for Mobile */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Wishlist Button */}
          <button
            type="button"
            onClick={openWishlist}
            aria-label={`Wishlist${wishlist.length > 0 ? ` (${wishlist.length} items)` : ""}`}
            className="relative p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition border border-white/15"
            title="Wishlist"
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />

            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* User / Account Dropdown */}
          {user ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                aria-expanded={userDropdownOpen}
                aria-haspopup="menu"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-medium hover:text-[#D4AF37] transition bg-white/10 p-2.5 sm:px-3.5 sm:py-2 rounded-full border border-white/20"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />

                <span className="max-w-[80px] sm:max-w-[100px] truncate hidden sm:inline">
                  {user.name}
                </span>

                {user.role === "ADMIN" && (
                  <span className="bg-[#D4AF37] text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded hidden sm:inline ml-1">
                    ADMIN
                  </span>
                )}
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white text-gray-900 rounded-xl shadow-xl py-2 z-50 border border-gray-100"
                  role="menu"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-400">Signed in as</p>

                    <p className="text-xs font-bold truncate">{user.email}</p>
                  </div>

                  {/* Admin Dashboard Option */}
                  {user.role === "ADMIN" && (
                    <button
                      type="button"
                      onClick={handleAdminDashboard}
                      role="menuitem"
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 border-b border-gray-50"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                      <span>Admin Control Dashboard</span>
                    </button>
                  )}

                  {/* Sign Out Option */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    role="menuitem"
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              aria-label="Open account"
              className="p-2.5 sm:px-3.5 sm:py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition border border-white/20 flex items-center gap-1.5 text-xs sm:text-sm font-medium hover:text-[#D4AF37]"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />

              <span className="hidden sm:inline">Account</span>
            </button>
          )}

          {/* Cart Button */}
          <button
            type="button"
            onClick={toggleCart}
            aria-label={`Shopping cart${totalItemsCount > 0 ? ` (${totalItemsCount} items)` : ""}`}
            className="relative bg-[#2B4C3F] hover:bg-emerald-800 p-2.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 border border-emerald-700 transition"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />

            <span className="hidden sm:inline">Cart</span>

            {totalItemsCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center">
                {totalItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
