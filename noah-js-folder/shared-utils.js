(function () {
  const DEFAULT_LOGO = 'https://cdn.jsdelivr.net/gh/NoahsAmazingTutoringHelp/Noahs-Calculus-Tutor/images/logo.png';
  const DEFAULT_FAVICON = 'https://raw.githubusercontent.com/NoahsAmazingTutoringHelp/Noahs-Calculus-Tutor/master/cuh.png';
  const DEFAULT_INACTIVE_FAVICON = 'https://raw.githubusercontent.com/NoahsAmazingTutoringHelp/Noahs-Calculus-Tutor/master/images/fruh.png';
  const DEFAULT_ACCENT_COLOR = '#c27c15';

  const SITE_ASSETS = {
    DEFAULT_LOGO,
    DEFAULT_FAVICON,
    DEFAULT_INACTIVE_FAVICON,
    DEFAULT_ACCENT_COLOR
  };

  const THEME_CLASSES = [
    'theme-rainbow',
    'theme-cyber-green',
    'theme-ice-blue',
    'theme-solarized',
    'theme-purple-haze'
  ];

  const SETTING_DEFAULTS = {
    selectedTheme: 'default',
    selectedBackground: 'matrix',
    customThemeColor: DEFAULT_ACCENT_COLOR,
    cursorEnabled: 'true',
    cursorStyle: 'ring',
    inactiveTabTitle: 'Home',
    inactiveTabFavicon: DEFAULT_INACTIVE_FAVICON,
    customLogo: null,
    flashEnabled: 'true',
    lastSearchTerm: '',
    sortMethod: 'default',
    adsDisabled: 'false'
  };

  const LOGO_SELECTOR = '.logo, .home-logo';

  function getStorage() {
    try {
      return window.localStorage;
    } catch (error) {
      return null;
    }
  }

  function readStoredSetting(key) {
    const storage = getStorage();
    if (!storage) {
      return null;
    }
    try {
      return storage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function readSetting(key) {
    const stored = readStoredSetting(key);
    if (stored !== null && stored !== undefined && stored !== '') {
      return stored;
    }
    return Object.prototype.hasOwnProperty.call(SETTING_DEFAULTS, key)
      ? SETTING_DEFAULTS[key]
      : stored;
  }

  function writeSetting(key, value) {
    const storage = getStorage();
    if (!storage) {
      return;
    }
    try {
      storage.setItem(key, value === null || value === undefined ? '' : String(value));
    } catch (error) {
    }
  }

  function removeSetting(key) {
    const storage = getStorage();
    if (!storage) {
      return;
    }
    try {
      storage.removeItem(key);
    } catch (error) {
    }
  }

  function readJsonSetting(key, fallback) {
    const stored = readStoredSetting(key);
    if (stored === null) {
      return fallback;
    }
    try {
      const parsed = JSON.parse(stored);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (error) {
      return fallback;
    }
  }

  function writeJsonSetting(key, value) {
    try {
      writeSetting(key, JSON.stringify(value));
    } catch (error) {
    }
  }

  function trackEvent(action, params) {
    if (typeof window.gtag !== 'function') {
      return;
    }
    window.gtag('event', action, params || {});
  }

  function trackGameEvent(action, label, value) {
    trackEvent(action, {
      'event_category': 'game_interaction',
      'event_label': label,
      'value': value === undefined ? 1 : value
    });
  }

  function trackSettingsEvent(action, label, value) {
    trackEvent(action, {
      'event_category': 'settings',
      'event_label': label,
      'value': value === undefined ? 1 : value
    });
  }

  function getFullscreenElement() {
    return document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      null;
  }

  function requestFullscreen(element) {
    if (!element) {
      return;
    }
    const request = element.requestFullscreen ||
      element.webkitRequestFullscreen ||
      element.msRequestFullscreen ||
      element.mozRequestFullScreen;
    if (request) {
      request.call(element);
    }
  }

  function exitFullscreen() {
    const exit = document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.msExitFullscreen ||
      document.mozCancelFullScreen;
    if (exit) {
      exit.call(document);
    }
  }

  function resetThemeClasses(target) {
    const body = target || document.body;
    if (!body) {
      return;
    }
    body.classList.remove.apply(body.classList, THEME_CLASSES);
  }

  function setActiveThemeOption(themeName) {
    document.querySelectorAll('.theme-option').forEach(option => {
      option.classList.remove('active');
    });
    const activeOption = document.querySelector(`.theme-option[data-theme="${themeName}"]`);
    if (activeOption) {
      activeOption.classList.add('active');
    }
  }

  function forEachSiteLogo(callback) {
    document.querySelectorAll(LOGO_SELECTOR).forEach(callback);
  }

  function setLogoPreview(src) {
    const logoPreview = document.getElementById('logoPreview');
    if (!logoPreview) {
      return;
    }
    const previewImg = logoPreview.querySelector('img');
    if (!previewImg) {
      return;
    }
    previewImg.src = src;
    previewImg.style.display = 'block';
    const placeholderIcon = logoPreview.querySelector('i');
    if (placeholderIcon) {
      placeholderIcon.style.display = 'none';
    }
  }

  function flashButtonFeedback(button, label, options) {
    if (!button) {
      return;
    }
    const settings = options || {};
    const duration = settings.duration || 1500;
    const originalHTML = button.innerHTML;
    const originalBackground = button.style.background;
    const originalBorderColor = button.style.borderColor;
    button.innerHTML = label;
    button.style.borderColor = settings.borderColor || 'var(--accent-orange)';
    button.style.background = settings.background || 'rgba(var(--primary-orange-rgb), 0.3)';
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.style.background = originalBackground;
      button.style.borderColor = originalBorderColor;
    }, duration);
  }

  function getApiOrigin() {
    if (typeof window.__CHAT_API_ORIGIN__ === 'string' && window.__CHAT_API_ORIGIN__) {
      return window.__CHAT_API_ORIGIN__.replace(/\/+$/, '');
    }
    const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isLocalHost && window.location.port !== '8090'
      ? 'http://127.0.0.1:8090'
      : window.location.origin;
  }

  function escapeHtml(value) {
    return String(value === null || value === undefined ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.NoahShared = {
    SITE_ASSETS,
    THEME_CLASSES,
    SETTING_DEFAULTS,
    LOGO_SELECTOR,
    readSetting,
    readStoredSetting,
    writeSetting,
    removeSetting,
    readJsonSetting,
    writeJsonSetting,
    trackEvent,
    trackGameEvent,
    trackSettingsEvent,
    getFullscreenElement,
    requestFullscreen,
    exitFullscreen,
    resetThemeClasses,
    setActiveThemeOption,
    forEachSiteLogo,
    setLogoPreview,
    flashButtonFeedback,
    getApiOrigin,
    escapeHtml
  };
}());
