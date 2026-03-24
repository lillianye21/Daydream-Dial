-- create table
create table public.topics (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  is_active boolean not null default true
);

-- Turn off RLS temporarily for easy testing from our frontend
alter table public.topics disable row level security;

-- Seed default topics
insert into public.topics (content, is_active) values
('favorite fashion trends currently', true),
('what I learned this week', true),
('an entertaining childhood memory', true),
('my dream travel destination', true),
('the best advice I''ve ever received', true),
('the return of Y2K fashion aesthetics', true),
('clean girl makeup vs maximalist beauty', true),
('how tiktok impacts fast fashion', true),
('sustainability in the beauty industry', true),
('my signature scent profile', true),
('how AI is changing creative jobs', true),
('the future of spatial computing and AR', true),
('is the metaverse dead or evolving?', true),
('my favorite productivity app stack', true),
('short-form video vs long-form content', true),
('parasocial relationships with influencers', true),
('cancel culture and brand accountability', true),
('the psychology behind doomscrolling', true),
('how algorithms shape our music taste', true),
('the best subscription service I pay for', true),
('remote work vs return-to-office culture', true),
('the evolution of internet meme culture', true),
('how I curate my digital identity', true),
('my strategy for unplugging from screens', true),
('a niche internet micro-community I observe', true);
