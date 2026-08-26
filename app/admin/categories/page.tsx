"use client";

import { useState, useEffect, useMemo, useCallback, FormEvent } from "react";
import axios from "axios";
import { FolderPlus, Trash2, Search, Layers, ChevronRight, ChevronDown, Pencil, X } from "lucide-react";

// Use your actual environment variable if set, otherwise fallback for local dev
const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

// =========================
// TYPES
// =========================
// Matches the shape returned by GET /api/categories/tree
// (categoryController.js -> buildTree()).
type CategoryNode = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent: string | null;
  level: number;
  order: number;
  isActive: boolean;
  productCount: number;
  children: CategoryNode[];
};

type FlatOption = {
  _id: string;
  label: string;
  level: number;
};

const emptyForm = {
  name: "",
  description: "",
  image: "",
  parent: "", // "" = root category
  order: 0,
  isActive: true,
};

// Flatten the tree (pre-order) so we can populate the "Parent Category"
// <select>, indenting each option to show depth.
function flattenForSelect(nodes: CategoryNode[]): FlatOption[] {
  const options: FlatOption[] = [];
  const walk = (list: CategoryNode[]) => {
    for (const node of list) {
      const prefix = node.level > 0 ? "\u2014 ".repeat(node.level) : "";
      options.push({ _id: node._id, label: `${prefix}${node.name}`, level: node.level });
      if (node.children?.length) walk(node.children);
    }
  };
  walk(nodes);
  return options;
}

// Does `candidateId` appear anywhere in the subtree rooted at `node`?
// Used to stop a category from being re-parented under its own descendant.
function isDescendant(node: CategoryNode, candidateId: string): boolean {
  for (const child of node.children) {
    if (child._id === candidateId) return true;
    if (isDescendant(child, candidateId)) return true;
  }
  return false;
}

