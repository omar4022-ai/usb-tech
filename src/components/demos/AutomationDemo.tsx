import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import type { Language } from '../../content';
import { storeProducts, formatStoreMoney, getStoreUnitPrice } from './store-catalog';
import { createRetailState, getRetailProduct, retailTotal, retailTransition, type RetailEvent, type RetailMessage, type RetailStep } from './retail-assistant';
import './automation-demo.css';
export { interpretRetailMessage } from './retail-assistant';

const copy = {
  ar: {
    brand: 'USB SELECT', subtitle: 'مساعد التسوّق', conversation: 'المحادثة', summary: 'ملخص الاختيار', reset: 'ابدأ من جديد', assistant: 'مساعد المتجر', customer: 'أنت', local: 'معاينة محلية',
    welcome: 'أهلًا بك 👋 اختر منتجًا، أو اسألني عن سعره وتوفّره.', catalog: 'هذه كل المنتجات. أي منتج يناسبك؟', choose: 'أي منتج تقصد؟ اختر بطاقة أدناه، أو اكتب اسمه.',
    all: 'عرض كل المنتجات', different: 'اختر منتجًا آخر', continue: 'أكمل الاختيار', back: 'ارجع', price: 'كم سعره؟', availability: 'هل هو متوفر؟', handoff: 'التحدث مع موظف',
    selected: 'هذا اختيارك مع السعر والتوفّر من كتالوج المتجر. هل نكمل تفاصيله؟', configure: 'تمام، نجهّز اختيارك خطوة بخطوة.', updated: 'تم تحديث اختيارك. السعر أدناه يعكس التفاصيل الجديدة.', quantityUpdated: 'تم تحديث الكمية والإجمالي. أكّد الكمية للمتابعة.', quantityDone: 'تم تثبيت الكمية. كيف تفضّل استلامه؟',
    inStock: 'متوفر', outOfStock: 'نفد المخزون', availableUnits: 'قطعة متاحة في الكتالوج', soldOut: 'هذا المنتج غير متوفر حاليًا في الكتالوج. يمكنك الاطلاع على بديل؛ لن نجهّز طلبًا له.',
    unit: 'سعر القطعة', total: 'إجمالي المنتجات', current: 'اختيارك الحالي', from: 'من',
    steps: { browse: 'اختر منتجك', product: 'نبدأ بهذا المنتج؟', storage: 'أي سعة تناسبك؟', color: 'اختر اللون', quantity: 'كم قطعة تحتاج؟', fulfillment: 'كيف تستلمه؟', details: 'بيانات المعاينة', review: 'راجع اختيارك' },
    storage: 'السعة', color: 'اللون', quantity: 'الكمية', fulfillment: 'طريقة الاستلام', details: 'بيانات التواصل', storageHint: 'السعر الموضح هو سعر قطعة واحدة لكل سعة.', colorHint: 'هذه الألوان المتاحة في الكتالوج لهذا المنتج.', quantityHint: 'اختر عددًا صحيحًا ضمن المخزون المتاح.', quantityConfirm: 'تأكيد الكمية', minus: 'تقليل الكمية', plus: 'زيادة الكمية',
    delivery: 'توصيل', pickup: 'استلام من المتجر', deliveryHint: 'أضف المدينة في الخطوة التالية.', pickupHint: 'لا تحتاج إلى عنوان توصيل.', deliveryInfo: 'يمكنك اختيار التوصيل عند تجهيز الطلب. تكلفة التوصيل وموعده غير محددين هنا، فلا نضيف رسومًا إلى السعر.', pickupInfo: 'يمكنك اختيار الاستلام من المتجر عند تجهيز الطلب. مكان وموعد الاستلام يُحددان خارج هذه المعاينة.', deliverySelected: 'اخترت التوصيل. أضف اسمًا ووسيلة تواصل ومدينة للمعاينة؛ رسوم التوصيل غير محسوبة.', pickupSelected: 'اخترت الاستلام من المتجر. نحتاج اسمًا ووسيلة تواصل للمعاينة.',
    name: 'الاسم', contact: 'هاتف أو بريد إلكتروني', city: 'المدينة', detailsHint: 'يمكنك استخدام بيانات توضيحية؛ تبقى داخل هذه الجلسة.', reviewButton: 'راجع الملخص', review: 'الاختيار جاهز للمراجعة. يمكنك تعديل أي تفصيل قبل حفظ المعاينة.', confirm: 'حفظ معاينة الطلب', confirmed: 'حُفظت المعاينة في هذه الجلسة. لم يُرسل طلب ولم تُنفّذ عملية دفع.', saved: 'معاينة محفوظة محليًا', draft: 'اختيار قيد التجهيز', edit: 'تعديل', notChosen: 'لم يُحدد بعد', notCalculated: 'غير محسوبة', shippingCost: 'رسوم التوصيل',
    handoffMessage: 'لا يوجد موظف متصل في هذه التجربة. جهّزت لك ملخص متابعة محليًا يمكنك مراجعته أو تنزيله؛ لم تُرسل المحادثة لأي شخص.', handoffTitle: 'ملخص متابعة محلي', handoffEmpty: 'لم يُحدد منتج بعد. يمكنك متابعة الاستفسار أو اختيار منتج.', showSummary: 'اعرض الملخص', download: 'تنزيل الملخص', resume: 'تابع المحادثة', empty: 'لم تختر منتجًا بعد.', emptyHint: 'ابدأ من بطاقات المنتجات أو اسأل عن سعر منتج بالاسم.',
    backMessage: 'رجعنا خطوة. اختيارك محفوظ وتظهر تفاصيله الحالية أدناه.', editMessage: 'يمكنك تعديل هذه الخطوة. احتفظنا ببقية تفاصيل اختيارك.', finishStep: 'أكمل الاختيار الموضح أدناه ثم تابع. يمكنك أيضًا كتابة سؤال عن السعر أو التوفر.',
    fallback: 'لم أفهم المقصود بعد. جرّب «قداش الآيفون؟» أو «هل السماعات متوفرة؟»، أو استخدم الأزرار أدناه.', unsupported: 'هذا الخيار غير موجود في كتالوج المنتج. لم نعتمده؛ اختر من الخيارات المتاحة أدناه.', invalidQuantity: 'هذه الكمية غير متاحة. أبقينا آخر كمية صحيحة؛ اختر عددًا من 1 إلى المخزون المتاح.',
    errors: { quantity: 'أدخل عددًا صحيحًا من 1 إلى المخزون المتاح.', stock: 'المنتج غير متوفر؛ اختر بديلًا.', storage: 'السعة المطلوبة غير متاحة. اختر إحدى السعات المعروضة.', color: 'اللون المطلوب غير متاح لهذا المنتج. اختر من الألوان المعروضة أو منتجًا آخر.', name: 'أدخل اسمًا من حرفين على الأقل.', contact: 'أدخل بريدًا صحيحًا أو رقم هاتف من 7 إلى 15 رقمًا.', city: 'أدخل اسم المدينة من حرفين على الأقل.', incomplete: 'أكمل الكمية وطريقة الاستلام والبيانات أولًا.' },
    previous: 'الرسائل السابقة', input: 'اكتب رسالتك', placeholder: 'اسأل عن منتج أو سعره…', send: 'إرسال داخل المعاينة', moreActions: 'خيارات المحادثة', note: 'معاينة محلية بمسارات رد محددة، وليست ذكاءً اصطناعيًا. الأسعار والمخزون توضيحية. لا إرسال أو دفع أو حجز فعلي.',
    selectUser: 'أختار', storageUser: 'السعة:', colorUser: 'اللون:', quantityUser: 'الكمية:', detailsUser: 'أضفت بيانات المعاينة.', confirmUser: 'احفظ معاينة الطلب.', editUser: 'أريد تعديل', step: 'الخطوة', of: 'من', ready: 'جاهز للمراجعة',
  },
  en: {
    brand: 'USB SELECT', subtitle: 'Shopping assistant', conversation: 'Conversation', summary: 'Your selection', reset: 'Start again', assistant: 'Store assistant', customer: 'You', local: 'Local preview',
    welcome: 'Welcome 👋 Pick a product, or ask about its price and availability.', catalog: 'Here is the full collection. What would you like?', choose: 'Which product do you mean? Choose a card below or type its name.',
    all: 'Show all products', different: 'Choose another product', continue: 'Continue selection', back: 'Go back', price: 'How much is it?', availability: 'Is it in stock?', handoff: 'Talk to a person',
    selected: 'Here is your selection, with its catalog price and availability. Shall we choose the details?', configure: 'Let’s put your selection together, one step at a time.', updated: 'Your selection is updated. The price below reflects the new details.', quantityUpdated: 'Quantity and total updated. Confirm the quantity to continue.', quantityDone: 'Quantity confirmed. How would you like to receive it?',
    inStock: 'In stock', outOfStock: 'Out of stock', availableUnits: 'units available in the catalog', soldOut: 'This product is currently out of stock in the catalog. Choose an alternative; we cannot prepare an order for it.',
    unit: 'Unit price', total: 'Product total', current: 'Your current selection', from: 'From',
    steps: { browse: 'Pick your product', product: 'Start with this product?', storage: 'Which storage size?', color: 'Choose a finish', quantity: 'How many do you need?', fulfillment: 'How will you receive it?', details: 'Preview details', review: 'Review your selection' },
    storage: 'Storage', color: 'Finish', quantity: 'Quantity', fulfillment: 'Receive your order', details: 'Contact details', storageHint: 'Each option shows the price for one unit.', colorHint: 'These are the finishes listed for this product.', quantityHint: 'Choose a whole number within the available stock.', quantityConfirm: 'Confirm quantity', minus: 'Decrease quantity', plus: 'Increase quantity',
    delivery: 'Delivery', pickup: 'Store pickup', deliveryHint: 'Add your city in the next step.', pickupHint: 'No delivery address needed.', deliveryInfo: 'You can choose delivery when preparing your order. Delivery fees and times are not defined here, so no fee is added to the price.', pickupInfo: 'You can choose store pickup when preparing your order. The pickup location and time are arranged outside this preview.', deliverySelected: 'Delivery selected. Add a name, contact detail, and city for the preview. Delivery fees are not calculated.', pickupSelected: 'Store pickup selected. Add a name and contact detail for the preview.',
    name: 'Name', contact: 'Phone or email', city: 'City', detailsHint: 'Sample details are fine. They stay in this session.', reviewButton: 'Review selection', review: 'Your selection is ready to review. Edit any detail before saving the preview.', confirm: 'Save order preview', confirmed: 'Preview saved for this session. No order was sent and no payment was made.', saved: 'Preview saved locally', draft: 'Selection in progress', edit: 'Edit', notChosen: 'Not selected yet', notCalculated: 'Not calculated', shippingCost: 'Delivery fee',
    handoffMessage: 'No staff member is connected to this demo. A local follow-up summary is ready to review or download. This conversation was not sent to anyone.', handoffTitle: 'Local follow-up summary', handoffEmpty: 'No product selected yet. Continue asking or choose a product.', showSummary: 'View summary', download: 'Download summary', resume: 'Continue conversation', empty: 'No product selected yet.', emptyHint: 'Start with a product card or ask for a product’s price by name.',
    backMessage: 'We went back one step. Your selection is saved, with its current details below.', editMessage: 'You can edit this step. The rest of your selection has been kept.', finishStep: 'Complete the step below to continue. You can also ask about the price or availability.',
    fallback: 'I haven’t understood that yet. Try “iPhone price” or “Are the headphones available?”, or use the buttons below.', unsupported: 'That option is not in this product’s catalog, so it was not applied. Choose an available option below.', invalidQuantity: 'That quantity is unavailable. Your last valid quantity was kept. Choose between 1 and the available stock.',
    errors: { quantity: 'Enter a whole number between 1 and the available stock.', stock: 'This product is out of stock. Choose an alternative.', storage: 'That storage size is unavailable. Choose one of the listed sizes.', color: 'That finish is unavailable for this product. Choose a listed finish or another product.', name: 'Enter a name of at least two characters.', contact: 'Enter a valid email or a phone number with 7–15 digits.', city: 'Enter a city name of at least two characters.', incomplete: 'Complete quantity, delivery method, and contact details first.' },
    previous: 'Earlier messages', input: 'Type your message', placeholder: 'Ask about a product or price…', send: 'Send within preview', moreActions: 'Conversation options', note: 'Local preview with predefined replies, not AI. Prices and stock are illustrative. No real messages, payments, or reservations.',
    selectUser: 'I choose', storageUser: 'Storage:', colorUser: 'Finish:', quantityUser: 'Quantity:', detailsUser: 'I added the preview details.', confirmUser: 'Save the order preview.', editUser: 'I want to edit', step: 'Step', of: 'of', ready: 'Ready to review',
  },
};

