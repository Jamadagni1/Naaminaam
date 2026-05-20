(function () {
  function byId(id) {
    return document.getElementById(id);
  }

  function setStatus(message) {
    var el = byId("ac-status");
    if (!el) return;
    el.textContent = message || "";
  }

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      if (!file) return resolve("");
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error("Failed to read photo")); };
      reader.onload = function () { resolve(String(reader.result || "")); };
      reader.readAsDataURL(file);
    });
  }

  function loadImage(dataUrl) {
    return new Promise(function (resolve) {
      if (!dataUrl) return resolve(null);
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = dataUrl;
    });
  }

  function wrapLines(ctx, text, maxWidth) {
    var raw = String(text || "").replace(/\s+/g, " ").trim();
    if (!raw) return [];
    var words = raw.split(" ").filter(Boolean);
    var lines = [];
    var current = "";
    for (var i = 0; i < words.length; i += 1) {
      var next = current ? (current + " " + words[i]) : words[i];
      if (ctx.measureText(next).width <= maxWidth) current = next;
      else {
        if (current) lines.push(current);
        current = words[i];
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  function drawIcon(ctx, cx, cy, size, type) {
    if (type === "none") return;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = Math.max(2, size * 0.06);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    if (type === "star") {
      var spikes = 5;
      var outer = size;
      var inner = size * 0.45;
      var rot = Math.PI / 2 * 3;
      var x = 0;
      var y = 0;
      ctx.beginPath();
      ctx.moveTo(0, -outer);
      for (var i = 0; i < spikes; i += 1) {
        x = Math.cos(rot) * outer;
        y = Math.sin(rot) * outer;
        ctx.lineTo(x, y);
        rot += Math.PI / spikes;
        x = Math.cos(rot) * inner;
        y = Math.sin(rot) * inner;
        ctx.lineTo(x, y);
        rot += Math.PI / spikes;
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
      return;
    }

    // heart
    var s = size;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.22);
    ctx.bezierCurveTo(s * 0.55, -s * 0.28, s * 0.92, s * 0.10, 0, s * 0.74);
    ctx.bezierCurveTo(-s * 0.92, s * 0.10, -s * 0.55, -s * 0.28, 0, s * 0.22);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  async function render() {
    var canvas = byId("ac-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var icon = (byId("ac-title") && byId("ac-title").value) ? String(byId("ac-title").value) : "heart";
    var line1 = byId("ac-line1") ? byId("ac-line1").value : "";
    var line2 = byId("ac-line2") ? byId("ac-line2").value : "";
    var line3 = byId("ac-line3") ? byId("ac-line3").value : "";
    var signoff = byId("ac-signoff") ? byId("ac-signoff").value : "";
    var names = byId("ac-names") ? byId("ac-names").value : "";
    var photoInput = byId("ac-photo");
    var photoFile = photoInput && photoInput.files ? photoInput.files[0] : null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // white paper + gentle grain
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.globalAlpha = 0.05;
    for (var i = 0; i < 900; i += 1) {
      var x = Math.random() * canvas.width;
      var y = Math.random() * canvas.height;
      var r = Math.random() * 1.8;
      ctx.fillStyle = (i % 2 === 0) ? "#000" : "#888";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // top icon
    drawIcon(ctx, canvas.width / 2, 120, 24, icon);

    // optional photo (small, subtle)
    var photoDataUrl = "";
    try {
      photoDataUrl = photoFile ? await readFileAsDataUrl(photoFile) : "";
    } catch (_e) {
      photoDataUrl = "";
    }
    var photoImg = photoDataUrl ? await loadImage(photoDataUrl) : null;
    if (photoImg) {
      var pw = 170;
      var ph = 170;
      var px = (canvas.width - pw) / 2;
      var py = 170;
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, py + (ph / 2), pw / 2, 0, Math.PI * 2);
      ctx.clip();
      var scale = Math.max(pw / photoImg.naturalWidth, ph / photoImg.naturalHeight);
      var dw = photoImg.naturalWidth * scale;
      var dh = photoImg.naturalHeight * scale;
      ctx.drawImage(photoImg, canvas.width / 2 - dw / 2, py + ph / 2 - dh / 2, dw, dh);
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, py + (ph / 2), pw / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // text block
    var maxWidth = 820;
    var startY = photoImg ? 390 : 250;
    var cx = canvas.width / 2;

    ctx.fillStyle = "#151515";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    ctx.font = "500 32px Lora, Georgia, serif";
    var para1 = wrapLines(ctx, line1, maxWidth);
    para1.forEach(function (ln, idx) {
      ctx.fillText(ln, cx, startY + idx * 44);
    });
    var y = startY + Math.max(1, para1.length) * 44 + 24;

    ctx.font = "500 32px Lora, Georgia, serif";
    var para2 = wrapLines(ctx, line2, maxWidth);
    para2.forEach(function (ln, idx) {
      ctx.fillText(ln, cx, y + idx * 44);
    });
    y += Math.max(1, para2.length) * 44 + 40;

    ctx.font = "500 30px Lora, Georgia, serif";
    var para3 = wrapLines(ctx, line3, maxWidth);
    para3.forEach(function (ln, idx) {
      ctx.fillText(ln, cx, y + idx * 42);
    });
    y += Math.max(1, para3.length) * 42 + 54;

    ctx.font = "500 30px Lora, Georgia, serif";
    if (signoff) ctx.fillText(String(signoff).trim(), cx, y);
    y += 44;

    ctx.font = "600 32px Lora, Georgia, serif";
    if (names) ctx.fillText(String(names).trim(), cx, y);

    ctx.textAlign = "left";
  }

  function downloadCanvas(canvas, filename) {
    var a = document.createElement("a");
    a.download = filename;
    a.href = canvas.toDataURL("image/png", 1.0);
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function boot() {
    var canvas = byId("ac-canvas");
    var downloadBtn = byId("ac-download");
    if (!canvas || !downloadBtn) return;

    var inputs = ["ac-title", "ac-line1", "ac-line2", "ac-line3", "ac-signoff", "ac-names", "ac-photo"]
      .map(byId)
      .filter(Boolean);

    var timer = null;
    function queue() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        timer = null;
        render().catch(function () { });
      }, 80);
    }

    inputs.forEach(function (el) {
      el.addEventListener("input", queue);
      el.addEventListener("change", queue);
    });

    downloadBtn.addEventListener("click", function () {
      try {
        setStatus("");
        downloadCanvas(canvas, "naamin_announcement_card.png");
        setStatus("Downloaded.");
      } catch (_e) {
        setStatus("Download failed. Please try again.");
      }
    });

    render().catch(function () { });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();

