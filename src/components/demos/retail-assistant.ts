import { storeProducts, getStoreUnitPrice, type StoreProduct } from './store-catalog';

export type RetailStep = 'browse' | 'product' | 'storage' | 'color' | 'quantity' | 'fulfillment' | 'details' | 'review';
export type RetailSelection = { productId: string; storage: string; color: string; quantity: number };
export type RetailDetails = { name: string; contact: string; city: string };
export type Fulfillment = 'delivery' | 'pickup';
export type RetailError = 'quantity' | 'stock' | 'storage' | 'color' | 'name' | 'contact' | 'city' | 'incomplete';
export type RetailIntent = 'catalog' | 'select' | 'price' | 'availability' | 'order' | 'delivery' | 'pickup' | 'handoff' | 'quantity' | 'greeting' | 'back' | 'continue' | 'fallback';
export type RetailMessage = {
  role: 'customer' | 'assistant'; kind: string; text?: string; value?: string;
  selection?: RetailSelection; fulfillment?: Fulfillment;
};
export type RetailState = {
  step: RetailStep; selection: RetailSelection | null; fulfillment: Fulfillment | null;
  details: RetailDetails; messages: RetailMessage[]; allProducts: boolean;
  error: RetailError | null; saved: boolean; handoff: boolean;
};
export type RetailEvent =
  | { type: 'text'; text: string }
  | { type: 'select'; productId: string }
  | { type: 'ask'; intent: 'price' | 'availability' | 'handoff' }
  | { type: 'continue' | 'back' | 'catalog' | 'confirmQuantity' | 'confirm' | 'reset' }
  | { type: 'storage' | 'color'; value: string }
  | { type: 'quantity'; value: number }
  | { type: 'fulfillment'; value: Fulfillment }
  | { type: 'details'; value: RetailDetails }
  | { type: 'edit'; step: RetailStep };

const normalize = (value: string) => value.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/٫/g, '.').replace(/[\u064B-\u065Fـ]/g, '').replace(/[٠-٩]/g, char => String('٠١٢٣٤٥٦٧٨٩'.indexOf(char))).replace(/[۰-۹]/g, char => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(char)));
const aliases: Record<string, string[]> = {
  'iphone-18-pro-max': ['iphone', 'ايفون', 'ايفـون', 'هاتف', 'phone'],
  headphones: ['سماعات', 'سماعة', 'سماعه', 'headphones', 'headphone', 'headset', 'studio'],
  speaker: ['مكبر', 'سبيكر', 'speaker', 'pocket'], watch: ['ساعة', 'ساعه', 'watch'],
  keyboard: ['لوحة', 'كيبورد', 'keyboard'], mouse: ['فارة', 'فأرة', 'ماوس', 'mouse'],
};
const colorAliases: Record<string, string[]> = {
  black: ['اسود', 'السود', 'السودة', 'black'], silver: ['فضي', 'silver'],
  glacier: ['جليدي', 'glacier'], burgundy: ['عنابي', 'burgundy'],
};

