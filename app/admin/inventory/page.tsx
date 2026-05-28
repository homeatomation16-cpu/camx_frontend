'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import {
  Search,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ======================================
// CONFIG & TYPES
// ======================================
const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
const COLORS = ["#22c55e", "#eab308", "#ef4444", "#3b82f6"];

type Product = {
  _id: string;
  productId: string;
  name: string;
  description?: string;
  price: number;
  labelPrice?: number;
  stock: number;
  category?: string;
  brand?: string;
  images?: string[];
  isAvailable: boolean;
};

// ======================================
// IMAGE URL HELPER
// ======================================
const safeImage = (image?: string) => {
  if (image && (image.startsWith('http') || image.startsWith('/'))) {
    return image;
  }
  return '/placeholder.jpg';
};

export default function InventoryManagementPage() {
  // ======================================
  // STATE
  // ======================================
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    description: '',
    price: 0,
    labelPrice: 0,
    stock: 0,
    category: '',
    brand: '',
    images: [''],
    isAvailable: true,
  });

  // ======================================
  // DATA FETCHING
  // ======================================
  const fetchProducts = async (signal?: AbortSignal) => {
    try {
      const token = localStorage.getItem("CAMX_TOKEN");
      const res = await axios.get(`${API}/api/products`, {
        signal,
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data || []);
      setLoaded(true);
    } catch (error) {
      if (axios.isCancel(error)) return;
      console.error("Failed to fetch products:", error);
      setLoaded(true);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    
    // Fixed ESLint Warning by using queueMicrotask
    queueMicrotask(() => {
      fetchProducts(controller.signal);
    });

    return () => controller.abort();
  }, []);

  // ======================================
  // ACTIONS (CRUD)
  // ======================================
  const handleDelete = async (productId: string) => {
    try {
      const token = localStorage.getItem('CAMX_TOKEN');
      await axios.delete(`${API}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteProductId(null);
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      productId: product.productId,
      name: product.name,
      description: product.description || '',
      price: product.price,
      labelPrice: product.labelPrice || product.price,
      stock: product.stock,
      category: product.category || '',
      brand: product.brand || '',
      images: product.images && product.images.length > 0 ? product.images : [''],
      isAvailable: product.isAvailable,
    });
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      productId: '', name: '', description: '', price: 0, labelPrice: 0,
      stock: 0, category: '', brand: '', images: [''], isAvailable: true,
    });
    setShowCreateModal(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('CAMX_TOKEN');
      if (editingProduct) {
        await axios.put(`${API}/api/products/${editingProduct.productId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API}/api/products`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setEditingProduct(null);
      setShowCreateModal(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  // ======================================
  // HELPER FUNCTIONS
  // ======================================
  const getStockStatus = (stock: number) => {
    if (stock <= 0) return "Out of Stock";
    if (stock <= 10) return "Low Stock";
    return "In Stock";
  };

  const getStatusBadge = (status: string) => {
    if (status === "In Stock")
      return <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-medium border border-green-100">In Stock</span>;
    if (status === "Low Stock")
      return <span className="text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-xs font-medium border border-yellow-100">Low Stock</span>;
    return <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-medium border border-red-100">Out of Stock</span>;
  };

  // ======================================
  // DATA PROCESSING
  // ======================================
  const filteredProducts = products.filter((p) => {
    const textMatch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.productId.toLowerCase().includes(search.toLowerCase());
    const statusMatch =
      statusFilter === "all" || getStockStatus(p.stock) === statusFilter;
    return textMatch && statusMatch;
  });

  const stats = {
    total: products.length,
    inStock: products.filter((p) => getStockStatus(p.stock) === "In Stock").length,
    lowStock: products.filter((p) => getStockStatus(p.stock) === "Low Stock").length,
    outStock: products.filter((p) => getStockStatus(p.stock) === "Out of Stock").length,
  };

  const stockByCategory = Object.values(
    products.reduce((acc: Record<string, { category: string; stock: number }>, p) => {
      const cat = p.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = { category: cat, stock: 0 };
      acc[cat].stock += p.stock;
      return acc;
    }, {})
  );

  const inventoryValueData = products.map((p) => ({
    name: p.name,
    value: p.stock * p.price,
  }));

  const totalInventoryValue = inventoryValueData.reduce((sum, item) => sum + item.value, 0);

  const lowStockTrend = products.filter((p) => p.stock <= 10);
  const reorderData = [
    { name: "Reorder Needed", value: lowStockTrend.length },
    { name: "Stock OK", value: products.length - lowStockTrend.length },
  ];

  // ======================================
  // RENDER LOADING
  // ======================================
  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        <p className="text-lg font-medium animate-pulse">Loading Inventory...</p>
      </div>
    );
  }

  // ======================================
  // MAIN UI RENDER
  // ======================================
  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 lg:p-8 font-sans">
      {/* Changed max-w-[1400px] to max-w-350 */}
      <div className="max-w-350 mx-auto flex flex-col gap-6">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-500 text-sm mt-1">Stock overview, analytics & control</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition shadow-sm"
          >
            <Plus size={20} /> Add Product
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Products</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
            </div>
            <Package className="text-blue-600" size={24} />
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">In Stock</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.inStock}</h3>
            </div>
            <TrendingUp className="text-green-500" size={24} />
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">Low Stock</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.lowStock}</h3>
            </div>
            <AlertTriangle className="text-yellow-500" size={24} />
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">Out of Stock</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.outStock}</h3>
            </div>
            <TrendingDown className="text-red-500" size={24} />
          </div>
        </div>

        {/* CHARTS ROW 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">📊 Stock by Category</h3>
            {/* Changed h-[250px] to h-62.5 */}
            <div className="h-62.5 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockByCategory}>
                  <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis axisLine={true} tickLine={true} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} />
                  <Bar dataKey="stock" fill="#3b82f6" barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">🚨 Reorder Alert</h3>
            {/* Changed h-[250px] to h-62.5 */}
            <div className="h-62.5 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={reorderData} dataKey="value" innerRadius={70} outerRadius={110} stroke="none">
                    {reorderData.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CHARTS ROW 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">🧮 Total Inventory Value</h3>
            <h4 className="text-[32px] font-bold text-gray-900 mb-6 leading-none">
              <span className="text-lg text-gray-500 font-normal mr-1">LKR</span>
              {totalInventoryValue.toLocaleString()}
            </h4>
            {/* Changed h-[200px] to h-50 */}
            <div className="h-50 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryValueData.slice(0, 8)}>
                  <XAxis dataKey="name" hide />
                  <YAxis axisLine={true} tickLine={true} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} />
                  <Bar dataKey="value" fill="#22c55e" barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">📉 Low Stock Trend</h3>
            {/* Changed h-[250px] to h-62.5 */}
            <div className="h-62.5 w-full">
              {lowStockTrend.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-green-600 font-medium">All products healthy 🎉</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lowStockTrend}>
                    <XAxis dataKey="name" hide />
                    <YAxis axisLine={true} tickLine={true} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <Tooltip />
                    <Line type="linear" dataKey="stock" stroke="#eab308" strokeWidth={2} dot={{ fill: '#eab308', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or Product ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 cursor-pointer bg-white text-sm"
          >
            <option value="all">All</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Image</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Product ID</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Category</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Stock</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Price</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Value</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((p) => {
                  const status = getStockStatus(p.stock);
                  return (
                    <tr key={p.productId} className="hover:bg-gray-50/50 transition-colors">
                      {/* IMAGE COLUMN */}
                      <td className="px-6 py-3">
                        <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                          <Image
                            src={safeImage(p.images?.[0])}
                            alt={p.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{p.productId}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.category || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{p.stock}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">LKR {p.price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">LKR {(p.stock * p.price).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(status)}
                      </td>
                      {/* ACTIONS COLUMN */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteProductId(p.productId)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500 bg-gray-50">
                      No matching products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-xl font-bold mb-2">Delete Product</h3>
            <p className="text-gray-600 mb-6 text-sm">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteProductId(null)}
                className="px-4 py-2 rounded-xl font-medium hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteProductId)}
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {(showCreateModal || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingProduct(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Product ID</label>
                <input
                  type="text"
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  disabled={!!editingProduct}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Selling Price (LKR)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Quantity</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingProduct(null);
                }}
                className="px-6 py-2.5 rounded-xl font-medium hover:bg-gray-100 transition text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow-sm"
              >
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}