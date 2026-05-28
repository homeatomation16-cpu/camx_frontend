'use client';

import axios from 'axios';

import {
  useEffect,
  useState,
} from 'react';

import {
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  Boxes,
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const API =
  process.env
    .NEXT_PUBLIC_API_BASE ||
  'http://localhost:5000';

// ======================================
// TYPES
// ======================================

type Analytics = {
  totalOrders: number;
  totalRevenue: number;
  totalProductsSold: number;
  totalCustomers: number;
  totalProducts: number;
  categoryDistribution?: {
    name: string;
    count: number;
  }[];
};

// ======================================
// COMPONENT
// ======================================

export default function AdminAnalyticsPage() {

  const [analytics, setAnalytics] =
    useState<Analytics>({
      totalOrders: 0,
      totalRevenue: 0,
      totalProductsSold: 0,
      totalCustomers: 0,
      totalProducts: 0,
      categoryDistribution: [],
    });

  const [loading, setLoading] =
    useState(true);

  // ======================================
  // FETCH
  // ======================================

  const fetchAnalytics =
    async (
      signal?: AbortSignal
    ) => {

      try {

        setLoading(true);

        const token =
          localStorage.getItem(
            'CAMX_TOKEN'
          );

        const [

          salesRes,

          usersRes,

          productsRes,

          categoryRes,

        ] = await Promise.all([

          axios.get(
            `${API}/api/orders/analytics/sales`,
            {
              signal,
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          ),

          axios.get(
            `${API}/api/users/all`,
            {
              signal,
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          ),

          axios.get(
            `${API}/api/products`,
            {
              signal,
            }
          ),

          axios.get(
            `${API}/api/products/categories`,
            {
              signal,
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          ),
        ]);

        setAnalytics({
          totalOrders:
            salesRes.data?.totalOrders || 0,

          totalRevenue:
            salesRes.data?.totalRevenue || 0,

          totalProductsSold:
            salesRes.data?.totalProductsSold || 0,

          totalCustomers:
            usersRes.data?.length || 0,

          totalProducts:
            productsRes.data?.length || 0,

          categoryDistribution:
            categoryRes.data || [],
        });

      } catch (error) {

        if (
          axios.isCancel(error)
        ) {

          return;
        }

        console.error(
          'Failed to fetch analytics:',
          error
        );

      } finally {

        setLoading(false);
      }
    };

  // ======================================
  // EFFECT
  // ======================================

  useEffect(() => {

    const controller =
      new AbortController();

    queueMicrotask(() => {

      fetchAnalytics(
        controller.signal
      );
    });

    return () => {

      controller.abort();
    };

  }, []);

  // ======================================
  // LOADING
  // ======================================

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] text-gray-500">

        <p className="text-lg font-medium animate-pulse">

          Loading Analytics...
        </p>
      </div>
    );
  }

  // ======================================
  // CARDS
  // ======================================

  const cards = [

    {
      title:
        'Total Revenue',

      value:
        `Rs. ${analytics.totalRevenue.toLocaleString()}`,

      icon:
        <DollarSign
          size={24}
          className="text-green-600"
        />,

      bg:
        'bg-green-50',
    },

    {
      title:
        'Total Orders',

      value:
        analytics.totalOrders.toLocaleString(),

      icon:
        <ShoppingCart
          size={24}
          className="text-blue-600"
        />,

      bg:
        'bg-blue-50',
    },

    {
      title:
        'Products Sold',

      value:
        analytics.totalProductsSold.toLocaleString(),

      icon:
        <Package
          size={24}
          className="text-orange-600"
        />,

      bg:
        'bg-orange-50',
    },

    {
      title:
        'Total Customers',

      value:
        analytics.totalCustomers.toLocaleString(),

      icon:
        <Users
          size={24}
          className="text-purple-600"
        />,

      bg:
        'bg-purple-50',
    },

    {
      title:
        'Total Products',

      value:
        analytics.totalProducts.toLocaleString(),

      icon:
        <Boxes
          size={24}
          className="text-indigo-600"
        />,

      bg:
        'bg-indigo-50',
    },

    {
      title:
        'Categories',

      value:
        analytics.categoryDistribution?.length || 0,

      icon:
        <TrendingUp
          size={24}
          className="text-pink-600"
        />,

      bg:
        'bg-pink-50',
    },
  ];

  // ======================================
  // CHART DATA
  // ======================================

  const salesData = [

    {
      name: 'Orders',
      value:
        analytics.totalOrders,
    },

    {
      name: 'Products Sold',
      value:
        analytics.totalProductsSold,
    },

    {
      name: 'Customers',
      value:
        analytics.totalCustomers,
    },
  ];

  const pieData = [

    {
      name: 'Revenue',
      value:
        analytics.totalRevenue,
    },

    {
      name: 'Products',
      value:
        analytics.totalProducts,
    },

    {
      name: 'Orders',
      value:
        analytics.totalOrders,
    },
  ];

  const growthData = [

    {
      month: 'Jan',
      sales: 4000,
    },

    {
      month: 'Feb',
      sales: 3000,
    },

    {
      month: 'Mar',
      sales: 5000,
    },

    {
      month: 'Apr',
      sales: 7000,
    },

    {
      month: 'May',
      sales:
        analytics.totalRevenue,
    },
  ];

  const categoryData =
    analytics.categoryDistribution || [];

  const PIE_COLORS = [

    '#22c55e',

    '#3b82f6',

    '#f97316',
  ];

  // ======================================
  // UI
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

              Business performance overview
            </p>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

          {cards.map(
            (
              card,
              index
            ) => (

              <div
                key={index}
                className="bg-white dark:bg-card p-5 rounded-2xl border border-gray-100 dark:border-border shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >

                <div className="flex items-center justify-between mb-4">

                  <p className="text-sm font-medium text-gray-500">

                    {card.title}
                  </p>

                  <div
                    className={`p-2 rounded-lg ${card.bg}`}
                  >

                    {card.icon}
                  </div>
                </div>

                <h3 className="text-2xl font-bold">

                  {card.value}
                </h3>
              </div>
            )
          )}
        </div>

        {/* TOP CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">

          {/* BAR CHART */}
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-6">

            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">

              📊 Sales Overview
            </h3>

            <div className="h-72 w-full">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={salesData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 0,
                  }}
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
                    tick={{
                      fill: '#6b7280',
                      fontSize: 12,
                    }}
                    dy={10}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: '#6b7280',
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    cursor={{
                      fill: '#f9fafb',
                    }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow:
                        '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />

                  <Bar
                    dataKey="value"
                    fill="#3b82f6"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                    barSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PIE CHART */}
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-6">

            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">

              🎯 System Distribution
            </h3>

            <div className="h-72 w-full">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={pieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    stroke="none"
                  >

                    {pieData.map(
                      (
                        _,
                        index
                      ) => (

                        <Cell
                          key={`cell-${index}`}
                          fill={
                            PIE_COLORS[
                              index %
                                PIE_COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow:
                        '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CATEGORY DISTRIBUTION */}
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-6">

          <div className="flex items-center justify-between mb-6">

            <div>

              <h3 className="text-lg font-bold flex items-center gap-2">

                🗂️ Category Distribution
              </h3>

              <p className="text-sm text-gray-500 mt-1">

                Products count by category
              </p>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-orange-100 text-orange-600 text-sm font-bold">

              {categoryData.length} Categories
            </div>
          </div>

          <div className="h-80 w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={categoryData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
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
                  tick={{
                    fill: '#6b7280',
                    fontSize: 12,
                  }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6b7280',
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  cursor={{
                    fill: '#f9fafb',
                  }}
                />

                <Bar
                  dataKey="count"
                  fill="#f97316"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                  barSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AREA CHART */}
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-6">

          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">

            📈 Revenue Growth
          </h3>

          <div className="h-80 w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <AreaChart
                data={growthData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >

                <defs>

                  <linearGradient
                    id="colorSales"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="5%"
                      stopColor="#22c55e"
                      stopOpacity={0.3}
                    />

                    <stop
                      offset="95%"
                      stopColor="#22c55e"
                      stopOpacity={0}
                    />
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
                  tick={{
                    fill: '#6b7280',
                    fontSize: 12,
                  }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6b7280',
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow:
                      '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#22c55e"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                  activeDot={{
                    r: 6,
                    strokeWidth: 0,
                    fill: '#22c55e',
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
}