import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import type { Language } from '../../content';
import './identity-demo.css';

const copy = {
  ar: {
    brand: 'مدار للحلول', brandEn: 'MADAR SOLUTIONS', descriptor: 'شريكك في التحوّل الرقمي', home: 'الرئيسية', about: 'عن مدار', services: 'خدماتنا', projects: 'تصوّرات المشاريع', contact: 'تواصل معنا', menu: 'القائمة',
    companyPage: 'موقع الشركة', requestPage: 'طلب مشروع', page: 'الصفحة', eyebrow: 'فكرة واضحة. أعمال أكثر اتصالًا.', hero: 'نقرّب التقنية', heroAccent: 'من احتياج أعمالك.',
    intro: 'نصمّم مواقع تعرّف بك، ونطوّر أنظمة ترتّب أعمالك، ونربط تفاصيل التجربة لتعمل معًا. نبدأ من احتياجك، ونبني حوله.', start: 'ناقش مشروعك', explore: 'اكتشف خدماتنا', photoAlt: 'مساحة عمل مضيئة مع حواسيب ونباتات وأعمال فنية', photoCaption: 'مساحة للأفكار التي تتحوّل إلى حلول.',
    pillars: ['حضور رقمي واضح', 'عمليات أكثر تنظيمًا', 'تجربة تضع المستخدم أولًا'], aboutKicker: 'عن الشركة', aboutTitle: 'حلول تبدأ بفهم العمل.', aboutText: 'مدار شركة افتراضية للحلول الرقمية، يقدّم هذا الموقع تصوّرًا متكاملًا لحضورها على الإنترنت. نجمع التفكير في تجربة المستخدم مع تطوير الأدوات التي يحتاجها النشاط، من الموقع التعريفي إلى أنظمة العمل الداخلية.', aboutSecond: 'نرتّب المتطلبات معك، ونحوّلها إلى نطاق واضح، ثم نطوّر تجربة يمكن مراجعتها واستخدامها. كل قرار في التصميم له وظيفة، وكل وظيفة تخدم احتياجًا.',
    values: ['نستمع قبل أن نبدأ', 'نشرح ما سنبنيه', 'نراجع التفاصيل معك'], aboutImageAlt: 'كتاب عن الهوية البصرية بجانب حاسوب ولوحة مفاتيح', servicesKicker: 'ما الذي يمكننا تطويره؟', servicesTitle: 'خدمات تتكامل حول مشروعك.', servicesIntro: 'ابدأ من نقطة تحتاج إلى تحسين، أو اجمع أكثر من خدمة في مسار واحد.',
    serviceNames: ['المواقع والتجارة الإلكترونية', 'أنظمة إدارة الأعمال', 'أتمتة مسارات العمل'], serviceDescriptions: ['موقع واضح يعرض نشاطك، أو متجر ينظّم المنتجات والطلبات ويقدّم تجربة مناسبة للهاتف.', 'لوحات عمل للمهام والطلبات والمستندات، بصلاحيات وتقارير تناسب طريقة عمل فريقك.', 'ربط الخطوات المتكررة وتنظيم استقبال الاستفسارات لتصل المعلومات إلى مكانها الصحيح.'], serviceFeatures: [['تجربة عربية وإنجليزية', 'تصميم متجاوب', 'محتوى وخطوات تواصل واضحة'], ['أدوار وصلاحيات', 'مسارات مراجعة ومتابعة', 'تقارير قابلة للتخصيص'], ['نماذج استقبال منظّمة', 'إشعارات ومسارات متابعة', 'ملخّصات تساعد فريق العمل']], included: 'ما الذي يتضمّنه الحل؟', hideDetails: 'إخفاء التفاصيل', requestService: 'اطلب هذه الخدمة',
    projectsKicker: 'من الفكرة إلى الواجهة', projectsTitle: 'تصوّرات لما يمكن بناؤه.', projectsIntro: 'نماذج افتراضية لشرح اتجاه الحل، وليست أعمال عملاء أو نتائج موثّقة.', projectNames: ['حضور متكامل لشركة', 'مساحة عمل للفريق', 'واجهة متجر واضحة'], projectDescriptions: ['صفحات تعرف بالشركة وخدماتها، ونموذج تواصل مرتبط باحتياج الزائر.', 'المهام والطلبات والمستندات في واجهة موحّدة، مع متابعة حالة كل إجراء.', 'منتجات قابلة للبحث والتصفية، وسلة واضحة قبل تأكيد الطلب.'], sample: 'تصوّر افتراضي', projectView: 'تفاصيل التصوّر', similar: 'ناقش حلًا مشابهًا', projectDetail: 'نبدأ بتحديد المستخدمين والصفحات والوظائف المطلوبة، ثم نخصّص التصميم ونطاق العمل للمشروع.',
    approach: 'من أين نبدأ؟', approachTitle: 'خطوة واضحة في كل مرحلة.', steps: ['نفهم المتطلبات', 'نحدّد نطاق الحل', 'نطوّر ونراجع', 'نجهّز للتسليم'], ctaTitle: 'لنضع فكرتك على مسار واضح.', ctaText: 'أخبرنا بما تريد تغييره أو تطويره، وسنرتّب نقطة البداية.',
    requestTitle: 'فكرتك تستحق بداية مرتّبة.', requestIntro: 'اكتب تفاصيل مشروعك ثم راجع ملخّص الطلب. هذه تجربة محلية، ولا ترسل البيانات إلى شركة أو خدمة خارجية.', formTitle: 'تحدّث عن مشروعك', name: 'الاسم', company: 'اسم النشاط', optional: 'اختياري', contactField: 'البريد الإلكتروني أو الهاتف', service: 'الخدمة المطلوبة', brief: 'نبذة عن المشروع', briefHint: 'ما الذي تريد تطويره؟ ومن سيستخدم الحل؟', submit: 'مراجعة الطلب', required: 'هذا الحقل مطلوب.', invalidContact: 'أدخل بريدًا إلكترونيًا صحيحًا أو رقم هاتف من 7 إلى 15 رقمًا.', previewTitle: 'طلبك جاهز للمراجعة.', previewNote: 'لم يُرسل الطلب. البيانات المعروضة محفوظة في هذه الجلسة فقط.', edit: 'تعديل التفاصيل', back: 'العودة لموقع الشركة', planningAlt: 'دفتر وأقلام وأدوات تخطيط على مكتب فاتح', requestHelp: 'ما الذي يساعد على بداية أفضل؟', helpItems: ['وصف مختصر للنشاط', 'المشكلة أو الهدف الأساسي', 'الوظائف التي تحتاجها أولًا'], footer: 'تقنية أقرب لأعمالك.', demoNote: 'مدار شركة افتراضية ضمن نموذج توضيحي. الصور لأغراض العرض.',
  },
  en: {
    brand: 'Madar Solutions', brandEn: 'MADAR SOLUTIONS', descriptor: 'Your partner in digital change', home: 'Home', about: 'About Madar', services: 'Services', projects: 'Project concepts', contact: 'Contact', menu: 'Menu',
    companyPage: 'Company website', requestPage: 'Project enquiry', page: 'Page', eyebrow: 'Clear ideas. More connected work.', hero: 'Bringing technology', heroAccent: 'closer to your business.',
    intro: 'We create websites that introduce you, systems that organize your work, and experiences that bring the details together. We start with your needs and build around them.', start: 'Discuss your project', explore: 'Explore our services', photoAlt: 'A bright workspace with computers, plants, and artwork', photoCaption: 'Room for ideas that become solutions.',
    pillars: ['A clear digital presence', 'Better organized operations', 'Experiences built around people'], aboutKicker: 'About the company', aboutTitle: 'Solutions start with understanding the work.', aboutText: 'Madar is a fictional digital solutions company, presented here as a complete corporate website concept. We combine user experience thinking with the tools a business needs, from its public website to internal work systems.', aboutSecond: 'We organize requirements with you, shape a clear scope, and develop an experience you can review and use. Every design decision has a purpose, and every feature serves a need.',
    values: ['Listen before we begin', 'Make the plan clear', 'Review the details together'], aboutImageAlt: 'A brand identity book next to a computer and keyboard', servicesKicker: 'What could we build?', servicesTitle: 'Services that work together around your project.', servicesIntro: 'Start with one area to improve, or combine several services into a connected plan.',
    serviceNames: ['Websites & online stores', 'Business management systems', 'Workflow automation'], serviceDescriptions: ['A clear business website or an organized store, with products, orders, and an experience that works on mobile.', 'Workspaces for tasks, requests, and documents, with permissions and reports that fit your team.', 'Connected steps and organized incoming enquiries that help information reach the right place.'], serviceFeatures: [['Arabic and English experiences', 'Responsive design', 'Clear content and contact flows'], ['Roles and permissions', 'Review and tracking workflows', 'Reports shaped around your needs'], ['Structured intake forms', 'Notifications and follow-up flows', 'Summaries that support your team']], included: 'What can the solution include?', hideDetails: 'Hide details', requestService: 'Enquire about this service',
    projectsKicker: 'From idea to interface', projectsTitle: 'A look at what could be built.', projectsIntro: 'Fictional concepts that explain a direction, not documented client work or results.', projectNames: ['A connected company presence', 'A workspace for the team', 'A clear online storefront'], projectDescriptions: ['Pages that introduce a company and its services, with an enquiry flow shaped around the visitor.', 'Tasks, requests, and documents in one interface, with clear progress for each action.', 'Searchable, filterable products and a straightforward cart before reviewing an order.'], sample: 'Fictional concept', projectView: 'Explore the concept', similar: 'Discuss a similar solution', projectDetail: 'We begin by identifying the users, pages, and features, then tailor the design and scope to the project.',
    approach: 'Where do we start?', approachTitle: 'A clear step at every stage.', steps: ['Understand the needs', 'Define the solution', 'Develop and review', 'Prepare for delivery'], ctaTitle: 'Give your idea a clear direction.', ctaText: 'Tell us what you want to change or develop, and let’s shape the starting point.',
    requestTitle: 'A thoughtful start for your idea.', requestIntro: 'Describe your project, then review an enquiry summary. This is a local experience and does not send data to a company or external service.', formTitle: 'Tell us about your project', name: 'Your name', company: 'Business name', optional: 'Optional', contactField: 'Email address or phone number', service: 'Requested service', brief: 'Project overview', briefHint: 'What would you like to develop, and who will use it?', submit: 'Review enquiry', required: 'This field is required.', invalidContact: 'Enter a valid email address or a phone number with 7–15 digits.', previewTitle: 'Your enquiry is ready to review.', previewNote: 'This enquiry was not sent. These details are kept in this session only.', edit: 'Edit details', back: 'Back to the company website', planningAlt: 'A notebook, pencils, and planning tools on a light desk', requestHelp: 'What helps us understand your idea?', helpItems: ['A short introduction to the business', 'The main problem or objective', 'The features you need first'], footer: 'Technology closer to your business.', demoNote: 'Madar is a fictional company in an illustrative concept. Photography is for presentation.',
  },
};

