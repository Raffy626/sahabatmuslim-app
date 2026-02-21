export function sanitizeArabic(text: string): string {
  if (!text) return text;

  return text
    .replace(/\u064e\u0670/g, '\u0670')
    .replace(/\u0652\u0652+/g, '\u0652')
    .replace(/([\u064e\u064f\u0650])\u0651/g, '\u0651$1');
}
