import { readFile } from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const sourceUrl = name => new URL(`../src/components/demos/${name}`, import.meta.url);
const transpile = (source, module = ts.ModuleKind.ESNext) => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const asModule = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const catalogUrl = asModule(transpile(await readFile(sourceUrl('store-catalog.ts'), 'utf8')));
const catalog = await import(catalogUrl);
const modelSource = await readFile(sourceUrl('retail-assistant.ts'), 'utf8');
const model = await import(asModule(transpile(modelSource).replace("'./store-catalog'", JSON.stringify(catalogUrl))));
const { createRetailState: initial, retailTransition: reduce, interpretRetailMessage: parse, retailTotal: total, validateRetailDetails: validate } = model;
const say = (state, text) => reduce(state, { type: 'text', text });
const choose = (id = 'iphone-18-pro-max') => reduce(initial(), { type: 'select', productId: id });

test('English product aliases do not confuse headphones with phones or invent an unknown product', () => {
  for (const text of ['headphones price', 'headphone', 'I want 2 headphones', 'Studio headphones']) assert.equal(parse(text).productId, 'headphones', text);
  assert.equal(parse('phone price').productId, 'iphone-18-pro-max');
  assert.equal(parse('microphone price').productId, undefined);
  assert.equal(parse('microphone').action, 'fallback');
  assert.equal(say(initial(), 'microphone price').selection, null);
});

test('Arabic, Libyan and English price questions preserve product context without asking for customer data', () => {
  for (const text of ['بكم الآيفون', 'قداش الايفون', 'شن السعر للايفون', 'بقداش ايفون', 'how much is the iPhone']) {
    const state = say(initial(), text);
    assert.equal(state.messages.at(-1).kind, 'price', text);
    assert.equal(state.step, 'product');
    assert.equal(state.details.name, '');
    assert.equal(total(state.selection), 7990);
  }
  let state = say(choose(), 'نبي ايفون 512 جيجا عنابي');
  state = say(state, 'نبي زوز');
  for (const text of ['سعره', 'بقداش', 'قداش', 'its price', 'متوفر؟', 'is it available?']) {
    const next = say(state, text);
    assert.deepEqual(next.selection, state.selection);
    assert.equal(total(next.selection), 17980);
    assert.equal(next.step, state.step);
  }
  assert.equal(say(state, 'شن عندكم').step, 'browse');
  assert.equal(say(state, 'شن عندكم').allProducts, true);
});

test('storage parsing accepts Arabic digits and units without treating a capacity as a quantity', () => {
  for (const [text, size] of [['512GB', '512gb'], ['512 جيجا', '512gb'], ['٥١٢ جيجابايت', '512gb'], ['٥١٢جيجا', '512gb'], ['1 تيرا', '1tb'], ['٢ تيرابايت', '2tb']]) {
    const result = parse(text, 'iphone-18-pro-max', 'storage');
    assert.equal(result.storage, size, text);
    assert.equal(result.quantity, undefined, text);
  }
  assert.equal(parse('نبي 512GB', 'iphone-18-pro-max').quantity, undefined);
  assert.equal(parse('512', 'iphone-18-pro-max', 'storage').storage, '512gb');
  assert.equal(parse('128', 'iphone-18-pro-max', 'storage').unsupportedStorage, true);
  assert.equal(say(choose(), 'iPhone 2TB price').messages.at(-1).selection.storage, '2tb');
});

test('unsupported variants are explicit, preserve valid supplied details, and keep the relevant options open', () => {
  let state = say(initial(), 'نبي ايفون 512 جيجا أزرق');
  assert.equal(state.error, 'color'); assert.equal(state.step, 'color');
  assert.equal(state.selection.storage, '512gb'); assert.equal(total(state.selection), 8990);
  state = say(state, 'فضي');
  assert.equal(state.selection.color, 'silver'); assert.equal(state.error, null);
  const invalidStorage = say(state, '128GB');
  assert.equal(invalidStorage.error, 'storage'); assert.equal(invalidStorage.step, 'storage');
  assert.equal(invalidStorage.selection.storage, '512gb');
  const invalidColor = say(state, 'أبيض');
  assert.equal(invalidColor.error, 'color'); assert.equal(invalidColor.step, 'color');
  assert.equal(invalidColor.selection.color, 'silver');
  assert.equal(say(choose('headphones'), 'red').error, 'color');
});

test('quantities support common Arabic/Libyan wording and reject invalid amounts without changing the quote', () => {
  for (const [text, expected] of [['نبي ثلاثة سماعات', 3], ['ابي 2 سماعات', 2], ['أريد ٢ قطع', 2], ['نبي زوز', 2], ['حبتين', 2], ['I want two headphones', 2], ['quantity 4', 4]]) {
    const state = say(choose('headphones'), text);
    assert.equal(state.selection.productId, 'headphones', text); assert.equal(state.selection.quantity, expected, text);
    assert.equal(total(state.selection), expected * 249);
  }
  const state = say(choose('headphones'), 'نبي 2');
  for (const text of ['0', '-1', '1.5', '999', 'أريد ١٫٥ قطع']) {
    const next = say(state, text);
    assert.equal(next.selection.quantity, 2, text);
    assert.equal(next.saved, false);
  }
  for (const value of [0, -1, 1.5, Infinity, NaN, 25]) assert.equal(reduce(state, { type: 'quantity', value }).error, 'quantity');
});

