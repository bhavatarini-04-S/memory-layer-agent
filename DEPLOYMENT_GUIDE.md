# InboxAI - Production Deployment Guide

## 🚀 Quick Start Deployment

This guide covers deploying InboxAI to production using Docker and various cloud platforms.

---

## Prerequisites

- Docker & Docker Compose installed
- MongoDB Atlas account (for user authentication)
- Domain name (optional, for production URL)
- SSL certificate (recommended for HTTPS)

---

## 1. Environment Configuration

### Backend Configuration

Create `backend/.env` from `backend/.env.production`:

```bash
cd backend
cp .env.production .env
```

**Required Environment Variables:**

```bash
# Security (CRITICAL - Generate new secret key!)
SECRET_KEY=YOUR_SECURE_RANDOM_STRING_HERE

# MongoDB (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
MONGODB_DATABASE=inboxai_db

# API Keys (Optional)
GEMINI_API_KEY=your_gemini_api_key_here

# Production Settings
DEBUG=false
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Generate Secure Secret Key:**

```bash
# Linux/Mac:
openssl rand -hex 32

# Windows PowerShell:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

### Frontend Configuration

Create `frontend/.env.production`:

```bash
cd frontend
cp .env.example .env.production
```

Edit `.env.production`:

```bash
VITE_API_URL=https://api.yourdomain.com/api
# Or for Docker:
VITE_API_URL=http://localhost:8000/api
```

---

## 2. Docker Deployment

### Option A: Docker Compose (Recommended)

**Step 1:** Build and start services:

```bash
docker-compose up -d --build
```

**Step 2:** Check service status:

```bash
docker-compose ps
docker-compose logs -f
```

**Step 3:** Access application:

- Frontend: <http://localhost:5173>
- Backend API: <http://localhost:8000>
- API Docs: <http://localhost:8000/docs> (dev mode only)

**Step 4:** Stop services:

```bash
docker-compose down
```

### Option B: Manual Docker Build

**Backend:**

```bash
docker build -t inboxai-backend .
docker run -d \
  --name inboxai-backend \
  -p 8000:8000 \
  --env-file backend/.env \
  -v $(pwd)/storage:/app/storage \
  inboxai-backend
```

**Frontend:**

```bash
cd frontend
npm run build
docker run -d \
  --name inboxai-frontend \
  -p 8080:80 \
  -v $(pwd)/dist:/usr/share/nginx/html \
  nginx:alpine
```

---

## 3. Cloud Platform Deployment

### AWS Elastic Beanstalk

1. Install AWS CLI and EB CLI
2. Initialize Elastic Beanstalk:

```bash
eb init -p docker inboxai-app --region us-east-1
```

1. Create environment:

```bash
eb create inboxai-prod
```

1. Deploy:

```bash
eb deploy
```

### Google Cloud Run

1. Build container:

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/inboxai-backend
```

1. Deploy:

```bash
gcloud run deploy inboxai-backend \
  --image gcr.io/PROJECT_ID/inboxai-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Heroku

1. Install Heroku CLI
2. Create app:

```bash
heroku create inboxai-app
```

1. Add buildpacks:

```bash
heroku buildpacks:add heroku/python
```

1. Set environment variables:

```bash
heroku config:set SECRET_KEY=your_secret_key
heroku config:set MONGODB_URI=your_mongodb_uri
```

1. Deploy:

```bash
git push heroku main
```

### DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure build settings:
   - **Backend:** Python with `backend/requirements.txt`
   - **Frontend:** Node.js with `cd frontend && npm run build`
3. Add environment variables in dashboard
4. Deploy

---

## 4. Production Checklist

### Security

- [ ] Change `SECRET_KEY` to a secure random string
- [ ] Set `DEBUG=false` in production
- [ ] Configure `ALLOWED_ORIGINS` with your domain
- [ ] Enable HTTPS with SSL certificate
- [ ] Set strong MongoDB password
- [ ] Review and limit CORS origins
- [ ] Enable rate limiting (optional)

### Database

- [ ] MongoDB Atlas connection configured
- [ ] Database backups enabled
- [ ] Connection pooling configured
- [ ] Indexes created for performance

### Storage

- [ ] Create persistent storage volumes for uploads
- [ ] Configure backup strategy for uploaded files
- [ ] Set up CDN for static files (optional)

### Monitoring

