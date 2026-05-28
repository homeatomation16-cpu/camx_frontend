"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaTruck,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaShieldAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { CgChevronRight } from "react-icons/cg";
import RelatedProducts from "./RelatedProducts";

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

// ======================================
// PROPS
// ======================================

type Props = {
  id: string;
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
  const [parsedSpecs, setParsedSpecs] = useState<SpecItem[]>([]);

  // ======================================
  // SAFE IMAGE
  // ======================================

  const safeImage = (image?: string) => {
    if (image && !image.includes("example.com")) {
      return image;
    }
    return "/placeholder.jpg";
  };

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

        // SPECIFICATIONS
        if (current.specifications?.featureData) {
          try {
            const parsed = JSON.parse(current.specifications.featureData);
            setParsedSpecs(Array.isArray(parsed) ? parsed : []);
          } catch {
            setParsedSpecs([]);
          }
        } else {
          setParsedSpecs([]);
        }

        // RELATED PRODUCTS
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
  };

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-lg font-bold">
        Loading...
      </main>
    );
  }

  // ======================================
  // NOT FOUND
  // ======================================

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center text-lg font-bold">
        Product Not Found
      </main>
    );
  }

  // ======================================
  // PRICE
  // ======================================

  const currentPrice = Number(product.price || 0);
  const oldPrice = Number(product.labelPrice || 0);
  const hasDiscount = oldPrice > currentPrice;

  // ======================================
  // UI
  // ======================================

  return (
    <main className="min-h-screen bg-background pb-24 pt-24 text-neutral-900 dark:text-white">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-16">
        {/* BREADCRUMB */}
        <div className="mb-8 flex items-center gap-2 text-xs text-neutral-500 lg:text-sm">
          <Link href="/">Home</Link>
          <CgChevronRight />
          <Link href="/products">Products</Link>
          <CgChevronRight />
          <span className="font-semibold text-neutral-800 dark:text-white">
            {product.category}
          </span>
        </div>

        {/* MAIN GRID */}
        <div className="grid gap-10 lg:grid-cols-2">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative h-105 overflow-hidden rounded-3xl border bg-neutral-50 dark:bg-white/5 lg:h-137.5">
              <Image
                src={safeImage(selectedImage)}
                alt={product.name}
                fill
                className="object-contain p-6"
                priority
              />
            </div>

            {/* THUMBNAILS */}
            <div className="mt-4 flex flex-wrap gap-3">
              {product.images?.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`h-16 w-16 overflow-hidden rounded-2xl border lg:h-20 lg:w-20 ${
                    selectedImage === img
                      ? "border-secondary"
                      : "border-neutral-200"
                  }`}
                >
                  <Image
                    src={safeImage(img)}
                    alt="thumb"
                    width={80}
                    height={80}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="mb-4 text-3xl font-black lg:text-4xl">
              {product.name}
            </h1>

            {/* PRICE */}
            <div className="mb-6 rounded-3xl border bg-neutral-50 p-5 dark:bg-card">
              <span className="text-2xl font-black text-secondary lg:text-3xl">
                LKR {currentPrice.toLocaleString()}
              </span>

              {hasDiscount && (
                <span className="ml-3 text-base text-neutral-400 line-through lg:text-lg">
                  LKR {oldPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* DESCRIPTION */}
            {product.description && (
              <p className="mb-6 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 lg:text-base">
                {product.description}
              </p>
            )}

            {/* QUANTITY */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 items-center rounded-2xl border bg-neutral-100 px-4 dark:bg-white/5">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <FaMinus size={11} />
                </button>

                <span className="w-10 text-center text-sm font-bold">
                  {quantity}
                </span>

                <button onClick={() => setQuantity(quantity + 1)}>
                  <FaPlus size={11} />
                </button>
              </div>

              {/* BUTTON */}
              <button
                onClick={handleAddToCart}
                className="flex h-12 flex-1 items-center justify-center gap-3 rounded-2xl bg-secondary text-sm font-bold text-white transition hover:opacity-90"
              >
                <FaShoppingCart />
                Add to Cart
              </button>
            </div>

            {/* FEATURES */}
            <div className="grid grid-cols-2 gap-4 border-t pt-5 text-sm">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-secondary" />
                Warranty Included
              </div>

              <div className="flex items-center gap-2">
                <FaTruck className="text-secondary" />
                Islandwide Delivery
              </div>
            </div>
          </motion.div>
        </div>

        {/* SPECIFICATIONS */}
        {parsedSpecs.length > 0 && (
          <div className="mt-20 border-t pt-14">
            <h2 className="mb-6 text-2xl font-black lg:text-3xl">
              Technical Specifications
            </h2>

            {parsedSpecs.map((spec, i) => (
              <div
                key={i}
                className="mb-6 rounded-3xl border bg-neutral-50 p-6 dark:bg-card"
              >
                <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-secondary">
                  {spec.title}
                </h3>

                <p className="text-sm leading-relaxed lg:text-base">
                  {spec.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* RELATED */}
        <RelatedProducts products={relatedProducts} />
      </div>
    </main>
  );
}
