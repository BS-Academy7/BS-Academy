/* ============================================
   B&S Academy - Master Dashboard JS
   ============================================ */

document.addEventListener('DOMContentLoaded', async () => {
  const loginGate = document.getElementById('adminLoginGate');
  const adminLayout = document.getElementById('adminLayout');
  const loginError = document.getElementById('adminLoginError');
  const userInfo = document.getElementById('adminUserInfo');
  const logoutBtn = document.getElementById('adminLogoutBtn');
  
  let currentAdminProfile = null;
  let allAcademyFiles = [];
  let onboardingApplications = [];
  let siteContacts = [];
  let documentSettings = null;
  let managedProfiles = [];
  let documentTemplates = [];

  // Check initial auth state
  await checkAuth();

  // Logout
  logoutBtn.addEventListener('click', async () => {
    await bsSignOut();
    window.location.reload();
  });

  async function checkAuth() {
    const user = await bsGetCurrentUser();
    if (!user) {
      showLoginGate();
      return;
    }
    
    const profile = await bsGetProfile(user.id);
    const allowedRoles = ['admin', 'super_admin', 'drive_manager'];
    if (!profile || !allowedRoles.includes(profile.role)) {
      loginError.textContent = 'هذا الحساب لا يملك صلاحيات الإدارة. اطلب ترقية الصلاحية من الإدارة العليا.';
      await bsSignOut();
      showLoginGate();
      return;
    }

    currentAdminProfile = profile;
    userInfo.innerHTML = `<strong>${profile.full_name}</strong><br><small>${profile.role}</small>`;
    applyRoleVisibility(profile.role);
    
    showDashboard();
    loadDashboardData();
  }

  function showLoginGate() {
    loginGate.style.display = 'flex';
    adminLayout.style.display = 'none';
  }

  function showDashboard() {
    loginGate.style.display = 'none';
    adminLayout.style.display = 'flex';
  }

  function canManageDrive(role) {
    return role === 'super_admin' || role === 'drive_manager';
  }

  function applyRoleVisibility(role) {
    const filesNav = document.querySelector('.nav-item[data-tab="files"]');
    if (filesNav) filesNav.style.display = canManageDrive(role) ? 'flex' : 'none';
    const onboardingNav = document.querySelector('.nav-item[data-tab="onboarding"]');
    if (onboardingNav) onboardingNav.style.display = ['admin', 'super_admin'].includes(role) ? 'flex' : 'none';
    const contactsNav = document.querySelector('.nav-item[data-tab="contacts"]');
    if (contactsNav) contactsNav.style.display = ['admin', 'super_admin'].includes(role) ? 'flex' : 'none';
    const documentsNav = document.querySelector('.nav-item[data-tab="documents"]');
    if (documentsNav) documentsNav.style.display = ['admin', 'super_admin'].includes(role) ? 'flex' : 'none';
    const usersNav = document.querySelector('.nav-item[data-tab="users"]');
    if (usersNav) usersNav.style.display = role === 'super_admin' ? 'flex' : 'none';
  }

  /* ==========================================
     Dashboard Navigation
     ========================================== */
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const views = document.querySelectorAll('.admin-view');
  const pageTitle = document.getElementById('pageTitle');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navItems.forEach(nav => nav.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));
      
      item.classList.add('active');
      const targetId = `view-${item.dataset.tab}`;
      document.getElementById(targetId).classList.add('active');
      pageTitle.textContent = item.textContent.trim();
    });
  });

  /* ==========================================
     Load Data
     ========================================== */
  async function loadDashboardData() {
    // We fetch requests and files.
    // In a real huge system we'd paginate, but for now we fetch all.
    const requests = await bsGetAllRequests();
    onboardingApplications = typeof bsGetOnboardingApplications === 'function'
      ? await bsGetOnboardingApplications()
      : [];
    siteContacts = typeof bsGetSiteContacts === 'function'
      ? await bsGetSiteContacts(true)
      : [];
    documentSettings = typeof bsGetDocumentSettings === 'function'
      ? await bsGetDocumentSettings()
      : null;
    managedProfiles = typeof bsGetManagedProfiles === 'function'
      ? await bsGetManagedProfiles()
      : [];
    documentTemplates = typeof bsGetDocumentTemplates === 'function'
      ? await bsGetDocumentTemplates()
      : [];
    
    // Fetch all academy_files
    const { data: filesData } = await supabaseClient.from('academy_files').select('*');
    allAcademyFiles = filesData || [];

    renderRequests(requests);
    renderOnboardingApplications(onboardingApplications);
    renderContacts(siteContacts);
    renderDocumentSettings(documentSettings);
    renderManagedProfiles(managedProfiles);
    renderDocumentTemplates(documentTemplates);
  }

  /* ==========================================
     Users & Permissions
     ========================================== */
  const adminUserActionForm = document.getElementById('adminUserActionForm');

  function renderManagedProfiles(profiles) {
    const tbody = document.getElementById('managedUsersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!profiles || profiles.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">لا توجد حسابات ظاهرة حاليا</td></tr>';
      return;
    }

    profiles.forEach(profile => {
      const tr = document.createElement('tr');
      const status = profile.profile_status || 'active';
      tr.innerHTML = `
        <td>
          <strong>${profile.full_name || 'بدون اسم'}</strong><br>
          <small>${profile.display_title || profile.whatsapp || profile.id}</small>
        </td>
        <td>
          <select class="role-select" data-id="${profile.id}">
            ${roleOptions(profile.role)}
          </select>
        </td>
        <td>${formatAccountType(profile.account_type)}</td>
        <td>
          <select class="status-select" data-id="${profile.id}">
            <option value="active" ${status === 'active' ? 'selected' : ''}>Active</option>
            <option value="disabled" ${status === 'disabled' ? 'selected' : ''}>Disabled</option>
          </select>
        </td>
        <td><span class="status-badge ${profile.onboarding_status || 'needs_profile'}">${formatStatus(profile.onboarding_status)}</span></td>
        <td class="action-cell">
          <button class="fm-btn btn-save-user" data-id="${profile.id}">حفظ</button>
          <button class="fm-btn btn-request-delete-user" data-id="${profile.id}">طلب حذف Auth</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-save-user').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.id;
        const role = tbody.querySelector(`.role-select[data-id="${userId}"]`)?.value || 'student';
        const profileStatus = tbody.querySelector(`.status-select[data-id="${userId}"]`)?.value || 'active';
        btn.disabled = true;
        const result = await bsUpdateManagedProfile(userId, {
          role,
          profile_status: profileStatus,
          onboarding_status: profileStatus === 'disabled' ? 'disabled' : undefined
        });
        btn.disabled = false;
        if (result?.error) {
          alert('فشل حفظ المستخدم: ' + result.error.message);
          return;
        }
        loadDashboardData();
      });
    });

    tbody.querySelectorAll('.btn-request-delete-user').forEach(btn => {
      btn.addEventListener('click', async () => {
        const profile = managedProfiles.find(item => item.id === btn.dataset.id);
        if (!profile) return;
        if (!confirm('سيتم تسجيل طلب حذف Auth لهذا المستخدم. الحذف النهائي يحتاج Edge Function آمنة. هل تؤكد؟')) return;
        btn.disabled = true;
        const result = await bsCreateAdminUserAction({
          action_type: 'delete_auth_user',
          target_user_id: profile.id,
          target_email: profile.full_name || profile.id,
          requested_role: profile.role,
          requested_account_type: profile.account_type,
          payload: { profile_snapshot: profile }
        });
        await bsUpdateManagedProfile(profile.id, { profile_status: 'disabled', onboarding_status: 'disabled' });
        btn.disabled = false;
        if (result?.error) alert('فشل تسجيل طلب الحذف: ' + result.error.message);
        loadDashboardData();
      });
    });
  }

  function roleOptions(currentRole) {
    return ['student', 'instructor', 'admin', 'drive_manager', 'super_admin']
      .map(role => `<option value="${role}" ${role === currentRole ? 'selected' : ''}>${role}</option>`)
      .join('');
  }

  function formatAccountType(type) {
    const map = { student: 'طالب', instructor: 'محاضر', staff: 'فريق / إدارة' };
    return map[type] || type || '-';
  }

  if (adminUserActionForm) {
    adminUserActionForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('managedUserEmail').value.trim();
      const passwordNote = document.getElementById('managedUserPassword').value.trim();
      const role = document.getElementById('managedUserRole').value;
      const accountType = document.getElementById('managedUserAccountType').value;
      if (!email) {
        alert('اكتب إيميل المستخدم أولا');
        return;
      }

      const submitBtn = adminUserActionForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      const result = await bsCreateAdminUserAction({
        action_type: 'create_user',
        target_email: email,
        requested_role: role,
        requested_account_type: accountType,
        requested_password_note: passwordNote ? 'Password provided by owner in dashboard request' : null,
        payload: {
          email,
          role,
          account_type: accountType,
          has_password: Boolean(passwordNote)
        }
      });
      submitBtn.disabled = false;
      if (result?.error) {
        alert('فشل تسجيل طلب إنشاء المستخدم: ' + result.error.message);
        return;
      }
      adminUserActionForm.reset();
      alert('تم تسجيل طلب إنشاء المستخدم. التنفيذ النهائي يحتاج Edge Function آمنة بمفتاح service_role.');
    });
  }

  function renderRequests(requests) {
    const tbody = document.getElementById('requestsTableBody');
    tbody.innerHTML = '';

    if (requests.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">لا توجد طلبات حالياً</td></tr>';
      return;
    }

    requests.forEach(req => {
      const tr = document.createElement('tr');
      const date = new Date(req.created_at).toLocaleDateString('ar-EG');
      
      // Find attachments registered in academy_files for this request
      const reqFiles = allAcademyFiles.filter(f => f.entity_id === req.id);
      
      let attachmentsHtml = '';
      if (reqFiles.length > 0) {
        reqFiles.forEach(file => {
          attachmentsHtml += `<button class="attachment-btn" onclick="openFileViewer('${file.id}')">📎 ${file.file_name.substring(0, 15)}...</button>`;
        });
      } else if (req.attachment_urls && req.attachment_urls.length > 0) {
        // Fallback for old requests that weren't registered in academy_files
        req.attachment_urls.forEach((url, idx) => {
          attachmentsHtml += `<a href="${url}" target="_blank" class="attachment-btn" style="text-decoration:none;">🔗 مرفق ${idx+1} (قديم)</a>`;
        });
      } else {
        attachmentsHtml = '<span style="color:#888;">لا يوجد</span>';
      }

      tr.innerHTML = `
        <td>${date}</td>
        <td>
          <strong>${req.full_name}</strong><br>
          <small>${req.whatsapp}</small>
        </td>
        <td>
          ${req.subject_name}<br>
          <small>${req.topic_title}</small>
        </td>
        <td>${req.academic_level}</td>
        <td>${attachmentsHtml}</td>
        <td><span class="status-badge ${req.status}">${req.status === 'new' ? 'جديد' : req.status}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderOnboardingApplications(applications) {
    const tbody = document.getElementById('onboardingTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!applications || applications.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">لا توجد تسجيلات جديدة حالياً</td></tr>';
      return;
    }

    applications.forEach(app => {
      const profile = app.profiles || {};
      const tr = document.createElement('tr');
      const date = new Date(app.submitted_at).toLocaleDateString('ar-EG');
      const typeLabel = app.account_type === 'instructor'
        ? 'محاضر'
        : app.account_type === 'staff'
          ? 'بوزيشن / فريق'
          : 'طالب';

      tr.innerHTML = `
        <td>${date}</td>
        <td>
          <strong>${profile.full_name || 'مستخدم جديد'}</strong><br>
          <small>${profile.whatsapp || ''}</small>
        </td>
        <td>${typeLabel}</td>
        <td>
          ${app.specialty || '-'}<br>
          <small>${app.desired_position || ''}</small>
        </td>
        <td>${formatStage(app.current_stage_key)}</td>
        <td><span class="status-badge ${app.status}">${formatStatus(app.status)}</span></td>
        <td class="action-cell">
          <button class="fm-btn btn-next-stage" data-id="${app.id}">مرحلة تالية</button>
          <button class="fm-btn btn-approve" data-id="${app.id}">قبول مباشر</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-next-stage').forEach(btn => {
      btn.addEventListener('click', async () => {
        const app = onboardingApplications.find(item => item.id === btn.dataset.id);
        if (!app) return;
        const next = getNextStage(app);
        btn.disabled = true;
        if (next.stage === 'approved') {
          await bsApproveOnboardingApplication(app);
        } else {
          await bsUpdateOnboardingApplication(app.id, {
            current_stage_key: next.stage,
            status: next.status
          });
        }
        loadDashboardData();
      });
    });

    tbody.querySelectorAll('.btn-approve').forEach(btn => {
      btn.addEventListener('click', async () => {
        const app = onboardingApplications.find(item => item.id === btn.dataset.id);
        if (!app) return;
        if (!confirm('تأكيد قبول هذا الحساب مباشرة؟')) return;
        btn.disabled = true;
        const result = await bsApproveOnboardingApplication(app);
        if (result?.error) alert('فشل القبول: ' + result.error.message);
        loadDashboardData();
      });
    });
  }

  function formatStage(stage) {
    const map = {
      complete_profile: 'استكمال بيانات',
      documents: 'رفع مستندات',
      technical_test: 'اختبار فني',
      interview: 'مقابلة',
      final_review: 'مراجعة نهائية',
      permission_review: 'مراجعة صلاحيات',
      approved: 'مقبول'
    };
    return map[stage] || stage || '-';
  }

  function formatStatus(status) {
    const map = {
      needs_profile: 'ناقص بيانات',
      in_review: 'تحت المراجعة',
      pending_documents: 'مطلوب مستندات',
      pending_test: 'اختبار',
      pending_interview: 'مقابلة',
      approved: 'مقبول',
      rejected: 'مرفوض',
      disabled: 'معطل'
    };
    return map[status] || status || '-';
  }

  function getNextStage(app) {
    const flows = {
      student: [
        ['complete_profile', 'needs_profile'],
        ['approved', 'approved']
      ],
      instructor: [
        ['complete_profile', 'needs_profile'],
        ['documents', 'pending_documents'],
        ['technical_test', 'pending_test'],
        ['interview', 'pending_interview'],
        ['final_review', 'in_review'],
        ['approved', 'approved']
      ],
      staff: [
        ['complete_profile', 'needs_profile'],
        ['permission_review', 'in_review'],
        ['approved', 'approved']
      ]
    };
    const flow = flows[app.account_type] || flows.student;
    const index = flow.findIndex(([stage]) => stage === app.current_stage_key);
    const next = flow[Math.min(index + 1, flow.length - 1)] || flow[0];
    return { stage: next[0], status: next[1] };
  }

  /* ==========================================
     Site Contacts
     ========================================== */
  const contactForm = document.getElementById('contactForm');
  const contactResetBtn = document.getElementById('contactResetBtn');

  function renderContacts(contacts) {
    const tbody = document.getElementById('contactsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!contacts || contacts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">لا توجد وسائل تواصل بعد</td></tr>';
      return;
    }

    contacts.forEach(contact => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${contact.contact_type || '-'}</td>
        <td>${contact.label_ar || contact.label_en || '-'}</td>
        <td><a class="contact-link-preview" href="${contact.href}" target="_blank" rel="noopener">${contact.href}</a></td>
        <td>${contact.sort_order || 1}</td>
        <td><span class="status-badge ${contact.is_active ? 'approved' : 'rejected'}">${contact.is_active ? 'ظاهر' : 'مخفي'}</span></td>
        <td class="action-cell">
          <button class="fm-btn btn-edit-contact" data-id="${contact.id}">تعديل</button>
          <button class="fm-btn btn-delete-contact" data-id="${contact.id}">حذف</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-edit-contact').forEach(btn => {
      btn.addEventListener('click', () => {
        const contact = siteContacts.find(item => item.id === btn.dataset.id);
        if (!contact) return;
        fillContactForm(contact);
      });
    });

    tbody.querySelectorAll('.btn-delete-contact').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('تأكيد حذف وسيلة التواصل؟')) return;
        btn.disabled = true;
        const result = await bsDeleteSiteContact(btn.dataset.id);
        if (result?.error) alert('فشل الحذف: ' + result.error.message);
        loadDashboardData();
      });
    });
  }

  function fillContactForm(contact) {
    document.getElementById('contactId').value = contact.id || '';
    document.getElementById('contactType').value = contact.contact_type || 'custom';
    document.getElementById('contactLabel').value = contact.label_ar || contact.label_en || '';
    document.getElementById('contactHref').value = contact.href || '';
    document.getElementById('contactSortOrder').value = contact.sort_order || 1;
    document.getElementById('contactIsActive').checked = contact.is_active !== false;
  }

  function resetContactForm() {
    if (!contactForm) return;
    contactForm.reset();
    document.getElementById('contactId').value = '';
    document.getElementById('contactIsActive').checked = true;
  }

  if (contactResetBtn) {
    contactResetBtn.addEventListener('click', resetContactForm);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const type = document.getElementById('contactType').value;
      const label = document.getElementById('contactLabel').value.trim();
      const href = document.getElementById('contactHref').value.trim();
      const id = document.getElementById('contactId').value;

      if (!href || !label) {
        alert('اكتب الاسم والرابط أولا');
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      const result = await bsUpsertSiteContact({
        id: id || undefined,
        contact_type: type,
        icon_key: type,
        label_ar: label,
        label_en: label,
        href,
        sort_order: Number(document.getElementById('contactSortOrder').value || 1),
        is_active: document.getElementById('contactIsActive').checked
      });

      submitBtn.disabled = false;
      if (result?.error) {
        alert('فشل حفظ وسيلة التواصل: ' + result.error.message);
        return;
      }

      resetContactForm();
      loadDashboardData();
    });
  }

  /* ==========================================
     Document Settings
     ========================================== */
  const documentSettingsForm = document.getElementById('documentSettingsForm');
  const documentSettingsResetBtn = document.getElementById('documentSettingsResetBtn');
  const documentPreviewBtn = document.getElementById('documentPreviewBtn');

  function renderDocumentSettings(settings) {
    if (!documentSettingsForm) return;
    const invoiceTemplate = settings?.invoice_template || {};
    const officialFooter = settings?.official_footer || {};

    const languageSelect = document.getElementById('docDefaultLanguage');
    const currencySelect = document.getElementById('docDefaultCurrency');
    if (languageSelect) {
      languageSelect.dataset.selected = settings?.default_language || 'ar';
      if (typeof bsPopulateDocumentLanguageSelect === 'function') {
        bsPopulateDocumentLanguageSelect(languageSelect, languageSelect.dataset.selected);
      }
    }
    if (currencySelect) {
      currencySelect.dataset.selected = settings?.default_currency || 'EGP';
      if (typeof bsPopulateCurrencySelect === 'function') {
        bsPopulateCurrencySelect(currencySelect, currencySelect.dataset.selected);
      }
    }

    document.getElementById('docAllowDualLanguage').checked = settings?.allow_dual_language !== false;
    document.getElementById('docShowQr').checked = Boolean(invoiceTemplate.show_qr);
    document.getElementById('docQrPosition').value = invoiceTemplate.qr_position || 'footer';
    document.getElementById('docBankDetails').value = formatBankingDetails(invoiceTemplate.banking_details || settings?.banking_details || {});
    document.getElementById('docInvoiceTermsAr').value = invoiceTemplate.terms_ar || 'تعتبر هذه الفاتورة رسمية بعد اعتماد الإدارة وختم الأكاديمية.';
    document.getElementById('docInvoiceTermsEn').value = invoiceTemplate.terms_en || 'This invoice is official after management approval and academy stamp.';
    document.getElementById('docOwnerName').value = officialFooter.owner_name || 'Eng/Bahaa Hussein';
    document.getElementById('docShowOwnerFooter').checked = officialFooter.show_owner_name !== false;
  }

  function formatBankingDetails(details) {
    if (!details || Object.keys(details).length === 0) return '';
    if (typeof details === 'string') return details;
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
      .join('\n');
  }

  function parseBankingDetails(text) {
    const details = {};
    (text || '').split(/\n+/).forEach(line => {
      const idx = line.indexOf(':');
      if (idx > -1) {
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();
        if (key) details[key] = value;
      }
    });
    return details;
  }

  function collectDocumentSettings() {
    return {
      default_language: document.getElementById('docDefaultLanguage')?.value || 'ar',
      default_currency: document.getElementById('docDefaultCurrency')?.value || 'EGP',
      allow_dual_language: document.getElementById('docAllowDualLanguage')?.checked !== false,
      invoice_template: {
        show_logo: true,
        show_qr: document.getElementById('docShowQr')?.checked || false,
        qr_position: document.getElementById('docQrPosition')?.value || 'footer',
        layout: 'academy_standard',
        editable_from_dashboard: true,
        banking_details: parseBankingDetails(document.getElementById('docBankDetails')?.value || ''),
        terms_ar: document.getElementById('docInvoiceTermsAr')?.value || '',
        terms_en: document.getElementById('docInvoiceTermsEn')?.value || ''
      },
      contract_template: {
        show_logo: true,
        show_qr: document.getElementById('docShowQr')?.checked || false,
        layout: 'academy_contract',
        editable_from_dashboard: true
      },
      official_footer: {
        owner_name: document.getElementById('docOwnerName')?.value.trim() || 'Eng/Bahaa Hussein',
        owner_title: 'Academy Owner & General Manager',
        show_owner_name: document.getElementById('docShowOwnerFooter')?.checked !== false,
        show_academy_stamp: document.getElementById('docShowOwnerFooter')?.checked !== false,
        show_owner_signature: document.getElementById('docShowOwnerFooter')?.checked !== false,
        applies_to: ['invoice', 'contract', 'certificate', 'letter', 'internal_document']
      }
    };
  }

  if (documentSettingsForm) {
    documentSettingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = documentSettingsForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      const settingsPayload = collectDocumentSettings();
      const templateFile = document.getElementById('docTemplateFile')?.files?.[0];
      let uploadedTemplate = null;
      if (templateFile && typeof bsUploadToGoogleDrive === 'function') {
        uploadedTemplate = await bsUploadToGoogleDrive(templateFile, '07_Documents/Templates', {
          entityType: 'document_template',
          category: 'template_upload',
          visibilityScope: 'academy_admin'
        });
      }

      const result = await bsSaveDocumentSettings(settingsPayload);
      if (!result?.error && typeof bsUpsertDocumentTemplate === 'function') {
        await bsUpsertDocumentTemplate({
          template_type: 'invoice',
          name_ar: 'تمبلت فاتورة B&S الرسمي',
          name_en: 'Official B&S Invoice Template',
          language_mode: settingsPayload.allow_dual_language ? 'dual' : settingsPayload.default_language,
          default_currency: settingsPayload.default_currency,
          header_fields: settingsPayload.invoice_template,
          body_fields: { show_items: true, show_discount: true, show_total_text: true },
          footer_fields: settingsPayload.official_footer,
          banking_details: settingsPayload.invoice_template.banking_details,
          terms_ar: settingsPayload.invoice_template.terms_ar,
          terms_en: settingsPayload.invoice_template.terms_en,
          template_file_url: uploadedTemplate?.url || null,
          is_default: true,
          is_active: true
        });
      }
      submitBtn.disabled = false;
      if (result?.error) {
        alert('فشل حفظ إعدادات المستندات: ' + result.error.message);
        return;
      }
      documentSettings = result.data;
      renderDocumentSettings(documentSettings);
      documentTemplates = typeof bsGetDocumentTemplates === 'function' ? await bsGetDocumentTemplates() : [];
      renderDocumentTemplates(documentTemplates);
      alert('تم حفظ إعدادات الفواتير والمستندات');
    });
  }

  if (documentSettingsResetBtn) {
    documentSettingsResetBtn.addEventListener('click', () => {
      renderDocumentSettings({
        default_language: 'ar',
        default_currency: 'EGP',
        allow_dual_language: true,
        invoice_template: { show_qr: false, qr_position: 'footer' },
        official_footer: { owner_name: 'Eng/Bahaa Hussein', show_owner_name: true }
      });
    });
  }

  if (documentPreviewBtn) {
    documentPreviewBtn.addEventListener('click', () => {
      renderDocumentPreview(collectDocumentSettings());
    });
  }

  function renderDocumentPreview(settings) {
    const preview = document.getElementById('documentTemplatePreview');
    if (!preview) return;
    const invoice = settings.invoice_template || {};
    const footer = settings.official_footer || {};
    const bankText = formatBankingDetails(invoice.banking_details || {});
    preview.innerHTML = `
      <div class="invoice-preview-head">
        <div>
          <strong>B&S Academy</strong><br>
          <span>Invoice / فاتورة</span>
        </div>
        <div>
          <span>Language: ${settings.allow_dual_language ? 'AR + EN' : settings.default_language}</span><br>
          <span>Currency: ${settings.default_currency}</span>
        </div>
      </div>
      <div>
        <strong>بيانات تظهر في الفاتورة:</strong>
        <p>Logo: ${invoice.show_logo ? 'Yes' : 'No'} - QR: ${invoice.show_qr ? invoice.qr_position : 'Hidden'} - Items - Total - Notes</p>
        <p><strong>Banking:</strong><br>${bankText ? bankText.replace(/\n/g, '<br>') : 'Not configured yet'}</p>
        <p><strong>Terms AR:</strong> ${invoice.terms_ar || '-'}</p>
        <p><strong>Terms EN:</strong> ${invoice.terms_en || '-'}</p>
      </div>
      <div class="preview-footer">
        ${footer.show_owner_name !== false ? footer.owner_name || 'Eng/Bahaa Hussein' : ''}<br>
        ${footer.show_academy_stamp !== false ? 'Academy stamp + official Pb7 signature overlay' : 'Stamp hidden'}
      </div>
    `;
  }

  function renderDocumentTemplates(templates) {
    const tbody = document.getElementById('documentTemplatesTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!templates || templates.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">لا توجد تمبلتات محفوظة بعد</td></tr>';
      return;
    }

    templates.forEach(template => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${template.template_type || '-'}</td>
        <td>
          <strong>${template.name_ar || '-'}</strong><br>
          <small>${template.name_en || ''}</small>
        </td>
        <td>${template.language_mode || '-'}</td>
        <td>${template.default_currency || '-'}</td>
        <td>${template.is_default ? 'نعم' : 'لا'}</td>
        <td><span class="status-badge ${template.is_active ? 'approved' : 'rejected'}">${template.is_active ? 'نشط' : 'معطل'}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  /* ==========================================
     File Viewer Modal
     ========================================== */
  const modal = document.getElementById('fileViewerModal');
  const closeModal = document.querySelector('.close-modal');
  
  window.openFileViewer = function(fileId) {
    const file = allAcademyFiles.find(f => f.id === fileId);
    if (!file) return;

    document.getElementById('fvName').textContent = file.file_name;
    document.getElementById('fvSize').textContent = (file.file_size / 1024 / 1024).toFixed(2) + ' MB';
    document.getElementById('fvType').textContent = file.mime_type;
    
    // In the future this should hit a gateway endpoint. For now, it uses the raw Drive link 
    // but the actual URL is hidden from HTML source code unless clicked.
    const downloadBtn = document.getElementById('fvDownloadBtn');
    downloadBtn.href = file.drive_url;
    downloadBtn.setAttribute('download', ''); // hint to download

    // Only super_admin or drive_manager sees the raw Drive link
    const driveBtn = document.getElementById('fvDriveBtn');
    const isSuperAdmin = currentAdminProfile && canManageDrive(currentAdminProfile.role);
    if (isSuperAdmin) {
      driveBtn.style.display = 'inline-flex';
      driveBtn.href = file.drive_url;
    } else {
      driveBtn.style.display = 'none';
    }

    modal.classList.add('active');
  };

  closeModal.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // Close on outside click
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  /* ==========================================
     Drive Tree Manager Logic
     (Inside DOMContentLoaded — safe access to DOM)
     ========================================== */
  const fmGrid = document.getElementById('fmGrid');
  const fmLoading = document.getElementById('fmLoading');
  const fmBreadcrumb = document.getElementById('fmBreadcrumb');
  let currentFolderPath = '';
  let currentFolderId = '';

  async function fmApiCall(payload) {
    if (typeof GOOGLE_DRIVE_UPLOAD_ENDPOINT === 'undefined' || !GOOGLE_DRIVE_UPLOAD_ENDPOINT) return null;
    try {
      const requestPayload = {
        token: typeof GOOGLE_DRIVE_UPLOAD_TOKEN === 'undefined' ? '' : GOOGLE_DRIVE_UPLOAD_TOKEN,
        ...payload
      };
      const response = await fetch(GOOGLE_DRIVE_UPLOAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(requestPayload)
      });
      return await response.json();
    } catch (e) {
      console.error('[DriveManager]', e);
      return null;
    }
  }

  async function loadFolder(path = '', folderId = '') {
    if (!fmGrid) return;
    fmGrid.style.display = 'none';
    fmLoading.style.display = 'block';
    currentFolderPath = path;
    currentFolderId = folderId;

    const result = await fmApiCall({ action: 'list_folder', folderPath: path, folderId: folderId });
    
    fmLoading.style.display = 'none';
    fmGrid.style.display = 'grid';

    if (!result || !result.ok) {
      fmGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: red;">فشل تحميل المجلد — تأكد من إعداد الـ Apps Script</div>';
      return;
    }

    renderBreadcrumb(path);
    renderGrid(result.folders || [], result.files || []);
  }

  function renderBreadcrumb(path) {
    if (!fmBreadcrumb) return;
    if (!path) {
      fmBreadcrumb.innerHTML = `<span class="fm-crumb active" data-path="">📁 B&S Academy</span>`;
      return;
    }
    const parts = path.split('/').filter(p => p.trim());
    let html = `<span class="fm-crumb" data-path="">📁 B&S Academy</span>`;
    let current = '';
    parts.forEach((p, idx) => {
      current += (current ? '/' : '') + p;
      if (idx === parts.length - 1) {
        html += `<span class="fm-crumb active" data-path="${current}">${p}</span>`;
      } else {
        html += `<span class="fm-crumb" data-path="${current}">${p}</span>`;
      }
    });
    fmBreadcrumb.innerHTML = html;

    fmBreadcrumb.querySelectorAll('.fm-crumb').forEach(crumb => {
      if (!crumb.classList.contains('active')) {
        crumb.addEventListener('click', () => loadFolder(crumb.dataset.path));
      }
    });
  }

  function renderGrid(folders, files) {
    if (!fmGrid) return;
    fmGrid.innerHTML = '';
    
    if (folders.length === 0 && files.length === 0) {
      fmGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">المجلد فارغ</div>';
      return;
    }

    folders.forEach(f => {
      const el = document.createElement('div');
      el.className = 'fm-item' + (f.isArchived ? ' archived' : '');
      el.innerHTML = `
        <div class="fm-icon">📁</div>
        <div class="fm-name">${f.name}</div>
        <div class="fm-item-actions">
          <button class="fm-btn btn-rename" data-id="${f.id}" data-name="${f.name}" data-isfolder="true">تسمية</button>
          <button class="fm-btn btn-archive" data-id="${f.id}" data-isfolder="true">أرشفة</button>
        </div>
      `;
      el.addEventListener('dblclick', () => {
        const newPath = currentFolderPath ? currentFolderPath + '/' + f.name : f.name;
        loadFolder(newPath, f.id);
      });
      fmGrid.appendChild(el);
    });

    files.forEach(f => {
      const el = document.createElement('div');
      el.className = 'fm-item' + (f.isArchived ? ' archived' : '');
      let icon = '📄';
      if (f.mimeType && f.mimeType.includes('image')) icon = '🖼️';
      else if (f.mimeType && f.mimeType.includes('video')) icon = '🎬';
      else if (f.mimeType && f.mimeType.includes('pdf')) icon = '📑';

      el.innerHTML = `
        <div class="fm-icon">${icon}</div>
        <div class="fm-name">${f.name}</div>
        <div class="fm-item-actions">
          <a class="fm-btn" href="${f.url}" target="_blank">عرض</a>
          <button class="fm-btn btn-rename" data-id="${f.id}" data-name="${f.name}" data-isfolder="false">تسمية</button>
          <button class="fm-btn btn-archive" data-id="${f.id}" data-isfolder="false">أرشفة</button>
        </div>
      `;
      fmGrid.appendChild(el);
    });

    fmGrid.querySelectorAll('.btn-rename').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const oldName = btn.dataset.name;
        const newName = prompt('أدخل الاسم الجديد:', oldName);
        if (newName && newName !== oldName) {
          btn.textContent = '...';
          await fmApiCall({ action: 'rename_item', itemId: btn.dataset.id, newName, isFolder: btn.dataset.isfolder === 'true' });
          loadFolder(currentFolderPath, currentFolderId);
        }
      });
    });

    fmGrid.querySelectorAll('.btn-archive').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('هل أنت متأكد من أرشفة هذا العنصر؟')) {
          btn.textContent = '...';
          await fmApiCall({ action: 'archive_item', itemId: btn.dataset.id, isFolder: btn.dataset.isfolder === 'true' });
          loadFolder(currentFolderPath, currentFolderId);
        }
      });
    });
  }

  const fmBtnCreateFolder = document.getElementById('fmBtnCreateFolder');
  const fmBtnUpload = document.getElementById('fmBtnUpload');

  if (fmBtnCreateFolder) {
    fmBtnCreateFolder.addEventListener('click', async () => {
      const name = prompt('اسم الفولدر الجديد:');
      if (!name) return;
      const newPath = currentFolderPath ? currentFolderPath + '/' + name : name;
      fmBtnCreateFolder.disabled = true;
      const res = await fmApiCall({ action: 'create_folder', folderPath: newPath });
      fmBtnCreateFolder.disabled = false;
      if (res && res.ok) {
        loadFolder(currentFolderPath, currentFolderId);
      } else {
        alert('فشل إنشاء الفولدر!');
      }
    });
  }

  const filesTab = document.querySelector('.nav-item[data-tab="files"]');
  if (filesTab) {
    filesTab.addEventListener('click', () => {
      if (!currentFolderPath && !currentFolderId) loadFolder();
    });
  }

  if (fmBtnUpload) {
    const fmUploadInput = document.createElement('input');
    fmUploadInput.type = 'file';
    fmUploadInput.style.display = 'none';
    document.body.appendChild(fmUploadInput);

    fmBtnUpload.addEventListener('click', () => fmUploadInput.click());

    fmUploadInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      fmBtnUpload.disabled = true;
      fmBtnUpload.textContent = 'جاري الرفع...';

      if (typeof bsFileToBase64 !== 'function') {
        alert('Missing bsFileToBase64 helper');
        fmBtnUpload.disabled = false;
        fmBtnUpload.textContent = 'رفع ملف هنا';
        return;
      }

      const base64 = await bsFileToBase64(file);
      const res = await fmApiCall({
        action: 'upload',
        folder: currentFolderPath,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        base64
      });

      fmBtnUpload.disabled = false;
      fmBtnUpload.textContent = 'رفع ملف هنا';
      fmUploadInput.value = '';

      if (res && res.ok) {
        loadFolder(currentFolderPath, currentFolderId);
      } else {
        alert('فشل رفع الملف!');
      }
    });
  }

}); // End DOMContentLoaded
