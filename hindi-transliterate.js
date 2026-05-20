// Universal English-to-Hindi transliteration for names (UTF-safe)
(function () {
  function transliterateName(rawName) {
    if (!rawName) return "";

    const base = String(rawName).trim();
    if (!base) return "";

    const preciseMapping = Object.freeze({
      aarav: "\u0906\u0930\u0935",
      aditya: "\u0906\u0926\u093f\u0924\u094d\u092f",
      arjun: "\u0905\u0930\u094d\u091c\u0941\u0928",
      aryan: "\u0906\u0930\u094d\u092f\u0928",
      ayaan: "\u0905\u092f\u093e\u0928",
      aahan: "\u0906\u0939\u093e\u0928",
      aarush: "\u0906\u0930\u0941\u0937",
      anay: "\u0905\u0928\u092f",
      arnav: "\u0905\u0930\u094d\u0928\u0935",
      avik: "\u0905\u0935\u093f\u0915",
      dhruv: "\u0927\u094d\u0930\u0941\u0935",
      harsh: "\u0939\u0930\u094d\u0937",
      ishan: "\u0908\u0936\u093e\u0928",
      ishaan: "\u0908\u0936\u093e\u0928",
      karan: "\u0915\u0930\u0923",
      krishna: "\u0915\u0943\u0937\u094d\u0923",
      om: "\u0950",
      pranav: "\u092a\u094d\u0930\u0923\u0935",
      rohan: "\u0930\u094b\u0939\u0928",
      rahul: "\u0930\u093e\u0939\u0941\u0932",
      sahil: "\u0938\u093e\u0939\u093f\u0932",
      shiv: "\u0936\u093f\u0935",
      vihaan: "\u0935\u093f\u0939\u093e\u0928",
      yash: "\u092f\u0936",
      ananya: "\u0905\u0928\u0928\u094d\u092f\u093e",
      aisha: "\u0906\u092f\u0936\u093e",
      aditi: "\u0905\u0926\u093f\u0924\u093f",
      diya: "\u0926\u093f\u092f\u093e",
      isha: "\u0908\u0936\u093e",
      kavya: "\u0915\u093e\u0935\u094d\u092f\u093e",
      prisha: "\u092a\u094d\u0930\u093f\u0936\u093e",
      vrinda: "\u0935\u0943\u0902\u0926\u093e",
      vriinda: "\u0935\u0943\u0902\u0926\u093e",
      vrindaa: "\u0935\u0943\u0902\u0926\u093e"
    });

    const words = base.split(/\s+/).filter(Boolean);

    const transliterateWord = (rawWord) => {
      const word = rawWord.toLowerCase().replace(/[^a-z]/g, "");
      if (!word) return rawWord;
      if (preciseMapping[word]) return preciseMapping[word];

      const consonants = Object.freeze({
        ksh: "\u0915\u094d\u0937", shr: "\u0936\u094d\u0930", chh: "\u091b", kh: "\u0916", gh: "\u0918", ch: "\u091a", jh: "\u091d", th: "\u0925",
        dh: "\u0927", ph: "\u092b", bh: "\u092d", sh: "\u0936", ng: "\u0919", ny: "\u091e", k: "\u0915", g: "\u0917", j: "\u091c",
        t: "\u0924", d: "\u0926", n: "\u0928", p: "\u092a", b: "\u092c", m: "\u092e", y: "\u092f", r: "\u0930", l: "\u0932",
        v: "\u0935", w: "\u0935", s: "\u0938", h: "\u0939", f: "\u092b", z: "\u095b", q: "\u0915", x: "\u0915\u094d\u0938"
      });

      const vowelData = Object.freeze({
        aa: { ind: "\u0906", matra: "\u093e" }, ai: { ind: "\u0910", matra: "\u0948" }, au: { ind: "\u0914", matra: "\u094c" },
        ee: { ind: "\u0908", matra: "\u0940" }, ii: { ind: "\u0908", matra: "\u0940" }, oo: { ind: "\u090a", matra: "\u0942" },
        ou: { ind: "\u0914", matra: "\u094c" }, ri: { ind: "\u090b", matra: "\u0943" },
        a: { ind: "\u0905", matra: "" }, i: { ind: "\u0907", matra: "\u093f" }, u: { ind: "\u0909", matra: "\u0941" },
        e: { ind: "\u090f", matra: "\u0947" }, o: { ind: "\u0913", matra: "\u094b" }
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
          if (nextC) out += cChar + "\u094d";
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
        .replace(/\u0928\u094d(?=[\u0926\u0927\u091f\u0924\u0915\u0917\u092a\u092c\u091a\u091c])/g, "\u0902")
        .replace(/\u092e\u094d(?=[\u092a\u092c])/g, "\u0902");

      return out || rawWord;
    };

    return words.map(transliterateWord).join(" ");
  }

  window.getHindiName = transliterateName;
})();
