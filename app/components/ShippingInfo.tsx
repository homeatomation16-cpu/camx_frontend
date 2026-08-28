"use client";

import { useState, useEffect } from "react";
import { MdOutlineVerifiedUser, MdLocalShipping, MdStorefront, MdOutlineShield } from "react-icons/md";

// Database එකෙන් එන shippingOptions Props type එකට ගැලපෙන විදිහට define කරලා තියෙනවා
// (productOverview.tsx හි Product["shippingOptions"] සමග match වෙනවා)
type ShippingOptions = {
  priceMatch?: boolean;
  protectionPlan?: boolean;
  protectionFeePercentage?: number;
  freeDelivery?: boolean;
  deliveryDaysMin?: number;
  deliveryDaysMax?: number;
  pickupAvailable?: boolean;
  pickupTime?: string;
};

type Props = {
  price: number;
  inStock: boolean;
  shippingOptions?: ShippingOptions;
};

export default function ShippingInfo({ price, inStock, shippingOptions }: Props) {
  const [protect, setProtect] = useState(false);
  const [deliveryWindow, setDeliveryWindow] = useState("");

  // ✅ Admin විසින් product එකට හරියටම set කරලා තියෙනවද කියලා පමණක් check කරනවා
  // (Default true fallback දාන්නේ නෑ — data නැත්නම් ඒ section එක සම්පූර්ණයෙන්ම hide වෙනවා)
  const showPriceMatch = shippingOptions?.priceMatch === true;
  const showProtectionPlan = shippingOptions?.protectionPlan === true;
  const showPickup = shippingOptions?.pickupAvailable === true;

  const hasDeliveryDays = shippingOptions?.deliveryDaysMin != null && shippingOptions?.deliveryDaysMax != null;
  const isFreeDelivery = shippingOptions?.freeDelivery === true;
  // Delivery row එක පෙන්නන්නේ admin freeDelivery flag එක හෝ delivery days set කරලා තියෙනවනම් විතරයි
  const showDeliveryRow = shippingOptions?.freeDelivery !== undefined || hasDeliveryDays;

  // Protection Plan on කරලා තියෙනවනම් විතරක් fee % එක අවශ්‍යයි (default % එකක් තියෙනවා fallback එකක් විදිහට)
  const protectionFeePercentage = shippingOptions?.protectionFeePercentage ?? 0.06;
  const protectionCost = Math.max(299, Math.round(price * protectionFeePercentage));

  // Client-side Hydration error එක වළක්වා ගැනීමට useEffect ඇතුළේ Date එක හදමු
  useEffect(() => {
    let nextWindow = "";

    if (hasDeliveryDays) {
      const now = new Date();

      const start = new Date(now);
      start.setDate(now.getDate() + shippingOptions!.deliveryDaysMin!);

      const end = new Date(now);
      end.setDate(now.getDate() + shippingOptions!.deliveryDaysMax!);

      const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

      nextWindow = `${fmt(start)} - ${fmt(end)}`;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- date depends on client's current time; must run after mount to avoid hydration mismatch
    setDeliveryWindow(nextWindow);
  }, [hasDeliveryDays, shippingOptions]);

  const hasAnythingToShow = showPriceMatch || showProtectionPlan || showDeliveryRow || showPickup;

  // Admin කිසිම shipping option එකක් set කරලා නැත්නම්, whole block එකම hide කරමු
  if (!hasAnythingToShow) return null;

  return (
    <div className="space-y-2 border-y border-neutral-200 py-3 dark:border-white/10">
      {/* PRICE MATCH */}
      {showPriceMatch && (
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
          <MdOutlineVerifiedUser size={15} className="shrink-0 text-secondary" />
          Price Match Guarantee — found it cheaper? We&apos;ll match it.
        </div>
      )}

      {/* PROTECTION PLAN */}
      {showProtectionPlan && (
        <label className="flex cursor-pointer items-center gap-2 text-xs">
          <input type="checkbox" checked={protect} onChange={(e) => setProtect(e.target.checked)} className="h-3.5 w-3.5 shrink-0 accent-secondary" />
          <MdOutlineShield size={15} className="shrink-0 text-secondary" />
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">Protect This Product</span>
          <span className="ml-auto whitespace-nowrap font-black text-secondary">+LKR {protectionCost.toLocaleString()}</span>
        </label>
      )}

      {/* SHIPPING */}
      {showDeliveryRow && (
        <div className="flex items-center gap-2 text-xs">
          <MdLocalShipping size={15} className="shrink-0 text-secondary" />
          <span className={`font-bold ${isFreeDelivery ? "text-green-600 dark:text-green-400" : "text-neutral-700 dark:text-neutral-300"}`}>{isFreeDelivery ? "Free Delivery" : "Standard Delivery"}</span>
          <span className="text-neutral-500">— {inStock && deliveryWindow ? `est. ${deliveryWindow}` : "once back in stock"}</span>
        </div>
      )}

      {/* PICKUP */}
      {showPickup && (
        <div className="flex items-center gap-2 text-xs">
          <MdStorefront size={15} className="shrink-0 text-secondary" />
          <span className="font-bold text-neutral-700 dark:text-neutral-300">Store Pickup</span>
          <span className="text-neutral-500">— ready within {shippingOptions?.pickupTime || "24h at our Colombo showroom"}</span>
        </div>
      )}
    </div>
  );
}
