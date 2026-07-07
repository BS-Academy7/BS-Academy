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

const SUPABASE_URL = 'https://wwgtprdveknjclflhqaa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_uuUbSPlrYHLeGY0N7qWskA_2V9xJutv';

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
