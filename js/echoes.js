/* ===== Echo grid: render, search, filter, detail modal =====
   Echoes need no separate detail fetch — the list response already carries
   everything (Attributes flavor text + full FetterGroups set-bonus data),
   so the modal is built straight from the cached list item. */
let wwEchoes = [];
let wwEchoesLoaded = false;
let echoSearchQuery = '';
let echoElementFilter = 'all';

function ensureEchoesLoaded() {
    if (!wwEchoesLoaded) loadEchoList();
}

function loadEchoList() {
    const status = document.getElementById('echo-status');
    if (status) status.textContent = t('weapons_loading');
    loadEchoes(siteLang, (echoes, meta) => {
        wwEchoesLoaded = true;
        if (meta.error) {
            if (status) status.textContent = t('weapons_load_fail');
            return;
        }
        if (status) status.textContent = '';
        wwEchoes = echoes;
        populateEchoFilterOptions(wwEchoes);
        renderEchoGrid();
    });
}

function populateEchoFilterOptions(echoes) {
    const select = document.getElementById('echo-element-filter-select');
    if (!select) return;
    const elements = [...new Map(echoes.map(e => [e.Element.Id, e.Element.Name])).entries()];
    const current = select.value;
    select.innerHTML = `<option value="all">${t('filter_all_element')}</option>` +
        elements.map(([id, name]) => `<option value="${id}">${escapeHtmlWw(name)}</option>`).join('');
    select.value = [...select.options].some(o => o.value === current) ? current : 'all';
    echoElementFilter = select.value;
}

function onEchoSearchInput(value) {
    echoSearchQuery = value.trim().toLowerCase();
    renderEchoGrid();
}

function onEchoElementFilterChange(value) {
    echoElementFilter = value;
    renderEchoGrid();
}

function getFilteredEchoes() {
    return wwEchoes.filter(e => {
        if (echoSearchQuery && !e.Name.toLowerCase().includes(echoSearchQuery)) return false;
        if (echoElementFilter !== 'all' && String(e.Element.Id) !== echoElementFilter) return false;
        return true;
    });
}

function renderEchoGrid() {
    const grid = document.getElementById('echo-grid');
    if (!grid) return;
    const filtered = getFilteredEchoes();

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="ww-status">${t('characters_empty')}</div>`;
        return;
    }

    grid.innerHTML = filtered.map(e => {
        const color = elementColor(e.Element.Name);
        return `
        <div class="character-card" onclick="openEchoModal(${e.Id})">
            <div class="character-card-rarity">${rarityStars(Number(e.Rarity) + 1)}</div>
            <img src="${e.IconMiddle || e.Icon}" alt="" loading="lazy" onerror="this.style.display='none'">
            <div class="character-card-name">${escapeHtmlWw(e.Name)}</div>
            <div class="character-card-badge" style="color:${color}; border-color:${color}">${escapeHtmlWw(e.Element.Name)}</div>
        </div>
    `;
    }).join('');
}

/* ===== Detail modal ===== */
function openEchoModal(id) {
    const modal = document.getElementById('echo-modal');
    const body = document.getElementById('echo-modal-body');
    if (!modal || !body) return;
    const echo = wwEchoes.find(e => e.Id === id);
    if (!echo) return;

    const color = elementColor(echo.Element.Name);
    const fetterGroupsHtml = (echo.FetterGroups || []).map(group => `
        <div class="echo-fetter-group">
            <div class="echo-fetter-group-name">${escapeHtmlWw(group.Name)}</div>
            ${(group.Fetters || []).map(f => `<div class="echo-fetter-effect">${escapeHtmlWw(stripWwMarkup(f.EffectDescription || ''))}</div>`).join('')}
        </div>
    `).join('');

    body.innerHTML = `
        <img class="character-modal-portrait" src="${echo.Icon}" alt="" onerror="this.style.display='none'">
        <h3 class="character-modal-name">${escapeHtmlWw(echo.Name)}</h3>
        <div class="character-modal-tags">
            <span class="character-modal-tag" style="color:${color}; border-color:${color}">${escapeHtmlWw(echo.Element.Name)}</span>
            <span class="character-modal-tag">${rarityStars(Number(echo.Rarity) + 1)}</span>
        </div>
        ${fetterGroupsHtml ? `<div class="echo-fetter-groups">${fetterGroupsHtml}</div>` : ''}
        <button class="btn-small character-modal-close-btn" onclick="closeEchoModal()">✕</button>
    `;
    modal.style.display = 'flex';
}

function closeEchoModal() {
    const modal = document.getElementById('echo-modal');
    if (modal) modal.style.display = 'none';
}

function closeEchoModalOnOverlay(event) {
    if (event.target.id === 'echo-modal') closeEchoModal();
}
