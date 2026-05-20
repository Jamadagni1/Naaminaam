// Import name meanings (and optional rashi) from Google Docs exported text.
// Usage:
//   node scripts/import-gdocs-names.js <docUrlOrId> <docUrlOrId>
//
// Notes:
// - The Google Docs must be shared publicly ("Anyone with the link can view"),
//   otherwise the export will return a login page and this script will fail.
// - This updates existing datasets in-place:
//     boy_names_eng.json, girl_names_eng.json, boy_names_hin.json, girl_names_hi.json
//
// Expected doc formats (any of these):
// - "Name - Meaning"
// - "Name: Meaning"
// - "Name\tMeaning\tRashi"
// - "Name | Meaning | Rashi"

const fs = require("fs");
const path = require("path");

function extractDocId(input) {
  const raw = String(input || "").trim();
  if (!raw) return "";
  if (/^[a-zA-Z0-9_-]{20,}$/.test(raw)) return raw;
  const m = raw.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : "";
}

function normalizeLine(line) {
  return String(line || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDocText(txt) {
  const lines = String(txt || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((l) => String(l).trimEnd());

  const records = [];
  let currentName = "";

  for (const rawLine of lines) {
    const line = normalizeLine(rawLine);
    if (!line) continue;
    if (/^(name|names)\b/i.test(line)) continue;
    if (/^(rashi|rashis)\b/i.test(line)) continue;
    if (/^tab\s*\d+/i.test(line)) continue;
    if (line.length < 3) continue;

    // Block format (Hindi):
    //   <NAME>
    //   1. अर्थ ...<MEANING>
    //   3. राशि ...<RASHI>
    if (!/^\d+\./.test(line) && /[\u0900-\u097F]/.test(line) && line.length <= 40) {
      currentName = line;
      continue;
    }

    if (currentName && /^\d+\./.test(line) && /[\u0900-\u097F]/.test(line)) {
      const isMeaningLine = /^1\.\s*/.test(line) && /अर्थ/.test(line);
      const isRashiLine = /^3\.\s*/.test(line) && /राशि/.test(line);
      if (isMeaningLine || isRashiLine) {
        const parts = line.split(/\.{3,}|…{1,}/).map((p) => normalizeLine(p)).filter(Boolean);
        const tail = parts.length ? parts[parts.length - 1] : "";
        const rec = records.find((r) => r.name === currentName) || null;
        if (isMeaningLine) {
          if (rec) rec.meaning = tail || rec.meaning;
          else records.push({ name: currentName, meaning: tail, rashi: "" });
        }
        if (isRashiLine) {
          if (rec) rec.rashi = tail || rec.rashi;
          else records.push({ name: currentName, meaning: "", rashi: tail });
        }
      }
      continue;
    }

    // Prefer tab-separated columns when present in exported text.
    const tabParts = rawLine.split("\t").map((p) => normalizeLine(p)).filter(Boolean);
    if (tabParts.length >= 2) {
      const name = tabParts[0];
      const meaning = tabParts[1];
      const rashi = tabParts[2] || "";
      if (name && meaning) records.push({ name, meaning, rashi });
      continue;
    }

    // Common separators.
    const separators = [" - ", " — ", " – ", " | ", " : ", ": ", " -", "- "];
    let picked = null;
    for (const sep of separators) {
      const idx = line.indexOf(sep);
      if (idx > 0 && idx < line.length - sep.length) {
        picked = { sep, idx };
        break;
      }
    }
    if (!picked) continue;

    const name = normalizeLine(line.slice(0, picked.idx));
    const rest = normalizeLine(line.slice(picked.idx + picked.sep.length));
    if (!name || !rest) continue;

    // Optional rashi in parentheses at end: "Meaning ... (Aries)"
    let meaning = rest;
    let rashi = "";
    const r = rest.match(/\(([^()]{2,40})\)\s*$/);
    if (r) {
      rashi = normalizeLine(r[1]);
      meaning = normalizeLine(rest.slice(0, rest.length - r[0].length));
    }

    if (name && meaning) records.push({ name, meaning, rashi });
  }

  return records;
}

function transliterateHindiToLatin(rawValue) {
  const text = String(rawValue || "").trim();
  if (!text) return "";
  if (!/[\u0900-\u097F]/.test(text)) return text;

  const independentVowels = Object.freeze({
    "अ": "a",
    "आ": "aa",
    "इ": "i",
    "ई": "ee",
    "उ": "u",
    "ऊ": "oo",
    "ऋ": "ri",
    "ए": "e",
    "ऐ": "ai",
    "ओ": "o",
    "औ": "au",
    "ऑ": "o"
  });
  const consonants = Object.freeze({
    "क": "k",
    "ख": "kh",
    "ग": "g",
    "घ": "gh",
    "ङ": "ng",
    "च": "ch",
    "छ": "chh",
    "ज": "j",
    "झ": "jh",
    "ञ": "ny",
    "ट": "t",
    "ठ": "th",
    "ड": "d",
    "ढ": "dh",
    "ण": "n",
    "त": "t",
    "थ": "th",
    "द": "d",
    "ध": "dh",
    "न": "n",
    "प": "p",
    "फ": "ph",
    "ब": "b",
    "भ": "bh",
    "म": "m",
    "य": "y",
    "र": "r",
    "ल": "l",
    "व": "v",
    "श": "sh",
    "ष": "sh",
    "स": "s",
    "ह": "h",
    "ळ": "l",
    "क्ष": "ksh",
    "त्र": "tr",
    "ज्ञ": "gy"
  });
  const matras = Object.freeze({
    "ा": "aa",
    "ि": "i",
    "ी": "ee",
    "ु": "u",
    "ू": "oo",
    "ृ": "ri",
    "े": "e",
    "ै": "ai",
    "ो": "o",
    "ौ": "au",
    "ॅ": "e",
    "ॉ": "o"
  });
  const specials = Object.freeze({
    "ं": "n",
    "ः": "h",
    "ँ": "n"
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
    if (/\s/.test(ch)) out += " ";
  }

  return out.replace(/\s+/g, " ").trim();
}

async function fetchDocText(docId) {
  const url = `https://docs.google.com/document/d/${docId}/export?format=txt`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`Failed to download doc ${docId}: ${res.status}`);
  }
  const text = await res.text();
  try {
    const cacheDir = path.resolve(__dirname, "_gdocs_cache");
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(path.join(cacheDir, `${docId}.txt`), text, "utf8");
  } catch (_e) {
    // ignore cache write issues
  }
  // Basic guard for login page / blocked export.
  if (/accounts\.google\.com|Sign in|ServiceLogin/i.test(text) && text.length > 2000) {
    throw new Error(
      `Doc ${docId} is not publicly accessible. Share it as "Anyone with the link can view", then retry.`
    );
  }
  return text;
}

function buildMap(records) {
  const map = new Map();
  records.forEach((rec) => {
    const key = String(rec.name || "").trim().toLowerCase();
    if (!key) return;
    const meaning = String(rec.meaning || "").trim();
    const rashi = String(rec.rashi || "").trim();
    if (!meaning) return;
    map.set(key, { meaning, rashi });
  });
  return map;
}

function applyToDataset(items, map) {
  let updated = 0;
  (Array.isArray(items) ? items : []).forEach((it) => {
    if (!it) return;
    const keys = [];
    if (it.name) keys.push(String(it.name).trim().toLowerCase());
    if (it.hindiName) keys.push(String(it.hindiName).trim().toLowerCase());
    const next = keys.map((k) => map.get(k)).find(Boolean) || null;
    if (!next) return;
    const meaning = String(next.meaning || "").trim();
    if (!meaning) return;
    const isDev = /[\u0900-\u097F]/.test(meaning);
    const meaningEn = isDev ? transliterateHindiToLatin(meaning) : meaning;

    if (isDev) {
      if (String(it.meaning_hi || "").trim() !== meaning) {
        it.meaning_hi = meaning;
        updated += 1;
      }
      if (meaningEn && String(it.meaning || "").trim() !== meaningEn) {
        it.meaning = meaningEn;
        updated += 1;
      }
    } else if (String(it.meaning || "").trim() !== meaningEn) {
      it.meaning = meaningEn;
      updated += 1;
    }
    if (next.rashi) {
      it.rashi = next.rashi;
    }
  });
  return updated;
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 4) + "\n", "utf8");
}

