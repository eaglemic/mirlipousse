import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { createApp, configuration } from './server.mjs';
import { createCJClient, CJError } from './cj.mjs';

const ENV = Object.freeze({ CJ_API_KEY: 'CLE-CJ-FICTIVE-UNIQUEMENT',
  ADMIN_API_TOKEN: 'TOKEN-ADMIN-FICTIF-POUR-TESTS-32-CHARS',
  ALLOWED_ORIGIN: 'https://mirlipousse.onrender.com' });
const AUTH = { Authorization: 'Bearer ' + ENV.ADMIN_API_TOKEN };
const fake = () => ({ getSettings: async () => ({ authenticated: true, settingsReceived: true, sandbox: false }),
  listProducts: async () => [{ id: 'PID-1', nameEn: 'Objet fictif', sellPrice: '5.00', openId: 'PRIVE', accessToken: 'SECRET' }],
  getProduct: async () => ({ pid: 'PID-1', productNameEn: 'Produit fictif', sellPrice: '4.50', phone: 'PRIVE',
    variants: [{ vid: 'VID-1', variantNameEn: 'VARIANTE' }, { vid: '../url', variantNameEn: 'REFUSEE' }] }),
  getStock: async () => [{ vid: 'VID-1', countryCode: 'DE', totalInventoryNum: 12, owner: 'PRIVE' }] });
async function app(t, client = fake()) {
  const server = createApp({ env: ENV, client, now: () => Date.parse('2026-10-27T19:00:00Z') });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(async () => { server.closeAllConnections?.(); await new Promise(resolve => server.close(resolve)); });
  return { server, url: 'http://127.0.0.1:' + server.address().port };
}
const read = async (url, headers = AUTH) => {
  const res = await fetch(url, { headers, redirect: 'error' }); return { status: res.status, headers: res.headers, body: await res.json() };
};

test('configuration fermée sans secrets et origine HTTPS exacte', () => {
  for (const env of [{}, { ...ENV, CJ_API_KEY: '' }, { ...ENV, CJ_API_KEY: 'x\ny' },
    { ...ENV, ADMIN_API_TOKEN: 'court' }, { ...ENV, ALLOWED_ORIGIN: 'http://mirlipousse.onrender.com' },
    { ...ENV, ALLOWED_ORIGIN: 'https://mirlipousse.onrender.com/path' },
    { ...ENV, ALLOWED_ORIGIN: 'https://user:pass@mirlipousse.onrender.com' }]) {
    assert.throws(() => configuration(env), /^Error: CONFIGURATION_REQUIRED$/);
  }
  assert.equal(configuration(ENV).allowedOrigin, ENV.ALLOWED_ORIGIN);
});

test('health public ne prouve pas auth CJ et ne divulgue aucun secret', async t => {
  let calls = 0; const client = fake(); client.getSettings = async () => { calls++; return {}; };
  const { url } = await app(t, client); const res = await read(url + '/health', {});
  assert.equal(res.status, 200); assert.deepEqual(res.body, { succes: true, service: 'mirlipousse-cj-readonly', configured: true, cjVerified: false, achatsActives: false });
  assert.equal(calls, 0); assert.equal(JSON.stringify(res.body).includes(ENV.CJ_API_KEY), false);
  assert.equal(res.headers.get('cache-control'), 'no-store');
});

test('routes admin exigent Bearer exact, sans appel fournisseur', async t => {
  let calls = 0; const client = fake(); client.getSettings = async () => { calls++; return {}; };
  const { url } = await app(t, client);
  for (const headers of [{}, { Authorization: 'Bearer AUTRE-TOKEN-FICTIF-DE-32-CARACTERES' }, { Cookie: 'session=' + ENV.ADMIN_API_TOKEN }]) {
    assert.equal((await read(url + '/v1/admin/cj/status', headers)).status, 401);
  }
  assert.equal((await read(url + '/v1/admin/cj/status?token=' + ENV.ADMIN_API_TOKEN, {})).status, 401);
  assert.equal(calls, 0);
});

