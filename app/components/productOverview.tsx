"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { FaMinus, FaPlus, FaShoppingCart, FaCheckCircle } from "react-icons/fa";

import {
  MdVerified,
  MdLocalShipping,
  MdSecurity,
  MdSwapHoriz,
} from "react-icons/md";

import { motion, AnimatePresence } from "framer-motion";
import { CgChevronRight } from "react-icons/cg";

import RelatedProducts from "./RelatedProducts";
import ProductReviews, { Review } from "./ProductReviews";
import Specifications from "./Specifications";

const API = process.env.NEXT_PUBLIC_API_BASE;

// ======================================
// TYPES
// ======================================

type SpecItem = {
  title: string;
  value: string;
  image?: string;
};

type Product = {
  _id: string;
  productId?: string;
  name: string;
  description?: string;
  price?: number;
  labelPrice?: number;
  images?: string[];
  stock?: number;
  category?: string;
  specifications?: {
    featureData?: string;
  };
  reviews?: Review[];
  avgRating?: number;
  totalReviews?: number;
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
  id: string;
};

// ======================================
// HELPERS
// ======================================

const safeImage = (image?: string) => {
  if (image && !image.includes("example.com")) return image;
  return "/placeholder.jpg";
};

// ======================================
// COMPONENT
// ======================================

