/**
 * CJ API 2.0 — serveur uniquement. Aucun secret ni jeton n'est retourné au client.
 * Les opérations de commande de cette première tranche sont des brouillons
 * SANDBOX exclusivement. Aucun débit de solde, paiement ou envoi réel.
 * Documentation épinglée : recherche/CONTRAT-CJ.json.
 */
const BASE_URL = 'https://developers.cjdropshipping.com/api2.0/v1';
const TIMEOUT_MS = 12_000;
const MAX_BYTES = 2 * 1024 * 1024;
const TOKEN_MARGIN_MS = 30_000;
const DESTINATIONS = new Set(['FR', 'BE']);
const COUNTRIES = new Set(('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW').split(' '));

export class CJError extends Error {
  constructor(code, status = 502) {
    super(code);
    this.name = 'CJError';
    this.code = code;
    this.status = status;
  }
}

const invalid = () => { throw new CJError('CJ_INVALID_ARGUMENT', 400); };
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [null, Object.prototype].includes(Object.getPrototypeOf(value));
function text(value, maximum = 200) {
  if (typeof value !== 'string' || !value.trim() || value !== value.trim()
      || value.length > maximum || /[\u0000-\u001f\u007f]/u.test(value)) invalid();
  return value;
}
function identifier(value, maximum = 128) {
  if (typeof value !== 'string' || value.length > maximum
      || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/u.test(value)) invalid();
  return value;
}
function country(value, destination = false) {
  if (typeof value !== 'string' || !(destination ? DESTINATIONS : COUNTRIES).has(value)) invalid();
  return value;
}
function products(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 20) invalid();
  const seen = new Set();
  return value.map(item => {
    if (!plain(item) || Object.keys(item).some(key => !['vid', 'quantity'].includes(key))) invalid();
    const vid = identifier(item.vid);
    if (seen.has(vid) || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) invalid();
    seen.add(vid);
    return { vid, quantity: item.quantity };
  });
}

