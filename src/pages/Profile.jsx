import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { supabase } from '../utils/supabase'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Settings, 
  Edit3, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  FileText,
  Clock,
  Globe,
  Lock,
  Bell,
  Palette
} from 'lucide-react'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  
  // State for profile editing
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Form states
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: ''
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // User statistics
  const [userStats, setUserStats] = useState({
    messagesCount: 0,
    papersCount: 0,
    joinDate: '',
    lastActive: ''
  })
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load user data and statistics
  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        bio: user.user_metadata?.bio || '',
        location: user.user_metadata?.location || '',
        website: user.user_metadata?.website || ''
      })
      
      loadUserStats()
    }
  }, [user])

  const loadUserStats = async () => {
    try {
      // Get messages count
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Get papers count
      const { count: papersCount } = await supabase
        .from('papers')
        .select('*', { count: 'exact', head: true })
        .eq('uploaded_by', user.id)

      // Get last active from online_users
      const { data: onlineData } = await supabase
        .from('online_users')
        .select('last_seen')
        .eq('user_id', user.id)
        .single()

      setUserStats({
        messagesCount: messagesCount || 0,
        papersCount: papersCount || 0,
        joinDate: new Date(user.created_at).toLocaleDateString(),
        lastActive: onlineData?.last_seen ? new Date(onlineData.last_seen).toLocaleString() : 'Never'
      })
    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.full_name,
          phone: profileData.phone,
          bio: profileData.bio,
          location: profileData.location,
          website: profileData.website
        }
      })

      if (error) throw error

      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.message)
      setTimeout(() => setError(''), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setSuccess('Password updated successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setIsEditingPassword(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.message)
      setTimeout(() => setError(''), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
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
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Toggle theme"
              >
                <Palette size={20} />
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {profileData.full_name || 'No Name Set'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{profileData.email}</p>
              {profileData.bio && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-md mx-auto md:mx-0">
                  {profileData.bio}
                </p>
              )}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400">
                {profileData.location && (
                  <div className="flex items-center space-x-1">
                    <Globe size={16} />
                    <span>{profileData.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>Joined {userStats.joinDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={16} />
                  <span>Last active: {userStats.lastActive}</span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 size={20} />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-green-800 dark:text-green-200">{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <User className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" />
                Basic Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={profileData.full_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="City, Country"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={profileData.website}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Save size={20} />
                    <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-gray-700 dark:text-gray-300">Messages Sent</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{userStats.messagesCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-gray-700 dark:text-gray-300">Papers Uploaded</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{userStats.papersCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-gray-700 dark:text-gray-300">Member Since</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{userStats.joinDate}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/chat')}
                  className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span>Go to Chat</span>
                </button>
                <button
                  onClick={() => navigate('/papers')}
                  className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span>Manage Papers</span>
                </button>
                <button
                  onClick={() => navigate('/users')}
                  className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>View Users</span>
                </button>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Toggle theme appearance</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isDark ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDark ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProfilePage
