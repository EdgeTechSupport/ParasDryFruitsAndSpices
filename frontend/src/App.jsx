import { useState, useEffect } from "react";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import AuthModal from "./components/AuthModal";
import CustomerDashboardModal from "./components/CustomerDashboardModal";
import { useAuthStore } from "./store/useAuthStore";
import { useCartStore } from "./store/useCartStore";
import { useWishlistStore } from "./store/useWishlistStore";

export default function App() {
  const { user } = useAuthStore();

  const loadUserCart = useCartStore((state) => state.loadUserCart);
  const loadUserWishlist = useWishlistStore((state) => state.loadUserWishlist);

  const [currentView, setCurrentView] = useState("store");
  const initialResetToken = new URLSearchParams(window.location.search).get("resetToken");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(() => Boolean(initialResetToken));
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [resetToken, setResetToken] = useState(initialResetToken);

  useEffect(() => {
    if (user?.id) {
      if (typeof loadUserCart === "function") loadUserCart(user.id);
      if (typeof loadUserWishlist === "function") loadUserWishlist(user.id);
    } else {
      if (typeof loadUserCart === "function") loadUserCart(null);
      if (typeof loadUserWishlist === "function") loadUserWishlist(null);
    }

    if (user && user.role === "ADMIN") {
      setCurrentView("admin");
    }
  }, [user, loadUserCart, loadUserWishlist]);

  const handleOpenAccount = () => {
    if (user) {
      setIsCustomerModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans antialiased text-gray-900">
      <AuthModal
        isOpen={isAuthModalOpen}
        resetToken={resetToken}
        onClose={() => {
          setIsAuthModalOpen(false);
          setResetToken(null);
          window.history.replaceState({}, document.title, window.location.pathname);
        }}
      />

      <CustomerDashboardModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        openAdminDashboard={() => setCurrentView("admin")}
      />

      {currentView === "admin" && user?.role === "ADMIN" ? (
        <AdminDashboard onBackToStore={() => setCurrentView("store")} />
      ) : (
        <Home
          openAuthModal={handleOpenAccount}
          openAdminDashboard={() => setCurrentView("admin")}
        />
      )}
    </div>
  );
}
