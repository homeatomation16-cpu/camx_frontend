'use client';

import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import {
  FaTruck,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaShieldAlt,
} from 'react-icons/fa';

import { motion } from 'framer-motion';
import { CgChevronRight } from 'react-icons/cg';

const API = process.env.NEXT_PUBLIC_API_BASE;

// ======================================
// TYPES
// ======================================

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

type CartItem = {
  _id: string;
  productId?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number;
};

// ======================================
// COMPONENT
// ======================================

export default function ProductOverviewPage() {
  const params = useParams();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  // ======================================
  // STATES
  // ======================================

  const [product, setProduct] =
    useState<Product | null>(null);

  const [selectedImage, setSelectedImage] =
    useState('');

  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);

  const [relatedProducts, setRelatedProducts] =
    useState<Product[]>([]);

  const [parsedSpecs, setParsedSpecs] =
    useState<SpecItem[]>([]);

  const [addedMessage, setAddedMessage] =
    useState(false);

  // ======================================
  // SAFE IMAGE
  // ======================================

  const safeImage = (image?: string) => {
    if (
      image &&
      !image.includes('example.com')
    ) {
      return image;
    }

    return '/placeholder.jpg';
  };

  // ======================================
  // LOAD DATA
  // ======================================

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // ======================================
        // GET CURRENT PRODUCT
        // ======================================

        const { data: current } =
          await axios.get(
            `${API}/api/products/${id}`
          );

        setProduct(current);

        setSelectedImage(
          current.images?.[0] ||
            '/placeholder.jpg'
        );

        // ======================================
        // PARSE SPECIFICATIONS
        // ======================================

        if (
          current.specifications?.featureData
        ) {
          try {
            const parsed = JSON.parse(
              current.specifications
                .featureData
            );

            setParsedSpecs(
              Array.isArray(parsed)
                ? parsed
                : []
            );
          } catch {
            setParsedSpecs([]);
          }
        } else {
          setParsedSpecs([]);
        }

        // ======================================
        // GET RELATED PRODUCTS
        // ======================================

        const { data: allProducts } =
          await axios.get(
            `${API}/api/products`
          );

        const productArray =
          allProducts.products ||
          allProducts ||
          [];

        const filtered = productArray
          .filter(
            (item: Product) =>
              item._id !== current._id &&
              item.category ===
                current.category
          )
          .slice(0, 4);

        setRelatedProducts(filtered);

      } catch (error) {

        console.error(
          'Fetch product error:',
          error
        );

      } finally {

        setLoading(false);

      }
    };

    fetchData();

  }, [id]);

  // ======================================
  // ADD TO CART
  // ======================================

  const handleAddToCart = () => {
    if (!product) return;

    const storedCart =
      localStorage.getItem(
        'CAMX_CART'
      );

    const currentCart: CartItem[] =
      storedCart
        ? JSON.parse(storedCart)
        : [];

    const existingIndex =
      currentCart.findIndex(
        (item) =>
          item._id === product._id
      );

    if (existingIndex > -1) {

      currentCart[
        existingIndex
      ].quantity += quantity;

    } else {

      currentCart.push({
        _id: product._id,
        productId:
          product.productId || '',
        name: product.name,
        price: product.price || 0,
        image:
          product.images?.[0] ||
          '/placeholder.jpg',
        quantity,
        stock: product.stock,
      });
    }

    localStorage.setItem(
      'CAMX_CART',
      JSON.stringify(currentCart)
    );

    window.dispatchEvent(
      new Event('storage')
    );

    setAddedMessage(true);

    setTimeout(() => {
      setAddedMessage(false);
    }, 3000);
  };

  // ======================================
  // PRICE CALCULATIONS
  // ======================================

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

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-2xl font-bold">
        Loading...
      </main>
    );
  }

  // ======================================
  // PRODUCT NOT FOUND
  // ======================================

  if (!product) {
    return (
      <main className="min-h-screen flex items-center justify-center text-2xl font-bold">
        Product Not Found
      </main>
    );
  }

  // ======================================
  // UI
  // ======================================

  return (
    <main className="min-h-screen bg-background text-neutral-900 dark:text-white pt-28 pb-28">

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-20">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-10">

          <Link href="/">
            Home
          </Link>

          <CgChevronRight />

          <Link href="/products">
            Products
          </Link>

          <CgChevronRight />

          <span className="font-semibold text-neutral-800 dark:text-white">
            {product.category}
          </span>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-2 gap-12">

          {/* IMAGES */}
          <motion.div
            initial={{
              opacity: 0,
              x: -40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
          >
            <div className="relative rounded-3xl border bg-neutral-50 dark:bg-white/5 h-150 overflow-hidden">

              {hasDiscount && (
                <div className="absolute top-5 right-5 z-20 bg-red-500 text-white px-4 py-2 rounded-2xl rotate-6 font-black">
                  SAVE {discount}%
                </div>
              )}

              <Image
                src={safeImage(
                  selectedImage
                )}
                alt={product.name}
                fill
                className="object-contain p-8"
                priority
              />
            </div>

            {/* THUMBNAILS */}
            <div className="flex gap-3 mt-5 flex-wrap">

              {product.images?.map(
                (img, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setSelectedImage(
                        img
                      )
                    }
                    className={`w-20 h-20 rounded-2xl border overflow-hidden ${
                      selectedImage === img
                        ? 'border-secondary'
                        : 'border-neutral-200'
                    }`}
                  >
                    <Image
                      src={safeImage(
                        img
                      )}
                      alt="thumb"
                      width={80}
                      height={80}
                      className="object-cover rounded-2xl w-full h-full"
                    />
                  </button>
                )
              )}
            </div>
          </motion.div>

          {/* DETAILS */}
          <motion.div
            initial={{
              opacity: 0,
              x: 40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
          >
            <h1 className="text-5xl font-black mb-5">
              {product.name}
            </h1>

            {/* PRICE */}
            <div className="p-6 bg-neutral-50 dark:bg-card border rounded-3xl mb-8">

              <span className="text-4xl font-black text-secondary">
                LKR{' '}
                {currentPrice.toLocaleString()}
              </span>

              {hasDiscount && (
                <span className="ml-4 line-through text-neutral-400 text-xl">
                  LKR{' '}
                  {oldPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* DESCRIPTION */}
            {product.description && (
              <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-300 mb-8">
                {product.description}
              </p>
            )}

            {/* QUANTITY */}
            <div className="flex items-center gap-4 mb-8">

              <div className="flex items-center h-14 rounded-2xl bg-neutral-100 dark:bg-white/5 border px-4">

                <button
                  onClick={() =>
                    setQuantity(
                      Math.max(
                        1,
                        quantity - 1
                      )
                    )
                  }
                >
                  <FaMinus size={12} />
                </button>

                <span className="w-12 text-center font-bold">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity(
                      quantity + 1
                    )
                  }
                >
                  <FaPlus size={12} />
                </button>
              </div>

              {/* ADD TO CART */}
              <button
                onClick={
                  handleAddToCart
                }
                className="flex-1 h-14 rounded-2xl bg-secondary text-white font-bold flex items-center justify-center gap-3 hover:opacity-90 transition"
              >
                <FaShoppingCart />
                Add to Cart
              </button>
            </div>

            {/* SUCCESS MESSAGE */}
            {addedMessage && (
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                className="bg-green-500/10 text-green-600 p-4 rounded-xl mb-6"
              >
                ✓ Added to your cart!
              </motion.div>
            )}

            {/* FEATURES */}
            <div className="grid grid-cols-2 gap-4 border-t pt-6">

              <div className="flex items-center gap-3">
                <FaShieldAlt className="text-secondary" />
                Warranty Included
              </div>

              <div className="flex items-center gap-3">
                <FaTruck className="text-secondary" />
                Islandwide Delivery
              </div>
            </div>
          </motion.div>
        </div>

        {/* SPECIFICATIONS */}
        {parsedSpecs.length > 0 && (
          <div className="mt-24 pt-16 border-t">

            <h2 className="text-3xl font-black mb-8">
              Technical Specifications
            </h2>

            {parsedSpecs.map(
              (spec, i) => (
                <div
                  key={i}
                  className="mb-10 p-10 bg-neutral-50 dark:bg-card rounded-3xl border"
                >
                  <h3 className="text-secondary font-black uppercase tracking-widest text-sm mb-4">
                    {spec.title}
                  </h3>

                  <p className="text-lg leading-relaxed">
                    {spec.value}
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t">

            <h2 className="text-3xl font-black mb-8">
              Related Products
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {relatedProducts.map(
                (item) => (
                  <Link
                    key={item._id}
                    href={`/products/${item._id}`}
                    className="border rounded-3xl p-5 hover:shadow-xl transition"
                  >
                    <div className="relative w-full h-52 mb-4">

                      <Image
                        src={safeImage(
                          item.images?.[0]
                        )}
                        alt={item.name}
                        fill
                        className="object-contain"
                      />
                    </div>

                    <h3 className="font-bold text-lg mb-2">
                      {item.name}
                    </h3>

                    <p className="text-secondary font-black text-xl">
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
        )}
      </div>
    </main>
  );
}