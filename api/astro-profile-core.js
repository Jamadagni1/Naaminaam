'use strict';

const RASHI_MAP = [
  {
    rashi_en: 'Aries (Mesha)',
    rashi_hi: 'मेष (Aries)',
    letters: ['chu', 'che', 'cho', 'la', 'li', 'lu', 'le', 'lo', 'l', 'aa', 'a'],
    nakshatras: ['Ashwini', 'Bharani', 'Krittika'],
    phal_en: 'Courageous, energetic, and leadership-driven.',
    phal_hi: 'साहसी, ऊर्जावान और नेतृत्व क्षमता वाला।',
    rashiphal_en: 'Growth comes through initiative and disciplined action.',
    rashiphal_hi: 'अनुशासित प्रयास और पहल से प्रगति के योग बनते हैं।'
  },
  {
    rashi_en: 'Taurus (Vrishabh)',
    rashi_hi: 'वृषभ (Taurus)',
    letters: ['ve', 'vo', 'va', 'vi', 'vu', 'v', 'w', 'i', 'ee', 'u', 'oo', 'e', 'o'],
    nakshatras: ['Krittika', 'Rohini', 'Mrigashira'],
    phal_en: 'Calm, practical, and reliability-focused.',
    phal_hi: 'शांत, व्यावहारिक और भरोसेमंद स्वभाव।',
    rashiphal_en: 'Stable progress with strong support in relationships.',
    rashiphal_hi: 'रिश्तों के सहयोग से स्थिर प्रगति के संकेत मिलते हैं।'
  },
  {
    rashi_en: 'Gemini (Mithun)',
    rashi_hi: 'मिथुन (Gemini)',
    letters: ['ka', 'ki', 'ku', 'ke', 'ko', 'k', 'q', 'gh', 'ng', 'ch', 'ha', 'h'],
    nakshatras: ['Mrigashira', 'Ardra', 'Punarvasu'],
    phal_en: 'Expressive, intelligent, and adaptable.',
    phal_hi: 'अभिव्यक्तिशील, बुद्धिमान और अनुकूलनशील।',
    rashiphal_en: 'Learning and communication open new opportunities.',
    rashiphal_hi: 'सीखने और संचार से नए अवसर प्राप्त होते हैं।'
  },
  {
    rashi_en: 'Cancer (Kark)',
    rashi_hi: 'कर्क (Cancer)',
    letters: ['hi', 'hu', 'he', 'ho', 'da', 'di', 'du', 'de', 'do', 'd'],
    nakshatras: ['Punarvasu', 'Pushya', 'Ashlesha'],
    phal_en: 'Sensitive, nurturing, and family-centered.',
    phal_hi: 'संवेदनशील, पोषणकारी और परिवार-केंद्रित।',
    rashiphal_en: 'Home, emotional balance, and stability stay important.',
    rashiphal_hi: 'घर, भावनात्मक संतुलन और स्थिरता प्रमुख रहते हैं।'
  },
  {
    rashi_en: 'Leo (Simha)',
    rashi_hi: 'सिंह (Leo)',
    letters: ['ma', 'mi', 'mu', 'me', 'mo', 'ta', 'ti', 'tu', 'te', 'm', 't'],
    nakshatras: ['Magha', 'Purva Phalguni', 'Uttara Phalguni'],
    phal_en: 'Confident, creative, and inspiring.',
    phal_hi: 'आत्मविश्वासी, रचनात्मक और प्रेरणादायक।',
    rashiphal_en: 'Visibility, recognition, and creative output improve.',
    rashiphal_hi: 'पहचान, प्रभाव और रचनात्मक परिणाम बेहतर होते हैं।'
  },
  {
    rashi_en: 'Virgo (Kanya)',
    rashi_hi: 'कन्या (Virgo)',
    letters: ['to', 'pa', 'pi', 'pu', 'pe', 'po', 'sh', 'th', 'na', 'p'],
    nakshatras: ['Uttara Phalguni', 'Hasta', 'Chitra'],
    phal_en: 'Analytical, detail-oriented, and disciplined.',
    phal_hi: 'विश्लेषणात्मक, विवरण-प्रिय और अनुशासित।',
    rashiphal_en: 'Skill-building and consistency deliver strong results.',
    rashiphal_hi: 'कौशल-विकास और निरंतरता से मजबूत परिणाम मिलते हैं।'
  },
  {
    rashi_en: 'Libra (Tula)',
    rashi_hi: 'तुला (Libra)',
    letters: ['ra', 'ri', 'ru', 're', 'ro', 'ta', 'ti', 'tu', 'te', 'r', 't'],
    nakshatras: ['Chitra', 'Swati', 'Vishakha'],
    phal_en: 'Balanced, fair, and partnership-friendly.',
    phal_hi: 'संतुलित, न्यायप्रिय और साझेदारी-केंद्रित।',
    rashiphal_en: 'Collaborations and harmony bring progress.',
    rashiphal_hi: 'साझेदारी और सामंजस्य से प्रगति मिलती है।'
  },
  {
    rashi_en: 'Scorpio (Vrishchik)',
    rashi_hi: 'वृश्चिक (Scorpio)',
    letters: ['to', 'na', 'ni', 'nu', 'ne', 'no', 'ya', 'yi', 'yu', 'n', 'y'],
    nakshatras: ['Vishakha', 'Anuradha', 'Jyeshtha'],
    phal_en: 'Focused, deep, and determined.',
    phal_hi: 'केंद्रित, गहराई वाला और दृढ़ निश्चयी।',
    rashiphal_en: 'Focused decisions and intuition support growth.',
    rashiphal_hi: 'सटीक निर्णय और अंतर्ज्ञान प्रगति में सहायक होते हैं।'
  },
  {
    rashi_en: 'Sagittarius (Dhanu)',
    rashi_hi: 'धनु (Sagittarius)',
    letters: ['ye', 'yo', 'bha', 'bhi', 'bhu', 'bhe', 'bh', 'dha', 'dh', 'pha', 'ph'],
    nakshatras: ['Mula', 'Purva Ashadha', 'Uttara Ashadha'],
    phal_en: 'Optimistic, exploratory, and independent.',
    phal_hi: 'आशावादी, खोजी और स्वतंत्र स्वभाव।',
    rashiphal_en: 'Expansion, travel, and growth opportunities increase.',
    rashiphal_hi: 'विस्तार, यात्रा और विकास के अवसर बढ़ते हैं।'
  },
  {
    rashi_en: 'Capricorn (Makar)',
    rashi_hi: 'मकर (Capricorn)',
    letters: ['bho', 'kha', 'ga', 'gi', 'g', 'ja', 'ji', 'ju', 'je', 'jo', 'j', 'z', 'x', 'b', 'kh'],
    nakshatras: ['Uttara Ashadha', 'Shravana', 'Dhanishtha'],
    phal_en: 'Ambitious, patient, and execution-focused.',
    phal_hi: 'महत्वाकांक्षी, धैर्यवान और परिणाम-केंद्रित।',
    rashiphal_en: 'Consistency and structure improve long-term outcomes.',
    rashiphal_hi: 'निरंतरता और संरचना से दीर्घकालीन सफलता मिलती है।'
  },
  {
    rashi_en: 'Aquarius (Kumbh)',
    rashi_hi: 'कुम्भ (Aquarius)',
    letters: ['gu', 'ge', 'go', 'sa', 'si', 'su', 'se', 'so', 's', 'da', 'd'],
    nakshatras: ['Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada'],
    phal_en: 'Innovative, social, and progressive.',
    phal_hi: 'नवोन्मेषी, सामाजिक और प्रगतिशील।',
    rashiphal_en: 'Networking and innovation unlock fresh possibilities.',
    rashiphal_hi: 'नेटवर्किंग और नवाचार से नए अवसर खुलते हैं।'
  },
  {
    rashi_en: 'Pisces (Meen)',
    rashi_hi: 'मीन (Pisces)',
    letters: ['di', 'du', 'de', 'do', 'tha', 'th', 'jha', 'jh', 'cha', 'chi', 'ca', 'c', 'd'],
    nakshatras: ['Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'],
    phal_en: 'Compassionate, intuitive, and imaginative.',
    phal_hi: 'दयालु, अंतर्ज्ञानी और कल्पनाशील।',
    rashiphal_en: 'Inner clarity and thoughtful planning create momentum.',
    rashiphal_hi: 'आंतरिक स्पष्टता और सोच-समझकर योजना से प्रगति मिलती है।'
  }
].map((entry) => {
  const groupTokens = Array.isArray(entry.nakshatra_groups)
    ? entry.nakshatra_groups.flat()
    : [];
  const prefixes = Array.from(new Set(
    [...(entry.letters || []), ...groupTokens]
      .map((token) => String(token || '').toLowerCase().replace(/[^a-z]/g, ''))
      .filter(Boolean)
  )).sort((a, b) => b.length - a.length);
  return { ...entry, _prefixes: prefixes };
});

