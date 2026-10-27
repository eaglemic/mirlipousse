/** Mirlipousse CJ : administration en lecture seule. Aucun endpoint commercial. */
import http from 'node:http';
import { createHash, timingSafeEqual } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createCJClient, CJError } from './cj.mjs';

const ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u;
const hash = value => createHash('sha256').update(value).digest();
const draft = Object.freeze({ statut: 'brouillon_non_qualifie', conformiteEnfantValidee: false, achatsActives: false });
const amount = value => typeof value === 'string' && /^\d{1,10}(?:\.\d{1,4})?$/u.test(value) ? value : null;
const label = value => typeof value === 'string' && value.length <= 500 && !/[\u0000-\u001f\u007f]/u.test(value) ? value : null;

export function configuration(env) {
  const key = env?.CJ_API_KEY;
  const admin = env?.ADMIN_API_TOKEN;
  const allowedOrigin = env?.ALLOWED_ORIGIN;
  if (typeof key !== 'string' || !/^[!-~]{8,200}$/u.test(key)
      || typeof admin !== 'string' || !/^[A-Za-z0-9_-]{32,256}$/u.test(admin)
      || typeof allowedOrigin !== 'string') throw Error('CONFIGURATION_REQUIRED');
  let url;
  try { url = new URL(allowedOrigin); } catch { throw Error('CONFIGURATION_REQUIRED'); }
  if (url.protocol !== 'https:' || url.origin !== allowedOrigin || url.username || url.password) throw Error('CONFIGURATION_REQUIRED');
  return { key, adminDigest: hash(admin), allowedOrigin };
}

