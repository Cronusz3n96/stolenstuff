(function () {
  const CHAT_API_ORIGIN = typeof window !== 'undefined' && typeof window.__CHAT_API_ORIGIN__ === 'string' && window.__CHAT_API_ORIGIN__
    ? window.__CHAT_API_ORIGIN__.replace(/\/+$/, '')
    : ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '8090'
      ? 'http://127.0.0.1:8090'
      : window.location.origin);
  const SNAPSHOT_PATH = CHAT_API_ORIGIN + '/api/live/presence';
  const REFRESH_MS = 30000;
  const CLIENT_ID_STORAGE_KEY = 'sitePresenceClientId';

  let lastKnownCount = null;
  let refreshHandle = null;
  let inFlightRefresh = null;
  let clientId = '';

  function getCounterElements() {
    return {
      root: document.getElementById('liveCounter'),
      value: document.getElementById('liveCounterValue')
    };
  }

  function formatCount(count) {
    return new Intl.NumberFormat('en-US').format(Math.max(0, Math.floor(Number(count) || 0)));
  }

  function setCounterState(state, count, meta) {
    const elements = getCounterElements();
    if (!elements.root || !elements.value) {
      return;
    }

    elements.root.dataset.state = state;
    elements.value.textContent = count === null || count === undefined ? '...' : formatCount(count);
    if (meta) {
      elements.root.title = meta;
    }
  }

  function applyPresenceCount(count, meta) {
    lastKnownCount = count;
    setCounterState('live', count, meta || 'live users');
  }

  function isDocumentVisible() {
    return typeof document === 'undefined' || document.visibilityState !== 'hidden';
  }

  function getClientId() {
    if (clientId) {
      return clientId;
    }

    try {
      const storedValue = window.localStorage.getItem(CLIENT_ID_STORAGE_KEY);
      if (storedValue) {
        clientId = storedValue;
        return clientId;
      }
    } catch (error) {
    }

    const generatedValue = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : 'presence-' + Math.random().toString(36).slice(2) + Date.now().toString(36);

    clientId = generatedValue;

    try {
      window.localStorage.setItem(CLIENT_ID_STORAGE_KEY, clientId);
    } catch (error) {
    }

    return clientId;
  }

  async function refreshPresenceSnapshot() {
    if (inFlightRefresh) {
      return inFlightRefresh;
    }

    inFlightRefresh = (async function () {
      try {
        const requestUrl = SNAPSHOT_PATH + '?client=' + encodeURIComponent(getClientId());
        const response = await fetch(requestUrl, {
          method: 'GET',
          cache: 'no-store',
          credentials: 'same-origin'
        });

        if (!response.ok) {
          throw new Error('Snapshot request failed.');
        }

        const snapshot = await response.json();
        if (snapshot && typeof snapshot.count === 'number') {
          applyPresenceCount(snapshot.count, 'live users');
        }
      } catch (error) {
        if (lastKnownCount === null) {
          setCounterState('syncing', null, 'syncing');
        } else {
          setCounterState('live', lastKnownCount, 'live users');
        }
      } finally {
        inFlightRefresh = null;
      }
    })();

    return inFlightRefresh;
  }

  function scheduleRefresh() {
    if (refreshHandle) {
      window.clearInterval(refreshHandle);
    }

    refreshHandle = window.setInterval(function () {
      if (isDocumentVisible()) {
        refreshPresenceSnapshot();
      }
    }, REFRESH_MS);
  }

  function initOnlineCounter() {
    const elements = getCounterElements();
    if (!elements.root) {
      return;
    }

    setCounterState('loading', null, 'connecting');
    refreshPresenceSnapshot();
    scheduleRefresh();

    document.addEventListener('visibilitychange', function () {
      if (isDocumentVisible()) {
        refreshPresenceSnapshot();
      }
    });

    window.addEventListener('pagehide', function () {
      if (refreshHandle) {
        window.clearInterval(refreshHandle);
        refreshHandle = null;
      }
    }, { once: true });
  }

  document.addEventListener('DOMContentLoaded', initOnlineCounter);
}());
