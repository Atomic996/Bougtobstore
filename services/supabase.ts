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
    img.onerror = () => resolve(base64Str); // العودة للأصل في حال فشل التصغير
  });
};

const checkImageWithHF = async (base64Data: string): Promise<{ isSafe: boolean }> => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/Falconsai/nsfw_image_detection",
      {
        headers: { Authorization: `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
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
    console.error("HF Image Check Error:", e);
    return { isSafe: true }; 
  }
};

const checkTextWithHF = async (text: string): Promise<{ isSafe: boolean; reason?: string }> => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
      {
        headers: { Authorization: `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          inputs: text,
          parameters: { candidate_labels: ["unauthorized products", "violence", "scam", "safe"] }
        }),
      }
    );
    const result = await response.json();
    
    // تأكد من وجود بيانات قبل القراءة لتجنب undefined
    if (result && result.labels && result.labels.length > 0) {
      const topLabel = result.labels[0];
      const topScore = result.scores[0];

      if (topScore > 0.6 && topLabel !== "safe") {
        return { isSafe: false, reason: "محتوى الإعلان قد يخالف سياسة المتجر" };
      }
    }
    return { isSafe: true };
  } catch (e) {
    console.error("HF Text Check Error:", e);
    return { isSafe: true };
  }
};

export const checkProductSafety = async (
  title: string, 
  description: string, 
  imageBase64: string
): Promise<{ isSafe: boolean; reason?: string }> => {
  try {
    // 1. تصغير الصورة
    const optimizedImage = await resizeImage(imageBase64);

    // 2. الفحص المتوازي
    const [imageResult, textResult] = await Promise.all([
      checkImageWithHF(optimizedImage),
      checkTextWithHF(`${title} ${description}`)
    ]);

    // 3. ترتيب النتائج
    if (!imageResult.isSafe) {
      return { isSafe: false, reason: "الصورة تحتوي على محتوى غير لائق" };
    }

    if (!textResult.isSafe) {
      return { isSafe: false, reason: textResult.reason || "النص يحتوي على كلمات محظورة" };
    }

    return { isSafe: true };

  } catch (error) {
    console.error("Critical Safety Error:", error);
    return { isSafe: true, reason: "" }; 
  }
};
