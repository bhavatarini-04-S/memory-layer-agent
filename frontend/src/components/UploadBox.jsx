import { useState, useCallback } from 'react';
import { fileAPI } from '../services/api';

function UploadBox({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Updated to match backend supported formats
  const allowedTypes = ['pdf', 'docx', 'doc', 'txt', 'csv', 'xlsx', 'xls', 'json', 'xml', 'png', 'jpg', 'jpeg'];

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(ext)) {
      alert(`File type .${ext} not supported. Allowed: ${allowedTypes.join(', ')}`);
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('File too large. Maximum size is 50MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      await fileAPI.upload(formData);
      
      // Show success message
      alert('File uploaded successfully! Processing in background...');
      
      // Reset state
      setSelectedFile(null);
      
      // Notify parent
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.detail || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        className={`
          border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
          ${isDragging ? 'border-primary bg-indigo-50 scale-105' : 'border-gray-300 bg-white'}
          ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-primary hover:bg-gray-50'}
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!selectedFile ? (
          <>
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-textPrimary mb-2">
              Drop files here or click to browse
            </h3>
            <p className="text-textSecondary mb-4">
              Supports: PDF, DOCX, DOC, TXT, CSV (Max 50MB)
            </p>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt,.csv"
              onChange={handleFileInputChange}
              className="hidden"
              id="file-input"
              disabled={isUploading}
            />
            <label htmlFor="file-input" className="btn-primary cursor-pointer inline-block">
              Select File
            </label>
          </>
        ) : (
          <div className="space-y-4">
            <div className="text-5xl">
              {selectedFile.type.includes('pdf') ? '📄' : 
               selectedFile.type.includes('word') ? '📝' :
               selectedFile.type.includes('csv') ? '📊' : '📃'}
            </div>
            <div>
              <h4 className="font-semibold text-textPrimary text-lg mb-1">
                {selectedFile.name}
              </h4>
              <p className="text-textSecondary text-sm">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <div className="flex justify-center space-x-3">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Upload File'}
              </button>
              <button
                onClick={() => setSelectedFile(null)}
                disabled={isUploading}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="mt-4 flex items-center justify-center space-x-2 text-primary">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="font-medium">Processing file...</span>
        </div>
      )}
    </div>
  );
}

export default UploadBox;
