
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const HF_TOKEN = "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";

const resizeImage = (base64Str: string, quality = 0.5): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 512; 
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
  });
};

const checkWithHuggingFace = async (base64Data: string): Promise<{ isSafe: boolean }> => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/Falconsai/nsfw_image_detection",
      {
        headers: { Authorization: `Bearer ${HF_TOKEN}` },
        method: "POST",
        body: JSON.stringify({ inputs: base64Data.split(',')[1] }),
      }
    );
    const result = await response.json();
    if (Array.isArray(result)) {
      const nsfwScore = result.find((item: any) => item.label === 'nsfw')?.score || 0;
      return { isSafe: nsfwScore < 0.6 }; // تشديد الرقابة قليلاً
    }
    return { isSafe: true };
  } catch (e) {
    return { isSafe: true };
  }
};

export const checkProductSafety = async (
  title: string, 
  description: string, 
  imageBase64: string
): Promise<{ isSafe: boolean; reason?: string }> => {
  try {
    const optimizedImage = await resizeImage(imageBase64);
    const imageData = optimizedImage.split(',')[1];

    const hfTask = checkWithHuggingFace(optimizedImage);
    
    const prompt = `أنت مراقب محتوى لمتجر إلكتروني في الجزائر. حلل الإعلان التالي:
    العنوان: ${title}
    الوصف: ${description}
    القواعد:
    1. يمنع بيع الأسلحة، المخدرات، الأدوية، أو السلع غير القانونية.
    2. يمنع الصور الخادشة للحياء أو العنيفة.
    3. يمنع النصب والاحتيال.
    أجب بـ "SAFE" إذا كان المنتج مقبولاً، أو "UNSAFE: [السبب]" إذا كان مرفوضاً.`;

    const geminiTask = ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageData } },
          { text: prompt }
        ]
      }
    });

    const [hfResult, geminiResponse]: [any, any] = await Promise.all([hfTask, geminiTask]);
    
    const resultText = geminiResponse.text || "SAFE";
    
    if (!hfResult.isSafe) {
      return { isSafe: false, reason: "الصورة المرفقة تحتوي على محتوى غير لائق." };
    }

    if (resultText.toUpperCase().includes('UNSAFE')) {
      const reason = resultText.split(':')?.[1] || "محتوى الإعلان مخالف لسياسة المتجر.";
      return { isSafe: false, reason: reason.trim() };
    }

    return { isSafe: true };
  } catch (error) {
    console.error("Safety check failed:", error);
    return { isSafe: true }; // السماح في حالة حدوث خطأ تقني نادر لضمان استمرارية الخدمة
  }
};
