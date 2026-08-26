"use client";

import React from "react";
import { X, FileText } from "lucide-react";
import Image from "next/image";

interface ProductData {
  productId: string;
  name: string;
  documents: string[];
  isNew?: boolean;
}

interface ProductUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  productData: ProductData;
  setProductData: React.Dispatch<React.SetStateAction<ProductData>>;
  isSaving: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDocChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreviews: string[];
}

export default function ProductUpdateModal({ isOpen, onClose, onSave, productData, setProductData, isSaving, handleFileChange, handleDocChange, imagePreviews }: ProductUpdateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">{productData.productId ? "Edit Product" : "Add New Product"}</h3>

          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Product ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product ID</label>

            <input
              type="text"
              value={productData.productId}
              onChange={(e) =>
                setProductData({
                  ...productData,
                  productId: e.target.value,
                })
              }
              disabled={!!productData.productId && !productData.isNew}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm"
            />
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>

            <input
              type="text"
              value={productData.name}
              onChange={(e) =>
                setProductData({
                  ...productData,
                  name: e.target.value,
                })
              }
              className="w-full p-3 border border-gray-200 rounded-xl text-sm"
            />
          </div>

          {/* Images */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Images</label>

            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full p-2 border rounded-xl" />

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-2">
                {imagePreviews.map((url, i) => (
                  <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden border">
                    <Image src={url} alt={`Preview ${i}`} fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Specification Documents</label>

            <input type="file" multiple accept=".pdf,.doc,.docx" onChange={handleDocChange} className="w-full p-2 border rounded-xl" />

            {productData.documents?.length > 0 && (
              <div className="mt-3 bg-gray-50 p-3 rounded-xl border">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Existing Documents</p>

                <div className="flex flex-col gap-2">
                  {productData.documents.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 flex items-center gap-2 hover:underline">
                      <FileText size={16} />
                      Document {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl hover:bg-gray-100">
            Cancel
          </button>

          <button onClick={onSave} disabled={isSaving} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl disabled:opacity-50">
            {isSaving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
