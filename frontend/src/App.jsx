import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout
import PrivateRoute from "./components/Layout/PrivateRoute";
import ProtectedLayout from "./components/Layout/ProtectedLayout";

// Pages
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Recommendations from "./pages/Recommendations";
import Products from "./pages/Products";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* -------- PUBLIC ROUTES -------- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* -------- PROTECTED ROUTES -------- */}
          <Route
            element={
              <PrivateRoute>
                <ProtectedLayout />
              </PrivateRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/products" element={<Products />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* -------- FALLBACK -------- */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          newestOnTop
          pauseOnHover
          theme="light"
        />
      </Router>
    </Provider>
  );
}

export default App;