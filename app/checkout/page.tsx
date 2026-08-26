"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { Truck, CheckCircle2, ArrowLeft, CreditCard, Landmark } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

// ======================================
// PAYHERE TYPES & GLOBAL DECLARATION
// ======================================

type PayHerePaymentParams = {
  sandbox: boolean;
  merchant_id: string;
  return_url?: string;
  cancel_url?: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: string;
  currency: string;
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
};

declare global {
  interface Window {
    payhere: {
      onCompleted: (orderId: string) => void;
      onDismissed: () => void;
      onError: (error: string) => void;
      startPayment: (paymentParams: PayHerePaymentParams) => void;
    };
  }
}

// Bank transfer details shown to the customer — replace with your real bank info.
const BANK_DETAILS = {
  bankName: "Commercial Bank of Ceylon",
  accountName: "CAMX (Pvt) Ltd",
  accountNumber: "0000 0000 0000",
  branch: "Colombo 03",
};

// ======================================
// TYPES
// ======================================

type CartItem = {
  _id: string;
  productId?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type PaymentMethod = "COD" | "CARD" | "BankTransfer";

type PayHereHashResponse = {
  sandbox: boolean;
  merchant_id: string;
  order_id: string;
  amount: string;
  currency: string;
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
};

// ======================================
// PAYHERE SDK LOADER
// ======================================

function loadPayHereScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("PayHere can only be loaded in the browser"));
      return;
    }

    if (window.payhere) {
      resolve();
      return;
    }

    const existing = document.getElementById("payhere-sdk") as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load PayHere SDK")));
      return;
    }

    const script = document.createElement("script");
    script.id = "payhere-sdk";
    script.src = "https://www.payhere.lk/lib/payhere.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load PayHere SDK"));
    document.body.appendChild(script);
  });
}

// ======================================
// COMPONENT
// ======================================

