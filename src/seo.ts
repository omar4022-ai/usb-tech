import type { Language } from './content';

// Keep the Arabic defaults in index.html aligned with this copy for crawlers
// and link previews that read the initial HTML without running JavaScript.
export const seoCopy = {
  ar: {
    title: 'USB TECH | تصميم المواقع والمتاجر الإلكترونية',
    description: 'USB TECH لتصميم المواقع والمتاجر الإلكترونية وتطوير منظومات الشركات وحلول الأتمتة. استكشف نماذج تفاعلية واختر الحل المناسب لمشروعك.',
    locale: 'ar_LY',
    headingLabel: 'تصميم المواقع والمتاجر الإلكترونية',
  },
  en: {
    title: 'USB TECH | Web Design & Ecommerce Development',
    description: 'USB TECH designs websites and online stores, develops business systems, and builds automation solutions. Explore interactive demos for your project.',
    locale: 'en_US',
    headingLabel: 'Web design & ecommerce',
  },
} satisfies Record<Language, { title: string; description: string; locale: string; headingLabel: string }>;
