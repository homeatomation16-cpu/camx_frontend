"use client";

import { ChevronDown } from "lucide-react";

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

export default function ProductsSidebar({
  categoryTree,
  brands,
  selectedCategory,
  selectedSubcategory,
  selectedBrands,
  openCategory,
  setOpenCategory,
  setSelectedCategory,
  setSelectedSubcategory,
  toggleBrand,
  clearFilters,
}: Props) {
  return (
    <div>
      {/* CATEGORY */}
      <div className="mb-10">
        <h3
          className="
            mb-5
            text-sm
            font-bold
            uppercase
          "
        >
          Categories
        </h3>

        <div className="space-y-4">
          {/* ALL */}
          <button
            onClick={() => {
              setSelectedCategory("All");

              setSelectedSubcategory(null);
            }}
            className={`
              block
              text-sm
              ${
                selectedCategory === "All"
                  ? "font-semibold text-secondary"
                  : "text-neutral-700 dark:text-gray-300"
              }
            `}
          >
            All Products
          </button>

          {/* CATEGORIES */}
          {Object.entries(categoryTree).map(([category, subcategories]) => (
            <div key={category}>
              <button
                onClick={() => {
                  setOpenCategory(openCategory === category ? null : category);

                  setSelectedCategory(category);

                  setSelectedSubcategory(null);
                }}
                className="
                    flex
                    w-full
                    items-center
                    justify-between
                    text-left
                    text-sm
                    font-medium
                  "
              >
                <span
                  className={
                    selectedCategory === category && !selectedSubcategory
                      ? "text-secondary"
                      : "text-neutral-700 dark:text-gray-300"
                  }
                >
                  {category}
                </span>

                <ChevronDown
                  className={`
                      h-4
                      w-4
                      transition-transform
                      ${openCategory === category ? "rotate-180" : ""}
                    `}
                />
              </button>

              {/* SUBCATEGORIES */}
              {openCategory === category && (
                <div
                  className="
                      ml-4
                      mt-3
                      space-y-2
                    "
                >
                  {subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => {
                        setSelectedCategory(category);

                        setSelectedSubcategory(sub);
                      }}
                      className={`
                            block
                            text-sm
                            ${
                              selectedSubcategory === sub
                                ? "font-semibold text-secondary"
                                : "text-neutral-500 dark:text-gray-500"
                            }
                          `}
                    >
                      • {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* BRANDS */}
      <div className="mb-8">
        <h3
          className="
            mb-5
            text-sm
            font-bold
            uppercase
          "
        >
          Brands
        </h3>

        <div className="space-y-4">
          {brands.map((brand) => (
            <label
              key={brand}
              className="
                flex
                cursor-pointer
                items-center
                gap-3
              "
            >
              <input
                type="checkbox"
                checked={selectedBrands.has(brand)}
                onChange={() => toggleBrand(brand)}
                className="
                  h-4
                  w-4
                  rounded
                  accent-secondary
                "
              />

              <span
                className="
                  text-sm
                  text-neutral-700
                  dark:text-gray-300
                "
              >
                {brand}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* CLEAR */}
      <button
        onClick={clearFilters}
        className="
          w-full
          rounded-xl
          border
          border-secondary
          py-3
          text-sm
          font-semibold
          text-secondary
          transition
          hover:bg-secondary
          hover:text-white
        "
      >
        Clear Filters
      </button>
    </div>
  );
}
