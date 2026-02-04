import React, { useState, useRef } from 'react';
import { Category, Product } from '../types';
import { checkProductSafety } from './geminiService'; // تأكد أن هذا الملف يحتوي على كود Hugging Face الجديد
import { supabase, TABLE_NAME } from '../lib/supabase';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const SellModal: React.FC<SellModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<Category>(Category.OTHERS);
  const [description, setDescription] = useState('');
  const [contactMethod, setContactMethod] = useState<'phone' | 'messenger'>('phone');
  const [contactValue, setContactValue] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setCategory(Category.OTHERS);
    setDescription('');
    setContactMethod('phone');
    setContactValue('');
    setImagePreview(null);
    setStatusMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      alert('الرجاء اختيار صورة للمنتج');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('جاري فحص المنتج بالذكاء الاصطناعي...');

    try {
      // 1. الفحص الأمني (Hugging Face)
      const safety = await checkProductSafety(title, description, imagePreview);

      if (!safety.isSafe) {
        alert(`عذراً، تم رفض المنتج: ${safety.reason || "محتوى غير مسموح به"}`);
        setIsSubmitting(false);
        setStatusMessage('');
        return;
      }

      setStatusMessage('جاري النشر في السوق...');

      // 2. تجهيز بيانات المنتج للـ Supabase
      const newProduct = {
        title,
        description,
        price: Number(price),
        category,
        image_url: imagePreview,
        sellerName: localStorage.getItem('bougtob_seller_name') || 'بائع بوجطوب',
        sellerId: localStorage.getItem('bougtob_seller_id') || `user_${Math.random().toString(36).substr(2, 9)}`,
        contactInfo: JSON.stringify({ type: contactMethod, value: contactValue }),
        status: 'active',
        createdAt: Date.now()
      };

      // 3. الإدراج في قاعدة البيانات
      const { error } = await supabase.from(TABLE_NAME).insert([newProduct]);

      if (error) throw error;

      alert('✅ تم نشر منتجك بنجاح!');
      resetForm();
      onSave();
      onClose();
    } catch (err: any) {
      console.error('Error saving product:', err);
      alert('حدث خطأ أثناء الحفظ: ' + (err.message || 'تأكد من إعدادات قاعدة البيانات'));
    } finally {
      setIsSubmitting(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0A0F1A] w-full max-w-2xl rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border border-white/5 my-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-white tracking-tighter">إضافة منتج جديد</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative aspect-video rounded-[2rem] bg-[#101625] border-2 border-dashed border-white/10 hover:border-emerald-500/50 transition-all cursor-pointer overflow-hidden flex items-center justify-center"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <span className="text-4xl mb-2 block">📸</span>
                <p className="text-xs font-bold text-slate-500">اضغط لرفع صورة المنتج</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input 
              type="text" required placeholder="عنوان المنتج" 
              value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-[#101625] text-white border-none focus:ring-2 focus:ring-emerald-500/50" 
            />
            <input 
              type="number" required placeholder="السعر (دج)" 
              value={price} onChange={e => setPrice(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-[#101625] text-white border-none focus:ring-2 focus:ring-emerald-500/50" 
            />
          </div>

          <select 
            value={category} onChange={e => setCategory(e.target.value as Category)}
            className="w-full px-6 py-4 rounded-2xl bg-[#101625] text-white border-none focus:ring-2 focus:ring-emerald-500/50"
          >
            {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <div className="space-y-3">
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setContactMethod('phone')}
                className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${contactMethod === 'phone' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-400'}`}
              >رقم الهاتف</button>
              <button 
                type="button"
                onClick={() => setContactMethod('messenger')}
                className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${contactMethod === 'messenger' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'}`}
              >مسنجر</button>
            </div>
            <input 
              type="text" required 
              placeholder={contactMethod === 'phone' ? "0XXXXXXX" : "رابط الحساب"} 
              value={contactValue} onChange={e => setContactValue(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-[#050810] text-white border-none" 
            />
          </div>

          <textarea 
            placeholder="وصف المنتج..." rows={3}
            value={description} onChange={e => setDescription(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-[#101625] text-white border-none"
          ></textarea>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 py-5 rounded-[1.5rem] font-black text-white shadow-xl shadow-emerald-500/20 disabled:opacity-50"
          >
            {isSubmitting ? statusMessage : 'نشر المنتج الآن'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellModal;
