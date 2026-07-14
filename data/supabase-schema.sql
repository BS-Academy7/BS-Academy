-- ============================================
-- B&S Academy — Supabase Database Schema
-- ============================================
-- Run this in: Supabase Dashboard > SQL Editor
-- This sets up everything needed for:
--   1. Student auth + dashboard
--   2. Editable site content (admin panel)
--   3. On-Demand request logging (mirrors Google Sheet)
-- ============================================

create extension if not exists pgcrypto;

-- ---------------------------------------------
-- 1. STUDENT PROFILES
-- Extends Supabase's built-in auth.users table
-- ---------------------------------------------
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  whatsapp text,
  academic_level text, -- High School / University / Master's / Graduate
  faculty_major text,
  role text default 'student', -- 'student' or 'admin'
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'New Student'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ---------------------------------------------
-- 2. COURSES (catalog — admin-managed)
-- ---------------------------------------------
create table public.courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  title_ar text,
  sector text, -- engineering / accounting / academic / highschool / kids
  description text,
  created_at timestamp with time zone default now()
);

alter table public.courses enable row level security;

create policy "Anyone can view courses"
  on public.courses for select
  using (true);

create policy "Only admins can manage courses"
  on public.courses for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ---------------------------------------------
-- 3. ENROLLMENTS + PROGRESS (drives the Dashboard)
-- ---------------------------------------------
create table public.enrollments (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  progress_percent int default 0 check (progress_percent between 0 and 100),
  enrolled_at timestamp with time zone default now(),
  unique(student_id, course_id)
);

alter table public.enrollments enable row level security;

create policy "Students can view their own enrollments"
  on public.enrollments for select
  using (auth.uid() = student_id);

create policy "Admins can view all enrollments"
  on public.enrollments for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can manage enrollments"
  on public.enrollments for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ---------------------------------------------
-- 4. SITE CONTENT (powers the editable front-end)
-- Each row = one editable block, referenced by a
-- unique "key" the front-end JS looks up.
-- e.g. key = 'hero_title', 'hero_subtitle', 'about_text_ar'...
-- ---------------------------------------------
create table public.site_content (
  id uuid default gen_random_uuid() primary key,
  content_key text unique not null,
  content_type text default 'text', -- 'text' | 'image' | 'html'
  value_ar text,
  value_en text,
  image_url text,
  updated_at timestamp with time zone default now()
);

alter table public.site_content enable row level security;

create policy "Anyone can view site content"
  on public.site_content for select
  using (true);

create policy "Only admins can edit site content"
  on public.site_content for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can insert site content"
  on public.site_content for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ---------------------------------------------
-- 5. ON-DEMAND REQUESTS (optional mirror/backup
-- of the Google Sheet — useful if you later want
-- requests visible inside the admin panel too)
-- ---------------------------------------------
create table public.ondemand_requests (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  whatsapp text not null,
  email text not null,
  academic_level text,
  faculty_major text,
  subject_name text,
  topic_title text,
  description text,
  delivery_pref text, -- 'recorded' or 'live'
  deadline_date date,
  attachment_urls text[], -- Supabase Storage public URLs
  status text default 'new', -- new / in_progress / done
  created_at timestamp with time zone default now()
);

alter table public.ondemand_requests enable row level security;

create policy "Anyone can submit a request"
  on public.ondemand_requests for insert
  with check (true);

create policy "Only admins can view requests"
  on public.ondemand_requests for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ---------------------------------------------
-- 6. SEED: default editable content blocks
-- (Admin panel will show these out of the box)
-- ---------------------------------------------
insert into public.site_content (content_key, content_type, value_ar, value_en) values
  ('hero_title', 'text', 'B&S Academy - شريكك للتعلم، النمو، والحلول الذكية', 'B&S Academy - Your Partner for Learning, Growth, and Smart Solutions'),
  ('hero_subtitle', 'text', 'من التأسيس التقني للأطفال إلى الاحتراف الهندسي والمالي', 'From foundational tech for kids to engineering and financial mastery'),
  ('about_text', 'text', 'نحن في B&S Academy لا نقدم مجرد دورات تدريبية...', 'At B&S Academy, we offer more than just training courses...');

insert into public.site_content (content_key, content_type, image_url) values
  ('hero_image', 'image', null),
  ('about_image', 'image', null);


