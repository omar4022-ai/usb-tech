import { Component, Suspense, lazy, useEffect, useRef, useState, type ReactNode } from 'react';
import { services, type Language, type ServiceId } from '../content';
import Icon from './Icon';
import { storeProducts, formatStoreMoney } from './demos/store-catalog';
import { restaurantMenu, restaurantMoney } from './demos/restaurant-model';
import './solutions.css';
import './demos/demo-shell.css';

const CompanyDemo = lazy(() => import('./demos/CompanyDemo'));
const IdentityDemo = lazy(() => import('./demos/IdentityDemo'));
const StoreDemo = lazy(() => import('./demos/StoreDemo'));
const AutomationDemo = lazy(() => import('./demos/AutomationDemo'));
const HotelDemo = lazy(() => import('./demos/HotelDemo'));
const RestaurantDemo = lazy(() => import('./demos/RestaurantDemo'));

class DemoBoundary extends Component<{ children: ReactNode; lang: Language }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div className="demo-load-state" role="alert"><h3>{this.props.lang === 'ar' ? 'تعذّر فتح النموذج.' : 'The demo could not be opened.'}</h3><p>{this.props.lang === 'ar' ? 'حدّث الصفحة لتحميل النسخة الجديدة، ثم افتح النموذج مجددًا.' : 'Refresh the page to load the latest version, then open the demo again.'}</p><button className="button button-primary" type="button" onClick={() => window.location.reload()}>{this.props.lang === 'ar' ? 'تحديث الصفحة' : 'Refresh page'}</button></div>;
    return this.props.children;
  }
}

interface SolutionsProps {
  lang: Language;
  onSelectService: (id: ServiceId) => void;
}

const labels = {
  ar: {
    eyebrow: 'خدماتنا ونماذجها',
    title: 'اختر خدمتك وجرّبها بنفسك.',
    description: 'اضغط «افتح النموذج» لتجربة الخدمة مباشرة. لا تسجيل مطلوب.',
    sampleNote: 'جميع النماذج تستخدم بيانات تجريبية.',
    quickLinks: 'انتقل إلى الخدمة التي تهمّك',
    explore: 'افتح النموذج',
    request: 'اطلب حلًا مشابهًا',
    close: 'إغلاق النموذج',
    interactive: 'تجربة تفاعلية',
    systemDemo: 'تجربة نظام متكامل',
    demoData: 'بيانات توضيحية',
    expand: 'عرض بملء الشاشة',
    restore: 'استعادة حجم النافذة',
    localNote: 'جرّب الوظائف بحرية. التغييرات محلية ولا تُنشئ طلبات أو حجوزات حقيقية.',
    light: 'الوضع الفاتح',
    dark: 'الوضع الليلي',
    company: { heading: 'مركز المعاملات', category: 'معاملات', tasks: ['ينشئ الطلب ويجهّزه', 'يدقّق البيانات', 'يعتمد ويتابع التنفيذ'], statuses: ['موظف', 'مراجع', 'مدير'] },
    identity: { brand: 'مدار للحلول', nav: 'من نحن · خدماتنا · مشاريعنا', title: 'حلول رقمية. وأثر واضح.', subtitle: 'تعرّف على شركتنا وخدماتنا وطريقة عملنا.', action: 'استكشف خدماتنا', palette: 'شركة حلول رقمية' },
    store: { heading: 'USB SELECT', categories: ['كل المنتجات', 'صوتيات', 'تقنية'], products: ['سماعات Studio', 'ساعة Everyday', 'كاميرا Moment'], cart: 'اختياراتك اليومية، بتفاصيل أفضل.', detail: 'تسوّق المجموعة' },
    automation: { heading: 'مساعد USB SELECT', badge: 'منتجات وأسعار وطلبات', first: 'أهلًا بك! هذه اختياراتنا اليوم.', reply: 'كم سعر الآيفون؟', last: 'اختر السعة واللون لنجهّز طلبك.', input: 'اسأل عن السعر أو التوفر…' },
    hotel: { heading: 'إقامة تستحقها.', tabs: ['تجربة الضيف', 'إدارة الفندق'], rooms: ['الغرفة المزدوجة', 'الجناح الخاص'], statuses: ['متاحة للحجز', 'إطلالة مميزة'], bottom: 'غرف مريحة. تجربة إقامة متكاملة.' },
    restaurant: { heading: 'مذاق يجمعنا.', tables: ['برغر كلاسيك', 'بيتزا الجبن', 'باستا كريمية'], statuses: ['18 LYD', '28 LYD', '22 LYD'], bottom: 'قائمة الطعام · الطلبات والمطبخ' },
  },
  en: {
    eyebrow: 'Our services and demos',
    title: 'Choose a service. Try it yourself.',
    description: 'Select “Open demo” to try a service right away. No sign-up needed.',
    sampleNote: 'All demos use sample data.',
    quickLinks: 'Jump to a service',
    explore: 'Open demo',
    request: 'Request a similar solution',
    close: 'Close demo',
    interactive: 'Interactive demo',
    systemDemo: 'Connected system demo',
    demoData: 'Sample data',
    expand: 'Expand to full screen',
    restore: 'Restore window size',
    localNote: 'Explore freely. Changes stay in this preview and do not place real orders or bookings.',
    light: 'Light mode',
    dark: 'Dark mode',
    company: { heading: 'Service center', category: 'Transactions', tasks: ['Creates and prepares the request', 'Checks the details', 'Approves and follows progress'], statuses: ['Employee', 'Reviewer', 'Manager'] },
    identity: { brand: 'MADAR SOLUTIONS', nav: 'About · Services · Projects', title: 'Digital solutions. Clear impact.', subtitle: 'Meet our company, services, and approach.', action: 'Explore our services', palette: 'A digital solutions company' },
    store: { heading: 'USB SELECT', categories: ['All products', 'Audio', 'Tech'], products: ['Studio headphones', 'Everyday watch', 'Moment camera'], cart: 'Everyday essentials. Better details.', detail: 'Shop the collection' },
    automation: { heading: 'USB SELECT assistant', badge: 'Products, prices & orders', first: 'Welcome! Here are today’s picks.', reply: 'How much is the iPhone?', last: 'Choose a finish and storage to continue.', input: 'Ask about prices or stock…' },
    hotel: { heading: 'A stay to remember.', tabs: ['Guest experience', 'Hotel workspace'], rooms: ['Double room', 'Private suite'], statuses: ['Available to book', 'A view to enjoy'], bottom: 'Thoughtful rooms. A complete stay.' },
    restaurant: { heading: 'Good food. Great company.', tables: ['Classic burger', 'Cheese pizza', 'Creamy pasta'], statuses: ['18 LYD', '28 LYD', '22 LYD'], bottom: 'The menu · Orders & kitchen' },
  },
};