export default function ProductOverview({ id }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [, setParsedSpecs] = useState<SpecItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [] = useState<"description" | "specs">("description");
  const [addedToCart, setAddedToCart] = useState(false);

  // ======================================
  // FETCH DATA
  // ======================================

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: current } = await axios.get(`${API}/api/products/${id}`);

        setProduct(current);

        setSelectedImage(current.images?.[0] || "/placeholder.jpg");

        if (current.specifications?.featureData) {
          try {
            const parsed = JSON.parse(current.specifications.featureData);

            setParsedSpecs(Array.isArray(parsed) ? parsed : []);
          } catch {
            setParsedSpecs([]);
          }
        }

        const { data: allProducts } = await axios.get(`${API}/api/products`);

        const productArray = allProducts.products || allProducts || [];

        const filtered = productArray
          .filter(
            (item: Product) =>
              item._id !== current._id && item.category === current.category,
          )
          .slice(0, 4);

        setRelatedProducts(filtered);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ======================================
  // ADD TO CART
  // ======================================

  const handleAddToCart = () => {
    if (!product) return;

    const storedCart = localStorage.getItem("CAMX_CART");

    const currentCart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

    const existingIndex = currentCart.findIndex(
      (item) => item._id === product._id,
    );

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += quantity;
    } else {
      currentCart.push({
        _id: product._id,
        productId: product.productId || "",
        name: product.name,
        price: product.price || 0,
        image: product.images?.[0] || "/placeholder.jpg",
        quantity,
        stock: product.stock,
      });
    }

    localStorage.setItem("CAMX_CART", JSON.stringify(currentCart));

    window.dispatchEvent(new Event("storage"));

    setAddedToCart(true);

    setTimeout(() => setAddedToCart(false), 2000);
  };

  // ======================================
  // ADD REVIEW
  // ======================================

  const handleAddReview = (reviewData: Omit<Review, "_id" | "helpful">) => {
    const newReview: Review = {
      ...reviewData,
      _id: `r_${Date.now()}`,
      helpful: 0,
    };

    setReviews((prev) => [newReview, ...prev]);
  };

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-transparent" />

          <p className="text-sm font-semibold text-neutral-400">
            Loading product...
          </p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center text-lg font-bold">
        Product Not Found
      </main>
    );
  }

  // ======================================
  // PRICE & STATS
  // ======================================

  const currentPrice = Number(product.price || 0);

  const oldPrice = Number(product.labelPrice || 0);

  const hasDiscount = oldPrice > currentPrice;

  const discountPct = hasDiscount
    ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
    : 0;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  // ======================================
  // UI
  // ======================================

  return (
    <main className="min-h-screen bg-background pb-24 pt-24 text-neutral-900 dark:text-white">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-16">
        {/* BREADCRUMB */}
        <div className="mb-8 flex items-center gap-2 text-xs text-neutral-500 lg:text-sm">
          <Link href="/" className="transition hover:text-secondary">
            Home
          </Link>

          <CgChevronRight />

          <Link href="/products" className="transition hover:text-secondary">
            Products
          </Link>

          <CgChevronRight />

          <Link
            href={`/products?category=${product.category}`}
            className="transition hover:text-secondary"
          >
            {product.category}
          </Link>

          <CgChevronRight />

          <span className="line-clamp-1 font-semibold text-neutral-800 dark:text-white">
            {product.name}
          </span>
        </div>

        {/* MAIN GRID */}
        <div className="grid gap-10 lg:grid-cols-2">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="group relative h-105 overflow-hidden rounded-3xl border bg-neutral-50 dark:bg-white/5 lg:h-137.5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={safeImage(selectedImage)}
                    alt={product.name}
                    fill
                    className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {hasDiscount && (
                <div className="absolute left-4 top-4 rounded-2xl bg-secondary px-3 py-1.5 text-xs font-black text-white shadow-lg">
                  -{discountPct}% OFF
                </div>
              )}
            </div>

            {/* THUMBNAILS */}
            <div className="mt-4 flex flex-wrap gap-3">
              {product.images?.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`relative h-16 w-16 overflow-hidden rounded-2xl border-2 transition lg:h-20 lg:w-20 ${
                    selectedImage === img
                      ? "border-secondary shadow-md"
                      : "border-transparent hover:border-neutral-300"
                  }`}
                >
                  <Image
                    src={safeImage(img)}
                    alt={`View ${i + 1}`}
                    fill
                    className="rounded-2xl object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="mb-3 inline-block w-fit rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
              {product.category}
            </span>

            <h1 className="mb-3 text-2xl font-black leading-tight lg:text-4xl">
              {product.name}
            </h1>

            <div className="mb-6 rounded-3xl border bg-neutral-50 p-5 dark:bg-card">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-black text-secondary lg:text-4xl">
                  LKR {currentPrice.toLocaleString()}
                </span>

                {hasDiscount && (
                  <>
                    <span className="text-base text-neutral-400 line-through lg:text-lg">
                      LKR {oldPrice.toLocaleString()}
                    </span>

                    <span className="rounded-xl bg-green-100 px-2.5 py-1 text-xs font-black text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Save LKR {(oldPrice - currentPrice).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* QUANTITY */}
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-13 items-center gap-2 rounded-2xl border bg-neutral-100 px-4 dark:bg-white/5">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="transition hover:text-secondary"
                >
                  <FaMinus size={11} />
                </button>

                <span className="w-8 text-center text-sm font-black">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity(Math.min(quantity + 1, product.stock ?? 99))
                  }
                  className="transition hover:text-secondary"
                >
                  <FaPlus size={11} />
                </button>
              </div>

              <motion.button
                onClick={handleAddToCart}
                whileTap={{ scale: 0.97 }}
                className="flex h-13 flex-1 items-center justify-center gap-3 rounded-2xl bg-secondary text-sm font-black text-white transition hover:opacity-90"
              >
                {addedToCart ? (
                  <>
                    <FaCheckCircle size={15} />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <FaShoppingCart size={15} />
                    Add to Cart
                  </>
                )}
              </motion.button>
            </div>

            {/* BADGES */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  icon: <MdSecurity size={20} className="text-secondary" />,
                  label: "Warranty Included",
                },
                {
                  icon: (
                    <MdLocalShipping size={20} className="text-secondary" />
                  ),
                  label: "Island-Wide Delivery",
                },
                {
                  icon: <MdSwapHoriz size={20} className="text-secondary" />,
                  label: "Easy Returns",
                },
                {
                  icon: <MdVerified size={20} className="text-secondary" />,
                  label: "Genuine Product",
                },
              ].map(({ icon, label }, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1.5 rounded-2xl border bg-neutral-50 px-3 py-3 text-center dark:bg-card"
                >
                  {icon}

                  <span className="text-[11px] font-semibold leading-tight text-neutral-500">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <Specifications specifications={product.specifications} />

        {/* REVIEWS */}
        <div id="reviews">
          <ProductReviews
            reviews={reviews}
            avgRating={avgRating}
            onAddReview={handleAddReview}
          />
        </div>

        {/* RELATED */}
        <RelatedProducts products={relatedProducts} />
      </div>
    </main>
  );
}
