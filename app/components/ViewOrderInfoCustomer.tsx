'use client';

import Image from 'next/image';

import {
  useState,
} from 'react';

import Modal from 'react-modal';

import {
  HiOutlineX,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineShoppingBag,
  HiOutlineCalendar,
} from 'react-icons/hi';

import { MdOutlinePendingActions } from 'react-icons/md';

import { FiEdit3 } from 'react-icons/fi';

// ======================================
// TYPES
// ======================================

type ItemType = {
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
  status: string;
  date: string;
  items: ItemType[];
};

type Props = {
  order: OrderType;
};

// ======================================
// COMPONENT
// ======================================

export default function ViewOrderInfoCustomer({
  order,
}: Props) {

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  if (!order) return null;

  // ======================================
  // HELPERS
  // ======================================

  const formatDateTime = (
    value: string
  ) =>
    value
      ? new Date(
          value
        ).toLocaleString()
      : '-';

  const formatCurrency = (
    value: number
  ) =>
    value == null
      ? '-'
      : `Rs. ${Number(
          value
        ).toFixed(2)}`;

  const getStatusBadgeClasses = (
    status: string
  ) => {

    const s =
      status?.toLowerCase() ||
      '';

    return {
      completed:
        'bg-emerald-100 text-emerald-800 border border-emerald-200',

      paid:
        'bg-emerald-100 text-emerald-800 border border-emerald-200',

      cancelled:
        'bg-red-100 text-red-800 border border-red-200',

      processing:
        'bg-blue-100 text-blue-800 border border-blue-200',

    }[s] ||
      'bg-yellow-100 text-yellow-800 border border-yellow-200';
  };

  return (
    <>
      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() =>
          setIsModalOpen(false)
        }
        ariaHideApp={false}
        overlayClassName="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        className="w-full max-w-3xl mx-4 bg-primary rounded-3xl shadow-2xl outline-none"
      >

        <div className="flex flex-col h-full max-h-[90vh]">

          {/* HEADER */}
          <div className="flex items-start justify-between border-b border-secondary/10 px-6 py-4">

            <div>

              <h2 className="text-2xl font-black text-secondary flex items-center gap-2">

                <HiOutlineClipboardList className="text-accent" />

                Order Details
              </h2>

              <p className="text-sm text-secondary/70 mt-1">
                Review your order information
              </p>
            </div>

            <button
              onClick={() =>
                setIsModalOpen(false)
              }
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary/5 text-secondary hover:bg-secondary/10 transition"
            >
              <HiOutlineX className="text-lg" />
            </button>
          </div>

          {/* BODY */}
          <div className="px-6 py-4 space-y-6 overflow-y-auto">

            {/* SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* LEFT */}
              <div className="space-y-3">

                <div>
                  <p className="text-xs uppercase font-bold text-secondary/60">
                    Order ID
                  </p>

                  <p className="text-sm font-semibold text-secondary">
                    {order.orderId}
                  </p>
                </div>

                <div className="flex items-center gap-2">

                  <HiOutlineUser className="text-secondary/60" />

                  <div>

                    <p className="text-xs uppercase font-bold text-secondary/60">
                      Customer Name
                    </p>

                    <p className="text-sm text-secondary">
                      {order.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">

                  <HiOutlineMail className="text-secondary/60" />

                  <div>

                    <p className="text-xs uppercase font-bold text-secondary/60">
                      Email
                    </p>

                    <p className="text-sm text-secondary break-all">
                      {order.email}
                    </p>
                  </div>
                </div>

                {order.phone && (
                  <div className="flex items-center gap-2">

                    <HiOutlinePhone className="text-secondary/60" />

                    <div>

                      <p className="text-xs uppercase font-bold text-secondary/60">
                        Phone
                      </p>

                      <p className="text-sm text-secondary">
                        {order.phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT */}
              <div className="space-y-3">

                <div className="flex items-center gap-2">

                  <HiOutlineCalendar className="text-secondary/60" />

                  <div>

                    <p className="text-xs uppercase font-bold text-secondary/60">
                      Order Date & Time
                    </p>

                    <p className="text-sm text-secondary">
                      {formatDateTime(
                        order.date
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">

                  <MdOutlinePendingActions className="text-secondary/60" />

                  <div>

                    <p className="text-xs uppercase font-bold text-secondary/60">
                      Status
                    </p>

                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold mt-1 ${getStatusBadgeClasses(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div>

                  <p className="text-xs uppercase font-bold text-secondary/60">
                    Total Amount
                  </p>

                  <p className="text-lg font-black text-yellow-600">
                    {formatCurrency(
                      order.total
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* ADDRESS */}
            <div className="border border-secondary/10 rounded-2xl p-4 bg-white/60">

              <p className="text-xs uppercase font-bold text-secondary/60 mb-2 flex items-center gap-2">

                <HiOutlineHome />

                Delivery Address
              </p>

              <p className="text-sm text-secondary whitespace-pre-line">
                {order.address ||
                  'No address provided'}
              </p>
            </div>

            {/* NOTES */}
            <div className="border border-secondary/10 rounded-2xl p-4 bg-white/60">

              <p className="text-xs uppercase font-bold text-secondary/60 mb-2 flex items-center gap-2">

                <FiEdit3 />

                Additional Notes
              </p>

              <textarea
                disabled
                value={
                  order.notes || ''
                }
                className="w-full text-sm bg-transparent outline-none resize-none text-secondary"
              />
            </div>

            {/* ITEMS */}
            <div className="border border-secondary/10 rounded-2xl bg-white overflow-hidden">

              <div className="flex justify-between px-4 py-3 border-b bg-secondary/5">

                <p className="text-sm font-bold text-secondary flex items-center gap-2">

                  <HiOutlineShoppingBag />

                  Items in this order
                </p>

                <p className="text-xs text-secondary/60">
                  {order.items?.length ||
                    0}{' '}
                  item(s)
                </p>
              </div>

              {order.items?.length ? (

                <div className="max-h-64 overflow-y-auto divide-y divide-secondary/10">

                  {order.items.map(
                    (
                      item,
                      index
                    ) => {

                      const lineTotal =
                        (item.price ||
                          0) *
                        (item.quantity ||
                          0);

                      return (
                        <div
                          key={
                            item.productID +
                            index
                          }
                          className="flex items-center gap-4 px-4 py-3"
                        >

                          {/* IMAGE */}
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-secondary/5">

                            {item.image ? (

                              <Image
                                src={
                                  item.image
                                }
                                alt={
                                  item.name
                                }
                                fill
                                sizes="56px"
                                className="object-cover"
                              />

                            ) : (

                              <div className="w-full h-full flex items-center justify-center text-xs text-secondary/40">
                                No image
                              </div>
                            )}
                          </div>

                          {/* INFO */}
                          <div className="flex-1">

                            <p className="text-sm font-bold text-secondary">
                              {item.name}
                            </p>

                            <p className="text-xs text-secondary/60">
                              Product ID:{' '}
                              {
                                item.productID
                              }
                            </p>

                            <p className="text-xs text-secondary/60">
                              Qty:{' '}
                              {
                                item.quantity
                              }{' '}
                              | Unit:{' '}
                              {formatCurrency(
                                item.price
                              )}
                            </p>
                          </div>

                          {/* TOTAL */}
                          <p className="text-sm font-bold text-secondary">

                            {formatCurrency(
                              lineTotal
                            )}
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>

              ) : (

                <div className="px-4 py-6 text-center text-sm text-secondary/60">
                  No items found
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 border-t border-secondary/10 flex justify-between items-center">

            <div>

              <p className="text-xs uppercase font-bold text-secondary/60">
                Total Amount
              </p>

              <p className="text-lg font-black text-yellow-600">
                {formatCurrency(
                  order.total
                )}
              </p>
            </div>

            <button
              onClick={() =>
                setIsModalOpen(false)
              }
              className="px-4 py-2 bg-secondary text-white rounded-xl text-sm hover:bg-secondary/90 transition"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* BUTTON */}
      <button
        onClick={() =>
          setIsModalOpen(true)
        }
        className="bg-accent/80 hover:bg-accent px-3 py-2 rounded-xl text-white text-sm font-semibold shadow-sm flex items-center gap-2 transition"
      >

        <HiOutlineClipboardList />

        View Info
      </button>
    </>
  );
}