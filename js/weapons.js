/* ===== Weapon grid: render, search, filter, detail modal =====
   Reuses the same .character-grid/.character-card/.modal-box CSS and the
   rarityStars()/escapeHtmlWw()/stripWwMarkup() helpers from characters.js —
   the visual pattern and text-safety rules are identical, only the fields differ. */
let wwWeapons = [];
let wwWeaponsLoaded = false;
let weaponSearchQuery = '';
let weaponTypeFilter = 'all';
let weaponSortMode = 'default';
let weaponFavoritesOnly = false;
const WW_WEAPON_FAVORITES_KEY = 'ww_favorite_weapons';

function ensureWeaponsLoaded() {
    if (!wwWeaponsLoaded) loadWeaponList();
}

function loadWeaponList() {
    const status = document.getElementById('weapon-status');
    if (status) status.textContent = t('weapons_loading');
    loadWeapons(siteLang, (weapons, meta) => {
        wwWeaponsLoaded = true;
        if (meta.error) {
            if (status) status.textContent = t('weapons_load_fail');
            return;
        }
        if (status) status.textContent = '';
        wwWeapons = weapons;
        populateWeaponFilterOptions(wwWeapons);
        renderWeaponGrid();
    });
}

function populateWeaponFilterOptions(weapons) {
    const select = document.getElementById('weapon-type-filter-select');
    if (!select) return;
    const types = [...new Map(weapons.map(w => [w.Type, w.TypeName])).entries()];
    const current = select.value;
    select.innerHTML = `<option value="all">${t('filter_all_weapon')}</option>` +
        types.map(([id, name]) => `<option value="${id}">${escapeHtmlWw(name)}</option>`).join('');
    select.value = [...select.options].some(o => o.value === current) ? current : 'all';
    weaponTypeFilter = select.value;
}

function onWeaponSearchInput(value) {
    weaponSearchQuery = value.trim().toLowerCase();
    renderWeaponGrid();
}

function onWeaponTypeFilterChange(value) {
    weaponTypeFilter = value;
    renderWeaponGrid();
}

function onWeaponSortChange(value) {
    weaponSortMode = value;
    renderWeaponGrid();
}

function onWeaponFavoritesOnlyChange(checked) {
    weaponFavoritesOnly = checked;
    renderWeaponGrid();
}

function toggleWeaponFavorite(id, event) {
    event.stopPropagation();
    toggleFavoriteId(WW_WEAPON_FAVORITES_KEY, id);
    renderWeaponGrid();
}

function getFilteredWeapons() {
    const filtered = wwWeapons.filter(w => {
        if (weaponSearchQuery && !w.Name.toLowerCase().includes(weaponSearchQuery)) return false;
        if (weaponTypeFilter !== 'all' && String(w.Type) !== weaponTypeFilter) return false;
        if (weaponFavoritesOnly && !isFavoriteId(WW_WEAPON_FAVORITES_KEY, w.Id)) return false;
        return true;
    });
    return sortByQuality(filtered, weaponSortMode, w => w.QualityId);
}

function renderWeaponGrid() {
    const grid = document.getElementById('weapon-grid');
    if (!grid) return;
    const filtered = getFilteredWeapons();

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="ww-status">${t('characters_empty')}</div>`;
        return;
    }

    grid.innerHTML = filtered.map(w => {
        const fav = isFavoriteId(WW_WEAPON_FAVORITES_KEY, w.Id);
        return `
        <div class="character-card" onclick="openWeaponModal(${w.Id})">
            <span class="card-fav-heart ${fav ? 'active' : ''}" onclick="toggleWeaponFavorite(${w.Id}, event)">${fav ? '♥' : '♡'}</span>
            <div class="character-card-rarity">${rarityStars(w.QualityId)}</div>
            <img src="${w.Icon}" alt="" loading="lazy" onerror="this.style.display='none'">
            <div class="character-card-name">${escapeHtmlWw(w.Name)}</div>
            <div class="character-card-badge">${escapeHtmlWw(w.TypeName)}</div>
        </div>
    `;
    }).join('');
}

/* ===== Detail modal ===== */
async function openWeaponModal(id) {
    const modal = document.getElementById('weapon-modal');
    const body = document.getElementById('weapon-modal-body');
    if (!modal || !body) return;
    const cached = wwWeapons.find(w => w.Id === id);
    body.innerHTML = `<div class="ww-status">${t('character_modal_loading')}</div>`;
    modal.style.display = 'flex';

    try {
        const detail = await loadWeaponDetail(siteLang, id);
        body.innerHTML = `
            <img class="character-modal-portrait" src="${(cached && cached.Icon) || ''}" alt="" onerror="this.style.display='none'">
            <h3 class="character-modal-name">${escapeHtmlWw(detail.WeaponName)}</h3>
            ${detail.ResonName ? `<p class="character-modal-nickname">${escapeHtmlWw(detail.ResonName)}</p>` : ''}
            <div class="character-modal-tags">
                <span class="character-modal-tag">${escapeHtmlWw(detail.WeaponTypeName)}</span>
                <span class="character-modal-tag" title="${escapeHtmlWw(detail.QualityName || '')}">${rarityStars(detail.QualityId)}</span>
            </div>
            ${detail.Desc ? `<p class="character-modal-intro">${escapeHtmlWw(stripWwMarkup(detail.Desc))}</p>` : ''}
            ${detail.AttributesDescription ? `<p class="character-modal-intro">${escapeHtmlWw(stripWwMarkup(detail.AttributesDescription))}</p>` : ''}
            <button class="btn-small character-modal-close-btn" onclick="closeWeaponModal()">✕</button>
        `;
    } catch (e) {
        console.error('Failed to load weapon detail:', e);
        body.innerHTML = `<div class="ww-status">${t('character_modal_load_fail')}</div><button class="btn-small character-modal-close-btn" onclick="closeWeaponModal()">✕</button>`;
    }
}

function closeWeaponModal() {
    const modal = document.getElementById('weapon-modal');
    if (modal) modal.style.display = 'none';
}

function closeWeaponModalOnOverlay(event) {
    if (event.target.id === 'weapon-modal') closeWeaponModal();
}
