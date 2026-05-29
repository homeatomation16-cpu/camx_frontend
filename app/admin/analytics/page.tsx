"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import {
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  Boxes,
  Calendar,
  Award,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_BASE;

// ======================================
// TYPES
// ======================================

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

// ======================================
// COMPONENT
// ======================================

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

  // ======================================
  // FETCH
  // ======================================

  const fetchAnalytics = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("CAMX_TOKEN");
      const headers = { Authorization: `Bearer ${token}` };

      const [comprehensiveRes, usersRes, productsRes, categoryRes] =
        await Promise.all([
          axios.get(`${API}api/orders/analytics/comprehensive`, {
            signal,
            headers,
          }),
          axios.get(`${API}api/users/all`, { signal, headers }),
          axios.get(`${API}api/products`, { signal, headers }),
          axios.get(`${API}api/products/categories`, { signal, headers }),
        ]);

      const compData = comprehensiveRes.data;

      setAnalytics({
        totalOrders: compData.overall.totalOrders || 0,
        totalRevenue: compData.overall.totalRevenue || 0,
        totalProductsSold: compData.overall.totalProductsSold || 0,
        dailyOrders: compData.daily.dailyOrders || 0,
        dailyRevenue: compData.daily.dailyRevenue || 0,
        totalCustomers: usersRes.data?.length || 0,
        totalProducts: productsRes.data?.length || 0,
        bestSellers: compData.bestSellers || [],
        categoryDistribution: categoryRes.data || [],
      });
    } catch (error) {
      if (axios.isCancel(error)) return;
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      await fetchAnalytics(controller.signal);
    };

    loadData();

    return () => controller.abort();
    // Unused eslint disable directive ඉවත් කරන ලදී.
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] text-gray-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium animate-pulse">
            Loading Analytics Dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ======================================
  // DATA PREPARATION FOR CHARTS
  // ======================================

  const summaryCards = [
    {
      title: "Today's Revenue",
      value: `Rs. ${analytics.dailyRevenue.toLocaleString()}`,
      icon: <Calendar size={24} className="text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      title: "Today's Orders",
      value: analytics.dailyOrders.toLocaleString(),
      icon: <ShoppingCart size={24} className="text-indigo-600" />,
      bg: "bg-indigo-50",
    },
    {
      title: "Total Revenue",
      value: `Rs. ${analytics.totalRevenue.toLocaleString()}`,
      icon: <DollarSign size={24} className="text-green-600" />,
      bg: "bg-green-50",
    },
    {
      title: "Total Orders",
      value: analytics.totalOrders.toLocaleString(),
      icon: <Package size={24} className="text-orange-600" />,
      bg: "bg-orange-50",
    },
    {
      title: "Total Customers",
      value: analytics.totalCustomers.toLocaleString(),
      icon: <Users size={24} className="text-purple-600" />,
      bg: "bg-purple-50",
    },
    {
      title: "Total Products",
      value: analytics.totalProducts.toLocaleString(),
      icon: <Boxes size={24} className="text-pink-600" />,
      bg: "bg-pink-50",
    },
  ];

  const growthData = [
    { month: "Jan", revenue: 15000 },
    { month: "Feb", revenue: 25000 },
    { month: "Mar", revenue: 18000 },
    { month: "Apr", revenue: 32000 },
    {
      month: "May",
      revenue: analytics.totalRevenue > 32000 ? analytics.totalRevenue : 45000,
    },
  ];

  const pieData = [
    { name: "Orders", value: analytics.totalOrders },
    { name: "Products", value: analytics.totalProducts },
    { name: "Customers", value: analytics.totalCustomers },
  ];
  const PIE_COLORS = ["#3b82f6", "#f97316", "#8b5cf6"];

  // ======================================
  // UI RENDER
  // ======================================

  return (
    <main className="min-h-screen bg-[#f8f9fa] dark:bg-background p-4 lg:p-8 text-gray-900 dark:text-white font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <TrendingUp size={24} />
          </div>
          <div>
            <h1 className="text-[28px] font-bold leading-tight">
              Analytics Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Comprehensive overview of sales, users, and inventory
            </p>
          </div>
        </div>

        {/* SUMMARY CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {summaryCards.map((card, index) => (
            <div
              key={index}
              className="bg-white dark:bg-card p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                  {card.title}
                </p>
                <div
                  className={`p-2 rounded-lg ${card.bg} transition-transform group-hover:scale-110`}
                >
                  {card.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold truncate">{card.value}</h3>
            </div>
          ))}
        </div>

        {/* TOP CHARTS ROW (Area Chart & Pie Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          {/* AREA CHART (Span 2) */}
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              📈 Revenue Growth
            </h3>
            {/* Tailwind warning හදන ලදී (h-[300px] -> h-75) */}
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={growthData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  {/* Typescript formatter warning හදන ලදී (any type භාවිතයෙන්) */}
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: unknown) => [
                      `Rs. ${Number(value).toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22c55e"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PIE CHART (Span 1) */}
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              🎯 System Distribution
            </h3>
            {/* Tailwind warning හදන ලදී */}
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW (Bar Chart & Best Sellers Table) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
          {/* CATEGORY BAR CHART */}
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                🗂️ Category Distribution
              </h3>
              <div className="px-3 py-1 rounded-full bg-pink-100 text-pink-600 text-xs font-bold">
                {analytics.categoryDistribution.length} Categories
              </div>
            </div>
            {/* Tailwind warning හදන ලදී (flex-grow -> grow, h-[300px] -> h-75) */}
            <div className="h-75 w-full grow">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.categoryDistribution}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f9fafb" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#ec4899"
                    radius={[6, 6, 0, 0]}
                    barSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BEST SELLERS TABLE */}
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Award className="text-yellow-500" size={24} /> Best Selling
              Products
            </h3>
            {analytics.bestSellers.length > 0 ? (
              // Tailwind warning හදන ලදී (flex-grow -> grow)
              <div className="overflow-x-auto grow">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg font-semibold">
                        Product Name
                      </th>
                      <th className="px-4 py-3 text-center font-semibold">
                        Sold Qty
                      </th>
                      <th className="px-4 py-3 text-right rounded-r-lg font-semibold">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.bestSellers.map((item, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors"
                      >
                        <td className="px-4 py-4 font-medium text-gray-800 dark:text-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold">
                              {i + 1}
                            </span>
                            {item.name}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-orange-500">
                          {item.totalSold}{" "}
                          <span className="text-xs font-normal text-gray-400">
                            units
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-green-600 font-bold">
                          Rs. {item.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // Tailwind warning හදන ලදී (flex-grow -> grow)
              <div className="grow flex flex-col items-center justify-center text-gray-400 gap-2">
                <Package size={40} className="text-gray-300" />
                <p>No sales data recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