export default function CheckoutPage() {
  const router = useRouter();

  // ======================================
  // STATES
  // ======================================
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // FORM
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("Colombo");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");

  // ======================================
  // DISTRICTS
  // ======================================
  const districts = ["Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Monaragala", "Ratnapura", "Kegalle"];

  // ======================================
  // LOAD DATA
  // ======================================
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const storedCart = localStorage.getItem("CAMX_CART");
        if (storedCart && storedCart !== "undefined") {
          const parsedCart = JSON.parse(storedCart);
          setCartItems(parsedCart);
        }

        const storedUser = localStorage.getItem("CAMX_USER");
        if (storedUser && storedUser !== "undefined") {
          const user = JSON.parse(storedUser);
          setName(user?.name || "");
          setEmail(user?.email || "");
          setPhone(user?.phone || "");
        }
      } catch (error) {
        console.error("Checkout initialization error:", error);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  // ======================================
  // TOTALS
  // ======================================
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = cartItems.length > 0 ? 450 : 0;
  const total = subtotal + shipping;

  // ======================================
  // PAYHERE: POLL FOR CONFIRMED STATUS
  // ======================================
  const pollPaymentStatus = async (orderId: string, attempt = 0) => {
    const MAX_ATTEMPTS = 8;

    try {
      const { data } = await axios.get(`${API}/api/payments/payhere/status/${orderId}`);

      if (data.paymentStatus === "Paid") {
        localStorage.removeItem("CAMX_CART");
        window.dispatchEvent(new Event("storage"));
        setOrderProcessing(false);
        setOrderSuccess(true);
        return;
      }

      if (["Failed", "Cancelled", "Chargedback"].includes(data.paymentStatus)) {
        setOrderProcessing(false);
        setErrorMessage("Payment was not successful. Please try again or choose another payment method.");
        return;
      }
    } catch (error) {
      console.error("Payment status poll error:", error);
    }

    if (attempt < MAX_ATTEMPTS) {
      setTimeout(() => pollPaymentStatus(orderId, attempt + 1), 2000);
    } else {
      setOrderProcessing(false);
      setErrorMessage("We're still confirming your payment with the bank. Please check 'My Orders' shortly before trying again.");
    }
  };

  // ======================================
  // PAYHERE: START PAYMENT POPUP
  // ======================================
  const initiatePayHerePayment = async (orderId: string) => {
    try {
      await loadPayHereScript();

      const { data: hashData } = await axios.post<PayHereHashResponse>(`${API}/api/payments/payhere/hash`, { orderId });

      Object.assign(window.payhere, {
        onCompleted: (completedOrderId: string) => {
          pollPaymentStatus(completedOrderId);
        },
        onDismissed: () => {
          setOrderProcessing(false);
          setErrorMessage("Payment was cancelled. You can try again whenever you're ready.");
        },
        onError: (error: string) => {
          setOrderProcessing(false);
          setErrorMessage(`Payment error: ${error}`);
        },
      });

      window.payhere.startPayment({
        sandbox: hashData.sandbox,
        merchant_id: hashData.merchant_id,
        return_url: undefined,
        cancel_url: undefined,
        notify_url: `${API}/api/payments/payhere/notify`,
        order_id: hashData.order_id,
        items: `CAMX Order #${hashData.order_id}`,
        amount: hashData.amount,
        currency: hashData.currency,
        hash: hashData.hash,
        first_name: hashData.first_name,
        last_name: hashData.last_name,
        email: hashData.email,
        phone: hashData.phone,
        address: hashData.address,
        city: hashData.city,
        country: "Sri Lanka",
      });
    } catch (error) {
      console.error("PayHere init error:", error);
      setOrderProcessing(false);
      setErrorMessage("Could not start the payment. Please try again.");
    }
  };

  // ======================================
  // PLACE ORDER
  // ======================================
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;

    setOrderProcessing(true);
    setErrorMessage("");

    try {
      const orderPayload = {
        name,
        email,
        phone,
        address,
        city,
        district,
        notes,
        paymentMethod,
        subtotal,
        shipping,
        total,
        items: cartItems.map((item) => ({
          productId: item.productId || item._id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          image: item.image,
        })),
      };

      const token = localStorage.getItem("CAMX_TOKEN");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post(`${API}/api/orders/checkout`, orderPayload, { headers });

      const createdOrderId: string | undefined = response.data?.order?._id || response.data?._id || response.data?.orderId;

      if (paymentMethod === "CARD") {
        if (!createdOrderId) {
          throw new Error("Order was created but no order ID was returned, so payment could not be started.");
        }
        await initiatePayHerePayment(createdOrderId);
        return;
      }

      localStorage.removeItem("CAMX_CART");
      window.dispatchEvent(new Event("storage"));
      setOrderSuccess(true);
      setOrderProcessing(false);
    } catch (error) {
      console.error("Order submission error:", error);
      if (axios.isAxiosError(error)) {
        console.log("BACKEND ERROR DATA:", error.response?.data);
        setErrorMessage(error.response?.data?.message || "Failed to place order.");
      } else {
        setErrorMessage(error instanceof Error ? error.message : "Unexpected error occurred.");
      }
      setOrderProcessing(false);
    }
  };

  // ======================================
  // LOADING
  // ======================================
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-full border-4 border-secondary border-t-transparent animate-spin" />
      </main>
    );
  }

  // ======================================
  // SUCCESS
  // ======================================
  if (orderSuccess) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white dark:bg-card border border-border rounded-3xl p-10 text-center shadow-xl">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={42} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-neutral-900 dark:text-white">{paymentMethod === "CARD" ? "Payment Successful" : "Order Successful"}</h1>
          <p className="mt-4 text-neutral-500 dark:text-gray-400">{paymentMethod === "BankTransfer" ? "Your order has been placed. Please complete the bank transfer using the details provided — we'll confirm your order once payment is received." : "Your order has been placed successfully."}</p>

          {paymentMethod === "BankTransfer" && (
            <div className="mt-6 rounded-2xl border border-border bg-neutral-50 dark:bg-white/5 p-4 text-left text-sm space-y-1">
              <p>
                <span className="font-bold">Bank:</span> {BANK_DETAILS.bankName}
              </p>
              <p>
                <span className="font-bold">Account Name:</span> {BANK_DETAILS.accountName}
              </p>
              <p>
                <span className="font-bold">Account No:</span> {BANK_DETAILS.accountNumber}
              </p>
              <p>
                <span className="font-bold">Branch:</span> {BANK_DETAILS.branch}
              </p>
            </div>
          )}

          <button onClick={() => router.push("/")} className="mt-8 w-full h-12 rounded-xl bg-secondary text-white font-bold hover:opacity-90 transition">
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  // ======================================
  // MAIN UI
  // ======================================
  return (
    <>
      <main className="min-h-screen bg-neutral-50 dark:bg-background text-neutral-900 dark:text-white pt-28 pb-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="mb-10">
            <Link href="/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 dark:text-gray-400 hover:text-secondary transition mb-4">
              <ArrowLeft size={16} />
              Back to Cart
            </Link>
            <h1 className="text-4xl font-black tracking-tight">Secure Checkout</h1>
          </div>

          {/* EMPTY */}
          {cartItems.length === 0 ? (
            <div className="bg-white dark:bg-card border border-border rounded-3xl p-10 text-center">
              <h2 className="text-2xl font-bold">Cart is Empty</h2>
              <Link href="/products" className="mt-6 inline-flex px-6 py-3 rounded-xl bg-secondary text-white font-bold">
                Browse Products
              </Link>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowConfirmModal(true);
              }}
              className="grid lg:grid-cols-5 gap-8"
            >
              {/* LEFT */}
              <div className="lg:col-span-3 space-y-6">
                {/* SHIPPING */}
                <div className="bg-white dark:bg-card border border-border rounded-3xl p-8">
                  <h2 className="text-2xl font-black flex items-center gap-3 mb-6">
                    <Truck size={22} className="text-secondary" />
                    Shipping Details
                  </h2>
                  <div className="space-y-4">
                    <input type="text" required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-12 rounded-xl border border-border bg-transparent px-4 outline-none focus:border-secondary" />
                    <input type="tel" required placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-12 rounded-xl border border-border bg-transparent px-4 outline-none focus:border-secondary" />
                    <input type="email" required placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-12 rounded-xl border border-border bg-transparent px-4 outline-none focus:border-secondary" />
                    <input type="text" required placeholder="Street Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full h-12 rounded-xl border border-border bg-transparent px-4 outline-none focus:border-secondary" />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <input type="text" required placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-12 rounded-xl border border-border bg-transparent px-4 outline-none focus:border-secondary" />
                      <select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full h-12 rounded-xl border border-border bg-transparent px-4 outline-none focus:border-secondary">
                        {districts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <textarea placeholder="Additional Notes (Optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full min-h-28 rounded-xl border border-border bg-transparent px-4 py-4 outline-none focus:border-secondary resize-none" />
                  </div>
                </div>

                {/* PAYMENT METHOD */}
                <div className="bg-white dark:bg-card border border-border rounded-3xl p-8">
                  <h2 className="text-2xl font-black flex items-center gap-3 mb-6">
                    <CreditCard size={22} className="text-secondary" />
                    Payment Method
                  </h2>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { value: "COD" as const, label: "Cash on Delivery", desc: "Pay when it arrives", icon: <Truck size={18} /> },
                      { value: "CARD" as const, label: "Card Payment", desc: "Visa / Master via PayHere", icon: <CreditCard size={18} /> },
                      { value: "BankTransfer" as const, label: "Bank Transfer", desc: "Pay via bank deposit", icon: <Landmark size={18} /> },
                    ].map((opt) => (
                      <button key={opt.value} type="button" onClick={() => setPaymentMethod(opt.value)} className={`flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition ${paymentMethod === opt.value ? "border-secondary bg-secondary/5" : "border-border hover:border-neutral-300"}`}>
                        <span className={paymentMethod === opt.value ? "text-secondary" : "text-neutral-400"}>{opt.icon}</span>
                        <span className="font-bold text-sm">{opt.label}</span>
                        <span className="text-xs text-neutral-500">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                  {paymentMethod === "BankTransfer" && (
                    <div className="mt-5 rounded-2xl border border-border bg-neutral-50 dark:bg-white/5 p-4 text-sm space-y-1">
                      <p className="font-bold">Bank Transfer Details</p>
                      <p>Bank: {BANK_DETAILS.bankName}</p>
                      <p>Account Name: {BANK_DETAILS.accountName}</p>
                      <p>Account No: {BANK_DETAILS.accountNumber}</p>
                      <p>Branch: {BANK_DETAILS.branch}</p>
                      <p className="text-neutral-500 mt-2">Please use your name as the payment reference. We&apos;ll confirm your order once payment is received.</p>
                    </div>
                  )}
                  {paymentMethod === "CARD" && <p className="mt-5 text-xs text-neutral-500">You&apos;ll be redirected to a secure PayHere payment popup to complete your card payment (sandbox mode for testing).</p>}
                </div>
              </div>

              {/* RIGHT */}
              <div className="lg:col-span-2">
                <div className="sticky top-28 bg-white dark:bg-card border border-border rounded-3xl p-8">
                  <h2 className="text-2xl font-black mb-6">Order Summary</h2>
                  <div className="space-y-5">
                    {cartItems.map((item) => (
                      <div key={item._id} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white border border-border shrink-0">
                            <Image src={item.image || "/placeholder.jpg"} alt={item.name} fill sizes="64px" className="object-contain" />
                          </div>
                          <div>
                            <p className="font-bold line-clamp-1">{item.name}</p>
                            <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-black">LKR {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  {/* TOTALS */}
                  <div className="mt-8 pt-6 border-t border-border space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>LKR {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>LKR {shipping.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xl font-black pt-4 border-t border-border">
                      <span>Total</span>
                      <span className="text-secondary">LKR {total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* ERROR */}
                  {errorMessage && <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold">{errorMessage}</div>}

                  {/* BUTTON */}
                  <button type="submit" disabled={orderProcessing} className="mt-8 w-full h-14 rounded-2xl bg-secondary text-white font-black hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100">
                    {orderProcessing ? (paymentMethod === "CARD" ? "Redirecting to Payment..." : "Placing Order...") : `Place Order - LKR ${total.toLocaleString()}`}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* ====================================== */}
      {/* CONFIRM MODAL */}
      {/* ====================================== */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl border border-border shadow-2xl overflow-hidden">
            {/* HEADER */}
            <div className="px-6 py-5 border-b border-border">
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Confirm Your Order</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Please review your order details before placing the order.</p>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-5">
              {/* CUSTOMER */}
              <div className="space-y-2">
                <h3 className="font-black text-lg">Customer Details</h3>
                <div className="text-sm space-y-1 text-neutral-600 dark:text-neutral-300">
                  <p>
                    <span className="font-bold">Name:</span> {name}
                  </p>
                  <p>
                    <span className="font-bold">Phone:</span> {phone}
                  </p>
                  <p>
                    <span className="font-bold">Email:</span> {email}
                  </p>
                  <p>
                    <span className="font-bold">Address:</span> {address}
                  </p>
                  <p>
                    <span className="font-bold">City:</span> {city}
                  </p>
                  <p>
                    <span className="font-bold">District:</span> {district}
                  </p>
                  <p>
                    <span className="font-bold">Payment:</span> {paymentMethod === "COD" ? "Cash on Delivery" : paymentMethod === "CARD" ? "Card Payment (PayHere)" : "Bank Transfer"}
                  </p>
                </div>
              </div>

              {/* ORDER */}
              <div className="space-y-2 border-t border-border pt-5">
                <h3 className="font-black text-lg">Order Summary</h3>
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span className="font-bold">LKR {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 flex justify-between text-lg font-black">
                  <span>Total</span>
                  <span className="text-secondary">LKR {total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-6 border-t border-border flex gap-4">
              {/* CANCEL */}
              <button type="button" onClick={() => setShowConfirmModal(false)} className="flex-1 h-12 rounded-2xl border border-border bg-neutral-100 dark:bg-white/5 font-bold hover:bg-neutral-200 dark:hover:bg-white/10 transition">
                Cancel
              </button>
              {/* CONFIRM */}
              <button
                type="button"
                onClick={async () => {
                  setShowConfirmModal(false);
                  await handlePlaceOrder();
                }}
                disabled={orderProcessing}
                className="flex-1 h-12 rounded-2xl bg-secondary text-white font-black hover:opacity-90 transition disabled:opacity-50"
              >
                {orderProcessing ? "Processing..." : paymentMethod === "CARD" ? "Proceed to Payment" : "Confirm Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
