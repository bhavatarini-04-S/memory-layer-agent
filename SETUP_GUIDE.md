# InboxAI - Production Setup Guide

## Prerequisites

- Python 3.8+ installed
- Node.js 16+ and npm installed
- OpenAI API key

## Backend Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
```

### 2.  Activate Virtual Environment

**Windows:**

```bash
.\venv\Scripts\activate
```

**Mac/Linux:**

```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Database
DATABASE_URL=sqlite:///./inboxai.db

# Security (generate with: openssl rand -hex 32)
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Application
UPLOAD_DIR=../storage/uploads
EMBEDDINGS_DIR=../storage/embeddings
```

### 5. Run Backend

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run on: <http://localhost:8000>

API Docs: <http://localhost:8000/docs>

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Run Frontend

```bash
npm run dev
```

Frontend will run on: <http://localhost:5173> or <http://localhost:5174>

## Quick Start Script

### Windows (PowerShell)

Create `start_dev.ps1`:

```powershell
# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\.venv\Scripts\activate; python -m uvicorn main:app --reload"

# Wait 3 seconds
Start-Sleep -Seconds 3

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
```

Run: `.\start_dev.ps1`

## Production Deployment

### Backend

1. Use PostgreSQL instead of SQLite
2. Set environment variables securely
3. Use gunicorn or similar WSGI server
4. Enable HTTPS
5. Set up monitoring

### Frontend

1. Build: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Update API_BASE_URL to production URL

## Troubleshooting

### OpenAI API Errors

- Verify API key is correct
- Check API quota/billing
- Ensure internet connection

### Database Errors

- Run `rm inboxai.db` and restart to reset database
- Check file permissions

### CORS Errors

- Verify frontend URL in backend CORS settings
- Check browser console for details

## Features

✅ Secure authentication with JWT
✅ File upload (PDF, DOCX, TXT, CSV)
✅ AI-powered semantic search using OpenAI embeddings
✅ Vector search with ChromaDB
✅ Clean, modern UI with Tailwind CSS
✅ Real-time file processing
✅ Search history tracking
✅ Dashboard with analytics

## Support

For issues, check:

1. Environment variables are set correctly
2. All dependencies are installed
3. Backend is running before starting frontend
4. OpenAI API key has credits

Happy coding! 🚀