test('complete button flow updates catalog prices, validates details, saves locally, and supports editing', () => {
  let state = choose();
  assert.equal(state.step, 'product');
  state = reduce(state, { type: 'continue' }); assert.equal(state.step, 'storage');
  state = reduce(state, { type: 'storage', value: '512gb' }); assert.equal(state.step, 'color'); assert.equal(total(state.selection), 8990);
  state = reduce(state, { type: 'color', value: 'silver' }); assert.equal(state.step, 'quantity');
  state = reduce(state, { type: 'quantity', value: 2 }); assert.equal(total(state.selection), 17980);
  state = reduce(state, { type: 'confirmQuantity' }); assert.equal(state.step, 'fulfillment');
  state = reduce(state, { type: 'fulfillment', value: 'delivery' }); assert.equal(state.step, 'details');
  for (const [value, error] of [[{ name: '', contact: '', city: '' }, 'name'], [{ name: 'Demo', contact: '123', city: '' }, 'contact'], [{ name: 'Demo', contact: 'demo@example.com', city: '' }, 'city']]) assert.equal(reduce(state, { type: 'details', value }).error, error);
  state = reduce(state, { type: 'details', value: { name: 'Demo', contact: '٠٩٢٢٢٢١١١٣', city: 'طرابلس' } });
  assert.equal(state.step, 'review'); assert.equal(state.error, null);
  state = reduce(state, { type: 'confirm' }); assert.equal(state.saved, true); assert.equal(state.messages.at(-1).kind, 'saved');
  const originalDetails = { ...state.details };
  state = reduce(state, { type: 'edit', step: 'storage' }); assert.equal(state.saved, false);
  state = reduce(state, { type: 'storage', value: '1tb' }); assert.equal(total(state.selection), 20980);
  assert.deepEqual(state.details, originalDetails); assert.equal(state.fulfillment, 'delivery');
  state = reduce(state, { type: 'back' }); assert.equal(state.step, 'storage'); assert.equal(state.selection.storage, '1tb');
});

test('pickup requires contact details but no city, and delivery questions never skip configuration', () => {
  let state = choose('headphones');
  state = say(state, 'عندكم توصيل؟'); assert.equal(state.step, 'product'); assert.equal(state.fulfillment, null); assert.equal(state.messages.at(-1).kind, 'deliveryInfo');
  state = reduce(state, { type: 'continue' }); assert.equal(state.step, 'quantity');
  state = reduce(state, { type: 'confirmQuantity' });
  state = say(state, 'استلام'); assert.equal(state.step, 'details'); assert.equal(state.fulfillment, 'pickup');
  state = reduce(state, { type: 'details', value: { name: 'Demo', contact: 'demo@example.com', city: '' } });
  assert.equal(state.step, 'review'); assert.equal(state.error, null);
  assert.equal(validate({ name: 'Demo', contact: '-------', city: '' }, 'pickup'), 'contact');
});

test('out-of-stock products cannot advance or save, and incomplete orders cannot be confirmed', () => {
  const state = choose('mouse');
  assert.equal(state.messages.at(-1).kind, 'outOfStock');
  assert.equal(reduce(state, { type: 'continue' }).step, 'product');
  assert.equal(say(state, 'نبي 2').messages.at(-1).kind, 'outOfStock');
  assert.equal(reduce(state, { type: 'confirm' }).saved, false);
  assert.equal(reduce(choose(), { type: 'confirm' }).error, 'incomplete');
  assert.equal(reduce(choose(), { type: 'quantity', value: 0 }).selection.quantity, 1);
});

test('handoff works without a product, fallback keeps context, and reset clears the entire session', () => {
  let state = say(initial(), 'نبي نحكي مع موظف');
  assert.equal(state.handoff, true); assert.equal(state.selection, null); assert.equal(state.step, 'browse');
  state = say(choose('headphones'), 'hello unknown request xyz');
  assert.equal(state.messages.at(-1).kind, 'welcome');
  state = say(choose('headphones'), 'something unusual xyz');
  assert.equal(state.messages.at(-1).kind, 'fallback'); assert.equal(state.selection.productId, 'headphones');
  state = reduce(state, { type: 'ask', intent: 'handoff' }); assert.equal(state.step, 'product');
  assert.deepEqual(reduce(state, { type: 'reset' }), initial());
});

