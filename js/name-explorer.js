(function () {
  const DATA_SOURCES = Object.freeze({
    boy: {
      en: "boy_names_eng.json",
      hi: "boy_names_hin.json"
    },
    girl: {
      en: "girl_names_eng.json",
      hi: "girl_names_hi.json"
    }
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
      if (typeof window.resolveHindiName === "function") {
        return window.resolveHindiName(decodeMaybeMojibake(rawHindi), fallbackEn);
      }
    } catch (_e) { }
    const cleaned = decodeMaybeMojibake(rawHindi || "").trim();
    if (/[\u0900-\u097F]/.test(cleaned)) return cleaned;
    return fallbackEn || "नाम";
  }

  function transliterateHindiToLatinSafe(value) {
    try {
      if (typeof window.transliterateHindiToLatin === "function") {
        return String(window.transliterateHindiToLatin(value) || "").trim();
      }
    } catch (_e) { }
    return String(value || "").trim();
  }

  function hasDevanagari(value) {
    return /[\u0900-\u097F]/.test(String(value || ""));
  }

  function getDisplayName(item, lang) {
    const hindiName = String(item && item.hindiName || "").trim();
    if (lang === "hi" && hasDevanagari(hindiName)) return hindiName;
    return String(item && item.name || "").trim();
  }

  function normalizeItem(item, gender) {
    const rawName = String(item && (item.name || item.Name) || "").trim();
    const name = /[\u0900-\u097F]/.test(rawName) ? transliterateHindiToLatinSafe(rawName) : rawName;
    if (!name) return null;
    const rawMeaning = String(item && (item.meaning || item.Meaning) || "").trim();
    const meaning = /^meaning\s+coming\s+soon\.?$/i.test(rawMeaning) ? "" : rawMeaning;
    const meaningHi = String(item && (item.meaning_hi || item.meaningHi || item.meaning_hin) || "").trim();
    const hindiName = resolveHindiNameSafe(
      item && (item.hindiName || item.hName || item.hindi_name || item.name_hindi || ""),
      rawName || name
    );
    return {
      name,
      gender,
      meaning,
      meaning_hi: decodeMaybeMojibake(meaningHi),
      hindiName,
      origin: item && (item.origin || item.Origin) || "",
      rashi: item && (item.rashi || item.zodiac || item.Zodiac) || "",
      horoscope: item && item.horoscope || ""
    };
  }

  function getEmbeddedJson(path) {
    const clean = String(path || "").replace(/^\/+/, "");
    const id = `name-explorer-data-${clean.replace(/[^a-z0-9_-]/gi, "-")}`;
    const el = document.getElementById(id);
    if (!el) throw new Error(`Missing embedded data: ${clean}`);
    return JSON.parse(el.textContent || "[]");
  }

  let cachedAll = null;
  async function loadAll() {
    if (cachedAll) return cachedAll;
    const [boysEn, boysHi, girlsEn, girlsHi] = await Promise.all([
      getEmbeddedJson(DATA_SOURCES.boy.en),
      getEmbeddedJson(DATA_SOURCES.boy.hi),
      getEmbeddedJson(DATA_SOURCES.girl.en),
      getEmbeddedJson(DATA_SOURCES.girl.hi)
    ]);

    const merged = [];
    (Array.isArray(boysEn) ? boysEn : []).forEach((it) => {
      const norm = normalizeItem(it, "boy");
      if (norm) merged.push(norm);
    });
    (Array.isArray(boysHi) ? boysHi : []).forEach((it) => {
      const norm = normalizeItem(it, "boy");
      if (!norm) return;
      const existing = merged.find((x) => x.gender === "boy" && x.name.toLowerCase() === norm.name.toLowerCase());
      if (existing) {
        existing.hindiName = norm.hindiName || existing.hindiName;
        existing.meaning_hi = norm.meaning_hi || existing.meaning_hi;
      } else {
        merged.push(norm);
      }
    });

    (Array.isArray(girlsEn) ? girlsEn : []).forEach((it) => {
      const norm = normalizeItem(it, "girl");
      if (norm) merged.push(norm);
    });
    (Array.isArray(girlsHi) ? girlsHi : []).forEach((it) => {
      const norm = normalizeItem(it, "girl");
      if (!norm) return;
      const existing = merged.find((x) => x.gender === "girl" && x.name.toLowerCase() === norm.name.toLowerCase());
      if (existing) {
        existing.hindiName = norm.hindiName || existing.hindiName;
        existing.meaning_hi = norm.meaning_hi || existing.meaning_hi;
      } else {
        merged.push(norm);
      }
    });

    cachedAll = merged;
    return merged;
  }

  function getParams() {
    const params = new URLSearchParams(window.location.search || "");
    return {
      q: (params.get("q") || "").trim(),
      gender: (params.get("gender") || "any").toLowerCase(),
      mode: (params.get("mode") || "both").toLowerCase(),
      sort: (params.get("sort") || "az").toLowerCase(),
      minlen: Number(params.get("minlen") || "0") || 0,
      maxlen: Number(params.get("maxlen") || "0") || 0,
      letter: (params.get("letter") || "").trim().toUpperCase()
    };
  }

  function setParams(next) {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value == null) return;
      const str = String(value).trim();
      if (!str || str === "0" || str === "any" || str === "both" || str === "az") return;
      params.set(key, str);
    });
    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState({}, "", url);
  }

  function matchQuery(item, q, mode) {
    if (!q) return true;
    const needle = q.toLowerCase();
    const inNameText = item.name.toLowerCase().includes(needle) || String(item.hindiName || "").toLowerCase().includes(needle);
    if (mode === "name") return inNameText;
    if (mode === "meaning") {
      const m = (item.meaning || "").toLowerCase();
      const mh = (item.meaning_hi || "").toLowerCase();
      return m.includes(needle) || mh.includes(needle);
    }
    const inName = inNameText;
    const inMeaning = (item.meaning || "").toLowerCase().includes(needle);
    const inMeaningHi = (item.meaning_hi || "").toLowerCase().includes(needle);
    return inName || inMeaning || inMeaningHi;
  }

  function applyFilters(items, state) {
    const { q, gender, mode, minlen, maxlen, letter } = state;
    return items.filter((it) => {
      if (gender !== "any" && it.gender !== gender) return false;
      const len = it.name.length;
      if (minlen && len < minlen) return false;
      if (maxlen && len > maxlen) return false;
      if (letter && !it.name.toUpperCase().startsWith(letter)) return false;
      if (!matchQuery(it, q, mode)) return false;
      return true;
    });
  }

  function getTrendingDb() {
    const key = "naamin_trending_v1";
    try {
      const raw = localStorage.getItem(key);
      const db = raw ? (JSON.parse(raw) || {}) : {};
      return (db && typeof db === "object") ? db : {};
    } catch (_e) {
      return {};
    }
  }

  function getTrendingScore(name, db) {
    const clean = String(name || "").trim();
    if (!clean) return 0;
    const rec = (db && db[clean]) ? db[clean] : null;
    if (!rec) return 0;
    const views = Number(rec.views || 0) || 0;
    const favs = Number(rec.favorites || 0) || 0;
    const last = Number(rec.last || 0) || 0;
    const ageDays = last ? Math.max(0, (Date.now() - last) / 86400000) : 999;
    // Gentle recency decay: ~50% drop every ~14 days.
    const decay = Math.pow(0.5, ageDays / 14);
    return (views + (favs * 3)) * decay;
  }

  function isPriorityEnglishName(item) {
    return Boolean(item && item.horoscope && isLikelyEnglishCopy(item.meaning));
  }

  function priorityCompare(a, b) {
    return Number(isPriorityEnglishName(b)) - Number(isPriorityEnglishName(a));
  }

  function applySort(items, sortKey) {
    const key = String(sortKey || "az").toLowerCase();
    if (key === "short") {
      return items.sort((a, b) => priorityCompare(a, b) || (a.name.length - b.name.length) || a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    }
    if (key === "long") {
      return items.sort((a, b) => priorityCompare(a, b) || (b.name.length - a.name.length) || a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    }
    if (key === "za") {
      return items.sort((a, b) => priorityCompare(a, b) || b.name.localeCompare(a.name, undefined, { sensitivity: "base" }));
    }
    if (key === "trending") {
      const db = getTrendingDb();
      return items.sort((a, b) => {
        const priority = priorityCompare(a, b);
        if (priority) return priority;
        const sa = getTrendingScore(a.name, db);
        const sb = getTrendingScore(b.name, db);
        if (sb !== sa) return sb - sa;
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      });
    }
    return items.sort((a, b) => priorityCompare(a, b) || a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }

  function renderAZ(container, activeLetter, onPick) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    container.innerHTML = "";
    letters.forEach((ch) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = ch;
      btn.className = ch === activeLetter ? "active notranslate" : "notranslate";
      btn.setAttribute("translate", "no");
      btn.setAttribute("lang", "en");
      btn.addEventListener("click", () => onPick(ch));
      container.appendChild(btn);
    });
  }

  function toMeaning(item, lang) {
    const hi = String(item.meaning_hi || "").trim();
    if (lang === "hi") {
      if (hi && /[\u0900-\u097F]/.test(hi)) return hi;
    }
    const en = String(item.meaning || "").trim();
    if (isLikelyEnglishCopy(en)) return en;
    if (hi && /[\u0900-\u097F]/.test(hi)) return hi;
    return "";
  }

  function isLikelyEnglishCopy(text) {
    const raw = String(text || "").replace(/\s+/g, " ").trim();
    if (!raw) return false;
    if (/^meaning\s+coming\s+soon\.?$/i.test(raw)) return false;
    if (/[\u0900-\u097F]/.test(raw)) return false; // Devanagari
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
    // If it's mostly Title Case words without punctuation, it's usually romanized Hindi in this dataset.
    const tokens = raw.split(" ").filter(Boolean);
    const titleCaseWords = tokens.filter((w) => /^[A-Z][a-z]+$/.test(w)).length;
    const hasPunct = /[.,;:()\-–—]/.test(raw);
    const hasLowercase = /[a-z]{2,}/.test(raw);
    if (!hasLowercase) return false;
    if (!hasPunct && tokens.length >= 5 && titleCaseWords / tokens.length > 0.7) return false;
    return true;
  }

  function safeCardText(value, maxLen = 140) {
    const raw = String(value || "").replace(/\s+/g, " ").trim();
    if (!raw) return "";
    if (raw.length <= maxLen) return raw;
    return raw.slice(0, maxLen - 1).trim() + "…";
  }

  function renderResults(container, countEl, statusEl, items, lang) {
    const total = items.length;
    countEl.textContent = lang === "hi" ? `परिणाम: ${total}` : `Results: ${total}`;
    container.innerHTML = "";
    statusEl.textContent = "";

    if (total === 0) {
      statusEl.textContent = lang === "hi" ? "कोई नाम नहीं मिला।" : "No names found.";
      return;
    }

    const top = items.slice(0, 90);
    top.forEach((item) => {
      const card = document.createElement("article");
      card.className = "explorer-card";

      const isFav = window.favManager && typeof window.favManager.isFavorite === "function"
        ? window.favManager.isFavorite(item.name)
        : false;

      const meaningText = safeCardText(toMeaning(item, lang));
      const displayName = getDisplayName(item, lang);
      const genderLabel = item.gender === "girl" ? (lang === "hi" ? "लड़की" : "Girl") : (lang === "hi" ? "लड़का" : "Boy");

      const secondaryName = lang === "hi" && displayName !== item.name ? item.name : genderLabel;

      card.innerHTML = `
        <div class="explorer-card-top">
          <div class="explorer-name">
            <strong>${displayName}</strong>
            <span>${secondaryName}</span>
          </div>
          <button class="explorer-heart ${isFav ? "active" : ""}" type="button" aria-label="Favorite">
            <i class="${isFav ? "fas" : "far"} fa-heart"></i>
          </button>
        </div>
        <p class="explorer-meaning">${meaningText || "अर्थ उपलब्ध नहीं है।"}</p>
        <div class="explorer-card-actions">
          <a class="explorer-link" href="name.html?name=${encodeURIComponent(item.name)}&gender=${encodeURIComponent(item.gender)}">
            ${lang === "hi" ? "विवरण" : "Details"} <i class="fas fa-arrow-right"></i>
          </a>
          <a class="explorer-link" href="name-report.html" title="Name Report">
            ${lang === "hi" ? "नाम रिपोर्ट" : "Name Report"}
          </a>
        </div>
      `;

      const trackEvent = (name, kind) => {
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
      };

      const detailsLink = card.querySelector('a[href^="name.html"]');
      if (detailsLink) {
        detailsLink.addEventListener("click", () => trackEvent(item.name, "view"));
      }

      const heart = card.querySelector(".explorer-heart");
      if (heart) {
        heart.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!window.favManager || typeof window.favManager.toggle !== "function") return;
          const added = window.favManager.toggle({ name: item.name, gender: item.gender, hName: item.hindiName, meaning: item.meaning });
          window.favManager.save();
          heart.classList.toggle("active", added);
          const icon = heart.querySelector("i");
          if (icon) {
            icon.className = `${added ? "fas" : "far"} fa-heart`;
          }
          if (added) trackEvent(item.name, "favorite");
        });
      }

      container.appendChild(card);
    });

    if (total > top.length) {
      statusEl.textContent = lang === "hi"
        ? `टॉप ${top.length} दिखाए गए। खोज और फ़िल्टर और सटीक करें।`
        : `Showing top ${top.length}. Refine your search/filters to narrow down.`;
    }
  }

  function boot() {
    const qInput = document.getElementById("explorer-q");
    const genderSel = document.getElementById("explorer-gender");
    const modeSel = document.getElementById("explorer-mode");
    const sortSel = document.getElementById("explorer-sort");
    const minSel = document.getElementById("explorer-minlen");
    const maxSel = document.getElementById("explorer-maxlen");
    const searchBtn = document.getElementById("explorer-search-btn");
    const clearBtn = document.getElementById("explorer-clear-btn");
    const az = document.getElementById("explorer-az");
    const results = document.getElementById("explorer-results");
    const countEl = document.getElementById("explorer-count");
    const statusEl = document.getElementById("explorer-status");

    if (!qInput || !genderSel || !modeSel || !sortSel || !minSel || !maxSel || !searchBtn || !clearBtn || !az || !results || !countEl || !statusEl) {
      return;
    }

    const state = getParams();
    qInput.value = state.q;
    genderSel.value = ["any", "boy", "girl"].includes(state.gender) ? state.gender : "any";
    modeSel.value = ["both", "name", "meaning"].includes(state.mode) ? state.mode : "both";
    sortSel.value = ["az", "za", "short", "long", "trending"].includes(state.sort) ? state.sort : "az";
    minSel.value = String(state.minlen || 0);
    maxSel.value = String(state.maxlen || 0);

    const refresh = async () => {
      const lang = getLang();
      countEl.textContent = lang === "hi" ? "लोड हो रहा है..." : "Loading...";
      statusEl.textContent = "";

      const items = await loadAll();
      const current = {
        q: String(qInput.value || "").trim(),
        gender: genderSel.value || "any",
        mode: modeSel.value || "both",
        sort: sortSel.value || "az",
        minlen: Number(minSel.value || "0") || 0,
        maxlen: Number(maxSel.value || "0") || 0,
        letter: state.letter || ""
      };

      setParams(current);
      const filtered = applySort(applyFilters(items, current), current.sort);
      renderResults(results, countEl, statusEl, filtered, lang);
    };

    const pickLetter = (ch) => {
      if (state.letter === ch) state.letter = "";
      else state.letter = ch;
      renderAZ(az, state.letter, pickLetter);
      refresh();
    };

    renderAZ(az, state.letter, pickLetter);

    const onSearch = () => refresh();
    searchBtn.addEventListener("click", onSearch);
    qInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") onSearch();
    });

    [genderSel, modeSel, sortSel, minSel, maxSel].forEach((el) => el.addEventListener("change", refresh));

    clearBtn.addEventListener("click", () => {
      qInput.value = "";
      genderSel.value = "any";
      modeSel.value = "both";
      sortSel.value = "az";
      minSel.value = "0";
      maxSel.value = "0";
      state.letter = "";
      renderAZ(az, state.letter, pickLetter);
      refresh();
    });

    document.addEventListener("languageChanged", () => refresh());

    refresh().catch((err) => {
      console.error(err);
      countEl.textContent = getLang() === "hi" ? "लोड नहीं हुआ।" : "Failed to load.";
      statusEl.textContent = String(err && err.message ? err.message : err);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
