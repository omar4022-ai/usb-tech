import test from 'node:test';
import assert from 'node:assert/strict';

// These probes never submit a valid mail request. Run only against the isolated
// contact endpoint, using USB_TECH_CONTACT_TEST_URL to select it explicitly.
const endpoint = process.env.USB_TECH_CONTACT_TEST_URL;
const origin = 'https://usb-tech.ly';
const validFields = {
  name: 'USB TECH endpoint verification',
  business: '',
  contact: 'test@example.com',
  service: 'company',
  brief: 'Validation probe — no message should be sent.',
  language: 'en',
  website: '',
};

function endpointTest(name, callback) {
  test(name, { skip: !endpoint && 'Set USB_TECH_CONTACT_TEST_URL to run API probes.' }, callback);
}

async function request(options = {}) {
  return fetch(endpoint, {
    redirect: 'error',
    signal: AbortSignal.timeout(10000),
    ...options,
    headers: { Origin: origin, ...options.headers },
  });
}

async function rejectedPost(body, expectedCode = 'invalid_fields', expectedStatus = 422) {
  const response = await request({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  assert.equal(response.status, expectedStatus);
  assert.equal(response.headers.get('access-control-allow-origin'), origin);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { success: false, code: expectedCode });
}

endpointTest('preflight allows the deployed website and JSON POST', async () => {
  const response = await request({
    method: 'OPTIONS',
    headers: { 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' },
  });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), origin);
  assert.match(response.headers.get('access-control-allow-methods'), /\bPOST\b/);
  assert.match(response.headers.get('access-control-allow-headers'), /Content-Type/i);
});

endpointTest('foreign origins cannot access the endpoint', async () => {
  const response = await request({ method: 'OPTIONS', headers: { Origin: 'https://example.com' } });
  assert.equal(response.status, 403);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
  assert.deepEqual(await response.json(), { success: false, code: 'origin_not_allowed' });
});

endpointTest('GET cannot send mail', async () => {
  const response = await request();
  assert.equal(response.status, 405);
  assert.deepEqual(await response.json(), { success: false, code: 'method_not_allowed' });
});

endpointTest('form-encoded submissions cannot bypass the JSON preflight', async () => {
  const response = await request({
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'name=test',
  });
  assert.equal(response.status, 415);
  assert.deepEqual(await response.json(), { success: false, code: 'json_required' });
});

endpointTest('malformed JSON is rejected', () => rejectedPost('{', 'invalid_json', 400));
endpointTest('oversized payloads are rejected', () => rejectedPost('x'.repeat(32769), 'request_too_large', 413));
endpointTest('honeypot entries do not send mail', () => rejectedPost({ ...validFields, website: 'https://example.com' }));
endpointTest('header-injection attempts do not send mail', () => rejectedPost({ ...validFields, contact: 'sender@example.com\r\nBcc: other@example.com' }));
endpointTest('unknown services are rejected', () => rejectedPost({ ...validFields, service: 'anything' }));
endpointTest('unsupported languages are rejected', () => rejectedPost({ ...validFields, language: 'zz' }));
endpointTest('empty required fields are rejected', () => rejectedPost({ ...validFields, name: ' ' }));
endpointTest('nested objects cannot replace text fields', () => rejectedPost({ ...validFields, contact: { email: 'test@example.com' } }));
endpointTest('overlong UTF-8 briefs are rejected', () => rejectedPost({ ...validFields, brief: 'م'.repeat(4001) }));
