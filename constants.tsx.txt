
import React from 'react';
import { Product, Category } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'sample-1',
    title: 'هاتف آيفون 15 برو ماكس',
    description: 'حالة ممتازة، سعة 256 جيجا، لون تيتانيوم طبيعي. مستعمل لمدة شهرين فقط.',
    price: 215000,
    category: Category.ELECTRONICS,
    imageUrl: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=500&auto=format&fit=crop',
    sellerName: 'أمين للهواتف',
    sellerId: 'system-sample-1',
    status: 'active',
    contactInfo: JSON.stringify({ type: 'phone', value: '0555123456' }),
    createdAt: Date.now() - 3600000
  },
  {
    id: 'sample-2',
    title: 'طاولة خشبية عصرية',
    description: 'طاولة صالون من الخشب الرفيع، تصميم عصري يناسب المنازل الحديثة.',
    price: 18000,
    category: Category.FURNITURE,
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=500&auto=format&fit=crop',
    sellerName: 'مفروشات الجزائر',
    sellerId: 'system-sample-2',
    status: 'active',
    contactInfo: JSON.stringify({ type: 'phone', value: '0666987654' }),
    createdAt: Date.now() - 86400000
  }
];

export const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  [Category.ELECTRONICS]: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  ),
  [Category.FURNITURE]: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M18 20V10"></path>
      <path d="M12 20V4"></path>
      <path d="M6 20v-6"></path>
      <path d="M12 4h6a2 2 0 0 1 2 2v4"></path>
      <path d="M12 14H6a2 2 0 0 0-2 2v4"></path>
    </svg>
  ),
  [Category.CARS]: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
      <circle cx="7" cy="17" r="2"></circle>
      <path d="M9 17h6"></path>
      <circle cx="17" cy="17" r="2"></circle>
    </svg>
  ),
  [Category.FASHION]: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>
    </svg>
  ),
  [Category.BOOKS]: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
  ),
  [Category.OTHERS]: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
      <path d="m3.3 7 8.7 5 8.7-5"></path>
      <path d="M12 22V12"></path>
    </svg>
  )
};
