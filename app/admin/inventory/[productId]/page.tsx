"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

type Product = {
  productId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  brand?: string;
  images?: string[];
  documents?: string[];
  isAvailable: boolean;
};

export default function ProductEditPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.productId as string;

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Product>({
    productId: "",
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    brand: "",
    images: [],
    documents: [],
    isAvailable: true,
  });

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const token = localStorage.getItem("CAMX_TOKEN");

        const res = await axios.get(`${API}/api/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const product = res.data.find((p: Product) => p.productId === productId);

        if (product) {
          setFormData(product);
        }
      } catch (error) {
        console.error("Failed to load product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const token = localStorage.getItem("CAMX_TOKEN");

      await axios.put(`${API}/api/products/${productId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Product updated successfully");

      router.push("/admin/inventory");
    } catch (error) {
      console.error("Failed to update product:", error);

      alert("Failed to update product");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading Product...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Edit Product</h1>

          <button onClick={() => router.push("/admin/inventory")} className="px-4 py-2 border rounded-lg">
            Back
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 text-sm font-medium">Product ID</label>

            <input type="text" value={formData.productId} disabled className="w-full p-3 border rounded-xl bg-gray-100" />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Product Name</label>

            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              className="w-full p-3 border rounded-xl"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Category</label>

            <input
              type="text"
              value={formData.category || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value,
                })
              }
              className="w-full p-3 border rounded-xl"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Brand</label>

            <input
              type="text"
              value={formData.brand || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  brand: e.target.value,
                })
              }
              className="w-full p-3 border rounded-xl"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Price</label>

            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: Number(e.target.value),
                })
              }
              className="w-full p-3 border rounded-xl"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Stock</label>

            <input
              type="number"
              value={formData.stock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock: Number(e.target.value),
                })
              }
              className="w-full p-3 border rounded-xl"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium">Description</label>

            <textarea
              rows={4}
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              className="w-full p-3 border rounded-xl"
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isAvailable: e.target.checked,
                })
              }
            />

            <span>Available</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button onClick={() => router.push("/admin/inventory")} className="px-6 py-3 border rounded-xl">
            Cancel
          </button>

          <button onClick={handleSave} disabled={isSaving} className="px-6 py-3 bg-blue-600 text-white rounded-xl">
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
