import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getTransactions,
  bulkUploadTransactions,
  deleteTransaction,
} from "../redux/slices/transactionSlice";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUpload,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiDownload,
  FiPlus,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiX,
} from "react-icons/fi";
import { format } from "date-fns";

const Transactions = () => {
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const [newTx, setNewTx] = useState({
    shopperId: "",
    items: [{ productId: "", price: "" }],
  });

  const dispatch = useDispatch();
  const { transactions, isLoading, pagination } = useSelector(
    (state) => state.transactions
  );

  // --- Optimization: Remove double-filtering ---
  // We fetch from the server based on filters. 
  // We only use useMemo for a final safety check or client-side sort.
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(
        getTransactions({
          page: currentPage,
          limit: 20,
          search: searchTerm,
          startDate,
          endDate,
          minAmount,
          maxAmount,
        })
      );
    }, 300); // Added debounce to prevent multiple rapid API calls

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, currentPage, searchTerm, startDate, endDate, minAmount, maxAmount]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const totalAmount = newTx.items.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const finalPayload = {
      ...newTx,
      transactionId: `TXN-${Date.now().toString().slice(-6)}`,
      totalAmount,
      timestamp: new Date().toISOString()
    };

    try {
      await dispatch(bulkUploadTransactions([finalPayload])).unwrap();
      toast.success("Transaction recorded!");
      setShowAddPanel(false);
      setNewTx({ shopperId: "", items: [{ productId: "", price: "" }] });
      // Reset to page 1 to see the new entry
      setCurrentPage(1);
    } catch (err) {
      toast.error("Failed to save transaction");
    }
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...newTx.items];
    updatedItems[index][field] = value;
    setNewTx({ ...newTx, items: updatedItems });
  };

  const addProductField = () => {
    setNewTx({ ...newTx, items: [...newTx.items, { productId: "", price: "" }] });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const txns = Array.isArray(parsed) ? parsed : (parsed.transactions || [parsed]);
        if (!txns.length) throw new Error("Empty file");

        await dispatch(bulkUploadTransactions(txns)).unwrap();
        toast.success("Data synchronized successfully");
        setShowUploadModal(false);
        setCurrentPage(1);
      } catch (err) {
        toast.error("Invalid JSON format");
      }
    };
    reader.readAsText(file);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this record permanently?")) {
      try {
        await dispatch(deleteTransaction(id)).unwrap();
        toast.success("Record removed");
      } catch (error) {
        toast.error("Operation failed");
      }
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.body.appendChild(document.createElement("a"));
    link.href = url;
    link.download = `SF-Export-${format(new Date(), "yyyy-MM-dd")}.json`;
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* --- Page Header --- */}
      <div className="bg-white border-b border-gray-100 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Transaction Ledger</h1>
              <p className="text-gray-500 text-sm mt-1 font-medium">Review and audit real-time retail activity</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button onClick={() => setShowUploadModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm">
                <FiUpload className="text-indigo-600" /> Bulk Import
              </button>
              <button onClick={() => setShowAddPanel(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                <FiPlus /> New Entry
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- Toolbar --- */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by ID or Shopper..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${showFilters ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                <FiFilter /> Filters
              </button>
              <button onClick={handleExport} className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-2xl text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all shadow-sm">
                <FiDownload /> Export
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-xl shadow-indigo-500/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <FilterInput label="Start Date" type="date" value={startDate} onChange={setStartDate} icon={FiCalendar} />
                <FilterInput label="End Date" type="date" value={endDate} onChange={setEndDate} icon={FiCalendar} />
                <FilterInput label="Min Amount" type="number" value={minAmount} onChange={setMinAmount} icon={FiDollarSign} />
                <FilterInput label="Max Amount" type="number" value={maxAmount} onChange={setMaxAmount} icon={FiDollarSign} />
                <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-3 pt-2 border-t border-gray-50">
                  <button onClick={() => { setStartDate(""); setEndDate(""); setMinAmount(""); setMaxAmount(""); setCurrentPage(1); }} className="text-sm font-bold text-gray-400 hover:text-gray-600 px-4">Reset All</button>
                  <button onClick={() => setShowFilters(false)} className="bg-indigo-50 text-indigo-700 px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-100">Apply View</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- Table --- */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center">
              <div className="h-12 w-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-400 font-bold text-sm">Syncing database...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-24 text-center">
              <FiFileText size={40} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-bold">No records match your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Transaction Ref</th>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Customer ID</th>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Items</th>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Revenue</th>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Post Date</th>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">#{tx.transactionId}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-700">{tx.shopperId}</td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-2">
                          {tx.items?.slice(0, 3).map((item, i) => (
                            <div key={i} className="h-7 w-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm">
                              {item.productId?.charAt(0) || "P"}
                            </div>
                          ))}
                          {tx.items?.length > 3 && (
                            <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white border border-white">+{tx.items.length - 3}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-gray-900">₹{Number(tx.totalAmount || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                        {tx.timestamp ? format(new Date(tx.timestamp), "MMM dd, yyyy") : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(tx._id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* --- Pagination --- */}
          {pagination.pages > 1 && (
            <div className="bg-white px-6 py-4 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs font-bold text-gray-400 uppercase">Page {currentPage} of {pagination.pages}</p>
              <div className="flex items-center gap-1">
                <PageBtn onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} label="Prev" />
                <PageBtn onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === pagination.pages} label="Next" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Modals (Add Panel & Upload) --- */}
      <AnimatePresence>
        {showAddPanel && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddPanel(false)} className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[70]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[80] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-gray-900">Manual Entry</h2>
                  <button onClick={() => setShowAddPanel(false)} className="p-2 hover:bg-gray-100 rounded-full"><FiX size={20} /></button>
                </div>
                <form onSubmit={handleManualSubmit} className="space-y-6">
                  <div>
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Shopper Identity</label>
                    <input required type="text" placeholder="e.g. SHOP_99" value={newTx.shopperId} onChange={(e) => setNewTx({...newTx, shopperId: e.target.value})} className="w-full mt-2 px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Basket Contents</label>
                      <button type="button" onClick={addProductField} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">+ Add Item</button>
                    </div>
                    {newTx.items.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input required placeholder="Product ID" value={item.productId} onChange={(e) => updateItem(index, 'productId', e.target.value)} className="flex-1 px-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm outline-none focus:bg-white focus:border-indigo-500" />
                        <input required type="number" placeholder="Price" value={item.price} onChange={(e) => updateItem(index, 'price', e.target.value)} className="w-24 px-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm outline-none focus:bg-white focus:border-indigo-500" />
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-sm font-bold text-gray-500">Total Calculation</span>
                      <span className="text-xl font-black text-gray-900">${newTx.items.reduce((sum, item) => sum + Number(item.price || 0), 0).toFixed(2)}</span>
                    </div>
                    <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all">Finalize Transaction</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}

        {showUploadModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowUploadModal(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-black text-gray-900 mb-6">Sync Transaction Data</h3>
              <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 text-center hover:border-indigo-200 transition-colors cursor-pointer relative">
                <input type="file" accept=".json" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                <FiFileText className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-xs font-bold text-gray-400 uppercase">Click to browse .json</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FilterInput = ({ label, type, value, onChange, icon: Icon }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all" />
    </div>
  </div>
);

const PageBtn = ({ onClick, disabled, label }) => (
  <button disabled={disabled} onClick={onClick} className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-30 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm">{label}</button>
);

export default Transactions;