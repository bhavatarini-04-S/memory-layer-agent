# MongoDB Integration Guide

## Overview
Your InboxAI application now uses MongoDB for user authentication and login information storage.

## What Changed

### 1. **New Dependencies**
- `pymongo`: MongoDB driver for Python
- `dnspython`: Required for MongoDB SRV connections

### 2. **New Files Created**
- `mongodb.py`: MongoDB connection management
- `mongo_user.py`: MongoDB user model and authentication service
- `routes/mongo_auth_routes.py`: MongoDB-based authentication routes

### 3. **Updated Files**
- `config.py`: Added MongoDB URI and database name settings
- `main.py`: Updated to use MongoDB authentication routes
- `.env.example`: Added MongoDB configuration template

## Configuration

### Step 1: Add Your MongoDB Password

Open `backend/.env` and find this line:
```
MONGODB_URI=mongodb+srv://divagarjagan44_db_user:<db_password>@cluster0.hxwzr0a.mongodb.net/?appName=Cluster0
```

Replace `<db_password>` with your actual MongoDB password:
```
MONGODB_URI=mongodb+srv://divagarjagan44_db_user:YOUR_ACTUAL_PASSWORD@cluster0.hxwzr0a.mongodb.net/?appName=Cluster0
```

### Step 2: Restart the Backend

```powershell
cd C:\personal-executive-ai\backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## MongoDB Collections

### Users Collection
Stored in database: `inboxai_db`  
Collection: `users`

**Schema:**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  phone: String (unique, indexed, sparse),
  hashed_password: String,
  user_type: String, // "student" or "professional"
  organization: String,
  theme: String, // "light" or "dark"
  preferences: Object,
  created_at: DateTime
}
```

## API Endpoints

### 1. Signup (Register New User)
**POST** `/api/auth/signup`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "SecurePass123!",
  "user_type": "student"
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "user_type": "student",
  "organization": null,
  "theme": "light"
}
```

### 2. Login
**POST** `/api/auth/login`

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

Or with phone:
```json
{
  "phone": "1234567890",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "user_type": "student",
    "organization": null,
    "theme": "light"
  }
}
```

### 3. Get Current User
**GET** `/api/auth/me`

Headers:
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "user_type": "student",
  "organization": null,
  "theme": "light"
}
```

## Testing

### Test MongoDB Connection

Create a test script: `test_mongodb.py`

```python
from mongodb import get_mongo_client, get_users_collection
from mongo_user import MongoUserService

# Test connection
try:
    client = get_mongo_client()
    print("✅ Connected to MongoDB successfully!")
    
    # Test users collection
    collection = get_users_collection()
    user_count = collection.count_documents({})
    print(f"✅ Users collection accessible. Total users: {user_count}")
    
    # Test user service
    service = MongoUserService(collection)
    print("✅ User service initialized successfully!")
    
except Exception as e:
    print(f"❌ Error: {e}")
```

Run:
```powershell
python test_mongodb.py
```

## Data Migration (Optional)

If you have existing users in SQLite and want to migrate to MongoDB:

```python
# migration_script.py
from database import SessionLocal
from models.database_models import User as SQLUser
from mongodb import get_users_collection
from mongo_user import MongoUserService

db = SessionLocal()
collection = get_users_collection()
service = MongoUserService(collection)

# Get all SQLite users
sqlite_users = db.query(SQLUser).all()

for sql_user in sqlite_users:
    try:
        # Note: We can't migrate passwords (they're already hashed)
        # Users will need to reset passwords or keep SQLite for old users
        print(f"User: {sql_user.email}")
    except Exception as e:
        print(f"Error with {sql_user.email}: {e}")

db.close()
```

## Troubleshooting

### Connection Issues

1. **Check MongoDB cluster is running** in MongoDB Atlas
2. **Verify IP whitelist** - Make sure your IP is allowed in MongoDB Atlas
3. **Check password** - Ensure password in .env matches MongoDB user password
4. **Test connection string** in MongoDB Compass first

### Common Errors

- `pymongo.errors.ServerSelectionTimeoutError`: Check internet connection and MongoDB Atlas IP whitelist
- `Authentication failed`: Verify username/password in connection string
- `dnspython not installed`: Run `pip install dnspython`

## Security Notes

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use environment variables** in production
3. **Rotate passwords regularly** in MongoDB Atlas
4. **Enable MongoDB Atlas network security** (IP whitelist)
5. **Use strong passwords** for MongoDB users

## Benefits of MongoDB Integration

1. **Scalability**: MongoDB can handle millions of users
2. **Flexibility**: Easy to add new fields without migrations
3. **Cloud-Native**: MongoDB Atlas provides automatic backups, monitoring
4. **Performance**: Fast read/write operations with proper indexing
5. **Global Distribution**: Can replicate data across regions

## Next Steps

1. Add MongoDB password to `.env` file
2. Restart backend server
3. Test signup and login endpoints
4. Monitor MongoDB Atlas dashboard for queries
5. Consider migrating existing SQLite users (if any)