const demoNames: Record<Language, Record<ServiceId, string>> = {
  ar: { company: 'منظومة الأعمال', identity: 'موقع الشركة', store: 'المتجر الإلكتروني', automation: 'مساعد المبيعات', hotel: 'نظام الفندق', restaurant: 'نظام المطعم' },
  en: { company: 'Business system', identity: 'Company website', store: 'Online store', automation: 'Sales assistant', hotel: 'Hotel system', restaurant: 'Restaurant system' },
};

const quickNames: Record<Language, Record<ServiceId, string>> = {
  ar: { company: 'منظومة أعمال', identity: 'موقع شركة', store: 'متجر إلكتروني', automation: 'مساعد مبيعات', hotel: 'نظام فندق', restaurant: 'نظام مطعم' },
  en: { company: 'Business', identity: 'Website', store: 'Store', automation: 'Assistant', hotel: 'Hotel', restaurant: 'Restaurant' },
};

const demoSummaries: Record<Language, Record<ServiceId, string>> = {
  ar: {
    company: 'نظّم المعاملات، حدّد صلاحيات الموظفين وتابع كل إجراء.',
    identity: 'عرّف بشركتك وخدماتك، واستقبل طلبات عملائك.',
    store: 'اعرض منتجاتك واستقبل الطلبات وتابعها من مكان واحد.',
    automation: 'أجب عن أسئلة العملاء وساعدهم على إكمال الشراء.',
    hotel: 'اجمع الحجوزات والغرف والوصول والمغادرة في نظام واحد.',
    restaurant: 'نظّم قائمة الطعام والحجوزات والطلبات حتى المطبخ.',
  },
  en: {
    company: 'Organize requests, set staff permissions, and track every action.',
    identity: 'Introduce your business and services, and receive customer enquiries.',
    store: 'Showcase products, receive orders, and track them in one place.',
    automation: 'Answer customer questions and help them complete their purchase.',
    hotel: 'Manage bookings, rooms, check-in, and check-out in one system.',
    restaurant: 'Organize your menu, table bookings, and orders through to the kitchen.',
  },
};

function Arrow() {
  return <svg className="solution-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" /></svg>;
}

