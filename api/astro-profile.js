'use strict';

const { resolveAstroProfileForName } = require('./astro-profile-core');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, status, payload) {
  setCors(res);
  res.status(status).json(payload);
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

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    setCors(res);
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const body = req.method === 'POST' ? parseRequestBody(req) : {};
  const queryName = req.query && typeof req.query.name === 'string' ? req.query.name : '';
  const name = String(body.name || queryName || '').trim();

  if (!name) {
    sendJson(res, 400, { error: 'Name is required.' });
    return;
  }

  const profile = resolveAstroProfileForName(name);
  sendJson(res, 200, {
    ok: true,
    name,
    profile
  });
};

