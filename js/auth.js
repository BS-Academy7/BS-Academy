document.addEventListener('DOMContentLoaded', async () => {
  const tabs = document.querySelectorAll('[data-auth-tab]');
  const views = document.querySelectorAll('[data-auth-view]');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const loginMessage = document.getElementById('loginMessage');
  const signupMessage = document.getElementById('signupMessage');
  const stagePreviewText = document.getElementById('stagePreviewText');
  const typeCards = document.querySelectorAll('.type-card');

  const stageText = {
    student: 'حساب جديد، استكمال بيانات، تفعيل حساب الطالب.',
    instructor: 'حساب جديد، استكمال بيانات، رفع CV وشهادات، اختبار، مقابلة، مراجعة الإدارة العليا، قبول.',
    staff: 'حساب جديد، استكمال بيانات، مراجعة الدور المطلوب، تحديد الصلاحيات من الإدارة العليا.'
  };

  function setMessage(el, text, isError = false) {
    el.textContent = text || '';
    el.classList.toggle('error', Boolean(isError));
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
    tab.addEventListener('click', () => {
      tabs.forEach(item => item.classList.remove('active'));
      views.forEach(view => view.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`[data-auth-view="${tab.dataset.authTab}"]`).classList.add('active');
    });
  });

  typeCards.forEach(card => {
    card.addEventListener('click', () => {
      typeCards.forEach(item => item.classList.remove('active'));
      card.classList.add('active');
      const input = card.querySelector('input[type="radio"]');
      input.checked = true;
      stagePreviewText.textContent = stageText[input.value] || stageText.student;
    });
  });

  loginForm.addEventListener('submit', async (event) => {
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

  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = signupForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    setMessage(signupMessage, 'جاري إنشاء الحساب...');

    const accountType = signupForm.querySelector('input[name="accountType"]:checked').value;
    const countryCode = document.getElementById('signupCountry')?.value || 'EG';
    const phoneCountryCode = document.getElementById('signupPhoneCountry')?.value || countryCode;
    const whatsappLocal = document.getElementById('signupWhatsappLocal')?.value.trim() || '';
    const whatsappFull = typeof bsComposeInternationalPhone === 'function'
      ? bsComposeInternationalPhone(phoneCountryCode, whatsappLocal)
      : document.getElementById('signupWhatsapp').value.trim();

    const payload = {
      fullName: document.getElementById('signupName').value.trim(),
      email: document.getElementById('signupEmail').value.trim(),
      password: document.getElementById('signupPassword').value,
      whatsapp: whatsappFull,
      phoneLocal: whatsappLocal,
      countryCode,
      phoneCountryCode,
      preferredLanguage: document.getElementById('signupPreferredLanguage')?.value || 'ar',
      preferredCurrency: document.getElementById('signupPreferredCurrency')?.value || 'EGP',
      accountType,
      specialty: document.getElementById('signupSpecialty').value.trim(),
      desiredPosition: document.getElementById('signupPosition').value.trim()
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

    setMessage(signupMessage, 'تم إنشاء الحساب. لو مطلوب تأكيد بريد إلكتروني، افتح الإيميل وفعل الحساب ثم سجل دخول.');
    submit.disabled = false;
  });

  await routeIfLoggedIn();
});
