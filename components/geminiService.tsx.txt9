const HF_TOKEN = "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";

export const checkProductSafety = async (title: string, description: string, imageBase64: string) => {
  try {
    // فحص الصورة ضد المحتوى الإباحي والمخل (NSFW)
    const res = await fetch("https://api-inference.huggingface.co/models/Falconsai/nsfw_image_detection", {
      headers: { Authorization: `Bearer ${HF_TOKEN}` },
      method: "POST",
      body: JSON.stringify({ inputs: imageBase64.split(',')[1] }),
    });
    
    const results = await res.json();
    
    // إذا اكتشف النموذج محتوى مخل (nsfw) بنسبة عالية
    const nsfw = results.find((r: any) => r.label === 'nsfw');
    if (nsfw && nsfw.score > 0.6) {
      return { isSafe: false, reason: "الصورة تحتوي على محتوى غير لائق" };
    }

    return { isSafe: true, reason: "" };
  } catch (e) {
    // في حالة الخطأ، نرفض النشر كإجراء احترازي بدلاً من السماح به
    return { isSafe: false, reason: "فشل فحص الأمان، حاول ثانية" };
  }
};
    return { isSafe: true, reason: "" };
  }
};
