-- Update Clients RLS Policy
-- Updates the select policy to allow all authenticated users to see active clients
-- This enables agency-level access so all users can see all clients
-- Run this migration manually in your Supabase project.

-- Drop existing select policy if it exists
drop policy if exists clients_select_own on public.clients;

-- Create new policy that allows all authenticated users to see active clients
create policy clients_select_all_active on public.clients 
  for select 
  using (auth.uid() is not null and is_active = true);

comment on policy clients_select_all_active on public.clients is 
  'Allows all authenticated users to view active clients (agency-level access)';

