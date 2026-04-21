# PrintEase Deployment Guide for Render

## Step-by-Step Deployment Instructions

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy on Render

#### Option A: Using render.yaml (Recommended)
1. Go to https://render.com
2. Click **New +** → **Blueprint**
3. Connect your GitHub repository
4. Render will auto-detect `render.yaml`
5. Click **Apply**

#### Option B: Manual Setup
1. Go to https://render.com
2. Click **New +** → **Web Service**
3. Connect your repository
4. Configure:
   - **Name:** printease
   - **Root Directory:** `backend`
   - **Build Command:** `cd ../frontend && npm install && npm run build && cd ../backend && npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

### 3. Set Environment Variables

In Render Dashboard → Your Service → Environment:

```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://printease:printease123456@cluster0.hrk1sam.mongodb.net/printease?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-secure-random-string-change-this
```

**Generate a secure JWT_SECRET:**
- Use: `openssl rand -base64 32`
- Or any random 32+ character string

### 4. Deploy

Render will automatically:
1. Install dependencies
2. Build frontend
3. Start backend
4. Serve both from one URL

### 5. Verify Deployment

Visit: `https://your-app-name.onrender.com`
- Homepage should load
- Test: `https://your-app-name.onrender.com/api/health`

---

## Common Issues & Solutions

### ❌ Build Fails
**Problem:** Dependencies not found
**Solution:** 
- Check `rootDir` is set to `backend`
- Ensure build command navigates correctly

### ❌ MongoDB Connection Error
**Problem:** Can't connect to database
**Solution:**
- Verify `MONGO_URI` in Render environment variables
- Check MongoDB Atlas allows connections from `0.0.0.0/0`

### ❌ 500 Internal Server Error
**Problem:** Missing environment variables
**Solution:**
- Add all required env vars (see Step 3)
- Check logs in Render dashboard

### ❌ Frontend Not Loading
**Problem:** Backend can't find frontend build
**Solution:**
- Ensure frontend build completes successfully
- Check that `frontend/dist/index.html` exists after build

---

## MongoDB Atlas Setup (If Needed)

1. Go to https://cloud.mongodb.com
2. Create cluster (free tier)
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (allow all)
5. Get connection string
6. Replace `<password>` with your password
7. Add to Render env vars as `MONGO_URI`

---

## Post-Deployment Checklist

- [ ] Homepage loads
- [ ] Registration works
- [ ] Login works
- [ ] File upload works
- [ ] Orders can be created
- [ ] Navigation works
- [ ] No console errors

---

## Notes

- **Free tier** spins down after 15 min of inactivity
- First load after spin-down takes ~50 seconds
- Uploads are not persistent on free tier (use cloud storage for production)
- Consider MongoDB Atlas for persistent database

---

## Need Help?

Check Render logs:
Dashboard → Your Service → Logs

Common log locations:
- Build logs: Shows compilation errors
- Runtime logs: Shows server errors
