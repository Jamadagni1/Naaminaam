(function () {
  function detectBasePath() {
    try {
      const path = window.location.pathname || "/";
      const segments = path.split("/").filter(Boolean);
      if (!segments.length) return "";

      const knownFirstSegments = new Set([
        "index.html", "about.html", "parents-mix.html", "ai-names.html", "popular-names.html",
        "unique-names.html", "famous-personalities.html", "name-report.html", "product.html",
        "services.html", "careers.html", "blog.html", "contact.html", "pricing.html",
        "profile.html", "wishlist.html", "name-explorer.html", "name.html", "more", "assets", "js", "api"
      ]);

      const first = String(segments[0] || "").toLowerCase();
      return knownFirstSegments.has(first) ? "" : `/${segments[0]}`;
    } catch (_e) {
      return "";
    }
  }

  const BASE_PATH = detectBasePath();
  const withBasePath = (relativePath) => {
    const clean = String(relativePath || "").replace(/^\/+/, "");
    return BASE_PATH ? `${BASE_PATH}/${clean}` : `/${clean}`;
  };

  const SOURCES = Object.freeze({
    boy: { en: "boy_names_eng.json", hi: "boy_names_hin.json" },
    girl: { en: "girl_names_eng.json", hi: "girl_names_hi.json" }
  });

  function getLang() {
    try {
      return localStorage.getItem("language") === "hi" ? "hi" : "en";
    } catch (_e) {
      return "en";
    }
  }

  function decodeMaybeMojibake(value) {
    if (value == null) return "";
    const raw = String(value);
    try {
      if (typeof window.decodeHindiMojibake === "function") return window.decodeHindiMojibake(raw);
      if (typeof window.decodeHindiMojibakeDeep === "function") return window.decodeHindiMojibakeDeep(raw);
    } catch (_e) { }
    return raw;
  }

  function resolveHindiNameSafe(rawHindi, fallbackEn) {
    try {
      if (typeof window.resolveHindiName === "function") return window.resolveHindiName(decodeMaybeMojibake(rawHindi), fallbackEn);
    } catch (_e) { }
    const cleaned = decodeMaybeMojibake(rawHindi || "").trim();
    if (/[\u0900-\u097F]/.test(cleaned)) return cleaned;
    return fallbackEn || "नाम";
  }

  function normalizeItem(item, gender) {
    const name = String(item && (item.name || item.Name) || "").trim();
    if (!name) return null;
    return {
      name,
      gender,
      meaning: String(item && item.meaning || "").trim(),
      meaning_hi: decodeMaybeMojibake(String(item && (item.meaning_hi || item.meaningHi || "") || "").trim()),
      hindiName: resolveHindiNameSafe(item && (item.hindiName || item.hName || item.hindi_name || item.name_hindi || ""), name)
    };
  }

  async function fetchJson(path) {
    const attempts = [withBasePath(path), `/${path}`, `/api/static-names?file=${encodeURIComponent(path)}`];
    let lastErr = null;
    for (const url of attempts) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
        return res.json();
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error(`Failed to load ${path}`);
  }

  async function loadGender(gender) {
    const src = SOURCES[gender] || SOURCES.boy;
    const [en, hi] = await Promise.all([fetchJson(src.en), fetchJson(src.hi)]);
    const merged = [];
    (Array.isArray(en) ? en : []).forEach((it) => {
      const norm = normalizeItem(it, gender);
      if (norm) merged.push(norm);
    });
    (Array.isArray(hi) ? hi : []).forEach((it) => {
      const norm = normalizeItem(it, gender);
      if (!norm) return;
      const existing = merged.find((x) => x.name.toLowerCase() === norm.name.toLowerCase());
      if (existing) {
        existing.hindiName = norm.hindiName || existing.hindiName;
        existing.meaning_hi = norm.meaning_hi || existing.meaning_hi;
      } else {
        merged.push(norm);
      }
    });
    return merged;
  }

  function params() {
    const p = new URLSearchParams(window.location.search || "");
    const rawName = (p.get("name") || "").trim();
    const gender = (p.get("gender") || "boy").toLowerCase() === "girl" ? "girl" : "boy";
    const lang = getLang();
    let name = rawName;
    if (lang === "en" && /[\u0900-\u097F]/.test(name)) {
      try {
        if (typeof window.transliterateHindiToLatin === "function") {
          name = String(window.transliterateHindiToLatin(name) || "").trim() || rawName;
        }
      } catch (_e) { }
    }
    return { name, gender };
  }

  function toMeaning(item, lang) {
    if (!item) return "";
    if (lang === "hi") {
      const hi = String(item.meaning_hi || "").trim();
      if (hi && /[\u0900-\u097F]/.test(hi)) return hi;
    }
    const en = String(item.meaning || "").trim();
    if (!en) return "";
    // Avoid showing romanized Hindi in English UI.
    if (lang !== "hi" && !isLikelyEnglishCopy(en)) return "";
    return en;
  }

  function isLikelyEnglishCopy(text) {
    const raw = String(text || "").replace(/\s+/g, " ").trim();
    if (!raw) return false;
    if (/[\u0900-\u097F]/.test(raw)) return false;
    // This repo's `*_names_eng.json` meanings are frequently romanized Hindi.
    // Filter common Hindi transliteration markers even when casing is inconsistent.
    const lower = raw.toLowerCase();
    // 1) Common Hindi connectors as standalone words.
    if (/(?:^|[^a-z])(ke|ka|ki|men|mein|se|aur)(?:$|[^a-z])/.test(lower)) return false;
    // 2) Common romanized suffix/markers often embedded inside longer words in this dataset.
    if (/(wala|wali|wale|vaala|vaali|vaale|vaalaa|vaalii|rahane|rahaane|khush|khusha|prasann|prasanna|jnyaan|gyan|buddhi|bhagavaan|bhagwan|shakti|prakaash|sadaa|logon|sabako|sabke|vyakti|tarah|achchh|vichaar|kaarya|karane|pathapradarsh)/.test(lower)) return false;
    // 3) Extra guard: transliteration-heavy spellings with no common English stopwords.
    const hasCommonEnglishStopword = /\b(the|and|of|to|in|with|for|from|by|on|at)\b/.test(lower);
    const hasTransliterationClusters = /(chh|achchh|bh|dh|jh|kh|ph|sh|th|aa|ee|oo|ii|ksh|tr|gy|jnya)/.test(lower);
    if (hasTransliterationClusters && !hasCommonEnglishStopword) return false;
    const tokens = raw.split(" ").filter(Boolean);
    const titleCaseWords = tokens.filter((w) => /^[A-Z][a-z]+$/.test(w)).length;
    const hasPunct = /[.,;:()\-–—]/.test(raw);
    const hasLowercase = /[a-z]{2,}/.test(raw);
    if (!hasLowercase) return false;
    if (!hasPunct && tokens.length >= 5 && titleCaseWords / tokens.length > 0.7) return false;
    return true;
  }

  function pickSimilar(list, current) {
    const clean = String(current || "").trim();
    if (!clean) return [];
    const first = clean.slice(0, 1).toLowerCase();
    const prefix2 = clean.slice(0, 2).toLowerCase();

    const scored = list
      .filter((x) => x && x.name && x.name.toLowerCase() !== clean.toLowerCase())
      .map((x) => {
        const n = x.name.toLowerCase();
        let score = 0;
        if (n.startsWith(prefix2)) score += 4;
        else if (n.startsWith(first)) score += 2;
        const lenDelta = Math.abs(x.name.length - clean.length);
        score += Math.max(0, 2 - Math.min(2, lenDelta));
        return { x, score };
      })
      .sort((a, b) => b.score - a.score || a.x.name.localeCompare(b.x.name, undefined, { sensitivity: "base" }));

    return scored.slice(0, 18).map((s) => s.x);
  }

  function setFavButton(btn, isFav) {
    btn.classList.toggle("active", isFav);
    const icon = btn.querySelector("i");
    if (icon) icon.className = `${isFav ? "fas" : "far"} fa-heart`;
  }

  function trackEvent(name, kind) {
    const key = "naamin_trending_v1";
    const clean = String(name || "").trim();
    if (!clean) return;
    try {
      const raw = localStorage.getItem(key);
      const db = raw ? (JSON.parse(raw) || {}) : {};
      const rec = db[clean] || { views: 0, favorites: 0, last: 0 };
      if (kind === "favorite") rec.favorites = (rec.favorites || 0) + 1;
      else rec.views = (rec.views || 0) + 1;
      rec.last = Date.now();
      db[clean] = rec;
      localStorage.setItem(key, JSON.stringify(db));
    } catch (_e) { }
  }

  async function copyLink() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (_e) {
      try {
        const tmp = document.createElement("input");
        tmp.value = url;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        tmp.remove();
        return true;
      } catch (_e2) {
        return false;
      }
    }
  }

  async function boot() {
    const { name, gender } = params();
    const titleEl = document.getElementById("name-title");
    const hiEl = document.getElementById("name-hi");
    const genderEl = document.getElementById("name-gender");
    const meaningEl = document.getElementById("name-meaning");
    const grid = document.getElementById("similar-grid");
    const favBtn = document.getElementById("fav-btn");
    const copyBtn = document.getElementById("copy-btn");

    if (!titleEl || !hiEl || !genderEl || !meaningEl || !grid || !favBtn || !copyBtn) return;

    const lang = getLang();
    const list = await loadGender(gender);
    const item = list.find((x) => x.name.toLowerCase() === name.toLowerCase()) || list.find((x) => x.name.toLowerCase() === decodeURIComponent(name).toLowerCase());

    const displayName = item ? item.name : (name || "Name");
    titleEl.textContent = displayName;
    hiEl.textContent = item ? (lang === "hi" ? item.hindiName : item.hindiName) : resolveHindiNameSafe("", displayName);
    genderEl.textContent = gender === "girl" ? (lang === "hi" ? "लड़की" : "Girl") : (lang === "hi" ? "लड़का" : "Boy");
    meaningEl.textContent = item
      ? (toMeaning(item, lang) || (lang === "hi" ? "अर्थ उपलब्ध नहीं है।" : "Meaning (English) coming soon."))
      : (lang === "hi" ? "अर्थ उपलब्ध नहीं है।" : "Meaning (English) coming soon.");

    trackEvent(displayName, "view");

    const isFav = window.favManager && typeof window.favManager.isFavorite === "function"
      ? window.favManager.isFavorite(displayName)
      : false;
    setFavButton(favBtn, isFav);

    favBtn.addEventListener("click", () => {
      if (!window.favManager || typeof window.favManager.toggle !== "function") return;
      const added = window.favManager.toggle({ name: displayName, gender, hName: item ? item.hindiName : hiEl.textContent, meaning: item ? item.meaning : "" });
      window.favManager.save();
      setFavButton(favBtn, added);
      if (added) trackEvent(displayName, "favorite");
    });

    copyBtn.addEventListener("click", async () => {
      const ok = await copyLink();
      copyBtn.style.opacity = "0.85";
      copyBtn.querySelector("span").textContent = ok ? (getLang() === "hi" ? "कॉपी हुआ" : "Copied") : (getLang() === "hi" ? "फेल" : "Failed");
      window.setTimeout(() => {
        copyBtn.style.opacity = "";
        const span = copyBtn.querySelector("span");
        if (span) span.textContent = getLang() === "hi" ? "लिंक कॉपी" : "Copy link";
      }, 1100);
    });

    const similar = pickSimilar(list, displayName);
    grid.innerHTML = "";
    if (!similar.length) {
      grid.innerHTML = `<div style="color: rgba(255,255,255,0.78)">${lang === "hi" ? "कोई सुझाव नहीं।" : "No suggestions yet."}</div>`;
    } else {
      similar.forEach((s) => {
        const el = document.createElement("div");
        el.className = "similar-item";
        const fav = window.favManager && typeof window.favManager.isFavorite === "function"
          ? window.favManager.isFavorite(s.name)
          : false;
        el.innerHTML = `
          <a class="notranslate" translate="no" lang="en" href="name.html?name=${encodeURIComponent(s.name)}&gender=${encodeURIComponent(gender)}">
            <strong>${s.name}</strong>
          </a>
          <button class="explorer-heart ${fav ? "active" : ""}" type="button" aria-label="Favorite">
            <i class="${fav ? "fas" : "far"} fa-heart"></i>
          </button>
        `;
        const heart = el.querySelector("button");
        heart.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!window.favManager || typeof window.favManager.toggle !== "function") return;
          const added = window.favManager.toggle({ name: s.name, gender, hName: s.hindiName, meaning: s.meaning });
          window.favManager.save();
          heart.classList.toggle("active", added);
          const icon = heart.querySelector("i");
          if (icon) icon.className = `${added ? "fas" : "far"} fa-heart`;
        });
        grid.appendChild(el);
      });
    }

    document.addEventListener("languageChanged", () => {
      const nextLang = getLang();
      meaningEl.textContent = item
        ? (toMeaning(item, nextLang) || (nextLang === "hi" ? "अर्थ उपलब्ध नहीं है।" : "Meaning (English) coming soon."))
        : (nextLang === "hi" ? "अर्थ उपलब्ध नहीं है।" : "Meaning (English) coming soon.");
      genderEl.textContent = gender === "girl" ? (nextLang === "hi" ? "लड़की" : "Girl") : (nextLang === "hi" ? "लड़का" : "Boy");
      hiEl.textContent = item ? item.hindiName : hiEl.textContent;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => boot().catch(console.error), { once: true });
  } else {
    boot().catch(console.error);
  }
})();
