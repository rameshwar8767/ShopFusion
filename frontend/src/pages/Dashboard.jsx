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
    { title: "Total Sales", value: `₹${Number(overview.totalRevenue || 0).toLocaleString()}`, icon: FiDollarSign, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+12.5%", desc: "Revenue Earned", path: "/transactions" },
    { title: "Average Order", value: `₹${Number(overview.averageTransactionValue || 0).toFixed(2)}`, icon: FiActivity, color: "text-blue-600", bg: "bg-blue-50", trend: "+3.2%", desc: "Per Customer", path: "/transactions" },
    { title: "Total Orders", value: overview.totalTransactions || 0, icon: FiShoppingCart, color: "text-orange-600", bg: "bg-orange-50", trend: "+18%", desc: "Completed", path: "/transactions" },
    { title: "Customers", value: overview.uniqueCustomers || 0, icon: FiUsers, color: "text-purple-600", bg: "bg-purple-50", trend: "+5.4%", desc: "Active Buyers", path: "/customers" },
  ];

  const PIE_COLORS = ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"];

  if (txLoading || dashLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="relative mb-8">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-600" />
          <FiZap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 animate-pulse" size={32} />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-2">Loading Your Dashboard...</h3>
        <p className="text-slate-500 font-medium">Preparing your business insights</p>
        <div className="mt-8 flex gap-2">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
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
              Live Analytics
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">Business Dashboard</h1>
            <p className="text-slate-500 mt-2 text-lg">Your complete business overview at a glance</p>
          </motion.div>
          
          <button 
            onClick={handleExportPDF}
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-indigo-300/50 transition-all font-black text-sm active:scale-95"
          >
            <FiDownload className="group-hover:translate-y-1 transition-transform" /> 
            Download Report (PDF)
          </button>
        </div>

        <div ref={reportRef} className="space-y-10 p-2">
          
          {/* Welcome Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl">
                  <FiTrendingUp size={28} />
                </div>
                <div>
                  <h2 className="text-3xl font-black">Welcome Back! 👋</h2>
                  <p className="text-white/80 text-sm mt-1">Here's what's happening with your business today</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="text-white/60 text-xs font-bold uppercase mb-2">Quick Tip</div>
                  <div className="text-lg font-bold">Check low stock alerts below to avoid running out of popular items</div>
                </div>
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="text-white/60 text-xs font-bold uppercase mb-2">Pro Feature</div>
                  <div className="text-lg font-bold">Use AI Recommendations to discover which products sell well together</div>
                </div>
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="text-white/60 text-xs font-bold uppercase mb-2">Export Data</div>
                  <div className="text-lg font-bold">Download your business report as PDF anytime using the button above</div>
                </div>
              </div>
            </div>
          </motion.div>
          
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
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Sales Over Time</h3>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Daily revenue trends</p>
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
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Product Categories</h3>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1 mb-10">Sales by category</p>
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
                   <FiBarChart2 className="text-indigo-600"/> Best Selling Products
                </h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Top performers</p>
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
                        <FiAlertCircle className="text-rose-500 animate-pulse"/> Low Stock Alerts
                      </h3>
                      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Products running out soon</p>
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
                  <FiPackage /> View Full Inventory
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