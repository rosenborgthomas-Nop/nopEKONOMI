/**
 * nopEKONOMI Open Banking proxy (Tink AIS).
 * Secrets: TINK_CLIENT_ID, TINK_CLIENT_SECRET, SESSION_HMAC_SECRET, ALLOWED_ORIGINS
 * Optional: DEMO_MODE=1 (no Tink keys required)
 */

const DEMO_ACCOUNTS = {
  accounts: [
    {
      id: 'demo-acc-checking',
      name: 'Demo Lönekonto',
      type: 'CHECKING',
      balances: { booked: { amount: { value: 12543.5, currencyCode: 'SEK' } } },
      identifiers: { iban: 'SE4550000000058398257466' }
    },
    {
      id: 'demo-acc-savings',
      name: 'Demo Sparkonto',
      type: 'SAVINGS',
      balances: { booked: { amount: { value: 50000, currencyCode: 'SEK' } } },
      identifiers: { iban: 'SE4550000000058398257467' }
    }
  ]
};

const DEMO_TRANSACTIONS = {
  transactions: [
    {
      id: 'demo-tx-001',
      accountId: 'demo-acc-checking',
      amount: { value: 25000, currencyCode: 'SEK' },
      dates: { booked: '2026-09-01', value: '2026-09-01' },
      descriptions: { display: 'Lön ACME AB', original: 'LON ACME' },
      status: 'BOOKED'
    },
    {
      id: 'demo-tx-002',
      accountId: 'demo-acc-checking',
      amount: { value: -459, currencyCode: 'SEK' },
      dates: { booked: '2026-09-03', value: '2026-09-03' },
      descriptions: { display: 'ICA Supermarket', original: 'ICA SUPERMARKET' },
      status: 'BOOKED'
    },
    {
      id: 'demo-tx-003',
      accountId: 'demo-acc-checking',
      amount: { value: -199, currencyCode: 'SEK' },
      dates: { booked: '2026-09-05', value: '2026-09-05' },
      descriptions: { display: 'Spotify', original: 'SPOTIFY P0A' },
      status: 'BOOKED'
    },
    {
      id: 'demo-tx-004',
      accountId: 'demo-acc-checking',
      amount: { value: -1200, currencyCode: 'SEK' },
      dates: { booked: '2026-09-10', value: '2026-09-10' },
      descriptions: { display: 'Hyra', original: 'HYRA' },
      status: 'BOOKED'
    },
    {
      id: 'demo-tx-005',
      accountId: 'demo-acc-savings',
      amount: { value: 2000, currencyCode: 'SEK' },
      dates: { booked: '2026-09-02', value: '2026-09-02' },
      descriptions: { display: 'Överföring spar', original: 'SPAR' },
      status: 'BOOKED'
    }
  ]
};

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env, ctx);
    } catch (err) {
      return json({ error: 'internal', message: String(err && err.message ? err.message : err) }, 500, env, request);
    }
  }
};

async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  if (request.method === 'OPTIONS') {
    return corsPreflight(env, request);
  }

  if (path === '/ob/health' && request.method === 'GET') {
    return json({
      ok: true,
      demo: isDemo(env),
      market: env.TINK_MARKET || 'SE'
    }, 200, env, request);
  }

  if (path === '/ob/start' && request.method === 'POST') {
    return startFlow(request, env);
  }
  if (path === '/ob/callback' && request.method === 'GET') {
    return oauthCallback(request, env);
  }
  if (path === '/ob/accounts' && request.method === 'GET') {
    return listAccounts(request, env);
  }
  if (path === '/ob/transactions' && request.method === 'GET') {
    return listTransactions(request, env);
  }
  if (path === '/ob/disconnect' && request.method === 'POST') {
    return disconnect(request, env);
  }

  return json({ error: 'not_found' }, 404, env, request);
}

