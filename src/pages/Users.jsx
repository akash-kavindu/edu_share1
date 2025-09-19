import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Users, 
  RefreshCw, 
  Eye, 
  Mail, 
  Calendar, 
  Clock, 
  Globe, 
  MessageCircle, 
  FileText, 
  X,
  User as UserIcon,
  Phone,
  ExternalLink
} from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useOnlineUsers } from '../hooks/useOnlineUsers'

const UsersPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { onlineUsers, refreshOnlineUsers } = useOnlineUsers(user?.id)
  const [allUsers, setAllUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [userStats, setUserStats] = useState({})

  // Load all users
  const loadUsers = async () => {
    try {
      setIsRefreshing(true)
      
      // Get all users from messages and papers to create a comprehensive list
      const [messageResult, paperResult] = await Promise.all([
        supabase
          .from('messages')
          .select('user_id, user_email, user_name, created_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('papers')
          .select('uploaded_by, uploaded_by_name, uploaded_by_email, created_at')
          .order('created_at', { ascending: false })
      ])

      const messageUsers = messageResult.data || []
      const paperUsers = paperResult.data || []

      // Create a comprehensive users map
      const usersMap = new Map()
      
      // Add users from messages
      messageUsers.forEach(msg => {
        if (!usersMap.has(msg.user_id)) {
          usersMap.set(msg.user_id, {
            id: msg.user_id,
            email: msg.user_email,
            name: msg.user_name,
            full_name: msg.user_name,
            phone: '',
            bio: '',
            location: '',
            website: '',
            created_at: msg.created_at,
            last_message: msg.created_at,
            last_activity: msg.created_at,
            has_messages: true,
            has_papers: false
          })
        } else {
          const user = usersMap.get(msg.user_id)
          if (new Date(msg.created_at) > new Date(user.last_activity)) {
            user.last_activity = msg.created_at
            user.last_message = msg.created_at
          }
        }
      })

      // Add users from papers
      paperUsers.forEach(paper => {
        if (!usersMap.has(paper.uploaded_by)) {
          usersMap.set(paper.uploaded_by, {
            id: paper.uploaded_by,
            email: paper.uploaded_by_email,
            name: paper.uploaded_by_name,
            full_name: paper.uploaded_by_name,
            phone: '',
            bio: '',
            location: '',
            website: '',
            created_at: paper.created_at,
            last_activity: paper.created_at,
            has_messages: false,
            has_papers: true
          })
        } else {
          const user = usersMap.get(paper.uploaded_by)
          user.has_papers = true
          if (new Date(paper.created_at) > new Date(user.last_activity)) {
            user.last_activity = paper.created_at
          }
        }
      })

      // Convert map to array and sort by last activity
      const allUsers = Array.from(usersMap.values())
        .sort((a, b) => new Date(b.last_activity) - new Date(a.last_activity))

      console.log('Loaded users:', allUsers.length, 'from messages and papers')
      
      setAllUsers(allUsers)
      
      // Refresh online users
      await refreshOnlineUsers()
    } catch (error) {
      console.error('Error loading users:', error)
      // Fallback to message users only
      await loadUsersFromMessages()
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Fallback method to load users from messages
  const loadUsersFromMessages = async () => {
    try {
      const { data: messageUsers, error: messageError } = await supabase
        .from('messages')
        .select('user_id, user_email, user_name, created_at')
        .order('created_at', { ascending: false })

      if (messageError) {
        console.error('Error loading message users:', messageError)
        return
      }

      // Create unique users list from messages
      const uniqueUsers = []
      const seenIds = new Set()
      
      if (messageUsers) {
        messageUsers.forEach(msg => {
          if (!seenIds.has(msg.user_id)) {
            seenIds.add(msg.user_id)
            uniqueUsers.push({
              id: msg.user_id,
              email: msg.user_email,
              name: msg.user_name,
              last_message: msg.created_at,
              full_name: msg.user_name,
              phone: '',
              bio: '',
              location: '',
              website: '',
              created_at: msg.created_at,
              last_activity: msg.created_at
            })
          }
        })
      }

      console.log('Loaded users (fallback):', uniqueUsers.length, 'from messages')
      setAllUsers(uniqueUsers)
    } catch (error) {
      console.error('Error in fallback user loading:', error)
    }
  }

  // Load user statistics
  const loadUserStats = async (userId) => {
    try {
      // Get messages count
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Get papers count
      const { count: papersCount } = await supabase
        .from('papers')
        .select('*', { count: 'exact', head: true })
        .eq('uploaded_by', userId)

      setUserStats(prev => ({
        ...prev,
        [userId]: {
          messagesCount: messagesCount || 0,
          papersCount: papersCount || 0
        }
      }))
    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }

  // View user profile
  const viewUserProfile = async (user) => {
    setSelectedUser(user)
    setShowProfileModal(true)
    await loadUserStats(user.id)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const isUserOnline = (userId) => {
    return onlineUsers.some(u => u.id === userId)
  }

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Never'
    const date = new Date(lastSeen)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>
            
            <button
              onClick={loadUsers}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            All Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View all users who have used the platform (sent messages or uploaded papers)
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allUsers.map((user) => {
              const isOnline = isUserOnline(user.id)
              const onlineUser = onlineUsers.find(u => u.id === user.id)
              
              return (
                <div
                  key={user.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-lg font-medium">
                        {user.name?.charAt(0) || user.email?.charAt(0)}
                      </div>
                      {/* Online indicator */}
                      {isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {user.name || user.email}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className={`text-xs ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                        {onlineUser?.last_seen && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            • {formatLastSeen(onlineUser.last_seen)}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => viewUserProfile(user)}
                      className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                    >
                      <Eye size={16} />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {allUsers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No users found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No users have used the platform yet (sent messages or uploaded papers).
            </p>
          </div>
        )}

        {/* User Profile Modal */}
        {showProfileModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <UserIcon className="w-6 h-6 mr-3 text-purple-600 dark:text-purple-400" />
                  User Profile
                </h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {selectedUser.name?.charAt(0) || selectedUser.email?.charAt(0)}
                    </div>
                    {isUserOnline(selectedUser.id) && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedUser.name || selectedUser.email}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedUser.email}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar size={16} />
                        <span>Joined {new Date(selectedUser.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={16} />
                        <span>
                          {isUserOnline(selectedUser.id) ? 'Online now' : 'Last seen: ' + formatLastSeen(onlineUsers.find(u => u.id === selectedUser.id)?.last_seen)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Statistics */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                    <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {userStats[selectedUser.id]?.messagesCount || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Messages Sent</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                    <FileText className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {userStats[selectedUser.id]?.papersCount || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Papers Uploaded</div>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Email</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Member Since</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(selectedUser.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {selectedUser.location && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Globe className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">Location</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.location}</div>
                        </div>
                      </div>
                    )}

                    {selectedUser.website && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <ExternalLink className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">Website</div>
                          <a 
                            href={selectedUser.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {selectedUser.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedUser.bio && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Bio</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.bio}</div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // Navigate to chat and mention the user
                      navigate('/chat')
                      setShowProfileModal(false)
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default UsersPage
