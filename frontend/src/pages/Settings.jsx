import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiLock, FiBell, FiDatabase, FiShield, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    mbaUpdates: true,
    newTransactions: false,
    weeklyReports: true,
  });

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    // TODO: Implement password change
    toast.success('Password updated successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleNotificationChange = (key) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key],
    });
    toast.success('Notification preferences updated');
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      toast.success('Data cleared successfully');
    }
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
          <h1 className="text-4xl font-bold gradient-text mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and security</p>
        </motion.div>

        <div className="space-y-6">
          {/* Change Password */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                <FiLock className="text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-600">Update your password regularly for security</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="input-field"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="input-field"
                  placeholder="Enter new password"
                  required
                  minLength="6"
                />
              </div>

              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="input-field"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <FiBell className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-600">Manage how you receive updates</p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </p>
                    <p className="text-sm text-gray-600">
                      Receive notifications about {key.toLowerCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Data Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <FiDatabase className="text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Data Management</h3>
                <p className="text-sm text-gray-600">Manage your application data</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Clear All Data</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Remove all transactions, products, and analysis data from your account.
                </p>
                <button onClick={handleClearData} className="btn-secondary btn-sm flex items-center text-red-600">
                  <FiTrash2 className="mr-2" />
                  Clear All Data
                </button>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Export Data</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Download all your data in JSON format for backup or migration.
                </p>
                <button className="btn-secondary btn-sm">
                  Export Data
                </button>
              </div>
            </div>
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <FiShield className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Security</h3>
                <p className="text-sm text-gray-600">Keep your account secure</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
                <span className="badge badge-warning">Coming Soon</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Login History</p>
                  <p className="text-sm text-gray-600">View recent account activity</p>
                </div>
                <button className="btn-secondary btn-sm">View</button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">Active Sessions</p>
                  <p className="text-sm text-gray-600">Manage logged-in devices</p>
                </div>
                <span className="badge badge-success">1 Active</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
