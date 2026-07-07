/* ============================================
   B&S Academy — Admin Content Panel Logic
   Works in two modes:
   1. LOCAL PREVIEW (default): saves to localStorage
      so the academy owner can try the panel before
      Supabase is connected.
   2. LIVE (once supabase-config.js is filled in):
      saves to the site_content table and changes
      are visible to all real visitors.
   ============================================ */

(function () {
  const LOCAL_KEY = 'bs_content_overrides';

  function getLocalOverrides() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function setLocalOverride(key, data) {
    const overrides = getLocalOverrides();
    overrides[key] = { ...(overrides[key] || {}), ...data };
    localStorage.setItem(LOCAL_KEY, JSON.stringify(overrides));
  }

  // ---- Apply any saved overrides to the live site on every page load ----
  function applyContentOverrides() {
    const overrides = getLocalOverrides();
    Object.keys(overrides).forEach(key => {
      const value = overrides[key];
      const els = document.querySelectorAll(`[data-i18n="${key}"]`);
      els.forEach(el => {
        const lang = currentLang || 'ar';
        if (value[lang]) el.innerHTML = value[lang];
      });
      if (value.image_url) {
        const imgEls = document.querySelectorAll(`[data-content-image="${key}"]`);
        imgEls.forEach(img => { img.src = value.image_url; });
      }
    });
  }

  // ---- Admin tab switching ----
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.panel)?.classList.add('active');
    });
  });

  // ---- Lang tabs inside each edit card (AR/EN fields) ----
  document.querySelectorAll('.edit-lang-tabs').forEach(tabGroup => {
    const card = tabGroup.closest('.edit-card');
    tabGroup.querySelectorAll('.edit-lang-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabGroup.querySelectorAll('.edit-lang-tab').forEach(t => t.classList.remove('active'));
        card.querySelectorAll('.edit-field-group').forEach(g => g.classList.remove('active'));
        tab.classList.add('active');
        card.querySelector(`[data-lang-group="${tab.dataset.lang}"]`)?.classList.add('active');
      });
    });
  });

  // ---- Save button per edit card ----
  document.querySelectorAll('.edit-card').forEach(card => {
    const saveBtn = card.querySelector('.btn-save-field');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', async () => {
      const key = card.dataset.contentKey;
      const arField = card.querySelector('[data-lang="ar"].editable-content-field');
      const enField = card.querySelector('[data-lang="en"].editable-content-field');

      const payload = {};
      if (arField) payload.ar = arField.value;
      if (enField) payload.en = enField.value;

      // Try live Supabase save first; fall back to local preview storage
      if (typeof bsUpdateSiteContent === 'function' && typeof isSupabaseConfigured !== 'undefined' && isSupabaseConfigured) {
        const { error } = await bsUpdateSiteContent(key, payload);
        if (error) {
          setLocalOverride(key, payload);
          showToast(currentLang === 'ar' ? 'تم الحفظ محليًا (Supabase غير مفعّل بعد)' : 'Saved locally (Supabase not connected yet)');
        } else {
          showToast(currentLang === 'ar' ? '✓ تم الحفظ على الموقع الفعلي' : '✓ Saved live to the website');
        }
      } else {
        setLocalOverride(key, payload);
        showToast(currentLang === 'ar' ? 'تم الحفظ للمعاينة محليًا' : 'Saved locally for preview');
      }

      // Reflect change immediately on this admin session too
      const indicator = card.querySelector('.save-indicator');
      if (indicator) {
        indicator.classList.add('show');
        setTimeout(() => indicator.classList.remove('show'), 2000);
      }
    });
  });

  // ---- Image upload per edit card ----
  document.querySelectorAll('.image-upload-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const card = input.closest('.edit-card');
      const key = card.dataset.contentKey;
      const previewEl = card.querySelector('.image-preview');

      // Show local preview immediately
      const localUrl = URL.createObjectURL(file);
      if (previewEl) previewEl.innerHTML = `<img src="${localUrl}" alt="">`;

      if (typeof bsUploadImage === 'function' && typeof isSupabaseConfigured !== 'undefined' && isSupabaseConfigured) {
        const result = await bsUploadImage(file, 'site-content');
        if (result.url) {
          await bsUpdateSiteContent(key, { image_url: result.url });
          showToast(currentLang === 'ar' ? '✓ تم رفع الصورة على الموقع الفعلي' : '✓ Image uploaded live');
        } else {
          showToast(currentLang === 'ar' ? 'حصل خطأ في الرفع، حاول تاني' : 'Upload failed, try again', true);
        }
      } else {
        setLocalOverride(key, { image_url: localUrl });
        showToast(currentLang === 'ar' ? 'تم حفظ الصورة للمعاينة محليًا فقط' : 'Image saved locally for preview only');
      }
    });
  });

  // ---- Load requests inbox (On-Demand submissions) ----
  async function loadRequestsTable() {
    const tbody = document.getElementById('requestsTableBody');
    if (!tbody) return;

    if (typeof bsGetAllRequests !== 'function') return;
    const requests = await bsGetAllRequests();

    if (!requests.length) return; // keep the empty-state row already in HTML

    const levelLabels = {
      high_school: 'High School', university: 'University',
      masters: "Master's", graduate: 'Graduate'
    };
    const deliveryLabels = { recorded: '🎥 Recorded', live: '🔴 Live 1:1' };

    tbody.innerHTML = requests.map(r => `
      <tr>
        <td>${r.full_name}</td>
        <td>${r.subject_name}</td>
        <td>${levelLabels[r.academic_level] || r.academic_level || '—'}</td>
        <td>${deliveryLabels[r.delivery_pref] || r.delivery_pref || '—'}</td>
        <td><span class="status-badge status-${r.status}">${r.status}</span></td>
      </tr>
    `).join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyContentOverrides();
    loadRequestsTable();
  });

})();
