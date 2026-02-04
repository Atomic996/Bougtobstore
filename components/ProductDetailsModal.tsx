
import React, { useState } from 'react';
import { Product } from '../types.ts';
import { supabase, TABLE_NAME } from '../lib/supabase.ts';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onUpdate?: () => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, onClose, onUpdate }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  if (!product) return null;

  const currentSellerId = localStorage.getItem('bougtob_seller_id');
  const isOwner = currentSellerId === product.sellerId;
  const isSold = product.status === 'sold';

  let contact = { type: 'phone', value: '' };
  try {
    contact = product.contactInfo.startsWith('{') ? JSON.parse(product.contactInfo) : { type: 'phone', value: product.contactInfo };
  } catch (e) { contact = { type: 'phone', value: product.contactInfo }; }

  const handleContact = () => {
    if (contact.type === 'phone') window.location.href = `tel:${contact.value.replace(/\s/g, '')}`;
    else {
      const url = contact.value.startsWith('http') ? contact.value : `https://${contact.value}`;
      window.open(url, '_blank');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("هل أنت متأكد من سحب هذا المنتج من العرض؟ سيختفي من أمام المشترين وسيظل محفوظاً في سجلاتنا للأرشفة.")) return;
    setIsDeleting(true);
    try {
      // تنفيذ الحذف المنطقي (Soft Delete)
      const { error } = await supabase
        .from(TABLE_NAME)
        .update({ status: 'deleted' }) // تغيير الحالة بدلاً من حذف السجل
        .eq('id', product.id);
      
      if (error) throw error;
      
      onUpdate?.(); // تحديث القائمة الرئيسية لتختفي السلعة فوراً
      onClose();
    } catch (err) {
      console.error("Soft delete error:", err);
      alert("حدث خطأ أثناء محاولة إخفاء المنتج");
    } finally { setIsDeleting(false); }
  };

  const toggleStatus = async () => {
    const newStatus = product.status === 'active' ? 'sold' : 'active';
    try {
      const { error } = await supabase.from(TABLE_NAME).update({ status: newStatus }).eq('id', product.id);
      if (error) throw error;
      onUpdate?.();
      onClose();
    } catch (err) { alert("فشل تحديث الحالة"); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/95 p-0 sm:p-4 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-t-[2.5rem] sm:rounded-[3rem] bg-[#050810] border border-white/5 shadow-2xl animate-in slide-in-from-bottom-full duration-500 flex flex-col overflow-hidden max-h-[95vh]">
        
        <button 
          onClick={onClose} 
          className="absolute left-6 top-6 z-30 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/40 text-white backdrop-blur-lg hover:bg-red-500/20 transition-all text-2xl font-light"
        >
          ✕
        </button>
        
        <div className="flex flex-col md:flex-row overflow-y-auto no-scrollbar">
          <div className="w-full md:w-1/2 aspect-square md:aspect-auto md:h-[600px] relative shrink-0">
            <img src={product.imageUrl} className="h-full w-full object-cover" alt={product.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-transparent to-transparent md:hidden" />
          </div>
          
          <div className="p-8 md:p-12 flex flex-col md:w-1/2 justify-center">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${!isSold ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  {isSold ? 'تم البيع' : 'متوفر الآن'}
                </span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{product.category}</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 tracking-tighter">{product.title}</h2>
              <div className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent flex items-baseline gap-2">
                {product.price.toLocaleString()}
                <span className="text-sm font-bold opacity-60">DA</span>
              </div>
            </div>

            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 mb-10">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">تفاصيل المنتج</h4>
              <p className="text-sm font-medium leading-relaxed text-slate-300 whitespace-pre-line">{product.description}</p>
            </div>

            <div className="mt-auto">
              {isOwner ? (
                <div className="grid grid-cols-1 gap-4">
                  <button onClick={toggleStatus} className="w-full bg-white text-black py-5 rounded-2xl font-black text-sm hover:scale-[1.01] transition-all">
                    {isSold ? 'إعادة العرض للبيع' : 'تحديد كـ "تم البيع"'}
                  </button>
                  <button onClick={handleDelete} disabled={isDeleting} className="w-full bg-red-500/10 text-red-500 py-5 rounded-2xl font-black text-sm hover:bg-red-500/20 transition-all">
                    {isDeleting ? "جاري الإخفاء..." : "حذف الإعلان من السوق"}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleContact} 
                  className={`w-full py-6 rounded-[2rem] text-white font-black text-2xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${contact.type === 'phone' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30' : 'bg-blue-600 shadow-blue-500/30'}`}
                >
                  {contact.type === 'phone' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-7 h-7"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.913 1.45 5.513 3.73 7.218V22l3.352-1.843c.895.248 1.845.385 2.828.385 5.523 0 10-4.145 10-9.258S17.523 2 12 2z"/></svg>
                  )}
                  <span>تواصل مع البائع</span>
                </button>
              )}
            </div>
            
            <div className="mt-8 flex items-center justify-between text-[11px] font-bold text-slate-500 border-t border-white/5 pt-6">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black border border-emerald-500/20">
                   {product.sellerName.charAt(0)}
                 </div>
                 <div className="flex flex-col">
                   <span className="text-white">بواسطة: {product.sellerName}</span>
                   <span className="text-emerald-500/70">بائع موثوق</span>
                 </div>
               </div>
               <span>{new Date(product.createdAt).toLocaleDateString('ar-DZ')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
