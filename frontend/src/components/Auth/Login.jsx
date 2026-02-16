import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login, reset } from "../../redux/slices/authSlice";
import { toast } from "react-toastify";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import { motion } from "framer-motion";

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
      toast.warning("Please enter email and password");
      return;
    }

    dispatch(login({ email, password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="card p-8">
          <div className="text-center mb-6">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
              <FiLogIn className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mt-4">Welcome Back</h2>
            <p className="text-gray-600">Sign in to ShopFusion</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">
                <FiMail className="inline mr-2" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                className="input-field"
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="label">
                <FiLock className="inline mr-2" />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                className="input-field"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex justify-center"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-sm">
              Don’t have an account?{" "}
              <Link to="/register" className="text-primary-600 font-medium">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;