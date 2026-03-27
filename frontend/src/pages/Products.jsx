import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getProducts,
  createProduct,
  bulkUploadProducts,
  updateProduct,
  deleteProduct,
} from "../redux/slices/productSlice";
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import ProductAnalytics from "../components/ProductAnalytics";
import {
  FiUpload,
  FiSearch,
  FiPlus,
  FiEdit,
  FiPackage,
  FiTrash2,
  FiTag,
  FiLayers,
  FiBarChart2,
  FiFilter,
} from "react-icons/fi";

const Products = () => {
  const dispatch = useDispatch();
  const { products = [], isLoading } = useSelector((state) => state.products);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

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
    dispatch(getProducts({ page: currentPage, limit: 100 })).then((result) => {
      if (result.payload?.total) {
        setTotalProducts(result.payload.total);
      }
    });
  }, [dispatch, currentPage]);

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

    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'json') {
      // Handle JSON file
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          const productsArray = Array.isArray(parsed) ? parsed : parsed.products;
          await dispatch(bulkUploadProducts(productsArray)).unwrap();
          toast.success(`${productsArray.length} products uploaded successfully`);
          dispatch(getProducts());
          setShowUploadModal(false);
        } catch (err) {
          toast.error("Invalid JSON file");
        } finally {
          e.target.value = "";
        }
      };
      reader.readAsText(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      // Handle Excel file
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (!jsonData || jsonData.length === 0) {
            toast.error('Excel file is empty or has no data rows');
            e.target.value = "";
            return;
          }

          // Transform Excel data to match product schema
          const productsArray = jsonData.map((row, index) => {
            const productId = row.productId || row.ProductID || row['Product ID'] || row.PRODUCTID;
            const name = row.name || row.Name || row['Product Name'] || row.NAME;
            
            if (!productId || !name) {
              throw new Error(`Row ${index + 2}: Missing required fields (productId or name)`);
            }

            const product = {
              productId,
              name,
              category: row.category || row.Category || row.CATEGORY || '',
              price: Number(row.price || row.Price || row.PRICE || 0),
              stock: Number(row.stock || row.Stock || row.STOCK || 0),
              description: row.description || row.Description || row.DESCRIPTION || ''
            };

            // Handle features - can be string or array
            if (row.features || row.Features) {
              const featuresValue = row.features || row.Features;
              if (typeof featuresValue === 'string') {
                product.features = featuresValue.split(',').map(f => f.trim());
              } else if (Array.isArray(featuresValue)) {
                product.features = featuresValue;
              }
            }

            // Handle optional fields if present
            if (row.image) product.image = row.image;
            if (row.expiryDate) product.expiryDate = row.expiryDate;

            return product;
          });

          await dispatch(bulkUploadProducts(productsArray)).unwrap();
          toast.success(`${productsArray.length} products uploaded from Excel`);
          setCurrentPage(1);
          dispatch(getProducts({ page: 1, limit: 100 })).then((result) => {
            if (result.payload?.total) {
              setTotalProducts(result.payload.total);
            }
          });
          setShowUploadModal(false);
        } catch (err) {
          console.error('Excel import error:', err);
          const errorMsg = err.message || err || "Failed to parse Excel file. Check console for details.";
          toast.error(errorMsg);
        } finally {
          e.target.value = "";
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error('Please upload a JSON or Excel file');
      e.target.value = "";
    }
  };

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = p.name?.toLowerCase().includes(term) ||
      p.productId?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term);
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FiPackage className="text-blue-600" /> Inventory Management
            </h1>
            <p className="text-gray-500">Track and manage your store products {totalProducts > 0 && `(${totalProducts} total)`}</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={() => setShowAnalytics(!showAnalytics)} 
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-colors shadow-sm ${
                showAnalytics ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FiBarChart2 /> {showAnalytics ? 'Hide' : 'Show'} Analytics
            </button>
            <button onClick={() => setShowUploadModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              <FiUpload /> Bulk Import
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <FiPlus /> Add Product
            </button>
          </div>
        </div>

        {/* Search Bar and Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
            <input
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              placeholder="Search by name, Product ID, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <FiFilter className="text-gray-400 flex-shrink-0" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Dashboard */}
        {showAnalytics && products.length > 0 && (
          <ProductAnalytics products={products} />
        )}

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
                        <p className="text-lg font-bold text-gray-900">₹{p.price}</p>
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

        {/* Pagination */}
        {totalProducts > 100 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 font-medium">
              Page {currentPage} of {Math.ceil(totalProducts / 100)}
            </span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage >= Math.ceil(totalProducts / 100)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
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
              <h3 className="text-xl font-bold mb-2">Import Products</h3>
              <p className="text-gray-500 mb-6">Select a JSON or Excel file containing your product list</p>
              <input type="file" accept=".json,.xlsx,.xls" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-6" />
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 font-medium hover:text-gray-600">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;