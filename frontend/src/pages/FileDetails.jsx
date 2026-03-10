import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fileAPI } from "../services/api";
import Navbar from "../components/Navbar";

function FileDetails() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fileAPI.list();
      setFiles(response.data.files);
      setError(null);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to load files. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (fileId) => {
    try {
      setLoadingContent(true);
      const response = await fileAPI.getDetails(fileId);
      setFileContent(response.data);
    } catch (err) {
      console.error("Error fetching file content:", err);
      setFileContent(null);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    // Load content for all files, including failed ones (to show diagnostic info)
    fetchFileContent(file.id);
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      await fileAPI.delete(fileId);
      setFiles(files.filter((f) => f.id !== fileId));
      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
        setFileContent(null);
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("Failed to delete file. Please try again.");
    }
  };

  const getStatusBadge = (processed) => {
    const statuses = {
      0: { label: "Processing", color: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200" },
      1: { label: "Completed", color: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" },
      2: { label: "Failed", color: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200" },
    };
    const status = statuses[processed] || statuses[0];
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}
      >
        {status.label}
      </span>
    );
  };

  const getFileIcon = (fileType) => {
    const icons = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      txt: "📃",
      csv: "📊",
      xlsx: "📊",
      xls: "📊",
      json: "🔧",
      xml: "🔧",
    };
    return icons[fileType.toLowerCase()] || "📁";
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-6 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading your files...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Your Uploaded Files
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                View extracted content and details from your documents
              </p>
            </div>
            <button
              onClick={() => navigate("/upload")}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-semibold"
            >
              + Upload More Files
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {files.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Files Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Upload your first file to get started with AI-powered document
              analysis
            </p>
            <button
              onClick={() => navigate("/upload")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Upload Your First File
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* File List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  All Files ({files.length})
                </h2>
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => handleFileSelect(file)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                        selectedFile?.id === file.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-indigo-300 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <span className="text-2xl">
                            {getFileIcon(file.file_type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 text-sm truncate">
                              {file.filename}
                            </h3>
                            <div className="flex items-center flex-wrap gap-2 mt-1 text-xs text-gray-500">
                              <span>{formatFileSize(file.file_size)}</span>
                              <span>•</span>
                              <span className="uppercase">
                                {file.file_type}
                              </span>
                            </div>
                            <div className="mt-2">
                              {getStatusBadge(file.processed)}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(file.id);
                          }}
                          className="text-red-500 hover:text-red-700 p-1 text-sm"
                          title="Delete file"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Display Area */}
            <div className="lg:col-span-2">
              {selectedFile ? (
                <div className="space-y-4">
                  {/* File Info Card */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <span className="text-5xl">
                          {getFileIcon(selectedFile.file_type)}
                        </span>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">
                            {selectedFile.filename}
                          </h2>
                          <div className="flex items-center space-x-3 mt-2 text-sm text-gray-500">
                            <span>{formatFileSize(selectedFile.file_size)}</span>
                            <span>•</span>
                            <span className="uppercase">{selectedFile.file_type}</span>
                            <span>•</span>
                            <span>{formatDate(selectedFile.upload_date)}</span>
                          </div>
                          <div className="mt-3">
                            {getStatusBadge(selectedFile.processed)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedFile.processed === 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800">
                          ⏳ Your file is being processed. This may take a few moments.
                          Refresh to see updates.
                        </p>
                      </div>
                    )}
                    {selectedFile.processed === 2 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 font-semibold mb-2">
                          ✗ Processing Failed
                        </p>
                        {selectedFile.error_message && (
                          <p className="text-red-700 text-sm">
                            {selectedFile.error_message}
                          </p>
                        )}
                        <button
                          onClick={() => navigate("/upload")}
                          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                        >
                          Try Uploading Again
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Extracted Content or Error Details */}
                  {selectedFile.processed === 1 ? (
                    <div className="space-y-4">
                      {/* Document Analysis Section */}
                      {loadingContent ? (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                          <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Analyzing file content...</p>
                          </div>
                        </div>
                      ) : fileContent && (fileContent.main_line || fileContent.key_points || fileContent.main_message) ? (
                        <>
                          {/* Analysis Results Card */}
                          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg shadow-lg p-6 border-2 border-indigo-200">
                            <div className="flex items-center mb-4">
                              <span className="text-3xl mr-3">🎯</span>
                              <h3 className="text-2xl font-bold text-indigo-900">
                                Document Analysis
                              </h3>
                            </div>
                            
                            {fileContent.main_message && (
                              <div className="mb-6 p-4 bg-white rounded-lg border-l-4 border-indigo-500 shadow-sm">
                                <p className="text-xs uppercase text-indigo-600 font-bold mb-2 flex items-center">
                                  <span className="text-lg mr-2">📋</span> Document Summary
                                </p>
                                <p className="text-gray-800 text-base leading-relaxed">
                                  {fileContent.main_message}
                                </p>
                              </div>
                            )}

                            {fileContent.main_line && (
                              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500 shadow-sm">
                                <p className="text-xs uppercase text-yellow-700 font-bold mb-2 flex items-center">
                                  <span className="text-lg mr-2">💡</span> Most Important Line
                                </p>
                                <p className="text-gray-800 font-medium text-base leading-relaxed italic">
                                  "{fileContent.main_line}"
                                </p>
                              </div>
                            )}

                            {fileContent.key_points && fileContent.key_points.length > 0 && (
                              <div className="p-5 bg-white rounded-lg shadow-sm">
                                <p className="text-xs uppercase text-indigo-600 font-bold mb-4 flex items-center">
                                  <span className="text-lg mr-2">🔑</span> Key Points
                                </p>
                                <ol className="space-y-3">
                                  {fileContent.key_points.map((point, index) => (
                                    <li key={index} className="flex items-start">
                                      <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 mt-0.5">
                                        {index + 1}
                                      </span>
                                      <p className="text-gray-800 text-base leading-relaxed pt-1">
                                        {point}
                                      </p>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}
                          </div>

                          {/* Full Content Section */}
                          <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                              <span className="text-2xl mr-2">📄</span>
                              Full Extracted Content
                            </h3>
                          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>ℹ️ About this content:</strong> This is the text
                              extracted and analyzed from your uploaded file. Our AI has processed
                              this content and made it searchable for intelligent queries.
                            </p>
                          </div>
                          
                          {fileContent.chunks && fileContent.chunks.length > 0 && (
                            <div className="mb-4 grid grid-cols-2 gap-4">
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                  Searchable Chunks
                                </p>
                                <p className="text-2xl font-bold text-gray-800">
                                  {fileContent.chunks.length}
                                </p>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                  Content Length
                                </p>
                                <p className="text-2xl font-bold text-gray-800">
                                  {fileContent.full_content.length.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50 max-h-[600px] overflow-y-auto">
                            <div className="prose prose-sm max-w-none">
                              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                                {fileContent.full_content}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </>
                      ) : fileContent ? (
                        /* If no analysis available, show regular content */
                        <div className="bg-white rounded-lg shadow-sm p-6">
                          <h3 className="text-xl font-bold text-gray-800 mb-4">
                            📄 Extracted Content
                          </h3>
                          <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50 max-h-[600px] overflow-y-auto">
                            <div className="prose prose-sm max-w-none">
                              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                                {fileContent.full_content}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-500">
                            Unable to load content. Please try again.
                          </p>
                          <button
                            onClick={() => fetchFileContent(selectedFile.id)}
                            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                          >
                            Retry
                          </button>
                        </div>
                      )}
                    </div>
                  ) : selectedFile.processed === 2 ? (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h3 className="text-xl font-bold text-red-600 mb-4">
                        ⚠️ Processing Error Details
                      </h3>
                      
                      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-4">
                        <h4 className="font-semibold text-red-800 mb-2">
                          Failed to Process File
                        </h4>
                        <p className="text-red-700">
                          {selectedFile.error_message || "An unknown error occurred during processing."}
                        </p>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-yellow-800 mb-2">
                          💡 Common Issues & Solutions:
                        </h4>
                        <ul className="text-sm text-yellow-800 space-y-2 ml-4 list-disc">
                          <li>
                            <strong>PDF Files:</strong> Ensure the PDF is not password-protected and contains extractable text (not just images)
                          </li>
                          <li>
                            <strong>Empty Files:</strong> Make sure your file contains actual content
                          </li>
                          <li>
                            <strong>Corrupted Files:</strong> Try re-creating or re-saving the file
                          </li>
                          <li>
                            <strong>Large Files:</strong> Very large files might timeout during processing
                          </li>
                        </ul>
                      </div>

                      {loadingContent ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Checking file details...</p>
                        </div>
                      ) : fileContent && fileContent.full_content ? (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">
                            Diagnostic Information:
                          </h4>
                          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-[300px] overflow-y-auto">
                            <pre className="whitespace-pre-wrap font-mono text-xs text-gray-700">
                              {fileContent.full_content}
                            </pre>
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => {
                            handleDelete(selectedFile.id);
                            navigate("/upload");
                          }}
                          className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                        >
                          Delete & Upload New File
                        </button>
                        <button
                          onClick={() => fetchFileContent(selectedFile.id)}
                          className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                        >
                          Retry Analysis
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Action Buttons */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => navigate("/chat")}
                        className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                      >
                        🔍 Search in Files
                      </button>
                      <button
                        onClick={() => navigate("/dashboard")}
                        className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                      >
                        📊 Go to Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                  <div className="text-6xl mb-4">👈</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Select a File
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    Click on any file from the list to view its extracted content,
                    analysis, and important details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileDetails;