export function createApp({ env = process.env, client: suppliedClient, now = Date.now } = {}) {
  const config = configuration(env);
  const client = suppliedClient ?? createCJClient({ apiKey: config.key });
  let lastVerifiedAt = null;
  let pending = 0;
  const server = http.createServer({ maxHeaderSize: 8192 }, async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
    res.setHeader('Connection', 'close');
    const reply = (status, body) => {
      if (res.writableEnded || res.destroyed) return;
      const payload = req.method === 'HEAD' ? '' : JSON.stringify(body);
      res.writeHead(status);
      res.end(payload);
    };
    // Aucun corps n'est accepté, y compris sur GET ; ne jamais l'accumuler.
    if (req.headers['transfer-encoding'] || req.headers['content-length'] !== undefined
        && req.headers['content-length'] !== '0') {
      req.resume(); reply(413, { succes: false, code: 'BODY_NOT_ALLOWED' }); return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
      req.resume(); reply(405, { succes: false, code: 'METHOD_NOT_ALLOWED' }); return;
    }
    let url;
    try {
      if (!req.url?.startsWith('/') || req.url.startsWith('//') || req.url.length > 1024) throw Error();
      url = new URL(req.url, 'http://local.invalid');
    } catch { reply(400, { succes: false, code: 'INVALID_REQUEST' }); return; }
    if (url.pathname === '/health' && !url.search && req.method !== 'OPTIONS') {
      reply(200, { succes: true, service: 'mirlipousse-cj-readonly', configured: true,
        cjVerified: lastVerifiedAt !== null, achatsActives: false }); return;
    }
    const origin = req.headers.origin;
    if (origin !== undefined && origin !== config.allowedOrigin) {
      reply(403, { succes: false, code: 'ORIGIN_REFUSED' }); return;
    }
    if (origin === config.allowedOrigin) {
      res.setHeader('Access-Control-Allow-Origin', config.allowedOrigin);
      res.setHeader('Vary', 'Origin');
    }
    // Préflight CORS seulement : il n'authentifie pas CJ et n'appelle aucun client.
    if (req.method === 'OPTIONS') {
      const match = /^\/v1\/admin\/cj\/(?:product|stock)\/([A-Za-z0-9._-]+)$/u.exec(url.pathname);
      const knownRoute = ['/v1/admin/cj/status', '/v1/admin/cj/products'].includes(url.pathname)
        || match && ID.test(match[1]);
      if (!knownRoute) { reply(404, { succes: false, code: 'NOT_FOUND' }); return; }
      const requestedHeaders = req.headers['access-control-request-headers'];
      if (origin !== config.allowedOrigin || req.headers['access-control-request-method'] !== 'GET'
          || typeof requestedHeaders !== 'string' || requestedHeaders.trim().toLowerCase() !== 'authorization') {
        reply(403, { succes: false, code: 'CORS_PREFLIGHT_REFUSED' }); return;
      }
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization');
      res.writeHead(204); res.end(); return;
    }
    if (req.rawHeaders.filter((value, index) => index % 2 === 0 && value.toLowerCase() === 'authorization').length > 1) {
      reply(401, { succes: false, code: 'AUTH_REQUIRED' }); return;
    }
    const auth = req.headers.authorization;
    const token = typeof auth === 'string' && /^Bearer [A-Za-z0-9_-]{32,256}$/u.test(auth) ? auth.slice(7) : '';
    if (!timingSafeEqual(hash(token), config.adminDigest)) {
      reply(401, { succes: false, code: 'AUTH_REQUIRED' }); return;
    }
    if (!url.pathname.startsWith('/v1/admin/cj/')) { reply(404, { succes: false, code: 'NOT_FOUND' }); return; }
    if (req.method !== 'GET') { reply(405, { succes: false, code: 'METHOD_NOT_ALLOWED' }); return; }
    const params = [...url.searchParams.keys()];
    if (new Set(params).size !== params.length) { reply(400, { succes: false, code: 'INVALID_ARGUMENT' }); return; }
    let action;
    if (url.pathname === '/v1/admin/cj/status' && !url.search) {
      action = async () => {
        const result = await client.getSettings();
        if (result?.authenticated !== true || result?.settingsReceived !== true) throw Error();
        lastVerifiedAt = new Date(now()).toISOString();
        return { succes: true, authentification: true, parametresRecus: true,
          sandbox: typeof result.sandbox === 'boolean' ? result.sandbox : null,
          verifiedAt: lastVerifiedAt, achatsActives: false, commandesActivees: false };
      };
    } else if (url.pathname === '/v1/admin/cj/products') {
      if (params.some(key => !['term', 'size'].includes(key))) { reply(400, { succes: false, code: 'INVALID_ARGUMENT' }); return; }
      const term = url.searchParams.get('term') ?? '';
      const rawSize = url.searchParams.get('size') ?? '5';
      if (!/^(?:[1-9]|10)$/u.test(rawSize) || !term || term !== term.trim() || term.length > 100
          || /[\u0000-\u001f\u007f]/u.test(term)) { reply(400, { succes: false, code: 'INVALID_ARGUMENT' }); return; }
      const size = Number(rawSize);
      action = async () => ({ succes: true, ...draft,
        produits: (await client.listProducts(term, size)).map(item => ({
          pid: item.id, nom: label(item.nameEn), prixFournisseurUSD: amount(item.sellPrice), ...draft,
        })) });
    } else {
      const product = /^\/v1\/admin\/cj\/product\/([A-Za-z0-9._-]+)$/u.exec(url.pathname);
      const stock = /^\/v1\/admin\/cj\/stock\/([A-Za-z0-9._-]+)$/u.exec(url.pathname);
      if (url.search || !(product || stock)) { reply(404, { succes: false, code: 'NOT_FOUND' }); return; }
      const id = (product || stock)[1];
      if (!ID.test(id)) { reply(400, { succes: false, code: 'INVALID_ARGUMENT' }); return; }
      if (product) action = async () => {
        const item = await client.getProduct(id);
        return { succes: true, ...draft, produit: { pid: item.pid,
          nom: label(item.productNameEn), prixFournisseurUSD: amount(item.sellPrice),
          variantes: (Array.isArray(item.variants) ? item.variants : []).slice(0, 30)
            .filter(v => v && ID.test(v.vid)).map(v => ({ vid: v.vid, nom: label(v.variantNameEn) })) } };
      };
      else action = async () => ({ succes: true, ...draft, vid: id,
        entrepots: (await client.getStock(id)).map(row => ({ pays: row.countryCode, quantite: row.totalInventoryNum })) });
    }
    if (pending >= 2) { reply(503, { succes: false, code: 'BUSY_RETRY_LATER' }); return; }
    pending++;
    try { reply(200, await action()); }
    catch (error) {
      if (error instanceof CJError && error.code === 'CJ_INVALID_ARGUMENT') reply(400, { succes: false, code: 'INVALID_ARGUMENT' });
      else if (error instanceof CJError && error.code === 'CJ_RATE_LIMIT') reply(503, { succes: false, code: 'CJ_RATE_LIMIT' });
      else reply(502, { succes: false, code: 'CJ_UPSTREAM_UNAVAILABLE' });
    } finally { pending--; }
  });
  server.headersTimeout = 5000;
  server.requestTimeout = 8000;
  server.keepAliveTimeout = 1000;
  server.maxRequestsPerSocket = 32;
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const port = process.env.PORT === undefined ? 10000 : Number(process.env.PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error();
    const server = createApp();
    server.on('error', () => { console.error('MIRLIPOUSSE_CJ_SERVER_ERROR'); process.exitCode = 1; });
    server.listen(port, '0.0.0.0', () => console.info('MIRLIPOUSSE_CJ_READY'));
    const stop = () => { server.close(() => process.exit(0)); server.closeIdleConnections?.();
      setTimeout(() => process.exit(0), 15000).unref(); };
    process.once('SIGTERM', stop); process.once('SIGINT', stop);
  } catch { console.error('MIRLIPOUSSE_CJ_STARTUP_REFUSED'); process.exitCode = 1; }
}
