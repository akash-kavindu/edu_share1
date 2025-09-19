import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../utils/supabase'
import { setupPapersTable } from '../utils/setupPapersTable'
import { 
  ArrowLeft, 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  Calendar,
  User,
  Search,
  Filter,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const PapersPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [papers, setPapers] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState('all') // all, mine, shared
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, paper: null })
  const fileInputRef = useRef(null)

  // Load papers on component mount
  useEffect(() => {
    loadPapers()
  }, [])

  // Initialize database table
  useEffect(() => {
    const initializeDatabase = async () => {
      await setupPapersTable()
    }

    initializeDatabase()
  }, [])

  const loadPapers = async () => {
    try {
      const { data, error } = await supabase
        .from('papers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading papers:', error)
        return
      }

      setPapers(data || [])
    } catch (error) {
      console.error('Error loading papers:', error)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file')
      return
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // First, try to create the bucket if it doesn't exist
      const { error: bucketError } = await supabase.storage.createBucket('papers', {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      })

      if (bucketError && bucketError.message !== 'Bucket already exists') {
        console.log('Bucket creation error (might already exist):', bucketError)
      }

      // Upload to Supabase Storage with a simple filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}_${Date.now()}.${fileExt}`
      
      console.log('Uploading file:', fileName)
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('papers')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Error uploading file:', uploadError)
        console.error('Upload error details:', uploadError)
        alert(`Failed to upload file: ${uploadError.message}`)
        return
      }

      console.log('File uploaded successfully:', uploadData)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('papers')
        .getPublicUrl(fileName)

      console.log('Public URL:', urlData.publicUrl)

      // Save paper info to database
      const { data, error } = await supabase
        .from('papers')
        .insert({
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          file_name: fileName,
          file_url: urlData.publicUrl,
          file_size: file.size,
          uploaded_by: user.id,
          uploaded_by_name: user.user_metadata?.full_name || user.email.split('@')[0],
          uploaded_by_email: user.email
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving paper info:', error)
        alert('Failed to save paper information. Please try again.')
        return
      }

      console.log('Paper saved to database:', data)

      // Add to local state
      setPapers(prev => [data, ...prev])
      setShowUploadModal(false)
      setUploadProgress(0)
      
    } catch (error) {
      console.error('Error uploading paper:', error)
      alert('Failed to upload paper. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = async (paper) => {
    try {
      const response = await fetch(paper.file_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = paper.title + '.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Failed to download file. Please try again.')
    }
  }

  const handleDelete = async (paper) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('papers')
        .remove([paper.file_name])

      if (storageError) {
        console.error('Error deleting file from storage:', storageError)
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('papers')
        .delete()
        .eq('id', paper.id)

      if (dbError) {
        console.error('Error deleting paper from database:', dbError)
        alert('Failed to delete paper. Please try again.')
        return
      }

      // Remove from local state
      setPapers(prev => prev.filter(p => p.id !== paper.id))
      setDeleteModal({ isOpen: false, paper: null })
      
    } catch (error) {
      console.error('Error deleting paper:', error)
      alert('Failed to delete paper. Please try again.')
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter papers based on search and filter criteria
  const filteredPapers = papers.filter(paper => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paper.uploaded_by_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'mine' && paper.uploaded_by === user.id) ||
                         (filterBy === 'shared' && paper.uploaded_by !== user.id)
    
    return matchesSearch && matchesFilter
  })

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
            
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Papers
            </h1>
            
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload size={20} />
              <span className="hidden sm:inline">Upload PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search papers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Papers</option>
            <option value="mine">My Papers</option>
            <option value="shared">Shared Papers</option>
          </select>
        </div>

        {/* Papers Grid */}
        {filteredPapers.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm || filterBy !== 'all' ? 'No papers found' : 'No papers uploaded yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm || filterBy !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Upload your first PDF document to get started'
              }
            </p>
            {!searchTerm && filterBy === 'all' && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload size={20} />
                <span>Upload PDF</span>
              </button>
            )}
          </div>
        ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredPapers.map((paper) => (
                 <div key={paper.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                   <div className="mb-4">
                     <div className="flex items-start justify-between mb-3">
                       <div className="flex items-center space-x-3 flex-1 min-w-0">
                         <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                           <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <h3 className="text-lg font-medium text-gray-900 dark:text-white break-words leading-tight">
                             {paper.title}
                           </h3>
                           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                             {formatFileSize(paper.file_size)}
                           </p>
                         </div>
                       </div>
                       
                       <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                         <button
                           onClick={() => handleDownload(paper)}
                           className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                           title="Download"
                         >
                           <Download size={18} />
                         </button>
                         {paper.uploaded_by === user.id && (
                           <button
                             onClick={() => setDeleteModal({ isOpen: true, paper })}
                             className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                             title="Delete"
                           >
                             <Trash2 size={18} />
                           </button>
                         )}
                       </div>
                     </div>
                   </div>
                   
                   <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                     <div className="flex items-center space-x-2">
                       <User size={16} />
                       <span className="truncate">{paper.uploaded_by_name}</span>
                     </div>
                     <div className="flex items-center space-x-2">
                       <Calendar size={16} />
                       <span>{formatDate(paper.created_at)}</span>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upload PDF
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Click to select a PDF file or drag and drop
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? 'Uploading...' : 'Select File'}
                </button>
              </div>
              
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Paper
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{deleteModal.paper?.title}"? This will permanently remove the file.
            </p>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, paper: null })}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.paper)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PapersPage
