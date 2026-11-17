import { useEffect, useRef, useState, type FormEvent } from 'react';
import { services, type Language, type ServiceId } from '../content';
import { getWhatsAppUrl, siteConfig } from '../config/site';
import './contact-form.css';

type Fields = { name: string; business: string; contact: string; brief: string };
type ErrorKey = 'nameRequired' | 'contactRequired' | 'contactInvalid' | 'briefRequired';
type Errors = Partial<Record<keyof Fields, ErrorKey>>;
type RequestSummary = Fields & { service: ServiceId };
type Status = 'idle' | 'loading' | 'preview' | 'success' | 'error';

interface ContactFormProps {
  lang: Language;
  selectedService: ServiceId;
  onServiceChange: (id: ServiceId) => void;
}

const copy = {
  ar: {
    name: 'الاسم',
    business: 'اسم النشاط',
    optional: 'اختياري',
    contact: 'البريد الإلكتروني أو رقم الهاتف',
    service: 'الخدمة المطلوبة',
    brief: 'نبذة عن المشروع',
    namePlaceholder: 'كيف نناديك؟',
    businessPlaceholder: 'اسم شركتك أو نشاطك',
    contactPlaceholder: 'example@email.com أو +218…',
    briefPlaceholder: 'ما الذي تريد تطويره؟ أخبرنا عن فكرتك أو التحدي الذي تريد حله.',
    contactHint: 'أدخل بريدًا إلكترونيًا صالحًا أو رقم هاتف مع رمز الدولة إن أمكن.',
    required: 'الحقول المعلّمة بنجمة مطلوبة.',
    previewMode: 'وضع معاينة الطلب',
    previewHelp: 'يمكنك ترتيب فكرتك ومراجعة ملخصها هنا. المعاينة محلية ولا تُرسل بياناتك إلى الشركة.',
    previewButton: 'معاينة الطلب',
    whatsappMode: 'تواصل عبر واتساب',
    whatsappHelp: 'جهّز طلبك وراجعه هنا، ثم افتحه في واتساب لإرساله إلى USB TECH. ستحتاج إلى الضغط على «إرسال» داخل واتساب.',
    whatsappPrepare: 'جهّز الطلب لواتساب',
    whatsappReview: 'راجع طلبك قبل فتح واتساب',
    whatsappNotice: 'لم يُرسل طلبك بعد. افتح واتساب، وراجع الرسالة ثم اضغط «إرسال» هناك.',
    whatsappMessageTitle: 'طلب مشروع إلى USB TECH',
    whatsappOpen: 'فتح الطلب في واتساب',
    whatsappOpenChat: 'فتح المحادثة في واتساب',
    whatsappLongRequest: 'طلبك طويل؛ انسخ النص الكامل أدناه، ثم افتح المحادثة والصقه واضغط «إرسال» في واتساب. لم نختصر أي جزء منه.',
    copyRequest: 'نسخ نص الطلب كاملًا',
    requestCopied: 'تم نسخ النص الكامل. يمكنك لصقه داخل واتساب.',
    copyFailed: 'تعذّر النسخ التلقائي. حدّد النص أدناه وانسخه يدويًا قبل فتح واتساب.',
    fullRequest: 'نص الطلب الكامل',
    newTab: 'يفتح في تبويب جديد',
    sendButton: 'أرسل طلب المشروع',
    loading: 'جارٍ إرسال الطلب…',
    nameRequired: 'يرجى إدخال اسمك.',
    contactRequired: 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف.',
    contactInvalid: 'أدخل بريدًا إلكترونيًا صالحًا أو رقم هاتف من 7 إلى 15 رقمًا.',
    briefRequired: 'يرجى كتابة نبذة عن مشروعك.',
    errorSummary: 'راجع الحقول الموضّحة أدناه لإكمال الطلب.',
    previewTitle: 'معاينة طلبك',
    previewNotice: 'لم يُرسل هذا الطلب. هذا ملخص محلي للمراجعة فقط.',
    successTitle: 'تم استلام طلبك.',
    successMessage: 'وصل طلب المشروع بنجاح. شكرًا لمشاركتنا فكرتك.',
    errorTitle: 'لم نتمكن من تأكيد إرسال الطلب.',
    errorMessage: 'احتفظنا ببياناتك هنا. تحقق من اتصالك وحاول مرة أخرى.',
    notProvided: 'غير مذكور',
  },
  en: {
    name: 'Your name',
    business: 'Business name',
    optional: 'optional',
    contact: 'Email address or phone number',
    service: 'Service needed',
    brief: 'Project brief',
    namePlaceholder: 'What should we call you?',
    businessPlaceholder: 'Your company or business name',
    contactPlaceholder: 'example@email.com or +218…',
    briefPlaceholder: 'What would you like to improve? Tell us about your idea or the challenge you want to solve.',
    contactHint: 'Enter a valid email address or phone number, including your country code if possible.',
    required: 'Fields marked with an asterisk are required.',
    previewMode: 'Request preview mode',
    previewHelp: 'Organize your idea and review a summary here. This preview stays in your browser and does not send your details to the company.',
    previewButton: 'Preview your request',
    whatsappMode: 'Contact us on WhatsApp',
    whatsappHelp: 'Prepare and review your request here, then open it in WhatsApp to contact USB TECH. You will need to press Send in WhatsApp.',
    whatsappPrepare: 'Prepare request for WhatsApp',
    whatsappReview: 'Review your request before opening WhatsApp',
    whatsappNotice: 'Your request has not been sent. Open WhatsApp, review the message and press Send there.',
    whatsappMessageTitle: 'Project request for USB TECH',
    whatsappOpen: 'Open request in WhatsApp',
    whatsappOpenChat: 'Open WhatsApp chat',
    whatsappLongRequest: 'Your request is long. Copy the full text below, then open the chat, paste it and press Send in WhatsApp. No part of your request has been shortened.',
    copyRequest: 'Copy full request text',
    requestCopied: 'The full request text was copied. You can paste it into WhatsApp.',
    copyFailed: 'Automatic copying was unavailable. Select the text below and copy it manually before opening WhatsApp.',
    fullRequest: 'Full request text',
    newTab: 'Opens in a new tab',
    sendButton: 'Send project request',
    loading: 'Sending your request…',
    nameRequired: 'Please enter your name.',
    contactRequired: 'Please enter an email address or phone number.',
    contactInvalid: 'Enter a valid email address or a phone number with 7 to 15 digits.',
    briefRequired: 'Please tell us a little about your project.',
    errorSummary: 'Review the highlighted fields below to complete your request.',
    previewTitle: 'Your request preview',
    previewNotice: 'This request has not been sent. This is a local summary for you to review.',
    successTitle: 'Your request has been received.',
    successMessage: 'Your project request was delivered successfully. Thank you for sharing your idea.',
    errorTitle: 'We could not confirm delivery.',
    errorMessage: 'Your details are still here. Check your connection and try again.',
    notProvided: 'Not provided',
  },
} satisfies Record<Language, Record<string, string>>;