function isDemo(env) {
  if (String(env.DEMO_MODE || '') === '1') return true;
  return !(env.TINK_CLIENT_ID && env.TINK_CLIENT_SECRET);
}

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

function corsHeaders(env, request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = allowedOrigins(env);
  const ok = !origin || allowed.includes(origin) || allowed.includes('*');
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
  if (ok && origin) headers['Access-Control-Allow-Origin'] = origin;
  else if (allowed.length === 1) headers['Access-Control-Allow-Origin'] = allowed[0];
  return headers;
}

function corsPreflight(env, request) {
  return new Response(null, { status: 204, headers: corsHeaders(env, request) });
}

function json(body, status, env, request) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: Object.assign({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }, corsHeaders(env, request))
  });
}

function redirect(url) {
  return Response.redirect(url, 302);
}

function sessionTtl(env) {
  const n = Number(env.SESSION_TTL_SECONDS || 14400);
  return Number.isFinite(n) && n > 60 ? n : 14400;
}

function randomId() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSign(secret, text) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret || 'dev'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(text));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function putSession(env, sessionId, data) {
  const ttl = sessionTtl(env);
  const payload = Object.assign({}, data, {
    createdAt: Date.now(),
    expiresAt: Date.now() + ttl * 1000
  });
  if (env.OB_SESSIONS) {
    await env.OB_SESSIONS.put('sess:' + sessionId, JSON.stringify(payload), { expirationTtl: ttl });
  } else {
    if (!globalThis.__obMem) globalThis.__obMem = new Map();
    globalThis.__obMem.set('sess:' + sessionId, payload);
  }
  return payload;
}

async function getSession(env, sessionId) {
  if (!sessionId) return null;
  let raw = null;
  if (env.OB_SESSIONS) {
    raw = await env.OB_SESSIONS.get('sess:' + sessionId);
  } else if (globalThis.__obMem) {
    const data = globalThis.__obMem.get('sess:' + sessionId);
    if (!data) return null;
    if (data.expiresAt && Date.now() > data.expiresAt) {
      globalThis.__obMem.delete('sess:' + sessionId);
      return null;
    }
    return data;
  }
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (data.expiresAt && Date.now() > data.expiresAt) return null;
    return data;
  } catch (e) {
    return null;
  }
}

async function deleteSession(env, sessionId) {
  if (!sessionId) return;
  if (env.OB_SESSIONS) await env.OB_SESSIONS.delete('sess:' + sessionId);
  if (globalThis.__obMem) globalThis.__obMem.delete('sess:' + sessionId);
}

function pwaReturnUrl(env, params) {
  const base = env.PWA_RETURN_URL || 'https://rosenborgthomas-nop.github.io/nopEKONOMI/nopEKONOMI.html';
  const u = new URL(base);
  Object.keys(params || {}).forEach(k => {
    if (params[k] != null && params[k] !== '') u.searchParams.set(k, String(params[k]));
  });
  return u.toString();
}

