/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Image from "next/image";
import mammoth from "mammoth";
import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";

type Product = {
  _id?: string;
  productId: string;
  name: string;
  description: string;
  price: number;
  labelPrice: number;
  images: string[];
  category: string;
  brand: string;
  stock: number;
  isAvailable: boolean;
  specifications?: {
    featureData?: string;
  };
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // =========================
  // IMAGE STATES
  // =========================
  const [files, setFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // =========================
  // FETCH PRODUCTS
  // =========================

  async function fetchProducts() {
    try {
      setLoading(true);
      const token = localStorage.getItem("CAMX_TOKEN");
      const res = await axios.get("http://localhost:5000/api/products", {
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
  }

  // =========================
  // LOAD PRODUCTS
  // =========================

  useEffect(() => {
    void fetchProducts();
  }, []);

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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

      // DOCX -> HTML
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

      await axios.put(`http://localhost:5000/api/products/${editingProduct.productId}`, updatedProductData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Product updated successfully");
      setEditingProduct(null);
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
      await axios.delete(`http://localhost:5000/api/products/${productId}`, {
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
                value={editingProduct.name}
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

              {/* CATEGORY */}
              <input
                type="text"
                name="category"
                value={editingProduct.category}
                onChange={handleChange}
                placeholder="Category"
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

              {/* BRAND */}
              <input
                type="text"
                name="brand"
                value={editingProduct.brand}
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
                value={editingProduct.price}
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
                value={editingProduct.labelPrice}
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
                value={editingProduct.stock}
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

              {/* DESCRIPTION */}
              <textarea
                name="description"
                value={editingProduct.description}
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
              key={product.productId}
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
                  src={product.images && product.images.length > 0 ? product.images[0] : "/placeholder.png"}
                  alt={product.name}
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
                  {product.category}
                </p>

                <div className="mt-4">
                  <p
                    className="
                      text-2xl
                      font-black
                    "
                  >
                    Rs.
                    {product.price.toLocaleString()}
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
