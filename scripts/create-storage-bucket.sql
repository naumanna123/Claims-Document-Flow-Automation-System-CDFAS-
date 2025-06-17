-- Create the claim-documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('claim-documents', 'claim-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload claim documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'claim-documents' AND
    auth.role() = 'authenticated'
  );

-- Create policy to allow users to view claim documents
CREATE POLICY "Users can view claim documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'claim-documents' AND
    auth.role() = 'authenticated'
  );

-- Create policy to allow users to delete their own claim documents
CREATE POLICY "Users can delete their own claim documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'claim-documents' AND
    auth.role() = 'authenticated'
  );
