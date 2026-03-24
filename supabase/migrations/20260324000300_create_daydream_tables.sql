-- Create daydream_topics table
create table public.daydream_topics (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  is_active boolean not null default true
);

-- Disable RLS for easy testing from our frontend
alter table public.daydream_topics disable row level security;

-- Seed default topics
insert into public.daydream_topics (content, is_active) values
('what constitutes a perfect day', true),
('my most controversial food opinion', true),
('the best book I read recently', true),
('if I could have any superpower', true),
('a skill I want to learn this year', true);

-- Create daydream_speaking_history table
create table public.daydream_speaking_history (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  topic text not null,
  duration_seconds integer not null default 60
);

-- Disable RLS for easy testing
alter table public.daydream_speaking_history disable row level security;
