import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getInventoryLogs, getWarehouseStats } from "../redux/slices/inventorySlice";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiArrowLeft, FiSearch, FiArrowUpRight, FiArrowDownLeft, 
  FiRefreshCw, FiTruck, FiTrash2, FiBox, FiAlertCircle 
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const InventoryLogs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { logs, stats, isLoading, pagination } = useSelector((state) => state.inventory);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // --- 1. SEARCH DEBOUNCING ---
  // Prevents calling the API on every single keystroke
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(getInventoryLogs({ 
        page: currentPage, 
        search: searchTerm, 
        limit: 10 
      }));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, currentPage, searchTerm]);

  useEffect(() => {
    dispatch(getWarehouseStats());
  }, [dispatch]);

  // --- 2. FLEXIBLE STAT CALCULATOR ---
  const getStatValue = (type) => {
    if (!stats) return 0;
    // Handles array format from MongoDB aggregation
    if (Array.isArray(stats)) {
      const found = stats.find(s => s._id === type);
      return found ? found.totalQuantity : 0;
    }
    // Handles object format if you used the refined controller
    const keyMap = { SALE: 'sales', RESTOCK: 'restocks', EXPIRED: 'disposals' };
    return stats[keyMap[type]] || 0;
  };

  const getStatusStyle = (type) => {
    const mapping = {
      RESTOCK: "bg-emerald-50 text-emerald-700 border-emerald-100",
      SALE: "bg-blue-50 text-blue-700 border-blue-100",
      EXPIRED: "bg-rose-50 text-rose-700 border-rose-100",
      RETURN: "bg-purple-50 text-purple-700 border-purple-100",
      ADJUSTMENT: "bg-amber-50 text-amber-700 border-amber-100"
    };
    return mapping[type] || "bg-gray-50 text-gray-700 border-gray-100";
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12 font-sans selection:bg-indigo-100">
      <div className="max-w-7xl mx-auto px-4 pt-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-bold text-[10px] tracking-widest transition-colors mb-2"
            >
              <FiArrowLeft /> BACK TO DASHBOARD
            </button>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Audit Trail</h1>
            <p className="text-gray-500 font-medium">Monitoring {pagination?.total || 0} inventory movements</p>
          </div>

          <div className="relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text"
              placeholder="Search by Product or SKU..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-11 pr-6 py-4 bg-white border-0 rounded-2xl text-sm font-bold w-full md:w-80 shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                  <th className="px-8 py-6">ID</th>
                  <th className="px-6 py-6">Product Information</th>
                  <th className="px-6 py-6">Type</th>
                  <th className="px-6 py-6 text-center">Movement</th>
                  <th className="px-6 py-6">Stock Level</th>
                  <th className="px-8 py-6 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="6" className="px-8 py-10"><div className="h-4 bg-gray-100 rounded-full w-full"></div></td>
                    </tr>
                  ))
                ) : logs?.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6 text-[10px] font-black text-indigo-400">
                        {log._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-800">{log.product?.name || "Deleted Product"}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{log.product?.sku || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-3 py-1 border rounded-lg text-[10px] font-black tracking-tight ${getStatusStyle(log.changeType)}`}>
                          {log.changeType}
                        </span>
                      </td>
                      <td className={`px-6 py-6 text-center text-sm font-black ${log.quantityChanged > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        <div className="flex items-center justify-center gap-1 bg-gray-50 py-1 rounded-lg">
                          {log.quantityChanged > 0 ? <FiArrowUpRight /> : <FiArrowDownLeft />}
                          {Math.abs(log.quantityChanged)}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <FiBox className="text-gray-300" />
                          <span className="font-bold text-gray-700">{log.stockAfter}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-xs font-bold text-gray-600 block">
                          {new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[10px] font-medium text-gray-400 uppercase">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-24 text-center">
                      <FiAlertCircle className="mx-auto text-gray-200 mb-4" size={48} />
                      <p className="text-gray-400 font-bold tracking-tight">No movement records found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-6 bg-gray-50/30 border-t border-gray-100 flex justify-between items-center">
            <p className="text-xs font-bold text-gray-400 italic">
              Showing page {currentPage} of {pagination?.pages || 1}
            </p>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1 || isLoading}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-3 bg-white border border-gray-200 rounded-xl hover:shadow-md disabled:opacity-20 transition-all"
              >
                <FiArrowLeft />
              </button>
              <button 
                disabled={currentPage >= (pagination?.pages || 1) || isLoading}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-6 py-3 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 disabled:opacity-20 transition-all"
              >
                NEXT PAGE
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {[
            { label: "Stock Out (Sales)", val: "SALE", icon: FiRefreshCw, color: "blue" },
            { label: "Stock In (Restock)", val: "RESTOCK", icon: FiTruck, color: "emerald" },
            { label: "Losses (Expired)", val: "EXPIRED", icon: FiTrash2, color: "rose" }
          ].map((item) => (
            <motion.div key={item.val} whileHover={{ y: -5 }} className="bg-white p-8 rounded-[2rem] border border-gray-100 flex items-center gap-6 shadow-sm">
              <div className={`p-4 bg-${item.color}-50 text-${item.color}-600 rounded-2xl`}>
                <item.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                <p className="text-3xl font-black text-gray-900">{getStatValue(item.val)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventoryLogs;