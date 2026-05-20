/* ======================================================
   SCRIPT.JS - FINAL COMPLETE VERSION
   (Includes: 2026 Horoscope, Favorites, Typing Animation)
   ====================================================== */

// ===========================
// GENDER THEME PERSISTENCE
// ===========================
const GenderTheme = {
    STORAGE_KEY: 'selectedGender',

    // Save gender selection to localStorage
    save(gender) {
        try {
            localStorage.setItem(this.STORAGE_KEY, gender);
            console.log('Gender saved:', gender);
        } catch (e) {
            console.error('Failed to save gender:', e);
        }
    },

    // Load gender from localStorage
    load() {
        try {
            return localStorage.getItem(this.STORAGE_KEY) || 'Boy';
        } catch (e) {
            console.error('Failed to load gender:', e);
            return 'Boy';
        }
    },

    // Apply theme based on gender
    apply(gender) {
        const html = document.documentElement;
        // Always enforce default (purple) theme regardless of gender
        html.removeAttribute('data-theme'); // Enforce default (purple) theme
        console.log('Applied default theme (Unified Purple)');
    },

    // Initialize theme on page load
    init() {
        const savedGender = this.load();
        this.apply(savedGender);
        return savedGender;
    }
};

const WIN1252_REVERSE_MAP = Object.freeze({
    8364: 128, 8218: 130, 402: 131, 8222: 132, 8230: 133, 8224: 134, 8225: 135,
    710: 136, 8240: 137, 352: 138, 8249: 139, 338: 140, 381: 142,
    8216: 145, 8217: 146, 8220: 147, 8221: 148, 8226: 149, 8211: 150, 8212: 151,
    732: 152, 8482: 153, 353: 154, 8250: 155, 339: 156, 382: 158, 376: 159
});

// Apply theme immediately (before DOMContentLoaded for faster rendering)
GenderTheme.init();

if (document.body) {
    document.body.style.visibility = "visible";
    document.body.style.opacity = "1";
} else {
    document.addEventListener("DOMContentLoaded", () => {
        if (!document.body) return;
        document.body.style.visibility = "visible";
        document.body.style.opacity = "1";
    }, { once: true });
}

const HTML2CANVAS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
let html2canvasLoadPromise = null;
const JSPDF_CDN_SOURCES = [
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js",
    "https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js"
];
let jsPdfLoadPromise = null;

function ensureHtml2Canvas() {
    if (typeof window.html2canvas === "function") {
        return Promise.resolve(window.html2canvas);
    }

    if (html2canvasLoadPromise) {
        return html2canvasLoadPromise;
    }

    html2canvasLoadPromise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${HTML2CANVAS_CDN}"]`);
        if (existingScript) {
            existingScript.addEventListener("load", () => {
                if (typeof window.html2canvas === "function") resolve(window.html2canvas);
                else reject(new Error("html2canvas loaded but unavailable"));
            }, { once: true });
            existingScript.addEventListener("error", () => reject(new Error("Failed to load html2canvas")), { once: true });
            return;
        }

        const loader = document.createElement("script");
        loader.src = HTML2CANVAS_CDN;
        loader.async = true;
        loader.onload = () => {
            if (typeof window.html2canvas === "function") resolve(window.html2canvas);
            else reject(new Error("html2canvas loaded but unavailable"));
        };
        loader.onerror = () => reject(new Error("Failed to load html2canvas"));
        document.head.appendChild(loader);
    }).catch((error) => {
        html2canvasLoadPromise = null;
        throw error;
    });

    return html2canvasLoadPromise;
}

function ensureJsPdf() {
    if (window.jspdf && typeof window.jspdf.jsPDF === "function") {
        return Promise.resolve(window.jspdf.jsPDF);
    }

    if (jsPdfLoadPromise) {
        return jsPdfLoadPromise;
    }

    jsPdfLoadPromise = new Promise((resolve, reject) => {
        const trySourceAt = (index) => {
            if (window.jspdf && typeof window.jspdf.jsPDF === "function") {
                resolve(window.jspdf.jsPDF);
                return;
            }
            if (index >= JSPDF_CDN_SOURCES.length) {
                reject(new Error("Failed to load jsPDF from all sources"));
                return;
            }

            const source = JSPDF_CDN_SOURCES[index];
            const existingScript = document.querySelector(`script[src="${source}"]`);
            if (existingScript) {
                existingScript.addEventListener("load", () => {
                    if (window.jspdf && typeof window.jspdf.jsPDF === "function") resolve(window.jspdf.jsPDF);
                    else trySourceAt(index + 1);
                }, { once: true });
                existingScript.addEventListener("error", () => trySourceAt(index + 1), { once: true });
                return;
            }

            const loader = document.createElement("script");
            loader.src = source;
            loader.async = true;
            loader.onload = () => {
                if (window.jspdf && typeof window.jspdf.jsPDF === "function") resolve(window.jspdf.jsPDF);
                else trySourceAt(index + 1);
            };
            loader.onerror = () => trySourceAt(index + 1);
            document.head.appendChild(loader);
        };

        trySourceAt(0);
    }).catch((error) => {
        jsPdfLoadPromise = null;
        throw error;
    });

    return jsPdfLoadPromise;
}

if (typeof window !== "undefined") {
    const warmupJsPdf = () => {
        ensureJsPdf().catch(() => {
            // Ignore warmup failures; click handler will retry all sources.
        });
    };
    if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(warmupJsPdf, { timeout: 3000 });
    } else {
        window.setTimeout(warmupJsPdf, 1600);
    }
}

const HI_FALLBACK_MAP = Object.freeze({
    "Home": "à¤¹à¥‹à¤®",
    "About": "à¤¹à¤®à¤¾à¤°à¥‡ à¤¬à¤¾à¤°à¥‡ à¤®à¥‡à¤‚",
    "Parents to Child": "à¤®à¤¾à¤¤à¤¾-à¤ªà¤¿à¤¤à¤¾ à¤¸à¥‡ à¤¬à¤šà¥à¤šà¤¾",
    "More": "à¤…à¤§à¤¿à¤•",
    "Popular Names": "à¤²à¥‹à¤•à¤ªà¥à¤°à¤¿à¤¯ à¤¨à¤¾à¤®",
    "Unique Names": "à¤…à¤¦à¥à¤µà¤¿à¤¤à¥€à¤¯ à¤¨à¤¾à¤®",
    "Famous Personalities": "à¤ªà¥à¤°à¤¸à¤¿à¤¦à¥à¤§ à¤¹à¤¸à¥à¤¤à¤¿à¤¯à¤¾à¤‚",
    "Motto Creator": "à¤®à¥‹à¤Ÿà¥‹ à¤•à¥à¤°à¤¿à¤à¤Ÿà¤°",
    "Zodiac Finder": "à¤°à¤¾à¤¶à¤¿ à¤–à¥‹à¤œà¤•",
    "Our Products": "à¤¹à¤®à¤¾à¤°à¥‡ à¤‰à¤¤à¥à¤ªà¤¾à¤¦",
    "Services": "à¤¸à¥‡à¤µà¤¾à¤à¤‚",
    "Aura": "à¤†à¤­à¤¾",
    "Careers": "à¤•à¤°à¤¿à¤¯à¤°",
    "Blog": "à¤¬à¥à¤²à¥‰à¤—",
    "Contact": "à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚",
    "Log in": "à¤²à¥‰à¤— à¤‡à¤¨",
    "Sign up": "à¤¸à¤¾à¤‡à¤¨ à¤…à¤ª",
    "Find your name": "à¤…à¤ªà¤¨à¤¾ à¤¨à¤¾à¤® à¤–à¥‹à¤œà¥‡à¤‚",
    "Name Finder": "à¤¨à¤¾à¤® à¤–à¥‹à¤œà¥‡à¤‚",
    "Boy": "à¤²à¤¡à¤¼à¤•à¤¾",
    "Girl": "à¤²à¤¡à¤¼à¤•à¥€",
    "Back to list": "à¤¸à¥‚à¤šà¥€ à¤ªà¤° à¤µà¤¾à¤ªà¤¸ à¤œà¤¾à¤à¤‚",
    "Naming Inspiration": "à¤¨à¤¾à¤®à¤•à¤°à¤£ à¤ªà¥à¤°à¥‡à¤°à¤£à¤¾",
    "Why Creators Choose Naamin": "à¤•à¥à¤°à¤¿à¤à¤Ÿà¤°à¥à¤¸ Naamin à¤•à¥à¤¯à¥‹à¤‚ à¤šà¥à¤¨à¤¤à¥‡ à¤¹à¥ˆà¤‚",
    "Baby & Family Naming": "à¤¬à¥‡à¤¬à¥€ à¤”à¤° à¤«à¥ˆà¤®à¤¿à¤²à¥€ à¤¨à¤¾à¤®à¤•à¤°à¤£",
    "Startup & Brand Naming": "à¤¸à¥à¤Ÿà¤¾à¤°à¥à¤Ÿà¤…à¤ª à¤”à¤° à¤¬à¥à¤°à¤¾à¤‚à¤¡ à¤¨à¤¾à¤®à¤•à¤°à¤£",
    "Company & Institution Names": "à¤•à¤‚à¤ªà¤¨à¥€ à¤”à¤° à¤¸à¤‚à¤¸à¥à¤¥à¤¾à¤¨ à¤¨à¤¾à¤®",
    "Domain Naming Service": "à¤¡à¥‹à¤®à¥‡à¤¨ à¤¨à¤¾à¤®à¤•à¤°à¤£ à¤¸à¥‡à¤µà¤¾",
    "Name Report": "à¤¨à¤¾à¤® à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ",
    "Pronunciation Support": "à¤‰à¤šà¥à¤šà¤¾à¤°à¤£ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾",
    "Testimonials": "à¤ªà¥à¤°à¤¶à¤‚à¤¸à¤¾à¤ªà¤¤à¥à¤°",
    "Trusted Naming Scale": "à¤µà¤¿à¤¶à¥à¤µà¤¸à¤¨à¥€à¤¯ à¤¨à¤¾à¤®à¤•à¤°à¤£ à¤¸à¥à¤•à¥‡à¤²",
    "How It Works": "à¤¯à¤¹ à¤•à¥ˆà¤¸à¥‡ à¤•à¤¾à¤® à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆ",
    "Explore Services": "à¤¸à¥‡à¤µà¤¾à¤à¤‚ à¤¦à¥‡à¤–à¥‡à¤‚",
    "Naamin Video Gallery": "Naamin à¤µà¥€à¤¡à¤¿à¤¯à¥‹ à¤—à¥ˆà¤²à¤°à¥€",
    "Brand Naming Spotlight": "à¤¬à¥à¤°à¤¾à¤‚à¤¡ à¤¨à¥‡à¤®à¤¿à¤‚à¤— à¤¸à¥à¤ªà¥‰à¤Ÿà¤²à¤¾à¤‡à¤Ÿ",
    "Baby Name Stories": "à¤¬à¥‡à¤¬à¥€ à¤¨à¥‡à¤® à¤¸à¥à¤Ÿà¥‹à¤°à¥€à¤œà¤¼",
    "Domains & Mottos": "à¤¡à¥‹à¤®à¥‡à¤¨ à¤”à¤° à¤®à¥‹à¤Ÿà¥‹",
    "Institutional Naming": "à¤¸à¤‚à¤¸à¥à¤¥à¤¾à¤—à¤¤ à¤¨à¤¾à¤®à¤•à¤°à¤£",
    "View Large": "à¤¬à¤¡à¤¼à¤¾ à¤¦à¥‡à¤–à¥‡à¤‚",
    "Quick Links": "à¤¤à¥à¤µà¤°à¤¿à¤¤ à¤²à¤¿à¤‚à¤•",
    "Our Services": "à¤¹à¤®à¤¾à¤°à¥€ à¤¸à¥‡à¤µà¤¾à¤à¤‚",
    "Follow Us": "à¤¹à¤®à¥‡à¤‚ à¤«à¥‰à¤²à¥‹ à¤•à¤°à¥‡à¤‚",
    "Name Consultation": "à¤¨à¤¾à¤® à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶",
    "Vedic Guidance": "à¤µà¥ˆà¤¦à¤¿à¤• à¤®à¤¾à¤°à¥à¤—à¤¦à¤°à¥à¤¶à¤¨",
    "Your Shortlist": "à¤†à¤ªà¤•à¥€ à¤¶à¥‰à¤°à¥à¤Ÿà¤²à¤¿à¤¸à¥à¤Ÿ",
    "Clear All": "à¤¸à¤­à¥€ à¤¹à¤Ÿà¤¾à¤à¤‚",
    "Ready to finalize your name with confidence?": "à¤…à¤ªà¤¨à¥‡ à¤¨à¤¾à¤® à¤•à¥‹ à¤†à¤¤à¥à¤®à¤µà¤¿à¤¶à¥à¤µà¤¾à¤¸ à¤•à¥‡ à¤¸à¤¾à¤¥ à¤…à¤‚à¤¤à¤¿à¤® à¤°à¥‚à¤ª à¤¦à¥‡à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤¤à¥ˆà¤¯à¤¾à¤° à¤¹à¥ˆà¤‚?",
    "Book Name Report": "à¤¨à¤¾à¤® à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤¬à¥à¤• à¤•à¤°à¥‡à¤‚",
    "Request Your Report": "à¤…à¤ªà¤¨à¥€ à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤®à¤¾à¤‚à¤—à¥‡à¤‚",
    "Explore Domain Service": "à¤¡à¥‹à¤®à¥‡à¤¨ à¤¸à¥‡à¤µà¤¾ à¤¦à¥‡à¤–à¥‡à¤‚",
    "What is inside the report": "à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤®à¥‡à¤‚ à¤•à¥à¤¯à¤¾ à¤¶à¤¾à¤®à¤¿à¤² à¤¹à¥ˆ",
    "How we prepare your report": "à¤¹à¤® à¤†à¤ªà¤•à¥€ à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤•à¥ˆà¤¸à¥‡ à¤¤à¥ˆà¤¯à¤¾à¤° à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚",
    "What you receive": "à¤†à¤ªà¤•à¥‹ à¤•à¥à¤¯à¤¾ à¤®à¤¿à¤²à¥‡à¤—à¤¾",
    "Quick FAQs": "à¤¤à¥à¤µà¤°à¤¿à¤¤ à¤ªà¥à¤°à¤¶à¥à¤¨",
    "Is this only for baby names?": "à¤•à¥à¤¯à¤¾ à¤¯à¤¹ à¤•à¥‡à¤µà¤² à¤¬à¥‡à¤¬à¥€ à¤¨à¤¾à¤®à¥‹à¤‚ à¤•à¥‡ à¤²à¤¿à¤ à¤¹à¥ˆ?",
    "Can I request domain and motto options too?": "à¤•à¥à¤¯à¤¾ à¤®à¥ˆà¤‚ à¤¡à¥‹à¤®à¥‡à¤¨ à¤”à¤° à¤®à¥‹à¤Ÿà¥‹ à¤µà¤¿à¤•à¤²à¥à¤ª à¤­à¥€ à¤®à¤¾à¤‚à¤— à¤¸à¤•à¤¤à¤¾/à¤¸à¤•à¤¤à¥€ à¤¹à¥‚à¤‚?",
    "How fast will I get the report?": "à¤®à¥à¤à¥‡ à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤•à¤¿à¤¤à¤¨à¥€ à¤œà¤²à¥à¤¦à¥€ à¤®à¤¿à¤²à¥‡à¤—à¥€?",
    "premium naming document": "à¤ªà¥à¤°à¥€à¤®à¤¿à¤¯à¤® à¤¨à¥‡à¤®à¤¿à¤‚à¤— à¤¦à¤¸à¥à¤¤à¤¾à¤µà¥‡à¤œà¤¼",
    "Name Report, Designed to Impress": "à¤¨à¤¾à¤® à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ, à¤ªà¥à¤°à¤­à¤¾à¤µ à¤›à¥‹à¤¡à¤¼à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤¡à¤¿à¤œà¤¼à¤¾à¤‡à¤¨ à¤•à¥€ à¤—à¤ˆ",
    "sample report preview": "à¤¸à¥ˆà¤‚à¤ªà¤² à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤ªà¥à¤°à¥€à¤µà¥à¤¯à¥‚",
    "No Result Found": "à¤•à¥‹à¤ˆ à¤ªà¤°à¤¿à¤£à¤¾à¤® à¤¨à¤¹à¥€à¤‚ à¤®à¤¿à¤²à¤¾",
    "Start Name Search": "à¤¨à¤¾à¤® à¤–à¥‹à¤œ à¤¶à¥à¤°à¥‚ à¤•à¤°à¥‡à¤‚",
    "See Name Report": "à¤¨à¤¾à¤® à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤¦à¥‡à¤–à¥‡à¤‚",
    "Trusted by Families, Founders, and Teams": "à¤ªà¤°à¤¿à¤µà¤¾à¤°à¥‹à¤‚, à¤«à¤¾à¤‰à¤‚à¤¡à¤°à¥à¤¸ à¤”à¤° à¤Ÿà¥€à¤®à¥‹à¤‚ à¤•à¤¾ à¤­à¤°à¥‹à¤¸à¤¾",
    "Choose Your Naming Journey": "à¤…à¤ªà¤¨à¥€ à¤¨à¥‡à¤®à¤¿à¤‚à¤— à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤šà¥à¤¨à¥‡à¤‚",
    "Naming Inspiration": "à¤¨à¤¾à¤®à¤•à¤°à¤£ à¤ªà¥à¤°à¥‡à¤°à¤£à¤¾",
    "Name Finder": "à¤¨à¤¾à¤® à¤–à¥‹à¤œà¤•",
    "Why People Trust Naamin": "à¤²à¥‹à¤— Naamin à¤ªà¤° à¤­à¤°à¥‹à¤¸à¤¾ à¤•à¥à¤¯à¥‹à¤‚ à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚",
    "How It Works": "à¤¯à¤¹ à¤•à¥ˆà¤¸à¥‡ à¤•à¤¾à¤® à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆ",
    "Naamin Video Gallery": "Naamin à¤µà¥€à¤¡à¤¿à¤¯à¥‹ à¤—à¥ˆà¤²à¤°à¥€",
    "Popular & Trending Names": "à¤²à¥‹à¤•à¤ªà¥à¤°à¤¿à¤¯ à¤”à¤° à¤Ÿà¥à¤°à¥‡à¤‚à¤¡à¤¿à¤‚à¤— à¤¨à¤¾à¤®",
    "Discover Exclusive Gems": "à¤à¤•à¥à¤¸à¤•à¥à¤²à¥‚à¤¸à¤¿à¤µ à¤¨à¤¾à¤® à¤–à¥‹à¤œà¥‡à¤‚",
    "Names Inspired by Greatness": "à¤®à¤¹à¤¾à¤¨ à¤µà¥à¤¯à¤•à¥à¤¤à¤¿à¤¤à¥à¤µà¥‹à¤‚ à¤¸à¥‡ à¤ªà¥à¤°à¥‡à¤°à¤¿à¤¤ à¤¨à¤¾à¤®",
    "Service Pages": "à¤¸à¥‡à¤µà¤¾ à¤ªà¥‡à¤œ",
    "Explore All Services": "à¤¸à¤­à¥€ à¤¸à¥‡à¤µà¤¾à¤à¤‚ à¤¦à¥‡à¤–à¥‡à¤‚",
    "Get Started": "à¤¶à¥à¤°à¥‚ à¤•à¤°à¥‡à¤‚",
    "Contact Us": "à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚",
    "Call Us": "à¤•à¥‰à¤² à¤•à¤°à¥‡à¤‚",
    "Email Us": "à¤ˆà¤®à¥‡à¤² à¤•à¤°à¥‡à¤‚",
    "WhatsApp Us": "à¤µà¥à¤¹à¤¾à¤Ÿà¥à¤¸à¤à¤ª à¤•à¤°à¥‡à¤‚",
    "Chat on WhatsApp": "à¤µà¥à¤¹à¤¾à¤Ÿà¥à¤¸à¤à¤ª à¤ªà¤° à¤šà¥ˆà¤Ÿ à¤•à¤°à¥‡à¤‚",
    "Get in Touch": "à¤¸à¤‚à¤ªà¤°à¥à¤• à¤®à¥‡à¤‚ à¤°à¤¹à¥‡à¤‚",
    "Search by Starting Letter": "à¤¶à¥à¤°à¥à¤†à¤¤à¥€ à¤…à¤•à¥à¤·à¤° à¤¸à¥‡ à¤–à¥‹à¤œà¥‡à¤‚",
    "Select Plan": "à¤ªà¥à¤²à¤¾à¤¨ à¤šà¥à¤¨à¥‡à¤‚",
    "Order Now": "à¤…à¤­à¥€ à¤‘à¤°à¥à¤¡à¤° à¤•à¤°à¥‡à¤‚",
    "Detailed Name Report (PDF)": "à¤µà¤¿à¤¸à¥à¤¤à¥ƒà¤¤ à¤¨à¤¾à¤® à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ (à¤ªà¥€à¤¡à¥€à¤à¤«)",
    "Poster + PDF Report Bundle": "à¤ªà¥‹à¤¸à¥à¤Ÿà¤° + à¤ªà¥€à¤¡à¥€à¤à¤« à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤¬à¤‚à¤¡à¤²"
});

const HI_FALLBACK_REPLACEMENTS = Object.freeze([
    ["Naming-related services are free. Please feel free to contact us.", "à¤¨à¤¾à¤®à¤•à¤°à¤£ à¤¸à¥‡ à¤œà¥à¤¡à¤¼à¥€ à¤¸à¥‡à¤µà¤¾à¤à¤‚ à¤®à¥à¤«à¥à¤¤ à¤¹à¥ˆà¤‚à¥¤ à¤•à¥ƒà¤ªà¤¯à¤¾ à¤¬à¥‡à¤à¤¿à¤à¤• à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚à¥¤"],
    ["Discover beautiful name ideas for every journey â€” families, founders, and institutions.", "à¤¹à¤° à¤¸à¤«à¤° à¤•à¥‡ à¤²à¤¿à¤ à¤¸à¥à¤‚à¤¦à¤° à¤¨à¤¾à¤® à¤µà¤¿à¤šà¤¾à¤° à¤–à¥‹à¤œà¥‡à¤‚ â€” à¤ªà¤°à¤¿à¤µà¤¾à¤°, à¤«à¤¾à¤‰à¤‚à¤¡à¤°à¥à¤¸ à¤”à¤° à¤¸à¤‚à¤¸à¥à¤¥à¤¾à¤¨à¥¤"],
    ["Meaning, origin, numerology, and pronunciation packed into a clean report.", "à¤…à¤°à¥à¤¥, à¤‰à¤¤à¥à¤ªà¤¤à¥à¤¤à¤¿, à¤…à¤‚à¤•à¤¶à¤¾à¤¸à¥à¤¤à¥à¤° à¤”à¤° à¤‰à¤šà¥à¤šà¤¾à¤°à¤£ â€” à¤¸à¤¬ à¤à¤• à¤¸à¤¾à¤« à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤®à¥‡à¤‚à¥¤"],
    ["Posters, announcement kits, and identity assets â€” beautifully designed.", "à¤ªà¥‹à¤¸à¥à¤Ÿà¤°, à¤…à¤¨à¤¾à¤‰à¤‚à¤¸à¤®à¥‡à¤‚à¤Ÿ à¤•à¤¿à¤Ÿ à¤”à¤° à¤†à¤‡à¤¡à¥‡à¤‚à¤Ÿà¤¿à¤Ÿà¥€ à¤à¤¸à¥‡à¤Ÿà¥à¤¸ â€” à¤–à¥‚à¤¬à¤¸à¥‚à¤°à¤¤à¥€ à¤¸à¥‡ à¤¡à¤¿à¤œà¤¼à¤¾à¤‡à¤¨ à¤•à¤¿à¤ à¤—à¤à¥¤"],
    ["Hear names, compare spellings, and choose what feels effortless.", "à¤¨à¤¾à¤® à¤¸à¥à¤¨à¥‡à¤‚, à¤¸à¥à¤ªà¥‡à¤²à¤¿à¤‚à¤— à¤¤à¥à¤²à¤¨à¤¾ à¤•à¤°à¥‡à¤‚ à¤”à¤° à¤œà¥‹ à¤¸à¤¹à¤œ à¤²à¤—à¥‡ à¤‰à¤¸à¥‡ à¤šà¥à¤¨à¥‡à¤‚à¥¤"],
    ["Built on research, tradition, and modern brand craft.", "à¤°à¤¿à¤¸à¤°à¥à¤š, à¤ªà¤°à¤‚à¤ªà¤°à¤¾ à¤”à¤° à¤†à¤§à¥à¤¨à¤¿à¤• à¤¬à¥à¤°à¤¾à¤‚à¤¡ à¤•à¥à¤°à¤¾à¤«à¥à¤Ÿ à¤ªà¤° à¤†à¤§à¤¾à¤°à¤¿à¤¤à¥¤"],
    ["Explore our naming journeys, brand stories, and client showcases.", "à¤¹à¤®à¤¾à¤°à¥‡ à¤¨à¥‡à¤®à¤¿à¤‚à¤— à¤¸à¤«à¤°, à¤¬à¥à¤°à¤¾à¤‚à¤¡ à¤¸à¥à¤Ÿà¥‹à¤°à¥€à¤œà¤¼ à¤”à¤° à¤•à¥à¤²à¤¾à¤‡à¤‚à¤Ÿ à¤¶à¥‹à¤•à¥‡à¤¸ à¤¦à¥‡à¤–à¥‡à¤‚à¥¤"],
    ["Heartfelt journeys from shortlist to final name.", "à¤¶à¥‰à¤°à¥à¤Ÿà¤²à¤¿à¤¸à¥à¤Ÿ à¤¸à¥‡ à¤…à¤‚à¤¤à¤¿à¤® à¤¨à¤¾à¤® à¤¤à¤• à¤•à¥€ à¤­à¤¾à¤µà¤¨à¤¾à¤¤à¥à¤®à¤• à¤¯à¤¾à¤¤à¥à¤°à¤¾à¤à¤‚à¥¤"],
    ["See how we build unforgettable identities for modern startups.", "à¤¦à¥‡à¤–à¥‡à¤‚ à¤¹à¤® à¤†à¤§à¥à¤¨à¤¿à¤• à¤¸à¥à¤Ÿà¤¾à¤°à¥à¤Ÿà¤…à¤ªà¥à¤¸ à¤•à¥‡ à¤²à¤¿à¤ à¤¯à¤¾à¤¦à¤—à¤¾à¤° à¤ªà¤¹à¤šà¤¾à¤¨ à¤•à¥ˆà¤¸à¥‡ à¤¬à¤¨à¤¾à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤"],
    ["How a domain and motto complete the identity story.", "à¤•à¥ˆà¤¸à¥‡ à¤¡à¥‹à¤®à¥‡à¤¨ à¤”à¤° à¤®à¥‹à¤Ÿà¥‹ à¤ªà¤¹à¤šà¤¾à¤¨ à¤•à¥€ à¤•à¤¹à¤¾à¤¨à¥€ à¤ªà¥‚à¤°à¥€ à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤"],
    ["Clear, credible names for schools and organizations.", "à¤¸à¥à¤•à¥‚à¤² à¤”à¤° à¤¸à¤‚à¤¸à¥à¤¥à¤¾à¤“à¤‚ à¤•à¥‡ à¤²à¤¿à¤ à¤¸à¥à¤ªà¤·à¥à¤Ÿ à¤”à¤° à¤µà¤¿à¤¶à¥à¤µà¤¸à¤¨à¥€à¤¯ à¤¨à¤¾à¤®à¥¤"],
    ["1) Tell us your category: baby, brand, startup, company, or institution. 2) Shortlist with meanings + insights. 3) Finalize with domain/motto options. 4) Download reports and assets.", "1) à¤…à¤ªà¤¨à¥€ à¤¶à¥à¤°à¥‡à¤£à¥€ à¤¬à¤¤à¤¾à¤à¤‚: à¤¬à¥‡à¤¬à¥€, à¤¬à¥à¤°à¤¾à¤‚à¤¡, à¤¸à¥à¤Ÿà¤¾à¤°à¥à¤Ÿà¤…à¤ª, à¤•à¤‚à¤ªà¤¨à¥€ à¤¯à¤¾ à¤¸à¤‚à¤¸à¥à¤¥à¤¾à¤¨à¥¤ 2) à¤…à¤°à¥à¤¥ à¤”à¤° à¤‡à¤¨à¤¸à¤¾à¤‡à¤Ÿà¥à¤¸ à¤•à¥‡ à¤¸à¤¾à¤¥ à¤¶à¥‰à¤°à¥à¤Ÿà¤²à¤¿à¤¸à¥à¤Ÿà¥¤ 3) à¤¡à¥‹à¤®à¥‡à¤¨/à¤®à¥‹à¤Ÿà¥‹ à¤µà¤¿à¤•à¤²à¥à¤ªà¥‹à¤‚ à¤•à¥‡ à¤¸à¤¾à¤¥ à¤«à¤¾à¤‡à¤¨à¤² à¤•à¤°à¥‡à¤‚à¥¤ 4) à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤”à¤° à¤à¤¸à¥‡à¤Ÿ à¤¡à¤¾à¤‰à¤¨à¤²à¥‹à¤¡ à¤•à¤°à¥‡à¤‚à¥¤"],
    ["Coming soon, please wait, we appreciate your patience.", "à¤œà¤²à¥à¤¦ à¤† à¤°à¤¹à¤¾ à¤¹à¥ˆ, à¤•à¥ƒà¤ªà¤¯à¤¾ à¤ªà¥à¤°à¤¤à¥€à¤•à¥à¤·à¤¾ à¤•à¤°à¥‡à¤‚, à¤¹à¤® à¤†à¤ªà¤•à¥‡ à¤§à¥ˆà¤°à¥à¤¯ à¤•à¥€ à¤¸à¤°à¤¾à¤¹à¤¨à¤¾ à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤"],
    ["Get a high-clarity report for baby names, brands, startups, companies, and institutions. Every report is crafted with meaning, pronunciation, numerology, brand-fit notes, and practical launch suggestions.", "à¤¬à¥‡à¤¬à¥€ à¤¨à¤¾à¤®, à¤¬à¥à¤°à¤¾à¤‚à¤¡, à¤¸à¥à¤Ÿà¤¾à¤°à¥à¤Ÿà¤…à¤ª, à¤•à¤‚à¤ªà¤¨à¤¿à¤¯à¥‹à¤‚ à¤”à¤° à¤¸à¤‚à¤¸à¥à¤¥à¤¾à¤¨à¥‹à¤‚ à¤•à¥‡ à¤²à¤¿à¤ à¤¹à¤¾à¤ˆ-à¤•à¥à¤²à¥ˆà¤°à¤¿à¤Ÿà¥€ à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤ªà¤¾à¤à¤‚à¥¤ à¤¹à¤° à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤…à¤°à¥à¤¥, à¤‰à¤šà¥à¤šà¤¾à¤°à¤£, à¤…à¤‚à¤•à¤¶à¤¾à¤¸à¥à¤¤à¥à¤°, à¤¬à¥à¤°à¤¾à¤‚à¤¡-à¤«à¤¿à¤Ÿ à¤¨à¥‹à¤Ÿà¥à¤¸ à¤”à¤° à¤µà¥à¤¯à¤¾à¤µà¤¹à¤¾à¤°à¤¿à¤• à¤¸à¥à¤à¤¾à¤µà¥‹à¤‚ à¤•à¥‡ à¤¸à¤¾à¤¥ à¤¤à¥ˆà¤¯à¤¾à¤° à¤•à¥€ à¤œà¤¾à¤¤à¥€ à¤¹à¥ˆà¥¤"],
    ["Baby + Brand Friendly", "à¤¬à¥‡à¤¬à¥€ + à¤¬à¥à¤°à¤¾à¤‚à¤¡ à¤«à¥à¤°à¥‡à¤‚à¤¡à¤²à¥€"],
    ["Pronunciation clarity", "à¤‰à¤šà¥à¤šà¤¾à¤°à¤£ à¤¸à¥à¤ªà¤·à¥à¤Ÿà¤¤à¤¾"],
    ["Domain + Motto hints", "à¤¡à¥‹à¤®à¥‡à¤¨ + à¤®à¥‹à¤Ÿà¥‹ à¤¸à¤‚à¤•à¥‡à¤¤"],
    ["Share-ready PDF", "à¤¶à¥‡à¤¯à¤°-à¤°à¥‡à¤¡à¥€ à¤ªà¥€à¤¡à¥€à¤à¤«"],
    ["A practical and premium structure so decision-making becomes easier and faster.", "à¤à¤• à¤µà¥à¤¯à¤¾à¤µà¤¹à¤¾à¤°à¤¿à¤• à¤”à¤° à¤ªà¥à¤°à¥€à¤®à¤¿à¤¯à¤® à¤¸à¤‚à¤°à¤šà¤¨à¤¾ à¤¤à¤¾à¤•à¤¿ à¤¨à¤¿à¤°à¥à¤£à¤¯ à¤²à¥‡à¤¨à¤¾ à¤†à¤¸à¤¾à¤¨ à¤”à¤° à¤¤à¥‡à¤œ à¤¹à¥‹à¥¤"],
    ["Simple process, transparent steps, and practical outcomes.", "à¤¸à¤°à¤² à¤ªà¥à¤°à¤•à¥à¤°à¤¿à¤¯à¤¾, à¤ªà¤¾à¤°à¤¦à¤°à¥à¤¶à¥€ à¤šà¤°à¤£ à¤”à¤° à¤µà¥à¤¯à¤¾à¤µà¤¹à¤¾à¤°à¤¿à¤• à¤ªà¤°à¤¿à¤£à¤¾à¤®à¥¤"],
    ["Built for fast decision-making and easy sharing with family or teams.", "à¤¤à¥‡à¤œà¤¼ à¤¨à¤¿à¤°à¥à¤£à¤¯ à¤”à¤° à¤ªà¤°à¤¿à¤µà¤¾à¤°/à¤Ÿà¥€à¤® à¤•à¥‡ à¤¸à¤¾à¤¥ à¤†à¤¸à¤¾à¤¨ à¤¶à¥‡à¤¯à¤°à¤¿à¤‚à¤— à¤•à¥‡ à¤²à¤¿à¤ à¤¤à¥ˆà¤¯à¤¾à¤°à¥¤"],
    ["Primary recommendation with rationale", "à¤¤à¤°à¥à¤• à¤¸à¤¹à¤¿à¤¤ à¤®à¥à¤–à¥à¤¯ à¤¸à¤¿à¤«à¤¾à¤°à¤¿à¤¶"],
    ["Top alternatives with strengths and weaknesses", "à¤®à¥à¤–à¥à¤¯ à¤µà¤¿à¤•à¤²à¥à¤ª, à¤–à¥‚à¤¬à¤¿à¤¯à¤¾à¤‚ à¤”à¤° à¤•à¤®à¤¿à¤¯à¥‹à¤‚ à¤¸à¤¹à¤¿à¤¤"],
    ["Pronunciation and spelling variants", "à¤‰à¤šà¥à¤šà¤¾à¤°à¤£ à¤”à¤° à¤µà¤°à¥à¤¤à¤¨à¥€ à¤•à¥‡ à¤µà¤¿à¤•à¤²à¥à¤ª"],
    ["Numerology plus meaning summary blocks", "à¤…à¤‚à¤•à¤¶à¤¾à¤¸à¥à¤¤à¥à¤° à¤”à¤° à¤…à¤°à¥à¤¥ à¤•à¥‡ à¤¸à¤¾à¤°à¤¾à¤‚à¤¶ à¤¬à¥à¤²à¥‰à¤•"],
    ["Optional domain and motto direction", "à¤µà¥ˆà¤•à¤²à¥à¤ªà¤¿à¤• à¤¡à¥‹à¤®à¥‡à¤¨ à¤”à¤° à¤®à¥‹à¤Ÿà¥‹ à¤¦à¤¿à¤¶à¤¾"],
    ["Visual preview", "à¤µà¤¿à¤œà¤¼à¥à¤…à¤² à¤ªà¥à¤°à¥€à¤µà¥à¤¯à¥‚"],
    ["No. This report supports babies, brands, startups, companies, institutions, and more naming categories.", "à¤¨à¤¹à¥€à¤‚à¥¤ à¤¯à¤¹ à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤¬à¥‡à¤¬à¥€, à¤¬à¥à¤°à¤¾à¤‚à¤¡, à¤¸à¥à¤Ÿà¤¾à¤°à¥à¤Ÿà¤…à¤ª, à¤•à¤‚à¤ªà¤¨à¤¿à¤¯à¥‹à¤‚, à¤¸à¤‚à¤¸à¥à¤¥à¤¾à¤¨à¥‹à¤‚ à¤”à¤° à¤…à¤¨à¥à¤¯ à¤¨à¤¾à¤®à¤•à¤°à¤£ à¤¶à¥à¤°à¥‡à¤£à¤¿à¤¯à¥‹à¤‚ à¤•à¥‡ à¤²à¤¿à¤ à¤¹à¥ˆà¥¤"],
    ["Yes. Domain-friendly options and motto direction can be included based on your category and tone preference.", "à¤¹à¤¾à¤à¥¤ à¤†à¤ªà¤•à¥€ à¤¶à¥à¤°à¥‡à¤£à¥€ à¤”à¤° à¤Ÿà¥‹à¤¨ à¤•à¥‡ à¤†à¤§à¤¾à¤° à¤ªà¤° à¤¡à¥‹à¤®à¥‡à¤¨-à¤«à¥à¤°à¥‡à¤‚à¤¡à¤²à¥€ à¤µà¤¿à¤•à¤²à¥à¤ª à¤”à¤° à¤®à¥‹à¤Ÿà¥‹ à¤¦à¤¿à¤¶à¤¾ à¤¶à¤¾à¤®à¤¿à¤² à¤•à¥€ à¤œà¤¾ à¤¸à¤•à¤¤à¥€ à¤¹à¥ˆà¥¤"],
    ["Usually the first draft is delivered within 24 to 48 hours after receiving clear inputs.", "à¤†à¤®à¤¤à¥Œà¤° à¤ªà¤° à¤¸à¥à¤ªà¤·à¥à¤Ÿ à¤‡à¤¨à¤ªà¥à¤Ÿ à¤®à¤¿à¤²à¤¨à¥‡ à¤•à¥‡ 24 à¤¸à¥‡ 48 à¤˜à¤‚à¤Ÿà¥‹à¤‚ à¤®à¥‡à¤‚ à¤ªà¤¹à¤²à¤¾ à¤¡à¥à¤°à¤¾à¤«à¥à¤Ÿ à¤¦à¤¿à¤¯à¤¾ à¤œà¤¾à¤¤à¤¾ à¤¹à¥ˆà¥¤"],
    ["Hyderabad, Telangana, India", "à¤¹à¥ˆà¤¦à¤°à¤¾à¤¬à¤¾à¤¦, à¤¤à¥‡à¤²à¤‚à¤—à¤¾à¤¨à¤¾, à¤­à¤¾à¤°à¤¤"],
    ["Â© 2025 Naamin. All rights reserved.", "Â© 2025 Naamin. à¤¸à¤°à¥à¤µà¤¾à¤§à¤¿à¤•à¤¾à¤° à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤à¥¤"]
]);

const ORIGINAL_TEXT_NODE_MAP = new WeakMap();
const ORIGINAL_ATTRIBUTE_MAP = new WeakMap();
const TRANSLATABLE_ATTRS = Object.freeze(["placeholder", "title", "aria-label", "alt", "value"]);
const VALUE_TRANSLATABLE_INPUT_TYPES = Object.freeze(["button", "submit", "reset"]);

const HI_WORD_MAP = Object.freeze({
    "a": "à¤à¤•",
    "about": "à¤¬à¤¾à¤°à¥‡",
    "all": "à¤¸à¤­à¥€",
    "and": "à¤”à¤°",
    "are": "à¤¹à¥ˆà¤‚",
    "as": "à¤•à¥‡ à¤°à¥‚à¤ª à¤®à¥‡à¤‚",
    "at": "à¤ªà¤°",
    "baby": "à¤¬à¥‡à¤¬à¥€",
    "babies": "à¤¬à¥‡à¤¬à¥€",
    "back": "à¤µà¤¾à¤ªà¤¸",
    "best": "à¤¸à¤°à¥à¤µà¤¶à¥à¤°à¥‡à¤·à¥à¤ ",
    "blog": "à¤¬à¥à¤²à¥‰à¤—",
    "book": "à¤¬à¥à¤•",
    "brand": "à¤¬à¥à¤°à¤¾à¤‚à¤¡",
    "brands": "à¤¬à¥à¤°à¤¾à¤‚à¤¡à¥à¤¸",
    "by": "à¤¦à¥à¤µà¤¾à¤°à¤¾",
    "can": "à¤•à¤° à¤¸à¤•à¤¤à¥‡",
    "careers": "à¤•à¤°à¤¿à¤¯à¤°",
    "category": "à¤¶à¥à¤°à¥‡à¤£à¥€",
    "child": "à¤¬à¤šà¥à¤šà¤¾",
    "choose": "à¤šà¥à¤¨à¥‡à¤‚",
    "clear": "à¤¸à¤¾à¤«",
    "company": "à¤•à¤‚à¤ªà¤¨à¥€",
    "complete": "à¤ªà¥‚à¤°à¤¾",
    "contact": "à¤¸à¤‚à¤ªà¤°à¥à¤•",
    "creator": "à¤•à¥à¤°à¤¿à¤à¤Ÿà¤°",
    "creators": "à¤•à¥à¤°à¤¿à¤à¤Ÿà¤°à¥à¤¸",
    "decision": "à¤¨à¤¿à¤°à¥à¤£à¤¯",
    "designed": "à¤¡à¤¿à¤œà¤¼à¤¾à¤‡à¤¨",
    "details": "à¤µà¤¿à¤µà¤°à¤£",
    "domain": "à¤¡à¥‹à¤®à¥‡à¤¨",
    "download": "à¤¡à¤¾à¤‰à¤¨à¤²à¥‹à¤¡",
    "easy": "à¤†à¤¸à¤¾à¤¨",
    "explore": "à¤¦à¥‡à¤–à¥‡à¤‚",
    "famous": "à¤ªà¥à¤°à¤¸à¤¿à¤¦à¥à¤§",
    "family": "à¤ªà¤°à¤¿à¤µà¤¾à¤°",
    "fast": "à¤¤à¥‡à¤œà¤¼",
    "finder": "à¤–à¥‹à¤œà¤•",
    "for": "à¤•à¥‡ à¤²à¤¿à¤",
    "founders": "à¤«à¤¾à¤‰à¤‚à¤¡à¤°à¥à¤¸",
    "free": "à¤®à¥à¤«à¥à¤¤",
    "from": "à¤¸à¥‡",
    "gallery": "à¤—à¥ˆà¤²à¤°à¥€",
    "girl": "à¤²à¤¡à¤¼à¤•à¥€",
    "great": "à¤¬à¥‡à¤¹à¤¤à¤°à¥€à¤¨",
    "guide": "à¤—à¤¾à¤‡à¤¡",
    "has": "à¤¹à¥ˆ",
    "have": "à¤¹à¥ˆ",
    "help": "à¤®à¤¦à¤¦",
    "hi": "à¤¹à¤¾à¤¯",
    "hindi": "à¤¹à¤¿à¤‚à¤¦à¥€",
    "rashi": "\u0930\u093e\u0936\u093f",
    "nakshatra": "\u0928\u0915\u094d\u0937\u0924\u094d\u0930",
    "aries": "\u092e\u0947\u0937",
    "mesh": "\u092e\u0947\u0937",
    "mesha": "\u092e\u0947\u0937",
    "taurus": "\u0935\u0943\u0937\u092d",
    "vrishabh": "\u0935\u0943\u0937\u092d",
    "vrishabha": "\u0935\u0943\u0937\u092d",
    "gemini": "\u092e\u093f\u0925\u0941\u0928",
    "mithun": "\u092e\u093f\u0925\u0941\u0928",
    "mithuna": "\u092e\u093f\u0925\u0941\u0928",
    "cancer": "\u0915\u0930\u094d\u0915",
    "kark": "\u0915\u0930\u094d\u0915",
    "karka": "\u0915\u0930\u094d\u0915",
    "leo": "\u0938\u093f\u0902\u0939",
    "simha": "\u0938\u093f\u0902\u0939",
    "virgo": "\u0915\u0928\u094d\u092f\u093e",
    "kanya": "\u0915\u0928\u094d\u092f\u093e",
    "libra": "\u0924\u0941\u0932\u093e",
    "tula": "\u0924\u0941\u0932\u093e",
    "scorpio": "\u0935\u0943\u0936\u094d\u091a\u093f\u0915",
    "vrishchik": "\u0935\u0943\u0936\u094d\u091a\u093f\u0915",
    "vrishchika": "\u0935\u0943\u0936\u094d\u091a\u093f\u0915",
    "sagittarius": "\u0927\u0928\u0941",
    "dhanu": "\u0927\u0928\u0941",
    "capricorn": "\u092e\u0915\u0930",
    "makar": "\u092e\u0915\u0930",
    "makara": "\u092e\u0915\u0930",
    "aquarius": "\u0915\u0941\u092e\u094d\u092d",
    "kumbh": "\u0915\u0941\u092e\u094d\u092d",
    "kumbha": "\u0915\u0941\u092e\u094d\u092d",
    "pisces": "\u092e\u0940\u0928",
    "meen": "\u092e\u0940\u0928",
    "meena": "\u092e\u0940\u0928",
    "ashwini": "\u0905\u0936\u094d\u0935\u093f\u0928\u0940",
    "bharani": "\u092d\u0930\u0923\u0940",
    "krittika": "\u0915\u0943\u0924\u094d\u0924\u093f\u0915\u093e",
    "kritika": "\u0915\u0943\u0924\u094d\u0924\u093f\u0915\u093e",
    "rohini": "\u0930\u094b\u0939\u093f\u0923\u0940",
    "mrigashira": "\u092e\u0943\u0917\u0936\u0940\u0930\u094d\u0937",
    "mrigasira": "\u092e\u0943\u0917\u0936\u0940\u0930\u094d\u0937",
    "mrigshira": "\u092e\u0943\u0917\u0936\u0940\u0930\u094d\u0937",
    "ardra": "\u0906\u0930\u094d\u0926\u094d\u0930\u093e",
    "punarvasu": "\u092a\u0941\u0928\u0930\u094d\u0935\u0938\u0941",
    "pushya": "\u092a\u0941\u0937\u094d\u092f",
    "pushyami": "\u092a\u0941\u0937\u094d\u092f",
    "ashlesha": "\u0906\u0936\u094d\u0932\u0947\u0937\u093e",
    "magha": "\u092e\u0918\u093e",
    "purva": "\u092a\u0942\u0930\u094d\u0935",
    "uttara": "\u0909\u0924\u094d\u0924\u0930",
    "phalguni": "\u092b\u093e\u0932\u094d\u0917\u0941\u0928\u0940",
    "hasta": "\u0939\u0938\u094d\u0924",
    "chitra": "\u091a\u093f\u0924\u094d\u0930\u093e",
    "swati": "\u0938\u094d\u0935\u093e\u0924\u0940",
    "vishakha": "\u0935\u093f\u0936\u093e\u0916\u093e",
    "visakha": "\u0935\u093f\u0936\u093e\u0916\u093e",
    "anuradha": "\u0905\u0928\u0941\u0930\u093e\u0927\u093e",
    "jyeshtha": "\u091c\u094d\u092f\u0947\u0937\u094d\u0920\u093e",
    "jyestha": "\u091c\u094d\u092f\u0947\u0937\u094d\u0920\u093e",
    "mula": "\u092e\u0942\u0932",
    "moola": "\u092e\u0942\u0932",
    "ashadha": "\u0906\u0937\u093e\u0922\u093c\u093e",
    "shravana": "\u0936\u094d\u0930\u0935\u0923",
    "dhanishtha": "\u0927\u0928\u093f\u0937\u094d\u0920\u093e",
    "shatabhisha": "\u0936\u0924\u092d\u093f\u0937\u093e",
    "shatabhishak": "\u0936\u0924\u092d\u093f\u0937\u093e",
    "bhadrapada": "\u092d\u093e\u0926\u094d\u0930\u092a\u0926\u093e",
    "revati": "\u0930\u0947\u0935\u0924\u0940",
    "home": "à¤¹à¥‹à¤®",
    "how": "à¤•à¥ˆà¤¸à¥‡",
    "in": "à¤®à¥‡à¤‚",
    "inside": "à¤…à¤‚à¤¦à¤°",
    "institution": "à¤¸à¤‚à¤¸à¥à¤¥à¤¾à¤¨",
    "institutions": "à¤¸à¤‚à¤¸à¥à¤¥à¤¾à¤à¤‚",
    "is": "à¤¹à¥ˆ",
    "it": "à¤¯à¤¹",
    "its": "à¤‡à¤¸à¤•à¤¾",
    "language": "à¤­à¤¾à¤·à¤¾",
    "list": "à¤¸à¥‚à¤šà¥€",
    "log": "à¤²à¥‰à¤—",
    "login": "à¤²à¥‰à¤— à¤‡à¤¨",
    "motto": "à¤®à¥‹à¤Ÿà¥‹",
    "name": "à¤¨à¤¾à¤®",
    "naming": "à¤¨à¤¾à¤®à¤•à¤°à¤£",
    "naamin": "à¤¨à¤¾à¤®à¤¿à¤¨",
    "new": "à¤¨à¤¯à¤¾",
    "no": "à¤¨à¤¹à¥€à¤‚",
    "of": "à¤•à¤¾",
    "on": "à¤ªà¤°",
    "only": "à¤•à¥‡à¤µà¤²",
    "or": "à¤¯à¤¾",
    "our": "à¤¹à¤®à¤¾à¤°à¥‡",
    "page": "à¤ªà¥‡à¤œ",
    "parents": "à¤®à¤¾à¤¤à¤¾-à¤ªà¤¿à¤¤à¤¾",
    "pdf": "à¤ªà¥€à¤¡à¥€à¤à¤«",
    "popular": "à¤²à¥‹à¤•à¤ªà¥à¤°à¤¿à¤¯",
    "practical": "à¤µà¥à¤¯à¤¾à¤µà¤¹à¤¾à¤°à¤¿à¤•",
    "prepare": "à¤¤à¥ˆà¤¯à¤¾à¤°",
    "preview": "à¤ªà¥à¤°à¥€à¤µà¥à¤¯à¥‚",
    "pricing": "à¤ªà¥à¤°à¤¾à¤‡à¤¸à¤¿à¤‚à¤—",
    "products": "à¤‰à¤¤à¥à¤ªà¤¾à¤¦",
    "pronunciation": "à¤‰à¤šà¥à¤šà¤¾à¤°à¤£",
    "quick": "à¤¤à¥à¤µà¤°à¤¿à¤¤",
    "ready": "à¤¤à¥ˆà¤¯à¤¾à¤°",
    "receive": "à¤ªà¥à¤°à¤¾à¤ªà¥à¤¤",
    "report": "à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ",
    "request": "à¤…à¤¨à¥à¤°à¥‹à¤§",
    "result": "à¤ªà¤°à¤¿à¤£à¤¾à¤®",
    "search": "à¤–à¥‹à¤œ",
    "section": "à¤¸à¥‡à¤•à¥à¤¶à¤¨",
    "service": "à¤¸à¥‡à¤µà¤¾",
    "services": "à¤¸à¥‡à¤µà¤¾à¤à¤‚",
    "share": "à¤¶à¥‡à¤¯à¤°",
    "shortlist": "à¤¶à¥‰à¤°à¥à¤Ÿà¤²à¤¿à¤¸à¥à¤Ÿ",
    "show": "à¤¦à¤¿à¤–à¤¾à¤à¤‚",
    "signup": "à¤¸à¤¾à¤‡à¤¨ à¤…à¤ª",
    "start": "à¤¶à¥à¤°à¥‚",
    "startup": "à¤¸à¥à¤Ÿà¤¾à¤°à¥à¤Ÿà¤…à¤ª",
    "stories": "à¤•à¤¹à¤¾à¤¨à¤¿à¤¯à¤¾à¤‚",
    "support": "à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾",
    "that": "à¤µà¤¹",
    "the": "à¤¯à¤¹",
    "their": "à¤‰à¤¨à¤•à¤¾",
    "this": "à¤¯à¤¹",
    "to": "à¤•à¥‹",
    "today": "à¤†à¤œ",
    "translate": "à¤…à¤¨à¥à¤µà¤¾à¤¦",
    "trusted": "à¤µà¤¿à¤¶à¥à¤µà¤¸à¤¨à¥€à¤¯",
    "unique": "à¤…à¤¦à¥à¤µà¤¿à¤¤à¥€à¤¯",
    "up": "à¤Šà¤ªà¤°",
    "us": "à¤¹à¤®à¤¸à¥‡",
    "use": "à¤‰à¤ªà¤¯à¥‹à¤—",
    "video": "à¤µà¥€à¤¡à¤¿à¤¯à¥‹",
    "view": "à¤¦à¥‡à¤–à¥‡à¤‚",
    "what": "à¤•à¥à¤¯à¤¾",
    "why": "à¤•à¥à¤¯à¥‹à¤‚",
    "with": "à¤•à¥‡ à¤¸à¤¾à¤¥",
    "work": "à¤•à¤¾à¤®",
    "works": "à¤•à¤¾à¤® à¤•à¤°à¤¤à¤¾",
    "you": "à¤†à¤ª",
    "your": "à¤†à¤ªà¤•à¤¾",
    "zodiac": "à¤°à¤¾à¤¶à¤¿"
});

function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function transliterateEnglishWord(word) {
    const map = {
        a: "à¤…", b: "à¤¬", c: "à¤•", d: "à¤¦", e: "à¤", f: "à¤«", g: "à¤—", h: "à¤¹",
        i: "à¤‡", j: "à¤œ", k: "à¤•", l: "à¤²", m: "à¤®", n: "à¤¨", o: "à¤“", p: "à¤ª",
        q: "à¤•", r: "à¤°", s: "à¤¸", t: "à¤Ÿ", u: "à¤‰", v: "à¤µ", w: "à¤µ", x: "à¤•à¥à¤¸",
        y: "à¤¯", z: "à¤œ"
    };
    return decodeHindiMojibake(word
        .toLowerCase()
        .split("")
        .map((ch) => map[ch] || ch)
        .join(""));
}

function translateWordsToHindi(text) {
    const tokens = String(text).match(/[A-Za-z']+|[^A-Za-z']+/g) || [String(text)];
    return tokens.map((token) => {
        if (!/^[A-Za-z']+$/.test(token)) return token;
        const lower = token.toLowerCase();
        if (HI_WORD_MAP[lower]) return decodeHindiMojibake(HI_WORD_MAP[lower]);
        // Avoid low-quality phonetic transliteration for unknown words.
        // Keeping the original token is safer than producing broken copy.
        return token;
    }).join("");
}

function fallbackHindiCopy(englishText) {
    if (!englishText) return "";
    const clean = String(englishText).replace(/\s+/g, " ").trim();
    if (!clean) return "";

    if (HI_FALLBACK_MAP[clean]) return decodeHindiMojibake(HI_FALLBACK_MAP[clean]);

    let translated = clean;
    HI_FALLBACK_REPLACEMENTS.forEach(([from, to]) => {
        translated = translated.replace(new RegExp(escapeRegExp(from), "gi"), to);
    });

    if (translated === clean && /[A-Za-z]/.test(clean)) {
        // Conservative mode: only translate words that have known dictionary mappings.
        // If nothing mapped, keep original text to prevent gibberish output.
        const mappedOnly = translateWordsToHindi(clean);
        const hasLatinLeft = /[A-Za-z]/.test(mappedOnly);
        if (mappedOnly !== clean && !hasLatinLeft) {
            translated = mappedOnly;
        }
    }

    return decodeHindiMojibake(translated);
}

function sanitizeFileToken(value) {
    return String(value || "name")
        .replace(/[^\w-]+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "") || "name";
}

async function isLoggedInForReportDownload() {
    try {
        const authClient = window.__naaminSupabaseClient;
        if (!authClient || !authClient.auth || typeof authClient.auth.getSession !== "function") {
            return false;
        }
        const result = await authClient.auth.getSession();
        const hasSession = Boolean(result && result.data && result.data.session && result.data.session.user);
        try {
            localStorage.setItem("naamin-authenticated", hasSession ? "true" : "false");
        } catch (_storageSyncError) {
            // Ignore storage sync edge cases.
        }
        return hasSession;
    } catch (_sessionError) {
        try {
            localStorage.setItem("naamin-authenticated", "false");
        } catch (_storageResetError) {
            // Ignore storage sync edge cases.
        }
        return false;
    }
}

function triggerBlobDownload(blob, filename) {
    if (!blob) return false;

    if (window.navigator && typeof window.navigator.msSaveOrOpenBlob === "function") {
        window.navigator.msSaveOrOpenBlob(blob, filename);
        return true;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.setAttribute("download", filename);
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1400);
    return true;
}

async function downloadCanvasAsPng(canvas, filename) {
    if (!canvas) return false;
    const pngFilename = `${filename}.png`;

    if (typeof canvas.toBlob === "function") {
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 1));
        if (blob) return triggerBlobDownload(blob, pngFilename);
    }

    const dataUrl = canvas.toDataURL("image/png", 1.0);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = pngFilename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
}

function formatReportDobForPdf(value) {
    const raw = String(value || "").trim();
    if (!raw) return "Not provided";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

    const parsed = new Date(`${raw}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return raw;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${day} ${months[parsed.getMonth()]} ${parsed.getFullYear()}`;
}

function createExportReportNode(data) {
    const reportNameEn = data.name_en || data.name || "Name";
    const reportNameHi = resolveHindiName(data.name_hi, reportNameEn);
    const reportMeaning = data.meaning_en || data.meaning || "Meaning not available";
    const reportDob = formatReportDobForPdf(data.dob_display || data.dob_iso || data.dob || data.date_of_birth);
    const reportGender = data.gender || "Unknown";
    const reportOrigin = data.origin_en || data.origin || "Sanskrit/Indian";
    const reportNakshatra = data.nakshatra || "Ashwini";
    const reportRashi = data.rashi_en || data.rashi || "Aries (Mesha)";
    const reportNumber = data.num || "1";
    const reportPlanet = data.planet_en || "Sun";
    const reportColor = data.color_en || "Golden";
    const reportPrediction = data.rashiphal_en || "A steady year of growth, discipline, and good opportunities.";
    const reportAura = data.phal_en || "Energetic and optimistic personality.";
    const reportYear = String(data.year || new Date().getFullYear());

    const root = document.createElement("section");
    root.style.width = "1400px";
    root.style.minHeight = "910px";
    root.style.boxSizing = "border-box";
    root.style.padding = "34px";
    root.style.borderRadius = "28px";
    root.style.border = "2px solid rgba(91, 59, 214, 0.28)";
    root.style.background = "linear-gradient(135deg, #f8f2ff 0%, #f3f7ff 55%, #ffffff 100%)";
    root.style.boxShadow = "0 16px 36px rgba(40, 26, 82, 0.18)";
    root.style.display = "flex";
    root.style.flexDirection = "column";
    root.style.gap = "20px";
    root.style.fontFamily = "'Poppins','Inter',sans-serif";
    root.style.color = "#1f1b2e";

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.paddingBottom = "14px";
    header.style.borderBottom = "1.5px solid rgba(108, 43, 217, 0.2)";

    const brandWrap = document.createElement("div");
    const brand = document.createElement("div");
    brand.textContent = "NAAMIN";
    brand.style.fontSize = "42px";
    brand.style.fontWeight = "800";
    brand.style.letterSpacing = "4px";
    brand.style.color = "#6C2BD9";
    const subtitle = document.createElement("div");
    subtitle.textContent = "PREMIUM NAME REPORT";
    subtitle.style.fontSize = "14px";
    subtitle.style.fontWeight = "700";
    subtitle.style.letterSpacing = "2.3px";
    subtitle.style.color = "#5b4a80";
    brandWrap.appendChild(brand);
    brandWrap.appendChild(subtitle);

    const badge = document.createElement("div");
    badge.textContent = "Verified Naming Insight";
    badge.style.padding = "10px 16px";
    badge.style.borderRadius = "999px";
    badge.style.fontSize = "14px";
    badge.style.fontWeight = "700";
    badge.style.background = "linear-gradient(135deg, #ffd77a, #f9bb4d)";
    badge.style.color = "#4d2b00";
    badge.style.border = "1px solid rgba(212, 145, 27, 0.42)";
    header.appendChild(brandWrap);
    header.appendChild(badge);

    const hero = document.createElement("div");
    hero.style.background = "linear-gradient(145deg, #f3e9ff, #eaf2ff)";
    hero.style.border = "1px solid rgba(108, 43, 217, 0.22)";
    hero.style.borderRadius = "22px";
    hero.style.padding = "26px 28px";
    hero.style.display = "grid";
    hero.style.gridTemplateColumns = "1.2fr 0.8fr";
    hero.style.gap = "16px";

    const nameBlock = document.createElement("div");
    const nEn = document.createElement("h1");
    nEn.textContent = reportNameEn;
    nEn.style.margin = "0";
    nEn.style.fontSize = "64px";
    nEn.style.fontWeight = "800";
    nEn.style.lineHeight = "1.03";
    nEn.style.color = "#241638";
    const nHi = document.createElement("div");
    nHi.textContent = reportNameHi;
    nHi.style.marginTop = "6px";
    nHi.style.fontSize = "36px";
    nHi.style.fontWeight = "700";
    nHi.style.color = "#6C2BD9";
    nHi.style.fontFamily = "'Noto Sans Devanagari','Poppins','Inter',sans-serif";
    const meaning = document.createElement("p");
    meaning.textContent = reportMeaning;
    meaning.style.margin = "12px 0 0 0";
    meaning.style.fontSize = "20px";
    meaning.style.lineHeight = "1.45";
    meaning.style.color = "#4d4463";
    nameBlock.appendChild(nEn);
    nameBlock.appendChild(nHi);
    nameBlock.appendChild(meaning);

    const snapshot = document.createElement("div");
    snapshot.style.display = "grid";
    snapshot.style.gridTemplateColumns = "1fr 1fr";
    snapshot.style.gap = "12px";

    const makeMetric = (label, value) => {
        const cell = document.createElement("div");
        cell.style.background = "#ffffff";
        cell.style.border = "1px solid rgba(108,43,217,0.2)";
        cell.style.borderRadius = "12px";
        cell.style.padding = "12px";

        const l = document.createElement("div");
        l.textContent = label;
        l.style.fontSize = "12px";
        l.style.fontWeight = "700";
        l.style.textTransform = "uppercase";
        l.style.letterSpacing = "1.1px";
        l.style.color = "#7255b6";

        const v = document.createElement("div");
        v.textContent = value;
        v.style.marginTop = "4px";
        v.style.fontSize = "16px";
        v.style.fontWeight = "700";
        v.style.color = "#1f1b2e";
        cell.appendChild(l);
        cell.appendChild(v);
        return cell;
    };

    snapshot.appendChild(makeMetric("Name", reportNameEn));
    snapshot.appendChild(makeMetric("Date of Birth", reportDob));
    snapshot.appendChild(makeMetric("Gender", reportGender));
    snapshot.appendChild(makeMetric("Origin", reportOrigin));
    snapshot.appendChild(makeMetric("Nakshatra", reportNakshatra));
    snapshot.appendChild(makeMetric("Rashi", reportRashi));

    hero.appendChild(nameBlock);
    hero.appendChild(snapshot);

    const detailsGrid = document.createElement("div");
    detailsGrid.style.display = "grid";
    detailsGrid.style.gridTemplateColumns = "repeat(3, minmax(0, 1fr))";
    detailsGrid.style.gap = "14px";

    const makeCard = (title, content) => {
        const card = document.createElement("div");
        card.style.background = "rgba(255,255,255,0.92)";
        card.style.border = "1px solid rgba(108,43,217,0.18)";
        card.style.borderRadius = "14px";
        card.style.padding = "16px";
        card.style.minHeight = "114px";

        const h = document.createElement("div");
        h.textContent = title;
        h.style.fontSize = "13px";
        h.style.fontWeight = "700";
        h.style.textTransform = "uppercase";
        h.style.letterSpacing = "1px";
        h.style.color = "#6C2BD9";
        h.style.marginBottom = "8px";

        const p = document.createElement("div");
        p.textContent = content;
        p.style.fontSize = "18px";
        p.style.fontWeight = "600";
        p.style.lineHeight = "1.4";
        p.style.color = "#2e2740";
        card.appendChild(h);
        card.appendChild(p);
        return card;
    };

    detailsGrid.appendChild(makeCard("Numerology Number", String(reportNumber)));
    detailsGrid.appendChild(makeCard("Planet", reportPlanet));
    detailsGrid.appendChild(makeCard("Lucky Color", reportColor));
    detailsGrid.appendChild(makeCard("Core Aura", reportAura));
    detailsGrid.appendChild(makeCard(`${reportYear} Prediction`, reportPrediction));
    detailsGrid.appendChild(makeCard("Prepared For", reportNameEn));
    detailsGrid.appendChild(makeCard("Date of Birth", reportDob));

    const footer = document.createElement("div");
    footer.style.marginTop = "auto";
    footer.style.display = "flex";
    footer.style.justifyContent = "space-between";
    footer.style.alignItems = "center";
    footer.style.paddingTop = "12px";
    footer.style.borderTop = "1.5px solid rgba(108, 43, 217, 0.2)";

    const quote = document.createElement("div");
    quote.textContent = "\"A strong name carries identity, memory, and momentum.\"";
    quote.style.fontSize = "18px";
    quote.style.fontStyle = "italic";
    quote.style.color = "#4e4663";

    const site = document.createElement("div");
    site.textContent = "www.naamin.com";
    site.style.fontSize = "15px";
    site.style.fontWeight = "700";
    site.style.letterSpacing = "1.3px";
    site.style.color = "#6C2BD9";
    site.style.textTransform = "uppercase";

    footer.appendChild(quote);
    footer.appendChild(site);

    root.appendChild(header);
    root.appendChild(hero);
    root.appendChild(detailsGrid);
    root.appendChild(footer);

    return root;
}

function createReportCanvas(data) {
    const REPORT_CANVAS_THEME_KEYS = Object.freeze([
        "design-1",
        "design-2",
        "design-3",
        "design-4",
        "design-5",
        "design-6",
        "design-7",
        "design-8",
        "design-9",
        "design-10"
    ]);

    const normalizeReportDesignToken = (value) => {
        const raw = String(value || "").trim().toLowerCase();
        return REPORT_CANVAS_THEME_KEYS.includes(raw) ? raw : "design-1";
    };

    const getReportCanvasTheme = (designToken) => {
        const key = normalizeReportDesignToken(designToken);
        const themes = {
            "design-1": {
                bgTop: "#09142d", bgMid: "#132a55", bgBottom: "#0a1022",
                paper: "rgba(249,252,255,0.98)", ink: "#1a2648", softInk: "#344a78",
                accentBlue: "#2f77d8", accentTeal: "#34a7b8", accentCoral: "#ef7a5d", accentPurple: "#7357d8",
                line: "rgba(45,87,160,0.25)", gridLine: "#8fb6ff",
                glowA: "#2f8fb3", glowB: "#7e5be0", glowC: "#ef7a5d",
                shellOuter: "rgba(11,22,48,0.28)", shellStroke: "rgba(158,198,255,0.38)",
                mastA: "#0f214d", mastB: "#213d78", mastC: "#462f7f",
                shardA: "#41bfd7", shardB: "#93e2b9",
                brandChipBg: "rgba(255,255,255,0.13)", brandChipStroke: "rgba(161,216,255,0.5)", brandText: "#d9eeff",
                editionChipBg: "rgba(255,255,255,0.14)", editionChipStroke: "rgba(255,188,165,0.6)", editionText: "#ffe3d4",
                subtitle: "#9cc7ff", nameEn: "#f5f8ff", nameHi: "#d6d9ff", meaning: "#f7d7d2",
                dobLabel: "#9dd0ff", dobValue: "#f6fbff", profileLabel: "#ffbca9", profileValue: "#fff9f5",
                footerPanel: "rgba(16,30,64,0.94)", footerPanelStroke: "rgba(120,168,240,0.45)", quote: "#e6efff",
                siteChipBg: "rgba(255,255,255,0.11)", siteChipStroke: "rgba(181,206,255,0.42)", siteText: "#d4e7ff",
                signChipBg: "rgba(255,255,255,0.11)", signChipStroke: "rgba(128,198,253,0.40)", signText: "#cde7ff"
            },
            "design-2": {
                bgTop: "#3a2446", bgMid: "#5e3f73", bgBottom: "#6c4f6c",
                paper: "rgba(255,251,252,0.98)", ink: "#3a2140", softInk: "#6e4f74",
                accentBlue: "#b579da", accentTeal: "#8ac5b3", accentCoral: "#f39aa6", accentPurple: "#8f6ad9",
                line: "rgba(161,110,179,0.28)", gridLine: "#d5b7e8",
                glowA: "#ffb4d2", glowB: "#c7a7ff", glowC: "#ffd3a8",
                shellOuter: "rgba(73,45,87,0.30)", shellStroke: "rgba(226,189,240,0.45)",
                mastA: "#5b356f", mastB: "#83518e", mastC: "#a36a8f",
                shardA: "#ffd7ea", shardB: "#bff1e4",
                brandChipBg: "rgba(255,255,255,0.2)", brandChipStroke: "rgba(255,223,244,0.62)", brandText: "#fff1fb",
                editionChipBg: "rgba(255,255,255,0.2)", editionChipStroke: "rgba(255,206,223,0.72)", editionText: "#ffe9f4",
                subtitle: "#ffd8f2", nameEn: "#fff5fd", nameHi: "#ffe7fb", meaning: "#ffe1ef",
                dobLabel: "#f7d6ff", dobValue: "#fff5ff", profileLabel: "#ffd2e3", profileValue: "#fff8fb",
                footerPanel: "rgba(77,44,88,0.95)", footerPanelStroke: "rgba(233,191,243,0.5)", quote: "#fff0fb",
                siteChipBg: "rgba(255,255,255,0.18)", siteChipStroke: "rgba(244,216,255,0.55)", siteText: "#fcefff",
                signChipBg: "rgba(255,255,255,0.16)", signChipStroke: "rgba(245,205,255,0.5)", signText: "#f6e8ff"
            },
            "design-3": {
                bgTop: "#07243f", bgMid: "#0f4c7f", bgBottom: "#0c6ea1",
                paper: "rgba(247,252,255,0.98)", ink: "#12355d", softInk: "#2f628f",
                accentBlue: "#2f8fe4", accentTeal: "#32b8c3", accentCoral: "#4fb7f7", accentPurple: "#5f7de3",
                line: "rgba(69,141,208,0.24)", gridLine: "#9fd2ff",
                glowA: "#36b4e8", glowB: "#5f9eff", glowC: "#7dd8ff",
                shellOuter: "rgba(6,37,65,0.28)", shellStroke: "rgba(151,214,255,0.46)",
                mastA: "#0c3d67", mastB: "#136391", mastC: "#2982ae",
                shardA: "#6fd8ff", shardB: "#9fefff",
                brandChipBg: "rgba(255,255,255,0.14)", brandChipStroke: "rgba(179,231,255,0.62)", brandText: "#e7f8ff",
                editionChipBg: "rgba(255,255,255,0.14)", editionChipStroke: "rgba(175,223,255,0.58)", editionText: "#e6f7ff",
                subtitle: "#b9e4ff", nameEn: "#eff9ff", nameHi: "#ddf2ff", meaning: "#d8f0ff",
                dobLabel: "#bfe7ff", dobValue: "#f6fcff", profileLabel: "#b9edff", profileValue: "#f7fdff",
                footerPanel: "rgba(8,46,78,0.94)", footerPanelStroke: "rgba(132,210,255,0.5)", quote: "#e8f8ff",
                siteChipBg: "rgba(255,255,255,0.12)", siteChipStroke: "rgba(180,231,255,0.52)", siteText: "#e1f5ff",
                signChipBg: "rgba(255,255,255,0.12)", signChipStroke: "rgba(161,224,255,0.52)", signText: "#ddf3ff"
            },
            "design-4": {
                bgTop: "#2b2018", bgMid: "#4a3523", bgBottom: "#6b4a2c",
                paper: "rgba(252,247,239,0.98)", ink: "#3e2a1d", softInk: "#70533a",
                accentBlue: "#ad7e4f", accentTeal: "#8b8a4e", accentCoral: "#c6784d", accentPurple: "#8b644f",
                line: "rgba(150,110,70,0.25)", gridLine: "#c9a47d",
                glowA: "#c48a58", glowB: "#9f744f", glowC: "#df9f5f",
                shellOuter: "rgba(46,33,23,0.30)", shellStroke: "rgba(224,188,149,0.44)",
                mastA: "#4f3623", mastB: "#6d492f", mastC: "#8a5d37",
                shardA: "#d8a56f", shardB: "#eac48f",
                brandChipBg: "rgba(255,255,255,0.12)", brandChipStroke: "rgba(231,202,166,0.58)", brandText: "#f8ecd7",
                editionChipBg: "rgba(255,255,255,0.12)", editionChipStroke: "rgba(239,195,153,0.56)", editionText: "#fde4c2",
                subtitle: "#e8c99a", nameEn: "#fff3dc", nameHi: "#f7dfc1", meaning: "#f1d3b2",
                dobLabel: "#f0d3a5", dobValue: "#fff4e4", profileLabel: "#f2c08b", profileValue: "#fff7ed",
                footerPanel: "rgba(53,35,22,0.95)", footerPanelStroke: "rgba(224,178,127,0.45)", quote: "#f7e6cf",
                siteChipBg: "rgba(255,255,255,0.1)", siteChipStroke: "rgba(228,196,158,0.44)", siteText: "#f5e4cb",
                signChipBg: "rgba(255,255,255,0.1)", signChipStroke: "rgba(215,177,134,0.44)", signText: "#f4dfc1"
            },
            "design-5": {
                bgTop: "#111111", bgMid: "#2b2b2b", bgBottom: "#474747",
                paper: "rgba(250,250,250,0.98)", ink: "#1e1e1e", softInk: "#444",
                accentBlue: "#666", accentTeal: "#777", accentCoral: "#5c5c5c", accentPurple: "#707070",
                line: "rgba(120,120,120,0.28)", gridLine: "#9e9e9e",
                glowA: "#7f7f7f", glowB: "#5f5f5f", glowC: "#9b9b9b",
                shellOuter: "rgba(20,20,20,0.32)", shellStroke: "rgba(180,180,180,0.45)",
                mastA: "#2a2a2a", mastB: "#404040", mastC: "#585858",
                shardA: "#8e8e8e", shardB: "#b3b3b3",
                brandChipBg: "rgba(255,255,255,0.12)", brandChipStroke: "rgba(201,201,201,0.52)", brandText: "#f5f5f5",
                editionChipBg: "rgba(255,255,255,0.12)", editionChipStroke: "rgba(186,186,186,0.52)", editionText: "#efefef",
                subtitle: "#d0d0d0", nameEn: "#f4f4f4", nameHi: "#e6e6e6", meaning: "#d8d8d8",
                dobLabel: "#d2d2d2", dobValue: "#fafafa", profileLabel: "#d5d5d5", profileValue: "#ffffff",
                footerPanel: "rgba(28,28,28,0.95)", footerPanelStroke: "rgba(170,170,170,0.44)", quote: "#efefef",
                siteChipBg: "rgba(255,255,255,0.1)", siteChipStroke: "rgba(192,192,192,0.44)", siteText: "#ececec",
                signChipBg: "rgba(255,255,255,0.1)", signChipStroke: "rgba(182,182,182,0.44)", signText: "#ebebeb"
            },
            "design-6": {
                bgTop: "#2c1236", bgMid: "#8a2f45", bgBottom: "#d0613f",
                paper: "rgba(255,248,244,0.98)", ink: "#431f2b", softInk: "#7d3e47",
                accentBlue: "#d75e4d", accentTeal: "#c97d3f", accentCoral: "#ff8f5b", accentPurple: "#a84770",
                line: "rgba(182,86,77,0.25)", gridLine: "#f3b48e",
                glowA: "#ff8b63", glowB: "#ff6f8e", glowC: "#ffb66b",
                shellOuter: "rgba(63,25,36,0.30)", shellStroke: "rgba(247,181,150,0.46)",
                mastA: "#5a2039", mastB: "#9b3a47", mastC: "#d05a44",
                shardA: "#ffac70", shardB: "#ffd188",
                brandChipBg: "rgba(255,255,255,0.14)", brandChipStroke: "rgba(255,212,181,0.58)", brandText: "#fff2e7",
                editionChipBg: "rgba(255,255,255,0.14)", editionChipStroke: "rgba(255,192,171,0.58)", editionText: "#ffece4",
                subtitle: "#ffd1bf", nameEn: "#fff5ed", nameHi: "#ffe8da", meaning: "#ffd9ca",
                dobLabel: "#ffd9c6", dobValue: "#fff8f4", profileLabel: "#ffc8ad", profileValue: "#fff6f1",
                footerPanel: "rgba(69,27,34,0.95)", footerPanelStroke: "rgba(245,168,139,0.48)", quote: "#ffe9df",
                siteChipBg: "rgba(255,255,255,0.12)", siteChipStroke: "rgba(255,211,192,0.5)", siteText: "#fff0e6",
                signChipBg: "rgba(255,255,255,0.12)", signChipStroke: "rgba(255,198,175,0.5)", signText: "#ffeadf"
            },
            "design-7": {
                bgTop: "#082820", bgMid: "#0f5643", bgBottom: "#1f7a5d",
                paper: "rgba(244,252,248,0.98)", ink: "#133b2f", softInk: "#2f6553",
                accentBlue: "#2f8f6a", accentTeal: "#38a584", accentCoral: "#3d9f73", accentPurple: "#2e7758",
                line: "rgba(52,123,93,0.25)", gridLine: "#9fd7bd",
                glowA: "#2fb387", glowB: "#43a07a", glowC: "#6acaa1",
                shellOuter: "rgba(8,40,31,0.30)", shellStroke: "rgba(150,219,191,0.44)",
                mastA: "#0f4738", mastB: "#1e6853", mastC: "#2f8f70",
                shardA: "#70d7b2", shardB: "#a6efcf",
                brandChipBg: "rgba(255,255,255,0.14)", brandChipStroke: "rgba(193,243,222,0.56)", brandText: "#e8fff4",
                editionChipBg: "rgba(255,255,255,0.14)", editionChipStroke: "rgba(174,236,209,0.56)", editionText: "#e3fff1",
                subtitle: "#bcebd6", nameEn: "#effef7", nameHi: "#dcf8ec", meaning: "#cff1e2",
                dobLabel: "#c8f0de", dobValue: "#f4fff9", profileLabel: "#b6e9d3", profileValue: "#f4fff9",
                footerPanel: "rgba(10,51,39,0.95)", footerPanelStroke: "rgba(136,214,181,0.45)", quote: "#e2faef",
                siteChipBg: "rgba(255,255,255,0.12)", siteChipStroke: "rgba(181,238,212,0.45)", siteText: "#defff0",
                signChipBg: "rgba(255,255,255,0.12)", signChipStroke: "rgba(161,226,197,0.45)", signText: "#d6fae9"
            },
            "design-8": {
                bgTop: "#251b45", bgMid: "#4f3a8f", bgBottom: "#7f5ec2",
                paper: "rgba(249,247,255,0.98)", ink: "#312456", softInk: "#5a4a85",
                accentBlue: "#6b7fe6", accentTeal: "#7f9be7", accentCoral: "#b686e5", accentPurple: "#8f6bd8",
                line: "rgba(111,102,188,0.25)", gridLine: "#c6bdf4",
                glowA: "#8ea0ff", glowB: "#bf97f3", glowC: "#b9c5ff",
                shellOuter: "rgba(37,28,67,0.30)", shellStroke: "rgba(200,188,245,0.46)",
                mastA: "#3b2f6d", mastB: "#5d4b9a", mastC: "#8768c1",
                shardA: "#b9c2ff", shardB: "#e0d1ff",
                brandChipBg: "rgba(255,255,255,0.14)", brandChipStroke: "rgba(210,207,255,0.56)", brandText: "#f0eeff",
                editionChipBg: "rgba(255,255,255,0.14)", editionChipStroke: "rgba(223,199,255,0.56)", editionText: "#f6edff",
                subtitle: "#d4ccff", nameEn: "#f5f3ff", nameHi: "#ebe8ff", meaning: "#e5dcff",
                dobLabel: "#dbd3ff", dobValue: "#faf9ff", profileLabel: "#e6cdff", profileValue: "#fdf8ff",
                footerPanel: "rgba(40,31,75,0.95)", footerPanelStroke: "rgba(187,173,242,0.48)", quote: "#eeeaff",
                siteChipBg: "rgba(255,255,255,0.12)", siteChipStroke: "rgba(211,202,255,0.48)", siteText: "#f0ecff",
                signChipBg: "rgba(255,255,255,0.12)", signChipStroke: "rgba(197,188,246,0.48)", signText: "#ede9ff"
            },
            "design-9": {
                bgTop: "#21335e", bgMid: "#4a5fa2", bgBottom: "#f092af",
                paper: "rgba(255,251,252,0.98)", ink: "#2f2c62", softInk: "#5a4f8a",
                accentBlue: "#7a91ee", accentTeal: "#67b6df", accentCoral: "#f08cae", accentPurple: "#8f74e8",
                line: "rgba(120,119,202,0.24)", gridLine: "#d6c9f7",
                glowA: "#95a4ff", glowB: "#f3a0c3", glowC: "#86d7ff",
                shellOuter: "rgba(34,43,84,0.29)", shellStroke: "rgba(219,196,249,0.46)",
                mastA: "#364f8b", mastB: "#5a6db2", mastC: "#c5749f",
                shardA: "#f6c3d8", shardB: "#c7f0ff",
                brandChipBg: "rgba(255,255,255,0.16)", brandChipStroke: "rgba(220,211,255,0.58)", brandText: "#f6f0ff",
                editionChipBg: "rgba(255,255,255,0.16)", editionChipStroke: "rgba(255,206,227,0.58)", editionText: "#fff0f8",
                subtitle: "#e2d4ff", nameEn: "#fff6ff", nameHi: "#f8ecff", meaning: "#f9dbea",
                dobLabel: "#e0ddff", dobValue: "#fff8ff", profileLabel: "#ffd3e5", profileValue: "#fff6fb",
                footerPanel: "rgba(39,47,88,0.95)", footerPanelStroke: "rgba(215,184,244,0.48)", quote: "#f6ecff",
                siteChipBg: "rgba(255,255,255,0.13)", siteChipStroke: "rgba(225,206,255,0.5)", siteText: "#f8efff",
                signChipBg: "rgba(255,255,255,0.13)", signChipStroke: "rgba(212,197,247,0.5)", signText: "#f2ecff"
            },
            "design-10": {
                bgTop: "#040913", bgMid: "#0a1b3a", bgBottom: "#111133",
                paper: "rgba(244,248,255,0.98)", ink: "#111f3f", softInk: "#2f3f71",
                accentBlue: "#3e7df2", accentTeal: "#4eb2cf", accentCoral: "#5f8bff", accentPurple: "#745deb",
                line: "rgba(83,108,191,0.26)", gridLine: "#9cb4ff",
                glowA: "#2d6fff", glowB: "#624fff", glowC: "#47a8ff",
                shellOuter: "rgba(5,13,33,0.32)", shellStroke: "rgba(157,183,255,0.45)",
                mastA: "#111f46", mastB: "#1c3574", mastC: "#2a2f78",
                shardA: "#5eb2ff", shardB: "#9bd6ff",
                brandChipBg: "rgba(255,255,255,0.12)", brandChipStroke: "rgba(168,191,255,0.52)", brandText: "#e8f0ff",
                editionChipBg: "rgba(255,255,255,0.12)", editionChipStroke: "rgba(151,183,255,0.52)", editionText: "#e3edff",
                subtitle: "#a9c2ff", nameEn: "#eef3ff", nameHi: "#dde6ff", meaning: "#d1deff",
                dobLabel: "#b6ccff", dobValue: "#f4f8ff", profileLabel: "#b8c8ff", profileValue: "#f6f9ff",
                footerPanel: "rgba(8,19,45,0.95)", footerPanelStroke: "rgba(133,164,255,0.45)", quote: "#e4eeff",
                siteChipBg: "rgba(255,255,255,0.1)", siteChipStroke: "rgba(164,190,255,0.44)", siteText: "#e0ebff",
                signChipBg: "rgba(255,255,255,0.1)", signChipStroke: "rgba(150,180,255,0.44)", signText: "#dbe8ff"
            }
        };
        return themes[key] || themes["design-1"];
    };

    const reportDesign = normalizeReportDesignToken(data.report_design || data.design || "design-1");
    window.normalizeReportDesignToken = normalizeReportDesignToken;

    const reportNameEn = data.name_en || data.name || "Name";
    const reportNameHi = resolveHindiName(data.name_hi, reportNameEn);
    const reportMeaning = data.meaning_en || data.meaning || "A meaningful and elegant name.";
    const reportDob = formatReportDobForPdf(data.dob_display || data.dob_iso || data.dob || data.date_of_birth);
    const reportGender = data.gender || "Unknown";
    const portraitGender = String(data.portrait_gender || "").toLowerCase() === "girl" ? "girl" : "boy";
    const portraitImage = data.portrait_image || null;
    const reportOrigin = data.origin_en || data.origin || "Sanskrit/Indian";
    const reportNakshatra = data.nakshatra || "Ashwini";
    const reportRashi = data.rashi_en || data.rashi || "Aries (Mesha)";
    const reportNumber = String(data.num || "1");
    const reportPlanet = data.planet_en || "Sun";
    const reportColor = data.color_en || "Golden";
    const reportPrediction = data.rashiphal_en || "A steady year of growth, discipline, and new opportunities.";
    const reportAura = data.phal_en || "Energetic and optimistic personality.";
    const reportYear = String(data.year || new Date().getFullYear());
    const primaryNakshatra = String(reportNakshatra).split(",")[0].trim() || "Ashwini";
    const primaryRashi = String(reportRashi).split("(")[0].trim() || "Aries";
    const cleanedMeaning = String(reportMeaning).replace(/\s+/g, " ").trim();
    const cleanedAura = String(reportAura).replace(/\s+/g, " ").trim();
    const cleanedPrediction = String(reportPrediction).replace(/\s+/g, " ").trim();

    const canvas = document.createElement("canvas");
    canvas.width = 1240;
    canvas.height = 2080;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");

    const palette = getReportCanvasTheme(reportDesign);

    const drawRoundRect = (x, y, w, h, r = 16) => {
        const radius = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    };

    const wrapLines = (text, maxWidth) => {
        const words = String(text || "").split(/\s+/).filter(Boolean);
        if (!words.length) return [""];
        const lines = [];
        let current = "";
        words.forEach((word) => {
            const test = current ? `${current} ${word}` : word;
            if (ctx.measureText(test).width <= maxWidth) {
                current = test;
            } else {
                if (current) lines.push(current);
                current = word;
            }
        });
        if (current) lines.push(current);
        return lines.length ? lines : [String(text || "")];
    };

    const clampLines = (lines, maxLines, maxWidth) => {
        if (lines.length <= maxLines) return lines;
        const trimmed = lines.slice(0, maxLines);
        let last = trimmed[maxLines - 1];
        while (last.length > 2 && ctx.measureText(`${last}...`).width > maxWidth) {
            last = last.slice(0, -1).trim();
        }
        trimmed[maxLines - 1] = `${last}...`;
        return trimmed;
    };

    const drawParagraph = (text, x, y, maxWidth, lineHeight, maxLines, align = "left", color = "#1f1b2e") => {
        let lines = wrapLines(text, maxWidth);
        lines = clampLines(lines, maxLines, maxWidth);
        ctx.fillStyle = color;
        ctx.textAlign = align;
        lines.forEach((line, index) => {
            ctx.fillText(line, x, y + (index * lineHeight));
        });
        ctx.textAlign = "left";
        return y + (Math.max(lines.length, 1) * lineHeight);
    };

    const drawBackgroundGlow = (x, y, r, color, alpha) => {
        const g = ctx.createRadialGradient(x, y, r * 0.08, x, y, r);
        g.addColorStop(0, color);
        g.addColorStop(1, "transparent");
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    const fillRoundRect = (x, y, w, h, r, fillStyle, strokeStyle = null, strokeWidth = 0) => {
        drawRoundRect(x, y, w, h, r);
        ctx.fillStyle = fillStyle;
        ctx.fill();
        if (strokeStyle && strokeWidth > 0) {
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = strokeWidth;
            ctx.stroke();
        }
    };

    const drawStatTile = (x, y, w, h, label, value, accent) => {
        const tileGrad = ctx.createLinearGradient(x, y, x, y + h);
        tileGrad.addColorStop(0, "rgba(255,255,255,0.99)");
        tileGrad.addColorStop(1, "rgba(242,247,255,0.97)");
        fillRoundRect(x, y, w, h, 16, tileGrad, "rgba(39,73,137,0.16)", 1.4);

        fillRoundRect(x + 12, y + 11, 7, h - 22, 4, accent);

        ctx.font = "700 17px Poppins, Inter, sans-serif";
        drawParagraph(label, x + 30, y + 33, w - 44, 21, 1, "left", "#4d6394");

        ctx.font = "700 26px Poppins, Inter, sans-serif";
        drawParagraph(String(value || "-"), x + 30, y + 69, w - 44, 32, 2, "left", palette.ink);
    };

    const drawInsightPanel = (x, y, w, h, badge, title, body, accentColor, bodyColor = "#1f2743") => {
        const panelGrad = ctx.createLinearGradient(x, y, x + w, y + h);
        panelGrad.addColorStop(0, "rgba(255,255,255,0.98)");
        panelGrad.addColorStop(1, "rgba(245,247,255,0.96)");
        fillRoundRect(x, y, w, h, 22, panelGrad, "rgba(42,64,120,0.22)", 1.7);

        fillRoundRect(x + 18, y + 14, 64, 48, 12, accentColor);
        ctx.font = "700 20px Poppins, Inter, sans-serif";
        drawParagraph(badge, x + 50, y + 45, 46, 24, 1, "center", "#f8fcff");

        fillRoundRect(x + 90, y + 14, w - 108, 48, 12, accentColor);
        ctx.font = "700 23px Poppins, Inter, sans-serif";
        drawParagraph(title, x + 108, y + 46, w - 146, 28, 1, "left", "#f7fbff");

        ctx.font = "600 30px Poppins, Inter, sans-serif";
        drawParagraph(body, x + 34, y + 112, w - 68, 40, 5, "left", bodyColor);
    };

    const drawHexSpark = (x, y, size, color) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI / 6);
        ctx.beginPath();
        for (let i = 0; i < 6; i += 1) {
            const angle = (Math.PI / 3) * i;
            const px = Math.cos(angle) * size;
            const py = Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    };

    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, palette.bgTop);
    bg.addColorStop(0.52, palette.bgMid);
    bg.addColorStop(1, palette.bgBottom);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBackgroundGlow(180, 210, 240, palette.glowA, 0.34);
    drawBackgroundGlow(1035, 170, 310, palette.glowB, 0.22);
    drawBackgroundGlow(1080, 1860, 300, palette.glowC, 0.18);

    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = palette.gridLine;
    ctx.lineWidth = 1;
    for (let y = 0; y < canvas.height; y += 70) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    ctx.restore();

    fillRoundRect(42, 42, 1156, 1996, 36, palette.shellOuter);
    fillRoundRect(48, 48, 1144, 1984, 34, palette.paper, palette.shellStroke, 2.4);

    const mastGrad = ctx.createLinearGradient(88, 88, 1148, 518);
    mastGrad.addColorStop(0, palette.mastA);
    mastGrad.addColorStop(0.55, palette.mastB);
    mastGrad.addColorStop(1, palette.mastC);
    fillRoundRect(88, 88, 1064, 430, 30, mastGrad, "rgba(255,255,255,0.14)", 1.3);

    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.moveTo(628, 88);
    ctx.lineTo(1152, 88);
    ctx.lineTo(1152, 360);
    ctx.lineTo(770, 360);
    ctx.closePath();
    const shardGrad = ctx.createLinearGradient(748, 88, 1120, 360);
    shardGrad.addColorStop(0, palette.shardA);
    shardGrad.addColorStop(1, palette.shardB);
    ctx.fillStyle = shardGrad;
    ctx.fill();
    ctx.restore();

    fillRoundRect(110, 114, 188, 44, 10, palette.brandChipBg, palette.brandChipStroke, 1.1);
    ctx.font = "700 20px Poppins, Inter, sans-serif";
    drawParagraph("NAAMIN", 204, 143, 160, 24, 1, "center", palette.brandText);

    ctx.font = "700 21px Poppins, Inter, sans-serif";
    drawParagraph("Bespoke Name Identity Report", 128, 198, 450, 26, 1, "left", palette.subtitle);

    const reportNameWordCount = String(reportNameEn || "").trim().split(/\s+/).filter(Boolean).length;
    const isLongReportName = reportNameWordCount > 1 || String(reportNameEn || "").trim().length > 12;
    const reportNameFontSize = isLongReportName ? 74 : 98;
    const reportNameLineHeight = isLongReportName ? 80 : 102;
    const reportNameMaxLines = isLongReportName ? 2 : 1;
    const reportNameStartY = isLongReportName ? 286 : 300;
    const reportNameDownshift = isLongReportName ? 40 : 0;
    const meaningLineHeight = isLongReportName ? 34 : 40;
    const meaningMaxLines = isLongReportName ? 2 : 2;

    ctx.font = `800 ${reportNameFontSize}px Lora, Georgia, serif`;
    drawParagraph(reportNameEn, 122, reportNameStartY, 760, reportNameLineHeight, reportNameMaxLines, "left", palette.nameEn);

    ctx.font = "700 58px 'Noto Sans Devanagari', Poppins, Inter, sans-serif";
    drawParagraph(reportNameHi, 126, 368 + reportNameDownshift, 700, 64, 1, "left", palette.nameHi);

    ctx.font = "italic 34px Lora, Georgia, serif";
    drawParagraph(cleanedMeaning, 126, 422 + reportNameDownshift, 720, meaningLineHeight, meaningMaxLines, "left", palette.meaning);

    const rightCardX = 836;
    const rightCardW = 300;
    // Increase profile block size for better visibility in preview.
    const rightCardH = 90;
    const rightCardCx = rightCardX + (rightCardW / 2);

    const drawRightInfoCard = (y, stroke, label, value, labelColor, valueColor) => {
        fillRoundRect(rightCardX, y, rightCardW, rightCardH, 18, "rgba(255,255,255,0.15)", stroke, 1.2);
        ctx.font = "700 20px Poppins, Inter, sans-serif";
        drawParagraph(label, rightCardCx, y + 34, 250, 24, 1, "center", labelColor);
        ctx.font = "700 31px Poppins, Inter, sans-serif";
        drawParagraph(value, rightCardCx, y + 71, 250, 34, 1, "center", valueColor);
    };

    // Place DOB lower and enlarge portrait while keeping everything inside the mast block.
    const profileY = 126;
    const dobY = 228;

    drawRightInfoCard(profileY, "rgba(255,169,145,0.56)", "PROFILE", reportGender.toUpperCase(), palette.profileLabel, palette.profileValue);
    drawRightInfoCard(dobY, "rgba(148,211,255,0.56)", "DATE OF BIRTH", reportDob, palette.dobLabel, palette.dobValue);

    // Portrait: uploaded baby photo (if provided) or auto-generated cute avatar.
    const drawPortraitCircle = (cx, cy, radius, strokeColor) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = "rgba(255,255,255,0.16)";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = strokeColor || "rgba(255,255,255,0.55)";
        ctx.stroke();
        ctx.restore();
    };

    const drawAutoAvatar = (cx, cy, radius, gender) => {
        const skin = gender === "girl" ? "#f6d6c9" : "#f2d2c4";
        const hair = gender === "girl" ? "#2a1f2d" : "#1f1b2e";
        const blush = gender === "girl" ? "rgba(255,122,155,0.32)" : "rgba(255,145,120,0.24)";
        const shirt = gender === "girl" ? "#ff7aa8" : "#2f77d8";
        const shirt2 = gender === "girl" ? "#ffd1e3" : "#bfe0ff";

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 3, 0, Math.PI * 2);
        ctx.clip();

        // background
        const bg = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
        bg.addColorStop(0, gender === "girl" ? "rgba(255,210,232,0.9)" : "rgba(200,228,255,0.9)");
        bg.addColorStop(1, "rgba(255,255,255,0.9)");
        ctx.fillStyle = bg;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

        // shirt
        const shirtY = cy + radius * 0.35;
        const shirtGrad = ctx.createLinearGradient(cx, shirtY, cx, cy + radius);
        shirtGrad.addColorStop(0, shirt2);
        shirtGrad.addColorStop(1, shirt);
        ctx.fillStyle = shirtGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + radius * 0.72, radius * 0.95, radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // face
        ctx.fillStyle = skin;
        ctx.beginPath();
        ctx.ellipse(cx, cy - radius * 0.02, radius * 0.58, radius * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();

        // hair cap
        ctx.fillStyle = hair;
        ctx.beginPath();
        ctx.ellipse(cx, cy - radius * 0.38, radius * 0.74, radius * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = skin;
        ctx.beginPath();
        ctx.ellipse(cx, cy - radius * 0.23, radius * 0.64, radius * 0.54, 0, 0, Math.PI * 2);
        ctx.fill();

        // small curl/bow
        ctx.fillStyle = gender === "girl" ? "#ff4d7d" : "rgba(255,255,255,0.0)";
        if (gender === "girl") {
            ctx.beginPath();
            ctx.arc(cx + radius * 0.42, cy - radius * 0.56, radius * 0.12, 0, Math.PI * 2);
            ctx.arc(cx + radius * 0.56, cy - radius * 0.56, radius * 0.12, 0, Math.PI * 2);
            ctx.fill();
        }

        // eyes
        ctx.fillStyle = "#1a1a1a";
        const eyeY = cy - radius * 0.12;
        ctx.beginPath();
        ctx.arc(cx - radius * 0.18, eyeY, radius * 0.06, 0, Math.PI * 2);
        ctx.arc(cx + radius * 0.18, eyeY, radius * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath();
        ctx.arc(cx - radius * 0.20, eyeY - radius * 0.02, radius * 0.02, 0, Math.PI * 2);
        ctx.arc(cx + radius * 0.16, eyeY - radius * 0.02, radius * 0.02, 0, Math.PI * 2);
        ctx.fill();

        // blush
        ctx.fillStyle = blush;
        ctx.beginPath();
        ctx.ellipse(cx - radius * 0.28, cy + radius * 0.05, radius * 0.16, radius * 0.1, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + radius * 0.28, cy + radius * 0.05, radius * 0.16, radius * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // smile
        ctx.strokeStyle = "rgba(120,52,66,0.65)";
        ctx.lineWidth = Math.max(2, radius * 0.04);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(cx, cy + radius * 0.08, radius * 0.18, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();

        ctx.restore();
    };

    const drawUploadedPhoto = (img, cx, cy, radius) => {
        if (!img || !img.naturalWidth || !img.naturalHeight) return false;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 3, 0, Math.PI * 2);
        ctx.clip();

        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        const scale = Math.max((radius * 2) / iw, (radius * 2) / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        ctx.drawImage(img, cx - (dw / 2), cy - (dh / 2), dw, dh);

        ctx.restore();
        return true;
    };

    const portraitCx = rightCardCx;
    // Bigger portrait for better visibility in the preview.
    // Keep it inside the mast block by shifting slightly down.
    const portraitCy = 458;
    const portraitR = 146;
    drawPortraitCircle(portraitCx, portraitCy, portraitR, "rgba(255,255,255,0.55)");
    const drewUpload = drawUploadedPhoto(portraitImage, portraitCx, portraitCy, portraitR);
    if (!drewUpload) {
        drawAutoAvatar(portraitCx, portraitCy, portraitR, portraitGender);
    }

    drawHexSpark(854, 140, 9, "rgba(255,255,255,0.48)");
    drawHexSpark(1115, 466, 10, "rgba(255,255,255,0.40)");
    drawHexSpark(796, 474, 7, "rgba(255,255,255,0.26)");
    drawHexSpark(754, 118, 6, "rgba(255,255,255,0.22)");

    const tileY1 = 552;
    const tileY2 = 690;
    const tileW = 334;
    const tileH = 120;
    const tileGap = 16;
    drawStatTile(88, tileY1, tileW, tileH, "Origin", reportOrigin, palette.accentTeal);
    drawStatTile(88 + tileW + tileGap, tileY1, tileW, tileH, "Nakshatra", primaryNakshatra, "#6e8ef0");
    drawStatTile(88 + ((tileW + tileGap) * 2), tileY1, tileW, tileH, "Rashi", primaryRashi, "#56c79f");
    drawStatTile(88, tileY2, tileW, tileH, "Numerology Number", reportNumber, "#eea15a");
    drawStatTile(88 + tileW + tileGap, tileY2, tileW, tileH, "Planet", reportPlanet, palette.accentCoral);
    drawStatTile(88 + ((tileW + tileGap) * 2), tileY2, tileW, tileH, "Lucky Color", reportColor, palette.accentPurple);

    const numerologyBody = `DOB ${reportDob} harmonizes with Number ${reportNumber}. Planet influence: ${reportPlanet}. Support color: ${reportColor}.`;
    drawInsightPanel(88, 840, 1064, 248, "01", "Numerology Pattern", numerologyBody, "#365fba", "#1d2a4a");
    drawInsightPanel(88, 1116, 1064, 248, "02", "Aura Narrative", cleanedAura, "#2a8b94", "#1b3844");
    drawInsightPanel(88, 1392, 1064, 404, "03", `${reportYear} Direction Forecast`, cleanedPrediction, "#9f4e57", "#412229");

    fillRoundRect(88, 1822, 1064, 166, 24, palette.footerPanel, palette.footerPanelStroke, 1.5);
    ctx.font = "italic 35px Lora, Georgia, serif";
    drawParagraph('"A rare name is not decoration. It is strategy with soul."', 620, 1888, 920, 42, 2, "center", palette.quote);

    fillRoundRect(938, 1924, 192, 44, 10, palette.siteChipBg, palette.siteChipStroke, 1);
    ctx.font = "700 18px Poppins, Inter, sans-serif";
    drawParagraph("naamin.com", 1034, 1952, 170, 20, 1, "center", palette.siteText);

    fillRoundRect(110, 1918, 176, 54, 12, palette.signChipBg, palette.signChipStroke, 1);
    ctx.font = "700 14px Poppins, Inter, sans-serif";
    drawParagraph("SIGNATURE VERIFIED", 198, 1948, 148, 18, 1, "center", palette.signText);

    ctx.save();
    ctx.strokeStyle = palette.line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(102, 1808);
    ctx.lineTo(1136, 1808);
    ctx.stroke();
    ctx.restore();

    return canvas;
}

if (typeof window !== "undefined") {
    window.createReportCanvas = createReportCanvas;
}

async function savePdfWithFilename(pdf, filename) {
    if (!pdf || typeof pdf.save !== "function") return false;
    try {
        const saveResult = pdf.save(filename, { returnPromise: true });
        if (saveResult && typeof saveResult.then === "function") {
            await saveResult;
        }
        return true;
    } catch (_error) {
        return false;
    }
}

function decodeHindiMojibake(text) {
    if (!text) return text;
    const raw = String(text);
    if (!/(?:\u00C3|\u00C2|\u00E2|\u00F0|\u00E0\u00A4|\u00E0\u00A5|\u00EF\u00BF\u00BD)/.test(raw)) return raw;

    try {
        const bytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) {
            const code = raw.charCodeAt(i);
            if (code <= 255) {
                bytes[i] = code;
                continue;
            }
            const mapped = WIN1252_REVERSE_MAP[code];
            if (mapped === undefined) return raw;
            bytes[i] = mapped;
        }
        const decoded = new TextDecoder('utf-8').decode(bytes);
        if (!decoded || decoded.includes('ï¿½')) return raw;
        const rawMarkerScore = (raw.match(/(?:\u00C3|\u00C2|\u00E2|\u00E0\u00A4|\u00E0\u00A5|\u00EF\u00BF\u00BD)/g) || []).length;
        const decodedMarkerScore = (decoded.match(/(?:\u00C3|\u00C2|\u00E2|\u00E0\u00A4|\u00E0\u00A5|\u00EF\u00BF\u00BD)/g) || []).length;
        if (/[\u0900-\u097F]/.test(decoded)) return decoded;
        if (decodedMarkerScore < rawMarkerScore) return decoded;
        return raw;
    } catch (_e) {
        return raw;
    }
}

function decodeHindiMojibakeDeep(value) {
    if (value == null) return value;
    if (typeof value === "string") return decodeHindiMojibake(value);
    if (Array.isArray(value)) return value.map((item) => decodeHindiMojibakeDeep(item));
    if (typeof value === "object") {
        const decoded = {};
        Object.keys(value).forEach((key) => {
            decoded[key] = decodeHindiMojibakeDeep(value[key]);
        });
        return decoded;
    }
    return value;
}

function repairMojibakeAttributes(root = document.body) {
    if (!root || !root.querySelectorAll) return;
    const nodes = [root, ...root.querySelectorAll("*")];
    nodes.forEach((el) => {
        if (!el || !el.attributes) return;
        Array.from(el.attributes).forEach((attr) => {
            const raw = String(attr.value || "");
            if (!raw) return;
            if (!/(?:\u00C3|\u00C2|\u00E2|\u00E0\u00A4|\u00E0\u00A5|\u00EF\u00BF\u00BD)/.test(raw)) return;
            const fixed = decodeHindiMojibake(raw);
            if (fixed && fixed !== raw) {
                el.setAttribute(attr.name, fixed);
            }
        });
    });
}

function normalizeHindiNameOutput(value) {
    const decoded = (typeof decodeHindiMojibake === "function")
        ? decodeHindiMojibake(value)
        : String(value || "");
    const clean = String(decoded || "").trim();
    if (!clean) return "";

    if (/[\u0900-\u097F]/.test(clean)) {
        const compact = clean.replace(/\s+/g, " ");
        const corrections = Object.freeze({
            "à¤µà¥à¤°à¤¿à¤¨à¥à¤¦à¤¾": "à¤µà¥ƒà¤‚à¤¦à¤¾",
            "à¤µà¥à¤°à¤¿à¤‚à¤¦à¤¾": "à¤µà¥ƒà¤‚à¤¦à¤¾",
            "à¤µà¤°à¤¿à¤‚à¤¦à¤¾": "à¤µà¥ƒà¤‚à¤¦à¤¾",
            "à¤µà¥ƒà¤¨à¥à¤¦à¤¾": "à¤µà¥ƒà¤‚à¤¦à¤¾"
        });
        return corrections[compact] || compact;
    }

    return "";
}

function repairHindiMojibake(root = document.body) {
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let node = walker.nextNode();
    while (node) {
        const parentTag = node.parentElement ? node.parentElement.tagName : '';
        if (!['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'].includes(parentTag)) {
            const raw = node.nodeValue || '';
            if (/(?:\u00C3|\u00C2|\u00E2|\u00E0\u00A4|\u00E0\u00A5|\u00EF\u00BF\u00BD)/.test(raw)) {
                const fixed = decodeHindiMojibake(raw);
                if (fixed && fixed !== raw) {
                    node.nodeValue = fixed;
                }
            }
        }
        node = walker.nextNode();
    }

    const mockHindiName = document.querySelector('.mock-name-hi');
    if (mockHindiName) {
        const value = (mockHindiName.textContent || '').trim();
        if (!value || /(?:\u00C3|\u00C2|\u00E2|\u00E0\u00A4|\u00E0\u00A5|\u00EF\u00BF\u00BD)/.test(value)) {
            mockHindiName.textContent = '\u0938\u094d\u0924\u0941\u0924\u093f';
        }
    }

    const posterHindiName = document.getElementById('poster-name-hi');
    if (posterHindiName) {
        const value = (posterHindiName.textContent || '').trim();
        if (!value || /(?:\u00C3|\u00C2|\u00E2|\u00E0\u00A4|\u00E0\u00A5|\u00EF\u00BF\u00BD)/.test(value)) {
            posterHindiName.textContent = '\u0928\u093e\u092e';
        }
    }

    repairMojibakeAttributes(root);
}

function shouldTranslateAttribute(el, attr) {
    if (attr === "value") {
        if (!el || el.tagName !== "INPUT") return false;
        const inputType = String(el.getAttribute("type") || "text").toLowerCase();
        return VALUE_TRANSLATABLE_INPUT_TYPES.includes(inputType);
    }
    return true;
}

function snapshotOriginalLanguageState(root = document.body) {
    if (!root) return;

    if (root.nodeType === Node.TEXT_NODE) {
        if (!ORIGINAL_TEXT_NODE_MAP.has(root)) {
            ORIGINAL_TEXT_NODE_MAP.set(root, root.nodeValue || "");
        }
        return;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let node = walker.nextNode();
    while (node) {
        if (!ORIGINAL_TEXT_NODE_MAP.has(node)) {
            ORIGINAL_TEXT_NODE_MAP.set(node, node.nodeValue || "");
        }
        node = walker.nextNode();
    }

    const elements = [];
    if (root.nodeType === Node.ELEMENT_NODE) {
        elements.push(root);
        if (root.querySelectorAll) {
            elements.push(...root.querySelectorAll("*"));
        }
    }

    elements.forEach((el) => {
        let record = ORIGINAL_ATTRIBUTE_MAP.get(el);
        if (!record) record = {};
        TRANSLATABLE_ATTRS.forEach((attr) => {
            if (!shouldTranslateAttribute(el, attr)) return;
            if (!el.hasAttribute(attr)) return;
            if (Object.prototype.hasOwnProperty.call(record, attr)) return;
            record[attr] = el.getAttribute(attr) || "";
        });
        if (Object.keys(record).length > 0) {
            ORIGINAL_ATTRIBUTE_MAP.set(el, record);
        }
    });
}

function isBrokenCopy(text) {
    if (!text) return true;
    const trimmed = String(text).trim();
    if (!trimmed) return true;
    if (/^\?+$/.test(trimmed)) return true;
    if (/^\?\s*/.test(trimmed)) return true;
    if (/[\?]{2,}/.test(trimmed)) return true;
    if (/[A-Za-z\u0900-\u097F0-9]\s+\?+\s+[A-Za-z\u0900-\u097F0-9]/.test(trimmed)) return true;
    if (trimmed.includes("ï¿½")) return true;
    if (/(?:\u00C3|\u00C2|\u00E2|\u00E0\u00A4|\u00E0\u00A5|\u00EF\u00BF\u00BD)/.test(trimmed) && !/[\u0900-\u097F]/.test(trimmed)) return true;
    return false;
}

function translateLooseAttributes(lang) {
    if (!document.body) return;

    const isLiteralToken = (text) => {
        const raw = String(text || "").trim();
        if (!raw) return false;
        if (/@/.test(raw)) return true;
        if (/https?:\/\/|www\./i.test(raw)) return true;
        if (/\b(?:[a-z0-9-]+\.)+(?:com|in|org|net|io|co)\b/i.test(raw)) return true;
        if (/\+?\d[\d\s\-()]{6,}\d/.test(raw)) return true;
        return false;
    };

    const shouldSkipLooseTranslationForElement = (el) => {
        if (!el || !el.closest) return false;
        if (el.id === "global-google-translate-select") return true;
        if (el.tagName === "A") {
            const href = String(el.getAttribute("href") || "").trim().toLowerCase();
            if (href.startsWith("mailto:") || href.startsWith("tel:")) return true;
            if (isLiteralToken(el.textContent || "")) return true;
        }
        return Boolean(el.closest("#global-google-translate-select, .notranslate, [translate='no']"));
    };

    const nodes = document.body.querySelectorAll("*");
    nodes.forEach((el) => {
        if (shouldSkipLooseTranslationForElement(el)) return;

        let record = ORIGINAL_ATTRIBUTE_MAP.get(el);
        if (!record) {
            record = {};
            TRANSLATABLE_ATTRS.forEach((attr) => {
                if (!shouldTranslateAttribute(el, attr)) return;
                if (!el.hasAttribute(attr)) return;
                record[attr] = el.getAttribute(attr) || "";
            });
            if (Object.keys(record).length > 0) {
                ORIGINAL_ATTRIBUTE_MAP.set(el, record);
            }
        }

        if (!record) return;

        TRANSLATABLE_ATTRS.forEach((attr) => {
            if (!shouldTranslateAttribute(el, attr)) return;
            if (!Object.prototype.hasOwnProperty.call(record, attr)) return;

            const original = record[attr];
            if (!String(original || "").trim()) return;

            const preferredAttr = `data-${lang}-${attr}`;
            const fallbackAttr = `data-en-${attr}`;
            const preferredRaw = el.getAttribute(preferredAttr) || "";
            const fallbackRaw = el.getAttribute(fallbackAttr) || original;

            if (lang === "hi") {
                const translated = isBrokenCopy(preferredRaw) ? fallbackHindiCopy(fallbackRaw) : preferredRaw;
                if (translated) {
                    el.setAttribute(attr, translated);
                }
            } else {
                el.setAttribute(attr, fallbackRaw);
            }
        });
    });

    if (typeof window !== "undefined") {
        if (!window.__naaminOriginalTitle) {
            window.__naaminOriginalTitle = document.title || "";
        }
        if (lang === "hi") {
            const sourceTitle = window.__naaminOriginalTitle || document.title || "";
            document.title = fallbackHindiCopy(sourceTitle);
        } else if (window.__naaminOriginalTitle) {
            document.title = window.__naaminOriginalTitle;
        }
    }
}

function translateLooseTextNodes(lang) {
    if (!document.body) return;
    snapshotOriginalLanguageState(document.body);

    const isLiteralToken = (text) => {
        const raw = String(text || "").trim();
        if (!raw) return false;
        if (/@/.test(raw)) return true;
        if (/https?:\/\/|www\./i.test(raw)) return true;
        if (/\b(?:[a-z0-9-]+\.)+(?:com|in|org|net|io|co)\b/i.test(raw)) return true;
        if (/\+?\d[\d\s\-()]{6,}\d/.test(raw)) return true;
        return false;
    };

    const shouldSkipLooseTranslationForElement = (el) => {
        if (!el || !el.closest) return false;
        if (el.id === "global-google-translate-select") return true;
        if (el.tagName === "A") {
            const href = String(el.getAttribute("href") || "").trim().toLowerCase();
            if (href.startsWith("mailto:") || href.startsWith("tel:")) return true;
            if (isLiteralToken(el.textContent || "")) return true;
        }
        return Boolean(el.closest("#global-google-translate-select, .notranslate, [translate='no']"));
    };

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node = walker.nextNode();
    while (node) {
        const parent = node.parentElement;
        const parentTag = parent ? parent.tagName : "";

        if (
            parent &&
            !shouldSkipLooseTranslationForElement(parent) &&
            !["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE"].includes(parentTag)
        ) {
            const current = node.nodeValue || "";
            const trimmed = current.trim();
            if (trimmed) {
                if (!ORIGINAL_TEXT_NODE_MAP.has(node)) {
                    ORIGINAL_TEXT_NODE_MAP.set(node, current);
                }
                const original = ORIGINAL_TEXT_NODE_MAP.get(node) || current;
                if (isLiteralToken(original)) {
                    node.nodeValue = original;
                    node = walker.nextNode();
                    continue;
                }

                if (lang === "hi") {
                    const translated = fallbackHindiCopy(original);
                    if (translated && translated !== original.trim()) {
                        const leading = (original.match(/^\s*/) || [""])[0];
                        const trailing = (original.match(/\s*$/) || [""])[0];
                        node.nodeValue = `${leading}${translated}${trailing}`;
                    }
                } else {
                    node.nodeValue = original;
                }
            }
        }
        node = walker.nextNode();
    }
}

let languageMutationObserver = null;
function ensureLanguageMutationObserver() {
    if (languageMutationObserver || !document.body) return;
    languageMutationObserver = new MutationObserver((mutations) => {
        let sawNewNodes = false;
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                snapshotOriginalLanguageState(node);
                sawNewNodes = true;
            });
        });

        if (!sawNewNodes) return;
        const activeLang = (document.documentElement.lang || "en") === "hi" ? "hi" : "en";
        if (activeLang === "hi") {
            translateLooseTextNodes("hi");
            translateLooseAttributes("hi");
        }
    });
    languageMutationObserver.observe(document.body, { childList: true, subtree: true });
}

function enforceAnnouncementBanner() {
    const banner = document.querySelector(".scrolling-banner");
    if (!banner) return;

    // Force visibility in case any stale style/preloader rule hides it.
    banner.style.setProperty("display", "block", "important");
    banner.style.setProperty("visibility", "visible", "important");
    banner.style.setProperty("opacity", "1", "important");
    banner.style.setProperty("min-height", "42px");

    const track = banner.querySelector(".scrolling-track");
    if (track) {
        track.style.setProperty("display", "flex");
        track.style.setProperty("white-space", "nowrap");
        track.style.setProperty("animation-play-state", "running");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    enforceAnnouncementBanner();

    const heroVideo = document.querySelector('.hero-video');
    if (!heroVideo) return;
    heroVideo.removeAttribute('poster');
    heroVideo.classList.add('is-ready');
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.playsInline = true;
    const autoplayAttempt = heroVideo.play();
    if (autoplayAttempt && typeof autoplayAttempt.catch === 'function') {
        autoplayAttempt.catch(() => { });
    }
});

// Let preloader know the app has finished initial DOM setup to avoid first-state flash.
document.addEventListener('DOMContentLoaded', () => {
    const heroVideo = document.querySelector('.hero-video');
    // Don't block first paint/preloader on media readiness.
    window.requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent('naamin:app-ready'));
    });

    if (!heroVideo) return;

    const onVideoReady = () => {
        heroVideo.classList.add('is-ready');
    };

    if (heroVideo.readyState >= 2) {
        onVideoReady();
    } else {
        heroVideo.addEventListener('canplay', onVideoReady, { once: true });
        heroVideo.addEventListener('loadeddata', onVideoReady, { once: true });
    }
}, { once: true });

document.addEventListener('DOMContentLoaded', () => {
    const nameFinderSection = document.getElementById('name-finder');
    const namingInspirationSection = document.getElementById('baby-showcase');
    if (nameFinderSection && namingInspirationSection && namingInspirationSection.parentNode) {
        namingInspirationSection.parentNode.insertBefore(nameFinderSection, namingInspirationSection);
    }

    const heroMedia = document.querySelector('.hero-media');
    if (heroMedia) {
        heroMedia.querySelectorAll('.hero-media-placeholder').forEach(node => node.remove());
    }

    const heroContent = document.querySelector('.hero-content');
    if (heroContent && !heroContent.querySelector('.hero-scroll-hint')) {
        const hintTextEn = 'Find your name';
        const hintTextHi = 'à¤…à¤ªà¤¨à¤¾ à¤¨à¤¾à¤® à¤–à¥‹à¤œà¥‡à¤‚';
        const isHindiUI = (document.documentElement.lang || 'en') === 'hi';
        const hintLink = document.createElement('a');
        hintLink.className = 'hero-scroll-hint';
        hintLink.href = '#name-finder';
        hintLink.setAttribute('data-en', hintTextEn);
        hintLink.setAttribute('data-hi', hintTextHi);
        hintLink.innerHTML = `${isHindiUI ? hintTextHi : hintTextEn} <i class="fas fa-arrow-down" aria-hidden="true"></i>`;
        hintLink.addEventListener('click', (event) => {
            event.preventDefault();
            const target = document.getElementById('name-finder');
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        heroContent.appendChild(hintLink);
    }

    document.querySelectorAll('.back-btn').forEach(backBtn => {
        const cleaned = (backBtn.textContent || '').replace(/^\?\s*/, '').trim() || 'Back to list';
        const backBtnHindi = 'à¤¸à¥‚à¤šà¥€ à¤ªà¤° à¤µà¤¾à¤ªà¤¸ à¤œà¤¾à¤à¤‚';
        backBtn.textContent = cleaned;
        backBtn.setAttribute('data-en', cleaned);
        backBtn.setAttribute('data-hi', backBtnHindi);
    });

    const posterSeal = document.querySelector('.p-seal');
    if (posterSeal && /^[\?\s]+$/.test(posterSeal.textContent || '')) {
        posterSeal.textContent = 'â˜…';
    }

    const posterHindiName = document.getElementById('poster-name-hi');
    if (posterHindiName && /^[\?\s]+$/.test(posterHindiName.textContent || '')) {
        posterHindiName.textContent = 'à¤¨à¤¾à¤®';
    }

    const videoCards = document.querySelectorAll('.video-card');
    if (!videoCards.length) return;

    let lightbox = document.getElementById('video-lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'video-lightbox';
        lightbox.className = 'video-lightbox';
        lightbox.hidden = true;
        lightbox.innerHTML = `
            <div class="video-lightbox-backdrop" data-close-video-lightbox></div>
            <div class="video-lightbox-dialog" role="dialog" aria-modal="true" aria-labelledby="video-lightbox-title">
                <button class="video-lightbox-close" type="button" data-close-video-lightbox aria-label="Close video">
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>
                <h3 id="video-lightbox-title">Naamin Video</h3>
                <video id="video-lightbox-player" controls playsinline></video>
            </div>
        `;
        document.body.appendChild(lightbox);
    }

    const lightboxTitle = lightbox.querySelector('#video-lightbox-title');
    const lightboxPlayer = lightbox.querySelector('#video-lightbox-player');
    if (!lightboxPlayer || !lightboxTitle) return;

    const closeVideoLightbox = () => {
        lightboxPlayer.pause();
        lightboxPlayer.removeAttribute('src');
        lightboxPlayer.load();
        lightbox.setAttribute('hidden', '');
        document.body.classList.remove('video-lightbox-open');
        document.body.style.overflow = '';
    };

    const openVideoLightbox = (videoEl, fallbackTitle) => {
        if (!videoEl) return;
        const src = videoEl.currentSrc || videoEl.querySelector('source')?.src;
        if (!src) return;

        document.querySelectorAll('.video-card video').forEach(v => v.pause());
        lightboxPlayer.src = src;
        lightboxPlayer.poster = videoEl.getAttribute('poster') || '';
        lightboxTitle.textContent = fallbackTitle || 'Naamin Video';
        lightbox.removeAttribute('hidden');
        document.body.classList.add('video-lightbox-open');
        document.body.style.overflow = 'hidden';
        lightboxPlayer.currentTime = 0;
        const playPromise = lightboxPlayer.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => { });
        }
    };

    const applyAutoPoster = (videoEl) => {
        if (!videoEl || videoEl.dataset.posterReady === 'true') return;
        if (videoEl.getAttribute('data-auto-poster') !== 'true') return;

        const capturePoster = () => {
            if (!videoEl.videoWidth || !videoEl.videoHeight) return;
            try {
                const posterCanvas = document.createElement('canvas');
                posterCanvas.width = videoEl.videoWidth;
                posterCanvas.height = videoEl.videoHeight;
                const posterCtx = posterCanvas.getContext('2d');
                if (!posterCtx) return;
                posterCtx.drawImage(videoEl, 0, 0, posterCanvas.width, posterCanvas.height);
                videoEl.setAttribute('poster', posterCanvas.toDataURL('image/jpeg', 0.82));
                videoEl.dataset.posterReady = 'true';
                videoEl.currentTime = 0;
            } catch (_posterError) {
                // Keep existing poster if frame capture fails.
            }
        };

        const onMetaLoaded = () => {
            const targetTime = Math.min(1, Math.max(0.12, (videoEl.duration || 1) * 0.08));
            videoEl.addEventListener('seeked', capturePoster, { once: true });
            try {
                videoEl.currentTime = targetTime;
            } catch (_seekError) {
                capturePoster();
            }
        };

        if (videoEl.readyState >= 1) {
            onMetaLoaded();
        } else {
            videoEl.addEventListener('loadedmetadata', onMetaLoaded, { once: true });
        }
    };

    videoCards.forEach((card) => {
        const videoEl = card.querySelector('video');
        const title =
            card.dataset.videoTitle ||
            card.querySelector('.video-card-title')?.textContent?.trim() ||
            'Naamin Video';
        let expandBtn = card.querySelector('.video-expand-btn');

        if (!expandBtn) {
            const content = card.querySelector('.video-card-content');
            if (content) {
                expandBtn = document.createElement('button');
                expandBtn.className = 'video-expand-btn';
                expandBtn.type = 'button';
                expandBtn.setAttribute('data-en', 'View Large');
                expandBtn.setAttribute('data-hi', 'à¤¬à¤¡à¤¼à¤¾ à¤¦à¥‡à¤–à¥‡à¤‚');
                expandBtn.textContent = (document.documentElement.lang || 'en') === 'hi' ? 'à¤¬à¤¡à¤¼à¤¾ à¤¦à¥‡à¤–à¥‡à¤‚' : 'View Large';
                content.appendChild(expandBtn);
            }
        }

        if (videoEl) {
            videoEl.setAttribute('preload', 'metadata');
            applyAutoPoster(videoEl);
            card.dataset.videoTitle = title;

            videoEl.addEventListener('click', (event) => {
                event.preventDefault();
                openVideoLightbox(videoEl, title);
            });
        }

        if (expandBtn && videoEl) {
            expandBtn.addEventListener('click', () => openVideoLightbox(videoEl, title));
        }
    });

    lightbox.querySelectorAll('[data-close-video-lightbox]').forEach(closeEl => {
        closeEl.addEventListener('click', closeVideoLightbox);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !lightbox.hasAttribute('hidden')) {
            closeVideoLightbox();
        }
    });

    enforceAnnouncementBanner();
});

// Ensure hash navigation (e.g. /index.html#video-gallery) lands correctly even after
// dynamic DOM rearrangements/layout injection on load.
(() => {
    const getHeaderOffset = () => {
        try {
            const raw = getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '';
            const parsed = parseFloat(raw);
            return Number.isFinite(parsed) ? parsed : 70;
        } catch (_e) {
            return 70;
        }
    };

    const scrollToHashTarget = (behavior = 'auto') => {
        const hash = String(window.location.hash || '').trim();
        if (!hash || hash === '#') return false;
        // Let dedicated handlers manage this one.
        if (hash.toLowerCase() === '#calendar') return false;

        const id = hash.slice(1);
        if (!id) return false;

        const target = document.getElementById(id);
        if (!target) return false;

        const headerOffset = getHeaderOffset();
        const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset - 10);
        window.scrollTo({ top, behavior });
        return true;
    };

    const scheduleHashFix = () => {
        // Run multiple times: after DOM work, after layout injection, and after media load.
        requestAnimationFrame(() => requestAnimationFrame(() => scrollToHashTarget('auto')));
        setTimeout(() => scrollToHashTarget('auto'), 180);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scheduleHashFix, { once: true });
    } else {
        scheduleHashFix();
    }

    window.addEventListener('load', () => scrollToHashTarget('auto'), { once: true });
    document.addEventListener('naamin:layout-ready', () => scrollToHashTarget('auto'));
})();

// Comprehensive English to Hindi Name Mapping & Transliteration
function getHindiName(englishName) {
    if (!englishName) return "";

    const base = String(englishName).trim();
    if (!base) return "";
    if (/[\u0900-\u097F]/.test(base)) {
        return normalizeHindiNameOutput(base);
    }

    const preciseMapping = Object.freeze({
        aarav: "à¤†à¤°à¤µ", aditya: "à¤†à¤¦à¤¿à¤¤à¥à¤¯", arjun: "à¤…à¤°à¥à¤œà¥à¤¨", aryan: "à¤†à¤°à¥à¤¯à¤¨", ayaan: "à¤…à¤¯à¤¾à¤¨",
        aahan: "à¤†à¤¹à¤¾à¤¨", aarush: "à¤†à¤°à¥à¤·", anay: "à¤…à¤¨à¤¯", arnav: "à¤…à¤°à¥à¤¨à¤µ", avik: "à¤…à¤µà¤¿à¤•",
        dhruv: "à¤§à¥à¤°à¥à¤µ", harsh: "à¤¹à¤°à¥à¤·", ishan: "à¤ˆà¤¶à¤¾à¤¨", ishaan: "à¤ˆà¤¶à¤¾à¤¨", karan: "à¤•à¤°à¤£",
        krishna: "à¤•à¥ƒà¤·à¥à¤£", om: "à¥", pranav: "à¤ªà¥à¤°à¤£à¤µ", rohan: "à¤°à¥‹à¤¹à¤¨", rahul: "à¤°à¤¾à¤¹à¥à¤²",
        sahil: "à¤¸à¤¾à¤¹à¤¿à¤²", shiv: "à¤¶à¤¿à¤µ", vihaan: "à¤µà¤¿à¤¹à¤¾à¤¨", yash: "à¤¯à¤¶", ananya: "à¤…à¤¨à¤¨à¥à¤¯à¤¾",
        aisha: "à¤†à¤¯à¤¶à¤¾", aditi: "à¤…à¤¦à¤¿à¤¤à¤¿", diya: "à¤¦à¤¿à¤¯à¤¾", isha: "à¤ˆà¤¶à¤¾", kavya: "à¤•à¤¾à¤µà¥à¤¯à¤¾",
        prisha: "à¤ªà¥à¤°à¤¿à¤¶à¤¾", vrinda: "à¤µà¥ƒà¤‚à¤¦à¤¾", vriinda: "à¤µà¥ƒà¤‚à¤¦à¤¾", vrindaa: "à¤µà¥ƒà¤‚à¤¦à¤¾"
    });

    const words = base.split(/\s+/).filter(Boolean);

    const transliterateWord = (rawWord) => {
        const word = rawWord.toLowerCase().replace(/[^a-z]/g, "");
        if (!word) return rawWord;
        if (word === "name") return "नाम";
        if (preciseMapping[word]) return preciseMapping[word];

        const consonants = Object.freeze({
            ksh: "à¤•à¥à¤·", shr: "à¤¶à¥à¤°", chh: "à¤›", kh: "à¤–", gh: "à¤˜", ch: "à¤š", jh: "à¤", th: "à¤¥",
            dh: "à¤§", ph: "à¤«", bh: "à¤­", sh: "à¤¶", ng: "à¤™", ny: "à¤ž", k: "à¤•", g: "à¤—", j: "à¤œ",
            t: "à¤¤", d: "à¤¦", n: "à¤¨", p: "à¤ª", b: "à¤¬", m: "à¤®", y: "à¤¯", r: "à¤°", l: "à¤²",
            v: "à¤µ", w: "à¤µ", s: "à¤¸", h: "à¤¹", f: "à¤«", z: "à¤œà¤¼", q: "à¤•", x: "à¤•à¥à¤¸"
        });

        const vowelData = Object.freeze({
            aa: { ind: "à¤†", matra: "à¤¾" }, ai: { ind: "à¤", matra: "à¥ˆ" }, au: { ind: "à¤”", matra: "à¥Œ" },
            ee: { ind: "à¤ˆ", matra: "à¥€" }, ii: { ind: "à¤ˆ", matra: "à¥€" }, oo: { ind: "à¤Š", matra: "à¥‚" },
            ou: { ind: "à¤”", matra: "à¥Œ" }, ri: { ind: "à¤‹", matra: "à¥ƒ" },
            a: { ind: "à¤…", matra: "" }, i: { ind: "à¤‡", matra: "à¤¿" }, u: { ind: "à¤‰", matra: "à¥" },
            e: { ind: "à¤", matra: "à¥‡" }, o: { ind: "à¤“", matra: "à¥‹" }
        });

        const vowelKeys = ["aa", "ai", "au", "ee", "ii", "oo", "ou", "ri", "a", "i", "u", "e", "o"];
        const consKeys = Object.keys(consonants).sort((a, b) => b.length - a.length);
        const readVowel = (text, idx) => vowelKeys.find((v) => text.startsWith(v, idx)) || "";
        const readCons = (text, idx) => consKeys.find((c) => text.startsWith(c, idx)) || "";

        let out = "";
        let i = 0;

        while (i < word.length) {
            const c = readCons(word, i);
            if (c) {
                const cChar = consonants[c];
                const v = readVowel(word, i + c.length);
                if (v) {
                    out += cChar + vowelData[v].matra;
                    i += c.length + v.length;
                    continue;
                }

                const nextC = readCons(word, i + c.length);
                if (nextC) out += cChar + "à¥";
                else out += cChar;
                i += c.length;
                continue;
            }

            const v = readVowel(word, i);
            if (v) {
                out += vowelData[v].ind;
                i += v.length;
                continue;
            }

            i += 1;
        }

        out = out
            .replace(/à¤¨à¥(?=[à¤¦à¤§à¤Ÿà¤¤à¤•à¤—à¤ªà¤¬à¤šà¤œ])/g, "à¤‚")
            .replace(/à¤®à¥(?=[à¤ªà¤¬])/g, "à¤‚");

        return out || rawWord;
    };

    const translated = words.map(transliterateWord).join(" ");
    return normalizeHindiNameOutput(translated);
}
window.getHindiName = getHindiName;

function getHindiNameForFullName(nameValue) {
    const base = String(nameValue || "").trim();
    if (!base) return "";
    if (/[\u0900-\u097F]/.test(base)) return normalizeHindiNameOutput(base);

    const surnameOverrides = Object.freeze({
        sharma: "à¤¶à¤°à¥à¤®à¤¾",
        verma: "à¤µà¤°à¥à¤®à¤¾",
        mishra: "à¤®à¤¿à¤¶à¥à¤°à¤¾",
        mehra: "à¤®à¥‡à¤¹à¤°à¤¾",
        gupta: "à¤—à¥à¤ªà¥à¤¤à¤¾"
    });

    const words = base.split(/\s+/).filter(Boolean);
    const transliterated = words.map((word) => {
        const key = String(word).toLowerCase().replace(/[^a-z]/g, "");
        if (key && surnameOverrides[key]) return surnameOverrides[key];
        return getHindiName(word) || word;
    }).join(" ");

    return normalizeHindiNameOutput(transliterated) || normalizeHindiNameOutput(getHindiName(base)) || "";
}
window.getHindiNameForFullName = getHindiNameForFullName;
window.normalizeHindiNameOutput = normalizeHindiNameOutput;

function transliterateLatinWordToHindiSafe(rawWord) {
    const base = String(rawWord || "").trim().toLowerCase();
    if (!base) return "";

    const directOverrides = Object.freeze({
        name: "नाम",
        sharma: "शर्मा",
        verma: "वर्मा",
        mishra: "मिश्रा",
        mehra: "मेहरा",
        gupta: "गुप्ता",
        singh: "सिंह",
        kumar: "कुमार"
    });
    if (directOverrides[base]) return directOverrides[base];

    const consonants = Object.freeze({
        ksh: "क्ष", shr: "श्र", chh: "छ", kh: "ख", gh: "घ", ch: "च", jh: "झ", th: "थ",
        dh: "ध", ph: "फ", bh: "भ", sh: "श", ng: "ङ", ny: "ञ", k: "क", g: "ग", j: "ज",
        t: "त", d: "द", n: "न", p: "प", b: "ब", m: "म", y: "य", r: "र", l: "ल",
        v: "व", w: "व", s: "स", h: "ह", f: "फ", z: "ज़", q: "क", x: "क्स"
    });

    const vowelData = Object.freeze({
        aa: { ind: "आ", matra: "ा" }, ai: { ind: "ऐ", matra: "ै" }, au: { ind: "औ", matra: "ौ" },
        ee: { ind: "ई", matra: "ी" }, ii: { ind: "ई", matra: "ी" }, oo: { ind: "ऊ", matra: "ू" },
        ou: { ind: "औ", matra: "ौ" }, ri: { ind: "ऋ", matra: "ृ" },
        a: { ind: "अ", matra: "" }, i: { ind: "इ", matra: "ि" }, u: { ind: "उ", matra: "ु" },
        e: { ind: "ए", matra: "े" }, o: { ind: "ओ", matra: "ो" }
    });

    const vowelKeys = ["aa", "ai", "au", "ee", "ii", "oo", "ou", "ri", "a", "i", "u", "e", "o"];
    const consKeys = Object.keys(consonants).sort((a, b) => b.length - a.length);
    const readVowel = (text, idx) => vowelKeys.find((v) => text.startsWith(v, idx)) || "";
    const readCons = (text, idx) => consKeys.find((c) => text.startsWith(c, idx)) || "";

    let out = "";
    let i = 0;
    while (i < base.length) {
        const c = readCons(base, i);
        if (c) {
            const cChar = consonants[c];
            const v = readVowel(base, i + c.length);
            if (v) {
                out += cChar + vowelData[v].matra;
                i += c.length + v.length;
                continue;
            }
            const nextC = readCons(base, i + c.length);
            out += nextC ? `${cChar}्` : cChar;
            i += c.length;
            continue;
        }

        const v = readVowel(base, i);
        if (v) {
            out += vowelData[v].ind;
            i += v.length;
            continue;
        }
        i += 1;
    }

    return out
        .replace(/न्(?=[दधटतकगपबचज])/g, "ं")
        .replace(/म्(?=[पब])/g, "ं");
}

function sanitizeHindiWordCandidate(rawWord) {
    const decoded = decodeHindiMojibake(String(rawWord || "").trim());
    if (!decoded) return "";
    if (/[\u0900-\u097F]/.test(decoded)) {
        const cleaned = decoded
            .replace(/[^\u0900-\u097F\u200c\u200d\s'-]/g, "")
            .replace(/\s+/g, " ")
            .trim();
        return cleaned;
    }
    if (/^[A-Za-z'-]+$/.test(decoded)) {
        return transliterateLatinWordToHindiSafe(decoded);
    }
    return "";
}

function resolveHindiName(rawHindiValue, englishFallback) {
    const candidates = [
        String(rawHindiValue || "").trim(),
        String(englishFallback || "").trim()
    ].filter(Boolean);

    for (const candidate of candidates) {
        const words = candidate.split(/\s+/).filter(Boolean);
        const convertedWords = words
            .map((word) => sanitizeHindiWordCandidate(word))
            .filter(Boolean);
        const merged = convertedWords.join(" ").trim();
        if (/[\u0900-\u097F]/.test(merged)) return merged;
    }

    const transliteratedFallback = String(englishFallback || "")
        .split(/\s+/)
        .map((word) => transliterateLatinWordToHindiSafe(word))
        .filter(Boolean)
        .join(" ")
        .trim();
    return transliteratedFallback || "नाम";
}
window.resolveHindiName = resolveHindiName;

const RASHI_HI_MAP = Object.freeze({
    aries: "\u092e\u0947\u0937",
    mesh: "\u092e\u0947\u0937",
    mesha: "\u092e\u0947\u0937",
    taurus: "\u0935\u0943\u0937\u092d",
    vrishabh: "\u0935\u0943\u0937\u092d",
    vrishabha: "\u0935\u0943\u0937\u092d",
    gemini: "\u092e\u093f\u0925\u0941\u0928",
    mithun: "\u092e\u093f\u0925\u0941\u0928",
    mithuna: "\u092e\u093f\u0925\u0941\u0928",
    cancer: "\u0915\u0930\u094d\u0915",
    kark: "\u0915\u0930\u094d\u0915",
    karka: "\u0915\u0930\u094d\u0915",
    leo: "\u0938\u093f\u0902\u0939",
    simha: "\u0938\u093f\u0902\u0939",
    virgo: "\u0915\u0928\u094d\u092f\u093e",
    kanya: "\u0915\u0928\u094d\u092f\u093e",
    libra: "\u0924\u0941\u0932\u093e",
    tula: "\u0924\u0941\u0932\u093e",
    scorpio: "\u0935\u0943\u0936\u094d\u091a\u093f\u0915",
    vrishchik: "\u0935\u0943\u0936\u094d\u091a\u093f\u0915",
    vrishchika: "\u0935\u0943\u0936\u094d\u091a\u093f\u0915",
    sagittarius: "\u0927\u0928\u0941",
    dhanu: "\u0927\u0928\u0941",
    capricorn: "\u092e\u0915\u0930",
    makar: "\u092e\u0915\u0930",
    makara: "\u092e\u0915\u0930",
    aquarius: "\u0915\u0941\u092e\u094d\u092d",
    kumbh: "\u0915\u0941\u092e\u094d\u092d",
    kumbha: "\u0915\u0941\u092e\u094d\u092d",
    pisces: "\u092e\u0940\u0928",
    meen: "\u092e\u0940\u0928",
    meena: "\u092e\u0940\u0928"
});

const NAKSHATRA_HI_MAP = Object.freeze({
    ashwini: "\u0905\u0936\u094d\u0935\u093f\u0928\u0940",
    bharani: "\u092d\u0930\u0923\u0940",
    krittika: "\u0915\u0943\u0924\u094d\u0924\u093f\u0915\u093e",
    kritika: "\u0915\u0943\u0924\u094d\u0924\u093f\u0915\u093e",
    rohini: "\u0930\u094b\u0939\u093f\u0923\u0940",
    mrigashira: "\u092e\u0943\u0917\u0936\u0940\u0930\u094d\u0937",
    mrigasira: "\u092e\u0943\u0917\u0936\u0940\u0930\u094d\u0937",
    mrigshira: "\u092e\u0943\u0917\u0936\u0940\u0930\u094d\u0937",
    ardra: "\u0906\u0930\u094d\u0926\u094d\u0930\u093e",
    punarvasu: "\u092a\u0941\u0928\u0930\u094d\u0935\u0938\u0941",
    pushya: "\u092a\u0941\u0937\u094d\u092f",
    pushyami: "\u092a\u0941\u0937\u094d\u092f",
    ashlesha: "\u0906\u0936\u094d\u0932\u0947\u0937\u093e",
    magha: "\u092e\u0918\u093e",
    purvaphalguni: "\u092a\u0942\u0930\u094d\u0935 \u092b\u093e\u0932\u094d\u0917\u0941\u0928\u0940",
    uttaraphalguni: "\u0909\u0924\u094d\u0924\u0930 \u092b\u093e\u0932\u094d\u0917\u0941\u0928\u0940",
    hasta: "\u0939\u0938\u094d\u0924",
    chitra: "\u091a\u093f\u0924\u094d\u0930\u093e",
    swati: "\u0938\u094d\u0935\u093e\u0924\u0940",
    vishakha: "\u0935\u093f\u0936\u093e\u0916\u093e",
    visakha: "\u0935\u093f\u0936\u093e\u0916\u093e",
    anuradha: "\u0905\u0928\u0941\u0930\u093e\u0927\u093e",
    jyeshtha: "\u091c\u094d\u092f\u0947\u0937\u094d\u0920\u093e",
    jyestha: "\u091c\u094d\u092f\u0947\u0937\u094d\u0920\u093e",
    mula: "\u092e\u0942\u0932",
    moola: "\u092e\u0942\u0932",
    purvaashadha: "\u092a\u0942\u0930\u094d\u0935\u093e\u0937\u093e\u0922\u093c\u093e",
    uttaraashadha: "\u0909\u0924\u094d\u0924\u0930\u093e\u0937\u093e\u0922\u093c\u093e",
    shravana: "\u0936\u094d\u0930\u0935\u0923",
    dhanishtha: "\u0927\u0928\u093f\u0937\u094d\u0920\u093e",
    shatabhisha: "\u0936\u0924\u092d\u093f\u0937\u093e",
    shatabhishak: "\u0936\u0924\u092d\u093f\u0937\u093e",
    purvabhadrapada: "\u092a\u0942\u0930\u094d\u0935\u093e\u092d\u093e\u0926\u094d\u0930\u092a\u0926\u093e",
    uttarabhadrapada: "\u0909\u0924\u094d\u0924\u0930\u093e\u092d\u093e\u0926\u094d\u0930\u092a\u0926\u093e",
    revati: "\u0930\u0947\u0935\u0924\u0940"
});

const NAKSHATRA_HI_ALIAS_MAP = Object.freeze({
    "\u0905\u0938\u0930\u0939\u0935\u093f\u0928\u0947\u0926": "\u0905\u0936\u094d\u0935\u093f\u0928\u0940",
    "\u0905\u0938\u0930\u0939\u0935\u093f\u0928\u0940": "\u0905\u0936\u094d\u0935\u093f\u0928\u0940",
    "\u0905\u0938\u0930\u0935\u093f\u0928\u0940": "\u0905\u0936\u094d\u0935\u093f\u0928\u0940",
    "\u092c\u0939\u0930\u0928\u0948\u0921": "\u092d\u0930\u0923\u0940",
    "\u092c\u0939\u0930\u093e\u0928\u0940": "\u092d\u0930\u0923\u0940",
    "\u092d\u093e\u0930\u0923\u0940": "\u092d\u0930\u0923\u0940",
    "\u0915\u0930\u0940\u0924\u093f\u091f\u093f\u0915\u093e": "\u0915\u0943\u0924\u094d\u0924\u093f\u0915\u093e",
    "\u0915\u094d\u0930\u0940\u091f\u093f\u0915\u093e": "\u0915\u0943\u0924\u094d\u0924\u093f\u0915\u093e",
    "\u0915\u0943\u0924\u093f\u0915\u093e": "\u0915\u0943\u0924\u094d\u0924\u093f\u0915\u093e"
});

function normalizeAstroToken(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\s/g, "");
}

function localizeRashiForHindi(rawValue) {
    const raw = String(rawValue || "").trim();
    if (!raw) return raw;
    if (/[\u0900-\u097F]/.test(raw)) {
        const cleaned = raw.replace(/\s*\([^)]*\)\s*/g, "").trim();
        return cleaned || raw;
    }

    const candidates = raw
        .split(/[,/()\-|]/)
        .map((part) => normalizeAstroToken(part))
        .filter(Boolean);

    for (const candidate of candidates) {
        if (RASHI_HI_MAP[candidate]) return RASHI_HI_MAP[candidate];
    }
    return raw;
}

function localizeNakshatraForHindi(rawValue) {
    const raw = String(rawValue || "").trim();
    if (!raw) return raw;
    if (/[\u0900-\u097F]/.test(raw)) {
        const normalizedHi = raw
            .split(",")
            .map((piece) => String(piece || "").trim())
            .filter(Boolean)
            .map((piece) => {
                const compact = piece.replace(/[^\u0900-\u097F]/g, "");
                return NAKSHATRA_HI_ALIAS_MAP[compact] || piece;
            })
            .join(", ");
        return normalizedHi || raw;
    }

    const pieces = raw
        .split(",")
        .map((piece) => String(piece || "").trim())
        .filter(Boolean);

    if (!pieces.length) return raw;

    const localized = pieces.map((piece) => {
        const key = normalizeAstroToken(piece);
        return NAKSHATRA_HI_MAP[key] || piece;
    });
    return localized.join(", ");
}

function pickPrimaryNakshatra(value) {
    if (Array.isArray(value)) {
        return String(value[0] || "").trim();
    }
    const raw = String(value || "").trim();
    if (!raw) return "";
    return raw.split(",")[0].trim();
}

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
    const raw = String(rashiEn || "").toLowerCase();
    if (raw.includes("aries")) return "aries";
    if (raw.includes("taurus")) return "taurus";
    if (raw.includes("gemini")) return "gemini";
    if (raw.includes("cancer")) return "cancer";
    if (raw.includes("leo")) return "leo";
    if (raw.includes("virgo")) return "virgo";
    if (raw.includes("libra")) return "libra";
    if (raw.includes("scorpio")) return "scorpio";
    if (raw.includes("sagittarius")) return "sagittarius";
    if (raw.includes("capricorn")) return "capricorn";
    if (raw.includes("aquarius")) return "aquarius";
    if (raw.includes("pisces")) return "pisces";
    return "";
}

function getNakshatraGroupsForRashi(rashi) {
    const slug = getRashiSlugFromName(rashi?.rashi_en);
    const fromDoc = DOC_NAKSHATRA_GROUPS[slug];
    if (Array.isArray(fromDoc) && fromDoc.length) return fromDoc;

    if (Array.isArray(rashi?.nakshatra_groups) && rashi.nakshatra_groups.length) {
        return rashi.nakshatra_groups;
    }

    const letters = (Array.isArray(rashi?.letters) ? rashi.letters : [])
        .map((token) => String(token || "").toLowerCase().replace(/[^a-z]/g, ""))
        .filter(Boolean)
        .filter((token) => token.length > 1)
        .slice(0, 9);
    return [letters.slice(0, 3), letters.slice(3, 6), letters.slice(6, 9)].filter((group) => group.length);
}


// ASTRO ENGINE
class AstroEngine {
    constructor() {
        this.numerologyMap = { 'A': 1, 'I': 1, 'J': 1, 'Q': 1, 'Y': 1, 'B': 2, 'K': 2, 'R': 2, 'C': 3, 'G': 3, 'L': 3, 'S': 3, 'D': 4, 'M': 4, 'T': 4, 'E': 5, 'H': 5, 'N': 5, 'X': 5, 'U': 6, 'V': 6, 'W': 6, 'O': 7, 'Z': 7, 'F': 8, 'P': 8 };

        // --- 2026 FULL HOROSCOPE DATA (COMPLETE TEXT) ---
        this.rashiMap = [
            {
                rashi_en: "Aries (Mesh)", rashi_hi: "à¤®à¥‡à¤· (Aries)",
                letters: ["chu", "che", "cho", "la", "li", "lu", "le", "lo", "l", "aa", "a"],
                nakshatras: ["Ashwini", "Bharani", "Krittika"],
                phal_en: "Courageous, energetic, and a born leader.",
                phal_hi: "à¤¸à¤¾à¤¹à¤¸à¥€, à¤Šà¤°à¥à¤œà¤¾à¤µà¤¾à¤¨ à¤”à¤° à¤¨à¥‡à¤¤à¥ƒà¤¤à¥à¤µ à¤•à¤°à¤¨à¥‡ à¤µà¤¾à¤²à¤¾à¥¤",
                rashiphal_en: "2026 brings massive career growth and energy. Focus on health in the second half. New beginnings are favored.",
                rashiphal_hi: "2026 à¤•à¤°à¤¿à¤¯à¤° à¤®à¥‡à¤‚ à¤­à¤¾à¤°à¥€ à¤µà¥ƒà¤¦à¥à¤§à¤¿ à¤”à¤° à¤Šà¤°à¥à¤œà¤¾ à¤²à¤¾à¤à¤—à¤¾à¥¤ à¤µà¤°à¥à¤· à¤•à¥‡ à¤¦à¥‚à¤¸à¤°à¥‡ à¤­à¤¾à¤— à¤®à¥‡à¤‚ à¤¸à¥à¤µà¤¾à¤¸à¥à¤¥à¥à¤¯ à¤ªà¤° à¤§à¥à¤¯à¤¾à¤¨ à¤¦à¥‡à¤‚à¥¤ à¤¨à¤ˆ à¤¶à¥à¤°à¥à¤†à¤¤ à¤•à¥‡ à¤²à¤¿à¤ à¤¸à¤®à¤¯ à¤…à¤¨à¥à¤•à¥‚à¤² à¤¹à¥ˆà¥¤"
            },
            {
                rashi_en: "Taurus (Vrishabh)", rashi_hi: "à¤µà¥ƒà¤·à¤­ (Taurus)",
                letters: ["ve", "vo", "va", "vi", "vu", "v", "w", "i", "ee", "u", "oo", "e", "o"],
                nakshatras: ["Krittika", "Rohini", "Mrigashira"],
                phal_en: "Calm, reliable, and lover of arts.",
                phal_hi: "à¤¶à¤¾à¤‚à¤¤, à¤µà¤¿à¤¶à¥à¤µà¤¸à¤¨à¥€à¤¯ à¤”à¤° à¤•à¤²à¤¾ à¤ªà¥à¤°à¥‡à¤®à¥€à¥¤",
                rashiphal_en: "Financial stability improves significantly in 2026. Relationships will deepen. Avoid stubbornness in family matters.",
                rashiphal_hi: "2026 à¤®à¥‡à¤‚ à¤†à¤°à¥à¤¥à¤¿à¤• à¤¸à¥à¤¥à¤¿à¤°à¤¤à¤¾ à¤•à¤¾à¤«à¥€ à¤¬à¥‡à¤¹à¤¤à¤° à¤¹à¥‹à¤—à¥€à¥¤ à¤°à¤¿à¤¶à¥à¤¤à¥‡ à¤—à¤¹à¤°à¥‡ à¤¹à¥‹à¤‚à¤—à¥‡à¥¤ à¤ªà¤¾à¤°à¤¿à¤µà¤¾à¤°à¤¿à¤• à¤®à¤¾à¤®à¤²à¥‹à¤‚ à¤®à¥‡à¤‚ à¤œà¤¿à¤¦à¥à¤¦à¥€ à¤¹à¥‹à¤¨à¥‡ à¤¸à¥‡ à¤¬à¤šà¥‡à¤‚à¥¤"
            },
            {
                rashi_en: "Gemini (Mithun)", rashi_hi: "à¤®à¤¿à¤¥à¥à¤¨ (Gemini)",
                letters: ["ka", "ki", "ku", "ke", "ko", "k", "q", "gh", "ng", "ch", "ha", "h"],
                nakshatras: ["Mrigashira", "Ardra", "Punarvasu"],
                phal_en: "Intelligent, talkative, and versatile.",
                phal_hi: "à¤¬à¥à¤¦à¥à¤§à¤¿à¤®à¤¾à¤¨, à¤µà¤¾à¤šà¤¾à¤² à¤”à¤° à¤¬à¤¹à¥à¤®à¥à¤–à¥€ à¤ªà¥à¤°à¤¤à¤¿à¤­à¤¾ à¤µà¤¾à¤²à¤¾à¥¤",
                rashiphal_en: "A great year for learning, travel, and communication. New opportunities arise in business. Stay focused.",
                rashiphal_hi: "à¤¸à¥€à¤–à¤¨à¥‡, à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤”à¤° à¤¸à¤‚à¤šà¤¾à¤° à¤•à¥‡ à¤²à¤¿à¤ à¤¯à¤¹ à¤à¤• à¤¬à¥‡à¤¹à¤¤à¤°à¥€à¤¨ à¤µà¤°à¥à¤· à¤¹à¥ˆà¥¤ à¤µà¥à¤¯à¤¾à¤ªà¤¾à¤° à¤®à¥‡à¤‚ à¤¨à¤ à¤…à¤µà¤¸à¤° à¤®à¤¿à¤²à¥‡à¤‚à¤—à¥‡à¥¤ à¤…à¤ªà¤¨à¥‡ à¤²à¤•à¥à¤·à¥à¤¯ à¤ªà¤° à¤•à¥‡à¤‚à¤¦à¥à¤°à¤¿à¤¤ à¤°à¤¹à¥‡à¤‚à¥¤"
            },
            {
                rashi_en: "Cancer (Kark)", rashi_hi: "à¤•à¤°à¥à¤• (Cancer)",
                letters: ["hi", "hu", "he", "ho", "da", "di", "du", "de", "do", "d"],
                nakshatras: ["Punarvasu", "Pushya", "Ashlesha"],
                phal_en: "Emotional, sensitive, and family-oriented.",
                phal_hi: "à¤­à¤¾à¤µà¥à¤•, à¤¸à¤‚à¤µà¥‡à¤¦à¤¨à¤¶à¥€à¤² à¤”à¤° à¤ªà¤°à¤¿à¤µà¤¾à¤° à¤ªà¥à¤°à¥‡à¤®à¥€à¥¤",
                rashiphal_en: "Focus on home and property in 2026. Emotional strength increases. Career stability is indicated mid-year.",
                rashiphal_hi: "2026 à¤®à¥‡à¤‚ à¤˜à¤° à¤”à¤° à¤¸à¤‚à¤ªà¤¤à¥à¤¤à¤¿ à¤ªà¤° à¤§à¥à¤¯à¤¾à¤¨ à¤•à¥‡à¤‚à¤¦à¥à¤°à¤¿à¤¤ à¤°à¤¹à¥‡à¤—à¤¾à¥¤ à¤­à¤¾à¤µà¤¨à¤¾à¤¤à¥à¤®à¤• à¤¶à¤•à¥à¤¤à¤¿ à¤¬à¤¢à¤¼à¥‡à¤—à¥€à¥¤ à¤µà¤°à¥à¤· à¤•à¥‡ à¤®à¤§à¥à¤¯ à¤®à¥‡à¤‚ à¤•à¤°à¤¿à¤¯à¤° à¤®à¥‡à¤‚ à¤¸à¥à¤¥à¤¿à¤°à¤¤à¤¾ à¤†à¤à¤—à¥€à¥¤"
            },
            {
                rashi_en: "Leo (Simha)", rashi_hi: "à¤¸à¤¿à¤‚à¤¹ (Leo)",
                letters: ["ma", "mi", "mu", "me", "mo", "ta", "ti", "tu", "te", "m", "t"],
                nakshatras: ["Magha", "Purva Phalguni", "Uttara Phalguni"],
                phal_en: "Confident, generous, and regal nature.",
                phal_hi: "à¤†à¤¤à¥à¤®à¤µà¤¿à¤¶à¥à¤µà¤¾à¤¸à¥€, à¤‰à¤¦à¤¾à¤° à¤”à¤° à¤°à¤¾à¤œà¤¾ à¤œà¥ˆà¤¸à¤¾ à¤¸à¥à¤µà¤­à¤¾à¤µà¥¤",
                rashiphal_en: "Leadership roles await you in 2026. Your creativity will shine. Recognition and fame are on the cards.",
                rashiphal_hi: "2026 à¤®à¥‡à¤‚ à¤¨à¥‡à¤¤à¥ƒà¤¤à¥à¤µ à¤•à¥€ à¤­à¥‚à¤®à¤¿à¤•à¤¾à¤à¤ à¤†à¤ªà¤•à¤¾ à¤‡à¤‚à¤¤à¤œà¤¼à¤¾à¤° à¤•à¤° à¤°à¤¹à¥€ à¤¹à¥ˆà¤‚à¥¤ à¤†à¤ªà¤•à¥€ à¤°à¤šà¤¨à¤¾à¤¤à¥à¤®à¤•à¤¤à¤¾ à¤šà¤®à¤•à¥‡à¤—à¥€à¥¤ à¤®à¤¾à¤¨-à¤¸à¤®à¥à¤®à¤¾à¤¨ à¤”à¤° à¤ªà¥à¤°à¤¸à¤¿à¤¦à¥à¤§à¤¿ à¤®à¤¿à¤²à¤¨à¥‡ à¤•à¥‡ à¤¯à¥‹à¤— à¤¹à¥ˆà¤‚à¥¤"
            },
            {
                rashi_en: "Virgo (Kanya)", rashi_hi: "à¤•à¤¨à¥à¤¯à¤¾ (Virgo)",
                letters: ["to", "pa", "pi", "pu", "pe", "po", "sh", "th", "na", "p"],
                nakshatras: ["Uttara Phalguni", "Hasta", "Chitra"],
                phal_en: "Analytical, practical, and hardworking.",
                phal_hi: "à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£ à¤•à¤°à¤¨à¥‡ à¤µà¤¾à¤²à¤¾, à¤µà¥à¤¯à¤¾à¤µà¤¹à¤¾à¤°à¤¿à¤• à¤”à¤° à¤®à¥‡à¤¹à¤¨à¤¤à¥€à¥¤",
                rashiphal_en: "Hard work pays off this year. Excellent time for skill development and education. Health requires care.",
                rashiphal_hi: "à¤‡à¤¸ à¤µà¤°à¥à¤· à¤•à¤¡à¤¼à¥€ à¤®à¥‡à¤¹à¤¨à¤¤ à¤•à¤¾ à¤«à¤² à¤®à¤¿à¤²à¥‡à¤—à¤¾à¥¤ à¤•à¥Œà¤¶à¤² à¤µà¤¿à¤•à¤¾à¤¸ à¤”à¤° à¤¶à¤¿à¤•à¥à¤·à¤¾ à¤•à¥‡ à¤²à¤¿à¤ à¤‰à¤¤à¥à¤¤à¤® à¤¸à¤®à¤¯ à¤¹à¥ˆà¥¤ à¤¸à¥à¤µà¤¾à¤¸à¥à¤¥à¥à¤¯ à¤•à¤¾ à¤§à¥à¤¯à¤¾à¤¨ à¤°à¤–à¤¨à¥‡ à¤•à¥€ à¤†à¤µà¤¶à¥à¤¯à¤•à¤¤à¤¾ à¤¹à¥ˆà¥¤"
            },
            {
                rashi_en: "Libra (Tula)", rashi_hi: "à¤¤à¥à¤²à¤¾ (Libra)",
                letters: ["ra", "ri", "ru", "re", "ro", "ta", "ti", "tu", "te", "r", "t"],
                nakshatras: ["Chitra", "Swati", "Vishakha"],
                phal_en: "Fair, balanced, and social.",
                phal_hi: "à¤¨à¥à¤¯à¤¾à¤¯à¤ªà¥à¤°à¤¿à¤¯, à¤¸à¤‚à¤¤à¥à¤²à¤¿à¤¤ à¤”à¤° à¤®à¤¿à¤²à¤¨à¤¸à¤¾à¤°à¥¤",
                rashiphal_en: "Balance in partnerships is key in 2026. Artistic pursuits flourish. A good year for marriage or new alliances.",
                rashiphal_hi: "2026 à¤®à¥‡à¤‚ à¤¸à¤¾à¤à¥‡à¤¦à¤¾à¤°à¥€ à¤®à¥‡à¤‚ à¤¸à¤‚à¤¤à¥à¤²à¤¨ à¤®à¤¹à¤¤à¥à¤µà¤ªà¥‚à¤°à¥à¤£ à¤°à¤¹à¥‡à¤—à¤¾à¥¤ à¤•à¤²à¤¾à¤¤à¥à¤®à¤• à¤•à¤¾à¤°à¥à¤¯à¥‹à¤‚ à¤®à¥‡à¤‚ à¤¸à¤«à¤²à¤¤à¤¾ à¤®à¤¿à¤²à¥‡à¤—à¥€à¥¤ à¤µà¤¿à¤µà¤¾à¤¹ à¤¯à¤¾ à¤¨à¤ à¤—à¤ à¤¬à¤‚à¤§à¤¨à¥‹à¤‚ à¤•à¥‡ à¤²à¤¿à¤ à¤…à¤šà¥à¤›à¤¾ à¤µà¤°à¥à¤· à¤¹à¥ˆà¥¤"
            },
            {
                rashi_en: "Scorpio (Vrishchik)", rashi_hi: "à¤µà¥ƒà¤¶à¥à¤šà¤¿à¤• (Scorpio)",
                letters: ["to", "na", "ni", "nu", "ne", "no", "ya", "yi", "yu", "n", "y"],
                nakshatras: ["Vishakha", "Anuradha", "Jyeshtha"],
                phal_en: "Intense, mysterious, and determined.",
                phal_hi: "à¤¤à¥€à¤µà¥à¤°, à¤°à¤¹à¤¸à¥à¤¯à¤®à¤¯à¥€ à¤”à¤° à¤¦à¥ƒà¤¢à¤¼ à¤¨à¤¿à¤¶à¥à¤šà¤¯ à¤µà¤¾à¤²à¤¾à¥¤",
                rashiphal_en: "A transformative year. Trust your intuition and take calculated risks. Sudden gains are possible.",
                rashiphal_hi: "à¤¯à¤¹ à¤à¤• à¤ªà¤°à¤¿à¤µà¤°à¥à¤¤à¤¨à¤•à¤¾à¤°à¥€ à¤µà¤°à¥à¤· à¤¹à¥ˆà¥¤ à¤…à¤ªà¤¨à¥€ à¤…à¤‚à¤¤à¤°à¥à¤œà¥à¤žà¤¾à¤¨ à¤ªà¤° à¤­à¤°à¥‹à¤¸à¤¾ à¤•à¤°à¥‡à¤‚ à¤”à¤° à¤¸à¥‹à¤š-à¤¸à¤®à¤à¤•à¤° à¤œà¥‹à¤–à¤¿à¤® à¤²à¥‡à¤‚à¥¤ à¤…à¤šà¤¾à¤¨à¤• à¤§à¤¨ à¤²à¤¾à¤­ à¤¸à¤‚à¤­à¤µ à¤¹à¥ˆà¥¤"
            },
            {
                rashi_en: "Sagittarius (Dhanu)", rashi_hi: "à¤§à¤¨à¥ (Sagittarius)",
                letters: ["ye", "yo", "bha", "bhi", "bhu", "bhe", "bh", "dha", "dh", "pha", "ph"],
                nakshatras: ["Mula", "Purva Ashadha", "Uttara Ashadha"],
                phal_en: "Optimistic, philosophical, and independent.",
                phal_hi: "à¤†à¤¶à¤¾à¤µà¤¾à¤¦à¥€, à¤¦à¤¾à¤°à¥à¤¶à¤¨à¤¿à¤• à¤”à¤° à¤¸à¥à¤µà¤¤à¤‚à¤¤à¥à¤°à¥¤",
                rashiphal_en: "Luck favors you in 2026. Spiritual growth and long-distance travel are strongly indicated. Optimism returns.",
                rashiphal_hi: "2026 à¤®à¥‡à¤‚ à¤­à¤¾à¤—à¥à¤¯ à¤†à¤ªà¤•à¤¾ à¤¸à¤¾à¤¥ à¤¦à¥‡à¤—à¤¾à¥¤ à¤†à¤§à¥à¤¯à¤¾à¤¤à¥à¤®à¤¿à¤• à¤µà¤¿à¤•à¤¾à¤¸ à¤”à¤° à¤²à¤‚à¤¬à¥€ à¤¦à¥‚à¤°à¥€ à¤•à¥€ à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤•à¥‡ à¤ªà¥à¤°à¤¬à¤² à¤¸à¤‚à¤•à¥‡à¤¤ à¤¹à¥ˆà¤‚à¥¤ à¤œà¥€à¤µà¤¨ à¤®à¥‡à¤‚ à¤†à¤¶à¤¾à¤µà¤¾à¤¦ à¤²à¥Œà¤Ÿà¥‡à¤—à¤¾à¥¤"
            },
            {
                rashi_en: "Capricorn (Makar)", rashi_hi: "à¤®à¤•à¤° (Capricorn)",
                letters: ["bho", "kha", "ga", "gi", "g", "ja", "ji", "ju", "je", "jo", "j", "z", "x", "b", "kh"],
                nakshatras: ["Uttara Ashadha", "Shravana", "Dhanishtha"],
                phal_en: "Ambitious, disciplined, and patient.",
                phal_hi: "à¤®à¤¹à¤¤à¥à¤µà¤¾à¤•à¤¾à¤‚à¤•à¥à¤·à¥€, à¤…à¤¨à¥à¤¶à¤¾à¤¸à¤¿à¤¤ à¤”à¤° à¤§à¥ˆà¤°à¥à¤¯à¤µà¤¾à¤¨à¥¤",
                rashiphal_en: "Career goals will be met through discipline. 2026 rewards your patience. Real estate investments look good.",
                rashiphal_hi: "à¤…à¤¨à¥à¤¶à¤¾à¤¸à¤¨ à¤•à¥‡ à¤®à¤¾à¤§à¥à¤¯à¤® à¤¸à¥‡ à¤•à¤°à¤¿à¤¯à¤° à¤•à¥‡ à¤²à¤•à¥à¤·à¥à¤¯ à¤ªà¥‚à¤°à¥‡ à¤¹à¥‹à¤‚à¤—à¥‡à¥¤ 2026 à¤†à¤ªà¤•à¥‡ à¤§à¥ˆà¤°à¥à¤¯ à¤•à¤¾ à¤«à¤² à¤¦à¥‡à¤—à¤¾à¥¤ à¤…à¤šà¤² à¤¸à¤‚à¤ªà¤¤à¥à¤¤à¤¿ à¤®à¥‡à¤‚ à¤¨à¤¿à¤µà¥‡à¤¶ à¤¶à¥à¤­ à¤°à¤¹à¥‡à¤—à¤¾à¥¤"
            },
            {
                rashi_en: "Aquarius (Kumbh)", rashi_hi: "à¤•à¥à¤®à¥à¤­ (Aquarius)",
                letters: ["gu", "ge", "go", "sa", "si", "su", "se", "so", "s", "da", "d"],
                nakshatras: ["Dhanishtha", "Shatabhisha", "Purva Bhadrapada"],
                phal_en: "Innovative, humanitarian, and friendly.",
                phal_hi: "à¤¨à¤µà¥€à¤¨ à¤¸à¥‹à¤š à¤µà¤¾à¤²à¤¾, à¤®à¤¾à¤¨à¤µà¥€à¤¯ à¤”à¤° à¤®à¤¿à¤¤à¥à¤°à¤µà¤¤à¥¤",
                rashiphal_en: "Innovation leads to success. Your social circle expands significantly in 2026. Financial gains from networks.",
                rashiphal_hi: "à¤¨à¤µà¤¾à¤šà¤¾à¤° à¤¸à¥‡ à¤¸à¤«à¤²à¤¤à¤¾ à¤®à¤¿à¤²à¥‡à¤—à¥€à¥¤ 2026 à¤®à¥‡à¤‚ à¤†à¤ªà¤•à¤¾ à¤¸à¤¾à¤®à¤¾à¤œà¤¿à¤• à¤¦à¤¾à¤¯à¤°à¤¾ à¤•à¤¾à¤«à¥€ à¤¬à¤¢à¤¼à¥‡à¤—à¤¾à¥¤ à¤¨à¥‡à¤Ÿà¤µà¤°à¥à¤•à¤¿à¤‚à¤— à¤¸à¥‡ à¤†à¤°à¥à¤¥à¤¿à¤• à¤²à¤¾à¤­ à¤¹à¥‹à¤—à¤¾à¥¤"
            },
            {
                rashi_en: "Pisces (Meen)", rashi_hi: "à¤®à¥€à¤¨ (Pisces)",
                letters: ["di", "du", "de", "do", "tha", "th", "jha", "jh", "cha", "chi", "ca", "c", "d"],
                nakshatras: ["Purva Bhadrapada", "Uttara Bhadrapada", "Revati"],
                phal_en: "Compassionate, spiritual, and imaginative.",
                phal_hi: "à¤¦à¤¯à¤¾à¤²à¥, à¤†à¤§à¥à¤¯à¤¾à¤¤à¥à¤®à¤¿à¤• à¤”à¤° à¤•à¤²à¥à¤ªà¤¨à¤¾à¤¶à¥€à¤²à¥¤",
                rashiphal_en: "Spiritual peace and overseas connections. Manage expenses wisely. Intuition will be your best guide.",
                rashiphal_hi: "à¤†à¤§à¥à¤¯à¤¾à¤¤à¥à¤®à¤¿à¤• à¤¶à¤¾à¤‚à¤¤à¤¿ à¤®à¤¿à¤²à¥‡à¤—à¥€ à¤”à¤° à¤µà¤¿à¤¦à¥‡à¤¶à¥€ à¤¸à¤‚à¤¬à¤‚à¤§ à¤¬à¤¨à¥‡à¤‚à¤—à¥‡à¥¤ à¤–à¤°à¥à¤šà¥‹à¤‚ à¤•à¤¾ à¤ªà¥à¤°à¤¬à¤‚à¤§à¤¨ à¤¸à¤®à¤à¤¦à¤¾à¤°à¥€ à¤¸à¥‡ à¤•à¤°à¥‡à¤‚à¥¤ à¤…à¤‚à¤¤à¤°à¥à¤œà¥à¤žà¤¾à¤¨ à¤†à¤ªà¤•à¤¾ à¤¸à¤¬à¤¸à¥‡ à¤…à¤šà¥à¤›à¤¾ à¤®à¤¾à¤°à¥à¤—à¤¦à¤°à¥à¤¶à¤• à¤¹à¥‹à¤—à¤¾à¥¤"
            }
        ];

        this.rashiMap.forEach((rashi) => {
            const groupTokens = getNakshatraGroupsForRashi(rashi).flat();
            const normalized = Array.from(new Set(
                [...(rashi.letters || []), ...groupTokens]
                    .map((token) => String(token || "").toLowerCase().replace(/[^a-z]/g, ""))
                    .filter(Boolean)
            ));
            normalized.sort((a, b) => b.length - a.length);
            rashi._prefixes = normalized;
        });

        this.astroDetails = {
            1: { planet_en: "Sun", planet_hi: "à¤¸à¥‚à¤°à¥à¤¯", color_en: "Golden", color_hi: "à¤¸à¥à¤¨à¤¹à¤°à¤¾", lucky_nos: "1, 2, 3, 9", fal_en: "Leader...", fal_hi: "à¤¨à¥‡à¤¤à¤¾..." },
            2: { planet_en: "Moon", planet_hi: "à¤šà¤¨à¥à¤¦à¥à¤°", color_en: "White", color_hi: "à¤¸à¤«à¥‡à¤¦", lucky_nos: "2, 6, 7", fal_en: "Emotional...", fal_hi: "à¤­à¤¾à¤µà¥à¤•..." },
            3: { planet_en: "Jupiter", planet_hi: "à¤¬à¥ƒà¤¹à¤¸à¥à¤ªà¤¤à¤¿", color_en: "Yellow", color_hi: "à¤ªà¥€à¤²à¤¾", lucky_nos: "1, 3, 5, 9", fal_en: "Wise...", fal_hi: "à¤œà¥à¤žà¤¾à¤¨à¥€..." },
            4: { planet_en: "Rahu", planet_hi: "à¤°à¤¾à¤¹à¥‚", color_en: "Blue", color_hi: "à¤¨à¥€à¤²à¤¾", lucky_nos: "1, 4, 5, 6", fal_en: "Practical...", fal_hi: "à¤µà¥à¤¯à¤¾à¤µà¤¹à¤¾à¤°à¤¿à¤•..." },
            5: { planet_en: "Mercury", planet_hi: "à¤¬à¥à¤§", color_en: "Green", color_hi: "à¤¹à¤°à¤¾", lucky_nos: "1, 5, 6", fal_en: "Intelligent...", fal_hi: "à¤¬à¥à¤¦à¥à¤§à¤¿à¤®à¤¾à¤¨..." },
            6: { planet_en: "Venus", planet_hi: "à¤¶à¥à¤•à¥à¤°", color_en: "Pink", color_hi: "à¤—à¥à¤²à¤¾à¤¬à¥€", lucky_nos: "3, 6, 9", fal_en: "Charming...", fal_hi: "à¤†à¤•à¤°à¥à¤·à¤•..." },
            7: { planet_en: "Ketu", planet_hi: "à¤•à¥‡à¤¤à¥", color_en: "Multi", color_hi: "à¤šà¤¿à¤¤à¤•à¤¬à¤°à¤¾", lucky_nos: "2, 7", fal_en: "Spiritual...", fal_hi: "à¤†à¤§à¥à¤¯à¤¾à¤¤à¥à¤®à¤¿à¤•..." },
            8: { planet_en: "Saturn", planet_hi: "à¤¶à¤¨à¤¿", color_en: "Black", color_hi: "à¤•à¤¾à¤²à¤¾", lucky_nos: "1, 4, 8", fal_en: "Ambitious...", fal_hi: "à¤®à¤¹à¤¤à¥à¤µà¤¾à¤•à¤¾à¤‚à¤•à¥à¤·à¥€..." },
            9: { planet_en: "Mars", planet_hi: "à¤®à¤‚à¤—à¤²", color_en: "Red", color_hi: "à¤²à¤¾à¤²", lucky_nos: "3, 6, 9", fal_en: "Energetic...", fal_hi: "à¤Šà¤°à¥à¤œà¤¾à¤µà¤¾à¤¨..." }
        };
    }

    mapSingleLetterToSyllable(letter) {
        const token = String(letter || "").toLowerCase().replace(/[^a-z]/g, "");
        const hints = {
            a: "a",
            b: "bho",
            c: "cha",
            d: "di",
            e: "e",
            f: "pha",
            g: "ga",
            h: "ha",
            i: "i",
            j: "ja",
            k: "ka",
            l: "la",
            m: "ma",
            n: "na",
            o: "o",
            p: "pa",
            q: "ka",
            r: "ra",
            s: "sa",
            t: "ta",
            u: "u",
            v: "va",
            w: "va",
            x: "kha",
            y: "ya",
            z: "ja"
        };
        return hints[token] || "";
    }

    calculateNumerology(name) {
        if (!name) return 1;
        let total = 0, clean = name.toUpperCase().replace(/[^A-Z]/g, '');
        for (let c of clean) total += this.numerologyMap[c] || 0;
        while (total > 9) { let s = 0; while (total > 0) { s += total % 10; total = Math.floor(total / 10); } total = s; }
        return total || 1;
    }

    normalizeRomanNameForRashi(name) {
        return String(name || "")
            .toLowerCase()
            .replace(/[^a-z]/g, "");
    }

    extractDevanagariPrefix(name) {
        const raw = String(name || "").trim();
        if (!raw) return "";
        const first = raw.charAt(0);
        if (!/[\u0900-\u097f]/.test(first)) return "";

        const vowelMap = {
            "\u0905": "a", "\u0906": "aa", "\u0907": "i", "\u0908": "i",
            "\u0909": "u", "\u090a": "u", "\u090f": "e", "\u0910": "e",
            "\u0913": "o", "\u0914": "o"
        };
        if (vowelMap[first]) return vowelMap[first];

        const consonantMap = {
            "\u0915": "k", "\u0916": "kh", "\u0917": "g", "\u0918": "gh", "\u0919": "ng",
            "\u091a": "ch", "\u091b": "ch", "\u091c": "j", "\u091d": "jh", "\u091e": "ny",
            "\u091f": "t", "\u0920": "th", "\u0921": "d", "\u0922": "dh", "\u0923": "na",
            "\u0924": "t", "\u0925": "th", "\u0926": "d", "\u0927": "dh", "\u0928": "n",
            "\u092a": "p", "\u092b": "ph", "\u092c": "b", "\u092d": "bh", "\u092e": "m",
            "\u092f": "y", "\u0930": "r", "\u0932": "l", "\u0935": "v",
            "\u0936": "sh", "\u0937": "sh", "\u0938": "s", "\u0939": "h",
            "\u0958": "q", "\u0959": "kh", "\u095a": "gh", "\u095b": "z"
        };

        const matraMap = {
            "\u093e": "aa", "\u093f": "i", "\u0940": "i", "\u0941": "u", "\u0942": "u",
            "\u0947": "e", "\u0948": "e", "\u094b": "o", "\u094c": "o", "\u0943": "ri"
        };

        const base = consonantMap[first];
        if (!base) return "";

        let cursor = 1;
        if (raw.charAt(cursor) === "\u093c") cursor += 1;
        let vowel = "a";
        const marker = raw.charAt(cursor);
        if (matraMap[marker]) {
            vowel = matraMap[marker];
        } else if (marker === "\u094d") {
            vowel = "";
        }
        return `${base}${vowel}`;
    }

    buildRashiNameVariants(name) {
        const variants = [];
        const seen = new Set();
        const add = (value) => {
            const normalized = String(value || "").toLowerCase().replace(/[^a-z]/g, "");
            if (!normalized || seen.has(normalized)) return;
            seen.add(normalized);
            variants.push(normalized);
        };

        const latin = this.normalizeRomanNameForRashi(name);
        if (latin.length === 1) add(this.mapSingleLetterToSyllable(latin));
        add(latin);

        const devPrefix = this.extractDevanagariPrefix(name);
        add(devPrefix);
        if (devPrefix.endsWith("a")) add(devPrefix.slice(0, -1));

        [latin, devPrefix].forEach((variant) => {
            const v = String(variant || "").toLowerCase();
            if (!v) return;
            add(v.replace(/^aa/, "a"));
            add(v.replace(/^(ee|ii)/, "i"));
            add(v.replace(/^oo/, "u"));
            add(v.replace(/^ou/, "o"));
            add(v.replace(/^bh/, "b"));
            add(v.replace(/^ph/, "f"));
            add(v.replace(/^dh/, "d"));
            add(v.replace(/^th/, "t"));
            add(v.replace(/^sh/, "s"));
            add(v.replace(/^chh/, "ch"));
            add(v.replace(/^kh/, "k"));
            add(v.replace(/^gh/, "g"));
            if (v.endsWith("a")) add(v.slice(0, -1));
        });

        return variants;
    }

    resolveNakshatraForRashi(rashi, matchedVariant, matchedPrefix) {
        const nakshatras = Array.isArray(rashi?.nakshatras) ? rashi.nakshatras : [];
        if (!nakshatras.length) {
            return {
                nakshatra_en: "Ashwini",
                nakshatra_hi: (typeof localizeNakshatraForHindi === "function") ? localizeNakshatraForHindi("Ashwini") : "Ashwini"
            };
        }

        const groupedLetters = getNakshatraGroupsForRashi(rashi)
            .map((group) => (Array.isArray(group) ? group : [])
                .map((token) => String(token || "").toLowerCase().replace(/[^a-z]/g, ""))
                .filter(Boolean))
            .filter((group) => group.length);

        const variant = String(matchedVariant || "").toLowerCase().replace(/[^a-z]/g, "");
        const normalizedHint = String(matchedPrefix || "").toLowerCase().replace(/[^a-z]/g, "");

        let matchedGroup = -1;
        let matchedLen = -1;

        for (let i = 0; i < groupedLetters.length; i += 1) {
            for (const token of groupedLetters[i]) {
                if (!token) continue;
                if (!variant.startsWith(token)) continue;
                if (token.length > matchedLen) {
                    matchedGroup = i;
                    matchedLen = token.length;
                }
            }
        }

        if (matchedGroup < 0 && normalizedHint) {
            matchedGroup = groupedLetters.findIndex((group) => group.includes(normalizedHint));
        }

        if (matchedGroup < 0 && variant.length === 1) {
            const hinted = this.mapSingleLetterToSyllable(variant);
            if (hinted) {
                matchedGroup = groupedLetters.findIndex((group) => group.includes(hinted));
            }
        }

        const groupIndex = matchedGroup >= 0
            ? Math.min(nakshatras.length - 1, matchedGroup)
            : 0;

        const selectedNakshatra = nakshatras[groupIndex] || nakshatras[0] || "Ashwini";
        return {
            nakshatra_en: selectedNakshatra,
            nakshatra_hi: (typeof localizeNakshatraForHindi === "function")
                ? localizeNakshatraForHindi(selectedNakshatra)
                : selectedNakshatra
        };
    }

    enrichRashiMatch(rashi, matchedVariant, matchedPrefix) {
        const resolvedNakshatra = this.resolveNakshatraForRashi(rashi, matchedVariant, matchedPrefix);
        return {
            ...rashi,
            nakshatra: resolvedNakshatra.nakshatra_en,
            nakshatra_en: resolvedNakshatra.nakshatra_en,
            nakshatra_hi: resolvedNakshatra.nakshatra_hi
        };
    }

    calculateRashi(name) {
        if (!name) return this.enrichRashiMatch(this.rashiMap[0], "", "");
        const variants = this.buildRashiNameVariants(name);
        let bestMatch = null;
        for (const variant of variants) {
            for (const r of this.rashiMap) {
                const prefixes = Array.isArray(r._prefixes) ? r._prefixes : r.letters;
                for (const prefix of prefixes) {
                    if (!variant.startsWith(prefix)) continue;
                    if (!bestMatch
                        || prefix.length > bestMatch.prefix.length
                        || (prefix.length === bestMatch.prefix.length && variant.length > bestMatch.variant.length)) {
                        bestMatch = { rashi: r, variant, prefix };
                    }
                }
            }
        }
        if (bestMatch) {
            return this.enrichRashiMatch(bestMatch.rashi, bestMatch.variant, bestMatch.prefix);
        }
        return this.enrichRashiMatch(this.rashiMap[0], variants[0] || "", "");
    }

    processName(data, lang) {
        let safeName = data.name || data.Name;
        if (!safeName) return null;

        const num = this.calculateNumerology(safeName);
        const rashi = this.calculateRashi(safeName);
        const astro = this.astroDetails[num] || this.astroDetails[1];

        const isHindi = lang === 'hi';

        // Get Hindi Name if available in data, or fallback to mapping
        const hName = resolveHindiName(
            data.hindiName || data.hindi_name || data.name_hindi || "",
            safeName
        );
        const rashiEn = rashi.rashi_en;
        const rashiHi = localizeRashiForHindi(rashiEn || rashi.rashi_hi);
        const nakshatraEn = rashi.nakshatra_en || pickPrimaryNakshatra(rashi.nakshatras) || "Ashwini";
        const nakshatraHi = rashi.nakshatra_hi || localizeNakshatraForHindi(nakshatraEn);

        const payload = {
            ...data,
            name: safeName, // English Name
            name_en: safeName,
            name_hi: hName,

            // Meaning logic: keep Hindi for Hindi UI and sanitized English for English UI.
            meaning: data.meaning || (isHindi ? "à¤¡à¥‡à¤Ÿà¤¾à¤¬à¥‡à¤¸ à¤®à¥‡à¤‚ à¤¨à¤¹à¥€à¤‚ à¤®à¤¿à¤²à¤¾" : "Meaning not in database"),
            meaning_en: englishMeaningForNameData(data),
            gender: data.gender || "Unknown",
            origin: data.origin || (isHindi ? "à¤¸à¤‚à¤¸à¥à¤•à¥ƒà¤¤/à¤­à¤¾à¤°à¤¤à¥€à¤¯" : "Sanskrit/Indian"),
            origin_en: data.origin_en || data.origin || "Sanskrit/Indian",

            // Bilingual versions for poster control
            rashi: isHindi ? rashiHi : rashiEn,
            rashi_en: rashiEn,
            rashi_hi: rashiHi,

            nakshatra: isHindi ? nakshatraHi : nakshatraEn,
            nakshatra_en: nakshatraEn,
            nakshatra_hi: nakshatraHi,

            phal: isHindi ? rashi.phal_hi : rashi.phal_en,
            phal_en: rashi.phal_en,
            phal_hi: rashi.phal_hi,

            rashiphal: isHindi ? rashi.rashiphal_hi : rashi.rashiphal_en,
            rashiphal_en: rashi.rashiphal_en,
            rashiphal_hi: rashi.rashiphal_hi,

            num: num,
            planet: isHindi ? astro.planet_hi : astro.planet_en,
            planet_en: astro.planet_en,
            planet_hi: astro.planet_hi,

            color: isHindi ? astro.color_hi : astro.color_en,
            color_en: astro.color_en,
            color_hi: astro.color_hi,

            luckyNumbers: astro.lucky_nos,
            numFal: isHindi ? astro.fal_hi : astro.fal_en,
            numFal_en: astro.fal_en,
            numFal_hi: astro.fal_hi,

            labels: {
                meaning: isHindi ? "\u0905\u0930\u094d\u0925" : "Meaning",
                gender: isHindi ? "\u0932\u093f\u0902\u0917" : "Gender",
                origin: isHindi ? "\u092e\u0942\u0932" : "Origin",
                vedicTitle: isHindi ? "\u0935\u0948\u0926\u093f\u0915 \u091c\u094d\u092f\u094b\u0924\u093f\u0937" : "Vedic Astrology",
                rashi: isHindi ? "\u0930\u093e\u0936\u093f" : "Rashi",
                nakshatra: isHindi ? "\u0928\u0915\u094d\u0937\u0924\u094d\u0930" : "Nakshatra",
                personality: isHindi ? "2026 \u092d\u0935\u093f\u0937\u094d\u092f\u0935\u093e\u0923\u0940" : "2026 Prediction",
                rashiphalTitle: isHindi ? "2026 \u0930\u093e\u0936\u093f\u092b\u0932" : "2026 Horoscope",
                numTitle: isHindi ? "\u0905\u0902\u0915 \u091c\u094d\u092f\u094b\u0924\u093f\u0937" : "Numerology",
                number: isHindi ? "\u0905\u0902\u0915" : "Number",
                planet: isHindi ? "\u0917\u094d\u0930\u0939" : "Planet",
                luckyColor: isHindi ? "\u0936\u0941\u092d \u0930\u0902\u0917" : "Lucky Color",
                luckyNos: isHindi ? "\u0936\u0941\u092d \u0905\u0902\u0915" : "Lucky Numbers",
                prediction: isHindi ? "\u092d\u0935\u093f\u0937\u094d\u092f\u092b\u0932" : "Prediction"
            }
        };

        return isHindi ? decodeHindiMojibakeDeep(payload) : payload;
    }
}

const engine = new AstroEngine();
window.astroEngine = engine;
window.AstroEngine = AstroEngine;

let namesData = [];

// --- FALLBACK DATA FOR OFFLINE MODE ---
const FALLBACK_DATA = {
    Boy: [
        { "name": "अंकित", "meaning": "अच्छे आचरण वाला, अच्छे गुणों वाला,शुभ लक्षणों से युक्त।" },
        { "name": "अखिलेश", "meaning": "सब के बोस,मालिक, अच्छी बुद्धि वाला" },
        { "name": "अजय", "meaning": "जिसे कोई जीत नहीं सकता, बलवान, बुद्धिमान" },
        { "name": "अजित", "meaning": "जिसे कोई जीत नहीं सकता, सबसे ज्यादा ज्ञानी, शक्तिशाली" },
        { "name": "अटलविहारी", "meaning": "गंभीर रहनेवाला, ठीक ठीक मनोरंजन करने वाला" },
        { "name": "अनिल", "meaning": "दूसरे को जीवन दान करने वाला, परोपकारी इन्सान" },
        { "name": "अनीश", "meaning": "सबसे प्रमुख, सर्वोच्च पद पर आसीन" },
        { "name": "अनुज", "meaning": "भाई-बहनों में छोटे।बाद में जन्म लेने वाले,सबके प्रिय।" },
        { "name": "अनुभव", "meaning": "अनुभवी,ज्ञानी,व्यक्तिगत निरीक्षण और प्रयोग से प्राप्त ज्ञान वाले।" },
        { "name": "अभय", "meaning": "निडर, शक्तिमान" },
        { "name": "अभिषेक", "meaning": "पवित्र जल के जैसे शुद्ध पवित्र आचरण वाले" },
        { "name": "अभ्युदय", "meaning": "सांसारिक उन्नति करने वाले, मेहनती, पुरुषार्थी" },
        { "name": "अमरेन्द्र", "meaning": "जिसका मालिक अमर है वह, भगवान के प्रिय भक्त" },
        { "name": "अमित", "meaning": "विशाल दिल वाले,असीम क्षमता वाले" },
        { "name": "अमिताभ", "meaning": "अधिक तेजस्वी, ओजस्वी" },
        { "name": "अरविंद", "meaning": "ज्ञानी महापुरुषों को प्राप्त करने वाला" },
        { "name": "अरुष", "meaning": "जल्दी से किसी से नाराज न होने वाले,क्रोध, विना मतलब के हिंसा न करने वाले,सबसे प्रेम करने वाले।" },
        { "name": "अर्जुन", "meaning": "धन संपत्ति कमाने वाला, कुन्ती पुत्र के समान पराक्रमी, गौर वर्ण वाला" },
        { "name": "अर्पण", "meaning": "दानी, कुछ न कुछ गिफ्ट देने के स्वभाववाला" },
        { "name": "अवधेश", "meaning": "अयोध्या के राजा दशरथ के जैसे गुण वाले,राजनीति विशेषज्ञ,सभी से प्रेम करने वाले।" },
        { "name": "अशोक", "meaning": "जिसके पास कोई शोक नहीं, बिंदास रहने वाला" },
        { "name": "अश्विन्", "meaning": "घोड़ा फार्म के मालिक,घुड़ सवार करने वाले,देवताओं के वेद्य,जिनका जन्म अश्विनी नक्षत्र में हुआ हो सौभाग्यशाली," },
        { "name": "आण्विक/अण्विक", "meaning": "पदार्थ विज्ञान में विशेषज्ञ, भौतिकी प्रेमी, परमाणु विज्ञान प्रेमी।" },
        { "name": "आकर्ष", "meaning": "सबको अपनी ओर आकर्षित करने वाला, सुंदर,ज्ञानवान, शक्तिमान" },
        { "name": "आकाश", "meaning": "सब जगह से ख्याति प्राप्त करने वाला , प्रसिद्ध व्यक्ति" },
        { "name": "आत्मानंद", "meaning": "अपने आप में आनंद रहने वाला,मौज मस्ती में रहने वाला" },
        { "name": "आत्माराम", "meaning": "अपने आप में आनंद रहने वाला,मौज मस्ती में रहने वाला" },
        { "name": "आदर्श", "meaning": "अच्छी तरह से देखकर विचारकर कार्य करने वाला व्यक्ति,लोगों के लिए पथ-प्रदर्शक।" },
        { "name": "आदित्य", "meaning": "सूर्य के जैसे प्रकाशित, तेजस्वी,देव तुल्य" },
        { "name": "आदित्यनाथ", "meaning": "सूर्य भगवान् के उपासक, सूर्य जैसे परोकार करने वालों का स्वामी" },
        { "name": "आदित्यपाल", "meaning": "सूर्य के प्रकाश की रक्षा करने वाला वैज्ञानिक" },
        { "name": "आदित्यप्रकाश", "meaning": "सूर्य के प्रकाश के जैसे ओजस्वी तेजस्वी" },
        { "name": "आनंद", "meaning": "खुश मिजाज, प्रसन्न रहनेवाला, आनंद में रहने वाला" },
        { "name": "आनन्दप्रकाश", "meaning": "अपने आनंद से सबको प्रकाशित करने वाले" },
        { "name": "आर्जव", "meaning": "ईमानदारी, स्पष्टवादी,उदार हृदय वाले, अच्छा स्वभाव वाला" },
        { "name": "आर्यप्रताप", "meaning": "श्रेष्ठ गुण, श्रेष्ठ आचरण से युक्त महापुरुष" },
        { "name": "आर्षेय", "meaning": "ऋषि के संतान , ऋषि मुनि जैसे दार्शनिक" },
        { "name": "आलिम्पन", "meaning": "अपने लक्ष्य को पाने के लिये अच्छी तरह से लगे रहने वाला,मेहनती,पुरुषार्थी" },
        { "name": "आशुतोष", "meaning": "भगवान शिव का वह भक्त जो जल्दी प्रसन्न हो जाता है और संतुष्ट रहता है।" },
        { "name": "इक्ष्वाकु", "meaning": "अपनी इच्छा को पूरा करने वाला, अपने लक्ष्य को हासिल करने वाले" },
        { "name": "इन्द्र", "meaning": "परम् ऐश्वर्यशाली, सामर्थ्यवान" },
        { "name": "इन्द्रजित्", "meaning": "इन्द्र जैसे देवराज को भी जीतने की इच्छा रखने वाले, सामर्थ्यवान" },
        { "name": "इन्द्रदेव", "meaning": "देवराज इन्द्र को आदर्श मानने वाले,उनके जैसे सामर्थ्यवान" },
        { "name": "इन्द्रमणि", "meaning": "इन्द्र भगवान के भक्त,उनके जैसे सामर्थ्यवान" },
        { "name": "इन्द्रमित्र", "meaning": "इन्द्रराज के जैसे सामर्थ्यवान मित्र वाले, सामर्थ्यवान" },
        { "name": "इन्द्रराज", "meaning": "देवराज इन्द्र को राजा मानने वाले, उनके जैसे सामर्थ्यवान" },
        { "name": "इन्द्राभ", "meaning": "इन्द्र के जैसे ओज तेज और पराक्रम वाला" },
        { "name": "इन्द्रेश", "meaning": "देवराज इन्द्र को आदर्श मानने वाले,उनके जैसे सामर्थ्यवान" },
        { "name": "इन्धान", "meaning": "ओजस्वी तेजस्वी शक्तिशाली" },
        { "name": "इलेश", "meaning": "पृथ्वी पर राज करने वाले,राजा, गोभक्त" },
        { "name": "इषेश", "meaning": "बलशाली, शक्तिशाली," },
        { "name": "इष्ट", "meaning": "सबके प्यारे,दुलारे,ज्ञानी" },
        { "name": "उक्षन्", "meaning": "बैल के जैसे बलशाली शक्तिशाली" },
        { "name": "उग्रसेन", "meaning": "उग्र, युद्ध के लिए या राष्ट्र रक्षा के लिए तत्पर सेना वाले राजा" },
        { "name": "उज्ज्वल", "meaning": "ओजस्वी तेजस्वी मुखमंडल वाले" },
        { "name": "उत्तम", "meaning": "अच्छे गुणों वाला श्रेष्ठ इन्सान" },
        { "name": "उत्तीर्ण", "meaning": "अपने कार्य में सदा सफल रहने वाला, बुद्धिमान" },
        { "name": "उत्सव", "meaning": "सबसे अधिक मेहनत करने वाले, आनंद में रहने वाले" },
        { "name": "उत्सुक", "meaning": "किसी भी नया ज्ञान, पदार्थ को जानने की इच्छा रखने वाले, जिज्ञासु" },
        { "name": "उदय", "meaning": "उन्नति, प्रगति करने वाले, ज्ञानी" },
        { "name": "उदयवीर", "meaning": "ज्ञान से वीर बने हुए व्यक्ति, ज्ञानी महापुरुष, प्रगति उन्नति करने के लिए हमेशा आगे बढ़ने वाले, प्रगतिशील इन्सान" },
        { "name": "उद्गीथ", "meaning": "सामवेद को जानने वाले, ज्ञानी" },
        { "name": "उपेन्द्र", "meaning": "परम् ऐश्वर्यशाली, सामर्थ्यवान" },
        { "name": "उमाकांत", "meaning": "पार्वती जी के प्रिय भक्त, प्रसिद्धि पानेवाले" },
        { "name": "उमाशंकर", "meaning": "प्रसिद्धि पा कर सबके भला चाहने वाला," },
        { "name": "उमेश", "meaning": "यश, ख्याति, प्रसिद्धि आदि पाने वाले, शक्तिमान, राष्ट्र भक्त, सेना के लीडर, भगवान् शंकर के जैसे सामर्थ्यवान" },
        { "name": "ऋग्विद्", "meaning": "ऋग्वेद को जानने वाले, ज्ञानी बुद्धिमान" },
        { "name": "ऋतिक", "meaning": "सच्चे दिल वाले इन्सान" },
        { "name": "ऋतेन", "meaning": "सच्चे दिल वाले लोगों के लीडर" },
        { "name": "ऋभु", "meaning": "दिव्य गुणों वाले" },
        { "name": "ऋषभ", "meaning": "श्रेष्ठ आचरण करने वाले, शक्तिशाली बलवान" },
        { "name": "ऋषि", "meaning": "ज्ञानी,ध्यानी,परोपकारी,वैज्ञानिक" },
        { "name": "ऋषिक", "meaning": "ज्ञानी,ध्यानी,परोपकारी,वैज्ञानिक" },
        { "name": "ऋषिदेव", "meaning": "ज्ञानी,ध्यानी,परोपकारी, वैज्ञानिकों के शिष्य" },
        { "name": "ऋषिपाल", "meaning": "ऋषि की रक्षा करने वाले, ज्ञानी, बुद्धिमान" },
        { "name": "ऋषिमोहन", "meaning": "ज्ञानी,ध्यानी,परोपकारी, वैज्ञानिकों के शिष्य" },
        { "name": "ऋषिराज", "meaning": "ज्ञानी,ध्यानी,परोपकारी,वैज्ञानिक" },
        { "name": "ऋषिर्", "meaning": "ज्ञानी,ध्यानी,परोपकारी,वैज्ञानिक" },
        { "name": "ऋषीश", "meaning": "ज्ञानी,ध्यानी,परोपकारी, वैज्ञानिकों के शिष्य" },
        { "name": "एककर", "meaning": "एक ध्येय रखने वाले, एकाग्र मन वाले" },
        { "name": "एकचर", "meaning": "एक ध्येय रखने वाले, एकाग्र मन वाले" },
        { "name": "एकदृग्", "meaning": "एक ध्येय रखने वाले, एकाग्र मन वाले" },
        { "name": "एकदृष्टि", "meaning": "एक ध्येय रखने वाले, एकाग्र मन वाले" },
        { "name": "एकध्येय", "meaning": "एक ध्येय रखने वाले, एकाग्र मन वाले" },
        { "name": "एकनाथ", "meaning": "एक ही इष्टदेव वाले" },
        { "name": "एकराज", "meaning": "एक स्वामी के भक्त, ईश्वर भक्त" },
        { "name": "एकर्षि", "meaning": "अपने इष्ट किसी एक ज्ञान को पाने वाले, ऋषि मुनि वैज्ञानिक जैसे" },
        { "name": "एकवीर", "meaning": "एक स्वामी के भक्त, ईश्वर भक्त , हनुमान भक्त" },
        { "name": "एकव्रत", "meaning": "एक ध्येय रखने वाले, एकाग्र मन वाले" },
        { "name": "एकाचार्य", "meaning": "एक गुरु को मानने वाले" },
        { "name": "एकेश", "meaning": "एक स्वामी के भक्त, ईश्वर भक्त" },
        { "name": "एलन", "meaning": "सबको प्रेरणा देने वाले" },
        { "name": "एलेन", "meaning": "मोटिवेटेड लोगों के मालिक" },
        { "name": "ऐश्वर्य", "meaning": "सर्वशक्तिमान,सर्व गुण संपन्न, बहुत शक्तिशाली, गुणवान" },
        { "name": "ओंकार", "meaning": "हर समय भगवान् की भक्ति करने वाले" },
        { "name": "ओंकारु", "meaning": "हर समय भगवान् की भक्ति करने वाले" },
        { "name": "ओंकृत्", "meaning": "हर समय भगवान् की भक्ति करने वाले" },
        { "name": "ओंविन्द", "meaning": "भगवान के साक्षात्कार करने वाले योगी, सिद्ध महात्मा" },
        { "name": "ओजस्", "meaning": "ओजस्वी तेजस्वी शक्तिशाली" },
        { "name": "ओजस्पा", "meaning": "ओज तेज बल की रक्षा करने वाले, तेजस्वी ब्रह्मचारी" },
        { "name": "ओजोदा", "meaning": "ओज तेज बल को देने वाले" },
        { "name": "ओजोधा", "meaning": "ओज तेज बल धारण करने वाले, तेजस्वी ब्रह्मचारी" },
        { "name": "ओजोभू", "meaning": "ओज तेज बल धारण करने वाले, तेजस्वी ब्रह्मचारी" },
        { "name": "ओमानन्द", "meaning": "भगवान् की भक्ति में आनंद रहने वाला" },
        { "name": "ओमीश", "meaning": "ओम् की स्तुति करने वाले, भगवद्भक्ति करने वाले" },
        { "name": "ओमेन्द्र", "meaning": "भगवान के भक्त, भगवान ही जिसका मालिक है वह" },
        { "name": "ओम्राज", "meaning": "भगवद् साक्षात्कार से ओजस्वी तेजस्वी मुखमंडल वाले" },
        { "name": "कणाद", "meaning": "कण कण के महत्व को समझने वाले, बुद्धिमान, फिजिक्स के ज्ञाता" },
        { "name": "कनिष्ठ", "meaning": "सबसे छोटे पर सबके काम आने वाले" },
        { "name": "कपिल", "meaning": "लोगों को सुख युक्त अच्छे कर्म में लगाने वाला,पीले वर्ण वाला,मुनि के जैसे विद्वान, तपस्वी" },
        { "name": "कपींद्र", "meaning": "निर्बलों की सहायता करने वाले, परोपकारी" },
        { "name": "कमलजित्", "meaning": "जल के शुद्धिकरण करने वाले, पर्यावरणविद्" },
        { "name": "कमलेश", "meaning": "इन्द्रियों के स्वामी, सबके प्रिय" },
        { "name": "करणप्रीत", "meaning": "जीवनोपयोगी साधन गाड़ी,घर, ज़मीन जायदाद आदि से प्रेम करने वाले" },
        { "name": "कर्णजित्", "meaning": "राजा कर्ण जैसे सामर्थ्यवान को भी जितने की इच्छा करने वाले,अति सोचने वाले" },
        { "name": "कलेश", "meaning": "कलाकार" },
        { "name": "कल्पजित्", "meaning": "सामर्थ्यवान, सबसे श्रेष्ठ" },
        { "name": "कल्याण", "meaning": "सौभाग्यशाली, सबेरे भगवान् का सुमिरन करने वाले" },
        { "name": "कवीन्द्र", "meaning": "मेधावी, विद्वान्, ज्ञान, सामर्थ्यवान" },
        { "name": "कश्यप", "meaning": "ज्ञान चक्षु वाले, एक प्रसिद्ध ऋषि" },
        { "name": "कालज्ञ", "meaning": "गणितज्ञ" },
        { "name": "कुमार", "meaning": "सुख सुविधाओं को भोगने वाला, अच्छे खिलाड़ी" },
        { "name": "कृष्ण", "meaning": "भगवान् कृष्ण के समान कुशल नीतियों को जानने वाले,अच्छे नेता, कुशल प्रशासक" },
        { "name": "कृष्णकिशोर", "meaning": "" },
        { "name": "केतन", "meaning": "चिकित्सक, वैद्य" },
        { "name": "कौस्तुभ", "meaning": "समुद्र के रत्न(मणि) के जैसे बहुमूल्य इन्सान, विष्णु भगवान के वक्षस्थल पर धारण किया हुआ विशेष रत्न(मणि)।" },
        { "name": "क्षितीश", "meaning": "बहुत सी भूमियों के स्वामी,मालिक" },
        { "name": "खगेन्द्र", "meaning": "बहुत से वायुयान के मालिक, धनाढ्य" },
        { "name": "खगेश", "meaning": "बहुत से वायुयान के मालिक, धनाढ्य" },
        { "name": "खगेश्वर", "meaning": "बहुत से वायुयान के मालिक, धनाढ्य" },
        { "name": "खड्गेश", "meaning": "हथियार विक्रेता" },
        { "name": "खेलन", "meaning": "अच्छे खिलाड़ी" },
        { "name": "ख्यापाल", "meaning": "अपने वचन को पूरा करने वाले, वचन पालन करने वाले, आज्ञाकारी" },
        { "name": "गंगाधर", "meaning": "गंगा नदी की सफाई के लिए निरंतर प्रयास करने वाले, संकल्पवान" },
        { "name": "गजानन", "meaning": "हाथी के जैसे मुखवाले, गणेश भगवान के भक्त" },
        { "name": "गजेश", "meaning": "बहुत से हाथिओं के मालिक" },
        { "name": "गणेंद्र", "meaning": "ग्रूप लीडर" },
        { "name": "गणेश", "meaning": "ग्रूप लीडर, भगवान गणेश जैसे प्रथम पूजा, सम्मान के योग्य" },
        { "name": "गदाधर", "meaning": "शक्तिशाली बलवान सामर्थ्यवान" },
        { "name": "गन्धर्व", "meaning": "ख्याति प्राप्त प्रसिद्ध गायक, संगीतकार" },
        { "name": "गहन", "meaning": "गहरा चिंतन करने वाले, गंभीर चिंतक" },
        { "name": "गांगेय", "meaning": "जिसकी मां का नाम गंगा है वह, गंगा जल के समान पवित्र,निर्मल" },
        { "name": "गिरिधर", "meaning": "पर्वत के जैसे बड़े बड़े कष्टों को सहने वाले" },
        { "name": "गिरीश", "meaning": "पहाड़ जैसे बड़े बड़े लोगों के लीडर" },
        { "name": "गुणज्ञ", "meaning": "बहुत से गुणों के जानकार, ज्ञानी" },
        { "name": "गुणेन्द्र", "meaning": "बहुत से गुणों वाला,अच्छे दिलवाले" },
        { "name": "गुणेश", "meaning": "बहुत से गुणों वाला,अच्छे दिलवाले" },
        { "name": "गौरव", "meaning": "बड़ा, बड़े बनने की इच्छा वाला, बड़े-बड़े सोच विचार करने वाला, ज्ञान शक्ति सामर्थ्य में बड़े,गुरु की आज्ञा पालन करने वाले शिष्य," },
        { "name": "घटक", "meaning": "लगातार प्रयास करने वाले, प्रयत्नशील" },
        { "name": "घनराज", "meaning": "मेघविद्या को जानने वाले वैज्ञानिक" },
        { "name": "घनश्याम", "meaning": "बादल के समान कृष्ण वर्ण वाला,मेघ विद्या को जानने वाला, भगवान कृष्ण के समान आचरण वाला" },
        { "name": "घनालोक", "meaning": "अत्यधिक ओजस्वी तेजस्वी मुखमंडल वाले" },
        { "name": "घर्मद", "meaning": "सूर्य के जैसे परोपकारी" },
        { "name": "घर्मध", "meaning": "तेजस्वी शक्तिशाली" },
        { "name": "घर्मेश", "meaning": "तपस्वी सिद्ध योगी,मेघविद्या को जानने वाले वैज्ञानिक" },
        { "name": "चक्रेश", "meaning": "हथियार विशेष के शौकीन" },
        { "name": "चन्दन", "meaning": "सबको आह्लादित करने वाले, खुशमिजाज आदमी" },
        { "name": "चन्द्रकान्त", "meaning": "चन्द्र के समान प्रकाश वाला, शान्त मृदु स्वभाव वाला" },
        { "name": "चन्द्रचूड़", "meaning": "ठण्डा दिमाग़ वाले इन्सान" },
        { "name": "चन्द्रभ", "meaning": "चंद्रमा के जैसे शीतल शान्त स्वभाव वाले" },
        { "name": "चन्द्रभान", "meaning": "चन्द्र के जैसे शीतल शान्त स्वभाववाला,सबको शान्ति देने वाले" },
        { "name": "चन्द्रभानु", "meaning": "सूर्य और चंद्रमा के जैसे परोपकारी इन्सान" },
        { "name": "चन्द्रराज", "meaning": "चन्द्र के जैसे शीतल प्रकाश वाला, शान्त" },
        { "name": "चन्द्रशेखर", "meaning": "ठण्डा दिमाग़ वाले इन्सान" },
        { "name": "चन्द्रेश", "meaning": "चंद्रमा विशेषज्ञ, चंद्र को स्वामी मानने वाले" },
        { "name": "चरण", "meaning": "ज्ञानी, भ्रमणशील" },
        { "name": "चाणक्य", "meaning": "दानी,दीन दुखियों को देनेवाला,अच्छे कर्मों में सहयोग करने वाला, आचार्य चाणक्य के जैसे बुद्धिमान" },
        { "name": "चिन्मय", "meaning": "ज्ञान में मग्न रहने वाला" },
        { "name": "चिरायु", "meaning": "लंबी आयु को प्राप्त करने वाला" },
        { "name": "चैतन्य", "meaning": "सदैव संज्ञान में रहने वाला, जागरूक, ज्ञानी" },
        { "name": "च्यवन", "meaning": "भ्रमणशील,देश विदेश की यात्रा करने वाले" },
        { "name": "जगदीप", "meaning": "लोगों को ज्ञान प्रदान करने वाले" },
        { "name": "जगदीश", "meaning": "जगत् के स्वामी, लीडर, ग्रूप लीडर; सबके स्वामी, मालिक" },
        { "name": "जगन्", "meaning": "भ्रमणशील, ज्ञानी" },
        { "name": "जनक", "meaning": "अच्छी सन्तान पैदा करने वाले,राजा जनक के जैसे सामर्थ्यवान" },
        { "name": "जनेश", "meaning": "बहुत से लोगों के लीडर" },
        { "name": "जमदग्नि", "meaning": "जीवन के लिए,राष्ट्र के लिए कुछ विशेष करने के लिए धधकती हुई आग है जिसके अंदर वह व्यक्ति, महान् ऋषि" },
        { "name": "जय", "meaning": "विजेता, शत्रुओं को मटियामेट करने वाले" },
        { "name": "जयक", "meaning": "विजेता, शत्रुओं को मटियामेट करने वाले" },
        { "name": "जयद", "meaning": "विजेता,शत्रुओं को मटियामेट करने वाले" },
        { "name": "जयेश", "meaning": "विजेताओं के लीडर" },
        { "name": "जलप", "meaning": "जल संरक्षण करने वाले, पर्यावरण संरक्षण करने वाले" },
        { "name": "जितारि", "meaning": "शत्रुओं को परास्त करने वाले" },
        { "name": "जितेंद्र", "meaning": "इन्द्रियों को वश में रखनेवाला, संयमी" },
        { "name": "जिष्णु", "meaning": "शत्रुओं को परास्त करने वाले , विजेता" },
        { "name": "जैमिनी", "meaning": "प्रख्यात ऋषि, दार्शनिक," },
        { "name": "ज्ञानद", "meaning": "गुरु, आचार्य, अध्यापक" },
        { "name": "ज्ञानेश", "meaning": "ज्ञानी, विद्वान्, वैज्ञानिक" },
        { "name": "ज्योतिष्मान्", "meaning": "खगोल वैज्ञानिक" },
        { "name": "तत्वज्ञ", "meaning": "पदार्थ वैज्ञानिक" },
        { "name": "तत्वविद्", "meaning": "पदार्थ वैज्ञानिक" },
        { "name": "तत्वेश", "meaning": "तत्व/पदार्थ वैज्ञानिक" },
        { "name": "तन्मय", "meaning": "अपने लक्ष्य की प्राप्ति के लिए लगे रहने वाला, मेहनती" },
        { "name": "तपस्", "meaning": "तपस्वी, इष्ट लक्ष्य के लिए मेहनत करने वाले" },
        { "name": "तरुण", "meaning": "कर्मठ युवा" },
        { "name": "तापस्", "meaning": "तपस्वी, इष्ट लक्ष्य के लिए मेहनत करने वाले" },
        { "name": "तितिक्षु", "meaning": "न्याय के लिए क्षमाशील, सहनशील" },
        { "name": "तेजस्", "meaning": "ओजस्वी,तेजस्वी,सहन करने वाला, क्षमा करने वाला" },
        { "name": "तैजस्", "meaning": "ओजस्वी तेजस्वी वक्ता" },
        { "name": "त्यजेन्द्र", "meaning": "राष्ट्र के लिए त्याग करने के स्वभाववाला" },
        { "name": "त्र्यंबक", "meaning": "दूरदर्शी, ज्ञानी, ओजस्वी, तेजस्वी" },
        { "name": "दक्ष", "meaning": "कुशल, निपुण, तपस्वी" },
        { "name": "दधीचि", "meaning": "परोपकार के लिए सर्व त्याग करने वाले महान इंसान" },
        { "name": "दर्पण", "meaning": "शीशा के जैसे साफ दिल वाले,अच्छे इंसान" },
        { "name": "दर्शन", "meaning": "ज्ञानी, विद्वान्, परोपकारी" },
        { "name": "दलजित्", "meaning": "ग्रूप विजेता,सब को हराने वाले" },
        { "name": "दिगीश", "meaning": "सर्वाधिक शक्तिशाली" },
        { "name": "दिग्विजय", "meaning": "सब तरफ जीतने वाला, बुद्धिमान" },
        { "name": "दिनेश", "meaning": "सूर्य के जैसे तेज वाले, ओजस्वी" },
        { "name": "दिलीप", "meaning": "सूर्यवंशी राजा के जैसे सामर्थ्य वाले" },
        { "name": "दिवाकर", "meaning": "सूर्य के जैसे प्रकाशित,ज्ञान दाता" },
        { "name": "दिव्यांग", "meaning": "सुंदर अंगों वाले" },
        { "name": "दीनेश", "meaning": "गरीब दुखियों की सेवा करने वाले, परोपकारी" },
        { "name": "दीपक", "meaning": "ज्ञानी, विद्वान्, परोपकारी" },
        { "name": "दीपाभ", "meaning": "दीपक के जैसे प्रकाश कांति तेज वाले" },
        { "name": "दीपेंद्र", "meaning": "ज्ञान के स्वामी,सब को ज्ञान देने वाले" },
        { "name": "दीपेन", "meaning": "ज्ञान के स्वामी,सब को ज्ञान देने वाले" },
        { "name": "दीपेश", "meaning": "ज्ञान के स्वामी,सब को ज्ञान देने वाले" },
        { "name": "दुर्गेश", "meaning": "शक्तिशाली धर्मपत्नी के स्वामी" },
        { "name": "देवेन्द्र", "meaning": "देव तुल्य,अच्छे लोगों के स्वामी, लीडर" },
        { "name": "देवेश", "meaning": "अच्छे लोगों के लीडर" },
        { "name": "धनद", "meaning": "दानी, परोपकारी" },
        { "name": "धनप", "meaning": "धन की रक्षा करने वाले" },
        { "name": "धनेश", "meaning": "बहुत से धन संपत्तियों के मालिक" },
        { "name": "धर्मज", "meaning": "धार्मिक व्यवहार से उत्पन्न होने वाले" },
        { "name": "धर्मराज", "meaning": "न्याय अहिंसा सत्य परोपकार आदि व्यवहार कुशल" },
        { "name": "धर्मेंद्र", "meaning": "धर्म के स्वामी, धार्मिक, अच्छे आचरण वाला, अच्छे आचरण के मालिक, अच्छे आचरण करने वाले के स्वामी" },
        { "name": "धीमय", "meaning": "बुद्धिमान ज्ञानी" },
        { "name": "धीरज", "meaning": "साहस, सामर्थ्य से उत्पन्न होने वाले" },
        { "name": "धीरेन्द्र", "meaning": "धीरज, धैर्य रखने वाला,अच्छे लोगों के लीडर" },
        { "name": "धीरेश", "meaning": "धैर्यवान, सामर्थ्यवान, बहादुर, साहसी" },
        { "name": "धुरीण", "meaning": "महत्वपूर्ण कार्यों में नियुक्त अधिकारी ,नभस् दुष्टों को दंड देने वाले, आकाश के जैसे खुला हृदय वाले" },
        { "name": "धैर्य", "meaning": "बहादुर, साहसी" },
        { "name": "ध्येय", "meaning": "चिंतक, विश्लेषक,लक्ष्य प्राप्ति में रहने वाले" },
        { "name": "नकुल", "meaning": "जिसका कोई घर नहीं ऐसे त्यागी तपस्वी, पांडवों के जैसे शक्तिशाली" },
        { "name": "नदिम", "meaning": "नदी को मापने वाला,नौसेना अध्यक्ष,जलयात्री" },
        { "name": "नम्रक", "meaning": "विनम्र स्वभाववाला" },
        { "name": "नरेंद्र", "meaning": "मनुष्यों के लीडर, नेता" },
        { "name": "नरेश", "meaning": "राजा, लीडर, नेता" },
        { "name": "नवदीप", "meaning": "नये नये ज्ञान विज्ञान वाले" },
        { "name": "नवांग", "meaning": "सुंदर अंगों वाला, सुंदर व्यक्ति" },
        { "name": "नवीन", "meaning": "नया नया पसंद करने वाला" },
        { "name": "नागेन", "meaning": "बलवान शक्तिशालियों के लीडर" },
        { "name": "नागेन्द्र", "meaning": "बलवान शक्तिशालियों के लीडर" },
        { "name": "नागेश्वर", "meaning": "बलवान शक्तिशालियों के लीडर" },
        { "name": "नायक", "meaning": "नेता,फौज लीडर" },
        { "name": "नारायण", "meaning": "मनुष्यों के मध्य रहना जिसको प्रिय लगता हो,समूह मे रहकर सूचना को आदान-प्रदान करने वाला।भगवान् विष्णु के जैसे अच्छे गुणों वाला।" },
        { "name": "निखिल", "meaning": "विशाल, महान् व्यक्ति" },
        { "name": "निर्माल्य", "meaning": "स्वच्छ पवित्र हृदय वाले" },
        { "name": "निश्श्रेयस्", "meaning": "स्वर्ग के जैसे सुख को पाने की इच्छा करने वाले" },
        { "name": "नीरज", "meaning": "अच्छा स्वभाव वाला, जिसके खराब आचरण समाप्त हो गये ऐसा" },
        { "name": "नृपराज", "meaning": "राजा, राजा के जैसे ऐश्वर्यशाली" },
        { "name": "परमजित्", "meaning": "उत्कृष्ट तरीके से विजय पानेवाले" },
        { "name": "परमानंद", "meaning": "सदा आनंद में रहने वाले, उत्कृष्ट आनंद वाले" },
        { "name": "परमेन्द्र", "meaning": "सबके लीडर, देवराज इन्द्र के प्रिय" },
        { "name": "पार्थ", "meaning": "वह व्यक्ति जो कुंती पुत्र अर्जुन के समान ओजस्वी, उग्र, प्रतिभाशाली, शक्तिशाली, धनुष विद्या में निपुण और भगवान कृष्ण का भक्त हो।" },
        { "name": "पीयूष", "meaning": "अमर यश कीर्ति वाले" },
        { "name": "प्रकाश", "meaning": "अच्छी तरह से सुर्खियों में आने वाला, प्रकाशित मुखमंडल वाला" },
        { "name": "प्रणीत", "meaning": "अच्छी तरह से लोगों को आगे बढ़ाने वाले, नेता" },
        { "name": "प्रतीक", "meaning": "पढ़ें हुए पाठ को याद करने वाले, पहचानने में मदद करने वाले" },
        { "name": "प्रथम", "meaning": "प्रख्यात पाने वाले, प्रथम रहने वाले" },
        { "name": "प्रद्युम्न", "meaning": "अच्छा बलवान, शक्तिमान" },
        { "name": "प्रभाकर", "meaning": "सबको शिक्षित करने वाले" },
        { "name": "प्रभात", "meaning": "ज्ञान रूपी प्रकाश से आलोकित, ज्ञानी" },
        { "name": "प्रभास", "meaning": "अच्छी तरह से सुर्खियों में आने वाला, प्रकाशित मुखमंडल वाला" },
        { "name": "प्रसिद्ध", "meaning": "अच्छी तरह से सभी से मान सम्मान पाने वाला,हर क्षेत्र में गमन करने वाला,ज्ञानी,नामी,ख्याती वाला व्यक्ति।" },
        { "name": "प्रांजल", "meaning": "ईमानदार, स्पष्ट वक्ता" },
        { "name": "प्रेम", "meaning": "सबसे प्रेम करने वाले" },
        { "name": "बन्धुल", "meaning": "फ्रेंडली, जल्दी मिल झूल कर रहने वाले" },
        { "name": "बलजीत", "meaning": "बलशाली लोगों को भी जीतने वाला,रेसलर" },
        { "name": "बलद", "meaning": "बलवान सामर्थ्यवान" },
        { "name": "बलप", "meaning": "बलवान सामर्थ्यवान" },
        { "name": "बलराम", "meaning": "भगवान कृष्ण के बड़े भाई के जैसे बलवान, सामर्थ्यवान, शक्तिमान" },
        { "name": "बलवीन्द्र", "meaning": "बलवान, सामर्थ्यवान, शक्तिमान , सबके स्वामी" },
        { "name": "बलवीर", "meaning": "बलवान, शक्तिशाली" },
        { "name": "बहुज्ञ", "meaning": "बहुत ज्ञानी, विद्वान्" },
        { "name": "बाहुक", "meaning": "विशाल भुजाओं वाले, बलवान" },
        { "name": "बाहुबली", "meaning": "बलशाली भुजाओं वाला, बलवान, शक्तिमान" },
        { "name": "बुद्ध", "meaning": "ज्ञानी, ओजस्वी तेजस्वी" },
        { "name": "बुध", "meaning": "समझदार, बुद्धिमान" },
        { "name": "ब्रह्मद", "meaning": "सिद्धयोगी, तपस्वी" },
        { "name": "भक्तराज", "meaning": "भक्तों में श्रेष्ठ" },
        { "name": "भजिन्", "meaning": "सेवा परोपकार करने वाले" },
        { "name": "भद्रबाहु", "meaning": "परोपकारी बलवान सामर्थ्यवान बहादुर इन्सान" },
        { "name": "भद्रेश", "meaning": "अच्छे लोगों के लीडर" },
        { "name": "भरत", "meaning": "लोगों के भरण पोषण करने वाला,राजा भरत के जैसे पराक्रमी" },
        { "name": "भविष्णु", "meaning": "विद्यमान रहने के स्वभाव वाले" },
        { "name": "भव्य", "meaning": "सुंदर, दर्शनीय भव्य" },
        { "name": "भव्येश", "meaning": "भव्य सुंदर अच्छे लोगों के लीडर" },
        { "name": "भानु", "meaning": "सूर्य के जैसे ओजस्वी तेजस्वी मुखमंडल वाले" },
        { "name": "भारवि", "meaning": "प्रकाश, ज्ञान को पाने वाला,भरण पोषण मैनेजमेंट को जानने वाला" },
        { "name": "भास्कर", "meaning": "ज्ञानरूपी प्रकाश को बांटने वाले" },
        { "name": "भीम", "meaning": "जिससे लोग डरते हैं, बलशाली, शक्तिमान" },
        { "name": "भुवन", "meaning": "अपनी सत्ता को बनाए रखने वाला" },
        { "name": "भुवनेश्वर", "meaning": "सम्पूर्ण जगत के लीडर, विश्वनेता" },
        { "name": "भूपाल", "meaning": "राजा,नेता, लीडर" },
        { "name": "भूपेन", "meaning": "राजाओं के भी राजा,सबके लीडर" },
        { "name": "भोगद", "meaning": "सुख सुविधाएं बांटने वाले परोपकारी व्यक्ति" },
        { "name": "मङ्गल", "meaning": "सदैव हित कार्य के लिये अग्रसर रहने वाले,अपने इष्ट लक्ष्य की प्राप्ति के लिये सतत् प्रयत्नशील" },
        { "name": "मनप्रीत", "meaning": "मन से प्रेम करने वाले,मन वचन और कर्म से एक" },
        { "name": "मनीश", "meaning": "चिंतन मनन करने वाले के भी लीडर, नेता" },
        { "name": "मनीष", "meaning": "मन की इच्छा पूरी करने वाले, मन मुताबिक इच्छा वाला, मननशील, सोच समझकर काम करने वाले" },
        { "name": "मनोज", "meaning": "मन के उपर विजय पाने वाले, मन की सोच अनुसार पैदा होने वाले" },
        { "name": "मनोहर", "meaning": "आकर्षक व्यक्तित्व वाले, सबके लिए पसंदीदा,मन को हरने वाले, सुंदर व्यक्ति" },
        { "name": "महावीर", "meaning": "भगवान महावीर के भक्त, भगवान् हनुमान के जैसे सबसे बलवान, सामर्थ्यवान, शक्तिमान" },
        { "name": "महेन्द्र", "meaning": "बड़े बड़े लोगों के मालिक, लीडर" },
        { "name": "महेश", "meaning": "बड़े बड़े लोगों के मालिक, लीडर" },
        { "name": "मिलन", "meaning": "सबसे मिलकर रहने वाले, मिलनसार व्यक्ति, सबसे मिलने के स्वभाववाला" },
        { "name": "मुकुंद", "meaning": "दयालु, बंधन से मुक्त करने वाले" },
        { "name": "मुकुल", "meaning": "कली की भांति नया,सब को पसंद आने वाले" },
        { "name": "मुकेश", "meaning": "दुःख मुक्ति दाता , सबके मालिक" },
        { "name": "मृगांक", "meaning": "चंद्रमा के जैसे शीतल शान्त स्वभाव वाला,मृग के जैसे सुंदर चिह्न लक्षण वाला" },
        { "name": "मृणाल", "meaning": "खुद कष्टों सह कर भी दूसरों की मदद करने वाले" },
        { "name": "मोदी", "meaning": "खुशमिजाज, लोगों को खुश रखने वाला" },
        { "name": "मोहन", "meaning": "आकर्षक व्यक्तित्व वाला,सब को मोहित करने वाले" },
        { "name": "यक्ष", "meaning": "आदरणीय, सम्मान के योग्य, पूजनीय, सत्कार योग्य" },
        { "name": "यजिन्", "meaning": "धार्मिक,यज्ञ प्रेमी" },
        { "name": "यथार्थ", "meaning": "वास्तविक धन संपत्तियों वाले" },
        { "name": "यदुविन्द्र", "meaning": "यदु वंश के राजाओं के जैसे शक्तिशाली गुणवान" },
        { "name": "यशपाल", "meaning": "मिले हुए यश, कीर्ति, सम्मान को सुरक्षित रखने वाले" },
        { "name": "यशस्य", "meaning": "सम्मान और यश की ओर प्रगति करने वाले" },
        { "name": "याज्ञिक", "meaning": "यज्ञ करने वाले" },
        { "name": "यास्क", "meaning": "भाषा वैज्ञानिक" },
        { "name": "युग", "meaning": "सबसे मिलकर रहने वाले" },
        { "name": "युगल", "meaning": "जोड़े में रहना पसंद करने वाले, सहयोग करने के स्वभाव वाले" },
        { "name": "युवराज", "meaning": "राजकुमार, अल्पायु में ही ज्ञान प्राप्त करने वाला" },
        { "name": "योगराज", "meaning": "योग विद्या विशेषज्ञ" },
        { "name": "योगेन्द्र", "meaning": "योग विशेषज्ञ, योगा के लीडर,योग विद्या विशेषज्ञ" },
        { "name": "योगेश", "meaning": "योग के जानकार, योगी, योग विद्या विशेषज्ञ" },
        { "name": "रणजित्", "meaning": "युद्ध में विजय पानेवाला,वीर, शक्तिशाली" },
        { "name": "रमण", "meaning": "सबके साथ घुल-मिल करने वाले,खेल प्रेमी" },
        { "name": "रवीन्द्र", "meaning": "सूर्य भगवान् के भक्त" },
        { "name": "रश्मि", "meaning": "सूर्य किरण के जैसे गतिशील रहने वाले" },
        { "name": "रसीक", "meaning": "रसवाले,सब को आनन्द देने वाले" },
        { "name": "राकेश", "meaning": "चंद्रमा जैसे शीतल शान्त स्वभाव वाले" },
        { "name": "राजा", "meaning": "राष्ट्र सेवक, ऐश्वर्यशाली" },
        { "name": "राजेन्द्र", "meaning": "राजाओं के भी राजा, चक्रवर्ती सम्राट" },
        { "name": "राजेश", "meaning": "राजाओं के भी राजा, चक्रवर्ती सम्राट" },
        { "name": "रामदेव", "meaning": "भगवान् राम के भक्त, प्रसिद्ध योग गुरु" },
        { "name": "रामप्रकाश", "meaning": "भगवान राम के नाम को फ़ैलाने वाले,राम भक्त" },
        { "name": "रामप्रसाद", "meaning": "भगवान् राम के प्रसाद स्वरूप,खुशमिजाज आदमी" },
        { "name": "राशिद", "meaning": "बड़े दानी सज्जन,जरूरतमंद लोगों को बहुत अधिक देने वाले,समाज सेवी।" },
        { "name": "राहुल", "meaning": "दानी लोगों से मिलने वाला, मिलनसार,एक ऐसा व्यक्ति जो लोगों से मिलने में रुचि रखता हो, सामाजिक कार्यों में भाग लेता हो, दोस्तों और परिवार के साथ समय बिताने में मजा लेने वाला, नए लोगों से मिलने और दोस्त बनाने में रुचि रखने वाला।" },
        { "name": "रूपेश", "meaning": "सुंदर स्वरूप वाले" },
        { "name": "रोमन", "meaning": "अच्छा बोलने वाले वक्ता, प्रवक्ता" },
        { "name": "रोहित", "meaning": "जहां जरूरत पड़े वहां प्रकट होने वाला, समाजसेवी" },
        { "name": "लक्ष्मण", "meaning": "अच्छी किस्मत वाला, समृद्धशाली,शुभ लक्षणों से युक्त" },
        { "name": "लक्ष्य", "meaning": "इच्छित प्राप्ति को देखकर चलने वाले" },
        { "name": "लक्ष्यद", "meaning": "अभीष्ट लक्ष्य को प्राप्त कराने वाले अध्यापक" },
        { "name": "ललित", "meaning": "खेल प्रेमी, विद्या प्रेमी, प्रिय, सुंदर, मनोहर" },
        { "name": "लव", "meaning": "नेगेटिविटी को नाश करने वाला,सकारात्मक सोच वाला" },
        { "name": "लवणेश", "meaning": "नमक फैक्ट्री के मालिक, धनाढ्य" },
        { "name": "लावण्य", "meaning": "सुंदर, मनोहर व्यक्ति" },
        { "name": "लीलाधर", "meaning": "विविध लीला कला से परिपूर्ण व्यक्ति" },
        { "name": "लोकप", "meaning": "नेता राजा, मंत्री" },
        { "name": "लोकमणि", "meaning": "लोकप्रिय, सबके पसंदीदा व्यक्ति" },
        { "name": "लोकराज", "meaning": "नेता,राजा , मंत्री" },
        { "name": "लोकेन", "meaning": "नेता राजा मंत्री" },
        { "name": "लोकेन्द्र", "meaning": "नेता राजा मंत्री" },
        { "name": "लोकेश", "meaning": "मनुष्यों के लीडर, नेता" },
        { "name": "लोहित", "meaning": "रक्त वर्ण वाले व्यक्ति" },
        { "name": "वंशप", "meaning": "वंश,कुल, परिवार की रक्षा करने वाले वीर" },
        { "name": "वचन", "meaning": "अभिव्यक्ति के सामर्थ्य वाले" },
        { "name": "वत्स", "meaning": "प्यारा,भोला, कर्तव्यनिष्ठ बालक" },
        { "name": "वन्दन", "meaning": "आदरणीय मान्यवर" },
        { "name": "वरण", "meaning": "सबके प्रिय इन्सान" },
        { "name": "वरुण", "meaning": "वायु के जैसे परोपकारी इन्सान" },
        { "name": "वरेण्य", "meaning": "सबके प्रिय इन्सान" },
        { "name": "विकाश", "meaning": "अच्छी तरह से प्रदर्शन करने वाले, खुशी रहने वाला" },
        { "name": "विकास", "meaning": "ऐसा व्यक्ति जो अपने लक्ष्य को प्राप्त करने के लिए, कुछ विशेष ज्ञान प्राप्त करने के लिए सदैव सक्रिय रहता है और जो अपने ज्ञान से दूसरों को अनुशासित करता है।" },
        { "name": "विक्रम", "meaning": "पराक्रमी, ध्यान से अपने लक्ष्य की ओर बढ़ने वाला" },
        { "name": "विघ्नेश", "meaning": "विघ्न ,कष्ट,बाधायें हटाने वाले,दूर कर देने वाले, ऐश्वर्यवान,शक्तिशाली,सामर्थ्यवान समाजसेवी व्यक्ति।" },
        { "name": "विजय", "meaning": "विशेष रूप से जीतने वाले, सामर्थ्यवान" },
        { "name": "विजयेन्द्र", "meaning": "जीत हासिल करने वाले,सब के बोस" },
        { "name": "विनोद", "meaning": "सबसे घुलने मिलने वाले, आनंद कराने वाले" },
        { "name": "विप्रतोष", "meaning": "विद्वान् महापुरुषों को संतुष्ट करने वाले, विशेष रूप से अच्छी तरह से पुरुषार्थ कर संतुष्ट रहने वाले" },
        { "name": "विमल", "meaning": "पवित्र हृदय वाले, अच्छा इंसान" },
        { "name": "विराट", "meaning": "विशेष रूप से प्रसिद्धि पाने वाला,बड़ा व्यक्तित्व वाला" },
        { "name": "विवेक", "meaning": "विशेष ज्ञान वाला, सही ग़लत को ठीक ठीक जानने वाले" },
        { "name": "विश्वनाथ", "meaning": "सबसे अधिक सामर्थ्य शाली" },
        { "name": "विश्वनाथन", "meaning": "सबसे अधिक सामर्थ्य शाली" },
        { "name": "विश्वामित्र", "meaning": "सबके मित्र, सबसे मिलने वाले" },
        { "name": "विश्वास", "meaning": "विशेष प्रण लेने वाले, सबके भरोसेमंद" },
        { "name": "शंकर", "meaning": "सबके कल्याण चाहने वाले, सबको कल्याण करने वाला, सुख देने वाले" },
        { "name": "शंकेश", "meaning": "जिज्ञासु स्वभाव वाला" },
        { "name": "शक्तिधर", "meaning": "शक्तिशाली, बलवान" },
        { "name": "शक्तिनंदन", "meaning": "अपनी शक्ति से दूसरों को आनंदित करने वाले ,शंवान् कल्याण चाहने वाला, भलाई की चाहत रखने वाला" },
        { "name": "शतघ्न", "meaning": "सैकड़ों लोगों को पराजित करने का सामर्थ्य वाला" },
        { "name": "शत्रुंजय", "meaning": "शत्रुओं को मटियामेट करने वाला,वीर" },
        { "name": "शब्दज्ञ", "meaning": "शब्दों की रचना को जानकार, ज्ञानी" },
        { "name": "शशांक", "meaning": "चंद्रमा के समान शीतल स्वभाव वाला व्यक्ति, परोपकारी और समाजसेवी व्यक्ति।" },
        { "name": "शशी", "meaning": "आनंद में रहने वाले, चंद्र के जैसे शान्त, शीतल स्वभाववाला" },
        { "name": "शांडिल्य", "meaning": "ऋषि पुत्र, ऋषि मुनि के जैसे अच्छे आचरण वाला" },
        { "name": "शान्तनु", "meaning": "कल्याणकारी,लोक हित,लाभदायक मार्गदर्शन करने वाले" },
        { "name": "शामक", "meaning": "शान्त,कोमल स्वभाव वाले व्यक्ति।दूसरों को शान्त कराने वाले।" },
        { "name": "शारङ्ग", "meaning": "हाथी के जैसे बलवान, शक्तिमान" },
        { "name": "शार्ङ्ग", "meaning": "भगवान विष्णु के धनुष के जैसे लक्ष्य प्राप्ति करने वाले" },
        { "name": "शेखर", "meaning": "मुकुट के समान सर्वोच्च पद पर रहने वाले, सर्वोच्च सर्वोत्तम इन्सान" },
        { "name": "शैलेन्द्र", "meaning": "पर्वत के समान अडिग रहने वाला, सामर्थ्यवान" },
        { "name": "श्यामक", "meaning": "ज्ञानी, गतिशील,अपने लक्ष्य की प्राप्ति के लिये सदैव जागरूक रहने वाला।देवताओं के भ्राता के समान ऐश्वर्यशाली" },
        { "name": "श्रीजन", "meaning": "अच्छे लोगों के मित्र, सबके हितैषी" },
        { "name": "श्रीधर", "meaning": "समृद्ध, ऐश्वर्यशाली, भाग्यशाली, धनवान, देवी लक्ष्मी का महान भक्त।" },
        { "name": "संजय", "meaning": "अच्छी तरह से विजय प्राप्त करने वाला, न्याय के साथ विजय पानेवाला, मार्गदर्शक" },
        { "name": "संजीव", "meaning": "अच्छी तरह से जीवन यापन करने वाले,अच्छे लक्ष्य को लेकर जीने की इच्छा करने वाला, अपने कर्तव्य को अच्छी तरह से निर्वहन करने वाला, ओजस्वी, तेजस्वी व्यक्ति।" },
        { "name": "संवित्", "meaning": "ज्ञानी,बुद्धिमान,मेधावी,अच्छी तरह से जानने वाला, अच्छा विचारक,मननशील,ज्ञाता, विशेषज्ञ" },
        { "name": "संविद्", "meaning": "ज्ञानी,बुद्धिमान,मेधावी,अच्छी तरह से जानने वाला, अच्छा विचारक,मननशील,ज्ञाता, विशेषज्ञ" },
        { "name": "सचीन", "meaning": "एकता चाहने वालों के लीडर, एकता प्रिय, मिलनसार" },
        { "name": "सजीव", "meaning": "अच्छे लक्ष्य को लेकर जीने की इच्छा करने वाला, अपने कर्तव्य को अच्छी तरह से निर्वहन करने वाला, ओजस्वी, तेजस्वी व्यक्ति।" },
        { "name": "सतीश", "meaning": "धर्मपत्नी को बहुत ज्यादा प्रेम करने वाले" },
        { "name": "सतीशचन्द्र", "meaning": "धर्मपत्नी को बहुत ज्यादा प्रेम करने वाले,सरल शान्त आनंदित स्वभाव वाले" },
        { "name": "सत्नाम", "meaning": "सत्य नाम वाले, भगवान् के नाम जप करने वाले" },
        { "name": "सत्येन्द्र", "meaning": "सत्य, उचित बोलने वाले के स्वामी" },
        { "name": "सन्तोष", "meaning": "अच्छी तरह से संतुष्ट रहने वाले" },
        { "name": "समीर", "meaning": "अच्छा ज्ञान पाने वाला, ज्ञानी" },
        { "name": "सम्पूर्णानंद", "meaning": "जिसके पास आनंद की कोई कमी नहीं, पूर्ण आनंद वाले" },
        { "name": "सम्यग्", "meaning": "अच्छा इंसान" },
        { "name": "सहदेव", "meaning": "हर समय भगवान का सुमिरन करने वाला" },
        { "name": "साजन", "meaning": "मित्रों के साथ रहने वाला, एकता प्रिय" },
        { "name": "सिद्धार्थ", "meaning": "जो अपने प्रयोजन(लक्ष्य) को सफल करने में लगा हो या फिर जिसका प्रयोजन सफल हो चुका हो ऐसे मेहनती,पुरुषार्थी व्यक्ति।जिससे लोगों का प्रयोजन सिद्ध होता हो ऐसे परोपकारी व्यक्ति।" },
        { "name": "सीताराम", "meaning": "मर्यादा पुरुषोत्तम भगवान राम और माता सीता को आदर्श मानने वाले, उनके जैसे आचरण करने वाले" },
        { "name": "सुतपा", "meaning": "ज्ञानी, तपस्वी" },
        { "name": "सुदर्शन", "meaning": "दिव्य,सुंदर स्वरूप वाले" },
        { "name": "सुदीप", "meaning": "अच्छी तरह से सुर्खियों में आने वाले, ज्ञानी" },
        { "name": "सुनील", "meaning": "अच्छी तरह से लोगों के लक्ष्य को हासिल कराने वाले" },
        { "name": "सुभाष", "meaning": "मधुर, मीठी मीठी बातें बोलने वाले" },
        { "name": "सुभाषचन्द्र", "meaning": "मीठी बातें बोलते हुए परोपकार करने वाले,शीतल शान्त स्वभाववाला" },
        { "name": "सुमित", "meaning": "माप तौल कर व्यवहार करने वाले" },
        { "name": "सुवास", "meaning": "अच्छे निवास स्थान वाले, बड़े बड़े घरों वाला" },
        { "name": "सृजन", "meaning": "नये नये चीजें बनाने वाले, आविष्कार करने वाले" },
        { "name": "सोमदेव", "meaning": "चन्द्रमा के जैसे सौम्य स्वभाव वाले" },
        { "name": "सोमनाथ", "meaning": "शान्ति प्रिय समुदाय के लीडर" },
        { "name": "सोमशेखर", "meaning": "ठंडा दिमाग़ वाले, शान्त स्वभाव वाला" },
        { "name": "सौरभ", "meaning": "अपने विशेष महान् कर्म से विख्यात व्यक्ति। सुगन्ध के जैसे अपने कर्म से सब जगह महकने वाले,प्रसिद्ध ख्याति प्राप्त व्यक्ति।" },
        { "name": "हनुमान्", "meaning": "द ग्रेट खली के जैसे बड़ी ठोड़ी वाले, पवनसुत हनुमान के जैसे सामर्थ्यवान" },
        { "name": "हरदीप", "meaning": "भगवान शिव के भक्त, उनके नाम को फ़ैलाने वाले" },
        { "name": "हरभजन", "meaning": "शंकर भगवान के भजन करने वाले,प्रभु भक्त" },
        { "name": "हरीन", "meaning": "शेरों के मालिक" },
        { "name": "हरीश", "meaning": "भगवान विष्णु के भक्त, सेवा भाव वाले इन्सान" },
        { "name": "हर्ष", "meaning": "खुशमिजाज आदमी" },
        { "name": "हर्षदीप", "meaning": "खुशमिजाज रहते हुए सब को ज्ञानी बनाने वाले" },
        { "name": "हर्षवर्धन", "meaning": "लोगों की खुशी को बढ़ाने वाले" },
        { "name": "हवींद्र", "meaning": "बहुत से उत्तम पदार्थों के मालिक" },
        { "name": "हार्दिक", "meaning": "हृदय अनुकूल चलने वाले,मन की सुनने वाले" },
        { "name": "हितानंद", "meaning": "लोगों के हित करना ही जिसके लिए आनंद है वह, समाजसेवी" },
        { "name": "हितेष", "meaning": "सबके हित चाहने वाला, परोपकारी लोगों के लीडर" },
        { "name": "हृदय", "meaning": "पदार्थ ले जाने,ले आने और देने के स्वभाव वाला" },
        { "name": "हृदीश", "meaning": "हृदय अनुकूल चलने वाले" },
        { "name": "हेमन्त", "meaning": "शीत ऋतु के जैसे ठंडे दिमाग वाले" },
        { "name": "हेमराज", "meaning": "बहुत से संपत्तियों के मालिक" }
    ],
    Girl: [
        { "name": "Aabha", "meaning": "Radiant and brilliant women" },
        { "name": "Aajna", "meaning": "A women who knows well, obedient women" },
        { "name": "Aakanksha", "meaning": "A women who understands the true meaning of words,women with auspicious desires" },
        { "name": "Aakriti", "meaning": "Beautiful women with swaying curls, beautiful" },
        { "name": "Aamrapali", "meaning": "Owner of a vast mango garden" },
        { "name": "Aaradhya", "meaning": "worthy of respect, attains success from all directions" },
        { "name": "Aarti", "meaning": "women who preserves to achieve her goals" },
        { "name": "Aditi", "meaning": "A women who cannot be destroyed, strong and powerful" },
        { "name": "Adya", "meaning": "the first to be,attains the first position" },
        { "name": "Ahalya", "meaning": "trained in devotion to god" },
        { "name": "Aishani", "meaning": "Vigorous, bright like the sun, Beutiful,opulent, devotee of Mahadev, powerful like Maa Durga, boss of all, having qualities like a good ruler" },
        { "name": "Aishwarya", "meaning": "royal character,fully equipped" },
        { "name": "Akshara", "meaning": "A women who cannot be destroyed,strong and powerful" },
        { "name": "Akshita", "meaning": "harmless,always profitable,indestructible" },
        { "name": "Amba", "meaning": "A virtuous and revered women, powerful like mother Durga" },
        { "name": "Ambika", "meaning": "A women with graceful movements and charming speech" },
        { "name": "Amrita", "meaning": "Fearless,devoid of the fear of death" },
        { "name": "Anagha", "meaning": "An innocent, beautiful, and pure-hearted girl who has no sin in her heart" },
        { "name": "Anamika", "meaning": "someone who has no name,rare" },
        { "name": "Anandita", "meaning": "one who delights everyone" },
        { "name": "Ananya", "meaning": "A girl with special abilities. Very beautiful. There is no one like him. There is no one like her in looks, complexion, beauty, talent etc" },
        { "name": "Anasua\\\\Anasuya", "meaning": "" },
        { "name": "Anila", "meaning": "A women dedicated to serving living beings,philantrophic" },
        { "name": "Anisha", "meaning": "A women with the highest position" },
        { "name": "Anita", "meaning": "A women who is an expert in animals" },
        { "name": "Anjali", "meaning": "humble natured,knowledgeable,open hearted" },
        { "name": "Anjana", "meaning": "wise, powerful like the mother of Hanuman" },
        { "name": "Anshika", "meaning": "A radiant and energetic women,one who achieves her share" },
        { "name": "Anupa", "meaning": "A women as powerful as an elephant" },
        { "name": "Anupama", "meaning": "A women like no other, extraordinary" },
        { "name": "Anusha", "meaning": "Very intelligent, beautiful, cheerful, friendly. Vigorous, stunning, powerful like the daughter of the king Baan" },
        { "name": "Archana", "meaning": "A person who is worthy of respect and honours those who are older" },
        { "name": "Arushi", "meaning": "one who seeks knowledge from every place" },
        { "name": "Arya", "meaning": "women with good qualities,virtuous women" },
        { "name": "Asha", "meaning": "Holds positive hope" },
        { "name": "Astha", "meaning": "faithful,who remains stable in every situation,reliable" },
        { "name": "Avanija", "meaning": "" },
        { "name": "Ayasha", "meaning": "That girl, whose fame and respect are spread everywhere, is knowledgeable and affluent" },
        { "name": "Babita", "meaning": "A women with the nature of a little girl" },
        { "name": "Babli", "meaning": "Beloved, plum,talented" },
        { "name": "Bhadra", "meaning": "A women with excellent qualities" },
        { "name": "Bhairavi", "meaning": "Goddess Durga, Female form of Bhairava" },
        { "name": "Bhakti", "meaning": "Devotion to God, Adoration" },
        { "name": "Bhama", "meaning": "Radiant, Attractive girl" },
        { "name": "Bhamti", "meaning": "knowledgeable, resourceful girl" },
        { "name": "Bharati", "meaning": "Lord Saraswati, Knowledgeable" },
        { "name": "Bhargavi", "meaning": "Radiant Lady, Goddess Parvati" },
        { "name": "Bhaskari", "meaning": "Daughter of the Sun, Glowing lady" },
        { "name": "Bhavana", "meaning": "A beautiful women with compassionate desire to help others" },
        { "name": "Bhavika", "meaning": "A women who speaks the language of love,one who holds an interest in beautiful emotions" },
        { "name": "Bhavini", "meaning": "one who creates a distinctive identity, one who brings welfare to the world, like goddesses parvati" },
        { "name": "Bhavya", "meaning": "A women with beautiful and grand appearance" },
        { "name": "Bhuvaneswari", "meaning": "the leader and the ruler of the entire world, an emperor" },
        { "name": "Bimla", "meaning": "lady of holiness" },
        { "name": "Bodhayitri", "meaning": "one who attains knowledge,knowledgeable" },
        { "name": "Brahmi", "meaning": "Sacred divine girl" },
        { "name": "Brihati", "meaning": "Big, grand" },
        { "name": "Chameli", "meaning": "spreading the fragrance of her deeds like a special type of flower, hardworking women" },
        { "name": "Chandana", "meaning": "A brilliant and intelligent girl who pleases everyone with the fragrance of her fame" },
        { "name": "Chandra", "meaning": "cooling like the moon,well liked" },
        { "name": "Chandrabha", "meaning": "Radiant like the Moon" },
        { "name": "Chandrakala", "meaning": "Moonbeam, crescent Moon" },
        { "name": "Chandrakanta", "meaning": "Cool, Calm and serene like the Moon" },
        { "name": "Chandrani", "meaning": "Wife of the Moon, Queen of the Moon" },
        { "name": "Chandrika", "meaning": "Moon light, Cool and Calm woman" },
        { "name": "Charu", "meaning": "Beautiful women" },
        { "name": "Charupragya", "meaning": "Girl of beautiful wisdom" },
        { "name": "Charushri", "meaning": "Beautiful woman, Possessing great wealth" },
        { "name": "Charuvaacha", "meaning": "One who speaks beautifully" },
        { "name": "Chinmayi", "meaning": "spiritually inclined women, devotee of god,women of pure knowledge" },
        { "name": "Chitra", "meaning": "Accumulation of good Qualities, likes the right" },
        { "name": "Chittena", "meaning": "Beautiful, Enchanting lady" },
        { "name": "Chittesa", "meaning": "Lord of the consciousness, Cool, Calm lady" },
        { "name": "Daksha", "meaning": "competent,capable,intelligent,expert women" },
        { "name": "Damayanti", "meaning": "Destroyer of misfortune, extremely beautiful women" },
        { "name": "Damini", "meaning": "women who helps everyone,generous women" },
        { "name": "Deekshita", "meaning": "" },
        { "name": "Deepa", "meaning": "Women with brilliance and radiance" },
        { "name": "Devaki", "meaning": "A women endowed with divine qualities like lord krishna's mother" },
        { "name": "Devi", "meaning": "A women with divine qualities" },
        { "name": "Devika", "meaning": "Girl full of divine qualities, little Goddess" },
        { "name": "Dhairya", "meaning": "Lady of Patience, courageous girl" },
        { "name": "Dharana", "meaning": "A woman with concentrated mind" },
        { "name": "Dharmapriya", "meaning": "A women who holds religion dear and is devoted to it" },
        { "name": "Dharmashri", "meaning": "one who practices righteous conduct" },
        { "name": "Dhriti", "meaning": "A women who possess patience up to a certain limit, with a calm nature" },
        { "name": "Dhruva", "meaning": "Form and unmovable even in difficult situations" },
        { "name": "Diksha", "meaning": "Ascetic and intelligent women" },
        { "name": "Dipika", "meaning": "vigorous,majestic, outspoken girl" },
        { "name": "Dipti", "meaning": "Energetic, brilliant, teacher, scholar, knowledgeable woman who removes the ignorance of others with her knowledge. A woman with brilliance and radiance" },
        { "name": "Divya", "meaning": "girl with beautiful aura,willing to win,forever happy girl" },
        { "name": "Divyangi", "meaning": "Beautiful women with exquisite senses" },
        { "name": "Divyanshi", "meaning": "Divine women like the divine dieties" },
        { "name": "Drishti", "meaning": "A girl with good vision and sight" },
        { "name": "Durga", "meaning": "one who achieves her goal by facing sorrows and sufferings" },
        { "name": "Ekadha", "meaning": "Holds on a single desire" },
        { "name": "Ekaga", "meaning": "A girl following single path to attain desires" },
        { "name": "Ekagra", "meaning": "Focus alert minded girl" },
        { "name": "Ekakshara", "meaning": "A girl with one lettered, Om" },
        { "name": "Ekakshi", "meaning": "Having a single minded focused on goals" },
        { "name": "Ekapa", "meaning": "One who projects a single desire" },
        { "name": "Ekata", "meaning": "who likes to lives in unity,one who liked by all or favourite" },
        { "name": "Ekavinda", "meaning": "A girl who achieves one goal, Lord vishnu" },
        { "name": "Ekeha", "meaning": "Resolute in achieving desired" },
        { "name": "Ekena", "meaning": "A leader among women" },
        { "name": "Elana", "meaning": "Inspires everyone, Motivational speaker" },
        { "name": "Elani", "meaning": "Light, Brightness" },
        { "name": "Eleksha", "meaning": "Intelligent, Clever girl" },
        { "name": "Fulandevi", "meaning": "advanced divine girl" },
        { "name": "Gahana", "meaning": "Deep, Mysterious Lady" },
        { "name": "Gandharvi", "meaning": "Female Musician" },
        { "name": "Gandhiri", "meaning": "Princess of the Gandhara kingdom, devoted wife,religious women" },
        { "name": "Ganga", "meaning": "Sacred river Ganges" },
        { "name": "Gargi", "meaning": "daughter of preacher's father,vedic Rishika" },
        { "name": "Garima", "meaning": "A girl of dignity, Importance" },
        { "name": "Gauri Roopa", "meaning": "beautiful like Gauri, fair and strong women" },
        { "name": "Gayatri", "meaning": "protector of all like the special chants of the vedas, bestower of knowledge to all, teacher" },
        { "name": "Geeta", "meaning": "Singer,having knowledge like Bhagwat Geeta" },
        { "name": "Geetanjali", "meaning": "singer,one with melodious voice" },
        { "name": "Geetavishwas", "meaning": "Believer in scriptures" },
        { "name": "Gehini", "meaning": "Intelligent women" },
        { "name": "Gouri", "meaning": "beautiful girl, fair complexioned" },
        { "name": "Gunjan", "meaning": "Humming or Buzzing sound" },
        { "name": "Hansini", "meaning": "Beautiful and serene like a swan" },
        { "name": "Harsha", "meaning": "A women who is always happy,who remains in joy" },
        { "name": "Harshada", "meaning": "Spread enjoy and happiness to all" },
        { "name": "Harshkama", "meaning": "A women who desires happiness and joy" },
        { "name": "Havya", "meaning": "Sacrificing herself for the welfare of others" },
        { "name": "Hema", "meaning": "extremely good, the best,shining like gold" },
        { "name": "Hemada", "meaning": "Generously gifting valuable possessions to help others" },
        { "name": "Hima", "meaning": "Cold hearted like snow, cool and composed" },
        { "name": "Himani", "meaning": "Goddess Parvati, Snow" },
        { "name": "Hita", "meaning": "Dedicated to the welfare and wellbeing of all" },
        { "name": "Hitabha", "meaning": "A compassionate and radiant women" },
        { "name": "Hitanjali", "meaning": "A women whose hands are dedicated to serving others" },
        { "name": "Hiteswari", "meaning": "A women whose primary work is to do good for others" },
        { "name": "Homini", "meaning": "Engaged in performing rituals" },
        { "name": "Ila", "meaning": "Inspires everyone, Daughter of Manu, a good motivational speaker" },
        { "name": "Ilina", "meaning": "A queen, One with high Intelligence" },
        { "name": "Indira", "meaning": "Goddess Laxmi, Radiant" },
        { "name": "Indrabha", "meaning": "Radiant like king Indra, Adorned with jewels" },
        { "name": "Indrani", "meaning": "Possessing supreme wealth and beauty, wife of lord Indra" },
        { "name": "Indreha", "meaning": "Desired by lord Indra" },
        { "name": "Indresha", "meaning": "Act like king Indra, Accomplishing tasks" },
        { "name": "Indu", "meaning": "pleasurable,royal looks" },
        { "name": "Indumati", "meaning": "women who thinks and contemplates about others" },
        { "name": "Ipsita", "meaning": "Desires fulfilled" },
        { "name": "Ira", "meaning": "knowledge, intelligent women" },
        { "name": "Isalaa", "meaning": "Deity Goddess" },
        { "name": "Isha", "meaning": "one who is prosperous,having good qualities" },
        { "name": "Ishada", "meaning": "Bestowed of wealth" },
        { "name": "Ishita", "meaning": "The master of all, the opulent, the one with the ability to rule, a special accomplishment described in yoga philosophy" },
        { "name": "Ishwari", "meaning": "women with happiness, peace,and prosperity" },
        { "name": "Jahnavi", "meaning": "Cool, Calm and serene like the river Ganga" },
        { "name": "Jailalita", "meaning": "lady of freedom,makeup lover, very captivating,loves sports" },
        { "name": "Japita", "meaning": "Devotee of meditation and devotion" },
        { "name": "Jaya", "meaning": "having winning temperament, defender" },
        { "name": "Jayadevi", "meaning": "women whose goal is victory" },
        { "name": "Jayanti", "meaning": "Goddess Parvati, One who achieves victory and laughter" },
        { "name": "Jayapada", "meaning": "women who gives victory and success to the society and country,skilled in her work" },
        { "name": "Jayaprabha", "meaning": "Increasing her radiance through victories" },
        { "name": "Jayavandana", "meaning": "Desiring victory and success, yearning for achieving her goals" },
        { "name": "Jaylalita", "meaning": "Achieving victory with entertaining activities, a lover of sports" },
        { "name": "Jitvari", "meaning": "Victorious women" },
        { "name": "Jiva", "meaning": "Giver of life, Bestows fearlessness" },
        { "name": "Jyada", "meaning": "women who gives victory and success to the society and country,skilled in her work" },
        { "name": "Jyoti", "meaning": "knowledgeable, majestic, gifted" },
        { "name": "Jyotshna", "meaning": "saintly nature girl,brightness,lovely" },
        { "name": "Kadambari", "meaning": "group of specialists,healer of karma" },
        { "name": "Kalanaa", "meaning": "Artistic, Skillful, Expert in Mathematics" },
        { "name": "Kalawati", "meaning": "multitalanted, well qualified,women skilled in arts" },
        { "name": "Kalpana", "meaning": "imaginative and capable women" },
        { "name": "Kalyani", "meaning": "Desiring welfare,wishing good for everyone" },
        { "name": "Kamala", "meaning": "lakshmi,women who loves her husband" },
        { "name": "Kamna", "meaning": "Women with desires that bring happiness" },
        { "name": "Kamya", "meaning": "Beautiful women, energetic" },
        { "name": "Kanchan", "meaning": "Radiant like gold, Selfless" },
        { "name": "Kanta", "meaning": "beautiful women, lover" },
        { "name": "Karuna", "meaning": "kind hearted girl, gracious" },
        { "name": "Kaveri", "meaning": "Water expert, water lover, working for water conservation, living up to the slogan ...Water is life..., it is written in Mahabharata that there is a river in South India where one gets virtuous results by taking bath in it" },
        { "name": "Kavita", "meaning": "brilliant,genius,conceptualist" },
        { "name": "Kavya", "meaning": "Knowledgeable, visionary, Intelligent" },
        { "name": "Kavyanjali", "meaning": "Composing poetry, learned women" },
        { "name": "Kishori", "meaning": "young women,youthful lady" },
        { "name": "Kripa", "meaning": "Capable women" },
        { "name": "Krishna", "meaning": "Dark and beautifulwomen" },
        { "name": "Kriti", "meaning": "Desirous of fame" },
        { "name": "Kritika", "meaning": "Radiant like a star, destroyer of flaws" },
        { "name": "Kshema", "meaning": "Destroyer of ignorance,desiring well being and auspiciousness" },
        { "name": "Kuntee", "meaning": "Beloved women whom people desire" },
        { "name": "Kusum", "meaning": "whom everyone desires to meet, beautiful like a flower" },
        { "name": "Labhada", "meaning": "Giver of benefits to everyone" },
        { "name": "Labhesa", "meaning": "Lord of gains, beneficiary" },
        { "name": "Labhya", "meaning": "Easily attainable due to kindness and helpfulness" },
        { "name": "Laghima", "meaning": "Lightness, subtlety" },
        { "name": "Laghvi", "meaning": "The smallest and beloved" },
        { "name": "Lajja", "meaning": "Modest and shy by nature" },
        { "name": "Lakshana", "meaning": "Possessing distinction qualities" },
        { "name": "Lakshmi", "meaning": "A woman who is financially independent, enhances the beauty of her home, is detail-oriented, accurate, mathematically inclined, and a strategic thinker" },
        { "name": "Lalita", "meaning": "an athlete,well wisher" },
        { "name": "Lata", "meaning": "outgoing girl,having attributes of social gatherings" },
        { "name": "Leena", "meaning": "meeting everyone" },
        { "name": "Likhita (tha)", "meaning": "A writer who writes good articles, a painter who draws good pictures" },
        { "name": "Lila", "meaning": "Entertaining through laughter, jokes and amusement" },
        { "name": "Lilawati", "meaning": "Entertaining through laughter, jokes and amusement" },
        { "name": "Lopamudra", "meaning": "An expert in Vedas" },
        { "name": "Madhulika", "meaning": "Beautiful women like a pollen grain" },
        { "name": "Madhumati", "meaning": "sweet voiced like honey" },
        { "name": "Madhuri", "meaning": "sweet spoken" },
        { "name": "Madhushri", "meaning": "A beautiful women with favorable prosperity" },
        { "name": "Mahadevi", "meaning": "Devotee women to lord shiv" },
        { "name": "Mala", "meaning": "A women deserving of respect and honour" },
        { "name": "Malaika", "meaning": "Beautiful women" },
        { "name": "Manju", "meaning": "heart warming ,beautiful girl" },
        { "name": "Manorama", "meaning": "pleasing to the mind,beautiful" },
        { "name": "Mansi", "meaning": "mindful, accommodating of thoughts" },
        { "name": "Manu", "meaning": "Thoughtful, contemplative" },
        { "name": "Maryada", "meaning": "A gentle women who remains within boundaries" },
        { "name": "Mayatri", "meaning": "friendliest,friendly" },
        { "name": "Mayawati", "meaning": "wise women,right speaker,magician,women of political racketees" },
        { "name": "Medha", "meaning": "sharp minded girl,accessible to all" },
        { "name": "Meera", "meaning": "A virtuous women who stays away from flaws" },
        { "name": "Meghna", "meaning": "selfless like a cloud" },
        { "name": "Menka", "meaning": "sweet spoken" },
        { "name": "Menuka", "meaning": "nymph like beautiful" },
        { "name": "Modini", "meaning": "keeper of everyone's happiness" },
        { "name": "Mohini", "meaning": "Alluring, captivating everyone towards her" },
        { "name": "Mridula", "meaning": "soft natured, humble" },
        { "name": "Mrinali", "meaning": "Beautiful women like a lotus flower" },
        { "name": "Nalini", "meaning": "A women as beautiful as a lotus flower" },
        { "name": "Namrata", "meaning": "A women with a humble nature" },
        { "name": "Nanda", "meaning": "one who praises and remains joyful" },
        { "name": "Nandini", "meaning": "one who pleases everyone" },
        { "name": "Nandita", "meaning": "one who brings happiness to everyone" },
        { "name": "Narmada", "meaning": "comedian,to be happy" },
        { "name": "Navina", "meaning": "A modern, young and beautiful women" },
        { "name": "Navya", "meaning": "A beautiful women of young age" },
        { "name": "Neha", "meaning": "" },
        { "name": "Nidhi", "meaning": "possessor of many qualities,virtuous lady" },
        { "name": "Nina", "meaning": "One who respects and honour her chosen deity and family diety" },
        { "name": "Nirmala", "meaning": "chaste women, well behaved girl" },
        { "name": "Nirmohi", "meaning": "Free from attachment" },
        { "name": "Nirupa", "meaning": "" },
        { "name": "Nisha", "meaning": "nimble girl, fast forward girl" },
        { "name": "Nita", "meaning": "one who reaches her goals and objectives" },
        { "name": "Ojaspa", "meaning": "Protect strength and energy" },
        { "name": "Ojoda", "meaning": "Daughter of vitality, social worker" },
        { "name": "Oma", "meaning": "desirous of attaining god" },
        { "name": "Omapa", "meaning": "One who brings Om" },
        { "name": "Omdevi", "meaning": "Goddess of Om" },
        { "name": "Omeha", "meaning": "Provider of Om" },
        { "name": "Omesha", "meaning": "Lord of Om" },
        { "name": "Ompali", "meaning": "Protector of Om" },
        { "name": "Ompriya", "meaning": "Beloved of Om" },
        { "name": "Omragyi", "meaning": "Pertains union with divine, Yogini" },
        { "name": "Omrajaa", "meaning": "Queen of Om" },
        { "name": "Padma", "meaning": "A women with qualities like goddesses lakshmi, prosperous,knowledgeable and dynamic (Padhma)" },
        { "name": "Padmini", "meaning": "A women with qualities like goddesses lakshmi, prosperous, knowledgeable and dynamic" },
        { "name": "Parvati", "meaning": "self oriented" },
        { "name": "Pooja", "meaning": "respected by all" },
        { "name": "Prabha", "meaning": "A women with a good aura,radiant and energetic" },
        { "name": "Prada", "meaning": "one who gives well and justly,generous" },
        { "name": "Pragya", "meaning": "having special knowledge,well known" },
        { "name": "Prancha", "meaning": "Awomen with beautiful qualities, knowledgeable and dynamic" },
        { "name": "Pranja", "meaning": "One who speaks well, influencer speaker,straight forward and honest women" },
        { "name": "Pratishtha", "meaning": "Respected, talented and prestigious girl everywhere who maintains status everywhere with her talent" },
        { "name": "Premala", "meaning": "One who attains the highest love" },
        { "name": "Priti", "meaning": "one who loves everyone with justice" },
        { "name": "Priyanka", "meaning": "A girl who makes friendly relations with dear and good people, a girl who likes good things, a girl with good nature and good behavior" },
        { "name": "Punya", "meaning": "A women with abundant virtues" },
        { "name": "Purnima", "meaning": "A women with complete and full form like the full moon" },
        { "name": "Pushpa", "meaning": "cheerful girl,having happy face" },
        { "name": "Rachana", "meaning": "Making efforts to achieve goals" },
        { "name": "Radha", "meaning": "straightener of all tasks" },
        { "name": "Rajni", "meaning": "Bestowing good value upon others like herself" },
        { "name": "Rama", "meaning": "player, one who meets everyone" },
        { "name": "Ranjana", "meaning": "exerting influencer" },
        { "name": "Rashmi", "meaning": "constantly active like the rays of the sun" },
        { "name": "Rekha", "meaning": "attaining knowledge with good pace" },
        { "name": "Renu", "meaning": "Always active in pursuit of goals" },
        { "name": "Renuka", "meaning": "Attaining knowledge, always active" },
        { "name": "Richa", "meaning": "praying women,one who knows vedic hymns" },
        { "name": "Riddhi", "meaning": "Women with happiness, peace, prosperity and wealth" },
        { "name": "Rishika", "meaning": "acquirer of knowledge, a sage girl,scientists" },
        { "name": "Rishiswarupa", "meaning": "Wise like a sage scientific women" },
        { "name": "Rita", "meaning": "knowledgeable, dynamic women" },
        { "name": "Riti", "meaning": "Dynamic, knowledgeable, listener of good things" },
        { "name": "Rohini", "meaning": "progressing towards advancement" },
        { "name": "Ruchi", "meaning": "Shining with her own knowledge,content" },
        { "name": "Rukmani", "meaning": "Radiant like gold, brilliance" },
        { "name": "Rukmini", "meaning": "Beautiful like Lord krishna's wife" },
        { "name": "Rupa", "meaning": "Beautiful, possessing good form" },
        { "name": "Rupali", "meaning": "Managing life with her beautiful form" },
        { "name": "Samiksha", "meaning": "A women who knows what is right and wrong accurately" },
        { "name": "Sandhya", "meaning": "A women who mediates on god ,a devotee of divine" },
        { "name": "Sanyukta", "meaning": "Always driving towards desired goals" },
        { "name": "Sapna", "meaning": "A fully knowledgeable women, who gathers necessary materials" },
        { "name": "Sarada", "meaning": "Possessing knowledge and wisdom like goddess Saraswati" },
        { "name": "Saraswati", "meaning": "mistress who gives knowledge to all, lady of science expertise" },
        { "name": "Sarda", "meaning": "A women who imparts the essence and nectar of knowledge" },
        { "name": "Sarika", "meaning": "Skilled in playing veena, Gentle like the Moon" },
        { "name": "Satya", "meaning": "truthful women,beneficial to all" },
        { "name": "Savina", "meaning": "A skilled women in playing the vina instrument" },
        { "name": "Savitri", "meaning": "A knowledge women, radiant like sun" },
        { "name": "Shakuntala", "meaning": "A beautiful and enchanting women, the mother of king Bharata" },
        { "name": "Shalini", "meaning": "The head of the household, the chief of the family" },
        { "name": "Shambhavi", "meaning": "A girl who is very beautiful, desires happiness, peace, and well-being for everyone, powerful and prosperous like Goddess Parvati, and embodies a yoga posture located between the two eyes, experiencing profound spiritual bliss through meditation" },
        { "name": "Shanta", "meaning": "A women of peaceful nature" },
        { "name": "Shanti", "meaning": "A women of peaceful nature" },
        { "name": "Shilpa", "meaning": "good looking lady, beautiful" },
        { "name": "Shivani", "meaning": "A divine and powerful women like goddesses parvati,the consort of lord shiv" },
        { "name": "Shraddha", "meaning": "A women who embraces truth and has faith in parents,teachers and god" },
        { "name": "Shruti", "meaning": "A women who listens to good teachings and has knowledge of the vedas" },
        { "name": "Shweta", "meaning": "An enchanting and fair lady, exuding elegance and purity as clear as crystal" },
        { "name": "Siddhi", "meaning": "A wealthy, intelligent, beautiful girl who starts any work and completes it" },
        { "name": "Sila", "meaning": "Person of good character and nature" },
        { "name": "Sita", "meaning": "those who complete the work started by herself,good charactered women like mother sita" },
        { "name": "Smita", "meaning": "A women who smiles and laughs gently" },
        { "name": "Sridevi", "meaning": "devotee of god,versatile lady" },
        { "name": "Subheksha", "meaning": "A women who enjoys seeing and knowing good things" },
        { "name": "Suhagini", "meaning": "A women who laughs beautifully, whose laughter is loved by all" },
        { "name": "Sujata", "meaning": "A women who is born well, who manifests herself" },
        { "name": "Sukhada", "meaning": "Giver of happiness" },
        { "name": "Sulochana", "meaning": "A beautiful women with beautiful eyes" },
        { "name": "Sumana", "meaning": "A women with a pure and good mind, who desires the welfare of all" },
        { "name": "Surya", "meaning": "A women with the brilliance of the sun" },
        { "name": "Suryadevi", "meaning": "A women who worships the sun god" },
        { "name": "Sushila", "meaning": "good natured lady" },
        { "name": "Sushma", "meaning": "A capable and courageous women, full of vitality and energy" },
        { "name": "Sushmita", "meaning": "A women with a beautiful smile, who smiles gracefully" },
        { "name": "Suvarna", "meaning": "A women with radiant and bright face like gold" },
        { "name": "Suvasini", "meaning": "A women who lives in good and grand houses" },
        { "name": "Svarna", "meaning": "A women with a melodious voice" },
        { "name": "Swasti", "meaning": "Blessings, Wellbeing" },
        { "name": "Swastika", "meaning": "Whose presence brings wellbeing to everyone" },
        { "name": "Sweta", "meaning": "attractive girl, fair lady,crystalline" },
        { "name": "Syona", "meaning": "A women full of happiness, a happy girl" },
        { "name": "Taijasi", "meaning": "Relinquishing her own ego like a river that abandon its foam" },
        { "name": "Tanaya", "meaning": "Bringing fame and respect to her family, lineage and clan" },
        { "name": "Tanuja \\\\ Thanuja", "meaning": "Parents' darling, everyone's beloved, lovely girl" },
        { "name": "Tanvi", "meaning": "Delicate, Beautiful girl" },
        { "name": "Tapasi", "meaning": "one who struggles to achieve her desire,ascetic" },
        { "name": "Tapasya", "meaning": "Enduring happiness, sorrow, loss, gain etc., ascetic women" },
        { "name": "Tara", "meaning": "over coming sorrows,blessed girl" },
        { "name": "Taruna", "meaning": "Young and gentle women" },
        { "name": "Titiksha", "meaning": "Patient and strong willed women" },
        { "name": "Traiguni", "meaning": "Possessing all the three qualities and attributes" },
        { "name": "Tripti", "meaning": "Satisfied with what she has, Contend" },
        { "name": "Tripura", "meaning": "Residing in all the three worlds, Possessing divine splendor" },
        { "name": "Trisha", "meaning": "A women who desires essential things" },
        { "name": "Trishna", "meaning": "A women who desires essential things" },
        { "name": "Tulasi", "meaning": "A women who perform selfless deeds, similar to a creeper" },
        { "name": "Tulya", "meaning": "Gentle like a cool breeze, Steady and on wavering" },
        { "name": "Udgithaa", "meaning": "Melody, Hymn" },
        { "name": "Udyama", "meaning": "A women who works hard to achieve her goals" },
        { "name": "Uma", "meaning": "patriotic lady,who speaks well" },
        { "name": "Unnata", "meaning": "Extremely humble in nature" },
        { "name": "Upama", "meaning": "A women who speaks by measuring and weighing, compassionate women" },
        { "name": "Upendraa", "meaning": "Lord Vishnu, Younger brother of lord Indra" },
        { "name": "Urmila", "meaning": "one who is prone to learning" },
        { "name": "Urvashi", "meaning": "the one who makes even the elders in her control" },
        { "name": "Usha", "meaning": "destroyer of ignorance,intelligence" },
        { "name": "Ushita", "meaning": "Morning, Dawn" },
        { "name": "Utkala", "meaning": "Brilliant, Radiant" },
        { "name": "Utkarshaa", "meaning": "Advancement, Prosperous" },
        { "name": "Utsara", "meaning": "Splendor enthusiasm" },
        { "name": "Uttama", "meaning": "A women who has excellent qualities,the best women" },
        { "name": "Vandana", "meaning": "girl who likes to worship, worshipper of god" },
        { "name": "Vandini", "meaning": "A religious women who worships god" },
        { "name": "Varsha", "meaning": "A women who is compassionate and does charitable work" },
        { "name": "Vasudha", "meaning": "A prosperous women" },
        { "name": "Vasundhara", "meaning": "A wealthy women" },
        { "name": "Vedashri", "meaning": "A Vedic scholar" },
        { "name": "Veena", "meaning": "A knowledgeable women who achieves her goal" },
        { "name": "Vibhuti", "meaning": "Divine, Glory, Prosperity" },
        { "name": "Vidyotama", "meaning": "A knowledgeablewomen who attains special fame" },
        { "name": "Vilasa", "meaning": "Playful, Delightful girl" },
        { "name": "Vimala", "meaning": "lady of holiness" },
        { "name": "Vimaya", "meaning": "Pure, Clean and Clear" },
        { "name": "Vinoo", "meaning": "Very appreciative of people, desirous of everyone's progress, very beautiful woman with a pure heart" },
        { "name": "Vipasha", "meaning": "A liberated and independent women" },
        { "name": "Vipra", "meaning": "Wise person, Scholar" },
        { "name": "Visakha", "meaning": "A Girl who shines like a star, Constellation" },
        { "name": "Yachana", "meaning": "Practicing prayer and devotion, Offering worship to god" },
        { "name": "Yagya", "meaning": "Unifier, performer of divine worship and rituals" },
        { "name": "Yama", "meaning": "spartanic girl,rigorously simple" },
        { "name": "Yamaa", "meaning": "Night, Rest" },
        { "name": "Yamada", "meaning": "Beloved of Yama" },
        { "name": "Yameha", "meaning": "Lover of Yama" },
        { "name": "Yamesa", "meaning": "Having lord Yama as a king" },
        { "name": "Yamini", "meaning": "austerity,moral or ethical girl" },
        { "name": "Yamistha", "meaning": "One who manage at its best" },
        { "name": "Yamuna", "meaning": "Sacred river Yamuna, Remaining steady even in difficult situation" },
        { "name": "Yasoda", "meaning": "respectable women,to success" },
        { "name": "Yatheshtaa", "meaning": "Desiring to fulfill desires" },
        { "name": "Yogini", "meaning": "Expert in yoga,accomplished yogini" },
        { "name": "Yogita", "meaning": "Yogini,accomplishedin yoga" },
        { "name": "Yogmangali", "meaning": "living a blissful and auspicious life through yoga" }
    ]
};

// --- FAVORITES MANAGER CLASS ---
const FAVORITES_PRIMARY_KEY = 'naamin_favorites_v1';
const FAVORITES_LEGACY_KEY = 'favorites';

function loadFavoritesFromStorage() {
    const primary = localStorage.getItem(FAVORITES_PRIMARY_KEY);
    if (primary) {
        try { return JSON.parse(primary) || []; } catch (e) { }
    }
    const legacy = localStorage.getItem(FAVORITES_LEGACY_KEY);
    if (legacy) {
        try { return JSON.parse(legacy) || []; } catch (e) { }
    }
    return [];
}

function saveFavoritesToStorage(list) {
    const payload = JSON.stringify(list || []);
    localStorage.setItem(FAVORITES_PRIMARY_KEY, payload);
    localStorage.setItem(FAVORITES_LEGACY_KEY, payload);
}

class FavoritesManager {
    constructor() {
        this.storageKey = FAVORITES_PRIMARY_KEY;
        this.favorites = this.load();
        this.updateHeaderCount();
    }

    load() {
        return loadFavoritesFromStorage();
    }

    save() {
        saveFavoritesToStorage(this.favorites);
        this.updateHeaderCount();
        try {
            document.dispatchEvent(new CustomEvent('favoritesUpdated'));
        } catch (e) { }
    }

    toggle(nameObj) {
        const name = nameObj.name || nameObj.Name;
        const exists = this.favorites.find(item => (item.name || item.Name) === name);

        if (exists) {
            this.favorites = this.favorites.filter(item => (item.name || item.Name) !== name);
            return false; // Removed
        } else {
            this.favorites.push(nameObj);
            return true; // Added
        }
    }

    isFavorite(name) {
        return this.favorites.some(item => (item.name || item.Name) === name);
    }

    clear() {
        this.favorites = [];
        this.save();
    }

    updateHeaderCount() {
        const count = this.favorites.length;
        document.querySelectorAll('#fav-count, #fav-count-mobile').forEach(span => {
            span.textContent = count;
            span.style.display = 'inline-flex';
        });
    }
}

const favManager = new FavoritesManager();
window.favManager = favManager;
window.FavoritesManager = FavoritesManager;


document.addEventListener("DOMContentLoaded", () => {

    // Initialize Speech Synthesis voices (needed for pronunciation feature)
    if ('speechSynthesis' in window) {
        // Load voices - some browsers need this explicitly
        let voicesLoaded = false;

        function loadVoices() {
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                voicesLoaded = true;
                console.log('Speech synthesis voices loaded:', voices.length);
            }
            return voices;
        }

        // Initial load
        loadVoices();

        // Some browsers fire this event when voices are loaded
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }

        // Fallback: try loading after a short delay
        setTimeout(() => {
            if (!voicesLoaded) {
                loadVoices();
            }
        }, 100);
    }

    // Header Padding (many pages use fixed `nav.navbar` instead of `<header>`)
    const syncTopPadding = () => {
        const headerEl = document.querySelector('header, nav.navbar');
        if (!headerEl) return;
        document.body.style.paddingTop = `${headerEl.offsetHeight}px`;
    };
    syncTopPadding();
    document.addEventListener('naamin:layout-ready', syncTopPadding);
    window.addEventListener('resize', syncTopPadding, { passive: true });

    // Theme Toggle
    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
        const saved = localStorage.getItem("theme") || "light";
        document.body.setAttribute("data-theme", saved);
        themeBtn.innerHTML = saved === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        themeBtn.onclick = () => {
            const current = document.body.getAttribute("data-theme");
            const next = current === "dark" ? "light" : "dark";
            document.body.setAttribute("data-theme", next);
            localStorage.setItem("theme", next);
            themeBtn.innerHTML = next === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        };
    }

    // ========== NAVBAR (DESKTOP + MOBILE DRAWER) ==========
    // Note: Some pages replace the navbar via `js/common-layout.js` after this script runs.
    // Make navbar initialization re-runnable and bind again on `naamin:layout-ready`.

    function getNavEls() {
        return {
            hamburger: document.getElementById("hamburger-menu"),
            mobileMenu: document.getElementById("mobile-menu"),
            mobileDropdown: document.querySelector(".mobile-dropdown"),
            mobileDropdownToggle: document.querySelector(".mobile-dropdown-toggle"),
            topNavbar: document.querySelector(".navbar"),
            mobileMenuOverlay: document.querySelector(".mobile-menu-overlay")
        };
    }

    function ensureMobileMenuOverlay(mobileMenu) {
        if (!mobileMenu) return null;
        let overlay = document.querySelector(".mobile-menu-overlay");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.className = "mobile-menu-overlay";
            document.body.appendChild(overlay);
        }
        return overlay;
    }

    function closeMobileMenu() {
        const { hamburger, mobileMenu } = getNavEls();
        const overlay = ensureMobileMenuOverlay(mobileMenu);
        if (mobileMenu) mobileMenu.classList.remove("open");
        if (overlay) overlay.classList.remove("active");
        document.body.classList.remove("mobile-menu-open");
        if (hamburger) {
            const icon = hamburger.querySelector("i");
            if (icon) icon.className = "fas fa-bars";
        }
        document.body.style.overflow = "";
    }

    function openMobileMenu() {
        const { hamburger, mobileMenu } = getNavEls();
        const overlay = ensureMobileMenuOverlay(mobileMenu);
        if (mobileMenu) mobileMenu.classList.add("open");
        if (overlay) overlay.classList.add("active");
        document.body.classList.add("mobile-menu-open");
        if (hamburger) {
            const icon = hamburger.querySelector("i");
            if (icon) icon.className = "fas fa-times";
        }
        document.body.style.overflow = "hidden";
    }

    function initNavbarUI() {
        const { hamburger, mobileMenu, mobileDropdown, mobileDropdownToggle, topNavbar } = getNavEls();
        const overlay = ensureMobileMenuOverlay(mobileMenu);

        document.body.classList.remove("mobile-menu-open");

        if (topNavbar && !topNavbar.dataset.scrollBound) {
            topNavbar.dataset.scrollBound = "1";
            const syncNavbarState = () => {
                const navbar = document.querySelector(".navbar");
                if (!navbar) return;
                navbar.classList.toggle("is-scrolled", window.scrollY > 8);
            };
            syncNavbarState();
            window.addEventListener("scroll", syncNavbarState, { passive: true });
        }

        if (hamburger && mobileMenu && !hamburger.dataset.commonMenuBound && !hamburger.dataset.mobileMenuBound) {
            hamburger.dataset.mobileMenuBound = "1";
            hamburger.addEventListener("click", (e) => {
                e.stopPropagation();
                const menu = document.getElementById("mobile-menu");
                if (menu && menu.classList.contains("open")) closeMobileMenu();
                else openMobileMenu();
            });
        }

        if (mobileDropdownToggle && mobileDropdown && !mobileDropdownToggle.dataset.commonDropdownBound && !mobileDropdownToggle.dataset.mobileDropdownBound) {
            mobileDropdownToggle.dataset.mobileDropdownBound = "1";
            mobileDropdownToggle.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                mobileDropdown.classList.toggle("open");
            });
        }

        if (overlay && !overlay.dataset.overlayBound) {
            overlay.dataset.overlayBound = "1";
            overlay.addEventListener("click", closeMobileMenu);
        }

        if (mobileMenu) {
            mobileMenu.querySelectorAll('a:not(.mobile-dropdown-toggle)').forEach((link) => {
                if (link.dataset.closeMenuBound) return;
                link.dataset.closeMenuBound = "1";
                link.addEventListener("click", closeMobileMenu);
            });
        }

        document.querySelectorAll(".dropdown-toggle").forEach((toggle) => {
            if (toggle.dataset.dropdownBound) return;
            toggle.dataset.dropdownBound = "1";
            toggle.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const li = toggle.closest(".dropdown");
                if (!li) return;
                li.classList.toggle("open");
            });
        });

        document.querySelectorAll(".dropdown-toggle").forEach((el) => {
            if (el.dataset.dropdownKbBound) return;
            el.dataset.dropdownKbBound = "1";
            el.setAttribute("tabindex", "0");
            el.addEventListener("keydown", (ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    el.click();
                }
            });
        });
    }

    initNavbarUI();
    document.addEventListener("naamin:layout-ready", initNavbarUI);

    if (!window.__naaminNavDocHandlersBound) {
        window.__naaminNavDocHandlersBound = true;

        // Close mobile menu when clicking outside
        document.addEventListener("click", (e) => {
            const { mobileMenu, hamburger } = getNavEls();
            if (!mobileMenu || !hamburger) return;
            if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target) && mobileMenu.classList.contains("open")) {
                closeMobileMenu();
            }
        });

        // Close dropdowns when clicking elsewhere
        document.addEventListener("click", (e) => {
            document.querySelectorAll(".dropdown.open").forEach((d) => {
                if (!d.contains(e.target)) d.classList.remove("open");
            });
        });

        // Close mobile menu on escape key
        document.addEventListener("keydown", (e) => {
            const { mobileMenu } = getNavEls();
            if (e.key === "Escape" && mobileMenu && mobileMenu.classList.contains("open")) {
                closeMobileMenu();
            }
        });
    }

    // Language toggle sync removed because they now have direct handlers below


    // Favorites header buttons/counters can be replaced by `js/common-layout.js`.
    // Re-wire handlers whenever the layout is swapped.
    let favCountObserver = null;

    function openFavoritesUi() {
        const favOverlay = document.getElementById('fav-overlay');
        const shortlistHub = document.getElementById('shortlist-hub');

        function isHubVisible() {
            if (!shortlistHub) return false;
            try {
                return window.getComputedStyle(shortlistHub).display !== 'none';
            } catch (e) {
                return true;
            }
        }

        if (isHubVisible()) {
            shortlistHub.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        if (favOverlay) {
            favOverlay.style.display = 'flex';
            try { renderFavoritesList(); } catch (_e) { }
            return;
        }

        const onWishlistPage = /(^|\/)wishlist\.html$/i.test(window.location.pathname || '');
        if (onWishlistPage) {
            const target = document.getElementById('wishlist-section') || document.querySelector('main');
            if (target && typeof target.scrollIntoView === 'function') {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            return;
        }

        window.location.href = 'wishlist.html';
    }

    function syncFavoritesCount() {
        const countDesktop = document.getElementById('fav-count');
        const countMobile = document.getElementById('fav-count-mobile');
        if (countDesktop && countMobile) countMobile.textContent = countDesktop.textContent;
    }

    function wireFavoritesHeader() {
        // Bind buttons (desktop + mobile header) safely even after layout swaps.
        ['fav-view-btn', 'fav-view-btn-mobile'].forEach((id) => {
            const btn = document.getElementById(id);
            if (!btn || btn.dataset.bound === 'true') return;
            btn.dataset.bound = 'true';
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openFavoritesUi();
            });
        });

        // Re-attach observer to the current desktop count element (if it exists).
        if (favCountObserver) {
            try { favCountObserver.disconnect(); } catch (_e) { }
            favCountObserver = null;
        }
        const favCountElement = document.getElementById('fav-count');
        if (favCountElement && typeof MutationObserver !== 'undefined') {
            favCountObserver = new MutationObserver(syncFavoritesCount);
            favCountObserver.observe(favCountElement, { childList: true, characterData: true, subtree: true });
        }

        favManager?.updateHeaderCount();
        syncFavoritesCount();
    }

    wireFavoritesHeader();
    document.addEventListener("naamin:layout-ready", wireFavoritesHeader);

    // Dropdown behavior moved to initNavbarUI (re-runnable after layout swap)

    // Scroll To Top
    const scrollBtn = document.getElementById("scrollToTopBtn");
    if (scrollBtn) {
        window.addEventListener("scroll", () => {
            scrollBtn.classList.toggle("show", window.scrollY > 300);
            scrollBtn.style.opacity = window.scrollY > 300 ? "1" : "0";
            scrollBtn.style.visibility = window.scrollY > 300 ? "visible" : "hidden";
        });
        scrollBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Language Handling
    function getLanguage() {
        try {
            const googleDropdownLang = localStorage.getItem("naamin-google-translate-language");
            if (googleDropdownLang) return "en";
            const stored = localStorage.getItem("language");
            const normalized = stored === "hi" ? "hi" : "en";
            if (!stored) {
                localStorage.setItem("language", normalized);
            }
            return normalized;
        } catch (_e) {
            // ignore storage edge cases
            return "en";
        }
    }

    const astroProfileRequestCache = new Map();

    async function fetchAstroProfileFromBackend(nameValue) {
        const name = String(nameValue || '').trim();
        if (!name) return null;
        const cacheKey = name.toLowerCase();
        if (astroProfileRequestCache.has(cacheKey)) {
            return astroProfileRequestCache.get(cacheKey);
        }

        const requestPromise = (async () => {
            const urls = ['/api/astro-profile'];
            try {
                const host = window.location.hostname || '';
                const isLocal = host === 'localhost' || host === '127.0.0.1';
                if (!isLocal) {
                    urls.push('http://127.0.0.1:3000/api/astro-profile');
                    urls.push('http://localhost:3000/api/astro-profile');
                }
            } catch (_err) {
                // keep default URL only
            }

            for (const endpoint of urls) {
                try {
                    const resp = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name })
                    });
                    if (!resp.ok) continue;
                    const payload = await resp.json().catch(() => null);
                    if (payload && payload.profile) return payload.profile;
                } catch (_error) {
                    // try next endpoint
                }
            }
            return null;
        })();

        astroProfileRequestCache.set(cacheKey, requestPromise);
        return requestPromise;
    }

    if (typeof window !== 'undefined') {
        window.fetchAstroProfileFromBackend = fetchAstroProfileFromBackend;
    }

    async function mergeBackendAstroProfile(smartData, langOverride) {
        if (!smartData || !smartData.name) return smartData;
        const profile = await fetchAstroProfileFromBackend(smartData.name);
        if (!profile) return smartData;

        const lang = langOverride === 'en' ? 'en' : (langOverride === 'hi' ? 'hi' : getLanguage());
        const profileNakshatra = pickPrimaryNakshatra(profile.nakshatra) || pickPrimaryNakshatra(profile.nakshatras);
        const rashiEn = profile.rashi_en || smartData.rashi_en || smartData.rashi;
        const rashiHi = localizeRashiForHindi(rashiEn || profile.rashi_hi || smartData.rashi_hi);
        const nakshatraEn = profileNakshatra || pickPrimaryNakshatra(smartData.nakshatra_en || smartData.nakshatra) || 'Ashwini';
        const nakshatraHi = localizeNakshatraForHindi(nakshatraEn || profile.nakshatra_hi || smartData.nakshatra_hi);
        const phalEn = profile.phal_en || smartData.phal_en || smartData.phal;
        const phalHi = profile.phal_hi || smartData.phal_hi || smartData.phal;
        const rashiphalEn = profile.rashiphal_en || smartData.rashiphal_en || smartData.rashiphal;
        const rashiphalHi = profile.rashiphal_hi || smartData.rashiphal_hi || smartData.rashiphal;

        return {
            ...smartData,
            rashi_en: rashiEn,
            rashi_hi: rashiHi,
            rashi: lang === 'hi' ? rashiHi : rashiEn,
            nakshatra_en: nakshatraEn,
            nakshatra_hi: nakshatraHi,
            nakshatra: lang === 'hi' ? nakshatraHi : nakshatraEn,
            phal_en: phalEn,
            phal_hi: phalHi,
            phal: lang === 'hi' ? phalHi : phalEn,
            rashiphal_en: rashiphalEn,
            rashiphal_hi: rashiphalHi,
            rashiphal: lang === 'hi' ? rashiphalHi : rashiphalEn
        };
    }

    async function buildNameDetailsData(rawNameData, lang) {
        const safeName = rawNameData?.name || rawNameData?.Name || '';
        const safeLang = lang === 'hi' ? 'hi' : 'en';
        const fallbackNum = safeName && engine && typeof engine.calculateNumerology === 'function'
            ? engine.calculateNumerology(safeName)
            : 1;
        const fallbackRashi = safeName && engine && typeof engine.calculateRashi === 'function'
            ? engine.calculateRashi(safeName)
            : null;
        const fallbackAstro = (engine && engine.astroDetails && engine.astroDetails[fallbackNum]) || (engine && engine.astroDetails && engine.astroDetails[1]) || {};
        const fallbackRashiEn = fallbackRashi?.rashi_en || fallbackRashi?.rashi || 'Aries';
        const fallbackRashiHi = localizeRashiForHindi(fallbackRashiEn || fallbackRashi?.rashi_hi || 'मेष');
        const fallbackNakshatraEn = fallbackRashi?.nakshatra_en || pickPrimaryNakshatra(fallbackRashi?.nakshatras) || 'Ashwini';
        const fallbackNakshatraHi = fallbackRashi?.nakshatra_hi || localizeNakshatraForHindi(fallbackNakshatraEn);
        const fallbackPhalEn = fallbackRashi?.phal_en || 'Steady effort, clarity, and patience support positive growth.';
        const fallbackPhalHi = fallbackRashi?.phal_hi || fallbackPhalEn;
        const fallbackRashiphalEn = fallbackRashi?.rashiphal_en || 'The year supports practical progress through discipline and thoughtful choices.';
        const fallbackRashiphalHi = fallbackRashi?.rashiphal_hi || fallbackRashiphalEn;

        const fallback = {
            ...(rawNameData && typeof rawNameData === 'object' ? rawNameData : {}),
            name: safeName,
            Name: rawNameData?.Name || safeName,
            gender: rawNameData?.gender || 'Unknown',
            meaning: rawNameData?.meaning || rawNameData?.meaning_en || 'Meaning not available',
            meaning_en: englishMeaningForNameData(rawNameData || {}),
            origin: rawNameData?.origin || 'Sanskrit/Indian',
            origin_en: rawNameData?.origin_en || rawNameData?.origin || 'Sanskrit/Indian',
            rashi: safeLang === 'hi' ? fallbackRashiHi : fallbackRashiEn,
            rashi_en: fallbackRashiEn,
            rashi_hi: fallbackRashiHi,
            nakshatra: safeLang === 'hi' ? fallbackNakshatraHi : fallbackNakshatraEn,
            nakshatra_en: fallbackNakshatraEn,
            nakshatra_hi: fallbackNakshatraHi,
            phal: safeLang === 'hi' ? fallbackPhalHi : fallbackPhalEn,
            phal_en: fallbackPhalEn,
            phal_hi: fallbackPhalHi,
            rashiphal: safeLang === 'hi' ? fallbackRashiphalHi : fallbackRashiphalEn,
            rashiphal_en: fallbackRashiphalEn,
            rashiphal_hi: fallbackRashiphalHi,
            num: fallbackNum,
            planet: safeLang === 'hi' ? (fallbackAstro.planet_hi || fallbackAstro.planet_en || 'Sun') : (fallbackAstro.planet_en || 'Sun'),
            planet_en: fallbackAstro.planet_en || 'Sun',
            planet_hi: fallbackAstro.planet_hi || fallbackAstro.planet_en || 'Sun',
            color: safeLang === 'hi' ? (fallbackAstro.color_hi || fallbackAstro.color_en || 'Golden') : (fallbackAstro.color_en || 'Golden'),
            color_en: fallbackAstro.color_en || 'Golden',
            color_hi: fallbackAstro.color_hi || fallbackAstro.color_en || 'Golden',
            luckyNumbers: fallbackAstro.lucky_nos || '1, 3, 5',
            numFal: safeLang === 'hi' ? (fallbackAstro.fal_hi || fallbackAstro.fal_en || 'Positive growth is likely with focused effort.') : (fallbackAstro.fal_en || 'Positive growth is likely with focused effort.'),
            numFal_en: fallbackAstro.fal_en || 'Positive growth is likely with focused effort.',
            numFal_hi: fallbackAstro.fal_hi || fallbackAstro.fal_en || 'Positive growth is likely with focused effort.'
        };

        try {
            const processed = engine.processName(rawNameData, lang) || fallback;
            return (await mergeBackendAstroProfile(processed, lang)) || processed || fallback;
        } catch (error) {
            console.error('Failed to build name details data', error);
            return fallback;
        }
    }

    function setupGlobalLanguageFab() {
        if (!document.body) return;
        let btn = document.getElementById("global-language-fab");
        if (btn && btn.dataset.googleTranslateMenu === "enabled") {
            return;
        }
        if (!btn) {
            btn = document.createElement("button");
            btn.id = "global-language-fab";
            btn.type = "button";
            btn.setAttribute("aria-label", "Switch language");
            document.body.appendChild(btn);
        }

        const setImportant = (prop, value) => {
            btn.style.setProperty(prop, value, "important");
        };

        // Base visual style.
        setImportant("position", "fixed");
        setImportant("z-index", "2147483647");
        setImportant("display", "inline-flex");
        setImportant("align-items", "center");
        setImportant("justify-content", "center");
        setImportant("width", "auto");
        setImportant("border", "1px solid rgba(17,24,39,0.35)");
        setImportant("background", "linear-gradient(135deg,#facc15 0%,#f59e0b 100%)");
        setImportant("color", "#111827");
        setImportant("border-radius", "999px");
        setImportant("font-weight", "800");
        setImportant("line-height", "1.2");
        setImportant("font-family", "Poppins, Arial, sans-serif");
        setImportant("cursor", "pointer");
        setImportant("opacity", "1");
        setImportant("visibility", "visible");
        setImportant("pointer-events", "auto");

        const mobileQuery = window.matchMedia("(max-width: 768px)");
        const applyFabPlacement = () => {
            if (mobileQuery.matches) {
                // Keep FAB out of hero/purple-border zone on mobile.
                setImportant("top", "auto");
                setImportant("right", "10px");
                setImportant("left", "auto");
                setImportant("bottom", "132px");
                setImportant("min-width", "52px");
                setImportant("max-width", "70px");
                setImportant("padding", "8px 9px");
                setImportant("font-size", "10px");
                setImportant("box-shadow", "0 8px 18px rgba(0,0,0,0.2)");
                setImportant("z-index", "1302");
            } else {
                setImportant("top", "auto");
                setImportant("left", "12px");
                setImportant("right", "auto");
                setImportant("bottom", "20px");
                setImportant("min-width", "132px");
                setImportant("max-width", "calc(100vw - 24px)");
                setImportant("padding", "11px 14px");
                setImportant("font-size", "13px");
                setImportant("box-shadow", "0 12px 24px rgba(0,0,0,0.24)");
                setImportant("z-index", "2147483647");
            }
        };
        applyFabPlacement();
        if (typeof mobileQuery.addEventListener === "function") {
            mobileQuery.addEventListener("change", () => {
                applyFabPlacement();
                updateFabLabel(getLanguage());
            });
        } else if (typeof mobileQuery.addListener === "function") {
            mobileQuery.addListener(() => {
                applyFabPlacement();
                updateFabLabel(getLanguage());
            });
        }

        const updateFabLabel = (lang) => {
            const current = lang === "en" ? "en" : "hi";
            if (mobileQuery.matches) {
                btn.textContent = current === "hi" ? "\u0939\u093f\u0902" : "EN";
                return;
            }
            btn.textContent = current === "hi" ? "\u0939\u093f\u0902\u0926\u0940" : "ENGLISH";
        };

        btn.onclick = () => {
            const nextLang = getLanguage() === "hi" ? "en" : "hi";
            updateContent(nextLang);
            updateFabLabel(nextLang);
        };
        updateFabLabel(getLanguage());

        document.addEventListener("languageChanged", (e) => {
            updateFabLabel(e && e.detail ? e.detail.lang : getLanguage());
        });
    }

    function isAuthPagePath(pathname = "") {
        const normalized = String(pathname || "").toLowerCase();
        return normalized.endsWith("/login.html") || normalized.endsWith("/signup.html");
    }

    function setupAuthIntentRedirects() {
        const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        const currentPathSafe = isAuthPagePath(window.location.pathname) ? "" : currentPath;
        const redirectStorageKey = 'naamin-auth-redirect';

        document.querySelectorAll('a[href*="login.html"], a[href*="signup.html"]').forEach((link) => {
            const rawHref = link.getAttribute('href');
            if (!rawHref || rawHref.startsWith('javascript:')) return;

            let parsed;
            try {
                parsed = new URL(rawHref, window.location.href);
            } catch (_e) {
                return;
            }

            if (!isAuthPagePath(parsed.pathname)) return;
            if (!currentPathSafe) return;

            if (link.dataset.redirectBound !== 'true') {
                link.dataset.redirectBound = 'true';
                link.addEventListener('click', () => {
                    try {
                        localStorage.setItem(redirectStorageKey, currentPathSafe);
                    } catch (_e) {
                        // ignore storage edge cases
                    }
                });
            }

            if (!parsed.searchParams.has('redirect')) {
                parsed.searchParams.set('redirect', currentPathSafe);
                link.setAttribute('href', `${parsed.pathname}${parsed.search}${parsed.hash}`);
            }
        });
    }

    function applyPlatformNavUpdates() {
        const domainHref = "/more/domain-name-creator/";
        const productsHref = "/product.html";
        const aiNamesHref = "/ai-names.html";
        const servicesHref = "/services.html";
        const mottoHref = "/more/motto-for-everything/";
        const nameReportHref = "/name-report.html";

        document.querySelectorAll('footer a[href*="services.html#posters"]').forEach(a => {
            a.href = productsHref;
            a.setAttribute('data-en', 'Our Products');
            a.setAttribute('data-hi', 'Our Products');
            a.textContent = 'Our Products';
        });

        document.querySelectorAll('nav a, footer a, .mobile-menu a').forEach(a => {
            try {
                const parsed = new URL(a.getAttribute('href') || '', window.location.origin);
                if (!parsed.pathname.toLowerCase().includes('name-report')) return;
                a.href = nameReportHref;
            } catch (_e) {
                // ignore invalid hrefs
            }
        });

        const setPlainNavText = (link, enText, hiText) => {
            if (!link) return;
            link.setAttribute('data-en', enText);
            link.setAttribute('data-hi', hiText || enText);
            const lang = (typeof getLanguage === 'function' && getLanguage() === 'hi') ? 'hi' : 'en';
            link.textContent = lang === 'hi' ? (hiText || enText) : enText;
        };

        // Rename Motto Generator -> Motto Creator. Keep this limited to real nav/footer
        // links; auth buttons may contain this path inside a redirect query.
        document.querySelectorAll('nav a, footer a, .mobile-menu a').forEach(a => {
            try {
                const parsed = new URL(a.getAttribute('href') || '', window.location.origin);
                if (parsed.pathname.replace(/\/index\.html$/i, '/').replace(/\/+$/, '/') !== mottoHref) return;
                setPlainNavText(a, 'Motto Creator', 'Motto Creator');
            } catch (_e) {
                // ignore invalid hrefs
            }
        });

        // Rename Products -> Our Products
        document.querySelectorAll('a[href$="product.html"]').forEach(a => {
            setPlainNavText(a, 'Our Products', 'Our Products');
        });

        // Hide Plans (pricing)
        document.querySelectorAll('nav a[href$="pricing.html"], nav a[href*="pricing.html"], footer a[href$="pricing.html"]').forEach(a => {
            a.classList.add('nav-hidden');
        });

        // Insert Domain Naming Service + Name Report in dropdowns if missing
        document.querySelectorAll('.dropdown-menu, .mobile-dropdown-menu').forEach(menu => {
            const ensureMenuLink = (href, enText, hiText, insertAfterSelector) => {
                if (menu.querySelector(`a[href="${href}"], a[href*="${href}"]`)) return;

                const li = document.createElement('li');
                const link = document.createElement('a');
                link.href = href;
                link.setAttribute('data-en', enText);
                link.setAttribute('data-hi', hiText);
                link.textContent = enText;
                li.appendChild(link);

                const afterLink = menu.querySelector(insertAfterSelector);
                if (afterLink && afterLink.parentElement) {
                    afterLink.parentElement.insertAdjacentElement('afterend', li);
                } else {
                    menu.appendChild(li);
                }
            };

            ensureMenuLink(domainHref, 'Domain Naming Service', 'Domain Naming Service', 'a[href*="motto-for-everything"]');
            ensureMenuLink(nameReportHref, 'Name Report', 'Name Report', 'a[href*="domain-name-creator"]');
        });

        // Keep "Our Products" outside "More" dropdown (desktop + mobile)
        document.querySelectorAll('.dropdown-menu a[href$="product.html"], .mobile-dropdown-menu a[href$="product.html"]').forEach(a => {
            const li = a.closest('li');
            if (li) li.remove();
        });

        // Keep "Naamin AI" outside "More" dropdown (desktop + mobile)
        document.querySelectorAll('.dropdown-menu a[href$="ai-names.html"], .mobile-dropdown-menu a[href$="ai-names.html"]').forEach(a => {
            const li = a.closest('li');
            if (li) li.remove();
        });

        document.querySelectorAll('ul.nav-links.desktop-only > li > a[href$="ai-names.html"], ul.mobile-nav-links > li > a[href$="ai-names.html"]').forEach(a => {
            setPlainNavText(a, 'Naamin AI', 'Naamin AI');
        });

        document.querySelectorAll('ul.nav-links.desktop-only').forEach(navList => {
            let topProductsLink = navList.querySelector(':scope > li > a[href$="product.html"]');
            if (!topProductsLink) {
                const li = document.createElement('li');
                const anchor = document.createElement('a');
                anchor.href = productsHref;
                anchor.setAttribute('data-en', 'Our Products');
                anchor.setAttribute('data-hi', 'Our Products');
                anchor.textContent = 'Our Products';
                li.appendChild(anchor);
                const dropdownLi = navList.querySelector(':scope > li.dropdown');
                if (dropdownLi) navList.insertBefore(li, dropdownLi);
                else navList.appendChild(li);
            } else {
                topProductsLink.href = productsHref;
                setPlainNavText(topProductsLink, 'Our Products', 'Our Products');
            }
        });

        document.querySelectorAll('ul.mobile-nav-links').forEach(navList => {
            let topProductsLink = navList.querySelector(':scope > li > a[href$="product.html"]');
            if (!topProductsLink) {
                const li = document.createElement('li');
                const anchor = document.createElement('a');
                anchor.href = productsHref;
                anchor.setAttribute('data-en', 'Our Products');
                anchor.setAttribute('data-hi', 'Our Products');
                anchor.textContent = 'Our Products';
                li.appendChild(anchor);
                const dropdownLi = navList.querySelector(':scope > li.mobile-dropdown');
                if (dropdownLi) navList.insertBefore(li, dropdownLi);
                else navList.appendChild(li);
            } else {
                topProductsLink.href = productsHref;
                setPlainNavText(topProductsLink, 'Our Products', 'Our Products');
            }
        });

        const upsertTopAiLink = (navList, dropdownSelector) => {
            let topAiLink = navList.querySelector(':scope > li > a[href$="ai-names.html"]');
            const insertBeforeTarget = () => {
                const productsLi = navList.querySelector(':scope > li > a[href$="product.html"]')?.closest('li');
                if (productsLi) return productsLi;
                return navList.querySelector(`:scope > li.${dropdownSelector}`);
            };

            if (!topAiLink) {
                const li = document.createElement('li');
                const anchor = document.createElement('a');
                anchor.href = aiNamesHref;
                anchor.setAttribute('data-en', 'Naamin AI');
                anchor.setAttribute('data-hi', 'Naamin AI');
                anchor.textContent = 'Naamin AI';
                li.appendChild(anchor);

                const target = insertBeforeTarget();
                if (target) navList.insertBefore(li, target);
                else navList.appendChild(li);
                return;
            }

            topAiLink.href = aiNamesHref;
            setPlainNavText(topAiLink, 'Naamin AI', 'Naamin AI');

            const aiLi = topAiLink.closest('li');
            const target = insertBeforeTarget();
            if (aiLi && target && aiLi !== target && aiLi.nextElementSibling !== target) {
                navList.insertBefore(aiLi, target);
            }
        };

        document.querySelectorAll('ul.nav-links.desktop-only').forEach(navList => {
            upsertTopAiLink(navList, 'dropdown');
        });

        document.querySelectorAll('ul.mobile-nav-links').forEach(navList => {
            upsertTopAiLink(navList, 'mobile-dropdown');
        });

        // Update footer services list
        document.querySelectorAll('footer .footer-grid').forEach(grid => {
            const columns = Array.from(grid.children || []);
            const servicesCol = columns.find(col => {
                const h = col.querySelector('h3');
                if (!h) return false;
                const en = (h.getAttribute('data-en') || h.textContent || '').trim().toLowerCase();
                return en === 'our services';
            });
            if (!servicesCol) return;
            servicesCol.querySelectorAll('a').forEach(a => a.remove());

            const links = [
                { href: `${servicesHref}#consultation`, en: 'Name Consultation', hi: 'Name Consultation' },
                { href: `${servicesHref}#brand`, en: 'Brand & Startup Naming', hi: 'Brand & Startup Naming' },
                { href: `${servicesHref}#company`, en: 'Company & Institution Naming', hi: 'Company & Institution Naming' },
                { href: domainHref, en: 'Domain Naming Service', hi: 'Domain Naming Service' },
                { href: mottoHref, en: 'Motto Creator', hi: 'Motto Creator' },
                { href: nameReportHref, en: 'Name Report', hi: 'Name Report' },
                { href: productsHref, en: 'Our Products', hi: 'Our Products' }
            ];
            links.forEach(l => {
                const a = document.createElement('a');
                a.href = l.href;
                a.setAttribute('data-en', l.en);
                a.setAttribute('data-hi', l.hi);
                a.textContent = l.en;
                servicesCol.appendChild(a);
            });
        });
    }

    function setupServicesCardRedirects() {
        const serviceCards = document.querySelectorAll('#services .service-card, #why-choose .service-card');
        if (!serviceCards.length) return;
        const fallbackServicesHref = "/services.html";
        const fallbackContactHref = "/contact.html";
        const productsHref = "/product.html";
        const reportHref = "/name-report.html";
        const domainHref = "/more/domain-name-creator/";
        const mottoHref = "/more/motto-for-everything/";
        const popularNamesHref = "/popular-names.html";

        serviceCards.forEach(card => {
            card.classList.add('service-card-clickable');
            card.setAttribute('role', 'link');
            card.setAttribute('tabindex', '0');

            const titleEl = card.querySelector('h3');
            const serviceTitle = (titleEl?.getAttribute('data-en') || titleEl?.textContent || card.id || 'Service').trim();
            const normalizedTitle = serviceTitle.toLowerCase();
            const routeToService = () => {
                if (/(baby|family)/i.test(normalizedTitle)) {
                    const openSearchBtn = document.getElementById('open-search-modal-btn');
                    if (openSearchBtn) {
                        openSearchBtn.click();
                        return;
                    }
                    window.location.href = popularNamesHref;
                    return;
                }
                if (/(our products?|products?|poster|announcement)/i.test(normalizedTitle)) {
                    window.location.href = productsHref;
                    return;
                }
                if (/(name report|report)/i.test(normalizedTitle)) {
                    window.location.href = reportHref;
                    return;
                }
                if (/(domain)/i.test(normalizedTitle)) {
                    window.location.href = domainHref;
                    return;
                }
                if (/(motto|tagline)/i.test(normalizedTitle)) {
                    window.location.href = mottoHref;
                    return;
                }
                if (/(startup|brand|company|institution|pronunciation)/i.test(normalizedTitle)) {
                    window.location.href = fallbackServicesHref;
                    return;
                }
                window.location.href = `${fallbackContactHref}?service=${encodeURIComponent(serviceTitle)}`;
            };

            card.addEventListener('click', (event) => {
                if (event.target.closest('a, button, input, select, textarea')) return;
                routeToService();
            });

            card.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                routeToService();
            });
        });
    }

    function setupAnimatedCounters() {
        const counters = document.querySelectorAll('[data-counter-target]');
        if (!counters.length) return;
        const formatNumber = (value, format) => {
            if (format === 'indian') return value.toLocaleString('en-IN');
            return value.toLocaleString('en-US');
        };
        const animateCounter = (el) => {
            const target = parseInt(el.dataset.counterTarget, 10) || 0;
            const suffix = el.dataset.counterSuffix || '';
            const format = el.dataset.counterFormat || 'indian';
            const duration = target >= 100000 ? 3800 : 2800;
            const start = performance.now();

            const step = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const value = Math.floor(progress * target);
                el.textContent = `${formatNumber(value, format)}${suffix}`;
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                if (el.dataset.counterDone === 'true') return;
                el.dataset.counterDone = 'true';
                animateCounter(el);
                obs.unobserve(el);
            });
        }, { threshold: 0.4 });

        counters.forEach(counter => observer.observe(counter));
    }

    applyPlatformNavUpdates();
    document.addEventListener("naamin:layout-ready", applyPlatformNavUpdates);
    document.addEventListener("naamin:google-translate-changed", applyPlatformNavUpdates);
    document.addEventListener("naamin:set-language", applyPlatformNavUpdates);
    setupAuthIntentRedirects();
    setupServicesCardRedirects();
    setupAnimatedCounters();

    function namesFileForGender(gender) {
        const activeLang = getLanguage();
        // Hindi mode should prefer Hindi meaning files; English mode keeps canonical English first.
        if (gender === 'Boy') {
            if (activeLang === 'hi') {
                return [
                    'boy_names_hin.json',
                    'boy_names_hi.json',
                    'boy_names_eng.json',
                    'boy_names_en.json',
                    'bnames.json',
                    'boy_names.json'
                ];
            }
            return [
                'boy_names_eng.json',
                'boy_names_en.json',
                'boy_names_hin.json',
                'boy_names_hi.json',
                'bnames.json',
                'boy_names.json'
            ];
        }
        if (activeLang === 'hi') {
            return [
                'girl_names_hi.json',
                'girl_names_hin.json',
                'girl_names_eng.json',
                'girl_names_en.json',
                'gnames.json',
                'girl_names.json'
            ];
        }
        return [
            'girl_names_eng.json',
            'girl_names_en.json',
            'girl_names_hi.json',
            'gnames.json',
            'girl_names.json'
        ];
    }

async function fetchFirstJson(candidates) {
        if (!Array.isArray(candidates)) candidates = [candidates];
        // Stable version key keeps browser caching effective while still allowing controlled refreshes.
        const cacheBuster = '?v=name-data-20260425a';
        for (const f of candidates) {
            try {
                const fileUrl = '/' + String(f || '').replace(/^\/+/, '');
                const res = await fetch(fileUrl + cacheBuster);
                if (!res.ok) { console.debug('fetchFirstJson: skip', f, res.status); continue; }
                const raw = await res.text();
                const cleanRaw = String(raw || "").replace(/^\uFEFF/, "");
                const j = JSON.parse(cleanRaw);
                console.debug('fetchFirstJson: loaded', f, Array.isArray(j) ? j.length + ' items' : typeof j);
                return { data: j, file: f };
            } catch (err) {
                console.debug('fetchFirstJson: error', f, err);
                continue;
            }
        }
        return null;
    }

function normalizeDisplayName(rawName) {
        let name = String(rawName || '').replace(/\s+/g, ' ').trim();
        if (!name) return '';

        // Title-case clean English names while preserving apostrophes/hyphens/spaces.
        if (/^[A-Za-z][A-Za-z\s'-]*$/.test(name)) {
            name = name
                .toLowerCase()
                .replace(/\b[a-z]/g, (char) => char.toUpperCase());
        }
        return name;
}

function transliterateHindiToLatin(rawValue) {
    const text = String(rawValue || "").trim();
    if (!text) return "";
    if (!/[\u0900-\u097F]/.test(text)) return text;

    const independentVowels = Object.freeze({
        "अ": "a", "आ": "aa", "इ": "i", "ई": "ee", "उ": "u", "ऊ": "oo", "ऋ": "ri",
        "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au", "ऑ": "o"
    });
    const consonants = Object.freeze({
        "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ng",
        "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "ny",
        "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
        "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
        "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
        "य": "y", "र": "r", "ल": "l", "व": "v",
        "श": "sh", "ष": "sh", "स": "s", "ह": "h",
        "ळ": "l", "क्ष": "ksh", "त्र": "tr", "ज्ञ": "gy"
    });
    const matras = Object.freeze({
        "ा": "aa", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo", "ृ": "ri",
        "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ॅ": "e", "ॉ": "o"
    });
    const specials = Object.freeze({
        "ं": "n", "ः": "h", "ँ": "n"
    });
    const virama = "्";

    let out = "";
    for (let i = 0; i < text.length; i += 1) {
        const ch = text[i];
        const pair = text.slice(i, i + 2);
        if (consonants[pair]) {
            out += consonants[pair];
            i += 1;
            continue;
        }
        if (independentVowels[ch]) {
            out += independentVowels[ch];
            continue;
        }
        if (consonants[ch]) {
            const next = text[i + 1] || "";
            const after = text[i + 2] || "";
            out += consonants[ch];
            if (next === virama) {
                i += 1;
            } else if (matras[next]) {
                out += matras[next];
                i += 1;
            } else {
                out += "a";
            }
            if (specials[after]) {
                out += specials[after];
                i += 1;
            }
            continue;
        }
        if (matras[ch]) {
            out += matras[ch];
            continue;
        }
        if (specials[ch]) {
            out += specials[ch];
            continue;
        }
        if (/\s/.test(ch)) {
            out += " ";
        }
    }

    return out
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
        .replace(/\b[a-z]/g, (m) => m.toUpperCase());
}

const HINGLISH_MEANING_EN_OVERRIDES = Object.freeze({
    "achchhe aacharana vaalaa achchhe gunon vaalaashubha lakshanon se yukta": "One with good conduct, noble qualities, and auspicious traits.",
    "saba ke bosamaalika achchhee buddhi vaalaa": "A leader of all, a master, and one with good intellect.",
    "jise koee jeeta naheen sakataa balavaana buddhimaan": "Invincible, strong, and intelligent.",
    "jise koee jeeta naheen sakataa sabase jyaadaa jnyaanee shaktishaalee": "Invincible, highly knowledgeable, and powerful.",
    "ganbheera rahanevaalaa theeka theeka manoranjana karane vaalaa": "Serious by nature, yet able to entertain gracefully.",
    "doosare ko jeevana daana karane vaalaa paropakaaree insaan": "A benevolent person who gives life and helps others.",
    "sabase pramukha sarvochcha pada para aaseen": "Foremost, seated in the highest position.",
    "bhaaeebahanon men chhotebaada men janma lene vaalesabake priya": "A younger sibling, born later, and loved by all.",
    "anubhaveejnyaaneevyaktigata nireekshana aura prayoga se praapta jnyaana vaale": "Experienced and knowledgeable through personal observation and practice.",
    "nidara shaktimaan": "Fearless and powerful.",
    "pavitra jala ke jaise shuddha pavitra aacharana vaale": "Pure in conduct, like sacred water.",
    "saansaarika unnati karane vaale mehanatee purushaarthee": "Hardworking and dedicated to worldly progress.",
    "jisakaa maalika amara hai vaha bhagavaana ke priya bhakt": "One whose lord is immortal; a beloved devotee of God.",
    "vishaala dila vaaleaseema kshamataa vaale": "Large-hearted, with limitless potential.",
    "adhika tejasvee ojasvee": "Highly radiant and energetic.",
    "jnyaanee mahaapurushon ko praapta karane vaalaa": "One who attains the company of wise and noble people.",
    "jaldee se kisee se naaraaja na hone vaalekrodha vinaa matalaba ke hinsaa na karane vaalesabase prema karane vaale": "Loving toward everyone, slow to anger, and free from needless violence.",
    "dhana sanpatti kamaane vaalaa kuntee putra ke samaana paraakramee gaura varna vaalaa": "A courageous achiever of wealth, like Kunti's son Arjuna.",
    "daanee kuchha na kuchha giphta dene ke svabhaavavaalaa": "Generous by nature, one who likes to give.",
    "ayodhyaa ke raajaa dasharatha ke jaise guna vaaleraajaneeti visheshajnyasabhee se prema karane vaale": "Having qualities like King Dasharatha of Ayodhya, skilled in statecraft, and loving toward all.",
    "jisake paasa koee shoka naheen bindaasa rahane vaalaa": "Free from sorrow and carefree in spirit.",
    "ghodaaa phaarma ke maalikaghuda savaara karane vaaledevataaon ke vedyajinakaa janma ashvinee nakshatra men huaa ho saubhaagyashaalee": "A fortunate one associated with horses, healing, and the Ashwini nakshatra.",
    "padaartha vijnyaana men visheshajnya bhautikee premee paramaanu vijnyaana premee": "A lover of physics, matter, and atomic science.",
    "sabako apanee ora aakarshita karane vaalaa sundarajnyaanavaana shaktimaan": "Attractive, beautiful, knowledgeable, and powerful.",
    "saba jagaha se khyaati praapta karane vaalaa prasiddha vyakti": "A famous person who gains recognition everywhere.",
    "apane aapa men aananda rahane vaalaamauja mastee men rahane vaalaa": "One who lives joyfully and remains cheerful within himself.",
    "achchhee taraha se dekhakara vichaarakara kaarya karane vaalaa vyaktilogon ke lie pathapradarshaka": "A thoughtful person who acts with care and guides others.",
    "soorya ke jaise prakaashita tejasveedeva tuly": "Radiant and bright like the sun; divine in nature.",
    "soorya bhagavaan ke upaasaka soorya jaise parokaara karane vaalon kaa svaamee": "A worshipper of the sun, lord of those who help others like the sun.",
    "soorya ke prakaasha kee rakshaa karane vaalaa vaijnyaanik": "A scientist-like protector of the sun's light.",
    "soorya ke prakaasha ke jaise ojasvee tejasvee": "Energetic and radiant like sunlight.",
    "khusha mijaaja prasanna rahanevaalaa aananda men rahane vaalaa": "Cheerful, pleasant, and joyful.",
    "apane aananda se sabako prakaashita karane vaale": "One who enlightens others through his joy.",
    "eemaanadaaree spashtavaadeeudaara hridaya vaale achchhaa svabhaava vaalaa": "Honest, clear-spoken, generous-hearted, and good-natured."
});

function normalizeMeaningKey(value) {
    return String(value || "")
        .replace(/\s+/g, " ")
        .replace(/[।.]+$/g, "")
        .trim()
        .toLowerCase();
}

function isLikelyHinglishMeaning(value) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    if (!text || /[\u0900-\u097F]/.test(text)) return false;
    const lower = text.toLowerCase();
    return /(?:^|[^a-z])(ke|ka|ki|ko|se|men|mein|aur|jo|jise|jisak|saba|sabako|vaalaa|vaale|wala|wale|rahane|karane|jnyaan|buddhi|bhagavaan|soorya|prakaash|achchh|shakti|tejasv|ojasv|vyakti)(?:$|[^a-z])/.test(lower)
        || /(vaalaa|vaale|vaali|jnyaan|bhagavaan|prakaash|achchh|karane|rahane|shaktimaan|buddhimaan)/.test(lower);
}

function englishMeaningForNameData(data) {
    const raw = String(data?.meaning_en || data?.meaning || "").replace(/\s+/g, " ").trim();
    if (!raw || /^meaning\s+coming\s+soon\.?$/i.test(raw)) return "Meaning not available";
    if (!isLikelyHinglishMeaning(raw)) return raw;

    const override = HINGLISH_MEANING_EN_OVERRIDES[normalizeMeaningKey(raw)];
    if (override) return override;

    return "Meaning not available";
}

function normalizeLoadedNames(rawArray, gender) {
        if (!Array.isArray(rawArray)) return [];

        const seen = new Set();
        const normalized = [];

        rawArray.forEach((item) => {
            const originalName = (typeof item === 'string')
                ? item
                : (item && typeof item === 'object' ? (item.name || item.Name || '') : '');
            const cleanName = normalizeDisplayName(originalName);
            const displayName = /[\u0900-\u097F]/.test(cleanName)
                ? normalizeDisplayName(transliterateHindiToLatin(cleanName))
                : cleanName;
            if (!displayName || displayName.length < 2) return;

            const key = displayName.toLocaleLowerCase();
            if (seen.has(key)) return;
            seen.add(key);

            const rawHindiName = (item && typeof item === 'object')
                ? (item.hindiName || item.hindi_name || item.name_hindi || item.hName || '')
                : '';
            const bestHindiName = resolveHindiName(rawHindiName || cleanName, displayName);

            normalized.push({
                ...(item && typeof item === 'object' ? item : {}),
                name: displayName,
                Name: displayName,
                hName: bestHindiName,
                hindiName: bestHindiName,
                meaning_en: englishMeaningForNameData({ ...(item && typeof item === 'object' ? item : {}), name: displayName }),
                gender: gender
            });
        });

        normalized.sort((a, b) => {
            const aName = String(a.name || '').trim();
            const bName = String(b.name || '').trim();
            return aName.localeCompare(bName, undefined, { sensitivity: 'base' });
        });

        return normalized;
    }

    // Expose helper functions for tests
    if (typeof window !== 'undefined') {
        window.namesFileForGender = namesFileForGender;
        window.fetchFirstJson = fetchFirstJson;
        window.getLanguage = getLanguage;
    }

    function updateContent(lang) {
        // Internal copy system supports only en/hi.
        // Any other language should fallback to English so external translators can run safely.
        lang = lang === "hi" ? "hi" : "en";
        console.log("Script.js: updateContent called with lang:", lang);

        let externalGoogleLang = "en";
        let googleTranslateCookie = "";
        try {
            externalGoogleLang = String(localStorage.getItem("naamin-google-translate-language") || "en").toLowerCase();
        } catch (_storageErr) {
            externalGoogleLang = "en";
        }
        try {
            googleTranslateCookie = String(document.cookie || "");
        } catch (_cookieErr) {
            googleTranslateCookie = "";
        }

        const googleDropdownControlsLanguage =
            Boolean(document.getElementById("global-google-translate-select")) ||
            Boolean(localStorage.getItem("naamin-google-translate-language"));
        if (googleDropdownControlsLanguage) {
            lang = "en";
        }

        const googleTranslateDomActive =
            document.documentElement.classList.contains("translated-ltr") ||
            document.body.classList.contains("translated-ltr") ||
            document.documentElement.classList.contains("translated-rtl") ||
            document.body.classList.contains("translated-rtl") ||
            /(?:^|;\s*)googtrans=\/en\//i.test(googleTranslateCookie);

        const externalLangActive =
            externalGoogleLang !== "en" &&
            externalGoogleLang !== "hi" &&
            googleTranslateDomActive;

        const WIN1252_REVERSE = {
            8364: 128, 8218: 130, 402: 131, 8222: 132, 8230: 133, 8224: 134, 8225: 135,
            710: 136, 8240: 137, 352: 138, 8249: 139, 338: 140, 381: 142,
            8216: 145, 8217: 146, 8220: 147, 8221: 148, 8226: 149, 8211: 150, 8212: 151,
            732: 152, 8482: 153, 353: 154, 8250: 155, 339: 156, 382: 158, 376: 159
        };

        function normalizeMaybeMojibake(text) {
            if (!text) return text;
            let normalizedText = String(text);

            const quickFixMap = [
                [/Â©/g, "\u00A9"],
                [/â€™/g, "\u2019"],
                [/â€˜/g, "\u2018"],
                [/â€œ/g, "\u201C"],
                [/â€/g, "\u201D"],
                [/â€”/g, "\u2014"],
                [/â€“/g, "\u2013"],
                [/â€¢/g, "\u2022"],
                [/â–¼/g, "\u25BC"],
                [/â‚¹/g, "\u20B9"],
                [/âœ¨/g, "\u2728"],
                [/ðŸ”®/g, "\u{1F52E}"],
                [/ðŸ”¢/g, "\u{1F522}"],
                [/ðŸŒŸ/g, "\u{1F31F}"]
            ];

            quickFixMap.forEach(([pattern, replacement]) => {
                normalizedText = normalizedText.replace(pattern, replacement);
            });

            // Only attempt decoding for common mojibake markers seen in this repo.
            if (!/(?:[\u00C2\u00C3\u00E2\u00F0]|\u00E0\u00A4|\u00E0\u00A5)/.test(normalizedText)) return normalizedText;

            try {
                const bytes = new Uint8Array(normalizedText.length);
                for (let i = 0; i < normalizedText.length; i++) {
                    const code = normalizedText.charCodeAt(i);
                    if (code <= 255) {
                        bytes[i] = code;
                        continue;
                    }
                    const mapped = WIN1252_REVERSE[code];
                    if (mapped === undefined) return text;
                    bytes[i] = mapped;
                }

                const decoded = new TextDecoder('utf-8').decode(bytes);

                if (!decoded || decoded === normalizedText) return normalizedText;
                if (decoded.includes('ï¿½')) return normalizedText;

                const devanagariCount = (decoded.match(/[\u0900-\u097F]/g) || []).length;
                if (devanagariCount > 0) return decoded;

                // Fix common symbol mojibake like "Â©" -> "Â©", "â€™" -> "â€™", "â–¼" -> "â–¼"
                if (/(?:[\u00C2\u00C3\u00E2])/.test(normalizedText) && !/(?:[\u00C2\u00C3\u00E2])/.test(decoded)) return decoded;

                return normalizedText;
            } catch (_e) {
                return normalizedText;
            }
        }

        function setTextPreserveChildren(el, translated) {
            // If element contains child elements (icons/spans), don't wipe them with textContent.
            const hasElementChildren = Array.from(el.childNodes).some(n => n.nodeType === 1);
            if (!hasElementChildren) {
                el.textContent = translated;
                return;
            }

            // Google Translate may inject nested <font> wrappers that lead to duplicated labels.
            el.querySelectorAll('font, .goog-text-highlight').forEach(node => node.remove());

            // Keep child elements (icons/arrows), but rebuild plain text node to a single source of truth.
            Array.from(el.childNodes).forEach((node) => {
                if (node.nodeType === 3) node.remove();
            });

            const cleanText = String(translated || '').trim();
            if (!cleanText) return;

            const textNode = document.createTextNode(cleanText);
            const arrowNode = Array.from(el.children).find((child) => child.classList && child.classList.contains('arrow'));
            if (arrowNode) {
                const prevNode = arrowNode.previousSibling;
                const needsLeadingSpace = Boolean(prevNode && prevNode.nodeType === 1 && /^(I|SVG|IMG)$/i.test(prevNode.tagName || ''));
                if (needsLeadingSpace) textNode.nodeValue = ` ${cleanText}`;
                el.insertBefore(textNode, arrowNode);
                return;
            }

            const lastChild = el.lastChild;
            const needsLeadingSpace = Boolean(lastChild && lastChild.nodeType === 1 && /^(I|SVG|IMG)$/i.test(lastChild.tagName || ''));
            if (needsLeadingSpace) textNode.nodeValue = ` ${cleanText}`;
            el.appendChild(textNode);
        }

        function sanitizeTranslatedHTML(html) {
            const raw = String(html || '');
            if (!raw) return '';

            // Only allow a tiny, predictable set of tags used in copy: strong/em/br.
            const template = document.createElement('template');
            template.innerHTML = raw;

            const allowed = new Set(['STRONG', 'EM', 'BR']);
            const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT, null);
            const toReplace = [];

            while (walker.nextNode()) {
                const node = walker.currentNode;
                if (!allowed.has(node.tagName)) {
                    toReplace.push(node);
                    continue;
                }
                Array.from(node.attributes || []).forEach((attr) => node.removeAttribute(attr.name));
            }

            toReplace.forEach((node) => {
                const text = document.createTextNode(node.textContent || '');
                node.replaceWith(text);
            });

            return template.innerHTML;
        }

        function setTranslatedContent(el, translated) {
            // If element contains child elements (icons/spans), don't wipe them with innerHTML.
            const hasElementChildren = Array.from(el.childNodes).some(n => n.nodeType === 1);
            if (hasElementChildren) {
                setTextPreserveChildren(el, translated);
                return;
            }

            const raw = String(translated || '');
            const looksLikeHTML =
                /<\/?(?:strong|em|br)\b/i.test(raw) ||
                raw.includes('&mdash;') ||
                raw.includes('&ndash;') ||
                raw.includes('&nbsp;');

            if (!looksLikeHTML) {
                el.textContent = translated;
                return;
            }

            el.innerHTML = sanitizeTranslatedHTML(raw);
        }

        function hasPlaceholderQuestionMarks(text) {
            if (!text) return true;
            const trimmed = String(text).trim();
            if (!trimmed) return true;
            if (/^\?+$/.test(trimmed)) return true;
            if (/^\?\s*/.test(trimmed)) return true;
            if (/[\?]{2,}/.test(trimmed)) return true;
            if (/[A-Za-z\u0900-\u097F0-9]\s+\?+\s+[A-Za-z\u0900-\u097F0-9]/.test(trimmed)) return true;
            if (trimmed.includes('ï¿½')) return true;
            if (/(?:\u00C3|\u00C2|\u00E2|\u00E0\u00A4|\u00E0\u00A5|\u00EF\u00BF\u00BD)/.test(trimmed) && !/[\u0900-\u097F]/.test(trimmed)) return true;
            return false;
        }

        function sanitizeVisibleCopy(text) {
            if (!text) return '';
            return String(text)
                .replace(/\uFFFD+/g, ' - ')
                .replace(/\s*-\s*-\s*/g, ' - ')
                .replace(/^\?\s*/g, '')
                .replace(/[A-Za-z\u0900-\u097F0-9]\s+\?+\s+(?=[A-Za-z\u0900-\u097F0-9])/g, (match) => match.replace(/\s+\?+\s+/, ' '))
                .replace(/\?{2,}/g, '')
                .replace(/\s{2,}/g, ' ')
                .replace(/^-\s+/, '')
                .trim();
        }

        function scrubVisibleQuestionArtifacts() {
            if (!document.body) return;
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
            let node = walker.nextNode();
            while (node) {
                const parentTag = node.parentElement ? node.parentElement.tagName : '';
                if (!['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'].includes(parentTag)) {
                    const raw = node.nodeValue || '';
                    if (/(?:\uFFFD|Â©|â€™|â€˜|â€œ|â€|â€”|â€“|â€¢|â–¼|â‚¹|\?{2,})/.test(raw) || /^\?\s*/.test(raw.trim()) || /[A-Za-z\u0900-\u097F0-9]\s+\?+\s+[A-Za-z\u0900-\u097F0-9]/.test(raw)) {
                        const fixed = sanitizeVisibleCopy(normalizeMaybeMojibake(raw));
                        if (fixed && fixed !== raw.trim()) {
                            node.nodeValue = fixed;
                        }
                    }
                }
                node = walker.nextNode();
            }
        }

        document.documentElement.lang = lang;
        localStorage.setItem("language", lang);

        // Keep the details panel translatable in non-Hindi mode.
        // (When Google Translate is active we may skip repainting text, but we must not leave `.notranslate` on the panel.)
        const liveDetailsCard = document.querySelector('.name-details');
        if (liveDetailsCard) {
            if (lang === 'hi') {
                liveDetailsCard.classList.add('notranslate');
                liveDetailsCard.setAttribute('translate', 'no');
                liveDetailsCard.setAttribute('lang', 'hi');
            } else {
                liveDetailsCard.classList.remove('notranslate');
                liveDetailsCard.removeAttribute('translate');
                liveDetailsCard.setAttribute('lang', 'en');
            }
        }

        // If Google Translate is active (any language), do not fight the translated DOM.
        // This avoids duplicated labels caused by Translate-injected wrappers + our repaint logic.
        if (googleTranslateDomActive) {
            document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
            return;
        }
        const hasMultiLangSelect = Boolean(document.getElementById('global-google-translate-select'));
        document.querySelectorAll("#language-toggle, #language-toggle-mobile").forEach((btn) => {
            if (hasMultiLangSelect || (btn && btn.dataset && btn.dataset.naaminLangSuppressed === 'true')) {
                btn.setAttribute('aria-hidden', 'true');
                btn.tabIndex = -1;
                btn.style.setProperty('display', 'none', 'important');
                btn.style.setProperty('visibility', 'hidden', 'important');
                btn.style.setProperty('pointer-events', 'none', 'important');
                return;
            }
            btn.style.display = "";
            btn.removeAttribute("aria-hidden");
        });
        const translatableElements = document.querySelectorAll("[data-en]");
        translatableElements.forEach(el => {
            const preferredRaw = el.getAttribute(lang === "hi" ? "data-hi" : "data-en");
            const fallbackRaw = el.getAttribute("data-en");
            const normalizedPreferred = sanitizeVisibleCopy(normalizeMaybeMojibake(preferredRaw));
            const normalizedFallback = sanitizeVisibleCopy(normalizeMaybeMojibake(fallbackRaw));
            const useFallback = hasPlaceholderQuestionMarks(normalizedPreferred);
            const shouldUseHindiFallback =
                lang === "hi" &&
                (useFallback || normalizedPreferred === normalizedFallback || hasPlaceholderQuestionMarks(normalizedPreferred));

            let text = useFallback ? normalizedFallback : normalizedPreferred;
            if (shouldUseHindiFallback) {
                text = fallbackHindiCopy(normalizedFallback);
            }
            if (text) {
                if (el.getAttribute('href') && el.getAttribute('href').includes('popular-names')) {
                    console.log("Script.js: Translating Popular Names element to: " + text);
                }
                setTranslatedContent(el, text);
            }
        });
        translateLooseTextNodes(lang);
        translateLooseAttributes(lang);
        scrubVisibleQuestionArtifacts();
        repairHindiMojibake();
        enforceAnnouncementBanner();

        [120, 420, 900].forEach((delay) => {
            window.setTimeout(() => {
                if ((document.documentElement.lang || "en") !== lang) return;
                translateLooseTextNodes(lang);
                translateLooseAttributes(lang);
                scrubVisibleQuestionArtifacts();
                repairHindiMojibake();
            }, delay);
        });

        // Dispatch global event for other scripts to react
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));

        const inp = document.getElementById("hero-search-input");
        if (inp) inp.placeholder = lang === "hi" ? "\u0909\u0926\u093e: \u0905\u0902\u0915\u093f\u0924, \u0905\u091c\u092f..." : "e.g., Aabha, Aajna...";

        // If name finder is visible, reload names for currently selected gender so JSON file/language updates instantly
        try {
            const activeGenderBtn = document.querySelector('.gender-btn.active-boy, .gender-btn.active-girl');
            if (activeGenderBtn) {
                // trigger click to reload names using existing handlers
                activeGenderBtn.click();
            }
        } catch (e) {
            console.debug('updateContent: no gender controls yet');
        }
    }

    // Keep full-platform naming navigation; do not apply legacy baby-only overrides.
    function wireLanguageToggles() {
        const wire = (id) => {
            const btn = document.getElementById(id);
            if (!btn || btn.dataset.bound === 'true') return;
            btn.dataset.bound = 'true';
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const nextLang = getLanguage() === "hi" ? "en" : "hi";
                updateContent(nextLang);
            });
        };

        wire("language-toggle");
        wire("language-toggle-mobile");
    }

    wireLanguageToggles();
    document.addEventListener("naamin:layout-ready", wireLanguageToggles);

    document.addEventListener('naamin:set-language', (event) => {
        const requested = event && event.detail ? event.detail.lang : '';
        const targetLang = requested === 'hi' ? 'hi' : 'en';
        updateContent(targetLang);
    });

    function removeInternalLanguageFabIfRedundant() {
        const btn = document.getElementById("global-language-fab");
        if (!btn || btn.dataset.googleTranslateMenu === "enabled") return;
        if (document.getElementById("language-toggle") || document.getElementById("language-toggle-mobile")) {
            try { btn.remove(); } catch (_e) { btn.style.display = "none"; }
        }
    }

    snapshotOriginalLanguageState(document.body);
    ensureLanguageMutationObserver();
    repairHindiMojibake();
    const hasGoogleTranslateSelectorScript = Array.from(document.scripts || []).some((s) => String(s && s.src ? s.src : '').includes('global-language-fab.js'));
    if (!hasGoogleTranslateSelectorScript && !document.getElementById("language-toggle") && !document.getElementById("language-toggle-mobile")) {
        setupGlobalLanguageFab();
    }
    updateContent(getLanguage());
    removeInternalLanguageFabIfRedundant();
    document.addEventListener("naamin:layout-ready", removeInternalLanguageFabIfRedundant);

    // --- Aura Plan Click Logic ---
    const pricingSection = document.querySelector('.pricing-grid');
    if (pricingSection) {
        pricingSection.addEventListener('click', function (e) {
            const header = e.target.closest('.pricing-card-header');
            if (header) {
                const card = header.closest('.pricing-card');
                if (card) {
                    card.classList.toggle('expanded');
                }
            }
        });
    }

    // Helper: Show Details UI (UPDATED WITH HEART BUTTON)
    function getDetailLabelsForLang(lang) {
        const isHindi = lang === 'hi';
        const labels = {
            meaning: isHindi ? "\u0905\u0930\u094d\u0925" : "Meaning",
            gender: isHindi ? "\u0932\u093f\u0902\u0917" : "Gender",
            origin: isHindi ? "\u092e\u0942\u0932" : "Origin",
            vedicTitle: isHindi ? "\u0935\u0948\u0926\u093f\u0915 \u091c\u094d\u092f\u094b\u0924\u093f\u0937" : "Vedic Astrology",
            rashi: isHindi ? "\u0930\u093e\u0936\u093f" : "Rashi",
            nakshatra: isHindi ? "\u0928\u0915\u094d\u0937\u0924\u094d\u0930" : "Nakshatra",
            personality: isHindi ? "2026 \u092d\u0935\u093f\u0937\u094d\u092f\u0935\u093e\u0923\u0940" : "2026 Prediction",
            rashiphalTitle: isHindi ? "2026 \u0930\u093e\u0936\u093f\u092b\u0932" : "2026 Horoscope",
            numTitle: isHindi ? "\u0905\u0902\u0915 \u091c\u094d\u092f\u094b\u0924\u093f\u0937" : "Numerology",
            number: isHindi ? "\u0905\u0902\u0915" : "Number",
            planet: isHindi ? "\u0917\u094d\u0930\u0939" : "Planet",
            luckyColor: isHindi ? "\u0936\u0941\u092d \u0930\u0902\u0917" : "Lucky Color",
            luckyNos: isHindi ? "\u0936\u0941\u092d \u0905\u0902\u0915" : "Lucky Numbers",
            prediction: isHindi ? "\u092d\u0935\u093f\u0937\u094d\u092f\u092b\u0932" : "Prediction"
        };

        return isHindi && typeof decodeHindiMojibakeDeep === 'function'
            ? decodeHindiMojibakeDeep(labels)
            : labels;
    }

    function showDetails(box, data) {
        window.showDetails = showDetails;

        if (!box || !data) return;
        const isFav = favManager.isFavorite(data.name);
        const activeLang = getLanguage() === 'hi' ? 'hi' : 'en';
        const L = getDetailLabelsForLang(activeLang);

        // Remember last-opened details so we can re-render on language change.
        window.__naaminActiveDetails = { box, data };

        if (!document.body.dataset.naaminDetailsLangSyncBound) {
            document.body.dataset.naaminDetailsLangSyncBound = "1";
            const rerenderActiveDetails = () => {
                const state = window.__naaminActiveDetails;
                if (!state || !state.box || !state.data) return;
                if (!state.box.isConnected) return;
                const container = state.box.closest('.name-details-container');
                if (container && container.style && container.style.display === 'none') return;
                if (typeof window.showDetails === 'function') window.showDetails(state.box, state.data);
            };
            document.addEventListener('languageChanged', rerenderActiveDetails);
            document.addEventListener('naamin:google-translate-changed', (event) => {
                const code = event && event.detail ? event.detail.code : '';
                window.setTimeout(rerenderActiveDetails, code === 'en' ? 80 : 220);
            });
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') window.setTimeout(rerenderActiveDetails, 120);
            });
        }

        // Render content in active language; Gujarati etc. uses English + Google Translate.
        const view = {
            ...data,
            meaning: activeLang === 'hi' ? (data.meaning_hi || data.meaning) : (data.meaning_en || data.meaning),
            origin: activeLang === 'hi' ? (data.origin_hi || data.origin) : (data.origin_en || data.origin),
            rashi: activeLang === 'hi' ? (data.rashi_hi || data.rashi) : (data.rashi_en || data.rashi),
            nakshatra: activeLang === 'hi' ? (data.nakshatra_hi || data.nakshatra) : (data.nakshatra_en || data.nakshatra),
            phal: activeLang === 'hi' ? (data.phal_hi || data.phal) : (data.phal_en || data.phal),
            rashiphal: activeLang === 'hi' ? (data.rashiphal_hi || data.rashiphal) : (data.rashiphal_en || data.rashiphal),
            planet: activeLang === 'hi' ? (data.planet_hi || data.planet) : (data.planet_en || data.planet),
            color: activeLang === 'hi' ? (data.color_hi || data.color) : (data.color_en || data.color),
            numFal: activeLang === 'hi' ? (data.numFal_hi || data.numFal) : (data.numFal_en || data.numFal),
        };

        // Determine gender class for pink/purple coloring
        const gender = data.gender || 'Boy';
        const genderClass = gender === 'Girl' ? 'girl-name' : 'boy-name';

        // Keep Hindi card text stable; allow Google translation for other selected languages.
        if (activeLang === 'hi') {
            box.classList.add('notranslate');
            box.setAttribute('translate', 'no');
            box.setAttribute('lang', 'hi');
        } else {
            box.classList.remove('notranslate');
            box.removeAttribute('translate');
            box.setAttribute('lang', 'en');
        }

        box.innerHTML = `
            <div class="name-details-head">
                <h2 class="${genderClass}">${data.name}</h2>
                <div class="name-details-actions">
                    <button class="pronounce-name-btn" id="pronounce-name-btn" title="Play name pronunciation" aria-label="Play name pronunciation">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <button class="card-heart-btn ${isFav ? 'active' : ''}" id="detail-heart-btn">
                        <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="detail-grid" style="text-align: left; margin-top: 20px;">
                <p><strong>${L.meaning}:</strong> ${view.meaning}</p>
                <p><strong>${L.gender}:</strong> ${activeLang === 'hi' ? (data.gender === 'Boy' ? '\u0932\u0921\u093c\u0915\u093e' : '\u0932\u0921\u093c\u0915\u0940') : data.gender}</p> 
                <p><strong>${L.origin}:</strong> ${view.origin}</p>
                <hr style="margin: 15px 0; border: 0; border-top: 1px solid #ddd;">
                <h3>${L.vedicTitle}</h3>
                <p><strong>${L.rashi}:</strong> <span class="notranslate" translate="no" lang="${activeLang === 'hi' ? 'hi' : 'en'}">${view.rashi}</span></p>
                <p><strong>${L.nakshatra}:</strong> <span class="notranslate" translate="no" lang="${activeLang === 'hi' ? 'hi' : 'en'}">${view.nakshatra}</span></p>
                <p><strong>${L.personality}:</strong> ${view.phal}</p>
                <p style="margin-top:10px; background: rgba(0,0,0,0.05); padding:10px; border-radius:8px;">
                    <strong>${L.rashiphalTitle}:</strong><br> ${view.rashiphal}
                </p>
                <hr style="margin: 15px 0; border: 0; border-top: 1px solid #ddd;">
                <h3>${L.numTitle}</h3>
                <p><strong>${L.number}:</strong> ${data.num}</p>
                <p><strong>${L.planet}:</strong> ${view.planet}</p>
                <p><strong>${L.luckyColor}:</strong> ${view.color}</p>
                <p><strong>${L.luckyNos}:</strong> ${data.luckyNumbers}</p>
                <p style="margin-top:10px;">
                    <strong>${L.prediction}:</strong> ${view.numFal}
                </p>
            </div>
        `;

        // --- HEART BUTTON LOGIC ---
        const hb = document.getElementById('detail-heart-btn');
        if (hb) {
            hb.onclick = (e) => {
                e.stopPropagation();
                const added = favManager.toggle(data);
                favManager.save();
                hb.classList.toggle('active', added);
                hb.querySelector('i').className = added ? 'fas fa-heart' : 'far fa-heart';
                renderNames();
            };
        }



        // --- PRONUNCIATION BUTTON LOGIC (NEW) ---
        const pronounceBtn = document.getElementById('pronounce-name-btn');
        if (pronounceBtn) {
            // Check if browser supports speech synthesis
            const speechSupported = 'speechSynthesis' in window;

            if (!speechSupported) {
                // Disable button if not supported
                pronounceBtn.style.opacity = '0.5';
                pronounceBtn.style.cursor = 'not-allowed';
                pronounceBtn.title = 'Pronunciation not supported on this device';
            } else {
                let currentUtterance = null;

                pronounceBtn.onclick = () => {
                    // Cancel any ongoing speech
                    if (currentUtterance) {
                        speechSynthesis.cancel();
                    }

                    // Create new utterance
                    currentUtterance = new SpeechSynthesisUtterance(data.name);

                    // Get best available voice
                    const voices = speechSynthesis.getVoices();
                    const priorities = [
                        (v) => v.lang.includes('en-IN'),  // Indian English
                        (v) => v.lang.includes('en-GB'),  // British English
                        (v) => v.lang.startsWith('en'),   // Any English
                        (v) => v.name.toLowerCase().includes('female'), // Female voice
                        (v) => true  // Any voice
                    ];

                    for (const priorityFn of priorities) {
                        const voice = voices.find(priorityFn);
                        if (voice) {
                            currentUtterance.voice = voice;
                            break;
                        }
                    }

                    // Configure speech settings
                    currentUtterance.rate = 0.85;  // Slightly slower for clarity
                    currentUtterance.pitch = 1.0;  // Natural pitch
                    currentUtterance.volume = 1.0; // Full volume

                    // Add playing class for animation
                    currentUtterance.onstart = () => {
                        pronounceBtn.classList.add('playing');
                    };

                    currentUtterance.onend = () => {
                        pronounceBtn.classList.remove('playing');
                        currentUtterance = null;
                    };

                    currentUtterance.onerror = (event) => {
                        console.error('Speech synthesis error:', event);
                        pronounceBtn.classList.remove('playing');
                        currentUtterance = null;
                    };

                    // Speak the name
                    speechSynthesis.speak(currentUtterance);
                };

                // Keyboard accessibility
                pronounceBtn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        pronounceBtn.click();
                    }
                });
            }
        }

    }

    // === SEARCH LOGIC ===
    async function handleHeroSearch() {
        const input = document.getElementById('hero-search-input');
        if (!input || !input.value.trim()) return;
        const term = input.value.trim().toLowerCase();

        const section = document.getElementById('name-finder');
        const detailsBox = document.querySelector('.name-details');
        const listContainer = document.querySelector('.name-list-container');
        const detailsContainer = document.querySelector('.name-details-container');

        if (section) {
            window.scrollTo({ top: section.offsetTop - 100, behavior: 'smooth' });
            if (listContainer) listContainer.style.display = 'none';
            if (detailsContainer) detailsContainer.style.display = 'block';
            if (detailsBox) detailsBox.innerHTML = '<div class="spinner">Searching...</div>';

            try {
                const bCandidates = namesFileForGender('Boy');
                const gCandidates = namesFileForGender('Girl');
                const bLoaded = await fetchFirstJson(bCandidates);
                const gLoaded = await fetchFirstJson(gCandidates);

                const bRaw = bLoaded && bLoaded.data ? bLoaded.data : [];
                const gRaw = gLoaded && gLoaded.data ? gLoaded.data : [];

                const boys = (Array.isArray(bRaw) ? bRaw : Object.values(bRaw).find(v => Array.isArray(v)) || []).map(item => ({ ...item, gender: 'Boy' }));
                const girls = (Array.isArray(gRaw) ? gRaw : Object.values(gRaw).find(v => Array.isArray(v)) || []).map(item => ({ ...item, gender: 'Girl' }));

                const all = [].concat(boys, girls);
                const found = all.find(n => (n.name || n.Name).toLowerCase() === term);

                if (found) {
                    const lang = getLanguage();
                    const smartData = await buildNameDetailsData(found, lang);
                    showDetails(detailsBox, smartData);
                } else {
                    const isHindi = getLanguage() === 'hi';
                    const msg = isHindi
                        ? "à¤œà¤²à¥à¤¦à¥€ à¤† à¤°à¤¹à¤¾ à¤¹à¥ˆ, à¤•à¥ƒà¤ªà¤¯à¤¾ à¤ªà¥à¤°à¤¤à¥€à¤•à¥à¤·à¤¾ à¤•à¤°à¥‡à¤‚, à¤¹à¤® à¤†à¤ªà¤•à¥‡ à¤§à¥ˆà¤°à¥à¤¯ à¤•à¥€ à¤¸à¤°à¤¾à¤¹à¤¨à¤¾ à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤"
                        : "Coming soon, please wait, we appreciate your patience.";

                    detailsBox.innerHTML = `
                        <div style="text-align: center; padding: 40px;">
                            <i class="fas fa-hourglass-half" style="font-size: 3rem; color: var(--accent-primary); margin-bottom: 20px;"></i>
                            <h3 style="color: var(--text-dark);">${isHindi ? "à¤ªà¤°à¤¿à¤£à¤¾à¤® à¤¨à¤¹à¥€à¤‚ à¤®à¤¿à¤²à¤¾" : "No Result Found"}</h3>
                            <p style="font-size: 1.2rem; color: var(--text-medium); margin-top: 10px;">${msg}</p>
                        </div>
                    `;
                }

            } catch (e) {
                console.error(e);
                detailsBox.innerHTML = "<p>Search error. Please try again.</p>";
            }
        }
    }

    const sBtn = document.getElementById('hero-search-btn');
    const sInp = document.getElementById('hero-search-input');
    if (sBtn) sBtn.onclick = handleHeroSearch;
    if (sInp) sInp.onkeypress = (e) => { if (e.key === "Enter") handleHeroSearch(); };

    // === A-Z LIST LOGIC (UPDATED WITH HEARTS) ===
        const nameFinderSection = document.getElementById('name-finder');
        if (nameFinderSection) {
            const alphabetContainer = document.querySelector('.alphabet-selector');
            const nameListContainer = document.querySelector('.name-list');
        const nameDetailsBox = document.querySelector('.name-details');
        const nameDetailsContainer = document.querySelector('.name-details-container');
        const genderBtns = document.querySelectorAll('.gender-btn');
        const backBtn = document.querySelector('.back-btn');
        const aiPromptInput = document.getElementById('ai-name-prompt');
        const aiCountSelect = document.getElementById('ai-name-count');
        const aiGenerateBtn = document.getElementById('ai-generate-btn');
        const aiStatus = document.getElementById('ai-generate-status');

            let currentGender = "Boy";
            let currentLetter = "A";

            if (alphabetContainer) {
                alphabetContainer.classList.add('notranslate');
                alphabetContainer.setAttribute('translate', 'no');
                alphabetContainer.setAttribute('lang', 'en');
            }
            if (nameListContainer) {
                nameListContainer.classList.add('notranslate');
                nameListContainer.setAttribute('translate', 'no');
            }

        function setAiStatus(message, type = 'info') {
            if (!aiStatus) return;
            aiStatus.textContent = decodeHindiMojibake(message || '');
            aiStatus.className = 'ai-generate-status';
            if (type === 'success') aiStatus.classList.add('success');
            if (type === 'error') aiStatus.classList.add('error');
        }

        function setActiveAlphabet(letter) {
            if (!/^[A-Z]$/.test(letter)) return;
            currentLetter = letter;
            document.querySelectorAll('.alphabet-btn').forEach((b) => {
                b.classList.toggle('active', b.textContent === letter);
            });
        }

        function normalizeAiNames(list, gender) {
            if (!Array.isArray(list)) return [];
            const unique = new Set();
            return list
                .map((entry) => {
                    if (typeof entry === 'string') return { name: entry };
                    return entry;
                })
                .filter((entry) => entry && typeof entry === 'object')
                .map((entry) => {
                    const name = String(entry.name || '').trim();
                    if (!name || name.length < 2 || name.length > 40) return null;
                    const key = name.toLowerCase();
                    if (unique.has(key)) return null;
                    unique.add(key);
                    return {
                        name: name,
                        meaning: String(entry.meaning || '').trim() || (getLanguage() === 'hi' ? decodeHindiMojibake('AI à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤¸à¥à¤à¤¾à¤¯à¤¾ à¤—à¤¯à¤¾ à¤¨à¤¾à¤®') : 'AI suggested name'),
                        gender: gender,
                        origin: 'AI Generated'
                    };
                })
                .filter(Boolean);
        }

        function nameApiCandidates() {
            const candidates = ['/api/name-generator'];
            try {
                const host = window.location.hostname || '';
                const isLocalhost = host === 'localhost' || host === '127.0.0.1';
                if (!isLocalhost) {
                    candidates.push('http://127.0.0.1:3000/api/name-generator');
                    candidates.push('http://localhost:3000/api/name-generator');
                }
            } catch (_err) {
                // fallback to default candidate
            }
            return candidates;
        }

        async function requestGeneratedNames(requestBody) {
            const urls = nameApiCandidates();
            let lastError = null;
            for (const url of urls) {
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestBody)
                    });
                    const payload = await response.json().catch(() => ({}));
                    if (response.ok) return payload;
                    lastError = new Error(payload?.error || `HTTP ${response.status}`);
                    if (![404, 405, 501].includes(response.status)) break;
                } catch (err) {
                    lastError = err;
                }
            }
            throw lastError || new Error('API request failed');
        }

        async function handleAiNameGenerate() {
            const isHindi = getLanguage() === 'hi';
            if (!aiPromptInput) return;
            const theme = aiPromptInput.value.trim();
            const count = Math.min(Math.max(parseInt(aiCountSelect?.value || '8', 10) || 8, 3), 20);

            if (!theme) {
                setAiStatus(isHindi ? 'à¤•à¥ƒà¤ªà¤¯à¤¾ theme à¤¯à¤¾ style à¤²à¤¿à¤–à¥‡à¤‚à¥¤' : 'Please enter a theme or style.', 'error');
                aiPromptInput.focus();
                return;
            }

            const originalBtnText = aiGenerateBtn ? aiGenerateBtn.textContent : '';
            if (aiGenerateBtn) {
                aiGenerateBtn.disabled = true;
                aiGenerateBtn.textContent = isHindi ? 'Generating...' : 'Generating...';
            }
            setAiStatus(isHindi ? 'AI names generate ho rahe hain...' : 'Generating names with AI...');

            try {
                const payload = await requestGeneratedNames({
                    gender: currentGender,
                    theme: theme,
                    count: count,
                    language: isHindi ? 'hi' : 'en'
                });

                const generated = normalizeAiNames(payload?.names || [], currentGender);
                if (!generated.length) {
                    throw new Error(isHindi ? 'AI response me valid names nahi mile.' : 'No valid names were returned by AI.');
                }

                const existing = new Set((namesData || []).map((item) => String(item?.name || item?.Name || '').toLowerCase()));
                const fresh = generated.filter((item) => !existing.has(item.name.toLowerCase()));
                if (!fresh.length) {
                    setAiStatus(isHindi ? 'Generated names already list me à¤®à¥Œà¤œà¥‚à¤¦ à¤¹à¥ˆà¤‚à¥¤' : 'Generated names are already present in the list.', 'success');
                    return;
                }

                namesData = [...fresh, ...namesData];
                const firstLetter = String(fresh[0].name || 'A').charAt(0).toUpperCase();
                if (/^[A-Z]$/.test(firstLetter)) {
                    setActiveAlphabet(firstLetter);
                }
                renderNames();

                setAiStatus(
                    isHindi
                        ? `${fresh.length} à¤¨à¤ names add à¤¹à¥‹ à¤—à¤ (${currentGender}).`
                        : `${fresh.length} new names added for ${currentGender}.`,
                    'success'
                );
            } catch (error) {
                console.error('AI name generation failed:', error);
                const lowerErr = String(error?.message || '').toLowerCase();
                const message = (lowerErr.includes('failed to fetch') || lowerErr.includes('networkerror'))
                    ? (isHindi
                        ? 'API server connect nahi ho pa raha. `npm start` run karke page refresh karein.'
                        : 'API server is unreachable. Run `npm start` and refresh the page.')
                    : (error?.message || (isHindi ? 'Name generation failed.' : 'Name generation failed.'));
                setAiStatus(message, 'error');
            } finally {
                if (aiGenerateBtn) {
                    aiGenerateBtn.disabled = false;
                    aiGenerateBtn.textContent = originalBtnText || 'Generate Names';
                }
            }
        }

        async function loadNames(gender) {
            const candidates = namesFileForGender(gender);
            try {
                if (nameListContainer) nameListContainer.innerHTML = '<div class="spinner">Loading...</div>';
                let loaded = await fetchFirstJson(candidates);

                // FALLBACK IF FETCH FAILS
                if (!loaded || !loaded.data) {
                    console.warn('loadNames: fetch failed, using fallback data');
                    const fallbackKey = gender === 'Boy' ? 'Boy' : 'Girl';
                    loaded = { data: FALLBACK_DATA[fallbackKey], file: 'fallback_builtin' };

                    // Show user notification about offline mode
                    if (!document.getElementById('offline-toast')) {
                        const toast = document.createElement('div');
                        toast.id = 'offline-toast';
                        toast.style.cssText = "position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:rgba(50,50,50,0.9); color:white; padding:10px 20px; border-radius:30px; z-index:9999; font-size:12px; pointer-events:none; opacity:0; transition:opacity 0.5s;";
                        toast.textContent = "Offline Mode: Using sample names. Run local server for full list.";
                        document.body.appendChild(toast);
                        setTimeout(() => toast.style.opacity = '1', 100);
                        setTimeout(() => toast.style.opacity = '0', 5000);
                    }
                }

                if (!loaded || !loaded.data) {
                    // This should not happen with fallback
                    if (nameListContainer) nameListContainer.innerHTML = `<p>Error loading names.</p>`;
                    namesData = [];
                    renderNames();
                    return;
                }

                let rawData = loaded.data;
                let rawArray = [];
                if (Array.isArray(rawData)) rawArray = rawData;
                else rawArray = Object.values(rawData).find(v => Array.isArray(v)) || [];

                namesData = normalizeLoadedNames(rawArray, gender);
                console.debug('loadNames: using file', loaded.file, 'items', namesData.length);
                renderNames();
            } catch (error) {
                console.error('loadNames error', error);
                if (nameListContainer) nameListContainer.innerHTML = `<p>Error loading names. See console.</p>`;
            }
        }

        function generateAlphabet() {
            if (!alphabetContainer) return;
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
            alphabetContainer.innerHTML = "";
            chars.forEach(char => {
                const btn = document.createElement("button");
                btn.className = `alphabet-btn ${char === currentLetter ? 'active' : ''}`;
                btn.textContent = char;
                btn.classList.add("notranslate");
                btn.setAttribute("translate", "no");
                btn.setAttribute("lang", "en");
                btn.onclick = () => {
                    setActiveAlphabet(char);
                    renderNames();
                };
                alphabetContainer.appendChild(btn);
            });
        }

        // Updated Render Names to include Heart Icon
            function renderNames() {
                if (!nameListContainer) return;
                nameListContainer.innerHTML = "";
                // Keep visible name labels in English across UI languages.
                nameListContainer.setAttribute('lang', 'en');
                const listSection = document.querySelector('.name-list-container');
                if (listSection) listSection.style.display = 'block';
                if (nameDetailsContainer) nameDetailsContainer.style.display = 'none';

            if (!Array.isArray(namesData)) return;
            console.debug('renderNames: namesData length', namesData.length, 'currentLetter', currentLetter);
            const filtered = namesData.filter(n => {
                let nName = n.name || n.Name;
                if (!nName) return false;
                try { return nName.toUpperCase().startsWith(currentLetter); } catch (e) { return false; }
            });
            console.debug('renderNames: filtered length', filtered.length);

            if (filtered.length === 0) {
                nameListContainer.innerHTML = `<p style="width:100%; text-align:center;">No names found.</p>`;
                return;
            }

            filtered.forEach(person => {
                const pName = person.name || person.Name;
                const isFav = favManager.isFavorite(pName);
                const gender = person.gender || 'Boy';
                const genderClass = gender === 'Girl' ? 'girl-name' : 'boy-name';
                const hName = resolveHindiName(
                    person.hName ||
                    person.hindiName ||
                    person.hindi_name ||
                    person.name_hindi ||
                    "",
                    pName
                );
                const nameLabel = pName;
                const nameLabelLang = 'en';

                const div = document.createElement("div");
                div.className = `name-item ${genderClass}`;
                // Structure: Name label + mic action; heart is pinned in top corner.
                div.innerHTML = `
                    <span class="name-item-label ${genderClass} notranslate" translate="no" lang="${nameLabelLang}" data-en="${pName}" data-hi="${hName || pName}">${nameLabel}</span>
                    <div class="name-item-actions">
                        <button class="pronounce-name-btn" title="Play name pronunciation" aria-label="Play name pronunciation" data-name="${pName}">
                            <i class="fas fa-volume-up"></i>
                        </button>
                    </div>
                    <button class="card-heart-btn ${isFav ? 'active' : ''}" title="Add to favorites">
                        <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                `;

                // Card Click -> Open Details (but not if clicking buttons)
                div.onclick = async (e) => {
                    if (e.target.closest('button')) return;

                    if (listSection) listSection.style.display = 'none';
                    if (nameDetailsContainer) nameDetailsContainer.style.display = 'block';

                    const lang = getLanguage();
                    const smartData = await buildNameDetailsData(person, lang);
                    showDetails(nameDetailsBox, smartData);
                };

                // Speaker Button Click -> Pronounce Name
                const speakerBtn = div.querySelector('.pronounce-name-btn');
                if (speakerBtn) {
                    speakerBtn.onclick = (e) => {
                        e.stopPropagation();

                        if (!('speechSynthesis' in window)) {
                            alert('Speech synthesis not supported on this browser');
                            return;
                        }

                        // Cancel any ongoing speech
                        speechSynthesis.cancel();

                        // Create utterance
                        const utterance = new SpeechSynthesisUtterance(pName);

                        // Get and set best voice
                        const voices = speechSynthesis.getVoices();
                        const priorities = [
                            (v) => v.lang.includes('en-IN'),
                            (v) => v.lang.includes('en-GB'),
                            (v) => v.lang.startsWith('en'),
                            (v) => v.name.toLowerCase().includes('female'),
                            (v) => true
                        ];

                        for (const priorityFn of priorities) {
                            const voice = voices.find(priorityFn);
                            if (voice) {
                                utterance.voice = voice;
                                break;
                            }
                        }

                        // Configure speech
                        utterance.rate = 0.85;
                        utterance.pitch = 1.0;
                        utterance.volume = 1.0;

                        // Visual feedback
                        utterance.onstart = () => speakerBtn.classList.add('playing');
                        utterance.onend = () => speakerBtn.classList.remove('playing');
                        utterance.onerror = (event) => {
                            console.error('Speech error:', event);
                            speakerBtn.classList.remove('playing');
                        };

                        // Speak!
                        speechSynthesis.speak(utterance);
                    };
                }

                // Heart Click -> Toggle Save
                const heartBtn = div.querySelector('.card-heart-btn');
                heartBtn.onclick = (e) => {
                    e.stopPropagation();
                    const added = favManager.toggle(person);
                    favManager.save();
                    heartBtn.classList.toggle('active', added);
                    heartBtn.querySelector('i').className = added ? 'fas fa-heart' : 'far fa-heart';
                };

                nameListContainer.appendChild(div);
            });
        }

        genderBtns.forEach(btn => {
            btn.onclick = () => {
                // Remove both active classes from all buttons
                genderBtns.forEach(b => {
                    b.classList.remove('active-boy');
                    b.classList.remove('active-girl');
                });

                // Add the appropriate active class based on gender
                currentGender = btn.dataset.gender;
                if (currentGender === 'Girl') {
                    btn.classList.add('active-girl');
                } else {
                    btn.classList.add('active-boy');
                }

                // Save gender selection and apply theme
                GenderTheme.save(currentGender);
                GenderTheme.apply(currentGender);
                setAiStatus('');

                loadNames(currentGender);
            };
        });

        if (backBtn) backBtn.onclick = () => {
            if (nameDetailsContainer) nameDetailsContainer.style.display = 'none';
            const listSection = document.querySelector('.name-list-container');
            if (listSection) listSection.style.display = 'block';
            renderNames(); // Re-render to update hearts if changed inside details
        };

        if (aiGenerateBtn) aiGenerateBtn.onclick = handleAiNameGenerate;
        if (aiPromptInput) {
            aiPromptInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAiNameGenerate();
                }
            });
        }

        generateAlphabet();
        loadNames("Boy");
    }

    // --- FAVORITES MODAL LOGIC ---
    const favBtn = document.getElementById('fav-view-btn');
    const favOverlay = document.getElementById('fav-overlay');
    const closeFavBtn = document.getElementById('close-fav-btn');
    const clearFavBtn = document.getElementById('clear-fav-btn');
    const favListContainer = document.getElementById('fav-list-container');

    const shortlistHub = document.getElementById('shortlist-hub');
    const hubShortlist = document.getElementById('hub-shortlist');
    const hubEmpty = document.getElementById('hub-empty');
    const hubCopyBtn = document.getElementById('hub-copy-btn');
    const hubShareBtn = document.getElementById('hub-share-btn');
    const hubClearBtn = document.getElementById('hub-clear-btn');
    const hubTopPicksBtn = document.getElementById('hub-top-picks-btn');
    const hubCompareBtn = document.getElementById('hub-compare-btn');

    function isHubVisible() {
        if (!shortlistHub) return false;
        try {
            return window.getComputedStyle(shortlistHub).display !== 'none';
        } catch (e) {
            return true;
        }
    }

    async function openFavoriteDetails(item) {
        if (favOverlay) favOverlay.style.display = 'none';

        const section = document.getElementById('name-finder');
        const listSection = document.querySelector('.name-list-container');
        const nameDetailsBox = document.querySelector('.name-details');
        const nameDetailsContainer = document.querySelector('.name-details-container');

        if (section) {
            window.scrollTo({ top: section.offsetTop - 100, behavior: 'smooth' });
            if (listSection) listSection.style.display = 'none';
            if (nameDetailsContainer) nameDetailsContainer.style.display = 'block';
            try {
                const lang = getLanguage();
                const smartData = await buildNameDetailsData(item, lang);
                showDetails(nameDetailsBox, smartData);
            } catch (e) { }
        }
    }

    if (favBtn && favBtn.dataset.bound !== 'true') {
        // Fallback for pages that don't run the header wiring (kept for safety).
        favBtn.dataset.bound = 'true';
        favBtn.addEventListener('click', (e) => {
            e.preventDefault();
            try { openFavoritesUi(); } catch (_e) { window.location.href = 'wishlist.html'; }
        });
    }

    // If the in-page overlay exists we keep its handlers for backward compatibility
    if (favOverlay) {
        if (closeFavBtn) closeFavBtn.onclick = () => { favOverlay.style.display = 'none'; };
        favOverlay.onclick = (e) => { if (e.target === favOverlay) favOverlay.style.display = 'none'; };
        if (clearFavBtn) clearFavBtn.onclick = () => {
            if (confirm("Are you sure you want to clear all favorites?")) {
                favManager.clear();
                renderFavoritesList();
                renderNames();
            }
        };
    }

    function renderFavoritesList() {
        if (!favListContainer) return;
        favListContainer.innerHTML = "";
        const list = favManager.favorites;
        const favFooter = clearFavBtn ? clearFavBtn.closest('.fav-footer') : null;

        if (list.length === 0) {
            if (clearFavBtn) clearFavBtn.style.display = 'none';
            if (favFooter) favFooter.style.display = 'none';
            favListContainer.innerHTML = '<p style="text-align:center; color:var(--text-medium);">No names saved yet.</p>';
            return;
        }

        if (clearFavBtn) clearFavBtn.style.display = 'inline-flex';
        if (favFooter) favFooter.style.display = 'block';

        list.forEach(item => {
            const name = item.name || item.Name;
            const row = document.createElement('div');
            row.className = 'fav-item-row';
            row.innerHTML = `
                <span>${name}</span>
                <button class="fav-remove-btn"><i class="fas fa-trash"></i></button>
            `;

            // Remove item
            row.querySelector('.fav-remove-btn').onclick = (e) => {
                e.stopPropagation();
                favManager.toggle(item);
                favManager.save();
                renderFavoritesList(); // Re-render this list
                renderNames(); // Update background list
            };

            // Click to view details
            row.onclick = () => {
                openFavoriteDetails(item);
            };

            favListContainer.appendChild(row);
        });
    }

    // Product wishlist panel removed (site-wide heart = saved baby-name shortlist).

    function setBtnFeedback(btn, text, ms = 1100) {
        if (!btn) return;
        const original = btn.textContent;
        btn.textContent = text;
        setTimeout(() => { btn.textContent = original; }, ms);
    }

    async function copyText(text) {
        if (!text) return false;
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
            try {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.setAttribute('readonly', 'true');
                ta.style.position = 'fixed';
                ta.style.top = '-1000px';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                ta.remove();
                return true;
            } catch (err) {
                return false;
            }
        }
    }

    function favoriteNamesText() {
        return (favManager.favorites || [])
            .map(item => (item && typeof item === 'object') ? (item.name || item.Name) : String(item))
            .filter(Boolean)
            .join('\n');
    }

    function renderShortlistHub() {
        if (!hubShortlist || !hubEmpty) return;
        hubShortlist.innerHTML = '';

        const list = favManager.favorites || [];
        hubEmpty.style.display = list.length ? 'none' : 'block';

        list.slice().reverse().forEach(item => {
            const name = (item && typeof item === 'object') ? (item.name || item.Name) : String(item);
            const row = document.createElement('div');
            row.className = 'hub-item';

            const label = document.createElement('div');
            label.className = 'hub-item-name';
            label.textContent = name;

            const actions = document.createElement('div');
            actions.className = 'hub-item-actions';

            const removeBtn = document.createElement('button');
            removeBtn.className = 'hub-item-btn';
            removeBtn.textContent = 'Remove';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                favManager.toggle(item);
                favManager.save();
                renderNames();
            };

            const openBtn = document.createElement('button');
            openBtn.className = 'hub-item-btn';
            openBtn.textContent = 'Open';
            openBtn.onclick = (e) => {
                e.stopPropagation();
                openFavoriteDetails(item);
            };

            actions.appendChild(removeBtn);
            actions.appendChild(openBtn);

            row.appendChild(label);
            row.appendChild(actions);
            row.onclick = () => openFavoriteDetails(item);

            hubShortlist.appendChild(row);
        });
    }

    if (hubCopyBtn) {
        hubCopyBtn.addEventListener('click', async () => {
            setBtnFeedback(hubCopyBtn, 'Copying...', 1200);
            const ok = await copyText(favoriteNamesText());
            setBtnFeedback(hubCopyBtn, ok ? 'Copied' : 'Failed', 1100);
        });
    }

    if (hubShareBtn) {
        hubShareBtn.addEventListener('click', async () => {
            const text = favoriteNamesText().replace(/\n/g, ', ');
            if (!text) {
                setBtnFeedback(hubShareBtn, 'Empty', 900);
                return;
            }
            if (navigator.share) {
                try {
                    await navigator.share({ title: 'Naamin Shortlist', text });
                    setBtnFeedback(hubShareBtn, 'Shared', 1100);
                    return;
                } catch (e) { }
            }
            const ok = await copyText(text);
            setBtnFeedback(hubShareBtn, ok ? 'Copied' : 'Failed', 1100);
        });
    }

    if (hubClearBtn) {
        hubClearBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to clear all favorites?")) {
                favManager.clear();
                renderNames();
            }
        });
    }

    if (hubTopPicksBtn) {
        hubTopPicksBtn.addEventListener('click', () => {
            const section = document.getElementById('name-finder');
            if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    if (hubCompareBtn) {
        hubCompareBtn.addEventListener('click', () => {
            window.location.href = 'wishlist.html';
        });
    }

    document.addEventListener('favoritesUpdated', () => {
        renderShortlistHub();
        if (favOverlay && favOverlay.style.display !== 'none') {
            renderFavoritesList();
        }
    });

    renderShortlistHub();

    // --- NAAMIN TYPING ANIMATION (GUARANTEED LOOP) ---
    const typeNaam = document.getElementById("type-naam");
    const typeIn = document.getElementById("type-in");

    if (typeNaam && typeIn) {
        const text1 = "Naam";
        const text2 = "in";
        const typeSpeed = 200;
        const delayBeforeRestart = 2000; // 2 seconds wait

        const runAnimation = () => {
            typeNaam.textContent = "";
            typeIn.textContent = "";

            let i = 0;
            let j = 0;

            const step = () => {
                if (i < text1.length) {
                    typeNaam.textContent += text1.charAt(i);
                    i++;
                    setTimeout(step, typeSpeed);
                }
                else if (j < text2.length) {
                    typeIn.textContent += text2.charAt(j);
                    j++;
                    setTimeout(step, typeSpeed);
                }
                else {
                    setTimeout(runAnimation, delayBeforeRestart);
                }
            };
            step();
        };
        runAnimation();
    }
});
/* ======================================================
   SLIDESHOW FUNCTIONALITY
   ====================================================== */
document.addEventListener('DOMContentLoaded', function () {
    const slideshowContainer = document.querySelector('.slideshow-container');
    if (!slideshowContainer) return;

    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slide-dots .dot');
    const prevBtn = document.querySelector('.slide-prev');
    const nextBtn = document.querySelector('.slide-next');
    if (!slides.length || !dots.length) return;

    let currentSlide = 0;
    let autoplayInterval;
    const autoplayDelay = 2000; // 2 seconds

    function showSlide(n) {
        if (n >= slides.length) currentSlide = 0;
        if (n < 0) currentSlide = slides.length - 1;

        // Remove active class from all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        // Add active class to current slide and dot
        if (slides[currentSlide]) slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
        currentSlide++;
        showSlide(currentSlide);
        resetAutoplay();
    }

    function prevSlide() {
        currentSlide--;
        showSlide(currentSlide);
        resetAutoplay();
    }

    function goToSlide(n) {
        currentSlide = n;
        showSlide(currentSlide);
        resetAutoplay();
    }

    function autoplay() {
        nextSlide();
    }

    function startAutoplay() {
        autoplayInterval = setInterval(autoplay, autoplayDelay);
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    // Event listeners for navigation buttons
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    // Event listeners for dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });

    // Pause autoplay on hover
    slideshowContainer.addEventListener('mouseenter', stopAutoplay);
    slideshowContainer.addEventListener('mouseleave', startAutoplay);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });
    // Start autoplay on page load
    startAutoplay();
    showSlide(currentSlide);
});

/* ======================================================
   BABY SHOWCASE CAROUSEL FUNCTIONALITY
   ====================================================== */
document.addEventListener('DOMContentLoaded', function () {
    const babyCarousel = document.querySelector('.baby-carousel');
    if (!babyCarousel) return;

    const allBabyCards = Array.from(document.querySelectorAll('.baby-card'));
    const babyCards = allBabyCards.filter((card) => {
        const imageEl = card.querySelector('.baby-image');
        const imageSrc = (imageEl && imageEl.getAttribute('src') ? imageEl.getAttribute('src') : '').trim();
        return Boolean(imageSrc);
    });
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const dotsContainer = document.querySelector('.carousel-dots');
    if (!babyCards.length || !dotsContainer) return;

    if (babyCards.length !== allBabyCards.length) {
        allBabyCards.forEach((card) => {
            if (!babyCards.includes(card)) {
                card.remove();
            }
        });
    }

    let currentIndex = 0;
    let maxIndex = 0;
    let dots = [];
    let autoplayInterval;
    const autoplayDelay = 4000; // 4 seconds
    let touchStartX = 0;
    let touchEndX = 0;

    function getCardsPerView() {
        if (!babyCards[0]) return 1;
        const computed = window.getComputedStyle(babyCarousel);
        const gap = parseFloat(computed.columnGap || computed.gap || '0') || 0;
        const unitWidth = babyCards[0].getBoundingClientRect().width + gap;
        if (!unitWidth) return 1;
        return Math.max(1, Math.floor((babyCarousel.clientWidth + gap) / unitWidth));
    }

    function clampIndex(index) {
        return Math.max(0, Math.min(index, maxIndex));
    }

    function renderDots() {
        dotsContainer.innerHTML = '';
        for (let index = 0; index <= maxIndex; index += 1) {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (index === currentIndex) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        }
        dots = Array.from(dotsContainer.querySelectorAll('.carousel-dot'));
    }

    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function scrollToCard(index, behavior = 'smooth') {
        if (!babyCards.length) return;
        currentIndex = clampIndex(index);
        const targetCard = babyCards[currentIndex];
        if (!targetCard) return;
        const maxScrollLeft = Math.max(0, babyCarousel.scrollWidth - babyCarousel.clientWidth);
        const edgeInset = window.innerWidth <= 768 ? 4 : 2;
        const rawPosition = Math.max(0, targetCard.offsetLeft - edgeInset);
        const scrollPosition = Math.min(rawPosition, maxScrollLeft);
        babyCarousel.scrollTo({
            left: scrollPosition,
            behavior: behavior
        });
        updateDots();
    }

    function recalculateSlides(keepCurrent = true) {
        const cardsPerView = getCardsPerView();
        maxIndex = Math.max(0, babyCards.length - cardsPerView);
        if (!keepCurrent) {
            currentIndex = 0;
        } else {
            currentIndex = clampIndex(currentIndex);
        }
        renderDots();
        scrollToCard(currentIndex, 'auto');

        const disableNav = maxIndex === 0;
        if (prevBtn) prevBtn.disabled = disableNav;
        if (nextBtn) nextBtn.disabled = disableNav;
        dotsContainer.style.display = disableNav ? 'none' : '';
    }

    function nextSlide() {
        if (maxIndex === 0) return;
        currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
        scrollToCard(currentIndex);
    }

    function prevSlide() {
        if (maxIndex === 0) return;
        currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
        scrollToCard(currentIndex);
    }

    function goToSlide(index) {
        scrollToCard(index);
        resetAutoplay();
    }

    function startAutoplay() {
        stopAutoplay();
        if (maxIndex === 0) return;
        autoplayInterval = setInterval(nextSlide, autoplayDelay);
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    // Navigation buttons
    if (prevBtn) prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoplay();
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoplay();
    });

    // Touch swipe support
    babyCarousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    babyCarousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next
                nextSlide();
            } else {
                // Swipe right - prev
                prevSlide();
            }
            resetAutoplay();
        }
    }

    // Pause on hover (desktop)
    babyCarousel.addEventListener('mouseenter', stopAutoplay);
    babyCarousel.addEventListener('mouseleave', startAutoplay);

    window.addEventListener('resize', () => {
        recalculateSlides(true);
        resetAutoplay();
    });

    recalculateSlides(false);

    // Start autoplay
    startAutoplay();

    // Update language content
    const updateBabyCarouselLanguage = () => {
        const lang = getLanguage();
        const sectionTitle = document.querySelector('#baby-showcase h2');
        const sectionSubtitle = document.querySelector('#baby-showcase .section-subtitle');
        const pickText = (element) => {
            if (!element) return '';
            const preferred = element.getAttribute(lang === 'hi' ? 'data-hi' : 'data-en') || '';
            const fallback = element.getAttribute('data-en') || '';
            const normalizedPreferred = String(preferred).replace(/\uFFFD+/g, ' - ').replace(/\s{2,}/g, ' ').trim();
            const normalizedFallback = String(fallback).replace(/\uFFFD+/g, ' - ').replace(/\s{2,}/g, ' ').trim();
            const looksBroken = !normalizedPreferred || /^\?+$/.test(normalizedPreferred) || /[\?]{2,}/.test(normalizedPreferred) || normalizedPreferred.includes('ï¿½') || /(?:Ãƒâ€š|ÃƒÆ’|ÃƒÂ¢|Ãƒ|Ã‚|Ã¢|Ã Â¤|Ã Â¥)/.test(normalizedPreferred);
            if (lang === 'hi' && (looksBroken || normalizedPreferred === normalizedFallback)) {
                return fallbackHindiCopy(normalizedFallback);
            }
            return looksBroken ? normalizedFallback : normalizedPreferred;
        };

        if (sectionTitle) {
            sectionTitle.textContent = pickText(sectionTitle);
        }

        if (sectionSubtitle) {
            sectionSubtitle.textContent = pickText(sectionSubtitle);
        }
    };

    // Initial language update
updateBabyCarouselLanguage();
});

// === TESTIMONIAL ROTATION (HOMEPAGE) ===
(function () {
    const grid = document.querySelector('.testimonial-grid[data-rotate]');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.testimonial-card'));
    if (cards.length < 2) return;

    let current = 0;
    const rotate = () => {
        cards[current].classList.remove('active');
        current = (current + 1) % cards.length;
        cards[current].classList.add('active');
    };

    setInterval(rotate, 5000);
})();

// Protect brand token "Naamin" from Google Translate everywhere.
(() => {
    const BRAND_TOKEN = 'naamin';

    function shouldSkipTextNode(node) {
        if (!node || node.nodeType !== 3) return true;
        const text = String(node.nodeValue || '');
        if (!text || text.toLowerCase().indexOf(BRAND_TOKEN) === -1) return true;

        const parent = node.parentElement;
        if (!parent) return true;
        const tag = (parent.tagName || '').toLowerCase();
        if (tag === 'script' || tag === 'style' || tag === 'noscript' || tag === 'textarea' || tag === 'input') return true;
        if (parent.isContentEditable) return true;
        if (parent.closest('[translate="no"], .notranslate')) return true;
        return false;
    }

    function wrapBrandInTextNode(textNode) {
        const raw = String(textNode.nodeValue || '');
        const lower = raw.toLowerCase();
        if (lower.indexOf(BRAND_TOKEN) === -1) return;

        const parts = [];
        let i = 0;
        while (i < raw.length) {
            const idx = lower.indexOf(BRAND_TOKEN, i);
            if (idx === -1) {
                parts.push({ type: 'text', value: raw.slice(i) });
                break;
            }
            if (idx > i) parts.push({ type: 'text', value: raw.slice(i, idx) });
            parts.push({ type: 'brand', value: raw.slice(idx, idx + BRAND_TOKEN.length) });
            i = idx + BRAND_TOKEN.length;
        }

        const parent = textNode.parentNode;
        if (!parent) return;
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
            if (part.type === 'text') {
                if (part.value) frag.appendChild(document.createTextNode(part.value));
                return;
            }
            const span = document.createElement('span');
            span.className = 'notranslate naamin-brand';
            span.setAttribute('translate', 'no');
            span.setAttribute('lang', 'en');
            span.textContent = part.value || 'Naamin';
            frag.appendChild(span);
        });
        parent.replaceChild(frag, textNode);
    }

    function protectBrandName(root) {
        const scope = root && root.nodeType ? root : document.body;
        if (!scope) return;

        // Ensure obvious brand containers are protected.
        scope.querySelectorAll('.logo, .logo-in').forEach((el) => {
            el.classList.add('notranslate', 'naamin-brand');
            el.setAttribute('translate', 'no');
            el.setAttribute('lang', 'en');
        });

        const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => (shouldSkipTextNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
        });

        const nodes = [];
        let node = walker.nextNode();
        while (node) {
            nodes.push(node);
            node = walker.nextNode();
        }
        nodes.forEach(wrapBrandInTextNode);
    }

    const run = () => protectBrandName(document.body);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
        run();
    }
    document.addEventListener('naamin:layout-ready', run);
    document.addEventListener('languageChanged', run);
    document.addEventListener('naamin:google-translate-changed', run);
})();

// Hero Panchang mini-calendar (Home page)
(() => {
    const TITHI_NAMES = {
        en: [
            'Shukla Pratipada',
            'Shukla Dwitiya',
            'Shukla Tritiya',
            'Shukla Chaturthi',
            'Shukla Panchami',
            'Shukla Shashthi',
            'Shukla Saptami',
            'Shukla Ashtami',
            'Shukla Navami',
            'Shukla Dashami',
            'Shukla Ekadashi',
            'Shukla Dwadashi',
            'Shukla Trayodashi',
            'Shukla Chaturdashi',
            'Purnima',
            'Krishna Pratipada',
            'Krishna Dwitiya',
            'Krishna Tritiya',
            'Krishna Chaturthi',
            'Krishna Panchami',
            'Krishna Shashthi',
            'Krishna Saptami',
            'Krishna Ashtami',
            'Krishna Navami',
            'Krishna Dashami',
            'Krishna Ekadashi',
            'Krishna Dwadashi',
            'Krishna Trayodashi',
            'Krishna Chaturdashi',
            'Amavasya'
        ],
        hi: [
            '\u0936\u0941\u0915\u094d\u0932 \u092a\u094d\u0930\u0924\u093f\u092a\u0926\u093e',
            '\u0936\u0941\u0915\u094d\u0932 \u0926\u094d\u0935\u093f\u0924\u0940\u092f\u093e',
            '\u0936\u0941\u0915\u094d\u0932 \u0924\u0943\u0924\u0940\u092f\u093e',
            '\u0936\u0941\u0915\u094d\u0932 \u091a\u0924\u0941\u0930\u094d\u0925\u0940',
            '\u0936\u0941\u0915\u094d\u0932 \u092a\u0902\u091a\u092e\u0940',
            '\u0936\u0941\u0915\u094d\u0932 \u0937\u0937\u094d\u0920\u0940',
            '\u0936\u0941\u0915\u094d\u0932 \u0938\u092a\u094d\u0924\u092e\u0940',
            '\u0936\u0941\u0915\u094d\u0932 \u0905\u0937\u094d\u091f\u092e\u0940',
            '\u0936\u0941\u0915\u094d\u0932 \u0928\u0935\u092e\u0940',
            '\u0936\u0941\u0915\u094d\u0932 \u0926\u0936\u092e\u0940',
            '\u0936\u0941\u0915\u094d\u0932 \u090f\u0915\u093e\u0926\u0936\u0940',
            '\u0936\u0941\u0915\u094d\u0932 \u0926\u094d\u0935\u093e\u0926\u0936\u0940',
            '\u0936\u0941\u0915\u094d\u0932 \u0924\u094d\u0930\u092f\u094b\u0926\u0936\u0940',
            '\u0936\u0941\u0915\u094d\u0932 \u091a\u0924\u0941\u0930\u094d\u0926\u0936\u0940',
            '\u092a\u0942\u0930\u094d\u0923\u093f\u092e\u093e',
            '\u0915\u0943\u0937\u094d\u0923 \u092a\u094d\u0930\u0924\u093f\u092a\u0926\u093e',
            '\u0915\u0943\u0937\u094d\u0923 \u0926\u094d\u0935\u093f\u0924\u0940\u092f\u093e',
            '\u0915\u0943\u0937\u094d\u0923 \u0924\u0943\u0924\u0940\u092f\u093e',
            '\u0915\u0943\u0937\u094d\u0923 \u091a\u0924\u0941\u0930\u094d\u0925\u0940',
            '\u0915\u0943\u0937\u094d\u0923 \u092a\u0902\u091a\u092e\u0940',
            '\u0915\u0943\u0937\u094d\u0923 \u0937\u0937\u094d\u0920\u0940',
            '\u0915\u0943\u0937\u094d\u0923 \u0938\u092a\u094d\u0924\u092e\u0940',
            '\u0915\u0943\u0937\u094d\u0923 \u0905\u0937\u094d\u091f\u092e\u0940',
            '\u0915\u0943\u0937\u094d\u0923 \u0928\u0935\u092e\u0940',
            '\u0915\u0943\u0937\u094d\u0923 \u0926\u0936\u092e\u0940',
            '\u0915\u0943\u0937\u094d\u0923 \u090f\u0915\u093e\u0926\u0936\u0940',
            '\u0915\u0943\u0937\u094d\u0923 \u0926\u094d\u0935\u093e\u0926\u0936\u0940',
            '\u0915\u0943\u0937\u094d\u0923 \u0924\u094d\u0930\u092f\u094b\u0926\u0936\u0940',
            '\u0915\u0943\u0937\u094d\u0923 \u091a\u0924\u0941\u0930\u094d\u0926\u0936\u0940',
            '\u0905\u092e\u093e\u0935\u0938\u094d\u092f\u093e'
        ]
    };

    function normalizeDegrees(value) {
        const reduced = value % 360;
        return reduced < 0 ? reduced + 360 : reduced;
    }

    function toRadians(value) {
        return (value * Math.PI) / 180;
    }

    function julianDay(date) {
        return date.getTime() / 86400000 + 2440587.5;
    }

    // Fast approximation good for UI-level Panchang display.
    function sunLongitude(date) {
        const T = (julianDay(date) - 2451545.0) / 36525;
        const meanLongitude = normalizeDegrees(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
        const meanAnomaly = normalizeDegrees(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
        const equationOfCenter =
            (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(toRadians(meanAnomaly)) +
            (0.019993 - 0.000101 * T) * Math.sin(toRadians(2 * meanAnomaly)) +
            0.000289 * Math.sin(toRadians(3 * meanAnomaly));
        return normalizeDegrees(meanLongitude + equationOfCenter);
    }

    // Fast approximation good for UI-level Panchang display.
    function moonLongitude(date) {
        const T = (julianDay(date) - 2451545.0) / 36525;
        const meanLongitude = normalizeDegrees(
            218.3164477 +
            481267.88123421 * T -
            0.0015786 * T * T +
            (T * T * T) / 538841 -
            (T * T * T * T) / 65194000
        );
        const elongation = normalizeDegrees(
            297.8501921 +
            445267.1114034 * T -
            0.0018819 * T * T +
            (T * T * T) / 545868 -
            (T * T * T * T) / 113065000
        );
        const solarAnomaly = normalizeDegrees(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T);
        const lunarAnomaly = normalizeDegrees(
            134.9633964 +
            477198.8675055 * T +
            0.0087414 * T * T +
            (T * T * T) / 69699 -
            (T * T * T * T) / 14712000
        );
        const argumentLatitude = normalizeDegrees(
            93.2720950 +
            483202.0175233 * T -
            0.0036539 * T * T -
            (T * T * T) / 3526000 +
            (T * T * T * T) / 863310000
        );

        const correction =
            6.289 * Math.sin(toRadians(lunarAnomaly)) +
            1.274 * Math.sin(toRadians(2 * elongation - lunarAnomaly)) +
            0.658 * Math.sin(toRadians(2 * elongation)) +
            0.214 * Math.sin(toRadians(2 * lunarAnomaly)) -
            0.186 * Math.sin(toRadians(solarAnomaly)) -
            0.114 * Math.sin(toRadians(2 * argumentLatitude));

        return normalizeDegrees(meanLongitude + correction);
    }

    function calculateTithiIndex(date) {
        const phase = normalizeDegrees(moonLongitude(date) - sunLongitude(date));
        return Math.floor(phase / 12) + 1;
    }

    function getUiLanguage() {
        try {
            return localStorage.getItem('language') === 'en' ? 'en' : 'hi';
        } catch (_e) {
            return (document.documentElement.lang || 'en') === 'en' ? 'en' : 'hi';
        }
    }

    function getPart(date, locale, options) {
        return new Intl.DateTimeFormat(locale, {
            ...options,
            timeZone: 'Asia/Kolkata'
        }).format(date);
    }

    function getVikramSamvatYear(date) {
        try {
            const parts = new Intl.DateTimeFormat('en-IN-u-ca-indian', {
                year: 'numeric',
                timeZone: 'Asia/Kolkata'
            }).formatToParts(date);
            const yearPart = parts.find((part) => part.type === 'year');
            const sakaYear = yearPart ? parseInt(String(yearPart.value).replace(/[^\d]/g, ''), 10) : NaN;
            if (Number.isFinite(sakaYear)) {
                return sakaYear + 135;
            }
        } catch (_error) {
            // fall back below
        }

        // Fallback approximation around Chaitra transition.
        const month = parseInt(getPart(date, 'en-IN', { month: 'numeric' }), 10);
        const day = parseInt(getPart(date, 'en-IN', { day: 'numeric' }), 10);
        const gregorianYear = parseInt(getPart(date, 'en-IN', { year: 'numeric' }), 10);
        const afterNewYear = month > 3 || (month === 3 && day >= 22);
        return gregorianYear + (afterNewYear ? 57 : 56);
    }

    function updateHeroPanchang() {
        const widget = document.getElementById('hero-panchang-widget');
        if (!widget) return;

        const dateEl = document.getElementById('panchang-date');
        const dayEl = document.getElementById('panchang-day');
        const monthEl = document.getElementById('panchang-month');
        const yearEl = document.getElementById('panchang-year');
        const tithiEl = document.getElementById('panchang-tithi');
        const samvatEl = document.getElementById('panchang-samvat');
        const updatedEl = document.getElementById('panchang-updated');

        if (!dateEl || !dayEl || !monthEl || !yearEl || !tithiEl || !samvatEl || !updatedEl) return;

        const now = new Date();
        const lang = getUiLanguage();
        const locale = lang === 'hi' ? 'hi-IN' : 'en-IN';
        const tithiIndex = calculateTithiIndex(now);
        const tithiNames = lang === 'hi' ? TITHI_NAMES.hi : TITHI_NAMES.en;
        const safeTithiIndex = Math.min(30, Math.max(1, tithiIndex));
        const samvatYear = getVikramSamvatYear(now);

        dateEl.textContent = getPart(now, locale, { day: '2-digit' });
        dayEl.textContent = getPart(now, locale, { weekday: 'long' });
        monthEl.textContent = getPart(now, locale, { month: 'long' });
        yearEl.textContent = getPart(now, locale, { year: 'numeric' });
        tithiEl.textContent = tithiNames[safeTithiIndex - 1] || '--';
        samvatEl.textContent = lang === 'hi'
            ? `\u0935\u093f\u0915\u094d\u0930\u092e \u0938\u0902\u0935\u0924 ${new Intl.NumberFormat('hi-IN').format(samvatYear)}`
            : `Vikram Samvat ${samvatYear}`;
        updatedEl.textContent = lang === 'hi'
            ? `\u0905\u092a\u0921\u0947\u091f: ${getPart(now, locale, { hour: '2-digit', minute: '2-digit', hour12: true })} IST`
            : `Updated: ${getPart(now, locale, { hour: '2-digit', minute: '2-digit', hour12: true })} IST`;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const widget = document.getElementById('hero-panchang-widget');
        if (!widget) return;

        const fab = document.getElementById('hero-panchang-fab');
        const overlay = document.getElementById('hero-panchang-overlay');
        const mobileQuery = window.matchMedia('(max-width: 768px)');

        const syncFabA11yLabel = () => {
            if (!fab) return;
            const lang = getUiLanguage();
            const openText = lang === 'hi' ? '\u0915\u0948\u0932\u0947\u0902\u0921\u0930 \u0916\u094b\u0932\u0947\u0902' : 'Open calendar';
            const closeText = lang === 'hi' ? '\u0915\u0948\u0932\u0947\u0902\u0921\u0930 \u092c\u0902\u0926 \u0915\u0930\u0947\u0902' : 'Close calendar';
            fab.setAttribute('aria-label', widget.classList.contains('is-open') ? closeText : openText);
        };

        const setWidgetOpen = (open) => {
            if (!overlay || !fab) return;
            const shouldOpen = Boolean(open) && mobileQuery.matches;
            widget.classList.toggle('is-open', shouldOpen);
            overlay.classList.toggle('is-open', shouldOpen);
            fab.setAttribute('aria-expanded', String(shouldOpen));
            syncFabA11yLabel();
        };

        const openFromNavbar = (event) => {
            if (event) event.preventDefault();
            try {
                widget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } catch (_e) {
                widget.scrollIntoView();
            }
            if (mobileQuery.matches) {
                setWidgetOpen(true);
            }
        };

        const navCalendar = document.getElementById('calendar-toggle');
        const navCalendarMobile = document.getElementById('calendar-toggle-mobile');
        if (navCalendar) navCalendar.addEventListener('click', openFromNavbar);
        if (navCalendarMobile) navCalendarMobile.addEventListener('click', openFromNavbar);

        if (fab && overlay) {
            fab.addEventListener('click', () => {
                setWidgetOpen(!widget.classList.contains('is-open'));
            });

            overlay.addEventListener('click', () => {
                setWidgetOpen(false);
            });

            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') setWidgetOpen(false);
            });

            const handleViewportChange = () => {
                if (!mobileQuery.matches) setWidgetOpen(false);
            };

            if (typeof mobileQuery.addEventListener === 'function') {
                mobileQuery.addEventListener('change', handleViewportChange);
            } else if (typeof mobileQuery.addListener === 'function') {
                mobileQuery.addListener(handleViewportChange);
            }

            document.addEventListener('languageChanged', syncFabA11yLabel);
            syncFabA11yLabel();
        }

        if (String(window.location.hash || '').toLowerCase() === '#calendar') {
            openFromNavbar();
        }

        updateHeroPanchang();
        const timer = window.setInterval(updateHeroPanchang, 60000);
        document.addEventListener('languageChanged', updateHeroPanchang);
        window.addEventListener('beforeunload', () => window.clearInterval(timer), { once: true });
    });
})();

// Home Greeting Card Studio
(() => {
    const section = document.getElementById('greeting-studio');
    if (!section) return;

    const typeInput = document.getElementById('greeting-card-type');
    const designInput = document.getElementById('greeting-card-design');
    const recipientInput = document.getElementById('greeting-recipient-name');
    const babyNameInput = document.getElementById('greeting-baby-name');
    const dobInput = document.getElementById('greeting-baby-dob');
    const siblingInput = document.getElementById('greeting-sibling-name');
    const parentOneInput = document.getElementById('greeting-parent-one');
    const parentTwoInput = document.getElementById('greeting-parent-two');
    const familyInput = document.getElementById('greeting-family-name');
    const messageInput = document.getElementById('greeting-message');

    const previewCard = document.getElementById('greeting-preview-card');
    const previewBadge = document.getElementById('greeting-preview-badge');
    const previewTitle = document.getElementById('greeting-preview-title');
    const previewSubline = document.getElementById('greeting-preview-subline');
    const previewMessage = document.getElementById('greeting-preview-message');
    const previewQuote = document.getElementById('greeting-preview-quote');
    const previewFrom = document.getElementById('greeting-preview-from');
    const previewDate = document.getElementById('greeting-preview-date');

    const generateBtn = document.getElementById('greeting-generate-btn');
    const copyBtn = document.getElementById('greeting-copy-btn');
    const shareBtn = document.getElementById('greeting-share-btn');

    if (!typeInput || !designInput || !recipientInput || !babyNameInput || !dobInput || !siblingInput || !parentOneInput || !parentTwoInput || !familyInput || !messageInput || !previewCard || !previewBadge || !previewTitle || !previewSubline || !previewMessage || !previewQuote || !previewFrom || !previewDate) {
        return;
    }

    const typeMeta = {
        birthday: {
            badge: 'Birthday Wishes',
            title: 'Happy Birthday',
            subline: 'A day to celebrate smiles, growth, and endless blessings.',
            quote: '"Every birthday is a new chapter of joy."'
        },
        acrd: {
            badge: 'Announcement Card',
            title: 'With Love & Gratitude',
            subline: 'A simple note to share our happiness and ask for your kind blessings.',
            quote: '"Love makes a home, a name, and a lifetime of memories."'
        },
        arrival: {
            badge: 'Baby Arrival',
            title: 'Our Little One Is Here',
            subline: 'Our home is brighter, softer, and full of new dreams today.',
            quote: '"Tiny feet, giant love, forever gratitude."'
        },
        introduction: {
            badge: 'Baby Introduction',
            title: 'Meet Our Precious Baby',
            subline: 'Introducing the newest heartbeat of our family.',
            quote: '"Love found a new name in our home."'
        },
        blessings: {
            badge: 'Blessings Request',
            title: 'With Love & Gratitude',
            subline: 'Your blessings make this journey even more meaningful.',
            quote: '"A blessed beginning creates a beautiful life."'
        }
    };
    const designClasses = ['design-1', 'design-2', 'design-3', 'design-4', 'design-5', 'design-6', 'design-7', 'design-8', 'design-9', 'design-10', 'design-11'];

    const pad = (n) => String(n).padStart(2, '0');

    const ordinal = (n) => {
        const k = n % 100;
        if (k >= 11 && k <= 13) return `${n}th`;
        if (n % 10 === 1) return `${n}st`;
        if (n % 10 === 2) return `${n}nd`;
        if (n % 10 === 3) return `${n}rd`;
        return `${n}th`;
    };

    const formatAnnouncementDate = (value) => {
        const raw = String(value || '').trim();
        if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return 'a beautiful day';
        const parsed = new Date(`${raw}T00:00:00`);
        if (Number.isNaN(parsed.getTime())) return 'a beautiful day';
        const month = parsed.toLocaleString('en-IN', { month: 'long' });
        return `${ordinal(parsed.getDate())} ${month}`;
    };

    const formatFooterDate = (value) => {
        const raw = String(value || '').trim();
        if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
            const now = new Date();
            return `${pad(now.getDate())} ${now.toLocaleString('en-IN', { month: 'short' })} ${now.getFullYear()}`;
        }
        const parsed = new Date(`${raw}T00:00:00`);
        if (Number.isNaN(parsed.getTime())) return raw;
        return `${pad(parsed.getDate())} ${parsed.toLocaleString('en-IN', { month: 'short' })} ${parsed.getFullYear()}`;
    };

    const toTitleCase = (value) => {
        return String(value || '')
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const normalizeDesignClass = (value) => {
        const token = String(value || '').trim().toLowerCase();
        return designClasses.includes(token) ? token : 'design-1';
    };

    const getSignature = (parentOne, parentTwo, familyName) => {
        const p1 = toTitleCase(parentOne);
        const p2 = toTitleCase(parentTwo);
        const fam = toTitleCase(familyName);
        const parentsLine = p1 && p2 ? `${p1} & ${p2}` : (p1 || p2 || 'A Loving Family');
        return fam ? `Love & Gratitude,\n${parentsLine}\n${fam}` : `Love & Gratitude,\n${parentsLine}`;
    };

    const buildAnnouncementBody = (type, recipientName, babyName, dobText, siblingName, customNote) => {
        const baby = toTitleCase(babyName) || 'our little one';
        const sibling = toTitleCase(siblingName);
        const siblingPhrase = sibling ? `, lovingly welcomed by elder sibling ${sibling},` : ',';
        const dobLine = `On ${dobText}, our hearts discovered a new rhythm.`;
        const supportLine = 'We are deeply thankful for the warmth, prayers, and love from family and friends.';

        if (type === 'birthday') {
            const recipient = toTitleCase(recipientName) || toTitleCase(babyName) || 'Dear One';
            const birthdayNote = String(customNote || '').trim() || `May this year gift ${recipient} wonderful health, fearless confidence, meaningful learning, and countless cheerful moments.`;
            return [
                `With joyful hearts, we are celebrating the birthday of ${recipient}.`,
                `Today is a gentle reminder of how beautifully time has blessed us with laughter, growth, and unforgettable memories.`,
                birthdayNote,
                `Please join us in sending your love and best wishes as ${recipient} steps into another bright and beautiful year.`
            ].join('\n\n');
        }

        if (type === 'acrd') {
            const note = String(customNote || '').trim() || 'We seek your blessings and good wishes for this beautiful new chapter in our lives. We request you to kindly respect our privacy at this time.';
            return [
                `With abundant happiness and hearts full of love, we are pleased to share that on ${dobText}, we welcomed ${baby}${siblingPhrase} into this world.`,
                supportLine,
                note
            ].join('\n\n');
        }

        const note = String(customNote || '').trim() || 'As we begin this new chapter, we humbly seek your blessings, kind wishes, and continued affection for our child and family.';

        let intro;
        if (type === 'introduction') {
            intro = `With hearts full of joy, we are delighted to introduce ${baby}${siblingPhrase} and already cherished beyond words.`;
        } else if (type === 'blessings') {
            intro = `With immense gratitude and folded hands, we share that our family has been blessed with ${baby}${siblingPhrase}`;
        } else {
            intro = `With abundant happiness and hearts full of love, we are delighted to announce the arrival of ${baby}${siblingPhrase}`;
        }

        return [
            intro,
            dobLine,
            `${baby} has filled our home with wonder, hope, and a love we never knew could be this deep.`,
            supportLine,
            note
        ].join('\n\n');
    };

    const buildSubline = (type, recipientName, babyName) => {
        const meta = typeMeta[type] || typeMeta.arrival;
        if (type === 'birthday') {
            const recipient = toTitleCase(recipientName) || toTitleCase(babyName) || 'our star';
            return `Celebrating ${recipient}'s journey with heartfelt wishes and family joy.`;
        }
        if (type === 'acrd') return meta.subline;
        const baby = toTitleCase(babyName);
        if (baby) return `Today we celebrate ${baby} and the happiness this little soul has brought us.`;
        return meta.subline;
    };

    const buildQuote = (type, babyName) => {
        const meta = typeMeta[type] || typeMeta.arrival;
        const baby = toTitleCase(babyName);
        if (baby && type !== 'birthday' && type !== 'acrd') {
            return `"${baby}: the sweetest beginning to our forever story."`;
        }
        return meta.quote;
    };

    const getCurrentText = () => {
        const type = (typeInput.value || 'arrival').toLowerCase();
        const design = normalizeDesignClass(designInput.value);
        const meta = typeMeta[type] || typeMeta.arrival;
        const recipientName = recipientInput.value;
        const babyName = babyNameInput.value;
        const dobText = formatAnnouncementDate(dobInput.value);
        const siblingName = siblingInput.value;
        const customNote = messageInput.value;
        return {
            type,
            design,
            badge: meta.badge,
            title: meta.title,
            subline: buildSubline(type, recipientName, babyName),
            body: buildAnnouncementBody(type, recipientName, babyName, dobText, siblingName, customNote),
            quote: buildQuote(type, babyName),
            signature: getSignature(parentOneInput.value, parentTwoInput.value, familyInput.value),
            date: formatFooterDate(dobInput.value)
        };
    };

    const renderPreview = () => {
        const data = getCurrentText();
        previewCard.classList.remove('theme-birthday', 'theme-acrd', 'theme-arrival', 'theme-introduction', 'theme-blessings');
        previewCard.classList.remove(...designClasses);
        previewCard.classList.add(`theme-${data.type}`);
        previewCard.classList.add(data.design);
        previewBadge.textContent = data.badge;
        previewTitle.textContent = data.title;
        previewSubline.textContent = data.subline;
        previewMessage.textContent = data.body;
        previewQuote.textContent = data.quote;
        previewFrom.textContent = data.signature;
        previewDate.textContent = data.date;
    };

    const pulsePreview = () => {
        previewCard.classList.remove('is-updated');
        void previewCard.offsetWidth;
        previewCard.classList.add('is-updated');
    };

    const buildShareText = () => {
        const data = getCurrentText();
        return `${data.badge}\n${data.title}\n${data.subline}\n\n${data.body}\n\n${data.quote}\n\n${data.signature}\n${data.date}`;
    };

    const getCardImageBlob = async () => {
        const html2canvas = await ensureHtml2Canvas();
        const canvas = await html2canvas(previewCard, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            logging: false
        });

        const blob = await new Promise((resolve) => {
            if (typeof canvas.toBlob === 'function') {
                canvas.toBlob(resolve, 'image/png', 1);
                return;
            }
            resolve(null);
        });

        if (blob) return blob;

        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const raw = atob(dataUrl.split(',')[1] || '');
        const bytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
        return new Blob([bytes], { type: 'image/png' });
    };

    const refreshPreview = () => {
        renderPreview();
    };

    [typeInput, designInput, recipientInput, babyNameInput, dobInput, siblingInput, parentOneInput, parentTwoInput, familyInput, messageInput].forEach((el) => {
        ['input', 'change'].forEach((eventName) => {
            el.addEventListener(eventName, () => {
                refreshPreview();
            });
        });
    });

    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            refreshPreview();
            pulsePreview();
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            const originalText = copyBtn.textContent;
            try {
                await navigator.clipboard.writeText(buildShareText());
                copyBtn.textContent = 'Copied';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 1300);
            } catch (_error) {
                copyBtn.textContent = 'Copy Failed';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 1300);
            }
        });
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const originalText = shareBtn.textContent;
            shareBtn.disabled = true;
            shareBtn.textContent = 'Preparing Card...';

            try {
                const cardData = getCurrentText();
                const blob = await getCardImageBlob();
                const fileBase = sanitizeFileToken(`${cardData.type}_${cardData.design}_${cardData.date || 'card'}`);
                const fileName = `${fileBase || 'naamin_greeting_card'}.png`;
                const imageFile = new File([blob], fileName, { type: 'image/png' });

                if (navigator.share && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
                    await navigator.share({
                        title: `${cardData.badge} - ${cardData.title}`,
                        text: 'Sharing your greeting card image',
                        files: [imageFile]
                    });
                    shareBtn.textContent = 'Shared';
                    setTimeout(() => {
                        shareBtn.textContent = originalText;
                    }, 1200);
                    return;
                }

                triggerBlobDownload(blob, fileName);
                const text = encodeURIComponent('Card image downloaded. Please attach and send this image on WhatsApp.');
                window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener');
                shareBtn.textContent = 'Image Downloaded';
                setTimeout(() => {
                    shareBtn.textContent = originalText;
                }, 1500);
            } catch (error) {
                if (error && error.name === 'AbortError') {
                    shareBtn.textContent = originalText;
                    return;
                }
                console.error('Greeting card share failed:', error);
                const text = encodeURIComponent(buildShareText());
                window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener');
                shareBtn.textContent = 'Text Shared';
                setTimeout(() => {
                    shareBtn.textContent = originalText;
                }, 1500);
            } finally {
                shareBtn.disabled = false;
            }
        });
    }

    renderPreview();
})();

// === HERO MODALS (SEARCH & REPORT) ===
(function() {
    // Search Modal
    const searchModalOverlay = document.getElementById('search-modal-overlay');
    const closeSearchBtn = document.getElementById('close-search-modal');
    const modalSearchInput = document.getElementById('modal-name-search');
    const modalSearchBtn = document.getElementById('modal-search-btn');
    const modalSearchResults = document.getElementById('modal-search-results');
    const modalGenderBtns = document.querySelectorAll('.modal-gender-btn');
    
    // Report Modal
    const reportModalOverlay = document.getElementById('report-modal-overlay');
    const closeReportBtn = document.getElementById('close-report-modal');
    const reportNameInput = document.getElementById('report-name-input');
    const reportDobInput = document.getElementById('report-dob-input');
    const generateReportBtn = document.getElementById('modal-generate-report-btn');
    const reportStatusEl = document.getElementById('modal-report-status');
    const reportPreviewImage = document.getElementById('report-modal-preview-image');

    let selectedGender = 'all';
    let cachedNames = { boy: [], girl: [] };

    // Helper: Open Modal
    function openModal(overlay) {
        if (!overlay) return;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Focus first input
        const input = overlay.querySelector('input');
        if (input) setTimeout(() => input.focus(), 100);
    }

    // Helper: Close Modal
    function closeModal(overlay) {
        if (!overlay) return;
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Load names for search
    async function loadNamesForSearch() {
        if (cachedNames.boy.length > 0) return;
        try {
            const boyPaths = ['/boy_names_eng.json', '/api/static-names?file=boy_names_eng.json'];
            const girlPaths = ['/girl_names_eng.json', '/api/static-names?file=girl_names_eng.json'];

            let boyRaw = null;
            for (const p of boyPaths) {
                try { const r = await fetch(p); if (!r.ok) continue; boyRaw = await r.json(); break; } catch (_) { continue; }
            }
            let girlRaw = null;
            for (const p of girlPaths) {
                try { const r = await fetch(p); if (!r.ok) continue; girlRaw = await r.json(); break; } catch (_) { continue; }
            }
            cachedNames.boy = Array.isArray(boyRaw) ? boyRaw : (boyRaw && Array.isArray(Object.values(boyRaw)[0]) ? Object.values(boyRaw)[0] : []);
            cachedNames.girl = Array.isArray(girlRaw) ? girlRaw : (girlRaw && Array.isArray(Object.values(girlRaw)[0]) ? Object.values(girlRaw)[0] : []);
        } catch (e) {
            console.error('Failed to load names for search modal:', e);
        }
    }

    // Search names (explicit trigger only)
    function searchNames(query) {
        if (!query || query.length < 1) {
            if (modalSearchResults) modalSearchResults.innerHTML = '';
            return;
        }

        const q = query.toLowerCase();
        let results = [];

        if (selectedGender === 'all' || selectedGender === 'Boy') {
            results = results.concat(
                cachedNames.boy
                    .filter(n => n.name.toLowerCase().includes(q))
                    .slice(0, 5)
                    .map(n => ({ ...n, gender: 'Boy' }))
            );
        }
        if (selectedGender === 'all' || selectedGender === 'Girl') {
            results = results.concat(
                cachedNames.girl
                    .filter(n => n.name.toLowerCase().includes(q))
                    .slice(0, 5)
                    .map(n => ({ ...n, gender: 'Girl' }))
            );
        }

        results = results.slice(0, 8);

        if (modalSearchResults) {
            if (results.length === 0) {
                modalSearchResults.innerHTML = '<p style="text-align:center;color:#666;padding:20px;">No names found. Try a different search.</p>';
            } else {
                modalSearchResults.innerHTML = results.map(n => `
                    <div class="modal-result-item" data-name="${n.name}" data-gender="${n.gender}">
                        <div>
                            <div class="modal-result-name notranslate" translate="no" lang="en">${n.name}</div>
                            <div class="modal-result-meaning">${n.meaning || 'Beautiful name'}</div>
                        </div>
                        <span style="font-size:0.8rem;color:#999;">${n.gender}</span>
                    </div>
                `).join('');

                // Click to navigate
                modalSearchResults.querySelectorAll('.modal-result-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const gender = item.dataset.gender;
                        window.location.href = `popular-names.html?gender=${gender}&search=${item.dataset.name}`;
                    });
                });
            }
        }
    }

    function clearSearchResults() {
        if (modalSearchResults) {
            modalSearchResults.innerHTML = '';
        }
    }

    function wireModalTrigger(selector, overlay, beforeOpen) {
        if (!overlay) return;
        document.addEventListener('click', (event) => {
            const trigger = event.target.closest(selector);
            if (!trigger) return;
            event.preventDefault();
            if (typeof beforeOpen === 'function') {
                beforeOpen();
            }
            if (overlay === searchModalOverlay) {
                clearSearchResults();
            }
            openModal(overlay);
        });
    }

    // Wire modal triggers from home buttons/links
    wireModalTrigger('#open-search-modal-btn, [data-open-search-modal="true"]', searchModalOverlay, loadNamesForSearch);
    wireModalTrigger('#open-report-modal-btn, [data-open-report-modal="true"]', reportModalOverlay, () => {
        queueModalReportPreviewRender();
    });

    if (closeSearchBtn && searchModalOverlay) {
        closeSearchBtn.addEventListener('click', () => closeModal(searchModalOverlay));
    }

    if (searchModalOverlay) {
        searchModalOverlay.addEventListener('click', (e) => {
            if (e.target === searchModalOverlay) closeModal(searchModalOverlay);
        });
    }

    if (modalSearchInput) {
        modalSearchInput.addEventListener('input', () => {
            // Do not auto-search while typing. Results should appear only on Search button click.
            clearSearchResults();
        });
        modalSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') e.preventDefault();
        });
    }

    if (modalSearchBtn) {
        modalSearchBtn.addEventListener('click', () => {
            if (modalSearchInput) searchNames(modalSearchInput.value.trim());
        });
    }

    modalGenderBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modalGenderBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedGender = btn.dataset.gender;
            // Filter change should not auto-run search.
            clearSearchResults();
        });
    });

    if (closeReportBtn && reportModalOverlay) {
        closeReportBtn.addEventListener('click', () => closeModal(reportModalOverlay));
    }

    if (reportModalOverlay) {
        reportModalOverlay.addEventListener('click', (e) => {
            if (e.target === reportModalOverlay) closeModal(reportModalOverlay);
        });
    }

    const setReportStatus = (message, type) => {
        if (!reportStatusEl) return;
        reportStatusEl.textContent = message || '';
        reportStatusEl.classList.remove('error', 'success');
        if (type) reportStatusEl.classList.add(type);
    };

    const toModalTitleCase = (value) => String(value || '')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');

    const modalDigitSum = (input) => String(input || '')
        .replace(/\D/g, '')
        .split('')
        .reduce((total, char) => total + Number(char || 0), 0);

    const modalReduceToCore = (value) => {
        let n = Math.max(1, Number(value) || 1);
        while (n > 9) {
            n = modalDigitSum(String(n));
            if (!n) n = 1;
        }
        return n;
    };

    const modalLifePath = (dobValue) => {
        if (!dobValue) return 1;
        const digitsOnly = String(dobValue).replace(/\D/g, '');
        if (digitsOnly.length < 8) return 1;
        return modalReduceToCore(modalDigitSum(digitsOnly));
    };

    const modalRashiFromMonth = (monthIndex) => {
        const rashiByMonth = [
            'Capricorn (Makara)',
            'Aquarius (Kumbha)',
            'Pisces (Meena)',
            'Aries (Mesha)',
            'Taurus (Vrishabha)',
            'Gemini (Mithuna)',
            'Cancer (Karka)',
            'Leo (Simha)',
            'Virgo (Kanya)',
            'Libra (Tula)',
            'Scorpio (Vrishchika)',
            'Sagittarius (Dhanu)'
        ];
        if (monthIndex < 0 || monthIndex > 11) return 'Aries (Mesha)';
        return rashiByMonth[monthIndex] || 'Aries (Mesha)';
    };

    const formatModalDob = (dobValue) => {
        const raw = String(dobValue || '').trim();
        if (!raw) return 'Not provided';
        if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

        const parsed = new Date(`${raw}T00:00:00`);
        if (Number.isNaN(parsed.getTime())) return raw;

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = String(parsed.getDate()).padStart(2, '0');
        return `${day} ${months[parsed.getMonth()]} ${parsed.getFullYear()}`;
    };

    const normalizeReportDesign = (value) => {
        const fallback = 'design-1';
        const token = String(value || '').trim().toLowerCase();
        if (typeof window.normalizeReportDesignToken === 'function') {
            return window.normalizeReportDesignToken(token);
        }
        return /^design-(10|[1-9])$/.test(token) ? token : fallback;
    };

    const resolveModalLanguage = () => {
        if (typeof getLanguage === 'function') return getLanguage();
        if (typeof window.getLanguage === 'function') return window.getLanguage();
        return 'en';
    };

    const fetchModalAstroProfile = async (nameValue) => {
        if (typeof fetchAstroProfileFromBackend === 'function') {
            return fetchAstroProfileFromBackend(nameValue);
        }
        if (typeof window.fetchAstroProfileFromBackend === 'function') {
            return window.fetchAstroProfileFromBackend(nameValue);
        }
        return null;
    };

    const buildModalReportData = async (nameValue, dobValue, designValue) => {
        const cleanName = toModalTitleCase(nameValue) || 'Name';
        const parsedDate = dobValue ? new Date(`${dobValue}T00:00:00`) : null;
        const validDate = parsedDate && !Number.isNaN(parsedDate.getTime());
        const lifePath = modalLifePath(dobValue);
        const monthIndex = validDate ? parsedDate.getMonth() : 3;
        const backendProfile = await fetchModalAstroProfile(cleanName);
        const localProfile = (!backendProfile && window.astroEngine && typeof window.astroEngine.calculateRashi === 'function')
            ? window.astroEngine.calculateRashi(cleanName)
            : null;
        const rashiProfile = backendProfile || localProfile;

        const planetByNumber = {
            1: 'Sun',
            2: 'Moon',
            3: 'Jupiter',
            4: 'Rahu',
            5: 'Mercury',
            6: 'Venus',
            7: 'Ketu',
            8: 'Saturn',
            9: 'Mars'
        };

        const colorByNumber = {
            1: 'Golden',
            2: 'White',
            3: 'Yellow',
            4: 'Blue',
            5: 'Green',
            6: 'Pink',
            7: 'Silver',
            8: 'Navy',
            9: 'Red'
        };

        const nakshatraByNumber = {
            1: 'Ashwini',
            2: 'Bharani',
            3: 'Krittika',
            4: 'Rohini',
            5: 'Mrigashira',
            6: 'Ardra',
            7: 'Punarvasu',
            8: 'Pushya',
            9: 'Magha'
        };

        const auraByNumber = {
            1: 'Leadership-focused, independent, and action-ready energy.',
            2: 'Warm, cooperative, and emotionally balanced personality.',
            3: 'Creative expression with optimistic communication skills.',
            4: 'Stable, disciplined, and process-oriented identity.',
            5: 'Adaptable, quick-thinking, and socially engaging nature.',
            6: 'Harmonious, caring, and aesthetically refined influence.',
            7: 'Insightful, reflective, and research-driven mindset.',
            8: 'Strong execution power with practical ambition.',
            9: 'Courageous, impactful, and purpose-led momentum.'
        };

        const predictionByNumber = {
            1: 'A strong cycle for confident starts, visibility, and consistent progress.',
            2: 'Partnerships and family support bring smooth forward movement.',
            3: 'Creative opportunities increase through learning and expression.',
            4: 'Steady planning and routines deliver dependable long-term gains.',
            5: 'Positive changes and networking open new practical opportunities.',
            6: 'Relationships, comfort, and value-building take center stage.',
            7: 'Reflection and focused work lead to deep, meaningful growth.',
            8: 'Career momentum and financial discipline produce solid outcomes.',
            9: 'Bold decisions and purposeful action bring visible achievements.'
        };

        const resolvedNakshatra = (rashiProfile && (rashiProfile.nakshatra || (Array.isArray(rashiProfile.nakshatras) && rashiProfile.nakshatras.length)))
            ? (pickPrimaryNakshatra(rashiProfile.nakshatra) || pickPrimaryNakshatra(rashiProfile.nakshatras) || (nakshatraByNumber[lifePath] || 'Ashwini'))
            : (nakshatraByNumber[lifePath] || 'Ashwini');
        const resolvedRashi = (rashiProfile && rashiProfile.rashi_en)
            ? rashiProfile.rashi_en
            : modalRashiFromMonth(monthIndex);
        const resolvedNakshatraHi = localizeNakshatraForHindi(resolvedNakshatra);
        const resolvedRashiHi = localizeRashiForHindi(resolvedRashi);
        const isHindi = resolveModalLanguage() === 'hi';

        return {
            name: cleanName,
            name_en: cleanName,
            name_hi: resolveHindiName('', cleanName),
            report_design: normalizeReportDesign(designValue),
            meaning_en: `${cleanName} reflects clarity, grace, and a confident identity.`,
            gender: 'Baby',
            origin_en: 'Indian / Sanskrit',
            nakshatra: isHindi ? resolvedNakshatraHi : resolvedNakshatra,
            nakshatra_en: resolvedNakshatra,
            nakshatra_hi: resolvedNakshatraHi,
            rashi: isHindi ? resolvedRashiHi : resolvedRashi,
            rashi_en: resolvedRashi,
            rashi_hi: resolvedRashiHi,
            num: String(lifePath),
            planet_en: planetByNumber[lifePath] || 'Sun',
            color_en: colorByNumber[lifePath] || 'Golden',
            phal_en: auraByNumber[lifePath] || auraByNumber[1],
            rashiphal_en: predictionByNumber[lifePath] || predictionByNumber[1],
            year: validDate ? parsedDate.getFullYear() : new Date().getFullYear(),
            dob_iso: validDate ? String(dobValue) : '',
            dob_display: formatModalDob(validDate ? String(dobValue) : '')
        };
    };

    let modalPreviewRenderToken = 0;
    let modalPreviewDebounceTimer = null;

    async function renderModalReportPreview() {
        if (!reportPreviewImage) return;
        const canvasFactory = (typeof window.createReportCanvas === 'function')
            ? window.createReportCanvas
            : (typeof createReportCanvas === 'function' ? createReportCanvas : null);
        if (!canvasFactory) return;

        const renderToken = ++modalPreviewRenderToken;
        const name = reportNameInput ? reportNameInput.value.trim() : '';
        const dob = reportDobInput ? reportDobInput.value : '';
        const design = 'design-1';

        try {
            const reportData = await buildModalReportData(name, dob, design);
            if (renderToken !== modalPreviewRenderToken) return;
            const canvas = canvasFactory(reportData);
            reportPreviewImage.src = canvas.toDataURL('image/png', 0.92);
        } catch (error) {
            if (renderToken !== modalPreviewRenderToken) return;
            console.warn('Report preview render failed:', error);
        }
    }

    function queueModalReportPreviewRender() {
        if (!reportPreviewImage) return;
        if (modalPreviewDebounceTimer) {
            clearTimeout(modalPreviewDebounceTimer);
        }
        modalPreviewDebounceTimer = setTimeout(() => {
            modalPreviewDebounceTimer = null;
            renderModalReportPreview();
        }, 120);
    }

    if (reportNameInput) {
        reportNameInput.addEventListener('input', () => {
            setReportStatus('', null);
            queueModalReportPreviewRender();
        });
    }
    if (reportDobInput) {
        reportDobInput.addEventListener('input', () => {
            setReportStatus('', null);
            queueModalReportPreviewRender();
        });
    }
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', () => {
            const name = reportNameInput ? reportNameInput.value.trim() : '';
            const dob = reportDobInput ? reportDobInput.value : '';
            const design = 'design-1';
            
            if (!name) {
                alert('Please enter a name');
                return;
            }
            
            // Navigate to name-report page with query params
            let url = `name-report.html?name=${encodeURIComponent(name)}`;
            if (dob) url += `&dob=${encodeURIComponent(dob)}`;
            url += `&design=${encodeURIComponent(design)}`;
            url += '#instant-report';
            window.location.href = url;
        });
    }

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (searchModalOverlay && searchModalOverlay.classList.contains('active')) {
                closeModal(searchModalOverlay);
            }
            if (reportModalOverlay && reportModalOverlay.classList.contains('active')) {
                closeModal(reportModalOverlay);
            }
        }
    });
})();
