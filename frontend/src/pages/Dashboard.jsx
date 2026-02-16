// pages/Dashboard.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTransactionStats } from "../redux/slices/transactionSlice";
import { getDashboard } from "../redux/slices/recommendationSlice";
import { motion } from "framer-motion";
import ExpiringSoonRecommendations from "../pages/ExpiringSoonRecommendations";
import {
  FiTrendingUp,
  FiShoppingCart,
  FiUsers,
  FiDollarSign,
  FiPackage,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const dispatch = useDispatch();

  const {
    stats = {},
    isLoading: txLoading,
  } = useSelector((state) => state.transactions);

  const {
    dashboard,
    isLoading: dashLoading,
  } = useSelector((state) => state.recommendations);

  const safeStats = stats || {};
  const safeDashboard = dashboard || { bundles: [] };

  useEffect(() => {
    dispatch(getTransactionStats());
    dispatch(getDashboard());
  }, [dispatch]);

  const loading = txLoading || dashLoading;

  const overview = safeStats.overview || {};

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${Number(overview.totalRevenue || 0).toFixed(2)}`,
      icon: FiDollarSign,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Total Transactions",
      value: overview.totalTransactions || 0,
      icon: FiShoppingCart,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Unique Customers",
      value: overview.uniqueCustomers || 0,
      icon: FiUsers,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Avg. Transaction",
      value: `$${Number(overview.averageTransactionValue || 0).toFixed(2)}`,
      icon: FiTrendingUp,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  // Pie chart over topProducts (by totalQuantity)
  const pieData =
    safeStats.topProducts?.map((p) => ({
      name: p.productName,
      value: p.totalQuantity,
    })) || [];

  const PIE_COLORS = ["#14b8a6", "#a855f7", "#f97316", "#3b82f6", "#22c55e"];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">
            See how your store is performing and which products to push now.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <div key={stat.title} className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div
                  className={`h-14 w-14 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                >
                  <stat.icon className={`h-7 w-7 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="card p-6 xl:col-span-2">
            <h3 className="text-xl font-semibold mb-4">
              Revenue Trend (Last 30 Days)
            </h3>
            {safeStats.revenueByDate?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[...safeStats.revenueByDate].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#14b8a6"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500">
                No revenue data available
              </p>
            )}
          </div>

          {/* Product distribution (pie) */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-4">
              Top Products (Share)
            </h3>
            {pieData.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500">
                No product distribution data
              </p>
            )}
          </div>
        </div>

        {/* Second charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Products Bar */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-4">Top 10 Products</h3>
            {safeStats.topProducts?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={safeStats.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="productName"
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalQuantity" fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500">
                No product data available
              </p>
            )}
          </div>

          {/* Expiring Soon – Sell Now */}
          <div className="card p-6 flex flex-col">
            <ExpiringSoonRecommendations />
          </div>
        </div>

        {/* Bundles */}
        {safeDashboard.bundles?.length > 0 && (
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <FiPackage className="inline mr-2" />
              Recommended Product Bundles
            </h3>

            {(() => {
              // Deduplicate symmetric bundles using productId set as key
              const uniqueMap = new Map();
              (safeDashboard.bundles || []).forEach((b) => {
                const items = Array.isArray(b.products) ? b.products : [];
                const ids = items.map((it) => it.productId);
                const key = [...ids].sort().join("|");
                if (!uniqueMap.has(key)) uniqueMap.set(key, b);
              });
              const uniqueBundles = Array.from(uniqueMap.values());

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uniqueBundles.slice(0, 6).map((bundle, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-white border border-gray-200 shadow-sm"
                    >
                      <div className="flex justify-between mb-2 items-center">
                        <h4 className="font-semibold">Bundle {idx + 1}</h4>
                        <span className="badge badge-success text-xs">
                          {bundle.expectedUplift}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {(bundle.products || []).map((item) => (
                          <span
                            key={item.productId}
                            className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700"
                          >
                            {item.name}{" "}
                            <span className="text-[10px] text-gray-500 ml-1">
                              ({item.productId})
                            </span>
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>
                          Confidence:{" "}
                          {bundle.confidence
                            ? (bundle.confidence * 100).toFixed(1)
                            : "0.0"}
                          %
                        </span>
                        <span>
                          Lift:{" "}
                          {bundle.lift ? bundle.lift.toFixed(2) : "0.00"}x
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
