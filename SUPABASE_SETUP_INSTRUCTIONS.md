# Supabase Storage Setup for Papers

## Storage Policies Setup

To enable PDF uploads in the Papers tab, you need to set up storage policies in your Supabase dashboard:

### 1. Go to Supabase Dashboard
- Open your Supabase project dashboard
- Navigate to **Storage** → **Policies**

### 2. Create Storage Policies
Run the following SQL in the **SQL Editor**:

```sql
-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload papers" ON storage.objects;
DROP POLICY IF EXISTS "Users can view papers" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own papers" ON storage.objects;

-- Create new policies for papers bucket
CREATE POLICY "Users can upload papers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'papers');

CREATE POLICY "Users can view papers" ON storage.objects
  FOR SELECT USING (bucket_id = 'papers');

CREATE POLICY "Users can delete their own papers" ON storage.objects
  FOR DELETE USING (bucket_id = 'papers');
```

### 3. Alternative: Manual Policy Creation
If SQL doesn't work, create policies manually:

1. Go to **Storage** → **Policies**
2. Click **New Policy**
3. Create these policies:

**Policy 1: Upload Papers**
- Policy name: `Users can upload papers`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'papers'`
- WITH CHECK expression: `bucket_id = 'papers'`

**Policy 2: View Papers**
- Policy name: `Users can view papers`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'papers'`

**Policy 3: Delete Papers**
- Policy name: `Users can delete their own papers`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'papers'`

### 4. Verify Setup
After setting up the policies, try uploading a PDF in the Papers tab. The upload should work without the "row-level security policy" error.

## Database Table
The `papers` table will be created automatically when you first visit the Papers tab.

## Storage Bucket
The `papers` bucket will be created automatically with a 10MB file size limit.