-- ---------------------------------------------
-- 7. PROGRAMS (recursive tree — powers every
-- sector's pathway/program/sub-program structure)
-- ============================================
-- WHY THIS TABLE EXISTS:
-- Every sector (Engineering, Accounting, Kids, the
-- complex Industrial Automation pathway, and any
-- future sector) is built from the SAME table.
--
-- Each row is one "node": a top-level sector, a
-- program inside it, or a sub-program inside that
-- program — to any depth. This is done via
-- `parent_id`: a row with parent_id = null is a
-- top-level sector; a row whose parent_id points to
-- another row is that row's child.
--
-- EXAMPLE — recreating the Industrial Automation
-- pathway from the spec document:
--   "Industrial Automation"      parent_id = null   (the sector)
--     "Classic Control"          parent_id = <automation's id>
--     "AVEVA & PI System"        parent_id = <automation's id>
--       "AVEVA System Platform"  parent_id = <AVEVA & PI's id>
--         "Application Server"   parent_id = <System Platform's id>
--         "OMI"                  parent_id = <System Platform's id>
--
-- This gives UNLIMITED nesting depth — no schema
-- change is ever needed to add another level.
--
-- HOW THE ADMIN PANEL USES THIS:
-- Add a program  -> insert a row with the right parent_id
-- Edit a program -> update that row
-- Delete a program (and everything under it) -> delete
--   that row; "on delete cascade" automatically removes
--   all its descendants too.
-- Reorder programs -> change `sort_order`
-- ---------------------------------------------
create table public.programs (
  id uuid default gen_random_uuid() primary key,
  parent_id uuid references public.programs(id) on delete cascade,
  sector_key text not null, -- 'engineering' | 'accounting' | 'academic' | 'highschool' | 'kids' | future sectors...
  node_type text default 'program', -- 'sector' | 'stage' | 'program' | 'lesson'
  title_ar text not null,
  title_en text not null,
  desc_ar text,
  desc_en text,
  banner_url text,
  sort_order int default 0,
  completion_threshold int default 70, -- % progress needed before the NEXT sibling unlocks
  has_bypass_exam boolean default false, -- shows the "Placement/Bypass Exam" button
  bypass_pass_score int default 80, -- % needed on the bypass exam to skip ahead
  children_sequential_lock boolean default false, -- KEY SWITCH: do THIS node's children unlock one-by-one (true), or are they all independently open (false)? Toggled per-node from the admin panel — off by default so new groups are open until you decide otherwise.
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index idx_programs_parent on public.programs(parent_id);
create index idx_programs_sector on public.programs(sector_key);

alter table public.programs enable row level security;

create policy "Anyone can view programs"
  on public.programs for select
  using (true);

create policy "Only admins can manage programs"
  on public.programs for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ---------------------------------------------
-- 8. SEED: recreate every sector's current content
-- as rows in the new `programs` table — including
-- the full nested Industrial Automation pathway.
-- ---------------------------------------------

-- Top-level sectors (parent_id = null)
insert into public.programs (id, parent_id, sector_key, title_ar, title_en, desc_ar, desc_en, sort_order) values
  ('00000000-0000-0000-0000-000000000001', null, 'engineering', 'العلوم الهندسية', 'Engineering Sciences', 'الأساس النظري والرياضي الصلب اللي يبني عقلية المهندس.', 'The solid theoretical and mathematical foundation that builds an engineer''s mindset.', 1),
  ('00000000-0000-0000-0000-000000000002', null, 'accounting', 'المحاسبة الذكية والتكنولوجيا المالية', 'Smart Accounting & FinTech', 'نعيد صياغة مفهوم المحاسبة لنصنع "المحلل المالي الذكي".', 'Reshaping accounting to build the "Smart Financial Analyst."', 2),
  ('00000000-0000-0000-0000-000000000003', null, 'academic', 'البحث العلمي ودعم المشاريع', 'Academic Excellence & Project Support', 'إشراف هندسي متكامل يرافقك من ولادة الفكرة وحتى المناقشة.', 'Comprehensive engineering supervision from idea to defense.', 3),
  ('00000000-0000-0000-0000-000000000004', null, 'highschool', 'المرحلة الثانوية', 'High School', 'شرح تفاعلي يبني عقلية علمية صحيحة.', 'Interactive explanations building a strong scientific mindset.', 4),
  ('00000000-0000-0000-0000-000000000005', null, 'kids', 'مدرسة التكنولوجيا لصغار السن', 'Kids & Teens Tech School', 'تحويل طفلك من مستهلك للتكنولوجيا إلى مبدع ومطور.', 'Transforming your child into a creator, not just a consumer.', 5),
  ('00000000-0000-0000-0000-000000000006', null, 'automation', 'مسار الأتمتة الصناعية وأنظمة التحكم', 'Industrial Automation & Control Systems', 'من التحكم الكلاسيكي إلى الثورة الصناعية الرابعة — رحلة كاملة لقيادة أضخم العمليات الصناعية بثقة.', 'From classic control to Industry 4.0 — a complete journey to confidently lead massive industrial operations.', 6);

-- Banner images for the top-level sectors (added via UPDATE since the
-- bulk INSERT above doesn't include banner_url — keeps the insert
-- statement simple and lets banners be added independently, exactly
-- like the admin panel would do it later for any new sector).
update public.programs set banner_url = 'images/banner-accounting-main.webp' where id = '00000000-0000-0000-0000-000000000002';
update public.programs set banner_url = 'images/banner-kids-main.webp' where id = '00000000-0000-0000-0000-000000000005';

-- Engineering Sciences sector — theoretical courses only
-- (Industrial Automation now lives in its own sector, see below)
insert into public.programs (parent_id, sector_key, title_ar, title_en, sort_order) values
  ('00000000-0000-0000-0000-000000000001', 'engineering', 'أنظمة القوى الكهربية', 'Power Systems', 1),
  ('00000000-0000-0000-0000-000000000001', 'engineering', 'الإلكترونيات الصناعية', 'Power Electronics', 2),
  ('00000000-0000-0000-0000-000000000001', 'engineering', 'الدوائر الكهربية', 'Circuits', 3),
  ('00000000-0000-0000-0000-000000000001', 'engineering', 'الرياضيات الهندسية', 'Engineering Mathematics', 4),
  ('00000000-0000-0000-0000-000000000001', 'engineering', 'نمذجة MATLAB', 'MATLAB Modeling', 5);

-- ---------------------------------------------
-- Industrial Automation & Control Systems sector
-- (fully independent sector — uses the flexible
-- prerequisites system for IIoT, see below)
-- ---------------------------------------------
insert into public.programs (id, parent_id, sector_key, title_ar, title_en, desc_ar, desc_en, sort_order) values
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'automation', 'التحكم الكلاسيكي ومحركات الدفع', 'Classic Control & Motor Drives', 'المخططات الكهربائية، تصميم اللوحات، الكونتاكتورات، وطرق بدء المحركات', 'Electrical diagrams, panel design, contactors, and motor starting methods', 1),
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'automation', 'أجهزة القياس والتحكم الصناعي', 'Industrial Instrumentation', 'معايرة حساسات الضغط والحرارة والتدفق، والتعامل مع الإشارات التناظرية والرقمية', 'Calibrating pressure, temperature, and flow sensors; analog/digital signal handling', 2),
  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', 'automation', 'برمجة الـ PLC المتقدم', 'Advanced PLC Programming', 'لغة السلم (Ladder Logic)، بيئة TIA Portal، العمليات التتابعية', 'Ladder Logic, TIA Portal environment, sequential operations', 3),
  ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', 'automation', 'تصميم واجهات المستخدم HMI', 'HMI Design', 'تصميم الشاشات التفاعلية وربطها بالـ PLC', 'Designing interactive screens and linking them to PLCs', 4),
  ('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006', 'automation', 'احتراف أنظمة SCADA', 'Complete SCADA Mastery', 'ربط خطوط الإنتاج، إدارة الإنذارات، والأرشفة الأولية', 'Connecting production lines, alarm management, and initial archiving', 5),
  ('a0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', 'automation', 'التحكم المؤسسي وإدارة البيانات', 'AVEVA & PI System Mastery', null, null, 6),
  ('a0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000006', 'automation', 'إنترنت الأشياء الصناعي والثورة الصناعية الرابعة', 'IIoT & Industry 4.0', 'ربط أرض المصنع بالأنظمة السحابية وتحليل البيانات الذكية', 'Connecting the factory floor to cloud systems and smart data analysis', 7);

