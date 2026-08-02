/* ===== Character grid: render, search, filter, detail modal ===== */
let wwCharacters = [];
let characterSearchQuery = '';
let characterElementFilter = 'all';
let characterWeaponFilter = 'all';
let characterSortMode = 'default';
let characterFavoritesOnly = false;
const WW_CHARACTER_FAVORITES_KEY = 'ww_favorite_characters';

function loadCharacterList() {
    const status = document.getElementById('character-status');
    if (status) status.textContent = t('characters_loading');
    loadCharacters(siteLang, (characters, meta) => {
        if (meta.error) {
            if (status) status.textContent = t('characters_load_fail');
            return;
        }
        if (status) status.textContent = '';
        wwCharacters = characters;
        populateFilterOptions(wwCharacters);
        renderCharacterGrid();
        initFeaturedCharacter();
        initCharacterBackgroundCarousel();
        if (typeof renderTeamsPage === 'function') renderTeamsPage();
    });
}

/* ===== Background photo carousel, built from the character API's own
   full-body art rather than a curated image set (unlike the 世界計畫
   sibling site, which has no such API and has to hand-pick fan art).
   FormationRoleCard only comes from the per-character detail endpoint,
   not the list, so covering every character means one detail fetch per
   character — fine since it's a one-time cost, cached in localStorage
   afterward so repeat visits don't refetch. Language-independent, so it
   only ever runs once per session (shuffled fresh each first-run, not
   re-shuffled on every reload — that's what the cache is for). */
const WW_BG_CACHE_KEY = 'ww_bg_character_art';
let wwBgCarouselInitialized = false;

async function initCharacterBackgroundCarousel() {
    if (wwBgCarouselInitialized || wwCharacters.length === 0) return;
    wwBgCarouselInitialized = true;

    let urls;
    const cached = localStorage.getItem(WW_BG_CACHE_KEY);
    if (cached) {
        try { urls = JSON.parse(cached); } catch (e) { urls = null; }
    }

    if (!urls || urls.length === 0) {
        const shuffled = wwCharacters.slice().sort(() => Math.random() - 0.5);
        const results = await Promise.all(shuffled.map(c =>
            loadCharacterDetail('en', c.Id).then(d => d.FormationRoleCard).catch(() => null)
        ));
        urls = results.filter(Boolean);
        if (urls.length > 0) localStorage.setItem(WW_BG_CACHE_KEY, JSON.stringify(urls));
    }

    renderBackgroundCarousel(urls);
}

function renderBackgroundCarousel(urls) {
    const container = document.getElementById('bg-carousel');
    if (!container || !urls || urls.length === 0) return;
    const half = Math.ceil(urls.length / 2);
    container.innerHTML =
        urls.slice(0, half).map(u => `<div class="bg-slide bg-slide-left" style="background-image:url('${u}')"></div>`).join('') +
        urls.slice(half).map(u => `<div class="bg-slide bg-slide-right" style="background-image:url('${u}')"></div>`).join('');
    runBgSlideCarousel('.bg-slide-left', 7000, 0);
    runBgSlideCarousel('.bg-slide-right', 7000, 3500);
}

function runBgSlideCarousel(selector, intervalMs, delayMs) {
    const slides = document.querySelectorAll('#bg-carousel ' + selector);
    if (!slides.length) return;
    let idx = 0;
    slides[0].classList.add('active');
    setTimeout(() => {
        setInterval(() => {
            slides[idx].classList.remove('active');
            idx = (idx + 1) % slides.length;
            slides[idx].classList.add('active');
        }, intervalMs);
    }, delayMs);
}

/* ===== Today's featured character — a small easter egg on the characters
   page: deterministic pick keyed off the calendar day (not Math.random(),
   so it's the same character all day and only changes at midnight), with
   a story/bio excerpt fetched fresh so it stays in the current language. */
