import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { 
  MessageSquare, 
  FileText, 
  Users, 
  User, 
  Calendar, 
  Shield, 
  Bell, 
  HelpCircle,
  Sun,
  Moon,
  LogOut
} from 'lucide-react'

const Dashboard = () => {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()


  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const features = [
    {
      id: 'chat',
      title: 'Chat Box',
      subtitle: 'Group Chat',
      icon: MessageSquare,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      onClick: () => navigate('/chat')
    },
    {
      id: 'papers',
      title: 'Papers',
      subtitle: 'Document Management',
      icon: FileText,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      onClick: () => navigate('/papers')
    },
    {
      id: 'users',
      title: 'Users',
      subtitle: 'All logged users',
      icon: Users,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      onClick: () => navigate('/users')
    },
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'Profile management',
      icon: User,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      onClick: () => navigate('/profile')
    },
    {
      id: 'calendar',
      title: 'Calendar',
      subtitle: 'Schedule Events',
      icon: Calendar,
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      onClick: () => navigate('/calendar')
    },
    {
      id: 'security',
      title: 'Security',
      subtitle: 'Privacy & Security',
      icon: Shield,
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      onClick: () => navigate('/security')
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Alert Center',
      icon: Bell,
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      onClick: () => navigate('/notifications')
    },
    {
      id: 'help',
      title: 'Help',
      subtitle: 'Support Center',
      icon: HelpCircle,
      color: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600',
      onClick: () => navigate('/help')
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {/* Logo and Title */}
              <div className="flex items-center space-x-2">
                {/* Logo */}
                <img
                  src={isDark ? "/Edu-dark.svg" : "/Edu-light.svg"}
                  alt="Edu Share Logo"
                  className="h-8 w-8 sm:h-10 sm:w-10 transition-opacity duration-200"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                {/* Fallback text logo */}
                <div 
                  className="hidden items-center justify-center h-8 w-8 sm:h-10 sm:w-10 bg-blue-600 text-white rounded-lg font-bold text-sm sm:text-base"
                  style={{ display: 'none' }}
                >
                  E
                </div>
                
                {/* Title - Hidden on small screens, shown on larger screens */}
                <h1 className="hidden sm:block text-2xl font-bold text-gray-900 dark:text-white">
                  Edu Share
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-transparent border border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                title="Sign Out"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Edu Share
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Choose a feature to get started with your educational journey
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature) => {
            const IconComponent = feature.icon
            return (
              <div
                key={feature.id}
                onClick={feature.onClick}
                className="group cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-all duration-200 hover:scale-105"
              >
                <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 ${feature.color} ${feature.hoverColor} rounded-xl flex items-center justify-center transition-colors duration-200 group-hover:scale-110`}>
                    <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {feature.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
