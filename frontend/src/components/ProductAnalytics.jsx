import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiTrendingUp, FiAlertTriangle, FiDollarSign, FiPackage } from 'react-icons/fi';

const ProductAnalytics = ({ products }) => {
  // Category distribution
  const categoryData = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  // Stock analysis
  const lowStock = products.filter(p => p.stock < 10).length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const wellStocked = products.filter(p => p.stock >= 50).length;

  // Price analysis
  const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const insights = [
    { label: 'Low Stock Items', value: lowStock, icon: FiAlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Out of Stock', value: outOfStock, icon: FiPackage, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Well Stocked', value: wellStocked, icon: FiTrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Inventory Value', value: `₹${totalInventoryValue.toLocaleString()}`, icon: FiDollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Quick Insights */}
      <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
        {insights.map((insight, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className={`${insight.bg} ${insight.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
              <insight.icon size={20} />
            </div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{insight.label}</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{insight.value}</p>
          </div>
        ))}
      </div>

      {/* Category Distribution */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Category Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={categoryChartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {categoryChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {categoryChartData.slice(0, 5).map((cat, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-gray-700 font-medium">{cat.name}</span>
              </div>
              <span className="text-gray-900 font-bold">{cat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Levels */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Stock Levels by Category</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={categoryChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip />
            <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductAnalytics;
