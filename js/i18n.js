/* ===== i18n (zh / ja only — matches the site family's other satellite site) =====
   Character names/elements/weapon types are NOT translated here — the encore.moe
   API already returns them pre-localized per the requested lang param. This file
   only covers UI chrome text. */
const I18N = {
    zh: {
        site_title: '鳴潮圖鑑',
        site_tagline: '✦ 角色資料庫 ✦',
        back_to_main: '← 返回 Hanabiの小天地',
        nav_characters: '角色圖鑑',
        nav_weapons: '武器圖鑑',
        nav_echoes: '聲骸圖鑑',

        characters_title: '✦ 角色圖鑑 ✦',
        search_placeholder: '搜尋角色名稱...',
        filter_all_element: '全部屬性',
        filter_all_weapon: '全部武器',
        characters_loading: '載入角色資料中...',
        characters_load_fail: '角色資料載入失敗，稍後再試',
        characters_empty: '找不到符合條件的項目',

        weapons_title: '✦ 武器圖鑑 ✦',
        search_placeholder_weapon: '搜尋武器名稱...',
        weapons_loading: '載入資料中...',
        weapons_load_fail: '資料載入失敗，稍後再試',

        echoes_title: '✦ 聲骸圖鑑 ✦',
        search_placeholder_echo: '搜尋聲骸名稱...',

        character_modal_loading: '載入詳情中...',
        character_modal_load_fail: '載入失敗，請稍後再試',
        character_modal_element: '屬性',
        character_modal_weapon: '武器',
        character_modal_rarity: '星級',
    },
    ja: {
        site_title: '鳴潮図鑑',
        site_tagline: '✦ キャラクターデータベース ✦',
        back_to_main: '← Hanabiの小天地に戻る',
        nav_characters: 'キャラ図鑑',
        nav_weapons: '武器図鑑',
        nav_echoes: '音骸図鑑',

        characters_title: '✦ キャラ図鑑 ✦',
        search_placeholder: 'キャラ名で検索...',
        filter_all_element: 'すべての属性',
        filter_all_weapon: 'すべての武器',
        characters_loading: 'キャラデータを読み込み中...',
        characters_load_fail: 'キャラデータの読み込みに失敗しました',
        characters_empty: '条件に一致する項目がありません',

        weapons_title: '✦ 武器図鑑 ✦',
        search_placeholder_weapon: '武器名で検索...',
        weapons_loading: '読み込み中...',
        weapons_load_fail: '読み込みに失敗しました',

        echoes_title: '✦ 音骸図鑑 ✦',
        search_placeholder_echo: '音骸名で検索...',

        character_modal_loading: '詳細を読み込み中...',
        character_modal_load_fail: '読み込みに失敗しました',
        character_modal_element: '属性',
        character_modal_weapon: '武器',
        character_modal_rarity: '星級',
    },
};

let siteLang = localStorage.getItem('ww_lang') || 'zh';

function applyLang(lang) {
    siteLang = lang;
    localStorage.setItem('ww_lang', lang);
    document.documentElement.lang = lang;
    const dict = I18N[lang] || I18N.zh;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.innerHTML = dict[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) el.placeholder = dict[key];
    });
    document.querySelectorAll('.lang-pill').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    if (dict.site_title) document.title = dict.site_title;
    if (typeof refreshDynamicContent === 'function') refreshDynamicContent();
}

function t(key, params) {
    const str = (I18N[siteLang] || I18N.zh)[key] || I18N.zh[key] || key;
    if (!params) return str;
    return Object.entries(params).reduce((s, [k, v]) => s.replace(`{${k}}`, v), str);
}
