'use client';

import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import {
  FaStar,
  FaCheckCircle,
  FaShieldAlt,
  FaTruck,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaHeart,
} from 'react-icons/fa';

import { motion } from 'framer-motion';
import { CgChevronRight } from 'react-icons/cg';

import ProductCard from '@/app/components/ProductCard';

const API = process.env.NEXT_PUBLIC_API_BASE;

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
  brand?: string;
  model?: string;
  specifications?: {
    featureData?: string;
  };
};

export default function ProductOverviewPage() {
  const params = useParams();

  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);

  const [selectedImage, setSelectedImage] =
    useState('');

  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);

  const [relatedProducts, setRelatedProducts] =
    useState<Product[]>([]);

  const [parsedSpecs, setParsedSpecs] = useState<
    SpecItem[]
  >([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const productRes = await axios.get(
          `${API}/products/${id}`
        );

        const current = productRes.data;

        if (current) {
          setProduct(current);

          setSelectedImage(
            current.images?.[0] ||
              '/placeholder.jpg'
          );

          if (
            current.specifications?.featureData
          ) {
            try {
              const parsed = JSON.parse(
                current.specifications.featureData
              );

              setParsedSpecs(
                Array.isArray(parsed)
                  ? parsed
                  : []
              );
            } catch (e) {
              console.error(e);
              setParsedSpecs([]);
            }
          }

          const relatedRes = await axios.get(
            `${API}/products`
          );

          const filtered =
            relatedRes.data.filter(
              (item: Product) =>
                item._id !== current._id &&
                item.category ===
                  current.category
            );

          setRelatedProducts(
            filtered.slice(0, 4)
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  const safeImage = (image?: string) => {
    if (
      image &&
      !image.includes('example.com')
    ) {
      return image;
    }

    return '/placeholder.jpg';
  };

  const currentPrice = Number(
    product?.price || 0
  );

  const oldPrice = Number(
    product?.labelPrice || 0
  );

  const hasDiscount =
    oldPrice > currentPrice;

  const discount = hasDiscount
    ? Math.round(
        ((oldPrice - currentPrice) /
          oldPrice) *
          100
      )
    : 0;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#060816] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>

          <h2 className="mt-6 text-white text-xl font-bold">
            Loading Premium Product
            Experience...
          </h2>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#060816] text-white">
        <h1 className="text-4xl font-black">
          Product Not Found
        </h1>

        <Link
          href="/products"
          className="mt-5 px-6 py-3 rounded-2xl bg-cyan-500 font-bold"
        >
          Back To Shop
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#060816] text-white overflow-hidden">

      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-125500px] bg-cyan-500/20 blur-[140px]" />

        <div className="absolute bottom-0 left-0 w-125 h-125blue-500/20 blur-[140px]" />
      </div>

      <div className="w-full pt-28 pb-28">

        {/* TOP CONTAINER */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* BREADCRUMB */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-10">
            <Link
              href="/"
              className="hover:text-cyan-400"
            >
              Home
            </Link>

            <CgChevronRight />

            <Link
              href="/products"
              className="hover:text-cyan-400"
            >
              Products
            </Link>

            <CgChevronRight />

            <span className="text-white font-semibold">
              {product.category}
            </span>
          </div>

          {/* MAIN SECTION */}
          <div className="grid lg:grid-cols-2 gap-12">

            {/* LEFT */}
            <motion.div
              initial={{
                opacity: 0,
                x: -40,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.5,
              }}
            >

              {/* IMAGE */}
              <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/5 backdrop-blur-xl">

                {hasDiscount && (
                  <div className="absolute top-5 right-5 z-20 bg-red-500 text-white px-4 py-2 rounded-2xl font-black shadow-2xl rotate-6">
                    SAVE {discount}%
                  </div>
                )}

                <div className="relative h-130 w-full group">
                  <Image
                    src={safeImage(
                      selectedImage
                    )}
                    alt={product.name}
                    fill
                    priority
                    className="object-contain p-8 transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>

              {/* THUMBNAILS */}
              <div className="flex gap-4 mt-5 overflow-x-auto no-scrollbar">
                {product.images?.map(
                  (image, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        setSelectedImage(
                          image
                        )
                      }
                      className={`relative w-24 h-24 rounded-2xl overflow-hidden border transition-all duration-300 ${
                        selectedImage === image
                          ? 'border-cyan-400 scale-95'
                          : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={safeImage(
                          image
                        )}
                        alt="thumb"
                        fill
                        className="object-cover"
                      />
                    </button>
                  )
                )}
              </div>
            </motion.div>

            {/* RIGHT */}
            <motion.div
              className="sticky top-24 h-fit"
              initial={{
                opacity: 0,
                x: 40,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.5,
              }}
            >

              {/* BRAND */}
              {product.brand && (
                <div className="inline-flex px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-black uppercase tracking-widest">
                  {product.brand}
                </div>
              )}

              {/* TITLE */}
              <h1 className="mt-5 text-4xl md:text-5xl font-black leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* RATING */}
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map(
                    (_, i) => (
                      <FaStar
                        key={i}
                        size={15}
                        className="text-yellow-400"
                      />
                    )
                  )}
                </div>

                <span className="text-gray-400">
                  5.0 Ratings
                </span>

                {Number(
                  product.stock || 0
                ) > 0 ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                    <FaCheckCircle />
                    In Stock
                  </div>
                ) : (
                  <div className="text-red-400 font-bold">
                    Out Of Stock
                  </div>
                )}
              </div>

              {/* PRICE */}
              <div className="relative overflow-hidden mt-8 rounded-4xl bg-linear-to-br from-cyan-500 to-blue-600 p-8 shadow-[0_20px_60px_rgba(6,182,212,0.35)]">

                <div className="absolute inset-0 bg-white/10 backdrop-blur-2xl"></div>

                <div className="relative z-10">

                  <p className="text-sm uppercase tracking-widest text-cyan-100 font-bold">
                    Special Offer Price
                  </p>

                  <div className="flex items-end gap-4 mt-3 flex-wrap">

                    <h2 className="text-5xl font-black">
                      LKR{' '}
                      {currentPrice.toLocaleString()}
                    </h2>

                    {hasDiscount && (
                      <span className="text-xl line-through text-cyan-100">
                        LKR{' '}
                        {oldPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 inline-flex px-4 py-2 rounded-xl bg-white text-cyan-700 font-black text-sm">
                    YOU SAVE {discount}%
                  </div>
                </div>
              </div>

              {/* TRUST */}
              <div className="grid grid-cols-2 gap-4 mt-6">

                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
                  <FaShieldAlt className="text-cyan-400 text-2xl" />

                  <h4 className="mt-3 font-bold">
                    Genuine Warranty
                  </h4>

                  <p className="text-sm text-gray-400 mt-1">
                    Official company
                    protection
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
                  <FaTruck className="text-cyan-400 text-2xl" />

                  <h4 className="mt-3 font-bold">
                    Islandwide Delivery
                  </h4>

                  <p className="text-sm text-gray-400 mt-1">
                    Fast & secure
                    shipping
                  </p>
                </div>
              </div>

              {/* QUANTITY */}
              {Number(
                product.stock || 0
              ) > 0 && (
                <div className="mt-8">

                  <p className="font-bold text-gray-300 mb-4">
                    Select Quantity
                  </p>

                  <div className="flex items-center w-fit border border-white/10 rounded-2xl bg-white/5 backdrop-blur-xl p-2">

                    <button
                      onClick={() =>
                        setQuantity(
                          (q) =>
                            Math.max(
                              1,
                              q - 1
                            )
                        )
                      }
                      className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center"
                    >
                      <FaMinus />
                    </button>

                    <span className="w-14 text-center font-black text-lg">
                      {quantity}
                    </span>

                    <button
                      onClick={() =>
                        setQuantity(
                          (q) =>
                            Math.min(
                              Number(
                                product.stock ||
                                  1
                              ),
                              q + 1
                            )
                        )
                      }
                      className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center"
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
              )}

              {/* BUTTONS */}
              <div className="grid sm:grid-cols-2 gap-4 mt-10">

                <button className="group relative overflow-hidden rounded-2xl bg-linear-to-rrom-cyan-500 to-blue-600 h-16 font-black text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_20px_50px_rgba(6,182,212,0.35)]">

                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition"></div>

                  <span className="relative flex items-center justify-center gap-3">
                    <FaShoppingCart />
                    Add To Cart
                  </span>
                </button>

                <button className="rounded-2xl border border-cyan-400 text-cyan-300 h-16 font-black text-lg hover:bg-cyan-500 hover:text-white transition-all duration-300">
                  Buy Now
                </button>
              </div>

              {/* WISHLIST */}
              <button className="mt-5 flex items-center gap-3 text-gray-300 hover:text-red-400 transition">
                <FaHeart />
                Add To Wishlist
              </button>
            </motion.div>
          </div>

          {/* DESCRIPTION */}
          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
            }}
            className="mt-20 rounded-4xl border border-white/10 bg-white/5 backdrop-blur-xl p-8"
          >

            <h2 className="text-3xl font-black">
              Product Overview
            </h2>

            <p className="mt-6 leading-8 text-gray-300 whitespace-pre-line">
              {product.description}
            </p>
          </motion.div>
        </div>

        {/* FULL WIDTH SPECIFICATIONS */}
        {parsedSpecs.length > 0 && (
          <section className="mt-28">

            {/* HEADER */}
            <div className="text-center mb-20 px-4">

              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-xs font-black uppercase tracking-[0.25em]">
                Premium Technology
              </div>

              <h2 className="mt-6 text-5xl md:text-7xl font-black tracking-tight leading-tight">
                Technical
                Specifications
              </h2>

              <p className="mt-6 text-gray-400 text-lg md:text-xl max-w-4xl mx-auto leading-9">
                Premium engineered
                technology features
                built into this
                professional
                surveillance product.
              </p>
            </div>

            {/* SPECS */}
            <div className="grid grid-cols-1 gap-24">

              {parsedSpecs.map(
                (
                  spec: SpecItem,
                  index: number
                ) => (
                  <motion.div
                    key={index}
                    initial={{
                      opacity: 0,
                      y: 40,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 0.5,
                      delay:
                        index * 0.1,
                    }}
                    className="group relative overflow-hidden border-y border-white/10 bg-linear-to-br from-white/4 to-white/1"
                  >

                    {/* GLOW */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_35%)]" />

                    {/* IMAGE */}
                    {spec.image && (
                      <div className="relative w-full h-175 overflow-hidden">

                        <Image
                          src={spec.image}
                          alt={
                            spec.title
                          }
                          fill
                          sizes="100vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* OVERLAY */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />

                        {/* BADGE */}
                        <div className="absolute top-10 left-10">

                          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500/15 backdrop-blur-xl border border-cyan-400/20 text-cyan-200 text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl">
                            Technical
                            Feature
                          </div>
                        </div>

                        {/* TITLE */}
                        <div className="absolute bottom-14 left-10 right-10">

                          <h3 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                            {
                              spec.title
                            }
                          </h3>

                          <div className="mt-7 h-0.75 w-40 bg-linear-to-r from-cyan-400 to-transparent" />
                        </div>
                      </div>
                    )}

                    {/* CONTENT */}
                    <div className="relative z-10 px-8 md:px-20 py-14 md:py-20 max-w-7xl">

                      {!spec.image && (
                        <>
                          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-[11px] font-black uppercase tracking-[0.3em]">
                            Technical
                            Feature
                          </div>

                          <h3 className="mt-7 text-5xl md:text-6xl font-black leading-tight tracking-tight">
                            {
                              spec.title
                            }
                          </h3>

                          <div className="mt-7 h-0.75 w-40 bg-linear-to-r from-cyan-400 to-transparent" />
                        </>
                      )}

                      <div className="mt-10">

                        <p className="text-gray-300 leading-[2.5] whitespace-pre-line text-[18px] md:text-[21px] font-medium max-w-none">
                          {
                            spec.value
                          }
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              )}
            </div>
          </section>
        )}

        {/* RELATED */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {relatedProducts.length >
            0 && (
            <div className="mt-28">

              <div className="flex items-center justify-between mb-10">

                <div>
                  <h2 className="text-4xl font-black">
                    Related
                    Products
                  </h2>

                  <p className="text-gray-400 mt-2">
                    You may also
                    like these
                    premium
                    products.
                  </p>
                </div>

                <Link
                  href="/products"
                  className="text-cyan-400 font-bold hover:text-cyan-300"
                >
                  View All →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

                {relatedProducts.map(
                  (item) => (
                    <ProductCard
                      key={
                        item._id
                      }
                      product={
                        item
                      }
                    />
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-white/10 bg-[#060816]/90 backdrop-blur-2xl px-4 py-4">

        <div className="flex items-center gap-4">

          <div className="flex-1">
            <p className="text-xs text-gray-400">
              Total Price
            </p>

            <h3 className="text-xl font-black">
              LKR{' '}
              {currentPrice.toLocaleString()}
            </h3>
          </div>

          <button className="flex-1 h-14 rounded-2xl bg-linear-to-r from-cyan-500 to-blue-600 font-black shadow-[0_20px_50px_rgba(6,182,212,0.35)]">
            Add To Cart
          </button>
        </div>
      </div>
    </main>
  );
}