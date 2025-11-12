import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  generateMBA,
  getAssociationRules,
  getProductBundles,
  getInventoryOptimization,
} from '../redux/slices/recommendationSlice';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  FiRefreshCw,
  FiTrendingUp,
  FiPackage,
  FiShoppingBag,
  FiAlertCircle,
} from 'react-icons/fi';

const Recommendations = () => {
  const dispatch = useDispatch();
  const { rules, bundles, inventory, isLoading } = useSelector(
    (state) => state.recommendations
  );

  const [activeTab, setActiveTab] = useState('rules');
  const [mbaParams, setMbaParams] = useState({
    minSupport: 0.01,
    minConfidence: 0.3,
    minLift: 1.0,
  });

  useEffect(() => {
    dispatch(getAssociationRules());
    dispatch(getProductBundles());
    dispatch(getInventoryOptimization());
  }, [dispatch]);

  const handleGenerateMBA = async () => {
    try {
      await dispatch(generateMBA(mbaParams)).unwrap();
      toast.success('MBA analysis completed successfully!');
      dispatch(getAssociationRules());
      dispatch(getProductBundles());
    } catch (error) {
      toast.error('Error generating MBA');
    }
  };

  const tabs = [
    { id: 'rules', label: 'Association Rules', icon: FiTrendingUp },
    { id: 'bundles', label: 'Product Bundles', icon: FiPackage },
    { id: 'inventory', label: 'Inventory Optimization', icon: FiShoppingBag },
  ];

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Recommendation Engine
          </h1>
          <p className="text-gray-600">
            AI-powered insights for product bundling, cross-selling, and inventory
          </p>
        </motion.div>

        {/* MBA Parameters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4">
                Market Basket Analysis Parameters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Min Support</label>
                  <input
                    type="number"
                    step="0.01"
                    value={mbaParams.minSupport}
                    onChange={(e) =>
                      setMbaParams({
                        ...mbaParams,
                        minSupport: parseFloat(e.target.value),
                      })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Min Confidence</label>
                  <input
                    type="number"
                    step="0.1"
                    value={mbaParams.minConfidence}
                    onChange={(e) =>
                      setMbaParams({
                        ...mbaParams,
                        minConfidence: parseFloat(e.target.value),
                      })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Min Lift</label>
                  <input
                    type="number"
                    step="0.1"
                    value={mbaParams.minLift}
                    onChange={(e) =>
                      setMbaParams({
                        ...mbaParams,
                        minLift: parseFloat(e.target.value),
                      })
                    }
                    className="input-field"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleGenerateMBA}
              disabled={isLoading}
              className="btn-primary flex items-center whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FiRefreshCw className="mr-2" />
                  Generate MBA
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card overflow-hidden mb-6"
        >
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'rules' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">
                  Association Rules (Top 20)
                </h3>
                {rules.length === 0 ? (
                  <div className="text-center py-8">
                    <FiAlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      No association rules found. Generate MBA to see recommendations.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead className="table-header">
                        <tr>
                          <th className="table-th">Antecedent (If)</th>
                          <th className="table-th">Consequent (Then)</th>
                          <th className="table-th">Support</th>
                          <th className="table-th">Confidence</th>
                          <th className="table-th">Lift</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {rules.slice(0, 20).map((rule, index) => (
                          <motion.tr
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="table-row"
                          >
                            <td className="table-td">
                              <div className="flex flex-wrap gap-1">
                                {rule.antecedent.map((item, idx) => (
                                  <span
                                    key={idx}
                                    className="badge badge-info text-xs"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="table-td">
                              <div className="flex flex-wrap gap-1">
                                {rule.consequent.map((item, idx) => (
                                  <span
                                    key={idx}
                                    className="badge badge-success text-xs"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="table-td">
                              {(rule.support * 100).toFixed(2)}%
                            </td>
                            <td className="table-td">
                              {(rule.confidence * 100).toFixed(2)}%
                            </td>
                            <td className="table-td">
                              <span
                                className={`badge ${
                                  rule.lift > 2
                                    ? 'badge-success'
                                    : rule.lift > 1.5
                                    ? 'badge-warning'
                                    : 'badge-info'
                                }`}
                              >
                                {rule.lift.toFixed(2)}x
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bundles' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">
                  Recommended Product Bundles
                </h3>
                {bundles.length === 0 ? (
                  <div className="text-center py-8">
                    <FiPackage className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      No bundles found. Generate MBA to see bundle recommendations.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bundles.map((bundle, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg border border-primary-200 hover:shadow-elegant-lg transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">
                            Bundle {index + 1}
                          </h4>
                          <span className="badge badge-success">
                            {bundle.expectedUplift}
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-600 mb-2">Products:</p>
                            <div className="flex flex-wrap gap-1">
                              {bundle.products.map((product, idx) => (
                                <span
                                  key={idx}
                                  className="badge badge-info text-xs"
                                >
                                  {product}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="pt-3 border-t border-gray-200">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Confidence:</span>
                              <span className="font-semibold">
                                {(bundle.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-gray-600">Lift:</span>
                              <span className="font-semibold">
                                {bundle.lift.toFixed(2)}x
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">
                  Inventory Optimization Recommendations
                </h3>
                {inventory.length === 0 ? (
                  <div className="text-center py-8">
                    <FiShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      No inventory recommendations available.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead className="table-header">
                        <tr>
                          <th className="table-th">Product ID</th>
                          <th className="table-th">Current Stock</th>
                          <th className="table-th">Recommended Stock</th>
                          <th className="table-th">Reason</th>
                          <th className="table-th">Priority</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {inventory.map((item, index) => (
                          <motion.tr
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="table-row"
                          >
                            <td className="table-td font-medium text-primary-600">
                              {item.productId}
                            </td>
                            <td className="table-td">{item.currentStock}</td>
                            <td className="table-td font-semibold text-green-600">
                              {item.recommendedStock}
                            </td>
                            <td className="table-td text-sm text-gray-600">
                              {item.reason}
                            </td>
                            <td className="table-td">
                              <span
                                className={`badge ${
                                  item.priority > 2
                                    ? 'badge-success'
                                    : item.priority > 1.5
                                    ? 'badge-warning'
                                    : 'badge-info'
                                }`}
                              >
                                {item.priority.toFixed(2)}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Recommendations;
