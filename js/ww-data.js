/* ===== Wuthering Waves character data, via encore.moe's undocumented (but CORS-open)
   API — same trust posture as the sekai-world dataset the sibling site relies on:
   unofficial, could change or go down, so cache-first + graceful degrade on failure. */
const WW_API_BASE = 'https://api-v2.encore.moe/api';
const WW_LANG_MAP = { zh: 'zh-Hant', ja: 'ja' }; // site lang -> API lang param
const WW_CHARACTER_CACHE_PREFIX = 'ww_character_cache_';

function wwApiLang(lang) {
    return WW_LANG_MAP[lang] || 'en';
}

async function loadCharacters(lang, onUpdate) {
    const apiLang = wwApiLang(lang);
    const cacheKey = WW_CHARACTER_CACHE_PREFIX + apiLang;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            onUpdate(JSON.parse(cached), { fromCache: true });
        } catch (e) {
            // ignore corrupt cache, network fetch below will repopulate it
        }
    }

    try {
        const res = await fetch(`${WW_API_BASE}/${apiLang}/character`);
        if (!res.ok) throw new Error('bad response');
        const data = await res.json();
        const roles = data.roleList || [];
        localStorage.setItem(cacheKey, JSON.stringify(roles));
        onUpdate(roles, { fromCache: false });
    } catch (e) {
        console.error('Failed to load character list:', e);
        if (!cached) onUpdate([], { fromCache: false, error: true });
    }
}

async function loadCharacterDetail(lang, id) {
    const apiLang = wwApiLang(lang);
    const res = await fetch(`${WW_API_BASE}/${apiLang}/character/${id}`);
    if (!res.ok) throw new Error('bad response');
    return res.json();
}
