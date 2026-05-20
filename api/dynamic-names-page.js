'use strict';

const { getNamesPage, listCategories } = require('./names-repo');
const { resolveAstroProfileForName } = require('./astro-profile-core');

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toTitleCaseFromSlug(slug) {
  const clean = String(slug || '')
    .trim()
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  if (!clean) return '';
  return clean
    .split('-')
    .map(w => (w ? (w[0].toUpperCase() + w.slice(1).toLowerCase()) : ''))
    .filter(Boolean)
    .join(' ');
}

function stableHashInt(s) {
  const str = String(s || '');
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick(list, seed, index) {
  if (!Array.isArray(list) || !list.length) return '';
  const i = (seed + index * 2654435761) >>> 0;
  return list[i % list.length];
}

function buildIntro({ categoryTitle, genderTitle, letter, language, sample }) {
  const seed = stableHashInt(`${categoryTitle}|${genderTitle}|${letter}`);

  const openers = [
    'Looking for a meaningful name that begins with',
    'Choosing a baby name that starts with',
    'If you prefer names beginning with',
    'Names starting with'
  ];
  const angle = [
    'can feel both classic and modern at the same time',
    'often stand out while still feeling easy to pronounce',
    'are popular because they sound strong, soft, or stylish depending on the pick',
    'work well across traditional and contemporary naming styles'
  ];
  const india = [
    'In India, many families also consider meaning, pronunciation, and cultural fit.',
    'Across India, parents frequently balance tradition with a modern vibe.',
    'Many Indian parents shortlist names by letter first, then compare meanings.',
    'A letter-based shortlist makes it easier to compare options quickly.'
  ];
  const culture = [
    'You can filter by religion/origin, language preference, and overall style.',
    'Origin, language, and family tradition can help you narrow down the best choices.',
    'Some families also check rashi/nakshatra compatibility or a preferred sound pattern.',
    'If you follow astrology, you can cross-check rashi and nakshatra preferences too.'
  ];
  const promise = [
    'Below is a curated list with meanings so you can shortlist faster.',
    'This page includes meanings and origin labels to help you decide with confidence.',
    'Explore popular picks first, then scroll for unique options with beautiful meanings.',
    'Start with trending options, then discover rare names that still feel natural to say.'
  ];
  const closer = [
    'Use the A–Z links to explore more letters and compare similar-sounding names.',
    'You can also switch between boy and girl lists for the same letter.',
    'Bookmark this list and come back after discussing a shortlist with family.',
    'Check the next letters too—sometimes the best match is one step away.'
  ];

  const religionBit = categoryTitle ? `${categoryTitle} ` : '';
  const langBit = language === 'hi' ? 'Hindi' : 'English';

  const sampleName = sample && sample.name ? String(sample.name).trim() : '';
  const sampleMeaningRaw = sample && sample.meaning ? String(sample.meaning).trim() : '';
  const sampleMeaning = sampleMeaningRaw
    ? sampleMeaningRaw.split(/\s+/).slice(0, 14).join(' ').replace(/[.,"'“”]+$/g, '')
    : '';
  const sampleOrigin = sample && (sample.category || sample.origin) ? String(sample.category || sample.origin).trim() : '';
  const sampleRashi = sample && sample.rashi ? String(sample.rashi).trim() : '';
  const sampleRashiphal = sample && sample.rashiphal ? String(sample.rashiphal).trim() : '';

  const s1 = `${pick(openers, seed, 1)} ${letter}? ${religionBit}${genderTitle} names starting with “${letter}” ${pick(angle, seed, 2)}.`;
  const s2 = pick(india, seed, 3);
  const s3 = `This list is built for ${langBit} readers and shows ${genderTitle.toLowerCase()} names with meaning and origin/religion tags so you can shortlist faster.`;
  const s4 = `Along with meaning and origin, many families also check Rashi and simple rashiphal guidance for compatibility.`;
  const s5 = (sampleName && (sampleMeaning || sampleOrigin || sampleRashi))
    ? `For example, ${sampleName}${sampleMeaning ? ` means “${sampleMeaning}”` : ''}${sampleOrigin ? ` and is often tagged as ${sampleOrigin}` : ''}${sampleRashi ? `; rashi mapping commonly shows ${sampleRashi}` : ''}${sampleRashiphal ? ` with a simple rashiphal idea like “${sampleRashiphal}”` : ''}.`
    : pick(promise, seed, 5);
  const s6 = pick(culture, seed, 6);
  const s7 = pick(closer, seed, 7);

  // Keep within ~100–150 words.
  const full = [s1, s2, s3, s4, s5, s6, s7].join(' ');
  const words = full.split(/\s+/).filter(Boolean);
  if (words.length <= 155) return full;
  return words.slice(0, 150).join(' ').replace(/[.,"'“”]+$/g, '') + '.';
}

function buildBasePath({ categorySlug, gender, letter }) {
  if (categorySlug) return `/${categorySlug}-${gender}-names-starting-with-${letter.toLowerCase()}`;
  return `/${gender}-names-starting-with-${letter.toLowerCase()}`;
}

function absoluteUrl(req, pathWithQuery) {
  const envOrigin = process.env.SITE_ORIGIN && String(process.env.SITE_ORIGIN).trim();
  if (envOrigin) return envOrigin.replace(/\/+$/, '') + pathWithQuery;
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const proto = (req.headers['x-forwarded-proto'] || 'http').split(',')[0].trim();
  return `${proto}://${host}${pathWithQuery}`;
}

function clampPage(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 1;
  return Math.max(1, Math.trunc(x));
}

function parseRoute(pathname) {
  const clean = String(pathname || '').replace(/\/+$/, '');

  // /boy-names-starting-with-a
  let m = clean.match(/^\/(boy|girl)-names-starting-with-([a-z])$/i);
  if (m) return { categorySlug: '', gender: m[1].toLowerCase(), letter: m[2].toUpperCase() };

  // /hindu-boy-names-starting-with-a
  m = clean.match(/^\/([a-z0-9-]+)-(boy|girl)-names-starting-with-([a-z])$/i);
  if (m) return { categorySlug: m[1].toLowerCase(), gender: m[2].toLowerCase(), letter: m[3].toUpperCase() };

  return null;
}

function buildMetaDescription({ categoryTitle, genderTitle, letter, items }) {
  const cat = categoryTitle ? `${categoryTitle} ` : '';
  const base = `Find the best ${cat}${genderTitle} names starting with ${letter}. Explore meanings, origin/religion, and popular + unique baby names (2026 list).`;
  const top = (Array.isArray(items) ? items : []).slice(0, 3).map(x => x && x.name).filter(Boolean);
  const extra = top.length ? ` Top picks: ${top.join(', ')}.` : '';
  const out = (base + extra).slice(0, 170);
  return out.length < 120 ? (base + extra) : out;
}

function renderLettersNav({ categorySlug, gender, currentLetter }) {
  const links = LETTERS.map((L) => {
    const href = buildBasePath({ categorySlug, gender, letter: L });
    const active = L === currentLetter;
    return `<a class="az-link${active ? ' is-active' : ''}" href="${href}">${L}</a>`;
  }).join('');

  return `<div class="az">${links}</div>`;
}

function renderPagination({ basePath, page, pageSize, total }) {
  if (!total || total <= pageSize) return '';
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return '';

  const prev = page > 1 ? `${basePath}?page=${page - 1}` : '';
  const next = page < totalPages ? `${basePath}?page=${page + 1}` : '';

  const maxButtons = 7;
  const start = Math.max(1, page - Math.floor(maxButtons / 2));
  const end = Math.min(totalPages, start + maxButtons - 1);
  const buttons = [];
  for (let p = start; p <= end; p++) {
    const href = p === 1 ? basePath : `${basePath}?page=${p}`;
    buttons.push(`<a class="pg${p === page ? ' is-active' : ''}" href="${href}">${p}</a>`);
  }

  return `
  <nav class="pagination" aria-label="Pagination">
    <div class="pg-row">
      ${prev ? `<a class="pg prev" rel="prev" href="${prev}">Prev</a>` : `<span class="pg prev is-disabled">Prev</span>`}
      <div class="pg-pages">${buttons.join('')}</div>
      ${next ? `<a class="pg next" rel="next" href="${next}">Next</a>` : `<span class="pg next is-disabled">Next</span>`}
    </div>
    <div class="pg-meta">Page ${page} of ${totalPages}</div>
  </nav>`;
}

function renderNameTable(items) {
  if (!items.length) return '<p>No names found for this filter yet.</p>';
  const rows = items.map((x) => {
    const origin = x.category || x.origin || '';
    return `<tr>
      <td class="col-name">${escapeHtml(x.name)}</td>
      <td class="col-meaning">${escapeHtml(x.meaning || '')}</td>
      <td class="col-origin">${escapeHtml(origin)}</td>
    </tr>`;
  }).join('');

  return `<div class="table-wrap">
    <table class="names-table">
      <thead>
        <tr><th>Name</th><th>Meaning</th><th>Origin/Religion</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

function pickUnique(items) {
  if (!items.length) return [];
  // deterministic-ish: take later items so it differs from "popular"
  return items.slice(-20).slice(0, 12);
}

function renderListPills(items, limit) {
  const list = items.slice(0, limit).map(x => `<a class="pill" href="/name.html?name=${encodeURIComponent(x.name)}">${escapeHtml(x.name)}</a>`).join('');
  return `<div class="pills">${list}</div>`;
}

function buildBrowseMore({ categorySlug, categoryTitle, gender, genderTitle, letter }) {
  const otherGender = gender === 'boy' ? 'girl' : 'boy';
  const otherGenderTitle = otherGender === 'boy' ? 'Boy' : 'Girl';
  const sameLetterOtherGenderHref = buildBasePath({ categorySlug, gender: otherGender, letter });
  const nextLetters = LETTERS.slice(Math.min(LETTERS.length - 1, LETTERS.indexOf(letter) + 1), Math.min(LETTERS.length, LETTERS.indexOf(letter) + 4));
  const nextLinks = nextLetters.map(L => {
    const href = buildBasePath({ categorySlug, gender, letter: L });
    return `<a href="${href}">Names starting with ${L}</a>`;
  }).join('');

  return `
  <section class="browse">
    <h2>Browse More Names</h2>
    <div class="browse-grid">
      <div class="browse-card">
        <h3>A–Z Letters</h3>
        ${renderLettersNav({ categorySlug, gender, currentLetter: letter })}
      </div>
      <div class="browse-card">
        <h3>Switch Gender</h3>
        <p><a href="${sameLetterOtherGenderHref}">${categoryTitle ? categoryTitle + ' ' : ''}${otherGenderTitle} Names Starting With ${letter}</a></p>
      </div>
      <div class="browse-card">
        <h3>Next Letters</h3>
        <div class="next-links">${nextLinks || ''}</div>
      </div>
    </div>
  </section>`;
}

function renderFaq({ categoryTitle, genderTitle, letter, items }) {
  const top = items.slice(0, 6).map(x => x.name).filter(Boolean);
  const q1 = `${letter} se kaunse popular ${genderTitle.toLowerCase()} names hain?`;
  const a1 = top.length
    ? `${letter} se popular ${genderTitle.toLowerCase()} names me ${top.slice(0, 4).join(', ')} jaise options aate hain. Aap meaning aur origin ke basis par shortlist kar sakte hain.`
    : `${letter} se popular ${genderTitle.toLowerCase()} names aapko is page par meaning ke saath mil jayenge.`;
  const q2 = `Unique ${categoryTitle ? categoryTitle + ' ' : ''}${genderTitle} names kaunse hain?`;
  const a2 = `Unique names ke liye meaning, pronunciation, aur origin ko compare karein. Rare options usually kam common hote hain, lekin sound aur meaning strong hote hain.`;
  const q3 = `${letter} se modern names kaunse hain?`;
  const a3 = `Modern names often short, easy-to-spell, aur international-friendly hote hain. Aap list me se aise names choose kar sakte hain jo daily use me simple lagte hain.`;

  return `
  <section class="faq">
    <h2>FAQs</h2>
    <details><summary>${escapeHtml(q1)}</summary><p>${escapeHtml(a1)}</p></details>
    <details><summary>${escapeHtml(q2)}</summary><p>${escapeHtml(a2)}</p></details>
    <details><summary>${escapeHtml(q3)}</summary><p>${escapeHtml(a3)}</p></details>
  </section>`;
}

async function renderNamesStartingWithPage(req, { pathname, searchParams }) {
  const route = parseRoute(pathname);
  if (!route) return null;

  const language = String(searchParams.get('lang') || 'en').toLowerCase() === 'hi' ? 'hi' : 'en';
  const page = clampPage(searchParams.get('page'));
  const pageSize = clampPage(searchParams.get('pageSize') || 50);

  const categoryTitle = toTitleCaseFromSlug(route.categorySlug);
  const genderTitle = route.gender === 'boy' ? 'Boy' : 'Girl';
  const religionTitle = categoryTitle || '';

  const data = await getNamesPage({
    letter: route.letter,
    gender: route.gender,
    category: religionTitle,
    page,
    pageSize
  });

  const items = data.items || [];

  let introSample = null;
  try {
    const sampleItem = items.find((x) => x && x.name && (x.meaning || x.category || x.origin)) || items[0] || null;
    if (sampleItem && sampleItem.name) {
      const profile = resolveAstroProfileForName(sampleItem.name);
      introSample = {
        name: sampleItem.name,
        meaning: sampleItem.meaning || '',
        category: sampleItem.category || '',
        origin: sampleItem.origin || '',
        rashi: language === 'hi' ? (profile.rashi_hi || profile.rashi_en) : (profile.rashi_en || ''),
        rashiphal: language === 'hi' ? (profile.rashiphal_hi || profile.rashiphal_en) : (profile.rashiphal_en || '')
      };
    }
  } catch (_e) {
    introSample = null;
  }

  const basePath = buildBasePath({ categorySlug: route.categorySlug, gender: route.gender, letter: route.letter });
  const canonical = absoluteUrl(req, page > 1 ? `${basePath}?page=${page}` : basePath);

  const titleCore = `${religionTitle ? religionTitle + ' ' : ''}${genderTitle} Names Starting With ${route.letter}`;
  const title = `${titleCore} (2026 List)`;
  const description = buildMetaDescription({ categoryTitle: religionTitle, genderTitle, letter: route.letter, items });
  const intro = buildIntro({ categoryTitle: religionTitle, genderTitle, letter: route.letter, language, sample: introSample });

  const popular = items.slice(0, 20);
  const unique = pickUnique(items);

  const prevUrl = data.total && data.total > data.pageSize && page > 1 ? absoluteUrl(req, `${basePath}?page=${page - 1}`) : '';
  const nextUrl = data.total && data.total > data.pageSize && data.total > (page * data.pageSize) ? absoluteUrl(req, `${basePath}?page=${page + 1}`) : '';

  const cats = await listCategories().catch(() => []);
  const catLinks = (cats || []).slice(0, 24).map((c) => {
    const slug = String(c).trim().toLowerCase().replace(/\s+/g, '-');
    const href = buildBasePath({ categorySlug: slug, gender: route.gender, letter: route.letter });
    return `<a class="pill" href="${href}">${escapeHtml(c)}</a>`;
  }).join('');

  const h1 = `${titleCore}`;

  const html = `<!doctype html>
<html lang="${language === 'hi' ? 'hi' : 'en'}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  ${prevUrl ? `<link rel="prev" href="${escapeHtml(prevUrl)}" />` : ''}
  ${nextUrl ? `<link rel="next" href="${escapeHtml(nextUrl)}" />` : ''}
  <link rel="stylesheet" href="/style.css" />
  <link rel="stylesheet" href="/assets/dynamic-names.css" />
</head>
<body>
  <main class="dyn-names">
    <header class="dyn-header">
      <h1>${escapeHtml(h1)}</h1>
      <p class="dyn-intro">${escapeHtml(intro)}</p>
      <div class="dyn-quick">
        <div class="dyn-az-wrap">
          <div class="label">Browse by letter</div>
          ${renderLettersNav({ categorySlug: route.categorySlug, gender: route.gender, currentLetter: route.letter })}
        </div>
      </div>
    </header>

    <section class="names">
      <h2>Names List</h2>
      ${renderNameTable(items)}
      ${renderPagination({ basePath, page: data.page, pageSize: data.pageSize, total: data.total })}
    </section>

    <section class="popular">
      <h2>Popular ${escapeHtml(genderTitle)} Names Starting With ${escapeHtml(route.letter)}</h2>
      ${popular.length ? renderListPills(popular, 20) : '<p>No popular names found yet.</p>'}
    </section>

    <section class="unique">
      <h2>Unique ${religionTitle ? escapeHtml(religionTitle) + ' ' : ''}${escapeHtml(genderTitle)} Names Starting With ${escapeHtml(route.letter)}</h2>
      ${unique.length ? renderListPills(unique, 12) : '<p>No unique names found yet.</p>'}
    </section>

    ${buildBrowseMore({ categorySlug: route.categorySlug, categoryTitle: religionTitle, gender: route.gender, genderTitle, letter: route.letter })}

    ${catLinks ? `
    <section class="cats">
      <h2>Explore Categories</h2>
      <div class="pills">${catLinks}</div>
    </section>` : ''}

    ${renderFaq({ categoryTitle: religionTitle, genderTitle, letter: route.letter, items })}
  </main>
</body>
</html>`;

  return {
    status: 200,
    contentType: 'text/html; charset=utf-8',
    cacheControl: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    body: html
  };
}

function buildSitemapPaths({ categories }) {
  const paths = [];
  for (const gender of ['boy', 'girl']) {
    for (const letter of LETTERS) {
      paths.push(buildBasePath({ categorySlug: '', gender, letter }));
    }
  }

  for (const cat of categories || []) {
    const slug = String(cat).trim().toLowerCase().replace(/\s+/g, '-');
    if (!slug) continue;
    for (const gender of ['boy', 'girl']) {
      for (const letter of LETTERS) {
        paths.push(buildBasePath({ categorySlug: slug, gender, letter }));
      }
    }
  }

  return paths;
}

async function renderSitemapXml(req) {
  const categories = await listCategories().catch(() => []);
  const paths = buildSitemapPaths({ categories });

  const urls = paths.map((p) => {
    const loc = absoluteUrl(req, p);
    return `<url><loc>${escapeHtml(loc)}</loc></url>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return {
    status: 200,
    contentType: 'application/xml; charset=utf-8',
    cacheControl: 'public, max-age=0, s-maxage=21600, stale-while-revalidate=86400',
    body: xml
  };
}

function renderRobotsTxt(req) {
  const sitemap = absoluteUrl(req, '/sitemap.xml');
  const txt = `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;
  return {
    status: 200,
    contentType: 'text/plain; charset=utf-8',
    cacheControl: 'public, max-age=0, s-maxage=21600, stale-while-revalidate=86400',
    body: txt
  };
}

module.exports = {
  parseRoute,
  renderNamesStartingWithPage,
  renderSitemapXml,
  renderRobotsTxt
};
