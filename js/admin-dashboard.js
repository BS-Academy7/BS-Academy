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
  let qrRoutingSettings = null;

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
      loginError.textContent = 'Ù‡Ø°Ø§ Ø§Ù„Ø­Ø³Ø§Ø¨ Ù„Ø§ ÙŠÙ…Ù„Ùƒ ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©. Ø§Ø·Ù„Ø¨ ØªØ±Ù‚ÙŠØ© Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ© Ù…Ù† Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¹Ù„ÙŠØ§.';
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
    const qrNav = document.querySelector('.nav-item[data-tab="qr-lifecycle"]');
    if (qrNav) qrNav.style.display = ['admin', 'super_admin'].includes(role) ? 'flex' : 'none';
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
    qrRoutingSettings = typeof bsGetQrRoutingSettings === 'function'
      ? await bsGetQrRoutingSettings()
      : null;
    
    // Fetch all academy_files
    const { data: filesData } = await supabaseClient.from('academy_files').select('*');
    allAcademyFiles = filesData || [];

    renderRequests(requests);
    renderOnboardingApplications(onboardingApplications);
    renderContacts(siteContacts);
    renderDocumentSettings(documentSettings);
    renderManagedProfiles(managedProfiles);
    renderDocumentTemplates(documentTemplates);
    renderQrRoutingSettings(qrRoutingSettings);
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
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Ù„Ø§ ØªÙˆØ¬Ø¯ Ø­Ø³Ø§Ø¨Ø§Øª Ø¸Ø§Ù‡Ø±Ø© Ø­Ø§Ù„ÙŠØ§</td></tr>';
      return;
    }

    profiles.forEach(profile => {
      const tr = document.createElement('tr');
      const status = profile.profile_status || 'active';
      tr.innerHTML = `
        <td>
          <strong>${profile.full_name || 'Ø¨Ø¯ÙˆÙ† Ø§Ø³Ù…'}</strong><br>
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
          <button class="fm-btn btn-save-user" data-id="${profile.id}">Ø­ÙØ¸</button>
          <button class="fm-btn btn-request-delete-user" data-id="${profile.id}">Ø·Ù„Ø¨ Ø­Ø°Ù Auth</button>
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
          alert('ÙØ´Ù„ Ø­ÙØ¸ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…: ' + result.error.message);
          return;
        }
        loadDashboardData();
      });
    });

    tbody.querySelectorAll('.btn-request-delete-user').forEach(btn => {
      btn.addEventListener('click', async () => {
        const profile = managedProfiles.find(item => item.id === btn.dataset.id);
        if (!profile) return;
        if (!confirm('Ø³ÙŠØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø·Ù„Ø¨ Ø­Ø°Ù Auth Ù„Ù‡Ø°Ø§ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…. Ø§Ù„Ø­Ø°Ù Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ ÙŠØ­ØªØ§Ø¬ Edge Function Ø¢Ù…Ù†Ø©. Ù‡Ù„ ØªØ¤ÙƒØ¯ØŸ')) return;
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
        if (result?.error) alert('ÙØ´Ù„ ØªØ³Ø¬ÙŠÙ„ Ø·Ù„Ø¨ Ø§Ù„Ø­Ø°Ù: ' + result.error.message);
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
    const map = { student: 'Ø·Ø§Ù„Ø¨', instructor: 'Ù…Ø­Ø§Ø¶Ø±', staff: 'ÙØ±ÙŠÙ‚ / Ø¥Ø¯Ø§Ø±Ø©' };
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
        alert('Ø§ÙƒØªØ¨ Ø¥ÙŠÙ…ÙŠÙ„ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø£ÙˆÙ„Ø§');
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
        alert('ÙØ´Ù„ ØªØ³Ø¬ÙŠÙ„ Ø·Ù„Ø¨ Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…: ' + result.error.message);
        return;
      }
      adminUserActionForm.reset();
      alert('ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø·Ù„Ø¨ Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…. Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ ÙŠØ­ØªØ§Ø¬ Edge Function Ø¢Ù…Ù†Ø© Ø¨Ù…ÙØªØ§Ø­ service_role.');
    });
  }

  function renderRequests(requests) {
    const tbody = document.getElementById('requestsTableBody');
    tbody.innerHTML = '';

    if (requests.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª Ø­Ø§Ù„ÙŠØ§Ù‹</td></tr>';
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
          attachmentsHtml += `<button class="attachment-btn" onclick="openFileViewer('${file.id}')">ðŸ“Ž ${file.file_name.substring(0, 15)}...</button>`;
        });
      } else if (req.attachment_urls && req.attachment_urls.length > 0) {
        // Fallback for old requests that weren't registered in academy_files
        req.attachment_urls.forEach((url, idx) => {
          const escapedUrl = encodeURIComponent(url);
          attachmentsHtml += `<button class="attachment-btn" onclick="openExternalFileViewer('${escapedUrl}', 'Ù…Ø±ÙÙ‚ ${idx+1}', '')">ðŸ”— Ù…Ø±ÙÙ‚ ${idx+1} (Ù‚Ø¯ÙŠÙ…)</button>`;
        });
      } else {
        attachmentsHtml = '<span style="color:#888;">Ù„Ø§ ÙŠÙˆØ¬Ø¯</span>';
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
        <td><span class="status-badge ${req.status}">${req.status === 'new' ? 'Ø¬Ø¯ÙŠØ¯' : req.status}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderOnboardingApplications(applications) {
    const tbody = document.getElementById('onboardingTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!applications || applications.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Ù„Ø§ ØªÙˆØ¬Ø¯ ØªØ³Ø¬ÙŠÙ„Ø§Øª Ø¬Ø¯ÙŠØ¯Ø© Ø­Ø§Ù„ÙŠØ§Ù‹</td></tr>';
      return;
    }

    applications.forEach(app => {
      const profile = app.profiles || {};
      const tr = document.createElement('tr');
      const date = new Date(app.submitted_at).toLocaleDateString('ar-EG');
      const typeLabel = app.account_type === 'instructor'
        ? 'Ù…Ø­Ø§Ø¶Ø±'
        : app.account_type === 'staff'
          ? 'Ø¨ÙˆØ²ÙŠØ´Ù† / ÙØ±ÙŠÙ‚'
          : 'Ø·Ø§Ù„Ø¨';

      tr.innerHTML = `
        <td>${date}</td>
        <td>
          <strong>${profile.full_name || 'Ù…Ø³ØªØ®Ø¯Ù… Ø¬Ø¯ÙŠØ¯'}</strong><br>
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
          <button class="fm-btn btn-next-stage" data-id="${app.id}">Ù…Ø±Ø­Ù„Ø© ØªØ§Ù„ÙŠØ©</button>
          <button class="fm-btn btn-approve" data-id="${app.id}">Ù‚Ø¨ÙˆÙ„ Ù…Ø¨Ø§Ø´Ø±</button>
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
        if (!confirm('ØªØ£ÙƒÙŠØ¯ Ù‚Ø¨ÙˆÙ„ Ù‡Ø°Ø§ Ø§Ù„Ø­Ø³Ø§Ø¨ Ù…Ø¨Ø§Ø´Ø±Ø©ØŸ')) return;
        btn.disabled = true;
        const result = await bsApproveOnboardingApplication(app);
        if (result?.error) alert('ÙØ´Ù„ Ø§Ù„Ù‚Ø¨ÙˆÙ„: ' + result.error.message);
        loadDashboardData();
      });
    });
  }

  function formatStage(stage) {
    const map = {
      complete_profile: 'Ø§Ø³ØªÙƒÙ…Ø§Ù„ Ø¨ÙŠØ§Ù†Ø§Øª',
      documents: 'Ø±ÙØ¹ Ù…Ø³ØªÙ†Ø¯Ø§Øª',
      technical_test: 'Ø§Ø®ØªØ¨Ø§Ø± ÙÙ†ÙŠ',
      interview: 'Ù…Ù‚Ø§Ø¨Ù„Ø©',
      final_review: 'Ù…Ø±Ø§Ø¬Ø¹Ø© Ù†Ù‡Ø§Ø¦ÙŠØ©',
      permission_review: 'Ù…Ø±Ø§Ø¬Ø¹Ø© ØµÙ„Ø§Ø­ÙŠØ§Øª',
      approved: 'Ù…Ù‚Ø¨ÙˆÙ„'
    };
    return map[stage] || stage || '-';
  }

  function formatStatus(status) {
    const map = {
      needs_profile: 'Ù†Ø§Ù‚Øµ Ø¨ÙŠØ§Ù†Ø§Øª',
      in_review: 'ØªØ­Øª Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©',
      pending_documents: 'Ù…Ø·Ù„ÙˆØ¨ Ù…Ø³ØªÙ†Ø¯Ø§Øª',
      pending_test: 'Ø§Ø®ØªØ¨Ø§Ø±',
      pending_interview: 'Ù…Ù‚Ø§Ø¨Ù„Ø©',
      approved: 'Ù…Ù‚Ø¨ÙˆÙ„',
      rejected: 'Ù…Ø±ÙÙˆØ¶',
      disabled: 'Ù…Ø¹Ø·Ù„'
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
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Ù„Ø§ ØªÙˆØ¬Ø¯ ÙˆØ³Ø§Ø¦Ù„ ØªÙˆØ§ØµÙ„ Ø¨Ø¹Ø¯</td></tr>';
      return;
    }

    contacts.forEach(contact => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${contact.contact_type || '-'}</td>
        <td>${contact.label_ar || contact.label_en || '-'}</td>
        <td><a class="contact-link-preview" href="${contact.href}" target="_blank" rel="noopener">${contact.href}</a></td>
        <td>${contact.sort_order || 1}</td>
        <td><span class="status-badge ${contact.is_active ? 'approved' : 'rejected'}">${contact.is_active ? 'Ø¸Ø§Ù‡Ø±' : 'Ù…Ø®ÙÙŠ'}</span></td>
        <td class="action-cell">
          <button class="fm-btn btn-edit-contact" data-id="${contact.id}">ØªØ¹Ø¯ÙŠÙ„</button>
          <button class="fm-btn btn-delete-contact" data-id="${contact.id}">Ø­Ø°Ù</button>
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
        if (!confirm('ØªØ£ÙƒÙŠØ¯ Ø­Ø°Ù ÙˆØ³ÙŠÙ„Ø© Ø§Ù„ØªÙˆØ§ØµÙ„ØŸ')) return;
        btn.disabled = true;
        const result = await bsDeleteSiteContact(btn.dataset.id);
        if (result?.error) alert('ÙØ´Ù„ Ø§Ù„Ø­Ø°Ù: ' + result.error.message);
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
        alert('Ø§ÙƒØªØ¨ Ø§Ù„Ø§Ø³Ù… ÙˆØ§Ù„Ø±Ø§Ø¨Ø· Ø£ÙˆÙ„Ø§');
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
        alert('ÙØ´Ù„ Ø­ÙØ¸ ÙˆØ³ÙŠÙ„Ø© Ø§Ù„ØªÙˆØ§ØµÙ„: ' + result.error.message);
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
    document.getElementById('docInvoiceTermsAr').value = invoiceTemplate.terms_ar || 'ØªØ¹ØªØ¨Ø± Ù‡Ø°Ù‡ Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ø±Ø³Ù…ÙŠØ© Ø¨Ø¹Ø¯ Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© ÙˆØ®ØªÙ… Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ©.';
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
          name_ar: 'ØªÙ…Ø¨Ù„Øª ÙØ§ØªÙˆØ±Ø© B&S Ø§Ù„Ø±Ø³Ù…ÙŠ',
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
        alert('ÙØ´Ù„ Ø­ÙØ¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª: ' + result.error.message);
        return;
      }
      documentSettings = result.data;
      renderDocumentSettings(documentSettings);
      documentTemplates = typeof bsGetDocumentTemplates === 'function' ? await bsGetDocumentTemplates() : [];
      renderDocumentTemplates(documentTemplates);
      alert('ØªÙ… Ø­ÙØ¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„ÙÙˆØ§ØªÙŠØ± ÙˆØ§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª');
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
      <div class="invoice-paper">
        <div class="invoice-preview-head">
          <div class="invoice-brand">
            <img src="images/logo.webp" alt="B&S Academy">
            <div>
              <strong>B&S Academy</strong><br>
              <span>Learning Â· Growth Â· Solutions</span>
            </div>
          </div>
          <div class="invoice-title">
            <strong>INVOICE</strong>
            <span>ÙØ§ØªÙˆØ±Ø© Ø±Ø³Ù…ÙŠØ©</span>
          </div>
        </div>
        <div class="invoice-meta-grid">
          <div class="invoice-box">
            <strong>Bill To / Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¹Ù…ÙŠÙ„</strong><br>
            Student Name<br>
            student@example.com<br>
            Country / Ø§Ù„Ø¯ÙˆÙ„Ø©
          </div>
          <div class="invoice-box">
            <strong>Invoice Details</strong><br>
            No: BSA-0001<br>
            Language: ${settings.allow_dual_language ? 'AR + EN' : settings.default_language}<br>
            Currency: ${settings.default_currency}
          </div>
        </div>
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Course / Service</td>
              <td>Academy service details shown here</td>
              <td>${settings.default_currency} 1,000.00</td>
            </tr>
            <tr class="invoice-total-row">
              <td colspan="2">Total / Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ</td>
              <td>${settings.default_currency} 1,000.00</td>
            </tr>
          </tbody>
        </table>
        <div class="invoice-terms">
          <p><strong>Banking:</strong><br>${bankText ? bankText.replace(/\n/g, '<br>') : 'Not configured yet'}</p>
          <p><strong>Ø§Ù„Ø´Ø±ÙˆØ·:</strong> ${invoice.terms_ar || '-'}</p>
          <p><strong>Terms:</strong> ${invoice.terms_en || '-'}</p>
          <p><strong>QR:</strong> ${invoice.show_qr ? invoice.qr_position : 'Hidden'}</p>
        </div>
        <div class="preview-footer">
          <div class="stamp-preview">
            ${footer.show_owner_name !== false ? footer.owner_name || 'Eng/Bahaa Hussein' : ''}<br>
            Academy stamp<br>
            Pb7 Signature
          </div>
        </div>
      </div>
    `;
  }

  function renderDocumentTemplates(templates) {
    const tbody = document.getElementById('documentTemplatesTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!templates || templates.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Ù„Ø§ ØªÙˆØ¬Ø¯ ØªÙ…Ø¨Ù„ØªØ§Øª Ù…Ø­ÙÙˆØ¸Ø© Ø¨Ø¹Ø¯</td></tr>';
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
        <td>${template.is_default ? 'Ù†Ø¹Ù…' : 'Ù„Ø§'}</td>
        <td><span class="status-badge ${template.is_active ? 'approved' : 'rejected'}">${template.is_active ? 'Ù†Ø´Ø·' : 'Ù…Ø¹Ø·Ù„'}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  /* ==========================================
     QR Lifecycle
     ========================================== */
  const qrSettingsForm = document.getElementById('qrSettingsForm');
  const qrPreviewBtn = document.getElementById('qrPreviewBtn');
  const qrMediaFile = document.getElementById('qrMediaFile');
  const qrMediaUrlInput = document.getElementById('qrNewQrMediaUrl');

  function renderQrRoutingSettings(settings) {
    if (!qrSettingsForm) return;
    const fallback = {
      transition_mode: false,
      current_platform_url: 'https://bs-academy7.github.io/BS-Academy/',
      new_platform_url: 'https://bs-academy7.github.io/BS-Academy/',
      expiration_timestamp: new Date(Date.now() + 30 * 86400000).toISOString(),
      new_qr_media_url: '',
      support_contact_url: 'https://wa.me/201550755928'
    };
    const data = { ...fallback, ...(settings || {}) };

    document.getElementById('qrTransitionMode').checked = Boolean(data.transition_mode);
    document.getElementById('qrCurrentPlatformUrl').value = data.current_platform_url || fallback.current_platform_url;
    document.getElementById('qrNewPlatformUrl').value = data.new_platform_url || fallback.new_platform_url;
    document.getElementById('qrExpirationTimestamp').value = toDatetimeLocalValue(data.expiration_timestamp);
    document.getElementById('qrSupportContactUrl').value = data.support_contact_url || fallback.support_contact_url;
    document.getElementById('qrNewQrMediaUrl').value = data.new_qr_media_url || '';
    renderQrAdminPreview(data.new_qr_media_url);
  }

  function collectQrRoutingSettings() {
    return {
      transition_mode: document.getElementById('qrTransitionMode')?.checked || false,
      current_platform_url: document.getElementById('qrCurrentPlatformUrl')?.value.trim() || 'https://bs-academy7.github.io/BS-Academy/',
      new_platform_url: document.getElementById('qrNewPlatformUrl')?.value.trim() || 'https://bs-academy7.github.io/BS-Academy/',
      expiration_timestamp: fromDatetimeLocalValue(document.getElementById('qrExpirationTimestamp')?.value),
      new_qr_media_url: document.getElementById('qrNewQrMediaUrl')?.value.trim() || null,
      support_contact_url: document.getElementById('qrSupportContactUrl')?.value.trim() || 'https://wa.me/201550755928'
    };
  }

  function renderQrAdminPreview(url) {
    const preview = document.getElementById('qrAdminPreview');
    if (!preview) return;
    if (url) {
      preview.src = url;
      preview.hidden = false;
    } else {
      preview.removeAttribute('src');
      preview.hidden = true;
    }
  }

  function toDatetimeLocalValue(value) {
    const date = value ? new Date(value) : new Date(Date.now() + 30 * 86400000);
    if (!Number.isFinite(date.getTime())) return '';
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  function fromDatetimeLocalValue(value) {
    if (!value) return new Date(Date.now() + 30 * 86400000).toISOString();
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString() : new Date(Date.now() + 30 * 86400000).toISOString();
  }

  function setQrStatus(message, type = 'info') {
    const status = document.getElementById('qrSettingsStatus');
    if (!status) return;
    status.textContent = message || '';
    status.dataset.type = type;
  }

  if (qrMediaUrlInput) {
    qrMediaUrlInput.addEventListener('input', () => renderQrAdminPreview(qrMediaUrlInput.value.trim()));
  }

  if (qrSettingsForm) {
    qrSettingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = qrSettingsForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      setQrStatus('Ø¬Ø§Ø±ÙŠ Ø­ÙØ¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª QR...');

      const payload = collectQrRoutingSettings();
      const file = qrMediaFile?.files?.[0];
      if (file && typeof bsUploadQrMedia === 'function') {
        const uploadResult = await bsUploadQrMedia(file);
        if (uploadResult?.error) {
          submitBtn.disabled = false;
          setQrStatus('ÙØ´Ù„ Ø±ÙØ¹ ØµÙˆØ±Ø© QR: ' + uploadResult.error.message, 'error');
          return;
        }
        payload.new_qr_media_url = uploadResult.url;
        if (qrMediaUrlInput) qrMediaUrlInput.value = uploadResult.url;
      }

      const result = typeof bsSaveQrRoutingSettings === 'function'
        ? await bsSaveQrRoutingSettings(payload)
        : { error: { message: 'QR settings helper is missing' } };

      submitBtn.disabled = false;
      if (result?.error) {
        setQrStatus('ÙØ´Ù„ Ø­ÙØ¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª QR: ' + result.error.message, 'error');
        return;
      }

      qrRoutingSettings = result.data;
      renderQrRoutingSettings(qrRoutingSettings);
      setQrStatus('ØªÙ… Ø­ÙØ¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª QR Ø¨Ù†Ø¬Ø§Ø­. Ø§Ø³ØªØ®Ø¯Ù… Ø§Ù„Ø±Ø§Ø¨Ø· Ø§Ù„Ø«Ø§Ø¨Øª ÙÙŠ Ø£ÙŠ QR Code.', 'success');
    });
  }

  if (qrPreviewBtn) {
    qrPreviewBtn.addEventListener('click', () => {
      window.open('qr.html?preview=' + Date.now(), '_blank', 'noopener');
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
    renderFileViewer(file);
  };

  window.openExternalFileViewer = function(encodedUrl, fileName, mimeType) {
    const url = decodeURIComponent(encodedUrl || '');
    renderFileViewer({
      file_name: fileName || 'External file',
      file_size: 0,
      mime_type: mimeType || guessMimeTypeFromUrl(url),
      drive_url: url,
      drive_file_id: extractDriveFileId(url)
    });
  };

  function renderFileViewer(file) {
    document.getElementById('fvName').textContent = file.file_name;
    document.getElementById('fvSize').textContent = file.file_size ? (file.file_size / 1024 / 1024).toFixed(2) + ' MB' : '-';
    document.getElementById('fvType').textContent = file.mime_type || guessMimeTypeFromUrl(file.drive_url || '');
    renderFilePreview(file);
    
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
  }

  function guessMimeTypeFromUrl(url) {
    const cleanUrl = String(url || '').split('?')[0].toLowerCase();
    if (cleanUrl.endsWith('.pdf')) return 'application/pdf';
    if (cleanUrl.endsWith('.doc') || cleanUrl.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (cleanUrl.endsWith('.xls') || cleanUrl.endsWith('.xlsx')) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (cleanUrl.endsWith('.ppt') || cleanUrl.endsWith('.pptx')) return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    if (/\.(png|jpg|jpeg|webp|gif)$/i.test(cleanUrl)) return 'image/*';
    if (/\.(mp4|webm|ogg|mov)$/i.test(cleanUrl)) return 'video/*';
    return '';
  }

  function extractDriveFileId(url) {
    const text = String(url || '');
    const patterns = [
      /\/file\/d\/([^/]+)/,
      /[?&]id=([^&]+)/,
      /\/d\/([^/]+)\//
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) return match[1];
    }
    return '';
  }

  function getDrivePreviewUrl(file) {
    const id = file.drive_file_id || file.fileId || extractDriveFileId(file.drive_url);
    return id ? `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview` : '';
  }

  function renderFilePreview(file) {
    const preview = document.getElementById('fvPreview');
    if (!preview) return;
    const mimeType = file.mime_type || guessMimeTypeFromUrl(file.drive_url || '');
    const url = file.drive_url || file.url || '';
    const drivePreviewUrl = getDrivePreviewUrl(file);
    const lowerMime = String(mimeType || '').toLowerCase();

    preview.innerHTML = '';

    if (drivePreviewUrl) {
      preview.innerHTML = `<iframe src="${drivePreviewUrl}" allow="autoplay; fullscreen" allowfullscreen title="B&S file preview"></iframe>`;
      return;
    }

    if (lowerMime.includes('image')) {
      preview.innerHTML = `<img src="${url}" alt="${file.file_name || 'Preview'}">`;
      return;
    }

    if (lowerMime.includes('video')) {
      preview.innerHTML = `<video src="${url}" controls playsinline></video>`;
      return;
    }

    if (lowerMime.includes('pdf')) {
      preview.innerHTML = `<iframe src="${url}" title="PDF preview"></iframe>`;
      return;
    }

    const officeTypes = ['word', 'spreadsheet', 'presentation', 'msword', 'excel', 'powerpoint', 'officedocument'];
    if (officeTypes.some(type => lowerMime.includes(type)) && url) {
      const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
      preview.innerHTML = `<iframe src="${officeUrl}" title="Office document preview"></iframe>`;
      return;
    }

    preview.innerHTML = `
      <div class="fv-unsupported">
        <strong>Ø§Ù„Ù…Ø¹Ø§ÙŠÙ†Ø© Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø© ØºÙŠØ± Ù…ØªØ§Ø­Ø© Ù„Ù‡Ø°Ø§ Ø§Ù„Ù†ÙˆØ¹ Ø­Ø§Ù„ÙŠØ§.</strong><br>
        ØªÙ‚Ø¯Ø± ØªØ³ØªØ®Ø¯Ù… Ø²Ø± Ø§Ù„ØªØ­Ù…ÙŠÙ„ØŒ ÙˆÙ„Ùˆ Ø§Ù„Ù…Ù„Ù Ø¹Ù„Ù‰ Google Drive Ø¨ØµÙ„Ø§Ø­ÙŠØ© Ù…Ù†Ø§Ø³Ø¨Ø© Ø³ÙŠØ¸Ù‡Ø± Ø¯Ø§Ø®Ù„ Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ© ØªÙ„Ù‚Ø§Ø¦ÙŠØ§.
      </div>
    `;
  }

  closeModal.addEventListener('click', () => {
    modal.classList.remove('active');
    document.getElementById('fvPreview').innerHTML = '<div class="fv-empty">Ø§Ø®ØªØ± Ù…Ù„ÙØ§ Ù„Ø¹Ø±Ø¶Ù‡ Ø¯Ø§Ø®Ù„ Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ©.</div>';
  });

  // Close on outside click
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      document.getElementById('fvPreview').innerHTML = '<div class="fv-empty">Ø§Ø®ØªØ± Ù…Ù„ÙØ§ Ù„Ø¹Ø±Ø¶Ù‡ Ø¯Ø§Ø®Ù„ Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ©.</div>';
    }
  });

  /* ==========================================
     Drive Tree Manager Logic
     (Inside DOMContentLoaded â€” safe access to DOM)
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
      fmGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: red;">ÙØ´Ù„ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ø¬Ù„Ø¯ â€” ØªØ£ÙƒØ¯ Ù…Ù† Ø¥Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ù€ Apps Script</div>';
      return;
    }

    renderBreadcrumb(path);
    renderGrid(result.folders || [], result.files || []);
  }

  function renderBreadcrumb(path) {
    if (!fmBreadcrumb) return;
    if (!path) {
      fmBreadcrumb.innerHTML = `<span class="fm-crumb active" data-path="">ðŸ“ B&S Academy</span>`;
      return;
    }
    const parts = path.split('/').filter(p => p.trim());
    let html = `<span class="fm-crumb" data-path="">ðŸ“ B&S Academy</span>`;
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
      fmGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">Ø§Ù„Ù…Ø¬Ù„Ø¯ ÙØ§Ø±Øº</div>';
      return;
    }

    folders.forEach(f => {
      const el = document.createElement('div');
      el.className = 'fm-item' + (f.isArchived ? ' archived' : '');
      el.innerHTML = `
        <div class="fm-icon">ðŸ“</div>
        <div class="fm-name">${f.name}</div>
        <div class="fm-item-actions">
          <button class="fm-btn btn-rename" data-id="${f.id}" data-name="${f.name}" data-isfolder="true">ØªØ³Ù…ÙŠØ©</button>
          <button class="fm-btn btn-archive" data-id="${f.id}" data-isfolder="true">Ø£Ø±Ø´ÙØ©</button>
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
      let icon = 'ðŸ“„';
      if (f.mimeType && f.mimeType.includes('image')) icon = 'ðŸ–¼ï¸';
      else if (f.mimeType && f.mimeType.includes('video')) icon = 'ðŸŽ¬';
      else if (f.mimeType && f.mimeType.includes('pdf')) icon = 'ðŸ“‘';

      el.innerHTML = `
        <div class="fm-icon">${icon}</div>
        <div class="fm-name">${f.name}</div>
        <div class="fm-item-actions">
          <button class="fm-btn btn-preview-drive-file" data-id="${f.id}" data-name="${f.name}" data-url="${encodeURIComponent(f.url || '')}" data-mime="${f.mimeType || ''}">Ø¹Ø±Ø¶</button>
          <button class="fm-btn btn-rename" data-id="${f.id}" data-name="${f.name}" data-isfolder="false">ØªØ³Ù…ÙŠØ©</button>
          <button class="fm-btn btn-archive" data-id="${f.id}" data-isfolder="false">Ø£Ø±Ø´ÙØ©</button>
        </div>
      `;
      fmGrid.appendChild(el);
    });

    fmGrid.querySelectorAll('.btn-rename').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const oldName = btn.dataset.name;
        const newName = prompt('Ø£Ø¯Ø®Ù„ Ø§Ù„Ø§Ø³Ù… Ø§Ù„Ø¬Ø¯ÙŠØ¯:', oldName);
        if (newName && newName !== oldName) {
          btn.textContent = '...';
          await fmApiCall({ action: 'rename_item', itemId: btn.dataset.id, newName, isFolder: btn.dataset.isfolder === 'true' });
          loadFolder(currentFolderPath, currentFolderId);
        }
      });
    });

    fmGrid.querySelectorAll('.btn-preview-drive-file').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        renderFileViewer({
          file_name: btn.dataset.name || 'Drive file',
          file_size: 0,
          mime_type: btn.dataset.mime || '',
          drive_url: decodeURIComponent(btn.dataset.url || ''),
          drive_file_id: btn.dataset.id || ''
        });
      });
    });

    fmGrid.querySelectorAll('.btn-archive').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø£Ø±Ø´ÙØ© Ù‡Ø°Ø§ Ø§Ù„Ø¹Ù†ØµØ±ØŸ')) {
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
      const name = prompt('Ø§Ø³Ù… Ø§Ù„ÙÙˆÙ„Ø¯Ø± Ø§Ù„Ø¬Ø¯ÙŠØ¯:');
      if (!name) return;
      const newPath = currentFolderPath ? currentFolderPath + '/' + name : name;
      fmBtnCreateFolder.disabled = true;
      const res = await fmApiCall({ action: 'create_folder', folderPath: newPath });
      fmBtnCreateFolder.disabled = false;
      if (res && res.ok) {
        loadFolder(currentFolderPath, currentFolderId);
      } else {
        alert('ÙØ´Ù„ Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„ÙÙˆÙ„Ø¯Ø±!');
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
      fmBtnUpload.textContent = 'Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø±ÙØ¹...';

      if (typeof bsFileToBase64 !== 'function') {
        alert('Missing bsFileToBase64 helper');
        fmBtnUpload.disabled = false;
        fmBtnUpload.textContent = 'Ø±ÙØ¹ Ù…Ù„Ù Ù‡Ù†Ø§';
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
      fmBtnUpload.textContent = 'Ø±ÙØ¹ Ù…Ù„Ù Ù‡Ù†Ø§';
      fmUploadInput.value = '';

      if (res && res.ok) {
        loadFolder(currentFolderPath, currentFolderId);
      } else {
        alert('ÙØ´Ù„ Ø±ÙØ¹ Ø§Ù„Ù…Ù„Ù!');
      }
    });
  }

}); // End DOMContentLoaded
