/* ============================================
   B&S Academy — Admin: Recursive Program Tree
   Manager
   ============================================
   Powers the "الأقسام التعليمية" admin tab:
   lets the academy owner add / edit / delete any
   program or sub-program, at any depth, inside any
   sector — entirely through Supabase, no code needed.
   ============================================ */

(function () {

  let currentSectorKey = 'engineering';
  let currentTree = [];
  let pendingParentId = null; // used while the add/edit modal is open
  let editingProgramId = null; // null = adding new, set = editing existing
  let pendingBannerFile = null;

  const sectorSelect = document.getElementById('programSectorSelect');
  const treeContainer = document.getElementById('programTreeContainer');
  const offlineBanner = document.getElementById('programTreeOfflineBanner');
  const addRootBtn = document.getElementById('addRootProgramBtn');
  const formTemplate = document.getElementById('programFormTemplate');

  if (!treeContainer) return; // admin panel not present on this page load

  /* ---- Load + render the tree for the selected sector ---- */
  async function loadAndRenderTree() {
    if (typeof bsGetSectorProgramTree !== 'function' || typeof isSupabaseConfigured === 'undefined' || !isSupabaseConfigured) {
      offlineBanner.style.display = 'block';
      treeContainer.innerHTML = '';
      return;
    }
    offlineBanner.style.display = 'none';
    treeContainer.innerHTML = `<p style="color:var(--ink-soft);">⏳ ${currentLang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>`;

    currentTree = await bsGetSectorProgramTree(currentSectorKey);
    renderTreeUI();
  }

  function renderTreeUI() {
    if (!currentTree.length) {
      treeContainer.innerHTML = `
        <div class="empty-state">
          <h4>${currentLang === 'ar' ? 'لا توجد برامج في هذا القسم بعد' : 'No programs in this sector yet'}</h4>
          <p>${currentLang === 'ar' ? 'دوس "إضافة برنامج رئيسي جديد" تحت للبدء' : 'Click "Add new top-level program" below to start'}</p>
        </div>
      `;
      return;
    }
    treeContainer.innerHTML = currentTree.map(node => renderAdminNode(node, 0)).join('');
    attachNodeButtonHandlers();
  }

  function renderAdminNode(node, depth) {
    const lang = currentLang || 'ar';
    const title = lang === 'ar' ? node.title_ar : node.title_en;
    const hasChildren = node.children && node.children.length > 0;
    const lockEnabled = node.children_sequential_lock === true;

    return `
      <div class="program-admin-node depth-${Math.min(depth, 2)}" data-program-id="${node.id}">
        <div class="program-admin-node-header">
          ${node.banner_url ? `<img src="${node.banner_url}" class="program-admin-thumb" alt="">` : '<div class="program-admin-thumb program-admin-thumb-empty"></div>'}
          <div class="program-admin-node-title">
            <strong>${title}</strong>
            <span class="program-admin-node-id">${node.id.slice(0, 8)}</span>
          </div>
          <div class="program-admin-node-actions">
            <button class="btn-node-action" data-action="add-child" data-id="${node.id}" title="${lang === 'ar' ? 'إضافة برنامج فرعي' : 'Add sub-program'}">➕</button>
            <button class="btn-node-action" data-action="prerequisites" data-id="${node.id}" title="${lang === 'ar' ? 'المتطلبات السابقة' : 'Prerequisites'}">🔗</button>
            <button class="btn-node-action" data-action="exams" data-id="${node.id}" title="${lang === 'ar' ? 'الامتحانات' : 'Exams'}">📝</button>
            <button class="btn-node-action" data-action="edit" data-id="${node.id}" title="${lang === 'ar' ? 'تعديل' : 'Edit'}">✏️</button>
            <button class="btn-node-action btn-node-delete" data-action="delete" data-id="${node.id}" title="${lang === 'ar' ? 'حذف' : 'Delete'}">🗑️</button>
          </div>
        </div>
        ${hasChildren ? `
          <div class="program-admin-lock-toggle-row">
            <label class="lock-toggle-label">
              <input type="checkbox" class="lock-toggle-checkbox" data-action="toggle-lock" data-id="${node.id}" ${lockEnabled ? 'checked' : ''}>
              <span>${lang === 'ar'
                ? '🔒 قفل البرامج اللي جوّه بالترتيب (لازم يخلص اللي قبله الأول)'
                : '🔒 Lock items inside sequentially (must finish the previous one first)'}</span>
            </label>
          </div>
          <div class="program-admin-children">
            ${node.children.map(child => renderAdminNode(child, depth + 1)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  function attachNodeButtonHandlers() {
    treeContainer.querySelectorAll('.btn-node-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === 'add-child') openProgramForm({ parentId: id });
        if (action === 'edit') openProgramForm({ editId: id });
        if (action === 'delete') handleDeleteProgram(id);
        if (action === 'prerequisites') openPrerequisitesModal(id);
        if (action === 'exams') openExamsModal(id);
      });
    });

    treeContainer.querySelectorAll('.lock-toggle-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', async (e) => {
        const id = checkbox.dataset.id;
        const newValue = checkbox.checked;
        const result = await bsUpdateProgram(id, { childrenSequentialLock: newValue });
        if (result.error) {
          showToast(currentLang === 'ar' ? 'فشل التحديث' : 'Update failed', true);
          checkbox.checked = !newValue; // revert visually
          return;
        }
        showToast(newValue
          ? (currentLang === 'ar' ? '🔒 تم تفعيل القفل التتابعي' : '🔒 Sequential lock enabled')
          : (currentLang === 'ar' ? '🔓 تم إلغاء القفل — كل البرامج مفتوحة دلوقتي' : '🔓 Lock disabled — all items are now open'));
        await loadAndRenderTree();
      });
    });
  }

  /* ---- Find a node anywhere in the tree by id (for editing) ---- */
  function findNodeById(nodes, id) {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children && node.children.length) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  /* ---- Open the add/edit modal ---- */
  function openProgramForm({ parentId = null, editId = null }) {
    pendingParentId = parentId;
    editingProgramId = editId;
    pendingBannerFile = null;

    const clone = formTemplate.content.cloneNode(true);
    const overlay = clone.querySelector('.program-form-overlay');
    const titleEl = clone.querySelector('.program-form-title');
    const lang = currentLang || 'ar';

    const existingNode = editId ? findNodeById(currentTree, editId) : null;

    titleEl.textContent = existingNode
      ? (lang === 'ar' ? 'تعديل البرنامج' : 'Edit Program')
      : (lang === 'ar' ? 'إضافة برنامج جديد' : 'Add New Program');

    if (existingNode) {
      clone.querySelector('[data-field="title_ar"]').value = existingNode.title_ar || '';
      clone.querySelector('[data-field="title_en"]').value = existingNode.title_en || '';
      clone.querySelector('[data-field="desc_ar"]').value = existingNode.desc_ar || '';
      clone.querySelector('[data-field="desc_en"]').value = existingNode.desc_en || '';
      if (existingNode.banner_url) {
        clone.querySelector('.program-form-banner-preview').innerHTML = `<img src="${existingNode.banner_url}" alt="">`;
      }
    }

    document.body.appendChild(overlay);
    applyTranslations(lang); // translate the freshly injected modal labels

    overlay.querySelector('.program-form-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('.program-form-save').addEventListener('click', () => handleSaveProgram(overlay));

    overlay.querySelector('.program-form-banner-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      pendingBannerFile = file;
      const localUrl = URL.createObjectURL(file);
      overlay.querySelector('.program-form-banner-preview').innerHTML = `<img src="${localUrl}" alt="">`;
    });
  }

  async function handleSaveProgram(overlay) {
    const titleAr = overlay.querySelector('[data-field="title_ar"]').value.trim();
    const titleEn = overlay.querySelector('[data-field="title_en"]').value.trim();
    const descAr = overlay.querySelector('[data-field="desc_ar"]').value.trim();
    const descEn = overlay.querySelector('[data-field="desc_en"]').value.trim();

    if (!titleAr || !titleEn) {
      showToast(currentLang === 'ar' ? 'العنوان بالعربي والإنجليزي مطلوب' : 'Title in both languages is required', true);
      return;
    }

    const saveBtn = overlay.querySelector('.program-form-save');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner"></span>';

    let bannerUrl = null;
    if (pendingBannerFile && typeof bsUploadImage === 'function') {
      const uploadResult = await bsUploadImage(pendingBannerFile, 'program-banners');
      if (uploadResult.url) bannerUrl = uploadResult.url;
    }

    let result;
    if (editingProgramId) {
      const updates = { titleAr, titleEn, descAr, descEn };
      if (bannerUrl) updates.bannerUrl = bannerUrl;
      result = await bsUpdateProgram(editingProgramId, updates);
    } else {
      result = await bsAddProgram({
        parentId: pendingParentId,
        sectorKey: currentSectorKey,
        titleAr, titleEn, descAr, descEn,
        bannerUrl,
        sortOrder: currentTree.length
      });
    }

    if (result.error) {
      showToast(currentLang === 'ar' ? 'حصل خطأ، حاول تاني' : 'Something went wrong, try again', true);
      saveBtn.disabled = false;
      saveBtn.innerHTML = currentLang === 'ar' ? 'حفظ' : 'Save';
      return;
    }

    showToast(currentLang === 'ar' ? '✓ تم الحفظ بنجاح' : '✓ Saved successfully');
    overlay.remove();
    await loadAndRenderTree();
  }

  async function handleDeleteProgram(id) {
    const node = findNodeById(currentTree, id);
    const lang = currentLang || 'ar';
    const title = node ? (lang === 'ar' ? node.title_ar : node.title_en) : '';
    const hasChildren = node && node.children && node.children.length > 0;

    const confirmMsg = hasChildren
      ? (lang === 'ar'
          ? `"${title}" فيه برامج فرعية جواه — حذفه هيمسح كل البرامج الفرعية معاه. متأكد؟`
          : `"${title}" has sub-programs inside it — deleting it will remove all of them too. Are you sure?`)
      : (lang === 'ar' ? `متأكد إنك عايز تحذف "${title}"؟` : `Delete "${title}"?`);

    if (!confirm(confirmMsg)) return;

    const result = await bsDeleteProgram(id);
    if (result.error) {
      showToast(currentLang === 'ar' ? 'فشل الحذف' : 'Delete failed', true);
      return;
    }
    showToast(currentLang === 'ar' ? '✓ تم الحذف' : '✓ Deleted');
    await loadAndRenderTree();
  }

  /* ---- Flatten the current tree into a simple list, used to
     populate the "pick a program" dropdown in the prerequisites
     modal. Excludes the node itself (a program can't require
     itself) and labels each option with its depth for clarity. */
  function flattenTree(nodes, depth = 0, excludeId = null, acc = []) {
    nodes.forEach(node => {
      if (node.id !== excludeId) {
        acc.push({ id: node.id, depth, title_ar: node.title_ar, title_en: node.title_en });
      }
      if (node.children && node.children.length) {
        flattenTree(node.children, depth + 1, excludeId, acc);
      }
    });
    return acc;
  }

  /* ============================================
     PREREQUISITES MODAL — academy-wide flexible
     gating: "this program stays locked until ALL
     of the programs listed here reach X% each."
     ============================================ */
  async function openPrerequisitesModal(programId) {
    const lang = currentLang || 'ar';
    const node = findNodeById(currentTree, programId);
    if (!node) return;
    const title = lang === 'ar' ? node.title_ar : node.title_en;

    const allLinks = await (typeof bsGetSectorPrerequisites === 'function' ? bsGetSectorPrerequisites(currentSectorKey) : []);
    const myLinks = (allLinks || []).filter(l => l.program_id === programId);
    const flatOptions = flattenTree(currentTree, 0, programId);

    const overlay = document.createElement('div');
    overlay.className = 'program-form-overlay';
    overlay.innerHTML = `
      <div class="program-form-modal">
        <h4 class="program-form-title">🔗 ${lang === 'ar' ? 'المتطلبات السابقة لـ' : 'Prerequisites for'} "${title}"</h4>
        <p class="form-hint" style="margin-bottom:var(--space-5);">
          ${lang === 'ar'
            ? 'هذا البرنامج يفضل مقفول لحد ما كل البرامج اللي تضيفها هنا تخلص بالنسبة المطلوبة. تقدر تضيف برامج من أي فرع في هذا القسم، مش بس الأخ السابق.'
            : 'This program stays locked until every program added here reaches its required percent. You can pick programs from ANY branch in this sector, not just the previous sibling.'}
        </p>

        <div class="prereq-current-list" id="prereqCurrentList">
          ${myLinks.length ? myLinks.map(link => {
            const reqNode = flatOptions.find(o => o.id === link.requires_program_id);
            const reqTitle = reqNode ? (lang === 'ar' ? reqNode.title_ar : reqNode.title_en) : link.requires_program_id.slice(0, 8);
            return `
              <div class="prereq-row" data-link-id="${link.id}">
                <span>${reqTitle} — ${lang === 'ar' ? 'بنسبة' : 'at'} ${link.required_percent}%</span>
                <button class="btn-node-action btn-node-delete" data-action="remove-prereq" data-link-id="${link.id}">🗑️</button>
              </div>
            `;
          }).join('') : `<p class="form-hint">${lang === 'ar' ? 'لا توجد متطلبات حاليًا — هذا البرنامج مفتوح بدون شروط.' : 'No prerequisites yet — this program is open with no conditions.'}</p>`}
        </div>

        <div class="form-group" style="margin-top:var(--space-6); border-top:1px solid #EDE4D0; padding-top:var(--space-5);">
          <label class="form-label">${lang === 'ar' ? 'إضافة متطلب جديد' : 'Add a new requirement'}</label>
          <select class="form-select" id="prereqProgramSelect">
            ${flatOptions.map(o => `<option value="${o.id}">${'— '.repeat(o.depth)}${lang === 'ar' ? o.title_ar : o.title_en}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">${lang === 'ar' ? 'النسبة المطلوبة %' : 'Required percent %'}</label>
          <input type="number" class="form-input" id="prereqPercentInput" value="70" min="1" max="100">
        </div>

        <div class="form-nav">
          <button type="button" class="btn-form-back" id="prereqCloseBtn">${lang === 'ar' ? 'إغلاق' : 'Close'}</button>
          <button type="button" class="btn-form-submit" id="prereqAddBtn">➕ ${lang === 'ar' ? 'إضافة المتطلب' : 'Add Requirement'}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#prereqCloseBtn').addEventListener('click', () => overlay.remove());

    overlay.querySelectorAll('[data-action="remove-prereq"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const result = await bsRemovePrerequisite(btn.dataset.linkId);
        if (result.error) {
          showToast(lang === 'ar' ? 'فشل الحذف' : 'Removal failed', true);
          return;
        }
        showToast(lang === 'ar' ? '✓ تم حذف المتطلب' : '✓ Requirement removed');
        overlay.remove();
        openPrerequisitesModal(programId); // reopen refreshed
      });
    });

    overlay.querySelector('#prereqAddBtn').addEventListener('click', async () => {
      const requiresId = overlay.querySelector('#prereqProgramSelect').value;
      const percent = parseInt(overlay.querySelector('#prereqPercentInput').value, 10) || 70;
      const result = await bsAddPrerequisite(programId, requiresId, percent);
      if (result.error) {
        showToast(lang === 'ar' ? 'فشلت الإضافة (ممكن يكون مضاف بالفعل)' : 'Failed to add (may already exist)', true);
        return;
      }
      showToast(lang === 'ar' ? '✓ تم إضافة المتطلب' : '✓ Requirement added');
      overlay.remove();
      openPrerequisitesModal(programId); // reopen refreshed
    });
  }

  /* ============================================
     EXAMS MODAL — add 'entry' (must pass BEFORE
     opening this program) or 'completion' (sits
     inside it, passing marks it done) exams.
     ============================================ */
  async function openExamsModal(programId) {
    const lang = currentLang || 'ar';
    const node = findNodeById(currentTree, programId);
    if (!node) return;
    const title = lang === 'ar' ? node.title_ar : node.title_en;

    const exams = await (typeof bsGetProgramExams === 'function' ? bsGetProgramExams(programId) : []);

    const overlay = document.createElement('div');
    overlay.className = 'program-form-overlay';
    overlay.innerHTML = `
      <div class="program-form-modal">
        <h4 class="program-form-title">📝 ${lang === 'ar' ? 'امتحانات' : 'Exams for'} "${title}"</h4>
        <p class="form-hint" style="margin-bottom:var(--space-5);">
          ${lang === 'ar'
            ? '"امتحان دخول" يلزم الطالب يعديه قبل ما يفتح البرنامج ده أصلًا. "امتحان اجتياز" يكون جوه البرنامج، ونجاحه يحسب البرنامج مكتمل.'
            : 'An "entry" exam must be passed BEFORE opening this program at all. A "completion" exam sits inside it, and passing it marks the program done.'}
        </p>

        <div class="prereq-current-list" id="examsCurrentList">
          ${exams.length ? exams.map(exam => `
            <div class="prereq-row" data-exam-id="${exam.id}">
              <span>${exam.exam_type === 'entry' ? '🚪' : '✅'} ${lang === 'ar' ? exam.title_ar : exam.title_en} — ${lang === 'ar' ? 'نجاح' : 'pass'} ${exam.pass_percent}%</span>
              <button class="btn-node-action btn-node-delete" data-action="remove-exam" data-exam-id="${exam.id}">🗑️</button>
            </div>
          `).join('') : `<p class="form-hint">${lang === 'ar' ? 'لا توجد امتحانات على هذا البرنامج حاليًا.' : 'No exams on this program yet.'}</p>`}
        </div>

        <div class="form-group" style="margin-top:var(--space-6); border-top:1px solid #EDE4D0; padding-top:var(--space-5);">
          <label class="form-label">${lang === 'ar' ? 'نوع الامتحان' : 'Exam type'}</label>
          <select class="form-select" id="examTypeSelect">
            <option value="entry">${lang === 'ar' ? 'امتحان دخول (قبل فتح البرنامج)' : 'Entry exam (before opening)'}</option>
            <option value="completion">${lang === 'ar' ? 'امتحان اجتياز (داخل البرنامج)' : 'Completion exam (inside the program)'}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">${lang === 'ar' ? 'عنوان الامتحان (عربي)' : 'Exam Title (Arabic)'}</label>
          <input type="text" class="form-input" id="examTitleArInput">
        </div>
        <div class="form-group">
          <label class="form-label">${lang === 'ar' ? 'عنوان الامتحان (إنجليزي)' : 'Exam Title (English)'}</label>
          <input type="text" class="form-input" id="examTitleEnInput">
        </div>
        <div class="form-group">
          <label class="form-label">${lang === 'ar' ? 'نسبة النجاح المطلوبة %' : 'Required pass percent %'}</label>
          <input type="number" class="form-input" id="examPassPercentInput" value="80" min="1" max="100">
        </div>

        <div class="form-nav">
          <button type="button" class="btn-form-back" id="examCloseBtn">${lang === 'ar' ? 'إغلاق' : 'Close'}</button>
          <button type="button" class="btn-form-submit" id="examAddBtn">➕ ${lang === 'ar' ? 'إضافة الامتحان' : 'Add Exam'}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#examCloseBtn').addEventListener('click', () => overlay.remove());

    overlay.querySelectorAll('[data-action="remove-exam"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const result = await bsDeleteProgramExam(btn.dataset.examId);
        if (result.error) {
          showToast(lang === 'ar' ? 'فشل الحذف' : 'Removal failed', true);
          return;
        }
        showToast(lang === 'ar' ? '✓ تم حذف الامتحان' : '✓ Exam removed');
        overlay.remove();
        openExamsModal(programId);
      });
    });

    overlay.querySelector('#examAddBtn').addEventListener('click', async () => {
      const examType = overlay.querySelector('#examTypeSelect').value;
      const titleAr = overlay.querySelector('#examTitleArInput').value.trim();
      const titleEn = overlay.querySelector('#examTitleEnInput').value.trim();
      const passPercent = parseInt(overlay.querySelector('#examPassPercentInput').value, 10) || 80;

      if (!titleAr || !titleEn) {
        showToast(lang === 'ar' ? 'عنوان الامتحان مطلوب بالعربي والإنجليزي' : 'Exam title required in both languages', true);
        return;
      }

      const result = await bsAddProgramExam(programId, { examType, titleAr, titleEn, passPercent });
      if (result.error) {
        showToast(lang === 'ar' ? 'فشلت الإضافة' : 'Failed to add', true);
        return;
      }
      showToast(lang === 'ar' ? '✓ تم إضافة الامتحان' : '✓ Exam added');
      overlay.remove();
      openExamsModal(programId);
    });
  }

  /* ---- Event wiring ---- */
  if (sectorSelect) {
    sectorSelect.addEventListener('change', () => {
      currentSectorKey = sectorSelect.value;
      loadAndRenderTree();
    });
  }

  if (addRootBtn) {
    addRootBtn.addEventListener('click', () => openProgramForm({ parentId: null }));
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (sectorSelect) currentSectorKey = sectorSelect.value;
    loadAndRenderTree();
  });

})();
