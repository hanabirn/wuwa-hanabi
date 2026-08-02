/* ===== Updates tab: official Wuthering Waves news feed =====
   Kuro Games' official site (wutheringwaves.kurogames.com) itself loads its
   news list from a static, CORS-open CDN JSON — no API key or proxy needed,
   same trust posture as ww-data.js's encore.moe dataset: unofficial use of a
   discovered endpoint, could change, so cache-first + graceful degrade. */
const WW_NEWS_JSON_BASE = 'https://hw-media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/json/G152';
const WW_NEWS_SITE_BASE = 'https://wutheringwaves.kurogames.com';
// This CDN's language segment naming doesn't match the character API's
// (zh-Hant/ja/ko) — it uses the site's own route segments instead.
const WW_NEWS_LANG_MAP = { zh: 'zh-tw', ja: 'jp', en: 'en', ko: 'kr' };
const WW_NEWS_CACHE_PREFIX = 'ww_news_cache_';

let wwUpdatesLoaded = false;

function ensureUpdatesLoaded() {
    if (!wwUpdatesLoaded) loadWwNews();
}

function wwNewsLang(lang) {
    return WW_NEWS_LANG_MAP[lang] || 'en';
}

async function loadWwNews() {
    wwUpdatesLoaded = true;
    const container = document.getElementById('ww-news-list');
    if (!container) return;
    const newsLang = wwNewsLang(siteLang);
    const cacheKey = WW_NEWS_CACHE_PREFIX + newsLang;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            renderWwNews(JSON.parse(cached), newsLang);
        } catch (e) {
            // ignore corrupt cache, network fetch below will repopulate it
        }
    } else {
        container.innerHTML = `<div class="news-loading">${t('updates_loading')}</div>`;
    }

    try {
        const res = await fetch(`${WW_NEWS_JSON_BASE}/${newsLang}/ArticleMenu.json`);
        if (!res.ok) throw new Error('bad response');
        const data = await res.json();
        const items = data
            .slice()
            .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
            .slice(0, 20);
        localStorage.setItem(cacheKey, JSON.stringify(items));
        renderWwNews(items, newsLang);
    } catch (e) {
        console.error('WW news load failed:', e);
        if (!cached) container.innerHTML = `<div class="news-empty">${t('updates_load_fail')}</div>`;
    }
}

function renderWwNews(items, newsLang) {
    const container = document.getElementById('ww-news-list');
    if (!container) return;
    if (!items || items.length === 0) {
        container.innerHTML = `<div class="news-empty">${t('updates_empty')}</div>`;
        return;
    }
    container.innerHTML = items.map(n => {
        const dateStr = (n.startTime || n.createTime || '').slice(0, 10);
        const linkUrl = `${WW_NEWS_SITE_BASE}/${newsLang}/main/news/detail/${n.articleId}`;
        return `<a class="news-item" href="${linkUrl}" target="_blank" rel="noopener">
            <div class="news-item-body">
                <div class="news-item-header">
                    <span class="news-date">${dateStr}</span>
                </div>
                <span class="news-title">${escapeHtmlWw(n.articleTitle || '')}</span>
            </div>
        </a>`;
    }).join('');
}