test('Origin exacte acceptée, les autres refusées même token correct', async t => {
  const { url } = await app(t);
  for (const origin of ['https://autre.invalid', 'null', ENV.ALLOWED_ORIGIN + '.evil.invalid']) {
    const res = await read(url + '/v1/admin/cj/status', { ...AUTH, Origin: origin });
    assert.equal(res.status, 403); assert.equal(res.headers.get('access-control-allow-origin'), null);
  }
  const good = await read(url + '/v1/admin/cj/status', { ...AUTH, Origin: ENV.ALLOWED_ORIGIN });
  assert.equal(good.status, 200); assert.equal(good.headers.get('access-control-allow-origin'), ENV.ALLOWED_ORIGIN);
  assert.equal((await read(url + '/v1/admin/cj/status')).status, 200);
});

test('status réel du client réduit, health actualisé seulement après réussite', async t => {
  const { url } = await app(t);
  const res = await read(url + '/v1/admin/cj/status');
  assert.deepEqual(res.body, { succes: true, authentification: true, parametresRecus: true, sandbox: false,
    verifiedAt: '2026-10-27T19:00:00.000Z', achatsActives: false, commandesActivees: false });
  assert.equal((await read(url + '/health', {})).body.cjVerified, true);
});

test('catalogue réduit aux champs de produit et fermé pour achats', async t => {
  const { url } = await app(t); const res = await read(url + '/v1/admin/cj/products?term=wooden%20toy&size=5');
  assert.equal(res.status, 200); assert.deepEqual(res.body.produits, [{ pid: 'PID-1', nom: 'Objet fictif', prixFournisseurUSD: '5.00',
    statut: 'brouillon_non_qualifie', conformiteEnfantValidee: false, achatsActives: false }]);
  assert.equal(JSON.stringify(res.body).includes('PRIVE'), false); assert.equal(JSON.stringify(res.body).includes('SECRET'), false);
});

test('paramètres inconnus, doublons et pagination excessive refusés', async t => {
  let calls = 0; const client = fake(); client.listProducts = async () => { calls++; return []; };
  const { url } = await app(t, client);
  for (const query of ['', '?term=', '?term=x&size=11', '?term=x&size=1.0', '?term=x&size=-1', '?term=x&term=y', '?term=x&__proto__=y', '?term=x&url=https://autre.invalid']) {
    assert.equal((await read(url + '/v1/admin/cj/products' + query)).status, 400);
  }
  assert.equal(calls, 0);
});

test('produit et stock projetés, variantes invalides non renvoyées', async t => {
  const { url } = await app(t); const product = await read(url + '/v1/admin/cj/product/PID-1');
  assert.equal(product.status, 200); assert.equal(product.body.produit.pid, 'PID-1');
  assert.deepEqual(product.body.produit.variantes, [{ vid: 'VID-1', nom: 'VARIANTE' }]);
  const stock = await read(url + '/v1/admin/cj/stock/VID-1');
  assert.deepEqual(stock.body.entrepots, [{ pays: 'DE', quantite: 12 }]);
  assert.equal(JSON.stringify([product.body, stock.body]).includes('PRIVE'), false);
});

test('aucune route commerciale ni proxy arbitraire ni méthode POST', async t => {
  const { url } = await app(t);
  for (const path of ['/v1/admin/cj/order', '/v1/admin/cj/checkout', '/v1/admin/cj/product/https%3A%2F%2Fautre.invalid', '/__proto__', '/v1/admin/cj/status?url=x']) {
    assert.equal((await read(url + path)).status, 404);
  }
  const post = await fetch(url + '/v1/admin/cj/products?term=x', { method: 'POST', headers: AUTH });
  assert.equal(post.status, 405);
});

test('corps, même sur GET, refusé sans accumulation ni appel CJ', async t => {
  const { server } = await app(t);
  const result = await new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port: server.address().port, path: '/v1/admin/cj/status', method: 'GET',
      headers: { ...AUTH, 'Content-Length': '10000000' } }, res => { let text = ''; res.on('data', x => text += x); res.on('end', () => resolve({ status: res.statusCode, text })); });
    req.on('error', reject); req.end();
  });
  assert.equal(result.status, 413); assert.equal(JSON.parse(result.text).code, 'BODY_NOT_ALLOWED');
});

