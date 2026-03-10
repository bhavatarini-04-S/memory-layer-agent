# Quick Start Guide for InboxAI

## ✅ Setup Complete

All dependencies have been installed successfully.

## 🔑 Required: Add Your OpenAI API Key

**BEFORE RUNNING THE APP**, you need to add your OpenAI API key:

1. Open `backend\.env` in a text editor
2. Replace `your_openai_api_key_here` with your actual OpenAI API key
3. Optionally generate a secure SECRET_KEY (or keep the placeholder for testing)

```env
OPENAI_API_KEY=sk-your-actual-key-here
SECRET_KEY=your-secret-key-here
```

## 🚀 Running the Application

### Option 1: Quick Start (Recommended)

Double-click these files in order:

1. `start_backend.bat` - Starts backend server on <http://localhost:8000>
2. `start_frontend.bat` - Starts frontend on <http://localhost:5173>

### Option 2: Manual Start

**Terminal 1 - Backend:**

```bash
cd backend
..\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

## 📋 What's Installed

### Backend (Python)

- ✅ FastAPI - Web framework
- ✅ SQLAlchemy - Database ORM
- ✅ OpenAI - AI embeddings
- ✅ ChromaDB - Vector database
- ✅ JWT Authentication
- ✅ File processors (PDF, DOCX, CSV, TXT)

### Frontend (React)

- ✅ React + Vite
- ✅ Tailwind CSS
- ✅ Axios - API client
- ✅ React Router - Navigation

## 🌐 Access Points

Once both servers are running:

- **Frontend App**: <http://localhost:5173>
- **Backend API**: <http://localhost:8000>
- **API Documentation**: <http://localhost:8000/docs>
- **Health Check**: <http://localhost:8000/health>

## 📝 First Steps

1. Open <http://localhost:5173>
2. Click "Sign Up" to create an account
3. Log in with your credentials
4. Upload documents (PDF, DOCX, CSV, or TXT files)
5. Wait for processing (watch the status change to "completed")
6. Use the search bar to find information using natural language

## 🛠️ Project Structure

```
backend/
  ├── main.py                    # FastAPI application entry
  ├── config.py                  # Configuration
  ├── database.py                # Database setup
  ├── models/                    # Database & API schemas
  ├── routes/                    # API endpoints
  ├── services/                  # AI & document processing
  └── utils/                     # Auth & utilities

frontend/
  ├── src/
  │   ├── components/            # Reusable components
  │   ├── pages/                 # Page components
  │   ├── services/api.js        # API client
  │   └── styles/globals.css     # Design system
  └── tailwind.config.js         # Tailwind customization
```

## ⚙️ Environment Variables

Edit `backend\.env` to configure:

- `OPENAI_API_KEY` - Your OpenAI API key (REQUIRED)
- `DATABASE_URL` - Database connection string
- `SECRET_KEY` - JWT secret for auth tokens
- `UPLOAD_DIR` - Where uploaded files are stored
- `EMBEDDINGS_DIR` - Where vector embeddings are stored

## 🐛 Troubleshooting

### Backend won't start

- Check that you've added your OpenAI API key to `backend\.env`
- Verify Python virtual environment: `.venv\Scripts\python.exe --version`
- Check port 8000 is not in use

### Frontend won't start  

- Run `npm install` in the frontend directory
- Check port 5173 is not in use
- Clear npm cache: `npm cache clean --force`

### Login not working

- Make sure backend is running first
- Check browser console for errors
- Verify CORS is configured (should be automatic)

### File upload fails

- Check file size is under 10MB
- Supported formats: PDF, DOCX, CSV, TXT
- Verify `storage/uploads` directory exists

### Search returns no results

- Upload documents first and wait for "completed" status
- Make sure OpenAI API key is valid
- Check backend logs for processing errors

## 📚 API Documentation

Visit <http://localhost:8000/docs> for interactive API documentation (Swagger UI).

Key endpoints:

- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/files/upload` - Upload file
- `GET /api/files/` - List files
- `POST /api/search/` - Search documents

## 🎨 Design System

The app uses a custom design system with:

- Primary color: #4F46E5 (Indigo)
- Fonts: Inter (body), Poppins (headings)
- Tailwind CSS with custom components
- Responsive mobile-first design

## 💡 Features

- 🔐 **Authentication**: JWT-based email/phone login
- 📄 **File Processing**: Automatic text extraction and chunking
- 🤖 **AI Search**: Natural language semantic search
- 📊 **Dashboard**: View recent activity and stats
- 🎯 **Source Tracking**: See which documents contain results
- ⚡ **Real-time Processing**: Background task processing

## 🔒 Security Notes

For production deployment:

1. Generate a strong SECRET_KEY: `openssl rand -hex 32`
2. Use PostgreSQL instead of SQLite
3. Enable HTTPS
4. Set secure CORS origins
5. Add rate limiting
6. Implement proper logging

## Need Help?

Check the detailed setup guide in [SETUP_GUIDE.md](SETUP_GUIDE.md)
