/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Image from "next/image";
import mammoth from "mammoth";
import { useEffect, useState, useCallback } from "react";
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
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
  // useCallback eken fetchProducts function eke reference eka stable karanawa.
  // Meken pahala useEffect eka mount wenakota witharak run wenne, infinite loop eka
  // (fetch -> setState -> re-render -> new fetchProducts ref -> effect re-run -> fetch...) nathi karanawa.
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
    setEditingProduct(product);
    // පරණ පින්තූර preview එකට දමන්න
    setImagePreviews(product.images || []);
    setFiles([]);
  }

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

      const result = await mammoth.convertToHtml({
        arrayBuffer,
      });

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

      // අලුත් පින්තූර තෝරා ඇත්නම් පමණක් upload කරන්න
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

      const updatedProductData = {
        ...editingProduct,
        images: finalImages,
      };

      const updatePayload = { ...editingProduct };

      // Category object එකෙන් _id එක හෝ name එක ගැනීම
      if (typeof updatePayload.category === "object" && updatePayload.category !== null) {
        updatePayload.category = updatePayload.category._id ?? updatePayload.category.name ?? "";
      }

      // Brand object එකෙන් _id එක හෝ name එක ගැනීම
      if (typeof updatePayload.brand === "object" && updatePayload.brand !== null) {
        updatePayload.brand = updatePayload.brand._id ?? updatePayload.brand.name ?? "";
      }

      // Backend error එක වළක්වා ගැනීමට _id ඉවත් කිරීම
      delete updatePayload._id;

      await axios.put(`${API}/api/products/${editingProduct.productId}`, updatePayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Product updated successfully");
      setEditingProduct(null);
      fetchProducts();
    } catch (error: unknown) {
      const axiosError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      console.error("Update Error:", axiosError.response?.data || axiosError.message);
      const errorMsg = axiosError.response?.data?.message || "Failed to update product. Check console for details.";
      alert(`Error: ${errorMsg}`);
      setFiles([]);
      setImagePreviews([]);
      fetchProducts();
    } catch (error) {
      console.log(error);
      alert("Failed to update product");
    } finally {
      setIsUpdating(false);
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchProducts();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div
      className="
        min-h-screen
        bg-background
        text-foreground
        p-6
      "
    >
      {/* HEADER */}
      <div className="mb-8">
        <h1
          className="
            text-4xl
            font-black
          "
        >
          Admin Products
        </h1>

        <p
          className="
            mt-2
            text-muted-foreground
          "
        >
          Manage and update products
        </p>
      </div>

      {/* EDIT MODAL */}
      {editingProduct && (
        <div
          className="
            fixed
            inset-0
            z-50
            bg-black/60
            flex
            items-center
            justify-center
            p-4
          "
        >
          <div
            className="
              w-full
              max-w-5xl
              bg-card
              border
              border-border
              rounded-3xl
              p-6
              max-h-[90vh]
              overflow-y-auto
            "
          >
            <h2
              className="
                text-2xl
                font-black
                mb-6
              "
            >
              Update Product
            </h2>

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-5
              "
            >
              {/* NAME */}
              <input
                type="text"
                name="name"
                value={editingProduct.name || ""}
                onChange={handleChange}
                placeholder="Product Name"
                className="
                  h-12
                  px-4
                  rounded-xl
                  border
                  border-border
                  bg-background
                  outline-none
                "
              />

              {/* CATEGORY DROPDOWN */}
              <select
                name="category"
                value={typeof editingProduct.category === "object" ? editingProduct.category?._id || "" : editingProduct.category || ""}
                onChange={handleChange}
                disabled={categoriesLoading || categoryOptions.length === 0}
                className="
                  h-12
                  px-4
                  rounded-xl
                  border
                  border-border
                  bg-background
                  outline-none
                  appearance-none
                  cursor-pointer
                  disabled:opacity-50
                "
              >
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
              <input
                type="text"
                name="brand"
                value={typeof editingProduct.brand === "object" ? editingProduct.brand?.name || "" : editingProduct.brand || ""}
                onChange={handleChange}
                placeholder="Brand"
                className="
                  h-12
                  px-4
                  rounded-xl
                  border
                  border-border
                  bg-background
                  outline-none
                "
              />

              {/* PRICE */}
              <input
                type="number"
                name="price"
                value={editingProduct.price || 0}
                onChange={handleChange}
                placeholder="Price"
                className="
                  h-12
                  px-4
                  rounded-xl
                  border
                  border-border
                  bg-background
                  outline-none
                "
              />

              {/* LABEL PRICE */}
              <input
                type="number"
                name="labelPrice"
                value={editingProduct.labelPrice || 0}
                onChange={handleChange}
                placeholder="Label Price"
                className="
                  h-12
                  px-4
                  rounded-xl
                  border
                  border-border
                  bg-background
                  outline-none
                "
              />

              {/* STOCK */}
              <input
                type="number"
                name="stock"
                value={editingProduct.stock || 0}
                onChange={handleChange}
                placeholder="Stock"
                className="
                  h-12
                  px-4
                  rounded-xl
                  border
                  border-border
                  bg-background
                  outline-none
                "
              />

              {/* IMAGE */}
              <input
                type="text"
                value={editingProduct.images?.[0] || ""}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    images: [e.target.value],
                  })
                }
                placeholder="Image URL"
                className="
                  md:col-span-2
                  h-12
                  px-4
                  rounded-xl
                  border
                  border-border
                  bg-background
                  outline-none
                "
              />

              {/* DESCRIPTION */}
              <textarea
                name="description"
                value={editingProduct.description || ""}
                onChange={handleChange}
                rows={5}
                placeholder="Description"
                className="
                  md:col-span-2
                  p-4
                  rounded-2xl
                  border
                  border-border
                  bg-background
                  outline-none
                "
              />

              {/* IMAGES UPLOAD & PREVIEW */}
              <div className="md:col-span-2 mt-2">
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
                  Update Product Images
                </label>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
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

                {imagePreviews.length > 0 && (
                  <div
                    className="
                      grid
                      grid-cols-4
                      gap-4
                      mt-4
                    "
                  >
                    {imagePreviews.map((url, i) => (
                      <div
                        key={i}
                        className="
                          relative
                          aspect-square
                          rounded-xl
                          overflow-hidden
                          border
                          border-border
                        "
                      >
                        <Image src={url} alt="preview" fill unoptimized loading="lazy" sizes="200px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DOCX IMPORT */}
              <div className="md:col-span-2 mt-4">
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
                    dark:bg-neutral-900
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
                      dark:prose-invert
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
                disabled={isUpdating}
                className="
                  h-12
                  px-6
                  rounded-xl
                  bg-secondary
                  text-white
                  font-bold
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                {isUpdating ? "Updating..." : "Update Product"}
              </button>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setFiles([]);
                  setImagePreviews([]);
                }}
                disabled={isUpdating}
                className="
                  h-12
                  px-6
                  rounded-xl
                  border
                  border-border
                  disabled:opacity-50
                "
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      {loading ? (
        <div className="py-20 text-center">Loading...</div>
      ) : (
        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-6
          "
        >
          {products.map((product) => (
            <div
              key={product.productId || product._id}
              className="
                overflow-hidden
                rounded-3xl
                border
                border-border
                bg-card
              "
            >
              {/* IMAGE */}
              <div
                className="
                  relative
                  w-full
                  h-60
                "
              >
                <Image
                  src={product.images?.[0] || "/placeholder-image.jpg"}
                  alt={product.name || "Product Image"}
                  fill
                  unoptimized
                  loading="lazy"
                  sizes="
                    (max-width: 768px) 100vw,
                    (max-width: 1200px) 50vw,
                    33vw
                  "
                  className="
                    object-cover
                  "
                />
              </div>

              {/* CONTENT */}
              <div className="p-5">
                <h2
                  className="
                    text-xl
                    font-black
                  "
                >
                  {product.name}
                </h2>

                <p
                  className="
                    mt-2
                    text-sm
                    text-muted-foreground
                  "
                >
                  {typeof product.category === "object" ? product.category?.name || "Unknown Category" : product.category || "Unknown Category"}
                </p>

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
                    Stock: {product.stock}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleEditClick(product)}
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

                  <button
                    onClick={() => handleDelete(product.productId)}
                    className="
                      flex-1
                      h-11
                      rounded-xl
                      border
                      border-red-500
                      text-red-500
                      font-bold
                    "
                  >
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
