/* ============================================
   B&S Academy — Main App Logic
   Login, signup, and dashboard population.
   ============================================ */

(function () {

  function setFieldError(input, hasError) {
    const group = input.closest('.form-group');
    if (group) group.classList.toggle('invalid', hasError);
  }

  /* ---- LOGIN ---- */
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;

      let valid = true;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError(loginForm.email, true); valid = false; }
      else setFieldError(loginForm.email, false);
      if (password.length < 6) { setFieldError(loginForm.password, true); valid = false; }
      else setFieldError(loginForm.password, false);
      if (!valid) return;

      const btn = document.getElementById('loginSubmitBtn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>';

      if (typeof bsSignIn === 'function' && typeof isSupabaseConfigured !== 'undefined' && isSupabaseConfigured) {
        const { data, error } = await bsSignIn(email, password);
        btn.disabled = false;
        btn.innerHTML = currentLang === 'ar' ? 'دخول' : 'Log In';

        if (error) {
          showToast(currentLang === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials', true);
          return;
        }

        sessionStorage.setItem('bs_session', JSON.stringify({ email, userId: data.user.id }));
        await populateDashboard(data.user.id);
        navigateTo('page-dashboard');
      } else {
        // Demo mode: no backend connected yet — simulate so the owner can see the flow
        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = currentLang === 'ar' ? 'دخول' : 'Log In';
          sessionStorage.setItem('bs_session', JSON.stringify({ email, demo: true }));
          populateDashboardDemo(email);
          navigateTo('page-dashboard');
          showToast(currentLang === 'ar'
            ? 'وضع المعاينة: لسه Supabase مش متصل'
            : 'Preview mode: Supabase not connected yet');
        }, 600);
      }
    });
  }

  /* ---- SIGNUP ---- */
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = signupForm.full_name.value.trim();
      const email = signupForm.email.value.trim();
      const password = signupForm.password.value;

      let valid = true;
      if (!fullName) { setFieldError(signupForm.full_name, true); valid = false; }
      else setFieldError(signupForm.full_name, false);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError(signupForm.email, true); valid = false; }
      else setFieldError(signupForm.email, false);
      if (password.length < 6) { setFieldError(signupForm.password, true); valid = false; }
      else setFieldError(signupForm.password, false);
      if (!valid) return;

      const btn = document.getElementById('signupSubmitBtn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>';

      if (typeof bsSignUp === 'function' && typeof isSupabaseConfigured !== 'undefined' && isSupabaseConfigured) {
        const { data, error } = await bsSignUp(email, password, fullName);
        btn.disabled = false;
        btn.innerHTML = currentLang === 'ar' ? 'إنشاء الحساب' : 'Create Account';

        if (error) {
          showToast(error.message || (currentLang === 'ar' ? 'حصل خطأ، حاول تاني' : 'Something went wrong'), true);
          return;
        }

        showToast(currentLang === 'ar' ? 'تم إنشاء الحساب! تحقق من إيميلك للتأكيد' : 'Account created! Check your email to confirm');
        navigateTo('auth-login');
      } else {
        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = currentLang === 'ar' ? 'إنشاء الحساب' : 'Create Account';
          sessionStorage.setItem('bs_session', JSON.stringify({ email, fullName, demo: true }));
          populateDashboardDemo(email, fullName);
          navigateTo('page-dashboard');
          showToast(currentLang === 'ar'
            ? 'وضع المعاينة: لسه Supabase مش متصل'
            : 'Preview mode: Supabase not connected yet');
        }, 600);
      }
    });
  }

  /* ---- DASHBOARD POPULATION (live, once Supabase connected) ---- */
  window.populateDashboard = async function (userId) {
    if (typeof bsGetProfile !== 'function') return;
    const profile = await bsGetProfile(userId);
    if (!profile) return;

    setDashboardUser(profile.full_name, profile.role === 'admin');

    const enrollments = await bsGetEnrollments(userId);
    renderCourseList(enrollments);

    const enrolledCount = enrollments.length;
    const completedCount = enrollments.filter(e => e.progress_percent >= 100).length;
    const avgProgress = enrolledCount
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress_percent, 0) / enrolledCount)
      : 0;

    document.getElementById('statEnrolled').textContent = enrolledCount;
    document.getElementById('statCompleted').textContent = completedCount;
    document.getElementById('statAvgProgress').textContent = avgProgress + '%';
  };

  /* ---- DASHBOARD POPULATION (demo/preview mode) ---- */
  window.populateDashboardDemo = function (email, fullName) {
    const name = fullName || email.split('@')[0];
    setDashboardUser(name, false);
    document.getElementById('statEnrolled').textContent = '0';
    document.getElementById('statCompleted').textContent = '0';
    document.getElementById('statRequests').textContent = '0';
    document.getElementById('statAvgProgress').textContent = '0%';
  };

  function setDashboardUser(name, isAdmin) {
    const nameEl = document.getElementById('dashUserName');
    const welcomeEl = document.getElementById('dashWelcomeName');
    const avatarEl = document.getElementById('dashAvatarInitial');
    const adminLink = document.getElementById('adminNavLink');

    if (nameEl) nameEl.textContent = name;
    if (welcomeEl) welcomeEl.textContent = name;
    if (avatarEl) avatarEl.textContent = (name[0] || 'S').toUpperCase();
    if (adminLink) adminLink.style.display = isAdmin ? 'flex' : 'none';
  }

  function renderCourseList(enrollments) {
    const list = document.getElementById('courseProgressList');
    if (!list) return;
    if (!enrollments.length) return; // empty state already in HTML

    list.innerHTML = enrollments.map(e => `
      <div class="course-progress-card">
        <div class="course-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        </div>
        <div class="course-progress-info">
          <h4>${currentLang === 'ar' ? (e.courses?.title_ar || e.courses?.title) : e.courses?.title}</h4>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width:${e.progress_percent}%"></div>
          </div>
        </div>
        <div class="progress-percent">${e.progress_percent}%</div>
      </div>
    `).join('');
  }

  const contactIcons = {
    whatsapp: '<svg class="contact-icon-svg contact-icon-whatsapp" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle cx="16" cy="16" r="16" fill="#25D366"></circle><path fill="#fff" d="M16.2 6.6c-5.1 0-9.2 4-9.2 9 0 1.7.5 3.3 1.3 4.6l-.9 3.3 3.5-.9c1.4.8 3 1.2 4.7 1.2 5.1 0 9.2-4 9.2-9s-3.5-8.2-8.6-8.2zm0 15.6c-1.5 0-2.9-.4-4.1-1.2l-.3-.2-2.1.6.6-2-.2-.3c-.8-1.2-1.2-2.6-1.2-4 0-4.1 3.4-7.4 7.5-7.4s7.5 3.3 7.5 7.4-3.6 7.1-7.7 7.1z"></path><path fill="#fff" d="M20.3 17.4c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8.9-.1.2-.3.2-.6.1-.2-.1-1-.4-1.9-1.1-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.2.3-.4.1-.2.1-.3 0-.5 0-.1-.5-1.2-.7-1.7-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.8-.9 2 0 1.2.9 2.4 1 2.5.1.2 1.7 2.7 4.3 3.7.6.3 1.1.4 1.4.5.6.2 1.2.2 1.6.1.5-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2 0-.2-.2-.3-.4-.4z"></path></svg>',
    telegram: '<svg class="contact-icon-svg contact-icon-telegram" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle cx="16" cy="16" r="16" fill="#1DA1F2"></circle><path fill="#fff" d="M24.8 8.2 5.9 15.5c-1.2.5-1.2 1.1-.2 1.4l4.8 1.5 1.8 5.7c.2.6.3.8.7.8.5 0 .7-.2 1-.5l2.5-2.4 5.2 3.8c.9.5 1.6.3 1.9-.9l3.4-15.9c.4-1.4-.5-2.1-1.6-1.7zM11.5 18l10.1-6.3c.5-.3.9-.1.5.2l-8.2 7.4-.3 3.3-2.1-4.6z"></path></svg>',
    email: '<span class="contact-icon-text contact-icon-at">@</span>',
    phone: '<span class="contact-icon-text">tel</span>',
    facebook: '<span class="contact-icon-text">f</span>',
    instagram: '<span class="contact-icon-text">ig</span>',
    custom: '<span class="contact-icon-text">link</span>'
  };

  const contactPrefillMessage = [
    'مرحبًا B&S Academy',
    '',
    'أرغب في التواصل مع فريق الأكاديمية.',
    '',
    'الاسم:',
    'نوع الطلب:',
    'التفاصيل:'
  ].join('\n');

  function contactLabel(contact) {
    if (!contact) return '';
    if (typeof currentLang !== 'undefined' && currentLang === 'en') {
      return contact.label_en || contact.label_ar || contact.contact_type;
    }
    return contact.label_ar || contact.label_en || contact.contact_type;
  }

  function normalizeContactHref(contact) {
    const href = String(contact?.href || '#').trim();
    const type = String(contact?.icon_key || contact?.contact_type || '').toLowerCase();
    if (!href || href === '#') return '#';

    if (type === 'telegram') {
      const username = href
        .replace(/^https?:\/\/(www\.)?(t\.me|telegram\.me)\//i, '')
        .replace(/^@/, '')
        .replace(/^t\.me\//i, '')
        .replace(/^telegram\.me\//i, '')
        .split(/[?#]/)[0];
      return `https://telegram.me/${encodeURIComponent(username)}?text=${encodeURIComponent(contactPrefillMessage)}`;
    }

    if (type === 'email') {
      let email = href.replace(/^mailto:/i, '').split('?')[0];
      try {
        const parsed = new URL(href);
        email = parsed.searchParams.get('to') || email;
      } catch (error) {
        // Keep the plain href parsing path for mailto and raw email values.
      }
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return `mailto:${email}`;
      }
      return href;
    }

    if (type !== 'whatsapp') return href;

    const phoneMatch = href.match(/[?&]phone=([+\d]+)/i) || href.match(/wa\.me\/([+\d]+)/i);
    if (phoneMatch && phoneMatch[1]) {
      return `https://wa.me/${phoneMatch[1].replace(/\D/g, '')}`;
    }
    return href.replace(/([?&])text=[^&]*/i, '').replace(/[?&]$/, '');
  }

  async function renderSiteContacts() {
    if (typeof bsGetSiteContacts !== 'function') return;
    const contacts = await bsGetSiteContacts(false);
    if (!contacts.length) return;

    const iconWrap = document.querySelector('[data-site-contact-icons]');
    const listWrap = document.querySelector('[data-site-contact-list]');

    if (iconWrap) {
      iconWrap.innerHTML = contacts.map(contact => {
        const type = String(contact.icon_key || contact.contact_type || 'custom').toLowerCase();
        const icon = contactIcons[type] || contactIcons.custom;
        const label = contactLabel(contact);
        const href = normalizeContactHref(contact);
        const targetAttrs = href.startsWith('mailto:') ? '' : ' target="_blank" rel="noopener"';
        return `<a class="footer-contact-icon-link" href="${href}" aria-label="${label}" title="${label}"${targetAttrs}>${icon}</a>`;
      }).join('');
    }

    if (listWrap) {
      listWrap.innerHTML = contacts.map(contact => {
        const type = String(contact.icon_key || contact.contact_type || 'custom').toLowerCase();
        const icon = contactIcons[type] || contactIcons.custom;
        const label = contactLabel(contact);
        const href = normalizeContactHref(contact);
        const targetAttrs = href.startsWith('mailto:') ? '' : ' target="_blank" rel="noopener"';
        return `<a class="footer-contact-link footer-contact-icon-link" href="${href}" aria-label="${label}" title="${label}"${targetAttrs}>${icon}</a>`;
      }).join('');
    }
  }

  /* ---- Restore session on page load (if any) ---- */
  document.addEventListener('DOMContentLoaded', async () => {
    renderSiteContacts();

    const session = sessionStorage.getItem('bs_session');
    if (!session) return;

    try {
      const parsed = JSON.parse(session);
      if (parsed.demo) {
        populateDashboardDemo(parsed.email, parsed.fullName);
      } else if (parsed.userId) {
        await populateDashboard(parsed.userId);
      }
    } catch {}
  });

})();