async function initFeaturedCharacter() {
    const el = document.getElementById('featured-character-banner');
    if (!el || wwCharacters.length === 0) return;

    const dayIndex = Math.floor(Date.now() / 86400000);
    const character = wwCharacters[dayIndex % wwCharacters.length];

    try {
        const detail = await loadCharacterDetail(siteLang, character.Id);
        const excerptSource = (detail.Introduction && detail.Introduction.Content) ||
            (detail.Stories && detail.Stories[0] && detail.Stories[0].Content) || '';
        const excerpt = stripWwMarkup(excerptSource).replace(/\n+/g, ' ').trim().slice(0, 70);

        el.innerHTML = `
            <img class="featured-character-portrait" src="${character.RoleHeadIcon}" alt="" onerror="this.style.display='none'">
            <div class="featured-character-info">
                <div class="featured-character-label">${t('featured_character_label')}</div>
                <div class="featured-character-name">${escapeHtmlWw(character.Name)}</div>
                <p class="featured-character-excerpt">${escapeHtmlWw(excerpt)}${excerpt.length >= 70 ? '…' : ''}</p>
            </div>
        `;
        el.onclick = () => openCharacterModal(character.Id);
        el.style.display = 'flex';
    } catch (e) {
        console.error('Failed to load featured character:', e);
    }
}

/* Thematic per-element accent colors (identity badges, not a data chart —
   still kept to 6 fixed, visually distinct hues rather than picked ad hoc). */
const WW_ELEMENT_COLORS = {
    Aero: '#4ade80', 氣動: '#4ade80',
    Glacio: '#7dd3fc', 冷凝: '#7dd3fc',
    Havoc: '#ef4444', 湮滅: '#ef4444',
    Spectro: '#fbbf24', 衍射: '#fbbf24',
    Fusion: '#fb923c', 熱熔: '#fb923c',
    Electro: '#c084fc', 導電: '#c084fc',
    // Japanese element names
    風: '#4ade80', 冷: '#7dd3fc', 滅: '#ef4444', 光: '#fbbf24', 熱: '#fb923c', 電: '#c084fc',
};

function elementColor(name) {
    return WW_ELEMENT_COLORS[name] || 'var(--accent)';
}

function rarityStars(qualityId) {
    const count = Number(qualityId) || 0;
    return '★'.repeat(count);
}

/* Shared by characters/weapons/echoes — 'quality-desc'/'quality-asc' sort by
   rarity, anything else (the default option) leaves the list in the API's
   own order. */
function sortByQuality(list, mode, getQuality) {
    if (mode === 'quality-desc') return list.slice().sort((a, b) => getQuality(b) - getQuality(a));
    if (mode === 'quality-asc') return list.slice().sort((a, b) => getQuality(a) - getQuality(b));
    return list;
}

/* Shared favorites storage — same localStorage-array-of-ids approach as the
   世界計畫 sibling site, just parameterized by storage key so each of
   characters/weapons/echoes gets its own independent favorites list. */
