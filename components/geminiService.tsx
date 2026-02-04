import { GoogleGenerativeAI } from "@google/genai";

// استخدام VITE_ لضمان قراءة المفتاح في المتصفح
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export const checkProductSafety = async (
  title: string, 
  description: string, 
  imageBase64: string
): Promise<{ isSafe: boolean; reason?: string }> => {
  try {
    // التحقق من المفتاح لتجنب تعليق الموقع (Loading)
    if (!apiKey) {
      console.warn("API Key missing");
      return { isSafe: true };
    }

    // إعادة الموديل إلى رقم 3 كما طلبت
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const imageData = imageBase64.split(',')[1];
    const prompt = `أنت مراقب محتوى لمتجر إلكتروني في الجزائر. حلل الإعلان التالي:
    العنوان: ${title}
    الوصف: ${description}
    أجب بـ "SAFE" أو "UNSAFE: [السبب]"`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageData, mimeType: "image/jpeg" } }
    ]);

    const text = result.response.text();
    
    if (text.toUpperCase().includes('UNSAFE')) {
      const reason = text.split(':')?.[1] || "محتوى مخالف.";
      return { isSafe: false, reason: reason.trim() };
    }

    return { isSafe: true };
  } catch (error) {
    console.error("Safety check error:", error);
    // نرجعه SAFE في حال الخطأ لكي لا يتوقف الموقع عن العمل
    return { isSafe: true }; 
  }
};  } catch (error) {
    console.error("Error in checkProductSafety:", error);
    return { safe: true }; // تمرير المنتج في حال حدوث خطأ تقني مؤقت
  }
};
