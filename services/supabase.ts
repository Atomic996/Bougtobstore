const HF_TOKEN = "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";

// دالة تصغير الصورة للحفاظ على سرعة الاستجابة وتجنب أخطاء حجم البيانات
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
        if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
      } else {
        if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
  });
};

// 1. فحص الصورة باستخدام نموذج كشف المحتوى غير اللائق
const checkImageWithHF = async (base64Data: string): Promise<{ isSafe: boolean }> => {
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
      return { isSafe: nsfwScore < 0.6 }; 
    }
    return { isSafe: true };
  } catch (e) {
    return { isSafe: true };
  }
};

// 2. فحص النص (العنوان والوصف) باستخدام نموذج تصنيف محتوى محظور
const checkTextWithHF = async (text: string): Promise<{ isSafe: boolean; reason?: string }> => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
      {
        headers: { Authorization: `Bearer ${HF_TOKEN}` },
        method: "POST",
        body: JSON.stringify({
          inputs: text,
          parameters: { 
            candidate_labels: ["weapon", "drugs", "violence", "scam", "safe"] 
          }
        }),
      }
    );
    const result = await response.json();
    
    // إذا كان الاحتمال الأكبر هو محتوى محظور وبنسبة ثقة عالية
    const topLabel = result.labels[0];
    const topScore = result.scores[0];

    if (topScore > 0.5 && topLabel !== "safe") {
      const labelsMap: any = {
        "weapon": "أسلحة أو أدوات حادة",
        "drugs": "مواد ممنوعة أو أدوية",
        "violence": "محتوى عنيف",
        "scam": "شبهة احتيال أو تضليل"
      };
      return { isSafe: false, reason: labelsMap[topLabel] || "محتوى مخالف لسياسة المتجر." };
    }
    return { isSafe: true };
  } catch (e) {
    return { isSafe: true };
  }
};

// الدالة الرئيسية المعدلة بالكامل
export const checkProductSafety = async (
  title: string, 
  description: string, 
  imageBase64: string
): Promise<{ isSafe: boolean; reason?: string }> => {
  try {
    // تصغير الصورة قبل البدء
    const optimizedImage = await resizeImage(imageBase64);

    // تنفيذ فحص الصورة وفحص النص في نفس الوقت (Parallel) لتسريع العملية
    const [imageResult, textResult] = await Promise.all([
      checkImageWithHF(optimizedImage),
      checkTextWithHF(`${title}. ${description}`)
    ]);

    // التحقق من نتائج فحص الصورة
    if (!imageResult.isSafe) {
      return { isSafe: false, reason: "الصورة المرفقة تحتوي على محتوى غير لائق." };
    }

    // التحقق من نتائج فحص النص
    if (!textResult.isSafe) {
      return { isSafe: false, reason: textResult.reason };
    }

    // إذا مر كل شيء بسلام
    return { isSafe: true };

  } catch (error) {
    console.error("Safety check failed:", error);
    // في حالة وجود خطأ في الـ API نفسه، نمرر المنتج لضمان عدم تعطل تجربة المستخدم
    return { isSafe: true };
  }
};
