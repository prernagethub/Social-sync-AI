-- SocialSync AI - Supabase Database Schema
-- Table: content_calendar

create table if not exists content_calendar (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    caption text,
    platform text not null,
    scheduled_at timestamptz not null,
    status text default 'draft',
    color text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Option A: Disable RLS for unrestricted demo read/write access (RECOMMENDED for hackathons)
alter table content_calendar disable row level security;

-- Option B: Permissive RLS Policy for all operations
-- drop policy if exists "Enable full access for all users" on content_calendar;
-- create policy "Enable full access for all users" on content_calendar for all using (true) with check (true);
