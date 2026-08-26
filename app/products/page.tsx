"use client";

import axios from "axios";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import ProductCard from "@/app/components/ProductCard";
import ProductsSidebar from "@/app/components/ProductsSidebar";
import PriceRangeSlider from "@/app/components/PriceRangeSlider";

const API = process.env.NEXT_PUBLIC_API_BASE;
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
  brand?: CategoryOrBrand;
};

// ── Skeleton Card ──────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white dark:border-border dark:bg-card">
      <div className="h-52 animate-pulse bg-neutral-100 dark:bg-neutral-800 sm:h-60" />
      <div className="p-4 space-y-3">
        <div className="h-2.5 w-16 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-3 w-full animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-3 w-3/4 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-5 w-24 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800 mt-2" />
        <div className="h-9 w-full animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800 mt-3" />
      </div>
    </div>
  );
}

// ── Active Filter Chip ─────────────────────────────────────────
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} className="flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/8 px-3 py-1.5 text-[11px] font-semibold text-secondary">
      {label}
      <button onClick={onRemove} className="hover:text-secondary/70 transition">
        <X size={11} />
      </button>
    </motion.span>
  );
}

// ── Main Page ──────────────────────────────────────────────────
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 3>(2);

  /* FETCH */
  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await axios.get(`${API}/api/products`);
        setProducts(data.products || data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  /* CATEGORY TREE */
  // Category/brand object wenna puluwan nisa, tree eke key ekak vidihata
  // danna kalin displayName() eken plain string ekakata convert karanawa.
  const categoryTree = useMemo(() => {
    const tree: Record<string, string[]> = {};
    products.forEach((p) => {
      const cat = displayName(p.category) || "Other";
      const sub = p.subcategory || "General";
      if (!tree[cat]) tree[cat] = [];
      if (!tree[cat].includes(sub)) tree[cat].push(sub);
    });
    return tree;
  }, [products]);

  /* BRANDS */
  const brands = useMemo(() => [...new Set(products.map((p) => displayName(p.brand) || "Other"))], [products]);

  function toggleBrand(brand: string) {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(brand) ? next.delete(brand) : next.add(brand);
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

  /* ACTIVE FILTERS (for chips) */
  const activeFilters = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = [];
    if (selectedCategory !== "All")
      chips.push({
        label: selectedCategory,
        onRemove: () => {
          setSelectedCategory("All");
          setSelectedSubcategory(null);
        },
      });
    if (selectedSubcategory)
      chips.push({
        label: selectedSubcategory,
        onRemove: () => setSelectedSubcategory(null),
      });
    selectedBrands.forEach((b) => chips.push({ label: b, onRemove: () => toggleBrand(b) }));
    if (minPrice > 0 || maxPrice < MAX_PRICE)
      chips.push({
        label: `Rs ${minPrice.toLocaleString()} – Rs ${maxPrice.toLocaleString()}`,
        onRemove: () => {
          setMinPrice(0);
          setMaxPrice(MAX_PRICE);
        },
      });
    return chips;
  }, [selectedCategory, selectedSubcategory, selectedBrands, minPrice, maxPrice]);

  /* FILTERED */
  // matchCat/matchBrand eth displayName() eken normalize karapu string ekakata
  // dan compare karanne — object vs string comparison eka nisa filter eka
  // kalin wada karala nathi wune.
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

    if (sortBy === "priceLow") result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "priceHigh") result = [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [products, search, selectedCategory, selectedSubcategory, selectedBrands, minPrice, maxPrice, sortBy]);

  /* SIDEBAR INNER (shared between desktop + mobile) */
  const sidebarContent = (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="h-4 w-4 text-secondary" />
          <h2 className="text-lg font-black">Filters</h2>
        </div>
        {activeFilters.length > 0 && (
          <button onClick={clearFilters} className="text-[11px] font-semibold text-neutral-400 hover:text-secondary transition">
            Clear all
          </button>
        )}
      </div>

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

      <ProductsSidebar categoryTree={categoryTree} brands={brands} selectedCategory={selectedCategory} selectedSubcategory={selectedSubcategory} selectedBrands={selectedBrands} openCategory={openCategory} setOpenCategory={setOpenCategory} setSelectedCategory={setSelectedCategory} setSelectedSubcategory={setSelectedSubcategory} toggleBrand={toggleBrand} clearFilters={clearFilters} />
    </div>
  );

  return (
    <main className="min-h-screen bg-background px-4 pb-24 pt-28 sm:px-6">
      <div className="mx-auto max-w-425">
        {/* ── HEADER ── */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-secondary">CAMX Store</p>
            <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white lg:text-5xl">Shop Products</h1>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Professional CCTV &amp; smart security solutions</p>
          </div>

          {/* SEARCH */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-12 w-full rounded-2xl border border-neutral-200 bg-white pl-11 pr-10 text-sm outline-none transition focus:border-secondary dark:border-border dark:bg-card" />
            <AnimatePresence>
              {search && (
                <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition">
                  <X size={14} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── LAYOUT ── */}
        <div className="flex gap-8">
          {/* ── DESKTOP SIDEBAR ── */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24 rounded-3xl border border-neutral-200 bg-white p-6 dark:border-border dark:bg-card">{sidebarContent}</div>
          </aside>

          {/* ── PRODUCTS COLUMN ── */}
          <div className="min-w-0 flex-1">
            {/* TOP BAR */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                {/* MOBILE FILTER BUTTON */}
                <button onClick={() => setMobileSidebarOpen(true)} className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-bold dark:border-border dark:bg-card lg:hidden">
                  <SlidersHorizontal size={13} />
                  Filters
                  {activeFilters.length > 0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[9px] font-black text-white">{activeFilters.length}</span>}
                </button>

                {/* COUNT */}
                <p className="text-sm text-neutral-500">
                  <span className="font-black text-secondary">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* GRID TOGGLE (desktop) */}
                <div className="hidden items-center gap-1 rounded-xl border border-neutral-200 p-1 dark:border-border lg:flex">
                  {([2, 3] as const).map((cols) => (
                    <button key={cols} onClick={() => setGridCols(cols)} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${gridCols === cols ? "bg-secondary text-white" : "text-neutral-400 hover:text-neutral-700"}`}>
                      {cols === 2 ? "Grid" : "Wide"}
                    </button>
                  ))}
                </div>

                {/* SORT */}
                <div className="relative">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-10 appearance-none rounded-xl border border-neutral-200 bg-white pl-4 pr-9 text-xs font-semibold outline-none transition focus:border-secondary dark:border-border dark:bg-card">
                    <option value="default">Default</option>
                    <option value="priceLow">Price: Low → High</option>
                    <option value="priceHigh">Price: High → Low</option>
                  </select>
                  <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>
            </div>

            {/* ACTIVE FILTER CHIPS */}
            <AnimatePresence>
              {activeFilters.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-5 flex flex-wrap gap-2 overflow-hidden">
                  {activeFilters.map((f, i) => (
                    <FilterChip key={i} label={f.label} onRemove={f.onRemove} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* GRID */}
            {loading ? (
              <div className={`grid gap-4 grid-cols-2 ${gridCols === 3 ? "md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" : "md:grid-cols-3 xl:grid-cols-4"}`}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-200 py-28 text-center dark:border-border">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-card">
                  <Search size={24} className="text-neutral-400" />
                </div>
                <h3 className="text-base font-black">No products found</h3>
                <p className="mt-2 text-sm text-neutral-500">Try adjusting your search or filters</p>
                <button onClick={clearFilters} className="mt-5 rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90">
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <motion.div layout className={`grid gap-4 grid-cols-2 ${gridCols === 3 ? "md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" : "md:grid-cols-3 xl:grid-cols-4"}`}>
                <AnimatePresence>
                  {filteredProducts.map((product, i) => (
                    <motion.div key={product._id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03, duration: 0.28 }}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 320, damping: 32 }} className="fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto bg-white p-6 dark:bg-card lg:hidden">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-base font-black">Filters</span>
                <button onClick={() => setMobileSidebarOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <X size={15} />
                </button>
              </div>
              {sidebarContent}
              <button onClick={() => setMobileSidebarOpen(false)} className="mt-8 w-full rounded-2xl bg-secondary py-3 text-sm font-bold text-white">
                Show {filteredProducts.length} Results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
