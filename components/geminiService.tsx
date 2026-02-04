// components/geminiService.tsx

/**
 * دالة فحص محتوى المنتج باستخدام معايير بسيطة أو الربط مع الذكاء الاصطناعي
 * ملاحظة: يجب أن تكون الدالة مصدّرة (export) لكي يراها ملف SellModal
 */
export const checkProductSafety = async (title: string, description: string): Promise<{ safe: boolean; reason?: string }> => {
  try {
    // يمكنك هنا إضافة الكود الخاص بالاتصال بـ Google Gemini API لاحقاً
    // حالياً سنضع فحصاً بسيطاً لضمان عمل الموقع
    const forbiddenWords = ['مخدرات', 'سلاح', 'شتيمة']; 
    const content = (title + ' ' + description).toLowerCase();
    
    const isUnsafe = forbiddenWords.some(word => content.includes(word));

    if (isUnsafe) {
      return { safe: false, reason: "المحتوى يحتوي على كلمات غير مسموح بها" };
    }

    return { safe: true };
  } catch (error) {
    console.error("Error in checkProductSafety:", error);
    return { safe: true }; // تمرير المنتج في حال حدوث خطأ تقني مؤقت
  }
};