const DOC_NAKSHATRA_GROUPS = Object.freeze({
  aries: [['chu', 'che', 'cho', 'l', 'la'], ['li', 'lu', 'le', 'lo'], ['a', 'aa']],
  taurus: [['i', 'u', 'e'], ['o', 'v', 'w'], ['ve', 'vo']],
  gemini: [['k', 'ka', 'ki'], ['ku', 'q', 'gh', 'ch'], ['ke', 'ko', 'h', 'ha']],
  cancer: [['hi'], ['hu', 'he', 'ho', 'da'], ['d']],
  leo: [['m'], ['mo', 't'], ['te']],
  virgo: [['to', 'p', 'pa', 'pi'], ['pu', 'sh', 'th'], ['pe', 'po']],
  libra: [['r', 'ra', 'ri'], ['ru', 're', 'ro', 't', 'ta'], ['ti', 'tu', 'te']],
  scorpio: [['to'], ['n', 'na', 'ni', 'nu', 'ne'], ['no', 'y', 'ya', 'yi', 'yu']],
  sagittarius: [['ye', 'yo', 'bha', 'bhi'], ['bhu', 'dha', 'pha'], ['bhe']],
  capricorn: [['bho', 'j', 'z', 'x', 'b'], ['kha', 'kh'], ['g', 'ga', 'gi']],
  aquarius: [['gu', 'ge'], ['go', 's'], ['se', 'so', 'da', 'd']],
  pisces: [['d', 'di'], ['du', 'tha', 'th', 'jha', 'jh'], ['de', 'do', 'c', 'ca', 'cha', 'ci', 'chi']]
});

