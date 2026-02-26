import React, { useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTransactionStats } from "../redux/slices/transactionSlice";
import { getDashboard } from "../redux/slices/recommendationSlice";
import { getWarehouseStats } from "../redux/slices/inventorySlice";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ExpiringSoonRecommendations from "../pages/ExpiringSoonRecommendations";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  FiTrendingUp, FiShoppingCart, FiUsers, FiDollarSign, FiPackage,
  FiDownload, FiAlertCircle, FiBarChart2, FiActivity,
  FiLayers, FiArrowRight, FiZap, FiHash
} from "react-icons/fi";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reportRef = useRef();

  const { stats = {}, isLoading: txLoading } = useSelector((state) => state.transactions);
  const { dashboard, inventory, isLoading: dashLoading } = useSelector((state) => state.recommendations);

  // --- UNIQUE BUNDLE LOGIC ---
  const uniqueBundles = useMemo(() => {
    if (!dashboard?.bundles) return [];
    
    const bundleMap = new Map();
    dashboard.bundles.forEach((bundle) => {
      const items = Array.isArray(bundle.products) ? bundle.products : [];
      const uniqueKey = items
        .map(p => p.productId)
        .sort()
        .join("|");

      if (!bundleMap.has(uniqueKey)) {
        bundleMap.set(uniqueKey, bundle);
      }
    });
    return Array.from(bundleMap.values());
  }, [dashboard]);

  // --- DATA DEFENSE LAYER ---
  const safeStats = stats || {};
  const overview = safeStats.overview || {};
  const revenueData = Array.isArray(safeStats.revenueByDate) ? [...safeStats.revenueByDate].reverse() : [];
  
  const topProductsData = (safeStats.topProducts || []).map(p => ({
    name: p.productName || "Unknown",
    value: Number(p.totalQuantity || p.count || 0),
    revenue: Number(p.totalRevenue || 0)
  })).filter(p => p.value > 0);

  useEffect(() => {
    dispatch(getTransactionStats());
    dispatch(getDashboard());
    dispatch(getWarehouseStats());
  }, [dispatch]);

  const handleExportPDF = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, { 
      scale: 2, 
      useCORS: true,
      backgroundColor: "#f8fafc" 
    });
    
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Intelligence_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const statCards = [
    { title: "Total Revenue", value: `₹${Number(overview.totalRevenue || 0).toLocaleString()}`, icon: FiDollarSign, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+12.5%", desc: "Gross Sales", path: "/transactions" },
    { title: "Avg. Ticket", value: `₹${Number(overview.averageTransactionValue || 0).toFixed(2)}`, icon: FiActivity, color: "text-blue-600", bg: "bg-blue-50", trend: "+3.2%", desc: "Per Order", path: "/transactions" },
    { title: "Total Orders", value: overview.totalTransactions || 0, icon: FiShoppingCart, color: "text-orange-600", bg: "bg-orange-50", trend: "+18%", desc: "Volume", path: "/transactions" },
    { title: "Active Clients", value: overview.uniqueCustomers || 0, icon: FiUsers, color: "text-purple-600", bg: "bg-purple-50", trend: "+5.4%", desc: "Retention", path: "/customers" },
  ];

  const PIE_COLORS = ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"];

  if (txLoading || dashLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600" />
            <FiZap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 animate-pulse" size={24} />
        </div>
        <p className="mt-6 text-slate-500 font-black tracking-widest animate-pulse uppercase text-sm">Syncing Neural Data...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto px-6 pt-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              Engine Active
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">Intelligence Dashboard</h1>
          </motion.div>
          
          <button 
            onClick={handleExportPDF}
            className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-200/50 font-black text-sm active:scale-95"
          >
            <FiDownload className="group-hover:translate-y-1 transition-transform" /> 
            Generate Forensic PDF
          </button>
        </div>

        <div ref={reportRef} className="space-y-10 p-2">
          
          {/* KPI GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, i) => (
              <motion.div 
                key={stat.title} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(stat.path)}
                className="bg-white p-7 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 hover:shadow-2xl hover:border-indigo-100 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm`}>
                    <stat.icon size={22} />
                  </div>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-tighter">
                    {stat.trend}
                  </span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{stat.title}</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
                <div className="mt-6 flex items-center justify-between">
                   <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">{stat.desc}</p>
                   <FiArrowRight className="text-slate-300 group-hover:text-indigo-500 transform group-hover:translate-x-2 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* MAIN CHARTS SECTION */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-white p-10 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Revenue Trajectory</h3>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Real-time sales velocity</p>
                </div>
              </div>
              <div className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '20px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Demand Mix */}
            <div className="bg-white p-10 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 flex flex-col">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Demand Mix</h3>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1 mb-10">Product split</p>
              <div className="h-[300px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topProductsData}
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {topProductsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Database</p>
                  <p className="text-4xl font-black text-slate-900">{topProductsData.length}</p>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">Items</p>
                </div>
              </div>
              <div className="mt-8 space-y-4">
                {topProductsData.slice(0, 3).map((item, i) => (
                   <div key={i} className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                         <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: PIE_COLORS[i]}} />
                         <span className="text-slate-700 font-black truncate w-24">{item.name}</span>
                      </div>
                      <span className="font-black text-slate-900 bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-100">{item.value} units</span>
                   </div>
                ))}
              </div>
            </div>
          </div>

          {/* LOWER SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Horizontal Bar Chart */}
            <div className="bg-white p-10 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 flex flex-col min-h-[550px]">
              <div className="mb-10">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
                   <FiBarChart2 className="text-indigo-600"/> Velocity Leaders
                </h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Movement ranking</p>
              </div>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={topProductsData.slice(0, 7)} margin={{ left: 40, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        width={120} 
                        tick={{fontSize: 10, fontWeight: 900, fill: '#475569'}} 
                    />
                    <Tooltip cursor={{fill: '#F8FAFC'}} />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Inventory Risk Monitor */}
            <div className="bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col min-h-[550px] text-white border-4 border-slate-800">
               <div className="p-10 border-b border-white/5 bg-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black flex items-center gap-3 tracking-tight">
                        <FiAlertCircle className="text-rose-500 animate-pulse"/> Depletion Monitor
                      </h3>
                      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Critical Restock Required</p>
                    </div>
                  </div>
               </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <ExpiringSoonRecommendations inventoryData={inventory} />
              </div>
               <div className="p-8 bg-white/5 backdrop-blur-xl border-t border-white/5">
                 <button 
                  onClick={() => navigate('/inventory-logs')}
                  className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/20 active:scale-95"
                >
                  <FiPackage /> Access Warehouse Ledger
                </button>
               </div>
            </div>
          </div>

          {/* AI BUNDLES SECTION - ENHANCED STYLE */}
         
        </div>
      </div>
    </div>
  );
};

export default Dashboard;