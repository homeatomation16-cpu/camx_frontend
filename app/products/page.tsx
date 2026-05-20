'use client';

import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

import ProductCard from '@/app/components/ProductCard';

const API = process.env.NEXT_PUBLIC_API_BASE;

type Product = {
  _id: string;
  productId?: string;
  name: string;
  price: number;
  labelledPrice?: number;
  images: string[];
  category: string;
  description?: string;
  stock?: number;
  brand?: string;
};

// =========================
// SKELETON CARD
// =========================

function SkeletonCard() {
  return (
    <div
      className="
        bg-neutral-50
        dark:bg-card
        border
        border-neutral-200
        dark:border-border
        rounded-2xl
        overflow-hidden
        animate-pulse
        transition-colors
        duration-300
      "
    >
      <div
        className="
          aspect-4/3
          bg-neutral-200
          dark:bg-[#1a2235]
        "
      />

      <div className="p-5 space-y-3">
        <div
          className="
            h-3
            w-16
            bg-neutral-200
            dark:bg-[#1a2235]
            rounded-full
          "
        />

        <div
          className="
            h-4
            w-3/4
            bg-neutral-200
            dark:bg-[#1a2235]
            rounded-full
          "
        />

        <div
          className="
            h-3
            w-full
            bg-neutral-200
            dark:bg-[#1a2235]
            rounded-full
          "
        />

        <div
          className="
            h-3
            w-2/3
            bg-neutral-200
            dark:bg-[#1a2235]
            rounded-full
          "
        />

        <div
          className="
            mt-4
            h-10
            bg-neutral-200
            dark:bg-[#1a2235]
            rounded-xl
          "
        />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState('');

  const [selectedCategory, setSelectedCategory] =
    useState('All');

  const [sortBy, setSortBy] = useState<
    'default' | 'price-asc' | 'price-desc'
  >('default');

  // =========================
  // FETCH PRODUCTS
  // =========================

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);

        const response =
          await axios.get(
            `${API}/api/products`
          );

        // HANDLE MULTIPLE RESPONSE STRUCTURES
        const productsData =
          response.data.products ||
          response.data ||
          [];

        setProducts(productsData);

      } catch (error) {

        console.error(
          'Fetch error:',
          error
        );

      } finally {

        setLoading(false);

      }
    }

    queueMicrotask(() => {
      fetchProducts();
    });

  }, []);

  // =========================
  // CATEGORIES
  // =========================

  const categories = useMemo(() => {

    const unique = products.map(
      (p) => p.category
    );

    return [
      'All',
      ...new Set(unique),
    ];

  }, [products]);

  // =========================
  // FILTER + SORT
  // =========================

  const filteredProducts =
    useMemo(() => {

      let result = products.filter(
        (product) => {

          const matchesSearch =
            product.name
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesCategory =
            selectedCategory === 'All'
              ? true
              : product.category ===
                selectedCategory;

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );

      // PRICE ASC
      if (sortBy === 'price-asc') {

        result = [...result].sort(
          (a, b) =>
            a.price - b.price
        );

      }

      // PRICE DESC
      if (sortBy === 'price-desc') {

        result = [...result].sort(
          (a, b) =>
            b.price - a.price
        );

      }

      return result;

    }, [
      products,
      search,
      selectedCategory,
      sortBy,
    ]);

  return (
    <main
      className="
        min-h-screen
        bg-background
        text-foreground
        pt-28
        pb-24
        px-4
        sm:px-6
        transition-colors
        duration-300
      "
    >
      <div className="max-w-7xl mx-auto">

        {/* PAGE HEADER */}
        <div className="mb-12">

          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-secondary
              mb-3
            "
          >
            Security Solutions
          </p>

          <h1
            className="
              text-4xl
              sm:text-5xl
              font-black
              tracking-tight
              text-neutral-900
              dark:text-white
            "
          >
            All{' '}
            <span className="text-secondary">
              Products
            </span>
          </h1>

          <p
            className="
              mt-4
              text-neutral-500
              dark:text-gray-400
              max-w-xl
              leading-relaxed
            "
          >
            Professional-grade CCTV
            cameras, NVR systems,
            alarm systems, and smart
            security solutions.
          </p>

        </div>

        {/* FILTER BAR */}
        <div
          className="
            sticky
            top-20
            z-20
            bg-white/90
            dark:bg-background/90
            backdrop-blur-md
            border-b
            border-neutral-200
            dark:border-border
            -mx-4
            sm:-mx-6
            px-4
            sm:px-6
            py-4
            mb-10
            transition-colors
            duration-300
          "
        >
          <div
            className="
              max-w-7xl
              mx-auto
              flex
              flex-col
              sm:flex-row
              gap-4
              items-stretch
              sm:items-center
              justify-between
            "
          >

            {/* SEARCH */}
            <div
              className="
                relative
                w-full
                sm:w-72
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  w-4
                  h-4
                  text-neutral-400
                  dark:text-gray-600
                  pointer-events-none
                "
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                />

                <path d="m21 21-4.35-4.35" />
              </svg>

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className="
                  w-full
                  h-11
                  pl-10
                  pr-4
                  rounded-xl
                  bg-neutral-50
                  dark:bg-card
                  border
                  border-neutral-200
                  dark:border-border
                  text-neutral-900
                  dark:text-white
                  text-sm
                  placeholder-neutral-400
                  dark:placeholder-gray-600
                  outline-none
                  focus:border-secondary
                  transition
                "
              />
            </div>

            {/* FILTERS */}
            <div
              className="
                flex
                flex-wrap
                gap-2
                items-center
              "
            >

              {/* CATEGORY */}
              <div
                className="
                  flex
                  flex-wrap
                  gap-2
                "
              >
                {categories.map(
                  (
                    category,
                    index
                  ) => (
                    <button
                      key={index}
                      onClick={() =>
                        setSelectedCategory(
                          category
                        )
                      }
                      className={`
                        px-4
                        py-2
                        rounded-xl
                        text-[13px]
                        font-semibold
                        transition-all
                        duration-200
                        cursor-pointer
                        ${
                          selectedCategory ===
                          category
                            ? 'bg-secondary text-white'
                            : `
                              bg-neutral-50
                              dark:bg-card
                              border
                              border-neutral-200
                              dark:border-border
                              text-neutral-600
                              dark:text-gray-400
                              hover:border-secondary/40
                              hover:text-neutral-900
                              dark:hover:text-gray-200
                            `
                        }
                      `}
                    >
                      {category}
                    </button>
                  )
                )}
              </div>

              {/* SORT */}
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target
                      .value as typeof sortBy
                  )
                }
                className="
                  h-10
                  px-3
                  rounded-xl
                  bg-neutral-50
                  dark:bg-card
                  border
                  border-neutral-200
                  dark:border-border
                  text-neutral-600
                  dark:text-gray-400
                  text-[13px]
                  outline-none
                  focus:border-secondary
                  cursor-pointer
                  transition-colors
                  duration-200
                "
              >
                <option value="default">
                  Sort: Default
                </option>

                <option value="price-asc">
                  Price: Low → High
                </option>

                <option value="price-desc">
                  Price: High → Low
                </option>
              </select>

            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              gap-5
            "
          >
            {Array.from({
              length: 8,
            }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>

        ) : filteredProducts.length ===
          0 ? (

          /* EMPTY STATE */
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              py-32
              text-center
            "
          >
            <div
              className="
                w-16
                h-16
                rounded-2xl
                bg-neutral-50
                dark:bg-card
                border
                border-neutral-200
                dark:border-border
                flex
                items-center
                justify-center
                mb-6
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="
                  w-7
                  h-7
                  text-neutral-400
                  dark:text-gray-600
                "
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                />

                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>

            <h2
              className="
                text-xl
                font-bold
                text-neutral-900
                dark:text-white
                mb-2
              "
            >
              No products found
            </h2>

            <p
              className="
                text-neutral-500
                dark:text-gray-600
                mb-6
                max-w-xs
              "
            >
              Try adjusting your
              search or selecting a
              different category.
            </p>

            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory(
                  'All'
                );
              }}
              className="
                px-5
                py-2.5
                rounded-xl
                bg-secondary
                text-white
                font-bold
                text-sm
                hover:bg-opacity-90
                transition
                cursor-pointer
              "
            >
              Clear filters
            </button>
          </div>

        ) : (

          <>
            {/* RESULTS */}
            <div
              className="
                mb-6
                text-[13px]
                text-neutral-500
                dark:text-gray-600
              "
            >
              Showing{' '}
              <span
                className="
                  text-secondary
                  font-semibold
                "
              >
                {
                  filteredProducts.length
                }
              </span>{' '}
              product
              {filteredProducts.length !==
              1
                ? 's'
                : ''}

              {selectedCategory !==
                'All' && (
                <>
                  {' '}
                  in{' '}
                  <span
                    className="
                      text-neutral-800
                      dark:text-white
                      font-medium
                    "
                  >
                    {selectedCategory}
                  </span>
                </>
              )}
            </div>

            {/* PRODUCT GRID */}
            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-4
                gap-6
              "
            >
              {filteredProducts.map(
                (product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                  />
                )
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}