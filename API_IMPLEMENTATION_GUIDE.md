# API Implementation Guide for InboxAI

## 📖 Overview

This guide shows you how the API is implemented and how to use it in your InboxAI application.

## 🏗️ Architecture

```
Frontend (React)
    ↓ HTTP Requests
api.js (Axios Client)
    ↓ REST API Calls
Backend (FastAPI)
    ↓ Database & AI
SQLite + ChromaDB + OpenAI
```

---

## 🔌 Backend API Endpoints

### 1. Authentication API (`/api/auth`)

#### **POST /api/auth/signup**

Create a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:** `201 Created`

```json
{
  "id": 1,
  "email": "user@example.com",
  "phone": "+1234567890",
  "name": "John Doe",
  "created_at": "2026-03-09T12:00:00"
}
```

**Backend Implementation:** [`backend/routes/auth_routes.py`](backend/routes/auth_routes.py#L17)

---

#### **POST /api/auth/login**

Authenticate and get JWT token.

**Request Body:**

```json
{
  "email_or_phone": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Backend Implementation:** [`backend/routes/auth_routes.py`](backend/routes/auth_routes.py#L47)

---

#### **GET /api/auth/me**

Get current authenticated user info.

**Headers Required:**

```
Authorization: Bearer <your_jwt_token>
```

**Response:** `200 OK`

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Backend Implementation:** [`backend/routes/auth_routes.py`](backend/routes/auth_routes.py#L105)

---

### 2. File Upload API (`/api/files`)

#### **POST /api/files/upload**

Upload a document for processing.

**Headers Required:**

```
Authorization: Bearer <your_jwt_token>/b 
Content-Type: multipart/form-data
```

**Request Body:** (Form Data)

- `file`: The file to upload (PDF, DOCX, CSV, or TXT)

**Response:** `201 Created`

```json
{
  "file_id": 1,
  "filename": "document.pdf",
  "status": "pending",
  "message": "File uploaded successfully and queued for processing"
}
```

**What Happens Next:**

1. File is saved to `storage/uploads/`
2. Background task starts processing
3. Text is extracted from the file
4. Text is split into chunks
5. Each chunk is embedded using OpenAI
6. Embeddings are stored in ChromaDB
7. Status changes to "completed"

**Backend Implementation:** [`backend/routes/file_routes.py`](backend/routes/file_routes.py#L65)

---

#### **GET /api/files/**

List all uploaded files for the current user.

**Headers Required:**

```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**

- `skip`: Number of items to skip (default: 0)
- `limit`: Max items to return (default: 50)

**Response:** `200 OK`

```json
{
  "files": [
    {
      "id": 1,
      "filename": "document.pdf",
      "file_type": "application/pdf",
      "file_size": 102400,
      "status": "completed",
      "total_chunks": 15,
      "created_at": "2026-03-09T12:00:00",
      "updated_at": "2026-03-09T12:01:30"
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 50
}
```

**Backend Implementation:** [`backend/routes/file_routes.py`](backend/routes/file_routes.py#L130)

---

#### **DELETE /api/files/{file_id}**

Delete an uploaded file and its embeddings.

**Headers Required:**

```
Authorization: Bearer <your_jwt_token>
```

**Response:** `200 OK`

```json
{
  "message": "File deleted successfully"
}
```

**Backend Implementation:** [`backend/routes/file_routes.py`](backend/routes/file_routes.py#L166)

---

### 3. Search API (`/api/search`)

#### **POST /api/search/**

Search across all user documents using natural language.

**Headers Required:**

```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**

```json
{
  "query": "meeting notes from last week",
  "limit": 10
}
```

**Response:** `200 OK`

```json
{
  "query": "meeting notes from last week",
  "results": [
    {
      "rank": 1,
      "content": "Weekly team meeting notes: Discussed Q1 goals...",
      "relevance_score": 92.5,
      "source": {
        "file_id": 1,
        "filename": "meeting_notes.docx",
        "chunk_index": 2
      },
      "metadata": {
        "file_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "upload_date": "2026-03-02T10:00:00"
      }
    }
  ],
  "total_results": 1,
  "execution_time": "0.45s"
}
```

**Backend Implementation:** [`backend/routes/search_routes.py`](backend/routes/search_routes.py#L15)

---

#### **GET /api/search/dashboard**

Get dashboard statistics and recent activity.

**Headers Required:**

```
Authorization: Bearer <your_jwt_token>
```

**Response:** `200 OK`

```json
{
  "total_files": 5,
  "total_searches": 23,
  "recent_searches": [
    {
      "query": "budget report",
      "results_count": 3,
      "timestamp": "2026-03-09T11:30:00"
    }
  ],
  "recent_uploads": [
    {
      "filename": "Q1_Report.pdf",
      "status": "completed",
      "upload_date": "2026-03-09T10:00:00"
    }
  ]
}
```

**Backend Implementation:** [`backend/routes/search_routes.py`](backend/routes/search_routes.py#L80)

---

## 💻 Frontend API Implementation

### How to Use the API in React Components

The frontend API client is already set up in [`frontend/src/services/api.js`](frontend/src/services/api.js).

#### Example 1: User Login

```jsx
import { authAPI, setAuthToken, setUser } from '../services/api';

function LoginPage() {
  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await authAPI.login({
        email_or_phone: email,
        password: password
      });
      
      // Save token and user info
      setAuthToken(response.data.access_token);
      setUser(response.data.user);
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Login failed:', error.response?.data?.detail);
    }
  };
  
  return <form onSubmit={handleLogin}>...</form>;
}
```

**Already Implemented:** [`frontend/src/pages/Login.jsx`](frontend/src/pages/Login.jsx#L20)

---

#### Example 2: File Upload

```jsx
import { fileAPI } from '../services/api';

function UploadPage() {
  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fileAPI.upload(formData);
      console.log('Upload successful:', response.data);
      
      // File is being processed in background
      // Check status with fileAPI.list()
      
    } catch (error) {
      console.error('Upload failed:', error.response?.data?.detail);
    }
  };
  
  return <UploadBox onUpload={handleUpload} />;
}
```

**Component Available:** [`frontend/src/components/UploadBox.jsx`](frontend/src/components/UploadBox.jsx)

---

#### Example 3: List Files with Status

```jsx
import { fileAPI } from '../services/api';
import { useEffect, useState } from 'react';

