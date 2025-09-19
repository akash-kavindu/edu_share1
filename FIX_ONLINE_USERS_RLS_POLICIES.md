# Fix Online Users RLS Policies

## Problem
The console shows **403 Forbidden** errors with the message "new row violates row-level security policy for table 'online_users'". This means the RLS policies are preventing insert operations.

## Solution
You need to update the RLS policies for the `online_users` table in your Supabase dashboard.

## Steps to Fix

### 1. Go to Supabase Dashboard
- Open your Supabase project dashboard
- Navigate to **SQL Editor**

### 2. Run the Updated SQL Script
Copy and paste the following SQL into the SQL Editor and run it:

```sql
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
```

### 3. Alternative: Manual Policy Creation
If the SQL doesn't work, create policies manually:

1. Go to **Authentication** → **Policies**
2. Find the `online_users` table
3. Create these policies:

**Policy 1: Read Online Users**
- Policy name: `Allow authenticated users to read online users`
- Target roles: `authenticated`
- USING expression: `auth.role() = 'authenticated'`

**Policy 2: Insert Online Users**
- Policy name: `Allow authenticated users to insert online users`
- Target roles: `authenticated`
- WITH CHECK expression: `auth.role() = 'authenticated'`

**Policy 3: Update Own Status**
- Policy name: `Allow users to update their own online status`
- Target roles: `authenticated`
- USING expression: `auth.uid() = id`

**Policy 4: Delete Own Status**
- Policy name: `Allow users to delete their own online status`
- Target roles: `authenticated`
- USING expression: `auth.uid() = id`

### 4. Verify Setup
After running the SQL:
1. Go to **Table Editor** → **online_users**
2. Check that the policies are active
3. Refresh your React application
4. The console errors should disappear

### 5. Test the Application
1. Refresh your React application
2. Check the console - you should see:
   - ✅ Table access successful
   - ✅ Table structure is correct
   - ✅ Insert capability works
   - ✅ RLS policies are working
3. Online users functionality should work properly

## What Was Wrong
The original RLS policy `"Allow users to manage their own online status"` with `FOR ALL USING (auth.uid() = id)` was too restrictive. It only allowed users to manage their own records, but the insert operation was failing because:

1. The policy required `auth.uid() = id` for ALL operations
2. But during insert, the user might not have a record yet
3. The new policy allows any authenticated user to insert, but only the record owner to update/delete

## Expected Result
After fixing the policies:
- No more 403 Forbidden errors
- Online users can be added successfully
- Real-time online/offline status works
- Green dots appear next to online users
