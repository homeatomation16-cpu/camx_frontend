"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaHeart, FaShoppingCart, FaTrash } from "react-icons/fa";

type WishlistItem = {
  _id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
};

export default function WishlistPage() {
  // Lazy Initialization: මුලින්ම LocalStorage පරීක්ෂා කිරීම
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedWishlist = localStorage.getItem("CAMX_WISHLIST");
        return storedWishlist ? JSON.parse(storedWishlist) : [];
      } catch (error) {
        console.log("Error loading wishlist:", error);
        return [];
      }
    }
    return [];
  });

  const [hydrated, setHydrated] = useState(false);

  // =========================
  // PREVENT HYDRATION ERROR
  // =========================
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  // =========================
  // REMOVE ITEM
  // =========================
  const removeWishlistItem = (id: string) => {
    const updatedWishlist = wishlist.filter((item) => item._id !== id);
    setWishlist(updatedWishlist);
    localStorage.setItem("CAMX_WISHLIST", JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event("storage"));
  };

  // =========================
  // LOADING
  // =========================
  if (!hydrated) {
    return (
      <main className="min-h-screen bg-background pt-28 pb-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="
                  h-96
                  animate-pulse
                  rounded-4xl
                  bg-neutral-200
                  dark:bg-white/5
                "
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-28 pb-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-10">
          <h1
            className="
              text-3xl
              lg:text-4xl
              font-black
              text-neutral-900
              dark:text-white
            "
          >
            My Wishlist
          </h1>

          <p
            className="
              mt-2
              text-neutral-500
              dark:text-neutral-400
            "
          >
            Save your favorite products for later.
          </p>
        </div>

        {/* EMPTY */}
        {!wishlist.length ? (
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              text-center
              rounded-4xl
              border
              border-neutral-200
              dark:border-border
              bg-white
              dark:bg-card
              py-20
              px-6
            "
          >
            {/* ICON */}
            <div
              className="
                flex
                items-center
                justify-center
                w-24
                h-24
                rounded-full
                bg-secondary/10
                text-secondary
                mb-6
              "
            >
              <FaHeart size={34} />
            </div>

            {/* TITLE */}
            <h2
              className="
                text-2xl
                font-black
                text-neutral-900
                dark:text-white
              "
            >
              Your wishlist is empty
            </h2>

            {/* DESCRIPTION */}
            <p
              className="
                mt-3
                max-w-md
                text-sm
                leading-relaxed
                text-neutral-500
                dark:text-neutral-400
              "
            >
              Browse products and save your favorite items to your wishlist for quick access later.
            </p>

            {/* BUTTON */}
            <Link
              href="/products"
              className="
                mt-8
                inline-flex
                items-center
                gap-3
                rounded-2xl
                bg-secondary
                px-6
                py-3
                text-sm
                font-black
                text-white
                transition
                hover:scale-[1.02]
                hover:opacity-90
              "
            >
              <FaShoppingCart size={14} />
              Continue Shopping
            </Link>
          </div>
        ) : (
          // PRODUCTS GRID
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlist.map((item) => (
              <div
                key={item._id}
                className="
                  group
                  overflow-hidden
                  rounded-4xl
                  border
                  border-neutral-200
                  dark:border-border
                  bg-white
                  dark:bg-card
                "
              >
                {/* IMAGE */}
                <Link
                  href={`/products/${item._id}`}
                  className="
                    relative
                    block
                    h-72
                    overflow-hidden
                    bg-neutral-50
                    dark:bg-white/5
                  "
                >
                  <Image
                    src={item.image || "/placeholder.jpg"}
                    alt={item.name}
                    fill
                    unoptimized
                    className="
                      object-contain
                      p-6
                      transition-transform
                      duration-500
                      group-hover:scale-105
                    "
                  />
                </Link>

                {/* CONTENT */}
                <div className="p-5">
                  {/* CATEGORY */}
                  {item.category && (
                    <span
                      className="
                        inline-block
                        rounded-full
                        bg-secondary/10
                        px-3
                        py-1
                        text-[10px]
                        font-black
                        uppercase
                        tracking-wide
                        text-secondary
                      "
                    >
                      {item.category}
                    </span>
                  )}

                  {/* NAME */}
                  <Link href={`/products/${item._id}`}>
                    <h2
                      className="
                        mt-3
                        line-clamp-2
                        text-lg
                        font-black
                        text-neutral-900
                        transition
                        hover:text-secondary
                        dark:text-white
                      "
                    >
                      {item.name}
                    </h2>
                  </Link>

                  {/* PRICE */}
                  <p
                    className="
                      mt-3
                      text-xl
                      font-black
                      text-secondary
                    "
                  >
                    LKR {Number(item.price || 0).toLocaleString()}
                  </p>

                  {/* ACTIONS */}
                  <div className="mt-5 flex gap-3">
                    {/* VIEW */}
                    <Link
                      href={`/products/${item._id}`}
                      className="
                        flex-1
                        rounded-2xl
                        bg-secondary
                        px-4
                        py-3
                        text-center
                        text-sm
                        font-black
                        text-white
                        transition
                        hover:opacity-90
                      "
                    >
                      View Product
                    </Link>

                    {/* REMOVE */}
                    <button
                      onClick={() => removeWishlistItem(item._id)}
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-red-200
                        text-red-500
                        transition
                        hover:bg-red-50
                        dark:border-red-900/30
                        dark:hover:bg-red-900/10
                      "
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
