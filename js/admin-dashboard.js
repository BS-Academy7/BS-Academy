/* ============================================
   B&S Academy - Master Dashboard JS
   ============================================ */

document.addEventListener('DOMContentLoaded', async () => {
  const loginGate = document.getElementById('adminLoginGate');
  const adminLayout = document.getElementById('adminLayout');
  const loginForm = document.getElementById('adminLoginForm');
  const loginError = document.getElementById('adminLoginError');
  const userInfo = document.getElementById('adminUserInfo');
  const logoutBtn = document.getElementById('adminLogoutBtn');
  
  let currentAdminProfile = null;
  let allAcademyFiles = [];

  // Check initial auth state
  await checkAuth();

  // Login form handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = 'جاري تسجيل الدخول...';
    const email = document.getElementById('adminEmail').value;
    const pass = document.getElementById('adminPassword').value;
    
    const { data, error } = await bsSignIn(email, pass);
    if (error) {
      loginError.textContent = 'خطأ في بيانات الدخول';
      return;
    }
    await checkAuth();
  });

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
      loginError.textContent = 'عذراً، هذا الحساب لا يملك صلاحيات الإدارة.';
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
    
    // Fetch all academy_files
    const { data: filesData } = await supabaseClient.from('academy_files').select('*');
    allAcademyFiles = filesData || [];

    renderRequests(requests);
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
