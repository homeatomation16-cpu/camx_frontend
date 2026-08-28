"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Search, Download, RefreshCw, Package, DollarSign, Clock, CalendarCheck, ChevronLeft, ChevronRight, Inbox, Copy } from "lucide-react";

import ViewOrderInfo from "@/app/components/ViewOrderInfo";

const API = process.env.NEXT_PUBLIC_API_BASE;

// =========================
// TYPES
// =========================
// Mirrors what orderController.js actually stores/returns — items carry
// unitPrice + image, and status is whatever string was set at checkout or
// via updateOrderStatus (checkout defaults to "paid" for POS, "COD" orders
// typically arrive as "pending" from the storefront).
type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  image?: string;
};

type Order = {
  _id: string;
  orderId: string;
  name?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  customerPhone?: string;
  address?: string;
  city?: string;
  district?: string;
  paymentMethod?: string;
  status: string;
  subtotal?: number;
  shipping?: number;
  total: number;
  discountGiven?: number;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_OPTIONS = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

// Status → { badge classes, dot color } — dot color is set inline so it
// works regardless of dark/light mode without a second lookup table.
const STATUS_META: Record<string, { badge: string; dot: string }> = {
  pending: { badge: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60", dot: "#d97706" },
  paid: { badge: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60", dot: "#2563eb" },
  processing: { badge: "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60", dot: "#4f46e5" },
  shipped: { badge: "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60", dot: "#9333ea" },
  delivered: { badge: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60", dot: "#059669" },
  cancelled: { badge: "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/60", dot: "#dc2626" },
};

function getStatusMeta(status: string) {
  return STATUS_META[status?.toLowerCase()] || { badge: "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700", dot: "#737373" };
}

// Deterministic soft color for a customer's initials avatar, derived from
// their name/email so the same person always gets the same hue.
const AVATAR_PALETTE = ["#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#ec4899", "#06b6d4", "#f97316"];
function avatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}
function initialsOf(label: string) {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

const PAGE_SIZE = 10;

// ── Stat Card ────────────────────────────────────────────────
function StatCard({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-lg hover:shadow-neutral-200/60 dark:border-border dark:bg-card dark:hover:shadow-black/20">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-30" style={{ background: accent }} />
      <div className="relative flex items-start justify-between">
        <p className="text-xs font-semibold tracking-wide text-neutral-400">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${accent}18` }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
      </div>
      <p className="relative mt-3 truncate text-2xl font-black tracking-tight text-neutral-900 dark:text-white">{value}</p>
      <div className="relative mt-3 h-1 w-10 rounded-full" style={{ background: accent }} />
    </div>
  );
}

// ── Skeleton Row ─────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="p-5">
          <div className="h-4 w-full max-w-32 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
        </td>
      ))}
    </tr>
  );
}

// ── Status Badge (select) ───────────────────────────────────
function StatusSelect({ order, disabled, onChange }: { order: Order; disabled: boolean; onChange: (v: string) => void }) {
  const meta = getStatusMeta(order.status);
  return (
    <div className={`relative inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold capitalize shadow-xs transition ${meta.badge} ${disabled ? "opacity-50" : ""}`}>
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: meta.dot }} />
      <select value={order.status} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="cursor-pointer appearance-none bg-transparent pr-1 outline-none disabled:cursor-not-allowed">
        {/* Keep the order's current status selectable even if it's not one
            of the standard options (e.g. legacy "COD"). */}
        {!STATUS_OPTIONS.includes(order.status?.toLowerCase()) && (
          <option value={order.status} className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white">
            {order.status}
          </option>
        )}
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s} className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white">
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  // Tracks which order row currently has a status update in flight, so we
  // can disable just that row's dropdown instead of freezing the table.
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const authHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${localStorage.getItem("CAMX_TOKEN")}`,
    }),
    [],
  );

  // =========================
  // FETCH ORDERS
  // =========================
  // useCallback so this has a stable identity — it's called both from the
  // initial-load effect below and from the Refresh button, so it needs to
  // be a real dependency rather than re-created every render.
  const fetchOrders = useCallback(
    async (signal?: AbortSignal, silent = false) => {
      try {
        if (silent) setRefreshing(true);
        const response = await axios.get(`${API}/api/orders`, {
          signal,
          headers: authHeaders(),
        });
        setOrders(response.data || []);
        setLoaded(true);
      } catch (error) {
        if (axios.isCancel(error)) return;
        console.error(error);
        toast.error("Failed to load orders.");
      } finally {
        setRefreshing(false);
      }
    },
    [authHeaders],
  );

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      fetchOrders(controller.signal);
    });
    return () => controller.abort();
  }, [fetchOrders]);

  // =========================
  // UPDATE ORDER STATUS
  // =========================
  async function handleStatusChange(order: Order, newStatus: string) {
    if (newStatus === order.status) return;
    const previousStatus = order.status;

    // Optimistic update — reverted below if the request fails.
    setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, status: newStatus } : o)));
    setUpdatingId(order._id);

    try {
      await axios.put(`${API}/api/orders/${order.orderId}`, { status: newStatus }, { headers: authHeaders() });
      toast.success(`Order ${order.orderId} marked as ${newStatus}`);
    } catch (error) {
      console.error(error);
      setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, status: previousStatus } : o)));
      toast.error("Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  }

  // =========================
  // EXPORT CSV
  // =========================
  async function handleExportCsv() {
    try {
      setExporting(true);
      const res = await axios.get(`${API}/api/orders/download`, {
        headers: authHeaders(),
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "camx-orders.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Orders exported.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export orders.");
    } finally {
      setExporting(false);
    }
  }

  function copyOrderId(id: string) {
    navigator.clipboard?.writeText(id);
    toast.success("Order ID copied.");
  }

  // =========================
  // DERIVED: STATS
  // =========================
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingCount = orders.filter((o) => o.status?.toLowerCase() === "pending").length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = orders.filter((o) => new Date(o.createdAt) >= today).length;

    return { totalOrders, totalRevenue, pendingCount, todayCount };
  }, [orders]);

  // =========================
  // DERIVED: STATUS COUNTS (for filter pills)
  // =========================
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of orders) {
      const key = o.status?.toLowerCase() || "unknown";
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [orders]);

  // =========================
  // DERIVED: FILTER + SEARCH
  // =========================
  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch = !q || order.orderId.toLowerCase().includes(q) || (order.name || order.customerName || "").toLowerCase().includes(q) || (order.email || "").toLowerCase().includes(q) || (order.phone || order.customerPhone || "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || order.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pagedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusPills = ["All", ...STATUS_OPTIONS];

  return (
    <main className="min-h-screen bg-linear-to-b from-neutral-50 to-neutral-100/60 p-4 text-neutral-900 dark:from-background dark:to-background dark:text-white lg:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
              <Package size={20} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Orders</h1>
              <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">Manage customer orders and fulfillment status.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => fetchOrders(undefined, true)} disabled={refreshing} className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-bold text-neutral-600 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 disabled:opacity-50 dark:border-border dark:bg-card dark:text-neutral-300 dark:hover:bg-neutral-800/60">
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button onClick={handleExportCsv} disabled={exporting} className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-secondary/30 transition hover:opacity-90 disabled:opacity-50">
              <Download size={13} />
              {exporting ? "Exporting…" : "Export CSV"}
            </button>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Orders" value={stats.totalOrders.toLocaleString()} icon={<Package size={17} />} accent="#3b82f6" />
          <StatCard label="Total Revenue" value={`LKR ${stats.totalRevenue.toLocaleString()}`} icon={<DollarSign size={17} />} accent="#22c55e" />
          <StatCard label="Pending Orders" value={stats.pendingCount.toLocaleString()} icon={<Clock size={17} />} accent="#f59e0b" />
          <StatCard label="Today's Orders" value={stats.todayCount.toLocaleString()} icon={<CalendarCheck size={17} />} accent="#a855f7" />
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-border dark:bg-card sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input
              type="text"
              placeholder="Search order ID, name, email, phone…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-sm outline-none transition focus:border-secondary focus:bg-white focus:ring-2 focus:ring-secondary/15 dark:border-border dark:bg-neutral-900 dark:focus:bg-neutral-900"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusPills.map((s) => {
              const active = statusFilter === s;
              const count = s === "All" ? orders.length : statusCounts[s.toLowerCase()] || 0;
              return (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold capitalize transition-all ${active ? "bg-secondary text-white shadow-md shadow-secondary/25" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"}`}
                >
                  {s}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-white/20" : "bg-neutral-200/80 dark:bg-neutral-700"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TABLE */}
        <div className="w-full overflow-x-auto overflow-y-auto max-h-162.5 rounded-3xl border border-border bg-white shadow-sm dark:bg-card">
          <table className="w-full min-w-237.5 relative border-collapse text-left">
            <thead className="sticky top-0 z-10 border-b border-border bg-neutral-100/95 backdrop-blur-md dark:bg-neutral-900/95">
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                <th className="p-5 whitespace-nowrap">Order</th>
                <th className="p-5 whitespace-nowrap">Customer</th>
                <th className="p-5 whitespace-nowrap">Date</th>
                <th className="p-5 whitespace-nowrap">Status</th>
                <th className="p-5 whitespace-nowrap text-right">Total</th>
                <th className="p-5 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {!loaded ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : pagedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-neutral-400">
                      <Inbox size={28} strokeWidth={1.5} />
                      <p className="text-sm font-semibold">No orders match your search.</p>
                      <p className="text-xs">Try a different order ID, name, or status filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedOrders.map((order) => {
                  const displayName = order.name || order.customerName || "—";
                  const color = avatarColor(order.email || displayName);
                  return (
                    <motion.tr key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border transition hover:bg-neutral-50 dark:hover:bg-white/5">
                      <td className="p-5 whitespace-nowrap">
                        <button onClick={() => copyOrderId(order.orderId)} className="group flex items-center gap-1.5 font-bold text-secondary" title="Copy order ID">
                          <span className="font-mono text-[13px]">{order.orderId}</span>
                          <Copy size={12} className="opacity-0 transition group-hover:opacity-60" />
                        </button>
                      </td>
                      <td className="p-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: color }}>
                            {initialsOf(displayName === "—" ? order.email || "?" : displayName)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{displayName}</p>
                            <p className="truncate text-xs text-neutral-400">{order.email || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{new Date(order.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td className="p-5 whitespace-nowrap">
                        <StatusSelect order={order} disabled={updatingId === order._id} onChange={(v) => handleStatusChange(order, v)} />
                      </td>
                      <td className="p-5 whitespace-nowrap text-right font-bold">LKR {order.total.toLocaleString()}</td>
                      <td className="p-5 whitespace-nowrap text-right">
                        <ViewOrderInfo order={order} />
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {loaded && filteredOrders.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold text-neutral-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredOrders.length)} of {filteredOrders.length}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-40 dark:border-border dark:bg-card dark:text-neutral-300">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-neutral-500">
                Page {page} / {totalPages}
              </span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-40 dark:border-border dark:bg-card dark:text-neutral-300">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
