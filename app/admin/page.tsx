"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion, type Transition } from "framer-motion";
import { Boxes, PackagePlus, ShoppingCart, Users, TrendingUp, DollarSign, Package, ArrowUpRight, Clock, ChevronRight, Tags, BarChart2 } from "lucide-react";

// API URL Setup (කලින් පිටුවේ මෙන් නිවැරදි කර ඇත)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
const API = API_BASE.endsWith("/") ? API_BASE : `${API_BASE}/`;

type QuickStat = {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  change?: string;
};

type RecentOrder = {
  orderId: string;
  customerName: string;
  totalPrice: number;
  orderStatus: string;
  createdAt: string;
};

const fadeUp = (delay = 0) => {
  const transition: Transition = {
    delay,
    duration: 0.48,
    ease: [0.22, 1, 0.36, 1],
  };

  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition,
  };
};

const STATUS_STYLE: Record<string, string> = {
  COMPLETED: "bg-green-50 text-green-600 dark:bg-green-900/20",
  PENDING: "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
  PROCESSING: "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
  CANCELLED: "bg-red-50 text-red-500 dark:bg-red-900/20",
};

export default function AdminPage() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("CAMX_TOKEN");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [compRes, usersRes, productsRes, ordersRes] = await Promise.allSettled([
          axios.get(`${API}api/orders/analytics/comprehensive`, {
            headers,
          }),

          axios.get(`${API}api/users/all`, {
            headers,
          }),

          axios.get(`${API}api/products`, {
            headers,
          }),

          axios.get(`${API}api/orders`, {
            headers,
          }),
        ]);

        if (compRes.status === "fulfilled") {
          const d = compRes.value.data;

          setStats((prev) => ({
            ...prev,
            revenue: d.overall?.totalRevenue || 0,
            orders: d.overall?.totalOrders || 0,
          }));
        }

        if (usersRes.status === "fulfilled") {
          setStats((prev) => ({
            ...prev,
            customers: usersRes.value.data?.length || 0,
          }));
        }

        if (productsRes.status === "fulfilled") {
          const list = productsRes.value.data?.products || productsRes.value.data || [];

          setStats((prev) => ({
            ...prev,
            products: list.length,
          }));
        }

        if (ordersRes.status === "fulfilled") {
          const orders = ordersRes.value.data?.orders || ordersRes.value.data || [];

          setRecentOrders(orders.slice(0, 5));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchData();
  }, []);

  // ── Nav Cards ──────────────────────────────────────────────
  const NAV_CARDS = [
    {
      title: "Add Product",
      description: "Create and publish new CCTV products to the store.",
      href: "/admin/productAdd",
      icon: <PackagePlus size={22} />,
      accent: "#3b82f6",
    },

    {
      title: "Products",
      description: "Manage inventory, stock levels and pricing.",
      href: "/products",
      icon: <Boxes size={22} />,
      accent: "#8b5cf6",
    },

    {
      title: "Orders",
      description: "Track, process and update customer orders.",
      href: "/admin/orders",
      icon: <ShoppingCart size={22} />,
      accent: "#f97316",
    },

    {
      title: "Customers",
      description: "View and manage registered customer accounts.",
      href: "/admin/customers",
      icon: <Users size={22} />,
      accent: "#22c55e",
    },

    {
      title: "POS Terminal",
      description: "Point-of-sale for in-store transactions.",
      href: "/admin/pos",
      icon: <Tags size={22} />,
      accent: "#ec4899",
    },

    {
      title: "Analytics",
      description: "Revenue charts, best sellers and insights.",
      href: "/admin/analytics",
      icon: <BarChart2 size={22} />,
      accent: "#06b6d4",
    },
  ];

  // ── Quick Stats ────────────────────────────────────────────
  const QUICK_STATS: QuickStat[] = [
    {
      label: "Total Revenue",
      value: `Rs ${stats.revenue.toLocaleString()}`,
      icon: <DollarSign size={16} />,
      accent: "#22c55e",
      change: "+12%",
    },

    {
      label: "Total Orders",
      value: stats.orders.toLocaleString(),
      icon: <Package size={16} />,
      accent: "#3b82f6",
      change: "+8%",
    },

    {
      label: "Customers",
      value: stats.customers.toLocaleString(),
      icon: <Users size={16} />,
      accent: "#a855f7",
      change: "+5%",
    },

    {
      label: "Products",
      value: stats.products.toLocaleString(),
      icon: <Boxes size={16} />,
      accent: "#f97316",
    },
  ];

  const now = new Date();

  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-background">
      <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:py-12">
        {/* ── HEADER ── */}
        <motion.div {...fadeUp(0)} className="mb-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-secondary">Admin Panel</p>

            <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white sm:text-4xl">{greeting} 👋</h1>

            <p className="mt-1.5 text-sm text-neutral-400">
              {now.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <Link href="/admin/analytics" className="mt-4 flex items-center gap-2 self-start rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-bold text-neutral-600 shadow-sm transition hover:border-secondary hover:text-secondary dark:border-border dark:bg-card dark:text-neutral-300 sm:mt-0 sm:self-auto">
            <TrendingUp size={14} />
            Full Analytics
            <ArrowUpRight size={12} />
          </Link>
        </motion.div>

        {/* ── QUICK STATS ── */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {QUICK_STATS.map((s, i) => (
            <motion.div key={i} {...fadeUp(0.06 + i * 0.06)} className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 dark:border-border dark:bg-card">
              <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" style={{ background: s.accent }} />

              <div className="relative flex items-center justify-between">
                <p className="text-xs font-semibold text-neutral-400">{s.label}</p>

                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `${s.accent}18`,
                    color: s.accent,
                  }}
                >
                  {s.icon}
                </div>
              </div>

              {loadingStats ? (
                <div className="mt-3 h-7 w-24 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
              ) : (
                <div className="mt-3 flex items-end gap-2">
                  <p className="text-2xl font-black text-neutral-900 dark:text-white">{s.value}</p>

                  {s.change && (
                    <span className="mb-0.5 flex items-center gap-0.5 text-[11px] font-bold text-green-500">
                      <ArrowUpRight size={11} />
                      {s.change}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* ── NAV GRID + RECENT ORDERS ── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* NAV CARDS */}
          <div className="lg:col-span-2">
            <motion.p {...fadeUp(0.3)} className="mb-4 text-xs font-black uppercase tracking-widest text-neutral-400">
              Quick Actions
            </motion.p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {NAV_CARDS.map((card, i) => (
                <motion.div key={i} {...fadeUp(0.32 + i * 0.05)}>
                  <Link
                    href={card.href}
                    className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-(--accent) hover:shadow-lg dark:border-border dark:bg-card"
                    style={
                      {
                        "--accent": card.accent,
                      } as React.CSSProperties
                    }
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                        style={{
                          background: `${card.accent}15`,
                          color: card.accent,
                        }}
                      >
                        {card.icon}
                      </div>

                      <ChevronRight size={15} className="translate-x-0 text-neutral-300 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" style={{ color: card.accent }} />
                    </div>

                    <h2 className="mb-1 text-sm font-black text-neutral-900 dark:text-white">{card.title}</h2>

                    <p className="text-xs leading-relaxed text-neutral-400">{card.description}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RECENT ORDERS */}
          <motion.div {...fadeUp(0.42)}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Recent Orders</p>

              <Link href="/admin/orders" className="flex items-center gap-1 text-[11px] font-bold text-secondary transition hover:opacity-70">
                View all <ArrowUpRight size={11} />
              </Link>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-border dark:bg-card">
              {loadingStats ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-9 w-9 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />

                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 w-24 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />

                      <div className="h-2 w-16 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
                    </div>

                    <div className="h-3 w-16 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
                  </div>
                ))
              ) : recentOrders.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-neutral-300 dark:text-neutral-600">
                  <ShoppingCart size={32} strokeWidth={1} />

                  <p className="text-xs font-semibold">No orders yet</p>
                </div>
              ) : (
                recentOrders.map((order, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.5 + i * 0.05,
                    }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/10">
                      <ShoppingCart size={15} className="text-secondary" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-bold text-neutral-800 dark:text-white">{order.customerName || "Customer"}</p>

                      <div className="flex items-center gap-1.5">
                        <Clock size={9} className="text-neutral-400" />

                        <p className="text-[10px] text-neutral-400">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[12px] font-black text-neutral-900 dark:text-white">Rs {order.totalPrice?.toLocaleString()}</span>

                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${STATUS_STYLE[order.orderStatus] || "bg-neutral-100 text-neutral-500"}`}>{order.orderStatus}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
