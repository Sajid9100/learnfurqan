-- ============================================================
-- QuranSphere — Supabase schema
-- Run this in Supabase SQL Editor (Project ➜ SQL ➜ New query)
-- ============================================================

-- Required extensions ----------------------------------------------------------
create extension if not exists "pgcrypto";

-- Drop in dev only -- comment these out before running in prod ----------------
-- drop table if exists subscriptions cascade;
-- drop table if exists teacher_applications cascade;
-- drop table if exists bookings cascade;
-- drop table if exists teachers cascade;

-- ============================================================
-- TEACHERS
-- ============================================================
create table if not exists teachers (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  gender            text check (gender in ('male','female')),
  subject           text not null,
  language          text not null,
  country           text not null,
  country_flag      text not null,
  experience_years  integer not null,
  price_per_class   decimal(10,2) not null,
  rating            decimal(3,2) default 5.0,
  review_count      integer default 0,
  bio               text,
  teaching_style    text,
  certifications    text,
  intro_video_url   text default '',
  available_slots   text[] default '{}',
  is_featured       boolean default false,
  slug              text unique not null,
  is_active         boolean default true,
  created_at        timestamptz default now()
);

create index if not exists teachers_is_active_idx on teachers (is_active);
create index if not exists teachers_is_featured_idx on teachers (is_featured);
create index if not exists teachers_gender_idx on teachers (gender);

-- ============================================================
-- BOOKINGS
-- ============================================================
create table if not exists bookings (
  id                  uuid primary key default gen_random_uuid(),
  teacher_id          uuid references teachers(id) on delete set null,
  teacher_name        text not null,
  teacher_slug        text not null,
  student_name        text not null,
  student_email       text not null,
  student_phone       text not null,
  student_country     text not null,
  age_group           text not null,
  current_level       text not null,
  selected_slot       text not null,
  message             text default '',
  status              text default 'pending'
                        check (status in ('pending','confirmed','completed','cancelled')),
  stripe_session_id   text default '',
  payment_status      text default 'free_trial'
                        check (payment_status in ('free_trial','paid','refunded')),
  zoom_link           text default '',
  created_at          timestamptz default now()
);

create index if not exists bookings_teacher_id_idx on bookings (teacher_id);
create index if not exists bookings_student_email_idx on bookings (student_email);
create index if not exists bookings_status_idx on bookings (status);
create index if not exists bookings_created_at_idx on bookings (created_at desc);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table if not exists subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  student_email            text not null,
  student_name             text not null,
  plan                     text not null check (plan in ('basic','premium')),
  stripe_customer_id       text,
  stripe_subscription_id   text unique,
  status                   text default 'active'
                             check (status in ('active','cancelled','past_due')),
  current_period_end       timestamptz,
  created_at               timestamptz default now()
);

create index if not exists subscriptions_student_email_idx on subscriptions (student_email);
create index if not exists subscriptions_stripe_customer_idx on subscriptions (stripe_customer_id);

-- ============================================================
-- TEACHER APPLICATIONS
-- ============================================================
create table if not exists teacher_applications (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  email             text not null,
  phone             text not null,
  country           text not null,
  subject           text not null,
  experience_years  integer not null,
  certifications    text not null,
  demo_video_url    text default '',
  languages         text not null,
  availability      text not null,
  message           text default '',
  status            text default 'pending'
                      check (status in ('pending','approved','rejected')),
  created_at        timestamptz default now()
);

create index if not exists teacher_applications_email_idx on teacher_applications (email);
create index if not exists teacher_applications_status_idx on teacher_applications (status);

-- ============================================================
-- STUDENT PROFILES — editable fields for logged-in students
-- Keyed on the lowercase Clerk-verified email so we don't need
-- to migrate when Clerk user IDs change.
-- ============================================================
create table if not exists student_profiles (
  email        text primary key,
  name         text default '',
  phone        text default '',
  country      text default '',
  age_group    text default '',
  updated_at   timestamptz default now()
);

