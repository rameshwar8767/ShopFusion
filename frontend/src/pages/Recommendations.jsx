// pages/Recommendations.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  generateMBA,
  getAssociationRules,
  getProductBundles,
  getInventoryOptimization,
} from "../redux/slices/recommendationSlice";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
// at top
import { getProducts } from "../redux/slices/productSlice";
import {
  FiRefreshCw,
  FiTrendingUp,
  FiPackage,
  FiShoppingBag,
  FiAlertCircle,
} from "react-icons/fi";
// If you have products in Redux, import selector here.
// Otherwise, pass a products map as prop into Recommendations.

const Recommendations = () => {
  const dispatch = useDispatch();

  const {
    rules = [],
    bundles = [],
    inventory = [],
    isLoading,
  } = useSelector((state) => state.recommendations);

  // Optional: if you keep products in Redux
  const { products = [] } = useSelector((state) => state.products || {});

  const [activeTab, setActiveTab] = useState("rules");
  const [mbaParams, setMbaParams] = useState({
    minSupport: 0.01,
    minConfidence: 0.3,
    minLift: 1.0,
  });

  // Build product lookup: { productId: { productId, name, ... } }
  const productsById = React.useMemo(() => {
    const map = {};
    (products || []).forEach((p) => {
      if (p.productId) map[p.productId] = p;
    });
    return map;
  }, [products]);

  useEffect(() => {
    dispatch(getProducts({ page: 1, limit: 1000 })); // or your actual params
    dispatch(getAssociationRules());
    dispatch(getProductBundles());
    dispatch(getInventoryOptimization());
  }, [dispatch]);


  const handleGenerateMBA = async () => {
    try {
      await dispatch(generateMBA(mbaParams)).unwrap();
      toast.success("MBA analysis completed");

      dispatch(getAssociationRules());
      dispatch(getProductBundles());
      dispatch(getInventoryOptimization());
    } catch (err) {
      toast.error(err || "Error generating MBA");
    }
  };

  const tabs = [
    { id: "rules", label: "Association Rules", icon: FiTrendingUp },
    { id: "bundles", label: "Product Bundles", icon: FiPackage },
    { id: "inventory", label: "Inventory Optimization", icon: FiShoppingBag },
  ];

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
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
            AI-powered insights for bundling and inventory optimization
          </p>
        </motion.div>

        {/* MBA Parameters */}
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            Market Basket Analysis Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              step="0.01"
              className="input-field"
              value={mbaParams.minSupport}
              onChange={(e) =>
                setMbaParams((p) => ({
                  ...p,
                  minSupport: Number(e.target.value) || 0,
                }))
              }
              placeholder="Min Support"
            />

            <input
              type="number"
              step="0.1"
              className="input-field"
              value={mbaParams.minConfidence}
              onChange={(e) =>
                setMbaParams((p) => ({
                  ...p,
                  minConfidence: Number(e.target.value) || 0,
                }))
              }
              placeholder="Min Confidence"
            />

            <input
              type="number"
              step="0.1"
              className="input-field"
              value={mbaParams.minLift}
              onChange={(e) =>
                setMbaParams((p) => ({
                  ...p,
                  minLift: Number(e.target.value) || 0,
                }))
              }
              placeholder="Min Lift"
            />
          </div>

          <div className="mt-4">
            <button
              onClick={handleGenerateMBA}
              disabled={isLoading}
              className="btn-primary flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="spinner mr-2" />
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
        </div>

        {/* Tabs */}
        <div className="card mb-6">
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 flex items-center gap-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? "border-b-2 border-primary-600 text-primary-600"
                    : "text-gray-600"
                }`}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* RULES */}
            {activeTab === "rules" && (
              <>
                {rules.length === 0 ? (
                  <EmptyState text="No association rules found" />
                ) : (
                  <RulesTable rules={rules} />
                )}
              </>
            )}

            {/* BUNDLES */}
            {activeTab === "bundles" && (
              <>
                {bundles.length === 0 ? (
                  <EmptyState text="No product bundles found" />
                ) : (
                  <BundlesGrid bundles={bundles} productsById={productsById} />
                )}
              </>
            )}

            {/* INVENTORY */}
            {activeTab === "inventory" && (
              <>
                {inventory.length === 0 ? (
                  <EmptyState text="No inventory recommendations found" />
                ) : (
                  <InventoryTable inventory={inventory} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- SMALL SUB COMPONENTS ---------------- */

const EmptyState = ({ text }) => (
  <div className="text-center py-10 text-gray-500">
    <FiAlertCircle className="mx-auto mb-2" size={36} />
    {text}
  </div>
);

const RulesTable = ({ rules }) => (
  <table className="table">
    <thead>
      <tr>
        <th>If</th>
        <th>Then</th>
        <th>Support</th>
        <th>Confidence</th>
        <th>Lift</th>
      </tr>
    </thead>
    <tbody>
      {rules.slice(0, 20).map((r, i) => (
        <tr key={i}>
          <td>{r.antecedent?.join(", ")}</td>
          <td>{r.consequent?.join(", ")}</td>
          <td>{(r.support * 100).toFixed(2)}%</td>
          <td>{(r.confidence * 100).toFixed(2)}%</td>
          <td>{r.lift.toFixed(2)}x</td>
        </tr>
      ))}
    </tbody>
  </table>
);

/**
 * Updated BundlesGrid:
 * - Shows product name + productId
 * - Deduplicates symmetric bundles (Milk+Bread vs Bread+Milk => one card)
 */
const BundlesGrid = ({ bundles }) => {
  const uniqueBundlesMap = new Map();

  (bundles || []).forEach((b) => {
    const items = Array.isArray(b.products) ? b.products : [];
    const ids = items.map((it) => it.productId);
    const normalizedIds = [...ids].sort();
    const key = normalizedIds.join("|");
    if (!uniqueBundlesMap.has(key)) {
      uniqueBundlesMap.set(key, { ...b, products: items });
    }
  });

  const uniqueBundles = Array.from(uniqueBundlesMap.values());

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {uniqueBundles.map((b, i) => (
        <div key={i} className="card p-4">
          <h4 className="font-semibold mb-2">Bundle {i + 1}</h4>

          <div className="flex flex-wrap gap-1 mb-2">
            {b.products.map((item) => (
              <span
                key={item.productId}
                className="badge badge-info text-xs"
              >
                {item.name} ({item.productId})
              </span>
            ))}
          </div>

          <p className="text-sm">
            Confidence: {(b.confidence * 100).toFixed(1)}%
          </p>
          <p className="text-sm">Lift: {b.lift.toFixed(2)}x</p>
        </div>
      ))}
    </div>
  );
};


const InventoryTable = ({ inventory }) => (
  <table className="table">
    <thead>
      <tr>
        <th>Product</th>
        <th>Current</th>
        <th>Recommended</th>
        <th>Reason</th>
      </tr>
    </thead>
    <tbody>
      {inventory.map((i, idx) => (
        <tr key={idx}>
          <td>{i.productId}</td>
          <td>{i.currentStock}</td>
          <td className="text-green-600 font-semibold">
            {i.recommendedStock}
          </td>
          <td>{i.reason}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default Recommendations;
