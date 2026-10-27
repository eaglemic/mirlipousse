import test from 'node:test';
import assert from 'node:assert/strict';
import { createCJClient, CJError } from './cj.mjs';

const NOW = Date.parse('2026-10-27T12:00:00Z');
const KEY = 'CLE-API-EXCLUSIVEMENT-FICTIVE';
const TOKEN = 'JETON-EXCLUSIVEMENT-FICTIF';
const json = (data, extra = {}) => new Response(JSON.stringify(data), {
  status: 200, headers: { 'Content-Type': 'application/json' }, ...extra,
});
const ok = data => json({ code: 200, result: true, success: true, data });
const auth = () => ok({ accessToken: TOKEN,
  accessTokenExpiryDate: new Date(NOW + 180 * 86400_000).toISOString() });
const expect = code => error => error instanceof CJError && error.code === code
  && error.message === code && !String(error.stack).includes(KEY);
function fake(handler) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, ...options, at: performance.now(), body: options.body ? JSON.parse(options.body) : undefined });
    assert.equal(new URL(url).origin, 'https://developers.cjdropshipping.com');
    assert.equal(options.redirect, 'error');
    if (url.endsWith('/authentication/getAccessToken')) return auth();
    return handler(new URL(url), calls.at(-1), calls);
  };
  return { calls, client: createCJClient({ apiKey: KEY, fetchImpl, now: () => NOW }) };
}
const order = () => ({
  orderNumber: 'MIR-TEST-001', shippingZip: '75001', shippingCountryCode: 'FR',
  shippingCountry: 'France', shippingProvince: 'Paris', shippingCity: 'Paris',
  shippingCustomerName: 'PERSONNE FICTIVE', shippingAddress: 'ADRESSE FICTIVE',
  logisticName: 'TRANSPORT FICTIF', fromCountryCode: 'DE',
  products: [{ vid: 'VID-TEST-1', quantity: 2 }],
});

test('clé absente ou invalide refusée avant tout appel', () => {
  assert.throws(() => createCJClient(), expect('CJ_NOT_CONFIGURED'));
  assert.throws(() => createCJClient({ apiKey: ' ' }), expect('CJ_NOT_CONFIGURED'));
  assert.throws(() => createCJClient({ apiKey: 'cle\ninjectee' }), expect('CJ_INVALID_ARGUMENT'));
  assert.throws(() => createCJClient({ apiKey: 'x'.repeat(201) }), expect('CJ_INVALID_ARGUMENT'));
});

test('auth POST stricte, produit réel de fixture, cache jeton RAM réutilisé', async () => {
  const { client, calls } = fake(url => ok({ pid: url.searchParams.get('pid'), productNameEn: 'FIXTURE' }));
  assert.equal((await client.getProduct('PID-1')).pid, 'PID-1');
  assert.equal((await client.getProduct('PID-2')).pid, 'PID-2');
  assert.equal(calls.length, 3);
  assert.equal(calls[0].method, 'POST');
  assert.deepEqual(calls[0].body, { apiKey: KEY });
  assert.equal(calls[0].headers['CJ-Access-Token'], undefined);
  assert.equal(calls[1].headers['CJ-Access-Token'], TOKEN);
  assert.equal(calls[1].at - calls[0].at >= 950, true, 'auth et lecture espacées pour le quota gratuit');
  assert.equal(JSON.stringify(await client.getProduct('PID-3')).includes(TOKEN), false);
});

test('appels concurrents coalescent une seule authentification', async () => {
  const { client, calls } = fake(url => ok({ pid: url.searchParams.get('pid') }));
  await Promise.all([client.getProduct('PID-1'), client.getProduct('PID-2'), client.getProduct('PID-3')]);
  assert.equal(calls.filter(call => call.url.endsWith('/authentication/getAccessToken')).length, 1);
});

test('date expirée invalide et renouvellement cache après expiration', async () => {
  let now = NOW; let authCalls = 0;
  const client = createCJClient({ apiKey: KEY, now: () => now, fetchImpl: async url => {
    if (url.endsWith('/authentication/getAccessToken')) {
      authCalls++;
      return ok({ accessToken: TOKEN, accessTokenExpiryDate: new Date(now + 60_000).toISOString() });
    }
    return ok({ pid: 'PID-1' });
  } });
  await client.getProduct('PID-1'); now += 61_000; await client.getProduct('PID-1');
  assert.equal(authCalls, 2);
  const expired = createCJClient({ apiKey: KEY, now: () => NOW,
    fetchImpl: async () => ok({ accessToken: TOKEN, accessTokenExpiryDate: '2020-01-01T00:00:00Z' }) });
  await assert.rejects(expired.getProduct('PID-1'), expect('CJ_RESPONSE_INVALID'));
});

