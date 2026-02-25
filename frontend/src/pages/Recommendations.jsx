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
      {/* Header Section */}
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
                Min Support <FiInfo className="ml-1 text-gray-400" title="Frequency of itemset in data" />
              </label>
              <input
                type="number" step="0.01" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={mbaParams.minSupport}
                onChange={(e) => setMbaParams(p => ({ ...p, minSupport: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                Min Confidence <FiInfo className="ml-1 text-gray-400" title="Likelihood of B being bought if A is bought" />
              </label>
              <input
                type="number" step="0.1" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={mbaParams.minConfidence}
                onChange={(e) => setMbaParams(p => ({ ...p, minConfidence: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                Min Lift <FiInfo className="ml-1 text-gray-400" title="Strength of the association rule" />
              </label>
              <input
                type="number" step="0.1" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={mbaParams.minLift}
                onChange={(e) => setMbaParams(p => ({ ...p, minLift: Number(e.target.value) }))}
              />
            </div>
          </div>

          <button
            onClick={handleGenerateMBA}
            disabled={isLoading}
            className="mt-6 w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-100"
          >
            {isLoading ? "Analyzing Data..." : "Run Engine Update"}
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-white shadow-md text-indigo-600 scale-105"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <tab.icon className={activeTab === tab.id ? tab.color : ""} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "rules" && (
                rules.length === 0 ? <EmptyState text="Run analysis to see associations" /> : <RulesView rules={rules} />
              )}
              {activeTab === "bundles" && (
                bundles.length === 0 ? <EmptyState text="No bundle suggestions yet" /> : <BundlesView bundles={bundles} />
              )}
              {activeTab === "inventory" && (
                inventory.length === 0 ? <EmptyState text="Stock is currently optimized" /> : <InventoryView inventory={inventory} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* --- ENHANCED SUB-COMPONENTS --- */

const EmptyState = ({ text }) => (
  <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-20 text-center">
    <FiAlertCircle className="mx-auto text-gray-300 text-5xl mb-4" />
    <p className="text-gray-500 font-medium">{text}</p>
  </div>
);

const RulesView = ({ rules }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Correlation Pattern</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Support</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Confidence</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Lift Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rules.slice(0, 15).map((r, i) => (
            <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-800">{r.antecedent?.join(" + ")}</span>
                  <FiArrowRight className="text-gray-400" />
                  <span className="font-semibold text-indigo-600">{r.consequent?.join(", ")}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{(r.support * 100).toFixed(1)}%</td>
              <td className="px-6 py-4">
                <div className="w-full bg-gray-100 rounded-full h-2 max-w-[100px] mb-1">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${r.confidence * 100}%` }}></div>
                </div>
                <span className="text-[10px] font-bold text-gray-500">{(r.confidence * 100).toFixed(1)}% LIKELIHOOD</span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.lift > 2 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {r.lift.toFixed(2)}x Strength
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const BundlesView = ({ bundles }) => {
  const uniqueBundlesMap = new Map();
  (bundles || []).forEach((b) => {
    const items = Array.isArray(b.products) ? b.products : [];
    const key = items.map(it => it.productId).sort().join("|");
    if (!uniqueBundlesMap.has(key)) uniqueBundlesMap.set(key, { ...b, products: items });
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from(uniqueBundlesMap.values()).map((b, i) => (
        <motion.div 
          whileHover={{ y: -5 }} 
          key={i} 
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl transition-all"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <FiPackage size={20} />
            </div>
            <span className="text-xs font-black text-gray-300">#BUNDLE_{i+1}</span>
          </div>
          
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Suggested Pairing</h4>
          <div className="flex flex-col gap-2 mb-6">
            {b.products.map((item) => (
              <div key={item.productId} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-sm font-semibold text-gray-700 line-clamp-1">{item.name}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Confidence</p>
              <p className="text-lg font-black text-gray-800">{(b.confidence * 100).toFixed(0)}%</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Lift</p>
              <p className="text-lg font-black text-purple-600">{b.lift.toFixed(1)}x</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const InventoryView = ({ inventory }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Product</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Current</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">AI Targeted</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Strategy</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {inventory.map((i, idx) => (
            <tr key={idx} className="group">
              <td className="px-6 py-4 font-bold text-gray-800">{i.productId}</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-gray-100 rounded-md text-sm font-medium">{i.currentStock} units</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-green-600">{i.recommendedStock}</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-green-500 uppercase">+{i.recommendedStock - i.currentStock} units</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-start gap-2">
                  <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-600 leading-relaxed">{i.reason}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Recommendations;