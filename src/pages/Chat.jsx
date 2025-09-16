import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { supabase } from '../utils/supabase'
import { Send, Image as ImageIcon, LogOut, Sun, Moon, Users, Trash2, X, Download, User } from 'lucide-react'

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isOnlineUsersModalOpen, setIsOnlineUsersModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, message: null })
  const [longPressTimer, setLongPressTimer] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const userAddedToOnline = useRef(false)
  
  const { user, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Mark component as initialized after first render
  useEffect(() => {
    setIsInitialized(true)
  }, [])

  // Reset user added flag when user changes
  useEffect(() => {
    userAddedToOnline.current = false
  }, [user?.id])

  // Initialize database tables
  useEffect(() => {
    const initializeDatabase = async () => {
      // Create messages table
      const { error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .limit(1)
      
      if (messagesError && messagesError.code === 'PGRST116') {
        // Table doesn't exist, we'll handle this in Supabase dashboard
        console.log('Messages table needs to be created in Supabase dashboard')
      } else {
        console.log('Messages table exists and is accessible')
      }

      // Create online_users table
      const { error: usersError } = await supabase
        .from('online_users')
        .select('*')
        .limit(1)
      
      if (usersError && usersError.code === 'PGRST116') {
        // Table doesn't exist, we'll handle this in Supabase dashboard
        console.log('Online users table needs to be created in Supabase dashboard')
      } else {
        console.log('Online users table exists and is accessible')
      }

      // Test delete permissions
      console.log('Testing delete permissions...')
      const { data: testMessages } = await supabase
        .from('messages')
        .select('id')
        .limit(1)
      
      if (testMessages && testMessages.length > 0) {
        console.log('Found test message for delete permission test:', testMessages[0].id)
        // Don't actually delete, just test the query structure
        const { error: deleteTestError } = await supabase
          .from('messages')
          .delete()
          .eq('id', '00000000-0000-0000-0000-000000000000') // Non-existent ID
          .select()
        
        console.log('Delete permission test result:', deleteTestError)
      }
    }

    initializeDatabase()
  }, [])

  // Subscribe to messages
  useEffect(() => {
    console.log('Setting up message subscription for user:', user.id)
    
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('INSERT event received:', payload)
          setMessages(prev => {
            // Only add messages from other users to avoid duplicates
            // Current user's messages are already handled in the send functions
            if (payload.new.user_id !== user.id) {
              return [...prev, payload.new]
            }
            return prev
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('DELETE event received:', payload)
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id))
        }
      )
      .subscribe((status) => {
        console.log('Message subscription status:', status)
      })

    return () => {
      console.log('Removing message subscription')
      supabase.removeChannel(channel)
    }
  }, [user.id])

  // Subscribe to online users
  useEffect(() => {
    const channel = supabase
      .channel('online_users')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'online_users' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOnlineUsers(prev => [...prev, payload.new])
          } else if (payload.eventType === 'DELETE') {
            setOnlineUsers(prev => prev.filter(user => user.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // Add current user to online users only once
    const addUserToOnline = async () => {
      if (userAddedToOnline.current) return
      
      const { error } = await supabase
        .from('online_users')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email.split('@')[0],
          last_seen: new Date().toISOString()
        })
      
      if (error) {
        console.error('Error adding user to online list:', error)
      } else {
        userAddedToOnline.current = true
      }
    }

    addUserToOnline()

    // Remove user from online users when component unmounts
    return () => {
      supabase.removeChannel(channel)
      const removeUserFromOnline = async () => {
        await supabase
          .from('online_users')
          .delete()
          .eq('id', user.id)
        userAddedToOnline.current = false
      }
      removeUserFromOnline()
    }
  }, [user])

  // Load initial messages
  useEffect(() => {
    if (!isInitialized) return

    const loadMessages = async () => {
      console.log('Loading initial messages...')
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Error loading messages:', error)
      } else {
        console.log('Loaded messages:', data?.length || 0, 'messages')
        setMessages(data || [])
      }
    }

    loadMessages()
  }, [isInitialized])

  // Load initial online users
  useEffect(() => {
    const loadOnlineUsers = async () => {
      const { data, error } = await supabase
        .from('online_users')
        .select('*')
        .order('last_seen', { ascending: false })
      
      if (error) {
        console.error('Error loading online users:', error)
      } else {
        setOnlineUsers(data || [])
      }
    }

    loadOnlineUsers()
  }, [])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const messageContent = newMessage.trim()
    const userName = user.user_metadata?.full_name || user.email.split('@')[0]
    
    // Create temporary message for immediate display
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      user_id: user.id,
      user_email: user.email,
      user_name: userName,
      message_type: 'text',
      created_at: new Date().toISOString(),
      isTemporary: true
    }

    // Add message to local state immediately
    setMessages(prev => [...prev, tempMessage])
    setNewMessage('')

    try {
      // Send to database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: messageContent,
          user_id: user.id,
          user_email: user.email,
          user_name: userName,
          message_type: 'text'
        })
        .select()
        .single()

      if (error) {
        console.error('Error sending message:', error)
        // Remove temporary message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      } else if (data) {
        // Replace temporary message with real message immediately
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id ? { ...data, isTemporary: false } : msg
          )
        )
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Remove temporary message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    const userName = user.user_metadata?.full_name || user.email.split('@')[0]
    
    // Create temporary message for immediate display
    const tempMessage = {
      id: `temp-image-${Date.now()}`,
      content: URL.createObjectURL(file), // Use local object URL for immediate display
      user_id: user.id,
      user_email: user.email,
      user_name: userName,
      message_type: 'image',
      created_at: new Date().toISOString(),
      isTemporary: true
    }

    // Add message to local state immediately
    setMessages(prev => [...prev, tempMessage])

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        // Remove temporary message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
        return
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName)

      // Send message with image
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: urlData.publicUrl,
          user_id: user.id,
          user_email: user.email,
          user_name: userName,
          message_type: 'image'
        })
        .select()
        .single()

      if (error) {
        console.error('Error sending image message:', error)
        // Remove temporary message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      } else if (data) {
        // Replace temporary message with real message immediately
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id ? { ...data, isTemporary: false } : msg
          )
        )
      }
    } catch (error) {
      console.error('Error processing image:', error)
      // Remove temporary message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
    }

    // Reset file input
    e.target.value = ''
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const handleLongPressStart = (message) => {
    // Allow long press for user-sent messages (for delete) or any image messages (for download)
    if (message.user_id !== user.id && message.message_type !== 'image') return
    
    const timer = setTimeout(() => {
      setDeleteModal({ isOpen: true, message })
    }, 500) // 500ms long press
    setLongPressTimer(timer)
  }

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }


  const handleDeleteMessage = async () => {
    if (!deleteModal.message) return

    console.log('Attempting to delete message:', deleteModal.message.id)
    console.log('Current user:', user)
    console.log('User ID:', user.id)

    try {
      // Check if user is authenticated
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      console.log('Current authenticated user:', currentUser)
      console.log('Auth error:', authError)

      if (authError || !currentUser) {
        console.error('User not authenticated:', authError)
        alert('You must be logged in to delete messages')
        return
      }

      // First, let's check if we can read the message before deleting
      const { data: messageData, error: readError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', deleteModal.message.id)
        .single()
      
      console.log('Message data before deletion:', messageData)
      console.log('Read error:', readError)

      if (readError) {
        console.error('Cannot read message:', readError)
        alert('Cannot access this message')
        return
      }

      // Delete message from Supabase database
      const { error, data } = await supabase
        .from('messages')
        .delete()
        .eq('id', deleteModal.message.id)
        .select()

      console.log('Delete operation result:', { error, data })

      if (error) {
        console.error('Error deleting message from database:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        
        // Try alternative delete approach
        console.log('Trying alternative delete approach...')
        const { error: altError, data: altData } = await supabase
          .from('messages')
          .delete()
          .eq('id', deleteModal.message.id)
        
        if (altError) {
          console.error('Alternative delete also failed:', altError)
          alert(`Failed to delete message: ${error.message}`)
          return
        } else {
          console.log('Alternative delete succeeded:', altData)
        }
      } else {
        console.log('Message deleted successfully from database:', data)
      }
      
      // Verify deletion by checking if message still exists
      const { data: verifyData, error: verifyError } = await supabase
        .from('messages')
        .select('id')
        .eq('id', deleteModal.message.id)
        .single()
      
      if (verifyError && verifyError.code === 'PGRST116') {
        console.log('Message successfully deleted from database (not found)')
      } else if (verifyData) {
        console.warn('Message still exists in database after deletion attempt')
        console.log('Remaining message data:', verifyData)
      }
      
      // Remove from local state immediately (don't wait for real-time subscription)
      setMessages(prev => prev.filter(msg => msg.id !== deleteModal.message.id))
    } catch (error) {
      console.error('Error deleting message:', error)
      alert('Failed to delete message')
    } finally {
      setDeleteModal({ isOpen: false, message: null })
    }
  }

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, message: null })
  }


  const handleDownloadImage = async (imageUrl, messageId) => {
    try {
      // Fetch the image to get the actual file
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch image')
      }
      
      const blob = await response.blob()
      
      // Determine file extension from content type or URL
      let extension = 'jpg'
      const contentType = response.headers.get('content-type')
      if (contentType) {
        if (contentType.includes('png')) extension = 'png'
        else if (contentType.includes('gif')) extension = 'gif'
        else if (contentType.includes('webp')) extension = 'webp'
      } else if (imageUrl.includes('.')) {
        const urlExtension = imageUrl.split('.').pop()?.toLowerCase()
        if (['png', 'gif', 'webp', 'jpeg'].includes(urlExtension)) {
          extension = urlExtension
        }
      }
      
      // Create blob URL and download
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `edu-share-image-${messageId}.${extension}`
      
      // Append to body, click, and clean up
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up blob URL
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Error downloading image:', error)
      alert('Failed to download image. Please try again.')
    }
  }

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Desktop only */}
      <div className={`hidden lg:block w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Users className="mr-2" size={20} />
              Online Users
            </h2>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {onlineUsers.map((onlineUser) => (
            <div
              key={onlineUser.id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {onlineUser.full_name?.charAt(0) || onlineUser.email?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {onlineUser.full_name || onlineUser.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Online
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsOnlineUsersModalOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <User size={20} />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edu Share Chat
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Message Deletion Hint */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
              💡 All messages are deleted after one week.
            </p>
          </div>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.user_id === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-lg select-none transition-all duration-200 ${
                  message.user_id === user.id
                    ? 'message-sent cursor-pointer hover:scale-105'
                    : message.message_type === 'image'
                    ? 'message-received cursor-pointer hover:scale-105'
                    : 'message-received'
                } ${message.isTemporary ? 'opacity-70' : ''}`}
                onMouseDown={() => handleLongPressStart(message)}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={() => handleLongPressStart(message)}
                onTouchEnd={handleLongPressEnd}
                onTouchCancel={handleLongPressEnd}
                title={
                  message.user_id === user.id 
                    ? "Long press to delete" 
                    : message.message_type === 'image'
                    ? "Long press to download"
                    : ""
                }
              >
                {message.message_type === 'image' ? (
                  <div>
                    <img
                      src={message.content}
                      alt="Shared image"
                      className="max-w-xs rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'block'
                      }}
                    />
                    <div style={{ display: 'none' }} className="text-sm">
                      Image failed to load
                    </div>
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                <div className="text-xs opacity-70 mt-1 flex items-center">
                  {message.user_name} • {formatTime(message.created_at)}
                  {message.isTemporary && (
                    <span className="ml-2 text-xs">Sending...</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ImageIcon size={20} />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 input-field"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Message
              </h3>
              <button
                onClick={cancelDelete}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {deleteModal.message?.message_type === 'image' 
                  ? deleteModal.message?.user_id === user.id
                    ? "Download or delete this image?"
                    : "Download this image?"
                  : "Are you sure delete this message?"
                }
              </p>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                {deleteModal.message?.message_type === 'image' && (
                  <p>• <strong>Download Image:</strong> Save the image to your device</p>
                )}
                {deleteModal.message?.user_id === user.id && (
                  <p>• <strong>Delete:</strong> Permanently removes this message from the database for all users</p>
                )}
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                {deleteModal.message?.message_type === 'image' ? (
                  <div className="flex items-center space-x-2">
                    <img
                      src={deleteModal.message.content}
                      alt="Message preview"
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Image message
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    "{deleteModal.message?.content}"
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {deleteModal.message?.message_type === 'image' && (
                <button
                  onClick={() => handleDownloadImage(deleteModal.message.content, deleteModal.message.id)}
                  className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download Image</span>
                </button>
              )}
              {deleteModal.message?.user_id === user.id ? (
                // User's own message - show delete option
                <div className="flex space-x-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteMessage}
                    className="flex-1 px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              ) : (
                // Other user's message - show only cancel
                <div className="flex space-x-3">
                  <button
                    onClick={cancelDelete}
                    className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Online Users Modal - Mobile only */}
      {isOnlineUsersModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 lg:hidden">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-sm w-full mx-4 max-h-96 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Users className="mr-2" size={20} />
                  Online Users
                </h3>
                <button
                  onClick={() => setIsOnlineUsersModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-2 overflow-y-auto flex-1">
              {onlineUsers.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No users online
                </p>
              ) : (
                onlineUsers.map((onlineUser) => (
                  <div
                    key={onlineUser.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {onlineUser.full_name?.charAt(0) || onlineUser.email?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {onlineUser.full_name || onlineUser.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Online
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat
