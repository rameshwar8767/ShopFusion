// pages/Products.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getProducts,
  createProduct,
  bulkUploadProducts,
} from "../redux/slices/productSlice";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FiUpload,
  FiSearch,
  FiPlus,
  FiEdit,
  FiPackage,
} from "react-icons/fi";

const Products = () => {
  const dispatch = useDispatch();

  const {
    products = [],
    isLoading,
  } = useSelector((state) => state.products);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [newProduct, setNewProduct] = useState({
    productId: "",
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    features: "",
  });

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  // ---------------- ADD PRODUCT ----------------
  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.productId || !newProduct.name) {
      toast.error("Product ID and Name are required");
      return;
    }

    try {
      const productData = {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        features: newProduct.features
          ? newProduct.features.split(",").map((f) => f.trim())
          : [],
      };

      await dispatch(createProduct(productData)).unwrap();
      toast.success("Product added successfully");

      setShowAddModal(false);
      setNewProduct({
        productId: "",
        name: "",
        category: "",
        price: "",
        stock: "",
        description: "",
        features: "",
      });

      dispatch(getProducts());
    } catch (err) {
      toast.error(err || "Failed to add product");
    }
  };

  // ---------------- BULK UPLOAD ----------------
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);

        let productsArray;
        if (Array.isArray(parsed)) {
          productsArray = parsed;
        } else if (Array.isArray(parsed.products)) {
          productsArray = parsed.products;
        } else {
          toast.error(
            "JSON must be an array of products or { products: [...] }"
          );
          e.target.value = "";
          return;
        }

        if (!productsArray.length) {
          toast.error("No products found in JSON");
          e.target.value = "";
          return;
        }

        await dispatch(bulkUploadProducts(productsArray)).unwrap();
        toast.success("Products uploaded successfully");

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

  // ---------------- FILTER ----------------
  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.productId?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Products
            </h1>
            <p className="text-gray-600">Manage your product catalog</p>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-secondary btn-sm flex items-center"
            >
              <FiUpload className="mr-2" />
              Bulk Upload
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary btn-sm flex items-center"
            >
              <FiPlus className="mr-2" />
              Add Product
            </button>
          </div>
        </motion.div>

        {/* Search */}
        <div className="card p-4 mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pl-10"
              placeholder="Search by name, ID, or category"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="card p-12 text-center">
            <FiPackage className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No products found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary btn-sm"
            >
              Add Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => {
              const features = Array.isArray(p.features) ? p.features : [];
              return (
                <div key={p._id} className="card hover:shadow-lg">
                  <div className="p-6">
                    <div className="flex justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{p.name}</h3>
                        <p className="text-xs text-gray-500">{p.productId}</p>
                      </div>
                      <FiEdit className="text-gray-400" />
                    </div>

                    <p className="text-sm">
                      Price:{" "}
                      <span className="font-semibold text-green-600">
                        ${Number(p.price || 0).toFixed(2)}
                      </span>
                    </p>

                    <p className="text-sm">
                      Stock:{" "}
                      <span className="font-semibold">{p.stock}</span>
                    </p>

                    {features.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {features.slice(0, 3).map((f, i) => (
                          <span key={i} className="badge badge-info text-xs">
                            {f}
                          </span>
                        ))}
                        {features.length > 3 && (
                          <span className="badge text-xs">
                            +{features.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ADD MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="card p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]">
              <h3 className="text-xl font-semibold mb-4">Add Product</h3>
              <form onSubmit={handleAddProduct} className="space-y-4">
                {Object.keys(newProduct).map((key) => (
                  <input
                    key={key}
                    className="input-field"
                    placeholder={key}
                    value={newProduct[key]}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, [key]: e.target.value })
                    }
                  />
                ))}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button className="btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* UPLOAD MODAL */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="card p-6 max-w-md w-full">
              <h3 className="font-semibold mb-3">Upload Products JSON</h3>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="mb-4"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="btn-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
