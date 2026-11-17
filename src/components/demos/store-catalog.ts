import type { Language } from '../../content';

export type LocalizedText = { ar: string; en: string };
export type StoreCategory = 'phones' | 'audio' | 'accessories';
export interface StoreProduct {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  image: string;
  price: number;
  category: StoreCategory;
  categoryName: LocalizedText;
  stock: number;
  variants?: {
    storage?: { value: string; label: string; priceDelta: number }[];
    colors?: { value: string; label: LocalizedText; swatch: string; image?: string }[];
  };
  specs?: LocalizedText[];
  sourceUrl?: string;
}

/** Shared illustrative prices and inventory for the store and retail assistant. */
export const storeProducts: StoreProduct[] = [
  {
    id: 'iphone-18-pro-max',
    name: { ar: 'iPhone 18 Pro Max', en: 'iPhone 18 Pro Max' },
    description: {
      ar: 'شاشة Super Retina XDR قياس 6.9 بوصة، شريحة A20 Pro، ونظام تصوير Pro Fusion بدقة 48MP. اختر السعة واللون المناسبين لك.',
      en: 'A 6.9-inch Super Retina XDR display, A20 Pro chip, and a 48MP Pro Fusion camera system. Choose your storage and finish.',
    },
    image: './demo-store/iphone-18-pro-max-black.jpg',
    price: 7990,
    category: 'phones', categoryName: { ar: 'هواتف', en: 'Phones' }, stock: 12,
    variants: {
      storage: [
        { value: '256gb', label: '256 GB', priceDelta: 0 },
        { value: '512gb', label: '512 GB', priceDelta: 1000 },
        { value: '1tb', label: '1 TB', priceDelta: 2500 },
        { value: '2tb', label: '2 TB', priceDelta: 5000 },
      ],
      colors: [
        { value: 'black', label: { ar: 'أسود', en: 'Black' }, swatch: '#343438', image: './demo-store/iphone-18-pro-max-black.jpg' },
        { value: 'silver', label: { ar: 'فضي', en: 'Silver' }, swatch: '#d6d6d1', image: './demo-store/iphone-18-pro-max-silver.jpg' },
        { value: 'glacier', label: { ar: 'جليدي', en: 'Glacier' }, swatch: '#b9d4dc', image: './demo-store/iphone-18-pro-max-glacier.jpg' },
        { value: 'burgundy', label: { ar: 'عنابي', en: 'Burgundy' }, swatch: '#6c3442', image: './demo-store/iphone-18-pro-max-burgundy.jpg' },
      ],
    },
    specs: [
      { ar: 'شاشة OLED قياس 6.9 بوصة', en: '6.9-inch OLED display' },
      { ar: 'شريحة A20 Pro', en: 'A20 Pro chip' },
      { ar: 'نظام تصوير Pro Fusion بدقة 48MP', en: '48MP Pro Fusion camera system' },
      { ar: 'سعات من 256GB إلى 2TB', en: 'Storage from 256GB to 2TB' },
    ],
    sourceUrl: 'https://www.apple.com/iphone-18-pro/specs/',
  },
  {
    id: 'headphones', name: { ar: 'سماعات Studio', en: 'Studio headphones' },
    description: { ar: 'تصميم أسود مع وسادات مبطنة للاستماع، ضمن مجموعة الصوتيات اليومية.', en: 'A black design with cushioned ear pads, part of our everyday audio collection.' },
    image: './demo-store/headphones.jpg', price: 249, category: 'audio', categoryName: { ar: 'صوتيات', en: 'Audio' }, stock: 24,
  },
  {
    id: 'speaker', name: { ar: 'مكبر صوت Pocket', en: 'Pocket speaker' },
    description: { ar: 'مكبر صوت أسود بتصميم أسطواني وواجهة نسيجية للمكتب أو الرف.', en: 'A black cylindrical speaker with a textured exterior for your desk or shelf.' },
    image: './demo-store/speaker.jpg', price: 169, category: 'audio', categoryName: { ar: 'صوتيات', en: 'Audio' }, stock: 16,
  },
  {
    id: 'watch', name: { ar: 'ساعة Everyday', en: 'Everyday watch' },
    description: { ar: 'سوار أبيض وإطار فضي حول شاشة دائرية، بتصميم بسيط يناسب تفاصيل يومك.', en: 'A white strap and silver frame around a round display, with a simple everyday design.' },
    image: './demo-store/watch.jpg', price: 279, category: 'accessories', categoryName: { ar: 'إكسسوارات', en: 'Accessories' }, stock: 9,
  },
  {
    id: 'keyboard', name: { ar: 'لوحة مفاتيح Form', en: 'Form keyboard' },
    description: { ar: 'مفاتيح بيضاء وهيكل فضي بتخطيط مدمج لمساحة عمل مرتبة.', en: 'White keys and a silver frame in a compact layout for a tidy workspace.' },
    image: './demo-store/keyboard.jpg', price: 219, category: 'accessories', categoryName: { ar: 'إكسسوارات', en: 'Accessories' }, stock: 18,
  },
  {
    id: 'mouse', name: { ar: 'فأرة العمل Arc', en: 'Arc desk mouse' },
    description: { ar: 'تدرجات رمادية وخطوط منحنية مع عجلة تمرير وسطية لمساحة العمل.', en: 'Charcoal tones, curved edges, and a central scroll wheel for your workspace.' },
    image: './demo-store/mouse.jpg', price: 89, category: 'accessories', categoryName: { ar: 'إكسسوارات', en: 'Accessories' }, stock: 0,
  },
];

export function getStoreUnitPrice(product: StoreProduct, storage?: string): number {
  return product.price + (product.variants?.storage?.find(option => option.value === storage)?.priceDelta || 0);
}

export function formatStoreMoney(value: number, lang: Language): string {
  return `${new Intl.NumberFormat(lang === 'ar' ? 'ar-LY' : 'en-GB', { maximumFractionDigits: 0 }).format(value)} ${lang === 'ar' ? 'د.ل.' : 'LYD'}`;
}
