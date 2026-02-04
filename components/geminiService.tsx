const HF_TOKEN = "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";

export const checkProductSafety = async (title: string, description: string, imageBase64: string): Promise<{ isSafe: boolean; reason: string }> => {
  try {
    // المحطة الأولى: فحص محتوى الصورة بصرامة
    const imgResponse = await fetch(
      "https://api-inference.huggingface.co/models/Falconsai/nsfw_image_detection",
      {
        headers: { Authorization: `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ inputs: imageBase64.split(',')[1] }), // إرسال بيانات الصورة فقط
      }
    );

    const imgResult = await imgResponse.json();
    
    // النموذج يعيد قائمة بالنتائج، نبحث عن تصنيف nsfw
    if (Array.isArray(imgResult)) {
      const nsfwData = imgResult.find(item => item.label === 'nsfw');
      // إذا كانت نسبة المحتوى المخل أكثر من 60% يتم الرفض فوراً
      if (nsfwData && nsfwData.score > 0.6) {
        return { isSafe: false, reason: "الصورة المرفقة غير لائقة وتخالف سياسة المتجر." };
      }
    }

    // المحطة الثانية: فحص النص (اختياري لزيادة الأمان)
    const badWords = ['مخدرات', 'سلاح', 'إباحي']; 
    if (badWords.some(word => (title + description).includes(word))) {
      return { isSafe: false, reason: "الوصف يحتوي على كلمات غير مسموح بها." };
    }

    return { isSafe: true, reason: "" };

  } catch (error) {
    console.error("AI Check Error:", error);
    // في حال حدوث خطأ في السيرفر، يفضل السماح بالنشر لكي لا يتوقف الموقع
    return { isSafe: true, reason: "" };
  }
};
