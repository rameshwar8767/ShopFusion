import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import PrivateRoute from './components/Layout/PrivateRoute';

// Pages
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Recommendations from './pages/Recommendations';
import Products from './pages/Products';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App flex flex-col min-h-screen">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-grow">
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/recommendations" element={<Recommendations />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                </PrivateRoute>
              }
            />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