async function startFlow(request, env) {
  let body = {};
  try {
    body = await request.json();
  } catch (e) {
    body = {};
  }
  const bank = String(body.bank || body.provider || '').trim();
  const personalId = String(body.personalIdentifier || body.ssn || '').replace(/\D/g, '');
  const demo = !!body.demo || isDemo(env);
  const state = randomId();
  const sessionId = randomId();

  if (demo) {
    await putSession(env, sessionId, {
      mode: 'demo',
      state: state,
      bank: bank || 'demo',
      accessToken: 'demo'
    });
    // Immediate "callback" — no BankID in demo.
    return json({
      mode: 'demo',
      sessionId: sessionId,
      redirectUrl: null,
      returnUrl: pwaReturnUrl(env, { obSession: sessionId })
    }, 200, env, request);
  }

  if (!env.TINK_CLIENT_ID || !env.TINK_CLIENT_SECRET) {
    return json({ error: 'not_configured', message: 'Tink-nycklar saknas. Sätt DEMO_MODE=1 eller secrets.' }, 503, env, request);
  }

  const clientToken = await tinkClientToken(env);
  const userId = await tinkCreateUser(env, clientToken);
  const authCode = await tinkAuthorizationGrant(env, clientToken, userId);

  let sessionIdTink = '';
  if (personalId) {
    try {
      sessionIdTink = await tinkCreateLinkSession(env, clientToken, personalId);
    } catch (e) {
      // Session API requires link-session:write — optional.
      sessionIdTink = '';
    }
  }

  await putSession(env, sessionId, {
    mode: 'tink',
    state: state,
    bank: bank,
    tinkUserId: userId,
    accessToken: null
  });
  // Map pending state → session for callback
  if (env.OB_SESSIONS) {
    await env.OB_SESSIONS.put('state:' + state, sessionId, { expirationTtl: sessionTtl(env) });
  } else {
    if (!globalThis.__obMem) globalThis.__obMem = new Map();
    globalThis.__obMem.set('state:' + state, sessionId);
  }

  const link = new URL((env.TINK_LINK_BASE || 'https://link.tink.com') + '/1.0/transactions/connect-accounts');
  link.searchParams.set('client_id', env.TINK_CLIENT_ID);
  link.searchParams.set('redirect_uri', new URL('/ob/callback', request.url).toString());
  link.searchParams.set('market', env.TINK_MARKET || 'SE');
  link.searchParams.set('locale', env.TINK_LOCALE || 'sv_SE');
  link.searchParams.set('authorization_code', authCode);
  link.searchParams.set('state', state);
  if (bank) link.searchParams.set('input_provider', bank);
  if (sessionIdTink) link.searchParams.set('session_id', sessionIdTink);

  return json({
    mode: 'tink',
    sessionId: sessionId,
    redirectUrl: link.toString()
  }, 200, env, request);
}

async function oauthCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code') || '';
  const state = url.searchParams.get('state') || '';
  const error = url.searchParams.get('error') || '';
  const errorDesc = url.searchParams.get('error_description') || '';

  if (error) {
    return redirect(pwaReturnUrl(env, {
      obError: error,
      obErrorDesc: errorDesc.slice(0, 200)
    }));
  }

  let sessionId = null;
  if (state) {
    if (env.OB_SESSIONS) sessionId = await env.OB_SESSIONS.get('state:' + state);
    else if (globalThis.__obMem) sessionId = globalThis.__obMem.get('state:' + state) || null;
  }
  if (!sessionId) {
    return redirect(pwaReturnUrl(env, { obError: 'invalid_state' }));
  }

  const sess = await getSession(env, sessionId);
  if (!sess) {
    return redirect(pwaReturnUrl(env, { obError: 'session_expired' }));
  }

  try {
    const token = await tinkExchangeCode(env, code);
    await putSession(env, sessionId, Object.assign({}, sess, {
      accessToken: token.access_token,
      refreshToken: token.refresh_token || null,
      tokenExpiresAt: Date.now() + (Number(token.expires_in) || 7200) * 1000,
      mode: 'tink'
    }));
    if (state) {
      if (env.OB_SESSIONS) await env.OB_SESSIONS.delete('state:' + state);
      if (globalThis.__obMem) globalThis.__obMem.delete('state:' + state);
    }
    return redirect(pwaReturnUrl(env, { obSession: sessionId }));
  } catch (e) {
    return redirect(pwaReturnUrl(env, {
      obError: 'token_exchange_failed',
      obErrorDesc: String(e && e.message ? e.message : e).slice(0, 200)
    }));
  }
}