-- AVEVA & PI System Mastery's children (program 6 branches into 4)
insert into public.programs (id, parent_id, sector_key, title_ar, title_en, sort_order) values
  ('a0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000006', 'automation', 'تصميم واجهات المراقبة التقليدية', 'AVEVA InTouch HMI', 1),
  ('a0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000006', 'automation', 'منصة النظام', 'AVEVA System Platform', 2),
  ('a0000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-000000000006', 'automation', 'الأرشفة المحلية للعمليات', 'AVEVA Historian', 3),
  ('a0000000-0000-0000-0000-00000000000b', 'a0000000-0000-0000-0000-000000000006', 'automation', 'إدارة البيانات المؤسسية وتحليلها', 'AVEVA PI System', 4);

-- AVEVA System Platform's own two children (3 levels deep)
insert into public.programs (parent_id, sector_key, title_ar, title_en, sort_order) values
  ('a0000000-0000-0000-0000-000000000009', 'automation', 'خادم التطبيقات', 'Application Server', 1),
  ('a0000000-0000-0000-0000-000000000009', 'automation', 'واجهات التشغيل الرقمية (OMI)', 'OMI - Operations Management Interface', 2);

-- IIoT & Industry 4.0's children (program 7 branches into 3)
insert into public.programs (parent_id, sector_key, title_ar, title_en, desc_ar, desc_en, sort_order) values
  ('a0000000-0000-0000-0000-000000000007', 'automation', 'الشبكات الصناعية وحوسبة الحافة', 'Industrial Networking & Edge Computing', 'بروتوكولات OPC UA, MQTT، بوابات الحافة، وبرمجة Node-RED', 'OPC UA, MQTT protocols, Edge Gateways, and Node-RED programming', 1),
  ('a0000000-0000-0000-0000-000000000007', 'automation', 'المنصات السحابية ولوحات القياس', 'Cloud IoT & Dashboards', 'ربط بيانات المصنع بـ AWS IoT أو Azure، ولوحات مراقبة باستخدام Grafana', 'Connecting factory data to AWS IoT or Azure, and Grafana dashboards', 2),
  ('a0000000-0000-0000-0000-000000000007', 'automation', 'التصنيع الذكي والتوأم الرقمي', 'Smart Manufacturing & Digital Twin', 'الذكاء الاصطناعي على البيانات الصناعية، الصيانة التنبؤية، ومفاهيم التوأم الرقمي', 'AI on industrial data, predictive maintenance, and Digital Twin concepts', 3);


