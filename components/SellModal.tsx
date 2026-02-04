
import React, { useState, useRef, useEffect } from 'react';
import { Category, Product } from '../types';
import { checkProductSafety } from 'geminiService';
import { checkLocalProfanity } from '../lib/moderation';
import { supabase, BUCKET_NAME, TABLE_NAME, SUPABASE_CONFIGURED } from '../lib/supabase';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newProduct?: Product) => void;
}

const SellModal: React.FC<SellModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<Category>(Category.OTHERS);
  const [description, setDescription] = useState('');
  const [contactMethod, setContactMethod] = useState<'phone' | 'messenger'>('phone');
  const [contactValue, setContactValue] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setCategory(Category.OTHERS);
    setDescription('');
    setContactMethod('phone');
    setContactValue('');
    setImageFile(null);
    setImagePreview(null);
    setStatusMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !imagePreview || !contactValue) return alert("يرجى إكمال جميع البيانات");

    const titleCheck = checkLocalProfanity(title);
    if (!titleCheck.isClean) return alert(`محتوى غير مسموح: ${titleCheck.forbiddenWord}`);

    setIsSubmitting(true);
    setStatusMessage('فحص الأمان بالذكاء الاصطناعي...');
    
    try {
      const safetyResult = await checkProductSafety(title, description, imagePreview);
      if (!safetyResult.isSafe) {
        setIsSubmitting(false);
        setStatusMessage('');
        return alert(`عذراً، تم رفض المنتج: ${safetyResult.reason}`);
      }

      setStatusMessage('جاري رفع المنتج...');
      
      const sellerId = localStorage.getItem('bougtob_seller_id') || `seller_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('bougtob_seller_id', sellerId);

      let finalImageUrl = imagePreview;

      if (SUPABASE_CONFIGURED && imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, imageFile);
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
          finalImageUrl = publicUrl;
        }
      }

      const contactData = JSON.stringify({ type: contactMethod, value: contactValue.trim() });

      if (SUPABASE_CONFIGURED) {
        await supabase.from(TABLE_NAME).insert([{
          title: title.trim(),
          price: parseFloat(price),
          category,
          description: description.trim(),
          contact_info: contactData,
          image_url: finalImageUrl,
          seller_name: 'بائع جزائري',
          seller_id: sellerId,
          status: 'active'
        }]);
      }

      const mockProduct: Product = {
        id: Math.random().toString(36).substr(2, 9),
        title: title.trim(),
        price: parseFloat(price),
        category,
        description: description.trim(),
        imageUrl: finalImageUrl,
        sellerName: 'أنت',
        sellerId: sellerId,
        contactInfo: contactData,
        status: 'active',
        createdAt: Date.now()
      };

      onSave(mockProduct);
      onClose();
    } catch (error: any) {
      alert("حدث خطأ غير متوقع.");
    } finally {
      setIsSubmitting(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0A0F1A] w-full max-w-2xl rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full duration-500 border border-white/5">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#050810]/50">
          <h2 className="text-2xl font-black text-white">بيع منتج جديد</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-2xl leading-none">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[80vh] overflow-y-auto no-scrollbar">
          <div 
            onClick={() => !isSubmitting && fileInputRef.current?.click()} 
            className="group relative border-2 border-dashed border-white/10 rounded-[2.5rem] h-64 flex flex-col items-center justify-center cursor-pointer bg-[#101625] hover:bg-[#161d30] hover:border-emerald-500/50 transition-all overflow-hidden"
          >
            {imagePreview ? (
              <img src={imagePreview} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <p className="text-xs font-black text-slate-500">اضغط لرفع صورة المنتج</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">اسم المنتج</label>
              <input type="text" required placeholder="مثال: آيفون 13" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-[#101625] border-none font-bold text-white focus:ring-2 focus:ring-emerald-500/50 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">السعر (DA)</label>
              <input type="number" required placeholder="السعر" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-[#101625] border-none font-black text-emerald-400 focus:ring-2 focus:ring-emerald-500/50 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">الفئة</label>
            <select value={category} onChange={e => setCategory(e.target.value as Category)} className="w-full px-6 py-4 rounded-2xl bg-[#101625] border-none font-bold text-white appearance-none focus:ring-2 focus:ring-emerald-500/50 transition-all">
              {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="bg-[#101625] p-6 rounded-[2.5rem] border border-white/5 space-y-6">
             <div className="flex gap-4">
                <button type="button" onClick={() => setContactMethod('phone')} className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all ${contactMethod === 'phone' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-400'}`}>رقم الهاتف</button>
                <button type="button" onClick={() => setContactMethod('messenger')} className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all ${contactMethod === 'messenger' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-slate-400'}`}>رابط مسنجر</button>
             </div>
             <input type="text" required placeholder={contactMethod === 'phone' ? "0XXXXXXX" : "facebook.com/yourprofile"} value={contactValue} onChange={e => setContactValue(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-[#050810] border-none text-sm font-bold text-white focus:ring-2 focus:ring-emerald-500/50 transition-all" />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">الوصف</label>
            <textarea placeholder="اكتب تفاصيل المنتج هنا..." value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full px-6 py-4 rounded-2xl bg-[#101625] border-none text-sm font-medium text-slate-300 focus:ring-2 focus:ring-emerald-500/50 transition-all" />
          </div>

          <button disabled={isSubmitting} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black py-6 rounded-[2rem] active:scale-95 disabled:bg-slate-800 disabled:text-slate-600 transition-all text-xl shadow-2xl">
            {isSubmitting ? statusMessage : "تأكيد ونشر المنتج"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellModal;