test('401 invalide le cache sans réémettre la requête métier', async () => {
  let unauthorized = true;
  const { client, calls } = fake(url => unauthorized
    ? new Response('SECRET-FOURNISSEUR-FICTIF', { status: 401 })
    : ok({ pid: url.searchParams.get('pid') }));
  await assert.rejects(client.getProduct('PID-1'), expect('CJ_UNAUTHORIZED'));
  assert.equal(calls.length, 2); unauthorized = false;
  await client.getProduct('PID-1'); assert.equal(calls.length, 4);
});

test('code/result/success ne sont jamais verdis par coercition', async () => {
  for (const payload of [{ code: '200', result: true }, { code: 200, result: 'true' },
    { code: 200, result: false }, { code: 200, result: true, success: false }]) {
    const client = createCJClient({ apiKey: KEY, now: () => NOW, fetchImpl: async () => json(payload) });
    await assert.rejects(client.getProduct('PID-1'), expect('CJ_UPSTREAM_REJECTED'));
  }
});

test('stock contrôlé par VID et entrepôt, aucune quantité négative', async () => {
  const row = { vid: 'VID-1', countryCode: 'DE', totalInventoryNum: 12 };
  const { client } = fake(() => ok([row]));
  assert.deepEqual(await client.getStock('VID-1'), [row]);
  for (const bad of [{ ...row, vid: 'AUTRE' }, { ...row, totalInventoryNum: -1 },
    { ...row, countryCode: 'ZZ' }]) {
    const f = fake(() => ok([bad]));
    await assert.rejects(f.client.getStock('VID-1'), expect('CJ_RESPONSE_INVALID'));
  }
});

test('devis transport utilise origine, destination et VID/quantité officiels', async () => {
  const { client, calls } = fake(() => ok([{ logisticName: 'FRET FICTIF', logisticPrice: 4.71 }]));
  const data = await client.quoteShipping({ shippingCountryCode: 'BE', startCountryCode: 'DE',
    products: [{ vid: 'VID-1', quantity: 2 }] });
  assert.equal(data[0].logisticPrice, 4.71);
  assert.equal(new URL(calls[1].url).pathname, '/api2.0/v1/logistic/freightCalculate');
  assert.deepEqual(calls[1].body, { startCountryCode: 'DE', endCountryCode: 'BE',
    products: [{ vid: 'VID-1', quantity: 2 }] });
});

test('identifiants/quantités/pays invalides refusés sans authentification', async () => {
  const { client, calls } = fake(() => { throw Error('ne doit pas être appelé'); });
  for (const id of ['https://autre.invalid/x', '../PID', '', 'PID\nX']) {
    await assert.rejects(client.getProduct(id), expect('CJ_INVALID_ARGUMENT'));
  }
  for (const bad of [
    { shippingCountryCode: 'US', startCountryCode: 'DE', products: [{ vid: 'VID-1', quantity: 1 }] },
    { shippingCountryCode: 'FR', startCountryCode: 'ZZ', products: [{ vid: 'VID-1', quantity: 1 }] },
    { shippingCountryCode: 'FR', startCountryCode: 'DE', products: [{ vid: 'VID-1', quantity: 0 }] },
    { shippingCountryCode: 'FR', startCountryCode: 'DE', products: [{ vid: 'VID-1', quantity: 1.5 }] },
    { shippingCountryCode: 'FR', startCountryCode: 'DE', products: [{ vid: 'VID-1', quantity: 101 }] },
    { shippingCountryCode: 'FR', startCountryCode: 'DE', products: [] },
  ]) await assert.rejects(client.quoteShipping(bad), expect('CJ_INVALID_ARGUMENT'));
  assert.equal(calls.length, 0);
});

