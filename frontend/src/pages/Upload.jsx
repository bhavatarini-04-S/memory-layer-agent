import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fileAPI, getUser } from "../services/api";
import Navbar from "../components/Navbar";
import VoiceAssistant from "../components/VoiceAssistant";

function Upload() {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one file!");
      return;
    }

    // Confirmation before upload
    const confirmed = window.confirm(
      `You are about to upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}. Do you want to proceed?`
    );
    
    if (!confirmed) {
      return;
    }

    setUploading(true);
    const status = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fileAPI.upload(formData);
        console.log('Upload response:', response.data);
        status.push({ name: file.name, success: true });
      } catch (error) {
        console.error('Upload error for', file.name, ':', error);
        console.error('Error response:', error.response);
        status.push({ name: file.name, success: false, error: error.response?.data?.detail || error.message });
      }
    }

    setUploadStatus(status);
    setUploading(false);
    setSelectedFiles([]);
    
    // Show success message and redirect to file details
    const successCount = status.filter(s => s.success).length;
    if (successCount > 0) {
      setTimeout(() => {
        alert(`Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}! Redirecting to file details...`);
        navigate('/file-details');
      }, 1000);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleVoiceCommand = (command) => {
    console.log('Voice command received:', command);
    // Handle different command types
    if (command.type === 'upload') {
      // Trigger file input click
      document.getElementById('fileInput')?.click();
    }
  };

  // All supported file formats matching backend capability
  const acceptedFileTypes = ".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.json,.xml,.png,.jpg,.jpeg";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Upload Files</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Upload your documents, spreadsheets, emails, and files. Our AI will analyze
            and make them searchable.
          </p>

          {/* Upload Area */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <div className="border-4 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Choose Files or Drag & Drop
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Supports: PDF, DOC, DOCX, TXT, CSV, XLSX, XLS, JSON, XML, PNG, JPG, JPEG
              </p>
              <input
                type="file"
                multiple
                accept={acceptedFileTypes}
                onChange={handleFileChange}
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition"
              >
                Select Files
              </label>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="mt-8">
                <h4 className="font-semibold text-lg mb-4">
                  Selected Files ({selectedFiles.length})
                </h4>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">📄</span>
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className={`mt-6 w-full py-3 rounded-lg text-white font-semibold transition ${
                    uploading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {uploading ? "Uploading..." : "Upload All Files"}
                </button>
              </div>
            )}
          </div>

          {/* Upload Status */}
          {uploadStatus.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h4 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Upload Results</h4>
              <div className="space-y-2">
                {uploadStatus.map((status, index) => (
                  <div
                    key={index}
                    className={`flex flex-col p-4 rounded-lg ${
                      status.success 
                        ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" 
                        : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {status.success ? "✅" : "❌"}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">{status.name}</span>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          status.success 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {status.success ? "Uploaded" : "Failed"}
                      </span>
                    </div>
                    {!status.success && status.error && (
                      <div className="mt-2 ml-10 text-sm text-red-600 dark:text-red-400">
                        Error: {status.error}
                      </div>
                    )}
                    {status.success && (
                      <div className="mt-2 ml-10 text-sm text-green-600 dark:text-green-400">
                        ✓ Processing in background...</div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                💡 Files are processed in the background. Check "My Files" to view results.
              </div>
            </div>
          )}

          {/* Voice Assistant */}
          <div className="mt-8">
            <VoiceAssistant onCommand={handleVoiceCommand} />
          </div>

          {/* Supported File Types */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h4 className="font-semibold text-lg mb-3 text-blue-900">
              Supported File Types:
            </h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-semibold mb-2">Documents:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>PDF (.pdf)</li>
                  <li>Microsoft Word (.doc, .docx)</li>
                  <li>Text Files (.txt)</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">Data Files:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>CSV (.csv)</li>
                  <li>Excel (.xlsx, .xls)</li>
                  <li>JSON (.json)</li>
                  <li>XML (.xml)</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">Images (OCR):</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>PNG (.png)</li>
                  <li>JPEG (.jpg, .jpeg)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;
