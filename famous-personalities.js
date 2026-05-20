// Famous Personalities - Curated names inspired by greatness
// Integration with existing favorites and detail view system

document.addEventListener('DOMContentLoaded', () => {
    // Show the body once loaded (matches site pattern)
    document.body.style.visibility = 'visible';

    const namesGrid = document.getElementById('names-grid');
    const showingCount = document.getElementById('showing-count');
    const genderPills = document.querySelectorAll('[data-filter="gender"]');
    const categorySelect = document.getElementById('category-filter');

    let currentFilters = {
        gender: 'all',
        category: 'all'
    };

    function favoriteNameOf(item) {
        if (typeof item === 'string') return item;
        return item?.name || item?.Name || '';
    }

    // Curated Famous Personalities inspired names
    const personalityNames = [
        // Politics & Leaders
        {
            name: 'Arya', name_hi: 'आर्या',
            gender: 'female',
            personality: 'Aryabhata', personality_hi: 'आर्यभट',
            field: 'Science', field_hi: 'विज्ञान',
            category: 'science',
            description: 'Ancient Indian mathematician and astronomer who pioneered the concept of zero.',
            description_hi: 'प्राचीन भारतीय गणितज्ञ और खगोलशास्त्री जिन्होंने शून्य की अवधारणा का बीजारोपण किया।'
        },
        {
            name: 'Vikram', name_hi: 'विक्रम',
            gender: 'male',
            personality: 'Vikram Sarabhai', personality_hi: 'विक्रम साराभाई',
            field: 'Science', field_hi: 'विज्ञान',
            category: 'science',
            description: 'The father of the Indian Space Program and founder of ISRO.',
            description_hi: 'भारतीय अंतरिक्ष कार्यक्रम के जनक और इसरो के संस्थापक।'
        },
        {
            name: 'Chanakya', name_hi: 'चाणक्य',
            gender: 'male',
            personality: 'Chanakya', personality_hi: 'चाणक्य',
            field: 'Politics', field_hi: 'राजनीति',
            category: 'politics',
            description: 'Ancient Indian polymath, strategist, and royal advisor.',
            description_hi: 'प्राचीन भारतीय बहुश्रुत, रणनीतिकार और शाही सलाहकार।'
        },
        {
            name: 'Indira', name_hi: 'इंदिरा',
            gender: 'female',
            personality: 'Indira Gandhi', personality_hi: 'इंदिरा गांधी',
            field: 'Politics', field_hi: 'राजनीति',
            category: 'politics',
            description: 'The first female Prime Minister of India, known for her strong leadership.',
            description_hi: 'भारत की पहली महिला प्रधान मंत्री, जो अपने मजबूत नेतृत्व के लिए जानी जाती हैं।'
        },
        {
            name: 'Atal', name_hi: 'अटल',
            gender: 'male',
            personality: 'Atal Bihari Vajpayee', personality_hi: 'अटल बिहारी वाजपेयी',
            field: 'Politics', field_hi: 'राजनीति',
            category: 'politics',
            description: 'Former PM, legendary orator, and statesman known for his poetic vision.',
            description_hi: 'पूर्व पीएम, महान वक्ता और राजनेता अपनी काव्य दृष्टि के लिए जाने जाते हैं।'
        },

        // Sports
        {
            name: 'Sachin', name_hi: 'सचिन',
            gender: 'male',
            personality: 'Sachin Tendulkar', personality_hi: 'सचिन तेंदुलकर',
            field: 'Sports', field_hi: 'खेल',
            category: 'sports',
            description: 'Legendary cricketer often referred to as the "God of Cricket".',
            description_hi: 'महान क्रिकेटर जिन्हें अक्सर "क्रिकेट का भगवान" कहा जाता है।'
        },
        {
            name: 'Mary', name_hi: 'मैरी',
            gender: 'female',
            personality: 'Mary Kom', personality_hi: 'मैरी कॉम',
            field: 'Sports', field_hi: 'खेल',
            category: 'sports',
            description: 'Olympic boxer and six-time World Amateur Boxing champion.',
            description_hi: 'ओलंपिक मुक्केबाज और छह बार की विश्व एमेच्योर मुक्केबाजी चैंपियन।'
        },
        {
            name: 'Mithali', name_hi: 'मिताली',
            gender: 'female',
            personality: 'Mithali Raj', personality_hi: 'मिताली राज',
            field: 'Sports', field_hi: 'खेल',
            category: 'sports',
            description: 'Former captain of India women\'s national cricket team.',
            description_hi: 'भारतीय महिला राष्ट्रीय क्रिकेट टीम की पूर्व कप्तान।'
        },
        {
            name: 'Neeraj', name_hi: 'नीरज',
            gender: 'male',
            personality: 'Neeraj Chopra', personality_hi: 'नीरज चोपड़ा',
            field: 'Sports', field_hi: 'खेल',
            category: 'sports',
            description: 'Olympic gold medalist who put Indian athletics on the global map.',
            description_hi: 'ओलंपिक स्वर्ण पदक विजेता जिन्होंने भारतीय एथलेटिक्स को वैश्विक मानचित्र पर रखा।'
        },
        {
            name: 'Saina', name_hi: 'साइना',
            gender: 'female',
            personality: 'Saina Nehwal', personality_hi: 'साइना नेहवाल',
            field: 'Sports', field_hi: 'खेल',
            category: 'sports',
            description: 'Former world no. 1 badminton player and Olympic medalist.',
            description_hi: 'पूर्व विश्व नंबर 1 बैडमिंटन खिलाड़ी और ओलंपिक पदक विजेता।'
        },

        // Cinema & Arts
        {
            name: 'Lata', name_hi: 'लता',
            gender: 'female',
            personality: 'Lata Mangeshkar', personality_hi: 'लता मंगेशकर',
            field: 'Cinema', field_hi: 'सिनेमा',
            category: 'cinema',
            description: 'The Nightingale of India, legendary playback singer for seven decades.',
            description_hi: 'भारत की कोकिला, सात दशकों तक महान पार्श्व गायिका।'
        },
        {
            name: 'Amit', name_hi: 'अमित',
            gender: 'male',
            personality: 'Amitabh Bachchan', personality_hi: 'अमिताभ बच्चन',
            field: 'Cinema', field_hi: 'सिनेमा',
            category: 'cinema',
            description: 'The "Shahenshah" of Bollywood, an icon of Indian cinema.',
            description_hi: 'बॉलीवुड के "शहंशाह", भारतीय सिनेमा के एक प्रतीक।'
        },
        {
            name: 'Ravi', name_hi: 'रवि',
            gender: 'male',
            personality: 'Ravi Shankar', personality_hi: 'रवि शंकर',
            field: 'Arts', field_hi: 'कला',
            category: 'cinema',
            description: 'Sitar virtuoso who introduced Indian classical music to the world.',
            description_hi: 'सितार वादक जिन्होंने भारतीय शास्त्रीय संगीत को दुनिया से परिचित कराया।'
        },
        {
            name: 'Amrita', name_hi: 'अमृता',
            gender: 'female',
            personality: 'Amrita Sher-Gil', personality_hi: 'अमृता शेरगिल',
            field: 'Arts', field_hi: 'कला',
            category: 'cinema',
            description: 'Pioneer of modern Indian art, known as India\'s Frida Kahlo.',
            description_hi: 'आधुनिक भारतीय कला की अग्रणी, जिन्हें भारत की फ्रिडा काहलो के रूप में जाना जाता है।'
        },
        {
            name: 'Ray', name_hi: 'रे',
            gender: 'male',
            personality: 'Satyajit Ray', personality_hi: 'सत्यजीत रे',
            field: 'Cinema', field_hi: 'सिनेमा',
            category: 'cinema',
            description: 'One of the greatest filmmakers of the 20th century.',
            description_hi: '20वीं सदी के महानतम फिल्म निर्माताओं में से एक।'
        },

        // Spiritual & Saints
        {
            name: 'Vivek', name_hi: 'विवेक',
            gender: 'male',
            personality: 'Swami Vivekananda', personality_hi: 'स्वामी विवेकानंद',
            field: 'Spirituality', field_hi: 'आध्यात्मिकता',
            category: 'spiritual',
            description: 'Spiritual leader who introduced Indian philosophies to the West.',
            description_hi: 'आध्यात्मिक नेता जिन्होंने पश्चिम को भारतीय दर्शन से परिचित कराया।'
        },
        {
            name: 'Meera', name_hi: 'मीरा',
            gender: 'female',
            personality: 'Mirabai', personality_hi: 'मीराबाई',
            field: 'Spirituality', field_hi: 'आध्यात्मिकता',
            category: 'spiritual',
            description: 'Mystic poet and devotee of Krishna, a symbol of divine love.',
            description_hi: 'रहस्यवादी कवयित्री और कृष्ण की भक्त, दिव्य प्रेम का प्रतीक।'
        },
        {
            name: 'Kabir', name_hi: 'कबीर',
            gender: 'male',
            personality: 'Saint Kabir', personality_hi: 'संत कबीर',
            field: 'Spirituality', field_hi: 'आध्यात्मिकता',
            category: 'spiritual',
            description: 'Mystic poet and saint who preached equality and harmony.',
            description_hi: 'रहस्यवादी कवि और संत जिन्होंने समानता और सद्भाव का उपदेश दिया।'
        },
        {
            name: 'Sufi', name_hi: 'सूफी',
            gender: 'unisiex',
            personality: 'Rumi', personality_hi: 'रूमी',
            field: 'Spirituality', field_hi: 'आध्यात्मिकता',
            category: 'spiritual',
            description: 'Persian poet and mystic whose words transcend cultures.',
            description_hi: 'फारसी कवि और रहस्यवादी जिनके शब्द संस्कृतियों से परे हैं।'
        },
        {
            name: 'Buddha', name_hi: 'बुद्ध',
            gender: 'male',
            personality: 'Gautama Buddha', personality_hi: 'गौतम बुद्ध',
            field: 'Spirituality', field_hi: 'आध्यात्मिकता',
            category: 'spiritual',
            description: 'The enlightened one, founder of Buddhism and preacher of peace.',
            description_hi: 'बुद्ध, बौद्ध धर्म के संस्थापक और शांति के प्रचारक।'
        },

        // Science & Innovators
        {
            name: 'Kalam', name_hi: 'कलाम',
            gender: 'male',
            personality: 'A.P.J. Abdul Kalam', personality_hi: 'ए.पी.जे. अब्दुल कलाम',
            field: 'Science', field_hi: 'विज्ञान',
            category: 'science',
            description: 'The Missile Man of India and beloved former President.',
            description_hi: 'भारत के मिसाइल मैन और प्रिय पूर्व राष्ट्रपति।'
        },
        {
            name: 'Homi', name_hi: 'होमी',
            gender: 'male',
            personality: 'Homi J. Bhabha', personality_hi: 'होमी जे. भाभा',
            field: 'Science', field_hi: 'विज्ञान',
            category: 'science',
            description: 'The father of the Indian nuclear program.',
            description_hi: 'भारतीय परमाणु कार्यक्रम के जनक।'
        },
        {
            name: 'Tessy', name_hi: 'टेसी',
            gender: 'female',
            personality: 'Tessy Thomas', personality_hi: 'टेसी थॉमस',
            field: 'Science', field_hi: 'विज्ञान',
            category: 'science',
            description: 'The "Missile Woman of India" and Agni-IV project director.',
            description_hi: 'भारत की "मिसाइल वुमन" और अग्नि- IV परियोजना निदेशक।'
        },
        {
            name: 'Jagdish', name_hi: 'जगदीश',
            gender: 'male',
            personality: 'J.C. Bose', personality_hi: 'जे.सी. बोस',
            field: 'Science', field_hi: 'विज्ञान',
            category: 'science',
            description: 'Polymath who pioneered the investigation of radio and microwave optics.',
            description_hi: 'बहुश्रुत जिन्होंने रेडियो और माइक्रोवेव प्रकाशिकी की जांच का बीजारोपण किया।'
        },

        // Freedom Fighters
        {
            name: 'Bhagat', name_hi: 'भगत',
            gender: 'male',
            personality: 'Bhagat Singh', personality_hi: 'भगत सिंह',
            field: 'Freedom', field_hi: 'स्वतंत्रता',
            category: 'freedom',
            description: 'Iconic revolutionary of the Indian independence movement.',
            description_hi: 'भारतीय स्वतंत्रता आंदोलन के क्रांतिकारी प्रतीक।'
        },
        {
            name: 'Azad', name_hi: 'आजाद',
            gender: 'male',
            personality: 'Chandra Shekhar Azad', personality_hi: 'चंद्रशेखर आजाद',
            field: 'Freedom', field_hi: 'स्वतंत्रता',
            category: 'freedom',
            description: 'A fearless revolutionary who reorganized the HRA.',
            description_hi: 'एक निडर क्रांतिकारी जिन्होंने एचआरए को पुनर्गठित किया।'
        },
        {
            name: 'Sarojini', name_hi: 'सरोजिनी',
            gender: 'female',
            personality: 'Sarojini Naidu', personality_hi: 'सरोजिनी नायडू',
            field: 'Freedom', field_hi: 'स्वतंत्रता',
            category: 'freedom',
            description: 'The Nightingale of India and a key leader in the freedom struggle.',
            description_hi: 'भारत की कोकिला और स्वतंत्रता संग्राम में एक प्रमुख नेता।'
        },
        {
            name: 'Subhash', name_hi: 'सुभाष',
            gender: 'male',
            personality: 'Subhash Chandra Bose', personality_hi: 'सुभाष चंद्र बोस',
            field: 'Freedom', field_hi: 'स्वतंत्रता',
            category: 'freedom',
            description: 'Netaji, whose leadership inspired the Indian National Army.',
            description_hi: 'नेताजी, जिनके नेतृत्व ने भारतीय राष्ट्रीय सेना को प्रेरित किया।'
        }
    ];

    // Language Toggle Listener
    const updateLanguage = () => {
        const lang = document.documentElement.lang || 'en';
        const isHindi = lang === 'hi';

        document.querySelectorAll("[data-en]").forEach(el => {
            const text = el.getAttribute(isHindi ? "data-hi" : "data-en");
            if (text) el.textContent = text;
        });

        // Re-display names with new language
        applyFilters();
    };

    const listeners = ['click']; // For flexibility if we adding more events
    const langBtns = document.querySelectorAll('#language-toggle, #language-toggle-mobile');
    langBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const current = document.documentElement.lang || 'en';
            const next = current === 'en' ? 'hi' : 'en';
            document.documentElement.lang = next;
            localStorage.setItem('language', next);
            updateLanguage();
        });
    });

    // Initialize display
    const savedLang = localStorage.getItem('language') || 'en';
    document.documentElement.lang = savedLang;
    updateLanguage();


    // Gender filter event
    genderPills.forEach(pill => {
        pill.addEventListener('click', () => {
            genderPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilters.gender = pill.dataset.value;
            applyFilters();
        });
    });

    // Category filter event
    categorySelect.addEventListener('change', () => {
        currentFilters.category = categorySelect.value;
        applyFilters();
    });

    function applyFilters() {
        let filtered = personalityNames.filter(name => {
            const genderMatch = currentFilters.gender === 'all' || name.gender === currentFilters.gender;
            const categoryMatch = currentFilters.category === 'all' || name.category === currentFilters.category;
            return genderMatch && categoryMatch;
        });

        displayNames(filtered);
    }

    function displayNames(names) {
        showingCount.textContent = names.length;
        namesGrid.innerHTML = '';

        const lang = document.documentElement.lang || 'en';
        const isHindi = lang === 'hi';

        if (names.length === 0) {
            namesGrid.innerHTML = isHindi
                ? '<p class="no-results">आपकी खोज से मेल खाने वाले कोई नाम नहीं मिले।</p>'
                : '<p class="no-results">No names found matching your criteria.</p>';
            return;
        }

        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

        names.forEach((nameObj, index) => {
            const isLiked = favorites.some(fav => favoriteNameOf(fav) === nameObj.name);
            const genderIcon = nameObj.gender === 'male' ? 'mars' : (nameObj.gender === 'female' ? 'venus' : 'venus-mars');

            // Language selection
            const displayName = isHindi ? (nameObj.name_hi || nameObj.name) : nameObj.name;
            const displayField = isHindi ? (nameObj.field_hi || nameObj.field) : nameObj.field;
            const displayPersonality = isHindi ? (nameObj.personality_hi || nameObj.personality) : nameObj.personality;
            const displayDesc = isHindi ? (nameObj.description_hi || nameObj.description) : nameObj.description;
            const inspiredLabel = isHindi ? 'प्रेरित' : 'Inspired By';

            const card = document.createElement('div');
            card.className = 'personality-card';
            card.style.animationDelay = `${index * 0.05}s`;

            card.innerHTML = `
                <div class="category-badge ${nameObj.category}">${displayField}</div>
                <button class="like-btn-card ${isLiked ? 'liked' : ''}" data-name="${nameObj.name}">
                    <i class="fas fa-heart"></i>
                </button>
                <div class="baby-name">${displayName}</div>
                <div class="gender-badge">
                    <i class="fas fa-${genderIcon}"></i> ${capitalize(nameObj.gender)}
                </div>
                <div class="inspired-by">
                    <div class="inspired-label">${inspiredLabel}</div>
                    <div class="personality-name">${displayPersonality}</div>
                </div>
                <div class="personality-description">${displayDesc}</div>
            `;

            // Click Handlers
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.like-btn-card')) {
                    // Integration point for details modal
                    // console.log('Details for:', nameObj.name);
                }
            });

            const likeBtn = card.querySelector('.like-btn-card');
            likeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleLike(likeBtn, nameObj);
            });

            namesGrid.appendChild(card);
        });
    }

    function toggleLike(button, nameData) {
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const index = favorites.findIndex(fav => favoriteNameOf(fav) === nameData.name);

        if (index > -1) {
            favorites.splice(index, 1);
            button.classList.remove('liked');
        } else {
            favorites.push({
                name: nameData.name,
                gender: capitalize(nameData.gender),
                meaning: `Inspired by ${nameData.personality}`
            });
            button.classList.add('liked');
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
        localStorage.setItem('naamin_favorites_v1', JSON.stringify(favorites));
        try { document.dispatchEvent(new CustomEvent('favoritesUpdated')); } catch (e) { }
        updateFavoriteCount();
    }

    function updateFavoriteCount() {
        const count = JSON.parse(localStorage.getItem('favorites') || '[]').length;
        const favCountEl = document.getElementById('fav-count');
        if (favCountEl) favCountEl.textContent = count;
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
});
