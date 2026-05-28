'use client';

import Link from 'next/link';

import Image from 'next/image';

// ======================================
// TYPES
// ======================================

type Product = {
  _id: string;

  productId?: string;

  name: string;

  price?: number;

  images?: string[];
};

type Props = {
  products: Product[];
};

// ======================================
// COMPONENT
// ======================================

export default function RelatedProducts({
  products,
}: Props) {

  // ======================================
  // SAFE IMAGE
  // ======================================

  const safeImage = (
    image?: string
  ) => {

    if (
      image &&
      !image.includes(
        'example.com'
      )
    ) {

      return image;
    }

    return '/placeholder.jpg';
  };

  // ======================================
  // EMPTY
  // ======================================

  if (
    products.length === 0
  ) {

    return null;
  }

  // ======================================
  // UI
  // ======================================

  return (

    <div className="mt-20 pt-14 border-t">

      {/* TITLE */}
      <h2 className="text-2xl lg:text-3xl font-black mb-6">

        Related Products
      </h2>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {products.map(
          (item) => (

            <Link
              key={item._id}
              href={`/products/${item.productId || item._id}`}
              className="border rounded-3xl p-4 hover:shadow-xl transition bg-white dark:bg-card"
            >

              {/* IMAGE */}
              <div className="relative w-full h-44 mb-4">

                <Image
                  src={safeImage(
                    item.images?.[0]
                  )}
                  alt={item.name}
                  fill
                  className="object-contain"
                />
              </div>

              {/* NAME */}
              <h3 className="font-bold text-sm lg:text-base mb-2 line-clamp-2">

                {item.name}
              </h3>

              {/* PRICE */}
              <p className="text-secondary font-black text-lg">

                LKR{' '}
                {Number(
                  item.price || 0
                ).toLocaleString()}
              </p>
            </Link>
          )
        )}
      </div>
    </div>
  );
}