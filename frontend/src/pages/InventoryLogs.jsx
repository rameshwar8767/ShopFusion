import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getInventoryLogs, getWarehouseStats } from "../redux/slices/inventorySlice";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiArrowLeft, 
  FiSearch, 
  FiArrowUpRight, 
  FiArrowDownLeft, 
  FiRefreshCw, 
  FiTruck,
  FiTrash2,
  FiBox,
  FiAlertCircle
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const InventoryLogs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Destructure from Redux state
  const { logs, stats, isLoading, pagination, isError } = useSelector((state) => state.inventory);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data whenever page changes
  useEffect(() => {
    dispatch(getInventoryLogs({ page: currentPage, search: searchTerm, limit: 10 }));
  }, [dispatch, currentPage, searchTerm]);

  // Fetch stats once on mount
  useEffect(() => {
    dispatch(getWarehouseStats());
  }, [dispatch]);

  // Helper: Extract quantity from aggregated data
  const getStatValue = (type) => {
    if (!Array.isArray(stats)) return 0;
    const found = stats.find(s => s._id === type);
    return found ? found.totalQuantity : 0;
  };

  const getStatusStyle = (type) => {
    const mapping = {
      RESTOCK: "bg-emerald-100 text-emerald-700 border-emerald-200",
      SALE: "bg-blue-100 text-blue-700 border-blue-200",
      EXPIRED: "bg-red-100 text-red-700 border-red-200",
      RETURN: "bg-purple-100 text-purple-700 border-purple-200",
      ADJUSTMENT: "bg-orange-100 text-orange-700 border-orange-200"
    };
    return mapping[type] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 pt-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold text-xs transition-colors mb-2"
            >
              <FiArrowLeft /> BACK TO DASHBOARD
            </button>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Warehouse Logs</h1>
            <p className="text-gray-500 font-medium">Real-time inventory movement audit trail</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text"
                placeholder="Search Product or SKU..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to page 1 on search
                }}
                className="pl-11 pr-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold w-full md:w-72 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Audit Table Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="px-8 py-6">Event ID</th>
                  <th className="px-6 py-6">Product & SKU</th>
                  <th className="px-6 py-6">Type</th>
                  <th className="px-6 py-6 text-center">Change</th>
                  <th className="px-6 py-6">Stock After</th>
                  <th className="px-6 py-6">Managed By</th>
                  <th className="px-8 py-6 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    // Skeleton Loading Rows
                    [...Array(5)].map((_, i) => (
                      <tr key={`skeleton-${i}`} className="animate-pulse">
                        <td colSpan="7" className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                      </tr>
                    ))
                  ) : logs && logs.length > 0 ? (
                    logs.map((log) => (
                      <motion.tr 
                        key={log._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-indigo-50/30 transition-colors group"
                      >
                        <td className="px-8 py-6 text-xs font-black text-indigo-600">
                          #{log._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-6 py-6">
                          <p className="text-sm font-black text-gray-800 leading-tight">
                            {log.product?.name || "Unlinked Product"}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                            {log.product?.sku || "NO-SKU"}
                          </p>
                        </td>
                        <td className="px-6 py-6">
                          <span className={`inline-flex items-center px-3 py-1 border rounded-full text-[10px] font-black tracking-tighter ${getStatusStyle(log.changeType)}`}>
                            {log.changeType}
                          </span>
                        </td>
                        <td className={`px-6 py-6 text-center text-sm font-black ${log.quantityChanged > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          <div className="flex items-center justify-center gap-1">
                            {log.quantityChanged > 0 ? <FiArrowUpRight size={14}/> : <FiArrowDownLeft size={14}/>}
                            {Math.abs(log.quantityChanged)}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <FiBox className="text-gray-300" />
                            <span className="font-bold text-gray-700">{log.stockAfter}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-sm text-gray-600 font-bold">
                          {log.user?.name || "System"}
                        </td>
                        <td className="px-8 py-6 text-right text-[11px] text-gray-400 font-bold whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleDateString()}
                          <span className="block opacity-50 text-[9px]">{new Date(log.createdAt).toLocaleTimeString()}</span>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <FiAlertCircle size={40} className="text-gray-200" />
                          <p className="text-gray-400 font-bold">No movement logs found matching your criteria.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
            <button 
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-gray-400">Page</span>
              <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-black shadow-lg shadow-indigo-200">
                {currentPage}
              </span>
              <span className="text-xs font-black text-gray-400">of {pagination.totalPages || 1}</span>
            </div>
            <button 
              disabled={currentPage === pagination.totalPages || isLoading}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
            >
              Next
            </button>
          </div>
        </motion.div>

        {/* Dynamic Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-5 shadow-sm">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-inner"><FiRefreshCw size={24} /></div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Sales Units</p>
              <p className="text-2xl font-black text-gray-900">{getStatValue("SALE")} <span className="text-xs text-gray-400">PCS</span></p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-5 shadow-sm">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner"><FiTruck size={24} /></div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Restocked</p>
              <p className="text-2xl font-black text-gray-900">{getStatValue("RESTOCK")} <span className="text-xs text-gray-400">PCS</span></p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-5 shadow-sm">
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl shadow-inner"><FiTrash2 size={24} /></div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Losses</p>
              <p className="text-2xl font-black text-gray-900">{getStatValue("EXPIRED")} <span className="text-xs text-gray-400">PCS</span></p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default InventoryLogs;