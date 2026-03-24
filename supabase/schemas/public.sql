create table public.speaking_history (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  topic text not null,
  duration_seconds integer not null default 60
);

-- Turn off RLS temporarily for easy testing from our frontend
alter table public.speaking_history disable row level security;
