'use client';

import axios from 'axios';

import {
  useEffect,
  useState,
} from 'react';

import Loader from '../components/Loader';

import ViewOrderInfoCustomer from '../components/ViewOrderInfoCustomer';

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

  date: string;

  items: OrderItem[];
};

// ======================================
// COMPONENT
// ======================================

export default function OrdersPage() {

  const [orders, setOrders] =
    useState<OrderType[]>([]);

  const [loaded, setLoaded] =
    useState(false);

  // ======================================
  // LOAD ORDERS
  // ======================================

  useEffect(() => {

    const fetchOrders =
      async () => {

        try {

          const token =
            localStorage.getItem(
              'CAMX_TOKEN'
            );

          const response =
            await axios.get(
              `${process.env.NEXT_PUBLIC_API_BASE}/orders`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

          setOrders(
            response.data || []
          );

        } catch (error) {

          console.error(
            'Error fetching orders:',
            error
          );

        } finally {

          setLoaded(true);
        }
      };

    fetchOrders();

  }, []);

  // ======================================
  // LOADING
  // ======================================

  if (!loaded) {

    return (
      <Loader />
    );
  }

  // ======================================
  // UI
  // ======================================

  return (
    <main className="min-h-screen w-full bg-linear-to-b from-primary to-white text-secondary p-4 lg:p-10">

      <div className="max-w-7xl mx-auto">

        {/* TITLE */}
        <div className="mb-8">

          <h1 className="text-4xl lg:text-5xl font-black">
            My Orders
          </h1>

          <p className="text-secondary/70 mt-2">
            Track and manage your orders
          </p>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-3xl shadow-xl bg-white/80 border border-secondary/10">

          <table className="w-full table-auto border-separate border-spacing-0">

            {/* HEADER */}
            <thead>

              <tr className="bg-accent text-primary">

                <th className="px-3 py-4 text-left text-xs uppercase font-bold">
                  Order ID
                </th>

                <th className="px-3 py-4 text-left text-xs uppercase font-bold hidden lg:table-cell">
                  Email
                </th>

                <th className="px-3 py-4 text-left text-xs uppercase font-bold">
                  Name
                </th>

                <th className="px-3 py-4 text-left text-xs uppercase font-bold hidden lg:table-cell">
                  Date
                </th>

                <th className="px-3 py-4 text-left text-xs uppercase font-bold">
                  Status
                </th>

                <th className="px-3 py-4 text-left text-xs uppercase font-bold hidden lg:table-cell">
                  Shipping
                </th>

                <th className="px-3 py-4 text-left text-xs uppercase font-bold">
                  Total
                </th>

                <th className="px-3 py-4 text-left text-xs uppercase font-bold">
                  Actions
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y divide-secondary/10">

              {orders.length === 0 ? (

                <tr>

                  <td
                    colSpan={8}
                    className="px-4 py-16 text-center text-secondary/60"
                  >
                    No orders found
                  </td>
                </tr>

              ) : (

                orders.map(
                  (order) => (

                    <tr
                      key={order.orderId}
                      className="odd:bg-primary/40 even:bg-white hover:bg-primary/70 transition"
                    >

                      {/* ORDER ID */}
                      <td className="px-3 py-4 text-sm font-semibold">
                        {order.orderId}
                      </td>

                      {/* EMAIL */}
                      <td className="px-3 py-4 text-sm hidden lg:table-cell">
                        {order.email}
                      </td>

                      {/* NAME */}
                      <td className="px-3 py-4 text-sm">
                        {order.name}
                      </td>

                      {/* DATE */}
                      <td className="px-3 py-4 text-sm hidden lg:table-cell">
                        {new Date(
                          order.date
                        ).toLocaleDateString()}
                      </td>

                      {/* STATUS */}
                      <td className="px-3 py-4 text-sm">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.status ===
                            'completed'
                              ? 'bg-green-100 text-green-800'
                              : order.status ===
                                'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status ===
                                'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* SHIPPING */}
                      <td className="px-3 py-4 text-sm hidden lg:table-cell">

                        {order.freeShippingApplied ? (

                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                            FREE
                          </span>

                        ) : (

                          <span>
                            LKR{' '}
                            {order.shippingFee?.toFixed(
                              2
                            ) || '0.00'}
                          </span>
                        )}
                      </td>

                      {/* TOTAL */}
                      <td className="px-3 py-4 text-sm font-bold">

                        LKR{' '}
                        {order.total.toFixed(
                          2
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-3 py-4">

                        <ViewOrderInfoCustomer
                          order={order}
                        />
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}