"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import { FaStar, FaRegStar, FaStarHalfAlt, FaCheckCircle, FaThumbsUp, FaRegThumbsUp } from "react-icons/fa";

import { MdVerified } from "react-icons/md";

export type Review = {
  _id: string;
  author: string;
  avatar?: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  helpful: number;
  images?: string[];
};

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        if (rating >= i) return <FaStar key={i} size={size} className="text-amber-400" />;

        if (rating >= i - 0.5) return <FaStarHalfAlt key={i} size={size} className="text-amber-400" />;

        return <FaRegStar key={i} size={size} className="text-neutral-300" />;
      })}
    </span>
  );
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-10 shrink-0 text-right text-neutral-500">{star} star</span>

      <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full bg-amber-400" />
      </div>

      <span className="w-8 shrink-0 text-neutral-500">{pct}%</span>
    </div>
  );
}

function ReviewForm({ onSubmit }: { onSubmit: (review: Omit<Review, "_id" | "helpful">) => void }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!rating || !title || !body || !author) return;

    onSubmit({
      author,
      rating,
      title,
      body,
      date: new Date().toISOString(),
      verified: false,
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3 rounded-3xl border bg-green-50 p-10 text-center dark:bg-green-950/20">
        <FaCheckCircle size={36} className="text-green-500" />

        <p className="text-lg font-bold">Review Submitted!</p>

        <p className="text-sm text-neutral-500">Thank you for sharing your experience.</p>
      </motion.div>
    );
  }

  return (
    <div className="rounded-3xl border bg-neutral-50 p-6 dark:bg-card">
      <h3 className="mb-5 text-base font-black">Write a Review</h3>

      <div className="mb-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-neutral-400">Your Rating</label>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(i)} className="transition-transform hover:scale-110">
              {(hovered || rating) >= i ? <FaStar size={28} className="text-amber-400" /> : <FaRegStar size={28} className="text-neutral-300" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-400">Your Name</label>

        <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="John Perera" className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-secondary dark:bg-neutral-900" />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-400">Review Title</label>

        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summarize your experience" className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-secondary dark:bg-neutral-900" />
      </div>

      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-400">Review</label>

        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What did you like or dislike?" rows={4} className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-secondary dark:bg-neutral-900" />
      </div>

      <button onClick={handleSubmit} disabled={!rating || !title || !body || !author} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
        Submit Review
      </button>
    </div>
  );
}

// මෙතනට onVoteHelpful prop එක එකතු කළා
function ReviewCard({ review, onVoteHelpful }: { review: Review; onVoteHelpful: (id: string) => void }) {
  const [liked, setLiked] = useState(false);

  const toggleHelpful = () => {
    // එක පාරක් click කළාට පස්සේ ආයේ click කරන්න බැරි වෙන්න
    if (liked) return;
    setLiked(true);
    // ProductOverview එකේ තියෙන function එක run කරනවා (මේකෙන් තමයි DB එකට යන්නේ)
    onVoteHelpful(review._id);
  };

  const initials = review.author
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border bg-white p-6 dark:bg-card">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {review.avatar ? <Image src={review.avatar} alt={review.author} width={40} height={40} className="h-10 w-10 rounded-full object-cover" /> : <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-sm font-black text-secondary">{initials}</div>}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{review.author}</span>

              {review.verified && (
                <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600 dark:bg-green-950/30">
                  <MdVerified size={10} />
                  Verified
                </span>
              )}
            </div>

            <span className="text-xs text-neutral-400">{new Date(review.date).toLocaleDateString()}</span>
          </div>
        </div>

        <StarDisplay rating={review.rating} size={13} />
      </div>

      <p className="mb-1 text-sm font-bold">{review.title}</p>

      <p className="mb-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{review.body}</p>

      <div className="flex items-center gap-2 border-t pt-3 text-xs text-neutral-400">
        <span>Helpful?</span>

        <button onClick={toggleHelpful} disabled={liked} className={`flex items-center gap-1.5 rounded-full border px-3 py-1 transition ${liked ? "border-secondary bg-secondary/5 text-secondary cursor-default" : "hover:border-neutral-300 cursor-pointer"}`}>
          {liked ? <FaThumbsUp size={11} /> : <FaRegThumbsUp size={11} />}
          {/* මෙතන review.helpful පාවිච්චි කරන්නේ DB එකෙන්/Parent එකෙන් එන අගයයි */}
          <span>{review.helpful || 0}</span>
        </button>
      </div>
    </motion.div>
  );
}

// ප්‍රධාන Component එකට onVoteHelpful prop එක එකතු කළා
export default function ProductReviews({ reviews, avgRating, onAddReview, onVoteHelpful }: { reviews: Review[]; avgRating: number; onAddReview: (r: Omit<Review, "_id" | "helpful">) => void; onVoteHelpful: (id: string) => void }) {
  const [filter, setFilter] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const total = reviews.length;

  const starCounts = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => Math.round(r.rating) === s).length,
  }));

  const filtered = reviews.filter((r) => (filter ? Math.round(r.rating) === filter : true));

  return (
    <div className="mt-20 border-t pt-14">
      <h2 className="mb-10 text-2xl font-black lg:text-3xl">Customer Reviews</h2>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-3xl border bg-neutral-50 p-6 dark:bg-card">
              <div className="mb-1 text-6xl font-black text-secondary">{avgRating.toFixed(1)}</div>

              <StarDisplay rating={avgRating} size={18} />

              <p className="mt-2 text-sm text-neutral-400">Based on {total} reviews</p>

              <div className="mt-5 space-y-2">
                {starCounts.map(({ star, count }) => (
                  <button key={star} onClick={() => setFilter((prev) => (prev === star ? null : star))} className="w-full">
                    <RatingBar star={star} count={count} total={total} />
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setShowForm((v) => !v)} className="w-full rounded-2xl border-2 border-secondary py-3 text-sm font-bold text-secondary transition hover:bg-secondary hover:text-white">
              {showForm ? "Cancel" : "Write a Review"}
            </button>

            <AnimatePresence>
              {showForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <ReviewForm
                    onSubmit={(r) => {
                      onAddReview(r);
                      setShowForm(false);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          {filtered.map((review) => (
            <ReviewCard key={review._id} review={review} onVoteHelpful={onVoteHelpful} />
          ))}
        </div>
      </div>
    </div>
  );
}
