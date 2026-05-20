(function () {
  const WIN1252_REVERSE_MAP = Object.freeze({
    8364: 128, 8218: 130, 402: 131, 8222: 132, 8230: 133, 8224: 134, 8225: 135,
    710: 136, 8240: 137, 352: 138, 8249: 139, 338: 140, 381: 142,
    8216: 145, 8217: 146, 8220: 147, 8221: 148, 8226: 149, 8211: 150, 8212: 151,
    732: 152, 8482: 153, 353: 154, 8250: 155, 339: 156, 382: 158, 376: 159
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
      return decoded && !decoded.includes("ï¿½") ? decoded : raw;
    } catch (_e) {
      return raw;
    }
  }

  function decodeMap(rawMap) {
    const next = {};
    Object.keys(rawMap).forEach((key) => {
      next[key] = decodeHindiMojibake(rawMap[key]);
    });
    return Object.freeze(next);
  }

  const HI_MESSAGES_RAW = Object.freeze({
    "Email already exists. Please log in instead.": "यह ईमेल पहले से मौजूद है। कृपया लॉग इन करें।",
    "Invalid email format.": "ईमेल फ़ॉर्मेट सही नहीं है।",
    "Invalid credentials. Please try again.": "लॉगिन विवरण गलत है। कृपया फिर से प्रयास करें।",
    "Invalid email or password. Please try again.": "ईमेल या पासवर्ड गलत है। कृपया फिर से प्रयास करें।",
    "Please confirm your email first, then log in.": "कृपया पहले अपना ईमेल कन्फर्म करें, फिर लॉग इन करें।",
    "Password should be at least 8 characters.": "पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।",
    "Google sign-in is not enabled for this Supabase project.": "इस Supabase प्रोजेक्ट में Google साइन-इन सक्षम नहीं है।",
    "Google login redirect is not allowed. Add this page URL in Supabase Auth > URL Configuration.": "Google लॉगिन रीडायरेक्ट अनुमति नहीं है। इस पेज का URL Supabase Auth > URL Configuration में जोड़ें।",
    "Network error. Please check your connection and try again.": "नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें और फिर कोशिश करें।",
    "Something went wrong. Please try again.": "कुछ गलत हुआ। कृपया फिर से कोशिश करें।",
    "Supabase config is missing. Update supabase-config.js with your project keys.": "Supabase कॉन्फ़िगरेशन नहीं मिला। supabase-config.js में अपनी project keys अपडेट करें।",
    "Please set Supabase keys in supabase-config.js before continuing.": "आगे बढ़ने से पहले supabase-config.js में Supabase keys सेट करें।",
    "Auth client could not start. Reload once and try again.": "Auth client शुरू नहीं हो सका। एक बार रीलोड करके फिर कोशिश करें।",
    "Please fill in all fields.": "कृपया सभी फ़ील्ड भरें।",
    "Please enter a valid email address.": "कृपया सही ईमेल एड्रेस दर्ज करें।",
    "Password must be at least 8 characters.": "पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।",
    "Passwords do not match.": "पासवर्ड मेल नहीं खाते।",
    "Account created successfully. Redirecting...": "अकाउंट सफलतापूर्वक बन गया। रीडायरेक्ट किया जा रहा है...",
    "Account created. Please check your email to confirm your account.": "अकाउंट बन गया है। कृपया ईमेल चेक करके अकाउंट कन्फर्म करें।",
    "Please enter your email and password.": "कृपया अपना ईमेल और पासवर्ड दर्ज करें।",
    "Login successful. Redirecting...": "लॉगिन सफल रहा। रीडायरेक्ट किया जा रहा है...",
    "Google sign-in started. Continue in the opened tab.": "Google साइन-इन शुरू हो गया है। खुले टैब में आगे बढ़ें।"
  });

  const FALLBACK_HI_RAW = Object.freeze({
    "Log in to Naamin": "Naamin में लॉग इन करें",
    "Create your account": "अपना अकाउंट बनाएं",
    "Log In": "लॉग इन",
    "Sign Up": "साइन अप",
    "Continue with Google": "Google के साथ जारी रखें",
    "Don't have an account?": "क्या आपका अकाउंट नहीं है?",
    "Already have an account?": "क्या आपका अकाउंट पहले से है?",
    "Email address": "ईमेल एड्रेस",
    "Password": "पासवर्ड",
    "Password (min 8 characters)": "पासवर्ड (कम से कम 8 अक्षर)",
    "Confirm password": "पासवर्ड कन्फर्म करें",
    "Full name": "पूरा नाम",
    "Log in": "लॉग इन",
    "Sign up": "साइन अप"
  });

  const HI_MESSAGES = decodeMap(HI_MESSAGES_RAW);
  const FALLBACK_HI = decodeMap(FALLBACK_HI_RAW);

  function getLang() {
    try {
      return localStorage.getItem("language") === "en" ? "en" : "hi";
    } catch (_e) {
      return "hi";
    }
  }

  function setLang(lang) {
    try {
      localStorage.setItem("language", lang === "hi" ? "hi" : "en");
    } catch (_e) {
      // ignore
    }
  }

  function pickText(el, lang) {
    const preferred = el.getAttribute(lang === "hi" ? "data-hi" : "data-en");
    const fallback = el.getAttribute("data-en") || el.textContent || "";
    if (preferred && preferred.trim()) return decodeHindiMojibake(preferred);
    if (lang === "hi") return FALLBACK_HI[fallback] || decodeHindiMojibake(fallback);
    return decodeHindiMojibake(fallback);
  }

  function applyLanguage(lang) {
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-en]").forEach((el) => {
      el.textContent = pickText(el, lang);
    });

    document.querySelectorAll("[data-en-placeholder]").forEach((el) => {
      const value = lang === "hi"
        ? (el.getAttribute("data-hi-placeholder") || el.getAttribute("data-en-placeholder") || "")
        : (el.getAttribute("data-en-placeholder") || "");
      if (value) el.setAttribute("placeholder", decodeHindiMojibake(value));
    });

    const authMessage = document.getElementById("auth-message");
    if (authMessage && lang === "hi") {
      const current = (authMessage.textContent || "").trim();
      if (HI_MESSAGES[current]) authMessage.textContent = HI_MESSAGES[current];
    }
  }

  function bindMessageTranslator() {
    const authMessage = document.getElementById("auth-message");
    if (!authMessage) return;
    const observer = new MutationObserver(() => {
      const lang = getLang();
      if (lang !== "hi") return;
      const current = (authMessage.textContent || "").trim();
      if (HI_MESSAGES[current]) authMessage.textContent = HI_MESSAGES[current];
    });
    observer.observe(authMessage, { childList: true, characterData: true, subtree: true });
  }

  function initToggle() {
    const toggleBtn = document.getElementById("language-toggle-auth");
    if (!toggleBtn) return;
    toggleBtn.addEventListener("click", () => {
      const next = getLang() === "hi" ? "en" : "hi";
      setLang(next);
      applyLanguage(next);
      document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang: next } }));
    });
  }

  function bindExternalLanguageEvent() {
    document.addEventListener("naamin:set-language", (event) => {
      const requested = event && event.detail ? event.detail.lang : "";
      const next = requested === "en" ? "en" : "hi";
      setLang(next);
      applyLanguage(next);
      document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang: next } }));
    });
  }

  function setupGlobalLanguageFab() {
    if (!document.body) return;
    let btn = document.getElementById("global-language-fab");
    if (btn) return;

    btn = document.createElement("button");
    btn.id = "global-language-fab";
    btn.type = "button";
    btn.setAttribute("aria-label", "Switch language");
    btn.style.position = "fixed";
    btn.style.right = "16px";
    btn.style.bottom = "16px";
    btn.style.zIndex = "9999";
    btn.style.border = "1px solid rgba(255,255,255,0.55)";
    btn.style.background = "linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)";
    btn.style.color = "#ffffff";
    btn.style.borderRadius = "999px";
    btn.style.padding = "10px 14px";
    btn.style.fontSize = "12px";
    btn.style.fontWeight = "700";
    btn.style.letterSpacing = "0.3px";
    btn.style.cursor = "pointer";
    btn.style.boxShadow = "0 10px 24px rgba(29,78,216,0.34)";

    const syncLabel = () => {
      const current = getLang();
      btn.textContent = current === "hi" ? "Switch to EN" : "Switch to HI";
    };

    btn.addEventListener("click", () => {
      const next = getLang() === "hi" ? "en" : "hi";
      setLang(next);
      applyLanguage(next);
      syncLabel();
    });

    document.body.appendChild(btn);
    syncLabel();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      applyLanguage(getLang());
      bindMessageTranslator();
      initToggle();
      bindExternalLanguageEvent();
      setupGlobalLanguageFab();
    }, { once: true });
  } else {
    applyLanguage(getLang());
    bindMessageTranslator();
    initToggle();
    bindExternalLanguageEvent();
    setupGlobalLanguageFab();
  }
})();
