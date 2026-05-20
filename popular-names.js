// Popular Names - powered by the full master name list embedded in popular-names.html.

document.addEventListener('DOMContentLoaded', () => {
    const namesGrid = document.getElementById('names-grid');
    const showingCount = document.getElementById('showing-count');
    const genderPills = document.querySelectorAll('[data-filter="gender"]');
    const vibePills = document.querySelectorAll('[data-filter="vibe"]');
    const searchInput = document.getElementById('name-search');

    function getInternalLang() {
        try {
            return localStorage.getItem('language') === 'en' ? 'en' : 'hi';
        } catch (_e) {
            return document.documentElement.lang === 'en' ? 'en' : 'hi';
        }
    }

    let currentFilters = {
        gender: 'all',
        startsWith: '',
        vibe: 'all'
    };

    let popularNamesEnriched = [];
    let hasLoadedData = false;
    let lastLoadedLang = getInternalLang();

    function masterFiles() {
        return Object.freeze({
            male: {
                en: ['boy_names_eng.json', 'boy_names_en.json', 'boy_names.json'],
                hi: ['boy_names_hi.json', 'boy_names_hin.json', 'boy_names.json']
            },
            female: {
                en: ['girl_names_eng.json', 'girl_names_en.json', 'girl_names.json'],
                hi: ['girl_names_hi.json', 'girl_names_hin.json', 'girl_names.json']
            }
        });
    }

    const NATURE_KEYWORDS = ['sun', 'star', 'light', 'dawn', 'moon', 'earth', 'rain', 'river', 'flower', 'forest', 'sky', 'ocean', 'nature', 'lotus'];
    const SPIRITUAL_KEYWORDS = ['god', 'goddess', 'divine', 'lord', 'lakshmi', 'saraswati', 'heaven', 'blessed', 'soul', 'spirit'];
    const MODERN_ORIGINS = ['global', 'indo-european', 'irish', 'italian', 'modern indian'];

    function normalizeDisplayName(rawName) {
        let name = String(rawName || '').replace(/\s+/g, ' ').trim();
        if (!name) return '';
        if (/^[A-Za-z][A-Za-z\s'-]*$/.test(name)) {
            name = name.toLowerCase().replace(/\b[a-z]/g, (char) => char.toUpperCase());
        }
        return name;
    }

    function cleanMeaning(rawMeaning) {
        return String(rawMeaning || 'Meaning not available').replace(/\s+/g, ' ').trim();
    }

    function normalizeMeaningMaybeEmpty(rawMeaning) {
        const raw = String(rawMeaning || '').replace(/\s+/g, ' ').trim();
        return raw;
    }

    function isDevanagariText(text) {
        const raw = String(text || '').trim();
        if (!raw) return false;
        return /[\u0900-\u097F]/.test(raw);
    }

    function transliterateHindiToLatinSafe(value) {
        try {
            if (typeof window.transliterateHindiToLatin === 'function') {
                return String(window.transliterateHindiToLatin(value) || '').trim();
            }
        } catch (_e) { }
        return String(value || '').trim();
    }

    function decodeMaybeMojibake(value) {
        const raw = String(value || '');
        try {
            if (typeof window.decodeHindiMojibake === 'function') return window.decodeHindiMojibake(raw);
            if (typeof window.decodeHindiMojibakeDeep === 'function') return window.decodeHindiMojibakeDeep(raw);
        } catch (_e) { }
        return raw;
    }

    function resolveHindiNameSafe(rawHindi, fallbackEn) {
        try {
            if (typeof window.resolveHindiName === 'function') {
                return window.resolveHindiName(decodeMaybeMojibake(rawHindi), fallbackEn);
            }
        } catch (_e) { }
        const cleaned = decodeMaybeMojibake(rawHindi).trim();
        return isDevanagariText(cleaned) ? cleaned : '';
    }

    function getDisplayName(nameObj, lang) {
        const hindiName = String(nameObj?.hindiName || '').trim();
        if (lang === 'hi' && isDevanagariText(hindiName)) return hindiName;
        return String(nameObj?.name || '').trim();
    }

    function isLikelyEnglishCopy(text) {
        const raw = String(text || '').replace(/\s+/g, ' ').trim();
        if (!raw) return false;
        if (/^meaning\s+coming\s+soon\.?$/i.test(raw)) return false;
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
        const tokens = raw.split(' ').filter(Boolean);
        const titleCaseWords = tokens.filter((w) => /^[A-Z][a-z]+$/.test(w)).length;
        const hasPunct = /[.,;:()\-–—]/.test(raw);
        const hasLowercase = /[a-z]{2,}/.test(raw);
        if (!hasLowercase) return false;
        if (!hasPunct && tokens.length >= 5 && titleCaseWords / tokens.length > 0.7) return false;
        return true;
    }

    function pickMeaningForDisplay(nameObj, lang) {
        const isHindi = lang === 'hi';
        const hi = decodeMaybeMojibake(nameObj.meaning_hi || '').trim();
        const en = String(nameObj.meaning || '').trim();

        if (isHindi) {
            if (isDevanagariText(hi)) return hi;
            if (isLikelyEnglishCopy(en)) return en;
            return 'अर्थ उपलब्ध नहीं है।';
        }

        if (isLikelyEnglishCopy(en)) return en;
        if (isDevanagariText(hi)) return hi;
        return 'अर्थ उपलब्ध नहीं है।';
    }

    function hasAnyKeyword(text, keywords) {
        const value = String(text || '').toLowerCase();
        return keywords.some((keyword) => value.includes(keyword));
    }

    function deriveOrigin(rawOrigin, meaning) {
        const base = String(rawOrigin || '').trim();
        if (base) return base;
        const m = String(meaning || '').toLowerCase();
        if (/(allah|quran|arabic|islam|muslim|sultan)/.test(m)) return 'Arabic';
        if (/(christ|biblical|hebrew|saint|church)/.test(m)) return 'Hebrew';
        if (/(punjab|sikh|khalsa|guru)/.test(m)) return 'Punjabi';
        return 'Indian';
    }

    function getTrendByName(name) {
        const hash = String(name || '')
            .toLowerCase()
            .split('')
            .reduce((acc, ch, idx) => acc + ch.charCodeAt(0) * (idx + 3), 0);
        const bucket = hash % 10;
        if (bucket <= 1) return 'trending';
        if (bucket <= 6) return 'popular';
        return 'rising';
    }

    function getNameVibes(nameObj) {
        const vibes = [];
        const name = String(nameObj.name || '');
        const meaning = String(nameObj.meaning || '');
        const origin = String(nameObj.origin || '').toLowerCase();

        const isModern =
            MODERN_ORIGINS.includes(origin) ||
            nameObj.trend === 'rising' ||
            /modern|new|fresh|urban/.test(meaning.toLowerCase());
        const isShortCool =
            name.length <= 5 ||
            (name.length <= 6 && /[zxyvk]/i.test(name));
        const isNature = hasAnyKeyword(meaning, NATURE_KEYWORDS);
        const isSpiritual = hasAnyKeyword(meaning, SPIRITUAL_KEYWORDS);

        if (isModern) vibes.push('modern');
        if (isShortCool) vibes.push('short-cool');
        if (isNature) vibes.push('nature');
        if (isSpiritual) vibes.push('spiritual');

        return vibes;
    }

    function isPriorityEnglishName(item) {
        return Boolean(item && item.horoscope && isLikelyEnglishCopy(item.meaning));
    }

    async function fetchFirstJson(candidates) {
        for (const file of candidates) {
            const cleanFile = String(file).replace(/^\/+/, '');
            const id = 'popular-names-data-' + cleanFile.replace(/[^a-z0-9_-]/gi, '-');
            const el = document.getElementById(id);
            if (!el) continue;

            try {
                const cleaned = String(el.textContent || '').replace(/^\uFEFF/, '');
                const parsed = JSON.parse(cleaned);
                if (Array.isArray(parsed)) return parsed;
                if (parsed && typeof parsed === 'object') {
                    const firstArray = Object.values(parsed).find((v) => Array.isArray(v));
                    if (Array.isArray(firstArray)) return firstArray;
                }
            } catch (_e) {
                // continue to next candidate
            }
        }
        return [];
    }

    function normalizeLoadedNames(rawArray, gender, sourceLang) {
        const seen = new Set();
        const normalized = [];

        (Array.isArray(rawArray) ? rawArray : []).forEach((item) => {
            const rawName = typeof item === 'string' ? item : (item?.name || item?.Name || '');
            const baseName = isDevanagariText(rawName) ? transliterateHindiToLatinSafe(rawName) : rawName;
            const cleanName = normalizeDisplayName(baseName);
            if (!cleanName) return;

            const key = cleanName.toLowerCase();
            if (seen.has(key)) return;
            seen.add(key);

            const rawMeaningEn = normalizeMeaningMaybeEmpty(item?.meaning || item?.Meaning);
            const meaningEn = /^meaning\s+coming\s+soon\.?$/i.test(rawMeaningEn) ? '' : rawMeaningEn;
            const meaningHiRaw = normalizeMeaningMaybeEmpty(item?.meaning_hi || item?.meaningHi || item?.meaning_hin || item?.meaningHin);
            const decodedMeaningHi = decodeMaybeMojibake(meaningHiRaw).trim();
            const decodedMeaning = decodeMaybeMojibake(item?.meaning || '').trim();
            const meaningHi = isDevanagariText(decodedMeaningHi)
                ? decodedMeaningHi
                : (sourceLang === 'hi' && isDevanagariText(decodedMeaning) ? decodedMeaning : '');

            const meaning = cleanMeaning(meaningEn);
            const origin = deriveOrigin(item?.origin || item?.Origin, meaning);
            const hindiName = resolveHindiNameSafe(
                item?.hindiName || item?.hName || item?.hindi_name || item?.name_hindi || (isDevanagariText(rawName) ? rawName : ''),
                cleanName
            );

            normalized.push({
                ...(item && typeof item === 'object' ? item : {}),
                name: cleanName,
                hindiName,
                gender,
                meaning: meaningEn,
                meaning_hi: meaningHi,
                origin,
                trend: getTrendByName(cleanName),
                region: 'pan-india'
            });
        });

        return normalized;
    }

    async function loadMasterNames() {
        const lang = getInternalLang();
        lastLoadedLang = lang;
        const files = masterFiles();

        const [maleEnRaw, maleHiRaw, femaleEnRaw, femaleHiRaw] = await Promise.all([
            fetchFirstJson(files.male.en),
            fetchFirstJson(files.male.hi),
            fetchFirstJson(files.female.en),
            fetchFirstJson(files.female.hi)
        ]);

        const maleEn = normalizeLoadedNames(maleEnRaw, 'male', 'en');
        const maleHi = normalizeLoadedNames(maleHiRaw, 'male', 'hi');
        const femaleEn = normalizeLoadedNames(femaleEnRaw, 'female', 'en');
        const femaleHi = normalizeLoadedNames(femaleHiRaw, 'female', 'hi');

        const merged = [];
        const indexByKey = new Map();
        function upsert(item) {
            const key = `${item.gender}:${String(item.name || '').toLowerCase()}`;
            const existingIndex = indexByKey.get(key);
            if (existingIndex == null) {
                indexByKey.set(key, merged.length);
                merged.push(item);
                return;
            }
            const existing = merged[existingIndex];
            existing.meaning = existing.meaning || item.meaning;
            existing.meaning_hi = existing.meaning_hi || item.meaning_hi;
            existing.hindiName = existing.hindiName || item.hindiName;
            existing.origin = existing.origin || item.origin;
        }
        [...maleEn, ...femaleEn, ...maleHi, ...femaleHi].forEach(upsert);

        // Ensure we always render a clean meaning string for the active UI lang (no romanized Hindi).
        return merged
            .sort((a, b) => {
                const priority = Number(isPriorityEnglishName(b)) - Number(isPriorityEnglishName(a));
                return priority || a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
            })
            .map((item) => ({
                ...item,
                meaning_display: pickMeaningForDisplay(item, lang)
            }));
    }

    function applyFilters() {
        const filtered = popularNamesEnriched.filter((name) => {
            const genderMatch = currentFilters.gender === 'all' || name.gender === currentFilters.gender;
            const startsWithMatch = !currentFilters.startsWith || name.name.toLowerCase().startsWith(currentFilters.startsWith);
            const vibeMatch = currentFilters.vibe === 'all' || (Array.isArray(name.vibes) && name.vibes.includes(currentFilters.vibe));
            return genderMatch && startsWithMatch && vibeMatch;
        });

        displayNames(filtered);
    }

    function showLoadingState() {
        if (!namesGrid) return;
        namesGrid.innerHTML = '<p style="text-align:center;grid-column:1/-1;font-size:1.05rem;color:#6B6B6B;">Loading full name list...</p>';
    }

    function showErrorState() {
        if (!namesGrid) return;
        namesGrid.innerHTML = '<p style="text-align:center;grid-column:1/-1;font-size:1.05rem;color:#B00020;">Could not load names right now. Please refresh once.</p>';
    }

    function updateLanguage() {
        const lang = getInternalLang();
        document.documentElement.lang = lang;
        const isHindi = lang === 'hi';

        document.querySelectorAll('[data-en]').forEach((el) => {
            const text = el.getAttribute(isHindi ? 'data-hi' : 'data-en');
            if (text) el.textContent = text;
        });

        if (hasLoadedData) applyFilters();
    }

    function displayNames(names) {
        showingCount.textContent = names.length;

        const lang = (window.getLanguage && window.getLanguage()) || document.documentElement.lang || 'en';
        const isHindi = lang === 'hi';

        if (names.length === 0) {
            namesGrid.innerHTML = `<p style="text-align:center;grid-column:1/-1;font-size:1.1rem;color:#6B6B6B;">${isHindi ? 'Koi name match nahin hua.' : 'No names found for this filter.'}</p>`;
            return;
        }

        const favorites = (window.favManager && Array.isArray(window.favManager.favorites))
            ? window.favManager.favorites
            : JSON.parse(localStorage.getItem('naamin_favorites_v1') || localStorage.getItem('favorites') || '[]');

        const trendLabelMap = {
            trending: isHindi ? 'Trending' : 'Trending',
            popular: isHindi ? 'Most Loved' : 'Most Loved',
            rising: isHindi ? 'Rising' : 'Rising'
        };
        const genderLabelMap = {
            male: isHindi ? 'Boy' : 'Male',
            female: isHindi ? 'Girl' : 'Female'
        };
        const vibeLabelMap = {
            modern: 'Modern',
            'short-cool': 'Short & Cool',
            nature: 'Nature Inspired',
            spiritual: 'Spiritual'
        };
        const trendEmoji = {
            trending: '🔥',
            popular: '⭐',
            rising: '📈'
        };

        namesGrid.innerHTML = names.map((nameObj, index) => {
            const isLiked = favorites.some((fav) => fav.name === nameObj.name);
            const genderIcon = nameObj.gender === 'male' ? '<i class="fas fa-mars"></i>' : '<i class="fas fa-venus"></i>';
            const displayName = getDisplayName(nameObj, lang);
            const secondaryName = isHindi && displayName !== nameObj.name ? `<div class="name-subtitle">${nameObj.name}</div>` : '';
            const vibeChips = (Array.isArray(nameObj.vibes) ? nameObj.vibes : [])
                .slice(0, 2)
                .map((vibe) => `<span class="style-chip style-${vibe}">${vibeLabelMap[vibe] || vibe}</span>`)
                .join('');
            const displayMeaning = nameObj.meaning_display || pickMeaningForDisplay(nameObj, lang);

            return `
                <div class="name-card ${nameObj.gender}-card" style="animation-delay:${index * 0.03}s" data-name="${nameObj.name}">
                    <div class="trend-badge ${nameObj.trend}">
                        ${trendEmoji[nameObj.trend]} ${trendLabelMap[nameObj.trend]}
                    </div>
                    <button class="like-btn-card ${isLiked ? 'liked' : ''}" data-name="${nameObj.name}">
                        <i class="fas fa-heart"></i>
                    </button>
                    <div class="name-display">${displayName}</div>
                    ${secondaryName}
                    <div class="gender-badge">
                        ${genderIcon} ${genderLabelMap[nameObj.gender]}
                    </div>
                    <div class="origin-badge">
                        <i class="fas fa-globe"></i> ${nameObj.origin}
                    </div>
                    ${vibeChips ? `<div class="style-chip-row">${vibeChips}</div>` : ''}
                    <div class="name-meaning">${displayMeaning}</div>
                </div>
            `;
        }).join('');

        document.querySelectorAll('.name-card').forEach((card) => {
            card.addEventListener('click', (event) => {
                if (event.target.closest('.like-btn-card')) return;
                const name = card.dataset.name;
                const nameData = names.find((n) => n.name === name);
                console.log('Open detail for:', nameData);
            });
        });

        document.querySelectorAll('.like-btn-card').forEach((btn) => {
            btn.addEventListener('click', (event) => {
                event.stopPropagation();
                const name = btn.dataset.name;
                const nameData = names.find((n) => n.name === name);
                toggleLike(btn, nameData);
            });
        });
    }

    function toggleLike(button, nameData) {
        if (!nameData) return;
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const index = favorites.findIndex((fav) => fav.name === nameData.name);

        if (index > -1) {
            favorites.splice(index, 1);
            button.classList.remove('liked');
        } else {
            favorites.push({
                name: nameData.name,
                gender: nameData.gender === 'male' ? 'Boy' : 'Girl',
                meaning: nameData.meaning
            });
            button.classList.add('liked');
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
        localStorage.setItem('naamin_favorites_v1', JSON.stringify(favorites));
        try { document.dispatchEvent(new CustomEvent('favoritesUpdated')); } catch (_error) { }
        updateFavoriteCount();
    }

    function isLikelyEnglishCopy(text) {
        const raw = String(text || '').replace(/\s+/g, ' ').trim();
        if (!raw) return false;
        if (/^meaning\s+coming\s+soon\.?$/i.test(raw)) return false;
        if (/[\u0900-\u097F]/.test(raw)) return false;
        // This repo's `*_names_eng.json` meanings are frequently romanized Hindi.
        // Filter common Hindi transliteration markers even when casing is inconsistent.
        const lower = raw.toLowerCase();
        // 1) Common Hindi connectors as standalone words.
        if (/(?:^|[^a-z])(ke|ka|ki|men|mein|se|aur)(?:$|[^a-z])/.test(lower)) return false;
        // 2) Common romanized suffix/markers often embedded inside longer words in this dataset.
        if (/(wala|wali|wale|vaala|vaali|vaale|vaalaa|vaalii|rahane|rahaane|khush|khusha|prasann|prasanna|jnyaan|gyan|buddhi|bhagavaan|bhagwan|shakti|prakaash|sadaa|logon|sabako|sabke)/.test(lower)) return false;
        const tokens = raw.split(' ').filter(Boolean);
        const titleCaseWords = tokens.filter((w) => /^[A-Z][a-z]+$/.test(w)).length;
        const hasPunct = /[.,;:()\-]/.test(raw);
        const hasLowercase = /[a-z]{2,}/.test(raw);
        if (!hasLowercase) return false;
        if (!hasPunct && tokens.length >= 5 && titleCaseWords / tokens.length > 0.7) return false;
        return true;
    }

    function updateFavoriteCount() {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const count = favorites.length;
        const desktopCount = document.getElementById('fav-count');
        const mobileCount = document.getElementById('fav-count-mobile');
        if (desktopCount) desktopCount.textContent = count;
        if (mobileCount) mobileCount.textContent = count;
    }

    async function initializeFromMasterList() {
        showLoadingState();
        const masterNames = await loadMasterNames();

        if (!masterNames.length) {
            showErrorState();
            return;
        }

        popularNamesEnriched = masterNames.map((nameObj) => ({
            ...nameObj,
            vibes: getNameVibes(nameObj)
        }));

        hasLoadedData = true;
        applyFilters();
    }

    genderPills.forEach((pill) => {
        pill.addEventListener('click', () => {
            genderPills.forEach((p) => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilters.gender = pill.dataset.value;
            if (hasLoadedData) applyFilters();
        });
    });

    vibePills.forEach((pill) => {
        pill.addEventListener('click', () => {
            vibePills.forEach((p) => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilters.vibe = pill.dataset.value;
            if (hasLoadedData) applyFilters();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const onlyLetters = searchInput.value.replace(/[^a-zA-Z]/g, '');
            const firstLetter = onlyLetters.trim().slice(0, 1).toLowerCase();
            searchInput.value = firstLetter ? firstLetter.toUpperCase() : '';
            currentFilters.startsWith = firstLetter;
            if (hasLoadedData) applyFilters();
        });
    }

    document.addEventListener('languageChanged', () => {
        const next = getInternalLang();
        document.documentElement.lang = next;
        updateLanguage();
        if (next !== lastLoadedLang) {
            hasLoadedData = false;
            initializeFromMasterList();
        }
    });

    document.documentElement.lang = getInternalLang();
    updateLanguage();
    initializeFromMasterList();
});
