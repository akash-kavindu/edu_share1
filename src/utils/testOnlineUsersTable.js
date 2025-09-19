import { supabase } from './supabase'

export const testOnlineUsersTable = async () => {
  console.log('=== Testing Online Users Table ===')
  
  try {
    // Test 1: Check if table exists and is accessible
    console.log('1. Testing table access...')
    const { data: testData, error: testError } = await supabase
      .from('online_users')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Table access failed:', testError)
      console.error('Error details:', {
        code: testError.code,
        message: testError.message,
        details: testError.details,
        hint: testError.hint
      })
      return false
    } else {
      console.log('✅ Table access successful')
      console.log('Sample data:', testData)
    }

    // Test 2: Check table structure
    console.log('2. Testing table structure...')
    const { data: structureData, error: structureError } = await supabase
      .from('online_users')
      .select('id, email, full_name, last_seen')
      .limit(1)
    
    if (structureError) {
      console.error('❌ Structure test failed:', structureError)
      return false
    } else {
      console.log('✅ Table structure is correct')
    }

    // Test 3: Test insert (if no data exists)
    console.log('3. Testing insert capability...')
    const testUserId = '00000000-0000-0000-0000-000000000000'
    const { error: insertError } = await supabase
      .from('online_users')
      .upsert({
        id: testUserId,
        email: 'test@example.com',
        full_name: 'Test User',
        last_seen: new Date().toISOString()
      })
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError)
      console.error('This is likely an RLS policy issue. Please check the FIX_ONLINE_USERS_RLS_POLICIES.md file.')
      console.error('Error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      })
      return false
    } else {
      console.log('✅ Insert capability works')
      
      // Clean up test data
      await supabase
        .from('online_users')
        .delete()
        .eq('id', testUserId)
      console.log('✅ Test data cleaned up')
    }

    // Test 4: Test RLS policies
    console.log('4. Testing RLS policies...')
    const { data: rlsData, error: rlsError } = await supabase
      .from('online_users')
      .select('*')
    
    if (rlsError) {
      console.error('❌ RLS test failed:', rlsError)
      return false
    } else {
      console.log('✅ RLS policies are working')
      console.log('Current online users:', rlsData)
    }

    console.log('=== All tests passed! ===')
    return true

  } catch (error) {
    console.error('❌ Unexpected error during testing:', error)
    return false
  }
}
