'use client';

import axios from 'axios';

import Image from 'next/image';

import {
  useState,
} from 'react';

import toast from 'react-hot-toast';

import {

  X,

  User,

  Mail,

  Phone,

  Home,

  ClipboardList,

  ShoppingBag,

  Calendar,

  FileText,

} from 'lucide-react';

const API =
  process.env
    .NEXT_PUBLIC_API_BASE;

// ======================================
// TYPES
// ======================================

type OrderItem = {

  productId: string;

  name: string;

  quantity: number;

  unitPrice: number;

  image?: string;
};

type Order = {

  orderId: string;

  name?: string;

  email?: string;

  phone?: string;

  address?: string;

  city?: string;

  district?: string;

  notes?: string;

  paymentMethod?: string;

  status: string;

  total: number;

  createdAt: string;

  items: OrderItem[];
};

type Props = {

  order: Order;
};

// ======================================
// COMPONENT
// ======================================

export default function ViewOrderInfo({
  order,
}: Props) {

  const [
    isModalOpen,
    setIsModalOpen,
  ] =
    useState(false);

  const [notes, setNotes] =
    useState(
      order?.notes || ''
    );

  const [status, setStatus] =
    useState(
      order?.status || ''
    );

  // ======================================
  // FORMAT DATE
  // ======================================

  const formatDateTime =
    (
      value: string
    ) => {

      if (!value)
        return '-';

      return new Date(
        value
      ).toLocaleString();
    };

  // ======================================
  // FORMAT MONEY
  // ======================================

  const formatCurrency =
    (
      value: number
    ) =>

      value == null

        ? '-'

        : `Rs. ${Number(
            value
          ).toLocaleString()}`;

  // ======================================
  // STATUS COLORS
  // ======================================

  const getStatusClasses =
    (
      current: string
    ) => {

      switch (
        current?.toLowerCase()
      ) {

        case 'completed':

        case 'paid':

          return 'bg-emerald-100 text-emerald-800 border border-emerald-200';

        case 'cancelled':

          return 'bg-red-100 text-red-800 border border-red-200';

        case 'processing':

          return 'bg-blue-100 text-blue-800 border border-blue-200';

        default:

          return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      }
    };

  // ======================================
  // UPDATE ORDER
  // ======================================

  const updateOrder =
    async () => {

      try {

        const token =
          localStorage.getItem(
            'CAMX_TOKEN'
          );

        await axios.put(

  `${API}/api/orders/${order.orderId}`,

          {
            status,
            notes,
          },

          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        toast.success(
          'Order updated successfully'
        );

        window.location.reload();

      } catch (error) {

        toast.error(
          'Failed to update order'
        );

        console.error(
          error
        );
      }
    };

  // ======================================
  // UI
  // ======================================

  return (

    <>
      {/* OPEN BUTTON */}
      <button
        onClick={() =>
          setIsModalOpen(
            true
          )
        }
        className="px-4 py-2 rounded-xl bg-secondary text-white text-sm font-bold hover:opacity-90 transition"
      >

        View Info
      </button>

      {/* MODAL */}
      {isModalOpen && (

        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden bg-white dark:bg-neutral-900 rounded-3xl border border-border flex flex-col">

            {/* HEADER */}
            <div className="flex items-start justify-between border-b border-border px-6 py-5">

              <div>

                <h2 className="text-3xl font-black flex items-center gap-3">

                  <ClipboardList />

                  Order Details
                </h2>

                <p className="text-sm text-neutral-500 mt-2">

                  {order.orderId}
                </p>
              </div>

              <button
                onClick={() =>
                  setIsModalOpen(
                    false
                  )
                }
                className="w-10 h-10 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/10 flex items-center justify-center"
              >

                <X size={20} />
              </button>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* GRID */}
              <div className="grid lg:grid-cols-2 gap-6">

                {/* CUSTOMER */}
                <div className="rounded-3xl border border-border p-6 bg-neutral-50 dark:bg-white/5">

                  <h3 className="font-black text-lg mb-5">

                    Customer Information
                  </h3>

                  <div className="space-y-4">

                    <div className="flex gap-3">

                      <User
                        size={18}
                      />

                      <div>

                        <p className="text-xs text-neutral-500 uppercase">

                          Name
                        </p>

                        <p className="font-semibold">

                          {order.name ||
                            '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">

                      <Mail
                        size={18}
                      />

                      <div>

                        <p className="text-xs text-neutral-500 uppercase">

                          Email
                        </p>

                        <p className="font-semibold break-all">

                          {order.email ||
                            '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">

                      <Phone
                        size={18}
                      />

                      <div>

                        <p className="text-xs text-neutral-500 uppercase">

                          Phone
                        </p>

                        <p className="font-semibold">

                          {order.phone ||
                            '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ORDER */}
                <div className="rounded-3xl border border-border p-6 bg-neutral-50 dark:bg-white/5">

                  <h3 className="font-black text-lg mb-5">

                    Order Information
                  </h3>

                  <div className="space-y-4">

                    <div className="flex gap-3">

                      <Calendar
                        size={18}
                      />

                      <div>

                        <p className="text-xs text-neutral-500 uppercase">

                          Date
                        </p>

                        <p className="font-semibold">

                          {formatDateTime(
                            order.createdAt
                          )}
                        </p>
                      </div>
                    </div>

                    <div>

                      <p className="text-xs text-neutral-500 uppercase mb-2">

                        Status
                      </p>

                      <div className="flex gap-3 items-center flex-wrap">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusClasses(
                            status
                          )}`}
                        >

                          {status}
                        </span>

                        <select
                          value={status}
                          onChange={(e) =>
                            setStatus(
                              e.target.value
                            )
                          }
                          className="h-10 px-3 rounded-xl border border-border bg-transparent outline-none"
                        >

                          <option value="pending">
                            Pending
                          </option>

                          <option value="processing">
                            Processing
                          </option>

                          <option value="paid">
                            Paid
                          </option>

                          <option value="completed">
                            Completed
                          </option>

                          <option value="cancelled">
                            Cancelled
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>

                      <p className="text-xs text-neutral-500 uppercase">

                        Payment Method
                      </p>

                      <p className="font-semibold">

                        {order.paymentMethod ||
                          'COD'}
                      </p>
                    </div>

                    <div>

                      <p className="text-xs text-neutral-500 uppercase">

                        Total Amount
                      </p>

                      <p className="text-3xl font-black text-secondary">

                        {formatCurrency(
                          order.total
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ADDRESS */}
              <div className="rounded-3xl border border-border p-6 bg-neutral-50 dark:bg-white/5">

                <h3 className="font-black text-lg flex items-center gap-3 mb-4">

                  <Home size={20} />

                  Delivery Address
                </h3>

                <div className="space-y-2 text-sm">

                  <p>
                    {order.address ||
                      '-'}
                  </p>

                  <p>
                    {order.city ||
                      '-'}
                  </p>

                  <p>
                    {order.district ||
                      '-'}
                  </p>
                </div>
              </div>

              {/* NOTES */}
              <div className="rounded-3xl border border-border p-6 bg-neutral-50 dark:bg-white/5">

                <h3 className="font-black text-lg flex items-center gap-3 mb-4">

                  <FileText size={20} />

                  Additional Notes
                </h3>

                <textarea
                  value={notes}
                  onChange={(e) =>
                    setNotes(
                      e.target.value
                    )
                  }
                  className="w-full min-h-32 rounded-2xl border border-border bg-transparent p-4 outline-none resize-none"
                />
              </div>

              {/* ITEMS */}
              <div className="rounded-3xl border border-border overflow-hidden">

                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-neutral-50 dark:bg-white/5">

                  <h3 className="font-black flex items-center gap-3">

                    <ShoppingBag size={20} />

                    Ordered Products
                  </h3>

                  <p className="text-sm text-neutral-500">

                    {order.items?.length}{' '}
                    items
                  </p>
                </div>

                <div className="divide-y divide-border">

                  {order.items?.map(
                    (
                      item: OrderItem,
                      index: number
                    ) => (

                      <div
                        key={index}
                        className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-5"
                      >

                        <div className="flex items-center gap-5">

                          {/* IMAGE */}
                          <div className="relative min-w-25 w-25 h-25 rounded-2xl overflow-hidden border border-border bg-white p-2">

                            <Image
                              src={
                                item.image ||
                                '/placeholder.jpg'
                              }
                              alt={
                                item.name
                              }
                              fill
                              className="object-contain"
                            />
                          </div>

                          {/* INFO */}
                          <div>

                            <h4 className="font-black text-lg">

                              {item.name}
                            </h4>

                            <p className="text-sm text-neutral-500 mt-1">

                              Product ID:{' '}
                              {
                                item.productId
                              }
                            </p>

                            <p className="text-sm text-neutral-500">

                              Qty:{' '}
                              {
                                item.quantity
                              }
                            </p>
                          </div>
                        </div>

                        {/* PRICE */}
                        <div className="text-left lg:text-right">

                          <p className="font-black text-xl text-secondary">

                            {formatCurrency(
                              item.unitPrice *
                              item.quantity
                            )}
                          </p>

                          <p className="text-sm text-neutral-500 mt-1">

                            {formatCurrency(
                              item.unitPrice
                            )}
                            {' '}
                            each
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-6 py-5 border-t border-border flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-neutral-50 dark:bg-white/5">

              <div>

                <p className="text-sm text-neutral-500">

                  Total Amount
                </p>

                <h3 className="text-3xl font-black text-secondary">

                  {formatCurrency(
                    order.total
                  )}
                </h3>
              </div>

              <div className="flex gap-3">

                <button
                  onClick={() =>
                    setIsModalOpen(
                      false
                    )
                  }
                  className="h-12 px-6 rounded-2xl border border-border font-bold"
                >

                  Close
                </button>

                {(order.notes !==
                  notes ||

                  order.status !==
                    status) && (

                  <button
                    onClick={
                      updateOrder
                    }
                    className="h-12 px-6 rounded-2xl bg-secondary text-white font-black"
                  >

                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}