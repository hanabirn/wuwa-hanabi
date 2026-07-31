/* ===== Tab switching — characters loads eagerly (default tab), weapons/echoes
   lazy-load on first visit, matching the sekai sibling site's convention for
   its secondary tabs (world ranking / updates feed). ===== */
function switchTab(tab, el) {
    document.querySelectorAll('.ww-page').forEach(p => p.style.display = 'none');
    document.getElementById('page-' + tab).style.display = 'block';
    document.querySelectorAll('.ww-nav-btn').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');
    if (tab === 'weapons') ensureWeaponsLoaded();
    if (tab === 'echoes') ensureEchoesLoaded();
    if (tab === 'teams') renderTeamsPage();
}

/* ===== Re-render already-loaded content after a language switch =====
   Names/elements/etc. come pre-localized from the API, so a language switch
   has to re-fetch each category that's already been loaded, not just relabel. */
function refreshDynamicContent() {
    loadCharacterList();
    if (wwWeaponsLoaded) loadWeaponList();
    if (wwEchoesLoaded) loadEchoList();
}

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', () => {
    applyLang(siteLang);
});
