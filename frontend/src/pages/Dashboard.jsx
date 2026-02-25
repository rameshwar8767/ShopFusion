import React, { useEffect, useRef } from "react";
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
  FiTrendingUp,
  FiShoppingCart,
  FiUsers,
  FiDollarSign,
  FiPackage,
  FiDownload,
  FiAlertCircle,
  FiPieChart,
  FiBarChart2,
  FiActivity,
  FiCalendar,
  FiLayers,
  FiArrowRight
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reportRef = useRef();

  const { stats = {}, isLoading: txLoading } = useSelector((state) => state.transactions);
  const { dashboard, isLoading: dashLoading } = useSelector((state) => state.recommendations);
  const { stats: inventoryStats } = useSelector((state) => state.inventory);

  const safeStats = stats || {};
  const safeDashboard = dashboard || { bundles: [] };
  const overview = safeStats.overview || {};

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
      logging: false,
      backgroundColor: "#f9fafb" 
    });
    
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`ShopFusion_Analytics_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const statCards = [
    { 
        title: "Total Revenue", 
        value: `$${Number(overview.totalRevenue || 0).toLocaleString()}`, 
        icon: FiDollarSign, 
        color: "text-emerald-600", 
        bg: "bg-emerald-50", 
        trend: "+12.5%", 
        desc: "Lifetime Gross",
        path: "/transactions" 
    },
    { 
        title: "Avg. Ticket", 
        value: `$${Number(overview.averageTransactionValue || 0).toFixed(2)}`, 
        icon: FiActivity, 
        color: "text-blue-600", 
        bg: "bg-blue-50", 
        trend: "+3.2%", 
        desc: "Value per order",
        path: "/transactions" 
    },
    { 
        title: "Total Orders", 
        value: overview.totalTransactions || 0, 
        icon: FiShoppingCart, 
        color: "text-orange-600", 
        bg: "bg-orange-50", 
        trend: "+18%", 
        desc: "Volume processed",
        path: "/transactions" 
    },
    { 
        title: "Active Clients", 
        value: overview.uniqueCustomers || 0, 
        icon: FiUsers, 
        color: "text-purple-600", 
        bg: "bg-purple-50", 
        trend: "+5.4%", 
        desc: "Unique buyers",
        path: "/customers" // Adjust path based on your routes
    },
  ];

  const PIE_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  if (txLoading || dashLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Syncing Store Data...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto px-4 pt-8">
        
        {/* HEADER & ACTION BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-widest mb-1">
              <FiLayers /> Business Intelligence
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Executive Summary</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              <FiCalendar /> Data as of {new Date().toLocaleDateString()}
            </p>
          </motion.div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-bold active:scale-95"
            >
              <FiDownload /> Generate Report
            </button>
          </div>
        </div>

        <div ref={reportRef} className="space-y-8">
          
          {/* SECTION 1: TOP KPI TILES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, i) => (
              <motion.div 
                key={stat.title} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(stat.path)}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-colors group-hover:bg-indigo-600 group-hover:text-white`}>
                      <stat.icon size={22} />
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        {stat.trend}
                        </span>
                        <FiArrowRight className="mt-2 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.title}</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">{stat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* SECTION 2: TREND ANALYSIS & MARKET MIX */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-gray-800">Sales Velocity</h3>
                  <p className="text-sm text-gray-500 font-medium">Daily revenue performance</p>
                </div>
              </div>
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[...(safeStats.revenueByDate || [])].reverse()}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#chartGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-xl font-black text-gray-800">Inventory Mix</h3>
              <p className="text-sm text-gray-500 font-medium mb-6">Revenue share by category</p>
              <div className="h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={safeStats.topProducts?.map(p => ({ name: p.productName, value: p.totalQuantity })) || []}
                      innerRadius={80}
                      outerRadius={105}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {safeStats.topProducts?.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase">Total Items</p>
                  <p className="text-2xl font-black text-gray-900">{safeStats.topProducts?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: OPERATIONAL RISK & DEMAND */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col min-h-[500px]">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                    <FiBarChart2 className="text-indigo-500"/> Product Demand
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">Top performing products by volume</p>
                </div>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={safeStats.topProducts?.slice(0, 8)} margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="productName" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        width={100} 
                        tick={{fontSize: 11, fontWeight: 700, fill: '#475569'}} 
                    />
                    <Tooltip cursor={{fill: '#f8fafc'}} borderRadius={12} />
                    <Bar dataKey="totalQuantity" fill="#6366f1" radius={[0, 12, 12, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Inventory Risk Monitor */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
               <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        <FiAlertCircle className="text-red-500"/> Inventory Risk
                      </h3>
                      <p className="text-sm text-gray-500 font-medium mt-1">Immediate action required</p>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black rounded-full uppercase tracking-tighter">Critical Stock</span>
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                  <ExpiringSoonRecommendations />
               </div>
               <div className="p-6 bg-gray-50 text-center">
                 <button 
                  onClick={() => navigate('/inventory-logs')}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                >
                  <FiPackage /> View All Warehouse Logs
                </button>
               </div>
            </div>
          </div>

          {/* SECTION 4: AI STRATEGY (SMART BUNDLES) */}
          {safeDashboard.bundles?.length > 0 && (
            <div className="bg-gray-900 p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[120px] opacity-20 -mr-32 -mt-32"></div>
              
              <div className="relative z-10 mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/50">
                    <FiPackage size={24} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tight">AI Sales Strategies</h3>
                    <p className="text-indigo-300 font-medium italic">Machine learning generated cross-sell bundles</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                {safeDashboard.bundles.slice(0, 6).map((bundle, idx) => (
                  <motion.div 
                    whileHover={{ y: -8 }}
                    key={idx} 
                    className="p-8 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col h-full hover:bg-white/10 transition-all"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Bundle ID #{idx + 101}</span>
                        <div className="flex items-center gap-2">
                           <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                           <span className="text-xs font-bold text-emerald-400 uppercase tracking-tighter">Optimized</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-white">{(bundle.confidence * 100).toFixed(0)}%</p>
                        <p className="text-[10px] text-indigo-300 font-bold uppercase">Confidence</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-8 flex-1">
                      {(bundle.products || []).map((item) => (
                        <div key={item.productId} className="flex items-start gap-4 p-3 bg-black/20 rounded-2xl border border-white/5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm">
                            {item.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{item.name}</p>
                            <p className="text-[10px] text-gray-400">SKU: {item.productId.slice(-6)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-auto">
                      <div>
                        <p className="text-xl font-black text-white">{bundle.lift?.toFixed(2)}x</p>
                        <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Market Lift</p>
                      </div>
                      <button className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 rounded-xl text-xs font-black transition-colors shadow-lg shadow-indigo-500/20">
                        Deploy
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;