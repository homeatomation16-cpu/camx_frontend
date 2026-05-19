'use client';

import axios from 'axios';
import Image from 'next/image';
import { ChangeEvent, FormEvent, useState } from 'react';

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
  const [name, setName] = useState('');
  const [altName, setAltName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [labelPrice, setLabelPrice] = useState<number>(0);
  const [files, setFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Product images preview hatha ganna
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [stock, setStock] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // =========================
  // SPECIFICATIONS STATE
  // =========================
  const [specifications, setSpecifications] = useState<Specification[]>([
    { title: '', value: '', image: '' },
  ]);

  // =========================
  // FILE CHANGE + PREVIEW
  // =========================
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);

      // Create local URLs for previewing images before upload
      const previews = selectedFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  // =========================
  // SPECIFICATION HANDLERS
  // =========================
  const addSpecification = () => {
    setSpecifications([...specifications, { title: '', value: '', image: '' }]);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const updateSpecification = (index: number, field: keyof Specification, value: string) => {
    setSpecifications((prevSpecs) =>
      prevSpecs.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec))
    );
  };

  // =========================
  // UPLOAD SPEC IMAGE
  // =========================
  const uploadSpecImage = async (file: File, index: number) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );

      updateSpecification(index, 'image', response.data.secure_url);
    } catch (error) {
      console.error('Spec image upload error:', error);
      alert('Failed to upload specification image.');
    }
  };

  // =========================
  // ADD PRODUCT (SUBMIT)
  // =========================
  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // 1. Upload Main Product Images
      const uploadedImages: string[] = [];
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

        const uploadResponse = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          formData
        );
        uploadedImages.push(uploadResponse.data.secure_url);
      }

      // 2. Prepare Payload
      const productData = {
        name,
        altName: altName ? altName.split(',').map((item) => item.trim()) : [],
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
          featureData: JSON.stringify(specifications.filter(s => s.title || s.value)), // Fill wechcha ewa pamanak yawanna
        },
      };

      // 3. Post to Backend
      await axios.post(`${API}/products`, productData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('CAMX_TOKEN')}`,
        },
      });

      setMessage('✅ Product added successfully!');

      // RESET ALL STATES
      setName('');
      setAltName('');
      setDescription('');
      setPrice(0);
      setLabelPrice(0);
      setFiles([]);
      setImagePreviews([]);
      setCategory('');
      setBrand('');
      setModel('');
      setStock(0);
      setSpecifications([{ title: '', value: '', image: '' }]);
    } catch (error) {
      console.error('Product add failed:', error);
      setMessage('❌ Failed to add product. Please check backend or token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050816] text-white pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            Add <span className="text-cyan-400">Product</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">
            Add CCTV and security products to CAMX.lk store database.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleAddProduct} className="bg-[#111827] border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6">
          
          {/* NAME */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. EZVIZ H8c 2K Smart Camera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-14 px-5 rounded-2xl bg-[#050816] border border-gray-700 outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* ALT NAME */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Alternative Names (Comma Separated)</label>
            <input
              type="text"
              placeholder="CCTV, wifi camera, ezviz smart"
              value={altName}
              onChange={(e) => setAltName(e.target.value)}
              className="w-full h-14 px-5 rounded-2xl bg-[#050816] border border-gray-700 outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Product Description *</label>
            <textarea
              rows={5}
              required
              placeholder="Enter comprehensive product features, warranty information..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-5 rounded-2xl bg-[#050816] border border-gray-700 resize-none outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* PRICES */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Selling Price (LKR) *</label>
              <input
                type="number"
                required
                placeholder="32500"
                value={price || ''}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full h-14 px-5 rounded-2xl bg-[#050816] border border-gray-700 outline-none focus:border-cyan-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Label/Crossed Price (LKR)</label>
              <input
                type="number"
                placeholder="39000"
                value={labelPrice || ''}
                onChange={(e) => setLabelPrice(Number(e.target.value))}
                className="w-full h-14 px-5 rounded-2xl bg-[#050816] border border-gray-700 outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          {/* CATEGORY, BRAND, MODEL */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Category *</label>
              <input
                type="text"
                required
                placeholder="WiFi Camera"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl bg-[#050816] border border-gray-700 outline-none focus:border-cyan-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Brand</label>
              <input
                type="text"
                placeholder="EZVIZ"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl bg-[#050816] border border-gray-700 outline-none focus:border-cyan-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Model</label>
              <input
                type="text"
                placeholder="CS-H8c"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl bg-[#050816] border border-gray-700 outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          {/* STOCK */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Initial Stock Quantity</label>
            <input
              type="number"
              placeholder="10"
              value={stock || ''}
              onChange={(e) => setStock(Number(e.target.value))}
              className="w-full h-14 px-5 rounded-2xl bg-[#050816] border border-gray-700 outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* MAIN IMAGES UPLOAD & PREVIEW */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Product Gallery Images *</label>
            <input
              type="file"
              multiple
              required={files.length === 0}
              accept="image/*"
              onChange={handleFileChange}
              className="w-full bg-[#050816] border border-gray-700 rounded-2xl p-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-400 file:text-black hover:file:bg-cyan-300 file:cursor-pointer"
            />
            {/* Gallery Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {imagePreviews.map((url, idx) => (
                  <div key={idx} className="relative h-20 bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
                    <Image src={url} alt="preview" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SPECIFICATIONS PANEL */}
          <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-lg font-bold">Key Specifications</h3>
                <p className="text-xs text-gray-400">Add highlighting feature cards for the product details view.</p>
              </div>
              <button
                type="button"
                onClick={addSpecification}
                className="bg-cyan-400 text-black px-4 py-2 rounded-xl text-xs font-black hover:bg-cyan-300 transition"
              >
                + Add Spec
              </button>
            </div>

            <div className="space-y-4">
              {specifications.map((spec, index) => (
                <div key={index} className="relative border border-gray-800 rounded-2xl p-4 bg-[#050816] space-y-3">
                  {specifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Specification Title (e.g. Resolution)"
                      value={spec.title}
                      onChange={(e) => updateSpecification(index, 'title', e.target.value)}
                      className="h-11 px-4 rounded-xl bg-[#0f172a] border border-gray-700 text-sm outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Specification Value (e.g. 1080P Full HD)"
                      value={spec.value}
                      onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                      className="h-11 px-4 rounded-xl bg-[#0f172a] border border-gray-700 text-sm outline-none"
                    />
                  </div>
                  
                  {/* SPEC IMAGE */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        if (e.target.files?.[0]) {
                          await uploadSpecImage(e.target.files[0], index);
                        }
                      }}
                      className="flex-1 bg-[#0f172a] border border-gray-700 rounded-xl p-2 text-xs"
                    />
                    {spec.image && (
                      <div className="relative w-16 h-16 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shrink-0">
                        <Image src={spec.image} alt="spec-icon" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PRODUCT AVAILABILITY */}
          <div className="flex items-center gap-3 bg-[#050816] p-4 rounded-2xl border border-gray-800">
            <input
              type="checkbox"
              id="isAvailable"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
            />
            <label htmlFor="isAvailable" className="text-sm font-medium cursor-pointer select-none text-gray-300">
              Publish Product Immediately (Available in catalog)
            </label>
          </div>

          {/* RESPONSE MESSAGE */}
          {message && (
            <div className={`border rounded-2xl p-4 text-sm font-semibold ${
              message.includes('✅') 
                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {message}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-16 rounded-2xl bg-cyan-400 text-black font-black text-lg hover:bg-cyan-300 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-400/10"
          >
            {loading ? 'Processing Uploads...' : 'Publish Product to CAMX'}
          </button>
        </form>
      </div>
    </main>
  );
}