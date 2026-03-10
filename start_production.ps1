# Production startup script for Windows
# Run with: .\start_production.ps1

Write-Host "🚀 Starting InboxAI in Production Mode..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "❌ Error: backend\.env file not found!" -ForegroundColor Red
    Write-Host "📝 Copy backend\.env.production to backend\.env and configure it." -ForegroundColor Yellow
    exit 1
}

# Check if virtual environment exists
if (-not (Test-Path ".venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
& .\.venv\Scripts\Activate.ps1

# Install/update dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
python -m pip install --upgrade pip
pip install -r backend\requirements.txt

# Navigate to backend
Set-Location backend

# Run database migrations if needed
Write-Host "🗄️  Initializing database..." -ForegroundColor Yellow
# python -m alembic upgrade head  # Uncomment if using migrations

# Start the application
Write-Host ""
Write-Host "✅ Starting backend server..." -ForegroundColor Green
Write-Host "🌐 Backend will be available at http://0.0.0.0:8000" -ForegroundColor Cyan
Write-Host "📊 Health check: http://0.0.0.0:8000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Production server with multiple workers
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4 --log-level info --no-access-log