-- ---------------------------------------------
-- Smart Accounting sector — FULL curriculum structure
-- (per the detailed PRD: Stage 0 -> Stage 1 -> Stage 2 ->
-- Stage 3 -> Graduation Project). The 5 stages themselves
-- are sequential (each stage builds on the last), so the
-- accounting sector's `children_sequential_lock` is set to
-- true. The individual courses INSIDE each stage are left
-- unlocked by default (children_sequential_lock = false on
-- each stage) — the academy owner can flip any stage's lock
-- on later from the admin panel if a particular stage's
-- courses truly need to be taken in order.
-- ---------------------------------------------

-- Turn on sequential locking between the 5 stages themselves
update public.programs
set children_sequential_lock = true
where id = '00000000-0000-0000-0000-000000000002';

-- The 5 stages (children of the Accounting sector)
insert into public.programs (id, parent_id, sector_key, node_type, title_ar, title_en, sort_order) values
  ('ac000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002', 'accounting', 'stage', 'المرحلة الصفرية: الأساس المالي', 'Stage 0: The Foundation', 1),
  ('ac000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'accounting', 'stage', 'المرحلة الأولى: احتراف الإكسيل و Power BI', 'Stage 1: Excel & Power BI Mastery', 2),
  ('ac000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'accounting', 'stage', 'المرحلة الثانية: إدارة قواعد البيانات السحابية', 'Stage 2: Cloud & Databases', 3),
  ('ac000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'accounting', 'stage', 'المرحلة الثالثة: احتراف الذكاء الاصطناعي والأتمتة المالية', 'Stage 3: AI & Financial Automation', 4),
  ('ac000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'accounting', 'stage', 'المرحلة النهائية: مشروع التخرج', 'Final Stage: Graduation Project', 5);

-- Banner images for the 5 accounting stages
update public.programs set banner_url = 'images/banner-accounting-stage0.webp' where id = 'ac000000-0000-0000-0000-000000000000';
update public.programs set banner_url = 'images/banner-accounting-stage1.webp' where id = 'ac000000-0000-0000-0000-000000000001';
update public.programs set banner_url = 'images/banner-accounting-stage2.webp' where id = 'ac000000-0000-0000-0000-000000000002';
update public.programs set banner_url = 'images/banner-accounting-stage3.webp' where id = 'ac000000-0000-0000-0000-000000000003';
update public.programs set banner_url = 'images/banner-accounting-final.webp' where id = 'ac000000-0000-0000-0000-000000000004';

-- Stage 0 courses: The Foundation
insert into public.programs (parent_id, sector_key, node_type, title_ar, title_en, sort_order) values
  ('ac000000-0000-0000-0000-000000000000', 'accounting', 'program', 'المحاسبة العملية', 'Practical Accounting', 1),
  ('ac000000-0000-0000-0000-000000000000', 'accounting', 'program', 'الإحصاء للماليين', 'Statistics for Finance', 2);

-- Stage 1 courses: Excel & Power BI Mastery
insert into public.programs (parent_id, sector_key, node_type, title_ar, title_en, sort_order) values
  ('ac000000-0000-0000-0000-000000000001', 'accounting', 'program', 'Excel Essential Training', 'Excel Essential Training', 1),
  ('ac000000-0000-0000-0000-000000000001', 'accounting', 'program', 'احتراف الصيغ والدوال في الإكسيل', 'Mastering Excel Formulas and Functions', 2),
  ('ac000000-0000-0000-0000-000000000001', 'accounting', 'program', 'تحليل البيانات باستخدام Pivot Tables', 'Data Analysis using Pivot Tables', 3),
  ('ac000000-0000-0000-0000-000000000001', 'accounting', 'program', 'Power Query in Excel', 'Power Query in Excel', 4),
  ('ac000000-0000-0000-0000-000000000001', 'accounting', 'program', 'What If Analysis in Excel', 'What If Analysis in Excel', 5),
  ('ac000000-0000-0000-0000-000000000001', 'accounting', 'program', 'Excel Dashboard Bootcamp', 'Excel Dashboard Bootcamp: Build Interactive Reports', 6),
  ('ac000000-0000-0000-0000-000000000001', 'accounting', 'program', 'Power Pivot Masterclass', 'Power Pivot Masterclass', 7),
  ('ac000000-0000-0000-0000-000000000001', 'accounting', 'program', 'نصائح وحيل سريعة في الإكسيل', 'Short Tips & Tricks (Excel)', 8),
  ('ac000000-0000-0000-0000-000000000001', 'accounting', 'program', 'Power BI Masterclass', 'Power BI Masterclass', 9);

-- Stage 2 courses: Cloud & Databases
insert into public.programs (parent_id, sector_key, node_type, title_ar, title_en, sort_order) values
  ('ac000000-0000-0000-0000-000000000002', 'accounting', 'program', 'استخدام Google Sheets للتعاون المالي السحابي', 'Google Sheets for Cloud Financial Collaboration', 1),
  ('ac000000-0000-0000-0000-000000000002', 'accounting', 'program', 'قواعد البيانات وأنظمة ERP باستخدام SQL', 'Databases & ERP Systems using SQL', 2),
  ('ac000000-0000-0000-0000-000000000002', 'accounting', 'program', 'استخدام Tableau لعرض البيانات المتقدم', 'Tableau for Advanced Data Visualization', 3);

-- Stage 3 courses: AI & Financial Automation
insert into public.programs (parent_id, sector_key, node_type, title_ar, title_en, sort_order) values
  ('ac000000-0000-0000-0000-000000000003', 'accounting', 'program', 'ChatGPT & AI for Microsoft Excel', 'ChatGPT & AI for Microsoft Excel', 1),
  ('ac000000-0000-0000-0000-000000000003', 'accounting', 'program', 'احتراف Microsoft Copilot في الإكسيل', 'AI-Driven Excel: Mastering Microsoft Copilot', 2),
  ('ac000000-0000-0000-0000-000000000003', 'accounting', 'program', 'الصيغ والدوال باستخدام Copilot', 'Formulas and Functions using Copilot', 3),
  ('ac000000-0000-0000-0000-000000000003', 'accounting', 'program', 'Python for Beginners', 'Python for Beginners', 4),
  ('ac000000-0000-0000-0000-000000000003', 'accounting', 'program', 'تحليل البيانات المالية الضخمة بالبايثون', 'Data Analysis using Python', 5),
  ('ac000000-0000-0000-0000-000000000003', 'accounting', 'program', 'Power Apps & Power Automate Bootcamp', 'Power Apps & Power Automate Bootcamp', 6),
  ('ac000000-0000-0000-0000-000000000003', 'accounting', 'program', 'بناء وكلاء وأتمتة بالذكاء الاصطناعي عبر N8N', 'AI Agents & Automations using N8N', 7),
  ('ac000000-0000-0000-0000-000000000003', 'accounting', 'program', 'احتراف الذكاء الاصطناعي التوليدي', 'Generative AI Mastery', 8),
  ('ac000000-0000-0000-0000-000000000003', 'accounting', 'program', 'Prompt Engineering & Vibe Coding', 'Prompt Engineering & Vibe Coding', 9);

-- Final stage: Graduation Project
insert into public.programs (parent_id, sector_key, node_type, title_ar, title_en, desc_ar, desc_en, sort_order) values
  ('ac000000-0000-0000-0000-000000000004', 'accounting', 'program', 'محاكاة شركة حقيقية', 'Real Company Simulation', 'تنظيف بيانات، استعلامات SQL، لوحات تحكم Power BI، وأتمتة التقارير', 'Data cleaning, SQL queries, Power BI dashboards, and report automation', 1);


-- Academic support sector's existing simple tracks
insert into public.programs (parent_id, sector_key, title_ar, title_en, desc_ar, desc_en, sort_order) values
  ('00000000-0000-0000-0000-000000000003', 'academic', 'باحثي الماجستير', 'Master''s Researchers', 'إشراف كامل من البداية للنهاية، تنسيق الرسالة، تجهيز للفهم العميق وجاهزية المناقشة', 'End-to-end supervision, formatting, deep understanding prep, defense readiness', 1),
  ('00000000-0000-0000-0000-000000000003', 'academic', 'مشاريع البكالوريوس', 'Bachelor''s Students', 'اختيار الفكرة، التنفيذ الهندسي الدقيق، توثيق المشروع، التحضير للعرض التقديمي', 'Idea selection, accurate engineering execution, documentation, presentation prep', 2);

-- High school sector's existing simple tracks
insert into public.programs (parent_id, sector_key, title_ar, title_en, desc_ar, desc_en, sort_order) values
  ('00000000-0000-0000-0000-000000000004', 'highschool', 'الفيزياء', 'Physics', '', '', 1),
  ('00000000-0000-0000-0000-000000000004', 'highschool', 'الرياضيات', 'Mathematics', '', '', 2);

-- Kids sector's existing tracks (with banners already supplied)
insert into public.programs (parent_id, sector_key, title_ar, title_en, desc_ar, desc_en, banner_url, sort_order) values
  ('00000000-0000-0000-0000-000000000005', 'kids', 'البرمجة التفاعلية والذكاء الاصطناعي', 'Interactive Programming & AI', 'من أول لعبة يبنيها الطفل بـ Scratch لحد أول خطوة في عالم الذكاء الاصطناعي', 'From a child''s first Scratch game to first steps into AI', 'images/banner-kids-programming-ai.webp', 1),
  ('00000000-0000-0000-0000-000000000005', 'kids', 'الإنجليزية التفاعلية', 'Interactive English', 'Phonics، القصص التفاعلية، والمحادثة بطريقة مرحة ومشجعة', 'Phonics, interactive storytelling, and fun conversation practice', 'images/banner-kids-english.webp', 2);

-- ---------------------------------------------
-- EXAMPLE ONLY (commented out) — this shows how
-- the Industrial Automation pathway from the spec
-- document WOULD be added later, demonstrating the
-- unlimited nesting depth. Uncomment and run when
-- ready to build that sector for real.
-- ---------------------------------------------
-- insert into public.programs (id, parent_id, sector_key, title_ar, title_en, sort_order) values
--   ('a0000000-0000-0000-0000-000000000001', null, 'automation', 'مسار الأتمتة الصناعية وأنظمة التحكم', 'Industrial Automation & Control Systems', 1);
--
-- insert into public.programs (parent_id, sector_key, title_ar, title_en, sort_order) values
--   ('a0000000-0000-0000-0000-000000000001', 'automation', 'التحكم الكلاسيكي ومحركات الدفع', 'Classic Control & Motor Drives', 1),
--   ('a0000000-0000-0000-0000-000000000001', 'automation', 'أجهزة القياس والتحكم الصناعي', 'Industrial Instrumentation', 2),
--   ('a0000000-0000-0000-0000-000000000001', 'automation', 'برمجة الـ PLC المتقدم', 'Advanced PLC Programming', 3),
--   ('a0000000-0000-0000-0000-000000000001', 'automation', 'تصميم واجهات المستخدم HMI', 'HMI Design', 4),
--   ('a0000000-0000-0000-0000-000000000001', 'automation', 'احتراف أنظمة SCADA', 'Complete SCADA Mastery', 5);
--
-- -- The deeply-nested AVEVA & PI System branch:
-- insert into public.programs (id, parent_id, sector_key, title_ar, title_en, sort_order) values
--   ('a0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'automation', 'التحكم المؤسسي وإدارة البيانات', 'AVEVA & PI System Mastery', 6);
--
-- insert into public.programs (id, parent_id, sector_key, title_ar, title_en, sort_order) values
--   ('a0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000006', 'automation', 'واجهات المراقبة التقليدية', 'AVEVA InTouch HMI', 1),
--   ('a0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000006', 'automation', 'منصة النظام', 'AVEVA System Platform', 2),
--   ('a0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000006', 'automation', 'الأرشفة المحلية للعمليات', 'AVEVA Historian', 3),
--   ('a0000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-000000000006', 'automation', 'إدارة البيانات المؤسسية', 'AVEVA PI System', 4);
--
-- -- System Platform's own two children (3 levels deep):
-- insert into public.programs (parent_id, sector_key, title_ar, title_en, sort_order) values
--   ('a0000000-0000-0000-0000-000000000008', 'automation', 'خادم التطبيقات', 'Application Server', 1),
--   ('a0000000-0000-0000-0000-000000000008', 'automation', 'واجهات التشغيل الرقمية (OMI)', 'OMI - Operations Management Interface', 2);


-- ============================================
-- 9. STUDENT PROGRESS (drives the Sequential
-- Progress Lock system across EVERY sector)
-- ============================================
-- WHY THIS TABLE EXISTS:
-- One row per (student, program-node) pair. This
-- is what the front-end checks before deciding
-- whether to show a node as 🔓 open or 🔒 locked.
--
-- LOCK LOGIC (implemented in JS, this table just
-- stores the facts):
--   A node unlocks for a student when EITHER:
--   (a) the immediately preceding sibling node
--       (same parent_id, lower sort_order) has a
--       progress row with percent >= that sibling's
--       completion_threshold, OR
--   (b) the student passed THIS node's bypass exam
--       (passed_bypass_exam = true), which also
--       auto-unlocks the next sibling.
--   The very first child of any parent is always
--   unlocked (nothing to wait for).
-- ============================================
create table public.student_progress (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  program_id uuid references public.programs(id) on delete cascade,
  progress_percent int default 0 check (progress_percent between 0 and 100),
  passed_bypass_exam boolean default false,
  bypass_exam_score int,
  completed_at timestamp with time zone,
  updated_at timestamp with time zone default now(),
  unique(student_id, program_id)
);

create index idx_progress_student on public.student_progress(student_id);
create index idx_progress_program on public.student_progress(program_id);

alter table public.student_progress enable row level security;

create policy "Students view their own progress"
  on public.student_progress for select
  using (auth.uid() = student_id);

create policy "Students update their own progress"
  on public.student_progress for all
  using (auth.uid() = student_id);

create policy "Admins view all progress"
  on public.student_progress for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ============================================
-- 10. CERTIFICATES (Micro + Macro credentials)
-- ============================================
create table public.certificates (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  program_id uuid references public.programs(id) on delete cascade, -- the stage/sector this certifies
  certificate_type text default 'micro', -- 'micro' (one stage) | 'macro' (whole sector, needs graduation project approval)
  issued_at timestamp with time zone default now(),
  pdf_url text -- generated certificate file, once a PDF generator is wired up
);

alter table public.certificates enable row level security;

create policy "Students view their own certificates"
  on public.certificates for select
  using (auth.uid() = student_id);

create policy "Admins manage all certificates"
  on public.certificates for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ============================================
-- 11. GRADUATION PROJECT SUBMISSIONS
-- ============================================
create table public.project_submissions (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  sector_key text not null,
  drive_link text,
  github_link text,
  powerbi_link text,
  notes text,
  status text default 'submitted', -- submitted | approved | needs_revision
  reviewer_feedback text,
  submitted_at timestamp with time zone default now(),
  reviewed_at timestamp with time zone
);

alter table public.project_submissions enable row level security;

create policy "Students manage their own submissions"
  on public.project_submissions for all
  using (auth.uid() = student_id);

create policy "Admins view and review all submissions"
  on public.project_submissions for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ============================================
-- 12. MENTORSHIP CREDITS WALLET (free quota +
-- paid top-ups, shared across every sector)
-- ============================================
create table public.mentorship_credits (
  student_id uuid references public.profiles(id) on delete cascade primary key,
  free_credits_remaining int default 2, -- e.g. 2 free 30-min sessions per the spec
  paid_credits_remaining int default 0,
  updated_at timestamp with time zone default now()
);

alter table public.mentorship_credits enable row level security;

create policy "Students view their own credits"
  on public.mentorship_credits for select
  using (auth.uid() = student_id);

create policy "Admins manage all credits"
  on public.mentorship_credits for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-create a credits wallet whenever a new profile is created
create function public.handle_new_profile_credits()
returns trigger as $$
begin
  insert into public.mentorship_credits (student_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created_init_credits
  after insert on public.profiles
  for each row execute procedure public.handle_new_profile_credits();


-- ============================================
-- 13. CONSULTATION BOOKINGS (Mentorship Module)
-- ============================================
-- NOTE FOR LATER: `meeting_link` and calendar sync
-- are left as plain text fields for now. Wiring this
-- to a real Zoom/Google Calendar API is a separate
-- step that needs its own API credentials, the same
-- way Supabase needed a URL + key — see the project
-- notes when ready to connect a real calendar.
-- ============================================
create table public.consultations (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  sector_key text, -- which sector this consultation relates to (nullable = general)
  category text not null, -- 'technical' | 'career' | 'project'
  requested_slot timestamp with time zone,
  duration_minutes int default 30,
  status text default 'pending', -- pending | confirmed | completed | cancelled
  is_paid boolean default false,
  meeting_link text,
  recording_url text,
  mentor_notes text,
  created_at timestamp with time zone default now()
);

create index idx_consultations_student on public.consultations(student_id);

alter table public.consultations enable row level security;

create policy "Students manage their own consultations"
  on public.consultations for all
  using (auth.uid() = student_id);

create policy "Admins manage all consultations"
  on public.consultations for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ============================================
-- 14. RESOURCE HUB (downloadable attachments per
-- program node — raw Excel files, Python/SQL code)
-- ============================================
create table public.program_resources (
  id uuid default gen_random_uuid() primary key,
  program_id uuid references public.programs(id) on delete cascade,
  title_ar text,
  title_en text,
  file_url text not null,
  file_type text, -- 'excel' | 'python' | 'sql' | 'pdf' | 'other'
  sort_order int default 0,
  created_at timestamp with time zone default now()
);

alter table public.program_resources enable row level security;

create policy "Anyone can view resources"
  on public.program_resources for select
  using (true);

create policy "Admins manage resources"
  on public.program_resources for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ============================================
-- 15. LIVE SESSIONS (placeholder structure for
-- future Zoom/automation integration)
-- ============================================
-- NOT CONNECTED TO ANYTHING YET. This table only
-- stores session info manually for now (the admin
-- types in a Zoom link they created by hand).
--
-- FUTURE EXPANSION (when ready — needs a paid Zoom
-- plan with Cloud Recording + an n8n server):
--   - host_link / join_link would be auto-generated
--     by a Zoom API call instead of typed manually
--   - recording_url would be filled in automatically
--     by an n8n webhook after the session ends
--   - transcript_text would come from Whisper API
--   - flagged_at / flag_reason would come from the
--     keyword-scanning automation
-- None of this requires changing the table shape
-- later — just filling in columns that already exist.
-- ============================================
create table public.live_sessions (
  id uuid default gen_random_uuid() primary key,
  program_id uuid references public.programs(id) on delete cascade,
  instructor_name text,
  scheduled_at timestamp with time zone,
  duration_minutes int default 60,
  status text default 'scheduled', -- scheduled | live | recording_available | cancelled
  host_link text,   -- typed in manually for now
  join_link text,   -- typed in manually for now
  recording_url text, -- filled in manually for now once uploaded to Drive
  transcript_text text, -- empty until Whisper integration exists
  flagged_at timestamp with time zone, -- empty until keyword-scan automation exists
  flag_reason text,
  created_at timestamp with time zone default now()
);

alter table public.live_sessions enable row level security;

create policy "Anyone can view live sessions"
  on public.live_sessions for select
  using (true);

create policy "Admins manage live sessions"
  on public.live_sessions for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ============================================
-- 16. PROGRAM PREREQUISITES (flexible, many-to-many
-- gating system — works ACADEMY-WIDE, any program
-- can require any other program(s), regardless of
-- where they sit in the tree)
-- ============================================
-- WHY THIS TABLE EXISTS (separate from the simple
-- sequential lock on `programs.children_sequential_lock`):
-- The sequential lock only knows about "the sibling
-- right before me." This table lets a program require
-- ANY other program(s) anywhere in the academy — even
-- across different branches or sectors. Example from
-- the Industrial Automation spec: "IIoT" requires BOTH
-- "Advanced PLC Programming" AND "Complete SCADA
-- Mastery" to be completed, even though neither is its
-- immediate sibling.
--
-- A program can be unlocked by EITHER mechanism (the
-- sequential lock on its parent, OR its own prerequisite
-- rows here) — whichever rule the admin sets up. If a
-- program has rows here, ALL of them must be satisfied
-- (logical AND) before it unlocks.
-- ============================================
create table public.program_prerequisites (
  id uuid default gen_random_uuid() primary key,
  program_id uuid references public.programs(id) on delete cascade, -- the program that is GATED
  requires_program_id uuid references public.programs(id) on delete cascade, -- the program that must be completed first
  required_percent int default 70, -- how much of `requires_program_id` must be done (mirrors completion_threshold, but set per-link so it can differ from the source program's own default)
  created_at timestamp with time zone default now(),
  unique(program_id, requires_program_id)
);

create index idx_prereq_program on public.program_prerequisites(program_id);
create index idx_prereq_requires on public.program_prerequisites(requires_program_id);

alter table public.program_prerequisites enable row level security;

create policy "Anyone can view prerequisites"
  on public.program_prerequisites for select
  using (true);

create policy "Admins manage prerequisites"
  on public.program_prerequisites for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- THE FLEXIBLE PREREQUISITE LINK: IIoT (program 7) requires
-- BOTH Advanced PLC Programming (3) AND Complete SCADA Mastery (5)
-- at 70%+, regardless of their position in the tree. This is the
-- real-world example that justifies the program_prerequisites
-- table's existence (a simple sequential/sibling lock could not
-- express "requires two specific programs from earlier branches").
insert into public.program_prerequisites (program_id, requires_program_id, required_percent) values
  ('a0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', 70),
  ('a0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000005', 70);

-- ============================================
-- 17. PROGRAM EXAMS (academy-wide exam system —
-- two kinds: 'entry' gates access to a program/sector
-- BEFORE the student can open it at all; 'completion'
-- sits inside a program and marks it done when passed)
-- ============================================
create table public.program_exams (
  id uuid default gen_random_uuid() primary key,
  program_id uuid references public.programs(id) on delete cascade, -- the program (or sector, since sectors are also rows in `programs`) this exam gates or completes
  exam_type text not null, -- 'entry' | 'completion'
  title_ar text not null,
  title_en text not null,
  pass_percent int default 80,
  created_at timestamp with time zone default now()
);

create index idx_exams_program on public.program_exams(program_id);

alter table public.program_exams enable row level security;

create policy "Anyone can view exams"
  on public.program_exams for select
  using (true);

create policy "Admins manage exams"
  on public.program_exams for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ============================================
-- 18. EXAM ATTEMPTS (per-student results, drives
-- both the entry gate and the completion marking)
-- ============================================
create table public.exam_attempts (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  exam_id uuid references public.program_exams(id) on delete cascade,
  score_percent int not null,
  attempted_at timestamp with time zone default now()
);
-- NOTE: pass/fail is NOT stored as a fixed column here on purpose.
-- `program_exams.pass_percent` can change after an attempt was made
-- (the admin might lower or raise the bar later), so "did this
-- attempt pass?" is always computed live in app logic by comparing
-- `exam_attempts.score_percent` to the exam's CURRENT `pass_percent` —
-- never baked in at insert time.

create index idx_attempts_student on public.exam_attempts(student_id);
create index idx_attempts_exam on public.exam_attempts(exam_id);

alter table public.exam_attempts enable row level security;

create policy "Students manage their own attempts"
  on public.exam_attempts for all
  using (auth.uid() = student_id);

create policy "Admins view all attempts"
  on public.exam_attempts for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

