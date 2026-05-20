(function () {
    function getFavoritesCount() {
        try {
            const raw = localStorage.getItem("favorites");
            if (!raw) return 0;
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed.length : 0;
        } catch (_error) {
            return 0;
        }
    }

    function syncNavbarFavoritesCount() {
        const count = getFavoritesCount();
        document.querySelectorAll("#fav-count, #fav-count-mobile").forEach((element) => {
            element.textContent = String(count);
            element.style.display = "inline-flex";
        });
    }

    function getLang() {
        if (localStorage.getItem("naamin-google-translate-language")) return "en";
        return localStorage.getItem("language") || "en";
    }

    const WIN1252_REVERSE = {
        8364: 128, 8218: 130, 402: 131, 8222: 132, 8230: 133, 8224: 134, 8225: 135,
        710: 136, 8240: 137, 352: 138, 8249: 139, 338: 140, 381: 142,
        8216: 145, 8217: 146, 8220: 147, 8221: 148, 8226: 149, 8211: 150, 8212: 151,
        732: 152, 8482: 153, 353: 154, 8250: 155, 339: 156, 382: 158, 376: 159
    };

    function normalizeMaybeMojibake(text) {
        if (!text) return text;
        if (!/(?:Ãƒâ€š|ÃƒÆ’|ÃƒÂ¢|Ãƒ|Ã‚|Ã¢|Ã Â¤|Ã Â¥|ï¿½)/.test(text)) return text;

        try {
            const bytes = new Uint8Array(text.length);
            for (let index = 0; index < text.length; index++) {
                const code = text.charCodeAt(index);
                if (code <= 255) {
                    bytes[index] = code;
                    continue;
                }
                const mapped = WIN1252_REVERSE[code];
                if (mapped === undefined) return text;
                bytes[index] = mapped;
            }

            const decoded = new TextDecoder("utf-8").decode(bytes);
            if (!decoded || decoded === text) return text;
            if (decoded.includes("ï¿½")) return text;

            const devanagariCount = (decoded.match(/[\u0900-\u097F]/g) || []).length;
            if (devanagariCount > 0) return decoded;

            if (/(?:Ãƒâ€š|ÃƒÆ’|ÃƒÂ¢|Ãƒ|Ã‚|Ã¢)/.test(text) && !/(?:Ãƒâ€š|ÃƒÆ’|ÃƒÂ¢|Ãƒ|Ã‚|Ã¢)/.test(decoded)) {
                return decoded;
            }
            return text;
        } catch (_error) {
            return text;
        }
    }

    function setTextPreserveChildren(element, translated) {
        const hasElementChildren = Array.from(element.childNodes).some((node) => node.nodeType === 1);
        if (!hasElementChildren) {
            element.textContent = translated;
            return;
        }

        const textNode = Array.from(element.childNodes).find(
            (node) => node.nodeType === 3 && node.nodeValue.trim().length > 0
        );
        const suffix = translated.endsWith(" ") ? "" : " ";
        if (textNode) {
            textNode.nodeValue = translated + suffix;
        } else {
            element.insertBefore(document.createTextNode(translated + suffix), element.firstChild);
        }
    }

    function applyPlatformBranding() {
        if (window.__naaminPlatformBrandingApplied) return;
        window.__naaminPlatformBrandingApplied = true;

        document.querySelectorAll("nav a, footer a, .mobile-menu a").forEach((link) => {
            try {
                const parsed = new URL(link.getAttribute("href") || "", window.location.origin);
                const normalizedPath = parsed.pathname.replace(/\/index\.html$/i, "/").replace(/\/+$/, "/");
                if (normalizedPath !== "/more/motto-for-everything/") return;
                link.setAttribute("data-en", "Motto Creator");
                link.setAttribute("data-hi", "Motto Creator");
                if (!link.querySelector("*")) link.textContent = "Motto Creator";
            } catch (_error) {
                // Ignore invalid href values.
            }
        });

        document.querySelectorAll('a[href$="product.html"]').forEach((link) => {
            link.setAttribute("data-en", "Our Products");
            link.setAttribute("data-hi", "Our Products");
            if (!link.querySelector("*")) link.textContent = "Our Products";
        });

        document.querySelectorAll('a[href$="pricing.html"]').forEach((link) => {
            link.classList.add("nav-hidden");
        });

        const servicesBase = "/services.html";
        const domainHref = "/more/domain-name-creator/";
        const nameReportHref = "/name-report.html";
        const productsHref = "/product.html";

        document.querySelectorAll(".dropdown-menu, .mobile-dropdown-menu").forEach((menu) => {
            const hasNameReport = Array.from(menu.querySelectorAll("a")).some((anchor) => {
                const href = (anchor.getAttribute("href") || "").toLowerCase();
                const text = (anchor.textContent || "").trim().toLowerCase();
                return href.includes("name-report") || text === "name report";
            });
            if (hasNameReport) return;

            const listItem = document.createElement("li");
            const link = document.createElement("a");
            link.href = nameReportHref;
            link.setAttribute("data-en", "Name Report");
            link.setAttribute("data-hi", "Name Report");
            link.textContent = "Name Report";
            listItem.appendChild(link);

            const insertAfter = menu.querySelector('a[href*="domain-name-creator"], a[href*="zodiac-finder"], a[href*="motto-for-everything"]');
            if (insertAfter && insertAfter.parentElement) {
                insertAfter.parentElement.insertAdjacentElement("afterend", listItem);
            } else {
                menu.appendChild(listItem);
            }
        });

        document.querySelectorAll(".dropdown-menu a[href$=\"product.html\"], .mobile-dropdown-menu a[href$=\"product.html\"]").forEach((link) => {
            const listItem = link.closest("li");
            if (listItem) listItem.remove();
        });

        document.querySelectorAll("ul.nav-links.desktop-only").forEach((navList) => {
            let topProductsLink = navList.querySelector(":scope > li > a[href$=\"product.html\"]");
            if (!topProductsLink) {
                const listItem = document.createElement("li");
                topProductsLink = document.createElement("a");
                topProductsLink.href = productsHref;
                topProductsLink.textContent = "Our Products";
                topProductsLink.setAttribute("data-en", "Our Products");
                topProductsLink.setAttribute("data-hi", "Our Products");
                listItem.appendChild(topProductsLink);
                const dropdownItem = navList.querySelector(":scope > li.dropdown");
                if (dropdownItem) navList.insertBefore(listItem, dropdownItem);
                else navList.appendChild(listItem);
            } else {
                topProductsLink.href = productsHref;
                topProductsLink.setAttribute("data-en", "Our Products");
                topProductsLink.setAttribute("data-hi", "Our Products");
                if (!topProductsLink.querySelector("*")) topProductsLink.textContent = "Our Products";
            }
        });

        document.querySelectorAll("ul.mobile-nav-links").forEach((navList) => {
            let topProductsLink = navList.querySelector(":scope > li > a[href$=\"product.html\"]");
            if (!topProductsLink) {
                const listItem = document.createElement("li");
                topProductsLink = document.createElement("a");
                topProductsLink.href = productsHref;
                topProductsLink.textContent = "Our Products";
                topProductsLink.setAttribute("data-en", "Our Products");
                topProductsLink.setAttribute("data-hi", "Our Products");
                listItem.appendChild(topProductsLink);
                const dropdownItem = navList.querySelector(":scope > li.mobile-dropdown");
                if (dropdownItem) navList.insertBefore(listItem, dropdownItem);
                else navList.appendChild(listItem);
            } else {
                topProductsLink.href = productsHref;
                topProductsLink.setAttribute("data-en", "Our Products");
                topProductsLink.setAttribute("data-hi", "Our Products");
                if (!topProductsLink.querySelector("*")) topProductsLink.textContent = "Our Products";
            }
        });

        document.querySelectorAll("footer .footer-grid").forEach((grid) => {
            const columns = Array.from(grid.children || []);
            const servicesColumn = columns.find((column) => {
                const heading = column.querySelector("h3");
                if (!heading) return false;
                const englishHeading = (heading.getAttribute("data-en") || heading.textContent || "").trim().toLowerCase();
                return englishHeading === "our services";
            });
            if (!servicesColumn) return;

            servicesColumn.querySelectorAll("a").forEach((anchor) => anchor.remove());

            const links = [
                { href: `${servicesBase}#consultation`, en: "Name Consultation", hi: "Name Consultation" },
                { href: `${servicesBase}#brand`, en: "Brand & Startup Naming", hi: "Brand & Startup Naming" },
                { href: `${servicesBase}#company`, en: "Company & Institution Naming", hi: "Company & Institution Naming" },
                { href: domainHref, en: "Domain Naming Service", hi: "Domain Naming Service" },
                { href: "/more/motto-for-everything/", en: "Motto Creator", hi: "Motto Creator" },
                { href: "/name-report.html", en: "Name Report", hi: "Name Report" },
                { href: productsHref, en: "Our Products", hi: "Our Products" }
            ];

            links.forEach((linkData) => {
                const anchor = document.createElement("a");
                anchor.href = linkData.href;
                anchor.setAttribute("data-en", linkData.en);
                anchor.setAttribute("data-hi", linkData.hi);
                anchor.textContent = linkData.en;
                servicesColumn.appendChild(anchor);
            });
        });
    }

    function applyNavbarTranslation() {
        const lang = getLang();
        document.querySelectorAll(".navbar [data-en]").forEach((element) => {
            const raw = element.getAttribute(lang === "hi" ? "data-hi" : "data-en");
            const translated = normalizeMaybeMojibake(raw);
            if (!translated) return;

            const isDropdownToggle =
                element.classList.contains("dropdown-toggle") ||
                element.classList.contains("mobile-dropdown-toggle");

            if (isDropdownToggle) {
                const arrow = element.querySelector(".arrow");
                setTextPreserveChildren(element, translated);
                if (!arrow) {
                    const span = document.createElement("span");
                    span.className = "arrow";
                    span.textContent = "▼";
                    element.appendChild(span);
                }
            } else {
                element.textContent = translated;
            }
        });

        applyPlatformBranding();
    }

    function attachDropdownSafetyHandlers() {
        if (window.__navbarFixListenerAttached) return;
        window.__navbarFixListenerAttached = true;

        document.addEventListener(
            "click",
            (event) => {
                const toggle = event.target.closest(".dropdown-toggle, .mobile-dropdown-toggle");
                if (!toggle) return;

                event.preventDefault();
                event.stopPropagation();

                const desktopItem = toggle.closest(".dropdown");
                if (desktopItem) {
                    const isOpen = desktopItem.classList.contains("open");
                    document.querySelectorAll(".dropdown.open").forEach((item) => {
                        if (item !== desktopItem) item.classList.remove("open");
                    });
                    desktopItem.classList.toggle("open", !isOpen);
                }

                const mobileItem = toggle.closest(".mobile-dropdown");
                if (mobileItem) {
                    mobileItem.classList.toggle("open");
                }
            },
            true
        );

        document.addEventListener("click", (event) => {
            if (event.target.closest(".dropdown") || event.target.closest(".mobile-dropdown")) return;
            document.querySelectorAll(".dropdown.open, .mobile-dropdown.open").forEach((item) => {
                item.classList.remove("open");
            });
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(applyNavbarTranslation, 120);
        syncNavbarFavoritesCount();
        attachDropdownSafetyHandlers();
    });

    document.addEventListener("favoritesUpdated", syncNavbarFavoritesCount);
    window.addEventListener("storage", (event) => {
        if (!event || event.key === "favorites") {
            syncNavbarFavoritesCount();
        }
    });

    document.querySelectorAll("#language-toggle, #language-toggle-mobile").forEach((button) => {
        button.addEventListener("click", () => {
            setTimeout(applyNavbarTranslation, 80);
        });
    });

    window.forceNavbarTranslation = applyNavbarTranslation;
    window.syncNavbarFavoritesCount = syncNavbarFavoritesCount;
})();