create index if not exists student_profiles_updated_at_idx
  on student_profiles (updated_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- Public site reads active teachers; everything else is locked
-- behind the service role (used by server-side API routes).
-- ============================================================
alter table teachers enable row level security;
alter table bookings enable row level security;
alter table subscriptions enable row level security;
alter table teacher_applications enable row level security;
alter table student_profiles enable row level security;

-- Teachers: anyone (anon + authenticated) may read active rows
drop policy if exists "Public reads active teachers" on teachers;
create policy "Public reads active teachers"
  on teachers for select
  to anon, authenticated
  using (is_active = true);

-- Bookings / subscriptions / applications: no public policies.
-- All writes flow through API routes using the service role key,
-- which bypasses RLS by design.

-- ============================================================
-- SEED — 8 launch teachers (mirrors lib/teachers-data.ts)
-- ============================================================
insert into teachers
  (name, gender, subject, language, country, country_flag, experience_years,
   price_per_class, rating, review_count, bio, teaching_style, certifications,
   intro_video_url, available_slots, is_featured, slug)
values
  ('Ustadh Ahmad Ali', 'male', 'Tajweed & Hifz', 'English, Arabic',
   'Egypt', '🇪🇬', 10, 15.00, 4.9, 134,
   'I have been teaching Quran for over 10 years with a focus on Tajweed and Hifz programs. I hold an Ijazah in Quran recitation and have helped over 200 students worldwide complete their memorization goals.',
   'Patient, structured, and encouraging. I create a personalized plan for each student.',
   'Ijazah in Tajweed, Al-Azhar University Certified',
   '',
   array['Mon 9am UTC','Wed 11am UTC','Fri 4pm UTC','Sat 10am UTC'],
   true, 'ustadh-ahmad-ali'),

  ('Sister Fatima Malik', 'female', 'Quran for Kids & Noorani Qaida', 'English, Urdu',
   'Pakistan', '🇵🇰', 6, 12.00, 4.8, 98,
   'Specializing in teaching young children, I make Quran learning fun and engaging. My students love the interactive storytelling approach I use to teach Islamic values alongside recitation.',
   'Fun, engaging, and child-friendly. I use games and rewards to keep kids motivated.',
   'Diploma in Islamic Education, Certified Kids Quran Teacher',
   '',
   array['Tue 2pm UTC','Thu 3pm UTC','Sat 8am UTC','Sun 10am UTC'],
   true, 'sister-fatima-malik'),

  ('Sheikh Omar Hassan', 'male', 'Arabic Language & Tafseer', 'English, Arabic, French',
   'Jordan', '🇯🇴', 14, 20.00, 5.0, 201,
   'With 14 years of experience teaching classical Arabic and Tafseer, I help students go beyond recitation to truly understand the meaning of the Quran. I have students from over 15 countries.',
   'Academic yet accessible. I connect Quranic meanings to real life situations.',
   'Masters in Islamic Studies, Jordan University. Ijazah in Tafseer.',
   '',
   array['Mon 6pm UTC','Wed 6pm UTC','Thu 7pm UTC'],
   true, 'sheikh-omar-hassan'),

  ('Ustadha Maryam Yusuf', 'female', 'Female Students Only — Quran & Tajweed', 'English, Malay',
   'Malaysia', '🇲🇾', 7, 14.00, 4.9, 87,
   'I provide a safe and comfortable learning environment exclusively for female students and young girls. My approach is gentle, supportive, and rooted in traditional Islamic values.',
   'Warm, supportive, and confidence-building. Perfect for sisters new to Quran learning.',
   'Diploma in Quran Recitation, International Islamic University Malaysia',
   '',
   array['Tue 10am UTC','Thu 11am UTC','Sun 2pm UTC'],
   false, 'ustadha-maryam-yusuf'),

  ('Ustadh Bilal Qureshi', 'male', 'Hifz Program (Full Memorization)', 'English, Urdu',
   'United Kingdom', '🇬🇧', 9, 18.00, 4.8, 112,
   'I run a structured 3-year Hifz program online. My students follow a proven daily revision system that ensures long-term retention. I have helped 40+ students complete their Hifz online.',
   'Disciplined and systematic. I track every student''s daily progress closely.',
   'Hafiz ul Quran, Deobandi Ijazah',
   '',
   array['Mon 7am UTC','Wed 7am UTC','Fri 7am UTC','Sat 6am UTC'],
   false, 'ustadh-bilal-qureshi'),

  ('Sister Aisha Rahman', 'female', 'Islamic Studies & Duas for Kids', 'English',
   'United States', '🇺🇸', 5, 13.00, 4.7, 63,
   'Born and raised in the US, I understand the challenges of raising Muslim kids in the West. My classes combine Quran recitation, daily duas, and fun Islamic stories tailored for children aged 4 to 12.',
   'Creative, storytelling-based, and highly interactive. Parents love seeing their kids excited about Islam.',
   'Bachelor of Islamic Studies, Islamic Online University',
   '',
   array['Mon 4pm UTC','Wed 4pm UTC','Sat 3pm UTC'],
   false, 'sister-aisha-rahman'),

  ('Ustadh Yusuf Al-Turki', 'male', 'Tajweed Mastery — Advanced Level', 'English, Arabic, Turkish',
   'Turkey', '🇹🇷', 12, 22.00, 4.9, 155,
   'I specialize in advanced Tajweed for students who already read Quran and want to perfect their recitation. My students have gone on to lead prayers at their local mosques worldwide.',
   'Precise, detail-oriented, and highly motivating. I push students to excellence.',
   'Ijazah with Sanad, Diyanet Certified Turkey',
   '',
   array['Tue 8am UTC','Thu 9am UTC','Sat 11am UTC'],
   true, 'ustadh-yusuf-al-turki'),

  ('Ustadha Khadijah Osei', 'female', 'Quran for Reverts & Beginners', 'English',
   'Ghana', '🇬🇭', 4, 10.00, 4.8, 44,
   'Being a revert myself, I have a deep understanding of where new Muslims start from. I teach absolute beginners with zero prior knowledge — starting from Arabic letters all the way to fluent Quran recitation.',
   'Compassionate, zero-judgment, and beginner-friendly. Perfect for reverts and adult beginners.',
   'Certified Quran Teacher, Al-Maghrib Institute',
   '',
   array['Mon 2pm UTC','Fri 3pm UTC','Sun 4pm UTC'],
   false, 'ustadha-khadijah-osei')
on conflict (slug) do nothing;
