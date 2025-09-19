import { useState, useEffect, useRef } from 'react'
import { supabase } from '../utils/supabase'
import { setupOnlineUsersTable } from '../utils/setupOnlineUsersTable'
import { testOnlineUsersTable } from '../utils/testOnlineUsersTable'

export const useOnlineUsers = (userId) => {
  const [onlineUsers, setOnlineUsers] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const heartbeatIntervalRef = useRef(null)
  const cleanupIntervalRef = useRef(null)
  const userAddedRef = useRef(false)

  // Add current user to online users
  const addUserToOnline = async () => {
    if (!userId || userAddedRef.current) return

    try {
      console.log('Attempting to add user to online list...')
      
      // Get current user data
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        console.error('No authenticated user found')
        return
      }

      console.log('Current user data:', {
        id: currentUser.id,
        email: currentUser.email,
        metadata: currentUser.user_metadata
      })

      const { error } = await supabase
        .from('online_users')
        .upsert({
          id: userId,
          email: currentUser.email || '',
          full_name: currentUser.user_metadata?.full_name || 
                    currentUser.email?.split('@')[0] || 'User',
          last_seen: new Date().toISOString()
        })

      if (error) {
        console.error('Error adding user to online list:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
      } else {
        userAddedRef.current = true
        console.log('User added to online list successfully')
      }
    } catch (error) {
      console.error('Error adding user to online list:', error)
    }
  }

  // Update user's last_seen timestamp (heartbeat)
  const updateHeartbeat = async () => {
    if (!userId || !userAddedRef.current) return

    try {
      await supabase
        .from('online_users')
        .update({ 
          last_seen: new Date().toISOString()
        })
        .eq('id', userId)
    } catch (error) {
      console.error('Error updating heartbeat:', error)
    }
  }

  // Remove user from online users
  const removeUserFromOnline = async () => {
    if (!userId) return

    try {
      await supabase
        .from('online_users')
        .delete()
        .eq('id', userId)
      userAddedRef.current = false
      console.log('User removed from online list')
    } catch (error) {
      console.error('Error removing user from online list:', error)
    }
  }

  // Load initial online users
  const loadOnlineUsers = async () => {
    try {
      console.log('Attempting to load online users...')
      
      const { data, error } = await supabase
        .from('online_users')
        .select('id, email, full_name, last_seen')
        .order('last_seen', { ascending: false })

      if (error) {
        console.error('Error loading online users:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        // If table doesn't exist, try to create it
        if (error.code === '42P01' || error.message?.includes('relation "online_users" does not exist')) {
          console.log('Online users table does not exist, attempting to create...')
          await setupOnlineUsersTable()
          return
        }
        
        // If it's a permission error, check RLS policies
        if (error.code === '42501' || error.message?.includes('permission denied')) {
          console.log('Permission denied. Please check RLS policies for online_users table.')
          return
        }
        
        return
      }

      console.log('Successfully loaded online users data:', data)

      // Filter users seen within last 30 seconds
      const now = new Date()
      const activeUsers = (data || []).filter(user => {
        const lastSeen = new Date(user.last_seen)
        const diffInSeconds = (now - lastSeen) / 1000
        return diffInSeconds <= 30
      })

      console.log(`Loaded ${activeUsers.length} online users out of ${data?.length || 0} total`)
      setOnlineUsers(activeUsers)
    } catch (error) {
      console.error('Error loading online users:', error)
    }
  }

  // Clean up inactive users (older than 30 seconds)
  const cleanupInactiveUsers = async () => {
    try {
      const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString()
      await supabase
        .from('online_users')
        .delete()
        .lt('last_seen', thirtySecondsAgo)
    } catch (error) {
      console.error('Error cleaning up inactive users:', error)
    }
  }

  // Initialize online users system
  useEffect(() => {
    if (!userId) return

    const initializeOnlineUsers = async () => {
      // First, test the table
      console.log('Testing online_users table...')
      const tableWorking = await testOnlineUsersTable()
      
      if (!tableWorking) {
        console.error('Online users table is not working properly. Please check the setup.')
        return
      }
      
      // Add user to online list
      await addUserToOnline()

      // Load initial online users
      await loadOnlineUsers()
    }

    initializeOnlineUsers()

    // Set up real-time subscription
    const channel = supabase
      .channel('online_users_channel')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'online_users' 
        },
        (payload) => {
          console.log('Online users change:', payload.eventType, payload)

          if (payload.eventType === 'INSERT') {
            setOnlineUsers(prev => {
              // Check if user already exists
              const exists = prev.some(u => u.id === payload.new.id)
              if (exists) return prev

              // Only add if user was seen within last 30 seconds
              const now = new Date()
              const lastSeen = new Date(payload.new.last_seen)
              const diffInSeconds = (now - lastSeen) / 1000

              if (diffInSeconds <= 30) {
                return [...prev, payload.new]
              }
              return prev
            })
          } else if (payload.eventType === 'DELETE') {
            setOnlineUsers(prev => prev.filter(u => u.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            setOnlineUsers(prev => {
              const now = new Date()
              const lastSeen = new Date(payload.new.last_seen)
              const diffInSeconds = (now - lastSeen) / 1000

              if (diffInSeconds <= 30) {
                return prev.map(u => 
                  u.id === payload.new.id ? payload.new : u
                )
              } else {
                // Remove user if they're no longer active
                return prev.filter(u => u.id !== payload.new.id)
              }
            })
          }
        }
      )
      .subscribe((status) => {
        console.log('Online users subscription status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    // Set up heartbeat (update every 10 seconds)
    heartbeatIntervalRef.current = setInterval(updateHeartbeat, 10000)

    // Set up cleanup (clean inactive users every 30 seconds)
    cleanupIntervalRef.current = setInterval(cleanupInactiveUsers, 30000)

    // Cleanup on unmount
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current)
      }
      supabase.removeChannel(channel)
      removeUserFromOnline()
    }
  }, [userId])

  // Refresh online users manually
  const refreshOnlineUsers = async () => {
    await loadOnlineUsers()
  }

  return {
    onlineUsers,
    isConnected,
    refreshOnlineUsers
  }
}
