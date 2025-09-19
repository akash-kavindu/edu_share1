import { useState, useEffect } from 'react'

// Fallback hook that doesn't use Supabase to prevent white screen issues
export const useOnlineUsersFallback = (userId) => {
  const [onlineUsers, setOnlineUsers] = useState([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!userId) return

    // Simulate online users for testing
    setOnlineUsers([
      {
        id: userId,
        email: 'current@user.com',
        full_name: 'Current User',
        last_seen: new Date().toISOString()
      }
    ])
    setIsConnected(true)
  }, [userId])

  const refreshOnlineUsers = async () => {
    console.log('Refresh online users called (fallback)')
  }

  return {
    onlineUsers,
    isConnected,
    refreshOnlineUsers
  }
}