function MiniPreview({ id, lang }: { id: ServiceId; lang: Language }) {
  const t = labels[lang];
  return <div className={`solution-preview solution-preview--${id}`} aria-hidden="true">
    <div className="mini-window">
      <div className="mini-window-bar"><span className="mini-window-dots"><i /><i /><i /></span><span>{id === 'store' ? 'USB SELECT' : id === 'identity' ? 'MADAR SOLUTIONS' : id === 'restaurant' ? 'RIWAQ' : 'USB TECH · DEMO'}</span><span className="mini-window-status" /></div>
      {id === 'company' && <div className="mini-workspace">
        <div className="mini-workspace-main"><div className="mini-system-intro"><strong>{lang === 'ar' ? 'كل خطوة لها مسؤول.' : 'A clear owner for every step.'}</strong></div><div className="mini-task-list">{t.company.tasks.map((task, index) => <div className="mini-task" key={task}><span className="mini-step-number">{index + 1}</span><span>{task}</span><small>{t.company.statuses[index]}</small></div>)}</div></div>
      </div>}
      {id === 'identity' && <div className="mini-identity">
        <div className="mini-brand-hero"><div><span className="mini-brand-name">{t.identity.brand}</span><strong>{t.identity.title}</strong><p>{t.identity.subtitle}</p></div><img src="./demo-identity/studio.jpg" alt="" loading="lazy"/></div>
      </div>}
      {id === 'store' && <div className="mini-store">
        <div className="mini-product-grid">{[storeProducts[0], storeProducts[1], storeProducts[3]].map(product => <div className="mini-product" key={product.id}><img src={product.image} alt="" loading="lazy"/><span>{product.name[lang]}</span><strong>{formatStoreMoney(product.price, lang)}</strong></div>)}</div>
      </div>}
      {id === 'automation' && <div className="mini-chat">
        <div className="mini-bubbles"><p className="mini-user-bubble">{t.automation.reply}</p><div className="mini-chat-product"><img src={storeProducts[0].image} alt="" loading="lazy"/><span>{storeProducts[0].name[lang]}<b>{formatStoreMoney(storeProducts[0].price, lang)}</b></span></div><p>{t.automation.last}</p></div>
      </div>}
      {id === 'hotel' && <div className="mini-hotel">
        <div className="mini-hotel-booking"><img src="./demo-operations/room-suite.jpg" alt="" loading="lazy"/><div><strong>{t.hotel.heading}</strong><span>{lang === 'ar' ? 'غرف · حجوزات · استقبال' : 'Rooms · Bookings · Reception'}</span><b>{lang === 'ar' ? 'إقامة تبدأ بسهولة.' : 'A simpler stay.'}</b></div></div>
      </div>}
      {id === 'restaurant' && <div className="mini-restaurant">
        <div className="mini-table-row">{restaurantMenu.slice(0, 3).map(item => <div key={item.id} className="mini-table"><img src={item.image} alt="" loading="lazy"/><strong>{item.name[lang]}</strong><small>{restaurantMoney(item.price, lang)}</small></div>)}</div>
      </div>}
    </div>
  </div>;
}

