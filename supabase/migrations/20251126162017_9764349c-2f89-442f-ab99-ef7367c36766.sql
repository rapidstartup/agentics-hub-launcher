-- Fix projects RLS policies for agency-wide access
-- Drop existing restrictive policies
DROP POLICY IF EXISTS projects_select_own ON public.projects;
DROP POLICY IF EXISTS projects_insert_own ON public.projects;
DROP POLICY IF EXISTS projects_update_own ON public.projects;
DROP POLICY IF EXISTS projects_delete_own ON public.projects;

-- Create agency-wide policies
-- Allow all authenticated users to view all projects
CREATE POLICY projects_select_all ON public.projects 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Users can create projects with their own user_id
CREATE POLICY projects_insert_own ON public.projects 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update any project (agency-wide)
CREATE POLICY projects_update_all ON public.projects 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Users can delete any project (agency-wide)
CREATE POLICY projects_delete_all ON public.projects 
  FOR DELETE 
  TO authenticated
  USING (true);

COMMENT ON POLICY projects_select_all ON public.projects IS 
  'Allows all authenticated users to view all projects (agency-wide access)';

-- Update seeded projects to use the current user
-- This will be handled by the application when creating new projects