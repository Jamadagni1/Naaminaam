(function () {
  function getLang() {
    try {
      return localStorage.getItem("language") === "hi" ? "hi" : "en";
    } catch (_e) {
      return "en";
    }
  }

  function readTrendingDb() {
    try {
      const raw = localStorage.getItem("naamin_trending_v1");
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_e) {
      return {};
    }
  }

  function score(rec) {
    const views = Number(rec && rec.views || 0) || 0;
    const fav = Number(rec && rec.favorites || 0) || 0;
    const last = Number(rec && rec.last || 0) || 0;
    const ageDays = last ? ((Date.now() - last) / (1000 * 60 * 60 * 24)) : 999;
    const recencyBoost = Math.max(0, 7 - ageDays); // last 7 days only
    return views + fav * 3 + recencyBoost;
  }

  function ensureStyles() {
    if (document.getElementById("home-trending-style")) return;
    const style = document.createElement("style");
    style.id = "home-trending-style";
    style.textContent = `
      .home-trending-grid{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:12px}
      .home-trending-chip{display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:999px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.95);text-decoration:none;font-weight:900;letter-spacing:0.2px}
      .home-trending-chip:hover{background:rgba(255,255,255,0.1)}
      .home-trending-meta{display:inline-flex;gap:6px;align-items:center;color:rgba(255,255,255,0.7);font-weight:800;font-size:12px}
      .home-trending-empty{color:rgba(255,255,255,0.75);text-align:center;margin-top:10px}
    `;
    document.head.appendChild(style);
  }

  function render() {
    const wrap = document.getElementById("home-trending-wrap");
    if (!wrap) return;
    ensureStyles();

    const lang = getLang();
    const db = readTrendingDb();
    const names = Object.keys(db || {})
      .map((name) => ({ name, rec: db[name], s: score(db[name]) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
      .slice(0, 12);

    if (names.length === 0) {
      wrap.innerHTML = `<div class="home-trending-empty">${lang === "hi"
        ? "अभी ट्रेंडिंग डेटा नहीं है। किसी नाम के विवरण खोलें या सेव करें, फिर यहाँ दिखेगा।"
        : "No trending data yet. Open a name details page or save a name to see it here."}</div>`;
      return;
    }

    const grid = document.createElement("div");
    grid.className = "home-trending-grid";

    names.forEach((item) => {
      const views = Number(item.rec && item.rec.views || 0) || 0;
      const fav = Number(item.rec && item.rec.favorites || 0) || 0;
      const chip = document.createElement("a");
      chip.className = "home-trending-chip notranslate";
      chip.setAttribute("translate", "no");
      chip.setAttribute("lang", "en");
      chip.href = `name.html?name=${encodeURIComponent(item.name)}&gender=boy`;
      chip.innerHTML = `
        <span>${item.name}</span>
        <span class="home-trending-meta">
          <i class="fas fa-eye" aria-hidden="true"></i> ${views}
          <i class="fas fa-heart" aria-hidden="true"></i> ${fav}
        </span>
      `;
      grid.appendChild(chip);
    });

    wrap.innerHTML = "";
    wrap.appendChild(grid);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render, { once: true });
  } else {
    render();
  }

  document.addEventListener("favoritesUpdated", () => render());
  document.addEventListener("languageChanged", () => render());
})();

