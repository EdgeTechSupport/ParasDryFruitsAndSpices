import React, { useState } from "react";
import {
  X,
  Package,
  MapPin,
  ShoppingBag,
  CheckCircle2,
  RotateCcw,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useOrderHistoryStore } from "../store/useOrderHistoryStore";
import { useCartStore } from "../store/useCartStore";
import { useAddressStore } from "../store/useAddressStore";
import { useCurrencyStore } from "../store/useCurrencyStore";

export default function CustomerDashboardModal({
  isOpen,
  onClose,
  openAdminDashboard,
}) {
  const { user, logout } = useAuthStore();
  const { getUserOrders } = useOrderHistoryStore();
  const { addToCart } = useCartStore();
  const { address, setAddress } = useAddressStore();
  const { formatPrice } = useCurrencyStore();

  const [activeTab, setActiveTab] = useState("orders"); // 'orders' | 'address'
  const [addressForm, setAddressForm] = useState(address);
  const [addressSavedMsg, setAddressSavedMsg] = useState(false);

  if (!isOpen || !user) return null;

  const userOrders = getUserOrders(user.id);

  // Handle Address Save
  const handleSaveAddress = (e) => {
    e.preventDefault();
    setAddress(addressForm);
    setAddressSavedMsg(true);
    setTimeout(() => setAddressSavedMsg(false), 3000);
  };

  // One-Click Reorder Functionality
  const handleRepeatOrder = (orderItems) => {
    orderItems.forEach((item) => {
      addToCart(item, item.selectedWeight || "500g", 1);
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* SIDEBAR NAVIGATION */}
        <div className="w-full md:w-64 bg-[#1A2B22] text-white p-6 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#2B4C3F] border border-emerald-600/50 flex items-center justify-center font-bold text-xl text-[#D4AF37]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-sm text-white truncate">
                  {user.name}
                </h3>
                <p className="text-[11px] text-emerald-300 truncate">
                  {user.email}
                </p>
                {user.role === "ADMIN" && (
                  <span className="bg-[#D4AF37] text-slate-950 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded mt-1 inline-block">
                    Admin Role
                  </span>
                )}
              </div>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                  activeTab === "orders"
                    ? "bg-[#D4AF37] text-slate-950"
                    : "text-gray-300 hover:bg-white/10"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Package className="w-4 h-4" /> Order History
                </span>
                <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full">
                  {userOrders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("address")}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === "address"
                    ? "bg-[#D4AF37] text-slate-950"
                    : "text-gray-300 hover:bg-white/10"
                }`}
              >
                <MapPin className="w-4 h-4" /> Saved Shipping Address
              </button>

              {user.role === "ADMIN" && (
                <button
                  onClick={() => {
                    onClose();
                    openAdminDashboard();
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-300 hover:bg-white/10 transition flex items-center gap-2 mt-4 border-t border-white/10 pt-3"
                >
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]" /> Go to
                  Admin Dashboard
                </button>
              )}
            </nav>
          </div>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition flex items-center gap-2 mt-6"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* MAIN DISPLAY AREA */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* TAB 1: ORDER HISTORY & REORDER */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-xl font-serif font-bold text-gray-900">
                  Your Past Orders
                </h2>
                <span className="text-xs text-gray-400">
                  {userOrders.length} orders placed
                </span>
              </div>

              {userOrders.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-3 stroke-1" />
                  <p className="text-sm font-semibold text-gray-700">
                    No orders placed yet!
                  </p>
                  <p className="text-xs mt-1">
                    Browse our products and checkout directly via WhatsApp.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 transition hover:border-gray-300"
                    >
                      {/* Order Header */}
                      <div className="flex justify-between items-start border-b border-gray-200/60 pb-3 mb-3">
                        <div>
                          <span className="font-mono font-bold text-xs text-gray-900">
                            #{order.id}
                          </span>
                          <span className="text-[11px] text-gray-400 block mt-0.5">
                            Placed on {order.date}
                          </span>
                        </div>

                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-emerald-200">
                          {order.status.replace("_", " ")}
                        </span>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2 mb-3">
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-xs"
                          >
                            <span className="text-gray-700 font-medium line-clamp-1">
                              • {item.title} ({item.selectedWeight || "500g"}) x{" "}
                              {item.qty || 1}
                            </span>
                            <span className="font-bold text-gray-900 shrink-0 ml-2">
                              {formatPrice(
                                (item.calculatedPrice || item.price) *
                                  (item.qty || 1),
                              )}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer & Repeat Order Button */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200/60">
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase font-bold">
                            Total Order Value
                          </span>
                          <span className="text-base font-extrabold text-[#2B4C3F]">
                            {formatPrice(order.totalAmount)}
                          </span>
                        </div>

                        <button
                          onClick={() => handleRepeatOrder(order.items)}
                          className="bg-[#2B4C3F] hover:bg-emerald-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Repeat Order</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED SHIPPING ADDRESS */}
          {activeTab === "address" && (
            <div>
              <div className="border-b pb-3 mb-4">
                <h2 className="text-xl font-serif font-bold text-gray-900">
                  Shipping Address
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  This address will be pre-filled when placing WhatsApp orders.
                </p>
              </div>

              {addressSavedMsg && (
                <div className="mb-4 text-xs font-bold bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Address details saved successfully!</span>
                </div>
              )}

              <form onSubmit={handleSaveAddress} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Street Address / House No.
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., House 42, Green Park Extension"
                    value={addressForm.street}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, street: e.target.value })
                    }
                    className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:border-[#2B4C3F]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., New Delhi"
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, city: e.target.value })
                      }
                      className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:border-[#2B4C3F]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Delhi"
                      value={addressForm.state}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          state: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:border-[#2B4C3F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 110016"
                      value={addressForm.pincode}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          pincode: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:border-[#2B4C3F]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Near Main Market"
                      value={addressForm.landmark}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          landmark: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:border-[#2B4C3F]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2B4C3F] hover:bg-emerald-900 text-white font-bold py-3 rounded-xl transition shadow mt-2"
                >
                  Save Address Details
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
