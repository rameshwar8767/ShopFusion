import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiShoppingCart,
  FiPackage,
  FiTrendingUp,
  FiShield,
  FiActivity,
} from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
      return;
    }

    fetchAdminData();
  }, [user, navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // Fetch all users
      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data.data || []);

      // Fetch system stats
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data.data || {});
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Error loading admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        toast.success('User deleted successfully');
        fetchAdminData();
      } catch (error) {
        toast.error('Error deleting user');
      }
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'retailer' : 'admin';
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      fetchAdminData();
    } catch (error) {
      toast.error('Error updating user role');
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: users.length,
      icon: FiUsers,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Transactions',
      value: stats.totalTransactions,
      icon: FiShoppingCart,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: FiPackage,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue?.toFixed(2) || 0}`,
      icon: FiTrendingUp,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center mb-2">
            <FiShield className="text-primary-600 mr-2 h-8 w-8" />
            <h1 className="text-4xl font-bold gradient-text">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">System overview and user management</p>
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

        {/* User Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-xl font-semibold text-gray-900">
              <FiUsers className="inline mr-2" />
              User Management
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-th">Name</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Role</th>
                  <th className="table-th">Created</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((userItem, index) => (
                  <motion.tr
                    key={userItem._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="table-row"
                  >
                    <td className="table-td font-medium">{userItem.name}</td>
                    <td className="table-td">{userItem.email}</td>
                    <td className="table-td">
                      <span
                        className={`badge ${
                          userItem.role === 'admin'
                            ? 'badge-danger'
                            : 'badge-info'
                        }`}
                      >
                        {userItem.role}
                      </span>
                    </td>
                    <td className="table-td text-gray-600">
                      {new Date(userItem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="table-td">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleToggleRole(userItem._id, userItem.role)
                          }
                          className="btn-secondary btn-sm"
                        >
                          Toggle Role
                        </button>
                        <button
                          onClick={() => handleDeleteUser(userItem._id)}
                          className="btn-danger btn-sm"
                          disabled={userItem._id === user._id}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* System Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6 mt-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            <FiActivity className="inline mr-2" />
            System Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Database Status</span>
              <span className="badge badge-success">Connected</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">API Status</span>
              <span className="badge badge-success">Online</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Last Backup</span>
              <span className="text-gray-700">Never</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Server Uptime</span>
              <span className="text-gray-700">Online</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
