-- The app creates this automatically on first request. Kept here for reference.
create table if not exists surprises (
  id          text primary key,
  to_name     text not null default '',
  from_name   text not null default '',
  message     text not null,
  ticket      jsonb,
  bouquet     jsonb,
  photos      jsonb not null default '[]',
  key_hash    text not null,
  ip_hash     text not null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz
);
create index if not exists surprises_ip on surprises (ip_hash, created_at);
create index if not exists surprises_exp on surprises (expires_at);