function getRashiSlug(rashi) {
  const raw = String(rashi?.rashi_en || '').toLowerCase();
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

function getNakshatraGroupsForRashi(rashi) {
  const slug = getRashiSlug(rashi);
  const fromDoc = DOC_NAKSHATRA_GROUPS[slug];
  if (Array.isArray(fromDoc) && fromDoc.length) {
    return fromDoc;
  }
  if (Array.isArray(rashi?.nakshatra_groups) && rashi.nakshatra_groups.length) {
    return rashi.nakshatra_groups;
  }
  const letters = (Array.isArray(rashi?.letters) ? rashi.letters : [])
    .map((token) => String(token || '').toLowerCase().replace(/[^a-z]/g, ''))
    .filter(Boolean)
    .filter((token) => token.length > 1)
    .slice(0, 9);
  return [letters.slice(0, 3), letters.slice(3, 6), letters.slice(6, 9)].filter((group) => group.length);
}

const NAKSHATRA_HI_MAP = Object.freeze({
  ashwini: '\u0905\u0936\u094d\u0935\u093f\u0928\u0940',
  bharani: '\u092d\u0930\u0923\u0940',
  krittika: '\u0915\u0943\u0924\u094d\u0924\u093f\u0915\u093e',
  kritika: '\u0915\u0943\u0924\u094d\u0924\u093f\u0915\u093e',
  rohini: '\u0930\u094b\u0939\u093f\u0923\u0940',
  mrigashira: '\u092e\u0943\u0917\u0936\u0940\u0930\u094d\u0937',
  mrigasira: '\u092e\u0943\u0917\u0936\u0940\u0930\u094d\u0937',
  mrigshira: '\u092e\u0943\u0917\u0936\u0940\u0930\u094d\u0937',
  ardra: '\u0906\u0930\u094d\u0926\u094d\u0930\u093e',
  punarvasu: '\u092a\u0941\u0928\u0930\u094d\u0935\u0938\u0941',
  pushya: '\u092a\u0941\u0937\u094d\u092f',
  pushyami: '\u092a\u0941\u0937\u094d\u092f',
  ashlesha: '\u0906\u0936\u094d\u0932\u0947\u0937\u093e',
  magha: '\u092e\u0918\u093e',
  purvaphalguni: '\u092a\u0942\u0930\u094d\u0935 \u092b\u093e\u0932\u094d\u0917\u0941\u0928\u0940',
  uttaraphalguni: '\u0909\u0924\u094d\u0924\u0930 \u092b\u093e\u0932\u094d\u0917\u0941\u0928\u0940',
  hasta: '\u0939\u0938\u094d\u0924',
  chitra: '\u091a\u093f\u0924\u094d\u0930\u093e',
  swati: '\u0938\u094d\u0935\u093e\u0924\u0940',
  vishakha: '\u0935\u093f\u0936\u093e\u0916\u093e',
  visakha: '\u0935\u093f\u0936\u093e\u0916\u093e',
  anuradha: '\u0905\u0928\u0941\u0930\u093e\u0927\u093e',
  jyeshtha: '\u091c\u094d\u092f\u0947\u0937\u094d\u0920\u093e',
  jyestha: '\u091c\u094d\u092f\u0947\u0937\u094d\u0920\u093e',
  mula: '\u092e\u0942\u0932',
  moola: '\u092e\u0942\u0932',
  purvaashadha: '\u092a\u0942\u0930\u094d\u0935\u093e\u0937\u093e\u0922\u093c\u093e',
  uttaraashadha: '\u0909\u0924\u094d\u0924\u0930\u093e\u0937\u093e\u0922\u093c\u093e',
  shravana: '\u0936\u094d\u0930\u0935\u0923',
  dhanishtha: '\u0927\u0928\u093f\u0937\u094d\u0920\u093e',
  shatabhisha: '\u0936\u0924\u092d\u093f\u0937\u093e',
  shatabhishak: '\u0936\u0924\u092d\u093f\u0937\u093e',
  purvabhadrapada: '\u092a\u0942\u0930\u094d\u0935\u093e\u092d\u093e\u0926\u094d\u0930\u092a\u0926\u093e',
  uttarabhadrapada: '\u0909\u0924\u094d\u0924\u0930\u093e\u092d\u093e\u0926\u094d\u0930\u092a\u0926\u093e',
  revati: '\u0930\u0947\u0935\u0924\u0940'
});

const NAKSHATRA_HI_ALIAS_MAP = Object.freeze({
  '\u0905\u0938\u0930\u0939\u0935\u093f\u0928\u0947\u0926': '\u0905\u0936\u094d\u0935\u093f\u0928\u0940',
  '\u0905\u0938\u0930\u0939\u0935\u093f\u0928\u0940': '\u0905\u0936\u094d\u0935\u093f\u0928\u0940',
  '\u0905\u0938\u0930\u0935\u093f\u0928\u0940': '\u0905\u0936\u094d\u0935\u093f\u0928\u0940',
  '\u092c\u0939\u0930\u0928\u0948\u0921': '\u092d\u0930\u0923\u0940',
  '\u092c\u0939\u0930\u093e\u0928\u0940': '\u092d\u0930\u0923\u0940',
  '\u092d\u093e\u0930\u0923\u0940': '\u092d\u0930\u0923\u0940',
  '\u0915\u0930\u0940\u0924\u093f\u091f\u093f\u0915\u093e': '\u0915\u0943\u0924\u094d\u0924\u093f\u0915\u093e',
  '\u0915\u094d\u0930\u0940\u091f\u093f\u0915\u093e': '\u0915\u0943\u0924\u094d\u0924\u093f\u0915\u093e',
  '\u0915\u0943\u0924\u093f\u0915\u093e': '\u0915\u0943\u0924\u094d\u0924\u093f\u0915\u093e'
});

function normalizeAstroToken(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s/g, '');
}

