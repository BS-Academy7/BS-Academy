document.addEventListener('DOMContentLoaded', async () => {
  const tabs = document.querySelectorAll('[data-auth-tab]');
  const views = document.querySelectorAll('[data-auth-view]');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const loginMessage = document.getElementById('loginMessage');
  const signupMessage = document.getElementById('signupMessage');
  const stagePreviewText = document.getElementById('stagePreviewText');
  const typeCards = document.querySelectorAll('.type-card');
  const accountSections = document.querySelectorAll('[data-account-section]');
  const specialtyInput = document.getElementById('signupSpecialty');
  const desiredPositionWrap = document.getElementById('desiredPositionWrap');
  const desiredPositionInput = document.getElementById('signupPosition');

  const stageText = {
    student: 'حساب طالب، استكمال بيانات، ثم تفعيل تجربة الطالب داخل الأكاديمية.',
    instructor: 'حساب محاضر، استكمال بيانات، رفع CV وشهادات، اختبار أو مقابلة، ثم اعتماد الإدارة العليا.',
    staff: 'حساب فريق أو إدارة، مراجعة الدور المطلوب، ثم تحديد الصلاحيات من الإدارة العليا فقط.'
  };

  const fieldCopy = {
    student: {
      specialtyPlaceholder: 'مثال: Engineering, High School, Accounting',
      positionPlaceholder: ''
    },
    instructor: {
      specialtyPlaceholder: 'مثال: Classic Control, Accounting, English',
      positionPlaceholder: 'محاضر، مدرب، مشرف محتوى...'
    },
    staff: {
      specialtyPlaceholder: 'مثال: إدارة، دعم فني، تنسيق، محتوى',
      positionPlaceholder: 'منسق، دعم فني، إدارة، مبيعات...'
    }
  };

  function setMessage(el, text, isError = false) {
    if (!el) return;
    el.textContent = text || '';
    el.classList.toggle('error', Boolean(isError));
  }

  function showView(name) {
    tabs.forEach(item => item.classList.toggle('active', item.dataset.authTab === name));
    views.forEach(view => view.classList.toggle('active', view.dataset.authView === name));
  }

  function getSelectedAccountType() {
    return signupForm?.querySelector('input[name="accountType"]:checked')?.value || 'student';
  }

  function applyAccountType(type) {
    typeCards.forEach(card => {
      const input = card.querySelector('input[type="radio"]');
      const active = input && input.value === type;
      card.classList.toggle('active', active);
      if (input) input.checked = active;
    });

    accountSections.forEach(section => {
      section.classList.toggle('active', section.dataset.accountSection === type);
    });

    if (stagePreviewText) stagePreviewText.textContent = stageText[type] || stageText.student;
    if (specialtyInput) specialtyInput.placeholder = fieldCopy[type]?.specialtyPlaceholder || fieldCopy.student.specialtyPlaceholder;

    const needsPosition = type !== 'student';
    if (desiredPositionWrap) desiredPositionWrap.hidden = !needsPosition;
    if (desiredPositionInput) {
      desiredPositionInput.required = needsPosition;
      desiredPositionInput.placeholder = fieldCopy[type]?.positionPlaceholder || '';
      if (!needsPosition) desiredPositionInput.value = '';
    }
  }

  function collectRoleDetails(accountType) {
    const details = [];
    const pushDetail = (label, value) => {
      const cleaned = (value || '').trim();
      if (cleaned) details.push(`${label}: ${cleaned}`);
    };

    if (accountType === 'student') {
      pushDetail('Student stage', document.getElementById('signupStudentStage')?.value);
      pushDetail('Study goal', document.getElementById('signupStudyGoal')?.value);
    } else if (accountType === 'instructor') {
      pushDetail('Teaching track', document.getElementById('signupTeachingTrack')?.value);
      pushDetail('Portfolio/CV', document.getElementById('signupPortfolioUrl')?.value);
    } else if (accountType === 'staff') {
      pushDetail('Department', document.getElementById('signupDepartment')?.value);
      pushDetail('Access reason', document.getElementById('signupAccessReason')?.value);
    }

    return details.join(' | ');
  }

  function readCallbackParams() {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    return {
      error: searchParams.get('error') || hashParams.get('error'),
      errorCode: searchParams.get('error_code') || hashParams.get('error_code'),
      description: searchParams.get('error_description') || hashParams.get('error_description'),
      type: searchParams.get('type') || hashParams.get('type'),
      hasSessionHash: hashParams.has('access_token') || hashParams.has('refresh_token')
    };
  }

  function handleAuthCallbackMessage() {
    const callback = readCallbackParams();
    if (callback.error) {
      showView('login');
      const expired = callback.errorCode === 'otp_expired'
        || /expired|invalid/i.test(callback.description || '');
      const message = expired
        ? 'رابط تفعيل البريد منتهي أو تم استخدامه قبل كده. اطلب رابط جديد أو سجل الحساب مرة أخرى بعد ضبط رابط Supabase.'
        : `حدث خطأ في تفعيل الحساب: ${callback.description || callback.error}`;
      setMessage(loginMessage, message, true);
      return { hasError: true };
    }

    if (callback.hasSessionHash || callback.type === 'signup') {
      showView('login');
      setMessage(loginMessage, 'تم تأكيد البريد بنجاح. لو لم يتم تحويلك تلقائيًا، سجل دخولك الآن.');
      return { hasSuccess: true };
    }

    return {};
  }

  function getTargetUrl(profile) {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    if (next) return next;

    const adminRoles = ['admin', 'super_admin', 'drive_manager'];
    if (profile && adminRoles.includes(profile.role)) return 'admin-dashboard.html';
    if (profile && profile.account_type === 'instructor') return 'instructor-dashboard.html';
    return 'index.html';
  }

  async function routeIfLoggedIn() {
    if (typeof bsGetCurrentUser !== 'function') return;
    const user = await bsGetCurrentUser();
    if (!user) return;
    const profile = await bsGetProfile(user.id);
    window.location.href = getTargetUrl(profile);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => showView(tab.dataset.authTab));
  });

  typeCards.forEach(card => {
    card.addEventListener('click', () => {
      const input = card.querySelector('input[type="radio"]');
      applyAccountType(input?.value || 'student');
    });
  });

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = loginForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    setMessage(loginMessage, 'جاري تسجيل الدخول...');

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const { data, error } = await bsSignIn(email, password);

    if (error) {
      submit.disabled = false;
      setMessage(loginMessage, 'بيانات الدخول غير صحيحة أو الحساب لم يتم تفعيله بعد.', true);
      return;
    }

    const profile = data?.user ? await bsGetProfile(data.user.id) : null;
    window.location.href = getTargetUrl(profile);
  });

  signupForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = signupForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    setMessage(signupMessage, 'جاري إنشاء الحساب...');

    const accountType = getSelectedAccountType();
    const countryCode = document.getElementById('signupCountry')?.value || 'EG';
    const phoneCountryCode = document.getElementById('signupPhoneCountry')?.value || countryCode;
    const whatsappInputValue = document.getElementById('signupWhatsappLocal')?.value.trim() || '';
    const whatsappLocal = typeof bsExtractLocalPhone === 'function'
      ? bsExtractLocalPhone(phoneCountryCode, whatsappInputValue)
      : whatsappInputValue.replace(/[^\d]/g, '');
    const whatsappFull = typeof bsComposeInternationalPhone === 'function'
      ? bsComposeInternationalPhone(phoneCountryCode, whatsappInputValue)
      : document.getElementById('signupWhatsapp').value.trim();
    const roleDetails = collectRoleDetails(accountType);
    const baseSpecialty = document.getElementById('signupSpecialty').value.trim();
    const basePosition = document.getElementById('signupPosition').value.trim();

    const payload = {
      fullName: document.getElementById('signupName').value.trim(),
      email: document.getElementById('signupEmail').value.trim(),
      password: document.getElementById('signupPassword').value,
      whatsapp: whatsappFull,
      phoneLocal: whatsappLocal,
      countryCode,
      phoneCountryCode,
      preferredLanguage: window.currentLang || localStorage.getItem('bs_lang') || document.documentElement.lang || 'ar',
      preferredCurrency: document.getElementById('signupPreferredCurrency')?.value || 'EGP',
      accountType,
      specialty: [baseSpecialty, roleDetails].filter(Boolean).join(' | '),
      desiredPosition: accountType === 'student' ? roleDetails : basePosition
    };

    const { data, error } = await bsSignUp(payload.email, payload.password, payload.fullName, payload);
    if (error) {
      submit.disabled = false;
      setMessage(signupMessage, error.message || 'لم نتمكن من إنشاء الحساب.', true);
      return;
    }

    if (data?.user) {
      await bsEnsureOnboardingApplication(data.user.id, payload);
    }

    setMessage(signupMessage, 'تم إنشاء الحساب. افتح رسالة التأكيد من البريد، وبعد التفعيل سجل دخولك من هنا.');
    submit.disabled = false;
  });

  applyAccountType(getSelectedAccountType());
  const callbackState = handleAuthCallbackMessage();
  if (!callbackState.hasError) await routeIfLoggedIn();
});
