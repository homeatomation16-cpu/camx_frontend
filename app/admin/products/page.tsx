/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Image from "next/image";
import mammoth from "mammoth";
import { useEffect, useState, useCallback, type ChangeEvent } from "react";
import axios from "axios";
import toast from "react-hot-toast";

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
  // HANDLE EDIT CLICK
  // =========================
  function handleEditClick(product: Product) {
    // Database එකෙන් එන 0.06 වගේ අගයක් UI එකට 6 ලෙස පරිවර්තනය කිරීම
    const feePercentage = product.shippingOptions?.protectionFeePercentage ? Math.round(product.shippingOptions.protectionFeePercentage * 100) : 6;

    // ✅ "?? true" වෙනුවට "?? false" — product එකට මේ options කලින්
    // set කරලා නැත්නම් edit modal එකේත් unchecked ලෙසම පේනවා. admin
    // Update click කළොත් (touch නොකළත්), false values විතරයි save වෙන්නේ.
    const productToEdit = {
      ...product,
      isAvailable: product.isAvailable ?? true,
      shippingOptions: {
        priceMatch: product.shippingOptions?.priceMatch ?? false,
        protectionPlan: product.shippingOptions?.protectionPlan ?? false,
        protectionFeePercentage: feePercentage,
        freeDelivery: product.shippingOptions?.freeDelivery ?? false,
        deliveryDaysMin: product.shippingOptions?.deliveryDaysMin ?? 3,
        deliveryDaysMax: product.shippingOptions?.deliveryDaysMax ?? 6,
        pickupAvailable: product.shippingOptions?.pickupAvailable ?? false,
        pickupTime: product.shippingOptions?.pickupTime ?? "187/B/1 Colombo Horana Road,Bokundara, Piliyandala Showroom",
      },
    };

    setEditingProduct(productToEdit);
    setImagePreviews(product.images || []);
    setFiles([]);
  }

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    if (!editingProduct) return;
    const { name, value, type } = e.target as HTMLInputElement;
    setEditingProduct({
      ...editingProduct,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : name === "price" || name === "labelPrice" || name === "stock" ? Number(value) : value,
    });
  }

  // =========================
  // HANDLE SHIPPING CHANGE
  // =========================
  function handleShippingChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editingProduct) return;
    const { name, value, type, checked } = e.target;

    setEditingProduct({
      ...editingProduct,
      shippingOptions: {
        ...editingProduct.shippingOptions,
        [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
      },
    });
  }

  // =========================
  // FILE CHANGE + PREVIEW
  // =========================
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      const previews = selectedFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

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
      setIsUpdating(true);
      const token = localStorage.getItem("CAMX_TOKEN");
      let finalImages = editingProduct.images;

      if (files.length > 0) {
        const uploadedImages: string[] = [];
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", uploadPreset);

          const uploadResponse = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData);
          uploadedImages.push(uploadResponse.data.secure_url);
        }
        finalImages = uploadedImages;
      }

      const updatePayload = {
        ...editingProduct,
        images: finalImages,
        isAvailable: editingProduct.isAvailable ?? true,
      };

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

      toast.success("Product updated successfully!");
      setEditingProduct(null);
      fetchProducts();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      console.error("Update Error:", axiosError.response?.data || axiosError.message);
      const errorMsg = axiosError.response?.data?.message || "Failed to update product. Check console for details.";
      toast.error(`Error: ${errorMsg}`);
      setFiles([]);
      setImagePreviews([]);
      fetchProducts();
    } finally {
      setIsUpdating(false);
    }
  }

  // =========================
  // DELETE PRODUCT
  // =========================
  async function handleDelete(productId: string) {
    const confirmDelete = confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("CAMX_TOKEN");
      await axios.delete(`${API}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete product. Please try again.");
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
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Product Name *</label>
                <input type="text" name="name" value={editingProduct.name || ""} onChange={handleChange} placeholder="Product Name" className="w-full h-12 px-4 rounded-xl border border-border bg-background outline-none focus:border-secondary transition" />
              </div>

              {/* CATEGORY DROPDOWN */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Category *</label>
                <select name="category" value={typeof editingProduct.category === "object" ? editingProduct.category?._id || "" : categoryOptions.find((opt) => opt._id === editingProduct.category || opt.label.replace(/^—+\s*/, "") === editingProduct.category)?._id || editingProduct.category || ""} onChange={handleChange} disabled={categoriesLoading || categoryOptions.length === 0} className="w-full h-12 px-4 rounded-xl border border-border bg-background outline-none appearance-none cursor-pointer disabled:opacity-50 focus:border-secondary transition">
                  <option value="" disabled>
                    {categoriesLoading ? "Loading categories..." : "Select a Category"}
                  </option>
                  {categoryOptions.map((opt) => (
                    <option key={opt._id} value={opt._id} disabled={!opt.isActive}>
                      {opt.label} {!opt.isActive && "(inactive)"}
                    </option>
                  ))}
                </select>
              </div>

              {/* BRAND */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Brand</label>
                <input type="text" name="brand" value={typeof editingProduct.brand === "object" ? editingProduct.brand?.name || "" : editingProduct.brand || ""} onChange={handleChange} placeholder="Brand Name" className="w-full h-12 px-4 rounded-xl border border-border bg-background outline-none focus:border-secondary transition" />
              </div>

              {/* PRICE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Price (Rs.) *</label>
                <input type="number" name="price" value={editingProduct.price || 0} onChange={handleChange} placeholder="Price" className="w-full h-12 px-4 rounded-xl border border-border bg-background outline-none focus:border-secondary transition" />
              </div>

              {/* LABEL PRICE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Label / Original Price (Rs.)</label>
                <input type="number" name="labelPrice" value={editingProduct.labelPrice || 0} onChange={handleChange} placeholder="Label Price" className="w-full h-12 px-4 rounded-xl border border-border bg-background outline-none focus:border-secondary transition" />
              </div>

              {/* STOCK */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Stock Quantity *</label>
                <input type="number" name="stock" value={editingProduct.stock || 0} onChange={handleChange} placeholder="Stock" className="w-full h-12 px-4 rounded-xl border border-border bg-background outline-none focus:border-secondary transition" />
              </div>

              {/* DESCRIPTION */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Product Description</label>
                <textarea name="description" value={editingProduct.description || ""} onChange={handleChange} rows={5} placeholder="Product Description..." className="w-full p-4 rounded-2xl border border-border bg-background outline-none focus:border-secondary transition" />
              </div>

              {/* AVAILABILITY STATUS */}
              <div className="md:col-span-2 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-border">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="isAvailable" checked={editingProduct.isAvailable ?? true} onChange={handleChange} className="w-5 h-5 accent-secondary cursor-pointer" />
                  <div>
                    <span className="text-sm font-bold">Product is Available / Active</span>
                    <p className="text-xs text-muted-foreground">When checked, customers can view and purchase this product in the store.</p>
                  </div>
                </label>
              </div>

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

              {/* IMAGES UPLOAD & PREVIEW */}
              <div className="md:col-span-2 mt-4 border-t border-border pt-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Update Product Images</label>
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-neutral-100 file:text-neutral-700 dark:file:bg-neutral-800 dark:file:text-white cursor-pointer" />

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {imagePreviews.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                        <Image src={url} alt="preview" fill unoptimized loading="eager" sizes="200px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DOCX IMPORT */}
              <div className="md:col-span-2 mt-4 border-t border-border pt-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Upload DOCX Specification Template</label>
                <input type="file" accept=".docx" onChange={handleDocxUpload} className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-neutral-100 file:text-neutral-700 dark:file:bg-neutral-800 dark:file:text-white cursor-pointer" />
              </div>

              {/* TEMPLATE PREVIEW */}
              {editingProduct?.specifications?.featureData && (
                <div className="md:col-span-2 mt-4 rounded-3xl border border-border bg-white dark:bg-neutral-900 p-6 overflow-x-auto">
                  <div className="prose prose-sm max-w-none prose-table:w-full prose-table:border prose-td:border prose-th:border prose-td:p-2 prose-th:p-2 dark:prose-invert" dangerouslySetInnerHTML={{ __html: editingProduct.specifications?.featureData || "" }} />
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-4 mt-8">
              <button onClick={handleUpdate} disabled={isUpdating} className="h-12 px-6 rounded-xl bg-secondary text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                {isUpdating ? "Updating..." : "Update Product"}
              </button>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setFiles([]);
                  setImagePreviews([]);
                }}
                disabled={isUpdating}
                className="h-12 px-6 rounded-xl border border-border disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS GRID */}
      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">No products found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
          {products.map((product) => (
            <div key={product.productId || product._id} className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card hover:shadow-md transition-shadow">
              <div>
                <div className="relative w-full h-28 sm:h-32 bg-neutral-100 dark:bg-neutral-900">
                  <Image src={product.images?.[0] || "/placeholder-image.jpg"} alt={product.name || "Product Image"} fill unoptimized loading="eager" sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw" className="object-cover" />
                </div>

                <div className="p-3 sm:p-3.5">
                  <h2 className="text-sm font-bold truncate text-foreground" title={product.name}>
                    {product.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{typeof product.category === "object" ? product.category?.name || "Unknown Category" : product.category || "Unknown Category"}</p>

                  <div className="mt-2 flex items-baseline justify-between gap-1 flex-wrap">
                    <p className="text-sm sm:text-base font-extrabold text-foreground">Rs. {product.price?.toLocaleString()}</p>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-medium ${(product.stock ?? 0) > 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>Stock: {product.stock}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-3.5 pt-0">
                <div className="flex gap-2">
                  <button onClick={() => handleEditClick(product)} className="flex-1 h-8 rounded-lg bg-secondary text-white text-xs font-bold hover:opacity-90 transition">
                    Update
                  </button>

                  <button onClick={() => handleDelete(product.productId)} className="flex-1 h-8 rounded-lg border border-red-500/50 text-red-500 text-xs font-bold hover:bg-red-500/10 transition">
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
