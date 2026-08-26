"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Search, Download, RefreshCw, Package, DollarSign, Clock, CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";

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

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  paid: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  processing: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
};

function getStatusStyle(status: string) {
  return STATUS_STYLES[status?.toLowerCase()] || "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300";
}

const PAGE_SIZE = 10;

// ── Stat Card ────────────────────────────────────────────────
function StatCard({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 dark:border-border dark:bg-card">
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20 blur-2xl" style={{ background: accent }} />
      <div className="relative flex items-start justify-between">
        <p className="text-xs font-semibold text-neutral-400">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${accent}20` }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
      </div>
      <p className="relative mt-3 truncate text-2xl font-black text-neutral-900 dark:text-white">{value}</p>
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
    } catch (error) {
      console.error(error);
      toast.error("Failed to export orders.");
    } finally {
      setExporting(false);
    }
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
    <main className="min-h-screen p-4 lg:p-8 bg-neutral-50 dark:bg-background text-neutral-900 dark:text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black">Orders</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">Manage customer orders and fulfillment status.</p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => fetchOrders(undefined, true)} disabled={refreshing} className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-bold text-neutral-600 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50 dark:border-border dark:bg-card dark:text-neutral-300">
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button onClick={handleExportCsv} disabled={exporting} className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-secondary/20 transition hover:opacity-90 disabled:opacity-50">
              <Download size={13} />
              {exporting ? "Exporting..." : "Export CSV"}
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
              placeholder="Search order ID, name, email, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-sm outline-none transition focus:border-secondary dark:border-border dark:bg-neutral-900"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusPills.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold capitalize transition-all ${statusFilter === s ? "bg-secondary text-white shadow-md shadow-secondary/20" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-3xl border border-border bg-white dark:bg-card">
          <table className="w-full min-w-300">
            <thead className="border-b border-border bg-neutral-100 dark:bg-white/5">
              <tr className="text-left text-sm">
                <th className="p-5">Order ID</th>
                <th className="p-5">Customer Email</th>
                <th className="p-5">Customer Name</th>
                <th className="p-5">Date</th>
                <th className="p-5">Status</th>
                <th className="p-5">Total</th>
                <th className="p-5">Actions</th>
              </tr>
            </thead>

            <tbody>
              {!loaded ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : pagedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-sm text-neutral-400">
                    No orders match your search.
                  </td>
                </tr>
              ) : (
                pagedOrders.map((order) => (
                  <motion.tr key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border hover:bg-neutral-50 dark:hover:bg-white/5 transition">
                    <td className="p-5 font-bold text-secondary">{order.orderId}</td>
                    <td className="p-5">{order.email || "—"}</td>
                    <td className="p-5">{order.name || order.customerName || "—"}</td>
                    <td className="p-5 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-5">
                      <select value={order.status} disabled={updatingId === order._id} onChange={(e) => handleStatusChange(order, e.target.value)} className={`rounded-full border-0 px-3 py-1 text-xs font-bold capitalize outline-none cursor-pointer disabled:opacity-50 ${getStatusStyle(order.status)}`}>
                        {/* Keep the order's current status selectable even if it's
                            not one of the standard options (e.g. legacy "COD"). */}
                        {!STATUS_OPTIONS.includes(order.status?.toLowerCase()) && <option value={order.status}>{order.status}</option>}
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-5 font-bold">LKR {order.total.toLocaleString()}</td>
                    <td className="p-5">
                      <ViewOrderInfo order={order} />
                    </td>
                  </motion.tr>
                ))
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
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-40 dark:border-border dark:bg-card dark:text-neutral-300">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-neutral-500">
                Page {page} / {totalPages}
              </span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-40 dark:border-border dark:bg-card dark:text-neutral-300">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
