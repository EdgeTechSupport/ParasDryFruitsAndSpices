import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Plus,
  Trash2,
  Package,
  RefreshCw,
  ArrowLeft,
  Users,
  ShieldCheck,
  Search,
  ShoppingBag,
  UserX,
  LayoutDashboard,
  Tag,
  AlertTriangle,
  DollarSign,
  Percent,
  ImagePlus,
  X,
  Pencil,
} from "lucide-react";
import Toast from "../components/Toast";
import { useAuthStore } from "../store/useAuthStore";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const getImageUrl = (url) => {
  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  return `${API_BASE_URL}/${url.replace(/^\/+/, "")}`;
};

export default function AdminDashboard({ onBackToStore }) {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'inventory' | 'users' | 'orders' | 'coupons'
  const [products, setProducts] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);

  // Search States
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // 'all' | 'low' | 'instock'

  // Promo Code State
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({ code: "", discount: "" });

  // Add Product Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    unit: "500g",
    stock: 50,
    imageUrl: "",
    category: "dry-fruits",
    isOrganic: true,
  });
  const [variants, setVariants] = useState([
    { weight: "500g", price: "", mrp: "", stock: 50 },
  ]);
  const [imageFiles, setImageFiles] = useState([]);

  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);

  const fileInputRef = useRef(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const { token, user: loggedUser } = useAuthStore();

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/auth/users`,
        authHeaders,
      );
      setUsersList(res.data);
    } catch (err) {
      console.error("Failed to load users");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/admin/orders`,
        authHeaders,
      );
      setOrdersList(res.data);
    } catch (err) {
      console.error("Failed to load orders");
      setOrdersList([]);
    }
  };
  const notify = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/admin/coupons`,
        authHeaders,
      );
      setCoupons(data);
    } catch {
      setCoupons([]);
    }
  };

  const handleOrderStatusChange = async (orderId, status) => {
    try {
      const { data } = await axios.put(
        `${API_BASE_URL}/api/admin/orders/status`,
        { orderId, status },
        authHeaders,
      );
      setOrdersList((orders) =>
        orders.map((order) => (order.id === orderId ? data : order)),
      );
    } catch {
      alert("Failed to update order status.");
    }
  };

  // Initial dashboard data load; subsequent refreshes are user initiated.
  useEffect(() => {
    fetchProducts();
    fetchUsers();
    fetchOrders();
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageSelection = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (!selectedFiles.length) return;

    const validFiles = selectedFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        notify(`${file.name} is not an image.`);
        return false;
      }

      // 5 MB maximum per image
      if (file.size > 5 * 1024 * 1024) {
        notify(`${file.name} is larger than 5 MB.`);
        return false;
      }

      return true;
    });

    setImageFiles((currentFiles) => {
      const combined = [...currentFiles, ...validFiles];

      const uniqueFiles = combined.filter(
        (file, index, array) =>
          index ===
          array.findIndex(
            (item) =>
              item.name === file.name &&
              item.size === file.size &&
              item.lastModified === file.lastModified,
          ),
      );

      if (uniqueFiles.length > 5) {
        notify("You can upload a maximum of 5 images.");
      }

      return uniqueFiles.slice(0, 5);
    });

    // Allows selecting the same image again after removing it
    e.target.value = "";
  };

  const removeSelectedImage = (indexToRemove) => {
    setImageFiles((currentFiles) =>
      currentFiles.filter((_, index) => index !== indexToRemove),
    );
  };

  // Product CRUD
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (isSavingProduct) return;

    const invalidVariant = variants.find((variant) => {
      const price = Number(variant.price);
      const mrp = variant.mrp === "" ? null : Number(variant.mrp);
      const stock = Number(variant.stock);

      return (
        !String(variant.weight).trim() ||
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isInteger(stock) ||
        stock < 0 ||
        (mrp !== null && (!Number.isFinite(mrp) || mrp < price))
      );
    });

    if (invalidVariant) {
      return notify(
        "For every weight, MRP must be equal to or greater than the selling price.",
      );
    }

    if (!editingProduct && imageFiles.length === 0) {
      return notify("Please select at least one product image.");
    }

    if (!token) {
      return notify("Your admin session has expired. Please login again.");
    }

    try {
      setIsSavingProduct(true);

      const payload = new FormData();

      payload.append("title", formData.title.trim());
      payload.append("description", formData.description || "");
      payload.append("category", formData.category);
      payload.append("isOrganic", String(formData.isOrganic));

      // Keep these because your backend/schema currently has
      // base product fields as well.
      payload.append("price", formData.price || variants[0]?.price || "0");
      payload.append("unit", formData.unit || variants[0]?.weight || "500g");
      payload.append("stock", String(formData.stock ?? 0));
      payload.append("imageUrl", formData.imageUrl || "");

      payload.append("variants", JSON.stringify(variants));

      payload.append(
        "keepImageIds",
        JSON.stringify(existingImages.map((image) => image.id)),
      );

      imageFiles.forEach((file) => {
        payload.append("images", file);
      });

      let response;

      if (editingProduct) {
        response = await axios.put(
          `${API_BASE_URL}/api/products/${editingProduct.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } else {
        response = await axios.post(`${API_BASE_URL}/api/products`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      console.log("Product save response:", response.data);

      setFormData({
        title: "",
        description: "",
        price: "",
        unit: "500g",
        stock: 50,
        imageUrl: "",
        category: "dry-fruits",
        isOrganic: true,
      });

      setVariants([
        {
          weight: "500g",
          price: "",
          mrp: "",
          stock: 50,
        },
      ]);

      setImageFiles([]);
      setEditingProduct(null);

      await fetchProducts();

      notify(
        editingProduct
          ? "Product updated successfully."
          : "Product saved to the live catalog.",
      );
    } catch (err) {
      console.error("PRODUCT SAVE ERROR:", err);
      console.error("STATUS:", err.response?.status);
      console.error("SERVER RESPONSE:", err.response?.data);

      if (err.response?.status === 401) {
        notify("Admin session expired. Please login again.");
      } else if (err.response?.status === 413) {
        notify("Selected images are too large.");
      } else {
        notify(
          err.response?.data?.message ||
            err.message ||
            "Unable to save product.",
        );
      }
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);

    setFormData({
      title: product.title,
      description: product.description || "",
      price: "",
      unit: "500g",
      stock: product.stock ?? 0,
      imageUrl: product.imageUrl || "",
      category: product.category || "dry-fruits",
      isOrganic: Boolean(product.isOrganic),
    });

    setVariants(
      product.variants?.length
        ? product.variants.map((variant) => ({
            weight: variant.weight,
            price: String(variant.price),
            mrp: variant.mrp == null ? "" : String(variant.mrp),
            stock: variant.stock,
          }))
        : [
            {
              weight: product.unit,
              price: String(product.price),
              mrp: product.mrp == null ? "" : String(product.mrp),
              stock: product.stock,
            },
          ],
    );

    // Existing Supabase images
    setExistingImages(
      (product.images || [])
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((image) => ({
          id: image.id,
          url: image.url,
          sortOrder: image.sortOrder,
        })),
    );

    setRemovedImageIds([]);
    setImageFiles([]);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const removeExistingImage = (imageId) => {
    setExistingImages((current) =>
      current.filter((image) => image.id !== imageId),
    );

    setRemovedImageIds((current) => [...current, imageId]);
  };

  const restoreExistingImage = (image) => {
    setExistingImages((current) =>
      [...current, image].sort((a, b) => a.sortOrder - b.sortOrder),
    );

    setRemovedImageIds((current) => current.filter((id) => id !== image.id));
  };

  const updateVariant = (index, field, value) => {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [field]: value } : variant,
      ),
    );
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this product?"))
      return;
    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`, authHeaders);
      fetchProducts();
    } catch (err) {
      notify("Failed to delete product.");
    }
  };

  // User Management
  const handleRoleToggle = async (targetUserId, currentRole) => {
    const newRole = currentRole === "ADMIN" ? "CUSTOMER" : "ADMIN";
    if (!confirm(`Change user role to ${newRole}?`)) return;

    try {
      await axios.put(
        `${API_BASE_URL}/api/auth/update-role`,
        {
          userId: targetUserId,
          role: newRole,
        },
        authHeaders,
      );
      fetchUsers();
    } catch (err) {
      alert("Failed to update user role");
    }
  };

  const handleDeleteUser = async (targetUserId, targetUserName) => {
    if (targetUserId === loggedUser?.id) {
      return alert("You cannot delete your own active Admin account!");
    }
    if (!confirm(`Permanently delete account "${targetUserName}"?`)) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/api/auth/users/${targetUserId}`,
        authHeaders,
      );
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  // Coupon Creation
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discount) return;
    try {
      await axios.post(
        `${API_BASE_URL}/api/admin/coupons`,
        newCoupon,
        authHeaders,
      );
      setNewCoupon({ code: "", discount: "" });
      fetchCoupons();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create coupon.");
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/admin/coupons/${id}`,
        authHeaders,
      );
      fetchCoupons();
    } catch {
      alert("Failed to delete coupon.");
    }
  };

  // Calculated Metrics
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.price * (p.stock ?? 50),
    0,
  );
  const lowStockProducts = products.filter((p) => (p.stock ?? 50) < 15);
  const adminCount = usersList.filter((u) => u.role === "ADMIN").length;
  const customerCount = usersList.filter((u) => u.role === "CUSTOMER").length;

  // Search Filters
  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.phone.includes(userSearchQuery),
  );

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title
      .toLowerCase()
      .includes(productSearchQuery.toLowerCase());
    const matchesStock =
      stockFilter === "all"
        ? true
        : stockFilter === "low"
          ? (p.stock ?? 50) < 15
          : (p.stock ?? 50) >= 15;
    return matchesSearch && matchesStock;
  });

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return alert("No data available to export");

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((val) => `"${val}"`)
        .join(","),
    );

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F5] flex flex-col font-sans">
      {/* HEADER */}
      <header className="bg-[#1A2B22] text-white sticky top-0 z-30 shadow-md border-b border-emerald-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToStore}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition border border-white/10"
            >
              <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
              <span>Back to Storefront</span>
            </button>

            <div>
              <h1 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                Paras Control Dashboard
                <span className="bg-[#D4AF37] text-slate-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                  Admin Active
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-white block">
                {loggedUser?.name}
              </span>
              <span className="text-[11px] text-emerald-300 block">
                {loggedUser?.email}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#2B4C3F] border border-emerald-600 flex items-center justify-center font-bold text-[#D4AF37]">
              {loggedUser?.name ? loggedUser.name.charAt(0).toUpperCase() : "A"}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        {/* TAB NAVIGATION */}
        <div className="flex border-b border-gray-200 mb-8 space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 text-sm font-bold transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === "overview"
                ? "border-[#2B4C3F] text-[#2B4C3F]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Performance Overview
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`pb-3 text-sm font-bold transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === "inventory"
                ? "border-[#2B4C3F] text-[#2B4C3F]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Package className="w-4 h-4" /> Products & Inventory (
            {products.length})
            {lowStockProducts.length > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {lowStockProducts.length} low
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 text-sm font-bold transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === "users"
                ? "border-[#2B4C3F] text-[#2B4C3F]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Users className="w-4 h-4" /> User Management ({usersList.length})
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 text-sm font-bold transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === "orders"
                ? "border-[#2B4C3F] text-[#2B4C3F]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> WhatsApp Orders (
            {ordersList.length})
          </button>

          <button
            onClick={() => setActiveTab("coupons")}
            className={`pb-3 text-sm font-bold transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === "coupons"
                ? "border-[#2B4C3F] text-[#2B4C3F]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Tag className="w-4 h-4" /> Coupons & Discounts
          </button>

          <button
            onClick={() => exportToCSV(usersList, "paras_users_report")}
            className="bg-[#2B4C3F] text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-900 transition"
          >
            Export Users CSV
          </button>
        </div>

        {/* ==================== TAB 1: OVERVIEW ==================== */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase block">
                    Est. Stock Valuation
                  </span>
                  <span className="text-2xl font-extrabold text-gray-900 mt-1 block">
                    ₹{totalInventoryValue.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                    Across {products.length} live products
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase block">
                    Total Customers
                  </span>
                  <span className="text-2xl font-extrabold text-gray-900 mt-1 block">
                    {usersList.length}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                    {customerCount} Shoppers | {adminCount} Admins
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase block">
                    Low Stock Alerts
                  </span>
                  <span className="text-2xl font-extrabold text-amber-600 mt-1 block">
                    {lowStockProducts.length} Items
                  </span>
                  <span className="text-[11px] text-amber-700 font-medium mt-1 block">
                    Needs restocking soon
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase block">
                    Active Promos
                  </span>
                  <span className="text-2xl font-extrabold text-purple-700 mt-1 block">
                    {coupons.length} Coupons
                  </span>
                  <span className="text-[11px] text-purple-600 font-medium mt-1 block">
                    E.g., PARAS10
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Tag className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Low Stock Items List */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />{" "}
                    Inventory Stock Warnings
                  </h3>
                  <button
                    onClick={() => setActiveTab("inventory")}
                    className="text-xs text-[#2B4C3F] font-bold hover:underline"
                  >
                    Manage Stock
                  </button>
                </div>
                {lowStockProducts.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">
                    All catalog items have healthy stock levels.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {lowStockProducts.map((p) => (
                      <div
                        key={p.id}
                        className="py-3 flex justify-between items-center"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(p.imageUrl)}
                            alt={p.title}
                            className="w-12 h-12 rounded-xl object-cover border"
                          />
                          <span className="font-semibold text-sm text-gray-900">
                            {p.title}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                          {p.stock ?? 8} left
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Orders Log */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#2B4C3F]" /> WhatsApp
                    Orders
                  </h3>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs text-[#2B4C3F] font-bold hover:underline"
                  >
                    View Orders
                  </button>
                </div>
                <div className="divide-y divide-gray-100">
                  {ordersList.slice(0, 4).map((o) => (
                    <div
                      key={o.id}
                      className="py-3 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-xs text-gray-900 block">
                          {o.id} - {o.customerName}
                        </span>
                        <span className="text-[11px] text-gray-400 block">
                          {o.phone}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-xs text-gray-900 block">
                          ₹{o.totalAmount}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: INVENTORY CRUD ==================== */}
        {activeTab === "inventory" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
            {/* ADD PRODUCT FORM */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#2B4C3F]" />{" "}
                {editingProduct ? "Edit" : "Create Catalog"}
                Product
              </h2>
              <form onSubmit={handleCreateProduct} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Iranian Mamra Almonds"
                    className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#2B4C3F]"
                  />
                </div>

                <div className="hidden">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Base Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="950"
                      className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#2B4C3F]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Initial Stock
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#2B4C3F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white"
                  >
                    <option value="dry-fruits">Dry Fruits & Nuts</option>
                    <option value="spices">Authentic Spices</option>
                    <option value="combos">Gifting Combos</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isOrganic}
                    onChange={(e) =>
                      setFormData({ ...formData, isOrganic: e.target.checked })
                    }
                    className="accent-[#2B4C3F]"
                  />
                  Mark this product as organic
                </label>

                <div className="hidden">
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#2B4C3F]"
                  />
                </div>

                {/* Live Image Preview */}
                {formData.imageUrl && (
                  <div className="mt-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                      Live Image Preview:
                    </span>
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-xl border"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Crisp, organic, direct from farm..."
                    className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#2B4C3F]"
                  />
                </div>

                <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-700">
                      Weights, price, MRP & stock
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setVariants([
                          ...variants,
                          { weight: "", price: "", mrp: "", stock: 0 },
                        ])
                      }
                      className="text-xs font-bold text-[#2B4C3F]"
                    >
                      + Add weight
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-1.5 px-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                      <span>Weight</span>
                      <span>Selling price</span>
                      <span>MRP</span>
                      <span>Stock</span>
                      <span />
                    </div>
                    {variants.map((variant, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-1.5 items-center"
                      >
                        <input
                          required
                          value={variant.weight}
                          onChange={(e) =>
                            updateVariant(index, "weight", e.target.value)
                          }
                          placeholder="e.g. 500g"
                          className="min-w-0 p-2 border rounded-lg text-xs"
                          aria-label="Weight"
                        />
                        <input
                          required
                          min="0"
                          type="number"
                          value={variant.price}
                          onChange={(e) =>
                            updateVariant(index, "price", e.target.value)
                          }
                          placeholder="e.g. 40"
                          className="min-w-0 p-2 border rounded-lg text-xs"
                          aria-label="Selling price"
                        />
                        <input
                          min="0"
                          type="number"
                          value={variant.mrp}
                          onChange={(e) =>
                            updateVariant(index, "mrp", e.target.value)
                          }
                          placeholder="e.g. 120"
                          className="min-w-0 p-2 border rounded-lg text-xs"
                          aria-label="MRP"
                        />
                        <input
                          required
                          min="0"
                          type="number"
                          value={variant.stock}
                          onChange={(e) =>
                            updateVariant(index, "stock", e.target.value)
                          }
                          placeholder="Stock"
                          className="min-w-0 p-2 border rounded-lg text-xs"
                          aria-label="Stock"
                        />
                        <button
                          type="button"
                          disabled={variants.length === 1}
                          onClick={() =>
                            setVariants(
                              variants.filter(
                                (_, variantIndex) => variantIndex !== index,
                              ),
                            )
                          }
                          className="p-1 text-red-500 disabled:text-gray-300"
                          aria-label="Remove weight"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">
                    MRP is optional, but must be at least the selling price.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Product images (up to 5)
                    {editingProduct ? " — keep, remove or add images" : ""}
                  </label>

                  {/* EXISTING SUPABASE IMAGES */}
                  {editingProduct && existingImages.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[11px] font-semibold text-gray-500 mb-2">
                        Current images
                      </p>

                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {existingImages.map((image) => (
                          <div key={image.id} className="relative">
                            <img
                              src={image.url}
                              alt="Current product"
                              className="w-full aspect-square object-cover rounded-lg border"
                            />

                            <button
                              type="button"
                              onClick={() => removeExistingImage(image.id)}
                              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow"
                              aria-label="Remove existing image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* NEW FILES */}
                  {imageFiles.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[11px] font-semibold text-emerald-700 mb-2">
                        New images
                      </p>

                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {imageFiles.map((file, index) => (
                          <div
                            key={`${file.name}-${file.size}-${index}`}
                            className="relative"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`New ${index + 1}`}
                              className="w-full aspect-square object-cover rounded-lg border"
                            />

                            <button
                              type="button"
                              onClick={() => removeSelectedImage(index)}
                              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelection}
                    className="sr-only"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-4 text-xs font-semibold text-gray-600 hover:border-[#2B4C3F] hover:text-[#2B4C3F]"
                  >
                    <ImagePlus className="w-5 h-5" />
                    {editingProduct
                      ? "Add more images"
                      : "Upload images from device"}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="w-full bg-[#2B4C3F] hover:bg-emerald-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition shadow"
                >
                  {isSavingProduct
                    ? "Saving Product..."
                    : editingProduct
                      ? "Save Product Changes"
                      : "Save Product to Store"}
                </button>
              </form>
            </div>

            {/* INVENTORY TABLE */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      placeholder="Search inventory..."
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-xs focus:outline-none"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  </div>

                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="bg-white border text-xs px-3 py-2 rounded-xl"
                  >
                    <option value="all">All Stock</option>
                    <option value="low">Low Stock Only (&lt;15)</option>
                    <option value="instock">In Stock Only (&ge;15)</option>
                  </select>
                </div>

                <button
                  onClick={fetchProducts}
                  className="text-xs text-[#2B4C3F] font-bold flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Sync Catalog
                </button>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 border-b text-xs uppercase tracking-wider">
                      <th className="p-4">Product Details</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock Level</th>
                      <th className="p-4 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={getImageUrl(p.imageUrl)}
                            alt={p.title}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <div>
                            <span className="font-bold text-gray-900 block">
                              {p.title}
                            </span>
                            <span className="text-xs text-gray-400 block">
                              {p.unit || "500g"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-gray-900">
                          ₹{p.price}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                              (p.stock ?? 50) < 15
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {p.stock ?? 50} units
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleEditProduct(p)}
                            className="p-2 text-[#2B4C3F] hover:bg-emerald-50 rounded-xl transition"
                            title="Edit product"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: USER MANAGEMENT ==================== */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
            <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search user name, email, or phone..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-xs focus:outline-none focus:border-[#2B4C3F]"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 font-medium">
                  Total Registered Users:{" "}
                  <strong className="text-gray-900">
                    {filteredUsers.length}
                  </strong>
                </span>
                <button
                  onClick={fetchUsers}
                  className="text-xs text-[#2B4C3F] font-bold flex items-center gap-1 hover:underline"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh List
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 border-b text-xs uppercase tracking-wider">
                    <th className="p-4">Customer</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Role Permission</th>
                    <th className="p-4 text-right">Role Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          {u.name}
                          {u.id === loggedUser?.id && (
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </td>
                      <td className="p-4 text-gray-700 font-medium">
                        {u.phone || "N/A"}
                      </td>
                      <td className="p-4">
                        {u.role === "ADMIN" ? (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />{" "}
                            ADMIN
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full w-fit block">
                            CUSTOMER
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleRoleToggle(u.id, u.role)}
                            disabled={u.id === loggedUser?.id}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                              u.role === "ADMIN"
                                ? "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                            } ${u.id === loggedUser?.id ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {u.role === "ADMIN"
                              ? "Demote to Customer"
                              : "Make Admin"}
                          </button>

                          {u.id !== loggedUser?.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-xl transition"
                              title="Delete Account"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: WHATSAPP ORDERS LOG ==================== */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#2B4C3F]" /> Offline &
                WhatsApp Order Log
              </h3>
              <button
                onClick={fetchOrders}
                className="text-xs text-[#2B4C3F] font-bold flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Sync Orders
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 border-b text-xs uppercase tracking-wider">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Total Price</th>
                    <th className="p-4">Current Status</th>
                    <th className="p-4 text-right">Update Order Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ordersList.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="p-4 font-mono font-bold text-gray-900">
                        {o.id}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">
                          {o.customerName || o.user?.name || "Customer"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {o.phone || o.user?.phone}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-900">
                        ₹{o.totalAmount}
                      </td>
                      <td className="p-4">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={o.status}
                          onChange={(e) =>
                            handleOrderStatusChange(o.id, e.target.value)
                          }
                          className="bg-gray-50 border text-xs font-bold px-3 py-1.5 rounded-xl text-gray-700"
                        >
                          <option value="PENDING_WHATSAPP">
                            Pending WhatsApp
                          </option>
                          <option value="CONFIRMED">Confirmed & Paid</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: COUPONS & DISCOUNTS ==================== */}
        {activeTab === "coupons" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
            {/* Create Promo Code Form */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#2B4C3F]" /> Create Promo Code
              </h2>
              <form onSubmit={handleCreateCoupon} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., FESTIVE25"
                    value={newCoupon.code}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, code: e.target.value })
                    }
                    className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm uppercase font-mono font-bold focus:bg-white focus:outline-none focus:border-[#2B4C3F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Minimum order amount (₹, optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 means no minimum"
                    value={newCoupon.minimumAmount || ""}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        minimumAmount: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#2B4C3F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="15"
                    min="1"
                    max="90"
                    value={newCoupon.discount}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, discount: e.target.value })
                    }
                    className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#2B4C3F]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2B4C3F] hover:bg-emerald-900 text-white font-bold py-3 rounded-xl transition shadow"
                >
                  Activate Promo Code
                </button>
              </form>
            </div>

            {/* Coupons List */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Percent className="w-5 h-5 text-[#2B4C3F]" /> Active Store
                  Coupons
                </h3>
              </div>

              <div className="divide-y divide-gray-100">
                {coupons.map((c) => (
                  <div
                    key={c.code}
                    className="p-4 flex justify-between items-center hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                        {c.discount}%
                      </div>
                      <div>
                        <span className="font-mono font-bold text-gray-900 block">
                          {c.code}
                        </span>
                        <span className="text-xs text-gray-400 block">
                          {c.usageCount} customer redemptions ·{" "}
                          {Number(c.minimumAmount) > 0
                            ? `Min. ₹${c.minimumAmount}`
                            : "No minimum order"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <Toast message={toastMessage} isVisible={Boolean(toastMessage)} />
    </div>
  );
}
