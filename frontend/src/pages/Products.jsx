import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getProducts,
  createProduct,
  bulkUploadProducts,
  updateProduct,
  deleteProduct, // Ensure this exists in your slice
} from "../redux/slices/productSlice";

import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUpload,
  FiSearch,
  FiPlus,
  FiEdit,
  FiPackage,
  FiTrash2,
  FiTag,
  FiLayers,
} from "react-icons/fi";

const Products = () => {
  const dispatch = useDispatch();
  const { products = [], isLoading } = useSelector((state) => state.products);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const initialFormState = {
    productId: "",
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    features: "",
  };

  const [newProduct, setNewProduct] = useState(initialFormState);
  const [editForm, setEditForm] = useState(initialFormState);

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  // ---------------- HANDLERS ----------------
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        features: newProduct.features ? newProduct.features.split(",").map((f) => f.trim()) : [],
      };
      await dispatch(createProduct(productData)).unwrap();
      toast.success("Product added successfully");
      setShowAddModal(false);
      setNewProduct(initialFormState);
      dispatch(getProducts());
    } catch (err) {
      toast.error(err || "Failed to add product");
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        ...editForm,
        price: Number(editForm.price),
        stock: Number(editForm.stock),
        features: editForm.features ? editForm.features.split(",").map((f) => f.trim()) : [],
      };
      await dispatch(updateProduct({ id: editingProduct._id, data: updatedData })).unwrap();
      toast.success("Product updated successfully");
      setShowEditModal(false);
      dispatch(getProducts());
    } catch (err) {
      toast.error(err || "Failed to update product");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
        toast.success("Product deleted");
        dispatch(getProducts());
      } catch (err) {
        toast.error(err || "Delete failed");
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const productsArray = Array.isArray(parsed) ? parsed : parsed.products;
        await dispatch(bulkUploadProducts(productsArray)).unwrap();
        toast.success("Bulk upload successful");
        dispatch(getProducts());
        setShowUploadModal(false);
      } catch (err) {
        toast.error("Invalid JSON file");
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.productId?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FiPackage className="text-blue-600" /> Inventory Management
            </h1>
            <p className="text-gray-500">Track and manage your store products</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={() => setShowUploadModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              <FiUpload /> Bulk Import
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <FiPlus /> Add Product
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
          <input
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            placeholder="Search by name, Product ID, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-gray-200">
            <FiPackage className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or add a new product.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredProducts.map((p) => (
                <motion.div
                  layout
                  key={p._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                        <FiTag size={20} />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setEditForm({
                              ...p,
                              features: Array.isArray(p.features) ? p.features.join(", ") : "",
                            });
                            setShowEditModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg truncate mb-1">{p.name}</h3>
                    <p className="text-xs font-mono text-gray-400 mb-3 uppercase tracking-wider">{p.productId}</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md flex items-center gap-1">
                        <FiLayers size={12} /> {p.category}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                      <div>
                        <p className="text-xs text-gray-400 uppercase">Price</p>
                        <p className="text-lg font-bold text-gray-900">${p.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase">Stock</p>
                        <p className={`text-sm font-semibold ${p.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>
                          {p.stock} units
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* MODALS (Simplified for brevity, but logically identical) */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  {showEditModal ? "Edit Product" : "Create New Product"}
                </h3>
                <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={showEditModal ? handleUpdateProduct : handleAddProduct} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Product ID</label>
                    <input
                      disabled={showEditModal}
                      name="productId"
                      className={`w-full p-3 border rounded-lg outline-none mt-1 ${showEditModal ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300 focus:border-blue-500'}`}
                      placeholder="e.g. LAP-001"
                      value={showEditModal ? editForm.productId : newProduct.productId}
                      onChange={(e) => showEditModal ? handleEditChange(e) : setNewProduct({...newProduct, productId: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Product Name</label>
                    <input
                      name="name"
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 mt-1"
                      placeholder="MacBook Pro 14"
                      value={showEditModal ? editForm.name : newProduct.name}
                      onChange={(e) => showEditModal ? handleEditChange(e) : setNewProduct({...newProduct, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Category</label>
                    <input
                      name="category"
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 mt-1"
                      value={showEditModal ? editForm.category : newProduct.category}
                      onChange={(e) => showEditModal ? handleEditChange(e) : setNewProduct({...newProduct, category: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Price</label>
                      <input
                        type="number"
                        name="price"
                        className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 mt-1"
                        value={showEditModal ? editForm.price : newProduct.price}
                        onChange={(e) => showEditModal ? handleEditChange(e) : setNewProduct({...newProduct, price: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Stock</label>
                      <input
                        type="number"
                        name="stock"
                        className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 mt-1"
                        value={showEditModal ? editForm.stock : newProduct.stock}
                        onChange={(e) => showEditModal ? handleEditChange(e) : setNewProduct({...newProduct, stock: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 mt-1"
                    value={showEditModal ? editForm.description : newProduct.description}
                    onChange={(e) => showEditModal ? handleEditChange(e) : setNewProduct({...newProduct, description: e.target.value})}
                  />
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="flex-1 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
                    {showEditModal ? "Update Product" : "Save Product"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Upload Modal (kept simple) */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl w-full max-w-md text-center">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <FiUpload size={30} />
              </div>
              <h3 className="text-xl font-bold mb-2">Import JSON</h3>
              <p className="text-gray-500 mb-6">Select a .json file containing your product list</p>
              <input type="file" accept=".json" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-6" />
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 font-medium hover:text-gray-600">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;