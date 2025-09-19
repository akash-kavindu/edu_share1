import { supabase } from './supabase'

export const setupPapersTable = async () => {
  try {
    // Check if papers table exists
    const { data, error } = await supabase
      .from('papers')
      .select('*')
      .limit(1)

    if (error && error.code === 'PGRST116') {
      console.log('Papers table does not exist, creating...')
      
      // Create papers table
      const { error: createTableError } = await supabase.rpc('exec_sql', {
        sql: `
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
        `
      })

      if (createTableError) {
        console.error('Error creating papers table:', createTableError)
        return false
      }

      // Create storage bucket
      const { error: bucketError } = await supabase.storage.createBucket('papers', {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      })

      if (bucketError && bucketError.message !== 'Bucket already exists') {
        console.error('Error creating papers bucket:', bucketError)
      }

      // Note: Storage policies need to be set up manually in Supabase dashboard
      // or through the SQL editor for now
      console.log('Note: Please set up storage policies manually in Supabase dashboard')

      console.log('Papers table and storage bucket created successfully')
      return true
    }

    console.log('Papers table already exists')
    return true
  } catch (error) {
    console.error('Error setting up papers table:', error)
    return false
  }
}
