"use client";

import axios from "axios";

import Image from "next/image";

import mammoth from "mammoth";

import { ChangeEvent, FormEvent, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE;

type Specification = {
  title: string;

  value: string;

  image: string;
};

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

  const [brand, setBrand] = useState("");

  const [model, setModel] = useState("");

  const [stock, setStock] = useState<number>(0);

  const [isAvailable] = useState(true);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  // =========================
  // SPECIFICATIONS STATE
  // =========================

  const [specifications, setSpecifications] = useState<Specification[]>([]);

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

      const result = await mammoth.extractRawText({
        arrayBuffer,
      });

      const text = result.value;

      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const extractedSpecs = lines.map((line) => {
        const parts = line.split(":");

        return {
          title: parts[0]?.trim() || "",

          value: parts.slice(1).join(":").trim() || "",

          image: "",
        };
      });

      const validSpecs = extractedSpecs.filter((spec) => spec.title && spec.value);

      if (validSpecs.length > 0) {
        setSpecifications(validSpecs);

        setMessage("✅ DOCX specifications imported successfully!");
      } else {
        setMessage("❌ No valid specifications found.");
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

    setLoading(true);

    setMessage("");

    try {
      const uploadedImages: string[] = [];

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      // =========================
      // UPLOAD PRODUCT IMAGES
      // =========================

      for (const file of files) {
        const formData = new FormData();

        formData.append("file", file);

        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

        const uploadResponse = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData);

        uploadedImages.push(uploadResponse.data.secure_url);
      }

      // =========================
      // PRODUCT DATA
      // =========================

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
          featureData: JSON.stringify(specifications),
        },
      };

      // =========================
      // SAVE PRODUCT
      // =========================

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

      setSpecifications([]);
    } catch (error) {
      console.error("Product add failed:", error);

      setMessage("❌ Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        p-6
        sm:p-8
        md:p-12
        max-w-4xl
        mx-auto
        w-full
        transition-colors
        duration-300
      "
    >
      {/* HEADER */}
      <div className="mb-10">
        <h1
          className="
            text-3xl
            sm:text-4xl
            font-black
            tracking-tight
            text-neutral-900
            dark:text-white
          "
        >
          Add <span className="text-secondary">Product</span>
        </h1>

        <p
          className="
            text-neutral-500
            dark:text-gray-400
            mt-2
            text-sm
          "
        >
          Add CCTV and security products to CAMX.lk store database.
        </p>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleAddProduct}
        className="
          bg-white
          dark:bg-card
          border
          border-neutral-200
          dark:border-border
          rounded-3xl
          p-6
          sm:p-8
          space-y-6
          shadow-sm
          transition-colors
          duration-300
        "
      >
        {/* NAME */}
        <div>
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
            Product Name *
          </label>

          <input
            type="text"
            required
            placeholder="e.g. EZVIZ H8c 2K Smart Camera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="
              w-full
              h-14
              px-5
              rounded-2xl
              bg-neutral-50
              dark:bg-background
              border
              border-neutral-200
              dark:border-border
              text-neutral-900
              dark:text-white
              placeholder-neutral-400
              dark:placeholder-gray-500
              outline-none
              focus:border-secondary
              transition
            "
          />
        </div>

        {/* ALT NAME */}
        <div>
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
            Alternative Names
          </label>

          <input
            type="text"
            placeholder="CCTV, wifi camera"
            value={altName}
            onChange={(e) => setAltName(e.target.value)}
            className="
              w-full
              h-14
              px-5
              rounded-2xl
              bg-neutral-50
              dark:bg-background
              border
              border-neutral-200
              dark:border-border
              text-neutral-900
              dark:text-white
              placeholder-neutral-400
              dark:placeholder-gray-500
              outline-none
              focus:border-secondary
              transition
            "
          />
        </div>

        {/* DESCRIPTION */}
        <div>
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
            Product Description *
          </label>

          <textarea
            rows={5}
            required
            placeholder="Enter product description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="
              w-full
              p-5
              rounded-2xl
              bg-neutral-50
              dark:bg-background
              border
              border-neutral-200
              dark:border-border
              text-neutral-900
              dark:text-white
              placeholder-neutral-400
              dark:placeholder-gray-500
              resize-none
              outline-none
              focus:border-secondary
              transition
            "
          />
        </div>

        {/* PRICES */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
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
              Selling Price *
            </label>

            <input
              type="number"
              required
              value={price || ""}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="
                w-full
                h-14
                px-5
                rounded-2xl
                bg-neutral-50
                dark:bg-background
                border
                border-neutral-200
                dark:border-border
              "
            />
          </div>

          <div>
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
              Label Price
            </label>

            <input
              type="number"
              value={labelPrice || ""}
              onChange={(e) => setLabelPrice(Number(e.target.value))}
              className="
                w-full
                h-14
                px-5
                rounded-2xl
                bg-neutral-50
                dark:bg-background
                border
                border-neutral-200
                dark:border-border
              "
            />
          </div>
        </div>

        {/* CATEGORY + BRAND */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
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
              Category *
            </label>

            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="
                w-full
                h-14
                px-5
                rounded-2xl
                bg-neutral-50
                dark:bg-background
                border
                border-neutral-200
                dark:border-border
              "
            />
          </div>

          <div>
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
              Brand
            </label>

            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="
                w-full
                h-14
                px-5
                rounded-2xl
                bg-neutral-50
                dark:bg-background
                border
                border-neutral-200
                dark:border-border
              "
            />
          </div>
        </div>

        {/* MODEL + STOCK */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
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
              Model
            </label>

            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="
                w-full
                h-14
                px-5
                rounded-2xl
                bg-neutral-50
                dark:bg-background
                border
                border-neutral-200
                dark:border-border
              "
            />
          </div>

          <div>
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
              Stock *
            </label>

            <input
              type="number"
              required
              value={stock || ""}
              onChange={(e) => setStock(Number(e.target.value))}
              className="
                w-full
                h-14
                px-5
                rounded-2xl
                bg-neutral-50
                dark:bg-background
                border
                border-neutral-200
                dark:border-border
              "
            />
          </div>
        </div>

        {/* PRODUCT IMAGES */}
        <div>
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
            Product Images *
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

          {/* PREVIEW */}
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
                    "
                >
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
              <h3
                className="
                  text-lg
                  font-bold
                  text-neutral-900
                  dark:text-white
                "
              >
                Technical Specifications
              </h3>

              <p
                className="
                  text-xs
                  text-neutral-500
                  dark:text-gray-400
                  mt-1
                "
              >
                Upload DOCX specification sheet to auto-generate specs.
              </p>
            </div>
          </div>

          {/* DOCX UPLOAD */}
          <div
            className="
              p-6
              rounded-3xl
              border
              border-dashed
              border-neutral-300
              dark:border-border
              bg-neutral-50
              dark:bg-background
            "
          >
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
                file:py-3
                file:px-5
                file:rounded-2xl
                file:border-0
                file:text-sm
                file:font-bold
                file:bg-secondary
                file:text-white
                hover:file:opacity-90
                file:cursor-pointer
              "
            />

            <p
              className="
                mt-3
                text-xs
                text-neutral-500
                dark:text-gray-400
              "
            >
              Example:
              <br />
              Resolution: 4MP
              <br />
              Lens: 2.8mm
              <br />
              Night Vision: 30m IR
            </p>
          </div>

          {/* PREVIEW */}
          {specifications.length > 0 && (
            <div className="mt-6 space-y-4">
              <h4
                className="
                  text-sm
                  font-bold
                  uppercase
                  tracking-wider
                  text-neutral-500
                  dark:text-gray-400
                "
              >
                Imported Specifications
              </h4>

              {specifications.map((spec, index) => (
                <div
                  key={index}
                  className="
                      p-4
                      rounded-2xl
                      bg-neutral-50
                      dark:bg-background
                      border
                      border-neutral-200
                      dark:border-border
                    "
                >
                  <h5
                    className="
                        font-bold
                        text-neutral-900
                        dark:text-white
                      "
                  >
                    {spec.title}
                  </h5>

                  <p
                    className="
                        mt-1
                        text-sm
                        text-neutral-600
                        dark:text-gray-300
                      "
                  >
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            className={`
              p-4
              rounded-xl
              text-sm
              font-semibold
              border
              ${message.includes("✅") ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400" : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"}
            `}
          >
            {message}
          </div>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full
            h-14
            rounded-2xl
            bg-secondary
            text-white
            font-bold
            text-lg
            hover:bg-opacity-90
            transition
            disabled:opacity-50
            cursor-pointer
          "
        >
          {loading ? "Processing..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}
