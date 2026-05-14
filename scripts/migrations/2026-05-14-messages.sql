-- ============================================================
-- Phase 6c — Messaging (teacher ↔ student threads)
-- Apply: node --env-file=.env.local scripts/run-sql.mjs scripts/migrations/2026-05-14-messages.sql
-- ============================================================

create table if not exists messages (
  id            uuid primary key default gen_random_uuid(),
  teacher_id    uuid not null references teachers(id) on delete cascade,
  student_email text not null,
  student_name  text not null default '',
  sender_role   text not null check (sender_role in ('teacher','student')),
  body          text not null check (length(body) between 1 and 5000),
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);

-- Threads are keyed by (teacher_id, lower(student_email)). The composite index
-- makes both "list a thread" and "find all threads for a teacher/student"
-- single-index lookups.
create index if not exists messages_thread_idx
  on messages (teacher_id, lower(student_email), created_at desc);

create index if not exists messages_student_lookup_idx
  on messages (lower(student_email), created_at desc);

-- Partial indexes for unread-by-recipient counts. Each side only cares about
-- messages *from* the other side that haven't been marked read yet.
create index if not exists messages_unread_for_teacher_idx
  on messages (teacher_id)
  where sender_role = 'student' and read_at is null;

create index if not exists messages_unread_for_student_idx
  on messages (lower(student_email))
  where sender_role = 'teacher' and read_at is null;
