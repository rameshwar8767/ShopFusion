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
    minSupport: 0.001,
    minConfidence: 0.1,
    minLift: 0.5,
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
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(getProducts({ page: 1, limit: 1000 })),
          dispatch(getAssociationRules()),
          dispatch(getProductBundles()),
          dispatch(getInventoryOptimization())
        ]);
      } catch (error) {
        console.error('Error fetching recommendations data:', error);
        toast.error('Failed to load recommendations data');
      }
    };
    fetchData();
  }, [dispatch]);

  const handleGenerateMBA = async () => {
    try {
      toast.info('Starting AI analysis... This may take 30-60 seconds');
      
      await dispatch(generateMBA(mbaParams)).unwrap();
      
      toast.info('Training complete! Loading recommendations...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      await dispatch(getAssociationRules()).unwrap();
      await dispatch(getProductBundles()).unwrap();
      
      // Inventory is optional, don't fail if it errors
      try {
        await dispatch(getInventoryOptimization()).unwrap();
      } catch (invErr) {
        console.log('Inventory optimization skipped');
      }
      
      toast.success('Recommendations generated successfully!');
    } catch (err) {
      console.error('Error:', err);
      toast.error(err || 'Failed to generate recommendations');
    }
  };

  const tabs = [
    { id: "rules", label: "Product Pairs", icon: FiTrendingUp, color: "text-blue-600" },
    { id: "bundles", label: "Recommended Bundles", icon: FiPackage, color: "text-purple-600" },
    { id: "inventory", label: "Stock Alerts", icon: FiShoppingBag, color: "text-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="bg-white border-b border-gray-200 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Smart Product <span className="text-indigo-600">Recommendations</span>
            </h1>
            <p className="text-gray-500 mt-2 max-w-2xl">
              Our AI analyzes your sales data to suggest which products customers buy together, 
              helping you create better product bundles and increase sales.
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
            <h3 className="text-lg font-bold text-gray-800">Analysis Settings</h3>
            <span className="text-xs text-gray-400 ml-2">(Advanced users only)</span>
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
            className="mt-6 w-full md:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50"
          >
            {isLoading ? "Analyzing Your Data..." : "Generate Recommendations"}
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
            {isLoading ? (
              <div className="bg-white rounded-2xl p-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Loading recommendations...</p>
              </div>
            ) : (
              <>
                {activeTab === "rules" && (
                  rules.length === 0 ? <EmptyState text="Run analysis to see associations" /> : <RulesView rules={rules} />
                )}
                {activeTab === "bundles" && (
                  <BundlesView bundles={bundles} productMap={productsById} />
                )}
                {activeTab === "inventory" && (
                  inventory.length === 0 ? <EmptyState text="Stock is currently optimized" /> : <InventoryView inventory={inventory} />
                )}
              </>
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
    <p className="text-gray-500 font-medium text-lg mb-2">{text}</p>
    <p className="text-gray-400 text-sm">Click "Generate Recommendations" above to analyze your sales data</p>
  </div>
);

const RulesView = ({ rules }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="max-h-[600px] overflow-y-auto">
      <table className="w-full text-left">
        <thead className="sticky top-0 bg-gray-50 border-b border-gray-100 z-10">
          <tr>
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
  </div>
);

const BundlesView = ({ bundles, productMap }) => {
  console.log('BundlesView - bundles:', bundles);
  console.log('BundlesView - productMap keys:', Object.keys(productMap).length);

  if (!bundles || bundles.length === 0) {
    return <EmptyState text="No bundle suggestions yet" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bundles.map((bundle, index) => {
        console.log(`Bundle ${index}:`, bundle);
        
        if (!bundle.items || bundle.items.length === 0) {
          return null;
        }

        return (
          <motion.div 
            whileHover={{ y: -5 }} 
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

            <div className="flex flex-col gap-3 mb-6">
              {bundle.items.map((item, itemIndex) => {
                const productName = productMap[item.productId]?.name || item.name || `Product ${item.productId}`;
                
                return (
                  <div key={item.productId || itemIndex} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="text-sm font-bold text-gray-800 line-clamp-1">
                        {productName}
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
                  {((bundle.confidence || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Lift Score</p>
                <p className="text-lg font-black text-purple-600">
                  {(bundle.lift || 0).toFixed(2)}x
                </p>
              </div>
            </div>
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
  </div>
);

export default Recommendations;