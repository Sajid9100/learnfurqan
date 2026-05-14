-- ============================================================
-- Phase 3 — Reviews after class
-- Apply: node --env-file=.env.local scripts/run-sql.mjs scripts/migrations/2026-05-14-reviews.sql
-- ============================================================

create table if not exists reviews (
  id             uuid primary key default gen_random_uuid(),
  booking_id     uuid not null unique references bookings(id) on delete cascade,
  teacher_id     uuid not null references teachers(id) on delete cascade,
  student_email  text not null,
  student_name   text not null,
  rating         int  not null check (rating between 1 and 5),
  comment        text default '',
  created_at     timestamptz default now()
);

create index if not exists reviews_teacher_id_created_idx
  on reviews (teacher_id, created_at desc);
create index if not exists reviews_booking_id_idx on reviews (booking_id);

-- Recompute aggregate columns on teachers from current reviews.
create or replace function recompute_teacher_rating(t uuid) returns void as $$
begin
  update teachers
     set review_count = (select count(*) from reviews where teacher_id = t),
         rating       = coalesce(
           (select round(avg(rating)::numeric, 2) from reviews where teacher_id = t),
           5.0
         )
   where id = t;
end;
$$ language plpgsql;

create or replace function reviews_after_change() returns trigger as $$
begin
  if (TG_OP = 'DELETE') then
    perform recompute_teacher_rating(OLD.teacher_id);
    return OLD;
  end if;

  perform recompute_teacher_rating(NEW.teacher_id);
  if (TG_OP = 'UPDATE' and OLD.teacher_id <> NEW.teacher_id) then
    perform recompute_teacher_rating(OLD.teacher_id);
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists reviews_after_change_trg on reviews;
create trigger reviews_after_change_trg
  after insert or update or delete on reviews
  for each row execute function reviews_after_change();

-- Drop hardcoded seed values so the rating reflects real reviews only.
-- Teachers default to rating=5.0 / review_count=0; the trigger overwrites
-- these once the first review lands.
update teachers set rating = 5.0, review_count = 0;

-- RLS: public site needs to read reviews for the profile page; writes flow
-- through API routes using the service role key, which bypasses RLS.
alter table reviews enable row level security;

drop policy if exists "Public reads reviews" on reviews;
create policy "Public reads reviews"
  on reviews for select
  to anon, authenticated
  using (true);
