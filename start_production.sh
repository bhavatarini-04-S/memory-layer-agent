#!/bin/bash
# Production startup script for Linux/Mac

set -e

echo "🚀 Starting InboxAI in Production Mode..."

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env file not found!"
    echo "📝 Copy backend/.env.production to backend/.env and configure it."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Install/update dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

# Navigate to backend
cd backend

# Run database migrations if needed
echo "🗄️  Initializing database..."
# python -m alembic upgrade head  # Uncomment if using migrations

# Start the application
echo "✅ Starting backend server..."
echo "🌐 Backend will be available at http://0.0.0.0:8000"
echo "📊 Health check: http://0.0.0.0:8000/health"
echo ""

# Production server with multiple workers
uvicorn main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 4 \
    --log-level info \
    --no-access-log
