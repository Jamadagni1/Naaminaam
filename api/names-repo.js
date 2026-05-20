'use strict';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

const CACHE = new Map();

function nowMs() { return Date.now(); }

function cacheGet(key) {
  const hit = CACHE.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= nowMs()) { CACHE.delete(key); return null; }
  return hit.value;
}

function cacheSet(key, value, ttlMs) {
  CACHE.set(key, { value, expiresAt: nowMs() + ttlMs });
}

function getEnv(name, fallback = '') {
  const v = process.env[name];
  return v == null || v === '' ? fallback : String(v);
}

function getSupabaseConfig() {
  const url = getEnv('SUPABASE_URL', getEnv('NEXT_PUBLIC_SUPABASE_URL', '')).replace(/\/+$/, '');
  const anonKey = getEnv('SUPABASE_ANON_KEY', getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', ''));
  const table = getEnv('NAMES_TABLE', 'names');
  return { url, anonKey, table };
}

function isLetterAZ(letter) {
  return typeof letter === 'string' && /^[A-Z]$/.test(letter);
}

function normalizeGender(g) {
  const v = String(g || '').toLowerCase();
  if (v === 'boy' || v === 'male') return 'boy';
  if (v === 'girl' || v === 'female') return 'girl';
  return '';
}

function normalizeCategory(cat) {
  const v = String(cat || '').trim();
  if (!v) return '';
  // keep slug-like for url but store filter as original string
  return v;
}

function safeInt(n, fallback) {
  const x = Number(n);
  return Number.isFinite(x) ? Math.trunc(x) : fallback;
}

function parseContentRange(h) {
  // format: "0-49/1234"
  if (!h) return null;
  const m = String(h).match(/^\s*\d+\s*-\s*\d+\s*\/\s*(\d+|\*)\s*$/i);
  if (!m) return null;
  if (m[1] === '*') return null;
  const total = Number(m[1]);
  return Number.isFinite(total) ? total : null;
}

async function supabaseFetchJson(pathAndQuery, { signal } = {}) {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) {
    const err = new Error('Supabase is not configured (SUPABASE_URL / SUPABASE_ANON_KEY).');
    err.code = 'SUPABASE_NOT_CONFIGURED';
    throw err;
  }

  const endpoint = `${url}${pathAndQuery.startsWith('/') ? '' : '/'}${pathAndQuery}`;
  const resp = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Accept': 'application/json',
      'Prefer': 'count=exact'
    },
    signal
  });

  const text = await resp.text();
  if (!resp.ok) {
    const err = new Error(`Supabase REST request failed (${resp.status}).`);
    err.status = resp.status;
    err.details = text.slice(0, 600);
    throw err;
  }

  let json;
  try { json = text ? JSON.parse(text) : []; } catch { json = []; }
  const total = parseContentRange(resp.headers.get('content-range')) ?? null;
  return { json, total };
}

function buildNamesQuery({ table, letter, gender, category, limit, offset, order }) {
  const params = new URLSearchParams();
  params.set('select', 'name,meaning,category,origin,language,gender,popularity');

  if (gender) params.set('gender', `eq.${gender}`);
  if (category) params.set('category', `ilike.${category}`);
  if (letter) params.set('name', `ilike.${letter}%`);

  if (order) params.set('order', order);
  params.set('limit', String(limit));
  params.set('offset', String(offset));

  return `/rest/v1/${encodeURIComponent(table)}?${params.toString()}`;
}

function normalizeRow(row) {
  if (!row || typeof row !== 'object') return null;
  const name = String(row.name || '').trim();
  if (!name) return null;
  return {
    name,
    meaning: String(row.meaning || '').trim(),
    category: String(row.category || row.origin || '').trim(),
    origin: String(row.origin || '').trim(),
    language: String(row.language || '').trim(),
    gender: normalizeGender(row.gender),
    popularity: safeInt(row.popularity, 0)
  };
}

async function getNamesPage({ letter, gender, category, page, pageSize }) {
  const { table } = getSupabaseConfig();

  const L = String(letter || '').toUpperCase();
  const G = normalizeGender(gender);
  const C = normalizeCategory(category);

  if (!isLetterAZ(L)) throw new Error('Invalid letter. Expected A-Z.');
  if (!G) throw new Error('Invalid gender. Expected boy or girl.');

  const size = Math.max(10, Math.min(MAX_PAGE_SIZE, safeInt(pageSize, DEFAULT_PAGE_SIZE)));
  const p = Math.max(1, safeInt(page, 1));
  const offset = (p - 1) * size;

  const cacheKey = `names:v1:${table}:${L}:${G}:${C}:${p}:${size}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const order = 'popularity.desc,name.asc';
  const query = buildNamesQuery({ table, letter: L, gender: G, category: C, limit: size, offset, order });
  const { json, total } = await supabaseFetchJson(query);

  const rows = Array.isArray(json) ? json.map(normalizeRow).filter(Boolean) : [];
  const result = {
    letter: L,
    gender: G,
    category: C,
    page: p,
    pageSize: size,
    total: total ?? null,
    items: rows
  };

  cacheSet(cacheKey, result, 5 * 60 * 1000); // 5 min
  return result;
}

async function listCategories({ limit = 200 } = {}) {
  const { table } = getSupabaseConfig();
  const cacheKey = `cats:v1:${table}:${limit}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams();
  params.set('select', 'category');
  params.set('category', 'not.is.null');
  params.set('order', 'category.asc');
  params.set('limit', String(Math.max(1, Math.min(1000, safeInt(limit, 200)))));
  const query = `/rest/v1/${encodeURIComponent(table)}?${params.toString()}`;

  const { json } = await supabaseFetchJson(query);
  const out = [];
  const seen = new Set();
  for (const r of (Array.isArray(json) ? json : [])) {
    const c = String(r && r.category || '').trim();
    if (!c) continue;
    const key = c.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }

  cacheSet(cacheKey, out, 30 * 60 * 1000); // 30 min
  return out;
}

module.exports = {
  getSupabaseConfig,
  getNamesPage,
  listCategories,
  normalizeGender
};
