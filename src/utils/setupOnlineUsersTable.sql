-- Create the 'online_users' table
CREATE TABLE public.online_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.online_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read online users" ON public.online_users;
DROP POLICY IF EXISTS "Allow users to manage their own online status" ON public.online_users;
DROP POLICY IF EXISTS "Allow authenticated users to insert online users" ON public.online_users;
DROP POLICY IF EXISTS "Allow authenticated users to update online users" ON public.online_users;
DROP POLICY IF EXISTS "Allow authenticated users to delete online users" ON public.online_users;

-- Create a policy to allow authenticated users to read online users
CREATE POLICY "Allow authenticated users to read online users" ON public.online_users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create a policy to allow authenticated users to insert online users
CREATE POLICY "Allow authenticated users to insert online users" ON public.online_users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create a policy to allow users to update their own online status
CREATE POLICY "Allow users to update their own online status" ON public.online_users
  FOR UPDATE USING (auth.uid() = id);

-- Create a policy to allow users to delete their own online status
CREATE POLICY "Allow users to delete their own online status" ON public.online_users
  FOR DELETE USING (auth.uid() = id);
