'use strict';
const fs = require('fs');
const path = require('path');

// Whitelist of allowed JSON files that the client may request.
// Add more filenames here if you ship additional JSON datasets.
const ALLOWED = new Set([
  'boy_names_eng.json',
  'boy_names_hin.json',
  'boy_names_hi.json',
  'boy_names_en.json',
  'boy_names.json',
  'girl_names_eng.json',
  'girl_names_hi.json',
  'girl_names_en.json',
  'girl_names.json'
]);

function okJson(res, body) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.end(body);
}

module.exports = (req, res) => {
  try {
    if (req.method !== 'GET') { res.statusCode = 405; res.end('Method not allowed'); return; }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const file = String(url.searchParams.get('file') || '').trim();
    if (!file) { res.statusCode = 400; res.end('Missing file'); return; }

    if (!ALLOWED.has(file)) { res.statusCode = 400; res.end('Invalid file'); return; }

    const root = process.cwd();
    const p = path.resolve(root, file);
    if (!p.startsWith(root)) { res.statusCode = 403; res.end('Forbidden'); return; }
    if (!fs.existsSync(p)) { res.statusCode = 404; res.end('Not found'); return; }

    const body = fs.readFileSync(p, 'utf8');
    okJson(res, body);
  } catch (e) {
    res.statusCode = 500; res.end('Server error');
  }
};
