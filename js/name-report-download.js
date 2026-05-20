(function () {
    var AUTH_STORAGE_KEY = "naamin-authenticated";

    function byId(id) {
        return document.getElementById(id);
    }

    function getLang() {
        try {
            var raw = String(document.documentElement && document.documentElement.lang ? document.documentElement.lang : "").toLowerCase();
            return raw === "hi" ? "hi" : "en";
        } catch (_e) {
            return "en";
        }
    }

    function t(en, hi) {
        return getLang() === "hi" ? (hi || en) : en;
    }

    function sleep(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }

    function sanitizeName(value) {
        return String(value || "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function toTitleCase(value) {
        return sanitizeName(value)
            .split(" ")
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(" ");
    }

    function normalizeReportDesign(value) {
        var token = String(value || "").trim().toLowerCase();
        if (typeof window.normalizeReportDesignToken === "function") {
            return window.normalizeReportDesignToken(token);
        }
        return /^design-(10|[1-9])$/.test(token) ? token : "design-1";
    }

    function pickPrimaryNakshatra(value) {
        if (Array.isArray(value)) {
            return String(value[0] || "").trim();
        }
        var raw = String(value || "").trim();
        if (!raw) return "";
        return raw.split(",")[0].trim();
    }

    function sumDigits(input) {
        return String(input || "")
            .replace(/\D/g, "")
            .split("")
            .reduce(function (total, char) {
                return total + Number(char || 0);
            }, 0);
    }

    function reduceToCoreNumber(value) {
        var n = Math.max(1, Number(value) || 1);
        while (n > 9) {
            n = sumDigits(String(n));
            if (!n) n = 1;
        }
        return n;
    }

    function getLifePathNumber(dobValue) {
        if (!dobValue) return 1;
        var digitsOnly = String(dobValue).replace(/\D/g, "");
        if (digitsOnly.length < 8) return 1;
        return reduceToCoreNumber(sumDigits(digitsOnly));
    }

    function getRashiFromMonth(monthIndex) {
        var rashiByMonth = [
            "Capricorn (Makara)",
            "Aquarius (Kumbha)",
            "Pisces (Meena)",
            "Aries (Mesha)",
            "Taurus (Vrishabha)",
            "Gemini (Mithuna)",
            "Cancer (Karka)",
            "Leo (Simha)",
            "Virgo (Kanya)",
            "Libra (Tula)",
            "Scorpio (Vrishchika)",
            "Sagittarius (Dhanu)"
        ];
        if (monthIndex < 0 || monthIndex > 11) return "Aries (Mesha)";
        return rashiByMonth[monthIndex] || "Aries (Mesha)";
    }

    function formatDobDisplay(dobValue) {
        var raw = String(dobValue || "").trim();
        if (!raw) return "Not provided";
        if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

        var parsed = new Date(raw + "T00:00:00");
        if (Number.isNaN(parsed.getTime())) return raw;

        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var day = String(parsed.getDate()).padStart(2, "0");
        return day + " " + months[parsed.getMonth()] + " " + parsed.getFullYear();
    }

    function normalizeBabyGender(value) {
        var raw = String(value || "").trim().toLowerCase();
        return raw === "girl" ? "girl" : "boy";
    }

    function readFileAsDataUrl(file) {
        return new Promise(function (resolve, reject) {
            if (!file) {
                resolve("");
                return;
            }
            var reader = new FileReader();
            reader.onerror = function () { reject(new Error("Failed to read image")); };
            reader.onload = function () { resolve(String(reader.result || "")); };
            reader.readAsDataURL(file);
        });
    }

    function downscaleImageDataUrl(dataUrl, maxSizePx) {
        return new Promise(function (resolve, reject) {
            try {
                var size = Math.max(128, Number(maxSizePx) || 640);
                var img = new Image();
                img.onload = function () {
                    try {
                        var iw = img.naturalWidth || img.width || 0;
                        var ih = img.naturalHeight || img.height || 0;
                        if (!iw || !ih) {
                            resolve(String(dataUrl || ""));
                            return;
                        }

                        var scale = Math.min(1, size / Math.max(iw, ih));
                        var tw = Math.max(1, Math.round(iw * scale));
                        var th = Math.max(1, Math.round(ih * scale));

                        var canvas = document.createElement("canvas");
                        canvas.width = tw;
                        canvas.height = th;
                        var ctx = canvas.getContext("2d", { alpha: false });
                        if (!ctx) {
                            resolve(String(dataUrl || ""));
                            return;
                        }

                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = "high";
                        ctx.fillStyle = "#ffffff";
                        ctx.fillRect(0, 0, tw, th);
                        ctx.drawImage(img, 0, 0, tw, th);

                        // JPEG is smaller and fine for portrait photos in a PDF.
                        var out = canvas.toDataURL("image/jpeg", 0.9);
                        resolve(out || String(dataUrl || ""));
                    } catch (innerErr) {
                        reject(innerErr);
                    }
                };
                img.onerror = function () { reject(new Error("Invalid image")); };
                img.src = String(dataUrl || "");
            } catch (e) {
                reject(e);
            }
        });
    }

    function loadImage(dataUrl) {
        return new Promise(function (resolve, reject) {
            var url = String(dataUrl || "");
            if (!url) {
                resolve(null);
                return;
            }
            var img = new Image();
            img.onload = function () { resolve(img); };
            img.onerror = function () { reject(new Error("Invalid image")); };
            img.src = url;
        });
    }

    async function getPortraitImageFromFile(file) {
        if (!file) return null;

        // Guard: avoid huge images crashing canvas/pdf on mobile.
        var maxBytes = 12 * 1024 * 1024; // 12MB
        if (typeof file.size === "number" && file.size > maxBytes) {
            throw new Error(t(
                "Photo is too large. Please upload an image under 12MB.",
                "फोटो बहुत बड़ा है। कृपया 12MB से कम इमेज अपलोड करें।"
            ));
        }

        var dataUrl = await readFileAsDataUrl(file);
        if (!dataUrl) return null;

        // Downscale to keep PDF generation stable; falls back to original if anything fails.
        var compactDataUrl = dataUrl;
        try {
            compactDataUrl = await downscaleImageDataUrl(dataUrl, 640);
        } catch (_e) {
            compactDataUrl = dataUrl;
        }

        try {
            return await loadImage(compactDataUrl);
        } catch (_loadErr) {
            // If the uploaded image cannot be decoded (e.g., HEIC), continue with auto-avatar.
            return null;
        }
    }

    var astroProfileRequestCache = new Map();

    async function fetchAstroProfileFromBackend(nameValue) {
        var name = String(nameValue || "").trim();
        if (!name) return null;
        var cacheKey = name.toLowerCase();
        if (astroProfileRequestCache.has(cacheKey)) {
            return astroProfileRequestCache.get(cacheKey);
        }

        var requestPromise = (async function () {
            var endpoints = ["/api/astro-profile"];
            try {
                var host = window.location.hostname || "";
                var isLocal = host === "localhost" || host === "127.0.0.1";
                if (!isLocal) {
                    endpoints.push("http://127.0.0.1:3000/api/astro-profile");
                    endpoints.push("http://localhost:3000/api/astro-profile");
                }
            } catch (_err) {
                // use default endpoint only
            }

            for (var i = 0; i < endpoints.length; i += 1) {
                try {
                    var resp = await fetch(endpoints[i], {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: name })
                    });
                    if (!resp.ok) continue;
                    var payload = await resp.json().catch(function () { return null; });
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

    async function buildReportData(nameValue, dobValue, designValue, genderValue, photoImage) {
        var cleanName = toTitleCase(nameValue) || "Name";
        var parsedDate = dobValue ? new Date(dobValue + "T00:00:00") : null;
        var validDate = parsedDate && !Number.isNaN(parsedDate.getTime());
        var lifePath = getLifePathNumber(dobValue);
        var backendProfile = await fetchAstroProfileFromBackend(cleanName);
        var localProfile = (!backendProfile && window.astroEngine && typeof window.astroEngine.calculateRashi === "function")
            ? window.astroEngine.calculateRashi(cleanName)
            : null;
        var rashiProfile = backendProfile || localProfile;

        var planetByNumber = {
            1: "Sun",
            2: "Moon",
            3: "Jupiter",
            4: "Rahu",
            5: "Mercury",
            6: "Venus",
            7: "Ketu",
            8: "Saturn",
            9: "Mars"
        };

        var colorByNumber = {
            1: "Golden",
            2: "White",
            3: "Yellow",
            4: "Blue",
            5: "Green",
            6: "Pink",
            7: "Silver",
            8: "Navy",
            9: "Red"
        };

        var nakshatraByNumber = {
            1: "Ashwini",
            2: "Bharani",
            3: "Krittika",
            4: "Rohini",
            5: "Mrigashira",
            6: "Ardra",
            7: "Punarvasu",
            8: "Pushya",
            9: "Magha"
        };

        var auraByNumber = {
            1: "Leadership-focused, independent, and action-ready energy.",
            2: "Warm, cooperative, and emotionally balanced personality.",
            3: "Creative expression with optimistic communication skills.",
            4: "Stable, disciplined, and process-oriented identity.",
            5: "Adaptable, quick-thinking, and socially engaging nature.",
            6: "Harmonious, caring, and aesthetically refined influence.",
            7: "Insightful, reflective, and research-driven mindset.",
            8: "Strong execution power with practical ambition.",
            9: "Courageous, impactful, and purpose-led momentum."
        };

        var predictionByNumber = {
            1: "A strong cycle for confident starts, visibility, and consistent progress.",
            2: "Partnerships and family support bring smooth forward movement.",
            3: "Creative opportunities increase through learning and expression.",
            4: "Steady planning and routines deliver dependable long-term gains.",
            5: "Positive changes and networking open new practical opportunities.",
            6: "Relationships, comfort, and value-building take center stage.",
            7: "Reflection and focused work lead to deep, meaningful growth.",
            8: "Career momentum and financial discipline produce solid outcomes.",
            9: "Bold decisions and purposeful action bring visible achievements."
        };

        var monthIndex = validDate ? parsedDate.getMonth() : 3;
        var reportYear = validDate ? parsedDate.getFullYear() : new Date().getFullYear();
        var resolvedNakshatra = (rashiProfile && (rashiProfile.nakshatra || (Array.isArray(rashiProfile.nakshatras) && rashiProfile.nakshatras.length)))
            ? (pickPrimaryNakshatra(rashiProfile.nakshatra) || pickPrimaryNakshatra(rashiProfile.nakshatras) || (nakshatraByNumber[lifePath] || "Ashwini"))
            : (nakshatraByNumber[lifePath] || "Ashwini");
        var resolvedRashi = (rashiProfile && rashiProfile.rashi_en)
            ? rashiProfile.rashi_en
            : getRashiFromMonth(monthIndex);
        var resolvedNakshatraHi = (typeof window.localizeNakshatraForHindi === "function")
            ? window.localizeNakshatraForHindi(resolvedNakshatra)
            : resolvedNakshatra;
        var resolvedRashiHi = (typeof window.localizeRashiForHindi === "function")
            ? window.localizeRashiForHindi(resolvedRashi)
            : resolvedRashi;
        var activeLang = (function () {
            try {
                return localStorage.getItem("language") === "en" ? "en" : "hi";
            } catch (_langErr) {
                return "hi";
            }
        })();

        var preferredHindi = "";
        if (typeof window.getHindiNameForFullName === "function") {
            preferredHindi = window.getHindiNameForFullName(cleanName) || "";
        }
        if (!preferredHindi && typeof window.normalizeHindiNameOutput === "function") {
            preferredHindi = window.normalizeHindiNameOutput(cleanName);
        }
        if (!preferredHindi && typeof window.getHindiName === "function") {
            preferredHindi = window.getHindiName(cleanName) || "";
        }

        var genderToken = normalizeBabyGender(genderValue);
        var genderLabel = genderToken === "girl" ? "Baby Girl" : "Baby Boy";

        return {
            name: cleanName,
            name_en: cleanName,
            name_hi: preferredHindi,
            report_design: normalizeReportDesign(designValue),
            meaning_en: cleanName + " reflects clarity, grace, and a confident identity.",
            gender: genderLabel,
            origin_en: "Indian / Sanskrit",
            nakshatra: activeLang === "hi" ? resolvedNakshatraHi : resolvedNakshatra,
            nakshatra_en: resolvedNakshatra,
            nakshatra_hi: resolvedNakshatraHi,
            rashi: activeLang === "hi" ? resolvedRashiHi : resolvedRashi,
            rashi_en: resolvedRashi,
            rashi_hi: resolvedRashiHi,
            num: String(lifePath),
            planet_en: planetByNumber[lifePath] || "Sun",
            color_en: colorByNumber[lifePath] || "Golden",
            phal_en: auraByNumber[lifePath] || auraByNumber[1],
            rashiphal_en: predictionByNumber[lifePath] || predictionByNumber[1],
            year: reportYear,
            dob_iso: validDate ? String(dobValue) : "",
            dob_display: formatDobDisplay(validDate ? String(dobValue) : ""),
            portrait_gender: genderToken,
            portrait_image: photoImage || null
        };
    }

    function setStatus(el, message, type) {
        if (!el) return;
        el.textContent = message || "";
        el.classList.remove("error", "success");
        if (type) el.classList.add(type);
    }

    async function isLoggedInForDownload() {
        var optimistic = false;
        try {
            optimistic = localStorage.getItem(AUTH_STORAGE_KEY) === "true";
        } catch (_e) {
            optimistic = false;
        }

        var authClient = null;
        try {
            authClient = window.__naaminSupabaseClient;
        } catch (_e2) {
            authClient = null;
        }

        // Wait briefly for module navbar-auth to expose the client.
        if (!authClient || !authClient.auth || typeof authClient.auth.getSession !== "function") {
            for (var i = 0; i < 15; i += 1) {
                await sleep(120);
                try {
                    authClient = window.__naaminSupabaseClient;
                } catch (_e3) {
                    authClient = null;
                }
                if (authClient && authClient.auth && typeof authClient.auth.getSession === "function") break;
            }
        }

        if (!authClient || !authClient.auth || typeof authClient.auth.getSession !== "function") {
            return optimistic;
        }

        try {
            var result = await authClient.auth.getSession();
            var hasSession = Boolean(result && result.data && result.data.session && result.data.session.user);
            try {
                localStorage.setItem(AUTH_STORAGE_KEY, hasSession ? "true" : "false");
            } catch (_storageWriteError) {
                // Ignore storage edge cases.
            }
            return hasSession;
        } catch (_sessionError) {
            try {
                localStorage.setItem(AUTH_STORAGE_KEY, optimistic ? "true" : "false");
            } catch (_storageResetError) {
                // Ignore storage edge cases.
            }
            return optimistic;
        }
    }

    async function exportReportPdf(reportData, filenameBase) {
        if (typeof window.createReportCanvas !== "function") {
            throw new Error("Report renderer unavailable. Please refresh and try again.");
        }

        if (typeof window.ensureJsPdf !== "function") {
            throw new Error("PDF module unavailable. Please refresh and try again.");
        }

        var canvas = window.createReportCanvas(reportData);
        var jsPDFCtor = await window.ensureJsPdf();
        var pdf = new jsPDFCtor({
            orientation: canvas.width >= canvas.height ? "landscape" : "portrait",
            unit: "px",
            format: [canvas.width, canvas.height],
            compress: true
        });

        var imageData = canvas.toDataURL("image/png", 1.0);
        pdf.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height, undefined, "FAST");

        var pdfFilename = filenameBase + ".pdf";
        var saved = false;

        if (typeof window.savePdfWithFilename === "function") {
            saved = await window.savePdfWithFilename(pdf, pdfFilename);
        } else {
            try {
                pdf.save(pdfFilename);
                saved = true;
            } catch (_saveErr) {
                saved = false;
            }
        }

        if (!saved && typeof window.triggerBlobDownload === "function") {
            try {
                var pdfBlob = pdf.output("blob");
                saved = window.triggerBlobDownload(pdfBlob, pdfFilename);
            } catch (_blobErr) {
                saved = false;
            }
        }

        if (!saved) {
            if (typeof window.downloadCanvasAsPng === "function") {
                await window.downloadCanvasAsPng(canvas, filenameBase);
                return "png";
            }
            throw new Error("Download failed. Please try again.");
        }

        return "pdf";
    }

    function initInstantDownload() {
        var form = byId("report-download-form");
        if (!form) return;

        var nameInput = byId("report-download-name");
        var dobInput = byId("report-download-dob");
        var genderInput = byId("report-download-gender");
        var photoInput = byId("report-download-photo");
        var designInput = byId("report-download-design");
        var downloadBtn = byId("report-download-btn");
        var statusEl = byId("report-download-status");
        var previewImage = byId("report-page-preview-image");

        if (!nameInput || !dobInput || !downloadBtn || !statusEl) return;

        var params = new URLSearchParams(window.location.search || "");
        var queryName = params.get("name") || "";
        var queryDob = params.get("dob") || "";
        var queryDesign = params.get("design") || "";

        if (queryName) {
            nameInput.value = toTitleCase(queryName);
        }

        if (queryDob && /^\d{4}-\d{2}-\d{2}$/.test(queryDob)) {
            dobInput.value = queryDob;
        }
        if (designInput) {
            designInput.value = normalizeReportDesign(queryDesign || designInput.value);
        }
        if (genderInput && params.get("gender")) {
            genderInput.value = normalizeBabyGender(params.get("gender"));
        }

        if (queryName || queryDob) {
            setStatus(statusEl, "Details prefilled. Click Download Report PDF.", null);
        }

        var previewRenderToken = 0;
        var previewDebounceTimer = null;
        async function renderLivePreview() {
            if (!previewImage || typeof window.createReportCanvas !== "function") return;
            var token = ++previewRenderToken;
            try {
                var genderToken = genderInput ? normalizeBabyGender(genderInput.value) : "boy";
                var photoFile = photoInput && photoInput.files ? photoInput.files[0] : null;
                var photoImg = await getPortraitImageFromFile(photoFile);

                var reportData = await buildReportData(
                    sanitizeName(nameInput.value),
                    dobInput.value,
                    designInput ? normalizeReportDesign(designInput.value) : "design-1",
                    genderToken,
                    photoImg
                );
                if (token !== previewRenderToken) return;
                var canvas = window.createReportCanvas(reportData);
                previewImage.src = canvas.toDataURL("image/png", 0.92);
            } catch (_previewErr) {
                if (token !== previewRenderToken) return;
                previewImage.removeAttribute("src");
            }
        }

        function queuePreviewRender() {
            if (!previewImage) return;
            if (previewDebounceTimer) {
                clearTimeout(previewDebounceTimer);
            }
            previewDebounceTimer = setTimeout(function () {
                previewDebounceTimer = null;
                renderLivePreview();
            }, 120);
        }

        nameInput.addEventListener("input", queuePreviewRender);
        dobInput.addEventListener("input", queuePreviewRender);
        if (genderInput) genderInput.addEventListener("change", queuePreviewRender);
        if (photoInput) photoInput.addEventListener("change", queuePreviewRender);
        if (designInput) designInput.addEventListener("change", queuePreviewRender);
        queuePreviewRender();

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            var loggedIn = await isLoggedInForDownload();
            if (!loggedIn) {
                setStatus(
                    statusEl,
                    t(
                        "Please log in to download the report. Redirecting to login...",
                        "रिपोर्ट डाउनलोड करने के लिए लॉग इन करें। लॉगिन पेज खोल रहे हैं..."
                    ),
                    "error"
                );
                try {
                    var loginUrl = new URL("login.html", window.location.href);
                    var redirectTarget = window.location.pathname + window.location.search + "#instant-report";
                    loginUrl.searchParams.set("redirect", redirectTarget);
                    setTimeout(function () {
                        window.location.assign(loginUrl.toString());
                    }, 650);
                } catch (_redirectErr) {
                    // ignore redirect errors
                }
                return;
            }

            var cleanName = sanitizeName(nameInput.value);
            var dobValue = dobInput.value;
            var genderToken = genderInput ? normalizeBabyGender(genderInput.value) : "boy";
            var photoFile = photoInput && photoInput.files ? photoInput.files[0] : null;
            var designValue = designInput ? normalizeReportDesign(designInput.value) : "design-1";

            if (!cleanName) {
                setStatus(statusEl, "Please enter a valid name.", "error");
                nameInput.focus();
                return;
            }
            if (!dobValue) {
                setStatus(statusEl, "Please enter date of birth so it appears in the PDF report.", "error");
                dobInput.focus();
                return;
            }

            var originalHtml = downloadBtn.innerHTML;
            downloadBtn.disabled = true;
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Preparing...';
            setStatus(statusEl, "Generating your report...", null);

            try {
                var photoImg = await getPortraitImageFromFile(photoFile);
                if (photoFile && !photoImg) {
                    setStatus(
                        statusEl,
                        t(
                            "Could not use the uploaded photo. Using an auto-generated baby avatar in the PDF.",
                            "अपलोड की गई फोटो उपयोग नहीं हो सकी। PDF में ऑटो-जनरेटेड बेबी अवतार इस्तेमाल हो रहा है।"
                        ),
                        null
                    );
                }

                var reportData = await buildReportData(cleanName, dobValue, designValue, genderToken, photoImg);
                var safeToken = (typeof window.sanitizeFileToken === "function")
                    ? window.sanitizeFileToken(reportData.name || cleanName)
                    : cleanName.replace(/[^\w-]+/g, "_");
                var filenameBase = "Naamin_" + safeToken + "_Report";

                var format = await exportReportPdf(reportData, filenameBase);
                if (format === "pdf") {
                    setStatus(statusEl, "Report downloaded successfully as PDF.", "success");
                } else {
                    setStatus(statusEl, "PDF unavailable, downloaded as PNG image.", "success");
                }
            } catch (error) {
                console.error("Instant report download failed:", error);
                setStatus(statusEl, (error && error.message) ? error.message : "Failed to download report.", "error");
            } finally {
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = originalHtml;
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initInstantDownload, { once: true });
    } else {
        initInstantDownload();
    }
})();
