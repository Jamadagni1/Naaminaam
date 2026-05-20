'use strict';

const fs = require('fs');
const path = require('path');
const { resolveAstroProfileForName } = require('./astro-profile-core');

function loadDotEnvIfPresent() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const normalized = line.startsWith('export ') ? line.slice(7).trim() : line;
    const eqIdx = normalized.indexOf('=');
    if (eqIdx <= 0) continue;

    const key = normalized.slice(0, eqIdx).trim();
    if (!key || process.env[key]) continue;

    let value = normalized.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadDotEnvIfPresent();

const OPENROUTER_API_KEY = String(process.env.OPENROUTER_API_KEY || '').trim();
const OPENROUTER_MODEL = String(process.env.OPENROUTER_MODEL || 'google/gemma-4-31b-it:free').trim();
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL || 'https://minfin.vercel.app';
const OPENROUTER_SITE_TITLE = process.env.OPENROUTER_SITE_TITLE || 'Naamin';
const OPENROUTER_FALLBACK_MODELS = String(process.env.OPENROUTER_FALLBACK_MODELS || 'openrouter/auto')
  .split(',')
  .map((x) => x.trim())
  .filter(Boolean);

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, status, payload) {
  setCors(res);
  res.status(status).json(payload);
}

function parseNames(text, want) {
  let clean = (text || '').replace(/```json/gi, '').replace(/```/g, '').trim();

  const extractArr = (s) => {
    try {
      const parsed = JSON.parse(s);
      const arr = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.names)
          ? parsed.names
          : null;
      if (!arr) return [];
      return arr
        .map((x) => ({
          name: String(x.name || '').trim(),
          meaning: String(x.meaning || '').trim(),
        }))
        .filter((x) => x.name.length >= 2)
        .slice(0, want);
    } catch (_) {
      return [];
    }
  };

  let names = extractArr(clean);
  if (names.length) return names;

  const objMatch = clean.match(/\{[\s\S]*\}/);
  if (objMatch) {
    names = extractArr(objMatch[0]);
    if (names.length) return names;
  }

  const arrMatch = clean.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    names = extractArr(arrMatch[0]);
    if (names.length) return names;
  }

  const items = [];
  const pairRx = /"name"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"meaning"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let match;
  while ((match = pairRx.exec(clean)) !== null && items.length < want) {
    const name = match[1].trim();
    const meaning = match[2].trim();
    if (name.length >= 2) items.push({ name, meaning });
  }
  return items;
}

function parseRequestBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch (_) {
      return {};
    }
  }
  return {};
}

function extractErrorMessage(raw) {
  const text = String(raw || '').trim();
  if (!text) return '';

  try {
    const parsed = JSON.parse(text);
    return (
      parsed?.error?.message ||
      parsed?.message ||
      parsed?.errors?.[0]?.message ||
      text
    );
  } catch (_) {
    return text;
  }
}

function modelCandidates() {
  return [...new Set([OPENROUTER_MODEL, ...OPENROUTER_FALLBACK_MODELS])];
}

function getSiteUrlFromRequest(req) {
  if (OPENROUTER_SITE_URL) return OPENROUTER_SITE_URL;
  const forwardedHost = req?.headers?.['x-forwarded-host'];
  const host = forwardedHost || req?.headers?.host || '';
  const proto = req?.headers?.['x-forwarded-proto'] || 'https';
  return host ? `${proto}://${host}` : 'https://minfin.vercel.app';
}

function extractContentText(data) {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part.text === 'string') return part.text;
        return '';
      })
      .join('\n')
      .trim();
  }
  return '';
}

function friendlyFailureDetail(status, detail) {
  if (status === 401) return `Invalid OpenRouter API key. ${detail}`.trim();
  if (status === 402) return `OpenRouter balance/credits issue. ${detail}`.trim();
  if (status === 429) return `Rate limit reached on OpenRouter. ${detail}`.trim();
  return detail;
}

