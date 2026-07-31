/* ===== Team builder =====
   Visual squad builder: pick up to 3 characters, save named teams locally.
   No stat/synergy data exists in the character API this site uses (only
   name/element/weapon/rarity/lore), so this is deliberately a "how do
   these three look together" tool, not a damage/synergy calculator. Teams
   store character IDs only (not full character snapshots) so names/
   portraits stay correct after a language switch, since the API returns
   those pre-localized per request rather than this site translating them
   itself — same reasoning as characters.js's own favorites-by-id storage. */
const WW_TEAMS_KEY = 'ww_teams';
const WW_TEAM_MAX_SIZE = 3;

let draftTeamIds = [];
let editingTeamId = null;
let teamPickerSearch = '';

function getTeams() {
    try {
        return JSON.parse(localStorage.getItem(WW_TEAMS_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function saveTeams(teams) {
    localStorage.setItem(WW_TEAMS_KEY, JSON.stringify(teams));
}

function findCharacterById(id) {
    return wwCharacters.find(c => c.Id === id) || null;
}

/* ===== Builder ===== */
function openTeamBuilder(editId) {
    editingTeamId = editId || null;
    const teams = getTeams();
    const existing = editingTeamId ? teams.find(tm => tm.id === editingTeamId) : null;
    draftTeamIds = existing ? existing.characterIds.slice() : [];
    document.getElementById('team-name-input').value = existing ? existing.name : '';
    teamPickerSearch = '';
    document.getElementById('team-picker-search').value = '';
    document.getElementById('team-builder').style.display = 'block';
    document.getElementById('team-builder-open-btn').style.display = 'none';
    renderTeamSlots();
    renderTeamPickerGrid();
}

function closeTeamBuilder() {
    editingTeamId = null;
    draftTeamIds = [];
    document.getElementById('team-builder').style.display = 'none';
    document.getElementById('team-builder-open-btn').style.display = '';
}

function onTeamPickerSearch(value) {
    teamPickerSearch = value.trim().toLowerCase();
    renderTeamPickerGrid();
}

function toggleDraftCharacter(id) {
    const idx = draftTeamIds.indexOf(id);
    if (idx >= 0) {
        draftTeamIds.splice(idx, 1);
    } else {
        if (draftTeamIds.length >= WW_TEAM_MAX_SIZE) return;
        draftTeamIds.push(id);
    }
    renderTeamSlots();
    renderTeamPickerGrid();
}

function renderTeamSlots() {
    const el = document.getElementById('team-slots');
    if (!el) return;
    const slots = Array.from({ length: WW_TEAM_MAX_SIZE }, (_, i) => draftTeamIds[i]);
    el.innerHTML = slots.map(id => {
        if (!id) return `<div class="team-slot team-slot-empty">+</div>`;
        const c = findCharacterById(id);
        if (!c) return `<div class="team-slot team-slot-empty">?</div>`;
        return `
        <div class="team-slot team-slot-filled" onclick="toggleDraftCharacter(${id})" style="border-color:${elementColor(c.Element.Name)}">
            <img src="${c.RoleHeadIcon}" alt="" loading="lazy" onerror="this.style.display='none'">
            <span class="team-slot-name">${escapeHtmlWw(c.Name)}</span>
        </div>`;
    }).join('');
}

function renderTeamPickerGrid() {
    const grid = document.getElementById('team-picker-grid');
    if (!grid) return;
    const filtered = wwCharacters.filter(c =>
        !teamPickerSearch || c.Name.toLowerCase().includes(teamPickerSearch)
    );
    if (filtered.length === 0) {
        grid.innerHTML = `<div class="ww-status">${t('characters_empty')}</div>`;
        return;
    }
    grid.innerHTML = filtered.map(c => {
        const selected = draftTeamIds.includes(c.Id);
        const disabled = !selected && draftTeamIds.length >= WW_TEAM_MAX_SIZE;
        return `
        <div class="character-card team-picker-card ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}" onclick="${disabled ? '' : `toggleDraftCharacter(${c.Id})`}">
            ${selected ? '<span class="team-picker-check">✓</span>' : ''}
            <div class="character-card-rarity">${rarityStars(c.QualityId)}</div>
            <img src="${c.RoleHeadIcon}" alt="" loading="lazy" onerror="this.style.display='none'">
            <div class="character-card-name">${escapeHtmlWw(c.Name)}</div>
            <div class="character-card-badge" style="color:${elementColor(c.Element.Name)}; border-color:${elementColor(c.Element.Name)}">${escapeHtmlWw(c.Element.Name)}</div>
        </div>`;
    }).join('');
}

function saveDraftTeam() {
    const nameInput = document.getElementById('team-name-input');
    const name = nameInput.value.trim();
    const status = document.getElementById('teams-status');
    if (!name) {
        status.textContent = t('teams_name_required');
        return;
    }
    if (draftTeamIds.length === 0) {
        status.textContent = t('teams_pick_required');
        return;
    }
    status.textContent = '';

    const teams = getTeams();
    if (editingTeamId) {
        const team = teams.find(tm => tm.id === editingTeamId);
        if (team) {
            team.name = name;
            team.characterIds = draftTeamIds.slice();
        }
    } else {
        teams.push({ id: 'team_' + Date.now(), name, characterIds: draftTeamIds.slice() });
    }
    saveTeams(teams);
    closeTeamBuilder();
    renderTeamsList();
}

function deleteTeam(id) {
    if (!confirm(t('teams_delete_confirm'))) return;
    saveTeams(getTeams().filter(tm => tm.id !== id));
    renderTeamsList();
}

/* ===== Saved teams list ===== */
function renderTeamsList() {
    const el = document.getElementById('teams-list');
    if (!el) return;
    const teams = getTeams();
    if (teams.length === 0) {
        el.innerHTML = `<p class="ww-status">${t('teams_empty')}</p>`;
        return;
    }
    el.innerHTML = teams.map(team => {
        const members = team.characterIds.map(id => findCharacterById(id)).filter(Boolean);
        return `
        <div class="team-card">
            <div class="team-card-header">
                <span class="team-card-name">${escapeHtmlWw(team.name)}</span>
                <div class="team-card-actions">
                    <button class="btn-small" onclick="openTeamBuilder('${team.id}')">${t('teams_edit')}</button>
                    <button class="btn-small danger" onclick="deleteTeam('${team.id}')">${t('teams_delete')}</button>
                </div>
            </div>
            <div class="team-card-members">
                ${members.map(c => `
                    <div class="team-member" style="border-color:${elementColor(c.Element.Name)}">
                        <img src="${c.RoleHeadIcon}" alt="" loading="lazy" onerror="this.style.display='none'">
                        <span class="team-member-name">${escapeHtmlWw(c.Name)}</span>
                        <span class="team-member-badge" style="color:${elementColor(c.Element.Name)}">${escapeHtmlWw(c.Element.Name)}</span>
                        <span class="team-member-weapon">${escapeHtmlWw(c.WeaponType.Name)}</span>
                    </div>
                `).join('')}
            </div>
        </div>`;
    }).join('');
}

function renderTeamsPage() {
    renderTeamsList();
    if (document.getElementById('team-builder').style.display !== 'none') {
        renderTeamSlots();
        renderTeamPickerGrid();
    }
}
