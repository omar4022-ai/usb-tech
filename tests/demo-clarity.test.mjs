import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(path.join(root, 'package.json'));

async function loadComponent(file) {
  const result = await build({
    absWorkingDir: root, entryPoints: [file], bundle: true, platform: 'node', format: 'cjs',
    write: false, external: ['react', 'react-dom', 'react/jsx-runtime'], loader: { '.css': 'empty' }, logLevel: 'silent',
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.outputFiles[0].text)(require, module, module.exports);
  return module.exports.default;
}

for (const name of ['CompanyDemo', 'AutomationDemo']) {
  test(`${name} starts with valid Arabic and English content and available assets`, async () => {
    const Component = await loadComponent(`src/components/demos/${name}.tsx`);
    for (const lang of ['ar', 'en']) {
      const html = renderToStaticMarkup(createElement(Component, { lang }));
      assert.ok(html.includes(`dir="${lang === 'ar' ? 'rtl' : 'ltr'}"`));
      assert.doesNotMatch(html, /(?:>undefined<|>NaN<)/);
      const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
      assert.equal(new Set(ids).size, ids.length, 'IDs used by labels must be unique');
      const images = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1]);
      for (const image of images) {
        assert.ok(image.startsWith('/'), 'Demo imagery is served locally');
        assert.ok(fs.existsSync(path.join(root, 'public', image)), `Asset exists: ${image}`);
      }
      assert.match(html, /<button/);
    }
  });
}

test('solution cards introduce both workflows and keep all six entry points', async () => {
  const Solutions = await loadComponent('src/components/Solutions.tsx');
  for (const lang of ['ar', 'en']) {
    const html = renderToStaticMarkup(createElement(Solutions, { lang, onSelectService() {} }));
    for (const name of ['company', 'identity', 'store', 'automation', 'hotel', 'restaurant']) {
      assert.ok(html.includes(`id="solution-${name}"`), `Entry point remains: ${name}`);
    }
    assert.ok(html.includes(lang === 'ar' ? 'جرّب مسار معاملة' : 'Try a request workflow'));
    assert.ok(html.includes(lang === 'ar' ? 'جرّب محادثة الشراء' : 'Try a shopping conversation'));
  }
});
