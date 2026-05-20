(function () {
    try {
        const storedLang = localStorage.getItem("language");
        const normalizedLang = storedLang === "hi" ? "hi" : "en";
        if (!storedLang) {
            localStorage.setItem("language", normalizedLang);
        }
        document.documentElement.lang = normalizedLang;
    } catch (_e) {
        // ignore storage edge cases
        document.documentElement.lang = document.documentElement.lang || "hi";
    }

    function ensureScriptFonts() {
        const head = document.head || document.getElementsByTagName("head")[0];
        if (!head) return;

        const linkId = "naamin-script-fonts";
        if (document.getElementById(linkId)) return;

        const link = document.createElement("link");
        link.id = linkId;
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

    function ensureIconFont() {
        const head = document.head || document.getElementsByTagName("head")[0];
        if (!head || document.getElementById("naamin-fontawesome")) return;
        const link = document.createElement("link");
        link.id = "naamin-fontawesome";
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
        head.appendChild(link);
    }

    ensureScriptFonts();
    ensureIconFont();

    function detectBasePath() {
        const path = window.location.pathname || "/";
        const segments = path.split("/").filter(Boolean);
        if (!segments.length) return "";

        const knownFirstSegments = new Set([
            // App / static prefixes
            "more", "assets", "js", "api",
            // Clean routes (extensionless URLs and common slugs)
            "video-gallery",
            "name-explorer", "popular-names", "unique-names", "ai-names", "parents-mix", "name",
            "name-report", "services", "pricing", "contact", "about", "blog", "careers",
            "profile", "product", "famous-personalities", "wishlist",
            "login", "signup", "announcement-card",
            // Root *.html basename (pathname can include ".html"; must not be mistaken for BASE_PATH)
            "index.html", "about.html", "parents-mix.html", "ai-names.html", "popular-names.html",
            "unique-names.html", "famous-personalities.html", "name-report.html", "product.html",
            "video-gallery.html", "services.html", "careers.html", "blog.html", "contact.html",
            "pricing.html", "profile.html", "wishlist.html", "name-explorer.html", "name.html",
            "announcement-card.html", "login.html", "signup.html", "preloader.html",
            "wishlist-react-demo.html",
        ]);

        const first = segments[0].toLowerCase();
        return knownFirstSegments.has(first) ? "" : `/${segments[0]}`;
    }

    const BASE_PATH = detectBasePath();

    function stripBasePath(pathname) {
        if (!BASE_PATH || !pathname) return pathname || "/";
        if (pathname === BASE_PATH) return "/";
        if (pathname.startsWith(`${BASE_PATH}/`)) {
            return pathname.slice(BASE_PATH.length) || "/";
        }
        return pathname;
    }

    const COMMON_HEADER_HTML = `
<nav class="navbar">
    <div class="nav-brand-cluster">
        <div class="logo notranslate" translate="no" lang="en">Naam<span class="logo-in notranslate" translate="no" lang="en">in</span></div>
    </div>

    <ul class="nav-links desktop-only">
        <li><a href="/index.html" data-en="Home" data-hi="होम">Home</a></li>
        <li><a href="/about.html" data-en="About" data-hi="हमारे बारे में">About</a></li>
        <li><a href="/parents-mix.html" data-en="Parents to Child" data-hi="माता-पिता से बच्चा">Parents to Child</a></li>
        <li><a href="/video-gallery.html" data-en="Video Gallery" data-hi="वीडियो गैलरी">Video Gallery</a></li>
        <li><a href="/ai-names.html" class="notranslate" translate="no" lang="en" data-en="Naamin AI" data-hi="Naamin AI">Naamin AI</a></li>
        <li><a href="/product.html" data-en="Our Products" data-hi="हमारे उत्पाद">Our Products</a></li>
        <li class="dropdown">
            <a href="#" class="dropdown-toggle" data-en="More" data-hi="अधिक">More<span class="arrow">&#9662;</span></a>
            <ul class="dropdown-menu">
                <li><a href="/popular-names.html" data-en="Popular Names" data-hi="लोकप्रिय नाम">Popular Names</a></li>
                <li><a href="/unique-names.html" data-en="Unique Names" data-hi="अद्वितीय नाम">Unique Names</a></li>
                <li><a href="/famous-personalities.html" data-en="Famous Personalities" data-hi="प्रसिद्ध हस्तियां">Famous Personalities</a></li>
                <li><a href="/name-explorer.html" data-en="Name Explorer" data-hi="नाम एक्सप्लोरर">Name Explorer</a></li>
                <li><a href="/more/brand-name-generator/" data-en="Brand Name Generator" data-hi="ब्रांड नाम जनरेटर">Brand Name Generator</a></li>
                <li><a href="/more/motto-for-everything/" data-en="Motto Creator" data-hi="मोटो क्रिएटर">Motto Creator</a></li>
                <li><a href="/more/zodiac-finder/" data-en="Zodiac Finder" data-hi="राशि खोजक">Zodiac Finder</a></li>
                <li><a href="/name-report.html" data-en="Name Report" data-hi="नाम रिपोर्ट">Name Report</a></li>
                <li><a href="/services.html" data-en="Services" data-hi="सेवाएँ">Services</a></li>
                <li><a href="/careers.html" data-en="Careers" data-hi="करियर">Careers</a></li>
                <li><a href="/blog.html" data-en="Blog" data-hi="ब्लॉग">Blog</a></li>
                <li><a href="/contact.html" data-en="Contact" data-hi="संपर्क">Contact</a></li>
            </ul>
        </li>
    </ul>

    <div class="nav-actions desktop-only">
        <div id="global-google-translate-nav-slot" class="btn btn-login btn-lang" aria-label="Language"></div>
        <button id="fav-view-btn" class="btn btn-fav" title="Wishlist">
            <i class="fas fa-heart"></i>
            <span id="fav-count">0</span>
        </button>
        <a href="/login.html" class="btn btn-login notranslate" translate="no" lang="en" data-en="Log in" data-hi="लॉग इन">Log in</a>
        <a href="/signup.html" class="btn btn-signup notranslate" translate="no" lang="en" data-en="Sign up" data-hi="साइन अप">Sign up</a>
    </div>

    <div class="mobile-header-actions mobile-only">
        <button id="fav-view-btn-mobile" class="btn btn-fav mobile-btn" aria-label="Shortlist">
            <i class="fas fa-heart"></i>
            <span id="fav-count-mobile">0</span>
        </button>
    </div>

    <button class="hamburger-menu mobile-only" id="hamburger-menu" aria-label="Toggle menu">
        <i class="fas fa-bars"></i>
    </button>

    <div class="mobile-menu" id="mobile-menu">
        <ul class="mobile-nav-links">
            <li><a href="/index.html" data-en="Home" data-hi="होम">Home</a></li>
            <li><a href="/about.html" data-en="About" data-hi="हमारे बारे में">About</a></li>
            <li><a href="/parents-mix.html" data-en="Parents to Child" data-hi="माता-पिता से बच्चा">Parents to Child</a></li>
            <li><a href="/video-gallery.html" data-en="Video Gallery" data-hi="वीडियो गैलरी">Video Gallery</a></li>
            <li><a href="/ai-names.html" class="notranslate" translate="no" lang="en" data-en="Naamin AI" data-hi="Naamin AI">Naamin AI</a></li>
            <li><a href="/product.html" data-en="Our Products" data-hi="हमारे उत्पाद">Our Products</a></li>
            <li class="mobile-dropdown">
                <a href="#" class="mobile-dropdown-toggle" data-en="More" data-hi="अधिक">More<span class="arrow">&#9662;</span></a>
                <ul class="mobile-dropdown-menu">
                    <li><a href="/popular-names.html" data-en="Popular Names" data-hi="लोकप्रिय नाम">Popular Names</a></li>
                    <li><a href="/unique-names.html" data-en="Unique Names" data-hi="अद्वितीय नाम">Unique Names</a></li>
                    <li><a href="/famous-personalities.html" data-en="Famous Personalities" data-hi="प्रसिद्ध हस्तियां">Famous Personalities</a></li>
                    <li><a href="/name-explorer.html" data-en="Name Explorer" data-hi="नाम एक्सप्लोरर">Name Explorer</a></li>
                    <li><a href="/more/brand-name-generator/" data-en="Brand Name Generator" data-hi="ब्रांड नाम जनरेटर">Brand Name Generator</a></li>
                    <li><a href="/more/motto-for-everything/" data-en="Motto Creator" data-hi="मोटो क्रिएटर">Motto Creator</a></li>
                    <li><a href="/more/zodiac-finder/" data-en="Zodiac Finder" data-hi="राशि खोजक">Zodiac Finder</a></li>
                    <li><a href="/name-report.html" data-en="Name Report" data-hi="नाम रिपोर्ट">Name Report</a></li>
                    <li><a href="/services.html" data-en="Services" data-hi="सेवाएँ">Services</a></li>
                    <li><a href="/careers.html" data-en="Careers" data-hi="करियर">Careers</a></li>
                    <li><a href="/blog.html" data-en="Blog" data-hi="ब्लॉग">Blog</a></li>
                    <li><a href="/contact.html" data-en="Contact" data-hi="संपर्क">Contact</a></li>
                </ul>
            </li>
        </ul>

        <div class="mobile-actions">
            <a href="/login.html" class="btn btn-login mobile-btn notranslate" translate="no" lang="en" data-en="Log in" data-hi="लॉग इन">Log in</a>
            <a href="/signup.html" class="btn btn-signup mobile-btn notranslate" translate="no" lang="en" data-en="Sign up" data-hi="साइन अप">Sign up</a>
        </div>
    </div>
</nav>`;

    const COMMON_FOOTER_HTML = `
<footer>
    <div class="footer-grid">
        <div>
            <h3 data-en="Quick Links" data-hi="त्वरित लिंक">Quick Links</h3>
            <a href="/index.html" data-en="Home" data-hi="होम">Home</a>
            <a href="/about.html" data-en="About" data-hi="हमारे बारे में">About</a>
            <a href="/services.html" data-en="Services" data-hi="सेवाएँ">Services</a>
            <a href="/contact.html" data-en="Contact" data-hi="संपर्क">Contact</a>
        </div>
        <div>
            <h3 data-en="Our Services" data-hi="हमारी सेवाएँ">Our Services</h3>
            <a href="/services.html#consultation" data-en="Name Consultation" data-hi="नाम परामर्श">Name Consultation</a>
            <a href="/services.html#brand" data-en="Brand & Startup Naming" data-hi="ब्रांड और स्टार्टअप नामकरण">Brand & Startup Naming</a>
            <a href="/services.html#company" data-en="Company & Institution Naming" data-hi="कंपनी और संस्थान नामकरण">Company & Institution Naming</a>
            <a href="/more/domain-name-creator/" data-en="Domain Naming Service" data-hi="डोमेन नामकरण सेवा">Domain Naming Service</a>
            <a href="/more/motto-for-everything/" data-en="Motto Creator" data-hi="मोटो क्रिएटर">Motto Creator</a>
            <a href="/name-report.html" data-en="Name Report" data-hi="नाम रिपोर्ट">Name Report</a>
            <a href="/product.html" data-en="Our Products" data-hi="हमारे उत्पाद">Our Products</a>
        </div>
        <div>
            <h3 data-en="Follow Us" data-hi="हमें फॉलो करें">Follow Us</h3>
            <div class="footer-social-icons" aria-label="Social logos">
                <span class="social-icon-link is-disabled" role="img" aria-label="LinkedIn" title="LinkedIn">
                    <i class="fa-brands fa-linkedin-in" aria-hidden="true"></i>
                </span>
                <span class="social-icon-link is-disabled" role="img" aria-label="Instagram" title="Instagram">
                    <i class="fa-brands fa-instagram" aria-hidden="true"></i>
                </span>
                <span class="social-icon-link is-disabled" role="img" aria-label="Facebook" title="Facebook">
                    <i class="fa-brands fa-facebook-f" aria-hidden="true"></i>
                </span>
                <span class="social-icon-link is-disabled" role="img" aria-label="X (Twitter)" title="X (Twitter)">
                    <i class="fa-brands fa-x-twitter" aria-hidden="true"></i>
                </span>
            </div>
        </div>
        <div>
            <h3 data-en="Contact" data-hi="संपर्क">Contact</h3>
            <p><a href="tel:+919413678955">+91 94136 78955</a></p>
            <p><a href="mailto:naamin.com@gmail.com">naamin.com@gmail.com</a></p>
            <p data-en="Hyderabad, Telangana, India" data-hi="हैदराबाद, तेलंगाना, भारत">Hyderabad, Telangana, India</p>
        </div>
    </div>
    <p class="copyrights" data-en="© 2025 Naamin. All rights reserved." data-hi="© 2025 Naamin. सर्वाधिकार सुरक्षित।">© 2025 Naamin. All rights reserved.</p>
</footer>`;

    function normalizePath(pathname) {
        const scoped = stripBasePath(pathname || "/");
        if (!scoped || scoped === "/") return "/index.html";
        const clean = scoped.endsWith("/") ? scoped.slice(0, -1) : scoped;
        return clean || "/index.html";
    }

    function getPathFromHref(href) {
        if (!href || href.startsWith("#")) return "";
        try {
            return normalizePath(new URL(href, window.location.origin).pathname);
        } catch (_e) {
            return "";
        }
    }

    function markActiveLinks() {
        const currentPath = normalizePath(window.location.pathname);
        const currentHash = window.location.hash || "";

        document.querySelectorAll(".navbar .nav-links a, .navbar .mobile-nav-links a").forEach((link) => {
            link.classList.remove("active");
            const href = link.getAttribute("href") || "";
            const linkPath = getPathFromHref(href);
            const linkHash = href.includes("#") ? href.slice(href.indexOf("#")) : "";

            if (!linkPath) return;

            const pathMatched = linkPath === currentPath;
            const hashMatched = !linkHash || linkHash === currentHash;

            if (pathMatched && hashMatched) {
                link.classList.add("active");
            }
        });

    }

    function replaceIfExists(selector, html) {
        const target = document.querySelector(selector);
        if (target) {
            target.outerHTML = html;
            return true;
        }
        return false;
    }

    function applyBasePathToLinks(scope) {
        if (!scope || !BASE_PATH) return;
        scope.querySelectorAll('a[href^="/"]').forEach((link) => {
            const href = link.getAttribute("href");
            if (!href) return;
            if (href.startsWith(BASE_PATH + "/") || href === BASE_PATH) return;
            link.setAttribute("href", `${BASE_PATH}${href}`);
        });
    }

    function ensureScrollToTopButton() {
        const existing = document.querySelector(".scroll-to-top-btn");
        const btn = existing || document.createElement("button");

        if (!existing) {
            btn.type = "button";
            btn.className = "scroll-to-top-btn";
            btn.setAttribute("aria-label", "Scroll to top");
            btn.innerHTML =
                '<i class="fas fa-arrow-up" aria-hidden="true"></i>' +
                '<span class="scroll-to-top-fallback" aria-hidden="true">↑</span>';
            document.body.appendChild(btn);
        }

        if (btn.dataset.bound === "1") return;
        btn.dataset.bound = "1";

        const updateVisibility = () => {
            const shouldShow = (window.scrollY || 0) > 400;
            btn.classList.toggle("show", shouldShow);
        };

        updateVisibility();
        window.addEventListener("scroll", updateVisibility, { passive: true });
        window.addEventListener("resize", updateVisibility, { passive: true });

        btn.addEventListener("click", () => {
            try {
                window.scrollTo({ top: 0, behavior: "smooth" });
            } catch (_e) {
                window.scrollTo(0, 0);
            }
        });
    }

    function neutralizeFooterSocialLinks() {
        document.querySelectorAll("footer .footer-social-icons a.social-icon-link").forEach((link) => {
            const span = document.createElement("span");
            span.className = `${link.className || "social-icon-link"} is-disabled`.trim();
            span.setAttribute("role", "img");
            span.setAttribute("aria-label", link.getAttribute("aria-label") || link.getAttribute("title") || "Social logo");
            span.setAttribute("title", link.getAttribute("title") || link.getAttribute("aria-label") || "Social logo");
            span.innerHTML = link.innerHTML;
            link.replaceWith(span);
        });

        document.querySelectorAll("footer .footer-social-icons .social-icon-link").forEach((node) => {
            node.classList.add("is-disabled");
            node.removeAttribute("href");
            node.removeAttribute("target");
            node.removeAttribute("rel");
            node.removeAttribute("tabindex");
        });
    }

    function syncTopOffsetPadding() {
        const topEl = document.querySelector("header, nav.navbar");
        if (!topEl) return;

        let shouldApply = true;
        try {
            const pos = window.getComputedStyle(topEl).position;
            // Apply padding when the element can overlay content.
            shouldApply = pos === "fixed" || pos === "sticky";
        } catch (_e) {
            // Keep default true.
        }

        if (!shouldApply) return;

        const height = Math.max(0, topEl.offsetHeight || 0);
        document.documentElement.style.setProperty("--naamin-top-offset", `${height}px`);
        document.body.style.paddingTop = `${height}px`;
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
        const mobileMenu = document.getElementById("mobile-menu");
        const hamburger = document.getElementById("hamburger-menu");
        const overlay = ensureMobileMenuOverlay(mobileMenu);

        if (mobileMenu) mobileMenu.classList.remove("open");
        if (overlay) overlay.classList.remove("active");
        document.body.classList.remove("mobile-menu-open");
        document.body.style.overflow = "";

        const icon = hamburger && hamburger.querySelector("i");
        if (icon) icon.className = "fas fa-bars";
    }

    function openMobileMenu() {
        const mobileMenu = document.getElementById("mobile-menu");
        const hamburger = document.getElementById("hamburger-menu");
        const overlay = ensureMobileMenuOverlay(mobileMenu);

        if (mobileMenu) mobileMenu.classList.add("open");
        if (overlay) overlay.classList.add("active");
        document.body.classList.add("mobile-menu-open");
        document.body.style.overflow = "hidden";

        const icon = hamburger && hamburger.querySelector("i");
        if (icon) icon.className = "fas fa-times";
    }

    function wireMobileMenu() {
        const hamburger = document.getElementById("hamburger-menu");
        const mobileMenu = document.getElementById("mobile-menu");
        const overlay = ensureMobileMenuOverlay(mobileMenu);
        const mobileDropdownToggle = document.querySelector(".mobile-dropdown-toggle");
        const mobileDropdown = document.querySelector(".mobile-dropdown");

        if (hamburger && mobileMenu && hamburger.dataset.commonMenuBound !== "true") {
            hamburger.dataset.commonMenuBound = "true";
            hamburger.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (mobileMenu.classList.contains("open")) closeMobileMenu();
                else openMobileMenu();
            });
        }

        if (overlay && overlay.dataset.commonMenuBound !== "true") {
            overlay.dataset.commonMenuBound = "true";
            overlay.addEventListener("click", closeMobileMenu);
        }

        if (mobileDropdownToggle && mobileDropdown && mobileDropdownToggle.dataset.commonDropdownBound !== "true") {
            mobileDropdownToggle.dataset.commonDropdownBound = "true";
            mobileDropdownToggle.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                mobileDropdown.classList.toggle("open");
            });
        }

        if (mobileMenu) {
            mobileMenu.querySelectorAll('a:not(.mobile-dropdown-toggle)').forEach((link) => {
                if (link.dataset.commonCloseBound === "true") return;
                link.dataset.commonCloseBound = "true";
                link.addEventListener("click", closeMobileMenu);
            });
        }
    }

    function applyCommonLayout() {
        const headerReplaced = replaceIfExists("nav.navbar", COMMON_HEADER_HTML);
        const footerReplaced = replaceIfExists("footer", COMMON_FOOTER_HTML);

        const headerEl = document.querySelector("nav.navbar");
        const footerEl = document.querySelector("footer");
        applyBasePathToLinks(headerEl);
        applyBasePathToLinks(footerEl);

        // Even if header/footer weren't replaced (some pages inline their own markup),
        // still run common behaviors so UI is consistent across the site.
        if (headerReplaced || footerReplaced || headerEl || footerEl) {
            markActiveLinks();
        }
        ensureScrollToTopButton();
        neutralizeFooterSocialLinks();
        syncTopOffsetPadding();
        wireMobileMenu();
        window.addEventListener("resize", syncTopOffsetPadding, { passive: true });
        window.addEventListener("orientationchange", syncTopOffsetPadding, { passive: true });
        document.dispatchEvent(new CustomEvent("naamin:layout-ready"));
    }

    document.addEventListener("click", (event) => {
        const mobileMenu = document.getElementById("mobile-menu");
        const hamburger = document.getElementById("hamburger-menu");
        if (!mobileMenu || !hamburger || !mobileMenu.classList.contains("open")) return;
        if (mobileMenu.contains(event.target) || hamburger.contains(event.target)) return;
        closeMobileMenu();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMobileMenu();
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", applyCommonLayout, { once: true });
    } else {
        applyCommonLayout();
    }
})();
