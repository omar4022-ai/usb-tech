import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { buildSync } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const React = require('react');

// Exercise the actual JSX callbacks with persistent hook state. DOM focus and
// layout are deliberately outside this code-only regression test's scope.
function mount(name, initialLanguage = 'en') {
  const slots = [], timers = [];
  let cursor = 0, tree, lang = initialLanguage, now = Date.UTC(2026, 10, 17);
  const hooks = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], next => { slots[index] = typeof next === 'function' ? next(slots[index]) : next; }];
    },
    useRef: () => ({ current: null }), useId: () => ':flow-test:',
    useEffect() {}, useMemo: calculate => calculate(),
  };
  const result = buildSync({ absWorkingDir: root, entryPoints: [`src/components/demos/${name}.tsx`], bundle: true, platform: 'node', format: 'cjs', write: false, packages: 'external', loader: { '.css': 'empty' }, logLevel: 'silent' });
  const module = { exports: {} };
  vm.runInNewContext(result.outputFiles[0].text, {
    module, exports: module.exports, require: name => name === 'react' ? hooks : require(name),
    requestAnimationFrame: callback => callback(),
    setTimeout: callback => { timers.push(callback); return timers.length; }, clearTimeout() {},
    Date: class extends Date { static now() { return now; } }, Intl,
  });
  const render = () => { cursor = 0; tree = module.exports.default({ lang }); };
  function nodes(node = tree, result = []) {
    if (Array.isArray(node)) node.forEach(child => nodes(child ?? null, result));
    else if (node && typeof node === 'object') { result.push(node); nodes(node.props?.children ?? null, result); }
    return result;
  }
  function text(node) {
    if (Array.isArray(node)) return node.map(text).join(' ');
    return node == null || typeof node === 'boolean' ? '' : typeof node === 'object' ? text(node.props?.children) : String(node);
  }
  const hasClass = (node, value) => node.props?.className?.split(' ').includes(value);
  const all = value => nodes().filter(node => hasClass(node, value));
  const one = value => { const node = all(value)[0]; assert.ok(node, `Missing .${value}`); return node; };
  const click = node => { assert.ok(node, 'Button exists'); assert.ok(!node.props.disabled, 'Button is enabled'); node.props.onClick(); render(); };
  const change = (node, value) => { assert.ok(node, 'Field exists'); node.props.onChange({ target: { value } }); render(); };
  const submit = form => { form.props.onSubmit({ preventDefault() {} }); render(); };
  const button = label => nodes().find(node => node.type === 'button' && (text(node).trim() === label || node.props['aria-label'] === label));
  render();
  return { nodes, text, all, one, click, change, submit, button,
    language(value) { lang = value; render(); },
    finishTimers() { now += 1000; while (timers.length) timers.shift()(); render(); },
  };
}

for (const lang of ['ar', 'en']) {
  test(`a new Identity service enquiry reopens the form and keeps editable draft data (${lang})`, () => {
    const ui = mount('IdentityDemo', lang);
    assert.equal(ui.one('md-menu-toggle').props['aria-expanded'], false);
    ui.click(ui.one('md-menu-toggle'));
    assert.equal(ui.one('md-menu-toggle').props['aria-expanded'], true);
    const menu = ui.one('md-nav-open');
    assert.equal(menu.props.id, ui.one('md-menu-toggle').props['aria-controls']);
    ui.click(ui.nodes(menu).filter(node => node.type === 'button')[2]);
    assert.equal(ui.one('md-menu-toggle').props['aria-expanded'], false, 'Choosing a section closes the compact navigation');
    const request = index => ui.nodes(ui.all('md-service-card')[index]).find(node => node.props?.className === 'md-link');
    ui.click(request(0));
    const draft = { name: 'Demo Visitor', company: 'Demo Studio', contact: '٠٩١٠٠٠٠٠٠٠', brief: 'A company website with an enquiry form.' };
    for (const [name, value] of Object.entries(draft)) ui.change(ui.nodes().find(node => node.props?.name === name), value);
    ui.submit(ui.nodes().find(node => node.type === 'form'));
    assert.equal(ui.all('md-enquiry-result').length, 1);
    ui.click(ui.nodes(ui.one('md-enquiry-copy')).find(node => node.props?.className === 'md-link'));
    ui.click(request(2));
    assert.equal(ui.all('md-enquiry-result').length, 0, 'Prior review must not masquerade as a new enquiry');
    assert.equal(ui.nodes().filter(node => node.type === 'form').length, 1);
    assert.equal(ui.nodes().find(node => node.type === 'select').props.value, 2, 'The requested new service is selected');
    for (const [name, value] of Object.entries(draft)) assert.equal(ui.nodes().find(node => node.props?.name === name).props.value, value, `Editable ${name} is preserved`);
    ui.change(ui.nodes().find(node => node.props?.name === 'brief'), 'An automation project instead.');
    ui.submit(ui.nodes().find(node => node.type === 'form'));
    assert.ok(ui.text(ui.one('md-enquiry-result')).includes('An automation project instead.'));
    assert.ok(ui.text(ui.one('md-enquiry-result')).includes(lang === 'ar' ? 'أتمتة مسارات العمل' : 'Workflow automation'));
  });
}

test('Store order search keeps the matching detail and hides stale details for zero matches', () => {
  const ui = mount('StoreDemo');
  function createOrder(product) {
    ui.click(ui.nodes().find(node => node.props?.['data-store-page'] === 'shop'));
    ui.click(ui.nodes().find(node => node.type === 'button' && node.props['aria-label']?.startsWith('Add to cart:') && node.props['aria-label'].toLowerCase().includes(product)));
    ui.click(ui.one('sd-cart-button'));
    ui.click(ui.button('Continue to checkout'));
    ui.click(ui.button('Fill with sample details'));
    ui.submit(ui.one('sd-checkout-form'));
    ui.finishTimers();
    return ui.text(ui.nodes(ui.one('sd-order-detail-heading')).find(node => node.type === 'h3'));
  }
  const first = createOrder('headphones'), second = createOrder('speaker');
  assert.notEqual(first, second);
  const search = value => ui.change(ui.nodes(ui.one('sd-order-search')).find(node => node.type === 'input'), value);
  search(`  ${first.toLowerCase()}  `);
  assert.equal(ui.nodes(ui.one('sd-order-list')).filter(node => node.type === 'button').length, 1);
  assert.ok(ui.text(ui.one('sd-order-detail-heading')).includes(first));
  assert.ok(!ui.text(ui.one('sd-order-detail-heading')).includes(second));
  ui.click(ui.button('Simulate next stage'));
  assert.ok(ui.text(ui.one('sd-order-status')).includes('Preparing'), 'Tracking affects the visible matching order');
  ui.language('ar');
  assert.ok(ui.text(ui.one('sd-order-detail-heading')).includes(first), 'Language changes preserve the filtered order');
  search('NO-SUCH-ORDER');
  assert.equal(ui.all('sd-order-detail').length, 0, 'No unrelated order details remain visible');
  assert.equal(ui.nodes(ui.one('sd-order-list')).filter(node => node.type === 'button').length, 0);
  assert.ok(ui.text(ui.one('sd-order-list')).includes('لا يوجد طلب بهذا الرقم'));
  search('');
  assert.ok(ui.text(ui.one('sd-order-detail-heading')).includes(second), 'Clearing search restores the selected order');
  assert.equal(ui.text(ui.one('sd-order-status')), 'مؤكد', 'The other order was not advanced by the filtered action');
});