export default function Solutions({ lang, onSelectService }: SolutionsProps) {
  const [activeId, setActiveId] = useState<ServiceId | null>(null);
  const [demoLang, setDemoLang] = useState<Language>(lang);
  const [demoTheme, setDemoTheme] = useState<'dark' | 'light'>('dark');
  const [expanded, setExpanded] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const restoreFocusRef = useRef(true);
  const t = labels[lang];
  const activeService = services[demoLang].find((service) => service.id === activeId);
  const dt = labels[demoLang];

  function openDemo(id: ServiceId, trigger: HTMLButtonElement) {
    restoreFocusRef.current = true;
    triggerRef.current = trigger;
    setDemoLang(lang);
    setDemoTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
    setExpanded(false);
    setActiveId(id);
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (activeId && !dialog.open) dialog.showModal();
    if (!activeId && dialog.open) dialog.close();
    if (!activeId) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [activeId]);

  function closeDialog() {
    dialogRef.current?.close();
    setActiveId(null);
  }

  function handleClose() {
    setActiveId(null);
    if (restoreFocusRef.current) triggerRef.current?.focus({ preventScroll: true });
  }

  function requestSolution(id: ServiceId) {
    restoreFocusRef.current = false;
    closeDialog();
    onSelectService(id);
  }

  return <section id="services" className="solutions-section section reveal" aria-labelledby="services-title">
    <span id="solutions" className="solutions-legacy-anchor" aria-hidden="true" />
    <span id="needs" className="solutions-legacy-anchor" aria-hidden="true" />
    <div className="container">
      <div className="solutions-heading section-heading"><p className="section-kicker"><span>02</span>{t.eyebrow}</p><h2 id="services-title">{t.title}</h2><p>{t.description}</p><p className="solutions-sample-note">{t.sampleNote}</p></div>
      <nav className="solutions-quick-links" aria-label={t.quickLinks}>
        {services[lang].map(service => <a href={`#solution-${service.id}`} key={service.id}>{quickNames[lang][service.id]}</a>)}
      </nav>
      <div className="solutions-grid">
        {services[lang].map(service => <article id={`solution-${service.id}`} className="solution-card" key={service.id} tabIndex={-1} aria-labelledby={`solution-title-${service.id}`}>
          <div className="solution-card-content"><h3 id={`solution-title-${service.id}`}>{demoNames[lang][service.id]}</h3><p className="solution-description">{demoSummaries[lang][service.id]}</p></div>
          <button className="solution-preview-button" type="button" aria-haspopup="dialog" aria-label={`${t.explore}: ${demoNames[lang][service.id]}`} onClick={event => openDemo(service.id, event.currentTarget)}><MiniPreview id={service.id} lang={lang}/></button>
          <div className="solution-card-actions"><button className="solution-explore button button-primary" type="button" aria-haspopup="dialog" aria-label={`${t.explore}: ${demoNames[lang][service.id]}`} onClick={event => openDemo(service.id, event.currentTarget)}>{t.explore}<Arrow /></button></div>
        </article>)}
      </div>
    </div>
    <dialog className={`demo-dialog ${expanded ? 'demo-dialog--expanded' : ''}`} data-demo-theme={demoTheme} ref={dialogRef} dir={demoLang === 'ar' ? 'rtl' : 'ltr'} lang={demoLang} aria-labelledby="demo-dialog-title" aria-describedby="demo-dialog-note" onClose={handleClose} onCancel={() => setActiveId(null)} onClick={(event) => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog(); } }}>
      {activeService && <>
        <header className="demo-toolbar">
          <div className="demo-toolbar-title"><span className="demo-app-icon"><Icon name={activeService.id}/></span><div><h2 id="demo-dialog-title"><span className="demo-full-title">{activeService.title}</span><span className="demo-mobile-title">{demoNames[demoLang][activeService.id]}</span></h2><span><i aria-hidden="true"/>{dt.interactive}<b aria-hidden="true">·</b>{dt.demoData}</span></div></div>
          <div className="demo-toolbar-actions">
            <button type="button" className="demo-tool-button demo-language" onClick={() => setDemoLang(demoLang === 'ar' ? 'en' : 'ar')} aria-label={demoLang === 'ar' ? 'Switch demo to English' : 'تبديل النموذج إلى العربية'}>{demoLang === 'ar' ? 'EN' : 'العربية'}</button>
            <button type="button" className="demo-tool-button" onClick={() => setDemoTheme(demoTheme === 'dark' ? 'light' : 'dark')} aria-label={demoTheme === 'dark' ? dt.light : dt.dark}><Icon name={demoTheme === 'dark' ? 'sun' : 'moon'}/></button>
            <button type="button" className="demo-tool-button demo-expand" aria-label={expanded ? dt.restore : dt.expand} aria-pressed={expanded} onClick={() => setExpanded(!expanded)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d={expanded ? 'M9 3v6H3m18 0h-6V3M3 15h6v6m6 0v-6h6' : 'M3 9V3h6m6 0h6v6M3 15v6h6m6 0h6v-6'}/></svg></button>
            <button type="button" className="demo-tool-button demo-close" aria-label={dt.close} onClick={closeDialog} autoFocus><Icon name="close"/></button>
          </div>
        </header>
        <div className="demo-stage" key={activeService.id}>
          <DemoBoundary lang={demoLang}><Suspense fallback={<div className="demo-load-state" role="status" aria-live="polite"><span className="demo-load-indicator" aria-hidden="true"/><p>{demoLang === 'ar' ? 'جارٍ تجهيز النموذج…' : 'Preparing your demo…'}</p></div>}>
          {activeService.id === 'company' && <CompanyDemo lang={demoLang}/>}
          {activeService.id === 'identity' && <IdentityDemo lang={demoLang}/>}
          {activeService.id === 'store' && <StoreDemo lang={demoLang}/>}
          {activeService.id === 'automation' && <AutomationDemo lang={demoLang}/>}
          {activeService.id === 'hotel' && <HotelDemo lang={demoLang}/>}
          {activeService.id === 'restaurant' && <RestaurantDemo lang={demoLang}/>}
          </Suspense></DemoBoundary>
        </div>
        <footer className="demo-footer"><p id="demo-dialog-note">{dt.localNote}</p><button type="button" className="button button-primary" onClick={() => requestSolution(activeService.id)}>{dt.request}<Arrow/></button></footer>
      </>}
    </dialog>
  </section>;
}
