# Git Quick Reference for Personal Executive AI

## ✅ Already Done

- ✓ Git repository initialized
- ✓ All files committed (106 files, 14,650+ lines)
- ✓ .gitignore configured

## 🚀 Push to GitHub

### Step 1: Create GitHub Repository

1. Go to <https://github.com/new>
2. Repository name: `personal-executive-ai`
3. Privacy: **Private** (recommended - contains API keys in .env)
4. **Do NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

### Step 2: Connect and Push

Replace `YOUR_USERNAME` with your GitHub username:

```powershell
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/personal-executive-ai.git

# Rename branch to main (if not already)
git branch -M main

# Push to GitHub
git push -u origin main
```

## 📝 Daily Git Workflow

### Check what changed

```powershell
git status
```

### Commit changes

```powershell
# Add all changes
git add .

# Commit with message
git commit -m "Your commit message here"

# Push to GitHub
git push
```

### Quick commit script

```powershell
# One-liner to commit and push
git add . ; git commit -m "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')" ; git push
```

## 🔒 Security Notes

Your `.gitignore` already excludes:

- ✓ `.env` files (API keys, passwords)
- ✓ `.venv/` (virtual environment)
- ✓ `storage/` (uploaded files)
- ✓ `*.db` (database files)
- ✓ `node_modules/` (dependencies)
- ✓ `__pycache__/` (Python cache)

**Never commit:**

- API keys or secrets
- Database files with user data
- Uploaded documents
- Virtual environments

## 📦 What's Included

### Backend (Python/FastAPI)

- API routes (auth, files, search, notifications)
- File processing with universal parser
- MongoDB & SQLite integration
- AI services integration
- Background task processing

### Frontend (React/Vite)

- User authentication pages
- File upload with drag & drop
- Search and chat interfaces
- Notification system
- Dark mode support

### Documentation

- Setup guides
- API documentation
- MongoDB integration guide
- Notification system guide

## 🆘 Troubleshooting

### Already have a remote?

```powershell
# Check existing remotes
git remote -v

# Change remote URL
git remote set-url origin https://github.com/NEW_USERNAME/new-repo.git
```

### Made changes after commit?

```powershell
# Stage and commit in one go
git commit -am "Your message"
git push
```

### Want to see commit history?

```powershell
git log --oneline --graph --all
```

## 📞 Need Help?

If you encounter issues:

1. Check you have GitHub account access
2. Verify you have git configured:

   ```powershell
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

3. Check internet connection
4. Verify GitHub repository exists and you have write access
