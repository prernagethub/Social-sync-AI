-- Multi-User Social Accounts Schema & Image URL Column
create table if not exists content_calendar (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    title text not null,
    caption text,
    platform text not null,
    scheduled_at timestamptz not null,
    status text default 'draft',
    color text,
    image_url text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table content_calendar add column if not exists image_url text;

create table if not exists user_social_accounts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    platform text not null,
    account_name text,
    access_token text not null,
    account_urn text,
    created_at timestamptz default now()
);

create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text unique not null,
    password_hash text,
    role text default 'Admin',
    avatar text,
    title text,
    created_at timestamptz default now()
);

alter table content_calendar disable row level security;
alter table user_social_accounts disable row level security;
alter table users disable row level security;
