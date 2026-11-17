export type Language = 'ar' | 'en';

export type ServiceId =
  | 'company'
  | 'identity'
  | 'store'
  | 'automation'
  | 'hotel'
  | 'restaurant';

export interface Service {
  id: ServiceId;
  title: string;
  shortTitle: string;
  description: string;
  features: string[];
  cta: string;
  solutionTitle: string;
}

export const services: Record<Language, Service[]> = {
  ar: [
    {
      id: 'company',
      title: 'منظومات الشركات حسب احتياجك',
      shortTitle: 'منظومة لإدارة شركتي.',
      description:
        'نظام واحد لتنظيم العمل اليومي: ينشئ الموظف الطلب، يراجعه المختص، ويعتمده المدير. تبقى الملفات والخطوات مترابطة، وكل موظف يعمل حسب صلاحياته.',
      features: [
        'كل موظف يرى العمل المسموح له وينفّذ مهامه.',
        'المدير يعرف حالة كل طلب ومن نفّذ كل إجراء ومتى.',
        'نخصّصها لشركة أو مركز خدمات أو جهة تدير معاملات.',
      ],
      cta: 'طوّر إدارة شركتك',
      solutionTitle: 'أقسام شركتك على مسار واحد.',
    },
    {
      id: 'identity',
      title: 'المواقع والهوية البصرية والحضور الرقمي',
      shortTitle: 'موقع وهوية لنشاطي.',
      description:
        'نصمّم هوية بصرية متناسقة وموقعًا يعرّف بشركتك وخدماتها، ونجهّز أساس حضورك الرقمي.',
      features: [
        'شعار وألوان وعناصر هوية.',
        'موقع تعريفي متجاوب مع الهاتف.',
        'مظهر متناسق لصفحات النشاط.',
      ],
      cta: 'ابنِ حضورك الرقمي',
      solutionTitle: 'شركة تظهر بصورة متناسقة.',
    },
    {
      id: 'store',
      title: 'المتاجر الإلكترونية',
      shortTitle: 'متجر إلكتروني.',
      description:
        'نعرض منتجاتك في متجر منظّم، مع سلة وطلبات وخيارات شراء وتوصيل تناسب طريقة بيعك.',
      features: [
        'منتجات وتصنيفات واضحة.',
        'سلة ومسار لإتمام الطلب.',
        'إدارة الطلبات والمخزون حسب الحاجة.',
      ],
      cta: 'ابدأ متجرك الإلكتروني',
      solutionTitle: 'منتجاتك، بواجهة تحمل هويتك.',
    },
    {
      id: 'automation',
      title: 'الرد الآلي والأتمتة والذكاء الاصطناعي',
      shortTitle: 'رد آلي لصفحتي.',
      description:
        'مساعد يستقبل العميل، يعرض منتجاتك ويجيب عن السعر والتوفر، ثم يسأله عن اختياراته خطوة بخطوة لتجهيز طلب واضح.',
      features: [
        'منتجات مصوّرة وإجابات مباشرة عن الأسعار والتوفر.',
        'اختيار المنتج والكمية وطريقة الاستلام داخل المحادثة.',
        'ملخّص واضح للمراجعة قبل تأكيد الطلب أو متابعة الفريق.',
      ],
      cta: 'نظّم رسائل صفحتك',
      solutionTitle: 'محادثة تبدأ باحتياج العميل.',
    },
    {
      id: 'hotel',
      title: 'منظومات إدارة الفنادق',
      shortTitle: 'منظومة لإدارة فندقي.',
      description:
        'نطوّر منظومة لتنظيم الحجوزات والغرف ووصول النزلاء ومغادرتهم، مع الفواتير والتقارير بحسب احتياجات فندقك.',
      features: [
        'إدارة الحجوزات وحالة الغرف.',
        'تسجيل الوصول والمغادرة.',
        'فواتير وتقارير حسب الحاجة.',
      ],
      cta: 'طوّر إدارة فندقك',
      solutionTitle: 'حجوزات وغرف في مكان واحد.',
    },
    {
      id: 'restaurant',
      title: 'أنظمة المطاعم والكافيهات',
      shortTitle: 'نظام مطعم أو كافيه.',
      description:
        'نطوّر حلولًا للقوائم والطاولات والطلبات ومتابعة التجهيز والعمليات اليومية، بحسب أسلوب عمل المكان.',
      features: [
        'قوائم وطلبات وطاولات.',
        'متابعة التجهيز وحالة الطلب.',
        'تقارير ومخزون بحسب نطاق العمل.',
      ],
      cta: 'نظّم مطعمك أو كافيهك',
      solutionTitle: 'من الطاولة إلى المطبخ، خطوة واضحة.',
    },
  ],
  en: [
    {
      id: 'company',
      title: 'Business systems built around your needs',
      shortTitle: 'A system to manage my company.',
      description:
        'One system for everyday work: an employee creates a request, a reviewer checks it, and a manager approves it. Files and steps stay connected, and each employee works within their permissions.',
      features: [
        'Employees see permitted work and carry out their tasks.',
        'Managers see each request’s status, who acted, and when.',
        'Tailored to a company, service center, or records-based organization.',
      ],
      cta: 'Improve your business operations',
      solutionTitle: 'Your departments, moving in the same direction.',
    },
    {
      id: 'identity',
      title: 'Websites, visual identity, and digital presence',
      shortTitle: 'A website and identity for my business.',
      description:
        'We design a consistent visual identity and a website that introduces your company and services, laying the foundations for your digital presence.',
      features: [
        'A logo, color palette, and brand elements.',
        'A company website that works on mobile.',
        'A consistent look across your business profiles.',
      ],
      cta: 'Build your digital presence',
      solutionTitle: 'A consistent look for your company.',
    },
    {
      id: 'store',
      title: 'Online stores',
      shortTitle: 'An online store.',
      description:
        'We present your products in an organized store, with a cart, orders, and purchasing and delivery options that suit the way you sell.',
      features: [
        'Clear products and categories.',
        'A shopping cart and checkout flow.',
        'Order and inventory management as needed.',
      ],
      cta: 'Start your online store',
      solutionTitle: 'Your products, in a storefront that reflects your brand.',
    },
    {
      id: 'automation',
      title: 'Automated replies, automation, and AI',
      shortTitle: 'Automated replies for my page.',
      description:
        'An assistant that welcomes customers, presents your products, answers pricing and stock questions, then gathers their choices step by step into a clear order.',
      features: [
        'Product images and direct answers about prices and stock.',
        'Product, quantity, and delivery choices inside the conversation.',
        'A clear summary to review before confirmation or team follow-up.',
      ],
      cta: 'Organize your page’s messages',
      solutionTitle: 'A conversation that starts with your customer’s needs.',
    },
    {
      id: 'hotel',
      title: 'Hotel management systems',
      shortTitle: 'A system to manage my hotel.',
      description:
        'We develop a system to organize bookings, rooms, and guest arrivals and departures, with invoicing and reports tailored to your hotel’s needs.',
      features: [
        'Manage reservations and room status.',
        'Handle check-in and check-out.',
        'Invoices and reports as needed.',
      ],
      cta: 'Improve your hotel operations',
      solutionTitle: 'Bookings and rooms in one place.',
    },
    {
      id: 'restaurant',
      title: 'Restaurant and café systems',
      shortTitle: 'A restaurant or café system.',
      description:
        'We develop solutions for menus, tables, orders, preparation tracking, and daily operations, tailored to the way your venue works.',
      features: [
        'Menus, orders, and tables.',
        'Track preparation and order status.',
        'Reports and inventory within the agreed scope.',
      ],
      cta: 'Organize your restaurant or café',
      solutionTitle: 'From table to kitchen, every step is clear.',
    },
  ],
};

export const workflow: Record<
  Language,
  { title: string; description: string }[]
> = {
  ar: [
    {
      title: 'نفهم احتياجك',
      description: 'نحدّد المشكلة والمستخدمين وما تتوقعه من الحل.',
    },
    {
      title: 'نصمّم الفكرة',
      description: 'نرتّب تجربة الاستخدام وشكل الحل ونطاق العمل.',
    },
    {
      title: 'نطوّر الحل',
      description: 'نحوّل التصور إلى وظائف مترابطة وقابلة للتجربة.',
    },
    {
      title: 'نراجع ونسلّم',
      description: 'نراجع تجربة الاستخدام والتفاصيل قبل التسليم.',
    },
  ],
  en: [
    {
      title: 'Understand your needs',
      description:
        'We identify the problem, the users, and what you expect from the solution.',
    },
    {
      title: 'Design the idea',
      description:
        'We plan the user experience, the solution’s design, and the scope of work.',
    },
    {
      title: 'Develop the solution',
      description:
        'We turn the concept into connected features you can try out.',
    },
    {
      title: 'Review and deliver',
      description:
        'We review the user experience and the details before delivery.',
    },
  ],
};
