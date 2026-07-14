-- CMS do portfólio: execute este arquivo uma única vez no SQL Editor do Supabase.
create extension if not exists "pgcrypto";

alter table public.projects
  add column if not exists title_en text,
  add column if not exists description_en text,
  add column if not exists sort_order integer not null default 0;

alter table public.tools
  add column if not exists icon_url text;

alter table public.experiences
  add column if not exists description_en text,
  add column if not exists published boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.site_settings (
  id boolean primary key default true check (id),
  name text not null default 'Pedro Marques',
  role text,
  email text,
  whatsapp text,
  linkedin text,
  behance text,
  about_pt text,
  about_en text,
  hero_banner_url text,
  favicon_url text,
  seo_title_pt text,
  seo_title_en text,
  seo_description_pt text,
  seo_description_en text,
  seo_keywords_pt text,
  seo_keywords_en text,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values (true) on conflict (id) do nothing;

alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.tags enable row level security;
alter table public.tools enable row level security;
alter table public.project_tags enable row level security;
alter table public.project_tools enable row level security;
alter table public.experiences enable row level security;
alter table public.site_settings enable row level security;

-- Remove apenas políticas de desenvolvimento com estes nomes, se existirem.
drop policy if exists "CMS authenticated access" on public.projects;
drop policy if exists "CMS authenticated access" on public.project_images;
drop policy if exists "CMS authenticated access" on public.tags;
drop policy if exists "CMS authenticated access" on public.tools;
drop policy if exists "CMS authenticated access" on public.project_tags;
drop policy if exists "CMS authenticated access" on public.project_tools;
drop policy if exists "CMS authenticated access" on public.experiences;
drop policy if exists "CMS authenticated access" on public.site_settings;

create policy "CMS authenticated access" on public.projects for all to authenticated using (true) with check (true);
create policy "CMS authenticated access" on public.project_images for all to authenticated using (true) with check (true);
create policy "CMS authenticated access" on public.tags for all to authenticated using (true) with check (true);
create policy "CMS authenticated access" on public.tools for all to authenticated using (true) with check (true);
create policy "CMS authenticated access" on public.project_tags for all to authenticated using (true) with check (true);
create policy "CMS authenticated access" on public.project_tools for all to authenticated using (true) with check (true);
create policy "CMS authenticated access" on public.experiences for all to authenticated using (true) with check (true);
create policy "CMS authenticated access" on public.site_settings for all to authenticated using (true) with check (true);

create index if not exists projects_sort_order_idx on public.projects (sort_order);
create index if not exists experiences_sort_order_idx on public.experiences (sort_order);
create index if not exists project_images_sort_order_idx on public.project_images (project_id, sort_order);
