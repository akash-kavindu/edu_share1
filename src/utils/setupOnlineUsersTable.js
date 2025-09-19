import { supabase } from './supabase'

export const setupOnlineUsersTable = async () => {
  try {
    // Check if the 'online_users' table exists
    const { data: tableCheck, error: tableCheckError } = await supabase
      .from('online_users')
      .select('id')
      .limit(1)

    if (tableCheckError && tableCheckError.code === '42P01') { // '42P01' is the error code for "undefined_table"
      console.log('Online users table does not exist.')
      console.log('Please create the online_users table in your Supabase dashboard using the SQL from setupOnlineUsersTable.sql')
      return false
    } else if (tableCheckError) {
      console.error('Error checking for online_users table:', tableCheckError)
      return false
    } else {
      console.log('Online users table already exists.')
      return true
    }
  } catch (error) {
    console.error('Unexpected error in setupOnlineUsersTable:', error)
    return false
  }
}
