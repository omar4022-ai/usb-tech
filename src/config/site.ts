/**
 * إعدادات USB TECH المركزية — أضف البيانات الفعلية هنا ثم أعد البناء والنشر.
 * اترك أي قيمة فارغة لإخفائها. لا تضع مفاتيح أو أسرارًا في هذا الملف العام.
 */
export const siteConfig = {
  // رابط صفحة الشركة الكامل على Facebook. يُستخدم للزر وأيقونة التذييل معًا.
  facebookUrl: 'https://www.facebook.com/share/19WYVnYTSM/?mibextid=wwXIfr',
  contactEmail: '',
  phone: '+218922221113',
  // رقم دولي، بأرقام فقط ومن دون + أو مسافات.
  whatsappNumber: '218922221113',
  // مسار الشعار الأصلي الشفاف داخل public، مثل ./usb-tech-logo.png.
  // عند عدم توفره، يظهر اسم الشركة بنص مؤقت، وليس شعارًا أصليًا مُعاد إنشاؤه.
  logoUrl: './usb-tech-logo.png',
  // HTTPS endpoint يقبل POST JSON ويعيد { success: true } عند الاستلام الحقيقي.
  // قيمة فارغة = تجهيز رسالة واتساب عند ضبط رقمه، أو معاينة محلية إن لم يُضبط.
  // يتطلب إرسال رسالة واتساب تأكيد الزائر داخل واتساب؛ الموقع لا يؤكد استلامها.
  formEndpoint: '',
};

/** Both Facebook locations share this validation and setting. */
export function getFacebookUrl(value: string): string | null {
  const candidate = value.trim();
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    if (url.hostname !== 'facebook.com' && !url.hostname.endsWith('.facebook.com') && url.hostname !== 'fb.com' && url.hostname !== 'fb.me') return null;
    if (url.pathname === '/' && !url.search) return null;
    return url.href;
  } catch { return null; }
}

/** A single validated destination for the contact links and request handoff. */
export function getWhatsAppUrl(value: string): string | null {
  const number = value.trim();
  return /^[1-9]\d{6,14}$/.test(number) ? `https://wa.me/${number}` : null;
}
