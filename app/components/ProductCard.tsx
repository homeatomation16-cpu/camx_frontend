"use client";

import Image from "next/image";
import Link from "next/link";

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

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const discount =
    product.labelPrice && product.labelPrice > product.price
      ? Math.round((1 - product.price / product.labelPrice) * 100)
      : null;

  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-xl
        border
        border-neutral-200
        dark:border-border
        bg-white
        dark:bg-card
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >
      {/* IMAGE */}
      <div
        className="
          relative
          h-52
          overflow-hidden
          bg-neutral-100
          dark:bg-[#101624]
        "
      >
        <Image
          src={product.images?.[0] || "/placeholder.jpg"}
          alt={product.name}
          fill
          className="
            object-cover
            transition-transform
            duration-500
            group-hover:scale-105
          "
        />

        {/* DISCOUNT */}
        {discount && (
          <div
            className="
              absolute
              left-3
              top-3
              rounded-md
              bg-secondary
              px-2
              py-1
              text-[10px]
              font-bold
              uppercase
              tracking-wide
              text-white
            "
          >
            -{discount}%
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-3">
        {/* BRAND */}
        <p
          className="
            mb-1
            text-[10px]
            font-semibold
            uppercase
            tracking-wide
            text-secondary
          "
        >
          {product.brand || "CAMX"}
        </p>

        {/* TITLE */}
        <h3
          className="
            line-clamp-2
            min-h-10
            text-sm
            font-semibold
            leading-5
            text-neutral-900
            dark:text-white
          "
        >
          {product.name}
        </h3>

        {/* PRICE */}
        <div
          className="
            mt-3
            flex
            items-center
            gap-2
          "
        >
          <span
            className="
              text-base
              font-black
              text-secondary
            "
          >
            Rs {product.price.toLocaleString()}
          </span>

          {product.labelPrice && (
            <span
              className="
                text-xs
                text-neutral-400
                line-through
              "
            >
              Rs {product.labelPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* STOCK */}
        {product.stock !== undefined && (
          <p
            className="
              mt-1
              text-[11px]
              text-neutral-500
              dark:text-gray-500
            "
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>
        )}

        {/* BUTTON */}
        <Link
          href={`/products/${product.productId || product._id}`}
          className="
            mt-4
            flex
            h-9
            w-full
            items-center
            justify-center
            rounded-lg
            bg-secondary
            text-sm
            font-semibold
            text-white
            transition-all
            duration-300
            hover:opacity-90
          "
        >
          View Product
        </Link>
      </div>
    </div>
  );
}
