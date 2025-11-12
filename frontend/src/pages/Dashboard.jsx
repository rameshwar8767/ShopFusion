import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTransactionStats } from '../redux/slices/transactionSlice';
import { getDashboard } from '../redux/slices/recommendationSlice';
import { motion } from 'framer-motion';
import {
  FiTrendingUp,
  FiShoppingCart,
  FiUsers,
  FiDollarSign,
  FiPackage,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats } = useSelector((state) => state.transactions);
  const { dashboard } = useSelector((state) => state.recommendations);

  useEffect(() => {
    dispatch(getTransactionStats());
    dispatch(getDashboard());
  }, [dispatch]);

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats?.overview?.totalRevenue?.toFixed(2) || 0}`,
      icon: FiDollarSign,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Transactions',
      value: stats?.overview?.totalTransactions || 0,
      icon: FiShoppingCart,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Unique Customers',
      value: stats?.overview?.uniqueCustomers || 0,
      icon: FiUsers,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Avg. Transaction',
      value: `$${stats?.overview?.averageTransactionValue?.toFixed(2) || 0}`,
      icon: FiTrendingUp,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Welcome back! Here's what's happening with your store.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`h-14 w-14 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                >
                  <stat.icon className={`h-7 w-7 ${stat.iconColor}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Revenue Trend (Last 30 Days)
            </h3>
            {stats?.revenueByDate && stats.revenueByDate.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[...stats.revenueByDate].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="_id" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#14b8a6"
                    strokeWidth={3}
                    dot={{ fill: '#14b8a6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-500">
                No revenue data available
              </div>
            )}
          </motion.div>

          {/* Top Products Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Top 10 Products
            </h3>
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="productName" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="totalQuantity"
                    fill="#a855f7"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-500">
                No product data available
              </div>
            )}
          </motion.div>
        </div>

        {/* Top Bundles */}
        {dashboard?.bundles && dashboard.bundles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                <FiPackage className="inline mr-2" />
                Recommended Product Bundles
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboard.bundles.slice(0, 6).map((bundle, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg border border-primary-200 hover:shadow-elegant transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">
                      Bundle {index + 1}
                    </h4>
                    <span className="badge badge-success">
                      {bundle.expectedUplift}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>Products:</strong>{' '}
                      {bundle.products.join(', ')}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Confidence: {(bundle.confidence * 100).toFixed(1)}%</span>
                      <span>Lift: {bundle.lift.toFixed(2)}x</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
