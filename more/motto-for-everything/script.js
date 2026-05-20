// --- REFINED MOTTO SCRIPT ---
// Scope everything to avoid colliding with the site's global `script.js` (it also defines FavoritesManager/favManager).
(function () {
    class LocalFavoritesManager {
        constructor() {
            this.storageKey = 'naamin_favorites_v1';
            this.favorites = this.load();
        }

        load() {
            try {
                const data = localStorage.getItem(this.storageKey);
                return data ? JSON.parse(data) : [];
            } catch (_e) {
                return [];
            }
        }

        save() {
            localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
            try {
                document.dispatchEvent(new CustomEvent('favoritesUpdated'));
            } catch (_e) {
                // no-op
            }
        }

        toggle(nameObj) {
            const name = nameObj.name || nameObj.Name;
            const index = this.favorites.findIndex(item => (item.name || item.Name) === name);

            if (index > -1) {
                this.favorites.splice(index, 1);
                return false;
            }
            this.favorites.push(nameObj);
            return true;
        }

        isFavorite(name) {
            return this.favorites.some(item => (item.name || item.Name) === name);
        }

        updateHeaderCount() {
            const count = this.favorites.length;
            document.querySelectorAll('#fav-count, #fav-count-mobile').forEach((span) => {
                span.textContent = count;
                span.style.display = 'inline-flex';
            });
        }
    }

    const favManager = (typeof window !== 'undefined' && window.favManager) ? window.favManager : new LocalFavoritesManager();

    function wireFavoritesCountSync() {
        if (favManager && typeof favManager.updateHeaderCount === 'function') {
            favManager.updateHeaderCount();
        }
    }

    document.addEventListener('naamin:layout-ready', wireFavoritesCountSync);
    document.addEventListener('favoritesUpdated', wireFavoritesCountSync);

    document.addEventListener('DOMContentLoaded', () => {
    wireFavoritesCountSync();
    // --- NAV LOGIC ---
    // ========== MOBILE MENU - RIGHT SIDE DRAWER ==========
    const hamburger = document.getElementById("hamburger-menu");
    const mobileMenu = document.getElementById("mobile-menu");
    const mobileDropdown = document.querySelector(".mobile-dropdown");
    const mobileDropdownToggle = document.querySelector(".mobile-dropdown-toggle");
    const commonHeaderHandlesMenu = hamburger && hamburger.dataset.commonMenuBound === "true";

    // Create overlay for mobile menu
    let mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    if (!commonHeaderHandlesMenu && !mobileMenuOverlay && mobileMenu) {
        mobileMenuOverlay = document.createElement('div');
        mobileMenuOverlay.className = 'mobile-menu-overlay';
        document.body.appendChild(mobileMenuOverlay);
    }

    // Helper functions
    function closeMobileMenu() {
        if (mobileMenu) mobileMenu.classList.remove("open");
        if (mobileMenuOverlay) mobileMenuOverlay.classList.remove("active");
        if (hamburger) {
            const icon = hamburger.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
        }
        document.body.style.overflow = '';
    }

    function openMobileMenu() {
        if (mobileMenu) mobileMenu.classList.add("open");
        if (mobileMenuOverlay) mobileMenuOverlay.classList.add("active");
        if (hamburger) {
            const icon = hamburger.querySelector('i');
            if (icon) icon.className = 'fas fa-times';
        }
        document.body.style.overflow = 'hidden';
    }

    // Toggle mobile menu
    if (!commonHeaderHandlesMenu && hamburger && mobileMenu) {
        hamburger.addEventListener("click", (e) => {
            e.stopPropagation();
            if (mobileMenu.classList.contains("open")) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    // Mobile dropdown toggle
    if (!commonHeaderHandlesMenu && mobileDropdownToggle && mobileDropdown) {
        mobileDropdownToggle.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            mobileDropdown.classList.toggle("open");
        });
    }

    // Close on overlay click
    if (!commonHeaderHandlesMenu && mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener("click", closeMobileMenu);
    }

    // Close when clicking outside
    if (!commonHeaderHandlesMenu) {
    document.addEventListener("click", (e) => {
        if (mobileMenu && hamburger && mobileMenu.classList.contains("open")) {
            if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
                closeMobileMenu();
            }
        }
    });
    }

    // Close on escape key
    if (!commonHeaderHandlesMenu) {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
            closeMobileMenu();
        }
    });
    }

    // Close when clicking links
    if (!commonHeaderHandlesMenu && mobileMenu) {
        mobileMenu.querySelectorAll('a:not(.mobile-dropdown-toggle)').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    // Dropdown toggle logic
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const parent = toggle.parentElement;
            parent.classList.toggle('open');
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        document.querySelectorAll('.dropdown.open').forEach(opened => {
            if (!opened.contains(e.target)) {
                opened.classList.remove('open');
            }
        });
    });

    const favViewBtn = document.getElementById('fav-view-btn');
    if (favViewBtn) {
        favViewBtn.onclick = () => {
            window.location.href = '/wishlist.html';
        };
    }

    // --- LANGUAGE LOGIC ---
    // --- LANGUAGE LOGIC ---
    // Full implementation since main script is not included
    const updateContent = (lang) => {
        document.documentElement.lang = lang;
        localStorage.setItem("language", lang);

        // Update all static text
        document.querySelectorAll(".motto-page [data-en], footer [data-en]").forEach(el => {
            const text = el.getAttribute(lang === "hi" ? "data-hi" : "data-en");
            if (text) el.textContent = text;
        });

        // Update inputs
        const isHindi = lang === 'hi';
        const input = document.getElementById('user-input');
        const tone = document.getElementById('tone');

        if (input) input.placeholder = isHindi ? "e.g. LunaWave or Courage (optional)" : "e.g. LunaWave or Courage (optional)";
        if (tone) tone.placeholder = isHindi ? "उदा: आधुनिक, प्रेरणादायक, न्यूनतम" : "e.g. Modern, Inspiring, Minimal";
    };

    const getLanguage = () => localStorage.getItem("language") || "en";

    // Initialize
    updateContent(getLanguage());

    // Listeners
    const langBtns = document.querySelectorAll('#language-toggle, #language-toggle-mobile');
    langBtns.forEach(btn => {
        // Remove old listeners to be safe (though cloning is better, here we just attach new logic)
        btn.onclick = (e) => {
            e.preventDefault();
            const newLang = getLanguage() === "hi" ? "en" : "hi";
            updateContent(newLang);
        };
    });

    // --- GENERATOR LOGIC ---
    const form = document.getElementById('motto-form');
    const mottoList = document.getElementById('motto-list');
    const resultsSection = document.getElementById('results-section');
    const loadingSpinner = document.getElementById('loading-spinner');

    if (!form || !mottoList || !resultsSection || !loadingSpinner) {
        return;
    }

    const getValue = (id) => {
        const el = document.getElementById(id);
        if (!el) return "";
        return (el.value || "").toString().trim();
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const type = getValue('motto-type') || 'Brand Motto';
            const input = getValue('user-input'); // optional
            const tone = getValue('tone'); // optional

            // Mobile: close keyboard so results are visible after generation.
            try {
                document.activeElement && typeof document.activeElement.blur === 'function' && document.activeElement.blur();
            } catch (_e) { }

            resultsSection.style.display = 'none';
            loadingSpinner.style.display = 'block';

            // Mock delay
            await new Promise(r => setTimeout(r, 1200));

            const mottos = generateMottos(type, input, tone);
            renderMottos(mottos, type);

            loadingSpinner.style.display = 'none';
            resultsSection.style.display = 'block';

            // Ensure the user sees the output (especially on small screens).
            try {
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (_e) { }
        } catch (err) {
            loadingSpinner.style.display = 'none';
            resultsSection.style.display = 'block';
            mottoList.innerHTML =
                '<div class="motto-item"><div class="motto-text">Something went wrong. Please refresh and try again.</div></div>';
            try { console.error('Motto generator failed:', err); } catch (_e) { }
        }
    });

    function renderMottos(mottos, type) {
        mottoList.innerHTML = '';
        mottos.forEach(text => {
            const isLiked = favManager.isFavorite(text);
            const item = document.createElement('div');
            item.className = 'motto-item';
            item.innerHTML = `
                <div class="motto-text">${text}</div>
                <button class="like-btn-motto ${isLiked ? 'liked' : ''}">
                    <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                </button>
            `;

            // Copy on text click
            item.querySelector('.motto-text').onclick = () => {
                navigator.clipboard.writeText(text);
                const lang = document.documentElement.lang || 'en';
                alert(lang === 'hi' ? 'आदर्श वाक्य कॉपी किया गया!' : 'Motto copied!');
            };

            // Like on heart click
            const btn = item.querySelector('.like-btn-motto');
            btn.onclick = (e) => {
                e.stopPropagation();
                const added = favManager.toggle({
                    name: text,
                    meaning: `Motto for ${type}`,
                    origin: 'Motto Generator'
                });
                favManager.save();

                btn.classList.toggle('liked', added);
                btn.querySelector('i').className = added ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            };

            mottoList.appendChild(item);
        });
    }

    function generateMottos(type, input, tone) {
        const lang = document.documentElement.lang || 'en';
        const isHindi = lang === 'hi';

        const safeInput = input || (isHindi ? 'आपका विचार' : 'Your Idea');
        let displayInput = safeInput;
        let displayTone = tone;

        if (isHindi && window.getHindiName && input) {
            displayInput = window.getHindiName(safeInput);
            if (tone) displayTone = window.getHindiName(tone);
        }

        if (isHindi) {
            const base = [
                `${displayInput}: लालित्य की नई परिभाषा`,
                `${displayInput}: जहां दृष्टि मूल्य से मिलती है`,
                `${displayInput}: साधारण से परे`,
                `${displayInput}: जुनून से प्रेरित`,
                `${displayInput} की भावना`,
                `सिर्फ ${displayInput}`
            ];
            if (displayTone) base.push(`${displayTone} और ${displayInput}: एक सही मेल`);
            return base;
        }

        const base = [
            `${safeInput}: Elegance redefined`,
            `${safeInput}: Where vision meets value`,
            `${safeInput}: Beyond the ordinary`,
            `${safeInput}: Driven by passion`,
            `The spirit of ${safeInput}`,
            `Simply ${safeInput}`
        ];
        if (tone) base.push(`${tone} & ${safeInput}: A perfect match`);
        return base;
    }
    });
})();