test('deux Authorization ne sont pas acceptés par ambiguïté', async t => {
  const { server } = await app(t);
  const status = await new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port: server.address().port, path: '/v1/admin/cj/status',
      headers: ['Host', '127.0.0.1', 'Authorization', AUTH.Authorization, 'Authorization', 'Bearer AUTRE'] }, res => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
    req.on('error', reject); req.end();
  });
  assert.equal(status, 401);
});

test('erreurs fournisseur ou inattendues expurgées, aucun faux statut vérifié', async t => {
  const client = fake(); client.getSettings = async () => { throw Error('SECRET FOURNISSEUR ' + ENV.CJ_API_KEY); };
  const { url } = await app(t, client); const res = await read(url + '/v1/admin/cj/status');
  assert.equal(res.status, 502); assert.deepEqual(res.body, { succes: false, code: 'CJ_UPSTREAM_UNAVAILABLE' });
  assert.equal((await read(url + '/health', {})).body.cjVerified, false);
  client.getSettings = async () => { throw new CJError('CJ_RATE_LIMIT', 503); };
  const quota = await read(url + '/v1/admin/cj/status'); assert.equal(quota.status, 503); assert.equal(quota.body.code, 'CJ_RATE_LIMIT');
});

test('borne de concurrence : troisième appel refuse sans appel supplémentaire', async t => {
  let calls = 0; let release;
  const gate = new Promise(resolve => release = resolve); const client = fake();
  client.getSettings = async () => { calls++; await gate; return { authenticated: true, settingsReceived: true }; };
  const { url } = await app(t, client);
  const one = read(url + '/v1/admin/cj/status'); const two = read(url + '/v1/admin/cj/status');
  for (let i = 0; calls < 2 && i < 100; i++) await new Promise(r => setTimeout(r, 2));
  assert.equal(calls, 2); const third = await read(url + '/v1/admin/cj/status');
  assert.equal(third.status, 503); assert.equal(calls, 2); release();
  assert.equal((await one).status, 200); assert.equal((await two).status, 200);
});

const ok = data => new Response(JSON.stringify({ code: 200, result: true, success: true, data }), { headers: { 'Content-Type': 'application/json' } });
function fixture(handler) {
  const calls = [];
  const client = createCJClient({ apiKey: ENV.CJ_API_KEY, fetchImpl: async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/authentication/getAccessToken')) return ok({ accessToken: 'JETON-FAUX-UNIQUEMENT', accessTokenExpiryDate: '2099-01-01T00:00:00Z' });
    return handler(new URL(url), options);
  } });
  return { client, calls };
}

test('nouveaux endpoints client : auth, settings et listeV2 fixes avec cache RAM', async () => {
  const { client, calls } = fixture(url => url.pathname.endsWith('/setting/get')
    ? ok({ setting: {}, isSandbox: false }) : ok({ content: [{ productList: [{ id: 'PID-1', nameEn: 'FICTIF', sellPrice: '2.00' }] }] }));
  assert.deepEqual(await client.getSettings(), { authenticated: true, settingsReceived: true, sandbox: false });
  assert.equal((await client.listProducts('wooden toy', 5)).length, 1);
  assert.equal(calls.length, 3); const url = new URL(calls[2].url);
  assert.equal(url.pathname, '/api2.0/v1/product/listV2'); assert.equal(url.searchParams.get('page'), '1');
  assert.equal(url.searchParams.get('size'), '5'); assert.equal(url.searchParams.get('keyWord'), 'wooden toy');
});

test('listeV2 invalide et arguments refusés sans coercition', async () => {
  const { client, calls } = fixture(() => ok({ content: [{ productList: [{ id: '../evil', nameEn: 'NON' }] }] }));
  for (const args of [['x', 11], [' x', 5], ['', 1], ['x', '5'], ['x\ny', 1]]) await assert.rejects(client.listProducts(...args), { code: 'CJ_INVALID_ARGUMENT' });
  assert.equal(calls.length, 0); await assert.rejects(client.listProducts('x', 5), { code: 'CJ_RESPONSE_INVALID' });
  const missing = fixture(() => ok({})); await assert.rejects(missing.client.getSettings(), { code: 'CJ_RESPONSE_INVALID' });
});

