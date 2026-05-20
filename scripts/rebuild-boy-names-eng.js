// Rebuild boy_names_eng.json from the Hindi dataset by romanizing Devanagari.
// This fixes English mode showing Hindi-script names.
const fs = require("fs");
const path = require("path");

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
    "ऑ": "o",
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
    "ज्ञ": "gy",
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
    "ॉ": "o",
  });
  const specials = Object.freeze({
    "ं": "n",
    "ः": "h",
    "ँ": "n",
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

function main() {
  const root = path.resolve(__dirname, "..");
  const srcPath = path.join(root, "boy_names_hin.json");
  const outPath = path.join(root, "boy_names_eng.json");

  const raw = fs.readFileSync(srcPath, "utf8").replace(/^\uFEFF/, "");
  const list = JSON.parse(raw);
  if (!Array.isArray(list)) {
    throw new Error("boy_names_hin.json must be an array");
  }

  const seen = new Set();
  const rebuilt = [];

  list.forEach((item) => {
    const nameHi = String((item && item.name) || "").trim();
    if (!nameHi) return;

    const nameEn = transliterateHindiToLatin(nameHi);
    if (!nameEn || nameEn.length < 2) return;

    const key = nameEn.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    const meaningHi = String((item && item.meaning) || "").trim();
    const meaningEn = meaningHi && /[\u0900-\u097F]/.test(meaningHi) ? transliterateHindiToLatin(meaningHi) : meaningHi;

    rebuilt.push({
      name: nameEn,
      hindiName: nameHi,
      meaning: meaningEn || "Meaning not available",
      meaning_hi: meaningHi || "",
    });
  });

  fs.writeFileSync(outPath, JSON.stringify(rebuilt, null, 4) + "\n", "utf8");
  console.log("Rebuilt", outPath, "items:", rebuilt.length);
}

main();

