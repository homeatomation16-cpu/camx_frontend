"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoBagCheckOutline } from "react-icons/io5";
import { FaMinus, FaPlus, FaShoppingCart, FaCheckCircle } from "react-icons/fa";
import { MdVerified, MdLocalShipping, MdSecurity, MdSwapHoriz } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { CgChevronRight } from "react-icons/cg";

import RelatedProducts from "./RelatedProducts";
import ProductReviews, { Review } from "./ProductReviews";
import Specifications from "./Specifications";
import ShippingInfo from "./ShippingInfo";
import ProductDescriptionSection from "./ProductDescriptionSection";

const API = process.env.NEXT_PUBLIC_API_BASE;

// ======================================
// TYPES
// ======================================

type CategoryOrBrand = string | { _id?: string; name?: string; slug?: string } | null | undefined;

function displayName(value: CategoryOrBrand): string {
  if (!value) return "";
  if (typeof value === "object") return value.name ?? value.slug ?? "";
  return value;
}

type Product = {
  _id: string;
  productId?: string;
  name: string;
  description?: string;
  price?: number;
  labelPrice?: number;
  images?: string[];
  stock?: number;
  category?: CategoryOrBrand;
  specifications?: {
    featureData?: string;
  };
  reviews?: Review[];
  avgRating?: number;
  totalReviews?: number;
  // ✅ Shipping Options එකතු කළා
  shippingOptions?: {
    priceMatch?: boolean;
    protectionPlan?: boolean;
    protectionFeePercentage?: number;
    freeDelivery?: boolean;
    deliveryDaysMin?: number;
    deliveryDaysMax?: number;
    pickupAvailable?: boolean;
    pickupTime?: string;
  };
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

type ReviewApiResponse = {
  _id: string;
  name: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  verified: boolean;
  helpful: number;
};

// ======================================
// HELPERS
// ======================================

const safeImage = (image?: string) => {
  if (image && !image.includes("example.com")) {
    return image;
  }
  return "/placeholder.jpg";
};

function htmlToLines(html?: string): string[] {
  if (!html) return [];
  return html
    .replace(/<\/(p|li|div|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseHighlights(featureData?: string): string[] {
  const lines = htmlToLines(featureData);
  const isTitleLine = (line: string) => /highlights?/i.test(line) && !/[–-]/.test(line);
  return lines.filter((line, i) => !(i === 0 && isTitleLine(line)));
}

// Cart එකට item එකක් add/merge කරන logic එක (Add to Cart සහ Checkout දෙකටම පොදු)
function upsertCartItem(product: Product, quantity: number) {
  const storedCart = localStorage.getItem("CAMX_CART");
  const currentCart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];
  const existingIndex = currentCart.findIndex((item) => item._id === product._id);

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
}

// ======================================
// COMPONENT
// ======================================

export default function ProductOverview({ id }: Props) {
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // ======================================
  // FETCH DATA
  // ======================================

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // PRODUCT
        const { data: current } = await axios.get(`${API}/api/products/${id}`);
        setProduct(current);
        setSelectedImage(current.images?.[0] || "/placeholder.jpg");

        // REVIEWS
        try {
          const reviewRes = await axios.get(`${API}/api/reviews/product/${current._id}`);
          const formattedReviews = (reviewRes.data.reviews || []).map((review: ReviewApiResponse) => ({
            _id: review._id,
            author: review.name,
            rating: review.rating,
            title: review.title,
            body: review.comment,
            date: review.createdAt,
            verified: review.verified,
            helpful: review.helpful || 0,
          }));
          setReviews(formattedReviews);
        } catch (error) {
          console.log("Review fetch error:", error);
        }

        // RELATED PRODUCTS
        const { data: allProducts } = await axios.get(`${API}/api/products`);
        const productArray = allProducts.products || allProducts || [];
        const currentCategoryName = displayName(current.category);

        const filtered = productArray.filter((item: Product) => item._id !== current._id && displayName(item.category) === currentCategoryName).slice(0, 4);
        setRelatedProducts(filtered);
      } catch (error) {
        console.log("Product fetch error:", error);
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

    upsertCartItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // ======================================
  // CHECKOUT (Buy Now)
  // ======================================

  const handleCheckout = () => {
    if (!product) return;

    setCheckoutLoading(true);
    // දැනට තියෙන cart එකට මේ product එකත් add/merge කරලා checkout page එකට direct කරනවා
    upsertCartItem(product, quantity);
    router.push("/checkout");
  };

  // ======================================
  // ADD REVIEW
  // ======================================

  const handleAddReview = async (reviewData: Omit<Review, "_id" | "helpful">) => {
    if (!product?._id) return;

    try {
      const response = await axios.post(`${API}/api/reviews`, {
        productId: product._id,
        name: reviewData.author,
        title: reviewData.title,
        comment: reviewData.body,
        rating: reviewData.rating,
        verified: false,
      });

      const savedReview = response.data.review;

      const formattedReview: Review = {
        _id: savedReview._id,
        author: savedReview.name,
        rating: savedReview.rating,
        title: savedReview.title,
        body: savedReview.comment,
        date: savedReview.createdAt,
        verified: savedReview.verified,
        helpful: savedReview.helpful || 0,
      };

      setReviews((prev) => [formattedReview, ...prev]);
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data);
        alert(error.response?.data?.message || "Failed to save review");
      } else {
        alert("Failed to save review");
      }
    }
  };

  // ======================================
  // VOTE REVIEW HELPFUL
  // ======================================

  const handleVoteHelpful = (reviewId: string) => {
    setReviews((prev) => prev.map((r) => (r._id === reviewId ? { ...r, helpful: (r.helpful || 0) + 1 } : r)));

    axios.patch(`${API}/api/reviews/vote/${reviewId}`, { type: "helpful" }).catch((error) => {
      console.log("Helpful vote error:", error);
    });
  };

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
          <p className="text-sm font-semibold text-neutral-400">Loading product...</p>
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
  const categoryName = displayName(product.category);
  const inStock = (product.stock ?? 0) > 0;
  const highlights = parseHighlights(product.specifications?.featureData);
  const featuredReview = reviews.length > 0 ? [...reviews].sort((a, b) => (b.helpful || 0) - (a.helpful || 0) || b.rating - a.rating)[0] : undefined;

  // ======================================
  // UI
  // ======================================

  return (
    <main className="min-h-screen bg-background pb-4 pt-24 text-neutral-900 dark:text-white">
      {/* TOP BAR */}
      <div className="w-full border-b bg-neutral-50 dark:border-white/10 dark:bg-white/5">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-1.5 px-4 py-3 text-xs text-neutral-500 sm:px-6 lg:px-10">
          <Link href="/" className="font-semibold transition hover:text-secondary">
            Home
          </Link>
          <CgChevronRight size={12} />
          <Link href="/products" className="font-semibold transition hover:text-secondary">
            Products
          </Link>
          <CgChevronRight size={12} />
          <Link href={`/products?category=${encodeURIComponent(categoryName)}`} className="rounded-full bg-secondary/10 px-2.5 py-0.5 font-bold text-secondary transition hover:bg-secondary hover:text-white">
            {categoryName}
          </Link>
          <CgChevronRight size={12} />
          <span className="line-clamp-1 font-semibold text-neutral-800 dark:text-white">{product.name}</span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* LEFT */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="group relative h-72 overflow-hidden rounded-2xl border bg-neutral-50 dark:bg-white/5 sm:h-96 lg:h-120">
              <AnimatePresence mode="wait">
                <motion.div key={selectedImage} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }} className="absolute inset-0">
                  <Image src={safeImage(selectedImage)} alt={product.name} fill className="object-contain p-6 transition-transform duration-500 group-hover:scale-105" priority unoptimized loading="eager" />
                </motion.div>
              </AnimatePresence>
              {hasDiscount && <div className="absolute left-3 top-3 rounded-xl bg-secondary px-2.5 py-1 text-[11px] font-black text-white shadow-lg">-{discountPct}% OFF</div>}
            </div>

            {/* THUMBNAILS */}
            <div className="mt-3 flex flex-wrap gap-2">
              {product.images?.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(img)} className={`relative h-14 w-14 overflow-hidden rounded-xl border-2 transition sm:h-16 sm:w-16 ${selectedImage === img ? "border-secondary shadow-md" : "border-transparent hover:border-neutral-300"}`}>
                  <Image src={safeImage(img)} alt={`View ${i + 1}`} fill className="rounded-xl object-cover" unoptimized />
                </button>
              ))}
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
            <span className="mb-2 inline-block w-fit rounded-full bg-secondary/10 px-2.5 py-1 text-[11px] font-semibold text-secondary">{categoryName}</span>
            <h1 className="mb-2 text-xl font-black leading-tight lg:text-2xl">{product.name}</h1>
            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">{product.description}</p>

            {/* RATING */}
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold">{avgRating.toFixed(1)}</span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={i < Math.round(avgRating) ? "#FBBF24" : "#E5E7EB"} className="h-3.5 w-3.5">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.39 2.463a1 1 0 00-.364 1.118l1.286 3.966c.3.921-.755 1.688-1.54 1.118l-3.39-2.463a1 1 0 00-1.175 0l-3.39 2.463c-.784.57-1.838-.197-1.539-1.118l1.286-3.966a1 1 0 00-.364-1.118L2.171 9.393c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.966z" />
                    </svg>
                  ))}
                </div>
              </div>
              <a href="#reviews" className="text-xs text-neutral-500 hover:text-secondary hover:underline">
                ({reviews.length} reviews)
              </a>
            </div>

            {/* SHIPPING & PROTECTION ✅ (props passed here) */}
            <div className="mb-4">
              <ShippingInfo price={currentPrice} inStock={inStock} shippingOptions={product.shippingOptions} />
            </div>

            {/* PRICE */}
            <div className="mb-4 rounded-2xl border bg-neutral-50 p-4 dark:bg-card">
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span className="text-2xl font-black text-secondary lg:text-3xl">LKR {currentPrice.toLocaleString()}</span>
                {hasDiscount && (
                  <>
                    <span className="text-sm text-neutral-400 line-through">LKR {oldPrice.toLocaleString()}</span>
                    <span className="rounded-lg bg-green-100 px-2 py-0.5 text-[11px] font-black text-green-700 dark:bg-green-900/30 dark:text-green-400">Save LKR {(oldPrice - currentPrice).toLocaleString()}</span>
                  </>
                )}
              </div>
              <p className={`mt-2 text-xs font-bold ${inStock ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>{inStock ? `In Stock — ${product.stock} available` : "Out of Stock"}</p>
            </div>

            {/* QUANTITY */}
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-11 items-center gap-2 rounded-xl border bg-neutral-100 px-3 dark:bg-white/5">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="transition hover:text-secondary">
                  <FaMinus size={10} />
                </button>
                <span className="w-6 text-center text-sm font-black">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(quantity + 1, product.stock ?? 99))} className="transition hover:text-secondary">
                  <FaPlus size={10} />
                </button>
              </div>
            </div>

            {/* ADD TO CART & CHECKOUT */}
            <div className="mb-4 flex flex-row gap-2.5 ">
              <motion.button onClick={handleAddToCart} disabled={!inStock} whileTap={{ scale: 0.97 }} className="flex h-11 flex-1 items-center justify-center gap-2.5 rounded-xl border-2 border-secondary bg-white text-sm font-black text-secondary transition hover:bg-secondary/10 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-transparent">
                <AnimatePresence mode="wait">
                  {addedToCart ? (
                    <motion.span key="added" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -6, opacity: 0 }} className="flex items-center gap-2.5">
                      <FaCheckCircle size={14} /> Added to Cart!
                    </motion.span>
                  ) : (
                    <motion.span key="add" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -6, opacity: 0 }} className="flex items-center gap-2.5">
                      <FaShoppingCart size={14} /> Add to Cart
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <motion.button onClick={handleCheckout} disabled={!inStock || checkoutLoading} whileTap={{ scale: 0.97 }} className="flex h-11 flex-1 items-center justify-center gap-2.5 rounded-xl bg-secondary text-sm font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
                <IoBagCheckOutline size={16} /> {checkoutLoading ? "Redirecting..." : "Checkout"}
              </motion.button>
            </div>

            {/* BADGES */}
            <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[
                { icon: <MdSecurity size={17} className="text-secondary" />, label: "Warranty Included" },
                { icon: <MdLocalShipping size={17} className="text-secondary" />, label: "Island-Wide Delivery" },
                { icon: <MdSwapHoriz size={17} className="text-secondary" />, label: "Easy Returns" },
                { icon: <MdVerified size={17} className="text-secondary" />, label: "Genuine Product" },
              ].map(({ icon, label }, i) => (
                <div key={i} className="flex flex-col items-center gap-1 rounded-xl border bg-neutral-50 px-2.5 py-2.5 text-center dark:bg-card">
                  {icon}
                  <span className="text-[10px] font-semibold leading-tight text-neutral-500">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <ProductDescriptionSection productName={product.name} description={product.description} highlights={highlights} featuredReview={featuredReview} totalReviews={reviews.length} />

        <div id="specifications" className="scroll-mt-24">
          <Specifications specifications={product.specifications} />
        </div>

        <div id="reviews" className="scroll-mt-24">
          <ProductReviews reviews={reviews} avgRating={avgRating} onAddReview={handleAddReview} onVoteHelpful={handleVoteHelpful} />
        </div>

        <RelatedProducts products={relatedProducts} />
      </div>
    </main>
  );
}
