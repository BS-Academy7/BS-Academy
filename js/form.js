/* ============================================
   B&S Academy — On-Demand Multi-step Form Logic
   ============================================ */

(function () {
  const TOTAL_STEPS = 5;
  let currentStep = 1;
  let uploadedFiles = [];

  const form = document.getElementById('onDemandForm');
  if (!form) return;

  const stepsIndicator = document.getElementById('formStepsIndicator');
  const backBtn = document.getElementById('formBackBtn');
  const nextBtn = document.getElementById('formNextBtn');
  const submitBtn = document.getElementById('formSubmitBtn');
  const successPanel = document.getElementById('formSuccess');
  const resetBtn = document.getElementById('formResetBtn');

  // ---- Build step dots ----
  const stepLabels = {
    1: { ar: 'البيانات', en: 'Info' },
    2: { ar: 'المرحلة', en: 'Level' },
    3: { ar: 'التفاصيل', en: 'Details' },
    4: { ar: 'المرفقات', en: 'Files' },
    5: { ar: 'الاستلام', en: 'Delivery' }
  };

  function renderStepDots() {
    stepsIndicator.innerHTML = '';
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      const wrap = document.createElement('div');
      wrap.className = 'step-dot-wrap';
      if (i === currentStep) wrap.classList.add('active');
      if (i < currentStep) wrap.classList.add('completed');

      const lang = currentLang || 'ar';
      wrap.innerHTML = `
        <div class="step-dot">${i < currentStep ? '✓' : i}</div>
        <div class="step-label">${stepLabels[i][lang]}</div>
      `;
      stepsIndicator.appendChild(wrap);
    }
  }

  function goToStep(step) {
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    const target = form.querySelector(`.form-step[data-step="${step}"]`);
    if (target) target.classList.add('active');

    currentStep = step;
    renderStepDots();

    backBtn.disabled = step === 1;
    nextBtn.style.display = step === TOTAL_STEPS ? 'none' : 'inline-flex';
    submitBtn.style.display = step === TOTAL_STEPS ? 'inline-flex' : 'none';
  }

  function validateStep(step) {
    const stepEl = form.querySelector(`.form-step[data-step="${step}"]`);
    let valid = true;

    stepEl.querySelectorAll('[required]').forEach(field => {
      const group = field.closest('.form-group') || field.closest('.choice-grid')?.parentElement;
      let fieldValid = true;

      if (field.type === 'radio') {
        const radioGroup = stepEl.querySelectorAll(`[name="${field.name}"]`);
        fieldValid = Array.from(radioGroup).some(r => r.checked);
      } else if (field.type === 'email') {
        fieldValid = field.value.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
      } else {
        fieldValid = field.value.trim() !== '';
      }

      if (!fieldValid) {
        valid = false;
        if (group) group.classList.add('invalid');
      } else if (group) {
        group.classList.remove('invalid');
      }
    });

    return valid;
  }

  nextBtn.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1);
  });

  backBtn.addEventListener('click', () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  });

  // ---- Conditional field: Faculty/Major shown only for University/Graduate ----
  const levelSelect = document.getElementById('academicLevelSelect');
  const facultyField = document.getElementById('facultyField');
  if (levelSelect && facultyField) {
    levelSelect.addEventListener('change', () => {
      const show = ['university', 'masters', 'graduate'].includes(levelSelect.value);
      facultyField.classList.toggle('show', show);
    });
  }

  // ---- File upload handling ----
  const fileInput = document.getElementById('fileInput');
  const fileList = document.getElementById('fileList');
  const dropZone = document.getElementById('fileDropZone');
  const MAX_FILE_MB = 10;

  function renderFileList() {
    fileList.innerHTML = '';
    uploadedFiles.forEach((file, idx) => {
      const item = document.createElement('div');
      item.className = 'file-item';
      item.innerHTML = `
        <span>📎 ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)</span>
        <span class="file-item-remove" data-idx="${idx}">✕</span>
      `;
      fileList.appendChild(item);
    });

    fileList.querySelectorAll('.file-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        uploadedFiles.splice(Number(btn.dataset.idx), 1);
        renderFileList();
      });
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      files.forEach(file => {
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
          showToast(currentLang === 'ar'
            ? `الملف ${file.name} أكبر من 10MB`
            : `${file.name} exceeds 10MB`, true);
          return;
        }
        uploadedFiles.push(file);
      });
      renderFileList();
      fileInput.value = '';
    });

    ['dragover', 'dragleave', 'drop'].forEach(evt => {
      dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropZone.classList.toggle('dragover', evt === 'dragover');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      const files = Array.from(e.dataTransfer.files || []);
      files.forEach(file => {
        if (file.size <= MAX_FILE_MB * 1024 * 1024) uploadedFiles.push(file);
      });
      renderFileList();
    });
  }

  // ---- Submit ----
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span>';

    const formData = new FormData(form);
    const payload = {
      full_name: formData.get('full_name'),
      whatsapp: formData.get('whatsapp'),
      country_code: formData.get('country_code') || 'EG',
      phone_country_code: formData.get('phone_country_code') || formData.get('country_code') || 'EG',
      phone_local: formData.get('phone_local') || null,
      preferred_language: formData.get('preferred_language') || (currentLang || 'ar'),
      preferred_currency: formData.get('preferred_currency') || 'EGP',
      email: formData.get('email'),
      academic_level: formData.get('academic_level'),
      faculty_major: formData.get('faculty_major') || null,
      subject_name: formData.get('subject_name'),
      topic_title: formData.get('topic_title'),
      description: formData.get('description'),
      delivery_pref: formData.get('delivery_pref'),
      deadline_date: formData.get('deadline_date') || null
    };

    let submissionError = null;
    let savedRequest = null;

    if (typeof bsSubmitOnDemandRequest === 'function') {
      const result = await bsSubmitOnDemandRequest(payload);
      if (result && result.error) {
        submissionError = result.error;
      } else if (result && result.data) {
        savedRequest = result.data;
      }
    } else {
      submissionError = { message: 'bsSubmitOnDemandRequest function not found — js/supabase-config.js may not have loaded.' };
    }

    if (submissionError) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = currentLang === 'ar' ? 'إرسال الطلب' : 'Submit Request';
      const msg = currentLang === 'ar'
        ? `حصل خطأ ولم يتم حفظ الطلب:\n${submissionError.message || submissionError}`
        : `An error occurred and the request was NOT saved:\n${submissionError.message || submissionError}`;
      alert(msg);
      showToast(currentLang === 'ar' ? '❌ فشل إرسال الطلب — راجع التفاصيل' : '❌ Submission failed — see details', true);
      return; 
    }

    // Now upload attachments and link them to the saved request
    let attachmentUrls = [];
    if (savedRequest && typeof bsUploadImage === 'function' && uploadedFiles.length) {
      for (const file of uploadedFiles) {
        const metadata = {
          requestType: 'ondemand',
          studentName: payload.full_name,
          studentId: payload.email || payload.whatsapp,
          whatsapp: payload.whatsapp,
          email: payload.email,
          countryCode: payload.country_code,
          preferredLanguage: payload.preferred_language,
          preferredCurrency: payload.preferred_currency,
          subjectName: payload.subject_name,
          topicTitle: payload.topic_title,
          academicLevel: payload.academic_level,
          entityType: 'ondemand_request',
          entityId: savedRequest.id,
          category: 'attachment'
        };
        const result = await bsUploadImage(file, 'ondemand-attachments', metadata);
        if (result.error) {
          // Soft error: the request is saved, but file failed.
          const msg = currentLang === 'ar'
            ? `الطلب تم حفظه ولكن حصل خطأ أثناء رفع الملف ${file.name}:\n${result.error.message || result.error}`
            : `Request saved, but error uploading ${file.name}:\n${result.error.message || result.error}`;
          alert(msg);
        } else if (result.url) {
          attachmentUrls.push(result.url);
          // Register file in academy_files index
          if (typeof bsRegisterAcademyFile === 'function') {
            await bsRegisterAcademyFile(result, metadata);
          }
        }
      }

      // Update the request with attachmentUrls array for backwards compatibility
      if (attachmentUrls.length > 0 && typeof supabaseClient !== 'undefined') {
        await supabaseClient.from('ondemand_requests').update({ attachment_urls: attachmentUrls }).eq('id', savedRequest.id);
      }
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = currentLang === 'ar' ? 'إرسال الطلب' : 'Submit Request';

    form.style.display = 'none';
    successPanel.classList.add('active');
  });

  resetBtn?.addEventListener('click', () => {
    form.reset();
    uploadedFiles = [];
    renderFileList();
    form.style.display = 'block';
    successPanel.classList.remove('active');
    goToStep(1);
  });

  renderStepDots();
})();

/* ---- Toast helper (shared) ---- */
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}
