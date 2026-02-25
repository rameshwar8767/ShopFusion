import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiGithub, 
  FiLinkedin, 
  FiMail, 
  FiHeart,
  FiShoppingBag,
  FiTrendingUp,
  FiPackage,
  FiSend,
  FiGlobe
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      {/* Top Decoration Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-12">
          
          {/* Brand & Mission - Takes up 5 columns */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <span className="text-white font-black text-lg">SF</span>
              </div>
              <div className="ml-3">
                <span className="text-xl font-black text-gray-900 block tracking-tight">ShopFusion</span>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">Intelligence Layer</span>
              </div>
            </div>
            
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Empowering retailers with the same ML capabilities used by giants. 
              Our platform processes transaction patterns into growth strategies 
              using advanced Market Basket Analysis.
            </p>

            {/* Social Icons with Tooltips Style */}
            <div className="flex space-x-3">
              {[
                { icon: FiGithub, link: "#", color: "hover:bg-gray-900" },
                { icon: FiLinkedin, link: "#", color: "hover:bg-blue-700" },
                { icon: FiMail, link: "#", color: "hover:bg-indigo-600" },
                { icon: FiGlobe, link: "#", color: "hover:bg-emerald-600" }
              ].map((social, i) => (
                <motion.a
                  key={i}
                  whileHover={{ y: -3 }}
                  href={social.link}
                  className={`h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 transition-all duration-300 shadow-sm ${social.color} hover:text-white`}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation - 2 columns */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Engine</h3>
            <ul className="space-y-4">
              {[
                { name: "Dashboard", path: "/dashboard" },
                { name: "Transactions", path: "/transactions" },
                { name: "Smart Links", path: "/recommendations" },
                { name: "Inventory", path: "/products" }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors flex items-center group"
                  >
                    <span className="h-1 w-0 group-hover:w-2 bg-indigo-600 mr-0 group-hover:mr-2 transition-all rounded-full" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources - 2 columns */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Support</h3>
            <ul className="space-y-4">
              {["API Docs", "Help Center", "Status", "Privacy"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter - 3 columns */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Stay Updated</h3>
            <p className="text-xs text-gray-500 mb-4 font-medium">Get the latest AI insight reports.</p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 pr-12 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all group-hover:border-indigo-200"
              />
              <button className="absolute right-2 top-2 h-8 w-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors">
                <FiSend size={14} />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Engine Status: Online</span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="order-2 md:order-1 text-center md:text-left">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">
                © {currentYear} ShopFusion Analytics • Built for BEIT Project
              </p>
            </div>
            
            <div className="order-1 md:order-2 flex items-center gap-1 bg-indigo-50/50 px-4 py-2 rounded-full border border-indigo-100/50">
              <span className="text-xs font-bold text-indigo-700">Made with</span>
              <FiHeart className="text-red-500 fill-red-500 animate-bounce mx-1" size={12} />
              <span className="text-xs font-bold text-indigo-700">for better retail</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;