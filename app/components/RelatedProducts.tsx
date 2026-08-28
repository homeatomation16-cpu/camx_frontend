"use client";

import Link from "next/link";
import Image from "next/image";

import { FaStar } from "react-icons/fa";

// ======================================
// TYPES
// ======================================

type Product = {
  _id: string;

  productId?: string;

  name: string;

  price?: number;

  labelPrice?: number;

  images?: string[];

  avgRating?: number;

  totalReviews?: number;
};

type Props = {
  products: Product[];
};

// ======================================
// COMPONENT
// ======================================

export default function RelatedProducts({ products }: Props) {
  // ======================================
  // SAFE IMAGE
  // ======================================

  const safeImage = (image?: string) => {
    if (image && !image.includes("example.com")) {
      return image;
    }

    return "/placeholder.jpg";
  };

  // ======================================
  // EMPTY
  // ======================================

  if (products.length === 0) {
    return null;
  }

  // ======================================
  // UI
  // ======================================

  return (
    <div className="mt-20 border-t pt-14">
      {/* TITLE */}
      <h2 className="mb-6 text-2xl font-black lg:text-3xl">Related Products</h2>

      {/* GRID */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((item) => {
          const currentPrice = Number(item.price || 0);

          const oldPrice = Number(item.labelPrice || 0);

          const hasDiscount = oldPrice > currentPrice;

          const discountPct = hasDiscount ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : 0;

          const rating = item.avgRating || 0;

          const reviewCount = item.totalReviews || 0;

          return (
            <Link
              key={item._id}
              href={`/products/${item.productId || item._id}`}
              className="
                group
                relative
                rounded-3xl
                border
                bg-white
                p-4
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-xl
                dark:bg-card
              "
            >
              {/* IMAGE */}
              <div className="relative mb-4 h-44 w-full overflow-hidden rounded-2xl bg-neutral-50 dark:bg-neutral-900">
                {hasDiscount && <span className="absolute left-2.5 top-2.5 z-10 rounded-lg bg-secondary px-2 py-0.5 text-[10px] font-black text-white shadow">-{discountPct}%</span>}

                <Image
                  src={safeImage(item.images?.[0])}
                  alt={item.name}
                  fill
                  unoptimized
                  loading="lazy"
                  sizes="
                    (max-width: 768px) 100vw,
                    (max-width: 1200px) 50vw,
                    25vw
                  "
                  className="
                    object-contain
                    transition-transform
                    duration-300
                    group-hover:scale-105
                  "
                />
              </div>

              {/* NAME */}
              <h3
                className="
                  mb-1.5
                  line-clamp-2
                  text-sm
                  font-bold
                  transition-colors
                  duration-300
                  group-hover:text-secondary
                  lg:text-base
                "
              >
                {item.name}
              </h3>

              {/* RATING */}
              <div className="mb-2 flex items-center gap-1.5">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar key={i} size={11} className={i < Math.round(rating) ? "text-amber-400" : "text-neutral-200 dark:text-neutral-700"} />
                  ))}
                </div>

                <span className="text-[11px] font-semibold text-neutral-400">{reviewCount > 0 ? `(${reviewCount})` : "No reviews"}</span>
              </div>

              {/* PRICE */}
              <div className="flex flex-wrap items-baseline gap-1.5">
                <p
                  className="
                    text-lg
                    font-black
                    text-secondary
                  "
                >
                  LKR {currentPrice.toLocaleString()}
                </p>

                {hasDiscount && <span className="text-xs text-neutral-400 line-through">LKR {oldPrice.toLocaleString()}</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
