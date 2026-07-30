/* ===== Character grid: render, search, filter, detail modal ===== */
let wwCharacters = [];
let characterSearchQuery = '';
let characterElementFilter = 'all';
let characterWeaponFilter = 'all';

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
    });
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

function getFilteredCharacters() {
    return wwCharacters.filter(c => {
        if (characterSearchQuery && !c.Name.toLowerCase().includes(characterSearchQuery)) return false;
        if (characterElementFilter !== 'all' && String(c.Element.Id) !== characterElementFilter) return false;
        if (characterWeaponFilter !== 'all' && String(c.WeaponType.Id) !== characterWeaponFilter) return false;
        return true;
    });
}

function renderCharacterGrid() {
    const grid = document.getElementById('character-grid');
    if (!grid) return;
    const filtered = getFilteredCharacters();

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="ww-status">${t('characters_empty')}</div>`;
        return;
    }

    grid.innerHTML = filtered.map(c => `
        <div class="character-card" onclick="openCharacterModal(${c.Id})">
            <div class="character-card-rarity">${rarityStars(c.QualityId)}</div>
            <img src="${c.RoleHeadIcon}" alt="" loading="lazy" onerror="this.style.display='none'">
            <div class="character-card-name">${escapeHtmlWw(c.Name)}</div>
            <div class="character-card-badge" style="color:${elementColor(c.Element.Name)}; border-color:${elementColor(c.Element.Name)}">${escapeHtmlWw(c.Element.Name)}</div>
        </div>
    `).join('');
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

    const tabs = ['bio', 'stories', 'words'].map(view => `
        <button class="character-modal-subtab-btn ${characterModalView === view ? 'active' : ''}" onclick="switchCharacterModalView('${view}')">${t('character_modal_tab_' + view)}</button>
    `).join('');

    let content;
    if (characterModalView === 'stories') content = renderCharacterStories(detail.Stories);
    else if (characterModalView === 'words') content = renderCharacterWords(detail.Words);
    else content = renderCharacterBio(detail);

    body.innerHTML = `
        <img class="character-modal-portrait" src="${detail.RoleHeadIconLarge || detail.RoleHeadIconCircle}" alt="" onerror="this.style.display='none'">
        <h3 class="character-modal-name">${escapeHtmlWw((detail.Name && detail.Name.Content) || '')}</h3>
        ${detail.NickName && detail.NickName.Content ? `<p class="character-modal-nickname">${escapeHtmlWw(detail.NickName.Content)}</p>` : ''}
        <div class="character-modal-tags">
            <span class="character-modal-tag" style="color:${color}; border-color:${color}">${escapeHtmlWw(detail.ElementName)}</span>
            <span class="character-modal-tag">${escapeHtmlWw(detail.WeaponTypeName)}</span>
            <span class="character-modal-tag">${rarityStars(detail.QualityId)}</span>
        </div>
        <div class="character-modal-subtabs">${tabs}</div>
        <div class="character-modal-view">${content}</div>
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
        const voiceUrl = siteLang === 'ja' ? w.VoiceJa : w.VoiceZh;
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

function toggleCharacterWordVoice(i, url) {
    const btn = document.getElementById('character-word-play-' + i);
    const wasThisButton = characterModalVoiceBtn === btn;
    stopCharacterModalVoice();
    if (wasThisButton) return;

    const audio = new Audio(url);
    audio.onended = () => stopCharacterModalVoice();
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
