import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function Toast({ message, isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1A2B22] text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-700 flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
      <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
      <span className="text-xs font-semibold">{message}</span>
    </div>
  );
}
