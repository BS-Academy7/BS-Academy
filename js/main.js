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
    whatsapp: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 6.32A8.86 8.86 0 0 0 12.05 4a8.94 8.94 0 0 0-7.74 13.4L3 21l3.73-1.27a8.9 8.9 0 0 0 5.32 1.7h.01a8.94 8.94 0 0 0 8.93-8.93 8.86 8.86 0 0 0-2.39-6.18z"/></svg>',
    telegram: '<span class="contact-icon-text">T</span>',
    email: '<span class="contact-icon-text">@</span>',
    phone: '<span class="contact-icon-text">☎</span>',
    facebook: '<span class="contact-icon-text">f</span>',
    instagram: '<span class="contact-icon-text">◎</span>',
    custom: '<span class="contact-icon-text">↗</span>'
  };

  function contactLabel(contact) {
    if (!contact) return '';
    if (typeof currentLang !== 'undefined' && currentLang === 'en') {
      return contact.label_en || contact.label_ar || contact.contact_type;
    }
    return contact.label_ar || contact.label_en || contact.contact_type;
  }

  async function renderSiteContacts() {
    if (typeof bsGetSiteContacts !== 'function') return;
    const contacts = await bsGetSiteContacts(false);
    if (!contacts.length) return;

    const iconWrap = document.querySelector('[data-site-contact-icons]');
    const listWrap = document.querySelector('[data-site-contact-list]');

    if (iconWrap) {
      iconWrap.innerHTML = contacts.map(contact => {
        const type = contact.icon_key || contact.contact_type || 'custom';
        const icon = contactIcons[type] || contactIcons.custom;
        const label = contactLabel(contact);
        return `<a href="${contact.href}" aria-label="${label}" title="${label}" target="_blank" rel="noopener">${icon}</a>`;
      }).join('');
    }

    if (listWrap) {
      listWrap.innerHTML = contacts.map(contact => {
        const label = contactLabel(contact);
        return `<a class="footer-contact-link" href="${contact.href}" target="_blank" rel="noopener">${label}</a>`;
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
