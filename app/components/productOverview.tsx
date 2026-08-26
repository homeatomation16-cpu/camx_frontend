"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { FaMinus, FaPlus, FaShoppingCart, FaCheckCircle } from "react-icons/fa";
import { MdVerified, MdLocalShipping, MdSecurity, MdSwapHoriz } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { CgChevronRight } from "react-icons/cg";

import RelatedProducts from "./RelatedProducts";
import ProductReviews, { Review } from "./ProductReviews";
import Specifications from "./Specifications";

const API = process.env.NEXT_PUBLIC_API_BASE;

// ======================================
// TYPES
// ======================================

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
  specifications?: { featureData?: string };
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

type Props = { id: string };

// ======================================
// HELPERS
// ======================================

const safeImage = (image?: string) => (image && !image.includes("example.com") ? image : "/placeholder.jpg");

// ======================================
// COMPONENT
// ======================================

export default function ProductOverview({ id }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
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

        try {
          const reviewRes = await axios.get(`${API}/api/reviews/product/${current._id}`);
          setReviews(
            (reviewRes.data.reviews || []).map((r: { _id: string; name: string; rating: number; title: string; comment: string; createdAt: string; verified: boolean; helpful: number }) => ({
              _id: r._id,
              author: r.name,
              rating: r.rating,
              title: r.title,
              body: r.comment,
              date: r.createdAt,
              verified: r.verified,
              helpful: r.helpful || 0,
            })),
          );
        } catch {}

        const { data: allProducts } = await axios.get(`${API}/api/products`);
        const arr = allProducts.products || allProducts || [];
        setRelatedProducts(arr.filter((i: Product) => i._id !== current._id && i.category === current.category).slice(0, 4));
      } catch (e) {
        console.log(e);
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
    const cart: CartItem[] = JSON.parse(localStorage.getItem("CAMX_CART") || "[]");
    const idx = cart.findIndex((i) => i._id === product._id);
    if (idx > -1) {
      cart[idx].quantity += quantity;
    } else {
      cart.push({
        _id: product._id,
        productId: product.productId || "",
        name: product.name,
        price: product.price || 0,
        image: product.images?.[0] || "/placeholder.jpg",
        quantity,
        stock: product.stock,
      });
    }
    localStorage.setItem("CAMX_CART", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // ======================================
  // ADD REVIEW
  // ======================================

  const handleAddReview = async (reviewData: Omit<Review, "_id" | "helpful">) => {
    if (!product?._id) return;
    try {
      const { data } = await axios.post(`${API}/api/reviews`, {
        productId: product._id,
        name: reviewData.author,
        title: reviewData.title,
        comment: reviewData.body,
        rating: reviewData.rating,
        verified: false,
      });
      const s = data.review;
      setReviews((prev) => [{ _id: s._id, author: s.name, rating: s.rating, title: s.title, body: s.comment, date: s.createdAt, verified: s.verified, helpful: s.helpful || 0 }, ...prev]);
    } catch (error) {
      if (axios.isAxiosError(error)) alert(error.response?.data?.message || "Failed to save review");
      else alert("An unexpected error occurred");
    }
  };

  // ======================================
  // VOTE HELPFUL
  // ======================================

  const handleVoteHelpful = async (reviewId: string) => {
    setReviews((prev) => prev.map((r) => (r._id === reviewId ? { ...r, helpful: (r.helpful || 0) + 1 } : r)));
    try {
      await axios.patch(`${API}/api/reviews/vote/${reviewId}`, { type: "helpful" });
    } catch {
      setReviews((prev) => prev.map((r) => (r._id === reviewId ? { ...r, helpful: Math.max(0, (r.helpful || 0) - 1) } : r)));
      alert("Failed to mark review as helpful.");
    }
  };

  // ======================================
  // LOADING / NOT FOUND
  // ======================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
          <p className="text-xs font-semibold text-neutral-400">Loading product...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return <main className="flex min-h-screen items-center justify-center text-lg font-bold">Product Not Found</main>;
  }

  // ======================================
  // PRICE & STATS
  // ======================================

  const currentPrice = Number(product.price || 0);
  const oldPrice = Number(product.labelPrice || 0);
  const hasDiscount = oldPrice > currentPrice;
  const discountPct = hasDiscount ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : 0;
  const avgRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

  // ======================================
  // UI
  // ======================================

  return (
    <main className="min-h-screen bg-background pb-16 pt-20 text-neutral-900 dark:text-white">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-16">
        {/* BREADCRUMB */}
        <nav className="mb-5 flex items-center gap-1.5 text-xs text-neutral-500">
          <Link href="/" className="transition hover:text-secondary">
            Home
          </Link>
          <CgChevronRight />
          <Link href="/products" className="transition hover:text-secondary">
            Products
          </Link>
          <CgChevronRight />
          <Link href={`/products?category=${product.category}`} className="transition hover:text-secondary">
            {product.category}
          </Link>
          <CgChevronRight />
          <span className="line-clamp-1 font-semibold text-neutral-800 dark:text-white">{product.name}</span>
        </nav>

        {/* MAIN GRID */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* LEFT — IMAGE */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            {/* Main image */}
            <div className="group relative h-80 overflow-hidden rounded-2xl border bg-neutral-50 dark:bg-white/5 lg:h-110">
              <AnimatePresence mode="wait">
                <motion.div key={selectedImage} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.2 }} className="absolute inset-0">
                  <Image src={safeImage(selectedImage)} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-6 transition-transform duration-500 group-hover:scale-105" priority unoptimized />
                </motion.div>
              </AnimatePresence>
              {hasDiscount && <div className="absolute left-3 top-3 rounded-xl bg-secondary px-2.5 py-1 text-[11px] font-black text-white shadow">-{discountPct}% OFF</div>}
            </div>

            {/* Thumbnails */}
            <div className="mt-3 flex flex-wrap gap-2">
              {product.images?.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(img)} className={`relative h-14 w-14 overflow-hidden rounded-xl border-2 transition ${selectedImage === img ? "border-secondary shadow-sm" : "border-transparent hover:border-neutral-300"}`}>
                  <Image src={safeImage(img)} alt={`View ${i + 1}`} fill sizes="56px" className="rounded-xl object-cover" unoptimized />
                </button>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — DETAILS */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
            {/* Category pill */}
            <span className="mb-2 inline-block w-fit rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary">{product.category}</span>

            {/* Name */}
            <h1 className="mb-2 text-xl font-black leading-tight lg:text-3xl">{product.name}</h1>

            {/* Description */}
            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">{product.description}</p>

            {/* Rating */}
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm font-bold">{avgRating.toFixed(1)}</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={i < Math.round(avgRating) ? "#FBBF24" : "#E5E7EB"} className="h-3.5 w-3.5">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.39 2.463a1 1 0 00-.364 1.118l1.286 3.966c.3.921-.755 1.688-1.54 1.118l-3.39-2.463a1 1 0 00-1.175 0l-3.39 2.463c-.784.57-1.838-.197-1.539-1.118l1.286-3.966a1 1 0 00-.364-1.118L2.171 9.393c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.966z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-neutral-500">({reviews.length} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-4 rounded-2xl border bg-neutral-50 p-4 dark:bg-card">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-2xl font-black text-secondary lg:text-3xl">LKR {currentPrice.toLocaleString()}</span>
                {hasDiscount && (
                  <>
                    <span className="text-sm text-neutral-400 line-through">LKR {oldPrice.toLocaleString()}</span>
                    <span className="rounded-lg bg-green-100 px-2 py-0.5 text-[11px] font-black text-green-700 dark:bg-green-900/30 dark:text-green-400">Save LKR {(oldPrice - currentPrice).toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-11 items-center gap-2 rounded-xl border bg-neutral-100 px-3 dark:bg-white/5">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="transition hover:text-secondary">
                  <FaMinus size={10} />
                </button>
                <span className="w-7 text-center text-sm font-black">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(quantity + 1, product.stock ?? 99))} className="transition hover:text-secondary">
                  <FaPlus size={10} />
                </button>
              </div>

              <motion.button onClick={handleAddToCart} whileTap={{ scale: 0.97 }} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-secondary text-sm font-black text-white transition hover:opacity-90">
                {addedToCart ? (
                  <>
                    <FaCheckCircle size={13} /> Added!
                  </>
                ) : (
                  <>
                    <FaShoppingCart size={13} /> Add to Cart
                  </>
                )}
              </motion.button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: <MdSecurity size={17} className="text-secondary" />, label: "Warranty" },
                { icon: <MdLocalShipping size={17} className="text-secondary" />, label: "Delivery" },
                { icon: <MdSwapHoriz size={17} className="text-secondary" />, label: "Returns" },
                { icon: <MdVerified size={17} className="text-secondary" />, label: "Genuine" },
              ].map(({ icon, label }, i) => (
                <div key={i} className="flex flex-col items-center gap-1 rounded-xl border bg-neutral-50 px-2 py-2.5 text-center dark:bg-card">
                  {icon}
                  <span className="text-[10px] font-semibold leading-tight text-neutral-500">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* DIVIDER */}
        <div className="mx-auto my-10 h-px w-full bg-linear-to-r from-cyan-400 to-blue-500" />

        {/* SPECIFICATIONS */}
        <Specifications specifications={product.specifications} />

        {/* REVIEWS */}
        <div id="reviews">
          <ProductReviews reviews={reviews} avgRating={avgRating} onAddReview={handleAddReview} onVoteHelpful={handleVoteHelpful} />
        </div>

        {/* RELATED */}
        <RelatedProducts products={relatedProducts} />
      </div>
    </main>
  );
}
