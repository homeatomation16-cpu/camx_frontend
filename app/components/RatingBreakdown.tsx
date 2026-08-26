"use client";

import { FaStar } from "react-icons/fa";

import { Review } from "./ProductReviews";

type Props = {
  reviews: Review[];

  avgRating: number;
};

export default function RatingBreakdown({ reviews, avgRating }: Props) {
  const total = reviews.length;

  const counts = [5, 4, 3, 2, 1].map((star) => reviews.filter((r) => Math.round(r.rating) === star).length);

  const recommendPct = total > 0 ? Math.round((reviews.filter((r) => r.rating >= 4).length / total) * 100) : 0;

  return (
    <div className="grid gap-6 rounded-3xl border bg-neutral-50 p-6 dark:bg-card lg:grid-cols-2">
      {/* SCORE */}
      <div className="flex flex-col justify-center rounded-2xl bg-secondary/10 p-6 text-center">
        <span className="text-5xl font-black text-secondary">{avgRating.toFixed(1)}</span>

        <div className="mt-2 flex justify-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <FaStar key={i} size={16} className={i < Math.round(avgRating) ? "text-amber-400" : "text-neutral-300"} />
          ))}
        </div>

        <span className="mt-2 text-sm font-semibold text-neutral-500">{total} Reviews</span>

        {total > 0 && (
          <span className="mt-4 text-sm font-black text-green-600 dark:text-green-400">
            {recommendPct}% <span className="font-semibold text-neutral-500">of customers recommend this product</span>
          </span>
        )}
      </div>

      {/* BREAKDOWN BARS */}
      <div className="flex flex-col justify-center gap-2.5">
        {[5, 4, 3, 2, 1].map((star, i) => {
          const pct = total > 0 ? (counts[i] / total) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-3 text-xs font-bold">
              <span className="w-14 shrink-0 text-neutral-500">{star} stars</span>

              <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
                <div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${pct}%` }} />
              </div>

              <span className="w-8 shrink-0 text-right text-neutral-500">{counts[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
