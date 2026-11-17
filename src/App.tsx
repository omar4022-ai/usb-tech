import { useEffect, useRef, useState } from 'react';
import { workflow, type Language, type ServiceId } from './content';
import { ui } from './ui';
import { siteConfig, getFacebookUrl, getWhatsAppUrl } from './config/site';
import Icon from './components/Icon';
import ContactForm from './components/ContactForm';
import Solutions from './components/Solutions';
import HeroHeadline from './components/HeroHeadline';

function saved(key:string,fallback:string) { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } }
const navIds = ['home','about','services','process','contact'] as const;
function App() {
  const [lang,setLang] = useState<Language>(()=>saved('usb-language','ar')==='en'?'en':'ar');
  const [theme,setTheme] = useState<'dark'|'light'>(()=>saved('usb-theme','dark')==='light'?'light':'dark');
  const [menuOpen,setMenuOpen] = useState(false);
  const [selectedService,setSelectedService] = useState<ServiceId>('company');
  const menuButton = useRef<HTMLButtonElement>(null);
  const t = ui[lang];
  const facebookUrl = getFacebookUrl(siteConfig.facebookUrl);
  const whatsappUrl = getWhatsAppUrl(siteConfig.whatsappNumber);
  useEffect(()=>{
    document.documentElement.lang=lang;
    document.documentElement.dir=lang==='ar'?'rtl':'ltr';
    document.title=`USB TECH — ${t.descriptor}`;
    try { localStorage.setItem('usb-language',lang); } catch { /* optional storage */ }
  },[lang,t.descriptor]);
  useEffect(()=>{
    document.documentElement.dataset.theme=theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#030D1E':'#FFFFFF');
    try { localStorage.setItem('usb-theme',theme); } catch { /* optional storage */ }
  },[theme]);
  useEffect(()=>{
    if (!menuOpen) return;
    const handle=(e:KeyboardEvent)=>{if(e.key==='Escape'){setMenuOpen(false);menuButton.current?.focus();}};
    document.addEventListener('keydown',handle); return ()=>document.removeEventListener('keydown',handle);
  },[menuOpen]);
  useEffect(()=>{
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if(motion.matches || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}
    }),{threshold:0.08});
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el)); return ()=>observer.disconnect();
  },[]);
  function startProject(id?:ServiceId) {
    if(id) setSelectedService(id);
    setMenuOpen(false);
    document.getElementById('contact')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    document.querySelector<HTMLInputElement>('#project-form input')?.focus({preventScroll:true});
  }
  const contactLinks = <>
    {siteConfig.contactEmail.trim() && <a href={`mailto:${siteConfig.contactEmail}`}><Icon name="mail"/><span dir="ltr">{siteConfig.contactEmail}</span></a>}
    {siteConfig.phone.trim() && <a href={`tel:${siteConfig.phone.replace(/\s/g,'')}`} aria-label={`${t.phone}: ${siteConfig.phone}`}><Icon name="phone"/><span dir="ltr">{siteConfig.phone}</span></a>}
    {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">{t.whatsapp}<span className="sr-only"> — {t.newTab}</span></a>}
  </>;
  return <>
    <a className="skip-link" href="#main">{t.skip}</a>
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="#home" aria-label={`USB TECH — ${t.descriptor}`}><span className="brand-name" dir="ltr">USB <b>TECH</b><small dir={lang==='ar'?'rtl':'ltr'}>{t.descriptor}</small></span></a>
        <nav className="desktop-nav" aria-label={t.nav}>{navIds.map(id=><a href={`#${id}`} key={id}>{t[id]}</a>)}</nav>
        <div className="header-actions">
          <button className="utility-button language-toggle" type="button" onClick={()=>setLang(lang==='ar'?'en':'ar')} aria-label={lang==='ar'?'Switch to English':'التبديل إلى العربية'}><Icon name="globe"/><span>{lang==='ar'?'EN':'العربية'}</span></button>
          <button className="utility-button theme-toggle" type="button" onClick={()=>setTheme(theme==='dark'?'light':'dark')} aria-label={lang==='ar'?`تفعيل الوضع ${theme==='dark'?'النهاري':'الليلي'}`:`Switch to ${theme==='dark'?'light':'dark'} mode`}><Icon name={theme==='dark'?'sun':'moon'}/><span>{theme==='dark'?t.light:t.dark}</span></button>
          <a className="button button-primary header-cta" href="#services">{t.browseDemos}</a>
          <button ref={menuButton} className="utility-button mobile-menu-button" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen?t.closeMenu:t.menu} onClick={()=>setMenuOpen(!menuOpen)}><Icon name={menuOpen?'close':'menu'}/></button>
        </div>
      </div>
      <nav id="mobile-navigation" className="mobile-navigation" hidden={!menuOpen} aria-label={t.nav}>{navIds.map(id=><a href={`#${id}`} key={id} onClick={()=>setMenuOpen(false)}>{t[id]}<Icon name="arrow" className="directional"/></a>)}</nav>
    </header>
    <main id="main">
      <section id="home" className="hero">
        <div className="hero-grid" aria-hidden="true"/>
        <div className="container hero-inner">
          <div className="hero-logo">{siteConfig.logoUrl?<img src={siteConfig.logoUrl} alt={t.logoAlt} width="1254" height="1254" fetchPriority="high"/>:<span className="fallback-logo" dir="ltr">USB TECH</span>}</div>
          <div className="hero-copy" dir={lang==='ar'?'rtl':'ltr'}>
            <HeroHeadline key={lang} first={t.hero1} second={t.hero2} lang={lang}/>
            <p>{t.heroDescription}</p>
            <div className="hero-buttons"><a className="button button-primary" href="#services">{t.explore}<Icon name="arrow" className="directional"/></a></div>
            <div className="hero-note">{t.heroNote}</div>
          </div>
        </div>
        <div className="container hero-base" aria-hidden="true"><span>USB TECH</span><span className="hero-base-line"/><span>{t.heroBase}</span></div>
      </section>
      <section id="about" className="section about-section reveal"><div className="container about-layout">
        <div className="about-copy"><p className="section-kicker"><span>01</span>{t.about}</p><h2>{t.aboutTitle}</h2><p className="about-intro"><span>{t.aboutDescription1}</span><span>{t.aboutDescription2}</span></p><ul className="values">{t.values.map(value=><li key={value}><Icon name="check"/>{value}</li>)}</ul></div>
        <div className="about-visual"><div className="connection-symbol" aria-hidden="true"><span/><span/><span/><div>USB<br/><b>TECH</b></div></div><h3>{t.oneCompany}<br/><span className="gradient-text">{t.connectedSolutions}</span></h3></div>
      </div></section>
      <Solutions lang={lang} onSelectService={startProject}/>
      <section id="process" className="section process-section reveal"><div className="container"><div className="section-heading"><p className="section-kicker"><span>03</span>{t.process}</p><h2>{t.processTitle}</h2></div><ol className="process-grid">{workflow[lang].map((step,index)=><li key={index}><span className="step-number">0{index+1}</span><h3>{step.title}</h3><p>{step.description}</p></li>)}</ol></div></section>
      <section id="contact" className="section contact-section reveal"><div className="container contact-layout"><div className="contact-copy"><p className="section-kicker"><span>04</span>{t.contact}</p><h2>{t.contactTitle}</h2><p>{t.contactDescription}</p><div className="contact-orbit" aria-hidden="true"><span>{lang === 'ar' ? '←' : '→'}</span></div><div className="contact-channels">{contactLinks}</div>{facebookUrl&&<a className="button button-secondary facebook-link" data-facebook-link href={facebookUrl} target="_blank" rel="noopener noreferrer"><Icon name="facebook"/>{t.facebook}<span aria-hidden="true">↗</span><span className="sr-only"> — {t.newTab}</span></a>}</div><ContactForm lang={lang} selectedService={selectedService} onServiceChange={setSelectedService}/></div></section>
    </main>
    <footer className="site-footer"><div className="container"><div className="footer-main"><div className="footer-brand"><a className="brand-name" dir="ltr" href="#home">USB <b>TECH</b></a><p>{t.descriptor}</p><small>{t.footerDescription}</small></div><nav className="footer-nav" aria-label={t.nav}>{navIds.map(id=><a key={id} href={`#${id}`}>{t[id]}</a>)}</nav><div className="footer-social">{facebookUrl&&<a className="facebook-footer" data-facebook-link href={facebookUrl} target="_blank" rel="noopener noreferrer"><Icon name="facebook"/><span>{t.facebook}</span><span className="sr-only"> — {t.newTab}</span></a>}<div className="contact-channels">{contactLinks}</div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} USB TECH. {t.rights}</span><a href="#home">{t.backTop}<span aria-hidden="true">↑</span></a></div></div></footer>
  </>;
}
export default App;
