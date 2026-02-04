
import React from 'react';
import { Product } from '../types.ts';

interface ProductCardProps {
  product: Product;
  onClick: (p: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const isSold = product.status === 'sold';

  return (
    <div 
      onClick={() => onClick(product)}
      className={`group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-[#101625] border border-white/5 transition-all duration-500 cursor-pointer hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.15)] ${isSold ? 'opacity-75' : ''}`}
    >
      {/* Landscape Image Container (16:10) */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#050810]">
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
          loading="lazy"
        />
        
        {/* Modern Status & Price Badges */}
        <div className="absolute inset-0 p-2.5 flex flex-col justify-between pointer-events-none">
          <div className="flex justify-between items-start">
            <div className={`px-2 py-0.5 rounded-lg backdrop-blur-md border border-white/10 text-[7px] font-black uppercase tracking-wider ${isSold ? 'bg-black/60 text-slate-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {isSold ? 'مباع' : 'نشط'}
            </div>
            
            <div className={`px-2.5 py-1 rounded-xl backdrop-blur-xl border border-white/20 shadow-2xl text-[10px] font-black ${isSold ? 'bg-slate-900/80 text-white' : 'bg-black/80 text-emerald-400'}`}>
              {product.price.toLocaleString()} <span className="text-[7px] opacity-60">DA</span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <span className="px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-[7px] font-bold text-white/40 uppercase tracking-widest">
              {product.category}
            </span>
          </div>
        </div>
      </div>

      {/* Content Area - Tightened spacing */}
      <div className="flex flex-col pt-2.5 px-3 pb-3">
        <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 mb-1.5">
          {product.title}
        </h3>
        
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5">
             <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-emerald-500/10 text-[8px] font-black text-emerald-400 border border-emerald-500/10">
               {product.sellerName.charAt(0)}
             </div>
             <span className="text-[9px] font-bold text-slate-500 truncate max-w-[70px]">{product.sellerName}</span>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <span className="text-[8px] font-black text-emerald-400">تفاصيل</span>
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2 h-2 text-emerald-400"><path d="M19 12H5m14 0-7-7m7 7-7 7"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
