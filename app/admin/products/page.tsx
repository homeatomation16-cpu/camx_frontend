/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Image from "next/image";
import mammoth from "mammoth";
import { useEffect, useState, useCallback, type ChangeEvent } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_BASE;

// =========================
// CATEGORY TREE TYPES & UTILS
// =========================

type CategoryNode = {
  _id: string;
  name: string;
  slug: string;
  level: number;
  isActive: boolean;
  children: CategoryNode[];
};

type CategoryOption = {
  _id: string;
  label: string;
  level: number;
  isActive: boolean;
};

function flattenCategoryTree(nodes: CategoryNode[]): CategoryOption[] {
  const options: CategoryOption[] = [];

  const walk = (list: CategoryNode[]) => {
    for (const node of list) {
      const prefix = node.level > 0 ? "\u2014 ".repeat(node.level) : "";
      options.push({
        _id: node._id,
        label: `${prefix}${node.name}`,
        level: node.level,
        isActive: node.isActive,
      });
      if (node.children && node.children.length > 0) {
        walk(node.children);
      }
    }
  };

  walk(nodes);
  return options;
}

// =========================
// PRODUCT TYPES
// =========================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CategoryOrBrand = string | { _id?: string; name?: string; slug?: string; [key: string]: any };

type Product = {
  _id?: string;
  productId: string;
  name: string;
  description: string;
  price: number;
  labelPrice: number;
  images: string[];
  category: CategoryOrBrand;
  brand: CategoryOrBrand;
  stock: number;
  isAvailable: boolean;
  specifications?: {
    featureData?: string;
  };
  // ✅ Shipping Options එකතු කළා
  shippingOptions?: {
    priceMatch?: boolean;
    protectionPlan?: boolean;
    protectionFeePercentage?: number;
    freeDelivery?: boolean;
    deliveryDaysMin?: number;
    deliveryDaysMax?: number;
    pickupAvailable?: boolean;
    pickupTime?: string;
  };
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Categories States
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // =========================
  // FETCH CATEGORIES
  // =========================
  useEffect(() => {
    const fetchCategoryTree = async () => {
      try {
        setCategoriesLoading(true);
        const res = await axios.get(`${API}/api/categories/tree`);
        const tree: CategoryNode[] = res.data || [];
        setCategoryOptions(flattenCategoryTree(tree));
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategoryTree();
  }, []);

  // =========================
  // FETCH PRODUCTS
  // =========================
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("CAMX_TOKEN");

      const res = await axios.get(`${API}/api/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    if (!editingProduct) return;
    const { name, value } = e.target;
    setEditingProduct({
      ...editingProduct,
      [name]: name === "price" || name === "labelPrice" || name === "stock" ? Number(value) : value,
    });
  }

  // =========================
  // DOCX TEMPLATE IMPORT
  // =========================
  const handleDocxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingProduct) return;
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;

      setEditingProduct({
        ...editingProduct,
        specifications: {
          featureData: html,
        },
      });

      alert("DOCX template imported successfully");
    } catch (error) {
      console.log(error);
      alert("Failed to import DOCX file");
    }
  };

  // =========================
  // UPDATE PRODUCT
  // =========================
  async function handleUpdate() {
    if (!editingProduct) return;

    try {
      const token = localStorage.getItem("CAMX_TOKEN");

      const updatePayload = { ...editingProduct };

      // Category / Brand resolving
      if (typeof updatePayload.category === "object" && updatePayload.category !== null) {
        updatePayload.category = updatePayload.category._id ?? updatePayload.category.name ?? "";
      }
      if (typeof updatePayload.brand === "object" && updatePayload.brand !== null) {
        updatePayload.brand = updatePayload.brand._id ?? updatePayload.brand.name ?? "";
      }

      // Shipping Options: Convert percentage back (e.g., 6 -> 0.06)
      if (updatePayload.shippingOptions?.protectionFeePercentage) {
        updatePayload.shippingOptions.protectionFeePercentage = updatePayload.shippingOptions.protectionFeePercentage / 100;
      }

      delete updatePayload._id;

      await axios.put(`${API}/api/products/${editingProduct.productId}`, updatePayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Product updated successfully");

      setEditingProduct(null);
      fetchProducts();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      console.error("Update Error:", axiosError.response?.data || axiosError.message);
      const errorMsg = axiosError.response?.data?.message || "Failed to update product. Check console for details.";
      alert(`Error: ${errorMsg}`);
    }
  }

  // =========================
  // DELETE PRODUCT
  // =========================
  async function handleDelete(productId: string) {
    const confirmDelete = confirm("Delete this product?");

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("CAMX_TOKEN");
      await axios.delete(`${API}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchProducts();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-black">Admin Products</h1>
        <p className="mt-2 text-muted-foreground">Manage and update products</p>
      </div>

      {/* EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-card border border-border rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-6">Update Product</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* NAME */}
              <input type="text" name="name" value={editingProduct.name || ""} onChange={handleChange} placeholder="Product Name" className="h-12 px-4 rounded-xl border border-border bg-background outline-none" />

              {/* CATEGORY DROPDOWN */}
              <select name="category" value={typeof editingProduct.category === "object" ? editingProduct.category?._id || "" : editingProduct.category || ""} onChange={handleChange} disabled={categoriesLoading || categoryOptions.length === 0} className="h-12 px-4 rounded-xl border border-border bg-background outline-none appearance-none cursor-pointer disabled:opacity-50">
                <option value="" disabled>
                  {categoriesLoading ? "Loading categories..." : "Select a Category"}
                </option>
                {categoryOptions.map((opt) => (
                  <option key={opt._id} value={opt._id} disabled={!opt.isActive}>
                    {opt.label} {!opt.isActive && "(inactive)"}
                  </option>
                ))}
              </select>

              {/* BRAND */}
              <input type="text" name="brand" value={typeof editingProduct.brand === "object" ? editingProduct.brand?.name || "" : editingProduct.brand || ""} onChange={handleChange} placeholder="Brand" className="h-12 px-4 rounded-xl border border-border bg-background outline-none" />

              {/* PRICE */}
              <input type="number" name="price" value={editingProduct.price || 0} onChange={handleChange} placeholder="Price" className="h-12 px-4 rounded-xl border border-border bg-background outline-none" />

              {/* LABEL PRICE */}
              <input type="number" name="labelPrice" value={editingProduct.labelPrice || 0} onChange={handleChange} placeholder="Label Price" className="h-12 px-4 rounded-xl border border-border bg-background outline-none" />

              {/* STOCK */}
              <input type="number" name="stock" value={editingProduct.stock || 0} onChange={handleChange} placeholder="Stock" className="h-12 px-4 rounded-xl border border-border bg-background outline-none" />

              {/* DESCRIPTION */}
              <textarea name="description" value={editingProduct.description || ""} onChange={handleChange} rows={5} placeholder="Description" className="md:col-span-2 p-4 rounded-2xl border border-border bg-background outline-none" />

              {/* =========================
                  SHIPPING & PROTECTION SECTION
                  ========================= */}
              <div className="md:col-span-2 pt-4 border-t border-border mt-2">
                <h3 className="text-lg font-bold mb-4">Shipping & Protection Options</h3>

                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
                  {/* PRICE MATCH */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="priceMatch" checked={editingProduct.shippingOptions?.priceMatch} onChange={handleShippingChange} className="w-5 h-5 accent-secondary" />
                    <span className="text-sm font-semibold">Enable Price Match Guarantee</span>
                  </label>

                  {/* FREE DELIVERY */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="freeDelivery" checked={editingProduct.shippingOptions?.freeDelivery} onChange={handleShippingChange} className="w-5 h-5 accent-secondary" />
                    <span className="text-sm font-semibold">Free Delivery</span>
                  </label>

                  {/* PROTECTION PLAN */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" name="protectionPlan" checked={editingProduct.shippingOptions?.protectionPlan} onChange={handleShippingChange} className="w-5 h-5 accent-secondary" />
                      <span className="text-sm font-semibold">Enable Protection Plan</span>
                    </label>
                    {editingProduct.shippingOptions?.protectionPlan && (
                      <div className="flex items-center gap-3 pl-8">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Fee Percentage:</span>
                        <div className="relative w-24">
                          <input type="number" name="protectionFeePercentage" value={editingProduct.shippingOptions?.protectionFeePercentage || ""} onChange={handleShippingChange} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DELIVERY DAYS */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase text-muted-foreground">Estimated Delivery Days</label>
                    <div className="flex items-center gap-3">
                      <input type="number" name="deliveryDaysMin" value={editingProduct.shippingOptions?.deliveryDaysMin || ""} onChange={handleShippingChange} placeholder="Min" className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                      <span className="text-muted-foreground font-bold">to</span>
                      <input type="number" name="deliveryDaysMax" value={editingProduct.shippingOptions?.deliveryDaysMax || ""} onChange={handleShippingChange} placeholder="Max" className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                    </div>
                  </div>

                  {/* STORE PICKUP */}
                  <div className="space-y-3 sm:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" name="pickupAvailable" checked={editingProduct.shippingOptions?.pickupAvailable} onChange={handleShippingChange} className="w-5 h-5 accent-secondary" />
                      <span className="text-sm font-semibold">Available for Store Pickup</span>
                    </label>
                    {editingProduct.shippingOptions?.pickupAvailable && (
                      <div className="pl-8">
                        <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Pickup Details</label>
                        <input type="text" name="pickupTime" value={editingProduct.shippingOptions?.pickupTime || ""} onChange={handleShippingChange} placeholder="e.g. 24h at our Colombo showroom" className="w-full sm:w-1/2 h-10 px-4 rounded-xl border border-border bg-background outline-none" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* ========================= */}

              {/* DOCX IMPORT */}
              <div className="md:col-span-2">
                <label
                  className="
                    block
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-neutral-500
                    dark:text-gray-400
                    mb-2
                  "
                >
                  Upload DOCX Specification Template
                </label>

                <input
                  type="file"
                  accept=".docx"
                  onChange={handleDocxUpload}
                  className="
                    block
                    w-full
                    text-sm
                    text-neutral-500
                    file:mr-4
                    file:py-2.5
                    file:px-4
                    file:rounded-xl
                    file:border-0
                    file:text-sm
                    file:font-bold
                    file:bg-neutral-100
                    file:text-neutral-700
                    cursor-pointer
                  "
                />
              </div>

              {/* TEMPLATE PREVIEW */}
              {editingProduct?.specifications?.featureData && (
                <div
                  className="
                    md:col-span-2
                    mt-4
                    rounded-3xl
                    border
                    border-border
                    bg-white
                    p-6
                    overflow-x-auto
                  "
                >
                  <div
                    className="
                      prose
                      prose-sm
                      max-w-none
                      prose-table:w-full
                      prose-table:border
                      prose-td:border
                      prose-th:border
                      prose-td:p-2
                      prose-th:p-2
                    "
                    dangerouslySetInnerHTML={{
                      __html: editingProduct.specifications?.featureData || "",
                    }}
                  />
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleUpdate}
                className="
                  h-12
                  px-6
                  rounded-xl
                  bg-secondary
                  text-white
                  font-bold
                "
              >
                Update Product
              </button>

              <button
                onClick={() => setEditingProduct(null)}
                className="
                  h-12
                  px-6
                  rounded-xl
                  border
                  border-border
                "
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS GRID */}
      {loading ? (
        <div className="py-20 text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.productId || product._id} className="overflow-hidden rounded-3xl border border-border bg-card">
              <div className="relative w-full h-60">
                <Image src={product.images?.[0] || "/placeholder-image.jpg"} alt={product.name || "Product Image"} fill unoptimized loading="eager" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
              </div>

              <div className="p-5">
                <h2 className="text-xl font-black">{product.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{typeof product.category === "object" ? product.category?.name || "Unknown Category" : product.category || "Unknown Category"}</p>

                <div className="mt-4">
                  <p
                    className="
                      text-2xl
                      font-black
                    "
                  >
                    Rs.
                    {product.price?.toLocaleString()}
                  </p>

                  <p
                    className="
                      text-sm
                      text-muted-foreground
                    "
                  >
                    Stock:
                    {product.stock}
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="
                      flex-1
                      h-11
                      rounded-xl
                      bg-secondary
                      text-white
                      font-bold
                    "
                  >
                    Update
                  </button>

                  <button onClick={() => handleDelete(product.productId)} className="flex-1 h-11 rounded-xl border border-red-500 text-red-500 font-bold">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
