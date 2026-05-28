"use client";

import Link from "next/link";
import ProductCard from "@/app/components/ProductCard";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE;

type Product = {
  _id: string;
  productId?: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  description?: string;
  stock?: number;
  brand?: string;
};

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(`${API}/api/products`);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        console.log("PRODUCTS:", data);

        // API returns direct array
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching products:", error);

        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <section className="py-20 md:py-24 px-4 sm:px-6 bg-white dark:bg-transparent transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-neutral-900 dark:text-white">
              Featured Products
            </h2>

            <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-gray-400">
              Premium CCTV & surveillance solutions
            </p>
          </div>

          <Link
            href="/products"
            aria-label="View all products"
            className="inline-flex items-center font-semibold text-secondary hover:underline"
          >
            View All →
          </Link>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4"
              >
                <div className="aspect-square rounded-xl bg-neutral-200 dark:bg-neutral-800 mb-4" />

                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded mb-3" />

                <div className="h-4 w-2/3 bg-neutral-200 dark:bg-neutral-800 rounded mb-6" />

                <div className="h-10 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-3xl">
            <h3 className="text-xl font-semibold text-neutral-800 dark:text-white">
              No Products Found
            </h3>

            <p className="mt-2 text-neutral-500 dark:text-neutral-400">
              Please check back later for new arrivals.
            </p>
          </div>
        ) : (
          /* PRODUCT GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <ProductCard
                key={product._id || product.productId}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
