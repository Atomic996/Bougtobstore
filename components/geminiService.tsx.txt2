const HF_TOKEN = "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";

const resizeImage = (base64Str: string, quality = 0.5): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 512;
      let width = img.width, height = img.height;
      if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } }
      else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(base64Str);
  });
};

export const checkProductSafety = async (title: string, description: string, imageBase64: string): Promise<{ isSafe: boolean; reason?: string }> => {
  try {
    const optimizedImage = await resizeImage(imageBase64);
    
    // 1. فحص الصورة
    const imgRes = await fetch("https://api-inference.huggingface.co/models/Falconsai/nsfw_image_detection", {
      headers: { Authorization: `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ inputs: optimizedImage.split(',')[1] }),
    });
    const imgData = await imgRes.json();
    const nsfwScore = Array.isArray(imgData) ? (imgData.find(i => i.label === 'nsfw')?.score || 0) : 0;

    if (nsfwScore > 0.6) return { isSafe: false, reason: "الصورة تحتوي على محتوى غير لائق." };

    // 2. فحص النص
    const txtRes = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-mnli", {
      headers: { Authorization: `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        inputs: `${title} ${description}`,
        parameters: { candidate_labels: ["unauthorized", "violence", "drugs", "safe"] }
      }),
    });
    const txtData = await txtRes.json();
    if (txtData?.labels && txtData.labels[0] !== "safe" && txtData.scores[0] > 0.6) {
      return { isSafe: false, reason: "المحتوى النصي يخالف سياسة المتجر." };
    }

    return { isSafe: true };
  } catch (error) {
    console.error("Safety check error:", error);
    return { isSafe: true }; // تمرير المنتج في حال تعطل الـ API
  }
};
