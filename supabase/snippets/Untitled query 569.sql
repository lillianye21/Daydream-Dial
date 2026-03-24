create table speaking_history (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  topic text not null,
  duration_seconds integer not null default 60
);
alter table speaking_history disable row level security;
notify pgrst, 'reload schema';