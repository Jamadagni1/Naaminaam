// Parents Mix - Enhanced Baby Name Generator
// Generates 30+ meaningful names with gender filtering

document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-mix-btn');
    const fatherNameInput = document.getElementById('father-name');
    const motherNameInput = document.getElementById('mother-name');
    const loadingState = document.getElementById('loading-state');
    const resultsSection = document.getElementById('mix-results');
    const resultsGrid = document.getElementById('results-grid');
    const resultsCount = document.getElementById('results-count');
    const parentNamesDisplay = document.getElementById('parent-names-display');
    const genderBtns = document.querySelectorAll('.gender-btn');

    let selectedGender = 'male';

    if (!generateBtn) return;

    // Language Toggle Listener
    const updateLanguage = () => {
        const lang = document.documentElement.lang || 'en';
        const isHindi = lang === 'hi';

        // Update placeholders
        if (fatherNameInput) fatherNameInput.placeholder = isHindi ? "पिता का नाम दर्ज करें" : "Enter father's name";
        if (motherNameInput) motherNameInput.placeholder = isHindi ? "मां का नाम दर्ज करें" : "Enter mother's name";

        // Re-display results if they exist
        if (resultsSection.style.display !== 'none' && window.lastGeneratedNames) {
            displayResults(window.lastGeneratedNames);
        }
    };

    // Attach to buttons using addEventListener to avoid overwriting script.js handlers
    const langBtns = document.querySelectorAll('#language-toggle, #language-toggle-mobile');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Small timeout to let script.js update the DOM/Lang first
            setTimeout(updateLanguage, 50);
        });
    });

    // Initial update
    updateLanguage();

    // Gender selection
    genderBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            genderBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedGender = btn.getAttribute('data-gender');
        });
    });

    // Generate button click
    generateBtn.addEventListener('click', async () => {
        const fatherName = fatherNameInput.value.trim();
        const motherName = motherNameInput.value.trim();

        // Validation
        if (!fatherName || !motherName) {
            alert('Please enter both parent names');
            return;
        }

        // Show loading
        resultsSection.style.display = 'none';
        loadingState.style.display = 'block';

        // Scroll to loading
        loadingState.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Simulate processing time for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate names
        const names = generateBabyNames(fatherName, motherName, selectedGender);

        // Save for language toggling
        window.lastGeneratedNames = names;

        // Update display
        parentNamesDisplay.innerHTML = `${fatherName} & ${motherName}`;
        resultsCount.textContent = names.length;

        // Display results
        displayResults(names);

        // Hide loading, show results
        loadingState.style.display = 'none';
        resultsSection.style.display = 'block';

        // Scroll to results
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    });

    function generateBabyNames(father, mother, gender) {
        const f = father.toLowerCase().trim();
        const m = mother.toLowerCase().trim();
        const names = new Set();

        // Strategy 1: Prefix + Suffix combinations
        addPrefixSuffixNames(f, m, names);

        // Strategy 2: Syllable blending
        addSyllableBlends(f, m, names);

        // Strategy 3: Vowel-consonant mixing
        addVowelConsonantMix(f, m, names);

        // Strategy 4: Character rearrangements
        addRearrangedNames(f, m, names);

        // Strategy 5: Middle extraction patterns
        addMiddlePatterns(f, m, names);

        // Strategy 6: Phonetic variations with gender-specific endings
        addPhoneticVariations(f, m, names, gender);

        // Convert to array and apply gender-specific transformations
        const nameArray = Array.from(names)
            .map(name => applyGenderTransformation(name, gender))
            .filter(name => name && name.length >= 3 && name.length <= 12)
            .map(name => ({
                name: capitalize(name),
                meaning: generateMeaning(name, f, m),
                gender: gender
            }))
            .filter(n => /^[A-Z][a-z]+$/.test(n.name));

        // Ensure at least 30 names
        while (nameArray.length < 30 && names.size < 100) {
            const extraName = generateExtraName(f, m, gender);
            if (extraName && !names.has(extraName)) {
                names.add(extraName);
                const transformed = applyGenderTransformation(extraName, gender);
                if (transformed && transformed.length >= 3 && transformed.length <= 12) {
                    nameArray.push({
                        name: capitalize(transformed),
                        meaning: generateMeaning(transformed, f, m),
                        gender: gender
                    });
                }
            }
        }

        return nameArray.slice(0, 35); // Return up to 35 names
    }

    function applyGenderTransformation(name, gender) {
        if (!name) return name;

        const lastChar = name.slice(-1);
        const baseName = name.slice(0, -1);

        if (gender === 'female') {
            // Transform to feminine endings
            if (['n', 't', 'r', 'h', 'sh'].includes(lastChar)) {
                // Add feminine suffix
                const femSuffixes = ['a', 'i', 'ya', 'ika'];
                return name + femSuffixes[name.length % femSuffixes.length];
            }
            // If already ends with vowel, keep it
            if (['a', 'i', 'e'].includes(lastChar)) {
                return name;
            }
            // Otherwise add 'a'
            return name + 'a';
        } else {
            // Transform to masculine endings
            if (['a', 'i'].includes(lastChar)) {
                // Replace with masculine ending
                const mascEndings = ['an', 'it', 'ar', 'esh'];
                return baseName + mascEndings[name.length % mascEndings.length];
            }
            // If already masculine sounding, keep it
            return name;
        }
    }

    function addPrefixSuffixNames(f, m, names) {
        // Various prefix/suffix combinations
        const lengths = [2, 3, 4];

        lengths.forEach(len => {
            if (f.length >= len && m.length >= len) {
                names.add(f.substring(0, len) + m.substring(len));
                names.add(m.substring(0, len) + f.substring(len));
                names.add(f.substring(0, len) + m.substring(m.length - len));
                names.add(m.substring(0, len) + f.substring(f.length - len));
            }
        });
    }

    function addSyllableBlends(f, m, names) {
        const fSyllables = splitIntoSyllables(f);
        const mSyllables = splitIntoSyllables(m);

        // Mix syllables
        if (fSyllables.length >= 2 && mSyllables.length >= 1) {
            names.add(fSyllables[0] + mSyllables[0]);
            names.add(mSyllables[0] + fSyllables[0]);
        }
        if (fSyllables.length >= 1 && mSyllables.length >= 2) {
            names.add(fSyllables[0] + mSyllables[mSyllables.length - 1]);
            names.add(mSyllables[0] + fSyllables[fSyllables.length - 1]);
        }
    }

    function addVowelConsonantMix(f, m, names) {
        const fVowels = f.match(/[aeiou]/gi)?.join('') || '';
        const mVowels = m.match(/[aeiou]/gi)?.join('') || '';
        const fCons = f.replace(/[aeiou]/gi, '');
        const mCons = m.replace(/[aeiou]/gi, '');

        if (fCons.length >= 2 && mVowels.length >= 1) {
            names.add(fCons.substring(0, 2) + mVowels[0] + mCons.substring(0, 2));
        }
        if (mCons.length >= 2 && fVowels.length >= 1) {
            names.add(mCons.substring(0, 2) + fVowels[0] + fCons.substring(0, 2));
        }
    }

    function addRearrangedNames(f, m, names) {
        // Alternating characters
        let alt1 = '', alt2 = '';
        const maxLen = Math.max(f.length, m.length);

        for (let i = 0; i < Math.min(6, maxLen); i++) {
            if (i < f.length) alt1 += f[i];
            if (i < m.length) alt1 += m[i];
            if (i < m.length) alt2 += m[i];
            if (i < f.length) alt2 += f[i];
        }

        if (alt1.length >= 4) names.add(alt1);
        if (alt2.length >= 4) names.add(alt2);
    }

    function addMiddlePatterns(f, m, names) {
        const fMid = Math.floor(f.length / 2);
        const mMid = Math.floor(m.length / 2);

        if (f.length >= 4 && m.length >= 4) {
            names.add(f.substring(0, fMid) + m.substring(mMid));
            names.add(m.substring(0, mMid) + f.substring(fMid));
            names.add(f.substring(fMid) + m.substring(0, mMid));
            names.add(m.substring(mMid) + f.substring(0, fMid));
        }
    }

    function addPhoneticVariations(f, m, names, gender) {
        // Gender-specific name endings
        const maleEndings = ['an', 'it', 'ar', 'esh', 'raj', 'deep', 'ant', 'at', 'av'];
        const femaleEndings = ['a', 'i', 'ya', 'ika', 'isha', 'ini', 'ara', 'anya', 'avi'];

        const endings = gender === 'female' ? femaleEndings : maleEndings;

        endings.forEach(end => {
            if (f.length >= 3) {
                names.add(f.substring(0, 3) + end);
            }
            if (m.length >= 3) {
                names.add(m.substring(0, 3) + end);
            }
            // Mix both parent initials
            if (f.length >= 2 && m.length >= 2) {
                names.add(f.substring(0, 2) + m.substring(0, 1) + end);
                names.add(m.substring(0, 2) + f.substring(0, 1) + end);
            }
        });
    }

    function generateExtraName(f, m, gender) {
        const combined = f + m;
        const start = Math.floor(Math.random() * (combined.length - 4));
        return combined.substring(start, start + (4 + Math.floor(Math.random() * 4)));
    }

    function splitIntoSyllables(name) {
        // Simple syllable split (approximation)
        const syllables = [];
        let current = '';

        for (let i = 0; i < name.length; i++) {
            current += name[i];
            if (/[aeiou]/.test(name[i]) && i > 0) {
                syllables.push(current);
                current = '';
            }
        }
        if (current) syllables.push(current);

        return syllables.filter(s => s.length > 0);
    }

    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    function determineGender(name, selectedGender) {
        return selectedGender;
    }

    function generateMeaning(name, father, mother) {
        const meanings = [
            'Blessed union of love',
            'Gift of harmony and grace',
            'Symbol of eternal bond',
            'Light of two hearts',
            'Precious treasure',
            'Joy and happiness combined',
            'Beautiful blend of souls',
            'Miracle of love',
            'Cherished blessing',
            'Radiant new beginning',
            'Sweet melody of life',
            'Embodiment of grace',
            'Pure love manifested',
            'Divine gift',
            'Heavenly blessing',
            'Hope and promise',
            'Gentle spirit',
            'Shining star',
            'Peaceful harmony',
            'Endless love',
            'Bright future ahead',
            'Sacred union',
            'Precious jewel',
            'Ray of sunshine',
            'Ocean of compassion',
            'Mountain of strength',
            'River of kindness',
            'Garden of dreams',
            'Fountain of wisdom',
            'Crown of glory',
            'Pillar of faith',
            'Beacon of hope',
            'Voice of truth',
            'Heart of courage',
            'Soul of purity',
            'Spirit of adventure',
            'Essence of beauty',
            'Source of inspiration',
            'Path of righteousness',
            'Gift from above',
            'Treasure of the family',
            'Pride and joy',
            'Bundle of happiness',
            'Angel of peace',
            'Warrior of light',
            'Guardian of love',
            'Keeper of dreams',
            'Bearer of good fortune',
            'Bringer of prosperity',
            'Messenger of happiness',
            'Symbol of unity',
            'Bridge between hearts',
            'Flower of affection',
            'Fruit of devotion',
            'Seed of greatness',
            'Root of tradition',
            'Branch of family tree',
            'Leaf of new life',
            'Blossom of spring',
            'Harvest of blessings',
            'Dawn of new era',
            'Twilight of serenity',
            'Moonlight of tranquility',
            'Starlight of wonder',
            'Sunbeam of warmth'
        ];

        // Use multiple factors to ensure variety
        const nameLength = name.length;
        const firstChar = name.charCodeAt(0);
        const lastChar = name.charCodeAt(name.length - 1);
        const sum = firstChar + lastChar + nameLength;

        const index = sum % meanings.length;
        return meanings[index];
    }

    function displayResults(names) {
        const lang = document.documentElement.lang || 'en';
        const isHindi = lang === 'hi';

        const genderIcons = {
            'male': '<i class="fas fa-mars"></i>',
            'female': '<i class="fas fa-venus"></i>'
        };

        const genderLabel = {
            'male': isHindi ? 'लड़का' : 'Male',
            'female': isHindi ? 'लड़की' : 'Female'
        };

        // Update results subtitle
        const fatherName = document.getElementById('father-name').value.trim();
        const motherName = document.getElementById('mother-name').value.trim();
        const subtitleEl = document.querySelector('.results-subtitle');
        if (subtitleEl) {
            subtitleEl.innerHTML = isHindi
                ? `<span id="parent-names-display">${fatherName} और ${motherName}</span> से बनाए गए नाम`
                : `Names created from <span id="parent-names-display">${fatherName} & ${motherName}</span>`;
        }

        // Get existing favorites
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

        resultsGrid.innerHTML = names.map((nameObj, index) => {
            const isLiked = favorites.some(fav => fav.name === nameObj.name);

            // Transliterate if Hindi
            let displayName = nameObj.name;
            if (isHindi && window.getHindiName) {
                // Show "English (Hindi)" format or just Hindi? User asked for "matches in hindi"
                // Best UX is usually "Name (नाम)" to be sure
                displayName = `${nameObj.name} <span class="hindi-script">(${window.getHindiName(nameObj.name)})</span>`;
            }

            return `
            <div class="result-card" style="animation-delay: ${index * 0.03}s">
                <button class="like-btn ${isLiked ? 'liked' : ''}" data-name="${nameObj.name}">
                    <i class="fas fa-heart"></i>
                </button>
                <div class="result-name">${displayName}</div>
                <div class="result-gender">
                    ${genderIcons[nameObj.gender]} ${genderLabel[nameObj.gender]}
                </div>
                <div class="result-meaning">${nameObj.meaning}</div>
            </div>
        `}).join('');

        // Add like button functionality
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const name = this.getAttribute('data-name');
                toggleLike(this, name);
            });
        });
    }

    function toggleLike(button, name) {
        // Use the same favorites key as the main site
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

        // Get name details from the card
        const card = button.closest('.result-card');
        const genderText = card.querySelector('.result-gender').textContent.trim();
        const meaning = card.querySelector('.result-meaning').textContent.trim();
        const gender = genderText.toLowerCase().includes('female') ? 'Girl' : 'Boy';

        // Check if already in favorites
        const index = favorites.findIndex(fav => fav.name === name);

        if (index > -1) {
            // Remove from favorites
            favorites.splice(index, 1);
            button.classList.remove('liked');
        } else {
            // Add to favorites with required structure
            favorites.push({
                name: name,
                gender: gender,
                meaning: meaning
            });
            button.classList.add('liked');
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
        localStorage.setItem('naamin_favorites_v1', JSON.stringify(favorites));
        try { document.dispatchEvent(new CustomEvent('favoritesUpdated')); } catch (e) { }

        // Update the favorite count in navbar
        updateFavoriteCount();
    }

    function updateFavoriteCount() {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const count = favorites.length;

        // Update both desktop and mobile counters
        const desktopCount = document.getElementById('fav-count');
        const mobileCount = document.getElementById('fav-count-mobile');

        if (desktopCount) desktopCount.textContent = count;
        if (mobileCount) mobileCount.textContent = count;
    }
});
