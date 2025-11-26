-- Storage bucket policies for knowledge-base bucket
-- Run this AFTER creating the bucket in Supabase Dashboard

-- Policy: Allow authenticated users to upload files to their own folder
-- Path format: {user_id}/{client_id}/{timestamp}_{filename}
INSERT INTO storage.policies (name, bucket_id, operation, definition, check_expression)
SELECT 
  'Allow authenticated uploads to own folder',
  'knowledge-base',
  'INSERT',
  '(auth.role() = ''authenticated'')',
  '(bucket_id = ''knowledge-base'' AND (storage.foldername(name))[1] = auth.uid()::text)'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies 
  WHERE bucket_id = 'knowledge-base' AND name = 'Allow authenticated uploads to own folder'
);

-- Policy: Allow authenticated users to read their own files
INSERT INTO storage.policies (name, bucket_id, operation, definition)
SELECT 
  'Allow authenticated reads of own files',
  'knowledge-base',
  'SELECT',
  '(bucket_id = ''knowledge-base'' AND (storage.foldername(name))[1] = auth.uid()::text)'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies 
  WHERE bucket_id = 'knowledge-base' AND name = 'Allow authenticated reads of own files'
);

-- Policy: Allow authenticated users to update their own files
INSERT INTO storage.policies (name, bucket_id, operation, definition)
SELECT 
  'Allow authenticated updates of own files',
  'knowledge-base',
  'UPDATE',
  '(bucket_id = ''knowledge-base'' AND (storage.foldername(name))[1] = auth.uid()::text)'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies 
  WHERE bucket_id = 'knowledge-base' AND name = 'Allow authenticated updates of own files'
);

-- Policy: Allow authenticated users to delete their own files
INSERT INTO storage.policies (name, bucket_id, operation, definition)
SELECT 
  'Allow authenticated deletes of own files',
  'knowledge-base',
  'DELETE',
  '(bucket_id = ''knowledge-base'' AND (storage.foldername(name))[1] = auth.uid()::text)'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies 
  WHERE bucket_id = 'knowledge-base' AND name = 'Allow authenticated deletes of own files'
);

