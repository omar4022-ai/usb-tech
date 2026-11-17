import { createRequire } from 'node:module';
import test from 'node:test';
const require = createRequire(import.meta.url);
// Exercise the real React handlers and reducer without a browser or network.
test('guided request keeps roles separate through creation, review, final approval and rework', () => {
    const fs = require('fs'), ts = require('typescript'), vm = require('vm'), assert = require('assert'), rt = require('react/jsx-runtime');
    let slots = [], cursor = 0, raf = [];
    const hooks = { useState(init) { const i = cursor++; if (!(i in slots))
            slots[i] = typeof init === 'function' ? init() : init; return [slots[i], v => slots[i] = typeof v === 'function' ? v(slots[i]) : v]; }, useReducer(r, a, init) { const i = cursor++; if (!(i in slots))
            slots[i] = init ? init(a) : a; return [slots[i], a => slots[i] = r(slots[i], a)]; }, useRef(v) { const i = cursor++; if (!(i in slots))
            slots[i] = { current: v }; return slots[i]; }, useId() { cursor++; return 'test-company'; } };
    const moduleObj = { exports: {} };
    const source = fs.readFileSync(new URL('../src/components/demos/CompanyDemo.tsx', import.meta.url), 'utf8') + '\nexport {companyReducer, initialCompany, visibleTransactions};';
    vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { module: moduleObj, exports: moduleObj.exports, require: n => n.endsWith('.css') ? {} : n === 'react' ? hooks : n === 'react/jsx-runtime' ? rt : require(n), Date, Intl, Set, Map, console, requestAnimationFrame: f => raf.push(f) });
    const { default: Component, companyReducer: reduce, initialCompany: initial, visibleTransactions: visible } = moduleObj.exports;
    let lang = 'en', tree, focuses = 0;
    function nodes(n, out = []) { if (n == null || typeof n === 'boolean')
        return out; if (Array.isArray(n)) {
        n.forEach(c => nodes(c, out));
        return out;
    } if (typeof n === 'object') {
        if (typeof n.type === 'function')
            return nodes(n.type(n.props), out);
        out.push(n);
        nodes(n.props?.children, out);
    } return out; }
    function text(n) { if (n == null || typeof n === 'boolean')
        return ''; if (Array.isArray(n))
        return n.map(text).join(' '); if (typeof n === 'object')
        return typeof n.type === 'function' ? text(n.type(n.props)) : text(n.props?.children); return String(n); }
    function render() { cursor = 0; tree = Component({ lang }); nodes(tree).forEach(n => { if (n.props?.ref?.current !== undefined)
        n.props.ref.current = { focus() { focuses++; }, scrollIntoView() { }, closest() { return { scrollTo() { } }; } }; }); const jobs = raf; raf = []; jobs.forEach(f => f()); }
    function find(p, root = tree) { const n = nodes(root).find(p); assert(n, 'Missing target'); return n; }
    function cls(c) { return find(n => n.props?.className?.split(' ').includes(c)); }
    function btn(s, root = tree) { return find(n => n.type === 'button' && text(n).trim().startsWith(s), root); }
    function click(n) { assert(!n.props.disabled); n.props.onClick({ currentTarget: { focus() { } }, preventDefault() { }, stopPropagation() { } }); render(); }
    function guide() { click(find(n => n.type === 'button' && n.props.className === 'cmp-button cmp-primary', cls('cmp-guide'))); }
    function current() { return slots[0].transactions.find(t => t.id === 'DEMO-TX-106'); }
    render();
    assert(text(tree).includes('A transaction is a work request.'));
    assert(text(tree).includes('Civil registry:'));
    const count = slots[0].transactions.length;
    click(btn('Try a request from start to finish'));
    assert.equal(slots[1], 'employee-a');
    assert.equal(slots[0].transactions.length, count);
    assert(cls('cmp-create-form'));
    cls('cmp-create-form').props.onSubmit({ preventDefault() { } });
    render();
    assert.equal(slots[0].transactions.length, count + 1);
    assert.equal(current().createdBy, 'employee-a');
    assert.equal(current().status, 'new');
    guide();
    assert.equal(current().status, 'new');
    click(btn('Start preparing'));
    assert.equal(current().status, 'processing');
    click(btn('Send to reviewer'));
    assert.equal(current().status, 'review');
    click(btn('Continue as Reviewer', cls('cmp-next-step')));
    assert.equal(slots[1], 'reviewer');
    assert.equal(current().status, 'review');
    assert(!nodes(tree).some(n => n.type === 'button' && text(n) === 'Give final approval'));
    click(btn('Review complete — send to manager'));
    assert.equal(current().status, 'approval');
    assert.equal(current().reviewedBy, 'reviewer');
    assert(visible(slots[0], 'reviewer').some(t => t.id === current().id));
    click(btn('Continue as Manager', cls('cmp-next-step')));
    assert.equal(slots[1], 'admin');
    assert.equal(current().status, 'approval');
    click(btn('Give final approval'));
    assert.equal(current().status, 'approved');
    click(btn('View request history', cls('cmp-next-step')));
    assert.equal(slots[2], 'audit');
    assert.equal(slots[0].audit.filter(e => e.target === current().id).length, 5);
    assert.deepEqual(Array.from(slots[0].audit.filter(e => e.target === current().id).map(e => e.actor)), ['employee-a', 'employee-a', 'employee-a', 'reviewer', 'admin']);
    assert(focuses > 4);
    lang = 'ar';
    render();
    assert(text(tree).includes('وصل الطلب إلى الاعتماد'));
    assert(text(tree).includes('مَن فعل ماذا، ومتى؟'));
    assert.equal(current().status, 'approved');
    // Opening the request history keeps the audit entries in view.
    assert(btn('عرض الدليل'));
    assert(find(n => n.props?.id === 'test-company-guide-body').props.hidden);
    lang = 'en';
    render();
    assert(find(n => n.props?.id === 'test-company-guide-body').props.hidden);
    click(btn('Show guide'));
    assert(!find(n => n.props?.id === 'test-company-guide-body').props.hidden);
    let state = initial;
    const action = (actor, type, extra = {}) => ({ actor, type, time: '2026-11-18T10:00:00Z', ...extra });
    let denied = reduce(state, action('reviewer', 'approve', { id: 'DEMO-TX-103' }));
    assert.equal(denied.feedback, 'denied');
    denied = reduce(state, action('admin', 'approve', { id: 'DEMO-TX-103' }));
    assert.equal(denied.feedback, 'denied');
    denied = reduce(state, action('employee-b', 'check', { id: 'DEMO-TX-103' }));
    assert.equal(denied.feedback, 'denied');
    denied = reduce(state, action('employee-b', 'start', { id: 'DEMO-TX-101' }));
    assert.equal(denied.feedback, 'denied');
    state = reduce(state, action('admin', 'permission', { member: 'reviewer', permission: 'review', value: false }));
    denied = reduce(state, action('reviewer', 'check', { id: 'DEMO-TX-103' }));
    assert.equal(denied.feedback, 'denied');
    state = reduce(state, action('admin', 'permission', { member: 'reviewer', permission: 'review', value: true }));
    state = reduce(state, action('reviewer', 'check', { id: 'DEMO-TX-103' }));
    assert.equal(state.transactions.find(t => t.id === 'DEMO-TX-103').status, 'approval');
    denied = reduce(state, action('reviewer', 'approve', { id: 'DEMO-TX-103' }));
    assert.equal(denied.feedback, 'denied');
    denied = reduce(state, action('admin', 'reject', { id: 'DEMO-TX-103', note: ' ' }));
    assert.equal(denied.feedback, 'invalid');
    state = reduce(state, action('admin', 'reject', { id: 'DEMO-TX-103', note: 'Please clarify' }));
    assert.equal(state.transactions.find(t => t.id === 'DEMO-TX-103').status, 'rejected');
    assert(visible(state, 'reviewer').some(t => t.id === 'DEMO-TX-103'));
    state = reduce(state, action('employee-a', 'start', { id: 'DEMO-TX-103' }));
    state = reduce(state, action('employee-a', 'submit', { id: 'DEMO-TX-103' }));
    state = reduce(state, action('reviewer', 'check', { id: 'DEMO-TX-103' }));
    state = reduce(state, action('admin', 'approve', { id: 'DEMO-TX-103' }));
    assert.equal(state.transactions.find(t => t.id === 'DEMO-TX-103').status, 'approved');
    console.log('PASS: real guide handlers create → prepare → review → manager approval → audit; navigation causes no mutation; role attribution; AR/EN state and collapsed guide; focus callbacks; early approval/ownership/permission guards; required return note and complete rework cycle. No browser/network.');
});
