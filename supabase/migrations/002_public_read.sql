-- Permite que o site público leia somente o conteúdo que pode ser exibido.
drop policy if exists "Public read published projects" on public.projects;
drop policy if exists "Public read project media" on public.project_images;
drop policy if exists "Public read tags" on public.tags;
drop policy if exists "Public read tools" on public.tools;
drop policy if exists "Public read project tags" on public.project_tags;
drop policy if exists "Public read project tools" on public.project_tools;
drop policy if exists "Public read published experiences" on public.experiences;
drop policy if exists "Public read site settings" on public.site_settings;

create policy "Public read published projects" on public.projects for select to anon using (published = true);
create policy "Public read project media" on public.project_images for select to anon using (exists (select 1 from public.projects where projects.id = project_images.project_id and projects.published = true));
create policy "Public read tags" on public.tags for select to anon using (true);
create policy "Public read tools" on public.tools for select to anon using (true);
create policy "Public read project tags" on public.project_tags for select to anon using (exists (select 1 from public.projects where projects.id = project_tags.project_id and projects.published = true));
create policy "Public read project tools" on public.project_tools for select to anon using (exists (select 1 from public.projects where projects.id = project_tools.project_id and projects.published = true));
create policy "Public read published experiences" on public.experiences for select to anon using (published = true);
create policy "Public read site settings" on public.site_settings for select to anon using (true);
