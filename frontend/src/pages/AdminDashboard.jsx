import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import {
  FiUsers,
  FiShoppingCart,
  FiPackage,
  FiTrendingUp,
  FiShield,
  FiActivity,
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
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import api from "../services/api"; // ✅ unified api
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [analytics, setAnalytics] = useState({
  transactionsByDate: [],
  usersByRole: [],
});

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });
  const COLORS = ["#6366f1", "#f97316"];
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔐 HARD GUARD (NO UI FLASH)
  if (!user || user.role !== "admin") {
    toast.error("Access denied. Admin privileges required.");
    return <Navigate to="/dashboard" replace />;
  }
  const fetchAdminData = async () => {
  try {
    setLoading(true);

    const [usersRes, statsRes, analyticsRes] = await Promise.all([
      api.get("/admin/users"),
      api.get("/admin/stats"),
      api.get("/admin/analytics"),
    ]);

    setUsers(usersRes.data.data || []);
    setStats(statsRes.data.data || {});
    setAnalytics(analyticsRes.data.data || {});
  } catch (error) {
    toast.error("Failed to load admin data");
  } finally {
    setLoading(false);
  }
};
  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    fetchAdminData();
    // eslint-disable-next-line
  }, []);



  // ---------------- DELETE USER ----------------
  const handleDeleteUser = async (userId) => {
    if (userId === user._id) {
      toast.error("You cannot delete yourself");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success("User deleted successfully");
      fetchAdminData();
    } catch (error) {
      toast.error("Error deleting user");
    }
  };

  // ---------------- TOGGLE ROLE ----------------
  const handleToggleRole = async (userId, currentRole) => {
    if (userId === user._id) {
      toast.error("You cannot change your own role");
      return;
    }

    const newRole = currentRole === "admin" ? "retailer" : "admin";

    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchAdminData();
    } catch (error) {
      toast.error("Error updating user role");
    }
  };

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  // ---------------- STATS ----------------
  const statCards = [
    {
      title: "Total Users",
      value: users.length,
      icon: FiUsers,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Transactions",
      value: stats.totalTransactions,
      icon: FiShoppingCart,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: FiPackage,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue?.toFixed(2) || 0}`,
      icon: FiTrendingUp,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center mb-2">
            <FiShield className="text-primary-600 mr-2 h-8 w-8" />
            <h1 className="text-4xl font-bold gradient-text">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600">
            System overview and user management
          </p>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card p-6 flex justify-between items-center"
            >
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div
                className={`h-14 w-14 ${stat.bgColor} rounded-lg flex items-center justify-center`}
              >
                <stat.icon className={`h-7 w-7 ${stat.iconColor}`} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="card p-6 mt-6">
          <h3 className="font-semibold mb-4">Transactions Trend</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.transactionsByDate}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#4f46e5"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6 mt-6">
          <h3 className="font-semibold mb-4">Revenue Trend</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.transactionsByDate}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6 mt-6">
          <h3 className="font-semibold mb-4">User Roles</h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.usersByRole}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {analytics.usersByRole.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* USERS TABLE */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b font-semibold">
            <FiUsers className="inline mr-2" />
            User Management
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          u.role === "admin"
                            ? "badge-danger"
                            : "badge-info"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="flex gap-2">
                      <button
                        onClick={() => handleToggleRole(u._id, u.role)}
                        className="btn-secondary btn-sm"
                      >
                        Toggle Role
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="btn-danger btn-sm"
                        disabled={u._id === user._id}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SYSTEM STATUS */}
        <div className="card p-6 mt-6">
          <h3 className="font-semibold mb-4">
            <FiActivity className="inline mr-2" />
            System Activity
          </h3>
          <div className="space-y-2">
            <Status label="Database" value="Connected" />
            <Status label="API" value="Online" />
            <Status label="Backup" value="Not configured" />
            <Status label="Server" value="Running" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Status = ({ label, value }) => (
  <div className="flex justify-between border-b py-2">
    <span>{label}</span>
    <span className="badge badge-success">{value}</span>
  </div>
);

export default AdminDashboard;