(function () {
  const STORAGE_KEY = "naamin-google-translate-language";
  const SELECT_ID = "global-google-translate-select";
  const HIDDEN_FAB_ID = "global-language-fab";
  const SLOT_ID = "global-google-translate-nav-slot";
  const MOBILE_SLOT_ID = "global-google-translate-nav-slot-mobile";
  const HOST_ID = "naamin-google-translate-element";
  const SCRIPT_ID = "naamin-google-translate-script";
  const SCRIPT_URLS = [
    "https://translate.google.com/translate_a/element.js",
    "https://translate.googleapis.com/translate_a/element.js",
  ];

  const LANG_OPTIONS = [
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
    { value: "bn", label: "Bengali" },
    { value: "gu", label: "Gujarati" },
    { value: "mr", label: "Marathi" },
    { value: "ta", label: "Tamil" },
    { value: "te", label: "Telugu" },
    { value: "kn", label: "Kannada" },
    { value: "ml", label: "Malayalam" },
    { value: "pa", label: "Punjabi" },
    { value: "ur", label: "Urdu" },
    { value: "ne", label: "Nepali" },
    { value: "or", label: "Odia" },
    { value: "as", label: "Assamese" },
    { value: "sa", label: "Sanskrit" },
    { value: "sd", label: "Sindhi" },
    { value: "ks", label: "Kashmiri" },
    { value: "mai", label: "Maithili" },
    { value: "doi", label: "Dogri" },
    { value: "gom", label: "Konkani" },
    { value: "mni-Mtei", label: "Manipuri (Meitei)" },
  ];
  const GOOGLE_INCLUDED_LANGUAGES = LANG_OPTIONS
    .filter((item) => item.value !== "en")
    .map((item) => item.value)
    .join(",");

  const UI_SUPPRESS_SELECTORS = [
    ".skiptranslate.goog-te-banner-frame",
    ".goog-te-banner-frame.skiptranslate",
    "iframe.goog-te-banner-frame",
    "iframe[id*='goog'][id*='frame']",
    "iframe[class*='goog-te']",
    "#goog-gt-tt",
    ".goog-te-balloon-frame",
    ".goog-tooltip",
    ".goog-tooltip:hover",
    ".goog-te-spinner-pos",
    ".goog-te-banner",
    ".VIpgJd-ZVi9od-ORHb",
    ".VIpgJd-ZVi9od-ORHb-OEVmcd",
    ".VIpgJd-ZVi9od-aZ2wEe",
    ".VIpgJd-ZVi9od-aZ2wEe-wOHMyf",
    ".VIpgJd-yAWNEb-L7lbkb",
    ".VIpgJd-yAWNEb-VIpgJd-fmcmS-sn54Q",
    ".VIpgJd-yAWNEb-VIpgJd-fmcmS-sn54Q-ehLNNb",
  ];

  let googleReadyPromise = null;
  let observer = null;
  let lastToastAt = 0;
  let pendingLanguageCode = "";
  const SCRIPT_FONT_LINK_ID = "naamin-script-fonts";

  if (!document || !document.body) {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  function ensureScriptFonts() {
    const head = document.head || document.getElementsByTagName("head")[0];
    if (!head) return;
    if (document.getElementById(SCRIPT_FONT_LINK_ID)) return;

    const link = document.createElement("link");
    link.id = SCRIPT_FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2" +
      "?family=Noto+Sans+Devanagari:wght@400;500;600;700" +
      "&family=Noto+Sans+Bengali:wght@400;500;600;700" +
      "&family=Noto+Sans+Gujarati:wght@400;500;600;700" +
      "&family=Noto+Sans+Tamil:wght@400;500;600;700" +
      "&family=Noto+Sans+Telugu:wght@400;500;600;700" +
      "&family=Noto+Sans+Kannada:wght@400;500;600;700" +
      "&family=Noto+Sans+Malayalam:wght@400;500;600;700" +
      "&family=Noto+Sans+Gurmukhi:wght@400;500;600;700" +
      "&family=Noto+Sans+Oriya:wght@400;500;600;700" +
      "&family=Noto+Sans+Meetei+Mayek:wght@400;500;600;700" +
      "&family=Noto+Naskh+Arabic:wght@400;500;600;700" +
      "&display=swap";
    head.appendChild(link);
  }

  function suppressLegacyLanguageToggles() {
    ["language-toggle", "language-toggle-mobile"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.dataset.naaminLangSuppressed = "true";
      el.setAttribute("aria-hidden", "true");
      el.tabIndex = -1;
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("visibility", "hidden", "important");
      el.style.setProperty("pointer-events", "none", "important");
    });
  }

  function getAllowedValues() {
    return new Set(LANG_OPTIONS.map((item) => item.value));
  }

  function normalizeCode(code) {
    const raw = String(code || "").trim();
    return getAllowedValues().has(raw) ? raw : "en";
  }

  function getStoredCode() {
    try {
      return normalizeCode(localStorage.getItem(STORAGE_KEY) || "");
    } catch (_e) {
      return "en";
    }
  }

  function setStoredCode(code) {
    const normalized = normalizeCode(code);
    try {
      localStorage.setItem(STORAGE_KEY, normalized);
    } catch (_e) {
      // ignore storage issues
    }
  }

  function getInternalLang() {
    try {
      return localStorage.getItem("language") === "hi" ? "hi" : "en";
    } catch (_e) {
      return "en";
    }
  }

  function setInternalLang(lang) {
    const next = lang === "hi" ? "hi" : "en";
    try {
      localStorage.setItem("language", next);
    } catch (_e) {
      // ignore storage issues
    }
    document.documentElement.lang = next;
  }

  function dispatchInternalLanguage(lang, options = {}) {
    const next = lang === "hi" ? "hi" : "en";
    setInternalLang(next);
    if (options.applyCopy === true) {
      applyInternalCopy(next, { force: options.forceCopy === true });
    }
    if (options.notify === true) {
      document.dispatchEvent(new CustomEvent("naamin:set-language", { detail: { lang: next, source: "global-language-fab" } }));
      document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang: next, source: "global-language-fab" } }));
    }
  }

  const WIN1252_REVERSE_MAP = Object.freeze({
    8364: 128, 8218: 130, 402: 131, 8222: 132, 8230: 133, 8224: 134, 8225: 135,
    710: 136, 8240: 137, 352: 138, 8249: 139, 338: 140, 381: 142,
    8216: 145, 8217: 146, 8220: 147, 8221: 148, 8226: 149, 8211: 150, 8212: 151,
    732: 152, 8482: 153, 353: 154, 8250: 155, 339: 156, 382: 158, 376: 159,
  });

  function decodeHindiMojibake(text) {
    if (!text) return text;
    const raw = String(text);
    if (!/(?:\u00C3|\u00C2|\u00E2|\u00F0|\u00E0\u00A4|\u00E0\u00A5|\u00EF\u00BF\u00BD)/.test(raw)) return raw;

    try {
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i += 1) {
        const code = raw.charCodeAt(i);
        if (code <= 255) {
          bytes[i] = code;
          continue;
        }
        const mapped = WIN1252_REVERSE_MAP[code];
        if (mapped === undefined) return raw;
        bytes[i] = mapped;
      }

      const decoded = new TextDecoder("utf-8").decode(bytes);
      if (!decoded || decoded.includes("ï¿½")) return raw;
      return decoded;
    } catch (_e) {
      return raw;
    }
  }

  function setTextPreserveChildren(el, translated) {
    if (!el) return;
    const hasElementChildren = Array.from(el.childNodes || []).some((n) => n && n.nodeType === 1);
    let cleanText = decodeHindiMojibake(String(translated || "")).trim();

    if (!hasElementChildren) {
      el.textContent = cleanText;
      return;
    }

    el.querySelectorAll("font, .goog-text-highlight").forEach((node) => node.remove());
    Array.from(el.childNodes || []).forEach((node) => {
      if (node && node.nodeType === 3) node.remove();
    });

    if (!cleanText) return;

    const brandLock = el.querySelector(":scope > .naamin-brand-lock");
    if (brandLock && /^\s*Naamin\b/i.test(cleanText)) {
      cleanText = cleanText.replace(/^\s*Naamin\b\s*/i, "").trim();
      if (!cleanText) return;
    }

    const arrowNode = Array.from(el.children || []).find((child) => child.classList && child.classList.contains("arrow"));
    if (arrowNode) {
      el.insertBefore(document.createTextNode(cleanText), arrowNode);
      return;
    }

    const needsSpace = Array.from(el.children || []).length > 0;
    el.appendChild(document.createTextNode(needsSpace ? ` ${cleanText}` : cleanText));
  }

  function applyInternalCopy(lang, options = {}) {
    const next = lang === "hi" ? "hi" : "en";
    if (!document || !document.body) return;

    // If a Google translation is active, do not fight it with internal copy swaps.
    let externalGoogleLang = "en";
    try {
      externalGoogleLang = String(localStorage.getItem(STORAGE_KEY) || "en").toLowerCase();
    } catch (_e) {
      externalGoogleLang = "en";
    }
    const externalActive = externalGoogleLang !== "en";
    if (externalActive && options.force !== true) return;

    document.querySelectorAll("[data-en]").forEach((el) => {
      const preferred = el.getAttribute(next === "hi" ? "data-hi" : "data-en");
      const fallback = el.getAttribute("data-en");
      const text = preferred && preferred.trim() ? preferred : fallback;
      if (text && text.trim()) setTextPreserveChildren(el, text);
    });
  }

  function exitTranslateProxyIfNeeded() {
    const host = String(window.location.hostname || "").toLowerCase();
    const isTranslateProxy =
      host.endsWith(".translate.goog") ||
      host.includes("translate.googleusercontent.com") ||
      host === "translate.google.com";
    if (!isTranslateProxy) return false;

    const params = new URLSearchParams(window.location.search || "");
    const targetFromQuery = params.get("u") || params.get("url");
    if (targetFromQuery && /^https?:\/\//i.test(targetFromQuery) && targetFromQuery !== window.location.href) {
      window.location.replace(targetFromQuery);
      return true;
    }

    if (host.endsWith(".translate.goog")) {
      try {
        const rebuilt = new URL(window.location.href);
        rebuilt.host = host.replace(/\.translate\.goog$/i, "").replace(/-/g, ".");
        rebuilt.searchParams.forEach((_value, key) => {
          if (String(key).startsWith("_x_tr_")) rebuilt.searchParams.delete(key);
        });
        const target = rebuilt.toString();
        if (target !== window.location.href) {
          window.location.replace(target);
          return true;
        }
      } catch (_e) {
        return false;
      }
    }
    return false;
  }

  function ensureSuppressStyles() {
    const styleId = "naamin-google-ui-suppress-style";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .skiptranslate,
      .skiptranslate.goog-te-banner-frame,
      .goog-te-banner-frame.skiptranslate,
      iframe.goog-te-banner-frame,
      iframe[id*="goog"][id*="frame"],
      iframe[class*="goog-te"],
      #goog-gt-tt,
      .goog-te-balloon-frame,
      .goog-tooltip,
      .goog-tooltip:hover,
      .goog-te-spinner-pos,
      .goog-te-banner,
      .VIpgJd-ZVi9od-ORHb,
      .VIpgJd-ZVi9od-ORHb-OEVmcd,
      .VIpgJd-ZVi9od-aZ2wEe,
      .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
      .VIpgJd-yAWNEb-L7lbkb,
      .VIpgJd-yAWNEb-VIpgJd-fmcmS-sn54Q,
      .VIpgJd-yAWNEb-VIpgJd-fmcmS-sn54Q-ehLNNb {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      .goog-text-highlight {
        background: transparent !important;
        box-shadow: none !important;
      }
      html, body {
        top: 0 !important;
        margin-top: 0 !important;
      }
    `;
    document.head.appendChild(style);
  }

  function hideGoogleArtifacts(scopeRoot) {
    const scope = scopeRoot && scopeRoot.querySelectorAll ? scopeRoot : document;
    UI_SUPPRESS_SELECTORS.forEach((selector) => {
      let nodes = [];
      try {
        nodes = scope.querySelectorAll(selector);
      } catch (_e) {
        nodes = [];
      }
      nodes.forEach((node) => {
        if (!node || !node.style) return;
        node.style.setProperty("display", "none", "important");
        node.style.setProperty("visibility", "hidden", "important");
        node.style.setProperty("opacity", "0", "important");
        node.style.setProperty("pointer-events", "none", "important");
      });
    });
  }

  function lockNoTranslateTargets(scopeRoot) {
    const scope = scopeRoot && scopeRoot.querySelectorAll ? scopeRoot : document;
    const nodes = scope.querySelectorAll("input, textarea, [contenteditable='true'], .name-item-label, .name-display, .card-name, .modal-result-name, .brandgen-name, .brandgen-pill-name, #poster-name, #poster-name-hi");
    nodes.forEach((node) => {
      if (!node || !node.setAttribute) return;
      if (!node.classList.contains("notranslate")) node.classList.add("notranslate");
      node.setAttribute("translate", "no");
      node.setAttribute("lang", "en");
    });
  }

  function protectBrandText(scopeRoot) {
    const scope = scopeRoot && scopeRoot.querySelectorAll ? scopeRoot : document;
    const nodes = scope.querySelectorAll("h1, h2, h3, h4, p, a, span, button, li, label");
    nodes.forEach((el) => {
      if (!el || !el.childNodes || !el.textContent) return;
      if (el.closest("#global-google-translate-select, .goog-te-gadget, .notranslate, [translate='no']")) return;
      if (el.querySelector(".naamin-brand-lock, font, .goog-text-highlight")) return;
      if (!/\bNaamin\b/.test(el.textContent)) return;
      const hasElementChildren = Array.from(el.childNodes).some((node) => node.nodeType === 1);
      if (hasElementChildren) return;

      const parts = String(el.textContent).split(/(Naamin)/g);
      if (parts.length < 2) return;
      el.textContent = "";
      parts.forEach((part) => {
        if (!part) return;
        if (part === "Naamin") {
          const span = document.createElement("span");
          span.className = "naamin-brand-lock notranslate";
          span.setAttribute("translate", "no");
          span.setAttribute("lang", "en");
          span.textContent = "Naamin";
          el.appendChild(span);
        } else {
          el.appendChild(document.createTextNode(part));
        }
      });
    });
  }

  function repairBrandDuplicates(scopeRoot) {
    const scope = scopeRoot && scopeRoot.querySelectorAll ? scopeRoot : document;
    const nodes = scope.querySelectorAll("h1, h2, h3, h4, p, a, span, button, li, label");
    nodes.forEach((el) => {
      if (!el || !el.textContent || !/\bNaamin\b/i.test(el.textContent)) return;
      if (el.closest("#global-google-translate-select, .goog-te-gadget")) return;

      const directBrandLock = el.querySelector(":scope > .naamin-brand-lock");
      if (directBrandLock) {
        let seenLock = false;
        Array.from(el.childNodes || []).forEach((node) => {
          if (node === directBrandLock) {
            seenLock = true;
            return;
          }
          if (!seenLock) return;

          if (node.nodeType === 3) {
            node.nodeValue = String(node.nodeValue || "").replace(/^\s*Naamin\b\s*/i, "");
            return;
          }

          if (node.nodeType === 1 && /^\s*Naamin\b/i.test(node.textContent || "")) {
            if (node.childNodes && node.childNodes.length === 1 && node.firstChild.nodeType === 3) {
              node.firstChild.nodeValue = String(node.firstChild.nodeValue || "").replace(/^\s*Naamin\b\s*/i, "");
            } else if (node.tagName === "FONT" || node.classList.contains("goog-text-highlight")) {
              node.textContent = String(node.textContent || "").replace(/^\s*Naamin\b\s*/i, "");
            }
          }
        });
      }

      if (Array.from(el.childNodes || []).every((node) => node.nodeType === 3)) {
        const fixed = String(el.textContent || "").replace(/\bNaamin(?:\s+Naamin\b)+/gi, "Naamin");
        if (fixed !== el.textContent) el.textContent = fixed;
      }
    });
  }

  function repairAuthNavLabels() {
    const authLinks = [
      { selector: 'a[href*="login.html"]', en: "Log in", hi: "लॉग इन" },
      { selector: 'a[href*="signup.html"]', en: "Sign up", hi: "साइन अप" },
    ];

    authLinks.forEach((item) => {
      document.querySelectorAll(item.selector).forEach((link) => {
        if (!link || !link.setAttribute) return;
        const href = String(link.getAttribute("href") || "");
        if (!/\/?(login|signup)\.html/i.test(href)) return;
        link.setAttribute("data-en", item.en);
        link.setAttribute("data-hi", item.hi);
        link.classList.add("notranslate");
        link.setAttribute("translate", "no");
        link.setAttribute("lang", "en");
        link.textContent = item.en;
      });
    });
  }

  function repairBrandNavLabels() {
    document.querySelectorAll('a[href*="ai-names.html"]').forEach((link) => {
      if (!link || !link.setAttribute) return;
      link.setAttribute("data-en", "Naamin AI");
      link.setAttribute("data-hi", "Naamin AI");
      link.classList.add("notranslate");
      link.setAttribute("translate", "no");
      link.setAttribute("lang", "en");
      link.textContent = "Naamin AI";
    });
  }

  function runStableRepairs() {
    protectBrandText(document);
    repairBrandDuplicates(document);
    repairAuthNavLabels();
    repairBrandNavLabels();
    fitNavbarText();
  }

  function fitNavbarText() {
    const nav = document.querySelector(".navbar");
    if (!nav || !document.documentElement) return;

    const desktopVisible = Array.from(nav.querySelectorAll(".desktop-only")).some((el) => {
      try {
        return window.getComputedStyle(el).display !== "none";
      } catch (_e) {
        return false;
      }
    });
    if (!desktopVisible) {
      document.documentElement.style.setProperty("--naamin-nav-font-scale", "1");
      return;
    }

    const fits = () => nav.scrollWidth <= nav.clientWidth + 2;
    let scale = 1;
    document.documentElement.style.setProperty("--naamin-nav-font-scale", String(scale));

    window.requestAnimationFrame(() => {
      while (!fits() && scale > 0.64) {
        scale = Math.max(0.64, scale - 0.04);
        document.documentElement.style.setProperty("--naamin-nav-font-scale", scale.toFixed(2));
      }
    });
  }

  function startObserver() {
    if (observer || typeof MutationObserver === "undefined" || !document.body) return;
    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!node || node.nodeType !== 1) return;
          hideGoogleArtifacts(node);
          lockNoTranslateTargets(node);
          protectBrandText(node);
          repairAuthNavLabels();
          repairBrandNavLabels();
          fitNavbarText();
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function ensureHiddenFabSentinel() {
    let btn = document.getElementById(HIDDEN_FAB_ID);
    if (!btn) {
      btn = document.createElement("button");
      btn.id = HIDDEN_FAB_ID;
      btn.type = "button";
      document.body.appendChild(btn);
    }
    btn.dataset.googleTranslateMenu = "enabled";
    btn.setAttribute("aria-hidden", "true");
    btn.tabIndex = -1;
    btn.style.setProperty("display", "none", "important");
    btn.style.setProperty("pointer-events", "none", "important");
  }

  function ensureTranslateHost() {
    let host = document.getElementById(HOST_ID);
    if (!host) {
      host = document.createElement("div");
      host.id = HOST_ID;
      host.style.display = "none";
      document.body.appendChild(host);
    }
    return host;
  }

  function ensureSelect() {
    let select = document.getElementById(SELECT_ID);
    if (!select) {
      select = document.createElement("select");
      select.id = SELECT_ID;
      select.setAttribute("aria-label", "Translate page");
      document.body.appendChild(select);
    }

    if (!select.classList.contains("notranslate")) select.classList.add("notranslate");
    select.setAttribute("translate", "no");
    select.setAttribute("lang", "en");

    const allowed = getAllowedValues();
    for (let i = select.options.length - 1; i >= 0; i -= 1) {
      const opt = select.options[i];
      if (!opt || !allowed.has(String(opt.value || ""))) {
        select.remove(i);
      }
    }

    LANG_OPTIONS.forEach((entry) => {
      let optionEl = null;
      for (let i = 0; i < select.options.length; i += 1) {
        const candidate = select.options[i];
        if (candidate && String(candidate.value) === entry.value) {
          optionEl = candidate;
          break;
        }
      }
      if (!optionEl) {
        optionEl = document.createElement("option");
        optionEl.value = entry.value;
        select.appendChild(optionEl);
      }
      optionEl.textContent = entry.label;
      optionEl.setAttribute("translate", "no");
      optionEl.setAttribute("lang", "en");
      if (!optionEl.classList.contains("notranslate")) optionEl.classList.add("notranslate");
    });

    return select;
  }

  function ensureAnchorSlot() {
    const navbar = document.querySelector(".navbar");
    const authToggle = document.getElementById("language-toggle-auth");
    const isMobile = typeof window.matchMedia === "function" ? window.matchMedia("(max-width: 768px)").matches : false;
    let slot = document.getElementById(isMobile ? MOBILE_SLOT_ID : SLOT_ID) || document.getElementById(SLOT_ID);
    const explicitDesktopSlot = document.getElementById(SLOT_ID);
    const explicitMobileSlot = document.getElementById(MOBILE_SLOT_ID);

    if (isMobile && explicitMobileSlot) return explicitMobileSlot;
    if (!isMobile && explicitDesktopSlot) return explicitDesktopSlot;

    if (!navbar && authToggle && authToggle.parentNode) {
      if (!slot) {
        slot = document.createElement("div");
        slot.id = SLOT_ID;
        slot.setAttribute("aria-label", "Language");
      }
      if (slot.parentNode !== authToggle.parentNode) {
        authToggle.parentNode.insertBefore(slot, authToggle.nextSibling);
      }
      return slot;
    }

    if (!navbar) return null;

    const hamburger = document.getElementById("hamburger-menu");
    const desktopToggle = document.getElementById("language-toggle");
    const navActions = navbar.querySelector(".nav-actions");

    if (!slot) {
      slot = document.createElement("div");
      slot.id = SLOT_ID;
      slot.setAttribute("aria-label", "Language");
    }

    // On mobile we want the language control visible in the header (next to the hamburger),
    // not hidden inside the off-canvas menu.
    if (hamburger && hamburger.parentNode === navbar) {
      if (slot.parentNode !== navbar || slot.nextSibling !== hamburger) {
        navbar.insertBefore(slot, hamburger);
      }
      return slot;
    }

    const mobileActions = navbar.querySelector("#mobile-menu .mobile-actions");
    if (isMobile && mobileActions) {
      if (slot.parentNode !== mobileActions) {
        mobileActions.insertBefore(slot, mobileActions.firstChild || null);
      }
      return slot;
    }

    if (desktopToggle && desktopToggle.parentNode) {
      const parent = desktopToggle.parentNode;
      if (slot.parentNode !== parent || slot.nextSibling !== desktopToggle) {
        parent.insertBefore(slot, desktopToggle);
      }
      return slot;
    }

    if (navActions) {
      if (slot.parentNode !== navActions) {
        navActions.insertBefore(slot, navActions.firstChild || null);
      }
      return slot;
    }

    if (slot.parentNode !== navbar) navbar.appendChild(slot);
    return slot;
  }

  function applyPlacement(select) {
    const slot = ensureAnchorSlot();
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (slot) {
      if (select.parentElement !== slot) slot.appendChild(select);
      slot.style.setProperty("display", "inline-flex", "important");
      slot.style.setProperty("align-items", "center", "important");
      slot.style.setProperty("justify-content", "center", "important");
      slot.style.setProperty("flex", "0 0 auto", "important");
      slot.style.setProperty("margin-left", isMobile ? "6px" : "10px", "important");
      slot.style.setProperty("margin-right", isMobile ? "4px" : "8px", "important");
      slot.style.setProperty("z-index", "1302", "important");
      select.style.setProperty("position", "static", "important");
      select.style.setProperty("top", "auto", "important");
      select.style.setProperty("left", "auto", "important");
      select.style.setProperty("right", "auto", "important");
      select.style.setProperty("bottom", "auto", "important");
    } else {
      if (select.parentElement !== document.body) document.body.appendChild(select);
      select.style.setProperty("position", "fixed", "important");
      select.style.setProperty("top", "12px", "important");
      select.style.setProperty("right", "12px", "important");
      select.style.setProperty("left", "auto", "important");
      select.style.setProperty("bottom", "auto", "important");
    }

    // Keep native select UI (no inline SVG icons) for the original look.

    select.style.setProperty("z-index", "2147483647", "important");
    select.style.setProperty("border-radius", "10px", "important");
    select.style.setProperty("border", "1px solid rgba(17,24,39,0.35)", "important");
    select.style.setProperty("background", "#ffffff", "important");
    select.style.setProperty("color", "#111827", "important");
    select.style.setProperty("font-family", "Poppins, Arial, sans-serif", "important");
    select.style.setProperty("font-weight", "600", "important");
    select.style.setProperty("opacity", "0.98", "important");
    select.style.setProperty("line-height", "1.2", "important");
    select.style.setProperty("appearance", "auto", "important");
    select.style.setProperty("-webkit-appearance", "menulist", "important");
    select.style.setProperty("background-image", "none", "important");
    select.style.setProperty("background-repeat", "initial", "important");
    select.style.setProperty("background-position", "initial", "important");
    select.style.setProperty("background-size", "initial", "important");
    select.style.setProperty("padding", "8px 10px", "important");
    select.style.setProperty("font-size", isMobile ? "10px" : "11px", "important");
    select.style.setProperty("width", isMobile ? "92px" : "130px", "important");
    select.style.setProperty("max-width", isMobile ? "92px" : "130px", "important");
    select.style.setProperty("box-shadow", isMobile ? "0 6px 14px rgba(0,0,0,0.14)" : "0 8px 16px rgba(0,0,0,0.14)", "important");

    // If the navbar height changes (e.g. language control injected), refresh the global top offset
    // so content doesn't slide under the fixed header (blog/more pages).
    try {
      const nav = document.querySelector("nav.navbar");
      if (nav) {
        const pos = window.getComputedStyle(nav).position;
        if (pos === "fixed" || pos === "sticky") {
          window.requestAnimationFrame(() => {
            const height = Math.max(0, nav.offsetHeight || 0);
            document.documentElement.style.setProperty("--naamin-top-offset", `${height}px`);
            if (document.body) document.body.style.paddingTop = `${height}px`;
          });
        }
      }
    } catch (_e) {
      // ignore
    }
  }

  function loadGoogleScript() {
    return new Promise((resolve, reject) => {
      const callbackName = "naaminGoogleTranslateInit";
      let settled = false;
      let attempt = 0;

      const cleanupCallback = () => {
        try {
          delete window[callbackName];
        } catch (_e) {
          window[callbackName] = undefined;
        }
      };

      const finishResolve = () => {
        if (settled) return;
        settled = true;
        cleanupCallback();
        resolve();
      };

      const finishReject = (error) => {
        if (settled) return;
        settled = true;
        cleanupCallback();
        reject(error);
      };

      const bootWidget = () => {
        try {
          ensureTranslateHost();
          // eslint-disable-next-line no-new
          new window.google.translate.TranslateElement(
            { pageLanguage: "en", includedLanguages: GOOGLE_INCLUDED_LANGUAGES, autoDisplay: false },
            HOST_ID
          );
          finishResolve();
        } catch (error) {
          tryNext(error);
        }
      };

      const tryNext = (lastError) => {
        const existing = document.getElementById(SCRIPT_ID);
        if (existing) existing.remove();

        if (attempt >= SCRIPT_URLS.length) {
          finishReject(lastError || new Error("Google translate script failed"));
          return;
        }

        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.async = true;
        script.src = `${SCRIPT_URLS[attempt]}?cb=${callbackName}`;
        attempt += 1;
        script.onerror = () => tryNext(new Error("Translate script network error"));
        document.head.appendChild(script);
      };

      window[callbackName] = () => {
        if (window.google && window.google.translate && window.google.translate.TranslateElement) {
          bootWidget();
          return;
        }
        tryNext(new Error("Translate callback returned without api"));
      };

      if (window.google && window.google.translate && window.google.translate.TranslateElement) {
        bootWidget();
        return;
      }

      tryNext();
    });
  }

  function ensureGoogleReady() {
    if (window.google && window.google.translate && window.google.translate.TranslateElement) {
      return Promise.resolve();
    }
    if (googleReadyPromise) return googleReadyPromise;
    googleReadyPromise = loadGoogleScript().catch((error) => {
      googleReadyPromise = null;
      throw error;
    });
    return googleReadyPromise;
  }

  function waitForCombo(timeoutMs) {
    const timeout = Number(timeoutMs) > 0 ? Number(timeoutMs) : 8000;
    return new Promise((resolve, reject) => {
      const started = Date.now();
      const tick = () => {
        const combo = document.querySelector("select.goog-te-combo");
        if (combo) {
          resolve(combo);
          return;
        }
        if (Date.now() - started > timeout) {
          reject(new Error("Google combo not ready"));
          return;
        }
        window.setTimeout(tick, 120);
      };
      tick();
    });
  }

  function hasGoogleTranslatedDom() {
    return (
      document.documentElement.classList.contains("translated-ltr") ||
      document.body.classList.contains("translated-ltr") ||
      document.documentElement.classList.contains("translated-rtl") ||
      document.body.classList.contains("translated-rtl") ||
      Boolean(getGoogleCookieCode())
    );
  }

  function clearCookieEverywhere(name) {
    const host = String(window.location.hostname || "");
    const parts = host.split(".").filter(Boolean);
    const domains = new Set([""]);
    if (host && host !== "localhost") {
      domains.add(host);
      domains.add(`.${host}`);
      for (let i = 1; i < parts.length - 1; i += 1) {
        domains.add(parts.slice(i).join("."));
        domains.add(`.${parts.slice(i).join(".")}`);
      }
    }

    const paths = new Set(["/"]);
    const pathParts = String(window.location.pathname || "/").split("/").filter(Boolean);
    let path = "";
    pathParts.forEach((part) => {
      path += `/${part}`;
      paths.add(path);
    });

    domains.forEach((domain) => {
      paths.forEach((cookiePath) => {
        const domainPart = domain ? `; domain=${domain}` : "";
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${cookiePath}${domainPart}`;
        document.cookie = `${name}=; max-age=0; path=${cookiePath}${domainPart}`;
      });
    });
  }

  function clearGoogleTranslateState() {
    try {
      clearCookieEverywhere("googtrans");
    } catch (_e) {
      // ignore cookie issues
    }
    document.documentElement.classList.remove("translated-ltr", "translated-rtl");
    document.body.classList.remove("translated-ltr", "translated-rtl");
    document.documentElement.style.removeProperty("top");
    document.body.style.removeProperty("top");
  }

  function resetGoogleToEnglish() {
    clearGoogleTranslateState();
    const combo = document.querySelector("select.goog-te-combo");
    if (combo && String(combo.value || "").toLowerCase() !== "en") {
      setComboLanguage(combo, "en");
    }
    clearGoogleTranslateState();
  }

  function hardResetToEnglish(options = {}) {
    const wasTranslated = hasGoogleTranslatedDom();
    pendingLanguageCode = "";
    setStoredCode("en");
    resetGoogleToEnglish();
    dispatchInternalLanguage("en", { applyCopy: true, forceCopy: true, notify: true });
    document.documentElement.lang = "en";
    document.dispatchEvent(new CustomEvent("naamin:google-translate-changed", { detail: { code: "en" } }));
    runStableRepairs();
    [120, 420, 900].forEach((delay) => window.setTimeout(runStableRepairs, delay));

    try {
      const flag = "naamin-google-translate-english-reset-reload";
      if (!wasTranslated && window.sessionStorage) sessionStorage.removeItem(flag);
      if (options.reload === true && wasTranslated && window.sessionStorage) {
        if (sessionStorage.getItem(flag) !== "1") {
          sessionStorage.setItem(flag, "1");
          window.setTimeout(() => window.location.reload(), 80);
        } else {
          sessionStorage.removeItem(flag);
        }
      }
    } catch (_e) {
      // ignore reload guard issues
    }
  }

  function showToast(message) {
    const now = Date.now();
    if (now - lastToastAt < 2500) return;
    lastToastAt = now;

    let toast = document.getElementById("naamin-translate-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "naamin-translate-toast";
      document.body.appendChild(toast);
    }

    toast.textContent = String(message || "");
    toast.style.setProperty("position", "fixed", "important");
    toast.style.setProperty("top", "12px", "important");
    toast.style.setProperty("left", "50%", "important");
    toast.style.setProperty("transform", "translateX(-50%)", "important");
    toast.style.setProperty("z-index", "2147483647", "important");
    toast.style.setProperty("background", "rgba(17,24,39,0.92)", "important");
    toast.style.setProperty("color", "#fff", "important");
    toast.style.setProperty("padding", "10px 12px", "important");
    toast.style.setProperty("border-radius", "999px", "important");
    toast.style.setProperty("font", "600 12px/1.2 Poppins, Arial, sans-serif", "important");
    toast.style.setProperty("box-shadow", "0 10px 24px rgba(0,0,0,0.25)", "important");
    toast.style.setProperty("opacity", "1", "important");
    toast.style.setProperty("pointer-events", "none", "important");

    window.setTimeout(() => {
      const node = document.getElementById("naamin-translate-toast");
      if (!node) return;
      node.style.setProperty("opacity", "0", "important");
    }, 2400);
  }

  function dispatchComboChange(combo) {
    if (!combo) return;

    // Google’s widget sometimes misses synthetic events unless they bubble.
    try {
      combo.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
    } catch (_e) {
      // ignore
    }

    try {
      combo.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
      return;
    } catch (_e) {
      // ignore
    }

    try {
      const evt = document.createEvent("HTMLEvents");
      evt.initEvent("change", true, true);
      combo.dispatchEvent(evt);
    } catch (_e) {
      // ignore
    }
  }

  function setComboLanguage(combo, code) {
    if (!combo) return;
    const target = String(code || "").toLowerCase();
    const opts = Array.from(combo.options || []);
    const idx = opts.findIndex((opt) => String(opt.value || "").toLowerCase() === target);
    if (idx >= 0) {
      combo.selectedIndex = idx;
      combo.value = opts[idx].value;
    } else {
      combo.value = code;
    }
    dispatchComboChange(combo);
  }

  function sleep(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function comboHasLanguage(combo, code) {
    if (!combo) return false;
    const target = String(code || "").toLowerCase();
    return Array.from(combo.options || []).some((opt) => String(opt.value || "").toLowerCase() === target);
  }

  function getGoogleCookieCode() {
    try {
      const match = String(document.cookie || "").match(/(?:^|;\s*)googtrans=\/en\/([^;]+)/i);
      return match && match[1] ? decodeURIComponent(match[1]).toLowerCase() : "";
    } catch (_e) {
      return "";
    }
  }

  function isGoogleLanguageActive(code) {
    const target = String(code || "").toLowerCase();
    if (!target || target === "en") return true;
    const combo = document.querySelector("select.goog-te-combo");
    const comboValue = combo ? String(combo.value || "").toLowerCase() : "";
    const cookieValue = getGoogleCookieCode();
    const domTranslated =
      document.documentElement.classList.contains("translated-ltr") ||
      document.body.classList.contains("translated-ltr") ||
      document.documentElement.classList.contains("translated-rtl") ||
      document.body.classList.contains("translated-rtl");
    return comboValue === target || cookieValue === target || (domTranslated && document.documentElement.lang === target);
  }

  function applyGoogleLanguage(code) {
    const target = normalizeCode(code);
    if (target === "en") {
      resetGoogleToEnglish();
      return Promise.resolve();
    }

    return ensureGoogleReady()
      .then(() => waitForCombo(9000))
      .then(async (combo) => {
        for (let attempt = 0; attempt < 5; attempt += 1) {
          if (comboHasLanguage(combo, target)) {
            setComboLanguage(combo, target);
            await sleep(attempt === 0 ? 260 : 420);
            if (isGoogleLanguageActive(target) || attempt >= 1) return;
          } else if (isGoogleLanguageActive(target)) {
            return;
          }
          await sleep(280 + attempt * 160);
        }

        // Some Google widgets populate options late or hide experimental languages.
        // Try the value anyway before treating it as unavailable.
        setComboLanguage(combo, target);
        await sleep(700);
        if (!isGoogleLanguageActive(target)) throw new Error(`Google translate could not activate ${target}`);
      });
  }

  function getActiveCode() {
    const stored = getStoredCode();
    return stored || "en";
  }

  function syncSelect(select) {
    const active = getActiveCode();
    if (select.value !== active) select.value = active;
  }

  function activateLanguage(code, options = {}) {
    const target = normalizeCode(code);
    const persist = options.persist !== false;
    if (persist) setStoredCode(target);
    pendingLanguageCode = target;

    if (target === "en") {
      hardResetToEnglish({ reload: options.reload !== false });
      return Promise.resolve("en");
    }

    // Google reads the current DOM as English source. Restore English copy first,
    // even when the stored external language is already non-English.
    dispatchInternalLanguage("en", { applyCopy: true, forceCopy: true, notify: true });
    protectBrandText(document);
    return new Promise((resolve) => {
      window.setTimeout(() => {
        applyGoogleLanguage(target)
          .then(() => {
            // Let browsers pick correct shaping/fonts (Gujarati, Marathi, etc.).
            document.documentElement.lang = target;
            pendingLanguageCode = "";
            document.dispatchEvent(new CustomEvent("naamin:google-translate-changed", { detail: { code: target } }));
            window.setTimeout(runStableRepairs, 80);
            resolve(target);
          })
          .catch(() => {
            pendingLanguageCode = target;
            setStoredCode(target);
            document.documentElement.lang = target;
            [700, 1800, 3600].forEach((delay) => {
              window.setTimeout(() => {
                if ((pendingLanguageCode || getStoredCode()) !== target) return;
                applyGoogleLanguage(target)
                  .then(() => {
                    pendingLanguageCode = "";
                    document.documentElement.lang = target;
                    document.dispatchEvent(new CustomEvent("naamin:google-translate-changed", { detail: { code: target } }));
                  })
                  .catch(() => {
                    pendingLanguageCode = target;
                  })
                  .finally(() => {
                    hideGoogleArtifacts(document);
                    lockNoTranslateTargets(document);
                    runStableRepairs();
                  });
              }, delay);
            });
            resolve(target);
          })
          .finally(() => {
            hideGoogleArtifacts(document);
            lockNoTranslateTargets(document);
            runStableRepairs();
          });
      }, 90);
    });
  }

  function bindManualButtons(select) {
    ["language-toggle", "language-toggle-mobile", "language-toggle-auth"].forEach((id) => {
      const button = document.getElementById(id);
      if (!button || button.dataset.globalLanguageBound === "1") return;
      button.dataset.globalLanguageBound = "1";
      button.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          event.stopPropagation();
          const active = getActiveCode();
          const next = active === "en" ? "hi" : "en";
          select.value = next;
          select.dispatchEvent(new Event("change", { bubbles: true }));
        },
        true
      );
    });
  }

  function init() {
    if (!document.body) return;
    if (exitTranslateProxyIfNeeded()) return;

    ensureScriptFonts();
    ensureSuppressStyles();
    suppressLegacyLanguageToggles();
    hideGoogleArtifacts(document);
    lockNoTranslateTargets(document);
    runStableRepairs();
    startObserver();
    ensureHiddenFabSentinel();
    ensureTranslateHost();

    const select = ensureSelect();
    applyPlacement(select);
    bindManualButtons(select);
    syncSelect(select);

    select.addEventListener("change", () => {
      const target = normalizeCode(select.value);
      activateLanguage(target).then(() => {
        window.setTimeout(() => syncSelect(select), 60);
      });
    });

    document.addEventListener("languageChanged", () => {
      syncSelect(select);
      applyPlacement(select);
      suppressLegacyLanguageToggles();
      hideGoogleArtifacts(document);
      lockNoTranslateTargets(document);
      runStableRepairs();
    });

    document.addEventListener("naamin:layout-ready", () => {
      suppressLegacyLanguageToggles();
      applyPlacement(select);
      bindManualButtons(select);
      syncSelect(select);
      runStableRepairs();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible") return;
      const target = pendingLanguageCode || getStoredCode();
      window.setTimeout(() => {
        applyPlacement(select);
        runStableRepairs();
        if (target && target !== "en") {
          applyGoogleLanguage(target)
            .then(() => {
              document.documentElement.lang = target;
              pendingLanguageCode = "";
              document.dispatchEvent(new CustomEvent("naamin:google-translate-changed", { detail: { code: target } }));
            })
            .catch(() => {
              pendingLanguageCode = target;
            })
            .finally(() => {
              hideGoogleArtifacts(document);
              lockNoTranslateTargets(document);
              runStableRepairs();
              syncSelect(select);
            });
        } else if (target === "en") {
          hardResetToEnglish({ reload: false });
          syncSelect(select);
        }
      }, 120);
    });

    if (typeof window.matchMedia === "function") {
      const mq = window.matchMedia("(max-width: 768px)");
      const onChange = () => {
        applyPlacement(select);
        fitNavbarText();
      };
      if (typeof mq.addEventListener === "function") mq.addEventListener("change", onChange);
      else if (typeof mq.addListener === "function") mq.addListener(onChange);
    }

    window.addEventListener("resize", () => {
      window.clearTimeout(window.__naaminNavFitTimer);
      window.__naaminNavFitTimer = window.setTimeout(fitNavbarText, 80);
    }, { passive: true });

    [120, 500, 1100, 1900].forEach((delay) => {
      window.setTimeout(() => {
        applyPlacement(select);
        bindManualButtons(select);
        hideGoogleArtifacts(document);
        lockNoTranslateTargets(document);
        runStableRepairs();
        syncSelect(select);
      }, delay);
    });

    const initialCode = getActiveCode();
    activateLanguage(initialCode, { persist: false }).then(() => {
      syncSelect(select);
    });

    // Warm up Google to reduce first-change delay.
    ensureGoogleReady().catch(() => {
      // ignore startup failures; fallback still works
    });
  }
})();
