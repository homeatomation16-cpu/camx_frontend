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
  reviews?: number;
};

type CartItem = {
  _id: string;
  productId?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number;
};

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const [imgIndex] = useState(0);
  const [cartAdded, setCartAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // =========================
  // CALCULATIONS
  // =========================
  const discount = product.labelPrice && product.labelPrice > product.price ? Math.round((1 - product.price / product.labelPrice) * 100) : null;

  const inStock = product.stock === undefined || product.stock > 0;
  const lowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 5;
  const href = `/products/${product.productId || product._id}`;

  // =========================
  // SAFE IMAGE
  // =========================
  const safeImg = (src?: string) => (src && !src.includes("example.com") ? src : "/placeholder.jpg");

  // =========================
  // ADD TO CART
  // =========================
  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      if (!product?._id) {
        alert("Product not found");
        return;
      }

      const storedCart = localStorage.getItem("CAMX_CART");
      const currentCart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];
      const existingIndex = currentCart.findIndex((item) => item._id === product._id);

      if (existingIndex > -1) {
        currentCart[existingIndex].quantity += 1;
      } else {
        currentCart.push({
          _id: product._id,
          productId: product.productId || "",
          name: product.name,
          price: Number(product.price) || 0,
          image: product.images?.[0] || "/placeholder.jpg",
          quantity: 1,
          stock: product.stock || 0,
        });
      }

      localStorage.setItem("CAMX_CART", JSON.stringify(currentCart));
      window.dispatchEvent(new Event("storage"));

      setCartAdded(true);
      setTimeout(() => {
        setCartAdded(false);
      }, 2000);
    } catch (error) {
      console.log(error);
      alert("Failed to add cart");
    }
  };

  // =========================
  // WISHLIST
  // =========================
  const handleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const storedWishlist = localStorage.getItem("CAMX_WISHLIST");
    const wishlist = storedWishlist ? JSON.parse(storedWishlist) : [];
    const exists = wishlist.find((item: { _id: string }) => item._id === product._id);

    let updatedWishlist = [];

    if (exists) {
      updatedWishlist = wishlist.filter((item: { _id: string }) => item._id !== product._id);
      setIsWishlisted(false);
    } else {
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

    localStorage.setItem("CAMX_WISHLIST", JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="
        group
        relative
        flex
        flex-col
        overflow-hidden
        rounded-lg
        border
        border-neutral-200
        bg-white
        dark:border-border
        dark:bg-card
      "
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
    >
      {/* IMAGE */}
      <Link
        href={href}
        className="
          relative
          block
          h-36
          overflow-hidden
          bg-neutral-50
          dark:bg-neutral-900
          sm:h-44
        "
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={imgIndex}
            initial={{
              opacity: 0,
              scale: 1.03,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
            }}
            className="absolute inset-0"
          >
            <Image
              src={safeImg(product.images?.[imgIndex])}
              alt={product.name}
              fill
              unoptimized
              priority={imgIndex === 0}
              loading={imgIndex === 0 ? "eager" : "lazy"}
              sizes="
        (max-width: 768px) 100vw,
        (max-width: 1200px) 50vw,
        33vw
      "
              className="
        object-cover
        transition-transform
        duration-500
        group-hover:scale-105
      "
            />
          </motion.div>
        </AnimatePresence>

        {/* OVERLAY */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/10 group-hover:opacity-100">
          {/* VIEW */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-neutral-700 shadow-md transition hover:scale-110 hover:bg-secondary hover:text-white"
          >
            <FaEye size={11} />
          </button>

          {/* CART */}
          <button type="button" onClick={handleAddToCart} disabled={!inStock} className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-neutral-700 shadow-md transition hover:scale-110 hover:bg-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
            <FaShoppingCart size={10} />
          </button>
        </div>

        {/* WISHLIST */}
        <button type="button" onClick={handleWishlist} className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110 dark:bg-black/60">
          <motion.svg viewBox="0 0 24 24" width={12} height={12} animate={{ scale: isWishlisted ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={isWishlisted ? "#ef4444" : "none"} stroke={isWishlisted ? "#ef4444" : "#9ca3af"} strokeWidth={2} />
          </motion.svg>
        </button>

        {/* DISCOUNT */}
        {discount && <div className="absolute left-2 top-2 rounded bg-secondary px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-white shadow-sm">-{discount}%</div>}
      </Link>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-4">
        {/* BRAND */}
        <div className="mb-1.5 flex items-center justify-between">
          <span
            className="
              text-[10px]
              font-black
              uppercase
              tracking-widest
              text-secondary
            "
          >
            {product.brand || "CAMX"}
          </span>

          {product.rating && (
            <span
              className="
                flex
                items-center
                gap-1
                text-[11px]
                font-semibold
                text-amber-500
              "
            >
              <FaStar size={10} />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* NAME */}
        <Link href={href}>
          <h3 className="line-clamp-2 min-h-7 text-[11px] font-semibold leading-4 text-neutral-800 transition hover:text-secondary dark:text-white">{product.name}</h3>
        </Link>

        {/* PRICE */}
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-[13px] font-black text-secondary">Rs {product.price.toLocaleString()}</span>
          {product.labelPrice && product.labelPrice > product.price && <span className="text-[10px] text-neutral-400 line-through">Rs {product.labelPrice.toLocaleString()}</span>}
        </div>

        {/* STOCK */}
        <div className="mt-1 flex items-center gap-1">
          {inStock ? (
            <>
              <div className={`h-1.5 w-1.5 rounded-full ${lowStock ? "bg-amber-400" : "bg-green-400"}`} />
              <span className={`text-[9px] font-medium ${lowStock ? "text-amber-500" : "text-green-500"}`}>{lowStock ? `Only ${product.stock} left` : "In Stock"}</span>
            </>
          ) : (
            <>
              <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
              <span className="text-[9px] font-medium text-red-400">Out of stock</span>
            </>
          )}
        </div>

        {/* DELIVERY */}
        <div className="mt-1 flex items-center gap-1 text-[8px] text-neutral-400">
          <MdLocalShipping size={10} />
          <span>Island-wide delivery</span>
        </div>

        <div className="flex-1" />

        {/* BUTTON */}
        <motion.button type="button" onClick={handleAddToCart} disabled={!inStock} whileTap={{ scale: 0.97 }} className={`relative mt-2 flex h-8 w-full items-center justify-center gap-1.5 overflow-hidden rounded-md text-[11px] font-bold text-white transition-all duration-300 ${inStock ? "bg-secondary hover:opacity-90" : "cursor-not-allowed bg-neutral-300 dark:bg-neutral-700"}`}>
          <AnimatePresence mode="wait">
            {cartAdded ? (
              <motion.span key="done" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-1">
                <svg viewBox="0 0 24 24" width={11} height={11} fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Added!
              </motion.span>
            ) : (
              <motion.span key="add" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-1">
                <FaShoppingCart size={10} />
                {inStock ? "Add to Cart" : "Unavailable"}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}
