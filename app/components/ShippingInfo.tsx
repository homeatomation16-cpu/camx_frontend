"use client";

import { useState } from "react";

import { MdOutlineVerifiedUser, MdLocalShipping, MdStorefront, MdOutlineShield } from "react-icons/md";

type Props = {
  price: number;

  inStock: boolean;
};

// Simple deterministic "delivery window" so it doesn't jump around on every render.
function getDeliveryWindow() {
  const now = new Date();

  const start = new Date(now);

  start.setDate(now.getDate() + 3);

  const end = new Date(now);

  end.setDate(now.getDate() + 6);

  const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return `${fmt(start)} - ${fmt(end)}`;
}

export default function ShippingInfo({ price, inStock }: Props) {
  const [protect, setProtect] = useState(false);

  const protectionCost = Math.max(299, Math.round(price * 0.06));

  const deliveryWindow = getDeliveryWindow();

  return (
    <div className="rounded-3xl border bg-neutral-50 p-5 dark:bg-card">
      {/* PRICE MATCH */}
      <div className="mb-4 flex items-center gap-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
        <MdOutlineVerifiedUser size={18} className="shrink-0 text-secondary" />
        Price Match Guarantee — found it cheaper? We'll match it.
      </div>

      <div className="mb-4 h-px w-full bg-neutral-200 dark:bg-white/10" />

      {/* PROTECTION PLAN */}
      <label className={`mb-4 flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition ${protect ? "border-secondary bg-secondary/5" : "border-neutral-200 dark:border-white/10"}`}>
        <input type="checkbox" checked={protect} onChange={(e) => setProtect(e.target.checked)} className="mt-1 h-4 w-4 accent-secondary" />

        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm font-bold">
            <MdOutlineShield size={16} className="text-secondary" />
            Protect This Product
          </div>

          <p className="mt-1 text-xs leading-relaxed text-neutral-500">2-year extended protection plan covering accidental damage & mechanical failure.</p>
        </div>

        <span className="whitespace-nowrap text-sm font-black text-secondary">+LKR {protectionCost.toLocaleString()}</span>
      </label>

      {/* SHIPPING */}
      <div className="mb-3 flex items-start gap-2.5">
        <MdLocalShipping size={18} className="mt-0.5 shrink-0 text-secondary" />

        <div className="text-sm">
          <span className="font-bold text-green-600 dark:text-green-400">Free Delivery</span>

          <span className="text-neutral-500"> — {inStock ? `estimated ${deliveryWindow}` : "once back in stock"}</span>
        </div>
      </div>

      {/* PICKUP */}
      <div className="flex items-start gap-2.5">
        <MdStorefront size={18} className="mt-0.5 shrink-0 text-secondary" />

        <div className="text-sm">
          <span className="font-bold">Store Pickup Available</span>

          <span className="text-neutral-500"> — ready within 24 hours at our Colombo showroom</span>
        </div>
      </div>
    </div>
  );
}
