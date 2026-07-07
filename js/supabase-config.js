/* ============================================
   B&S Academy — Supabase Configuration
   ============================================
   HOW TO ACTIVATE THIS FILE (Arabic instructions
   below the code — اقرأ التعليمات تحت الكود):

   1. Create a free project at https://supabase.com
   2. Go to Project Settings > API
   3. Copy your "Project URL" and "anon public" key
   4. Paste them below in SUPABASE_URL and SUPABASE_ANON_KEY
   5. Run the SQL in /data/supabase-schema.sql inside
      Supabase's SQL Editor (this creates all tables)
   6. Add this script tag in index.html <head>,
      BEFORE this file's <script> tag:
      <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
   ============================================ */

const SUPABASE_URL = 'https://uhknwbhduxsmitskonln.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_mgLexsT146J3yOqU1TPj-g_Mgx467tB';

const isSupabaseConfigured = SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL'
  && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';

let supabaseClient = null;

if (isSupabaseConfigured && typeof window.supabase !== 'undefined') {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/* ============================================
   AUTH HELPERS
   ============================================ */

async function bsSignUp(email, password, fullName) {
  if (!supabaseClient) return { error: { message: 'Supabase not configured yet' } };
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  });
  return { data, error };
}

async function bsSignIn(email, password) {
  if (!supabaseClient) return { error: { message: 'Supabase not configured yet' } };
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  return { data, error };
}

async function bsSignOut() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
}

async function bsGetCurrentUser() {
  if (!supabaseClient) return null;
  const { data } = await supabaseClient.auth.getUser();
  return data?.user || null;
}

