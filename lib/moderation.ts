
// قائمة تجريبية للكلمات المحظورة (يمكن توسيعها)
const BLACKLIST = [
  'كلمة_بذيئة_1',
  'كلمة_بذيئة_2',
  'مخدرات',
  'سلاح',
  'قمار',
  'اباحي'
];

export const checkLocalProfanity = (text: string): { isClean: boolean; forbiddenWord?: string } => {
  const words = text.toLowerCase().split(/\s+/);
  for (const word of words) {
    if (BLACKLIST.some(b => word.includes(b))) {
      return { isClean: false, forbiddenWord: word };
    }
  }
  return { isClean: true };
};
