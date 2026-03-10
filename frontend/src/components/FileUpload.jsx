import { useState } from "react";
import { uploadFile } from "../services/api";

function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      await uploadFile(formData);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        onChange={handleUpload}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-lg file:border-0
          file:text-sm file:font-semibold
          file:bg-indigo-50 file:text-indigo-700
          hover:file:bg-indigo-100
          file:cursor-pointer cursor-pointer"
        disabled={uploading}
      />
      {uploading && (
        <p className="text-sm text-gray-600">Uploading...</p>
      )}
      {uploadSuccess && (
        <p className="text-sm text-green-600">✅ File uploaded successfully!</p>
      )}
    </div>
  );
}

export default FileUpload;