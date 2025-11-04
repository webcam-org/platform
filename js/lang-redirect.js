// Auto-redirect to user's browser language (first visit only)
(function() {
  // Language mapping
  const langMap = {
    'es': '/test/es/',
    'fr': '/test/fr/',
    'de': '/test/de/',
    'pt': '/test/pt/',
    'pt-br': '/test/pt/',
    'it': '/test/it/',
    'ja': '/test/ja/',
    'zh': '/test/zh/',
    'zh-cn': '/test/zh/',
    'zh-hans': '/test/zh/',
    'ru': '/test/ru/',
    'ko': '/test/ko/',
    'ar': '/test/ar/'
  };

  // Only run on /test or /test/ (English version)
  if (!window.location.pathname.match(/^\/test\/?$/)) return;

  // Check if user has already manually selected a language
  if (localStorage.getItem('wt_lang_selected')) return;

  // Get browser language
  const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
  const shortLang = browserLang.split('-')[0]; // 'en-US' -> 'en'

  // Check for exact match first, then short code
  const targetLang = langMap[browserLang] || langMap[shortLang];

  if (targetLang) {
    // Redirect to appropriate language
    window.location.href = targetLang;
  }
})();
