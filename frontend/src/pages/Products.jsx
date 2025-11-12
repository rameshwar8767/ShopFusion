import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getProducts,
  createProduct,
  bulkUploadProducts,
} from '../redux/slices/productSlice';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  FiUpload,
  FiSearch,
  FiPlus,
  FiEdit,
  FiPackage,
} from 'react-icons/fi';

const Products = () => {
  const dispatch = useDispatch();
  const { products, isLoading } = useSelector((state) => state.products);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productId: '',
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    features: '',
  });

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        features: newProduct.features.split(',').map((f) => f.trim()),
      };
      await dispatch(createProduct(productData)).unwrap();
      toast.success('Product added successfully!');
      setShowAddModal(false);
      setNewProduct({
        productId: '',
        name: '',
        category: '',
        price: '',
        stock: '',
        description: '',
        features: '',
      });
    } catch (error) {
      toast.error('Error adding product');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        await dispatch(bulkUploadProducts(jsonData)).unwrap();
        toast.success('Products uploaded successfully!');
        setShowUploadModal(false);
        dispatch(getProducts());
      } catch (error) {
        toast.error('Error uploading products');
      }
    };
    reader.readAsText(file);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Products</h1>
            <p className="text-gray-600">Manage your product catalog</p>
          </div>

          <div className="flex space-x-3 mt-4 md:mt-0">
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4 mb-6"
        >
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, ID, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </motion.div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner"></div>
            <span className="ml-3 text-gray-600">Loading products...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-12 text-center"
          >
            <FiPackage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No products found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary btn-sm"
            >
              Add Your First Product
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card hover:shadow-elegant-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600">{product.productId}</p>
                    </div>
                    <button className="text-gray-400 hover:text-primary-600 transition-colors">
                      <FiEdit className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="badge badge-info text-xs">
                        {product.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="font-semibold text-green-600">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Stock:</span>
                      <span
                        className={`badge text-xs ${
                          product.stock > 50
                            ? 'badge-success'
                            : product.stock > 10
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </div>
                  </div>

                  {product.features && product.features.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {product.features.slice(0, 3).map((feature, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                        {product.features.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            +{product.features.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-semibold mb-6">Add New Product</h3>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Product ID</label>
                    <input
                      type="text"
                      required
                      value={newProduct.productId}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, productId: e.target.value })
                      }
                      className="input-field"
                      placeholder="e.g., P001"
                    />
                  </div>
                  <div>
                    <label className="label">Product Name</label>
                    <input
                      type="text"
                      required
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      className="input-field"
                      placeholder="e.g., Laptop"
                    />
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <input
                      type="text"
                      required
                      value={newProduct.category}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, category: e.target.value })
                      }
                      className="input-field"
                      placeholder="e.g., Electronics"
                    />
                  </div>
                  <div>
                    <label className="label">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      className="input-field"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="label">Stock</label>
                    <input
                      type="number"
                      required
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, stock: e.target.value })
                      }
                      className="input-field"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="label">Features (comma-separated)</label>
                    <input
                      type="text"
                      value={newProduct.features}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, features: e.target.value })
                      }
                      className="input-field"
                      placeholder="e.g., Intel i7, 16GB RAM"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, description: e.target.value })
                    }
                    className="input-field"
                    rows="3"
                    placeholder="Product description"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Add Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-semibold mb-4">Upload Products</h3>
              <p className="text-gray-600 mb-4">
                Upload a JSON file containing your product data
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="input-field mb-4"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="btn-secondary btn-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
