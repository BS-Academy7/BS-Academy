/* ============================================
   B&S Academy - Dynamic QR Router
   ============================================ */

(function () {
  const FALLBACK_PLATFORM_URL = 'https://bs-academy7.github.io/BS-Academy/';
  const FALLBACK_SUPPORT_URL = 'https://wa.me/201550755928';
  let countdownTimer = null;

  document.addEventListener('DOMContentLoaded', initQrRouter);

  async function initQrRouter() {
    try {
      const settings = await fetchQrSettings();
      if (!settings) {
        redirectTo(FALLBACK_PLATFORM_URL);
        return;
      }

      const currentUrl = cleanUrl(settings.current_platform_url) || FALLBACK_PLATFORM_URL;
      if (!settings.transition_mode) {
        redirectTo(currentUrl);
        return;
      }

      const expiresAt = new Date(settings.expiration_timestamp);
      if (!Number.isFinite(expiresAt.getTime())) {
        redirectTo(currentUrl);
        return;
      }

      if (Date.now() >= expiresAt.getTime()) {
        renderExpired(settings);
        return;
      }

      renderTransition(settings, expiresAt);
    } catch (error) {
      console.warn('[B&S QR] Router fallback redirect', error);
      redirectTo(FALLBACK_PLATFORM_URL);
    }
  }

  async function fetchQrSettings() {
    if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined') {
      return null;
    }

    const endpoint = `${SUPABASE_URL}/rest/v1/rpc/get_qr_routing_settings?cache_bust=${Date.now()}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Cache-Control': 'no-store',
        Pragma: 'no-cache'
      }
    });

    if (!response.ok) return null;
    const rows = await response.json();
    return Array.isArray(rows) ? rows[0] : null;
  }

  function renderTransition(settings, expiresAt) {
    hideLoading();
    const transitionView = document.getElementById('qrTransition');
    const newUrl = cleanUrl(settings.new_platform_url) || cleanUrl(settings.current_platform_url) || FALLBACK_PLATFORM_URL;
    const mediaUrl = cleanUrl(settings.new_qr_media_url);

    setHref('qrNewPlatformBtn', newUrl);

    if (mediaUrl) {
      const wrap = document.getElementById('qrMediaWrap');
      const image = document.getElementById('qrMediaImage');
      const download = document.getElementById('qrDownloadBtn');
      image.src = mediaUrl;
      setHref('qrDownloadBtn', mediaUrl);
      download.setAttribute('download', 'bs-academy-new-qr');
      wrap.hidden = false;
      download.hidden = false;
    } else {
      const download = document.getElementById('qrDownloadBtn');
      if (download) download.hidden = true;
    }

    updateCountdown(expiresAt);
    countdownTimer = window.setInterval(() => updateCountdown(expiresAt), 1000);
    transitionView.hidden = false;
  }

  function renderExpired(settings) {
    hideLoading();
    if (countdownTimer) window.clearInterval(countdownTimer);
    setHref('qrSupportBtn', cleanUrl(settings.support_contact_url) || FALLBACK_SUPPORT_URL);
    document.getElementById('qrExpired').hidden = false;
  }

  function updateCountdown(expiresAt) {
    const remaining = expiresAt.getTime() - Date.now();
    if (remaining <= 0) {
      window.location.reload();
      return;
    }

    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    setText('qrDays', days);
    setText('qrHours', hours);
    setText('qrMinutes', minutes);
    setText('qrSeconds', seconds);
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = String(value).padStart(2, '0');
  }

  function setHref(id, href) {
    const node = document.getElementById(id);
    if (node) {
      node.href = href;
      node.rel = 'noopener';
    }
  }

  function cleanUrl(value) {
    return String(value || '').trim();
  }

  function hideLoading() {
    const loading = document.getElementById('qrLoading');
    if (loading) loading.hidden = true;
  }

  function redirectTo(url) {
    window.location.replace(url);
  }
})();
