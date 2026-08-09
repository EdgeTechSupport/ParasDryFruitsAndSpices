import React, { useState } from "react";
import { X, Gift, Plus, ShoppingBag, CheckCircle } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useCurrencyStore } from "../store/useCurrencyStore";

export default function HamperBuilderModal({ isOpen, onClose, products = [] }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [boxType, setBoxType] = useState("Royal Wooden Box (₹250)");
  const [boxPrice, setBoxPrice] = useState(250);
  const { addToCart } = useCartStore();
  const { formatPrice } = useCurrencyStore();

  if (!isOpen) return null;

  const toggleItem = (item) => {
    if (selectedItems.some((i) => i.id === item.id)) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const hamperSubtotal =
    selectedItems.reduce((sum, item) => sum + item.price, 0) + boxPrice;

  const handleAddHamperToCart = () => {
    if (selectedItems.length === 0)
      return alert("Select at least one product for your gift box!");

    const customHamperProduct = {
      id: `hamper-${Date.now()}`,
      title: `Custom Gift Box (${boxType.split(" ")[0]})`,
      price: hamperSubtotal,
      unit: `${selectedItems.length} Items Included`,
      imageUrl:
        selectedItems[0]?.imageUrl || "",
      description: `Includes: ${selectedItems.map((i) => i.title).join(", ")}`,
    };

    addToCart(customHamperProduct, "Gift Pack", 1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#1A2B22] text-white p-6 flex justify-between items-center border-b border-emerald-900">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-[#D4AF37]" />
            <h2 className="text-xl font-serif font-bold">
              Build Your Custom Gift Box
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Packaging Selection */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-2">
              1. Choose Premium Packaging:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setBoxType("Royal Wooden Box (₹250)");
                  setBoxPrice(250);
                }}
                className={`p-3 rounded-xl border text-xs font-bold flex justify-between items-center transition ${
                  boxPrice === 250
                    ? "border-[#2B4C3F] bg-[#2B4C3F] text-white"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                <span>Royal Wooden Box</span>
                <span>{formatPrice(250)}</span>
              </button>
              <button
                onClick={() => {
                  setBoxType("Gold Foil Velvet Box (₹400)");
                  setBoxPrice(400);
                }}
                className={`p-3 rounded-xl border text-xs font-bold flex justify-between items-center transition ${
                  boxPrice === 400
                    ? "border-[#2B4C3F] bg-[#2B4C3F] text-white"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                <span>Gold Foil Velvet Box</span>
                <span>{formatPrice(400)}</span>
              </button>
            </div>
          </div>

          {/* Product Items Picker */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-2">
              2. Pick Items to Include:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map((item) => {
                const isSelected = selectedItems.some((i) => i.id === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                      <div>
                        <span className="font-semibold text-xs text-gray-900 block">
                          {item.title}
                        </span>
                        <span className="text-xs font-bold text-emerald-800">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                    {isSelected ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-400 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 block">
              Total Hamper Price
            </span>
            <span className="text-2xl font-extrabold text-gray-900">
              {formatPrice(hamperSubtotal)}
            </span>
          </div>

          <button
            onClick={handleAddHamperToCart}
            className="bg-[#2B4C3F] hover:bg-emerald-900 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow"
          >
            <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
            <span>Add Custom Hamper to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
