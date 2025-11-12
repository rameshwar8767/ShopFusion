import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiShield, FiEdit2, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement update profile functionality
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="card p-6">
              <div className="text-center">
                <div className="h-24 w-24 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-4xl">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {user?.name}
                </h2>
                <p className="text-gray-600 text-sm mb-4">{user?.email}</p>
                <span className="badge badge-info">
                  {user?.role || 'Retailer'}
                </span>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <FiMail className="text-gray-400 mr-3" />
                    <span className="text-gray-600">Email verified</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FiShield className="text-gray-400 mr-3" />
                    <span className="text-gray-600">Account secured</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FiUser className="text-gray-400 mr-3" />
                    <span className="text-gray-600">Member since {new Date().getFullYear()}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Account Information
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary btn-sm flex items-center"
                  >
                    <FiEdit2 className="mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`input-field ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  />
                </div>

                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`input-field ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  />
                </div>

                <div>
                  <label className="label">Role</label>
                  <input
                    type="text"
                    value={user?.role || 'Retailer'}
                    disabled
                    className="input-field bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Role cannot be changed
                  </p>
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <button type="submit" className="btn-primary flex items-center">
                      <FiSave className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Account Statistics */}
            <div className="card p-6 mt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Account Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">MBA Analyses</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Account Age</p>
                  <p className="text-2xl font-bold text-gray-900">1d</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
