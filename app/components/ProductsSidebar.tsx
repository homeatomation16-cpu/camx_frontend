"use client";

import { ChevronDown, Tag, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  categoryTree: Record<string, string[]>;
  brands: string[];
  selectedCategory: string;
  selectedSubcategory: string | null;
  selectedBrands: Set<string>;
  openCategory: string | null;
  setOpenCategory: (category: string | null) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedSubcategory: (subcategory: string | null) => void;
  toggleBrand: (brand: string) => void;
  clearFilters: () => void;
};

export default function ProductsSidebar({ categoryTree, brands, selectedCategory, selectedSubcategory, selectedBrands, openCategory, setOpenCategory, setSelectedCategory, setSelectedSubcategory, toggleBrand, clearFilters }: Props) {
  const totalActive = (selectedCategory !== "All" ? 1 : 0) + (selectedSubcategory ? 1 : 0) + selectedBrands.size;

  return (
    <div className="space-y-8">
      {/* ── CATEGORIES ── */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Tag size={13} className="text-secondary" />
          <h3 className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Categories</h3>
        </div>

        <div className="space-y-1">
          {/* ALL */}
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSelectedSubcategory(null);
              setOpenCategory(null);
            }}
            className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-all ${selectedCategory === "All" ? "bg-secondary/10 font-bold text-secondary" : "font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5"}`}
          >
            <span>All Products</span>
            {selectedCategory === "All" && <motion.div layoutId="cat-dot" className="h-1.5 w-1.5 rounded-full bg-secondary" />}
          </button>

          {/* CATEGORY ITEMS */}
          {Object.entries(categoryTree).map(([category, subcategories]) => {
            const isOpen = openCategory === category;
            const isSelected = selectedCategory === category;

            return (
              <div key={category}>
                <button
                  onClick={() => {
                    setOpenCategory(isOpen ? null : category);
                    setSelectedCategory(category);
                    setSelectedSubcategory(null);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-all ${isSelected && !selectedSubcategory ? "bg-secondary/10 font-bold text-secondary" : "font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5"}`}
                >
                  <span>{category}</span>
                  <div className="flex items-center gap-2">
                    {isSelected && !selectedSubcategory && <motion.div layoutId="cat-dot" className="h-1.5 w-1.5 rounded-full bg-secondary" />}
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={14} className="text-neutral-400" />
                    </motion.div>
                  </div>
                </button>

                {/* SUBCATEGORIES */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} className="overflow-hidden">
                      <div className="ml-3 mt-1 space-y-0.5 border-l border-neutral-200 pl-3 dark:border-neutral-700">
                        {subcategories.map((sub) => {
                          const isSubSelected = selectedSubcategory === sub;
                          return (
                            <button
                              key={sub}
                              onClick={() => {
                                setSelectedCategory(category);
                                setSelectedSubcategory(sub);
                              }}
                              className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[13px] transition-all ${isSubSelected ? "font-bold text-secondary" : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white"}`}
                            >
                              <span>{sub}</span>
                              {isSubSelected && <div className="h-1.5 w-1.5 rounded-full bg-secondary" />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* DIVIDER */}
      <div className="h-px bg-neutral-100 dark:bg-neutral-800" />

      {/* ── BRANDS ── */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Cpu size={13} className="text-secondary" />
          <h3 className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Brands</h3>
        </div>

        <div className="space-y-1">
          {brands.map((brand) => {
            const checked = selectedBrands.has(brand);
            return (
              <label key={brand} className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-all ${checked ? "bg-secondary/10" : "hover:bg-neutral-100 dark:hover:bg-white/5"}`}>
                {/* CUSTOM CHECKBOX */}
                <div className="relative flex items-center">
                  <input type="checkbox" checked={checked} onChange={() => toggleBrand(brand)} className="peer sr-only" />
                  <div className={`flex h-4 w-4 items-center justify-center rounded border transition-all ${checked ? "border-secondary bg-secondary" : "border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800"}`}>
                    <AnimatePresence>
                      {checked && (
                        <motion.svg initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.15 }} viewBox="0 0 12 12" width={10} height={10} fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <span className={`text-sm transition ${checked ? "font-semibold text-secondary" : "text-neutral-600 dark:text-neutral-300"}`}>{brand}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ── CLEAR BUTTON ── */}
      <AnimatePresence>
        {totalActive > 0 && (
          <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} onClick={clearFilters} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-secondary py-2.5 text-sm font-bold text-secondary transition hover:bg-secondary hover:text-white">
            Clear Filters
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-black text-white transition group-hover:bg-white group-hover:text-secondary">{totalActive}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
