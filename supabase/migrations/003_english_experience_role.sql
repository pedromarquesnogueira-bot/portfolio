-- Campos complementares para a versão inglesa do site.
alter table public.experiences
  add column if not exists position_en text;

alter table public.site_settings
  add column if not exists role_en text;