async function requireSession(request, env) {
  const url = new URL(request.url);
  let sessionId = url.searchParams.get('sessionId') || '';
  if (!sessionId && request.method === 'POST') {
    try {
      const body = await request.clone().json();
      sessionId = String(body.sessionId || '');
    } catch (e) { /* ignore */ }
  }
  const sess = await getSession(env, sessionId);
  if (!sess) {
    return { error: json({ error: 'CONSENT_EXPIRED', message: 'Förnya BankID-koppling' }, 401, env, request) };
  }
  if (sess.mode === 'tink' && !sess.accessToken) {
    return { error: json({ error: 'CONSENT_PENDING', message: 'BankID-flödet är inte klart' }, 401, env, request) };
  }
  return { sessionId, sess };
}

async function listAccounts(request, env) {
  const gate = await requireSession(request, env);
  if (gate.error) return gate.error;
  if (gate.sess.mode === 'demo') {
    return json(normalizeAccounts(DEMO_ACCOUNTS.accounts), 200, env, request);
  }
  try {
    const data = await tinkFetch(env, gate.sess.accessToken, '/data/v2/accounts');
    const accounts = (data && (data.accounts || data)) || [];
    return json(normalizeAccounts(Array.isArray(accounts) ? accounts : []), 200, env, request);
  } catch (e) {
    return consentOrError(e, env, request);
  }
}

async function listTransactions(request, env) {
  const gate = await requireSession(request, env);
  if (gate.error) return gate.error;
  const url = new URL(request.url);
  const accountId = url.searchParams.get('accountId') || '';
  const from = url.searchParams.get('from') || '';
  const to = url.searchParams.get('to') || '';

  if (gate.sess.mode === 'demo') {
    let txs = DEMO_TRANSACTIONS.transactions.slice();
    if (accountId) txs = txs.filter(t => t.accountId === accountId);
    if (from) txs = txs.filter(t => (t.dates && t.dates.booked || '') >= from);
    if (to) txs = txs.filter(t => (t.dates && t.dates.booked || '') <= to);
    return json({ transactions: normalizeTransactions(txs) }, 200, env, request);
  }

  if (!accountId) {
    return json({ error: 'accountId_required' }, 400, env, request);
  }

  try {
    const q = new URLSearchParams();
    q.set('accountIdIn', accountId);
    q.set('pageSize', '100');
    if (from) q.set('bookedDateGte', from);
    if (to) q.set('bookedDateLte', to);
    const all = [];
    let pageToken = '';
    for (let i = 0; i < 20; i++) {
      const path = '/data/v2/transactions?' + q.toString() + (pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : '');
      const data = await tinkFetch(env, gate.sess.accessToken, path);
      const batch = (data && data.transactions) || [];
      all.push(...batch);
      pageToken = (data && data.nextPageToken) || '';
      if (!pageToken) break;
    }
    return json({ transactions: normalizeTransactions(all) }, 200, env, request);
  } catch (e) {
    return consentOrError(e, env, request);
  }
}

async function disconnect(request, env) {
  let sessionId = '';
  try {
    const body = await request.json();
    sessionId = String(body.sessionId || '');
  } catch (e) {
    sessionId = new URL(request.url).searchParams.get('sessionId') || '';
  }
  await deleteSession(env, sessionId);
  return json({ ok: true }, 200, env, request);
}

function consentOrError(err, env, request) {
  const msg = String(err && err.message ? err.message : err);
  if (/401|403|expired|consent|unauthorized/i.test(msg)) {
    return json({ error: 'CONSENT_EXPIRED', message: 'Förnya BankID-koppling' }, 401, env, request);
  }
  return json({ error: 'upstream', message: msg.slice(0, 300) }, 502, env, request);
}

function normalizeAccounts(list) {
  return {
    accounts: (list || []).map(a => ({
      id: a.id || a.accountId || '',
      name: a.name || (a.identifiers && a.identifiers.iban) || a.id || 'Konto',
      type: a.type || a.accountType || '',
      iban: (a.identifiers && a.identifiers.iban) || a.iban || '',
      balance: amountValue(a.balances && a.balances.booked && a.balances.booked.amount)
        ?? amountValue(a.balance)
        ?? null,
      currency: (a.balances && a.balances.booked && a.balances.booked.amount && a.balances.booked.amount.currencyCode)
        || a.currencyCode
        || 'SEK'
    })).filter(a => a.id)
  };
}

