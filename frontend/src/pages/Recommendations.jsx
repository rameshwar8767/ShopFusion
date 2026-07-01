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
} from "react-icons/fi";

// ─── Dedup rules: spread before sort to avoid mutating frozen Redux arrays ───
const deduplicateRules = (rules) => {
  const seen = new Set();
  return rules.filter((r) => {
    const key = [
      ...[...(r.antecedents || [])].sort(),
      "->",
      ...[...(r.consequents || [])].sort(),
    ].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// ─── Dedup bundles: .map() returns new array so .sort() is safe ───
const deduplicateBundles = (bundles) => {
  const seen = new Set();
  return bundles.filter((bundle) => {
    const primary = (bundle.primaryItems || []).map((i) => i.productId).sort();
    const recommended = (bundle.recommendedItems || []).map((i) => i.productId).sort();
    const key = [...primary, "->", ...recommended].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const Recommendations = () => {
  const dispatch = useDispatch();
  const { rules = [], bundles = [], inventory = [] } = useSelector(
    (state) => state.recommendations
  );
  const { products = [] } = useSelector((state) => state.products || {});

  const [activeTab, setActiveTab] = useState("rules");
  const [initialLoading, setInitialLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [mbaParams, setMbaParams] = useState({
    minSupport: 0.001,
    minConfidence: 0.1,
    minLift: 0.5,
  });

  const uniqueRules = useMemo(() => deduplicateRules(rules), [rules]);
  const uniqueBundles = useMemo(() => deduplicateBundles(bundles), [bundles]);

  const productsById = useMemo(() => {
    const map = {};
    (products || []).forEach((p) => {
      if (p.productId) map[p.productId] = p;
    });
    return map;
  }, [products]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(getProducts({ page: 1, limit: 1000 })),
          dispatch(getAssociationRules()),
          dispatch(getProductBundles()),
          dispatch(getInventoryOptimization()),
        ]);
      } catch (error) {
        console.error("Error fetching recommendations data:", error);
        toast.error("Failed to load recommendations data");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const handleGenerateMBA = async () => {
    try {
      setGenerating(true);
      toast.info("Starting AI analysis... This may take 30-60 seconds");
      await dispatch(generateMBA(mbaParams)).unwrap();
      toast.info("Training complete! Loading recommendations...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await Promise.all([
        dispatch(getAssociationRules()),
        dispatch(getProductBundles()),
        dispatch(getInventoryOptimization()),
      ]);
      toast.success("Recommendations generated successfully!");
    } catch (err) {
      console.error("Error:", err);
      toast.error(typeof err === "string" ? err : "Failed to generate recommendations");
    } finally {
      setGenerating(false);
    }
  };

  const tabs = [
    { id: "rules", label: "Product Pairs", icon: FiTrendingUp },
    { id: "bundles", label: "Recommended Bundles", icon: FiPackage },
    { id: "inventory", label: "Stock Alerts", icon: FiShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Smart Product <span className="text-indigo-600">Recommendations</span>
            </h1>
            <p className="text-gray-500 mt-2 max-w-2xl">
              Our AI analyzes your sales data to suggest which products customers buy
              together, helping you create better product bundles and increase sales.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Analysis Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <FiRefreshCw className={generating ? "animate-spin" : ""} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Analysis Settings</h3>
            <span className="text-xs text-gray-400 ml-2">(Advanced users only)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Min Support", key: "minSupport", step: "0.001" },
              { label: "Min Confidence", key: "minConfidence", step: "0.1" },
              { label: "Min Lift", key: "minLift", step: "0.1" },
            ].map(({ label, key, step }) => (
              <div key={key} className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  {label} <FiInfo className="ml-1 text-gray-400" />
                </label>
                <input
                  type="number"
                  step={step}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  value={mbaParams[key]}
                  onChange={(e) =>
                    setMbaParams((p) => ({ ...p, [key]: Number(e.target.value) }))
                  }
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleGenerateMBA}
            disabled={generating}
            className="mt-6 w-full md:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50"
          >
            {generating ? "Analyzing Your Data..." : "Generate Recommendations"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-white shadow-md text-indigo-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <tab.icon />
              {tab.label}
              {tab.id === "rules" && uniqueRules.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-600 rounded-full">
                  {uniqueRules.length}
                </span>
              )}
              {tab.id === "bundles" && uniqueBundles.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-600 rounded-full">
                  {uniqueBundles.length}
                </span>
              )}
              {tab.id === "inventory" && inventory.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-orange-100 text-orange-600 rounded-full">
                  {inventory.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {initialLoading ? (
              <div className="bg-white rounded-2xl p-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Loading recommendations...</p>
              </div>
            ) : (
              <>
                {activeTab === "rules" &&
                  (uniqueRules.length === 0 ? (
                    <EmptyState text="Run analysis to see associations" />
                  ) : (
                    <RulesView rules={uniqueRules} />
                  ))}
                {activeTab === "bundles" && (
                  <BundlesView bundles={uniqueBundles} productMap={productsById} />
                )}
                {activeTab === "inventory" &&
                  (inventory.length === 0 ? (
                    <EmptyState text="Stock is currently optimized" />
                  ) : (
                    <InventoryView inventory={inventory} />
                  ))}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ─── SUB-COMPONENTS ─── */

const EmptyState = ({ text }) => (
  <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-20 text-center">
    <FiAlertCircle className="mx-auto text-gray-300 text-5xl mb-4" />
    <p className="text-gray-500 font-medium text-lg mb-2">{text}</p>
    <p className="text-gray-400 text-sm">
      Click "Generate Recommendations" above to analyze your sales data
    </p>
  </div>
);

const RulesView = ({ rules }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="max-h-[600px] overflow-y-auto">
      <table className="w-full text-left">
        <thead className="sticky top-0 bg-gray-50 border-b border-gray-100 z-10">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
              If customer buys
            </th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
              Also suggest
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rules.map((r, i) => (
            <tr key={i} className="hover:bg-indigo-50/30">
              <td className="px-6 py-4 font-semibold text-gray-800">
                {r.antecedents?.join(" + ")}
              </td>
              <td className="px-6 py-4 text-indigo-600 font-semibold">
                <span className="flex items-center gap-2">
                  <FiArrowRight className="shrink-0" />
                  {r.consequents?.join(", ")}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const BundlesView = ({ bundles, productMap }) => {
  if (!bundles || bundles.length === 0) {
    return <EmptyState text="No bundle suggestions yet" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bundles.map((bundle, index) => {
        const primaryItems = bundle.primaryItems || [];
        const recommendedItems = bundle.recommendedItems || [];
        if ([...primaryItems, ...recommendedItems].length === 0) return null;

        return (
          <motion.div
            whileHover={{ y: -4 }}
            key={bundle.bundleId || index}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <FiPackage />
              </div>
              <span className="text-xs font-black text-gray-300 uppercase">
                Bundle {index + 1}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {primaryItems.map((item, i) => (
                <div
                  key={item.productId || i}
                  className="p-3 bg-indigo-50 rounded-xl border border-indigo-100"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    <span className="text-sm font-bold text-gray-800 line-clamp-1">
                      {productMap[item.productId]?.name ||
                        item.name ||
                        `Product ${item.productId}`}
                    </span>
                  </div>
                  {i === primaryItems.length - 1 && recommendedItems.length > 0 && (
                    <p className="text-[10px] font-mono text-indigo-400 mt-1 ml-4">
                      Pairs with ↓
                    </p>
                  )}
                </div>
              ))}

              {recommendedItems.map((item, i) => (
                <div
                  key={item.productId || i}
                  className="p-3 bg-purple-50 rounded-xl border border-purple-100"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                    <span className="text-sm font-bold text-gray-800 line-clamp-1">
                      {productMap[item.productId]?.name ||
                        item.name ||
                        `Product ${item.productId}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {bundle.expectedUplift && (
              <div className="pt-3 mt-3 border-t border-gray-100">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    bundle.expectedUplift === "Very High"
                      ? "bg-green-100 text-green-700"
                      : bundle.expectedUplift === "High"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {bundle.expectedUplift} Uplift
                </span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

const InventoryView = ({ inventory }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="max-h-[600px] overflow-y-auto">
      <table className="w-full text-left">
        <thead className="sticky top-0 bg-gray-50 border-b z-10">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-gray-500">PRODUCT ID</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500">STOCK</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500">STRATEGY</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item, idx) => (
            <tr key={idx} className="border-b last:border-0 hover:bg-gray-50/50">
              <td className="px-6 py-4 font-bold text-gray-800">{item.productId}</td>
              <td className="px-6 py-4 font-medium text-gray-700">
                {item.currentStock} units
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold mr-2 ${
                    item.needsRestock
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {item.priority}
                </span>
                {item.suggestion}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Recommendations;