function localizeNakshatraForHindi(rawValue) {
  const raw = String(rawValue || '').trim();
  if (!raw) return raw;
  if (/[\u0900-\u097F]/.test(raw)) {
    return raw
      .split(',')
      .map((piece) => String(piece || '').trim())
      .filter(Boolean)
      .map((piece) => {
        const compact = piece.replace(/[^\u0900-\u097F]/g, '');
        return NAKSHATRA_HI_ALIAS_MAP[compact] || piece;
      })
      .join(', ');
  }
  const pieces = raw
    .split(',')
    .map((piece) => String(piece || '').trim())
    .filter(Boolean);

  if (!pieces.length) return raw;
  return pieces
    .map((piece) => {
      const key = normalizeAstroToken(piece);
      return NAKSHATRA_HI_MAP[key] || piece;
    })
    .join(', ');
}

function normalizeRomanNameForRashi(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

function extractDevanagariPrefix(name) {
  const raw = String(name || '').trim();
  if (!raw) return '';
  const first = raw.charAt(0);
  if (!/[\u0900-\u097f]/.test(first)) return '';

  const vowelMap = {
    '\u0905': 'a', '\u0906': 'aa', '\u0907': 'i', '\u0908': 'i',
    '\u0909': 'u', '\u090a': 'u', '\u090f': 'e', '\u0910': 'e',
    '\u0913': 'o', '\u0914': 'o'
  };
  if (vowelMap[first]) return vowelMap[first];

  const consonantMap = {
    '\u0915': 'k', '\u0916': 'kh', '\u0917': 'g', '\u0918': 'gh', '\u0919': 'ng',
    '\u091a': 'ch', '\u091b': 'ch', '\u091c': 'j', '\u091d': 'jh', '\u091e': 'ny',
    '\u091f': 't', '\u0920': 'th', '\u0921': 'd', '\u0922': 'dh', '\u0923': 'na',
    '\u0924': 't', '\u0925': 'th', '\u0926': 'd', '\u0927': 'dh', '\u0928': 'n',
    '\u092a': 'p', '\u092b': 'ph', '\u092c': 'b', '\u092d': 'bh', '\u092e': 'm',
    '\u092f': 'y', '\u0930': 'r', '\u0932': 'l', '\u0935': 'v',
    '\u0936': 'sh', '\u0937': 'sh', '\u0938': 's', '\u0939': 'h',
    '\u0958': 'q', '\u0959': 'kh', '\u095a': 'gh', '\u095b': 'z'
  };

  const matraMap = {
    '\u093e': 'aa', '\u093f': 'i', '\u0940': 'i', '\u0941': 'u', '\u0942': 'u',
    '\u0947': 'e', '\u0948': 'e', '\u094b': 'o', '\u094c': 'o', '\u0943': 'ri'
  };

  const base = consonantMap[first];
  if (!base) return '';

  let cursor = 1;
  if (raw.charAt(cursor) === '\u093c') cursor += 1;
  let vowel = 'a';
  const marker = raw.charAt(cursor);
  if (matraMap[marker]) {
    vowel = matraMap[marker];
  } else if (marker === '\u094d') {
    vowel = '';
  }
  return `${base}${vowel}`;
}

function buildRashiNameVariants(name) {
  const variants = [];
  const seen = new Set();
  const add = (value) => {
    const normalized = String(value || '').toLowerCase().replace(/[^a-z]/g, '');
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    variants.push(normalized);
  };

  const latin = normalizeRomanNameForRashi(name);
  if (latin.length === 1) add(mapSingleLetterToSyllable(latin));
  add(latin);
  const devPrefix = extractDevanagariPrefix(name);
  add(devPrefix);
  if (devPrefix.endsWith('a')) add(devPrefix.slice(0, -1));

  [latin, devPrefix].forEach((variant) => {
    const v = String(variant || '').toLowerCase();
    if (!v) return;
    add(v.replace(/^aa/, 'a'));
    add(v.replace(/^(ee|ii)/, 'i'));
    add(v.replace(/^oo/, 'u'));
    add(v.replace(/^ou/, 'o'));
    add(v.replace(/^bh/, 'b'));
    add(v.replace(/^ph/, 'f'));
    add(v.replace(/^dh/, 'd'));
    add(v.replace(/^th/, 't'));
    add(v.replace(/^sh/, 's'));
    add(v.replace(/^chh/, 'ch'));
    add(v.replace(/^kh/, 'k'));
    add(v.replace(/^gh/, 'g'));
    if (v.endsWith('a')) add(v.slice(0, -1));
  });

  return variants;
}

function mapSingleLetterToSyllable(letter) {
  const token = String(letter || '').toLowerCase().replace(/[^a-z]/g, '');
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

function resolveNakshatraForMatch(rashi, matchedVariant, matchedPrefix) {
  const nakshatras = Array.isArray(rashi?.nakshatras) ? rashi.nakshatras : [];
  if (!nakshatras.length) return 'Ashwini';

  const groupedLetters = getNakshatraGroupsForRashi(rashi)
    .map((group) => (Array.isArray(group) ? group : [])
      .map((token) => String(token || '').toLowerCase().replace(/[^a-z]/g, ''))
      .filter(Boolean))
    .filter((group) => group.length);

  const variant = String(matchedVariant || '').toLowerCase().replace(/[^a-z]/g, '');
  const hint = String(matchedPrefix || '').toLowerCase().replace(/[^a-z]/g, '');

  let matchedGroup = -1;
  let matchedLen = -1;

  for (let i = 0; i < groupedLetters.length; i += 1) {
    for (const token of groupedLetters[i]) {
      if (!token || !variant.startsWith(token)) continue;
      if (token.length > matchedLen) {
        matchedLen = token.length;
        matchedGroup = i;
      }
    }
  }

  if (matchedGroup < 0 && hint) {
    matchedGroup = groupedLetters.findIndex((group) => group.includes(hint));
  }

  if (matchedGroup < 0 && variant.length === 1) {
    const mapped = mapSingleLetterToSyllable(variant);
    if (mapped) {
      matchedGroup = groupedLetters.findIndex((group) => group.includes(mapped));
    }
  }

  const groupIndex = matchedGroup >= 0
    ? Math.min(nakshatras.length - 1, matchedGroup)
    : 0;

  return nakshatras[groupIndex] || nakshatras[0] || 'Ashwini';
}

function pickPrimaryNakshatra(value) {
  if (Array.isArray(value)) {
    return String(value[0] || '').trim();
  }
  const raw = String(value || '').trim();
  if (!raw) return '';
  return raw.split(',')[0].trim();
}

function resolveAstroProfileForName(name) {
  const safeName = String(name || '').trim();
  if (!safeName) {
    const fallback = RASHI_MAP[0];
    const fallbackNakshatra = pickPrimaryNakshatra(fallback.nakshatras) || 'Ashwini';
    return {
      ...fallback,
      nakshatra: fallbackNakshatra,
      nakshatra_hi: localizeNakshatraForHindi(fallbackNakshatra),
      matched_prefix: ''
    };
  }

  const variants = buildRashiNameVariants(safeName);
  let bestMatch = null;
  for (const variant of variants) {
    for (const rashi of RASHI_MAP) {
      for (const prefix of rashi._prefixes) {
        if (!variant.startsWith(prefix)) continue;
        const candidate = { rashi, variant, prefix };
        if (!bestMatch
          || prefix.length > bestMatch.prefix.length
          || (prefix.length === bestMatch.prefix.length && variant.length > bestMatch.variant.length)) {
          bestMatch = candidate;
        }
      }
    }
  }

  if (bestMatch) {
    const nakshatra = resolveNakshatraForMatch(bestMatch.rashi, bestMatch.variant, bestMatch.prefix);
    return {
      ...bestMatch.rashi,
      nakshatra,
      nakshatra_hi: localizeNakshatraForHindi(nakshatra),
      matched_prefix: bestMatch.prefix
    };
  }

  const fallback = RASHI_MAP[0];
  const fallbackNakshatra = pickPrimaryNakshatra(fallback.nakshatras) || 'Ashwini';
  return {
    ...fallback,
    nakshatra: fallbackNakshatra,
    nakshatra_hi: localizeNakshatraForHindi(fallbackNakshatra),
    matched_prefix: ''
  };
}

module.exports = {
  RASHI_MAP,
  resolveAstroProfileForName,
  buildRashiNameVariants
};
