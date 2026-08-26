"use client";

import axios from "axios";
import { Search, X, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import ProductCard from "@/app/components/ProductCard";
import ProductsSidebar from "@/app/components/ProductsSidebar";
import PriceRangeSlider from "@/app/components/PriceRangeSlider";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
const MAX_PRICE = 100000;

// Backend eken category/brand string ekak vidihata witharak nemei —
// { _id, name, slug } object ekak vidihatath enna puluwan (populated reference).
// Object ekama key ekak/label ekak vidihata use kalahot "[object Object]"
// widihata stringify wenawa — eka thamai sidebar eke penune bug eka.
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
  price: number;
  labelPrice?: number;
  images: string[];
  category: CategoryOrBrand;
  subcategory?: string;
  description?: string;
  stock?: number;
  brand?: string;
};

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-100 bg-white dark:border-border dark:bg-card">
      <div className="h-40 animate-pulse bg-neutral-100 dark:bg-neutral-800 sm:h-44" />
      <div className="space-y-2 p-3">
        <div className="h-2 w-14 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-3 w-full animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-3 w-2/3 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
        <div className="mt-2 h-4 w-20 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
        <div className="mt-2 h-8 w-full animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
      </div>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} className="flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1.5 text-[11px] font-semibold text-secondary">
      {label}
      <button onClick={onRemove} className="transition hover:text-secondary/70">
        <X size={11} />
      </button>
    </motion.span>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState("default");
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);

  // FETCH PRODUCTS & RATINGS
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // 1. මුලින්ම Products සියල්ල ලබා ගැනීම
        const productsRes = await axios.get(`${API}/api/products`);
        const fetchedProducts = productsRes.data.products || productsRes.data || [];

        // 2. ලබාගත් හැම Product එකක් සඳහාම අදාල Reviews ලබාගෙන Rating එක ගණනය කිරීම
        const productsWithRatings = await Promise.all(
          fetchedProducts.map(async (p: Product) => {
            try {
              const reviewRes = await axios.get(`${API}/api/reviews/product/${p._id}`);
              const productReviews = reviewRes.data.reviews || [];

              // Reviews ගණන
              const reviewCount = productReviews.length;

              // සාමාන්‍ය (Average) Rating එක ගණනය කිරීම (any ඉවත් කර නිවැරදි type එක ලබා දීම)
              const totalRating = productReviews.reduce((sum: number, rev: { rating?: number }) => sum + (rev.rating || 0), 0);
              const avgRating = reviewCount > 0 ? totalRating / reviewCount : 0;

              return {
                ...p,
                rating: avgRating,
                reviews: reviewCount,
              };
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (_err) {
              // Reviews ගන්න බැරි වුනොත් 0 විදිහට සලකන්න (unused 'err' ඉවත් කිරීම)
              return {
                ...p,
                rating: 0,
                reviews: 0,
              };
            }
          }),
        );

        setProducts(productsWithRatings);
      } catch (err) {
        console.error("Data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  /* CATEGORY TREE */
  const categoryTree = useMemo(() => {
    const tree: Record<string, string[]> = {};
    products.forEach((p) => {
      const cat = displayName(p.category) || "Other";
      const sub = p.subcategory || "General";
      if (!tree[cat]) {
        tree[cat] = [];
      }
      if (!tree[cat].includes(sub)) {
        tree[cat].push(sub);
      }
    });
    return tree;
  }, [products]);

  /* BRANDS */
  const brands = useMemo(() => [...new Set(products.map((p) => p.brand || "Other"))], [products]);

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

  function clearFilters() {
    setSearch("");
    setSelectedCategory("All");
    setSelectedSubcategory(null);
    setSelectedBrands(new Set());
    setMinPrice(0);
    setMaxPrice(MAX_PRICE);
    setSortBy("default");
  }

  // ACTIVE FILTERS
  const activeFilters = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = [];

    if (selectedCategory !== "All") {
      chips.push({
        label: selectedCategory,
        onRemove: () => {
          setSelectedCategory("All");
          setSelectedSubcategory(null);
        },
      });
    }

    if (selectedSubcategory) {
      chips.push({
        label: selectedSubcategory,
        onRemove: () => setSelectedSubcategory(null),
      });
    }

    selectedBrands.forEach((b) =>
      chips.push({
        label: b,
        onRemove: () => toggleBrand(b),
      }),
    );

    if (minPrice > 0 || maxPrice < MAX_PRICE) {
      chips.push({
        label: `Rs ${minPrice.toLocaleString()} - Rs ${maxPrice.toLocaleString()}`,
        onRemove: () => {
          setMinPrice(0);
          setMaxPrice(MAX_PRICE);
        },
      });
    }

    return chips;
  }, [selectedCategory, selectedSubcategory, selectedBrands, minPrice, maxPrice]);

  /* FILTERED */
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const catName = displayName(p.category) || "Other";
      const brandName = displayName(p.brand) || "Other";
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === "All" || catName === selectedCategory;
      const matchSub = !selectedSubcategory || p.subcategory === selectedSubcategory;
      const matchBrand = selectedBrands.size === 0 || selectedBrands.has(brandName);
      const matchPrice = p.price >= minPrice && p.price <= maxPrice;

      return matchSearch && matchCat && matchSub && matchBrand && matchPrice;
    });

    if (sortBy === "priceLow") {
      result = [...result].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "priceHigh") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, search, selectedCategory, selectedSubcategory, selectedBrands, minPrice, maxPrice, sortBy]);

  // SIDEBAR
  const sidebarContent = (
    <div className="space-y-8">
      {/* PRICE */}
      <div>
        <h3 className="mb-4 text-[11px] font-black uppercase tracking-widest text-neutral-400">Price Range</h3>
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
      <ProductsSidebar categoryTree={categoryTree} brands={brands} selectedCategory={selectedCategory} selectedSubcategory={selectedSubcategory} selectedBrands={selectedBrands} openCategory={openCategory} setOpenCategory={setOpenCategory} setSelectedCategory={setSelectedCategory} setSelectedSubcategory={setSelectedSubcategory} toggleBrand={toggleBrand} clearFilters={clearFilters} />
    </div>
  );

  return (
    <main className="min-h-screen bg-background px-4 pb-24 pt-28 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-secondary">CAMX Store</p>
            <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white lg:text-5xl">Shop Products</h1>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Professional CCTV & security solutions</p>
          </div>

          {/* SEARCH */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-10 text-sm outline-none transition focus:border-secondary dark:border-border dark:bg-card" />

            <AnimatePresence initial={false}>
              {search && (
                <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
                  <X size={14} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* LAYOUT */}
        <div className="flex gap-6">
          {/* SIDEBAR */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24 rounded-3xl border border-neutral-200 bg-white p-6 dark:border-border dark:bg-card">{sidebarContent}</div>
          </aside>

          {/* PRODUCTS */}
          <div className="min-w-0 flex-1">
            {/* TOP BAR */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-neutral-500">
                <span className="font-black text-secondary">{filteredProducts.length}</span> products
              </p>

              {/* SORT */}
              <div className="relative">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-10 appearance-none rounded-xl border border-neutral-200 bg-white pl-4 pr-9 text-xs font-semibold outline-none dark:border-border dark:bg-card">
                  <option value="default">Default</option>
                  <option value="priceLow">Price Low → High</option>
                  <option value="priceHigh">Price High → Low</option>
                </select>

                <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>

            {/* FILTER CHIPS */}
            <AnimatePresence initial={false} mode="popLayout">
              {activeFilters.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-5 flex flex-wrap gap-2 overflow-hidden">
                  {activeFilters.map((f, i) => (
                    <FilterChip key={i} label={f.label} onRemove={f.onRemove} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* PRODUCTS GRID */}
            {loading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-200 py-28 text-center dark:border-border">
                <Search size={24} className="mb-4 text-neutral-400" />
                <h3 className="text-base font-black">No products found</h3>
                <p className="mt-2 text-sm text-neutral-500">Try changing filters</p>
                <button onClick={clearFilters} className="mt-5 rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold text-white">
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <motion.div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence initial={false} mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div key={product._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
