// pages/Recommendations.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  generateMBA,
  getAssociationRules,
  getProductBundles,
  getInventoryOptimization,
} from "../redux/slices/recommendationSlice";
import { getProducts } from "../redux/slices/productSlice";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiRefreshCw,
  FiTrendingUp,
  FiPackage,
  FiShoppingBag,
  FiAlertCircle,
  FiArrowRight,
  FiInfo,
  FiCheckCircle,
} from "react-icons/fi";

const Recommendations = () => {
  const dispatch = useDispatch();
  const {
    rules = [],
    bundles = [],
    inventory = [],
    isLoading,
  } = useSelector((state) => state.recommendations);

  const { products = [] } = useSelector((state) => state.products || {});
  const [activeTab, setActiveTab] = useState("rules");
  const [mbaParams, setMbaParams] = useState({
    minSupport: 0.01,
    minConfidence: 0.3,
    minLift: 1.0,
  });

  // Create a map for instant product lookup by ID
  const productsById = useMemo(() => {
    const map = {};
    (products || []).forEach((p) => {
      if (p.productId) map[p.productId] = p;
    });
    return map;
  }, [products]);

  useEffect(() => {
    dispatch(getProducts({ page: 1, limit: 1000 }));
    dispatch(getAssociationRules());
    dispatch(getProductBundles());
    dispatch(getInventoryOptimization());
  }, [dispatch]);

  const handleGenerateMBA = async () => {
    try {
      await dispatch(generateMBA(mbaParams)).unwrap();
      toast.success("AI Analysis Sync Complete");
      dispatch(getAssociationRules());
      dispatch(getProductBundles());
      dispatch(getInventoryOptimization());
    } catch (err) {
      toast.error(err || "Analysis failed");
    }
  };

  const tabs = [
    { id: "rules", label: "Smart Links", icon: FiTrendingUp, color: "text-blue-600" },
    { id: "bundles", label: "Product Bundles", icon: FiPackage, color: "text-purple-600" },
    { id: "inventory", label: "Stock Insights", icon: FiShoppingBag, color: "text-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="bg-white border-b border-gray-200 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              AI Recommendation <span className="text-indigo-600">Engine</span>
            </h1>
            <p className="text-gray-500 mt-2 max-w-2xl">
              Our ML engine analyzes transaction patterns to suggest optimal product pairings 
              and inventory adjustments.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Analysis Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Fine-Tune Analysis</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                Min Support <FiInfo className="ml-1 text-gray-400" />
              </label>
              <input
                type="number" step="0.01" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                value={mbaParams.minSupport}
                onChange={(e) => setMbaParams(p => ({ ...p, minSupport: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                Min Confidence <FiInfo className="ml-1 text-gray-400" />
              </label>
              <input
                type="number" step="0.1" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                value={mbaParams.minConfidence}
                onChange={(e) => setMbaParams(p => ({ ...p, minConfidence: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                Min Lift <FiInfo className="ml-1 text-gray-400" />
              </label>
              <input
                type="number" step="0.1" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                value={mbaParams.minLift}
                onChange={(e) => setMbaParams(p => ({ ...p, minLift: Number(e.target.value) }))}
              />
            </div>
          </div>

          <button
            onClick={handleGenerateMBA}
            disabled={isLoading}
            className="mt-6 w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {isLoading ? "Analyzing Data..." : "Run Engine Update"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id ? "bg-white shadow-md text-indigo-600" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {activeTab === "rules" && (
              rules.length === 0 ? <EmptyState text="Run analysis to see associations" /> : <RulesView rules={rules} />
            )}
            {activeTab === "bundles" && (
              bundles.length === 0 ? <EmptyState text="No bundle suggestions yet" /> : 
              <BundlesView bundles={bundles} productMap={productsById} /> // FIX: Passing productMap here
            )}
            {activeTab === "inventory" && (
              inventory.length === 0 ? <EmptyState text="Stock is currently optimized" /> : <InventoryView inventory={inventory} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const EmptyState = ({ text }) => (
  <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-20 text-center">
    <FiAlertCircle className="mx-auto text-gray-300 text-5xl mb-4" />
    <p className="text-gray-500 font-medium">{text}</p>
  </div>
);

const RulesView = ({ rules }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
    <table className="w-full text-left">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-100">
          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Pattern</th>
          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Confidence</th>
          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Lift</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {rules.map((r, i) => (
          <tr key={i} className="hover:bg-indigo-50/30">
            <td className="px-6 py-4 font-semibold">
               {r.antecedents?.join(" + ")} <FiArrowRight className="inline mx-2" /> {r.consequents?.join(", ")}
            </td>
            <td className="px-6 py-4">{(r.confidence * 100).toFixed(1)}%</td>
            <td className="px-6 py-4 font-bold text-indigo-600">{r.lift.toFixed(2)}x</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const BundlesView = ({ bundles, productMap }) => {
  // --- DEDUPLICATION LOGIC ---
  const uniqueBundles = useMemo(() => {
    const seen = new Set();
    const filtered = [];

    (bundles || []).forEach((bundle) => {
      // 1. Get all product IDs from the items array
      const productIds = (bundle.items || []).map((item) => item.productId);
      
      // 2. Sort them alphabetically so [A, B] and [B, A] both become "A|B"
      const fingerprint = [...productIds].sort().join("|");

      // 3. Only add to list if we haven't seen this specific combination yet
      if (!seen.has(fingerprint) && productIds.length > 0) {
        seen.add(fingerprint);
        filtered.push(bundle);
      }
    });

    return filtered;
  }, [bundles]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {uniqueBundles.map((b, i) => (
        <motion.div 
          whileHover={{ y: -5 }} 
          key={i} 
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <FiPackage />
            </div>
            <span className="text-xs font-black text-gray-300 uppercase">
              Bundle {i + 1}
            </span>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            {(b.items || []).map((item) => {
              const displayName = productMap?.[item.productId]?.name || item.name || `Product ${item.productId}`;
              
              return (
                <div key={item.productId} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-sm font-bold text-gray-800 line-clamp-1">
                      {displayName}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-gray-400 mt-1 ml-4">
                    ID: {item.productId}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Confidence</p>
              <p className="text-lg font-black text-gray-800">
                {typeof b.confidence === 'string' ? b.confidence : (b.confidence * 100).toFixed(0)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Lift Score</p>
              <p className="text-lg font-black text-purple-600">
                {typeof b.lift === 'string' ? b.lift : b.lift.toFixed(1)}x
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
const InventoryView = ({ inventory }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
    <table className="w-full text-left">
      <thead>
        <tr className="bg-gray-50 border-b">
          <th className="px-6 py-4 text-xs font-bold text-gray-500">PRODUCT ID</th>
          <th className="px-6 py-4 text-xs font-bold text-gray-500">STOCK</th>
          <th className="px-6 py-4 text-xs font-bold text-gray-500">STRATEGY</th>
        </tr>
      </thead>
      <tbody>
        {inventory.map((i, idx) => (
          <tr key={idx} className="border-b last:border-0">
            <td className="px-6 py-4 font-bold">{i.productId}</td>
            <td className="px-6 py-4 font-medium">{i.currentStock} units</td>
            <td className="px-6 py-4 text-sm text-gray-600">
              <span className={`px-2 py-1 rounded text-xs font-bold mr-2 ${i.needsRestock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {i.priority}
              </span>
              {i.suggestion}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Recommendations;