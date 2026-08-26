"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Image from "next/image";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Tags, User, Calculator, CheckCircle, Printer, Banknote, RefreshCw, X, Package, ChevronRight } from "lucide-react";

import POSReceipt from "./POSReceipt";

const rawAPI = process.env.NEXT_PUBLIC_API_BASE || "";
const API = rawAPI.endsWith("/") ? rawAPI.slice(0, -1) : rawAPI;

// ── Types ──────────────────────────────────────────────────────

type PopulatedCategory = { _id: string; name: string; slug?: string };

type Product = {
  _id: string;
  productId: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  category: string | PopulatedCategory | null;
};

type CartItem = Product & { cartQuantity: number };

function getCategoryName(category: Product["category"]): string {
  if (!category) return "Uncategorized";
  if (typeof category === "string") return category;
  return category.name || "Uncategorized";
}

// ── Skeleton Card ──────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="aspect-square animate-pulse bg-neutral-100 dark:bg-neutral-800" />
      <div className="space-y-2 p-3">
        <div className="h-2 w-12 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-3 w-full animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-3 w-2/3 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
        <div className="flex justify-between pt-1">
          <div className="h-4 w-16 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
          <div className="h-4 w-10 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function AdminPOSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "ONLINE">("CASH");
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState("");

  // FETCH
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/api/products`);
        const list = Array.isArray(res.data) ? res.data : res.data.products || [];
        setProducts(list.filter((p: Product) => p.stock > 0));
      } catch {
        toast.error("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // DERIVED
  // Dedupe by the normalized category NAME, not the raw (possibly-object)
  // category value — this is what actually fixes the duplicate-key warning.
  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(products.map((p) => getCategoryName(p.category))))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase();
      const categoryName = getCategoryName(p.category);
      return (p.name.toLowerCase().includes(q) || p.productId.toLowerCase().includes(q)) && (selectedCategory === "All" || categoryName === selectedCategory);
    });
  }, [products, searchQuery, selectedCategory]);

  const subTotal = cart.reduce((s, i) => s + i.price * i.cartQuantity, 0);
  const totalItems = cart.reduce((s, i) => s + i.cartQuantity, 0);
  const discountAmount = subTotal * (discountPercent / 100);
  const grandTotal = subTotal - discountAmount;

  // CART OPS
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.productId);
      if (existing) {
        if (existing.cartQuantity >= product.stock) {
          toast.error("Stock limit reached!");
          return prev;
        }
        return prev.map((i) => (i.productId === product.productId ? { ...i, cartQuantity: i.cartQuantity + 1 } : i));
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, action: "increase" | "decrease") => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        if (action === "increase" && item.cartQuantity < item.stock) return { ...item, cartQuantity: item.cartQuantity + 1 };
        if (action === "decrease" && item.cartQuantity > 1) return { ...item, cartQuantity: item.cartQuantity - 1 };
        return item;
      }),
    );
  };

  const removeFromCart = (productId: string) => setCart((prev) => prev.filter((i) => i.productId !== productId));

  const clearCart = () => {
    if (window.confirm("Clear the cart?")) {
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

  // CHECKOUT
  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Cart is empty!");

    try {
      setIsProcessing(true);
      const token = localStorage.getItem("CAMX_TOKEN");

      const res = await axios.post(
        `${API}/api/orders/checkout`,
        {
          items: cart.map((i) => ({
            productId: i.productId, // Backend එකට අනුව මේක i._id වෙන්නත් පුළුවන්
            _id: i._id, // ආරක්ෂාවට _id එකත් යවනවා
            quantity: i.cartQuantity,
            price: i.price,
          })),
          totalPrice: grandTotal,
          paymentMethod,
          orderStatus: "COMPLETED",
          customerName,
          customerPhone,
          discountGiven: discountAmount,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Payment successful!");
      setLastOrderId(res.data.order?.orderId || `POS-${Date.now()}`);
      setOrderSuccess(true);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      console.error("Checkout Error:", axiosError.response?.data || axiosError.message);
      const errorMsg = axiosError.response?.data?.message || "Checkout failed. Check console!";
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── UI ─────────────────────────────────────────────────────────
  return (
    <>
      {/* 🖨️ PRINT ONLY SECTION */}
      <div className="hidden print:block print:bg-white print:absolute print:inset-0 print:z-9999">
        <POSReceipt cart={cart} subTotal={subTotal} discountAmount={discountAmount} grandTotal={grandTotal} customerName={customerName} customerPhone={customerPhone} paymentMethod={paymentMethod} orderId={lastOrderId} discountPercent={discountPercent} />
      </div>

      {/* 💻 MAIN SCREEN SECTION */}
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-neutral-50 dark:bg-background font-sans print:hidden">
        {/* ══ LEFT PANEL ══ */}
        <div className="flex flex-1 flex-col overflow-hidden border-r border-neutral-200 dark:border-border">
          {/* TOP BAR */}
          <div className="shrink-0 space-y-4 border-b border-neutral-200 bg-white px-6 py-4 dark:border-border dark:bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10">
                  <Tags size={17} className="text-secondary" />
                </div>
                <div>
                  <h1 className="text-lg font-black leading-tight text-neutral-900 dark:text-white">POS Terminal</h1>
                  <p className="text-[11px] font-semibold text-neutral-400">{new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 dark:border-green-800/40 dark:bg-green-900/20">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                <span className="text-[11px] font-black text-green-600 dark:text-green-400">LIVE</span>
              </div>
            </div>

            {/* SEARCH */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input type="text" placeholder="Search by name or SKU..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-11 pr-10 text-sm outline-none transition focus:border-secondary focus:ring-4 focus:ring-secondary/8 dark:border-border dark:bg-neutral-900" />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-700">
                    <X size={14} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* CATEGORY PILLS */}
            <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${selectedCategory === cat ? "bg-secondary text-white shadow-md shadow-secondary/20" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* PRODUCT GRID */}
          <div className="flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-neutral-400">
                <Package size={48} className="opacity-20" />
                <p className="font-semibold">No products found</p>
                <p className="text-sm opacity-70">Try a different search or category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredProducts.map((product) => {
                  const inCart = cart.find((i) => i.productId === product.productId);
                  return (
                    <motion.button key={product.productId} whileTap={{ scale: 0.97 }} onClick={() => addToCart(product)} className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-card ${inCart ? "border-secondary/40 ring-2 ring-secondary/20" : "border-neutral-200 hover:border-secondary/30 dark:border-border"}`}>
                      {/* IN-CART BADGE */}
                      {inCart && <div className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-black text-white shadow">{inCart.cartQuantity}</div>}

                      <div className="relative aspect-square w-full overflow-hidden bg-neutral-50 dark:bg-neutral-900">
                        <Image src={product.images[0] || "/placeholder.jpg"} alt={product.name} sizes="50vw" fill className="object-contain p-3 transition duration-500 group-hover:scale-110" unoptimized />
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-3">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-neutral-400">{getCategoryName(product.category)}</p>
                          <h3 className="mt-0.5 line-clamp-2 text-[13px] font-bold leading-snug text-neutral-800 dark:text-white">{product.name}</h3>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between border-t border-neutral-100 pt-2 dark:border-neutral-800">
                          <span className="text-sm font-black text-secondary">Rs {product.price.toLocaleString()}</span>
                          <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-black ${product.stock > 10 ? "bg-green-100 text-green-600 dark:bg-green-900/30" : "bg-amber-100 text-amber-600 dark:bg-amber-900/30"}`}>{product.stock} left</span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="relative flex w-full flex-col bg-white dark:bg-card lg:w-105 xl:w-115">
          {/* SUCCESS OVERLAY */}
          <AnimatePresence>
            {orderSuccess && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/97 p-8 text-center backdrop-blur-sm dark:bg-card/97">
                <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                  <CheckCircle className="mb-5 h-20 w-20 text-green-500" />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <h2 className="mb-1 text-2xl font-black text-neutral-900 dark:text-white">Payment Successful!</h2>
                  <p className="mb-1 text-sm text-neutral-500">Transaction Complete</p>
                  <div className="mb-8 inline-flex items-center gap-1.5 rounded-xl border border-secondary/20 bg-secondary/5 px-4 py-2">
                    <span className="text-xs text-neutral-500">Order ID:</span>
                    <span className="font-mono text-sm font-black text-secondary">{lastOrderId}</span>
                  </div>
                </motion.div>

                <div className="w-full space-y-3">
                  <button onClick={() => window.print()} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-3.5 text-sm font-bold text-white shadow-lg shadow-secondary/25 transition hover:opacity-90">
                    <Printer size={16} />
                    Print Receipt
                  </button>
                  <button onClick={resetPOS} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 py-3.5 text-sm font-bold text-neutral-700 transition hover:bg-neutral-100 dark:border-border dark:bg-neutral-900 dark:text-white">
                    <RefreshCw size={16} />
                    New Sale
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CART HEADER */}
          <div className="shrink-0 border-b border-neutral-100 px-5 py-4 dark:border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
                  <ShoppingCart size={18} className="text-secondary" />
                  {totalItems > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[9px] font-black text-white">{totalItems}</span>}
                </div>
                <div>
                  <h2 className="text-base font-black text-neutral-900 dark:text-white">Current Order</h2>
                  <p className="text-[11px] font-semibold text-neutral-400">
                    {cart.length} item{cart.length !== 1 ? "s" : ""} · Rs {subTotal.toLocaleString()}
                  </p>
                </div>
              </div>
              {cart.length > 0 && (
                <button onClick={clearCart} className="rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-500 transition hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/10">
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* CUSTOMER INFO */}
          <div className="shrink-0 border-b border-neutral-100 bg-neutral-50/50 px-5 py-3 dark:border-border dark:bg-neutral-900/30">
            <div className="flex gap-2.5">
              <div className="relative flex-1">
                <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                <input type="text" placeholder="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-8 pr-3 text-xs font-semibold outline-none transition focus:border-secondary dark:border-border dark:bg-neutral-900" />
              </div>
              <input type="text" placeholder="Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="h-9 w-28 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold outline-none transition focus:border-secondary dark:border-border dark:bg-neutral-900" />
            </div>
          </div>

          {/* CART ITEMS */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            <AnimatePresence>
              {cart.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col items-center justify-center gap-3 text-neutral-300 dark:text-neutral-600">
                  <ShoppingCart size={56} strokeWidth={1} />
                  <p className="text-sm font-semibold">Cart is empty</p>
                  <p className="text-xs opacity-70">Click a product to add it</p>
                </motion.div>
              ) : (
                cart.map((item) => (
                  <motion.div key={item.productId} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, height: 0 }} transition={{ duration: 0.22 }} className="flex gap-3 rounded-2xl border border-neutral-100 bg-white p-3 dark:border-border dark:bg-neutral-900">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-black">
                      <Image src={item.images[0] || "/placeholder.jpg"} alt={item.name} fill className="object-contain p-1.5" unoptimized />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="line-clamp-1 text-[13px] font-bold text-neutral-800 dark:text-white">{item.name}</h4>
                        <button onClick={() => removeFromCart(item.productId)} className="shrink-0 rounded-lg p-1 text-neutral-300 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20">
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-secondary">Rs {(item.price * item.cartQuantity).toLocaleString()}</span>
                        <div className="flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-800">
                          <button onClick={() => updateQuantity(item.productId, "decrease")} className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-neutral-600 shadow-sm transition hover:text-secondary dark:bg-neutral-700 dark:text-neutral-300">
                            <Minus size={11} />
                          </button>
                          <span className="w-5 text-center text-xs font-black">{item.cartQuantity}</span>
                          <button onClick={() => updateQuantity(item.productId, "increase")} className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-neutral-600 shadow-sm transition hover:text-secondary dark:bg-neutral-700 dark:text-neutral-300">
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* CHECKOUT FOOTER */}
          <div className="shrink-0 border-t border-neutral-200 dark:border-border">
            {/* PAYMENT + DISCOUNT */}
            <div className="flex gap-3 border-b border-neutral-100 px-5 py-4 dark:border-border">
              <div className="flex-1">
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-neutral-400">Payment</label>
                <div className="flex overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 dark:border-border dark:bg-neutral-900">
                  {(["CASH", "CARD"] as const).map((m) => (
                    <button key={m} onClick={() => setPaymentMethod(m)} className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-[11px] font-bold transition ${paymentMethod === m ? "bg-secondary text-white" : "text-neutral-500 hover:text-neutral-700"}`}>
                      {m === "CASH" ? <Banknote size={13} /> : <CreditCard size={13} />}
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-28">
                <label className="mb-1.5 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  <Calculator size={10} />
                  Discount %
                </label>
                <input type="number" min={0} max={100} value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))} className="h-9 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-center text-sm font-black outline-none transition focus:border-secondary dark:border-border dark:bg-neutral-900" />
              </div>
            </div>

            {/* TOTALS */}
            <div className="space-y-2 px-5 py-4">
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Subtotal</span>
                <span className="font-semibold">Rs {subTotal.toLocaleString()}</span>
              </div>
              <AnimatePresence>
                {discountPercent > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex justify-between text-sm font-bold text-green-500">
                    <span>Discount ({discountPercent}%)</span>
                    <span>− Rs {discountAmount.toLocaleString()}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex items-end justify-between border-t border-neutral-100 pt-3 dark:border-border">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Total</p>
                  <p className="text-3xl font-black leading-none text-neutral-900 dark:text-white">Rs {grandTotal.toLocaleString()}</p>
                </div>
                <p className="text-xs font-semibold text-neutral-400">{totalItems} items</p>
              </div>
            </div>

            {/* PAY BUTTON */}
            <div className="px-5 pb-5">
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleCheckout} disabled={cart.length === 0 || isProcessing} className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-secondary py-4 text-base font-black text-white shadow-lg shadow-secondary/25 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none">
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw size={16} className="animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    Charge Rs {grandTotal.toLocaleString()}
                    <ChevronRight size={18} />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
