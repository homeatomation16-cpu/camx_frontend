"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Tags,
  User,
  Calculator,
  CheckCircle,
  Printer,
  Banknote,
  RefreshCw,
} from "lucide-react";

// .env එකේ අගය අගට slash (/) එකක් තිබ්බත් නැතත් හරි යන්න මෙතැන හදලා තියෙනවා.
const rawAPI = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
const API = rawAPI.endsWith("/") ? rawAPI.slice(0, -1) : rawAPI;

// ======================================
// TYPES
// ======================================
type Product = {
  _id: string;
  productId: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  category: string;
};

type CartItem = Product & {
  cartQuantity: number;
};

// ======================================
// COMPONENT
// ======================================
export default function AdminPOSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Cart & Order State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // Advanced POS Fields
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "CARD" | "ONLINE"
  >("CASH");
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState("");

  // ======================================
  // FETCH PRODUCTS
  // ======================================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // ✅ ඔයා ඉල්ලපු විදිහටම api/products ලෙස සකසා ඇත
        const res = await axios.get(`${API}/api/products`);

        const availableProducts = Array.isArray(res.data)
          ? res.data.filter((p: Product) => p.stock > 0)
          : [];
        setProducts(availableProducts);
      } catch (error) {
        console.error("Error fetching POS products:", error);
        toast.error("Failed to load products for POS.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ======================================
  // DERIVED DATA
  // ======================================
  // 1. Get Unique Categories
  const categories = useMemo(() => {
    const cats = products.map((p) => p.category);
    return ["All", ...Array.from(new Set(cats))];
  }, [products]);

  // 2. Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.productId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 3. Calculations
  const subTotal = cart.reduce(
    (sum, item) => sum + item.price * item.cartQuantity,
    0,
  );
  const totalItems = cart.reduce((sum, item) => sum + item.cartQuantity, 0);
  const discountAmount = subTotal * (discountPercent / 100);
  const grandTotal = subTotal - discountAmount;

  // ======================================
  // CART FUNCTIONS
  // ======================================
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.productId,
      );
      if (existing) {
        if (existing.cartQuantity >= product.stock) {
          toast.error("Cannot exceed available stock limit!");
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.productId
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (
    productId: string,
    action: "increase" | "decrease",
  ) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          if (action === "increase" && item.cartQuantity < item.stock)
            return { ...item, cartQuantity: item.cartQuantity + 1 };
          if (action === "decrease" && item.cartQuantity > 1)
            return { ...item, cartQuantity: item.cartQuantity - 1 };
        }
        return item;
      }),
    );
  };

  const removeFromCart = (productId: string) =>
    setCart((prev) => prev.filter((item) => item.productId !== productId));

  const clearCart = () => {
    if (window.confirm("Are you sure you want to clear the cart?")) {
      setCart([]);
      setDiscountPercent(0);
    }
  };

  const resetPOS = () => {
    setCart([]);
    setDiscountPercent(0);
    setCustomerName("Walk-in Customer");
    setCustomerPhone("");
    setOrderSuccess(false);
    setLastOrderId(null);
  };

  // ======================================
  // CHECKOUT HANDLER
  // ======================================
  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Cart is empty!");

    try {
      setIsProcessing(true);
      const token = localStorage.getItem("CAMX_TOKEN");

      const orderPayload = {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.cartQuantity,
          price: item.price,
        })),
        totalPrice: grandTotal,
        paymentMethod: paymentMethod,
        orderStatus: "COMPLETED",
        customerName: customerName,
        customerPhone: customerPhone,
        discountGiven: discountAmount,
      };

      // ✅ ඔයා ඉල්ලපු විදිහටම api/orders/checkout ලෙස සකසා ඇත
      const response = await axios.post(
        `${API}/api/orders/checkout`,
        orderPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("Payment successful!");
      setLastOrderId(response.data.order?.orderId || `POS-${Date.now()}`);
      setOrderSuccess(true);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to process checkout.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ======================================
  // UI RENDER
  // ======================================
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[#f8f9fa] dark:bg-background overflow-hidden font-sans">
      {/* ========================================== */}
      {/* LEFT PANEL : PRODUCT GRID & FILTERS */}
      {/* ========================================== */}
      <div className="flex-1 flex flex-col h-full border-r border-gray-200 dark:border-border">
        {/* Header & Advanced Search/Filters */}
        <div className="p-5 bg-white dark:bg-card border-b border-gray-200 dark:border-border space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
              <Tags className="text-blue-600" /> POS Terminal
            </h1>
            <span className="text-sm font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-600 dark:text-gray-300">
              {new Date().toLocaleDateString()}
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Scan barcode or search by product name, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition text-sm font-medium"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="flex-1 overflow-y-auto p-5 bg-gray-50/50 dark:bg-black/5">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-pulse">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 bg-gray-200 dark:bg-gray-800 rounded-2xl"
                ></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Search size={48} className="mb-4 opacity-20" />
              <p className="font-medium text-lg">No products found</p>
              <p className="text-sm opacity-70">
                Try adjusting your search or category filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.productId}
                  onClick={() => addToCart(product)}
                  className="bg-white dark:bg-card border border-gray-100 dark:border-gray-800 rounded-2xl p-3 text-left hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full"
                >
                  <div className="relative w-full aspect-square bg-gray-50 dark:bg-gray-900 rounded-xl mb-3 overflow-hidden">
                    <Image
                      src={product.images[0] || "/placeholder.jpg"}
                      alt={product.name}
                      fill
                      className="object-contain p-3 group-hover:scale-110 transition duration-500"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                        {product.category}
                      </p>
                      <h3 className="font-bold text-sm text-gray-800 dark:text-white line-clamp-2 leading-snug mt-1">
                        {product.name}
                      </h3>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-gray-50 dark:border-gray-800/50 pt-2">
                      <span className="font-black text-blue-600">
                        Rs. {product.price.toLocaleString()}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-1 rounded-md ${product.stock > 10 ? "bg-green-100 text-green-600 dark:bg-green-900/30" : "bg-orange-100 text-orange-600 dark:bg-orange-900/30"}`}
                      >
                        {product.stock} Left
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* RIGHT PANEL : CART & ADVANCED CHECKOUT */}
      {/* ========================================== */}
      <div className="w-full lg:w-105 xl:w-120 bg-white dark:bg-card flex flex-col h-full shadow-2xl z-10 relative">
        {/* SUCCESS OVERLAY */}
        {orderSuccess && (
          <div className="absolute inset-0 bg-white/95 dark:bg-card/95 z-50 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
            <CheckCircle className="text-green-500 w-24 h-24 mb-6 animate-bounce" />
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-500 font-medium mb-8">
              Order ID:{" "}
              <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {lastOrderId}
              </span>
            </p>

            <div className="w-full space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/20">
                <Printer size={20} /> Print Receipt
              </button>
              <button
                onClick={resetPOS}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition"
              >
                <RefreshCw size={20} /> New Sale
              </button>
            </div>
          </div>
        )}

        {/* Cart Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-800 dark:text-white leading-tight">
                Current Order
              </h2>
              <p className="text-xs font-bold text-gray-400">
                {totalItems} Items in cart
              </p>
            </div>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
          >
            Clear All
          </button>
        </div>

        {/* Customer Info (Advanced Feature) */}
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 flex gap-3">
          <div className="flex-1 relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:border-blue-500 transition"
            />
          </div>
          <div className="w-1/3 relative">
            <input
              type="text"
              placeholder="Phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
              <ShoppingCart size={64} className="opacity-10 mb-2" />
              <p className="text-sm font-medium">
                Cart is empty. Scan or search items.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.productId}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3 rounded-2xl flex gap-3 shadow-sm hover:border-gray-300 transition group"
              >
                <div className="w-16 h-16 bg-gray-50 dark:bg-black rounded-xl relative overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800">
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    className="object-contain p-1.5"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-sm text-gray-800 dark:text-white line-clamp-1">
                      {item.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-gray-300 hover:text-red-500 transition p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-black text-gray-800 dark:text-gray-200">
                      Rs. {(item.price * item.cartQuantity).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-1 border border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, "decrease")
                        }
                        className="w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 rounded text-gray-600 shadow-sm hover:text-blue-600"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">
                        {item.cartQuantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, "increase")
                        }
                        className="w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 rounded text-gray-600 shadow-sm hover:text-blue-600"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Advanced Checkout Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-card">
          {/* Discount & Payment Method */}
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 mb-1.5 block">
                Payment Method
              </label>
              <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                {["CASH", "CARD"].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method as never)}
                    className={`flex-1 text-xs font-bold py-2 rounded-md transition flex items-center justify-center gap-1.5 ${
                      paymentMethod === method
                        ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                        : "text-gray-500"
                    }`}
                  >
                    {method === "CASH" ? (
                      <Banknote size={14} />
                    ) : (
                      <CreditCard size={14} />
                    )}{" "}
                    {method}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-1/3">
              <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1">
                <Calculator size={12} /> Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-bold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:border-blue-500 transition text-center"
              />
            </div>
          </div>

          {/* Totals */}
          <div className="p-5 space-y-2.5">
            <div className="flex justify-between text-gray-500 text-sm font-medium">
              <span>Subtotal</span>
              <span>Rs. {subTotal.toLocaleString()}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-green-500 text-sm font-bold">
                <span>Discount ({discountPercent}%)</span>
                <span>- Rs. {discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-1 flex justify-between items-end">
              <div>
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block">
                  Total Payable
                </span>
                <span className="text-3xl font-black text-gray-900 dark:text-white leading-none">
                  Rs. {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Pay Button */}
          <div className="px-5 pb-5">
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition shadow-xl shadow-blue-600/25 disabled:opacity-50 disabled:shadow-none"
            >
              {isProcessing ? (
                <span className="animate-pulse">Processing Transaction...</span>
              ) : (
                <>Pay Rs. {grandTotal.toLocaleString()}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
