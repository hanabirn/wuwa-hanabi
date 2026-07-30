/* ===== Tab switching (only one tab today — 武器圖鑑/聲骸圖鑑 slot in here later) ===== */
function switchTab(tab, el) {
    document.querySelectorAll('.ww-page').forEach(p => p.style.display = 'none');
    document.getElementById('page-' + tab).style.display = 'block';
    document.querySelectorAll('.ww-nav-btn').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');
}

/* ===== Re-render already-loaded content after a language switch =====
   Character names/elements/etc. come pre-localized from the API, so a language
   switch has to re-fetch, not just re-render the same data with new labels. */
function refreshDynamicContent() {
    document.getElementById('character-status').textContent = t('characters_loading');
    loadCharacters(siteLang, (characters, meta) => {
        if (meta.error) {
            document.getElementById('character-status').textContent = t('characters_load_fail');
            return;
        }
        document.getElementById('character-status').textContent = '';
        wwCharacters = characters;
        populateFilterOptions(wwCharacters);
        renderCharacterGrid();
    });
}

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', () => {
    applyLang(siteLang);
});
