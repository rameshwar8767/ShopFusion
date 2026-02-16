import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../redux/slices/authSlice";
import {
  FiMenu,
  FiX,
  FiLogOut,
  FiUser,
  FiSettings,
  FiShield,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // 🔐 If not logged in, do not render navbar
  if (!user) return null;

  const handleLogout = () => {
    dispatch(logout());
    setIsOpen(false);
    setShowProfileMenu(false);
    navigate("/login");
  };

  const closeMenus = () => {
    setIsOpen(false);
    setShowProfileMenu(false);
  };

  const userInitial =
    user?.name && user.name.length > 0
      ? user.name.charAt(0).toUpperCase()
      : "U";

  return (
    <nav className="bg-white shadow-elegant sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <Link
            to="/dashboard"
            onClick={closeMenus}
            className="flex items-center"
          >
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

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-3">
            <Link className="nav-link" to="/dashboard">
              Dashboard
            </Link>
            <Link className="nav-link" to="/transactions">
              Transactions
            </Link>
            <Link className="nav-link" to="/recommendations">
              Recommendations
            </Link>
            <Link className="nav-link" to="/products">
              Products
            </Link>

            {/* Admin */}
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="px-4 py-2 rounded-lg bg-red-50 text-red-600 flex items-center hover:bg-red-100"
              >
                <FiShield className="mr-1" />
                Admin
              </Link>
            )}

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu((p) => !p)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <div className="h-8 w-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {userInitial}
                </div>
                <span className="font-medium text-gray-700">
                  {user.name}
                </span>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg"
                  >
                    <Link
                      to="/profile"
                      onClick={closeMenus}
                      className="menu-item"
                    >
                      <FiUser className="mr-2" /> Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={closeMenus}
                      className="menu-item"
                    >
                      <FiSettings className="mr-2" /> Settings
                    </Link>
                    <hr />
                    <button
                      onClick={handleLogout}
                      className="menu-item text-red-600 w-full text-left"
                    >
                      <FiLogOut className="mr-2" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen((p) => !p)}
            className="md:hidden p-2"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="md:hidden bg-gray-50 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2">
              <Link to="/dashboard" onClick={closeMenus} className="mobile-link">
                Dashboard
              </Link>
              <Link
                to="/transactions"
                onClick={closeMenus}
                className="mobile-link"
              >
                Transactions
              </Link>
              <Link
                to="/recommendations"
                onClick={closeMenus}
                className="mobile-link"
              >
                Recommendations
              </Link>
              <Link
                to="/products"
                onClick={closeMenus}
                className="mobile-link"
              >
                Products
              </Link>

              {user.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={closeMenus}
                  className="mobile-link text-red-600"
                >
                  <FiShield className="inline mr-2" /> Admin
                </Link>
              )}

              <hr />
              <Link
                to="/profile"
                onClick={closeMenus}
                className="mobile-link"
              >
                <FiUser className="inline mr-2" /> Profile
              </Link>
              <Link
                to="/settings"
                onClick={closeMenus}
                className="mobile-link"
              >
                <FiSettings className="inline mr-2" /> Settings
              </Link>
              <button
                onClick={handleLogout}
                className="mobile-link text-red-600 w-full text-left"
              >
                <FiLogOut className="inline mr-2" /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;