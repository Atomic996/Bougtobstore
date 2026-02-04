
import React from 'react';

interface NavbarProps {
  onAddClick: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAddClick, searchTerm, onSearchChange }) => {
  return (
    <nav className="sticky top-0 z-40 bg-[#050810]/95 backdrop-blur-2xl border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-black text-white tracking-tighter">
              Bougtob <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-600 bg-clip-text text-transparent">Store</span>
            </h1>
          </div>
          
          {/* Sell Button */}
          <button
            onClick={onAddClick}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-5 py-2.5 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all active:scale-95 text-sm"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>بيع منتج</span>
          </button>
        </div>

        {/* Search Bar Row */}
        <div className="pb-4 relative group">
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-500 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            placeholder="ابحث عن منتجك المفضل..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#101625] border-2 border-transparent focus:border-emerald-500/30 rounded-2xl py-3.5 pr-11 pl-11 focus:ring-0 text-xs font-bold text-white transition-all text-center placeholder:text-slate-500"
          />
          {searchTerm && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute left-3 top-3.5 h-7 px-3 flex items-center bg-white/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[10px] font-black transition-colors"
            >
              إلغاء
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
