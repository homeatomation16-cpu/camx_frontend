"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, DollarSign, Package, Users, TrendingUp, Boxes, Calendar, Award, RefreshCw } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell, Legend } from "recharts";

// API URL Setup
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
const API = API_BASE.endsWith("/") ? API_BASE : `${API_BASE}/`;

// ── Types ──────────────────────────────────────────────────────
type Analytics = {
  totalOrders: number;
  totalRevenue: number;
  totalProductsSold: number;
  totalCustomers: number;
  totalProducts: number;
  dailyOrders: number;
  dailyRevenue: number;
  bestSellers: { name: string; totalSold: number; revenue: number }[];
  categoryDistribution: { name: string; count: number }[];
};

// ── Custom Tooltip ─────────────────────────────────────────────
function ChartTooltip({ active, payload, label, prefix = "" }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string; prefix?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white px-4 py-3 shadow-xl dark:border-border dark:bg-card">
      {label && <p className="mb-1.5 text-xs font-black uppercase tracking-widest text-neutral-400">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
          {prefix}
          {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({ title, value, icon, accent, index }: { title: string; value: string; icon: React.ReactNode; accent: string; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-border dark:bg-card">
      {/* BG GLOW */}
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" style={{ background: accent }} />

      <div className="relative flex items-start justify-between">
        <p className="text-xs font-semibold text-neutral-400">{title}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110" style={{ background: `${accent}20` }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
      </div>

      <p className="relative mt-4 truncate text-2xl font-black text-neutral-900 dark:text-white">{value}</p>
    </motion.div>
  );
}

// ── Chart Wrapper ──────────────────────────────────────────────
function ChartCard({ title, badge, children, delay = 0 }: { title: React.ReactNode; badge?: React.ReactNode; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 dark:border-border dark:bg-card">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-base font-black text-neutral-900 dark:text-white">{title}</h3>
        {badge}
      </div>
      {children}
    </motion.div>
  );
}

// ── Main ───────────────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProductsSold: 0,
    totalCustomers: 0,
    totalProducts: 0,
    dailyOrders: 0,
    dailyRevenue: 0,
    bestSellers: [],
    categoryDistribution: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (signal?: AbortSignal, silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = localStorage.getItem("CAMX_TOKEN");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [compRes, usersRes, productsRes, categoryRes] = await Promise.all([
        axios.get(`${API}api/orders/analytics/comprehensive`, {
          signal,
          headers,
        }),
        axios.get(`${API}api/users/all`, {
          signal,
          headers,
        }),
        axios.get(`${API}api/products`, {
          signal,
          headers,
        }),
        axios.get(`${API}api/products/categories`, {
          signal,
          headers,
        }),
      ]);

      const d = compRes.data;

      setAnalytics({
        totalOrders: d.overall?.totalOrders || 0,
        totalRevenue: d.overall?.totalRevenue || 0,
        totalProductsSold: d.overall?.totalProductsSold || 0,
        dailyOrders: d.daily?.dailyOrders || 0,
        dailyRevenue: d.daily?.dailyRevenue || 0,
        totalCustomers: usersRes.data?.length || 0,
        totalProducts: productsRes.data?.length || 0,
        bestSellers: d.bestSellers || [],
        categoryDistribution: categoryRes.data || [],
      });
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const loadAnalytics = async () => {
      await fetchAnalytics(controller.signal);
    };

    loadAnalytics();

    return () => controller.abort();
  }, []);

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
          <p className="text-sm font-semibold text-neutral-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // ── Data ─────────────────────────────────────────────────────
  const STAT_CARDS = [
    { title: "Today's Revenue", value: `Rs ${analytics.dailyRevenue.toLocaleString()}`, icon: <Calendar size={17} />, accent: "#3b82f6" },
    { title: "Today's Orders", value: analytics.dailyOrders.toLocaleString(), icon: <ShoppingCart size={17} />, accent: "#6366f1" },
    { title: "Total Revenue", value: `Rs ${analytics.totalRevenue.toLocaleString()}`, icon: <DollarSign size={17} />, accent: "#22c55e" },
    { title: "Total Orders", value: analytics.totalOrders.toLocaleString(), icon: <Package size={17} />, accent: "#f97316" },
    { title: "Customers", value: analytics.totalCustomers.toLocaleString(), icon: <Users size={17} />, accent: "#a855f7" },
    { title: "Products", value: analytics.totalProducts.toLocaleString(), icon: <Boxes size={17} />, accent: "#ec4899" },
  ];

  const growthData = [
    { month: "Jan", revenue: 15000 },
    { month: "Feb", revenue: 25000 },
    { month: "Mar", revenue: 18000 },
    { month: "Apr", revenue: 32000 },
    { month: "May", revenue: Math.max(analytics.totalRevenue, 45000) },
  ];

  const pieData = [
    { name: "Orders", value: analytics.totalOrders },
    { name: "Products", value: analytics.totalProducts },
    { name: "Customers", value: analytics.totalCustomers },
  ];
  const PIE_COLORS = ["#3b82f6", "#f97316", "#a855f7"];

  const maxCategory = analytics.categoryDistribution.length > 0 ? Math.max(...analytics.categoryDistribution.map((c) => c.count)) : 1;

  // ── UI ───────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-neutral-50 p-4 text-neutral-900 dark:bg-background dark:text-white lg:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary shadow-lg shadow-secondary/20">
              <TrendingUp size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black leading-tight lg:text-3xl">Analytics Dashboard</h1>
              <p className="text-sm text-neutral-400">Sales, inventory &amp; customer overview</p>
            </div>
          </div>

          <button onClick={() => fetchAnalytics(undefined, true)} disabled={refreshing} className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-bold text-neutral-600 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50 dark:border-border dark:bg-card dark:text-neutral-300">
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </motion.div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {STAT_CARDS.map((card, i) => (
            <StatCard key={i} index={i} {...card} />
          ))}
        </div>

        {/* CHARTS ROW 1 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* AREA CHART */}
          <ChartCard title={<span className="flex items-center gap-2">📈 Revenue Growth</span>} delay={0.3} badge={<span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] font-black text-green-600 dark:border-green-900/30 dark:bg-green-900/20">+12% MoM</span>}>
            <div className="w-full lg:col-span-2" style={{ minHeight: 250 }}>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={growthData} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip prefix="Rs " />} />
                  <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" dot={{ fill: "#22c55e", r: 4, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* PIE CHART */}
          <ChartCard title="🎯 Distribution" delay={0.38}>
            <div className="w-full" style={{ minHeight: 250 }}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="42%" innerRadius={58} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend verticalAlign="bottom" height={32} iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs font-semibold text-neutral-500">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* CHARTS ROW 2 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* BAR CHART */}
          <ChartCard title="🗂️ Category Distribution" delay={0.44} badge={<span className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-[11px] font-black text-pink-600 dark:border-pink-900/30 dark:bg-pink-900/20">{analytics.categoryDistribution.length} categories</span>}>
            <div className="w-full" style={{ minHeight: 250 }}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.categoryDistribution} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f9fafb", radius: 8 }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={36}>
                    {analytics.categoryDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.count === maxCategory ? "#ec4899" : "#fce7f3"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* BEST SELLERS */}
          <ChartCard
            title={
              <span className="flex items-center gap-2">
                <Award size={17} className="text-amber-400" />
                Best Selling Products
              </span>
            }
            delay={0.5}
          >
            {analytics.bestSellers.length > 0 ? (
              <div className="flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: "256px" }}>
                {analytics.bestSellers.map((item, i) => {
                  const maxRev = Math.max(...analytics.bestSellers.map((b) => b.revenue));
                  const pct = Math.round((item.revenue / maxRev) * 100);
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <div key={i} className="group rounded-2xl border border-neutral-100 bg-neutral-50/60 p-3.5 transition hover:border-neutral-200 dark:border-border dark:bg-neutral-900/40">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{medals[i] || `#${i + 1}`}</span>
                          <p className="text-[13px] font-bold text-neutral-800 dark:text-white line-clamp-1">{item.name}</p>
                        </div>
                        <span className="shrink-0 text-sm font-black text-green-600">Rs {item.revenue.toLocaleString()}</span>
                      </div>
                      {/* PROGRESS BAR */}
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.5 + i * 0.08, duration: 0.7, ease: "easeOut" }} className="h-full rounded-full bg-secondary" />
                        </div>
                        <span className="text-[11px] font-bold text-amber-500">{item.totalSold} sold</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-64 min-h-62.5 flex-col items-center justify-center gap-3 text-neutral-300 dark:text-neutral-600">
                <Package size={40} strokeWidth={1} />
                <p className="text-sm font-semibold">No sales data yet</p>
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </main>
  );
}
