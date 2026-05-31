"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaShoppingCart, FaEye } from "react-icons/fa";
import { MdLocalShipping } from "react-icons/md";

type Product = {
  _id: string;
  productId?: string;
  name: string;
  price: number;
  labelPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  description?: string;
  stock?: number;
  brand?: string;
  rating?: number;
};

type Props = {
  product: Product;
  onAddToCart?: (product: Product) => void;
};

export default function ProductCard({ product, onAddToCart }: Props) {
  const [imgIndex, setImgIndex] = useState(0);
  const [cartAdded, setCartAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discount = product.labelPrice && product.labelPrice > product.price ? Math.round((1 - product.price / product.labelPrice) * 100) : null;

  const inStock = product.stock === undefined || product.stock > 0;

  const lowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 5;

  const hasMultipleImages = product.images?.length > 1;

  const href = `/products/${product.productId || product._id}`;

  const safeImg = (src?: string) => (src && !src.includes("example.com") ? src : "/placeholder.jpg");

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock) return;

    onAddToCart?.(product);

    setCartAdded(true);

    setTimeout(() => {
      setCartAdded(false);
    }, 1800);
  };

  const handleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    e.stopPropagation();

    // GET EXISTING
    const storedWishlist = localStorage.getItem("CAMX_WISHLIST");

    const wishlist = storedWishlist ? JSON.parse(storedWishlist) : [];

    // CHECK EXISTS
    const exists = wishlist.find((item: { _id: string }) => item._id === product._id);

    let updatedWishlist = [];

    if (exists) {
      // REMOVE
      updatedWishlist = wishlist.filter((item: { _id: string }) => item._id !== product._id);

      setIsWishlisted(false);
    } else {
      // ADD
      updatedWishlist = [
        ...wishlist,
        {
          _id: product._id,

          name: product.name,

          price: product.price,

          image: product.images?.[0] || "/placeholder.jpg",

          category: product.category,
        },
      ];

      setIsWishlisted(true);
    }

    // SAVE
    localStorage.setItem("CAMX_WISHLIST", JSON.stringify(updatedWishlist));

    // UPDATE OTHER COMPONENTS
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-border dark:bg-card"
      style={{
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      {/* IMAGE */}
      <Link href={href} className="relative block h-52 overflow-hidden bg-neutral-50 dark:bg-neutral-900 sm:h-60">
        <AnimatePresence mode="wait">
          <motion.div key={imgIndex} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="absolute inset-0">
            <Image
              src={safeImg(product.images?.[imgIndex])}
              alt={product.name}
              fill
              unoptimized
              loading="lazy"
              sizes="
    (max-width: 768px) 100vw,
    (max-width: 1200px) 50vw,
    33vw
  "
              className="
    object-cover
    transition-transform
    duration-500
    group-hover:scale-[1.06]
  "
            />
          </motion.div>
        </AnimatePresence>

        {/* OVERLAY */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/10 group-hover:opacity-100">
          {/* VIEW BUTTON */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-lg transition hover:scale-110 hover:bg-secondary hover:text-white"
          >
            <FaEye size={14} />
          </button>

          {/* CART BUTTON */}
          <button type="button" onClick={handleAddToCart} disabled={!inStock} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-lg transition hover:scale-110 hover:bg-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
            <FaShoppingCart size={13} />
          </button>
        </div>

        {/* WISHLIST */}
        <button type="button" onClick={handleWishlist} className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:scale-110 dark:bg-black/60">
          <motion.svg
            viewBox="0 0 24 24"
            width={15}
            height={15}
            animate={{
              scale: isWishlisted ? [1, 1.35, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={isWishlisted ? "#ef4444" : "none"} stroke={isWishlisted ? "#ef4444" : "#9ca3af"} strokeWidth={1.8} />
          </motion.svg>
        </button>

        {/* DISCOUNT */}
        {discount && <div className="absolute left-3 top-3 rounded-lg bg-secondary px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">-{discount}%</div>}

        {/* OUT OF STOCK */}
        {!inStock && (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-black/50 py-2 backdrop-blur-sm">
            <span className="text-[11px] font-bold uppercase tracking-widest text-white">Out of Stock</span>
          </div>
        )}

        {/* IMAGE DOTS */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {product.images.slice(0, 4).map((_, i) => (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setImgIndex(i)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setImgIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all ${imgIndex === i ? "w-4 bg-white" : "w-1.5 bg-white/60"}`}
              />
            ))}
          </div>
        )}
      </Link>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-4">
        {/* BRAND */}
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-secondary">{product.brand || "CAMX"}</span>

          {product.rating && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-500">
              <FaStar size={10} />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* NAME */}
        <Link href={href}>
          <h3 className="line-clamp-2 min-h-10 text-[13px] font-semibold leading-5 text-neutral-800 transition hover:text-secondary dark:text-white">{product.name}</h3>
        </Link>

        {/* PRICE */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-base font-black text-secondary">Rs {product.price.toLocaleString()}</span>

          {product.labelPrice && product.labelPrice > product.price && <span className="text-xs text-neutral-400 line-through">Rs {product.labelPrice.toLocaleString()}</span>}
        </div>

        {/* STOCK */}
        <div className="mt-1.5 flex items-center gap-1.5">
          {inStock ? (
            <>
              <div className={`h-1.5 w-1.5 rounded-full ${lowStock ? "bg-amber-400" : "bg-green-400"}`} />

              <span className={`text-[11px] font-medium ${lowStock ? "text-amber-500" : "text-green-500"}`}>{lowStock ? `Only ${product.stock} left` : "In Stock"}</span>
            </>
          ) : (
            <>
              <div className="h-1.5 w-1.5 rounded-full bg-red-400" />

              <span className="text-[11px] font-medium text-red-400">Out of stock</span>
            </>
          )}
        </div>

        {/* DELIVERY */}
        <div className="mt-2 flex items-center gap-1 text-[10px] text-neutral-400">
          <MdLocalShipping size={12} />
          <span>Island-wide delivery available</span>
        </div>

        <div className="flex-1" />

        {/* ADD TO CART */}
        <motion.button type="button" onClick={handleAddToCart} disabled={!inStock} whileTap={{ scale: 0.97 }} className={`relative mt-4 flex h-10 w-full items-center justify-center gap-2 overflow-hidden rounded-xl text-[13px] font-bold text-white transition-all duration-300 ${inStock ? "bg-secondary hover:opacity-90" : "cursor-not-allowed bg-neutral-300 dark:bg-neutral-700"}`}>
          <AnimatePresence mode="wait">
            {cartAdded ? (
              <motion.span key="done" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Added!
              </motion.span>
            ) : (
              <motion.span key="add" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} className="flex items-center gap-2">
                <FaShoppingCart size={12} />
                {inStock ? "Add to Cart" : "Unavailable"}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}