async function limitedJSON(response) {
  if (!response?.headers?.get || !response.body?.getReader) throw new CJError('CJ_RESPONSE_INVALID');
  const type = response.headers.get('content-type') || '';
  if (!/^application\/json(?:\s*;|$)/iu.test(type)) throw new CJError('CJ_RESPONSE_INVALID');
  const length = response.headers.get('content-length');
  if (length !== null && (!/^\d+$/u.test(length) || Number(length) > MAX_BYTES)) {
    throw new CJError('CJ_RESPONSE_TOO_LARGE');
  }
  const reader = response.body.getReader();
  const chunks = [];
  let bytes = 0;
  let complete = false;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) { complete = true; break; }
      if (!(part.value instanceof Uint8Array)) throw new CJError('CJ_RESPONSE_INVALID');
      bytes += part.value.byteLength;
      if (bytes > MAX_BYTES || chunks.length >= 4096) throw new CJError('CJ_RESPONSE_TOO_LARGE');
      chunks.push(part.value);
    }
    const buffer = new Uint8Array(bytes);
    let cursor = 0;
    for (const part of chunks) { buffer.set(part, cursor); cursor += part.byteLength; }
    try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(buffer)); }
    catch { throw new CJError('CJ_RESPONSE_INVALID'); }
  } finally {
    if (!complete) void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

function accepted(payload) {
  if (payload?.code === 401 || payload?.code === 1600001) throw new CJError('CJ_UNAUTHORIZED', 502);
  if (payload?.code === 429) throw new CJError('CJ_RATE_LIMIT', 503);
  if (!plain(payload) || payload.code !== 200 || payload.result !== true
      || (payload.success !== undefined && payload.success !== true)) {
    throw new CJError('CJ_UPSTREAM_REJECTED');
  }
  return payload.data;
}

function orderInput(body, options) {
  if (!plain(options) || options.sandbox !== true || Object.keys(options).some(key => key !== 'sandbox')) {
    throw new CJError('CJ_SANDBOX_ONLY', 400);
  }
  if (!plain(body)) invalid();
  if ((body.payType !== undefined && body.payType !== 3)
      || (body.isSandbox !== undefined && body.isSandbox !== 1)) throw new CJError('CJ_SANDBOX_ONLY', 400);
  const required = {
    orderNumber: 50, shippingCountry: 50, shippingProvince: 50, shippingCity: 50,
    shippingCustomerName: 50, shippingAddress: 500, logisticName: 50,
  };
  const optional = { shippingZip: 20, shippingCounty: 50, shippingPhone: 20,
    shippingAddress2: 500, houseNumber: 20, email: 50, remark: 500 };
  const allowed = new Set([...Object.keys(required), ...Object.keys(optional),
    'shippingCountryCode', 'fromCountryCode', 'products', 'payType', 'isSandbox']);
  if (Object.keys(body).some(key => !allowed.has(key))) invalid();
  const result = {};
  for (const [key, limit] of Object.entries(required)) result[key] = text(body[key], limit);
  identifier(result.orderNumber, 50);
  for (const [key, limit] of Object.entries(optional)) {
    if (body[key] !== undefined && body[key] !== '') result[key] = text(body[key], limit);
  }
  result.shippingCountryCode = country(body.shippingCountryCode, true);
  result.fromCountryCode = country(body.fromCountryCode);
  result.products = products(body.products);
  result.payType = 3;
  result.isSandbox = 1;
  return result;
}

export function createCJClient(configuration = {}) {
  if (typeof window !== 'undefined') throw new CJError('CJ_SERVER_ONLY', 500);
  if (!plain(configuration)) invalid();
  const { apiKey, fetchImpl = globalThis.fetch, now = Date.now } = configuration;
  if (typeof apiKey !== 'string' || !apiKey.trim()) throw new CJError('CJ_NOT_CONFIGURED', 503);
  if (apiKey.length > 200 || /[\s\u0000-\u001f\u007f]/u.test(apiKey)
      || typeof fetchImpl !== 'function' || typeof now !== 'function') invalid();
  let cachedToken = null;
  let pendingToken = null;
  // Protection locale du quota gratuit (1 requête/s), y compris auth -> lecture.
  // Plusieurs instances/Workers nécessitent encore une coordination par compte.
  let nextAllowedAt = 0;
  const monotonic = () => globalThis.performance?.now() ?? Date.now();
  async function pace(signal) {
    const current = monotonic();
    const wait = Math.max(0, nextAllowedAt - current);
    if (wait > TIMEOUT_MS - 1000) throw new CJError('CJ_RATE_LIMIT', 503);
    nextAllowedAt = Math.max(nextAllowedAt, current) + 1100;
    if (signal.aborted) throw new CJError('CJ_TIMEOUT', 504);
    if (wait <= 0) return;
    await new Promise((resolve, reject) => {
      const stop = () => { clearTimeout(handle); reject(new CJError('CJ_TIMEOUT', 504)); };
      const handle = setTimeout(() => { signal.removeEventListener('abort', stop); resolve(); }, Math.ceil(wait));
      signal.addEventListener('abort', stop, { once: true });
      if (signal.aborted) stop();
    });
  }
  const clock = () => {
    const value = now();
    if (!Number.isFinite(value)) invalid();
    return value;
  };

  async function request(path, { method = 'GET', body, token } = {}) {
    const controller = new AbortController();
    let timer;
    const run = async () => {
      const headers = { Accept: 'application/json' };
      if (token) headers['CJ-Access-Token'] = token;
      let serialized;
      if (body !== undefined) {
        serialized = JSON.stringify(body);
        if (new TextEncoder().encode(serialized).byteLength > MAX_BYTES) invalid();
        headers['Content-Type'] = 'application/json';
      }
      await pace(controller.signal);
      const response = await fetchImpl(BASE_URL + path, {
        method, headers, body: serialized, signal: controller.signal,
        redirect: 'error', cache: 'no-store',
      });
      if (!response || typeof response.status !== 'number' || typeof response.ok !== 'boolean') {
        throw new CJError('CJ_RESPONSE_INVALID');
      }
      if (response.status === 401 || response.status === 403) {
        cachedToken = null;
        throw new CJError('CJ_UNAUTHORIZED');
      }
      if (response.status === 429) throw new CJError('CJ_RATE_LIMIT', 503);
      if (!response.ok) throw new CJError('CJ_UNAVAILABLE', 503);
      return accepted(await limitedJSON(response));
    };
    try {
      return await Promise.race([
        run(),
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            controller.abort();
            reject(new CJError('CJ_TIMEOUT', 504));
          }, TIMEOUT_MS);
        }),
      ]);
    } catch (error) {
      if (error instanceof CJError) throw error;
      if (controller.signal.aborted) throw new CJError('CJ_TIMEOUT', 504);
      throw new CJError('CJ_UNAVAILABLE', 503);
    } finally { clearTimeout(timer); }
  }

  async function token() {
    if (cachedToken && cachedToken.expiresAt > clock() + TOKEN_MARGIN_MS) return cachedToken.value;
    if (pendingToken) return pendingToken;
    pendingToken = (async () => {
      const data = await request('/authentication/getAccessToken', { method: 'POST', body: { apiKey } });
      if (!plain(data) || typeof data.accessToken !== 'string'
          || !/^[\x21-\x7e]{8,4096}$/u.test(data.accessToken)) throw new CJError('CJ_RESPONSE_INVALID');
      const expiresAt = Date.parse(data.accessTokenExpiryDate);
      if (!Number.isFinite(expiresAt) || expiresAt <= clock()) throw new CJError('CJ_RESPONSE_INVALID');
      cachedToken = { value: data.accessToken, expiresAt };
      return cachedToken.value;
    })().finally(() => { pendingToken = null; });
    return pendingToken;
  }

  async function authorized(path, options) {
    try { return await request(path, { ...options, token: await token() }); }
    catch (error) {
      if (error instanceof CJError && error.code === 'CJ_UNAUTHORIZED') cachedToken = null;
      throw error;
    }
  }

  return Object.freeze({
    async getSettings() {
      const data = await authorized('/setting/get');
      if (!plain(data) || !plain(data.setting)) throw new CJError('CJ_RESPONSE_INVALID');
      return { authenticated: true, settingsReceived: true,
        sandbox: typeof data.isSandbox === 'boolean' ? data.isSandbox : null };
    },
    async listProducts(term, size = 5) {
      if (typeof term !== 'string' || term !== term.trim() || !term
          || term.length > 100 || /[\u0000-\u001f\u007f]/u.test(term)
          || !Number.isSafeInteger(size) || size < 1 || size > 10) invalid();
      const query = new URLSearchParams({ page: '1', size: String(size), keyWord: term });
      const data = await authorized('/product/listV2?' + query);
      if (!plain(data) || !Array.isArray(data.content)) throw new CJError('CJ_RESPONSE_INVALID');
      const list = [];
      for (const section of data.content) {
        if (!plain(section) || !Array.isArray(section.productList)) throw new CJError('CJ_RESPONSE_INVALID');
        list.push(...section.productList);
      }
      if (list.length > size || list.some(item => !plain(item)
          || typeof item.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u.test(item.id)
          || typeof item.nameEn !== 'string' || item.nameEn.length > 500
          || /[\u0000-\u001f\u007f]/u.test(item.nameEn))) throw new CJError('CJ_RESPONSE_INVALID');
      return list;
    },
    async getProduct(pid) {
      identifier(pid);
      const data = await authorized('/product/query?pid=' + encodeURIComponent(pid));
      if (!plain(data) || data.pid !== pid) throw new CJError('CJ_RESPONSE_INVALID');
      return data;
    },
    async getStock(vid) {
      identifier(vid);
      const data = await authorized('/product/stock/queryByVid?vid=' + encodeURIComponent(vid));
      if (!Array.isArray(data) || data.some(row => !plain(row) || row.vid !== vid
          || !COUNTRIES.has(row.countryCode) || !Number.isSafeInteger(row.totalInventoryNum)
          || row.totalInventoryNum < 0)) throw new CJError('CJ_RESPONSE_INVALID');
      return data;
    },
    async quoteShipping(input = {}) {
      if (!plain(input) || Object.keys(input).some(key => !['shippingCountryCode', 'products', 'startCountryCode'].includes(key))) invalid();
      const { shippingCountryCode, products: items, startCountryCode } = input;
      const body = { startCountryCode: country(startCountryCode),
        endCountryCode: country(shippingCountryCode, true), products: products(items) };
      const data = await authorized('/logistic/freightCalculate', { method: 'POST', body });
      const amount = value => (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1e9)
        || (typeof value === 'string' && /^\d{1,10}(?:\.\d{1,4})?$/u.test(value) && Number(value) <= 1e9);
      if (!Array.isArray(data) || data.some(row => !plain(row)
          || typeof row.logisticName !== 'string' || !row.logisticName.trim()
          || row.logisticName.length > 100 || /[\u0000-\u001f\u007f]/u.test(row.logisticName)
          || !amount(row.logisticPrice))) throw new CJError('CJ_RESPONSE_INVALID');
      return data;
    },
    async createDraftOrder(body, options) {
      const input = orderInput(body, options);
      const data = await authorized('/shopping/order/createOrderV2', { method: 'POST', body: input });
      if (!plain(data) || typeof data.orderId !== 'string'
          || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u.test(data.orderId)
          || (data.orderNumber && data.orderNumber !== input.orderNumber)) throw new CJError('CJ_RESPONSE_INVALID');
      return data;
    },
  });
}
