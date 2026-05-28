"use client";

import axios from "axios";
import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ProductCard from "@/app/components/ProductCard";
import ProductsSidebar from "@/app/components/ProductsSidebar";
import PriceRangeSlider from "@/app/components/PriceRangeSlider";

const API = process.env.NEXT_PUBLIC_API_BASE;

const MAX_PRICE = 100000;

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
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  );

  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());

  const [sortBy, setSortBy] = useState("default");

  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const [minPrice, setMinPrice] = useState(0);

  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);

  /* FETCH PRODUCTS */

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await axios.get(`${API}/api/products`);

        const data = response.data.products || response.data || [];

        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  /* CATEGORY TREE */

  const categoryTree = useMemo(() => {
    const tree: Record<string, string[]> = {};

    products.forEach((product) => {
      const category = product.category || "Other";

      const subcategory = product.subcategory || "General";

      if (!tree[category]) {
        tree[category] = [];
      }

      if (!tree[category].includes(subcategory)) {
        tree[category].push(subcategory);
      }
    });

    return tree;
  }, [products]);

  /* BRANDS */

  const brands = useMemo(() => {
    return [...new Set(products.map((product) => product.brand || "Other"))];
  }, [products]);

  /* BRAND TOGGLE */

  function toggleBrand(brand: string) {
    setSelectedBrands((prev) => {
      const next = new Set(prev);

      if (next.has(brand)) {
        next.delete(brand);
      } else {
        next.add(brand);
      }

      return next;
    });
  }

  /* CLEAR FILTERS */

  function clearFilters() {
    setSearch("");

    setSelectedCategory("All");

    setSelectedSubcategory(null);

    setSelectedBrands(new Set());

    setMinPrice(0);

    setMaxPrice(MAX_PRICE);

    setSortBy("default");
  }

  /* FILTER PRODUCTS */

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchCategory =
        selectedCategory === "All"
          ? true
          : product.category === selectedCategory;

      const matchSubcategory = !selectedSubcategory
        ? true
        : product.subcategory === selectedSubcategory;

      const matchBrand =
        selectedBrands.size === 0
          ? true
          : selectedBrands.has(product.brand || "Other");

      const matchPrice = product.price >= minPrice && product.price <= maxPrice;

      return (
        matchSearch &&
        matchCategory &&
        matchSubcategory &&
        matchBrand &&
        matchPrice
      );
    });

    /* SORTING */

    if (sortBy === "priceLow") {
      result = [...result].sort((a, b) => a.price - b.price);
    }

    if (sortBy === "priceHigh") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [
    products,
    search,
    selectedCategory,
    selectedSubcategory,
    selectedBrands,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  return (
    <main className="min-h-screen bg-background px-4 pb-24 pt-28 sm:px-6">
      <div className="mx-auto max-w-425">
        {/* TOP */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* TITLE */}
          <div>
            <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
              Shop Products
            </h1>

            <p className="mt-2 text-neutral-500 dark:text-gray-400">
              Professional CCTV & smart security solutions
            </p>
          </div>

          {/* SEARCH */}
          <div className="relative w-full lg:w-90">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-2xl border border-neutral-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-secondary dark:border-border dark:bg-card"
            />
          </div>
        </div>

        {/* MAIN */}
        <div className="flex gap-8">
          {/* SIDEBAR */}
          <aside className="hidden w-72.5 shrink-0 lg:block">
            <div className="sticky top-24 rounded-3xl border border-neutral-200 bg-white p-6 dark:border-border dark:bg-card">
              {/* FILTER TITLE */}
              <div className="mb-8 flex items-center gap-3">
                <SlidersHorizontal className="h-5 w-5 text-secondary" />

                <h2 className="text-2xl font-bold">Filters</h2>
              </div>

              {/* PRICE RANGE */}
              <div className="mb-10">
                <h3 className="mb-5 text-sm font-bold uppercase">
                  Price Range
                </h3>

                <PriceRangeSlider
                  min={0}
                  max={MAX_PRICE}
                  minVal={minPrice}
                  maxVal={maxPrice}
                  onChange={(min, max) => {
                    setMinPrice(min);
                    setMaxPrice(max);
                  }}
                />
              </div>

              {/* SIDEBAR */}
              <ProductsSidebar
                categoryTree={categoryTree}
                brands={brands}
                selectedCategory={selectedCategory}
                selectedSubcategory={selectedSubcategory}
                selectedBrands={selectedBrands}
                openCategory={openCategory}
                setOpenCategory={setOpenCategory}
                setSelectedCategory={setSelectedCategory}
                setSelectedSubcategory={setSelectedSubcategory}
                toggleBrand={toggleBrand}
                clearFilters={clearFilters}
              />
            </div>
          </aside>

          {/* PRODUCTS */}
          <div className="flex-1">
            {/* TOP BAR */}
            <div className="mb-8 flex items-center justify-between">
              <p className="text-sm text-neutral-500">
                Showing{" "}
                <span className="font-bold text-secondary">
                  {filteredProducts.length}
                </span>{" "}
                products
              </p>

              {/* SORT */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-11 rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none dark:border-border dark:bg-card"
              >
                <option value="default">Default sorting</option>

                <option value="priceLow">Price: Low to High</option>

                <option value="priceHigh">Price: High to Low</option>
              </select>
            </div>

            {/* PRODUCTS GRID */}
            {loading ? (
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-80 animate-pulse rounded-2xl bg-neutral-100 dark:bg-card"
                  />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 text-5xl">🔍</div>

                <h3 className="text-lg font-bold">No products found</h3>

                <p className="mt-2 text-sm text-neutral-500">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