// Code-only interaction harness: exercise actual rendered event handlers with stable hook state.
function createHarness() {
  let slots = [], cursor = 0, effects = [], dirty = false;
  const hooks = {
    useState(initialValue) { const index = cursor++; if (!(index in slots)) slots[index] = typeof initialValue === 'function' ? initialValue() : initialValue; return [slots[index], value => { const next = typeof value === 'function' ? value(slots[index]) : value; if (next !== slots[index]) { slots[index] = next; dirty = true; } }]; },
    useRef(value) { const index = cursor++; return slots[index] ||= { current: value }; },
    useId() { cursor++; return 'retail-test'; },
    useEffect(effect, dependencies) { const index = cursor++; const old = slots[index]; if (!old || dependencies.some((value, i) => value !== old[i])) effects.push(effect); slots[index] = dependencies; },
  };
  const stage = { scrollTop: 0, scrollTo() {}, getBoundingClientRect: () => ({ top: 0, bottom: 700 }) };
  const element = { focus() {}, closest: () => stage, getBoundingClientRect: () => ({ top: 100, bottom: 600 }) };
  const exports = {};
  const output = transpile(componentSource, ts.ModuleKind.CommonJS);
  vm.runInNewContext(output, { exports, require: name => name === 'react' ? hooks : name === './retail-assistant' ? model : name === './store-catalog' ? catalog : name.endsWith('.css') ? {} : require(name), window: { matchMedia: () => ({ matches: true }) }, setTimeout, Blob, URL, console });
  let tree;
  const walk = node => Array.isArray(node) ? node.flatMap(walk) : node && typeof node === 'object' ? [node, ...walk(node.props?.children)] : [];
  return {
    render(lang = 'ar') { let count = 0; do { dirty = false; cursor = 0; effects = []; tree = exports.default({ lang }); for (const node of walk(tree)) if (node.props?.ref) node.props.ref.current = element; for (const effect of effects) effect(); } while (dirty && count++ < 5); return tree; },
    nodes: () => walk(tree),
    find: predicate => { const found = walk(tree).find(predicate); assert.ok(found, 'Expected rendered control'); return found; },
    state: () => slots[1],
  };
}
const componentSource = await readFile(sourceUrl('AutomationDemo.tsx'), 'utf8');
const nodeText = node => Array.isArray(node) ? node.map(nodeText).join(' ') : node && typeof node === 'object' ? nodeText(node.props?.children) : String(node ?? '');

test('actual UI handlers preserve selection and drafts across language/page switches and validate Arabic quantity input', () => {
  const ui = createHarness(); ui.render();
  ui.find(node => node.props?.className === 'ra-product-card').props.onClick(); ui.render();
  ui.find(node => node.type === 'button' && nodeText(node).includes('أكمل الاختيار')).props.onClick(); ui.render();
  ui.find(node => node.props?.className === 'ra-option' && nodeText(node).includes('512 GB')).props.onClick(); ui.render();
  ui.find(node => node.props?.className === 'ra-option' && nodeText(node).includes('فضي')).props.onClick(); ui.render();
  ui.find(node => node.props?.id === 'retail-test-quantity').props.onChange({ target: { value: '٢' } }); ui.render();
  assert.equal(ui.state().selection.quantity, 2); assert.equal(total(ui.state().selection), 17980);
  ui.render('en'); assert.equal(ui.state().selection.storage, '512gb'); assert.equal(ui.state().selection.color, 'silver');
  ui.find(node => node.type === 'button' && nodeText(node).includes('Your selection')).props.onClick(); ui.render('en');
  assert.ok(ui.nodes().some(node => node.props?.className === 'ra-summary-page'));
  ui.find(node => node.type === 'button' && nodeText(node).includes('Continue conversation')).props.onClick(); ui.render('en');
  assert.equal(ui.state().step, 'quantity'); assert.equal(ui.state().selection.quantity, 2);
  ui.find(node => node.props?.id === 'retail-test-quantity').props.onChange({ target: { value: '' } }); ui.render('en');
  ui.find(node => node.type === 'button' && nodeText(node).includes('Confirm quantity')).props.onClick(); ui.render('en');
  assert.equal(ui.state().step, 'quantity'); assert.equal(ui.state().error, 'quantity');
  ui.find(node => node.props?.id === 'retail-test-quantity').props.onChange({ target: { value: '٢' } }); ui.render('en');
  ui.find(node => node.type === 'button' && nodeText(node).includes('Confirm quantity')).props.onClick(); ui.render('en');
  ui.find(node => node.props?.className === 'ra-option' && nodeText(node).includes('Delivery')).props.onClick(); ui.render('en');
  ui.find(node => node.props?.id === 'retail-test-name').props.onChange({ target: { value: 'Demo buyer' } }); ui.render('en');
  ui.render('ar'); assert.equal(ui.find(node => node.props?.id === 'retail-test-name').props.value, 'Demo buyer');
  for (const [field, value] of [['contact', 'demo@example.com'], ['city', 'طرابلس']]) { ui.find(node => node.props?.id === `retail-test-${field}`).props.onChange({ target: { value } }); ui.render(); }
  ui.find(node => node.props?.className === 'ra-details-form').props.onSubmit({ preventDefault() {} }); ui.render();
  assert.equal(ui.state().step, 'review');
  ui.find(node => node.props?.className === 'ra-primary ra-confirm').props.onClick(); ui.render();
  assert.equal(ui.state().saved, true);
  ui.find(node => node.props?.className === 'ra-reset').props.onClick(); ui.render();
  assert.equal(ui.state().selection, null); assert.equal(ui.state().details.name, '');
});
