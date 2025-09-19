-- Create papers table for PDF document management
CREATE TABLE IF NOT EXISTS papers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_by_name TEXT NOT NULL,
  uploaded_by_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_papers_uploaded_by ON papers(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_papers_created_at ON papers(created_at DESC);

-- Enable Row Level Security
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;

-- Create policies for papers table
-- Users can view all papers (shared documents)
CREATE POLICY "Users can view all papers" ON papers
  FOR SELECT USING (true);

-- Users can only insert their own papers
CREATE POLICY "Users can insert their own papers" ON papers
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Users can only update their own papers
CREATE POLICY "Users can update their own papers" ON papers
  FOR UPDATE USING (auth.uid() = uploaded_by);

-- Users can only delete their own papers
CREATE POLICY "Users can delete their own papers" ON papers
  FOR DELETE USING (auth.uid() = uploaded_by);

-- Create storage bucket for papers
INSERT INTO storage.buckets (id, name, public)
VALUES ('papers', 'papers', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for papers bucket
CREATE POLICY "Users can upload papers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'papers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view papers" ON storage.objects
  FOR SELECT USING (bucket_id = 'papers');

CREATE POLICY "Users can delete their own papers" ON storage.objects
  FOR DELETE USING (bucket_id = 'papers' AND auth.uid()::text = (storage.foldername(name))[1]);
