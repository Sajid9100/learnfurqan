-- Track admin login attempts per IP for rate limiting and lockout.
create table if not exists admin_login_attempts (
  id bigserial primary key,
  ip text not null,
  attempt_at timestamptz not null default now(),
  success boolean not null default false
);

create index if not exists admin_login_attempts_ip_time_idx
  on admin_login_attempts (ip, attempt_at desc);