function getFavoriteIds(storageKey) {
    try {
        return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch (e) {
        return [];
    }
}

function isFavoriteId(storageKey, id) {
    return getFavoriteIds(storageKey).includes(id);
}

function toggleFavoriteId(storageKey, id) {
    const favs = getFavoriteIds(storageKey);
    const idx = favs.indexOf(id);
    if (idx >= 0) favs.splice(idx, 1);
    else favs.push(id);
    localStorage.setItem(storageKey, JSON.stringify(favs));
}

function populateFilterOptions(characters) {
    const elementSelect = document.getElementById('element-filter-select');
    const weaponSelect = document.getElementById('weapon-filter-select');
    if (!elementSelect || !weaponSelect) return;

    const elements = [...new Map(characters.map(c => [c.Element.Id, c.Element.Name])).entries()];
    const weapons = [...new Map(characters.map(c => [c.WeaponType.Id, c.WeaponType.Name])).entries()];

    const currentElement = elementSelect.value;
    const currentWeapon = weaponSelect.value;

    elementSelect.innerHTML = `<option value="all">${t('filter_all_element')}</option>` +
        elements.map(([id, name]) => `<option value="${id}">${escapeHtmlWw(name)}</option>`).join('');
    weaponSelect.innerHTML = `<option value="all">${t('filter_all_weapon')}</option>` +
        weapons.map(([id, name]) => `<option value="${id}">${escapeHtmlWw(name)}</option>`).join('');

    elementSelect.value = [...elementSelect.options].some(o => o.value === currentElement) ? currentElement : 'all';
    weaponSelect.value = [...weaponSelect.options].some(o => o.value === currentWeapon) ? currentWeapon : 'all';
    characterElementFilter = elementSelect.value;
    characterWeaponFilter = weaponSelect.value;
}

function onCharacterSearchInput(value) {
    characterSearchQuery = value.trim().toLowerCase();
    renderCharacterGrid();
}

function onElementFilterChange(value) {
    characterElementFilter = value;
    renderCharacterGrid();
}

function onWeaponFilterChange(value) {
    characterWeaponFilter = value;
    renderCharacterGrid();
}

function onCharacterSortChange(value) {
    characterSortMode = value;
    renderCharacterGrid();
}

function onCharacterFavoritesOnlyChange(checked) {
    characterFavoritesOnly = checked;
    renderCharacterGrid();
}

function toggleCharacterFavorite(id, event) {
    event.stopPropagation();
    toggleFavoriteId(WW_CHARACTER_FAVORITES_KEY, id);
    renderCharacterGrid();
}

function getFilteredCharacters() {
    const filtered = wwCharacters.filter(c => {
        if (characterSearchQuery && !c.Name.toLowerCase().includes(characterSearchQuery)) return false;
        if (characterElementFilter !== 'all' && String(c.Element.Id) !== characterElementFilter) return false;
        if (characterWeaponFilter !== 'all' && String(c.WeaponType.Id) !== characterWeaponFilter) return false;
        if (characterFavoritesOnly && !isFavoriteId(WW_CHARACTER_FAVORITES_KEY, c.Id)) return false;
        return true;
    });
    return sortByQuality(filtered, characterSortMode, c => c.QualityId);
}

function renderCharacterGrid() {
    const grid = document.getElementById('character-grid');
    if (!grid) return;
    const filtered = getFilteredCharacters();

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="ww-status">${t('characters_empty')}</div>`;
        return;
    }

    grid.innerHTML = filtered.map(c => {
        const fav = isFavoriteId(WW_CHARACTER_FAVORITES_KEY, c.Id);
        return `
        <div class="character-card" onclick="openCharacterModal(${c.Id})">
            <span class="card-fav-heart ${fav ? 'active' : ''}" onclick="toggleCharacterFavorite(${c.Id}, event)">${fav ? '♥' : '♡'}</span>
            <div class="character-card-rarity">${rarityStars(c.QualityId)}</div>
            <img src="${c.RoleHeadIcon}" alt="" loading="lazy" onerror="this.style.display='none'">
            <div class="character-card-name">${escapeHtmlWw(c.Name)}</div>
            <div class="character-card-badge" style="color:${elementColor(c.Element.Name)}; border-color:${elementColor(c.Element.Name)}">${escapeHtmlWw(c.Element.Name)}</div>
        </div>
    `;
    }).join('');
}

function escapeHtmlWw(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : str;
    return div.innerHTML;
}

/* The API's free-text fields carry the game's own rich-text markup — term-link
   tags like "<te href=850086>Midnight Rangers</te>" in character bios, real
   <span style="color:..."> highlight tags in weapon skill text, <br> line
   breaks in stories/voice lines. Strip all of it rather than risk rendering
   raw third-party HTML; readability over styling. <br> becomes a real newline
   first so paragraph breaks survive (the modal text uses white-space: pre-line). */
function stripWwMarkup(str) {
    if (!str) return '';
    return str.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
}

/* ===== Detail modal — bio / stories / voice lines sub-tabs =====
   Stories and Words (voice lines) are long — 5 multi-paragraph stories and
   ~50 voice lines per character — so they render as collapsed accordion
   items rather than one long scroll, and only build once the tab is opened. */
let characterModalDetail = null;
let characterModalView = 'bio';
let characterModalVoiceAudio = null;
let characterModalVoiceBtn = null;

async function openCharacterModal(id) {
    const modal = document.getElementById('character-modal');
    const body = document.getElementById('character-modal-body');
    if (!modal || !body) return;
    stopCharacterModalVoice();
    characterModalDetail = null;
    characterModalView = 'bio';
    body.innerHTML = `<div class="ww-status">${t('character_modal_loading')}</div>`;
    modal.style.display = 'flex';

    try {
        characterModalDetail = await loadCharacterDetail(siteLang, id);
        renderCharacterModal();
    } catch (e) {
        console.error('Failed to load character detail:', e);
        body.innerHTML = `<div class="ww-status">${t('character_modal_load_fail')}</div><button class="btn-small character-modal-close-btn" onclick="closeCharacterModal()">✕</button>`;
    }
}

function switchCharacterModalView(view) {
    characterModalView = view;
    renderCharacterModal();
}

function renderCharacterModal() {
    const body = document.getElementById('character-modal-body');
    const detail = characterModalDetail;
    if (!body || !detail) return;
    const color = elementColor(detail.ElementName);

    const tabs = ['bio', 'stories', 'words', 'goods'].map(view => `
        <button class="character-modal-subtab-btn ${characterModalView === view ? 'active' : ''}" onclick="switchCharacterModalView('${view}')">${t('character_modal_tab_' + view)}</button>
    `).join('');

    let content;
    if (characterModalView === 'stories') content = renderCharacterStories(detail.Stories);
    else if (characterModalView === 'words') content = renderCharacterWords(detail.Words);
    else if (characterModalView === 'goods') content = renderCharacterGoods(detail.Goods);
    else content = renderCharacterBio(detail);

    const fullBodyArt = detail.FormationRoleCard || detail.RoleHeadIconLarge || detail.RoleHeadIconCircle;
    body.innerHTML = `
        <div class="character-modal-portrait-col">
            <img class="character-modal-portrait-fullbody" src="${fullBodyArt}" alt="" onerror="this.src='${detail.RoleHeadIconLarge || detail.RoleHeadIconCircle}'; this.className='character-modal-portrait'">
        </div>
        <div class="character-modal-info-col">
            <h3 class="character-modal-name">${escapeHtmlWw((detail.Name && detail.Name.Content) || '')}</h3>
            ${detail.NickName && detail.NickName.Content ? `<p class="character-modal-nickname">${escapeHtmlWw(detail.NickName.Content)}</p>` : ''}
            <div class="character-modal-tags">
                <span class="character-modal-tag" style="color:${color}; border-color:${color}">${escapeHtmlWw(detail.ElementName)}</span>
                <span class="character-modal-tag">${escapeHtmlWw(detail.WeaponTypeName)}</span>
                <span class="character-modal-tag">${rarityStars(detail.QualityId)}</span>
            </div>
            <div class="character-modal-subtabs">${tabs}</div>
            <div class="character-modal-view">${content}</div>
        </div>
        <button class="btn-small character-modal-close-btn" onclick="closeCharacterModal()">✕</button>
    `;
}

function renderCharacterBio(detail) {
    return detail.Introduction && detail.Introduction.Content
        ? `<p class="character-modal-intro">${escapeHtmlWw(stripWwMarkup(detail.Introduction.Content))}</p>`
        : `<p class="ww-status">${t('character_modal_bio_empty')}</p>`;
}

function renderCharacterStories(stories) {
    if (!stories || stories.length === 0) return `<p class="ww-status">${t('character_modal_stories_empty')}</p>`;
    return stories.map((s, i) => `
        <div class="character-story-item">
            <button class="character-story-title" onclick="toggleCharacterStory(${i})">
                <span>${escapeHtmlWw(s.Title)}</span>
                ${s.HintText ? `<span class="character-story-hint">${escapeHtmlWw(s.HintText)}</span>` : ''}
            </button>
            <div class="character-story-content" id="character-story-content-${i}" style="display:none;">${escapeHtmlWw(stripWwMarkup(s.Content))}</div>
        </div>
    `).join('');
}

function toggleCharacterStory(i) {
    const el = document.getElementById('character-story-content-' + i);
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function renderCharacterWords(words) {
    if (!words || words.length === 0) return `<p class="ww-status">${t('character_modal_words_empty')}</p>`;
    return words.map((w, i) => {
        const voiceUrl = { zh: w.VoiceZh, ja: w.VoiceJa, en: w.VoiceEn, ko: w.VoiceKo }[siteLang] || w.VoiceEn;
        return `
        <div class="character-word-item">
            <div class="character-word-header">
                <span class="character-word-title">${escapeHtmlWw(w.Title)}</span>
                ${voiceUrl ? `<button class="character-word-play-btn" id="character-word-play-${i}" onclick="toggleCharacterWordVoice(${i}, '${voiceUrl}')" title="${escapeHtmlWw(t('character_modal_voice_play'))}">▶</button>` : ''}
            </div>
            <div class="character-word-content">${escapeHtmlWw(stripWwMarkup(w.Content))}</div>
            ${w.HintText ? `<div class="character-story-hint">${escapeHtmlWw(w.HintText)}</div>` : ''}
        </div>
    `;
    }).join('');
}

function renderCharacterGoods(goods) {
    if (!goods || goods.length === 0) return `<p class="ww-status">${t('character_modal_goods_empty')}</p>`;
    return goods.map(g => `
        <div class="character-goods-item">
            <img class="character-goods-pic" src="${g.Pic || ''}" alt="" onerror="this.style.display='none'">
            <div class="character-goods-info">
                <div class="character-goods-title">${escapeHtmlWw(g.Title)}</div>
                <div class="character-goods-content">${escapeHtmlWw(stripWwMarkup(g.Content))}</div>
                ${g.Condition ? `<div class="character-story-hint">${escapeHtmlWw(g.Condition)}</div>` : ''}
            </div>
        </div>
    `).join('');
}

/* Some lines have no recording in every language yet — the API still returns
   a URL and the server answers 200, but the file is a ~1KB near-zero-duration
   stub instead of a real clip (confirmed: a Japanese line for a CN-voiced-only
   character loaded with duration 0.000979s). Detect that once metadata loads
   and mark the line unavailable rather than "playing" silence forever. */
function toggleCharacterWordVoice(i, url) {
    const btn = document.getElementById('character-word-play-' + i);
    const wasThisButton = characterModalVoiceBtn === btn;
    stopCharacterModalVoice();
    if (wasThisButton) return;

    const audio = new Audio(url);
    audio.onended = () => stopCharacterModalVoice();
    audio.addEventListener('loadedmetadata', () => {
        if (audio.duration < 0.3 && characterModalVoiceAudio === audio) {
            stopCharacterModalVoice();
            btn.disabled = true;
            btn.textContent = '🔇';
            btn.title = t('character_modal_voice_unavailable');
        }
    });
    characterModalVoiceAudio = audio;
    characterModalVoiceBtn = btn;
    if (btn) btn.textContent = '⏸';
    audio.play().catch(() => stopCharacterModalVoice());
}

function stopCharacterModalVoice() {
    if (characterModalVoiceAudio) {
        characterModalVoiceAudio.pause();
        characterModalVoiceAudio = null;
    }
    if (characterModalVoiceBtn) {
        characterModalVoiceBtn.textContent = '▶';
        characterModalVoiceBtn = null;
    }
}

function closeCharacterModal() {
    const modal = document.getElementById('character-modal');
    if (modal) modal.style.display = 'none';
    stopCharacterModalVoice();
    characterModalDetail = null;
}

function closeCharacterModalOnOverlay(event) {
    if (event.target.id === 'character-modal') closeCharacterModal();
}
