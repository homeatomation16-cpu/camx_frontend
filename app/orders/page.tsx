"use client";

import axios from "axios";

import { useEffect, useState } from "react";

import Loader from "../components/Loader";

import ViewOrderInfoCustomer from "../components/ViewOrderInfoCustomer";

// ======================================
// TYPES
// ======================================

type OrderItem = {
  productID: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
};

type OrderType = {
  orderId: string;

  email: string;

  name: string;

  phone?: string;

  address?: string;

  notes?: string;

  total: number;

  shippingFee?: number;

  freeShippingApplied?: boolean;

  status: string;

  date?: string;

  createdAt?: string;

  items: OrderItem[];
};

// ======================================
// COMPONENT
// ======================================

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);

  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_BASE;

  // ======================================
  // LOAD ORDERS
  // ======================================

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("CAMX_TOKEN");

        if (!token) {
          setLoading(false);

          return;
        }

        const response = await axios.get(`${API}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(response.data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [API]);

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return <Loader />;
  }

  // ======================================
  // UI
  // ======================================

  return (
    <main className="min-h-screen w-full bg-linear-to-b from-primary to-white text-secondary px-4 py-28 lg:px-10">
      <div className="max-w-7xl mx-auto">
        {/* TITLE */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-5xl font-black">My Orders</h1>

          <p className="text-secondary/70 mt-2 text-sm lg:text-base">Track and manage your orders</p>
        </div>

        {/* EMPTY */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
            <h2 className="text-2xl font-bold mb-2">No Orders Found</h2>

            <p className="text-secondary/60">You have not placed any orders yet.</p>
          </div>
        ) : (
          <>
            {/* ====================================== */}
            {/* DESKTOP TABLE */}
            {/* ====================================== */}

            <div className="hidden lg:block overflow-x-auto rounded-3xl shadow-xl bg-white border border-secondary/10">
              <table className="w-full table-auto border-separate border-spacing-0">
                <thead>
                  <tr className="bg-accent text-primary">
                    <th className="px-4 py-5 text-left text-xs uppercase font-bold">Order ID</th>

                    <th className="px-4 py-5 text-left text-xs uppercase font-bold">Email</th>

                    <th className="px-4 py-5 text-left text-xs uppercase font-bold">Name</th>

                    <th className="px-4 py-5 text-left text-xs uppercase font-bold">Date</th>

                    <th className="px-4 py-5 text-left text-xs uppercase font-bold">Status</th>

                    <th className="px-4 py-5 text-left text-xs uppercase font-bold">Shipping</th>

                    <th className="px-4 py-5 text-left text-xs uppercase font-bold">Total</th>

                    <th className="px-4 py-5 text-left text-xs uppercase font-bold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderId} className="border-b border-secondary/10 hover:bg-secondary/5 transition">
                      {/* ORDER ID */}
                      <td className="px-4 py-5 text-sm font-semibold break-all">{order.orderId}</td>

                      {/* EMAIL */}
                      <td className="px-4 py-5 text-sm">{order.email}</td>

                      {/* NAME */}
                      <td className="px-4 py-5 text-sm">{order.name}</td>

                      {/* DATE */}
                      <td className="px-4 py-5 text-sm">{new Date(order.date || order.createdAt || "").toLocaleDateString()}</td>

                      {/* STATUS */}
                      <td className="px-4 py-5 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === "completed" ? "bg-green-100 text-green-700" : order.status === "paid" ? "bg-green-100 text-green-700" : order.status === "pending" ? "bg-yellow-100 text-yellow-700" : order.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>{order.status}</span>
                      </td>

                      {/* SHIPPING */}
                      <td className="px-4 py-5 text-sm">{order.freeShippingApplied ? <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">FREE</span> : <span>LKR {order.shippingFee?.toFixed(2) || "0.00"}</span>}</td>

                      {/* TOTAL */}
                      <td className="px-4 py-5 text-sm font-black text-secondary">LKR {Number(order.total || 0).toFixed(2)}</td>

                      {/* ACTION */}
                      <td className="px-4 py-5">
                        <ViewOrderInfoCustomer order={order} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ====================================== */}
            {/* MOBILE CARDS */}
            {/* ====================================== */}

            <div className="lg:hidden space-y-5">
              {orders.map((order) => (
                <div key={order.orderId} className="bg-white rounded-3xl shadow-xl border border-secondary/10 p-5">
                  {/* TOP */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs uppercase font-bold text-secondary/50">Order ID</p>

                      <p className="text-sm font-bold text-secondary break-all mt-1">{order.orderId}</p>
                    </div>

                    {/* STATUS */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${order.status === "completed" ? "bg-green-100 text-green-700" : order.status === "paid" ? "bg-green-100 text-green-700" : order.status === "pending" ? "bg-yellow-100 text-yellow-700" : order.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>{order.status}</span>
                  </div>

                  {/* INFO */}
                  <div className="mt-5 space-y-4">
                    {/* DATE */}
                    <div>
                      <p className="text-xs uppercase font-bold text-secondary/50">Date</p>

                      <p className="text-sm font-semibold text-secondary mt-1">{new Date(order.date || order.createdAt || "").toLocaleDateString()}</p>
                    </div>

                    {/* TOTAL */}
                    <div>
                      <p className="text-xs uppercase font-bold text-secondary/50">Total</p>

                      <p className="text-xl font-black text-secondary mt-1">LKR {Number(order.total || 0).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* BUTTON */}
                  <div className="mt-5">
                    <ViewOrderInfoCustomer order={order} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
