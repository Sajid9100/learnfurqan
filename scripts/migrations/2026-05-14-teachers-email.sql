-- ============================================================
-- Phase 5a — Teacher login via email match
-- Apply: node --env-file=.env.local scripts/run-sql.mjs scripts/migrations/2026-05-14-teachers-email.sql
-- ============================================================

alter table teachers
  add column if not exists email text;

-- Case-insensitive uniqueness; nullable rows are not constrained.
create unique index if not exists teachers_email_lower_unique
  on teachers (lower(email))
  where email is not null;