async function main() {
  const inputs = process.argv.slice(2).filter(Boolean);
  if (inputs.length < 1) {
    console.error("Usage: node scripts/import-gdocs-names.js <docUrlOrId> <docUrlOrId>");
    process.exit(1);
  }

  const ids = inputs.map(extractDocId).filter(Boolean);
  if (!ids.length) {
    console.error("No valid Google Doc IDs found in args.");
    process.exit(1);
  }

  const allRecords = [];
  for (const id of ids) {
    const txt = await fetchDocText(id);
    const recs = parseDocText(txt);
    allRecords.push(...recs);
    console.log(`Parsed doc ${id}: ${recs.length} rows`);
  }

  const map = buildMap(allRecords);
  console.log(`Total unique names parsed: ${map.size}`);

  const root = path.resolve(__dirname, "..");
  const targets = [
    path.join(root, "boy_names_eng.json"),
    path.join(root, "girl_names_eng.json"),
    path.join(root, "boy_names_hin.json"),
    path.join(root, "girl_names_hi.json")
  ].filter((p) => fs.existsSync(p));

  let totalUpdated = 0;
  targets.forEach((filePath) => {
    const list = readJson(filePath);
    const changed = applyToDataset(list, map);
    totalUpdated += changed;
    if (changed) {
      writeJson(filePath, list);
    }
    console.log(`${path.basename(filePath)} updated: ${changed}`);
  });

  console.log(`Done. Total updated rows: ${totalUpdated}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
