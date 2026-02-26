import React from 'react';

const ExpiringSoonRecommendations = ({ inventoryData = [] }) => {
  
  // Days left calculate karne ka function
  const getDaysLeft = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!inventoryData || inventoryData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 opacity-40">
        <p className="text-xs font-bold tracking-widest uppercase">Safe Zone</p>
        <p className="text-[10px]">No immediate expiries detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {inventoryData.map((product) => {
        const daysLeft = getDaysLeft(product.expiryDate);
        const isUrgent = daysLeft <= 3;

        return (
          <div 
            key={product._id} 
            className="group relative flex items-center justify-between p-4 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all overflow-hidden"
          >
            {/* Background Glow for Urgent Items */}
            {isUrgent && (
              <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none" />
            )}

            <div className="flex items-center gap-4 relative z-10">
              {/* Product Initial Circle */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner ${
                isUrgent ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {product.name?.charAt(0) || 'P'}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white group-hover:text-rose-400 transition-colors">
                    {product.name}
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-white/10 rounded-md text-slate-400 uppercase tracking-tighter">
                    ID: {product._id?.slice(-6) || 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    isUrgent ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {daysLeft <= 0 ? "Expired" : `${daysLeft} Days Left`}
                  </span>
                  <span className="text-white/20">|</span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    Stock: {product.stock || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button className={`relative z-10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-90 ${
              isUrgent 
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20 hover:bg-rose-500' 
              : 'bg-white/10 text-white hover:bg-white/20'
            }`}>
              {isUrgent ? 'Clearance' : 'Manage'}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ExpiringSoonRecommendations;