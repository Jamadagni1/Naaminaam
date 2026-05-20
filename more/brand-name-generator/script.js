(function () {
    const FAV_KEY = "naamin_brand_name_favs_v1";

    const byId = (id) => document.getElementById(id);

    function getLang() {
        const raw = String(document.documentElement.lang || "").toLowerCase();
        let stored = "";
        try {
            stored = String(localStorage.getItem("language") || "").toLowerCase();
        } catch (_e) {
            stored = "";
        }
        const lang = raw || stored || "en";
        return lang === "hi" ? "hi" : "en";
    }

    const t = (en, hi) => (getLang() === "hi" ? (hi || en) : en);

    const sanitizeTokens = (raw) =>
        String(raw || "")
            .split(/[,\n]/)
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 6);

    const cap = (s) => String(s || "").replace(/\s+/g, " ").trim();

    function makeRng(seed) {
        // Mulberry32
        let t = (Number(seed) || Date.now()) >>> 0;
        return function () {
            t += 0x6d2b79f5;
            let x = t;
            x = Math.imul(x ^ (x >>> 15), x | 1);
            x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
            return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
        };
    }

    function pick(rng, arr) {
        if (!arr || !arr.length) return "";
        return arr[Math.floor(rng() * arr.length)];
    }

    function normalizeNameToken(raw) {
        return cap(raw)
            .replace(/[^A-Za-z0-9\s-]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function keywordFragments(keywords) {
        return sanitizeTokens(keywords)
            .map((k) => normalizeNameToken(k))
            .filter(Boolean)
            .map((k) => {
                const noSpace = k.replace(/\s+/g, "");
                return noSpace.length <= 4 ? noSpace : noSpace.slice(0, 4);
            });
    }

    function buildBanks(style) {
        const commonPrefix = ["Neo", "Nova", "Astra", "Vita", "Bright", "True", "Swift", "Cloud", "Pulse", "Bloom", "Craft", "Prime"];
        const commonStem = ["Lyra", "Vero", "Lumo", "Kora", "Mira", "Nexa", "Zeno", "Sora", "Rivo", "Coda", "Fable", "Verve", "Aura"];
        const commonSuffix = ["ly", "io", "ify", "ora", "en", "ify", "mate", "base", "stack", "lane", "labs", "works", "hub"];

        const classicStem = ["Ever", "Crown", "Anchor", "Harbor", "Cedar", "Velvet", "Regal", "Atlas", "Summit", "Hearth", "Bridge"];
        const classicSuffix = ["& Co", "House", "Works", "Studio", "Supply", "Collective", "Guild"];

        const indianPrefix = ["Aar", "Ved", "Nava", "Aadi", "Sutra", "Anan", "Rasa", "Tej", "Nir", "Div", "Asha", "Samp"];
        const indianStem = ["Dhara", "Nila", "Prana", "Shakti", "Sparsh", "Soma", "Vanya", "Ritva", "Aarav", "Anaya", "Ishva"];
        const indianSuffix = ["ya", "va", "ika", "am", "an", "ini", "ara", "sh", "tek", "kart"];

        const globalStem = ["Orbit", "Vertex", "Signal", "Kinetic", "Nimbus", "Ion", "Pixel", "Quanta", "Terra", "Lattice", "Civic"];
        const globalSuffix = ["One", "Flow", "Core", "Edge", "Now", "Wave", "Loop", "Mint", "Nest", "Spark"];

        const s = String(style || "modern").toLowerCase();
        if (s === "classic") return { prefix: ["The", "Grand", "Blue", "Golden", "Ever"], stem: classicStem, suffix: classicSuffix };
        if (s === "indian") return { prefix: indianPrefix, stem: indianStem, suffix: indianSuffix };
        if (s === "global") return { prefix: ["Global", "Meta", "Open", "Next", "Urban"], stem: globalStem, suffix: globalSuffix };
        return { prefix: commonPrefix, stem: commonStem, suffix: commonSuffix };
    }

    function buildName(rng, opts) {
        const keywords = opts.keywords || [];
        const industry = normalizeNameToken(opts.industry || "");
        const style = String(opts.style || "modern").toLowerCase();
        const length = String(opts.length || "medium").toLowerCase();
        const mode = String(opts.mode || "blend").toLowerCase();

        const banks = buildBanks(style);
        const k1 = keywords.length ? pick(rng, keywords) : "";
        const k2 = keywords.length > 1 ? pick(rng, keywords) : "";

        const shortish = length === "short";
        const longish = length === "long";

        const join2 = (a, b) => {
            const left = cap(a).replace(/\s+/g, "");
            const right = cap(b).replace(/\s+/g, "");
            if (!left) return right;
            if (!right) return left;
            return left + right;
        };

        if (mode === "keyword" && keywords.length) {
            const base = join2(k1, longish ? (k2 || pick(rng, banks.stem)) : "");
            const suf = shortish ? "" : pick(rng, banks.suffix);
            return cap(base + (suf ? (suf.startsWith("&") || suf.startsWith(" ") ? ` ${suf}` : suf) : ""));
        }

        if (mode === "syllable" || !keywords.length) {
            const base = join2(pick(rng, banks.prefix), pick(rng, banks.stem));
            const suf = shortish ? "" : pick(rng, banks.suffix);
            return cap(base + (suf ? (suf.startsWith("&") || suf.startsWith(" ") ? ` ${suf}` : suf) : ""));
        }

        // blend
        const baseA = join2(pick(rng, banks.prefix), keywords.length ? k1 : pick(rng, banks.stem));
        const baseB = longish ? join2(keywords.length > 1 ? k2 : pick(rng, banks.stem), pick(rng, banks.suffix)) : (shortish ? "" : pick(rng, banks.suffix));
        const combined = cap(`${baseA}${baseB ? (baseB.startsWith("&") || baseB.startsWith(" ") ? ` ${baseB}` : baseB) : ""}`);

        if (industry && rng() < 0.18 && industry.length < 14) {
            return cap(`${combined} ${industry}`);
        }
        return combined;
    }

    function readFavs() {
        try {
            const raw = localStorage.getItem(FAV_KEY) || "[]";
            const arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
        } catch (_e) {
            return [];
        }
    }

    function writeFavs(list) {
        try {
            localStorage.setItem(FAV_KEY, JSON.stringify(list || []));
        } catch (_e) {
            // ignore
        }
    }

    async function copyText(value) {
        const text = String(value || "");
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (_e) {
            try {
                const ta = document.createElement("textarea");
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                ta.remove();
                return true;
            } catch (_e2) {
                return false;
            }
        }
    }

    function init() {
        const formEl = byId("brandgen-form");
        const industryEl = byId("brandgen-industry");
        const keywordsEl = byId("brandgen-keywords");
        const styleEl = byId("brandgen-style");
        const lengthEl = byId("brandgen-length");
        const countEl = byId("brandgen-count");
        const modeEl = byId("brandgen-mode");
        const genBtn = byId("brandgen-generate");
        const shuffleBtn = byId("brandgen-shuffle");
        const clearSavedBtn = byId("brandgen-clear-saved");
        const listEl = byId("brandgen-list");
        const countLabel = byId("brandgen-count-label");
        const statusEl = byId("brandgen-status");
        const savedListEl = byId("brandgen-saved-list");
        const savedCountEl = byId("brandgen-saved-count");

        if (!industryEl || !keywordsEl || !styleEl || !lengthEl || !countEl || !modeEl || !genBtn || !shuffleBtn || !listEl) return;

        let seed = Date.now();
        let lastMeta = null;

        const setStatus = (msg) => {
            if (!statusEl) return;
            statusEl.textContent = String(msg || "");
        };

        const renderSaved = () => {
            if (!savedListEl || !savedCountEl) return;
            const favs = readFavs();
            savedCountEl.textContent = String(favs.length);
            if (!favs.length) {
                savedListEl.innerHTML = `<div style="color: rgba(17,24,39,0.6); font-weight:700;">${t("No saved names yet.", "अभी तक कोई नाम सेव नहीं है।")}</div>`;
                return;
            }
            savedListEl.innerHTML = favs
                .map((name) => {
                    const safe = name.replace(/"/g, "&quot;");
                    const removeLabel = t("Remove", "हटाएँ");
                    return `<span class="brandgen-pill"><span class="brandgen-pill-name notranslate" translate="no" lang="en">${safe}</span><button type="button" aria-label="${removeLabel}" data-remove="${safe}"><i class="fas fa-xmark"></i></button></span>`;
                })
                .join("");
            savedListEl.querySelectorAll("button[data-remove]").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const target = String(btn.getAttribute("data-remove") || "");
                    const next = readFavs().filter((x) => x !== target);
                    writeFavs(next);
                    renderSaved();
                });
            });
        };

        const render = (names, meta) => {
            const favs = new Set(readFavs());
            const copyLabel = t("Copy", "कॉपी");
            const saveLabel = t("Save", "सेव");
            const savedLabel = t("Saved", "सेव्ड");
            listEl.innerHTML = (names || [])
                .map((name) => {
                    const safe = String(name || "").replace(/"/g, "&quot;");
                    const tags = [
                        meta.style,
                        meta.length,
                        meta.mode
                    ].filter(Boolean).map((t) => `<span class="brandgen-tag">${t}</span>`).join("");
                    const primaryLabel = favs.has(name) ? savedLabel : saveLabel;
                    return `
                        <article class="brandgen-card">
                            <div class="brandgen-name notranslate" translate="no" lang="en">${safe}</div>
                            <div class="brandgen-tags">${tags}</div>
                            <div class="brandgen-card-actions">
                                <button class="brandgen-mini" type="button" data-copy="${safe}"><i class="fas fa-copy" aria-hidden="true"></i> ${copyLabel}</button>
                                <button class="brandgen-mini primary" type="button" data-save="${safe}"><i class="fas fa-bookmark" aria-hidden="true"></i> ${primaryLabel}</button>
                            </div>
                        </article>
                    `;
                })
                .join("");

            listEl.querySelectorAll("button[data-copy]").forEach((btn) => {
                btn.addEventListener("click", async () => {
                    const value = btn.getAttribute("data-copy") || "";
                    const ok = await copyText(value);
                    setStatus(ok ? t(`Copied: ${value}`, `कॉपी हो गया: ${value}`) : t("Copy failed. Please copy manually.", "कॉपी नहीं हुआ। कृपया मैन्युअली कॉपी करें।"));
                });
            });
            listEl.querySelectorAll("button[data-save]").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const value = btn.getAttribute("data-save") || "";
                    const current = readFavs();
                    if (current.includes(value)) return;
                    writeFavs([value, ...current].slice(0, 80));
                    renderSaved();
                    setStatus(t(`Saved: ${value}`, `सेव हो गया: ${value}`));
                    // Re-render buttons to reflect Saved state
                    if (typeof meta.rerender === "function") meta.rerender();
                });
            });
        };

        const generate = () => {
            const count = Math.max(6, Math.min(60, Number(countEl.value) || 24));
            const kw = keywordFragments(keywordsEl.value);
            const opts = {
                industry: industryEl.value,
                keywords: kw,
                style: styleEl.value,
                length: lengthEl.value,
                mode: modeEl.value
            };
            const rng = makeRng(seed);
            const out = [];
            const seen = new Set();
            for (let i = 0; i < count * 4 && out.length < count; i += 1) {
                const name = buildName(rng, opts);
                const normalized = name.toLowerCase();
                if (!name || normalized.length < 3) continue;
                if (seen.has(normalized)) continue;
                seen.add(normalized);
                out.push(name);
            }
            if (countLabel) countLabel.textContent = String(out.length);

            const meta = {
                style: cap(opts.style),
                length: cap(opts.length),
                mode: cap(opts.mode),
                rerender: () => render(out, meta)
            };
            lastMeta = meta;
            render(out, meta);
            setStatus(out.length ? t("Generated fresh ideas.", "नए आइडिया जनरेट हो गए।") : t("No ideas generated. Try different keywords.", "कोई आइडिया नहीं मिला। अलग कीवर्ड ट्राय करें।"));
            return out;
        };

        genBtn.addEventListener("click", () => {
            seed = Date.now();
            generate();
        });

        if (formEl) {
            formEl.addEventListener("submit", (e) => {
                e.preventDefault();
                seed = Date.now();
                generate();
            });
        }

        shuffleBtn.addEventListener("click", () => {
            seed = (seed + 1337) >>> 0;
            generate();
        });

        if (clearSavedBtn) {
            clearSavedBtn.addEventListener("click", () => {
                writeFavs([]);
                renderSaved();
                setStatus(t("Cleared saved names.", "सेव किए गए नाम हटा दिए गए।"));
            });
        }

        document.addEventListener("languageChanged", () => {
            renderSaved();
            if (lastMeta && typeof lastMeta.rerender === "function") lastMeta.rerender();
        });

        // Starter render
        renderSaved();
        generate();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