function findNode(nodes: CategoryNode[], id: string): CategoryNode | null {
  for (const node of nodes) {
    if (node._id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
}

// Recursively filters the tree by name, keeping a node if it matches OR any
// descendant matches (so parents of a hit stay visible for context).
function filterTree(nodes: CategoryNode[], query: string): CategoryNode[] {
  if (!query.trim()) return nodes;
  const q = query.toLowerCase();

  const walk = (list: CategoryNode[]): CategoryNode[] =>
    list
      .map((node) => {
        const filteredChildren = walk(node.children);
        const selfMatches = node.name.toLowerCase().includes(q);
        if (selfMatches || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
        return null;
      })
      .filter((n): n is CategoryNode => n !== null);

  return walk(nodes);
}

export default function AdminCategoriesPage() {
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState(emptyForm);

  const authHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${localStorage.getItem("CAMX_TOKEN")}`,
    }),
    [],
  );

  // =========================
  // FETCH CATEGORY TREE
  // =========================
  // useCallback so this has a stable identity — it's called both from the
  // initial-load effect below and from the add/edit/delete handlers further
  // down, so it needs to be a proper dependency rather than re-created (and
  // re-declared as "missing") on every render.
  const fetchTree = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/api/categories/tree`, {
          signal,
          headers: authHeaders(),
        });
        setTree(res.data || []);
      } catch (error) {
        if (axios.isCancel(error)) return;
        console.error("Failed to fetch categories:", error);
        setMessage("❌ Failed to load categories.");
      } finally {
        setLoading(false);
      }
    },
    [authHeaders],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchTree(controller.signal);
    return () => controller.abort();
  }, [fetchTree]);

  const parentOptions = useMemo(() => flattenForSelect(tree), [tree]);
  const visibleTree = useMemo(() => filterTree(tree, search), [tree, search]);

  // Auto-expand every branch while searching so matches aren't hidden
  // behind a collapsed parent.
  useEffect(() => {
    if (!search.trim()) return;
    const ids = new Set<string>();
    const collect = (nodes: CategoryNode[]) => {
      nodes.forEach((n) => {
        if (n.children.length) {
          ids.add(n._id);
          collect(n.children);
        }
      });
    };
    collect(visibleTree);
    setExpanded(ids);
  }, [search, visibleTree]);

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function resetForm() {
    setFormData(emptyForm);
    setEditingId(null);
  }

  // Pre-fill the form to add a child directly under a given category.
  function startAddChild(parentId: string) {
    setEditingId(null);
    setFormData({ ...emptyForm, parent: parentId });
    setMessage("");
  }

  // Load a category into the form for editing.
  function startEdit(node: CategoryNode) {
    setEditingId(node._id);
    setFormData({
      name: node.name,
      description: node.description || "",
      image: node.image || "",
      parent: node.parent || "",
      order: node.order,
      isActive: node.isActive,
    });
    setMessage("");
  }

  // =========================
  // ADD / UPDATE CATEGORY
  // =========================
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSubmitting(true);
      setMessage("");

      const payload = {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        parent: formData.parent || null,
        order: Number(formData.order) || 0,
        isActive: formData.isActive,
      };

      if (editingId) {
        await axios.put(`${API}/api/categories/${editingId}`, payload, {
          headers: authHeaders(),
        });
        setMessage("✅ Category updated successfully!");
      } else {
        await axios.post(`${API}/api/categories`, payload, {
          headers: authHeaders(),
        });
        setMessage("✅ Category added successfully!");
      }

      resetForm();
      fetchTree();
    } catch (error) {
      console.error("Failed to save category:", error);
      const apiMessage = axios.isAxiosError(error) && error.response?.data?.message ? error.response.data.message : `Failed to ${editingId ? "update" : "add"} category.`;
      setMessage(`❌ ${apiMessage}`);
    } finally {
      setSubmitting(false);
    }
  }

  // =========================
  // DELETE CATEGORY
  // =========================
  async function handleDelete(node: CategoryNode) {
    const confirmDelete = confirm(`Delete "${node.name}"? This cannot be undone.`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API}/api/categories/${node._id}`, {
        headers: authHeaders(),
      });
      setMessage("✅ Category deleted successfully!");
      if (editingId === node._id) resetForm();
      fetchTree();
    } catch (error) {
      console.error("Failed to delete category:", error);
      // The backend already returns a clear reason (has children / has
      // products), so surface it instead of a generic alert.
      const apiMessage = axios.isAxiosError(error) && error.response?.data?.message ? error.response.data.message : "Failed to delete category.";
      setMessage(`❌ ${apiMessage}`);
    }
  }

  // Parent options valid for the category currently being edited: exclude
  // itself and any of its own descendants (the backend also guards this,
  // but filtering here keeps the UI from offering an invalid choice).
  const availableParentOptions = useMemo(() => {
    if (!editingId) return parentOptions;
    const editingNode = findNode(tree, editingId);
    return parentOptions.filter((opt) => {
      if (opt._id === editingId) return false;
      if (editingNode && isDescendant(editingNode, opt._id)) return false;
      return true;
    });
  }, [parentOptions, editingId, tree]);

  // =========================
  // TREE ROW (recursive)
  // =========================
  function CategoryRow({ node }: { node: CategoryNode }) {
    const hasChildren = node.children.length > 0;
    const isOpen = expanded.has(node._id);
    const isBeingEdited = editingId === node._id;

    return (
      <div>
        <div
          className={`
            flex justify-between items-start py-3 px-2 rounded-lg
            hover:bg-gray-50 transition-colors
            ${isBeingEdited ? "bg-blue-50/70 ring-1 ring-blue-200" : ""}
          `}
          style={{ paddingLeft: `${8 + node.level * 20}px` }}
        >
          <div className="flex items-start gap-2 min-w-0">
            {hasChildren ? (
              <button type="button" onClick={() => toggleExpanded(node._id)} className="mt-0.5 text-gray-400 hover:text-gray-700 shrink-0" aria-label={isOpen ? "Collapse" : "Expand"}>
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              <span className="w-4 shrink-0" />
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-gray-900 text-sm truncate">{node.name}</h4>
                {!node.isActive && <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Inactive</span>}
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  {node.productCount} {node.productCount === 1 ? "product" : "products"}
                </span>
              </div>
              {node.description && <p className="text-xs text-gray-500 mt-0.5">{node.description}</p>}
              <p className="text-[11px] text-gray-400 mt-0.5">/{node.slug}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-4">
            <button onClick={() => startAddChild(node._id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition" title="Add subcategory" type="button">
              <FolderPlus size={16} />
            </button>
            <button onClick={() => startEdit(node)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition" title="Edit category" type="button">
              <Pencil size={16} />
            </button>
            <button onClick={() => handleDelete(node)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition" title="Delete category" type="button">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {hasChildren && isOpen && (
          <div className="border-l border-gray-100 ml-4">
            {node.children.map((child) => (
              <CategoryRow key={child._id} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen
        bg-[#f8f9fa]
        p-4
        lg:p-8
        font-sans
      "
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* HEADER */}
        <div className="mb-4">
          <h1 className="text-[28px] font-bold text-gray-900">
            Manage <span className="text-blue-600">Categories</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Add and manage nested product categories for CAMX.lk store database.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ADD / EDIT CATEGORY FORM */}
          <div className="md:col-span-1">
            <form
              onSubmit={handleSubmit}
              className="
                bg-white
                border
                border-gray-100
                rounded-2xl
                p-6
                space-y-4
                shadow-sm
              "
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FolderPlus size={20} className="text-blue-600" />
                  {editingId ? "Edit Category" : "Add Category"}
                </h2>
                {editingId && (
                  <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-700" title="Cancel edit">
                    <X size={18} />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WiFi Cameras"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="
                    w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200
                    text-gray-900 outline-none focus:border-blue-500 transition-all text-sm
                  "
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Parent Category</label>
                <select
                  value={formData.parent}
                  onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                  className="
                    w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200
                    text-gray-900 outline-none focus:border-blue-500 transition-all text-sm
                    appearance-none cursor-pointer
                  "
                >
                  <option value="">None (root category)</option>
                  {availableParentOptions.map((opt) => (
                    <option key={opt._id} value={opt._id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">Choose a parent to nest this under an existing category, e.g. Cameras → WiFi Cameras.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Short description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="
                    w-full p-3 rounded-xl bg-gray-50 border border-gray-200
                    text-gray-900 outline-none focus:border-blue-500 transition-all resize-none text-sm
                  "
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="
                    w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200
                    text-gray-900 outline-none focus:border-blue-500 transition-all text-sm
                  "
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="
                      w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200
                      text-gray-900 outline-none focus:border-blue-500 transition-all text-sm
                    "
                  />
                </div>
                <div className="flex items-end pb-2.5">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    Active
                  </label>
                </div>
              </div>

              {message && <div className={`p-4 rounded-xl text-xs font-semibold border ${message.includes("✅") ? "bg-green-500/10 border-green-500/20 text-green-600" : "bg-red-500/10 border-red-500/20 text-red-600"}`}>{message}</div>}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="
                    flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold
                    transition disabled:opacity-50 cursor-pointer shadow-sm
                  "
                >
                  {submitting ? "Processing..." : editingId ? "Update Category" : "Save Category"}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="h-12 px-4 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* CATEGORIES TREE */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {/* SEARCH */}
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm" />
            </div>

            {/* TREE CARD */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex-1">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Layers size={20} className="text-blue-600" /> Category Tree
              </h2>

              {loading ? (
                <div className="py-12 text-center text-sm text-gray-400 animate-pulse">Loading categories...</div>
              ) : visibleTree.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">No categories found.</div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto pr-2">
                  {visibleTree.map((node) => (
                    <CategoryRow key={node._id} node={node} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
