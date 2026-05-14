-- ============================================================
-- Phase 6a — Lesson notes per booking
-- Apply: node --env-file=.env.local scripts/run-sql.mjs scripts/migrations/2026-05-14-bookings-lesson-notes.sql
-- ============================================================

alter table bookings
  add column if not exists lesson_notes text not null default '';
