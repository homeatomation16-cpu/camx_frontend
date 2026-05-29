"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Package,
  Search,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Layers,
  CircleDollarSign,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

type Product = {
  _id: string;
  productId: string; // Backend එකට අවශ්‍ය productId එක මෙතැනට අර්ථ දක්වන ලදී
  name: string;
  price: number;
  labelPrice?: number;
  images: string[];
  category: string;
  brand?: string;
  model?: string;
  stock?: number;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 1. Fetch data from backend inside layout passes safely
  useEffect(() => {
    const fetchProductsOnMount = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/api/products`);
        setProducts(
          Array.isArray(response.data) ? response.data.reverse() : [],
        );
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load system products inventory.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductsOnMount();
  }, []);

  const handleManualRefresh = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/products`);
      setProducts(Array.isArray(response.data) ? response.data.reverse() : []);
      toast.success("Inventory log synchronization complete.");
    } catch (error) {
      console.error("Error manual sync product list:", error);
      toast.error("Failed to sync system products inventory.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Remove an explicit item asset completely from store database repository
  const handleDeleteProduct = async (productId: string) => {
    if (
      !window.confirm(
        "Are you absolutely sure you want to delete this product asset from the database?",
      )
    ) {
      return;
    }

    setDeletingId(productId);
    try {
      const token = localStorage.getItem("CAMX_TOKEN");
      // FIXED: _id වෙනුවට Controller එක බලාපොරොත්තු වන productId එක යවන ලදී
      await axios.delete(`${API}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Product asset removed successfully");
      setProducts((prev) => prev.filter((p) => p.productId !== productId));
    } catch (error) {
      console.error("Product deletion error:", error);
      toast.error("Failed to remove product asset from repository.");
    } finally {
      setDeletingId(null);
    }
  };

  // 3. Filter criteria node match checking logic
  const filteredProducts = products.filter((product) => {
    const nameMatch = product.name.toLowerCase().includes(search.toLowerCase());
    const categoryMatch = product.category
      .toLowerCase()
      .includes(search.toLowerCase());
    const brandMatch =
      product.brand?.toLowerCase().includes(search.toLowerCase()) || false;
    return nameMatch || categoryMatch || brandMatch;
  });

  return (
    <div className="p-6 sm:p-8 md:p-12 max-w-7xl mx-auto w-full transition-colors duration-300">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
            Inventory <span className="text-secondary">Products</span>
          </h1>
          <p className="text-sm text-neutral-500 dark:text-gray-400 mt-2">
            Manage your store repository, tracking assets, update pricing
            stocks, and remove hardware models.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          <button
            onClick={handleManualRefresh}
            className="inline-flex items-center gap-2 h-11 px-4 text-sm font-bold border border-border bg-white dark:bg-card rounded-xl hover:bg-neutral-50 dark:hover:bg-background transition cursor-pointer text-neutral-800 dark:text-white"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Sync</span>
          </button>

          <Link
            href="/admin/productAdd"
            className="inline-flex items-center gap-2 h-11 px-4 text-sm font-bold bg-secondary text-white rounded-xl hover:bg-opacity-90 transition shadow-md shadow-secondary/10"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* FILTER SEARCH INPUT BAR */}
      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-gray-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by product name, category, or brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-card border border-neutral-200 dark:border-border text-neutral-900 dark:text-white text-sm placeholder-neutral-400 dark:placeholder-gray-500 outline-none focus:border-secondary transition"
        />
      </div>

      {/* WORKSPACE LAYOUT RENDER STATEMENTS */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-72 bg-neutral-100 dark:bg-card border border-neutral-200 dark:border-border rounded-3xl"
            />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-card border border-border rounded-3xl p-8">
          <Package size={48} className="text-neutral-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            No products found
          </h2>
          <p className="text-sm text-neutral-500 dark:text-gray-400 mt-1">
            There are no matching hardware items registered inside the local
            repository layout filters.
          </p>
        </div>
      ) : (
        /* CORE INVENTORY LIST ASSET PRODUCT GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white dark:bg-card border border-neutral-200 dark:border-border rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between group hover:border-secondary transition duration-300"
            >
              {/* ASSET PRODUCT GRAPH IMAGE FRAME */}
              <div className="relative aspect-4/3 bg-neutral-50 dark:bg-neutral-950 p-4 flex items-center justify-center border-b border-neutral-100 dark:border-border/40 overflow-hidden">
                <Image
                  src={product.images?.[0] || "/placeholder.jpg"}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-contain p-4 group-hover:scale-105 transition duration-300"
                />

                {product.stock !== undefined && (
                  <span
                    className={`absolute bottom-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-black border ${product.stock > 0 ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}
                  >
                    {product.stock > 0
                      ? `${product.stock} In Stock`
                      : "Out of Stock"}
                  </span>
                )}
              </div>

              {/* SPECIFICATION CARD CONTENT DETAILS SLOT */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Layers size={10} /> {product.category}
                    </span>
                    {product.brand && <span>• {product.brand}</span>}
                  </div>

                  <h3 className="font-bold text-neutral-900 dark:text-white text-sm line-clamp-2 leading-relaxed">
                    {product.name}
                  </h3>

                  {product.model && (
                    <p className="text-[11px] font-medium text-neutral-400 dark:text-gray-500 truncate">
                      Mod: {product.model}
                    </p>
                  )}
                </div>

                {/* BOTTOM VALUATION & ACTION ROUTER LAYOUTS */}
                <div className="pt-3 border-t border-neutral-100 dark:border-border/40 flex items-center justify-between mt-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-neutral-400 flex items-center gap-0.5">
                      <CircleDollarSign size={10} /> Net Price
                    </span>
                    <span className="text-base font-black text-secondary">
                      LKR {product.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* FIXED: Link එකට ද දැන් productId එක සාර්ථකව සම්බන්ධ කර ඇත */}
                    <Link
                      href={`/admin/products/edit/${product.productId}`}
                      className="p-2 border border-border hover:border-secondary hover:text-secondary text-neutral-400 dark:text-gray-500 rounded-xl transition cursor-pointer"
                      title="Edit Product Details"
                    >
                      <Edit size={14} />
                    </Link>

                    <button
                      disabled={deletingId === product.productId}
                      onClick={() => handleDeleteProduct(product.productId)}
                      className="p-2 border border-border hover:border-red-500 hover:text-red-500 text-neutral-400 dark:text-gray-500 rounded-xl transition cursor-pointer disabled:opacity-40"
                      title="Delete Product from Store"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
