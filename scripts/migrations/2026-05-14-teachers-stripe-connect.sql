-- ============================================================
-- Phase 5b — Stripe Connect Express on teachers
-- Apply: node --env-file=.env.local scripts/run-sql.mjs scripts/migrations/2026-05-14-teachers-stripe-connect.sql
-- ============================================================

alter table teachers
  add column if not exists stripe_account_id        text,
  add column if not exists stripe_charges_enabled   boolean not null default false,
  add column if not exists stripe_payouts_enabled   boolean not null default false,
  add column if not exists stripe_details_submitted boolean not null default false;

create unique index if not exists teachers_stripe_account_id_unique
  on teachers (stripe_account_id)
  where stripe_account_id is not null;
