import React, { useState } from "react";
import { X, PackageCheck, MessageSquare } from "lucide-react";

export default function BulkOrderModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    itemsRequired: "",
    estimatedQuantity: "10-25 kg",
  });

  if (!isOpen) return null;

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    const whatsappNumber = "919876543210";
    let message = "*BULK / WHOLESALE INQUIRY - PARAS DRY FRUITS*\n";
    message += "----------------------------------------------\n";
    message += `*Name:* ${formData.name}\n`;
    message += `*Phone:* ${formData.phone}\n`;
    message += `*Est. Quantity:* ${formData.estimatedQuantity}\n`;
    message += `*Items Required:* ${formData.itemsRequired}\n`;
    message += "----------------------------------------------\n";
    message += "Please share your wholesale catalog & price quotation!";

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-[#2B4C3F]">
          <PackageCheck className="w-6 h-6 text-[#D4AF37]" />
          <h3 className="text-2xl font-serif font-bold text-gray-900">
            Bulk & Wholesale Quotes
          </h3>
        </div>
        <p className="text-xs text-gray-500 mb-6">
          Need dry fruit gift boxes or bulk spice shipments? Fill out the
          details for wholesale rates.
        </p>

        <form onSubmit={handleBulkSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Your Name
            </label>
            <input
              type="text"
              required
              placeholder="Corporate Buyer / Business Name"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              placeholder="+91 98765 43210"
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Estimated Quantity
            </label>
            <select
              value={formData.estimatedQuantity}
              onChange={(e) =>
                setFormData({ ...formData, estimatedQuantity: e.target.value })
              }
              className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm"
            >
              <option value="10-25 kg">10 kg - 25 kg</option>
              <option value="25-100 kg">25 kg - 100 kg</option>
              <option value="100+ kg">100+ kg (Commercial / Export)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Items / Requirements
            </label>
            <textarea
              rows="3"
              required
              placeholder="e.g., Almond gift hampers, whole cardamom pods, raw cashews..."
              onChange={(e) =>
                setFormData({ ...formData, itemsRequired: e.target.value })
              }
              className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#2B4C3F] hover:bg-emerald-900 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow"
          >
            <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
            <span>Request Bulk Rates via WhatsApp</span>
          </button>
        </form>
      </div>
    </div>
  );
}
