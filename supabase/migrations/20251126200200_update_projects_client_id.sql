-- Update Projects Client ID
-- Updates seeded projects from 'demo-client' to 'techstart-solutions'
-- Run this migration manually in your Supabase project after seeding.

-- Update all projects with demo-client to techstart-solutions
update public.projects
set client_id = 'techstart-solutions'
where client_id = 'demo-client';

-- Also update any related records that might reference the old client_id
-- (project_asset_statuses, etc. don't have client_id in the seed, but just in case)
update public.project_asset_statuses
set client_id = 'techstart-solutions'
where client_id = 'demo-client';

-- Log the update
do $$
declare
  v_count integer;
begin
  select count(*) into v_count from public.projects where client_id = 'techstart-solutions';
  raise notice 'Updated % projects to techstart-solutions', v_count;
end $$;

