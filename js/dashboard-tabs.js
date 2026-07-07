/* ============================================
   B&S Academy — Dashboard Tabs + Mentorship
   Booking System
   ============================================ */

(function () {

  /* ---- Dashboard tab switching ---- */
  document.querySelectorAll('[data-dash-tab]').forEach(tabLink => {
    tabLink.addEventListener('click', (e) => {
      e.preventDefault();
      const tabKey = tabLink.dataset.dashTab;

      document.querySelectorAll('[data-dash-tab]').forEach(t => t.classList.remove('active'));
      tabLink.classList.add('active');

      document.querySelectorAll('[data-dash-panel]').forEach(p => p.classList.remove('active'));
      document.querySelector(`[data-dash-panel="${tabKey}"]`)?.classList.add('active');

      if (tabKey === 'mentorship') loadMentorshipTab();
      if (tabKey === 'requests') loadStudentRequestsTab();
    });
  });

  function getSession() {
    try { return JSON.parse(sessionStorage.getItem('bs_session') || 'null'); } catch { return null; }
  }

  /* ---- Mentorship tab: load credits + consultation history ---- */
  async function loadMentorshipTab() {
    const session = getSession();
    const freeEl = document.getElementById('freeCreditsValue');
    const paidEl = document.getElementById('paidCreditsValue');
    const listEl = document.getElementById('consultationList');

    if (!session || session.demo || !session.userId) {
      // Demo/offline mode — show sensible placeholder values
      if (freeEl) freeEl.textContent = '2';
      if (paidEl) paidEl.textContent = '0';
      return;
    }

    if (typeof bsGetMentorshipCredits === 'function') {
      const credits = await bsGetMentorshipCredits(session.userId);
      if (freeEl) freeEl.textContent = credits ? credits.free_credits_remaining : '0';
      if (paidEl) paidEl.textContent = credits ? credits.paid_credits_remaining : '0';
    }

    if (typeof bsGetStudentConsultations === 'function') {
      const consultations = await bsGetStudentConsultations(session.userId);
      if (consultations.length && listEl) {
        const lang = currentLang || 'ar';
        const categoryLabels = {
          technical: lang === 'ar' ? 'دعم تقني/أكاديمي' : 'Technical Support',
          career: lang === 'ar' ? 'توجيه مهني' : 'Career Mentorship',
          project: lang === 'ar' ? 'مناقشة مشروع' : 'Project Guidance'
        };
        const statusLabels = {
          pending: lang === 'ar' ? 'في الانتظار' : 'Pending',
          confirmed: lang === 'ar' ? 'مؤكد' : 'Confirmed',
          completed: lang === 'ar' ? 'تمت' : 'Completed',
          cancelled: lang === 'ar' ? 'ملغاة' : 'Cancelled'
        };
        listEl.innerHTML = consultations.map(c => `
          <div class="consultation-item">
            <div>
              <strong>${categoryLabels[c.category] || c.category}</strong>
              <span class="consultation-item-date">${c.requested_slot ? new Date(c.requested_slot).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US') : '—'}</span>
            </div>
            <span class="status-badge status-${c.status}">${statusLabels[c.status] || c.status}</span>
          </div>
        `).join('');
      }
    }
  }

  /* ---- On-Demand requests history tab (filtered to this student's email) ---- */
  async function loadStudentRequestsTab() {
    const session = getSession();
    const tbody = document.getElementById('studentRequestsTableBody');
    if (!tbody || !session || !session.email || typeof bsGetAllRequests !== 'function') return;

    const allRequests = await bsGetAllRequests();
    const mine = allRequests.filter(r => r.email === session.email);
    if (!mine.length) return; // keep the empty-state row

    const lang = currentLang || 'ar';
    const deliveryLabels = { recorded: lang === 'ar' ? '🎥 مسجّل' : '🎥 Recorded', live: lang === 'ar' ? '🔴 لايف' : '🔴 Live' };

    tbody.innerHTML = mine.map(r => `
      <tr>
        <td>${r.subject_name || '—'}</td>
        <td>${deliveryLabels[r.delivery_pref] || r.delivery_pref || '—'}</td>
        <td><span class="status-badge status-${r.status}">${r.status}</span></td>
      </tr>
    `).join('');
  }

  /* ---- Booking modal ---- */
  const bookBtn = document.getElementById('bookConsultationBtn');
  const bookingTemplate = document.getElementById('consultationBookingTemplate');

  if (bookBtn && bookingTemplate) {
    bookBtn.addEventListener('click', () => {
      const clone = bookingTemplate.content.cloneNode(true);
      const overlay = clone.querySelector('.program-form-overlay');
      document.body.appendChild(overlay);
      applyTranslations(currentLang || 'ar');

      overlay.querySelector('#consultationCancelBtn').addEventListener('click', () => overlay.remove());

      overlay.querySelector('#consultationSubmitBtn').addEventListener('click', async () => {
        const session = getSession();
        const category = overlay.querySelector('#consultationCategorySelect').value;
        const slot = overlay.querySelector('#consultationSlotInput').value;

        if (!slot) {
          showToast(currentLang === 'ar' ? 'اختار موعد أولاً' : 'Pick a time slot first', true);
          return;
        }

        if (!session || session.demo || !session.userId) {
          showToast(currentLang === 'ar' ? 'وضع المعاينة: لازم تسجل دخول حقيقي لحجز استشارة' : 'Preview mode: a real login is needed to book', true);
          overlay.remove();
          return;
        }

        const result = await bsCreateConsultation({
          studentId: session.userId,
          category,
          requestedSlot: new Date(slot).toISOString(),
          durationMinutes: 30
        });

        if (result.error) {
          showToast(currentLang === 'ar' ? 'حصل خطأ، حاول تاني' : 'Something went wrong', true);
          return;
        }

        showToast(currentLang === 'ar' ? '✓ تم إرسال طلب الحجز' : '✓ Booking request sent');
        overlay.remove();
        loadMentorshipTab();
      });
    });
  }

  /* ---- Smart Trigger placeholder ----
     Per the spec: if a student fails a quiz/bypass exam two
     times in a row, show a popup suggesting a free consultation.
     This function is ready to call once a real quiz system exists —
     wire `recordQuizAttempt(passed)` into that future quiz logic. */
  let consecutiveFailures = 0;
  window.bsRecordQuizAttempt = function (passed) {
    consecutiveFailures = passed ? 0 : consecutiveFailures + 1;
    if (consecutiveFailures >= 2) {
      const lang = currentLang || 'ar';
      if (confirm(lang === 'ar'
        ? 'هل تواجه صعوبة؟ احجز استشارة مجانية مع خبرائنا الآن'
        : 'Having trouble? Book a free consultation with our experts now')) {
        document.querySelector('[data-dash-tab="mentorship"]')?.click();
      }
      consecutiveFailures = 0;
    }
  };

})();
