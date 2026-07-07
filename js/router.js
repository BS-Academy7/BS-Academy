/* ============================================
   B&S Academy — Simple Hash Router
   Handles switching between: home, login, signup,
   dashboard, admin — all within this single
   index.html (no page reload, works perfectly on
   GitHub Pages static hosting).
   ============================================ */

const PAGE_MAP = {
  'page-home': 'page-home',
  'auth-login': 'page-login',
  'auth-signup': 'page-signup',
  'page-dashboard': 'page-dashboard',
  'page-admin': 'page-admin'
};

const VALID_SECTOR_KEYS = ['engineering', 'automation', 'accounting', 'academic', 'highschool', 'kids'];

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }
}

function navigateTo(hash) {
  // Section anchors within the home page (e.g. #hero, #about)
  const inPageSections = ['hero', 'about', 'ondemand', 'sectors-overview'];

  const cleanHash = hash.replace('#', '');

  // Sector detail pages: #sector-detail-engineering, #sector-detail-kids, etc.
  if (cleanHash.startsWith('sector-detail-')) {
    const sectorKey = cleanHash.replace('sector-detail-', '');
    if (VALID_SECTOR_KEYS.includes(sectorKey)) {
      showPage('page-sector-detail');
      const detailPage = document.getElementById('page-sector-detail');
      if (detailPage) detailPage.dataset.currentSector = sectorKey;

      const renderPromise = typeof renderSectorDetailPage === 'function'
        ? renderSectorDetailPage(sectorKey)
        : Promise.resolve();

      Promise.resolve(renderPromise).then(() => {
        // Re-trigger reveal animation for newly injected cards
        if ('IntersectionObserver' in window) {
          document.querySelectorAll('#page-sector-detail .reveal, #page-sector-detail .track-card').forEach(el => {
            el.classList.remove('in-view');
            requestAnimationFrame(() => el.classList.add('in-view'));
          });
        }
      });
      return;
    }
  }

  if (inPageSections.includes(cleanHash)) {
    showPage('page-home');
    requestAnimationFrame(() => {
      const el = document.getElementById(cleanHash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
    return;
  }

  const pageId = PAGE_MAP[cleanHash] || 'page-home';
  showPage(pageId);
}

document.addEventListener('DOMContentLoaded', () => {

  // Intercept all internal nav links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      // Dashboard tab links (e.g. "الاستشارات", "كورساتي") are handled
      // entirely by dashboard-tabs.js — they switch panels within the
      // SAME page and must never trigger a full page navigation.
      if (link.hasAttribute('data-dash-tab')) {
        e.preventDefault();
        return;
      }

      const href = link.getAttribute('href');
      const navType = link.getAttribute('data-nav');

      if (navType === 'logout') {
        e.preventDefault();
        // Clear any local session markers
        sessionStorage.removeItem('bs_session');
        navigateTo('page-home');
        // Close mobile nav/sidebar if open
        document.getElementById('mainNav')?.classList.remove('open');
        return;
      }

      if (href && href.startsWith('#')) {
        e.preventDefault();
        navigateTo(href);
        document.getElementById('mainNav')?.classList.remove('open');
        document.getElementById('mainNavSector')?.classList.remove('open');
        document.getElementById('dashSidebar')?.classList.remove('open');
      }
    });
  });

  // Mobile nav toggle (hamburger) — home page header
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
  }

  // Mobile nav toggle (hamburger) — sector detail page header
  const navToggleSector = document.getElementById('navToggleSector');
  const mainNavSector = document.getElementById('mainNavSector');
  if (navToggleSector && mainNavSector) {
    navToggleSector.addEventListener('click', () => mainNavSector.classList.toggle('open'));
  }

  // Mobile dashboard sidebar toggle
  const dashMobileToggle = document.getElementById('dashMobileToggle');
  const dashSidebar = document.getElementById('dashSidebar');
  if (dashMobileToggle && dashSidebar) {
    dashMobileToggle.addEventListener('click', () => dashSidebar.classList.toggle('open'));
  }

  // Header background intensifies on scroll
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.background = window.scrollY > 40
        ? 'rgba(11, 31, 58, 0.98)'
        : 'rgba(11, 31, 58, 0.92)';
    });
  }

  // Reveal-on-scroll animation
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  // Initial route on load
  navigateTo(window.location.hash || '#page-home');
});

window.addEventListener('hashchange', () => {
  navigateTo(window.location.hash);
});
