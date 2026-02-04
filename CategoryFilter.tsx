
import React from 'react';
import { Category } from '../types';
import { CATEGORY_ICONS } from '../constants';

interface CategoryFilterProps {
  selected: Category | null;
  onSelect: (cat: Category | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selected, onSelect }) => {
  const categories = Object.values(Category);

  return (
    <div className="flex w-full gap-2 sm:gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 flex items-center gap-2 rounded-2xl px-6 py-3.5 text-xs sm:text-sm font-black transition-all duration-300 ${
          selected === null 
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-500/20' 
            : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 shadow-sm'
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <span>الكل</span>
      </button>
      
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`flex-shrink-0 flex items-center gap-2.5 rounded-2xl px-6 py-3.5 text-xs sm:text-sm font-black transition-all duration-300 ${
            selected === cat 
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-500/20' 
              : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 border border-slate-100 dark:border-slate-800 shadow-sm'
          }`}
        >
          <span className={`${selected === cat ? 'text-white' : 'text-emerald-500/70 group-hover:text-emerald-500'}`}>
            {CATEGORY_ICONS[cat]}
          </span>
          <span>{cat}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
