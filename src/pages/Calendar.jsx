import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar } from 'lucide-react'

const CalendarPage = () => {
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Calendar
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Schedule Events
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Coming Soon
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300">
              This feature is currently under development. Check back later for calendar and scheduling capabilities.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CalendarPage