function isValidContact(value: string) {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return true;
  const normalized = value
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 1776))
    .replace(/[\s().-]/g, '');
  return /^\+?\d{7,15}$/.test(normalized);
}

function submissionEndpoint(value: string, pageOrigin: string): string | null {
  try {
    const endpoint = new URL(value.trim(), pageOrigin);
    if (endpoint.username || endpoint.password || endpoint.hash) return null;
    if (endpoint.protocol === 'https:') return endpoint.href;
    const localDevelopment = endpoint.protocol === 'http:'
      && endpoint.origin === pageOrigin
      && ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname);
    return localDevelopment ? endpoint.href : null;
  } catch { return null; }
}

export default function ContactForm({ lang, selectedService, onServiceChange }: ContactFormProps) {
  const [fields, setFields] = useState<Fields>({ name: '', business: '', contact: '', brief: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [summary, setSummary] = useState<RequestSummary | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const t = copy[lang];
  const previewMode = !siteConfig.formEndpoint.trim();
  const whatsappBaseUrl = previewMode ? getWhatsAppUrl(siteConfig.whatsappNumber) : null;
  const loading = status === 'loading';
  const requestText = summary ? [
    t.whatsappMessageTitle,
    `${t.name}: ${summary.name}`,
    ...(summary.business ? [`${t.business}: ${summary.business}`] : []),
    `${t.contact}: ${summary.contact}`,
    `${t.service}: ${services[lang].find(service => service.id === summary.service)?.title ?? summary.service}`,
    `${t.brief}:\n${summary.brief}`,
  ].join('\n\n') : '';
  let whatsappRequestUrl = whatsappBaseUrl;
  let needsManualPaste = false;
  if (whatsappBaseUrl && requestText) {
    try {
      const preparedUrl = `${whatsappBaseUrl}?text=${encodeURIComponent(requestText)}`;
      // Keep mobile handoff links short; longer requests remain complete via copying.
      needsManualPaste = preparedUrl.length > 2000;
      if (!needsManualPaste) whatsappRequestUrl = preparedUrl;
    } catch { needsManualPaste = true; }
  }

  useEffect(() => () => requestRef.current?.abort(), []);
  useEffect(() => {
    if (status === 'preview' || status === 'success' || status === 'error') resultRef.current?.focus();
  }, [status]);
  useEffect(() => {
    if (status === 'preview' && summary?.service !== selectedService) setStatus('idle');
  }, [selectedService, summary?.service, status]);
  useEffect(() => { setCopyStatus('idle'); }, [summary, lang]);

  async function copyRequest() {
    if (!requestText) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(requestText);
      setCopyStatus('copied');
    } catch { setCopyStatus('failed'); }
  }

  function updateField(field: keyof Fields, value: string) {
    setFields(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: undefined }));
    if (status !== 'loading') setStatus('idle');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || requestRef.current) return;
    const trimmed = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, value.trim()])) as Fields;
    const nextErrors: Errors = {};
    if (!trimmed.name) nextErrors.name = 'nameRequired';
    if (!trimmed.contact) nextErrors.contact = 'contactRequired';
    else if (!isValidContact(trimmed.contact)) nextErrors.contact = 'contactInvalid';
    if (!trimmed.brief) nextErrors.brief = 'briefRequired';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus('idle');
      const firstField = Object.keys(nextErrors)[0];
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[name="${firstField}"]`)?.focus());
      return;
    }

    const request = { ...trimmed, service: selectedService };
    setSummary(request);
    if (previewMode) {
      setStatus('preview');
      return;
    }

    const endpoint = submissionEndpoint(siteConfig.formEndpoint, window.location.origin);
    if (!endpoint) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...request, language: lang }),
        signal: controller.signal,
        redirect: 'error',
        referrerPolicy: 'no-referrer',
      });
      if (!response.ok) throw new Error('Request was not accepted');
      const result: unknown = await response.json();
      if (typeof result !== 'object' || result === null || !('success' in result) || result.success !== true) {
        throw new Error('Delivery was not confirmed');
      }
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      window.clearTimeout(timeout);
      requestRef.current = null;
    }
  }

  const describedBy = (field: keyof Fields, hint?: string) => [hint, errors[field] ? `${field}-error` : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="contact-form-card">
      {previewMode && <div className="form-preview-intro"><span className="form-mode-badge"><span aria-hidden="true">◉</span>{whatsappBaseUrl ? t.whatsappMode : t.previewMode}</span><p id="form-preview-help">{whatsappBaseUrl ? t.whatsappHelp : t.previewHelp}</p></div>}
      <form id="project-form" ref={formRef} onSubmit={submit} noValidate aria-busy={loading} aria-describedby={previewMode ? 'form-preview-help form-required-note' : 'form-required-note'}>
        <p className="form-required-note" id="form-required-note">{t.required}</p>
        {Object.values(errors).some(Boolean) && <p className="form-error-summary" role="alert">{t.errorSummary}</p>}
        <div className="contact-field-row">
          <div className="contact-field">
            <label htmlFor="contact-name">{t.name}<span aria-hidden="true"> *</span></label>
            <input id="contact-name" name="name" autoComplete="name" value={fields.name} onChange={event => updateField('name', event.target.value)} placeholder={t.namePlaceholder} required maxLength={100} aria-invalid={Boolean(errors.name)} aria-describedby={describedBy('name')} readOnly={loading} />
            {errors.name && <span className="field-error" id="name-error">{t[errors.name]}</span>}
          </div>
          <div className="contact-field">
            <label htmlFor="contact-business">{t.business}<span className="field-optional"> ({t.optional})</span></label>
            <input id="contact-business" name="business" autoComplete="organization" value={fields.business} onChange={event => updateField('business', event.target.value)} placeholder={t.businessPlaceholder} maxLength={120} readOnly={loading} />
          </div>
        </div>
        <div className="contact-field">
          <label htmlFor="contact-details">{t.contact}<span aria-hidden="true"> *</span></label>
          <input id="contact-details" name="contact" type="text" dir="auto" value={fields.contact} onChange={event => updateField('contact', event.target.value)} placeholder={t.contactPlaceholder} required maxLength={254} aria-invalid={Boolean(errors.contact)} aria-describedby={describedBy('contact', 'contact-hint')} readOnly={loading} />
          <span className="field-hint" id="contact-hint">{t.contactHint}</span>
          {errors.contact && <span className="field-error" id="contact-error">{t[errors.contact]}</span>}
        </div>
        <div className="contact-field">
          <label htmlFor="contact-service">{t.service}<span aria-hidden="true"> *</span></label>
          <select id="contact-service" name="service" value={selectedService} onChange={event => { onServiceChange(event.target.value as ServiceId); setStatus('idle'); }} required disabled={loading}>
            {services[lang].map(service => <option key={service.id} value={service.id}>{service.title}</option>)}
          </select>
        </div>
        <div className="contact-field">
          <label htmlFor="contact-brief">{t.brief}<span aria-hidden="true"> *</span></label>
          <textarea id="contact-brief" name="brief" rows={5} value={fields.brief} onChange={event => updateField('brief', event.target.value)} placeholder={t.briefPlaceholder} required maxLength={4000} aria-invalid={Boolean(errors.brief)} aria-describedby={describedBy('brief')} readOnly={loading} />
          {errors.brief && <span className="field-error" id="brief-error">{t[errors.brief]}</span>}
        </div>
        <button className="form-submit" type="submit" disabled={loading}>
          {loading && <span className="form-spinner" aria-hidden="true"/>}
          <span>{loading ? t.loading : whatsappBaseUrl ? t.whatsappPrepare : previewMode ? t.previewButton : t.sendButton}</span>
          {!loading && <span className="form-submit-arrow" aria-hidden="true">{lang === 'ar' ? '←' : '→'}</span>}
        </button>
        <div className="form-announcer" role="status" aria-live="polite">{loading ? t.loading : ''}</div>
      </form>
      {status === 'preview' && summary && <div className="form-result form-preview-result" ref={resultRef} tabIndex={-1} role="status">
        <h3>{whatsappBaseUrl ? t.whatsappReview : t.previewTitle}</h3><p className="preview-not-sent">{whatsappBaseUrl ? t.whatsappNotice : t.previewNotice}</p>
        <dl className="request-summary">
          <div><dt>{t.name}</dt><dd dir="auto">{summary.name}</dd></div>
          <div><dt>{t.business}</dt><dd dir="auto">{summary.business || t.notProvided}</dd></div>
          <div><dt>{t.contact}</dt><dd dir="auto">{summary.contact}</dd></div>
          <div><dt>{t.service}</dt><dd>{services[lang].find(service => service.id === summary.service)?.title}</dd></div>
          <div className="summary-brief"><dt>{t.brief}</dt><dd dir="auto">{summary.brief}</dd></div>
        </dl>
        {whatsappRequestUrl && <div className="whatsapp-handoff">
          {needsManualPaste && <p className="whatsapp-long-request">{t.whatsappLongRequest}</p>}
          <div className="whatsapp-handoff-actions">
            {needsManualPaste && <button className="request-copy-button" type="button" onClick={copyRequest}>{t.copyRequest}</button>}
            <a className="whatsapp-request-link" href={whatsappRequestUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer"><span>{needsManualPaste ? t.whatsappOpenChat : t.whatsappOpen}</span><span aria-hidden="true">↗</span><span className="form-announcer"> — {t.newTab}</span></a>
            {!needsManualPaste && <button className="request-copy-button" type="button" onClick={copyRequest}>{t.copyRequest}</button>}
          </div>
          <p className="request-copy-status" role="status">{copyStatus === 'copied' ? t.requestCopied : copyStatus === 'failed' ? t.copyFailed : ''}</p>
          {(needsManualPaste || copyStatus === 'failed') && <label className="request-copy-fallback"><span>{t.fullRequest}</span><textarea value={requestText} readOnly rows={6} onFocus={event => event.currentTarget.select()} /></label>}
        </div>}
      </div>}
      {status === 'success' && <div className="form-result form-success-result" ref={resultRef} tabIndex={-1} role="status"><h3>{t.successTitle}</h3><p>{t.successMessage}</p></div>}
      {status === 'error' && <div className="form-result form-failure-result" ref={resultRef} tabIndex={-1} role="alert"><h3>{t.errorTitle}</h3><p>{t.errorMessage}</p></div>}
    </div>
  );
}
