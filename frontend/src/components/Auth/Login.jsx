import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login, reset } from "../../redux/slices/authSlice";
import { toast } from "react-toastify";
import { FiMail, FiLock, FiLogIn, FiArrowRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message || "Login failed");
      dispatch(reset());
    }

    if (isSuccess || user) {
      navigate("/dashboard");
      dispatch(reset());
    }
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning("Please enter all credentials");
      return;
    }
    dispatch(login({ email, password }));
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden px-4">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-60" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[450px] relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="mx-auto h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-6"
            >
              <FiLogIn className="h-8 w-8 text-white" />
            </motion.div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome</h2>
            <p className="text-slate-500 font-medium mt-2">Access your ShopFusion dashboard</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">
                Business Email
              </label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">
                  Password
                </label>
                <Link to="/forgot-password" size="sm" className="text-[11px] font-black text-indigo-600 uppercase hover:underline">
                    Forgot?
                </Link>
              </div>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign Into Account
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>

            {/* Footer Link */}
            <p className="text-center text-slate-500 text-sm font-medium pt-4">
              New to the platform?{" "}
              <Link to="/register" className="text-indigo-600 font-black hover:text-indigo-700 transition-colors ml-1">
                Create Account
              </Link>
            </p>
          </form>
        </div>

        {/* System Status Footer */}
        <div className="mt-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                All Systems Operational
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;