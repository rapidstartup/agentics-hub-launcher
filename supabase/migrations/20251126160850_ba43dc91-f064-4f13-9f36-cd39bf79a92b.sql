-- Fix clients RLS policies
-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS clients_select_own ON public.clients;
DROP POLICY IF EXISTS clients_select_all_active ON public.clients;
DROP POLICY IF EXISTS clients_insert_own ON public.clients;
DROP POLICY IF EXISTS clients_update_own ON public.clients;
DROP POLICY IF EXISTS clients_delete_own ON public.clients;

-- Create clean policies
-- Allow all authenticated users to view active clients (agency-level access)
CREATE POLICY clients_select_all_active ON public.clients 
  FOR SELECT 
  TO authenticated
  USING (is_active = true);

-- Only allow users to create clients with their own user_id
CREATE POLICY clients_insert_own ON public.clients 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only allow users to update their own clients
CREATE POLICY clients_update_own ON public.clients 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Only allow users to delete their own clients
CREATE POLICY clients_delete_own ON public.clients 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON POLICY clients_select_all_active ON public.clients IS 
  'Allows all authenticated users to view active clients (agency-level access)';