function Icon({ name = 'arrow' }: { name?: 'arrow' | 'chat' | 'reset' | 'check' | 'cart' | 'download' }) {
  const paths = { arrow: 'M5 12h14m-6-6 6 6-6 6', chat: 'M4 4h16v12H9l-5 4V4Zm4 5h8m-8 3h5', reset: 'M3 10a9 9 0 1 1 2 8M3 4v6h6', check: 'm5 12 4 4L19 6', cart: 'M3 3h2l3 12h10l3-9H6M9 20h.01M17 20h.01', download: 'M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5' };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

export default function AutomationDemo({ lang }: { lang: Language }) {
  const t = copy[lang];
  const uid = useId();
  const [state, setState] = useState(createRetailState);
  const [page, setPage] = useState<'conversation' | 'summary'>('conversation');
  const [input, setInput] = useState('');
  const [quantityDraft, setQuantityDraft] = useState('1');
  const [detailsDraft, setDetailsDraft] = useState(state.details);
  const [quickOpen, setQuickOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLElement>(null);
  const replyRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLHeadingElement>(null);
  const scrollIntent = useRef<'step' | 'reply' | null>(null);
  const quickMenuRef = useRef<HTMLDivElement>(null);
  const quickToggleRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const initialized = useRef(false);
  const product = getRetailProduct(state.selection);
  const selection = state.selection;
  const unitPrice = product && selection ? getStoreUnitPrice(product, selection.storage) : 0;
  const total = retailTotal(selection);
  const color = product?.variants?.colors?.find(option => option.value === selection?.color);
  const storage = product?.variants?.storage?.find(option => option.value === selection?.storage);
  const money = (value: number) => formatStoreMoney(value, lang);
  const route: RetailStep[] = ['product', ...(product?.variants?.storage?.length ? ['storage' as const] : []), ...(product?.variants?.colors?.length ? ['color' as const] : []), 'quantity', 'fulfillment', 'details', 'review'];

  useEffect(() => { setQuantityDraft(String(state.selection?.quantity || 1)); }, [state.selection?.quantity, state.selection?.productId]);
  useEffect(() => { setDetailsDraft(state.details); }, [state.details]);
  useEffect(() => {
    if (!quickOpen) return;
    const frame = window.requestAnimationFrame(() => quickMenuRef.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [quickOpen]);
  useEffect(() => { rootRef.current?.closest('.demo-stage')?.scrollTo({ top: 0, behavior: 'auto' }); headingRef.current?.focus({ preventScroll: true }); }, [page]);
  useEffect(() => {
    if (!initialized.current) { initialized.current = true; return; }
    if (page !== 'conversation') return;
    const intent = scrollIntent.current;
    const stage = rootRef.current?.closest('.demo-stage');
    const target = intent === 'step' ? activeRef.current : intent === 'reply' ? replyRef.current : null;
    scrollIntent.current = null;
    if (!stage || !target) return;
    const bounds = target.getBoundingClientRect(); const stageBounds = stage.getBoundingClientRect();
    // Guided actions reveal the active question; typed questions reveal their answer.
    // Focus a heading, never an input, so choosing an option cannot open the phone keyboard.
    if (intent === 'step') questionRef.current?.focus({ preventScroll: true });
    stage.scrollTo({ top: Math.max(0, bounds.top - stageBounds.top + stage.scrollTop - 10), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [state.messages.length, state.step, state.error, page]);

  function send(event: RetailEvent) {
    scrollIntent.current = event.type === 'quantity' ? null : event.type === 'text' || event.type === 'ask' ? 'reply' : 'step';
    if (event.type !== 'quantity') setQuickOpen(false);
    setState(current => retailTransition(current, event));
  }
  function closeQuickActions() { setQuickOpen(false); quickToggleRef.current?.focus({ preventScroll: true }); }
  function quickAction(event: RetailEvent) {
    if (quickOpen && event.type === 'ask') quickToggleRef.current?.focus({ preventScroll: true });
    send(event);
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!input.trim()) return; send({ type: 'text', text: input }); setInput(''); }
  function reset() { send({ type: 'reset' }); setInput(''); setDetailsDraft({ name: '', contact: '', city: '' }); setQuantityDraft('1'); setPage('conversation'); }
  function edit(step: RetailStep) { send({ type: 'edit', step }); setPage('conversation'); }
  function resume() { scrollIntent.current = 'step'; setPage('conversation'); }
  function parseQuantity(value: string) { const digits = value.trim().replace(/[٠-٩]/g, char => String('٠١٢٣٤٥٦٧٨٩'.indexOf(char))).replace(/[۰-۹]/g, char => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(char))); return /^\d+$/.test(digits) ? Number(digits) : NaN; }
  function confirmQuantity() { send({ type: 'quantity', value: parseQuantity(quantityDraft) }); send({ type: 'confirmQuantity' }); }
  function download() {
    const data = { previewOnly: true, sent: false, status: state.saved ? 'saved-local-preview' : 'draft', followUpRequestedLocally: state.handoff, product: product ? { id: product.id, name: product.name[lang], storage: selection?.storage, color: selection?.color, quantity: selection?.quantity, unitPrice, productTotal: total, currency: 'LYD' } : null, fulfillment: state.fulfillment, deliveryFee: null, details: state.details };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = 'usb-select-preview.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function messageText(message: RetailMessage): string {
    if (message.text) return message.text;
    const messageProduct = getRetailProduct(message.selection || null);
    if (message.role === 'customer') {
      const labels: Record<string, string> = { catalog: t.all, continue: t.continue, back: t.back, price: t.price, availability: t.availability, handoff: t.handoff, delivery: t.delivery, pickup: t.pickup, details: t.detailsUser, confirm: t.confirmUser };
      if (message.kind === 'select') return `${t.selectUser} ${storeProducts.find(item => item.id === message.value)?.name[lang] || ''}`;
      if (message.kind === 'quantity') return `${t.quantityUser} ${message.value}`;
      if (message.kind === 'storage') return `${t.storageUser} ${messageProduct?.variants?.storage?.find(option => option.value === message.value)?.label || message.value}`;
      if (message.kind === 'color') return `${t.colorUser} ${messageProduct?.variants?.colors?.find(option => option.value === message.value)?.label[lang] || message.value}`;
      if (message.kind === 'edit') return `${t.editUser} ${t.steps[message.value as RetailStep]}`;
      return labels[message.kind] || '';
    }
    if (message.kind === 'price' && messageProduct && message.selection) {
      const price = getStoreUnitPrice(messageProduct, message.selection.storage); const size = messageProduct.variants?.storage?.find(option => option.value === message.selection?.storage)?.label;
      return `${messageProduct.name[lang]}${size ? ` · ${size}` : ''}\n${t.unit}: ${money(price)}${message.selection.quantity > 1 ? `\n${t.total}: ${money(price * message.selection.quantity)} (${message.selection.quantity})` : ''}`;
    }
    if (message.kind === 'availability' && messageProduct) return `${messageProduct.name[lang]}: ${messageProduct.stock ? `${t.inStock} — ${messageProduct.stock} ${t.availableUnits}.` : t.outOfStock}`;
    const labels: Record<string, string> = { welcome: t.welcome, catalog: t.catalog, choose: t.choose, selected: t.selected, configure: t.configure, updated: t.updated, quantityUpdated: t.quantityUpdated, quantity: t.quantityDone, outOfStock: t.soldOut, invalidQuantity: t.invalidQuantity, deliveryInfo: t.deliveryInfo, pickupInfo: t.pickupInfo, delivery: t.deliverySelected, pickup: t.pickupSelected, review: t.review, saved: t.confirmed, handoff: t.handoffMessage, back: t.backMessage, edit: t.editMessage, finishStep: t.finishStep, fallback: t.fallback, unsupported: t.unsupported };
    return labels[message.kind] || t.fallback;
  }
  function messageBubble(message: RetailMessage, index: number) { return <div className={`ra-message ra-message-${message.role}`} ref={index === state.messages.length - 1 ? replyRef : undefined} key={index}><span className="ra-speaker">{message.role === 'assistant' ? t.assistant : t.customer}</span><p>{messageText(message)}</p></div>; }
  function productCards() {
    return <><div className="ra-products">{(state.allProducts ? storeProducts : storeProducts.slice(0, 3)).map(item => <button type="button" className="ra-product-card" key={item.id} onClick={() => send({ type: 'select', productId: item.id })}><img src={item.image} alt="" loading="lazy" /><span className="ra-product-copy"><strong>{item.name[lang]}</strong><span>{item.variants?.storage?.length ? `${t.from} ` : ''}{money(item.price)}</span><small className={item.stock ? 'ra-stock' : ''}>{item.stock ? t.inStock : t.outOfStock}</small></span><Icon /></button>)}</div>{!state.allProducts && <button className="ra-text-button" onClick={() => send({ type: 'catalog' })}>{t.all} <Icon /></button>}</>;
  }
  function context() {
    if (!product || !selection) return null;
    return <div className="ra-context"><img src={color?.image || product.image} alt="" /><div><small>{t.current}</small><strong>{product.name[lang]}</strong><span>{[storage?.label, color?.label[lang], `${selection.quantity} × ${money(unitPrice)}`].filter(Boolean).join(' · ')}</span></div><b aria-live="polite">{money(total)}</b></div>;
  }
  function editButton(step: RetailStep, label: string) { return <button type="button" className="ra-edit" aria-label={`${t.edit} ${label}`} onClick={() => edit(step)}>{t.edit}</button>; }
  function summaryCard() {
    if (!product || !selection) return <div className="ra-empty"><Icon name="cart" /><h3>{t.empty}</h3><p>{t.emptyHint}</p><button className="ra-primary" onClick={() => { send({ type: 'catalog' }); setPage('conversation'); }}>{t.all}</button></div>;
    return <div className="ra-review"><div className="ra-review-product"><img src={color?.image || product.image} alt="" /><div><small>{state.saved ? t.saved : state.step === 'review' ? t.ready : t.draft}</small><h3>{product.name[lang]}</h3><span>{product.stock ? t.inStock : t.outOfStock}</span></div>{editButton('browse', t.steps.browse)}</div><dl>
      {storage && <div><dt>{t.storage}</dt><dd>{storage.label}</dd>{editButton('storage', t.storage)}</div>}{color && <div><dt>{t.color}</dt><dd>{color.label[lang]}</dd>{editButton('color', t.color)}</div>}
      <div><dt>{t.quantity}</dt><dd>{selection.quantity}</dd>{editButton('quantity', t.quantity)}</div><div><dt>{t.unit}</dt><dd>{money(unitPrice)}</dd></div>
      <div><dt>{t.fulfillment}</dt><dd>{state.fulfillment ? t[state.fulfillment] : t.notChosen}</dd>{editButton('fulfillment', t.fulfillment)}</div>{state.fulfillment === 'delivery' && <div><dt>{t.shippingCost}</dt><dd>{t.notCalculated}</dd></div>}
      <div><dt>{t.name}</dt><dd>{state.details.name || t.notChosen}</dd>{editButton('details', t.details)}</div>{state.details.contact && <div><dt>{t.contact}</dt><dd dir="auto">{state.details.contact}</dd></div>}{state.fulfillment === 'delivery' && <div><dt>{t.city}</dt><dd>{state.details.city || t.notChosen}</dd></div>}
      <div className="ra-total"><dt>{t.total}</dt><dd>{money(total)}</dd></div></dl></div>;
  }
  function stageContent() {
    if (state.step === 'browse' || !product || !selection) return productCards();
    if (state.step === 'product') return <><p className="ra-product-description">{product.description[lang]}</p><div className="ra-stock-line"><span className={product.stock ? 'ra-stock' : ''}>{product.stock ? `${t.inStock} · ${product.stock} ${t.availableUnits}` : t.outOfStock}</span></div><div className="ra-actions"><button className="ra-primary" disabled={!product.stock} onClick={() => send({ type: 'continue' })}>{t.continue}<Icon /></button><button className="ra-secondary" onClick={() => send({ type: 'ask', intent: 'price' })}>{t.price}</button><button className="ra-secondary" onClick={() => send({ type: 'ask', intent: 'availability' })}>{t.availability}</button></div>{!product.stock && <button className="ra-text-button" onClick={() => send({ type: 'catalog' })}>{t.different}<Icon /></button>}</>;
    if (state.step === 'storage') return <><p className="ra-hint">{t.storageHint}</p><div className="ra-options ra-storage-options">{product.variants?.storage?.map(option => <button className="ra-option" aria-pressed={selection.storage === option.value} key={option.value} onClick={() => send({ type: 'storage', value: option.value })}><strong dir="ltr">{option.label}</strong><span>{money(getStoreUnitPrice(product, option.value))}</span><Icon /></button>)}</div></>;
    if (state.step === 'color') return <><p className="ra-hint">{t.colorHint}</p><div className="ra-options ra-color-options">{product.variants?.colors?.map(option => <button className="ra-option" aria-pressed={selection.color === option.value} key={option.value} onClick={() => send({ type: 'color', value: option.value })}><span className="ra-swatch" style={{ backgroundColor: option.swatch }} /><strong>{option.label[lang]}</strong><Icon /></button>)}</div></>;
    if (state.step === 'quantity') return <><p className="ra-hint">{t.quantityHint} <b>{product.stock} {t.availableUnits}</b></p><label className="ra-sr-only" htmlFor={`${uid}-quantity`}>{t.quantity}</label><div className="ra-quantity"><button type="button" aria-label={t.minus} disabled={selection.quantity <= 1} onClick={() => { send({ type: 'quantity', value: selection.quantity - 1 }); setQuantityDraft(String(selection.quantity - 1)); }}>−</button><input id={`${uid}-quantity`} inputMode="numeric" type="text" pattern="[0-9٠-٩۰-۹]*" value={quantityDraft} aria-invalid={state.error === 'quantity'} aria-describedby={state.error === 'quantity' ? `${uid}-error` : undefined} onChange={event => { setQuantityDraft(event.target.value); send({ type: 'quantity', value: parseQuantity(event.target.value) }); }} /><button type="button" aria-label={t.plus} disabled={selection.quantity >= product.stock} onClick={() => { send({ type: 'quantity', value: selection.quantity + 1 }); setQuantityDraft(String(selection.quantity + 1)); }}>+</button></div><button className="ra-primary" onClick={confirmQuantity}>{t.quantityConfirm}<Icon /></button></>;
    if (state.step === 'fulfillment') return <div className="ra-options ra-fulfillment"><button className="ra-option" aria-pressed={state.fulfillment === 'delivery'} onClick={() => send({ type: 'fulfillment', value: 'delivery' })}><strong>{t.delivery}</strong><span>{t.deliveryHint}</span><Icon /></button><button className="ra-option" aria-pressed={state.fulfillment === 'pickup'} onClick={() => send({ type: 'fulfillment', value: 'pickup' })}><strong>{t.pickup}</strong><span>{t.pickupHint}</span><Icon /></button></div>;
    if (state.step === 'details') return <form className="ra-details-form" noValidate onSubmit={event => { event.preventDefault(); send({ type: 'details', value: detailsDraft }); }}><p className="ra-hint">{t.detailsHint}</p>{(['name', 'contact', ...(state.fulfillment === 'delivery' ? ['city' as const] : [])] as const).map(field => <label key={field} htmlFor={`${uid}-${field}`}>{t[field]}<input id={`${uid}-${field}`} name={field} type="text" autoComplete={field === 'name' ? 'name' : field === 'city' ? 'address-level2' : 'off'} dir="auto" maxLength={field === 'contact' ? 120 : 80} value={detailsDraft[field]} aria-invalid={state.error === field} aria-describedby={state.error === field ? `${uid}-error` : undefined} onChange={event => setDetailsDraft(current => ({ ...current, [field]: event.target.value }))} required /></label>)}<button className="ra-primary" type="submit">{t.reviewButton}<Icon /></button></form>;
    return <>{summaryCard()}{state.saved ? <div className="ra-success" role="status"><Icon name="check" /><p>{t.confirmed}</p></div> : <button className="ra-primary ra-confirm" onClick={() => send({ type: 'confirm' })}>{t.confirm}<Icon name="check" /></button>}<button className="ra-text-button" onClick={download}><Icon name="download" />{t.download}</button></>;
  }
  const recent = state.messages.slice(-4); const earlier = state.messages.slice(0, -4); const lastReply = state.messages[state.messages.length - 1]?.kind;
  return <div className="retail-assistant" dir={lang === 'ar' ? 'rtl' : 'ltr'} ref={rootRef}>
    <header className="ra-header"><div className="ra-brand"><span className="ra-brand-icon"><Icon name="cart" /></span><div><strong>{t.brand}</strong><span>{t.subtitle}</span></div></div><button className="ra-reset" onClick={reset}><Icon name="reset" /><span>{t.reset}</span></button></header>
    <nav className="ra-nav" aria-label={t.subtitle}><button aria-current={page === 'conversation' ? 'page' : undefined} onClick={resume}><Icon name="chat" />{t.conversation}</button><button aria-current={page === 'summary' ? 'page' : undefined} onClick={() => setPage('summary')}><Icon name="cart" />{t.summary}{selection && <span className="ra-count">1</span>}</button></nav>
    {page === 'conversation' ? <div className="ra-conversation"><h2 className="ra-sr-only" tabIndex={-1} ref={headingRef}>{t.conversation}</h2><div className="ra-history">{earlier.length > 0 && <details className="ra-earlier"><summary>{t.previous} <span>{earlier.length}</span></summary><div>{earlier.map(messageBubble)}</div></details>}<div className="ra-recent" role="log" aria-live="polite" aria-relevant="additions text" aria-label={t.conversation}>{recent.map((message, index) => messageBubble(message, earlier.length + index))}</div></div>
      {lastReply === 'handoff' && <aside className="ra-handoff"><strong>{t.handoffTitle}</strong><p>{product ? `${product.name[lang]} · ${money(total)}` : t.handoffEmpty}</p><div className="ra-actions"><button className="ra-secondary" onClick={() => setPage('summary')}>{t.showSummary}</button><button className="ra-secondary" onClick={download}>{t.download}</button></div></aside>}
      <section className="ra-active-step" ref={activeRef} aria-labelledby={`${uid}-step`}><div className="ra-step-heading"><div>{state.step !== 'browse' && <small>{t.step} {Math.max(1, route.indexOf(state.step) + 1)} {t.of} {route.length}</small>}<h3 id={`${uid}-step`} tabIndex={-1} ref={questionRef}>{t.steps[state.step]}</h3></div>{state.step !== 'browse' && <button className="ra-back" onClick={() => send({ type: 'back' })}>{t.back}</button>}</div>{state.step !== 'browse' && state.step !== 'review' && context()}{state.error && <p className="ra-error" id={`${uid}-error`} role="alert">{t.errors[state.error]}</p>}{stageContent()}</section>
      <div className="ra-compose" onKeyDown={event => { if (quickOpen && event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeQuickActions(); } }}><div ref={quickMenuRef} className={`ra-quick${quickOpen ? ' ra-quick-open' : ''}`} id={`${uid}-quick`}>{state.step !== 'browse' && <button onClick={() => quickAction({ type: 'catalog' })}>{t.all}</button>}{selection && state.step !== 'product' && <button onClick={() => quickAction({ type: 'ask', intent: 'price' })}>{t.price}</button>}<button onClick={() => quickAction({ type: 'ask', intent: 'handoff' })}>{t.handoff}</button></div><form onSubmit={submit}><button type="button" className="ra-tools-toggle" ref={quickToggleRef} aria-label={t.moreActions} aria-expanded={quickOpen} aria-controls={`${uid}-quick`} onClick={() => setQuickOpen(current => !current)}><span aria-hidden="true">⋯</span></button><label className="ra-sr-only" htmlFor={`${uid}-message`}>{t.input}</label><input id={`${uid}-message`} value={input} maxLength={500} onChange={event => setInput(event.target.value)} placeholder={t.placeholder} autoComplete="off" enterKeyHint="send" /><button type="submit" aria-label={t.send} disabled={!input.trim()}><Icon /></button></form></div>
    </div> : <section className="ra-summary-page"><div className="ra-summary-heading"><span>{t.local}</span><h2 tabIndex={-1} ref={headingRef}>{t.summary}</h2></div>{summaryCard()}{state.saved && <div className="ra-success" role="status"><Icon name="check" /><p>{t.confirmed}</p></div>}{state.handoff && <p className="ra-hint">{t.handoffMessage}</p>}<div className="ra-summary-actions"><button className="ra-primary" onClick={resume}>{t.resume}<Icon /></button>{selection && <button className="ra-secondary" onClick={download}><Icon name="download" />{t.download}</button>}</div></section>}
    <footer className="ra-footer">{t.note}</footer>
  </div>;
}
