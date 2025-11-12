import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiGithub, 
  FiLinkedin, 
  FiMail, 
  FiHeart,
  FiShoppingBag,
  FiTrendingUp,
  FiPackage
} from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">SF</span>
              </div>
              <div>
                <span className="text-2xl font-bold gradient-text block">ShopFusion</span>
                <span className="text-xs text-gray-500">Retail Analytics Platform</span>
              </div>
            </div>
            <p className="text-gray-600 mb-4 max-w-md leading-relaxed">
              AI-powered retail analytics platform helping businesses make data-driven decisions 
              through Market Basket Analysis and intelligent recommendations. Transform your retail 
              strategy with actionable insights.
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <FiShoppingBag className="mr-2 text-primary-600" />
                <span>MBA Analysis</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FiTrendingUp className="mr-2 text-primary-600" />
                <span>Real-time Stats</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FiPackage className="mr-2 text-primary-600" />
                <span>Smart Bundles</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 bg-white rounded-lg flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all duration-200 shadow-sm"
              >
                <FiGithub className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 bg-white rounded-lg flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all duration-200 shadow-sm"
              >
                <FiLinkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@shopfusion.com"
                className="h-10 w-10 bg-white rounded-lg flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all duration-200 shadow-sm"
              >
                <FiMail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/dashboard" 
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200 flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/transactions" 
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200 flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Transactions
                </Link>
              </li>
              <li>
                <Link 
                  to="/recommendations" 
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200 flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Recommendations
                </Link>
              </li>
              <li>
                <Link 
                  to="/products" 
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200 flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/profile" 
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200 flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  My Profile
                </Link>
              </li>
              <li>
                <Link 
                  to="/settings" 
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200 flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Settings
                </Link>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200 flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Documentation
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200 flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Help Center
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-300">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-600 text-sm">
                © {currentYear} ShopFusion. All rights reserved.
              </p>
              <div className="flex space-x-4 text-sm">
                <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Privacy Policy
                </a>
                <span className="text-gray-400">•</span>
                <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
            <p className="text-gray-600 text-sm flex items-center">
              Made with <FiHeart className="text-red-500 mx-1 animate-pulse" /> for BEIT Project
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