type Page = 'company' | 'enquiry';
type Section = 'home' | 'about' | 'services' | 'projects';
type Fields = { name: string; company: string; contact: string; brief: string };
type FormErrors = Partial<Record<keyof Fields, 'required' | 'invalidContact'>>;

function Mark({ name = 'arrow' }: { name?: 'arrow' | 'web' | 'system' | 'flow' | 'check' }) {
  const paths = { arrow: 'M5 12h14m-6-6 6 6-6 6', web: 'M3 5h18v14H3V5Zm0 4h18M7 5v4M11 5v4', system: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z', flow: 'M7 4h10v5H7V4Zm0 11h10v5H7v-5Zm5-6v6m-3-3 3 3 3-3', check: 'm5 12 4 4L19 6' };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

export default function IdentityDemo({ lang }: { lang: Language }) {
  const t = copy[lang];
  const uid = useId();
  const [page, setPage] = useState<Page>('company');
  const [selectedService, setSelectedService] = useState(0);
  const [expandedService, setExpandedService] = useState<number | null>(null);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [fields, setFields] = useState<Fields>({ name: '', company: '', contact: '', brief: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [reviewed, setReviewed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pageHeadingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const formHeadingRef = useRef<HTMLHeadingElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const pendingSection = useRef<Section | null>(null);

  function scrollToSection(section: Section) {
    const target = rootRef.current?.querySelector<HTMLElement>(`[data-md-section="${section}"]`);
    const stage = rootRef.current?.closest<HTMLElement>('.demo-stage');
    if (target && stage) {
      const top = target.getBoundingClientRect().top - stage.getBoundingClientRect().top + stage.scrollTop - 20;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      stage.scrollTo({ top: Math.max(0, top), behavior: reduced ? 'auto' : 'smooth' });
      target.querySelector<HTMLElement>('h2, h3')?.focus({ preventScroll: true });
    }
  }
  function goSection(section: Section) {
    setMenuOpen(false);
    if (page === 'company') scrollToSection(section);
    else { pendingSection.current = section; setPage('company'); }
  }
  function enquire(service?: number) {
    if (service !== undefined) { setSelectedService(service); setReviewed(false); setErrors({}); }
    setMenuOpen(false);
    if (page === 'enquiry') requestAnimationFrame(focusEnquiry);
    setPage('enquiry');
  }
  function focusEnquiry() {
    const target = formHeadingRef.current || previewRef.current;
    const stage = rootRef.current?.closest<HTMLElement>('.demo-stage');
    if (!target || !stage) return;
    const top = target.getBoundingClientRect().top - stage.getBoundingClientRect().top + stage.scrollTop - 12;
    stage.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
    target.focus({ preventScroll: true });
  }
  useEffect(() => {
    if (page === 'enquiry') focusEnquiry();
    else if (page === 'company' && pendingSection.current) { const section = pendingSection.current; pendingSection.current = null; scrollToSection(section); }
    else { rootRef.current?.closest('.demo-stage')?.scrollTo({ top: 0 }); pageHeadingRef.current?.focus({ preventScroll: true }); }
  }, [page]);
  useEffect(() => { if (reviewed) previewRef.current?.focus(); }, [reviewed]);

  function updateField(field: keyof Fields, value: string) {
    setFields(current => ({ ...current, [field]: value })); setErrors(current => ({ ...current, [field]: undefined }));
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: FormErrors = {};
    for (const field of ['name', 'contact', 'brief'] as const) if (!fields[field].trim()) next[field] = 'required';
    const value = fields.contact.trim().replace(/[٠-٩]/g, char => String('٠١٢٣٤٥٦٧٨٩'.indexOf(char)));
    const phoneDigits = value.replace(/\D/g, '');
    if (value && !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || (/^[+\d\s()\-]+$/.test(value) && phoneDigits.length >= 7 && phoneDigits.length <= 15))) next.contact = 'invalidContact';
    setErrors(next);
    if (Object.keys(next).length) { formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus(); return; }
    setReviewed(true);
  }

  return <div className="madar-demo" ref={rootRef} lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
    <div className="md-topline"><span>{t.descriptor}</span><span>{t.page} {page === 'company' ? '01' : '02'} / 02</span></div>
    <header className="md-header"><button className="md-brand" type="button" onClick={() => goSection('home')}><span className="md-brand-symbol" aria-hidden="true"><i /><i /><i /></span><span>{t.brand}<small>{t.brandEn}</small></span></button><button type="button" className="md-menu-toggle" aria-expanded={menuOpen} aria-controls={`${uid}-navigation`} onClick={() => setMenuOpen(open => !open)}>{t.menu}<span aria-hidden="true">{menuOpen ? '−' : '+'}</span></button><nav id={`${uid}-navigation`} className={menuOpen ? 'md-nav-open' : ''} aria-label={lang === 'ar' ? 'أقسام موقع مدار' : 'Madar website navigation'}>{(['home', 'about', 'services', 'projects'] as Section[]).map(id => <button key={id} type="button" onClick={() => goSection(id)}>{t[id]}</button>)}<button type="button" className="md-nav-contact" onClick={() => enquire()}>{t.contact}<Mark /></button></nav></header>
    <div className="md-page-switch" aria-label={lang === 'ar' ? 'صفحات الموقع' : 'Website pages'}><button type="button" aria-current={page === 'company' ? 'page' : undefined} onClick={() => goSection('home')}><span>01</span>{t.companyPage}</button><button type="button" aria-current={page === 'enquiry' ? 'page' : undefined} onClick={() => enquire()}><span>02</span>{t.requestPage}</button></div>
    {page === 'company' ? <>
      <section className="md-hero md-container" data-md-section="home"><div className="md-hero-copy"><p className="md-kicker"><i />{t.eyebrow}</p><h2 ref={pageHeadingRef} tabIndex={-1}>{t.hero}<span>{t.heroAccent}</span></h2><p className="md-lead">{t.intro}</p><div className="md-actions"><button type="button" className="md-button md-button-primary" onClick={() => enquire()}>{t.start}<Mark /></button><button type="button" className="md-button md-button-outline" onClick={() => goSection('services')}>{t.explore}</button></div></div><figure className="md-hero-photo"><img src="./demo-identity/studio.jpg" alt={t.photoAlt} width="1400" height="1050" /><figcaption><span aria-hidden="true">✳</span>{t.photoCaption}</figcaption></figure></section>
      <div className="md-pillars md-container">{t.pillars.map((pillar, i) => <span key={i}><Mark name="check" />{pillar}</span>)}</div>
      <section className="md-about md-container" data-md-section="about"><figure><img src="./demo-identity/workspace.jpg" alt={t.aboutImageAlt} width="1200" height="800" loading="lazy" /><span aria-hidden="true">M / SOLUTIONS</span></figure><div><p className="md-kicker">01 — {t.aboutKicker}</p><h3 tabIndex={-1}>{t.aboutTitle}</h3><p>{t.aboutText}</p><p>{t.aboutSecond}</p><ul className="md-values">{t.values.map(value => <li key={value}><Mark name="check" />{value}</li>)}</ul></div></section>
      <section className="md-services" data-md-section="services"><div className="md-container"><div className="md-section-title"><p className="md-kicker">02 — {t.servicesKicker}</p><h3 tabIndex={-1}>{t.servicesTitle}</h3><p>{t.servicesIntro}</p></div><div className="md-service-grid">{t.serviceNames.map((name, i) => <article className="md-service-card" key={i}><div className="md-service-top"><span className="md-service-icon"><Mark name={(['web', 'system', 'flow'] as const)[i]} /></span><span>0{i + 1}</span></div><h4>{name}</h4><p>{t.serviceDescriptions[i]}</p><button className="md-expand" type="button" aria-expanded={expandedService === i} aria-controls={`${uid}-service-${i}`} onClick={() => setExpandedService(expandedService === i ? null : i)}>{expandedService === i ? t.hideDetails : t.included}<span aria-hidden="true">{expandedService === i ? '−' : '+'}</span></button>{expandedService === i && <ul id={`${uid}-service-${i}`} className="md-service-features">{t.serviceFeatures[i].map(feature => <li key={feature}><Mark name="check" />{feature}</li>)}</ul>}<button className="md-link" type="button" onClick={() => enquire(i)}>{t.requestService}<Mark /></button></article>)}</div></div></section>
      <section className="md-projects md-container" data-md-section="projects"><div className="md-section-title"><p className="md-kicker">03 — {t.projectsKicker}</p><h3 tabIndex={-1}>{t.projectsTitle}</h3><p>{t.projectsIntro}</p></div><div className="md-project-grid">{t.projectNames.map((name, i) => <article className="md-project-card" key={i}><div className={`md-project-art md-project-art-${i}`}><img src={`./demo-identity/${['studio', 'workspace', 'planning'][i]}.jpg`} alt={[t.photoAlt, t.aboutImageAlt, t.planningAlt][i]} loading="lazy" /><span>{t.sample}</span></div><div className="md-project-copy"><h4>{name}</h4><p>{t.projectDescriptions[i]}</p><button type="button" className="md-link" aria-expanded={expandedProject === i} aria-controls={`${uid}-project-${i}`} onClick={() => setExpandedProject(expandedProject === i ? null : i)}>{t.projectView}<span aria-hidden="true">{expandedProject === i ? '−' : '+'}</span></button>{expandedProject === i && <div className="md-project-detail" id={`${uid}-project-${i}`}><p>{t.projectDetail}</p><button type="button" className="md-button md-button-primary" onClick={() => enquire(i === 1 ? 1 : 0)}>{t.similar}<Mark /></button></div>}</div></article>)}</div></section>
      <section className="md-process md-container"><div className="md-section-title"><p className="md-kicker">{t.approach}</p><h3>{t.approachTitle}</h3></div><ol>{t.steps.map((step, i) => <li key={step}><span>0{i + 1}</span><h4>{step}</h4></li>)}</ol></section>
      <section className="md-cta md-container"><div><h3>{t.ctaTitle}</h3><p>{t.ctaText}</p></div><button type="button" className="md-button md-button-light" onClick={() => enquire()}>{t.start}<Mark /></button></section>
    </> : <section className="md-enquiry md-container"><div className="md-enquiry-copy"><p className="md-kicker">02 — {t.requestPage}</p><h2 ref={pageHeadingRef} tabIndex={-1}>{t.requestTitle}</h2><p>{t.requestIntro}</p><img src="./demo-identity/planning.jpg" alt={t.planningAlt} width="1000" height="667" /><h3>{t.requestHelp}</h3><ul className="md-values">{t.helpItems.map(item => <li key={item}><Mark name="check" />{item}</li>)}</ul><button type="button" className="md-link" onClick={() => goSection('home')}>{t.back}<Mark /></button></div><div className="md-form-card">{reviewed ? <div className="md-enquiry-result" ref={previewRef} tabIndex={-1} role="status"><span className="md-result-icon"><Mark name="check" /></span><h3>{t.previewTitle}</h3><p className="md-local-note">{t.previewNote}</p><dl><dt>{t.name}</dt><dd>{fields.name}</dd>{fields.company && <><dt>{t.company}</dt><dd>{fields.company}</dd></>}<dt>{t.contactField}</dt><dd dir="auto">{fields.contact}</dd><dt>{t.service}</dt><dd>{t.serviceNames[selectedService]}</dd><dt>{t.brief}</dt><dd>{fields.brief}</dd></dl><button type="button" className="md-button md-button-primary" onClick={() => setReviewed(false)}>{t.edit}<Mark /></button></div> : <form ref={formRef} onSubmit={submit} noValidate><h3 ref={formHeadingRef} tabIndex={-1}>{t.formTitle}</h3>{(['name', 'company', 'contact'] as const).map(field => <label key={field} htmlFor={`${uid}-${field}`}>{field === 'contact' ? t.contactField : t[field]}{field === 'company' ? <small>{t.optional}</small> : <span aria-hidden="true"> *</span>}<input id={`${uid}-${field}`} name={field} value={fields[field]} onChange={event => updateField(field, event.target.value)} autoComplete={field === 'name' ? 'name' : field === 'company' ? 'organization' : 'off'} maxLength={160} required={field !== 'company'} aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `${uid}-${field}-error` : undefined} />{errors[field] && <span className="md-error" id={`${uid}-${field}-error`}>{t[errors[field]!]}</span>}</label>)}<label htmlFor={`${uid}-service`}>{t.service}<select id={`${uid}-service`} value={selectedService} onChange={event => setSelectedService(Number(event.target.value))}>{t.serviceNames.map((name, i) => <option key={i} value={i}>{name}</option>)}</select></label><label htmlFor={`${uid}-brief`}>{t.brief}<span aria-hidden="true"> *</span><textarea id={`${uid}-brief`} name="brief" rows={5} value={fields.brief} onChange={event => updateField('brief', event.target.value)} placeholder={t.briefHint} maxLength={2000} required aria-invalid={!!errors.brief} aria-describedby={errors.brief ? `${uid}-brief-error` : undefined} />{errors.brief && <span className="md-error" id={`${uid}-brief-error`}>{t[errors.brief]}</span>}</label><button type="submit" className="md-button md-button-primary">{t.submit}<Mark /></button><p className="md-local-note">{t.previewNote}</p></form>}</div></section>}
    <footer className="md-footer"><div className="md-container"><div><strong>{t.brand}</strong><p>{t.footer}</p></div><nav aria-label={t.brand}>{(['home', 'about', 'services', 'projects'] as Section[]).map(section => <button type="button" key={section} onClick={() => goSection(section)}>{t[section]}</button>)}<button type="button" onClick={() => enquire()}>{t.contact}</button></nav><p className="md-demo-note">{t.demoNote}</p></div></footer>
  </div>;
}
