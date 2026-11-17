import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const runtime = require('react/jsx-runtime');

test('hotel search and management links focus their destination without changing booking rules', () => {
  const slots = [];
  let cursor = 0;
  let frames = [];
  let tree;
  let lang = 'en';
  const focused = [];
  const scrolled = [];
  const hooks = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useReducer(reducer, argument, initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial ? initial(argument) : argument;
      return [slots[index], action => { slots[index] = reducer(slots[index], action); }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useId() { cursor++; return 'hotel-test'; },
  };
  function children(node, result = []) {
    if (!node || typeof node === 'boolean') return result;
    if (Array.isArray(node)) { node.forEach(child => children(child, result)); return result; }
    if (typeof node === 'object') {
      result.push(node);
      children(node.props?.children, result);
    }
    return result;
  }
  function text(node) {
    if (node == null || typeof node === 'boolean') return '';
    if (Array.isArray(node)) return node.map(text).join(' ');
    return typeof node === 'object' ? text(node.props?.children) : String(node);
  }
  function targetName(node) {
    if (node.props?.className === 'ht-reservation-card') return 'reservation:' + text(node).match(/DEMO-STAY-\d+/)?.[0];
    if (node.type === 'h4' && text(node).includes('options for your stay')) return 'search-results';
    return node.props?.id || node.props?.className || node.type;
  }
  function fakeElement(node) {
    const name = targetName(node);
    return {
      focus() { focused.push(name); },
      scrollIntoView() { scrolled.push(name); },
      closest() { return { scrollTo() { scrolled.push('stage-top'); } }; },
      querySelector() { return { focus() { focused.push('booking-name'); } }; },
    };
  }
  const module = { exports: {} };
  const source = fs.readFileSync(new URL('../src/components/demos/HotelDemo.tsx', import.meta.url), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText, {
    module, exports: module.exports,
    require: name => name.endsWith('.css') ? {} : name === 'react' ? hooks : name === 'react/jsx-runtime' ? runtime : require(name),
    Date, Intl, console,
    requestAnimationFrame: callback => frames.push(callback),
    document: { getElementById: id => { const node = children(tree).find(item => item.props?.id === id); return node ? fakeElement(node) : null; } },
  });
  const Component = module.exports.default;
  function render() {
    cursor = 0;
    tree = Component({ lang });
    children(tree).forEach(node => { if (node.props?.ref) node.props.ref.current = fakeElement(node); });
    const pending = frames; frames = []; pending.forEach(callback => callback());
  }
  function find(predicate, root = tree) { const node = children(root).find(predicate); assert(node, 'Expected UI control'); return node; }
  function byClass(name) { return find(node => node.props?.className?.split(' ').includes(name)); }
  function button(label, root = tree) { return find(node => node.type === 'button' && text(node).trim().startsWith(label), root); }
  function click(node) { assert(!node.props.disabled); node.props.onClick(); render(); }
  function change(node, value) { node.props.onChange({ target: { value } }); render(); }
  function submit(node) { node.props.onSubmit({ preventDefault() {} }); render(); }

  render();
  const dates = children(byClass('ht-search-form')).filter(node => node.type === 'input');
  const originalDeparture = dates[1].props.value;
  change(dates[1], dates[0].props.value);
  submit(byClass('ht-search-form'));
  assert(text(tree).includes('Departure must be after arrival.'));
  assert(!focused.includes('search-results'));
  change(children(byClass('ht-search-form')).filter(node => node.type === 'input')[1], originalDeparture);
  submit(byClass('ht-search-form'));
  assert.equal(focused.at(-1), 'search-results');
  assert.equal(scrolled.at(-1), 'search-results');

  const room = find(node => node.type === 'article' && node.props.className?.includes('ht-room-result') && text(node).includes('104'));
  click(button('Select room', room));
  const bookingForm = find(node => node.type === 'form', byClass('ht-booking-summary'));
  submit(bookingForm);
  assert.equal(slots[0].bookings.length, 3, 'An empty reservation name must not create a booking');
  change(find(node => node.type === 'input', byClass('ht-booking-summary')), 'DEMO mobile guest');
  submit(find(node => node.type === 'form', byClass('ht-booking-summary')));
  assert.equal(slots[0].bookings[0].code, 'DEMO-STAY-1004');
  assert.equal(slots[0].bookings[0].room, 104);
  assert.equal(slots[0].bookings[0].total, 360);

  click(button('View in management'));
  assert.equal(focused.at(-1), 'reservation:DEMO-STAY-1004');
  assert.equal(scrolled.at(-1), 'reservation:DEMO-STAY-1004');
  assert.equal(slots[0].bookings[0].status, 'reserved');
  click(button('Check in', byClass('ht-reservation-card')));
  assert.equal(slots[0].bookings[0].status, 'checkedIn');
  click(button('Check out', byClass('ht-reservation-card')));
  assert.equal(slots[0].bookings[0].status, 'checkedOut');
  lang = 'ar'; render();
  assert(text(tree).includes('تمت المغادرة'));
  assert.equal(slots[0].bookings[0].total, 360);
  lang = 'en'; render();
  for (const [tab, expectedHeading] of [['Calendar', 'Your week at a glance.'], ['Overview', 'Today’s activity'], ['Bookings', 'Reservation register']]) {
    click(button(tab, byClass('ht-staff-nav')));
    assert.equal(focused.at(-1), 'ht-staff-content-heading');
    assert.equal(scrolled.at(-1), 'ht-staff-content-heading');
    assert.equal(text(byClass('ht-staff-content-heading')), expectedHeading);
    assert.equal(slots[0].bookings[0].status, 'checkedOut');
  }
});
