"""
Production configuration checker
Validates environment setup before deployment
"""
import os
import sys
from pathlib import Path

def check_environment():
    """Check if production environment is properly configured"""
    
    issues = []
    warnings = []
    
    print("🔍 Checking production configuration...\n")
    
    # Check backend .env
    backend_env = Path("backend/.env")
    if not backend_env.exists():
        issues.append("❌ backend/.env file not found")
    else:
        print("✅ backend/.env exists")
        
        # Check critical variables
        with open(backend_env) as f:
            env_content = f.read()
            
            if "SECRET_KEY=your_secret_key_here" in env_content or "SECRET_KEY=CHANGE_THIS" in env_content:
                issues.append("❌ SECRET_KEY not changed from default")
            elif "SECRET_KEY=" in env_content:
                print("✅ SECRET_KEY configured")
            else:
                issues.append("❌ SECRET_KEY not found")
            
            if "MONGODB_URI=" in env_content and "<db_password>" not in env_content:
                print("✅ MONGODB_URI configured")
            elif "<db_password>" in env_content:
                issues.append("❌ MONGODB_URI contains placeholder password")
            else:
                warnings.append("⚠️  MONGODB_URI not configured (auth may not work)")
            
            if "DEBUG=true" in env_content.lower():
                warnings.append("⚠️  DEBUG is enabled (not recommended for production)")
            
            if "ALLOWED_ORIGINS=" not in env_content:
                warnings.append("⚠️  ALLOWED_ORIGINS not configured")
    
    # Check frontend .env.production
    frontend_env = Path("frontend/.env.production")
    if not frontend_env.exists():
        warnings.append("⚠️  frontend/.env.production not found (using defaults)")
    else:
        print("✅ frontend/.env.production exists")
    
    # Check storage directories
    upload_dir = Path("storage/uploads")
    if not upload_dir.exists():
        warnings.append("⚠️  Upload directory doesn't exist (will be created)")
    else:
        print("✅ Upload directory exists")
    
    embeddings_dir = Path("storage/embeddings")
    if not embeddings_dir.exists():
        warnings.append("⚠️  Embeddings directory doesn't exist (will be created)")
    else:
        print("✅ Embeddings directory exists")
    
    # Check if dependencies are installed
    try:
        import fastapi
        import uvicorn
        import pymongo
        print("✅ Core dependencies installed")
    except ImportError as e:
        issues.append(f"❌ Missing dependency: {e.name}")
    
    # Print results
    print("\n" + "="*60)
    
    if issues:
        print("\n🚨 CRITICAL ISSUES:")
        for issue in issues:
            print(f"  {issue}")
    
    if warnings:
        print("\n⚠️  WARNINGS:")
        for warning in warnings:
            print(f"  {warning}")
    
    if not issues and not warnings:
        print("\n✅ All checks passed! Ready for production deployment.")
        return 0
    elif issues:
        print("\n❌ Please fix critical issues before deploying.")
        return 1
    else:
        print("\n⚠️  Some warnings found. Review before deploying.")
        return 0

if __name__ == "__main__":
    sys.exit(check_environment())
