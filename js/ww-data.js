/* ===== Wuthering Waves game data, via encore.moe's undocumented (but CORS-open)
   API — same trust posture as the sekai-world dataset the sibling site relies on:
   unofficial, could change or go down, so cache-first + graceful degrade on failure. */
const WW_API_BASE = 'https://api-v2.encore.moe/api';
const WW_LANG_MAP = { zh: 'zh-Hant', ja: 'ja', en: 'en', ko: 'ko' }; // site lang -> API lang param
const WW_CHARACTER_CACHE_PREFIX = 'ww_character_cache_';
const WW_WEAPON_CACHE_PREFIX = 'ww_weapon_cache_';
const WW_ECHO_CACHE_PREFIX = 'ww_echo_cache_';

function wwApiLang(lang) {
    return WW_LANG_MAP[lang] || 'en';
}

/* Shared cache-first list loader — character/weapon/echo list endpoints all
   follow the same shape, just under a different array key in the response. */
async function loadWwList(cacheKeyPrefix, apiPath, extractArray, lang, onUpdate) {
    const apiLang = wwApiLang(lang);
    const cacheKey = cacheKeyPrefix + apiLang;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            onUpdate(JSON.parse(cached), { fromCache: true });
        } catch (e) {
            // ignore corrupt cache, network fetch below will repopulate it
        }
    }

    try {
        const res = await fetch(`${WW_API_BASE}/${apiLang}/${apiPath}`);
        if (!res.ok) throw new Error('bad response');
        const data = await res.json();
        const list = extractArray(data) || [];
        localStorage.setItem(cacheKey, JSON.stringify(list));
        onUpdate(list, { fromCache: false });
    } catch (e) {
        console.error(`Failed to load ${apiPath} list:`, e);
        if (!cached) onUpdate([], { fromCache: false, error: true });
    }
}

function loadCharacters(lang, onUpdate) {
    return loadWwList(WW_CHARACTER_CACHE_PREFIX, 'character', d => d.roleList, lang, onUpdate);
}

function loadWeapons(lang, onUpdate) {
    return loadWwList(WW_WEAPON_CACHE_PREFIX, 'weapon', d => d.weapons, lang, onUpdate);
}

function loadEchoes(lang, onUpdate) {
    return loadWwList(WW_ECHO_CACHE_PREFIX, 'echo', d => d.Echo, lang, onUpdate);
}

async function loadCharacterDetail(lang, id) {
    const apiLang = wwApiLang(lang);
    const res = await fetch(`${WW_API_BASE}/${apiLang}/character/${id}`);
    if (!res.ok) throw new Error('bad response');
    return res.json();
}

async function loadWeaponDetail(lang, id) {
    const apiLang = wwApiLang(lang);
    const res = await fetch(`${WW_API_BASE}/${apiLang}/weapon/${id}`);
    if (!res.ok) throw new Error('bad response');
    return res.json();
}

/* Echoes need no separate detail call — the list endpoint already carries
   Attributes text and full FetterGroups (set-bonus) data per entry. */
