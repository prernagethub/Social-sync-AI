-- SocialSync AI - Multi-User Supabase Database Schema
-- 1. Main Content Calendar Table
create table if not exists content_calendar (
    id uuid primary key default gen_random_uuid(),
    user_id uuid, -- Multi-tenant User ID
    title text not null,
    caption text,
    platform text not null,
    scheduled_at timestamptz not null,
    status text default 'draft',
    color text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 2. Multi-User Social Accounts Connection Table
create table if not exists user_social_accounts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    platform text not null, -- 'linkedin', 'twitter', 'instagram'
    account_name text,
    access_token text not null,
    account_urn text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS & Disable restrictions for hackathon demo
alter table content_calendar disable row level security;
alter table user_social_accounts disable row level security;
