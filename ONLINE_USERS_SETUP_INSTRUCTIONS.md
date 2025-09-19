# Online Users Table Setup Instructions

## Problem
The console shows 400 Bad Request errors when trying to query the `online_users` table because the table doesn't exist in your Supabase database.

## Solution
You need to create the `online_users` table in your Supabase dashboard.

## Steps to Fix

### 1. Go to Supabase Dashboard
- Open your Supabase project dashboard
- Navigate to **SQL Editor**

### 2. Run the SQL Script
Copy and paste the following SQL into the SQL Editor and run it:

```sql
-- Create the 'online_users' table
CREATE TABLE public.online_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.online_users ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow authenticated users to read online users
CREATE POLICY "Allow authenticated users to read online users" ON public.online_users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create a policy to allow users to manage their own online status
CREATE POLICY "Allow users to manage their own online status" ON public.online_users
  FOR ALL USING (auth.uid() = id);
```

### 3. Verify Setup
After running the SQL:
1. Go to **Table Editor** in your Supabase dashboard
2. You should see the `online_users` table listed
3. The table should have columns: `id`, `email`, `full_name`, `last_seen`

### 4. Test the Application
1. Refresh your React application
2. The console errors should disappear
3. Online users functionality should work properly

## What This Table Does
- **Tracks Online Users**: Stores which users are currently online
- **Real-time Updates**: Updates when users come online/offline
- **Activity Tracking**: Records when users were last active
- **Automatic Cleanup**: Removes inactive users automatically

## Troubleshooting
If you still see errors after creating the table:
1. Check that the table was created successfully in Table Editor
2. Verify the RLS policies are active
3. Make sure your Supabase project has the correct permissions
4. Check the browser console for any remaining errors

## Expected Result
After setup, you should see:
- No more 400 Bad Request errors in console
- Online users showing correctly in the Users tab
- Real-time online/offline status updates
- Green dots next to online users