function normalizeTransactions(list) {
  return (list || []).map(t => ({
    id: t.id || t.transactionId || '',
    accountId: t.accountId || '',
    amount: amountValue(t.amount),
    currency: (t.amount && t.amount.currencyCode) || t.currencyCode || 'SEK',
    bookedDate: (t.dates && (t.dates.booked || t.dates.value)) || t.bookedDate || t.date || '',
    valueDate: (t.dates && t.dates.value) || '',
    payee: (t.descriptions && (t.descriptions.display || t.descriptions.original))
      || t.displayDescription
      || t.originalDescription
      || t.remittanceInformation
      || '',
    memo: (t.descriptions && t.descriptions.original && t.descriptions.display
      && t.descriptions.original !== t.descriptions.display)
      ? t.descriptions.original
      : (t.remittanceInformation || ''),
    status: t.status || 'BOOKED'
  })).filter(t => t.id || t.bookedDate);
}

function amountValue(amt) {
  if (amt == null) return null;
  if (typeof amt === 'number') return amt;
  if (typeof amt === 'string') {
    const n = Number(amt.replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }
  if (typeof amt === 'object' && amt.value != null) {
    const n = Number(amt.value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

async function tinkClientToken(env) {
  const body = new URLSearchParams();
  body.set('client_id', env.TINK_CLIENT_ID);
  body.set('client_secret', env.TINK_CLIENT_SECRET);
  body.set('grant_type', 'client_credentials');
  body.set('scope', 'authorization:grant,user:create,link-session:write');
  const res = await fetch((env.TINK_API_BASE || 'https://api.tink.com') + '/api/v1/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('tink_client_token:' + (data.error || res.status));
  return data.access_token;
}

async function tinkCreateUser(env, clientToken) {
  const res = await fetch((env.TINK_API_BASE || 'https://api.tink.com') + '/api/v1/user/create', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + clientToken,
      'Content-Type': 'application/json'
    },
    body: '{}'
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('tink_user_create:' + (data.errorMessage || data.error || res.status));
  return data.user_id || data.id;
}

async function tinkAuthorizationGrant(env, clientToken, userId) {
  const body = new URLSearchParams();
  body.set('user_id', userId);
  body.set('scope', 'accounts:read,transactions:read,user:read,credentials:read');
  const res = await fetch((env.TINK_API_BASE || 'https://api.tink.com') + '/api/v1/oauth/authorization-grant', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + clientToken,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('tink_auth_grant:' + (data.errorMessage || data.error || res.status));
  return data.code || data.authorization_code;
}

async function tinkCreateLinkSession(env, clientToken, personalIdentifier) {
  const res = await fetch((env.TINK_API_BASE || 'https://api.tink.com') + '/link/v1/session', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + clientToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ personalIdentifier: personalIdentifier })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('tink_link_session:' + (data.errorMessage || data.error || res.status));
  return data.session_id || data.id || '';
}

async function tinkExchangeCode(env, code) {
  const body = new URLSearchParams();
  body.set('code', code);
  body.set('client_id', env.TINK_CLIENT_ID);
  body.set('client_secret', env.TINK_CLIENT_SECRET);
  body.set('grant_type', 'authorization_code');
  const res = await fetch((env.TINK_API_BASE || 'https://api.tink.com') + '/api/v1/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('tink_exchange:' + (data.error || res.status));
  return data;
}

async function tinkFetch(env, userToken, path) {
  const res = await fetch((env.TINK_API_BASE || 'https://api.tink.com') + path, {
    headers: { Authorization: 'Bearer ' + userToken }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.errorMessage || data.error || data.message || ('http_' + res.status);
    throw new Error(String(msg));
  }
  return data;
}
