'use client';

import {
  useEffect,
  useState,
  useCallback,
} from "react";

import Image from "next/image";
import axios from "axios";

import {
  Star,
  ThumbsUp,
  ThumbsDown,
  BadgeCheck,
  Plus,
  X,
} from "lucide-react";

interface Review {
  _id: string;
  name: string;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  notHelpful: number;
  verified: boolean;
  images: string[];
  createdAt: string;
  adminReply?: string;
}

interface Props {
  productId: string;
}

const API = process.env.NEXT_PUBLIC_API_BASE;

export default function Reviews({
  productId,
}: Props) {
  const [reviews, setReviews] = useState<
    Review[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [openForm, setOpenForm] =
    useState(false);

  // FORM STATES
  const [name, setName] = useState("");
  const [title, setTitle] =
    useState("");

  const [comment, setComment] =
    useState("");

  const [rating, setRating] =
    useState(5);

  // =========================
  // FETCH REVIEWS
  // =========================

  const fetchReviews = useCallback(
    async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${API}/api/reviews/product/${productId}`
        );

        setReviews(
          response.data.reviews || []
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [productId]
  );

  // =========================
  // EFFECT
  // =========================

  useEffect(() => {
    queueMicrotask(() => {
      if (productId) {
        fetchReviews();
      }
    });
  }, [fetchReviews, productId]);

  // =========================
  // ADD REVIEW
  // =========================

  async function addReview() {
    try {
      if (
        !name ||
        !title ||
        !comment
      ) {
        return alert(
          "Please fill all fields"
        );
      }

      await axios.post(
        `${API}/api/reviews`,
        {
          productId,
          name,
          title,
          comment,
          rating,
          verified: true,
        }
      );

      // RESET
      setName("");
      setTitle("");
      setComment("");
      setRating(5);

      setOpenForm(false);

      fetchReviews();
    } catch (error) {
      console.error(error);
      alert("Failed to add review");
    }
  }

  // =========================
  // VOTE REVIEW
  // =========================

  async function voteReview(
    reviewId: string,
    type: "helpful" | "notHelpful"
  ) {
    try {
      await axios.patch(
        `${API}/api/reviews/vote/${reviewId}`,
        { type }
      );

      setReviews((prev) =>
        prev.map((review) =>
          review._id === reviewId
            ? {
                ...review,

                helpful:
                  type === "helpful"
                    ? review.helpful + 1
                    : review.helpful,

                notHelpful:
                  type === "notHelpful"
                    ? review.notHelpful + 1
                    : review.notHelpful,
              }
            : review
        )
      );
    } catch (error) {
      console.error(error);
    }
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-8">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                  h-56
                  rounded-3xl
                  bg-neutral-100
                  dark:bg-neutral-900
                  animate-pulse
                "
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // =========================
  // MAIN UI
  // =========================

  return (
    <section
      className="
        relative
        py-24
        bg-white
        dark:bg-black
        overflow-hidden
      "
    >
      {/* GLOW */}
      <div
        className="
          absolute
          top-0
          left-1/2
          -translate-x-1/2
          w-150
          h-150
          bg-secondary/10
          blur-3xl
          rounded-full
        "
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div
          className="
            flex
            flex-col
            md:flex-row
            items-start
            md:items-center
            justify-between
            gap-8
          "
        >
          <div className="max-w-3xl">
            <div
              className="
                inline-flex
                items-center
                px-5
                py-2
                rounded-full
                border
                border-secondary/20
                bg-secondary/5
                text-secondary
                text-xs
                font-black
                uppercase
                tracking-[0.3em]
                mb-6
              "
            >
              Customer Reviews
            </div>

            <h2
              className="
                text-4xl
                md:text-6xl
                font-black
                tracking-tight
                text-gray-900
                dark:text-white
              "
            >
              What Customers
              <span className="text-secondary">
                {" "}Say
              </span>
            </h2>
          </div>

          {/* ADD REVIEW BUTTON */}
          <button
            onClick={() =>
              setOpenForm(true)
            }
            className="
              flex
              items-center
              gap-3
              px-7
              py-4
              rounded-2xl
              bg-secondary
              text-white
              font-bold
              shadow-xl
              hover:scale-105
              transition-all
              duration-300
            "
          >
            <Plus size={20} />
            Add Review
          </button>
        </div>

        {/* FORM MODAL */}
        {openForm && (
          <div
            className="
              fixed
              inset-0
              z-500
              bg-black/70
              backdrop-blur-sm
              flex
              items-center
              justify-center
              p-6
            "
          >
            <div
              className="
                w-full
                max-w-2xl
                rounded-3xl
                bg-white
                dark:bg-neutral-950
                border
                border-black/10
                dark:border-white/10
                p-8
                shadow-2xl
              "
            >
              {/* TOP */}
              <div className="flex pt-4 items-center justify-between">
                <h3
                  className="
                    text-3xl
                    font-black
                    text-gray-900
                    dark:text-white
                  "
                >
                  Add Review
                </h3>

                <button
                  onClick={() =>
                    setOpenForm(false)
                  }
                  className="
                    p-2
                    rounded-xl
                    hover:bg-black/5
                    dark:hover:bg-white/10
                  "
                >
                  <X size={22} />
                </button>
              </div>

              {/* FORM */}
              <div className="mt-8 space-y-5">

                {/* NAME */}
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="
                    w-full
                    h-14
                    rounded-2xl
                    border
                    border-black/10
                    dark:border-white/10
                    bg-transparent
                    px-5
                    outline-none
                  "
                />

                {/* TITLE */}
                <input
                  type="text"
                  placeholder="Review Title"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  className="
                    w-full
                    h-14
                    rounded-2xl
                    border
                    border-black/10
                    dark:border-white/10
                    bg-transparent
                    px-5
                    outline-none
                  "
                />

                {/* RATING */}
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <button
                        key={star}
                        onClick={() =>
                          setRating(star)
                        }
                      >
                        <Star
                          className={
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      </button>
                    )
                  )}
                </div>

                {/* COMMENT */}
                <textarea
                  rows={5}
                  placeholder="Write your review..."
                  value={comment}
                  onChange={(e) =>
                    setComment(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-black/10
                    dark:border-white/10
                    bg-transparent
                    p-5
                    outline-none
                    resize-none
                  "
                />

                {/* SUBMIT */}
                <button
                  onClick={addReview}
                  className="
                    w-full
                    h-14
                    rounded-2xl
                    bg-secondary
                    text-white
                    font-bold
                    hover:opacity-90
                    transition-all
                    duration-300
                  "
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {reviews.length === 0 ? (
          <div className="mt-20 text-center">
            <h3
              className="
                text-3xl
                font-black
                text-gray-900
                dark:text-white
              "
            >
              No Reviews Yet
            </h3>

            <p
              className="
                mt-4
                text-gray-600
                dark:text-gray-400
              "
            >
              Be the first customer to review
              this product.
            </p>
          </div>
        ) : (
          <div
            className="
              mt-16
              grid
              grid-cols-1
              lg:grid-cols-2
              gap-8
            "
          >
            {reviews.map((review) => (
              <div
                key={review._id}
                className="
                  relative
                  rounded-3xl
                  border
                  border-black/5
                  dark:border-white/10
                  bg-white/70
                  dark:bg-white/5
                  backdrop-blur-2xl
                  p-8
                  shadow-lg
                "
              >
                {/* TOP */}
                <div className="flex justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3
                        className="
                          text-xl
                          font-bold
                          text-gray-900
                          dark:text-white
                        "
                      >
                        {review.name}
                      </h3>

                      {review.verified && (
                        <div
                          className="
                            flex
                            items-center
                            gap-1
                            text-green-600
                            text-sm
                          "
                        >
                          <BadgeCheck size={16} />
                          Verified
                        </div>
                      )}
                    </div>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-gray-500
                      "
                    >
                      {new Date(
                        review.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  {/* STARS */}
                  <div className="flex gap-1">
                    {[...Array(
                      review.rating
                    )].map((_, index) => (
                      <Star
                        key={index}
                        size={18}
                        className="
                          fill-yellow-400
                          text-yellow-400
                        "
                      />
                    ))}
                  </div>
                </div>

                {/* TITLE */}
                <h4
                  className="
                    mt-6
                    text-2xl
                    font-bold
                    text-gray-900
                    dark:text-white
                  "
                >
                  {review.title}
                </h4>

                {/* COMMENT */}
                <p
                  className="
                    mt-4
                    text-gray-600
                    dark:text-gray-300
                    leading-8
                  "
                >
                  {review.comment}
                </p>

                {/* IMAGES */}
                {review.images?.length >
                  0 && (
                  <div className="mt-6 flex flex-wrap gap-4">
                    {review.images.map(
                      (image, index) => (
                        <div
                          key={index}
                          className="
                            relative
                            w-24
                            h-24
                            rounded-2xl
                            overflow-hidden
                          "
                        >
                          <Image
                            src={image}
                            alt="Review"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* ADMIN REPLY */}
                {review.adminReply && (
                  <div
                    className="
                      mt-6
                      rounded-2xl
                      bg-secondary/5
                      border
                      border-secondary/10
                      p-5
                    "
                  >
                    <p
                      className="
                        text-sm
                        font-bold
                        text-secondary
                      "
                    >
                      CAMX Response
                    </p>

                    <p
                      className="
                        mt-2
                        text-gray-700
                        dark:text-gray-300
                      "
                    >
                      {review.adminReply}
                    </p>
                  </div>
                )}

                {/* ACTIONS */}
                <div className="mt-8 flex gap-5">

                  {/* HELPFUL */}
                  <button
                    onClick={() =>
                      voteReview(
                        review._id,
                        "helpful"
                      )
                    }
                    className="
                      flex
                      items-center
                      gap-2
                      px-4
                      py-2
                      rounded-xl
                      bg-green-500/10
                      text-green-600
                    "
                  >
                    <ThumbsUp size={16} />
                    {review.helpful}
                  </button>

                  {/* NOT HELPFUL */}
                  <button
                    onClick={() =>
                      voteReview(
                        review._id,
                        "notHelpful"
                      )
                    }
                    className="
                      flex
                      items-center
                      gap-2
                      px-4
                      py-2
                      rounded-xl
                      bg-red-500/10
                      text-red-500
                    "
                  >
                    <ThumbsDown size={16} />
                    {review.notHelpful}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}