/** Local, deterministic intent parsing; prices and stock always come from the shared catalog. */
export function interpretRetailMessage(text: string, currentProductId?: string, step?: RetailStep) {
  const value = normalize(text).trim();
  const matched = storeProducts.find(product => [product.name.ar, product.name.en, ...(aliases[product.id] || [])].some(alias => {
    const normalized = normalize(alias);
    return /[a-z]/.test(normalized) ? new RegExp(`\\b${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(value) : value.includes(normalized);
  }));
  const product = matched || storeProducts.find(item => item.id === currentProductId);
  const storageMatch = value.match(/(\d+(?:[.,]\d+)?)\s*(جيجابايت|جيجا|جي بي|غيغا|جيبي|gb|giga(?:bytes?)?|تيرابايت|تيرا|تي بي|tb|tera(?:bytes?)?)/i);
  const numericStorage = (step === 'storage' || /سعة|سعه|storage/.test(value)) ? value.match(/(?:^|\s)(\d{2,4})(?:\s|$)/)?.[1] : undefined;
  const requestedStorage = storageMatch ? `${storageMatch[1].replace(',', '.')}${/تيرا|تي بي|tb|tera/.test(storageMatch[2]) ? 'tb' : 'gb'}` : numericStorage ? `${numericStorage}gb` : undefined;
  const storage = requestedStorage ? product?.variants?.storage?.find(option => option.value === requestedStorage)?.value : undefined;
  const requestedColor = Object.entries(colorAliases).find(([, list]) => list.some(alias => value.includes(normalize(alias))))?.[0];
  const color = requestedColor ? product?.variants?.colors?.find(option => option.value === requestedColor)?.value : undefined;
  const unknownColor = /(?:احمر|ازرق|اخضر|وردي|ذهبي|ابيض|برتقالي|بنفسجي|\bred\b|\bblue\b|\bgreen\b|\bpink\b|\bgold\b|\bwhite\b|\borange\b|\bpurple\b)/.test(value);
  const quantityValue = value.replace(/(\d+(?:[.,]\d+)?)\s*(?:جيجابايت|جيجا|جي بي|غيغا|جيبي|gb|giga(?:bytes?)?|تيرابايت|تيرا|تي بي|tb|tera(?:bytes?)?)/gi, '');
  const quantityMatch = quantityValue.match(/(?:quantity|qty|عدد|كمية|كميه|اريد|احتاج|نبي|نبى|نحتاج|ابي|want|need)\s*[:=]?\s*([+-]?\d+(?:[.,]\d+)?)(?!\w)/) || quantityValue.match(/([+-]?\d+(?:[.,]\d+)?)\s*(?:pieces|units|قطع|قطعة|قطعه|حبات|حبة|حبه)/) || (step !== 'details' && !numericStorage ? quantityValue.match(/^\s*([+-]?\d+(?:[.,]\d+)?)\s*$/) : null);
  let quantity = quantityMatch ? Number(quantityMatch[1].replace(',', '.')) : undefined;
  if (quantity === undefined && /(?:^|\s)(?:زوز|زوج|اثنين|اثنان|اتنين|قطعتين|حبتين)(?:\s|$)/.test(value)) quantity = 2;
  if (quantity === undefined && /(?:نبي|اريد|عدد|كمية|كميه)\s*(?:واحد|واحدة|واحده)/.test(value)) quantity = 1;
  if (quantity === undefined) {
    const words: Record<string, number> = { ثلاثة: 3, ثلاثه: 3, ثلاث: 3, اربعة: 4, اربعه: 4, اربع: 4, خمسة: 5, خمسه: 5, خمس: 5, one: 1, two: 2, three: 3, four: 4, five: 5 };
    const word = value.match(/(?:نبي|اريد|ابي|عدد|كمية|كميه|want|need)\s+(ثلاثة|ثلاثه|ثلاث|اربعة|اربعه|اربع|خمسة|خمسه|خمس|one|two|three|four|five)(?:\s|$)/)?.[1];
    if (word) quantity = words[word];
  }
  let action: RetailIntent = 'fallback';
  if (/موظف|بشري|انسان|فريق|human|agent|person|handoff/.test(value)) action = 'handoff';
  else if (/ارجع|رجوع|السابق|\bback\b|previous/.test(value)) action = 'back';
  else if (/شن عند|شن تبيع|catalog|products|collection|show all/.test(value)) action = 'catalog';
  else if (/استلام|نستلم|pickup|pick up|collect/.test(value)) action = 'pickup';
  else if (/توصيل|شحن|delivery|shipping|deliver/.test(value)) action = 'delivery';
  else if (/متوفر|متاح|مخزون|عندكم|موجود|available|availability|stock/.test(value)) action = 'availability';
  else if (/سعر|اسعار|بكم|قداش|بقداش|بشحال|كم حق|price|cost|quote|how much/.test(value)) action = 'price';
  else if (quantity !== undefined) action = 'quantity';
  else if (storage || color || requestedStorage || requestedColor || unknownColor) action = 'select';
  else if (/اطلب|طلب|اشتري|شراء|نبي|نبى|اريد|ابي|order|buy|checkout|i want|i need/.test(value)) action = 'order';
  else if (matched) action = 'select';
  else if (/منتجات|كتالوج|تسوق|شن عند|شن تبيع|catalog|products|collection|show all/.test(value)) action = 'catalog';
  else if (/اكمل|كمل|التالي|تمام|next|continue|\bok\b/.test(value)) action = 'continue';
  else if (/مرحبا|اهلا|السلام|hello|^hi\b/.test(value)) action = 'greeting';
  const unsupportedStorage = Boolean(requestedStorage && !storage);
  // Non-variant products only expose the catalog image; no alternative finish is promised.
  const unsupportedColor = Boolean(unknownColor || (requestedColor && !color));
  return { action, productId: product?.id, matchedProduct: Boolean(matched), quantity, storage, color, unsupportedStorage, unsupportedColor };
}

export const createRetailState = (): RetailState => ({ step: 'browse', selection: null, fulfillment: null, details: { name: '', contact: '', city: '' }, messages: [{ role: 'assistant', kind: 'welcome' }], allProducts: false, error: null, saved: false, handoff: false });
export const getRetailProduct = (selection: RetailSelection | null) => storeProducts.find(product => product.id === selection?.productId);
export const retailTotal = (selection: RetailSelection | null) => { const product = getRetailProduct(selection); return product && selection ? getStoreUnitPrice(product, selection.storage) * selection.quantity : 0; };
const initialSelection = (product: StoreProduct): RetailSelection => ({ productId: product.id, storage: product.variants?.storage?.[0]?.value || '', color: product.variants?.colors?.[0]?.value || '', quantity: 1 });
const configuredStep = (product: StoreProduct): RetailStep => product.variants?.storage?.length ? 'storage' : product.variants?.colors?.length ? 'color' : 'quantity';
export function validateRetailDetails(details: RetailDetails, fulfillment: Fulfillment | null): RetailError | null {
  if (details.name.trim().length < 2) return 'name';
  const contact = normalize(details.contact).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) && !/^\+?[\d\s()\-]{7,24}$/.test(contact)) return 'contact';
  if (!contact.includes('@') && (contact.replace(/\D/g, '').length < 7 || contact.replace(/\D/g, '').length > 15)) return 'contact';
  if (fulfillment === 'delivery' && details.city.trim().length < 2) return 'city';
  return null;
}
function reply(state: RetailState, customer: RetailMessage, kind: string, changes: Partial<RetailState> = {}): RetailState {
  const next = { ...state, error: null, ...changes };
  return { ...next, messages: [...state.messages, customer, { role: 'assistant', kind, selection: next.selection ? { ...next.selection } : undefined, fulfillment: next.fulfillment || undefined }] };
}
const customer = (kind: string, value?: string): RetailMessage => ({ role: 'customer', kind, value });
const previousStep = (state: RetailState): RetailStep => {
  const product = getRetailProduct(state.selection);
  const route: RetailStep[] = ['browse', 'product', ...(product?.variants?.storage?.length ? ['storage' as const] : []), ...(product?.variants?.colors?.length ? ['color' as const] : []), 'quantity', 'fulfillment', 'details', 'review'];
  return route[Math.max(0, route.indexOf(state.step) - 1)];
};

export function retailTransition(state: RetailState, event: RetailEvent): RetailState {
  const product = getRetailProduct(state.selection);
  if (event.type === 'reset') return createRetailState();
  if (event.type === 'catalog') return reply(state, customer('catalog'), 'catalog', { step: 'browse', allProducts: true });
  if (event.type === 'select') {
    const chosen = storeProducts.find(item => item.id === event.productId);
    if (!chosen) return state;
    return reply(state, customer('select', chosen.id), chosen.stock ? 'selected' : 'outOfStock', { selection: initialSelection(chosen), step: 'product', saved: false });
  }
  if (event.type === 'ask') {
    if (event.intent === 'handoff') return reply(state, customer('handoff'), 'handoff', { handoff: true });
    return reply(state, customer(event.intent), product ? event.intent : 'choose', product ? {} : { step: 'browse' });
  }
  if (event.type === 'edit') {
    const step = event.step === 'browse' || product ? event.step : 'browse';
    return reply(state, customer('edit', step), 'edit', { step, saved: false });
  }
  if (event.type === 'back') return reply(state, customer('back'), 'back', { step: previousStep(state), saved: false });
  if (event.type === 'continue') {
    if (!product || !state.selection) return reply(state, customer('continue'), 'choose', { step: 'browse' });
    if (!product.stock) return reply(state, customer('continue'), 'outOfStock', { error: 'stock' });
    if (state.step === 'browse' || state.step === 'product') return reply(state, customer('continue'), 'configure', { step: configuredStep(product) });
    if (state.step === 'storage') return retailTransition(state, { type: 'storage', value: state.selection.storage });
    if (state.step === 'color') return retailTransition(state, { type: 'color', value: state.selection.color });
    if (state.step === 'quantity') return retailTransition(state, { type: 'confirmQuantity' });
    return reply(state, customer('continue'), 'finishStep');
  }
  if (event.type === 'storage' || event.type === 'color') {
    if (!product || !state.selection) return state;
    const valid = event.type === 'storage' ? product.variants?.storage?.some(option => option.value === event.value) : product.variants?.colors?.some(option => option.value === event.value);
    if (!valid) return reply(state, customer(event.type, event.value), 'unsupported', { error: event.type });
    const selection = { ...state.selection, [event.type]: event.value };
    return reply(state, { ...customer(event.type, event.value), selection }, 'updated', { selection, step: event.type === 'storage' && product.variants?.colors?.length ? 'color' : 'quantity', saved: false });
  }
  if (event.type === 'quantity') {
    if (!product || !state.selection) return state;
    if (!Number.isInteger(event.value) || event.value < 1 || event.value > product.stock) return { ...state, error: product.stock ? 'quantity' : 'stock' };
    return { ...state, selection: { ...state.selection, quantity: event.value }, saved: false, error: null };
  }
  if (event.type === 'confirmQuantity') {
    if (!product || !state.selection) return state;
    if (state.error === 'quantity' || !Number.isInteger(state.selection.quantity) || state.selection.quantity < 1 || state.selection.quantity > product.stock) return { ...state, error: product.stock ? 'quantity' : 'stock' };
    return reply(state, customer('quantity', String(state.selection.quantity)), 'quantity', { step: 'fulfillment' });
  }
  if (event.type === 'fulfillment') {
    if (!product?.stock || !state.selection) return reply(state, customer(event.value), product ? 'outOfStock' : 'choose', { step: product ? 'product' : 'browse' });
    return reply(state, customer(event.value), event.value, { fulfillment: event.value, step: 'details', saved: false });
  }
  if (event.type === 'details') {
    const details = { name: event.value.name.trim(), contact: event.value.contact.trim(), city: event.value.city.trim() };
    const error = validateRetailDetails(details, state.fulfillment);
    if (error) return { ...state, details, error };
    if (!state.fulfillment || !product?.stock) return { ...state, details, error: 'incomplete' };
    return reply(state, customer('details'), 'review', { details, step: 'review', saved: false });
  }
  if (event.type === 'confirm') {
    if (!state.selection || !product?.stock || !state.fulfillment || validateRetailDetails(state.details, state.fulfillment) || state.selection.quantity > product.stock) return { ...state, error: 'incomplete' };
    return reply(state, customer('confirm'), 'saved', { step: 'review', saved: true });
  }
  if (event.type === 'text') {
    const text = event.text.trim();
    if (!text) return state;
    const parsed = interpretRetailMessage(text, state.selection?.productId, state.step);
    const typed: RetailMessage = { role: 'customer', kind: 'typed', text };
    if (parsed.action === 'handoff') return reply(state, typed, 'handoff', { handoff: true });
    if (parsed.action === 'back') return reply(state, typed, 'back', { step: previousStep(state), saved: false });
    if (parsed.action === 'catalog' || parsed.action === 'greeting') return reply(state, typed, parsed.action === 'catalog' ? 'catalog' : 'welcome', { step: 'browse', allProducts: parsed.action === 'catalog' });
    const chosenProduct = storeProducts.find(item => item.id === parsed.productId);
    let selection = chosenProduct ? state.selection?.productId === chosenProduct.id ? { ...state.selection } : initialSelection(chosenProduct) : null;
    if (selection) {
      if (parsed.storage) selection.storage = parsed.storage;
      if (parsed.color) selection.color = parsed.color;
    }
    if (parsed.unsupportedStorage || parsed.unsupportedColor) {
      const error = parsed.unsupportedStorage ? 'storage' : 'color';
      const hasOptions = error === 'storage' ? chosenProduct?.variants?.storage?.length : chosenProduct?.variants?.colors?.length;
      return reply(state, typed, 'unsupported', { selection, error, step: hasOptions ? error : chosenProduct ? 'product' : 'browse', saved: false });
    }
    if (selection && chosenProduct) {
      if (parsed.quantity !== undefined && (!Number.isInteger(parsed.quantity) || parsed.quantity < 1 || parsed.quantity > chosenProduct.stock)) return reply(state, typed, chosenProduct.stock ? 'invalidQuantity' : 'outOfStock', { error: chosenProduct.stock ? 'quantity' : 'stock' });
      if (parsed.storage) selection.storage = parsed.storage;
      if (parsed.color) selection.color = parsed.color;
      if (parsed.quantity !== undefined) selection.quantity = parsed.quantity;
    }
    const changedProduct = selection?.productId !== state.selection?.productId;
    const changed = Boolean(changedProduct || parsed.storage || parsed.color || parsed.quantity !== undefined);
    const base: Partial<RetailState> = { selection, ...(changed ? { saved: false } : {}), ...(changedProduct ? { step: 'product' as const } : {}) };
    if (parsed.action === 'price' || parsed.action === 'availability') return reply(state, typed, chosenProduct ? parsed.action : 'choose', { ...base, ...(!chosenProduct ? { step: 'browse' } : {}) });
    if (parsed.action === 'delivery' || parsed.action === 'pickup') {
      // A delivery question is answered without skipping the product configuration steps.
      if (state.step === 'fulfillment' && chosenProduct?.stock) return reply(state, typed, parsed.action, { ...base, fulfillment: parsed.action, step: 'details', saved: false });
      return reply(state, typed, parsed.action === 'delivery' ? 'deliveryInfo' : 'pickupInfo', base);
    }
    if (parsed.action === 'fallback') return reply(state, typed, 'fallback');
    if (!selection || !chosenProduct) return reply(state, typed, 'choose', { step: 'browse' });
    if (!chosenProduct.stock) return reply(state, typed, 'outOfStock', { ...base, step: 'product' });
    if (parsed.action === 'continue') {
      const transitioned = retailTransition({ ...state, ...base }, { type: 'continue' });
      return { ...transitioned, messages: [...state.messages, typed, transitioned.messages[transitioned.messages.length - 1]] };
    }
    if (parsed.quantity !== undefined) return reply(state, typed, 'quantityUpdated', { ...base, step: 'quantity' });
    if (parsed.color) return reply(state, typed, 'updated', { ...base, step: 'quantity' });
    if (parsed.storage) return reply(state, typed, 'updated', { ...base, step: chosenProduct.variants?.colors?.length ? 'color' : 'quantity' });
    if (parsed.action === 'order') return reply(state, typed, 'configure', { ...base, step: configuredStep(chosenProduct) });
    return reply(state, typed, 'selected', base);
  }
  return state;
}