function FileList() {
  const [files, setFiles] = useState([]);
  
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fileAPI.list(0, 50);
        setFiles(response.data.files);
      } catch (error) {
        console.error('Failed to fetch files:', error);
      }
    };
    
    fetchFiles();
    
    // Poll every 5 seconds to check processing status
    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      {files.map(file => (
        <div key={file.id}>
          <h3>{file.filename}</h3>
          <span className={`badge-${file.status}`}>
            {file.status}
          </span>
          {file.status === 'completed' && (
            <p>Processed {file.total_chunks} chunks</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

#### Example 4: Semantic Search

```jsx
import { searchAPI } from '../services/api';
import SearchBar from '../components/SearchBar';
import ResultCard from '../components/ResultCard';

function SearchPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const handleSearch = async (query) => {
    setLoading(true);
    
    try {
      const response = await searchAPI.search({
        query: query,
        limit: 10
      });
      
      setResults(response.data.results);
      console.log(`Found ${response.data.total_results} results in ${response.data.execution_time}`);
      
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <SearchBar onSearch={handleSearch} loading={loading} />
      
      <div className="results">
        {results.map((result, index) => (
          <ResultCard key={index} result={result} />
        ))}
      </div>
    </div>
  );
}
```

**Components Available:**

- [`frontend/src/components/SearchBar.jsx`](frontend/src/components/SearchBar.jsx)
- [`frontend/src/components/ResultCard.jsx`](frontend/src/components/ResultCard.jsx)

---

#### Example 5: Get Dashboard Stats

```jsx
import { searchAPI } from '../services/api';
import { useEffect, useState } from 'react';

function Dashboard() {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await searchAPI.getDashboard();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    
    fetchStats();
  }, []);
  
  if (!stats) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stats">
        <div className="stat-card">
          <h3>{stats.total_files}</h3>
          <p>Files Uploaded</p>
        </div>
        <div className="stat-card">
          <h3>{stats.total_searches}</h3>
          <p>Searches Performed</p>
        </div>
      </div>
      
      <div className="recent-activity">
        <h2>Recent Searches</h2>
        {stats.recent_searches.map((search, index) => (
          <div key={index}>
            <p>{search.query}</p>
            <small>{search.results_count} results</small>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🧪 Testing the API

### Option 1: Interactive API Docs (Recommended)

1. Go to **<http://localhost:8000/docs>**
2. You'll see Swagger UI with all endpoints
3. Click "Try it out" on any endpoint
4. Fill in the parameters
5. Click "Execute" to test

**Authentication in Swagger:**

1. First, call `/api/auth/login` to get a token
2. Copy the `access_token` from the response
3. Click the "Authorize" button at the top
4. Enter: `Bearer <your_token>`
5. Now you can test protected endpoints

### Option 2: Using cURL

**Sign Up:**

```bash
curl -X POST "http://localhost:8000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "Password123",
    "name": "Test User"
  }'
```

**Login:**

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email_or_phone": "test@example.com",
    "password": "Password123"
  }'
```

**Upload File:**

```bash
curl -X POST "http://localhost:8000/api/files/upload" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@path/to/document.pdf"
```

**Search:**

```bash
curl -X POST "http://localhost:8000/api/search/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "project timeline",
    "limit": 5
  }'
```

### Option 3: Using Postman

1. Import the OpenAPI spec from <http://localhost:8000/openapi.json>
2. Set up an environment variable for the token
3. Test all endpoints interactively

---

## 🔐 Authentication Flow

### How JWT Authentication Works

1. **User Signs Up** → Server creates user and hashes password
2. **User Logs In** → Server validates credentials and generates JWT token
3. **Frontend Stores Token** → Token saved in localStorage
4. **API Calls Include Token** → Axios automatically adds `Authorization: Bearer <token>` header
5. **Backend Validates Token** → `get_current_user` dependency decodes and validates
6. **User Accesses Protected Resources** → All file and search operations require valid token

### The Token Flow in Code

**Backend - Token Generation:** [`backend/utils/auth.py`](backend/utils/auth.py)

```python
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

**Frontend - Token Storage:** [`frontend/src/services/api.js`](frontend/src/services/api.js#L66)

```javascript
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};
```

**Frontend - Auto Token Injection:** [`frontend/src/services/api.js`](frontend/src/services/api.js#L14)

```javascript
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

**Backend - Token Validation:** [`backend/routes/auth_routes.py`](backend/routes/auth_routes.py#L79)

```python
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_access_token(token)
    # ... validate and return user
```

---

## 📤 File Processing Flow

### Step-by-Step Process

1. **Upload Request** → `/api/files/upload`
   - File validation (type, size)
   - Save to disk
   - Create database record with status="pending"

2. **Background Processing** → `process_uploaded_file()`
   - Extract text using appropriate parser (PDF/DOCX/CSV/TXT)
   - Split text into chunks (1000 chars, 200 overlap)
   - Generate embeddings for each chunk using OpenAI
   - Store in ChromaDB with metadata
   - Update status to "completed"

3. **Frontend Polling**
   - Call `fileAPI.list()` every 5 seconds
   - Check if status changed from "pending" → "completed"
   - Display success message

### Backend Processing Code

**Main Upload Endpoint:** [`backend/routes/file_routes.py`](backend/routes/file_routes.py#L65-L120)

**Background Task:** [`backend/routes/file_routes.py`](backend/routes/file_routes.py#L18-L63)

**Document Parser:** [`backend/services/document_parser.py`](backend/services/document_parser.py)

**AI Service:** [`backend/services/ai_service.py`](backend/services/ai_service.py)

---

## 🔍 Search Implementation

### How Semantic Search Works

1. **User Enters Query** → "meeting notes from last week"

2. **Generate Query Embedding** → OpenAI API

   ```python
   query_embedding = embedding_service.generate_embedding(query)
   # Returns a 1536-dimension vector
   ```

3. **Search Vector Database** → ChromaDB

   ```python
   results = collection.query(
       query_embeddings=[query_embedding],
       n_results=limit,
       where={"user_id": current_user.id}  # Filter by user
   )
   ```

4. **Calculate Relevance Score**

   ```python
   # ChromaDB returns distance (0-2), convert to percentage
   relevance_score = (1 - (distance / 2)) * 100
   # 0 distance = 100% relevant, 2 distance = 0% relevant
   ```

5. **Return Results** with source attribution

### Search Backend Code

**Search Endpoint:** [`backend/routes/search_routes.py`](backend/routes/search_routes.py#L15-L78)

**Embedding Service:** [`backend/services/ai_service.py`](backend/services/ai_service.py)

---

## 🛠️ How to Add a New API Endpoint

Let's say you want to add a feature to **update a file's name**.

### Step 1: Add Backend Endpoint

**Create the route in** [`backend/routes/file_routes.py`](backend/routes/file_routes.py):

```python
@router.put("/{file_id}/rename")
def rename_file(
    file_id: int,
    new_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Rename an uploaded file"""
    
    # Get file
    file_record = db.query(UploadedFile).filter(
        UploadedFile.id == file_id,
        UploadedFile.user_id == current_user.id
    ).first()
    
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Update filename
    file_record.filename = new_name
    db.commit()
    
    return {"message": "File renamed successfully", "new_name": new_name}
```

### Step 2: Add Frontend API Call

**Update** [`frontend/src/services/api.js`](frontend/src/services/api.js):

```javascript
export const fileAPI = {
  upload: (formData) => { /* existing */ },
  list: (skip = 0, limit = 50) => { /* existing */ },
  delete: (fileId) => { /* existing */ },
  
  // Add new method
  rename: (fileId, newName) => {
    return axiosInstance.put(`/files/${fileId}/rename`, null, {
      params: { new_name: newName }
    });
  },
};
```

### Step 3: Use in Component

```jsx
import { fileAPI } from '../services/api';

function FileItem({ file }) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(file.filename);
  
  const handleRename = async () => {
    try {
      await fileAPI.rename(file.id, newName);
      setEditing(false);
      // Refresh file list
    } catch (error) {
      console.error('Rename failed:', error);
    }
  };
  
  return (
    <div>
      {editing ? (
        <input value={newName} onChange={(e) => setNewName(e.target.value)} />
      ) : (
        <span>{file.filename}</span>
      )}
      <button onClick={() => setEditing(!editing)}>
        {editing ? 'Save' : 'Rename'}
      </button>
    </div>
  );
}
```

---

## 🔄 API Response Handling

### Success Responses

```javascript
try {
  const response = await authAPI.login(data);
  
  // response.data contains the JSON response
  console.log(response.data);
  
  // response.status contains HTTP status code
  console.log(response.status); // 200
  
} catch (error) {
  // Handle error (see below)
}
```

### Error Responses

```javascript
catch (error) {
  if (error.response) {
    // Server responded with error status
    console.error('Status:', error.response.status);
    console.error('Error:', error.response.data.detail);
    
    if (error.response.status === 401) {
      // Unauthorized - redirect to login
    } else if (error.response.status === 400) {
      // Bad request - show validation error
    }
    
  } else if (error.request) {
    // No response from server
    console.error('Server not responding');
    
  } else {
    // Other error
    console.error('Error:', error.message);
  }
}
```

### Automatic Error Handling

The axios interceptor automatically handles 401 errors: [`frontend/src/services/api.js`](frontend/src/services/api.js#L25)

```javascript
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto-logout and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 📋 API Data Models (Schemas)

### User Models

**UserCreate** (Signup Request):

```python
{
  "email": "user@example.com",
  "phone": "optional",
  "password": "minimum 8 characters",
  "name": "User Name"
}
```

**UserLogin** (Login Request):

```python
{
  "email_or_phone": "email or phone number",
  "password": "password"
}
```

**UserResponse** (User Info):

```python
{
  "id": int,
  "email": str,
  "phone": str | None,
  "name": str,
  "created_at": datetime
}
```

### File Models

**FileUploadResponse**:

```python
{
  "file_id": int,
  "filename": str,
  "status": "pending" | "processing" | "completed" | "failed",
  "message": str
}
```

**FileListResponse**:

```python
{
  "files": [
    {
      "id": int,
      "filename": str,
      "file_type": str,
      "file_size": int,
      "status": str,
      "total_chunks": int | None,
      "created_at": datetime,
      "updated_at": datetime
    }
  ],
  "total": int,
  "skip": int,
  "limit": int
}
```

### Search Models

**SearchRequest**:

```python
{
  "query": str,  # Natural language query
  "limit": int   # Max results (default: 10)
}
```

**SearchResponse**:

```python
{
  "query": str,
  "results": [
    {
      "rank": int,
      "content": str,  # Text chunk
      "relevance_score": float,  # 0-100
      "source": {
        "file_id": int,
        "filename": str,
        "chunk_index": int
      },
      "metadata": dict
    }
  ],
  "total_results": int,
  "execution_time": str
}
```

---

## 🎯 Complete Implementation Example: Upload Page

Let me show you a complete page implementation that uses multiple APIs:

```jsx
// frontend/src/pages/Upload.jsx
import { useState, useEffect } from 'react';
import { fileAPI } from '../services/api';
import Navbar from '../components/Navbar';
import UploadBox from '../components/UploadBox';

function UploadPage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch files on mount
  useEffect(() => {
    fetchFiles();
    
    // Poll for status updates
    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const fetchFiles = async () => {
    try {
      const response = await fileAPI.list();
      setFiles(response.data.files);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };
  
  const handleUpload = async (file) => {
    setUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fileAPI.upload(formData);
      
      // Add to file list immediately
      await fetchFiles();
      
      alert(response.data.message);
      
    } catch (error) {
      setError(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  const handleDelete = async (fileId) => {
    if (!confirm('Delete this file?')) return;
    
    try {
      await fileAPI.delete(fileId);
      setFiles(files.filter(f => f.id !== fileId));
    } catch (error) {
      alert('Delete failed: ' + error.response?.data?.detail);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Upload Documents</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <UploadBox 
          onUpload={handleUpload} 
          disabled={uploading}
        />
        
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Your Files</h2>
          
          <div className="space-y-4">
            {files.map(file => (
              <div key={file.id} className="card p-6 flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="font-semibold">{file.filename}</h3>
                  <p className="text-sm text-textSecondary">
                    {(file.file_size / 1024).toFixed(2)} KB
                  </p>
                  {file.status === 'completed' && (
                    <p className="text-xs text-textSecondary mt-1">
                      {file.total_chunks} chunks processed
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`badge-${file.status}`}>
                    {file.status}
                  </span>
                  
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            
            {files.length === 0 && (
              <p className="text-center text-textSecondary py-8">
                No files uploaded yet. Upload your first document above!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadPage;
```

---

## 🔧 Backend Implementation Details

### Request Validation

FastAPI uses Pydantic models for automatic validation:

**Schema Definition:** [`backend/models/schemas.py`](backend/models/schemas.py)

```python
class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    limit: int = Field(default=10, ge=1, le=50)
```

**Automatic Validation:**

- Empty query → 422 error "query: field required"
- Query too long → 422 error "ensure this value has at most 500 characters"
- Limit out of range → 422 error "ensure this value is greater than or equal to 1"

### Dependency Injection

FastAPI uses dependencies for common operations:

**Database Session:**

```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/files/")
def list_files(db: Session = Depends(get_db)):
    # db is automatically injected
```

**Current User:**

```python
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    # Decode token, validate, return user
    pass

@router.post("/search/")
def search(
    current_user: User = Depends(get_current_user)
):
    # current_user is automatically injected and validated
```

### Background Tasks

File processing happens in the background:

```python
@router.post("/upload")
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    # Save file immediately
    file_path = save_upload_file(file)
    
    # Create DB record
    file_record = UploadedFile(...)
    db.add(file_record)
    db.commit()
    
    # Queue background processing
    background_tasks.add_task(
        process_uploaded_file,
        file_id=file_record.id,
        file_path=file_path
    )
    
    # Return immediately
    return {"status": "pending", "message": "Processing..."}
```

---

## 🧩 Frontend-Backend Integration

### Complete Login Flow Example

**1. User enters credentials in** [`Login.jsx`](frontend/src/pages/Login.jsx):

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await authAPI.login({
      email_or_phone: email,
      password: password
    });
```

**2. Request sent to backend** [`auth_routes.py`](backend/routes/auth_routes.py):

```python
@router.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    # Validate user
    user = db.query(User).filter(
        (User.email == credentials.email_or_phone) | 
        (User.phone == credentials.email_or_phone)
    ).first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    token = create_access_token({"sub": str(user.id)})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name
        }
    }
```

**3. Frontend receives response and stores**:

```jsx
    // Save token and user
    setAuthToken(response.data.access_token);
    setUser(response.data.user);
    
    // Navigate to dashboard
    navigate('/dashboard');
    
  } catch (error) {
    setError(error.response?.data?.detail || 'Login failed');
  }
};
```

**4. Future requests automatically include token** (axios interceptor):

```javascript
// Happens automatically for all requests
config.headers.Authorization = `Bearer ${token}`;
```

---

## 📊 API Performance Tips

### Backend Optimization

1. **Use Database Indexes:**

```python
# In models/database_models.py
class User(Base):
    email = Column(String, unique=True, index=True)  # Indexed!
    phone = Column(String, unique=True, index=True)  # Indexed!
```

1. **Limit Query Results:**

```python
files = db.query(UploadedFile).limit(50).all()
```

1. **Async Operations:**

```python
@router.post("/upload")
async def upload_file(  # async!
    background_tasks: BackgroundTasks
):
    # Non-blocking upload
```

### Frontend Optimization

1. **Cancel Duplicate Requests:**

```javascript
let cancelToken;
const handleSearch = async (query) => {
  if (cancelToken) {
    cancelToken.cancel('New search started');
  }
  
  cancelToken = axios.CancelToken.source();
  
  const response = await searchAPI.search(
    { query },
    { cancelToken: cancelToken.token }
  );
};
```

1. **Debounce Search:**

```javascript
import { useState, useEffect } from 'react';

function SearchBar() {
  const [query, setQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 2) {
        performSearch(query);
      }
    }, 500); // Wait 500ms after typing stops
    
    return () => clearTimeout(timer);
  }, [query]);
}
```

1. **Cache Results:**

```javascript
const cache = new Map();

const handleSearch = async (query) => {
  if (cache.has(query)) {
    setResults(cache.get(query));
    return;
  }
  
  const response = await searchAPI.search({ query });
  cache.set(query, response.data.results);
  setResults(response.data.results);
};
```

---

## 🚨 Common API Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Invalid or expired token | Re-login to get new token |
| `422 Unprocessable Entity` | Invalid request data | Check request body matches schema |
| `404 Not Found` | Resource doesn't exist | Verify file ID or endpoint URL |
| `413 Payload Too Large` | File too big | Max 10MB per file |
| `429 Too Many Requests` | Rate limit exceeded | Implement request throttling |
| `500 Internal Server Error` | Server error | Check backend logs |
| `Network Error` | Backend not running | Start backend server |
| `CORS Error` | Wrong origin | Update CORS settings in main.py |

---

## 🧪 Testing Strategy

### 1. Manual Testing (Swagger UI)

Visit <http://localhost:8000/docs> and test each endpoint interactively.

### 2. Automated Testing (Backend)

Create `backend/tests/test_api.py`:

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_signup():
    response = client.post("/api/auth/signup", json={
        "email": "test@example.com",
        "password": "Password123",
        "name": "Test User"
    })
    assert response.status_code == 201
    assert "id" in response.json()

def test_login():
    response = client.post("/api/auth/login", json={
        "email_or_phone": "test@example.com",
        "password": "Password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
```

Run with: `pytest backend/tests/`

### 3. Frontend Integration Testing

Use React Testing Library to test API calls.

---

## 📚 Quick Reference Card

### Authentication

```javascript
// Signup
await authAPI.signup({ email, phone, password, name });

// Login
const { data } = await authAPI.login({ email_or_phone, password });
setAuthToken(data.access_token);
setUser(data.user);

// Get current user
const { data } = await authAPI.getCurrentUser();
```

### Files

```javascript
// Upload
const formData = new FormData();
formData.append('file', file);
await fileAPI.upload(formData);

// List
const { data } = await fileAPI.list(skip, limit);
// data.files = array of files

// Delete
await fileAPI.delete(fileId);
```

### Search

```javascript
// Search
const { data } = await searchAPI.search({ query, limit });
// data.results = array of results

// Dashboard
const { data } = await searchAPI.getDashboard();
// data = { total_files, total_searches, recent_searches, recent_uploads }
```

---

## 🎓 Next Steps

1. **Test the API**:
   - Visit <http://localhost:8000/docs>
   - Try each endpoint
   - Understand the request/response format

2. **Complete Frontend Pages**:
   - Dashboard page (use SearchBar, show stats)
   - Upload page (use UploadBox, file list)
   - Search Results page (use ResultCard)

3. **Add Error Handling**:
   - Toast notifications
   - Retry logic
   - Offline detection

4. **Enhance Features**:
   - File preview
   - Advanced filters
   - Export results
   - Share functionality

---

## 📞 API Support

- **API Documentation**: <http://localhost:8000/docs>
- **API Status**: <http://localhost:8000/health>
- **Backend Logs**: Check terminal running uvicorn
- **Frontend Network**: Browser DevTools → Network tab

---

## ✅ Checklist: Is Your API Working?

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] OpenAI API key added to `backend/.env`
- [ ] Can sign up a new user
- [ ] Can log in and get token
- [ ] Can upload a file
- [ ] File status changes to "completed"
- [ ] Can search and get results
- [ ] Results show relevance scores

If all checked, your API is fully functional! 🎉
