import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../redux/slices/authSlice";
import {
  FiMenu,
  FiX,
  FiLogOut,
  FiUser,
  FiSettings,
  FiShield,
  FiGrid,
  FiRepeat,
  FiZap,
  FiBox,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Close menus when location changes
  useEffect(() => {
    setIsOpen(false);
    setShowProfileMenu(false);
  }, [location]);

  if (!user) return null;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: FiGrid },
    { name: "Transactions", path: "/transactions", icon: FiRepeat },
    { name: "Recommendations", path: "/recommendations", icon: FiZap },
    { name: "Products", path: "/products", icon: FiBox },
  ];

  const userInitial = user?.name?.charAt(0).toUpperCase() || "U";

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18 py-3">
          {/* --- LOGO --- */}
          <Link to="/dashboard" className="flex items-center group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200"
            >
              <span className="text-white font-black text-xl tracking-tighter">SF</span>
            </motion.div>
            <span className="ml-3 text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
              ShopFusion
            </span>
          </Link>

          {/* --- DESKTOP NAV --- */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  isActive(link.path)
                    ? "bg-indigo-50 text-indigo-600 shadow-inner"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <link.icon className={isActive(link.path) ? "text-indigo-600" : "text-gray-400"} />
                {link.name}
              </Link>
            ))}

            <div className="h-6 w-[1px] bg-gray-200 mx-4" />

            {/* Admin Tag */}
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="mr-4 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100 flex items-center hover:bg-amber-100 transition-colors"
              >
                <FiShield className="mr-1" /> ADMIN
              </Link>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all"
              >
                <span className="text-sm font-bold text-gray-700 ml-2 hidden lg:inline">
                  {user.name.split(" ")[0]}
                </span>
                <div className="h-9 w-9 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-sm">
                  {userInitial}
                </div>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{user.email}</p>
                      </div>
                      <Link to="/profile" className="flex items-center px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                        <FiUser className="mr-3" /> Profile
                      </Link>
                      <Link to="/settings" className="flex items-center px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                        <FiSettings className="mr-3" /> Settings
                      </Link>
                      <div className="my-1 border-t border-gray-50" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors"
                      >
                        <FiLogOut className="mr-3" /> Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <div className="md:hidden flex items-center gap-3">
             {user.role === 'admin' && <FiShield className="text-amber-500" />}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl bg-gray-50 text-gray-600"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-50"
          >
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${
                    isActive(link.path)
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <link.icon size={20} />
                  {link.name}
                </Link>
              ))}
              
              <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                <Link to="/profile" className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-50 text-gray-600 font-bold text-sm">
                  <FiUser /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm"
                >
                  <FiLogOut /> Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;