test('brouillon exclusivement sandbox avec payType3 explicitement transmis', async () => {
  const { client, calls } = fake(() => ok({ orderId: 'CJ-FICTIF-1', orderNumber: 'MIR-TEST-001' }));
  await client.createDraftOrder(order(), { sandbox: true });
  const call = calls[1];
  assert.equal(new URL(call.url).pathname, '/api2.0/v1/shopping/order/createOrderV2');
  assert.equal(call.body.payType, 3); assert.equal(call.body.isSandbox, 1);
  assert.equal(call.body.products[0].vid, 'VID-TEST-1');
  assert.equal(calls.some(item => /payBalance|confirmOrder/u.test(item.url)), false);
});

test('injection paiement, prix ou mode réel rejetée avant toute API', async () => {
  const { client, calls } = fake(() => { throw Error('ne doit pas être appelé'); });
  for (const options of [undefined, {}, { sandbox: false }, { sandbox: 1 }, { sandbox: true, pay: true }]) {
    await assert.rejects(client.createDraftOrder(order(), options), expect('CJ_SANDBOX_ONLY'));
  }
  for (const body of [{ ...order(), payType: 2 }, { ...order(), payType: '3' },
    { ...order(), isSandbox: 0 }, { ...order(), isSandbox: true }]) {
    await assert.rejects(client.createDraftOrder(body, { sandbox: true }), expect('CJ_SANDBOX_ONLY'));
  }
  for (const body of [{ ...order(), shopAmount: 0.01 }, { ...order(), products: [{ vid: 'VID-1', quantity: 1, unitPrice: 0.01 }] }]) {
    await assert.rejects(client.createDraftOrder(body, { sandbox: true }), expect('CJ_INVALID_ARGUMENT'));
  }
  await assert.rejects(client.createDraftOrder({ ...order(), shippingAddress: 'P'.repeat(2 * 1024 * 1024 + 1) },
    { sandbox: true }), expect('CJ_INVALID_ARGUMENT'));
  assert.equal(calls.length, 0);
});

test('paramètres absents/malformés et champs supplémentaires restent fermés', async () => {
  assert.throws(() => createCJClient(null), expect('CJ_INVALID_ARGUMENT'));
  const { client, calls } = fake(() => { throw Error('ne doit pas être appelé'); });
  await assert.rejects(client.quoteShipping(null), expect('CJ_INVALID_ARGUMENT'));
  await assert.rejects(client.quoteShipping({ shippingCountryCode: 'FR', startCountryCode: 'DE',
    products: [{ vid: 'VID-1', quantity: 1 }], url: 'https://autre.invalid' }), expect('CJ_INVALID_ARGUMENT'));
  await assert.rejects(client.createDraftOrder(null, { sandbox: true }), expect('CJ_INVALID_ARGUMENT'));
  assert.equal(calls.length, 0);
});

test('réponse >2MiB coupée en lecture et erreur sans données fournisseur', async () => {
  let cancelled = false;
  const body = new ReadableStream({ start(controller) {
    controller.enqueue(new Uint8Array(1024 * 1024));
    controller.enqueue(new Uint8Array(1024 * 1024 + 1));
  }, cancel() { cancelled = true; } });
  const client = createCJClient({ apiKey: KEY, now: () => NOW,
    fetchImpl: async () => new Response(body, { headers: { 'Content-Type': 'application/json' } }) });
  await assert.rejects(client.getProduct('PID-1'), expect('CJ_RESPONSE_TOO_LARGE'));
  assert.equal(cancelled, true);
});

test('délai12s effectif même si fetch ignore AbortSignal', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const client = createCJClient({ apiKey: KEY, now: () => NOW,
    fetchImpl: () => new Promise(() => {}) });
  const pending = assert.rejects(client.getProduct('PID-1'), expect('CJ_TIMEOUT'));
  context.mock.timers.tick(12_001);
  await pending;
});

test('erreurs réseau, HTML, JSON invalide et429 restent normalisées', async () => {
  const cases = [
    [async () => { throw Error(KEY + ' ADRESSE PERSONNELLE'); }, 'CJ_UNAVAILABLE'],
    [async () => new Response(KEY, { headers: { 'Content-Type': 'text/html' } }), 'CJ_RESPONSE_INVALID'],
    [async () => new Response('{' + KEY, { headers: { 'Content-Type': 'application/json' } }), 'CJ_RESPONSE_INVALID'],
    [async () => new Response(KEY, { status: 429 }), 'CJ_RATE_LIMIT'],
  ];
  for (const [fetchImpl, code] of cases) {
    const client = createCJClient({ apiKey: KEY, now: () => NOW, fetchImpl });
    await assert.rejects(client.getProduct('PID-1'), expect(code));
  }
});
