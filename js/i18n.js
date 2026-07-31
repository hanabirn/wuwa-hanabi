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
        nav_teams: '編隊',
        nav_weapons: '武器圖鑑',
        nav_echoes: '聲骸圖鑑',
        nav_music: '音樂',

        teams_title: '✦ 編隊 ✦',
        teams_hint: '從角色圖鑑挑選最多 3 位角色組成隊伍，儲存在本機瀏覽器中。',
        teams_add_btn: '+ 新增隊伍',
        teams_name_placeholder: '隊伍名稱...',
        teams_save: '儲存隊伍',
        teams_cancel: '取消',
        teams_edit: '編輯',
        teams_delete: '刪除',
        teams_delete_confirm: '確定要刪除這個隊伍嗎？',
        teams_empty: '還沒有任何隊伍，點擊上方按鈕開始編隊吧！',
        teams_name_required: '請輸入隊伍名稱',
        teams_pick_required: '請至少選擇一位角色',

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
        character_modal_tab_bio: '簡介',
        character_modal_tab_stories: '故事',
        character_modal_tab_words: '心聲',
        character_modal_tab_goods: '藏品',
        character_modal_bio_empty: '尚無簡介資料',
        character_modal_stories_empty: '尚無故事資料',
        character_modal_words_empty: '尚無語音資料',
        character_modal_goods_empty: '尚無藏品資料',
        character_modal_voice_play: '播放語音',
        character_modal_voice_unavailable: '此語言暫無語音',

        sort_default: '預設排序',
        sort_quality_desc: '星級（高到低）',
        sort_quality_asc: '星級（低到高）',

        filter_favorites_only: '只看最愛',
        featured_character_label: '✦ 今日推薦角色 ✦',

        music_title: '✦ 音樂 ✦',
        music_hint: 'Kuro Games 官方 Spotify 歌單「All Wuthering Waves Songs」，登入 Spotify 可完整播放，未登入僅能試聽 30 秒。',
    },
    ja: {
        site_title: '鳴潮図鑑',
        site_tagline: '✦ キャラクターデータベース ✦',
        back_to_main: '← Hanabiの小天地に戻る',
        nav_characters: 'キャラ図鑑',
        nav_teams: '編成',
        nav_weapons: '武器図鑑',
        nav_echoes: '音骸図鑑',
        nav_music: '音楽',

        teams_title: '✦ 編成 ✦',
        teams_hint: 'キャラ図鑑から最大3人のキャラを選んでチームを組み、ブラウザに保存します。',
        teams_add_btn: '+ チームを追加',
        teams_name_placeholder: 'チーム名...',
        teams_save: 'チームを保存',
        teams_cancel: 'キャンセル',
        teams_edit: '編集',
        teams_delete: '削除',
        teams_delete_confirm: 'このチームを削除しますか？',
        teams_empty: 'まだチームがありません。上のボタンから作成しましょう！',
        teams_name_required: 'チーム名を入力してください',
        teams_pick_required: '少なくとも1人のキャラを選んでください',

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
        character_modal_tab_bio: 'プロフィール',
        character_modal_tab_stories: 'ストーリー',
        character_modal_tab_words: 'ボイス',
        character_modal_tab_goods: 'アイテム',
        character_modal_bio_empty: 'プロフィール情報がありません',
        character_modal_stories_empty: 'ストーリーがありません',
        character_modal_words_empty: 'ボイスがありません',
        character_modal_goods_empty: 'アイテムがありません',
        character_modal_voice_play: 'ボイス再生',
        character_modal_voice_unavailable: 'この言語のボイスは未収録です',

        sort_default: 'デフォルト順',
        sort_quality_desc: 'レア度（高い順）',
        sort_quality_asc: 'レア度（低い順）',

        filter_favorites_only: 'お気に入りのみ',
        featured_character_label: '✦ 今日のおすすめキャラ ✦',

        music_title: '✦ 音楽 ✦',
        music_hint: 'Kuro Games公式Spotifyプレイリスト「All Wuthering Waves Songs」。Spotifyにログインすればフル再生、未ログインは30秒のみ試聴可能です。',
    },
    en: {
        site_title: 'Wuthering Waves Compendium',
        site_tagline: '✦ Character Database ✦',
        back_to_main: '← Back to Hanabiの小天地',
        nav_characters: 'Characters',
        nav_teams: 'Teams',
        nav_weapons: 'Weapons',
        nav_echoes: 'Echoes',
        nav_music: 'Music',

        teams_title: '✦ Teams ✦',
        teams_hint: 'Pick up to 3 characters from the character compendium to build a team, saved locally in your browser.',
        teams_add_btn: '+ New Team',
        teams_name_placeholder: 'Team name...',
        teams_save: 'Save Team',
        teams_cancel: 'Cancel',
        teams_edit: 'Edit',
        teams_delete: 'Delete',
        teams_delete_confirm: 'Delete this team?',
        teams_empty: 'No teams yet — click the button above to build one!',
        teams_name_required: 'Please enter a team name',
        teams_pick_required: 'Please select at least one character',

        characters_title: '✦ Characters ✦',
        search_placeholder: 'Search character name...',
        filter_all_element: 'All Elements',
        filter_all_weapon: 'All Weapons',
        characters_loading: 'Loading character data...',
        characters_load_fail: 'Failed to load character data, please try again later',
        characters_empty: 'No matching items found',

        weapons_title: '✦ Weapons ✦',
        search_placeholder_weapon: 'Search weapon name...',
        weapons_loading: 'Loading...',
        weapons_load_fail: 'Failed to load, please try again later',

        echoes_title: '✦ Echoes ✦',
        search_placeholder_echo: 'Search echo name...',

        character_modal_loading: 'Loading details...',
        character_modal_load_fail: 'Failed to load, please try again later',
        character_modal_element: 'Element',
        character_modal_weapon: 'Weapon',
        character_modal_rarity: 'Rarity',
        character_modal_tab_bio: 'Bio',
        character_modal_tab_stories: 'Stories',
        character_modal_tab_words: 'Voice Lines',
        character_modal_tab_goods: 'Keepsakes',
        character_modal_bio_empty: 'No bio available',
        character_modal_stories_empty: 'No stories available',
        character_modal_words_empty: 'No voice lines available',
        character_modal_goods_empty: 'No keepsakes available',
        character_modal_voice_play: 'Play voice line',
        character_modal_voice_unavailable: 'Not voiced in this language',

        sort_default: 'Default Order',
        sort_quality_desc: 'Rarity (High to Low)',
        sort_quality_asc: 'Rarity (Low to High)',

        filter_favorites_only: 'Favorites Only',
        featured_character_label: '✦ Character of the Day ✦',

        music_title: '✦ Music ✦',
        music_hint: 'Kuro Games\' official Spotify playlist "All Wuthering Waves Songs" — log into Spotify for full playback, or listen to 30-second previews without logging in.',
    },
    ko: {
        site_title: '명조 도감',
        site_tagline: '✦ 캐릭터 데이터베이스 ✦',
        back_to_main: '← Hanabiの小天地로 돌아가기',
        nav_characters: '캐릭터 도감',
        nav_teams: '편성',
        nav_weapons: '무기 도감',
        nav_echoes: '음해 도감',
        nav_music: '음악',

        teams_title: '✦ 편성 ✦',
        teams_hint: '캐릭터 도감에서 최대 3명을 선택해 팀을 구성하고, 브라우저에 저장합니다.',
        teams_add_btn: '+ 팀 추가',
        teams_name_placeholder: '팀 이름...',
        teams_save: '팀 저장',
        teams_cancel: '취소',
        teams_edit: '수정',
        teams_delete: '삭제',
        teams_delete_confirm: '이 팀을 삭제하시겠습니까?',
        teams_empty: '아직 팀이 없습니다. 위 버튼을 눌러 팀을 만들어보세요!',
        teams_name_required: '팀 이름을 입력해주세요',
        teams_pick_required: '캐릭터를 하나 이상 선택해주세요',

        characters_title: '✦ 캐릭터 도감 ✦',
        search_placeholder: '캐릭터 이름 검색...',
        filter_all_element: '전체 속성',
        filter_all_weapon: '전체 무기',
        characters_loading: '캐릭터 데이터를 불러오는 중...',
        characters_load_fail: '데이터를 불러오지 못했습니다. 나중에 다시 시도해주세요',
        characters_empty: '조건에 맞는 항목이 없습니다',

        weapons_title: '✦ 무기 도감 ✦',
        search_placeholder_weapon: '무기 이름 검색...',
        weapons_loading: '불러오는 중...',
        weapons_load_fail: '불러오기에 실패했습니다',

        echoes_title: '✦ 음해 도감 ✦',
        search_placeholder_echo: '음해 이름 검색...',

        character_modal_loading: '상세 정보를 불러오는 중...',
        character_modal_load_fail: '불러오기에 실패했습니다',
        character_modal_element: '속성',
        character_modal_weapon: '무기',
        character_modal_rarity: '등급',
        character_modal_tab_bio: '프로필',
        character_modal_tab_stories: '스토리',
        character_modal_tab_words: '보이스',
        character_modal_tab_goods: '소장품',
        character_modal_bio_empty: '프로필 정보가 없습니다',
        character_modal_stories_empty: '스토리가 없습니다',
        character_modal_words_empty: '보이스가 없습니다',
        character_modal_goods_empty: '소장품이 없습니다',
        character_modal_voice_play: '보이스 재생',
        character_modal_voice_unavailable: '이 언어의 보이스가 없습니다',

        sort_default: '기본 정렬',
        sort_quality_desc: '등급 (높은순)',
        sort_quality_asc: '등급 (낮은순)',

        filter_favorites_only: '즐겨찾기만',
        featured_character_label: '✦ 오늘의 추천 캐릭터 ✦',

        music_title: '✦ 음악 ✦',
        music_hint: 'Kuro Games 공식 Spotify 플레이리스트 「All Wuthering Waves Songs」. Spotify에 로그인하면 전체 재생, 로그인하지 않으면 30초 미리듣기만 가능합니다.',
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
