"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";

type CartItem = {
  _id: string;
  productId?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number;
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. LocalStorage Data Fetch
  useEffect(() => {
    const loadCart = () => {
      try {
        const storedCart = localStorage.getItem("CAMX_CART");
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, []);

  const saveCartToStorage = (updatedItems: CartItem[]) => {
    setCartItems(updatedItems);
    localStorage.setItem("CAMX_CART", JSON.stringify(updatedItems));
    window.dispatchEvent(new Event("storage"));
  };

  // 2. Quantity Management
  const updateQuantity = (id: string, delta: number) => {
    const updated = cartItems.map((item) => {
      if (item._id === id) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    });
    saveCartToStorage(updated);
  };

  // 3. Item Eviction
  const removeItem = (id: string) => {
    const filtered = cartItems.filter((item) => item._id !== id);
    saveCartToStorage(filtered);
  };

  // 4. Aggregates Calculation
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = cartItems.length > 0 ? 450 : 0;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-background text-neutral-900 dark:text-white pt-28 pb-24 px-4 sm:px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* PAGE TITLE */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
            Shopping <span className="text-secondary">Cart</span>
          </h1>
          <p className="text-sm text-neutral-500 dark:text-gray-400 mt-2">Review and adjust your smart security systems before checkout.</p>
        </div>

        {cartItems.length === 0 ? (
          /* EMPTY CART STATE (Safely Escaped Text Layers) */
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-card border border-neutral-200 dark:border-border rounded-3xl p-8 shadow-sm transition-colors duration-300">
            <div className="w-16 h-16 rounded-2xl bg-neutral-50 dark:bg-background flex items-center justify-center mb-6 text-neutral-400 dark:text-gray-600">
              <ShoppingBag size={32} />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Your cart is empty</h2>
            <p className="text-neutral-500 dark:text-gray-400 mb-6 max-w-sm">You haven&apos;t added any CCTV cameras or security solutions to your layout yet.</p>
            <Link href="/products" className="px-6 py-3 rounded-2xl bg-secondary text-white text-sm font-bold hover:bg-opacity-90 transition cursor-pointer shadow-md shadow-secondary/10">
              Browse Products
            </Link>
          </div>
        ) : (
          /* MAIN GRID BLOCK */
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* LEFT COLUMN: ITEMS VIEW */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-card border border-neutral-200 dark:border-border shadow-sm transition-colors duration-300">
                  {/* METRIC INFO HEADER */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 bg-neutral-100 dark:bg-white rounded-2xl overflow-hidden p-2 shrink-0 border border-neutral-200 dark:border-neutral-100">
                      <Image src={item.image || "/placeholder.jpg"} alt={item.name} fill className="object-contain" />
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-neutral-900 dark:text-white line-clamp-1">{item.name}</h2>
                      <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">Unit: LKR {item.price.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* INTERACTIVE CONTROLS */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                    {/* ACCUMULATION TOGGLE */}
                    <div className="flex items-center h-10 rounded-xl bg-neutral-100 dark:bg-background border border-neutral-200 dark:border-border overflow-hidden">
                      <button onClick={() => updateQuantity(item._id, -1)} className="w-10 h-full flex items-center justify-center text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition cursor-pointer">
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-neutral-900 dark:text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, 1)} className="w-10 h-full flex items-center justify-center text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition cursor-pointer">
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* VALUATION FIELD - Updated to min-w-25 for Tailwind v4 compatibility */}
                    <div className="text-right min-w-25">
                      <p className="text-base font-black text-secondary">LKR {(item.price * item.quantity).toLocaleString()}</p>
                    </div>

                    {/* DISCARD NODE ACTION */}
                    <button onClick={() => removeItem(item._id)} className="text-neutral-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT COLUMN: RECAP MATRIX */}
            <div className="p-6 rounded-3xl bg-white dark:bg-card border border-neutral-200 dark:border-border shadow-sm space-y-6 transition-colors duration-300">
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">Order Summary</h3>

              <div className="space-y-3 text-sm font-medium">
                <div className="flex justify-between text-neutral-500 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-neutral-900 dark:text-white">LKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-500 dark:text-gray-400">
                  <span>Estimated Delivery</span>
                  <span className="text-neutral-900 dark:text-white">LKR {shipping.toLocaleString()}</span>
                </div>

                <div className="pt-4 border-t border-neutral-200 dark:border-border/60 flex justify-between text-base font-black">
                  <span className="text-neutral-900 dark:text-white">Total Amount</span>
                  <span className="text-secondary">LKR {total.toLocaleString()}</span>
                </div>
              </div>

              {/* PROGRESS INVOICING REDIRECT */}
              <Link href="/checkout" className="w-full h-12 rounded-xl bg-secondary text-white font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition cursor-pointer shadow-md shadow-secondary/10">
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </Link>

              <Link href="/products" className="block text-center text-xs text-neutral-500 dark:text-gray-400 hover:text-secondary dark:hover:text-white transition font-semibold">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
