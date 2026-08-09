import { useEffect, useState } from "react";
import { X, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import axios from "axios";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import { useOrderHistoryStore } from "../store/useOrderHistoryStore";
import { useAddressStore } from "../store/useAddressStore";
import { useCurrencyStore } from "../store/useCurrencyStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    toggleCart,
    updateQuantity,
    removeFromCart,
    getSubtotal,
    getDiscountAmount,
    getTotalAmount,
    applyDiscount,
    discountCode,
    removeDiscount,
    clearCart,
  } = useCartStore();

  const { user, token } = useAuthStore();
  const { addOrder } = useOrderHistoryStore();
  const { address } = useAddressStore();
  const { formatPrice } = useCurrencyStore();

  const [inputCoupon, setInputCoupon] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);

  useEffect(() => {
    if (!isCartOpen) return;
    axios.get(`${API_BASE_URL}/api/products/coupons`).then(({ data }) => setAvailableCoupons(data)).catch(() => setAvailableCoupons([]));
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e, code = inputCoupon) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/products/validate-coupon`, { code, subtotal: getSubtotal() });
      applyDiscount(data.code, data.discount);
      setInputCoupon("");
    } catch (error) {
      alert(error.response?.data?.message || "Unable to validate coupon.");
    }
  };

  const handleWhatsAppCheckout = async () => {
    if (cart.length === 0) return;

    let orderId;

    // 2. Sync Order with Backend for Admin Dashboard Tracking
    try {
      if (user && token) {
        const response = await axios.post(
          `${API_BASE_URL}/api/orders`,
          {
            items: cart,
            totalAmount: getTotalAmount(),
            couponCode: discountCode || undefined,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        orderId = response.data.orderNumber || response.data.id;
      }
    } catch {
      console.warn("Backend order sync skipped; the WhatsApp checkout remains available.");
    }
    orderId = addOrder(user?.id, cart, getTotalAmount(), orderId);

    // 3. Build WhatsApp Text
    const whatsappNumber = "917017865138";
    let message = "*NEW ORDER - PARAS DRY FRUITS & SPICES*\n";
    message += "----------------------------------------\n";
    message += `*Order Ref:* #${orderId}\n`;
    message += `*Customer:* ${user ? user.name : "Guest Customer"}\n`;
    if (user?.phone) message += `*Phone:* ${user.phone}\n`;

    if (address.street) {
      message += `*Shipping Address:* ${address.street}, ${address.city}, ${address.state} - ${address.pincode}\n`;
    }

    message += "----------------------------------------\n\n";
    message += "*Items Ordered:*\n";

    cart.forEach((item, idx) => {
      message += `${idx + 1}. *${item.title}*\n`;
      message += `   Pack: ${item.selectedWeight} | Qty: ${item.qty}\n`;
      message += `   Price: ₹${item.calculatedPrice * item.qty}\n\n`;
    });

    message += "----------------------------------------\n";
    message += `Subtotal: ₹${getSubtotal()}\n`;
    if (discountCode) {
      message += `Discount (${discountCode}): -₹${getDiscountAmount()}\n`;
    }
    message += `*Grand Total:* ₹${getTotalAmount()}\n`;
    message += "----------------------------------------\n\n";
    message += "Please confirm my order and send payment options!";

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    clearCart();
    toggleCart();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-4 bg-[#1A2B22] text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-bold font-serif">Your Cart</h2>
          </div>
          <button
            onClick={toggleCart}
            className="text-gray-300 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="p-4 flex-1 overflow-y-auto divide-y divide-gray-100">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4 stroke-1" />
              <p className="text-lg font-medium">Your cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.cartItemId}
                className="py-4 flex gap-4 items-center"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-lg border"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Pack: {item.selectedWeight}
                  </p>
                  <p className="text-sm font-bold mt-1">
                    {formatPrice(item.calculatedPrice * item.qty)}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.cartItemId, item.qty - 1)
                      }
                      className="w-6 h-6 rounded bg-gray-100 text-gray-600 font-bold"
                    >
                      -
                    </button>
                    <span className="text-xs font-semibold px-2">
                      {item.qty}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.cartItemId, item.qty + 1)
                      }
                      className="w-6 h-6 rounded bg-gray-100 text-gray-600 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.cartItemId)}
                  className="text-red-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-4 border-t bg-gray-50 space-y-3">
            {/* Promo Code Box */}
            <div>
              {discountCode ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-xl text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" /> Code '
                    {discountCode}' Applied!
                  </span>
                  <button
                    onClick={removeDiscount}
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input type="text" placeholder="Promo code" value={inputCoupon} onChange={(e) => setInputCoupon(e.target.value)} className="flex-1 bg-white border text-xs px-3 py-2 rounded-xl uppercase font-mono focus:outline-none focus:border-[#2B4C3F]" />
                    <button type="submit" className="bg-[#2B4C3F] text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-emerald-900">Apply</button>
                  </form>
                  {availableCoupons.length > 0 && <div className="mt-2 flex gap-2 overflow-x-auto pb-1">{availableCoupons.map((coupon) => {
                    const eligible = getSubtotal() >= Number(coupon.minimumAmount || 0);
                    return <button key={coupon.id} type="button" disabled={!eligible} onClick={() => handleApplyCoupon({ preventDefault: () => {} }, coupon.code)} className="shrink-0 rounded-lg border px-2 py-1.5 text-left text-[10px] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#2B4C3F]">
                      <b>{coupon.code}</b> · {coupon.discount}% off<br /><span>{eligible ? "Tap to apply" : `Min. ₹${coupon.minimumAmount}`}</span>
                    </button>;
                  })}</div>}
                </>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1 text-xs text-gray-600 pt-2 border-t">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(getSubtotal())}</span>
              </div>
              {getDiscountAmount() > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount</span>
                  <span>-{formatPrice(getDiscountAmount())}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base text-gray-900 pt-1">
                <span>Total Amount</span>
                <span className="text-[#2B4C3F]">
                  {formatPrice(getTotalAmount())}
                </span>
              </div>
            </div>

            {/* WhatsApp Checkout Button */}
            <button
              onClick={handleWhatsAppCheckout}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow"
            >
              <span>Complete Order via WhatsApp</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
