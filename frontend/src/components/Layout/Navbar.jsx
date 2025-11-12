import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../redux/slices/authSlice';
import { FiMenu, FiX, FiLogOut, FiUser, FiSettings, FiShield } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-elegant sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="h-10 w-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center"
              >
                <span className="text-white font-bold text-xl">SF</span>
              </motion.div>
              <span className="ml-3 text-2xl font-bold gradient-text">
                ShopFusion
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-700 font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/transactions"
              className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-700 font-medium"
            >
              Transactions
            </Link>
            <Link
              to="/recommendations"
              className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-700 font-medium"
            >
              Recommendations
            </Link>
            <Link
              to="/products"
              className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-700 font-medium"
            >
              Products
            </Link>
            
            {/* Admin Link (Desktop) */}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors duration-200 text-red-600 font-medium flex items-center"
              >
                <FiShield className="mr-1" />
                Admin
              </Link>
            )}

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="h-8 w-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">{user?.name}</span>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-elegant-lg py-2"
                  >
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <FiUser className="mr-2" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <FiSettings className="mr-2" />
                      Settings
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <FiLogOut className="mr-2" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {isOpen ? (
                <FiX className="h-6 w-6 text-gray-700" />
              ) : (
                <FiMenu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50">
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-white transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/transactions"
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-white transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Transactions
              </Link>
              <Link
                to="/recommendations"
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-white transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Recommendations
              </Link>
              <Link
                to="/products"
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-white transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Products
              </Link>
              
              {/* Admin Link (Mobile) */}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <FiShield className="inline mr-2" />
                  Admin Panel
                </Link>
              )}
              
              <hr className="my-2" />
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-white transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                <FiUser className="inline mr-2" />
                Profile
              </Link>
              <Link
                to="/settings"
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-white transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                <FiSettings className="inline mr-2" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <FiLogOut className="inline mr-2" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
