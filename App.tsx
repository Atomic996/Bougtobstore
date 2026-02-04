
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Navbar from './components/Navbar.tsx';
import ProductCard from './components/ProductCard.tsx';
import CategoryFilter from './components/CategoryFilter.tsx';
import SellModal from './components/SellModal.tsx';
import ProductDetailsModal from './components/ProductDetailsModal.tsx';
import { Product, Category } from './types.ts';
import { INITIAL_PRODUCTS } from './constants.tsx';
import { supabase, TABLE_NAME, SUPABASE_CONFIGURED } from './lib/supabase.ts';

const PolicyModal = ({ title, content, isOpen, onClose }: { title: string, content: string, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md" onClick={onClose}>
      <div className="bg-[#0A0F1A] w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-white/5 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-white">{title}</h3>
          <button onClick={onClose} className="text-2xl text-slate-500 hover:text-white">✕</button>
        </div>
        <div className="text-slate-300 font-medium leading-relaxed whitespace-pre-line text-sm max-h-[60vh] overflow-y-auto pr-2">
          {content}
          <div className="mt-8 pt-6 border-t border-white/5">
             <a href="https://x.com/Atomic996" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center bg-white text-black px-5 py-4 rounded-2xl font-black text-sm hover:scale-[1.02] transition-all shadow-xl">
               اتصل بنا على X (تويتر)
             </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [policyModal, setPolicyModal] = useState({ isOpen: false, title: '', content: '' });
  
  const productSectionRef = useRef<HTMLDivElement>(null);

  // دالة جلب البيانات: تجلب كل المنتجات العامة لجميع المستخدمين
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      if (!SUPABASE_CONFIGURED) {
        console.warn("Supabase is not configured, using initial products.");
        setProducts(INITIAL_PRODUCTS);
        return;
      }
      
      // هنا نقوم بجلب كافة السجلات لجميع المستخدمين
      // الفلترة الوحيدة هي استبعاد الحالة 'deleted'
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .neq('status', 'deleted') 
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Supabase error:", error.message);
        throw error;
      }
      
      if (data) {
        const mappedData: Product[] = data.map(item => ({
          id: item.id.toString(),
          title: item.title,
          description: item.description,
          price: item.price,
          category: item.category as Category,
          imageUrl: item.image_url,
          sellerName: item.seller_name,
          sellerId: item.seller_id || '',
          contactInfo: item.contact_info || '',
          status: (item.status as 'active' | 'sold' | 'deleted') || 'active',
          createdAt: item.created_at ? new Date(item.created_at).getTime() : Date.now()
        }));
        setProducts(mappedData);
      }
    } catch (error) { 
      console.error("Failed to fetch products from database:", error);
      // في حالة فشل الاتصال، نظهر البيانات الافتراضية لضمان عدم توقف التطبيق
      if (products.length === 0) setProducts(INITIAL_PRODUCTS); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filteredProducts = useMemo(() => {
    const currentSellerId = localStorage.getItem('bougtob_seller_id');
    return products.filter(p => {
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      // هذه الفلترة اختيارية للمستخدم إذا أراد رؤية بضائعه فقط
      const matchesMine = showOnlyMine ? p.sellerId === currentSellerId : true;
      return matchesCategory && matchesSearch && matchesMine;
    });
  }, [products, selectedCategory, searchTerm, showOnlyMine]);

  const scrollToProducts = () => {
    productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const laws = `قوانين وسياسات بوجطوب ستور:
1. يمنع نشر أي سلع غير قانونية.
2. يجب أن تكون الصور حقيقية للمنتج.
3. الوصف الدقيق إلزامي للمصداقية.
4. يحق للإدارة حجب أي إعلان مخالف فوراً.
5. المتجر وسيط فقط، عاين السلعة قبل الدفع.`;

  return (
    <div className="min-h-screen bg-[#050810] text-right font-['Cairo'] flex flex-col w-full overflow-x-hidden" dir="rtl">
      <Navbar onAddClick={() => setIsSellModalOpen(true)} searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="flex-grow w-full">
        {/* Hero Section */}
        <section className="px-6 py-28 flex flex-col items-center text-center">
           <h2 className="text-6xl sm:text-9xl font-black leading-[0.9] mb-8 tracking-tighter flex flex-col items-center">
             <span className="text-white">بع واشتر</span>
             <span className="bg-gradient-to-r from-emerald-300 via-emerald-500 to-teal-600 bg-clip-text text-transparent">بكل ذكاء وأمان</span>
           </h2>
           <p className="text-slate-400 text-lg sm:text-2xl max-w-2xl mb-16 leading-relaxed font-medium">
             انضم لآلاف الجزائريين في منصتنا الموثوقة. اعرض منتجك للبيع في ثوانٍ أو ابحث عن أفضل الصفقات.
           </p>
           <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xl">
              <button 
                onClick={() => setIsSellModalOpen(true)}
                className="flex-1 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 text-white py-6 rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] active:scale-95 transition-all hover:brightness-110"
              >
                <span>✨ ابدأ البيع الآن</span>
              </button>
              <button 
                onClick={scrollToProducts}
                className="flex-1 bg-[#101625] text-white py-6 rounded-[2.5rem] font-black text-2xl border border-white/5 hover:bg-[#161d30] active:scale-95 transition-all"
              >
                تصفح العروض
              </button>
           </div>
        </section>

        {/* Products Section */}
        <div ref={productSectionRef} className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">أحدث المنتجات</h3>
            <button 
              onClick={() => setShowOnlyMine(!showOnlyMine)} 
              className={`text-[10px] font-black px-6 py-3.5 rounded-2xl transition-all flex items-center gap-2 ${showOnlyMine ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/20' : 'text-slate-400 bg-[#101625] border border-white/5 hover:border-white/10'}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {showOnlyMine ? 'عرض الكل' : 'منتجاتي'}
            </button>
          </div>

          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 mt-12">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-[16/10] bg-[#101625] animate-pulse rounded-[1.5rem]"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 mt-12">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onClick={setSelectedProduct} />
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-24 text-center opacity-50">
                  <p className="text-xl font-bold text-white">لا توجد نتائج مطابقة</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <SellModal isOpen={isSellModalOpen} onClose={() => setIsSellModalOpen(false)} onSave={() => fetchProducts()} />
      <ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onUpdate={() => fetchProducts()} />
      <PolicyModal isOpen={policyModal.isOpen} title={policyModal.title} content={policyModal.content} onClose={() => setPolicyModal(prev => ({ ...prev, isOpen: false }))} />

      <footer className="bg-[#050810] border-t border-white/5 py-20 px-8 mt-20 text-center">
        <h3 className="text-3xl font-black text-white mb-8 tracking-tighter">
          Bougtob <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Store</span>
        </h3>
        <div className="flex justify-center gap-10 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
          <button onClick={() => setPolicyModal({ isOpen: true, title: 'القوانين', content: laws })} className="hover:text-white transition-colors">POLICIES</button>
          <button onClick={() => setPolicyModal({ isOpen: true, title: 'اتصل بنا', content: 'نحن هنا لمساعدتكم، تواصلوا معنا عبر حسابنا الرسمي.' })} className="hover:text-white transition-colors">CONTACT</button>
        </div>
        <p className="mt-12 text-[10px] text-slate-700 font-bold uppercase tracking-widest">Handcrafted by Atomic996 &bull; 2024</p>
      </footer>
    </div>
  );
}
