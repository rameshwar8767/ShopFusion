# 🔧 MongoDB Authentication Fix

## Problem
```
Error: bad auth : Authentication failed.
```

The MongoDB credentials in your `.env` file are incorrect or expired.

## Solution

### Step 1: Get Correct MongoDB Credentials

1. Go to **MongoDB Atlas** (https://cloud.mongodb.com)
2. Login to your account
3. Click on **Database Access** (left sidebar)
4. Check your database user credentials

### Step 2: Update ml-engine/.env

Open `ml-engine/.env` and update with correct credentials:

```env
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/shopfusion?retryWrites=true&w=majority
DB_NAME=shopfusion
PORT=8000
```

**Replace:**
- `YOUR_USERNAME` - Your MongoDB Atlas username
- `YOUR_PASSWORD` - Your MongoDB Atlas password  
- `YOUR_CLUSTER` - Your cluster address (e.g., cluster0.xxxxx)

### Step 3: Update backend/.env

Open `backend/.env` and update the same:

```env
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/shopfusion?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

### Step 4: Test Connection

```bash
cd ml-engine
python -c "from db import get_db; db = get_db(); print('Success!')"
```

## Alternative: Use Environment Variables

If you don't want credentials in files:

```bash
# Windows
set MONGO_URI=mongodb+srv://username:password@cluster...
python app.py

# Linux/Mac
export MONGO_URI=mongodb+srv://username:password@cluster...
python app.py
```

## Common Issues

### Issue 1: Special Characters in Password
If your password has special characters, URL encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`

### Issue 2: IP Not Whitelisted
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Either add your current IP or use `0.0.0.0/0` (allow all)

### Issue 3: User Doesn't Have Permissions
1. Go to Database Access
2. Edit user
3. Ensure role is `atlasAdmin` or `readWriteAnyDatabase`

## Quick Test

Once updated, run:
```bash
cd ml-engine
python app.py
```

You should see:
```
[*] Connecting to MongoDB...
[OK] Successfully connected to MongoDB: shopfusion
```

Then the ML engine will start successfully!
