import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { 
  FiUsers, FiSearch, FiMail, FiCalendar, 
  FiShoppingBag, FiStar, FiArrowLeft, FiDollarSign 
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getActiveClients } from "../redux/slices/transactionSlice";

const ActiveClient = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Get data from our new Redux state locations
  const { clients, isClientLoading } = useSelector((state) => state.transactions);

  useEffect(() => {
    dispatch(getActiveClients());
  }, [dispatch]);

  // Use 'clients' for filtering as it's the dedicated data for this page
  const filteredCustomers = (clients || []).filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isClientLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600 mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Loading Directory...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto px-4 pt-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-2 hover:gap-3 transition-all"
            >
              <FiArrowLeft /> Back to Dashboard
            </button>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <FiUsers className="text-indigo-600" /> Client Directory
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              Managing {clients?.length || 0} unique active buyers
            </p>
          </motion.div>

          <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Client Grid/Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Client</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Orders</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">LTV (Revenue)</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Last Activity</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((client, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors border-b border-gray-50 last:border-none">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">
                          {client.name?.charAt(0) || <FiUsers />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 truncate max-w-[200px]">{client.name || "Anonymous User"}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                            <FiMail size={12}/> {client.email || "No email linked"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <FiShoppingBag className="text-gray-400" />
                        <span className="font-bold text-gray-700">{client.orderCount || 0}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-1 text-emerald-600 font-black">
                        <FiDollarSign size={14} />
                        {Number(client.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                        <FiCalendar /> {client.lastOrderDate ? new Date(client.lastOrderDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <button className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-colors">
                        <FiStar />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-gray-50 rounded-full mb-4">
                        <FiUsers size={40} className="text-gray-300" />
                      </div>
                      <p className="text-gray-400 font-bold">No clients found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActiveClient;