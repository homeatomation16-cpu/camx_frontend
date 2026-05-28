'use client';

import axios from 'axios';

import {
  useEffect,
  useState,
} from 'react';

import ViewOrderInfo
from '@/app/components/ViewOrderInfo';

type Order = {
  _id: string;

  orderId: string;

  name?: string;

  email?: string;

  status: string;

  total: number;

  createdAt: string;

  items: never[];
};

const API =
  process.env
    .NEXT_PUBLIC_API_BASE;

export default function AdminOrdersPage() {

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loaded, setLoaded] =
    useState(false);

  // ======================================
  // FETCH ORDERS
  // ======================================

  const fetchOrders =
    async (
      signal?: AbortSignal
    ) => {

      try {

        const token =
          localStorage.getItem(
            'CAMX_TOKEN'
          );

        const response =
          await axios.get(

            `${API}/api/orders`,

            {
              signal,

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        setOrders(
          response.data || []
        );

        setLoaded(true);

      } catch (error) {

        if (
          axios.isCancel(
            error
          )
        ) {

          return;
        }

        console.error(
          error
        );
      }
    };

  // ======================================
  // EFFECT
  // ======================================

  useEffect(() => {

    const controller =
      new AbortController();

    queueMicrotask(() => {

      fetchOrders(
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

  if (!loaded) {

    return (

      <main className="min-h-screen flex items-center justify-center">

        Loading...
      </main>
    );
  }

  // ======================================
  // UI
  // ======================================

  return (

    <main className="min-h-screen p-6 bg-neutral-50 dark:bg-background text-neutral-900 dark:text-white">

      {/* HEADER */}
      <div className="mb-8">

        <h1 className="text-4xl font-black">

          Orders
        </h1>

        <p className="text-neutral-500 mt-1">

          Manage customer orders
        </p>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-3xl border border-border bg-white dark:bg-card">

        <table className="w-full min-w-300">

          <thead className="border-b border-border bg-neutral-100 dark:bg-white/5">

            <tr className="text-left text-sm">

              <th className="p-5">
                Order ID
              </th>

              <th className="p-5">
                Customer Email
              </th>

              <th className="p-5">
                Customer Name
              </th>

              <th className="p-5">
                Date
              </th>

              <th className="p-5">
                Status
              </th>

              <th className="p-5">
                Total
              </th>

              <th className="p-5">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>

            {orders.map(
              (
                order,
                index
              ) => (

                <tr
                  key={index}
                  className="border-b border-border hover:bg-neutral-50 dark:hover:bg-white/5 transition"
                >

                  <td className="p-5 font-bold text-secondary">

                    {order.orderId}
                  </td>

                  <td className="p-5">

                    {order.email}
                  </td>

                  <td className="p-5">

                    {order.name}
                  </td>

                  <td className="p-5">

                    {new Date(
                      order.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td className="p-5">

                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-bold">

                      {order.status}
                    </span>
                  </td>

                  <td className="p-5 font-bold">

                    LKR{' '}
                    {order.total.toLocaleString()}
                  </td>

                  <td className="p-5">

                    <ViewOrderInfo
                      order={order}
                    />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}