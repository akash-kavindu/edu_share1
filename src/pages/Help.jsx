import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  HelpCircle, 
  MessageCircle, 
  FileText, 
  Users, 
  User, 
  Calendar, 
  Shield, 
  Bell, 
  Mail,
  Phone,
  Globe,
  Download,
  Upload,
  Search,
  Filter,
  Settings
} from 'lucide-react'

const HelpPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How to Use Edu Share
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Complete guide to using our educational platform
          </p>
        </div>

        {/* Quick Start Guide */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Settings className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" />
            Quick Start Guide
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Login</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Sign in with your email and password to access the platform</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Explore Dashboard</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Navigate through different features using the dashboard cards</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Start Chatting</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Join group discussions and share knowledge with other users</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Upload Papers</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Share PDF documents and access shared educational materials</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">5</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Connect with Users</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">View online users and build your learning network</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">6</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Customize Settings</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Adjust theme, notifications, and privacy settings</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Guides */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Chat Box Guide */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Chat Box</h3>
            </div>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Send text messages and images in real-time</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>View online users in the sidebar</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Long press messages to delete or download images</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Use the refresh button to sync messages</span>
              </li>
            </ul>
          </div>

          {/* Papers Guide */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Papers</h3>
            </div>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>Upload PDF files up to 10MB</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>Search and filter papers by name or uploader</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>Download shared documents</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>Delete your own uploaded papers</span>
              </li>
            </ul>
          </div>

          {/* Users Guide */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Users</h3>
            </div>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>View all registered users</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>See who's currently online (green dot indicator)</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>Check last seen timestamps</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>Refresh to update user status</span>
              </li>
            </ul>
          </div>

          {/* Profile Guide */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h3>
            </div>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                <span>Manage your account information</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                <span>Update profile picture and details</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                <span>Change password and security settings</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                <span>View your activity and statistics</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Mail className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" />
            Need More Help?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            If you're still experiencing issues or have questions, don't hesitate to contact our support team.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Support</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Primary Support</p>
                    <a 
                      href="mailto:Uvaktrading@gmail.com" 
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Uvaktrading@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Secondary Support</p>
                    <a 
                      href="mailto:savidyawimalasuriya08@gmail.com" 
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      savidyawimalasuriya08@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Response Time</h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span>General inquiries: 24-48 hours</span>
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  <span>Technical issues: 12-24 hours</span>
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  <span>Urgent problems: 2-6 hours</span>
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Tip:</strong> When contacting support, please include your username, the specific issue you're experiencing, 
              and any error messages you see. This helps us resolve your problem faster!
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HelpPage
