"use client";

import Image from "next/image";

import { useState } from "react";

import Modal from "react-modal";

import {
  HiOutlineX,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineShoppingBag,
  HiOutlineCalendar,
} from "react-icons/hi";

import { MdOutlinePendingActions } from "react-icons/md";

import { FiEdit3 } from "react-icons/fi";

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

  date?: string;

  createdAt?: string;

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

  const [
    isModalOpen,
    setIsModalOpen,
  ] = useState(false);

  if (!order) return null;

  // ======================================
  // HELPERS
  // ======================================

  const formatDateTime = (
    value?: string
  ) => {

    if (!value) {

      return "-";
    }

    return new Date(
      value
    ).toLocaleString();
  };

  const formatCurrency = (
    value: number
  ) => {

    return `Rs. ${Number(
      value || 0
    ).toFixed(2)}`;
  };

  const getStatusBadgeClasses = (
    status: string
  ) => {

    const s =
      status?.toLowerCase() ||
      "";

    return (
      {
        completed:
          "bg-emerald-100 text-emerald-800 border border-emerald-200",

        paid:
          "bg-emerald-100 text-emerald-800 border border-emerald-200",

        cancelled:
          "bg-red-100 text-red-800 border border-red-200",

        processing:
          "bg-blue-100 text-blue-800 border border-blue-200",

        pending:
          "bg-yellow-100 text-yellow-800 border border-yellow-200",

      }[s] ||
      "bg-gray-100 text-gray-800 border border-gray-200"
    );
  };

  // ======================================
  // UI
  // ======================================

  return (
    <>
      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() =>
          setIsModalOpen(false)
        }
        ariaHideApp={false}
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        className="w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl outline-none overflow-hidden border border-neutral-200 dark:border-white/10"
      >

        <div className="flex flex-col max-h-[90vh]">

          {/* HEADER */}
          <div className="flex items-start justify-between border-b border-neutral-200 dark:border-white/10 px-6 py-5">

            <div>

              <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">

                <HiOutlineClipboardList className="text-blue-600" />

                Order Details
              </h2>

              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">

                Review your order information
              </p>
            </div>

            <button
              onClick={() =>
                setIsModalOpen(false)
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/10 transition"
            >

              <HiOutlineX className="text-xl" />
            </button>
          </div>

          {/* BODY */}
          <div className="px-6 py-5 space-y-6 overflow-y-auto">

            {/* SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* LEFT */}
              <div className="space-y-4">

                {/* ORDER ID */}
                <div>

                  <p className="text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400">

                    Order ID
                  </p>

                  <p className="text-sm font-semibold text-neutral-900 dark:text-white break-all">

                    {order.orderId}
                  </p>
                </div>

                {/* CUSTOMER */}
                <div className="flex items-start gap-3">

                  <HiOutlineUser className="text-neutral-500 dark:text-neutral-400 mt-1" />

                  <div>

                    <p className="text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400">

                      Customer Name
                    </p>

                    <p className="text-sm text-neutral-900 dark:text-white">

                      {order.name}
                    </p>
                  </div>
                </div>

                {/* EMAIL */}
                <div className="flex items-start gap-3">

                  <HiOutlineMail className="text-neutral-500 dark:text-neutral-400 mt-1" />

                  <div>

                    <p className="text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400">

                      Email
                    </p>

                    <p className="text-sm text-neutral-900 dark:text-white break-all">

                      {order.email}
                    </p>
                  </div>
                </div>

                {/* PHONE */}
                {order.phone && (

                  <div className="flex items-start gap-3">

                    <HiOutlinePhone className="text-neutral-500 dark:text-neutral-400 mt-1" />

                    <div>

                      <p className="text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400">

                        Phone
                      </p>

                      <p className="text-sm text-neutral-900 dark:text-white">

                        {order.phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT */}
              <div className="space-y-4">

                {/* DATE */}
                <div className="flex items-start gap-3">

                  <HiOutlineCalendar className="text-neutral-500 dark:text-neutral-400 mt-1" />

                  <div>

                    <p className="text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400">

                      Order Date & Time
                    </p>

                    <p className="text-sm text-neutral-900 dark:text-white">

                      {formatDateTime(
                        order.date ||
                        order.createdAt ||
                        ""
                      )}
                    </p>
                  </div>
                </div>

                {/* STATUS */}
                <div className="flex items-start gap-3">

                  <MdOutlinePendingActions className="text-neutral-500 dark:text-neutral-400 mt-1" />

                  <div>

                    <p className="text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400">

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

                {/* TOTAL */}
                <div>

                  <p className="text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400">

                    Total Amount
                  </p>

                  <p className="text-xl font-black text-yellow-600">

                    {formatCurrency(
                      order.total
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* ADDRESS */}
            <div className="border border-neutral-200 dark:border-white/10 rounded-2xl p-4 bg-neutral-50 dark:bg-white/5">

              <p className="text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-2">

                <HiOutlineHome />

                Delivery Address
              </p>

              <p className="text-sm text-neutral-900 dark:text-white whitespace-pre-line">

                {order.address ||
                  "No address provided"}
              </p>
            </div>

            {/* NOTES */}
            <div className="border border-neutral-200 dark:border-white/10 rounded-2xl p-4 bg-neutral-50 dark:bg-white/5">

              <p className="text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-2">

                <FiEdit3 />

                Additional Notes
              </p>

              <textarea
                disabled
                value={
                  order.notes || ""
                }
                className="w-full text-sm bg-transparent outline-none resize-none text-neutral-900 dark:text-white min-h-20"
              />
            </div>

            {/* ITEMS */}
            <div className="border border-neutral-200 dark:border-white/10 rounded-2xl bg-white dark:bg-white/5 overflow-hidden">

              {/* TOP */}
              <div className="flex justify-between px-4 py-3 border-b border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5">

                <p className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">

                  <HiOutlineShoppingBag />

                  Items in this order
                </p>

                <p className="text-xs text-neutral-500 dark:text-neutral-400">

                  {order.items?.length || 0} item(s)
                </p>
              </div>

              {/* ITEMS */}
              {order.items?.length ? (

                <div className="max-h-72 overflow-y-auto divide-y divide-neutral-200 dark:divide-white/10">

                  {order.items.map(
                    (
                      item,
                      index
                    ) => {

                      const lineTotal =
                        (item.price || 0) *
                        (item.quantity || 0);

                      return (
                        <div
                          key={
                            item.productID +
                            index
                          }
                          className="flex items-center gap-4 px-4 py-4"
                        >

                          {/* IMAGE */}
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 dark:bg-white/5 shrink-0">

                            {item.image ? (

                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />

                            ) : (

                              <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                                No image
                              </div>
                            )}
                          </div>

                          {/* INFO */}
                          <div className="flex-1 min-w-0">

                            <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">

                              {item.name}
                            </p>

                            <p className="text-xs text-neutral-500 dark:text-neutral-400">

                              Product ID: {item.productID}
                            </p>

                            <p className="text-xs text-neutral-500 dark:text-neutral-400">

                              Qty: {item.quantity}
                              {" | "}
                              Unit: {formatCurrency(item.price)}
                            </p>
                          </div>

                          {/* TOTAL */}
                          <p className="text-sm font-bold text-neutral-900 dark:text-white whitespace-nowrap">

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

                <div className="px-4 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">

                  No items found
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 border-t border-neutral-200 dark:border-white/10 flex justify-between items-center">

            <div>

              <p className="text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400">

                Total Amount
              </p>

              <p className="text-lg font-black text-yellow-600">

                {formatCurrency(
                  order.total
                )}
              </p>
            </div>

            {/* CLOSE */}
            <button
              onClick={() =>
                setIsModalOpen(false)
              }
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition"
            >

              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* OPEN BUTTON */}
      <button
        onClick={() =>
          setIsModalOpen(true)
        }
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-sm flex items-center gap-2 transition"
      >

        <HiOutlineClipboardList />

        View Info
      </button>
    </>
  );
}