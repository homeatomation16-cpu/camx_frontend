"use client";

import { useState } from "react";

import { FaQuoteLeft, FaStar } from "react-icons/fa";

import { Review } from "./ProductReviews";

type Props = {
  productName: string;

  description?: string;

  highlights?: string[];

  featuredReview?: Review;

  totalReviews: number;
};

export default function ProductDescriptionSection({ productName, description, highlights, featuredReview, totalReviews }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!description && (!highlights || highlights.length === 0)) return null;

  // Array.from eken emoji (surrogate pair) athara wenama katakaranne na —
  // .slice() use kalahot ehema characters athare kadala, "broken" glyph pennanawa.
  const chars = description ? Array.from(description) : [];

  const isLong = chars.length > 260;

  const shownText = expanded || !isLong ? description : `${chars.slice(0, 260).join("").trim()}...`;

  const shownHighlights = highlights?.slice(0, 6) || [];

  const remainingCount = (highlights?.length || 0) - shownHighlights.length;

  return (
    <section className="mt-14">
      <h2 className="mb-5 text-xl font-black lg:text-2xl">About {productName}</h2>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT: description + highlights */}
        <div className="rounded-3xl border bg-neutral-50 p-6 dark:bg-card lg:col-span-2">
          {description && (
            <>
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{shownText}</p>

              {isLong && (
                <button onClick={() => setExpanded(!expanded)} className="mt-2 text-xs font-bold uppercase tracking-wide text-secondary hover:underline">
                  {expanded ? "Show less" : "Keep reading"}
                </button>
              )}
            </>
          )}

          {shownHighlights.length > 0 && (
            <div className="mt-6">
              <div className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                {shownHighlights.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                    {item}
                  </div>
                ))}
              </div>

              {remainingCount > 0 && (
                <a href="#specifications" className="mt-4 inline-block text-xs font-bold uppercase tracking-wide text-secondary hover:underline">
                  +{remainingCount} more in full specifications
                </a>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: featured review */}
        <div className="rounded-3xl border bg-neutral-50 p-6 dark:bg-card">
          <FaQuoteLeft className="mb-3 text-2xl text-secondary/30" />

          {featuredReview ? (
            <>
              <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-neutral-500">Featured Review</h3>

              <div className="mb-2 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar key={i} size={12} className={i < featuredReview.rating ? "text-amber-400" : "text-neutral-300"} />
                ))}
              </div>

              <p className="mb-3 text-sm italic leading-relaxed text-neutral-600 dark:text-neutral-400">&quot;{featuredReview.body}&quot;</p>

              <p className="text-xs font-bold">{featuredReview.author}</p>

              <a href="#reviews" className="mt-4 inline-block rounded-xl border border-secondary px-3.5 py-2 text-xs font-black text-secondary transition hover:bg-secondary hover:text-white">
                See all {totalReviews} reviews
              </a>
            </>
          ) : (
            <>
              <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-neutral-500">No reviews yet</h3>

              <p className="text-sm text-neutral-500">Be the first to share what you think about this product.</p>

              <a href="#reviews" className="mt-4 inline-block rounded-xl border border-secondary px-3.5 py-2 text-xs font-black text-secondary transition hover:bg-secondary hover:text-white">
                Write a review
              </a>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