function extractFetchFailureReason(err) {
  return String(err?.cause?.message || err?.message || err || '')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    setCors(res);
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  if (!OPENROUTER_API_KEY) {
    sendJson(res, 500, { error: 'Missing OPENROUTER_API_KEY in Vercel environment variables.' });
    return;
  }

  const body = parseRequestBody(req);
  const gender = String(body.gender || 'Boy').trim();
  const theme = String(body.theme || '').trim();
  const count = Math.min(Math.max(Number(body.count) || 10, 3), 200);
  const language = String(body.language || 'en').toLowerCase();

  if (!theme) {
    sendJson(res, 400, { error: 'Theme is required.' });
    return;
  }

  const prompt =
    `You are a JSON-only baby name generator. Respond with NOTHING except a single valid JSON object.\n` +
    `Generate exactly ${count} unique Indian baby names for a ${gender}.\n` +
    `Theme/style: ${theme}.\n` +
    (language === 'hi' ? 'Write meanings in Hindi Devanagari script.\n' : 'Write meanings in concise English.\n') +
    `Output format - ONLY this, no markdown, no code blocks, no explanation:\n` +
    `{"names":[{"name":"Aabha","meaning":"Radiant and brilliant women"},{"name":"Aajna","meaning":"A women who knows well, obedient women"}]}`;

  // Keep token request conservative so free-tier models don't reject oversized outputs.
  const maxTokens = count <= 20 ? 2048 : count <= 50 ? 3072 : 4096;
  const siteUrl = getSiteUrlFromRequest(req);

  try {
    let lastStatus = 502;
    let lastDetails = '';

    for (const candidateModel of modelCandidates()) {
      let response;
      try {
        response = await fetch(OPENROUTER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': siteUrl,
            'X-Title': OPENROUTER_SITE_TITLE,
          },
          body: JSON.stringify({
            model: candidateModel,
            messages: [
              {
                role: 'system',
                content:
                  'You generate Indian baby names and must return valid JSON only when requested.',
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.85,
            max_tokens: maxTokens,
          }),
        });
      } catch (fetchErr) {
        lastStatus = 502;
        const reason = extractFetchFailureReason(fetchErr) || 'Unknown network error';
        lastDetails = `[${candidateModel}] Network error contacting OpenRouter: ${reason}`.slice(0, 400);
        continue;
      }

      if (!response.ok) {
        lastStatus = response.status;
        const raw = await response.text().catch(() => '');
        const reason = extractErrorMessage(raw);
        lastDetails = `[${candidateModel}] ${friendlyFailureDetail(response.status, reason)}`.slice(0, 400);
        if (response.status === 401) {
          sendJson(res, 401, { error: 'OpenRouter request failed.', details: lastDetails });
          return;
        }
        continue;
      }

      const data = await response.json();
      if (data?.error) {
        lastStatus = 502;
        lastDetails = `[${candidateModel}] ${extractErrorMessage(JSON.stringify(data.error))}`.slice(0, 400);
        continue;
      }

      const content = extractContentText(data);
      const names = parseNames(content, count);

      if (!names.length) {
        lastStatus = 502;
        lastDetails = `[${candidateModel}] Could not parse names from model response.`.slice(0, 400);
        continue;
      }

      const enriched = names.map((entry) => {
        const profile = resolveAstroProfileForName(entry && entry.name);
        return {
          ...entry,
          rashi_en: profile.rashi_en,
          rashi_hi: profile.rashi_hi,
          nakshatra: profile.nakshatra,
          nakshatra_hi: profile.nakshatra_hi,
        };
      });

      sendJson(res, 200, { count: enriched.length, names: enriched, model: candidateModel });
      return;
    }

    sendJson(res, lastStatus, {
      error: 'OpenRouter request failed.',
      details: lastDetails || 'All configured models failed.',
    });
  } catch (err) {
    const reason = extractFetchFailureReason(err);
    sendJson(res, 500, {
      error: 'Server error',
      details: reason || 'Unknown server error',
    });
  }
};
