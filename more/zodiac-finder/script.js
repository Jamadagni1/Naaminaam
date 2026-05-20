function initZodiacFinder() {
    const DOC_NAKSHATRA_GROUPS = Object.freeze({
        aries: [["chu", "che", "cho", "l", "la"], ["li", "lu", "le", "lo"], ["a", "aa"]],
        taurus: [["i", "u", "e"], ["o", "v", "w"], ["ve", "vo"]],
        gemini: [["k", "ka", "ki"], ["ku", "q", "gh", "ch"], ["ke", "ko", "h", "ha"]],
        cancer: [["hi"], ["hu", "he", "ho", "da"], ["d"]],
        leo: [["m"], ["mo", "t"], ["te"]],
        virgo: [["to", "p", "pa", "pi"], ["pu", "sh", "th"], ["pe", "po"]],
        libra: [["r", "ra", "ri"], ["ru", "re", "ro", "t", "ta"], ["ti", "tu", "te"]],
        scorpio: [["to"], ["n", "na", "ni", "nu", "ne"], ["no", "y", "ya", "yi", "yu"]],
        sagittarius: [["ye", "yo", "bha", "bhi"], ["bhu", "dha", "pha"], ["bhe"]],
        capricorn: [["bho", "j", "z", "x", "b"], ["kha", "kh"], ["g", "ga", "gi"]],
        aquarius: [["gu", "ge"], ["go", "s"], ["se", "so", "da", "d"]],
        pisces: [["d", "di"], ["du", "tha", "th", "jha", "jh"], ["de", "do", "c", "ca", "cha", "ci", "chi"]]
    });

    function getRashiSlugFromName(rashiEn) {
        const raw = String(rashiEn || '').toLowerCase();
        if (raw.includes('aries')) return 'aries';
        if (raw.includes('taurus')) return 'taurus';
        if (raw.includes('gemini')) return 'gemini';
        if (raw.includes('cancer')) return 'cancer';
        if (raw.includes('leo')) return 'leo';
        if (raw.includes('virgo')) return 'virgo';
        if (raw.includes('libra')) return 'libra';
        if (raw.includes('scorpio')) return 'scorpio';
        if (raw.includes('sagittarius')) return 'sagittarius';
        if (raw.includes('capricorn')) return 'capricorn';
        if (raw.includes('aquarius')) return 'aquarius';
        if (raw.includes('pisces')) return 'pisces';
        return '';
    }

    function getNakshatraGroupsForRashi(match) {
        const slug = getRashiSlugFromName(match?.rashi_en);
        const fromDoc = DOC_NAKSHATRA_GROUPS[slug];
        if (Array.isArray(fromDoc) && fromDoc.length) return fromDoc;
        const letters = Array.isArray(match?.letters) ? match.letters : [];
        return [letters.slice(0, 3), letters.slice(3, 6), letters.slice(6, 9)].filter((group) => group.length);
    }

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

    const rashiMap = [
        {
            rashi_en: "Aries (Mesh)",
            rashi_hi: "मेष (Aries)",
            letters: ["chu", "che", "cho", "la", "li", "lu", "le", "lo", "a"],
            nakshatra: "Ashwini, Bharani, Krittika",
            nakshatra_hi: "अश्विनी, भरणी, कृतिका",
            traits: "Courageous, energetic, and a born leader. Your personality reflects fire and determination. You are always ready for new challenges and possess a natural charisma that draws people toward you.",
            traits_hi: "साहसी, ऊर्जावान और जन्मजात नेता। आपका व्यक्तित्व अग्नि और दृढ़ संकल्प को दर्शाता है। आप नई चुनौतियों के लिए हमेशा तैयार रहते हैं और एक स्वाभाविक आकर्षण रखते हैं।"
        },
        {
            rashi_en: "Taurus (Vrishabh)",
            rashi_hi: "वृषभ (Taurus)",
            letters: ["i", "ee", "u", "oo", "e", "o", "va", "vi", "vu", "ve", "vo"],
            nakshatra: "Krittika, Rohini, Mrigashira",
            nakshatra_hi: "कृतिका, रोहिणी, मृगशिरा",
            traits: "Calm, reliable, and a lover of arts. You value stability and have a strong aesthetic sense. Your practical nature combined with your appreciation for beauty makes you a grounded and dependable individual.",
            traits_hi: "शांत, विश्वसनीय और कला प्रेमी। आप स्थिरता को महत्व देते हैं और आपकी सौंदर्य बोध की भावना प्रबल है। आपकी व्यावहारिक प्रकृति और सौंदर्य के प्रति सराहना आपको एक विश्वसनीय व्यक्ति बनाती है।"
        },
        {
            rashi_en: "Gemini (Mithun)",
            rashi_hi: "मिथुन (Gemini)",
            letters: ["ka", "ki", "ku", "gh", "ng", "ch", "ke", "ko", "ha"],
            nakshatra: "Mrigashira, Ardra, Punarvasu",
            nakshatra_hi: "मृगशिरा, आर्द्रा, पुनर्वसु",
            traits: "Intelligent, talkative, and versatile. You have a dual nature that allows you to see both sides of every situation. Curious and communicative, you thrive in social environments and enjoy learning new things.",
            traits_hi: "बुद्धिमान, बातूनी और बहुमुखी। आपकी दोहरी प्रकृति आपको हर स्थिति के दोनों पहलुओं को देखने की अनुमति देती है। जिज्ञासु और मिलनसार, आप सामाजिक वातावरण में पनपते हैं।"
        },
        {
            rashi_en: "Cancer (Kark)",
            rashi_hi: "कर्क (Cancer)",
            letters: ["hi", "hu", "he", "ho", "da", "di", "du", "de", "do"],
            nakshatra: "Punarvasu, Pushya, Ashlesha",
            nakshatra_hi: "पुनर्वसु, पुष्य, अश्लेषा",
            traits: "Emotional, sensitive, and family-oriented. You are the nurturer of the zodiac, with a deep protective instinct for those you love. Your intuition is your greatest guide, and you value emotional security above all.",
            traits_hi: "भावुक, संवेदनशील और परिवार-उन्मुख। आप राशि चक्र के पोषणकर्ता हैं। आपकी अंतर्ज्ञान शक्ति आपकी सबसे बड़ी मार्गदर्शक है, और आप भावनात्मक सुरक्षा को सबसे ऊपर रखते हैं।"
        },
        {
            rashi_en: "Leo (Simha)",
            rashi_hi: "सिंह (Leo)",
            letters: ["ma", "mi", "mu", "me", "mo", "ta", "ti", "tu", "te"],
            nakshatra: "Magha, Purva Phalguni, Uttara Phalguni",
            nakshatra_hi: "मघा, पूर्वा फाल्गुनी, उत्तरा फाल्गुनी",
            traits: "Confident, generous, and regal nature. You possess a natural leadership quality and a magnetic personality. Like the sun, you love to be at the center of attention and inspire others with your courage and vitality.",
            traits_hi: "आत्मविश्वासी, उदार और शाही स्वभाव। आपके पास स्वाभाविक नेतृत्व गुण और चुंबकीय व्यक्तित्व है। सूर्य की तरह, आप ध्यान का केंद्र बनना पसंद करते हैं।"
        },
        {
            rashi_en: "Virgo (Kanya)",
            rashi_hi: "कन्या (Virgo)",
            letters: ["to", "pa", "pi", "pu", "sha", "na", "th", "pe", "po"],
            nakshatra: "Uttara Phalguni, Hasta, Chitra",
            nakshatra_hi: "उत्तरा फाल्गुनी, हस्त, चित्रा",
            traits: "Analytical, practical, and hardworking. You have a keen eye for detail and a desire for perfection. Your systematic approach to life makes you incredibly efficient, and you find joy in being of service to others.",
            traits_hi: "विश्लेषणात्मक, व्यावहारिक और मेहनती। आपकी नजर बारीकियों पर होती है और आप पूर्णता की इच्छा रखते हैं। जीवन के प्रति आपका व्यवस्थित दृष्टिकोण आपको कुशल बनाता है।"
        },
        {
            rashi_en: "Libra (Tula)",
            rashi_hi: "तुला (Libra)",
            letters: ["ra", "ri", "ru", "re", "ro", "ta", "ti", "tu", "te"],
            nakshatra: "Chitra, Swati, Vishakha",
            nakshatra_hi: "चित्रा, स्वाति, विशाखा",
            traits: "Fair, balanced, and social. You seek harmony in all aspects of life and have a natural talent for diplomacy. Your charming personality and sense of justice make you a beloved friend and a peacemaker.",
            traits_hi: "निष्पक्ष, संतुलित और सामाजिक। आप जीवन के सभी पहलुओं में सामंजस्य खोजते हैं। आपका आकर्षक व्यक्तित्व और न्याय की भावना आपको एक प्रिय मित्र बनाती है।"
        },
        {
            rashi_en: "Scorpio (Vrishchik)",
            rashi_hi: "वृश्चिक (Scorpio)",
            letters: ["to", "na", "ni", "nu", "ne", "no", "ya", "yi", "yu"],
            nakshatra: "Vishakha, Anuradha, Jyeshtha",
            nakshatra_hi: "विशाखा, अनुराधा, ज्येष्ठा",
            traits: "Intense, mysterious, and determined. You possess great emotional depth and an unwavering focus. Once you set your sights on a goal, nothing can stop you. You are deeply intuitive and value authenticity.",
            traits_hi: "तीव्र, रहस्यमय और दृढ़। आपके पास महान भावनात्मक गहराई और अटूट ध्यान है। एक बार जब आप किसी लक्ष्य को निर्धारित कर लेते हैं, तो आपको कोई रोक नहीं सकता।"
        },
        {
            rashi_en: "Sagittarius (Dhanu)",
            rashi_hi: "धनु (Sagittarius)",
            letters: ["ye", "yo", "bha", "bhi", "bhu", "dha", "pha", "dha", "bhe"],
            nakshatra: "Mula, Purva Ashadha, Uttara Ashadha",
            nakshatra_hi: "मूल, पूर्वाषाढ़ा, उत्तराषाढ़ा",
            traits: "Optimistic, philosophical, and independent. You are the eternal traveler, always seeking truth and adventure. Your enthusiastic spirit and love for freedom make you a source of inspiration for everyone around you.",
            traits_hi: "आशावादी, दार्शनिक और स्वतंत्र। आप सत्य और रोमांच की खोज में रहते हैं। आपकी उत्साही भावना और स्वतंत्रता के प्रति प्रेम आपको सभी के लिए प्रेरणा का स्रोत बनाता है।"
        },
        {
            rashi_en: "Capricorn (Makar)",
            rashi_hi: "मकर (Capricorn)",
            letters: ["bho", "ja", "ji", "ju", "je", "jo", "kha", "ga", "gi"],
            nakshatra: "Uttara Ashadha, Shravana, Dhanishtha",
            nakshatra_hi: "उत्तराषाढ़ा, श्रवण, धनिष्ठा",
            traits: "Ambitious, disciplined, and patient. You are the builder of the zodiac, reaching the summit through hard work and persistence. Your responsible nature and wisdom earn you respect in all your endeavors.",
            traits_hi: "महत्वाकांक्षी, अनुशासित और धैर्यवान। आप कड़ी मेहनत और दृढ़ता के माध्यम से शिखर तक पहुंचते हैं। आपकी जिम्मेदार प्रकृति और ज्ञान आपको सम्मान दिलाती है।"
        },
        {
            rashi_en: "Aquarius (Kumbh)",
            rashi_hi: "कुंभ (Aquarius)",
            letters: ["gu", "ge", "go", "sa", "si", "su", "se", "so", "da"],
            nakshatra: "Dhanishtha, Shatabhisha, Purva Bhadrapada",
            nakshatra_hi: "धनिष्ठा, शतभिषा, पूर्वा भाद्रपद",
            traits: "Innovative, humanitarian, and friendly. You think outside the box and value your individuality. Your progressive mindset and desire to make the world a better place define your unique personality.",
            traits_hi: "नवीन, मानवतावादी और मैत्रीपूर्ण। आप लीक से हटकर सोचते हैं। आपकी प्रगतिशील मानसिकता और दुनिया को बेहतर बनाने की इच्छा आपके अद्वितीय व्यक्तित्व को परिभाषित करती है।"
        },
        {
            rashi_en: "Pisces (Meen)",
            rashi_hi: "मीन (Pisces)",
            letters: ["di", "du", "th", "jha", "yna", "de", "do", "cha", "chi"],
            nakshatra: "Purva Bhadrapada, Uttara Bhadrapada, Revati",
            nakshatra_hi: "पूर्वा भाद्रपद, उत्तरा भाद्रपद, रेवती",
            traits: "Compassionate, spiritual, and imaginative. You are deeply connected to the emotional and mystical realms. Your artistic soul and empathetic nature allow you to understand others in a way few can.",
            traits_hi: "दयालु, आध्यात्मिक और कल्पनाशील। आप भावनात्मक और रहस्यमय लोकों से गहराई से जुड़े हैं। आपकी कलात्मक आत्मा और सहानुभूतिपूर्ण स्वभाव आपको दूसरों को समझने की अद्भुत क्षमता देती है।"
        }
    ];

    const findBtn = document.getElementById('find-zodiac-btn');
    const nameInput = document.getElementById('user-name');
    const resultsSection = document.getElementById('zodiac-results');
    const loadingSpinner = document.getElementById('loading-spinner');

    const rashiOutput = document.getElementById('rashi-output');
    const nakshatraOutput = document.getElementById('nakshatra-output');
    const traitsOutput = document.getElementById('traits-output');

    if (!findBtn || !nameInput || !resultsSection || !loadingSpinner || !rashiOutput || !nakshatraOutput || !traitsOutput) {
        console.warn('[zodiac-finder] Missing required elements; skipping init.', {
            findBtn: !!findBtn,
            nameInput: !!nameInput,
            resultsSection: !!resultsSection,
            loadingSpinner: !!loadingSpinner,
            rashiOutput: !!rashiOutput,
            nakshatraOutput: !!nakshatraOutput,
            traitsOutput: !!traitsOutput
        });
        return;
    }
    const pickPrimaryNakshatra = (value) => String(value || '').split(',')[0].trim();

    const splitCsv = (value) => String(value || '')
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);

    function sanitizeNameToken(value) {
        return String(value || '')
            .toLowerCase()
            .replace(/[^a-z]/g, '');
    }

    function mapSingleLetterToSyllable(letter) {
        const token = sanitizeNameToken(letter);
        const hints = {
            a: 'a',
            b: 'bho',
            c: 'cha',
            d: 'di',
            e: 'e',
            f: 'pha',
            g: 'ga',
            h: 'ha',
            i: 'i',
            j: 'ja',
            k: 'ka',
            l: 'la',
            m: 'ma',
            n: 'na',
            o: 'o',
            p: 'pa',
            q: 'ka',
            r: 'ra',
            s: 'sa',
            t: 'ta',
            u: 'u',
            v: 'va',
            w: 'va',
            x: 'kha',
            y: 'ya',
            z: 'ja'
        };
        return hints[token] || '';
    }

    function bestMatchingSyllable(name, letters) {
        const clean = sanitizeNameToken(name);
        if (!clean) return '';
        const ordered = (Array.isArray(letters) ? letters : [])
            .map((l) => String(l || '').toLowerCase().trim())
            .filter(Boolean)
            .sort((a, b) => b.length - a.length);
        const direct = ordered.find((l) => clean.startsWith(l));
        if (direct) return direct;
        if (clean.length === 1) {
            const hinted = mapSingleLetterToSyllable(clean);
            if (hinted) return ordered.find((l) => l === hinted) || '';
        }
        return '';
    }

    function resolveNakshatraForMatch(match, name) {
        const nakshatrasEn = splitCsv(match.nakshatra);
        const nakshatrasHi = splitCsv(match.nakshatra_hi);

        if (!nakshatrasEn.length) {
            return {
                nakshatra: pickPrimaryNakshatra(match.nakshatra),
                nakshatra_hi: pickPrimaryNakshatra(match.nakshatra_hi)
            };
        }

        const groups = getNakshatraGroupsForRashi(match)
            .map((group) => (Array.isArray(group) ? group : [])
                .map((token) => String(token || '').toLowerCase().replace(/[^a-z]/g, ''))
                .filter(Boolean))
            .filter((group) => group.length);
        const clean = sanitizeNameToken(name);
        let groupIndex = -1;
        let matchLen = -1;

        for (let i = 0; i < groups.length; i += 1) {
            for (const token of groups[i]) {
                if (!token || !clean.startsWith(token)) continue;
                if (token.length > matchLen) {
                    matchLen = token.length;
                    groupIndex = i;
                }
            }
        }

        if (groupIndex < 0 && clean.length === 1) {
            const hinted = mapSingleLetterToSyllable(clean);
            if (hinted) {
                groupIndex = groups.findIndex((group) => group.includes(hinted));
            }
        }
        if (groupIndex < 0) groupIndex = 0;

        return {
            nakshatra: nakshatrasEn[groupIndex] || nakshatrasEn[0],
            nakshatra_hi: nakshatrasHi[groupIndex] || nakshatrasHi[0] || nakshatrasEn[groupIndex] || nakshatrasEn[0]
        };
    }

    // --- LANGUAGE LOGIC ---
    // Full implementation
    const updateContent = (lang) => {
        document.documentElement.lang = lang;
        localStorage.setItem("language", lang);

        // Update all static text
        document.querySelectorAll("[data-en]").forEach(el => {
            const text = el.getAttribute(lang === "hi" ? "data-hi" : "data-en");
            if (text) el.textContent = text;
        });

        const isHindi = lang === 'hi';
        if (nameInput) nameInput.placeholder = isHindi ? "उदा: अंकित या अ" : "e.g. Aabha or Aa";

        // Re-display results if currently showing
        if (resultsSection.style.display !== 'none' && window.lastZodiacResult) {
            const result = window.lastZodiacResult;
            rashiOutput.textContent = isHindi ? result.rashi_hi : result.rashi_en;
            nakshatraOutput.textContent = isHindi ? result.nakshatra_hi : result.nakshatra;
            traitsOutput.textContent = isHindi ? result.traits_hi : result.traits;
        }
    };

    const getLanguage = () => localStorage.getItem("language") || "en";

    // Initialize
    updateContent(getLanguage());

    const langBtns = document.querySelectorAll('#language-toggle, #language-toggle-mobile');
    langBtns.forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const newLang = getLanguage() === "hi" ? "en" : "hi";
            updateContent(newLang);
        };
    });
    // Initial call
    updateContent(getLanguage());

    findBtn.addEventListener('click', () => {
        try {
        const name = nameInput.value.trim().toLowerCase();
        const lang = document.documentElement.lang || 'en';
        const isHindi = lang === 'hi';

        if (!name) {
            alert(isHindi ? 'कृपया नाम दर्ज करें' : 'Please enter a name');
            return;
        }

        // UI Transition
        resultsSection.style.display = 'none';
        loadingSpinner.style.display = 'block';

        // Simulate star alignment
        setTimeout(() => {
            try {
            const result = findZodiacByName(name);
            window.lastZodiacResult = result; // Save for language toggle

            rashiOutput.textContent = isHindi ? result.rashi_hi : result.rashi_en;
            nakshatraOutput.textContent = isHindi ? result.nakshatra_hi : result.nakshatra;
            traitsOutput.textContent = isHindi ? result.traits_hi : result.traits;

            loadingSpinner.style.display = 'none';
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (err) {
                console.error('[zodiac-finder] Failed to compute result:', err);
                loadingSpinner.style.display = 'none';
                alert(isHindi ? 'à¤•à¥à¤› à¤—à¤²à¤¤ à¤¹à¥‹ à¤—à¤¯à¤¾. à¤•à¥ƒà¤ªà¤¯à¤¾ à¤«à¤¿à¤° à¤¸à¥‡ à¤•à¥‹à¤¶à¤¿à¤¶ à¤•à¤°à¥‡à¤‚.' : 'Something went wrong. Please try again.');
            }
        }, 1500);
        } catch (err) {
            console.error('[zodiac-finder] Click handler failed:', err);
        }
    });

    function findZodiacByName(name) {
        const clean = sanitizeNameToken(name);
        let bestMatch = null;
        for (const r of rashiMap) {
            const token = bestMatchingSyllable(clean, r.letters);
            if (!token) continue;
            if (!bestMatch || token.length > bestMatch.token.length) {
                bestMatch = { rashi: r, token };
            }
        }
        const resolved = (bestMatch && bestMatch.rashi) || rashiMap[0];
        const selectedNakshatra = resolveNakshatraForMatch(resolved, clean);

        return {
            ...resolved,
            nakshatra: selectedNakshatra.nakshatra,
            nakshatra_hi: selectedNakshatra.nakshatra_hi
        };
    }

    // Enter key support
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') findBtn.click();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initZodiacFinder);
} else {
    initZodiacFinder();
}