test('préflight CORS des seules routes admin : 204 sans Bearer ni appel CJ', async t => {
  let calls = 0;
  const client = Object.fromEntries(['getSettings', 'listProducts', 'getProduct', 'getStock']
    .map(name => [name, async () => { calls++; throw Error('AUCUN_APPEL_CJ_ATTENDU'); }]));
  const { url } = await app(t, client);
  for (const path of ['/v1/admin/cj/status', '/v1/admin/cj/products?term=x&size=5',
    '/v1/admin/cj/product/PID-1', '/v1/admin/cj/stock/VID-1']) {
    const response = await fetch(url + path, { method: 'OPTIONS', headers: {
      Origin: ENV.ALLOWED_ORIGIN, 'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'authorization' } });
    assert.equal(response.status, 204); assert.equal(await response.text(), '');
    assert.equal(response.headers.get('access-control-allow-origin'), ENV.ALLOWED_ORIGIN);
    assert.equal(response.headers.get('access-control-allow-methods'), 'GET');
    assert.equal(response.headers.get('access-control-allow-headers'), 'Authorization');
    assert.equal(response.headers.get('vary'), 'Origin');
  }
  assert.equal(calls, 0); assert.equal((await read(url + '/health', {})).body.cjVerified, false);
});

test('préflight refuse origine, méthode, headers et routes inconnus sans fournisseur', async t => {
  let calls = 0; const client = fake(); client.getSettings = async () => { calls++; return {}; };
  const { url } = await app(t, client);
  const headers = { Origin: ENV.ALLOWED_ORIGIN, 'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'authorization' };
  for (const change of [{ Origin: 'https://autre.invalid' }, { Origin: 'null' },
    { Origin: '' }, { 'Access-Control-Request-Method': 'POST' },
    { 'Access-Control-Request-Method': 'HEAD' }, { 'Access-Control-Request-Headers': 'x-extra' },
    { 'Access-Control-Request-Headers': 'authorization, x-extra' },
    { 'Access-Control-Request-Headers': '' }]) {
    const response = await fetch(url + '/v1/admin/cj/status', { method: 'OPTIONS', headers: { ...headers, ...change } });
    assert.equal(response.status, 403); assert.equal(response.headers.get('access-control-allow-methods'), null);
  }
  const withoutOrigin = { ...headers }; delete withoutOrigin.Origin;
  assert.equal((await fetch(url + '/v1/admin/cj/status', { method: 'OPTIONS', headers: withoutOrigin })).status, 403);
  for (const path of ['/health', '/v1/admin/cj/orders', '/v1/admin/cj/product/../orders', '/v1/admin/cj/stock/' + 'x'.repeat(129)]) {
    assert.equal((await fetch(url + path, { method: 'OPTIONS', headers })).status, 404);
  }
  assert.equal(calls, 0);
});

test('un préflight accepté ne dispense jamais le GET de son Bearer', async t => {
  let calls = 0; const client = fake(); client.getSettings = async () => { calls++; return { authenticated: true, settingsReceived: true }; };
  const { url } = await app(t, client);
  assert.equal((await fetch(url + '/v1/admin/cj/status', { method: 'OPTIONS', headers: {
    Origin: ENV.ALLOWED_ORIGIN, 'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'Authorization' } })).status, 204);
  assert.equal((await read(url + '/v1/admin/cj/status', { Origin: ENV.ALLOWED_ORIGIN })).status, 401);
  assert.equal((await read(url + '/v1/admin/cj/status', { Origin: ENV.ALLOWED_ORIGIN, Authorization: 'Bearer AUTRE-TOKEN-FICTIF-DE-32-CARACTERES' })).status, 401);
  assert.equal(calls, 0);
  assert.equal((await read(url + '/v1/admin/cj/status', { Origin: ENV.ALLOWED_ORIGIN, ...AUTH })).status, 200);
  assert.equal(calls, 1);
});
