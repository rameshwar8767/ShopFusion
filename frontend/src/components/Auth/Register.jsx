import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { register, reset } from "../../redux/slices/authSlice";
import { toast } from "react-toastify";
import { FiMail, FiLock, FiUser, FiUserPlus, FiArrowRight, FiShield } from "react-icons/fi";
import { motion } from "framer-motion";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { name, email, password, confirmPassword } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message || "Registration failed");
      dispatch(reset());
    }

    if (isSuccess || user) {
      toast.success("Account created successfully!");
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

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    dispatch(register({ name, email, password }));
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden px-4 py-12">
      {/* Decorative Background Blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-100 rounded-full blur-[120px] opacity-60" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-100 rounded-full blur-[120px] opacity-60" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[550px] relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              whileHover={{ rotate: -10 }}
              className="mx-auto h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 mb-6"
            >
              <FiUserPlus className="h-8 w-8 text-white" />
            </motion.div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Join Us</h2>
            <p className="text-slate-500 font-medium mt-2">Create your ShopFusion account</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">
                Full Name
              </label>
              <div className="relative group">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={onChange}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">
                  Confirm
                </label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={onChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 py-2 ml-1">
              <input
                id="terms"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-slate-500 font-medium leading-relaxed">
                By creating an account, I agree to the 
                <span className="text-indigo-600 font-black cursor-pointer ml-1">Terms</span> & 
                <span className="text-indigo-600 font-black cursor-pointer ml-1">Privacy Policy</span>.
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 disabled:opacity-70 group"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Free Account
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>

            {/* Footer Link */}
            <p className="text-center text-slate-500 text-sm font-medium pt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 font-black hover:text-indigo-700 transition-colors ml-1">
                Sign In
              </Link>
            </p>
          </form>
        </div>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
            <FiShield size={14} className="text-emerald-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                Enterprise Grade Security
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;