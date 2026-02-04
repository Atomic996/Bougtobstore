const HF_TOKEN = "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";

export const checkProductSafety = async (title: string, description: string, imageBase64: string): Promise<{ isSafe: boolean; reason?: string }> => {
  try {
    // 1. فحص الصورة (NSFW Detection)
    const imgRes = await fetch("https://api-inference.huggingface.co/models/Falconsai/nsfw_image_detection", {
      headers: { Authorization: `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ inputs: imageBase64.split(',')[1] }),
    });
    const imgData = await imgRes.json();
    const nsfwScore = Array.isArray(imgData) ? (imgData.find(i => i.label === 'nsfw')?.score || 0) : 0;

    if (nsfwScore > 0.5) return { isSafe: false, reason: "الصورة تحتوي على محتوى غير لائق." };

    // 2. فحص النص (Content Classification)
    const txtRes = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-mnli", {
      headers: { Authorization: `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        inputs: `${title} ${description}`,
        parameters: { candidate_labels: ["unauthorized", "drugs", "violence", "safe"] }
      }),
    });
    const txtData = await txtRes.json();
    if (txtData?.labels && txtData.labels[0] !== "safe" && txtData.scores[0] > 0.6) {
      return { isSafe: false, reason: "النص يحتوي على كلمات أو عروض غير مسموح بها." };
    }

    return { isSafe: true };
  } catch (error) {
    console.error("AI Check Error:", error);
    return { isSafe: true }; // السماح بالنشر في حال تعطل الـ API لضمان استمرارية الخدمة
  }
};
