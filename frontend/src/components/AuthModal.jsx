import { useState } from "react";
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  Leaf,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AuthModal({ isOpen, onClose, onSuccessLogin, resetToken }) {
  const [view, setView] = useState(() => (resetToken ? "reset" : "login")); // 'login' | 'register' | 'otp' | 'forgot' | 'reset'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const setAuth = useAuthStore((state) => state.setAuth);

  if (!isOpen) return null;

  // Handlers
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        formData,
      );
      setLoading(false);
      setMsg({ type: "success", text: res.data.message });
      setView("otp");
    } catch (err) {
      setLoading(false);
      setMsg({
        type: "error",
        text:
          err.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
        email: formData.email,
        otp: formData.otp,
      });
      setAuth(res.data.user, res.data.token);
      setLoading(false);
      onClose();
      if (onSuccessLogin) onSuccessLogin(res.data.user);
    } catch (err) {
      setLoading(false);
      setMsg({
        type: "error",
        text:
          err.response?.data?.message || "Invalid OTP code. Please try again.",
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);
      setAuth(res.data.user, res.data.token);
      setLoading(false);
      onClose();
      if (onSuccessLogin) onSuccessLogin(res.data.user);
    } catch (err) {
      setLoading(false);
      if (err.response?.data?.requireVerification) {
        setView("otp");
      }
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Invalid email or password.",
      });
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        email: formData.email,
      });
      setLoading(false);
      setMsg({ type: "success", text: res.data.message });
    } catch (err) {
      setLoading(false);
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to send reset link.",
      });
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/resend-otp`, {
        email: formData.email,
      });
      setLoading(false);
      setMsg({ type: "success", text: res.data.message });
    } catch (err) {
      setLoading(false);
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to resend OTP.",
      });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        token: resetToken,
        newPassword: formData.newPassword,
      });
      setMsg({ type: "success", text: res.data.message });
      setView("login");
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Unable to reset your password." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row border border-white/20">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 flex items-center justify-center transition shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT SIDE SHOWCASE BANNER (Visible on MD screens and above) */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-[#1A2B22] via-[#14231B] to-emerald-950 p-8 text-white flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Glows */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-[#D4AF37] font-serif font-bold text-xl mb-1">
              <Leaf className="w-6 h-6 text-[#D4AF37]" />
              <span>Paras</span>
            </div>
            <p className="text-xs text-emerald-200/80 tracking-widest uppercase font-semibold">
              Dry Fruits & Spices
            </p>
          </div>

          {/* Hero Pitch */}
          <div className="relative z-10 my-8 space-y-4">
            <span className="inline-flex items-center gap-1.5 bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-[11px] font-bold px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> Premium Organic Quality
            </span>
            <h2 className="text-2xl font-serif font-bold leading-tight text-white">
              Direct Sourced Kashmiri Saffron & Exotic Nuts.
            </h2>

            {/* Features */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Handpicked Grade-A Quality Assurance</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Pan-India & Express Global Shipping</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Hassle-Free Personal WhatsApp Orders</span>
              </div>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Authentication & Privacy Guaranteed</span>
          </div>
        </div>

        {/* RIGHT SIDE FORM CONTAINER */}
        <div className="w-full md:w-7/12 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Mobile Brand Title (Shown only on small screens) */}
            <div className="md:hidden flex items-center gap-2 text-[#D4AF37] font-serif font-bold text-xl mb-4">
              <Leaf className="w-6 h-6 text-[#D4AF37]" />
              <span className="text-slate-900">Paras Dry Fruits</span>
            </div>

            {/* TAB SELECTOR (FOR LOGIN / REGISTER) */}
            {(view === "login" || view === "register") && (
              <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setMsg({ type: "", text: "" });
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                    view === "login"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView("register");
                    setMsg({ type: "", text: "" });
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                    view === "register"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* FORM HEADINGS */}
            <div className="mb-6">
              <h3 className="text-2xl font-serif font-bold text-slate-900">
                {view === "login" && "Welcome Back!"}
                {view === "register" && "Create Your Account"}
                {view === "otp" && "Verify Your Email"}
                {view === "forgot" && "Reset Password"}
                {view === "reset" && "Choose a New Password"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {view === "login" &&
                  "Enter your credentials to access your saved profile & orders."}
                {view === "register" &&
                  "Fill out your details to enjoy instant WhatsApp checkouts."}
                {view === "otp" &&
                  `We've sent a 6-digit OTP code to ${formData.email}`}
                {view === "forgot" &&
                  "Enter your account email to receive a password reset link."}
                {view === "reset" && "Enter a new password with at least 8 characters."}
              </p>
            </div>

            {/* ERROR / SUCCESS ALERT BANNER */}
            {msg.text && (
              <div
                className={`mb-6 text-xs font-medium p-4 rounded-2xl border flex items-center gap-2.5 ${
                  msg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    msg.type === "success" ? "bg-emerald-600" : "bg-red-600"
                  }`}
                />
                <span>{msg.text}</span>
              </div>
            )}

            {/* 1. VIEW: REGISTER */}
            {view === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Raghav Agrawal"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#2B4C3F] transition"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#2B4C3F] transition"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#2B4C3F] transition"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#2B4C3F] transition"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2B4C3F] hover:bg-emerald-900 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <span>Sending Verification OTP...</span>
                  ) : (
                    <>
                      <span>Register & Verify Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 2. VIEW: OTP VERIFICATION */}
            {view === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1 text-center">
                    6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength="6"
                      placeholder="______"
                      value={formData.otp}
                      onChange={(e) =>
                        setFormData({ ...formData, otp: e.target.value })
                      }
                      className="w-full py-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-bold text-center text-2xl tracking-[0.5em] text-slate-900 focus:outline-none focus:bg-white focus:border-[#2B4C3F] transition"
                    />
                    <KeyRound className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2B4C3F] hover:bg-emerald-900 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Verifying Code...</span>
                  ) : (
                    <>
                      <span>Verify Code & Log In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex justify-between items-center text-xs pt-2">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-[#2B4C3F] font-bold hover:underline"
                  >
                    Didn't receive email? Resend OTP
                  </button>

                  <button
                    type="button"
                    onClick={() => setView("register")}
                    className="text-slate-500 hover:text-slate-900 font-semibold"
                  >
                    Change Email
                  </button>
                </div>
              </form>
            )}

            {/* 3. VIEW: LOGIN */}
            {view === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#2B4C3F] transition"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setView("forgot");
                        setMsg({ type: "", text: "" });
                      }}
                      className="text-xs text-[#2B4C3F] font-bold hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#2B4C3F] transition"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2B4C3F] hover:bg-emerald-900 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <span>Signing In...</span>
                  ) : (
                    <>
                      <span>Sign In to Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 4. VIEW: FORGOT PASSWORD */}
            {view === "forgot" && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#2B4C3F] transition"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2B4C3F] hover:bg-emerald-900 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Sending Link...</span>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setView("login");
                      setMsg({ type: "", text: "" });
                    }}
                    className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {view === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      minLength="8"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#2B4C3F] transition"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#2B4C3F] hover:bg-emerald-900 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-emerald-900/10">
                  {loading ? "Resetting Password..." : "Reset Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