- [ ] Configure logging to file/service
- [ ] Set up health check monitoring
- [ ] Enable error tracking (Sentry, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up alerts for failures

### Performance

- [ ] Enable frontend build optimizations
- [ ] Configure CDN for frontend assets
- [ ] Set up caching headers
- [ ] Optimize image uploads
- [ ] Configure worker processes

---

## 5. Environment Variables Reference

### Backend Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| SECRET_KEY | ✅ Yes | - | JWT signing key |
| MONGODB_URI | ✅ Yes | - | MongoDB connection string |
| MONGODB_DATABASE | No | inboxai_db | Database name |
| GEMINI_API_KEY | No | none | Gemini AI API key |
| DEBUG | No | false | Enable debug mode |
| ALLOWED_ORIGINS | No | localhost | Comma-separated CORS origins |
| DATABASE_URL | No | SQLite | Database connection URL |
| UPLOAD_DIR | No | ../storage/uploads | Upload directory path |
| WORKERS | No | 4 | Number of worker processes |

### Frontend Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| VITE_API_URL | No | <http://localhost:8000/api> | Backend API URL |

---

## 6. Maintenance Commands

### View Logs

```bash
# Docker Compose
docker-compose logs -f backend
docker-compose logs -f frontend

# Individual containers
docker logs -f inboxai-backend
```

### Database Backup

```bash
# MongoDB Atlas - Use built-in backups
# Or export manually:
mongodump --uri="your_mongodb_uri" --out=./backup
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Scale Services

```bash
# Scale backend workers
docker-compose up -d --scale backend=3
```

---

## 7. Troubleshooting

### Backend Won't Start

**Check logs:**

```bash
docker-compose logs backend
```

**Common issues:**

- Missing SECRET_KEY in .env
- Invalid MongoDB URI
- Port 8000 already in use

### Frontend Can't Connect to Backend

**Check:**

- VITE_API_URL is correct in .env.production
- CORS origins include frontend domain
- Backend is running and accessible

### File Upload Fails

**Check:**

- Storage directory has write permissions
- Docker volume is mounted correctly
- MAX_UPLOAD_SIZE is sufficient

### Authentication Errors

**Check:**

- MongoDB connection is successful
- SECRET_KEY is consistent across restarts
- Token hasn't expired

---

## 8. Performance Optimization

### Backend Optimization

1. **Use PostgreSQL instead of SQLite:**

```bash
DATABASE_URL=postgresql://user:pass@host:5432/inboxai
```

1. **Increase workers:**

```bash
WORKERS=8
```

1. **Enable caching:**
   - Redis for session storage
   - CDN for static files

### Frontend Optimization

1. **Build for production:**

```bash
cd frontend
npm run build
```

1. **Use CDN:**
   - CloudFlare
   - AWS CloudFront

2. **Enable compression:**
   - Gzip/Brotli in nginx

---

## 9. Monitoring Setup

### Health Check Endpoints

- **Backend:** `GET /health`
- **Frontend:** Check if page loads

### Monitoring Tools

1. **UptimeRobot** - Free uptime monitoring
2. **Sentry** - Error tracking
3. **New Relic** - Performance monitoring
4. **DataDog** - Full stack monitoring

### Example Health Check Script

```bash
#!/bin/bash
curl -f http://localhost:8000/health || exit 1
```

---

## 10. Backup Strategy

### Daily Backups

1. **MongoDB:** Automated through MongoDB Atlas
2. **Uploaded Files:**

```bash
# Cron job
0 2 * * * tar -czf /backup/uploads-$(date +\%Y\%m\%d).tar.gz /app/storage/uploads
```

1. **Database:**

```bash
# Backup script
mongodump --uri="$MONGODB_URI" --out=/backup/mongodb-$(date +\%Y\%m\%d)
```

---

## 11. Security Best Practices

1. **Use HTTPS everywhere**
2. **Enable rate limiting**
3. **Regular security updates**
4. **Monitor logs for suspicious activity**
5. **Use secrets management (AWS Secrets Manager, etc.)**
6. **Enable 2FA for admin accounts**
7. **Regular security audits**

---

## 12. Support & Resources

- **Documentation:** See README.md files
- **Issues:** Check application logs
- **Updates:** `git pull origin main`

---

## Success! 🎉

Your InboxAI application should now be running in production. Monitor logs and health checks regularly.

**Quick Status Check:**

```bash
# Backend health
curl http://localhost:8000/health

# Frontend (should return HTML)
curl http://localhost:5173

# Docker status
docker-compose ps
```
