"use client";

import axios from "axios";
import Image from "next/image";
import mammoth from "mammoth";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE;

// =========================
// CATEGORY TREE TYPES
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

export default function ProductAddPage() {
  // =========================
  // STATES
  // =========================
  const [name, setName] = useState("");
  const [altName, setAltName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [labelPrice, setLabelPrice] = useState<number>(0);
  const [files, setFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [category, setCategory] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [stock, setStock] = useState<number>(0);
  const [isAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [featureData, setFeatureData] = useState("");

  // =========================
  // SHIPPING & PROTECTION STATES
  // ✅ Default එක "false" — admin explicitly check කළොත් විතරයි
  // ඒ product එකට ඒ shipping option එක enable වෙන්නේ.
  // =========================
  const [priceMatch, setPriceMatch] = useState(false);
  const [protectionPlan, setProtectionPlan] = useState(false);
  const [protectionFeePercentage, setProtectionFeePercentage] = useState<number>(6); // 6%
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [deliveryDaysMin, setDeliveryDaysMin] = useState<number>(3);
  const [deliveryDaysMax, setDeliveryDaysMax] = useState<number>(6);
  const [pickupAvailable, setPickupAvailable] = useState(false);
  const [pickupTime, setPickupTime] = useState("187/B/1 Colombo Horana Road,Bokundara, Piliyandala Showroom");

  // =========================
  // FETCH CATEGORY TREE
  // =========================
  useEffect(() => {
    const controller = new AbortController();
    const fetchCategoryTree = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError("");
        const res = await axios.get(`${API}/api/categories/tree`, {
          signal: controller.signal,
        });
        const tree: CategoryNode[] = res.data || [];
        setCategoryOptions(flattenCategoryTree(tree));
      } catch (error) {
        if (axios.isCancel(error)) return;
        console.error("Failed to fetch categories", error);
        setCategoriesError("Failed to load categories. Please refresh the page.");
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategoryTree();
    return () => controller.abort();
  }, []);

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
  // DOCX IMPORT
  // =========================
  const handleDocxUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;

      if (html) {
        setFeatureData(html);
        setMessage("✅ DOCX template imported successfully!");
      } else {
        setMessage("❌ No content found in the document.");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to parse DOCX file.");
    }
  };

  // =========================
  // ADD PRODUCT (SUBMIT)
  // =========================
  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();

    if (!category) {
      setMessage("❌ Please select a category.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const uploadedImages: string[] = [];
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

          const uploadResponse = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData);
          uploadedImages.push(uploadResponse.data.secure_url);
        }
      }

      // ✅ Admin කිසිම shipping option checkbox එකක් check කරලා නැත්නම්
      // (සියල්ලම false), shippingOptions object එකම payload එකට එකතු කරන්නේ නෑ.
      // මේකෙන් backend/database එකට "shippingOptions" field එකම යන්නේ නෑ.
      const hasAnyShippingOption = priceMatch || protectionPlan || freeDelivery || pickupAvailable;

      const productData = {
        name,
        altName: altName ? altName.split(",").map((item) => item.trim()) : [],
        description,
        price,
        labelPrice: labelPrice || price,
        images: uploadedImages,
        category,
        brand,
        model,
        stock,
        isAvailable,
        specifications: {
          featureData: featureData,
        },
        // අලුතින් එකතු කළ shipping options — admin එකක් හෝ on කළොත් විතරයි යවනවා
        ...(hasAnyShippingOption && {
          shippingOptions: {
            priceMatch,
            protectionPlan,
            protectionFeePercentage: protectionFeePercentage / 100, // 6 -> 0.06 ලෙස Database එකට යැවීම
            freeDelivery,
            deliveryDaysMin,
            deliveryDaysMax,
            pickupAvailable,
            pickupTime,
          },
        }),
      };

      await axios.post(`${API}/api/products`, productData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("CAMX_TOKEN")}`,
        },
      });

      setMessage("✅ Product added successfully!");

      // RESET FORM
      setName("");
      setAltName("");
      setDescription("");
      setPrice(0);
      setLabelPrice(0);
      setFiles([]);
      setImagePreviews([]);
      setCategory("");
      setBrand("");
      setModel("");
      setStock(0);
      setFeatureData("");

      // RESET SHIPPING OPTIONS (unchecked ලෙසම reset වෙනවා)
      setPriceMatch(false);
      setProtectionPlan(false);
      setProtectionFeePercentage(6);
      setFreeDelivery(false);
      setDeliveryDaysMin(3);
      setDeliveryDaysMax(6);
      setPickupAvailable(false);
      setPickupTime("24h at our Colombo showroom");
    } catch (error) {
      console.error("Product add failed:", error);
      const apiMessage = axios.isAxiosError(error) && error.response?.data?.message ? error.response.data.message : "Failed to add product.";
      setMessage(`❌ ${apiMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 md:p-12 max-w-4xl mx-auto w-full transition-colors duration-300">
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
          Add <span className="text-secondary">Product</span>
        </h1>
        <p className="text-neutral-500 dark:text-gray-400 mt-2 text-sm">Add CCTV and security products to CAMX.lk store database.</p>
      </div>

      {/* FORM */}
      <form onSubmit={handleAddProduct} className="bg-white dark:bg-card border border-neutral-200 dark:border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm transition-colors duration-300">
        {/* NAME */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-gray-400 mb-2">Product Name *</label>
          <input type="text" required placeholder="e.g. EZVIZ H8c 2K Smart Camera" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-14 px-5 rounded-2xl bg-neutral-50 dark:bg-background border border-neutral-200 dark:border-border text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-gray-500 outline-none focus:border-secondary transition" />
        </div>

        {/* ALT NAME */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-gray-400 mb-2">Alternative Names</label>
          <input type="text" placeholder="CCTV, wifi camera" value={altName} onChange={(e) => setAltName(e.target.value)} className="w-full h-14 px-5 rounded-2xl bg-neutral-50 dark:bg-background border border-neutral-200 dark:border-border text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-gray-500 outline-none focus:border-secondary transition" />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-gray-400 mb-2">Product Description *</label>
          <textarea rows={5} required placeholder="Enter product description..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-5 rounded-2xl bg-neutral-50 dark:bg-background border border-neutral-200 dark:border-border text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-gray-500 resize-none outline-none focus:border-secondary transition" />
        </div>

        {/* PRICES */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-gray-400 mb-2">Selling Price *</label>
            <input type="number" required value={price || ""} onChange={(e) => setPrice(Number(e.target.value))} className="w-full h-14 px-5 rounded-2xl bg-neutral-50 dark:bg-background border border-neutral-200 dark:border-border dark:text-white outline-none focus:border-secondary transition" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-gray-400 mb-2">Label Price</label>
            <input type="number" value={labelPrice || ""} onChange={(e) => setLabelPrice(Number(e.target.value))} className="w-full h-14 px-5 rounded-2xl bg-neutral-50 dark:bg-background border border-neutral-200 dark:border-border dark:text-white outline-none focus:border-secondary transition" />
          </div>
        </div>

        {/* CATEGORY + BRAND */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-gray-400 mb-2">Category *</label>
            <select required value={category} onChange={(e) => setCategory(e.target.value)} disabled={categoriesLoading || categoryOptions.length === 0} className="w-full h-14 px-5 rounded-2xl bg-neutral-50 dark:bg-background border border-neutral-200 dark:border-border text-neutral-900 dark:text-white outline-none focus:border-secondary transition appearance-none cursor-pointer disabled:opacity-50">
              <option value="" disabled>
                {categoriesLoading ? "Loading categories..." : "Select a Category"}
              </option>
              {categoryOptions.map((opt) => (
                <option key={opt._id} value={opt._id} disabled={!opt.isActive}>
                  {opt.label} {!opt.isActive ? " (inactive)" : ""}
                </option>
              ))}
            </select>
            {categoriesError && <p className="text-xs text-red-500 mt-2">{categoriesError}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-gray-400 mb-2">Brand</label>
            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full h-14 px-5 rounded-2xl bg-neutral-50 dark:bg-background border border-neutral-200 dark:border-border dark:text-white outline-none focus:border-secondary transition" />
          </div>
        </div>

        {/* MODEL + STOCK */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-gray-400 mb-2">Model</label>
            <input type="text" value={model} onChange={(e) => setModel(e.target.value)} className="w-full h-14 px-5 rounded-2xl bg-neutral-50 dark:bg-background border border-neutral-200 dark:border-border dark:text-white outline-none focus:border-secondary transition" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-gray-400 mb-2">Stock *</label>
            <input type="number" required value={stock || ""} onChange={(e) => setStock(Number(e.target.value))} className="w-full h-14 px-5 rounded-2xl bg-neutral-50 dark:bg-background border border-neutral-200 dark:border-border dark:text-white outline-none focus:border-secondary transition" />
          </div>
        </div>

        {/* =========================
            SHIPPING & PROTECTION SECTION
            ========================= */}
        <div className="pt-6 border-t border-neutral-200 dark:border-border">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">Shipping & Protection Options</h3>
          <p className="text-xs text-neutral-500 dark:text-gray-400 mb-6">Only checked options will be shown on this product&apos;s page.</p>

          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
            {/* PRICE MATCH */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={priceMatch} onChange={(e) => setPriceMatch(e.target.checked)} className="w-5 h-5 accent-secondary cursor-pointer" />
              <span className="text-sm font-semibold text-neutral-700 dark:text-gray-300">Enable Price Match Guarantee</span>
            </label>

            {/* FREE DELIVERY */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={freeDelivery} onChange={(e) => setFreeDelivery(e.target.checked)} className="w-5 h-5 accent-secondary cursor-pointer" />
              <span className="text-sm font-semibold text-neutral-700 dark:text-gray-300">Free Delivery</span>
            </label>

            {/* PROTECTION PLAN */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={protectionPlan} onChange={(e) => setProtectionPlan(e.target.checked)} className="w-5 h-5 accent-secondary cursor-pointer" />
                <span className="text-sm font-semibold text-neutral-700 dark:text-gray-300">Enable Protection Plan</span>
              </label>
              {protectionPlan && (
                <div className="flex items-center gap-3 pl-8">
                  <span className="text-xs font-bold text-neutral-500 uppercase">Fee Percentage:</span>
                  <div className="relative w-24">
                    <input type="number" value={protectionFeePercentage} onChange={(e) => setProtectionFeePercentage(Number(e.target.value))} className="w-full h-10 px-3 rounded-xl bg-neutral-50 dark:bg-background border border-neutral-200 dark:border-border dark:text-white outline-none focus:border-secondary transition" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">%</span>
                  </div>
                </div>
              )}
            </div>

            {/* DELIVERY DAYS */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-gray-400">Estimated Delivery Days</label>
              <div className="flex items-center gap-3">
                <input type="number" placeholder="Min" value={deliveryDaysMin} onChange={(e) => setDeliveryDaysMin(Number(e.target.value))} className="w-full h-10 px-3 rounded-xl bg-neutral-50 dark:bg-background border border-neutral-200 dark:border-border dark:text-white outline-none focus:border-secondary transition" />
                <span className="text-neutral-400 font-bold">to</span>
                <input type="number" placeholder="Max" value={deliveryDaysMax} onChange={(e) => setDeliveryDaysMax(Number(e.target.value))} className="w-full h-10 px-3 rounded-xl bg-neutral-50 dark:bg-background border border-neutral-200 dark:border-border dark:text-white outline-none focus:border-secondary transition" />
              </div>
              <p className="text-[11px] text-neutral-400">Only used when &quot;Free Delivery&quot; is checked above.</p>
            </div>

            {/* STORE PICKUP */}
            <div className="space-y-3 sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={pickupAvailable} onChange={(e) => setPickupAvailable(e.target.checked)} className="w-5 h-5 accent-secondary cursor-pointer" />
                <span className="text-sm font-semibold text-neutral-700 dark:text-gray-300">Available for Store Pickup</span>
              </label>
              {pickupAvailable && (
                <div className="pl-8">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-gray-400 mb-2">Pickup Details</label>
                  <input type="text" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} placeholder="e.g. 24h at our Colombo showroom" className="w-full sm:w-1/2 h-10 px-4 rounded-xl bg-neutral-50 dark:bg-background border border-neutral-200 dark:border-border dark:text-white outline-none focus:border-secondary transition" />
                </div>
              )}
            </div>
          </div>
        </div>
        {/* ========================= */}

        {/* PRODUCT IMAGES */}
        <div className="pt-6 border-t border-neutral-200 dark:border-border">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-gray-400 mb-2">Product Images *</label>
          <input type="file" multiple accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-neutral-100 file:text-neutral-700 cursor-pointer" />
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {imagePreviews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200 dark:border-border">
                  <Image src={url} alt="preview" fill unoptimized loading="lazy" sizes="200px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DOCX TECHNICAL SPECIFICATIONS */}
        <div className="pt-6 border-t border-neutral-200 dark:border-border">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Technical Specifications (Template)</h3>
              <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">Upload DOCX specification sheet to preserve original tables and formatting.</p>
            </div>
          </div>
          <div className="p-6 rounded-3xl border border-dashed border-neutral-300 dark:border-border bg-neutral-50 dark:bg-background">
            <input type="file" accept=".docx" onChange={handleDocxUpload} className="block w-full text-sm text-neutral-500 file:mr-4 file:py-3 file:px-5 file:rounded-2xl file:border-0 file:text-sm file:font-bold file:bg-secondary file:text-white hover:file:opacity-90 file:cursor-pointer" />
          </div>
          {featureData && (
            <div className="mt-6 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-gray-400">Template Preview</h4>
              <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-border overflow-x-auto">
                <div className="prose prose-sm max-w-none prose-table:w-full prose-table:border prose-table:border-collapse prose-td:border prose-th:border prose-td:p-3 prose-th:p-3 prose-th:bg-neutral-100 dark:prose-invert dark:prose-th:bg-neutral-800" dangerouslySetInnerHTML={{ __html: featureData }} />
              </div>
            </div>
          )}
        </div>

        {/* MESSAGE */}
        {message && <div className={`p-4 rounded-xl text-sm font-semibold border ${message.includes("✅") ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400" : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"}`}>{message}</div>}

        {/* SUBMIT */}
        <button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-secondary text-white font-bold text-lg hover:bg-opacity-90 transition disabled:opacity-50 cursor-pointer">
          {loading ? "Processing..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}
