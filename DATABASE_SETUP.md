# Database Setup for Edu Share

This guide will help you set up the required database tables in Supabase for the Edu Share application.

## Required Tables

### 1. Messages Table

Create a table called `messages` with the following structure:

```sql
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all messages
CREATE POLICY "Allow authenticated users to read messages" ON messages
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to insert messages
CREATE POLICY "Allow authenticated users to insert messages" ON messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow users to delete any message (for "delete for everyone" feature)
CREATE POLICY "Allow users to delete any message" ON messages
  FOR DELETE USING (auth.role() = 'authenticated');
```

### 2. Online Users Table

Create a table called `online_users` with the following structure:

```sql
CREATE TABLE online_users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE online_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read online users
CREATE POLICY "Allow authenticated users to read online users" ON online_users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow users to manage their own online status
CREATE POLICY "Allow users to manage their own online status" ON online_users
  FOR ALL USING (auth.uid() = id);
```

### 3. Storage Bucket for Images

Create a storage bucket called `chat-images`:

1. Go to Storage in your Supabase dashboard
2. Click "New bucket"
3. Name it `chat-images`
4. Make it public
5. Set up the following policy:

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-images' AND
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to view images
CREATE POLICY "Allow authenticated users to view images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chat-images' AND
    auth.role() = 'authenticated'
  );
```

## Authentication Setup

1. Go to Authentication > Settings in your Supabase dashboard
2. Enable Email authentication
3. Configure your site URL (e.g., `http://localhost:3000` for development)
4. Add any additional redirect URLs as needed

## Environment Variables

The application is already configured with the provided Supabase credentials in `src/utils/supabase.js`. No additional environment setup is required.

## Running the Application

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Open your browser to `http://localhost:3000`

## Features

- ✅ User authentication (sign up/sign in)
- ✅ Real-time chat with Supabase subscriptions
- ✅ Image sharing with Supabase Storage
- ✅ Online users tracking
- ✅ Responsive design (mobile/desktop)
- ✅ Dark/Light mode toggle
- ✅ Message timestamps
- ✅ User avatars and names
