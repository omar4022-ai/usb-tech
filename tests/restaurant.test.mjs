import { readFile } from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const source = await readFile(new URL('../src/components/demos/restaurant-model.ts', import.meta.url), 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const model = await import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`);
const { initialRestaurantState, restaurantReducer: reduce, restaurantSubtotal, restaurantPhoneValid, restaurantDateValid, restaurantReservationTimeValid, restaurantReservationTimes } = model;
const add = (state, changes = {}) => reduce(state, { type: 'add', line: { id: 'line-1', product: 'burger', extras: ['cheese', 'fries'], quantity: 2, note: 'No onions', ...changes } });
const orderAction = { type: 'order', id: 'order-1', mode: 'delivery', table: null, customer: 'DEMO', phone: '+218922221113', address: 'Sample street', now: new Date().toISOString() };
const future = new Date(); future.setFullYear(future.getFullYear() + 1);
const date = `${future.getFullYear()}-12-01`;
const reservation = { id: 'R-1', name: 'DEMO', phone: '+218922221113', date, time: '18:00', guests: 2, table: 1, cancelled: false };

test('customized cart totals are preserved through order and kitchen stages', () => {
  let state = add(initialRestaurantState());
  assert.equal(restaurantSubtotal(state.cart), 76);
  state = reduce(state, orderAction);
  assert.equal(state.cart.length, 0);
  assert.equal(state.orders[0].total, 84);
  assert.deepEqual(state.orders[0].lines[0].extras, ['cheese', 'fries']);
  assert.equal(state.orders[0].lines[0].note, 'No onions');
  assert.equal(reduce(state, { type: 'advance', id: 'order-1', role: 'cashier' }).orders[0].status, 'new');
  state = reduce(state, { type: 'advance', id: 'order-1', role: 'kitchen' });
  assert.equal(state.orders[0].status, 'preparing');
  state = reduce(state, { type: 'advance', id: 'order-1', role: 'kitchen' });
  assert.equal(state.orders[0].status, 'ready');
  assert.equal(reduce(state, { type: 'pay', id: 'order-1', role: 'kitchen' }).orders[0].paid, false);
  state = reduce(state, { type: 'pay', id: 'order-1', role: 'cashier' });
  assert.equal(state.orders[0].paid, true);
  assert.equal(reduce(state, { type: 'cancel', id: 'order-1', role: 'manager' }).notice, 'forbidden');
  state = reduce(state, { type: 'advance', id: 'order-1', role: 'cashier' });
  assert.equal(state.orders[0].status, 'served');
  assert.equal(reduce(state, { type: 'advance', id: 'order-1', role: 'manager' }).notice, 'forbidden');
});

test('quantity, unavailable items, extras and order fields are guarded', () => {
  let state = add(initialRestaurantState(), { extras: ['cheese', 'cheese', 'invalid'], quantity: 1 });
  assert.equal(restaurantSubtotal(state.cart), 31);
  assert.equal(reduce(state, { type: 'quantity', id: 'line-1', change: 0.5 }), state);
  assert.equal(reduce(state, { ...orderAction, phone: '-------' }).notice, 'invalid');
  assert.equal(reduce(state, { ...orderAction, address: '' }).notice, 'invalid');
  assert.equal(reduce(state, { ...orderAction, mode: 'dineIn', table: 99 }).notice, 'invalid');
  assert.equal(reduce(state, { type: 'availability', product: 'burger', role: 'cashier' }).notice, 'forbidden');
  state = reduce(state, { type: 'availability', product: 'burger', role: 'manager' });
  assert.equal(reduce(state, orderAction).notice, 'unavailable');
  assert.equal(add(state).cart.length, 1);
  assert.equal(add(initialRestaurantState(), { quantity: 0 }).cart.length, 0);
  assert.equal(add(initialRestaurantState(), { quantity: 1.5 }).cart.length, 0);
  assert.equal(add(initialRestaurantState(), { product: 'unknown' }).cart.length, 0);
  assert.equal(restaurantPhoneValid('٠٩٢٢٢٢١١١٣'), true);
  assert.equal(restaurantPhoneValid('123'), false);
});

test('reservation capacity, dates, duplicates and role restrictions are enforced', () => {
  let state = initialRestaurantState();
  assert.equal(restaurantDateValid('2026-02-30'), false);
  assert.equal(restaurantDateValid('2001-01-01'), false);
  assert.equal(reduce(state, { type: 'reserve', reservation: { ...reservation, guests: 3 } }).reservations.length, 0);
  state = reduce(state, { type: 'reserve', reservation });
  assert.equal(state.reservations.length, 1);
  assert.equal(reduce(state, { type: 'reserve', reservation }), state);
  assert.equal(reduce(state, { type: 'reserve', reservation: { ...reservation, id: 'R-2' } }).reservations.length, 1);
  assert.equal(reduce(state, { type: 'cancelReservation', id: 'R-1', role: 'kitchen' }).notice, 'forbidden');
  state = reduce(state, { type: 'cancelReservation', id: 'R-1', role: 'cashier' });
  state = reduce(state, { type: 'reserve', reservation: { ...reservation, id: 'R-2' } });
  assert.equal(state.reservations.filter(item => !item.cancelled).length, 1);
});

test('cancelling an unpaid order and resetting are consistent', () => {
  let state = reduce(add(initialRestaurantState()), orderAction);
  assert.equal(reduce(state, { type: 'cancel', id: 'order-1', role: 'kitchen' }).notice, 'forbidden');
  state = reduce(state, { type: 'cancel', id: 'order-1', role: 'manager' });
  assert.equal(state.orders[0].status, 'cancelled');
  assert.equal(reduce(state, { type: 'pay', id: 'order-1', role: 'cashier' }).notice, 'forbidden');
  state = reduce(state, { type: 'reset' });
  assert.equal(state.orders.length, 2);
  assert.equal(state.cart.length, 0);
  assert.equal(state.reservations.length, 0);
});

test('reservations reject past times today and allow only future listed slots', () => {
  const now = new Date(2026, 10, 17, 19, 0);
  assert.equal(restaurantReservationTimeValid('2026-11-17', '12:00', now), false);
  assert.equal(restaurantReservationTimeValid('2026-11-17', '18:00', now), false);
  assert.equal(restaurantReservationTimeValid('2026-11-17', '20:00', now), true);
  assert.equal(restaurantReservationTimeValid('2026-11-17', '19:30', now), false);
  assert.equal(restaurantReservationTimeValid('2026-11-16', '22:00', now), false);
  assert.equal(restaurantReservationTimeValid('2026-11-17', '20:00', new Date(2026, 10, 17, 20, 0)), false);
  assert.equal(restaurantReservationTimeValid('2026-02-30', '20:00', now), false);
  assert.deepEqual(restaurantReservationTimes.filter(time => restaurantReservationTimeValid('2026-11-17', time, now)), ['20:00', '22:00']);
  assert.deepEqual(restaurantReservationTimes.filter(time => restaurantReservationTimeValid('2026-11-17', time, new Date(2026, 10, 17, 22, 1))), []);
  assert.equal(restaurantReservationTimes.filter(time => restaurantReservationTimeValid('2026-11-18', time, now)).length, 6);

  // Exercise the reducer with a fixed clock as well as the shared UI validator.
  class FixedDate extends Date { constructor(...args) { super(...(args.length ? args : [now.getTime()])); } static now() { return now.getTime(); } }
  const exports = {};
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText, { exports, Date: FixedDate, Intl });
  const base = exports.initialRestaurantState();
  const past = exports.restaurantReducer(base, { type: 'reserve', reservation: { ...reservation, date: '2026-11-17', time: '12:00' } });
  assert.equal(past.reservations.length, 0); assert.equal(past.notice, 'reservationUnavailable');
  const futureSlot = exports.restaurantReducer(base, { type: 'reserve', reservation: { ...reservation, date: '2026-11-17', time: '20:00' } });
  assert.equal(futureSlot.reservations.length, 1); assert.equal(futureSlot.reservations[0].time, '20:00');
});

const componentSource = await readFile(new URL('../src/components/demos/RestaurantDemo.tsx', import.meta.url), 'utf8');
const require = createRequire(import.meta.url);
const walk = node => Array.isArray(node) ? node.flatMap(walk) : node && typeof node === 'object' ? [node, ...walk(node.props?.children)] : [];
const nodeText = node => Array.isArray(node) ? node.map(nodeText).join(' ') : node && typeof node === 'object' ? nodeText(node.props?.children) : String(node ?? '');
function restaurantHarness() {
  let slots = [], cursor = 0, effects = [], frames = [], dirty = false, tree, confirmed = true, focused = null, lastScroll = null;
  const hooks = {
    useState(value) { const index = cursor++; if (!(index in slots)) slots[index] = typeof value === 'function' ? value() : value; return [slots[index], change => { const next = typeof change === 'function' ? change(slots[index]) : change; if (next !== slots[index]) { slots[index] = next; dirty = true; } }]; },
    useReducer(reducer, value, initializer) { const [state, setState] = hooks.useState(() => initializer ? initializer(value) : value); return [state, action => setState(current => reducer(current, action))]; },
    useRef(value) { const index = cursor++; return slots[index] ||= { current: value }; },
    useEffect(effect, deps) { const index = cursor++; const old = slots[index]; if (!old || deps.some((value, i) => value !== old[i])) effects.push(effect); slots[index] = deps; },
  };
  const stage = { scrollTop: 0, scrollTo(options) { lastScroll = options; }, getBoundingClientRect: () => ({ top: 60, bottom: 780 }) };
  const element = { open: false, offsetHeight: 64, focus() {}, showModal() { this.open = true; }, close() { this.open = false; }, closest: () => stage, scrollIntoView() {}, getBoundingClientRect: () => ({ top: 360, bottom: 720 }) };
  const exports = {};
  const output = ts.transpileModule(componentSource, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(output, { exports, require: name => name === 'react' ? hooks : name === './restaurant-model' ? model : name.endsWith('.css') ? {} : require(name), window: { confirm: () => confirmed, matchMedia: () => ({ matches: true }) }, requestAnimationFrame: fn => { frames.push(fn); return frames.length; }, Date, Intl });
  function find(predicate, within = tree) { const found = walk(within).find(predicate); assert.ok(found, 'Expected rendered restaurant control'); return found; }
  return {
    render(lang = 'en') { let loops = 0; do { dirty = false; cursor = 0; effects = []; tree = exports.default({ lang }); for (const node of walk(tree)) if (node.props?.ref) { const current = { ...element, focus() { focused = node.props.id || node.props.className || node.type; } }; if (typeof node.props.ref === 'function') node.props.ref(current); else node.props.ref.current = current; } for (const effect of effects) effect(); const callbacks = frames; frames = []; for (const callback of callbacks) callback(); } while (dirty && loops++ < 5); return tree; },
    find, nodes: () => walk(tree), state: () => slots[0], confirm: value => { confirmed = value; }, focused: () => focused, lastScroll: () => lastScroll,
    button(text) { return find(node => node.type === 'button' && nodeText(node).trim() === text); },
    field(label, tag = 'input') { const container = find(node => node.type === 'label' && nodeText(node).trim().startsWith(label)); return find(node => node.type === tag, container); },
  };
}

test('reset clears actual checkout/reservation drafts, customized item fields, filters, roles and demo data', () => {
  const ui = restaurantHarness(); ui.render();
  const change = (node, value) => { node.props.onChange({ target: { value } }); ui.render(); };
  function addBurger(customize = false) {
    ui.find(node => node.props?.className === 'rd-add').props.onClick({ currentTarget: { focus() {} } }); ui.render();
    if (customize) {
      ui.find(node => node.type === 'input' && node.props.type === 'checkbox').props.onChange({ target: { checked: true } }); ui.render();
      change(ui.find(node => node.type === 'textarea'), 'No onions');
      ui.find(node => node.type === 'button' && node.props['aria-label'] === 'Increase quantity of').props.onClick(); ui.render();
    }
    const buy = ui.find(node => node.props?.className === 'rd-detail-buy');
    ui.find(node => node.props?.className === 'rd-primary', buy).props.onClick(); ui.render();
  }
  addBurger(true); assert.equal(ui.state().cart[0].quantity, 2);
  ui.find(node => node.props?.className === 'rd-cart-button').props.onClick(); ui.render();
  ui.button('Delivery').props.onClick(); ui.render();
  change(ui.field('Name'), 'Customer draft'); change(ui.field('Phone number'), '+218922221113'); change(ui.field('Delivery address', 'textarea'), 'Draft delivery address');
  ui.button('Book a table').props.onClick(); ui.render();
  change(ui.field('Visit date'), date); change(ui.field('Visit time', 'select'), '22:00'); change(ui.field('Party size', 'select'), '6');
  change(ui.field('Name'), 'Reservation draft'); change(ui.field('Phone number'), '+218933331112');
  ui.find(node => node.props?.className === 'rd-panel rd-reserve-form').props.onSubmit({ preventDefault() {} }); ui.render();
  assert.equal(ui.state().reservations.length, 1);
  ui.button('Menu').props.onClick(); ui.render();
  ui.button('Coffee & drinks').props.onClick(); ui.render();
  change(ui.find(node => node.type === 'input' && node.props.type === 'search'), 'coffee');
  ui.find(node => node.type === 'button' && nodeText(node).includes('02 Restaurant workspace')).props.onClick(); ui.render();
  change(ui.field('Try a staff role', 'select'), 'cashier');
  change(ui.field('Filter orders', 'select'), 'all');
  ui.confirm(false); ui.button('Reset demo').props.onClick(); ui.render();
  assert.equal(ui.field('Try a staff role', 'select').props.value, 'cashier'); assert.equal(ui.state().reservations.length, 1);
  ui.confirm(true); ui.button('Reset demo').props.onClick(); ui.render();
  assert.equal(ui.state().reservations.length, 0); assert.equal(ui.state().cart.length, 0); assert.equal(ui.state().orders.length, 2);
  assert.equal(ui.find(node => node.type === 'input' && node.props.type === 'search').props.value, '');
  assert.equal(ui.nodes().filter(node => node.props?.className === 'rd-add').length, 6);
  addBurger(); assert.equal(ui.state().cart[0].quantity, 1); assert.deepEqual(ui.state().cart[0].extras, []); assert.equal(ui.state().cart[0].note, '');
  ui.find(node => node.props?.className === 'rd-cart-button').props.onClick(); ui.render();
  assert.equal(ui.field('Name').props.value, ''); assert.equal(ui.field('Table', 'select').props.value, 1);
  ui.button('Delivery').props.onClick(); ui.render(); assert.equal(ui.field('Phone number').props.value, ''); assert.equal(ui.field('Delivery address', 'textarea').props.value, '');
  ui.button('Book a table').props.onClick(); ui.render();
  assert.equal(ui.field('Name').props.value, ''); assert.equal(ui.field('Phone number').props.value, ''); assert.equal(ui.field('Party size', 'select').props.value, 2);
  const today = new Date(); const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  assert.equal(ui.field('Visit date').props.value, localDate);
  ui.find(node => node.type === 'button' && nodeText(node).includes('02 Restaurant workspace')).props.onClick(); ui.render();
  assert.equal(ui.field('Try a staff role', 'select').props.value, 'manager'); assert.equal(ui.field('Filter orders', 'select').props.value, 'active');
});

test('booking navigation reveals its form and the kitchen CTA focuses the exact newly created order', () => {
  const ui = restaurantHarness(); ui.render();
  ui.button('Book a table').props.onClick(); ui.render();
  assert.equal(ui.focused(), 'h3'); assert.equal(ui.lastScroll().top, 290);
  assert.ok(ui.find(node => node.props?.className === 'rd-panel rd-reserve-form'));
  ui.button('Menu').props.onClick(); ui.render();
  ui.find(node => node.props?.className === 'rd-add').props.onClick({ currentTarget: { focus() {} } }); ui.render();
  const buy = ui.find(node => node.props?.className === 'rd-detail-buy');
  ui.find(node => node.props?.className === 'rd-primary', buy).props.onClick(); ui.render();
  ui.find(node => node.props?.className === 'rd-cart-button').props.onClick(); ui.render();
  ui.field('Name').props.onChange({ target: { value: 'Demo customer' } }); ui.render();
  ui.find(node => node.props?.className === 'rd-panel rd-checkout').props.onSubmit({ preventDefault() {} }); ui.render();
  const orderId = ui.state().orders[0].id;
  ui.button('Follow your order in the kitchen ↗').props.onClick(); ui.render();
  assert.equal(ui.field('Try a staff role', 'select').props.value, 'kitchen');
  assert.equal(ui.focused(), `rd-ticket-${orderId}`);
  assert.equal(ui.lastScroll().top, 226, 'ticket is revealed below the compact 64px role toolbar');
  const ticket = ui.find(node => node.props?.id === `rd-ticket-${orderId}`);
  assert.ok(walk(ticket).some(node => node.type === 'button' && nodeText(node).includes('Start preparing')));
});

test('compact staff navigation closes and focuses actual page content while Escape restores the toggle', () => {
  const ui = restaurantHarness(); ui.render();
  ui.find(node => node.type === 'button' && nodeText(node).includes('02 Restaurant workspace')).props.onClick(); ui.render();
  for (const [label, id] of [['Tables & reservations', 'tables'], ['Daily overview', 'reports'], ['Menu availability', 'availability'], ['Kitchen & orders', 'kitchen']]) {
    ui.find(node => node.props?.className === 'rd-staff-page-toggle').props.onClick(); ui.render();
    const navigation = ui.find(node => node.props?.className === 'rd-staff-mobile-pages');
    ui.find(node => node.type === 'button' && nodeText(node) === label, navigation).props.onClick(); ui.render();
    assert.equal(ui.focused(), `rd-panel-${id}`);
    assert.equal(ui.find(node => node.props?.className === 'rd-staff-page-toggle').props['aria-expanded'], false);
    assert.ok(ui.lastScroll().top > 0, 'page navigation reveals its content instead of resetting to the demo header');
  }
  ui.find(node => node.props?.className === 'rd-staff-page-toggle').props.onClick(); ui.render();
  let prevented = false, stopped = false;
  ui.find(node => node.props?.className === 'rd-header').props.onKeyDown({ key: 'Escape', preventDefault() { prevented = true; }, stopPropagation() { stopped = true; } }); ui.render();
  assert.equal(ui.focused(), 'rd-staff-page-toggle'); assert.ok(prevented && stopped);
  assert.equal(ui.find(node => node.props?.className === 'rd-staff-page-toggle').props['aria-expanded'], false);
});