async function bsGetProfile(userId) {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

/* ============================================
   STUDENT DASHBOARD DATA
   ============================================ */

async function bsGetEnrollments(studentId) {
  if (!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from('enrollments')
    .select('*, courses(title, title_ar, sector)')
    .eq('student_id', studentId);
  if (error) return [];
  return data || [];
}

/* ============================================
   SITE CONTENT (Admin-editable content)
   ============================================ */

async function bsGetSiteContent() {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from('site_content')
    .select('*');
  if (error) return null;
  // Convert array into a lookup object: { content_key: { ar, en, image_url } }
  const map = {};
  (data || []).forEach(row => {
    map[row.content_key] = {
      ar: row.value_ar,
      en: row.value_en,
      image_url: row.image_url,
      type: row.content_type
    };
  });
  return map;
}

async function bsUpdateSiteContent(key, { ar, en, image_url }) {
  if (!supabaseClient) return { error: { message: 'Supabase not configured yet' } };
  const updatePayload = {};
  if (ar !== undefined) updatePayload.value_ar = ar;
  if (en !== undefined) updatePayload.value_en = en;
  if (image_url !== undefined) updatePayload.image_url = image_url;
  updatePayload.updated_at = new Date().toISOString();

  const { data, error } = await supabaseClient
    .from('site_content')
    .update(updatePayload)
    .eq('content_key', key);
  return { data, error };
}

async function bsUploadImage(file, folder = 'site-content') {
  if (!supabaseClient) return { error: { message: 'Supabase not configured yet' } };
  const fileName = `${folder}/${Date.now()}-${file.name}`;
  const { data, error } = await supabaseClient.storage
    .from('public-assets')
    .upload(fileName, file);
  if (error) return { error };

  const { data: urlData } = supabaseClient.storage
    .from('public-assets')
    .getPublicUrl(fileName);

  return { url: urlData.publicUrl };
}

/* ============================================
   ON-DEMAND REQUESTS (mirrors Google Sheet)
   ============================================ */

async function bsSubmitOnDemandRequest(payload) {
  if (!supabaseClient) return { error: { message: 'Supabase not configured yet — request was not saved to database' } };
  const { data, error } = await supabaseClient
    .from('ondemand_requests')
    .insert([payload]);
  return { data, error };
}

async function bsGetAllRequests() {
  if (!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from('ondemand_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

/* ============================================
   PROGRAMS (recursive tree — sectors, programs,
   and sub-programs to unlimited depth)
   ============================================ */

// Fetch EVERY program row for one sector in one request,
// then build the nested tree in JS (cheaper than N queries).
async function bsGetSectorProgramTree(sectorKey) {
  if (!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from('programs')
    .select('*')
    .eq('sector_key', sectorKey)
    .order('sort_order', { ascending: true });
  if (error || !data) return [];

  // Build a lookup, then attach each row to its parent's `children` array.
  const byId = {};
  data.forEach(row => { byId[row.id] = { ...row, children: [] }; });

  const roots = [];
  data.forEach(row => {
    if (row.parent_id && byId[row.parent_id]) {
      byId[row.parent_id].children.push(byId[row.id]);
    } else if (!row.parent_id) {
      roots.push(byId[row.id]);
    }
  });
  return roots;
}

// Fetch the 5 (or more) top-level sector rows for the
// homepage overview cards — one row per sector, no children needed.
async function bsGetTopLevelSectors() {
  if (!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from('programs')
    .select('*')
    .is('parent_id', null)
    .order('sort_order', { ascending: true });
  if (error || !data) return [];
  return data;
}

// Add a new program/sub-program. Pass parentId = null for a
// brand-new top-level sector.
async function bsAddProgram({ parentId, sectorKey, titleAr, titleEn, descAr, descEn, bannerUrl, sortOrder }) {
  if (!supabaseClient) return { error: { message: 'Supabase not configured yet' } };
  const { data, error } = await supabaseClient
    .from('programs')
    .insert([{
      parent_id: parentId || null,
      sector_key: sectorKey,
      title_ar: titleAr,
      title_en: titleEn,
      desc_ar: descAr || '',
      desc_en: descEn || '',
      banner_url: bannerUrl || null,
      sort_order: sortOrder || 0
    }])
    .select();
  return { data, error };
}

// Edit any field of an existing program/sub-program.
async function bsUpdateProgram(programId, updates) {
  if (!supabaseClient) return { error: { message: 'Supabase not configured yet' } };
  const payload = { updated_at: new Date().toISOString() };
  if (updates.titleAr !== undefined) payload.title_ar = updates.titleAr;
  if (updates.titleEn !== undefined) payload.title_en = updates.titleEn;
  if (updates.descAr !== undefined) payload.desc_ar = updates.descAr;
  if (updates.descEn !== undefined) payload.desc_en = updates.descEn;
  if (updates.bannerUrl !== undefined) payload.banner_url = updates.bannerUrl;
  if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;
  if (updates.parentId !== undefined) payload.parent_id = updates.parentId;
  if (updates.childrenSequentialLock !== undefined) payload.children_sequential_lock = updates.childrenSequentialLock;

  const { data, error } = await supabaseClient
    .from('programs')
    .update(payload)
    .eq('id', programId)
    .select();
  return { data, error };
}

// Delete a program. Thanks to "on delete cascade" in the
// schema, every nested child (and grandchild, etc.) under
// it is removed automatically — no orphaned rows left behind.
async function bsDeleteProgram(programId) {
  if (!supabaseClient) return { error: { message: 'Supabase not configured yet' } };
  const { error } = await supabaseClient
    .from('programs')
    .delete()
    .eq('id', programId);
  return { error };
}

/* ============================================
   STUDENT PROGRESS & SEQUENTIAL LOCK SYSTEM
   ============================================ */

// Fetch every progress row for one student across a whole
// sector in one request (cheaper than querying per-node).
async function bsGetStudentProgressForSector(studentId, sectorKey) {
  if (!supabaseClient) return {};
  const { data, error } = await supabaseClient
    .from('student_progress')
    .select('*, programs!inner(sector_key)')
    .eq('student_id', studentId)
    .eq('programs.sector_key', sectorKey);
  if (error || !data) return {};

  // Return as a lookup: { program_id: { progress_percent, passed_bypass_exam, ... } }
  const map = {};
  data.forEach(row => { map[row.program_id] = row; });
  return map;
}

// Update (or create) a student's progress on one node.
async function bsSetStudentProgress(studentId, programId, { progressPercent, passedBypassExam, bypassExamScore }) {
  if (!supabaseClient) return { error: { message: 'Supabase not configured yet' } };
  const payload = {
    student_id: studentId,
    program_id: programId,
    updated_at: new Date().toISOString()
  };
  if (progressPercent !== undefined) payload.progress_percent = progressPercent;
  if (passedBypassExam !== undefined) payload.passed_bypass_exam = passedBypassExam;
  if (bypassExamScore !== undefined) payload.bypass_exam_score = bypassExamScore;
  if (progressPercent >= 100 || passedBypassExam) payload.completed_at = new Date().toISOString();

  const { data, error } = await supabaseClient
    .from('student_progress')
    .upsert(payload, { onConflict: 'student_id,program_id' })
    .select();
  return { data, error };
}

/* ============================================
   LOCK LOGIC (pure JS — works on a tree + a
   progress map, no extra DB calls needed)
   ============================================
   Call this once you have:
     - `tree`: the nested array from bsGetSectorProgramTree
     - `progressMap`: the lookup from bsGetStudentProgressForSector
   It returns the SAME tree with an extra `unlocked` boolean
   added to every node.

   KEY RULE — sequential locking is OPT-IN, per group:
   Whether a set of sibling nodes locks one-by-one is decided
   by their PARENT's `children_sequential_lock` flag (toggled
   per-node from the admin panel). Top-level sectors and any
   group with this flag OFF are always fully open — e.g. the
   Kids sector's "Programming/AI" and "English" tracks stay
   independent of each other. Only flip a group's switch ON
   when its children genuinely build on one another, like the
   lessons inside one specific course (e.g. Excel Essentials
   -> Pivot Tables -> Power Query).

   When a group IS sequential:
     - The first child is always unlocked.
     - Every other child unlocks once its immediately
       preceding sibling has progress_percent >= that
       sibling's completion_threshold, OR the student
       passed that sibling's bypass exam.
*/
function bsComputeUnlockedTree(tree, progressMap) {
  // Top-level nodes (the sectors themselves) are always open —
  // there's no "parent" above them to carry a lock switch.
  function walk(nodes, parentLockEnabled) {
    nodes.forEach((node, index) => {
      if (!parentLockEnabled) {
        // This group's parent has sequential locking OFF —
        // every node in it is independently open.
        node.unlocked = true;
      } else if (index === 0) {
        node.unlocked = true;
      } else {
        const prevSibling = nodes[index - 1];
        const prevProgress = progressMap[prevSibling.id];
        const threshold = prevSibling.completion_threshold ?? 70;
        node.unlocked = !!prevProgress && (
          prevProgress.progress_percent >= threshold ||
          prevProgress.passed_bypass_exam === true
        );
      }
      const myProgress = progressMap[node.id];
      node.progress_percent = myProgress ? myProgress.progress_percent : 0;
      node.passed_bypass_exam = myProgress ? myProgress.passed_bypass_exam : false;

      if (node.children && node.children.length) {
        walk(node.children, node.children_sequential_lock === true);
      }
    });
  }
  walk(tree, false); // top-level sectors are never locked against each other
  return tree;
}

/* ============================================
   MENTORSHIP CREDITS WALLET
   ============================================ */

async function bsGetMentorshipCredits(studentId) {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from('mentorship_credits')
    .select('*')
    .eq('student_id', studentId)
    .single();
  if (error) return null;
  return data;
}

/* ============================================
   CONSULTATION BOOKINGS
   ============================================ */

async function bsCreateConsultation({ studentId, sectorKey, category, requestedSlot, durationMinutes, isPaid }) {
  if (!supabaseClient) return { error: { message: 'Supabase not configured yet' } };
  const { data, error } = await supabaseClient
    .from('consultations')
    .insert([{
      student_id: studentId,
      sector_key: sectorKey || null,
      category,
      requested_slot: requestedSlot,
      duration_minutes: durationMinutes || 30,
      is_paid: isPaid || false
    }])
    .select();
  return { data, error };
}

async function bsGetStudentConsultations(studentId) {
  if (!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from('consultations')
    .select('*')
    .eq('student_id', studentId)
    .order('requested_slot', { ascending: false });
  if (error) return [];
  return data || [];
}

async function bsGetAllConsultations() {
  if (!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from('consultations')
    .select('*, profiles(full_name)')
    .order('requested_slot', { ascending: false });
  if (error) return [];
  return data || [];
}

/* ============================================
   GRADUATION PROJECT SUBMISSIONS
   ============================================ */

async function bsSubmitProject({ studentId, sectorKey, driveLink, githubLink, powerbiLink, notes }) {
  if (!supabaseClient) return { error: { message: 'Supabase not configured yet' } };
  const { data, error } = await supabaseClient
    .from('project_submissions')
    .insert([{
      student_id: studentId,
      sector_key: sectorKey,
      drive_link: driveLink || null,
      github_link: githubLink || null,
      powerbi_link: powerbiLink || null,
      notes: notes || null
    }])
    .select();
  return { data, error };
}

/* ============================================
   RESOURCE HUB (per-program downloadable files)
   ============================================ */

async function bsGetProgramResources(programId) {
  if (!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from('program_resources')
    .select('*')
    .eq('program_id', programId)
    .order('sort_order', { ascending: true });
  if (error) return [];
  return data || [];
}

/* ============================================
   FLEXIBLE PREREQUISITES SYSTEM (academy-wide)
   Lets ANY program require ANY other program(s),
   regardless of tree position — separate from the
   simple sibling-based sequential lock.
   ============================================ */

// Fetch all prerequisite links for one sector in one
// request (used alongside bsGetSectorProgramTree).
async function bsGetSectorPrerequisites(sectorKey) {
  if (!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from('program_prerequisites')
    .select('*, programs!program_prerequisites_program_id_fkey(sector_key)')
    .eq('programs.sector_key', sectorKey);
  if (error || !data) return [];
  return data;
}

// Add a prerequisite link: `programId` stays locked until
// `requiresProgramId` reaches `requiredPercent`.
async function bsAddPrerequisite(programId, requiresProgramId, requiredPercent) {
  if (!supabaseClient) return { error: { message: 'Supabase not configured yet' } };
  const { data, error } = await supabaseClient
    .from('program_prerequisites')
    .insert([{ program_id: programId, requires_program_id: requiresProgramId, required_percent: requiredPercent || 70 }])
    .select();
  return { data, error };
}

async function bsRemovePrerequisite(prerequisiteRowId) {
  if (!supabaseClient) return { error: { message: 'Supabase not configured yet' } };
  const { error } = await supabaseClient
    .from('program_prerequisites')
    .delete()
    .eq('id', prerequisiteRowId);
  return { error };
}

/* ============================================
   Extended lock computation — combines THREE rules,
   any one of which can unlock a node:
     1. It's the first child of its parent (always open)
     2. Its parent has children_sequential_lock = true
        AND the immediately preceding sibling is done
     3. It has no prerequisite rows in program_prerequisites
        OR all of its prerequisite rows are satisfied
   A node with prerequisite rows is gated by rule 3
   REGARDLESS of sibling order — this is what lets IIoT
   (anywhere in the tree) require both PLC and SCADA
   (anywhere else in the tree), not just "the program
   right before it."
   ============================================ */
function bsComputeUnlockedTreeWithPrerequisites(tree, progressMap, prerequisiteLinks) {
  // Build a quick lookup: programId -> [ {requires_program_id, required_percent}, ... ]
  const prereqByProgram = {};
  (prerequisiteLinks || []).forEach(link => {
    if (!prereqByProgram[link.program_id]) prereqByProgram[link.program_id] = [];
    prereqByProgram[link.program_id].push(link);
  });

  function isSatisfied(progressEntry, requiredPercent) {
    if (!progressEntry) return false;
    return progressEntry.progress_percent >= requiredPercent || progressEntry.passed_bypass_exam === true;
  }

  function walk(nodes, parentLockEnabled) {
    nodes.forEach((node, index) => {
      // Rule 3 first: explicit prerequisites override everything else
      const myPrereqs = prereqByProgram[node.id];
      if (myPrereqs && myPrereqs.length) {
        node.unlocked = myPrereqs.every(link =>
          isSatisfied(progressMap[link.requires_program_id], link.required_percent)
        );
      } else if (!parentLockEnabled) {
        node.unlocked = true;
      } else if (index === 0) {
        node.unlocked = true;
      } else {
        const prevSibling = nodes[index - 1];
        const prevProgress = progressMap[prevSibling.id];
        const threshold = prevSibling.completion_threshold ?? 70;
        node.unlocked = isSatisfied(prevProgress, threshold);
      }

      const myProgress = progressMap[node.id];
      node.progress_percent = myProgress ? myProgress.progress_percent : 0;
      node.passed_bypass_exam = myProgress ? myProgress.passed_bypass_exam : false;
      node.prerequisite_ids = myPrereqs ? myPrereqs.map(l => l.requires_program_id) : [];

      if (node.children && node.children.length) {
        walk(node.children, node.children_sequential_lock === true);
      }
    });
  }
  walk(tree, false);
  return tree;
}

/* ============================================
   ACADEMY-WIDE EXAM SYSTEM
   Two kinds: 'entry' (must pass BEFORE opening a
   program/sector at all) and 'completion' (sits
   inside a program; passing it marks the program done).
   ============================================ */

async function bsGetProgramExams(programId) {
  if (!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from('program_exams')
    .select('*')
    .eq('program_id', programId);
  if (error) return [];
  return data || [];
}

async function bsAddProgramExam(programId, { examType, titleAr, titleEn, passPercent }) {
  if (!supabaseClient) return { error: { message: 'Supabase not configured yet' } };
  const { data, error } = await supabaseClient
    .from('program_exams')
    .insert([{
      program_id: programId,
      exam_type: examType, // 'entry' | 'completion'
      title_ar: titleAr,
      title_en: titleEn,
      pass_percent: passPercent || 80
    }])
    .select();
  return { data, error };
}

async function bsDeleteProgramExam(examId) {
  if (!supabaseClient) return { error: { message: 'Supabase not configured yet' } };
  const { error } = await supabaseClient
    .from('program_exams')
    .delete()
    .eq('id', examId);
  return { error };
}

// Record a student's attempt and return whether they passed
// (computed live against the exam's CURRENT pass_percent).
async function bsSubmitExamAttempt(studentId, examId, scorePercent) {
  if (!supabaseClient) return { error: { message: 'Supabase not configured yet' } };
  const { data: exam } = await supabaseClient
    .from('program_exams')
    .select('pass_percent')
    .eq('id', examId)
    .single();

  const { data, error } = await supabaseClient
    .from('exam_attempts')
    .insert([{ student_id: studentId, exam_id: examId, score_percent: scorePercent }])
    .select();

  const passed = exam ? scorePercent >= exam.pass_percent : false;
  return { data, error, passed };
}

// Has this student already passed a given exam? (used to check
// 'entry' exams before letting them open a program/sector)
async function bsHasPassedExam(studentId, examId) {
  if (!supabaseClient) return false;
  const { data: exam } = await supabaseClient
    .from('program_exams')
    .select('pass_percent')
    .eq('id', examId)
    .single();
  if (!exam) return false;

  const { data: attempts } = await supabaseClient
    .from('exam_attempts')
    .select('score_percent')
    .eq('student_id', studentId)
    .eq('exam_id', examId)
    .order('score_percent', { ascending: false })
    .limit(1);

  if (!attempts || !attempts.length) return false;
  return attempts[0].score_percent >= exam.pass_percent;
}
