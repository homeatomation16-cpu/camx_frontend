"use client";

import axios from "axios";

import Image from "next/image";

import { useState } from "react";

import toast from "react-hot-toast";

import { AnimatePresence, motion } from "framer-motion";

import { X, User, Mail, Phone, Home, ClipboardList, ShoppingBag, Calendar, FileText, CreditCard, Eye } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

// ======================================
// TYPES
// ======================================

type OrderItem = {
  productId: string;

  name: string;

  quantity: number;

  unitPrice: number;

  image?: string;
};

type Order = {
  orderId: string;

  name?: string;

  email?: string;

  phone?: string;

  address?: string;

  city?: string;

  district?: string;

  notes?: string;

  paymentMethod?: string;

  status: string;

  total: number;

  createdAt: string;

  items: OrderItem[];
};

type Props = {
  order: Order;
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "paid", label: "Paid" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

// ======================================
// COMPONENT
// ======================================

export default function ViewOrderInfo({ order }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [notes, setNotes] = useState(order?.notes || "");

  const [status, setStatus] = useState(order?.status || "");

  const [saving, setSaving] = useState(false);

  // ======================================
  // FORMAT DATE
  // ======================================

  const formatDateTime = (value: string) => {
    if (!value) return "-";

    return new Date(value).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ======================================
  // FORMAT MONEY
  // ======================================

  const formatCurrency = (value: number) => (value == null ? "-" : `Rs. ${Number(value).toLocaleString()}`);

  // ======================================
  // STATUS COLORS
  // ======================================

  const getStatusClasses = (current: string) => {
    switch (current?.toLowerCase()) {
      case "completed":

      case "paid":
        return "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60";

      case "cancelled":
        return "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/60";

      case "processing":
        return "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60";

      default:
        return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60";
    }
  };

  const getStatusDot = (current: string) => {
    switch (current?.toLowerCase()) {
      case "completed":

      case "paid":
        return "#059669";

      case "cancelled":
        return "#dc2626";

      case "processing":
        return "#2563eb";

      default:
        return "#d97706";
    }
  };

  const hasChanges = order.notes !== notes || order.status !== status;

  // ======================================
  // UPDATE ORDER
  // ======================================

  const updateOrder = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem("CAMX_TOKEN");

      await axios.put(
        `${API}/api/orders/${order.orderId}`,

        {
          status,
          notes,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Order updated successfully");

      window.location.reload();
    } catch (error) {
      toast.error("Failed to update order");

      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // UI
  // ======================================

  return (
    <>
      {/* OPEN BUTTON */}
      <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2 text-sm font-bold text-white transition hover:opacity-90">
        <Eye size={14} />
        View Info
      </button>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }} transition={{ duration: 0.18, ease: "easeOut" }} onClick={(e) => e.stopPropagation()} className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-border bg-white dark:bg-neutral-900">
              {/* HEADER */}
              <div className="flex items-start justify-between border-b border-border px-6 py-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                    <ClipboardList size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Order Details</h2>
                    <p className="mt-1 font-mono text-sm text-neutral-500">{order.orderId}</p>
                  </div>
                </div>

                <button onClick={() => setIsModalOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-neutral-100 dark:hover:bg-white/10">
                  <X size={20} />
                </button>
              </div>

              {/* BODY */}
              <div className="flex-1 space-y-6 overflow-y-auto p-6">
                {/* GRID */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* CUSTOMER */}
                  <div className="rounded-3xl border border-border bg-neutral-50 p-6 dark:bg-white/5">
                    <h3 className="mb-5 text-lg font-black">Customer Information</h3>

                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 dark:bg-white/10 dark:text-neutral-400">
                          <User size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-wide text-neutral-500">Name</p>
                          <p className="truncate font-semibold">{order.name || "-"}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 dark:bg-white/10 dark:text-neutral-400">
                          <Mail size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-wide text-neutral-500">Email</p>
                          <p className="break-all font-semibold">{order.email || "-"}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 dark:bg-white/10 dark:text-neutral-400">
                          <Phone size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-wide text-neutral-500">Phone</p>
                          <p className="font-semibold">{order.phone || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ORDER */}
                  <div className="rounded-3xl border border-border bg-neutral-50 p-6 dark:bg-white/5">
                    <h3 className="mb-5 text-lg font-black">Order Information</h3>

                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 dark:bg-white/10 dark:text-neutral-400">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-neutral-500">Date</p>
                          <p className="font-semibold">{formatDateTime(order.createdAt)}</p>
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-xs uppercase tracking-wide text-neutral-500">Status</p>

                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusClasses(status)}`}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: getStatusDot(status) }} />
                            {status}
                          </span>

                          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 cursor-pointer rounded-xl border border-border bg-transparent px-3 text-sm outline-none focus:border-secondary">
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value} className="bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 dark:bg-white/10 dark:text-neutral-400">
                          <CreditCard size={16} />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-neutral-500">Payment Method</p>
                          <p className="font-semibold">{order.paymentMethod || "COD"}</p>
                        </div>
                      </div>

                      <div className="border-t border-border pt-4">
                        <p className="text-xs uppercase tracking-wide text-neutral-500">Total Amount</p>
                        <p className="text-3xl font-black text-secondary">{formatCurrency(order.total)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ADDRESS */}
                <div className="rounded-3xl border border-border bg-neutral-50 p-6 dark:bg-white/5">
                  <h3 className="mb-4 flex items-center gap-3 text-lg font-black">
                    <Home size={20} />
                    Delivery Address
                  </h3>

                  <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-300">
                    <p>{order.address || "-"}</p>
                    <p>{order.city || "-"}</p>
                    <p>{order.district || "-"}</p>
                  </div>
                </div>

                {/* NOTES */}
                <div className="rounded-3xl border border-border bg-neutral-50 p-6 dark:bg-white/5">
                  <h3 className="mb-4 flex items-center gap-3 text-lg font-black">
                    <FileText size={20} />
                    Additional Notes
                  </h3>

                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add a note for this order…" className="min-h-32 w-full resize-none rounded-2xl border border-border bg-white p-4 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/15 dark:bg-neutral-900" />
                </div>

                {/* ITEMS */}
                <div className="overflow-hidden rounded-3xl border border-border">
                  <div className="flex items-center justify-between border-b border-border bg-neutral-50 px-6 py-4 dark:bg-white/5">
                    <h3 className="flex items-center gap-3 font-black">
                      <ShoppingBag size={20} />
                      Ordered Products
                    </h3>

                    <p className="text-sm text-neutral-500">{order.items?.length} items</p>
                  </div>

                  <div className="divide-y divide-border">
                    {order.items?.map((item: OrderItem, index: number) => (
                      <div key={index} className="flex flex-col justify-between gap-5 p-5 lg:flex-row lg:items-center">
                        <div className="flex items-center gap-5">
                          {/* IMAGE */}
                          <div className="relative h-25 w-25 min-w-25 overflow-hidden rounded-2xl border border-border bg-white p-2">
                            <Image src={item.image || "/placeholder.jpg"} alt={item.name} fill className="object-contain" />
                          </div>

                          {/* INFO */}
                          <div>
                            <h4 className="text-lg font-black">{item.name}</h4>
                            <p className="mt-1 text-sm text-neutral-500">Product ID: {item.productId}</p>
                            <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                          </div>
                        </div>

                        {/* PRICE */}
                        <div className="text-left lg:text-right">
                          <p className="text-xl font-black text-secondary">{formatCurrency(item.unitPrice * item.quantity)}</p>
                          <p className="mt-1 text-sm text-neutral-500">{formatCurrency(item.unitPrice)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex flex-col items-start justify-between gap-4 border-t border-border bg-neutral-50 px-6 py-5 dark:bg-white/5 lg:flex-row lg:items-center">
                <div>
                  <p className="text-sm text-neutral-500">Total Amount</p>
                  <h3 className="text-3xl font-black text-secondary">{formatCurrency(order.total)}</h3>
                </div>

                <div className="flex items-center gap-3">
                  {hasChanges && !saving && <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Unsaved changes</span>}

                  <button onClick={() => setIsModalOpen(false)} className="h-12 rounded-2xl border border-border px-6 font-bold transition hover:bg-neutral-100 dark:hover:bg-white/10">
                    Close
                  </button>

                  {hasChanges && (
                    <button onClick={updateOrder} disabled={saving} className="h-12 rounded-2xl bg-secondary px-6 font-black text-white transition hover:opacity-90 disabled:opacity-60">
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
