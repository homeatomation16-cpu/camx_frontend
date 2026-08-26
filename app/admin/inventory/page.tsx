"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Search, Plus, Package, AlertTriangle, TrendingUp, TrendingDown, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

type Product = {
  _id?: string;
  productId: string;
  name: string;
  category?: string;
  brand?: string;
  description?: string;
  price: number;
  stock: number;
  images?: string[];
  isAvailable?: boolean;
};

type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return "Out of Stock";
  if (stock <= 10) return "Low Stock";
  return "In Stock";
}

const STATUS_CONFIG: Record<StockStatus, { label: string; bg: string; text: string; dot: string }> = {
  "In Stock": {
    label: "In Stock",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  "Low Stock": {
    label: "Low Stock",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  "Out of Stock": {
    label: "Out of Stock",
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-400",
  },
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ title, value, icon, accent, delta }: { title: string; value: string | number; icon: ReactNode; accent: string; delta?: { value: number; label: string } }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</p>
        <div className={`p-2 rounded-xl ${accent}`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold tracking-tight text-slate-800">{value}</p>
      {delta && (
        <p className="text-xs text-slate-400">
          <span className={delta.value >= 0 ? "text-emerald-500" : "text-red-400"}>
            {delta.value >= 0 ? "↑" : "↓"} {Math.abs(delta.value)}%
          </span>{" "}
          {delta.label}
        </p>
      )}
    </div>
  );
}

// ─── Stock Bar ────────────────────────────────────────────────────────────────
function StockBar({ stock, max = 100 }: { stock: number; max?: number }) {
  const pct = Math.min((stock / max) * 100, 100);
  const color = stock <= 0 ? "bg-red-400" : stock <= 10 ? "bg-amber-400" : "bg-emerald-400";

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-slate-700 tabular-nums w-6 text-right">{stock}</span>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: StockStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<keyof Product>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const loadProducts = useCallback(async () => {
    try {
      const token = localStorage.getItem("CAMX_TOKEN");
      const res = await axios.get(`${API}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data || []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProducts();
  }, [loadProducts]);

  const toggleSort = (key: keyof Product) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const term = search.toLowerCase();
        const matchesSearch = p.name.toLowerCase().includes(term) || p.productId.toLowerCase().includes(term);
        const matchesStatus = statusFilter === "all" || getStockStatus(p.stock) === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const av = a[sortKey] ?? "";
        const bv = b[sortKey] ?? "";
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [products, search, statusFilter, sortKey, sortDir]);

  const stats = useMemo(
    () => ({
      total: products.length,
      inStock: products.filter((p) => getStockStatus(p.stock) === "In Stock").length,
      lowStock: products.filter((p) => getStockStatus(p.stock) === "Low Stock").length,
      outStock: products.filter((p) => getStockStatus(p.stock) === "Out of Stock").length,
      value: products.reduce((sum, p) => sum + p.price * p.stock, 0),
    }),
    [products],
  );

  const SortIcon = ({ col }: { col: keyof Product }) => (sortKey === col ? sortDir === "asc" ? <ChevronUp size={13} className="inline ml-0.5 opacity-70" /> : <ChevronDown size={13} className="inline ml-0.5 opacity-70" /> : <ChevronUp size={13} className="inline ml-0.5 opacity-20" />);

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading inventory…</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">Admin · Inventory</p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Management</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRefreshing(true);
                loadProducts();
              }}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button onClick={() => router.push("/admin/productAdd")} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 shadow-sm shadow-blue-200 transition-all">
              <Plus size={15} />
              Add Product
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          <StatCard title="Total Products" value={stats.total} icon={<Package size={18} className="text-blue-600" />} accent="bg-blue-50" />
          <StatCard title="In Stock" value={stats.inStock} icon={<TrendingUp size={18} className="text-emerald-600" />} accent="bg-emerald-50" />
          <StatCard title="Low Stock" value={stats.lowStock} icon={<AlertTriangle size={18} className="text-amber-500" />} accent="bg-amber-50" />
          <StatCard title="Out of Stock" value={stats.outStock} icon={<TrendingDown size={18} className="text-red-500" />} accent="bg-red-50" />
          <StatCard title="Inventory Value" value={`LKR ${stats.value.toLocaleString()}`} icon={<Package size={18} className="text-violet-600" />} accent="bg-violet-50" />
        </div>

        {/* ── Filters ── */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or product ID…" className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400" />
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {(
              [
                { value: "all", label: "All" },
                { value: "In Stock", label: "In Stock" },
                { value: "Low Stock", label: "Low" },
                { value: "Out of Stock", label: "Out" },
              ] as const
            ).map((opt) => (
              <button key={opt.value} onClick={() => setStatusFilter(opt.value)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${statusFilter === opt.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {(
                    [
                      { key: "productId", label: "Product ID" },
                      { key: "name", label: "Name" },
                      { key: "category", label: "Category" },
                      { key: "price", label: "Price" },
                      { key: "stock", label: "Stock" },
                    ] as { key: keyof Product; label: string }[]
                  ).map(({ key, label }) => (
                    <th key={key} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 cursor-pointer hover:text-slate-600 select-none" onClick={() => toggleSort(key)}>
                      {label}
                      <SortIcon col={key} />
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Package size={32} className="opacity-30" />
                        <p className="font-medium text-sm">No products found</p>
                        <p className="text-xs">Try adjusting your search or filter</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const status = getStockStatus(p.stock);
                    return (
                      <tr key={p.productId} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-5 py-4 font-mono text-xs text-slate-400 group-hover:text-slate-600">{p.productId}</td>
                        <td className="px-5 py-4 font-semibold text-slate-800">
                          {p.name}
                          {p.brand && <span className="ml-2 text-xs font-normal text-slate-400">{p.brand}</span>}
                        </td>
                        <td className="px-5 py-4 text-slate-500">{p.category ?? <span className="text-slate-300 italic">—</span>}</td>
                        <td className="px-5 py-4 font-semibold text-slate-700 tabular-nums">LKR {p.price.toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <StockBar stock={p.stock} />
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={status} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {filteredProducts.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Showing <span className="font-semibold text-slate-600">{filteredProducts.length}</span> of <span className="font-semibold text-slate-600">{products.length}</span> products
              </p>
              {statusFilter !== "all" || search ? (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Refresh toast */}
      {refreshing && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl animate-pulse">
          <RefreshCw size={13} className="animate-spin" />
          Refreshing inventory…
        </div>
      )}
    </div>
  );
}
